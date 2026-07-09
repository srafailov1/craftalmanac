#!/usr/bin/env node
// Resolve every catalog iNaturalist taxon id to a GBIF backbone taxonKey.
//
// Step 1 of the iNaturalist chunk-bake pipeline (see
// docs/TODO-inaturalist-chunk-bake.md section 3e / section 5). The catalog
// `scientificName` fields are prose ("Rubus occidentalis and Rubus idaeus"),
// so they are not matchable; the `inatTaxonIds` are the ground truth. For each
// distinct iNat taxon id across food/ink/medicine catalogs this:
//   1. reads its canonical name + rank + iconic taxon from the iNat taxa API,
//   2. matches it to a GBIF backbone usageKey via the GBIF species/match API,
//   3. records the GBIF classification key chain (kingdom..usageKey) so the
//      subset builder can map a downloaded DWCA record back to an anchor by
//      GBIF hierarchy, and the per-mode app speciesId(s) the anchor feeds.
//
// Output: data/inaturalist/taxon-keys.json (a cached build artifact; commit it).
// No credentials required (both APIs are public, read-only).
//
// Usage: node scripts/resolve_inat_gbif_taxonkeys.mjs [--only=56830,52740]

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const OUT_DIR = path.join(ROOT, "data", "inaturalist");
const OUT_PATH = path.join(OUT_DIR, "taxon-keys.json");

const INAT_TAXA_API = "https://api.inaturalist.org/v1/taxa";
const GBIF_MATCH_API = "https://api.gbif.org/v1/species/match";
const INAT_BATCH = 30; // iNat taxa endpoint returns up to 30 records per call.
const INAT_SPACING_MS = 1100; // polite ~1 req/sec.
const GBIF_SPACING_MS = 150;

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) args.set(m[1], m[2] ?? "true");
}
const onlyIds = args.has("only")
  ? new Set(args.get("only").split(",").map((s) => Number(s.trim())))
  : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- app.js const extraction (mirrors build_access_status.mjs) ---------------
function findMatchingDelimiter(source, startIndex, openChar, closeChar) {
  let depth = 0, quote = "", escaped = false, tpl = 0;
  for (let i = startIndex; i < source.length; i += 1) {
    const c = source[i], n = source[i + 1];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (c === "\\") { escaped = true; continue; }
      if (quote === "`" && c === "$" && n === "{") { tpl += 1; i += 1; continue; }
      if (tpl) { if (c === "{") tpl += 1; else if (c === "}") tpl -= 1; continue; }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "/" && n === "/") { i = source.indexOf("\n", i); if (i < 0) return -1; continue; }
    if (c === "/" && n === "*") { i = source.indexOf("*/", i + 2); if (i < 0) return -1; i += 1; continue; }
    if (c === openChar) depth += 1;
    if (c === closeChar) { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}
function extractConstExpression(source, name) {
  const start = source.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`Could not find const ${name}`);
  const equals = source.indexOf("=", start);
  let s = equals + 1;
  while (/\s/.test(source[s])) s += 1;
  const open = source[s];
  const close = open === "[" ? "]" : open === "{" ? "}" : "";
  if (!close) throw new Error(`const ${name} is not an array/object literal`);
  const end = findMatchingDelimiter(source, s, open, close);
  if (end < 0) throw new Error(`Could not parse const ${name}`);
  return source.slice(s, end + 1);
}

async function loadCatalogs() {
  const appSource = await readFile(APP_PATH, "utf8");
  const ctx = {};
  vm.createContext(ctx);
  for (const name of ["foodSpeciesCatalog", "inkSpeciesCatalog", "medicineSpeciesCatalog"]) {
    vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, ctx, { filename: APP_PATH });
  }
  return { food: ctx.foodSpeciesCatalog, ink: ctx.inkSpeciesCatalog, medicine: ctx.medicineSpeciesCatalog };
}

// Build: distinct inat taxon id -> { speciesByMode, category }.
// getExpectedIconicTaxon in app.js: mushroom category -> Fungi, else Plantae.
function collectTaxa(catalogs) {
  const byId = new Map();
  for (const [mode, catalog] of Object.entries(catalogs)) {
    for (const species of catalog) {
      const category = species.category;
      for (const id of species.inatTaxonIds || []) {
        if (!byId.has(id)) {
          byId.set(id, { inatId: id, speciesByMode: { food: null, ink: null, medicine: null }, categories: new Set() });
        }
        const entry = byId.get(id);
        entry.speciesByMode[mode] = species.id;
        entry.categories.add(category);
      }
    }
  }
  return byId;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "CraftAlmanac-build/1.0 (foraging map data pipeline)" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function fetchInatTaxa(ids) {
  const results = new Map();
  for (let i = 0; i < ids.length; i += INAT_BATCH) {
    const batch = ids.slice(i, i + INAT_BATCH);
    const data = await fetchJson(`${INAT_TAXA_API}/${batch.join(",")}`);
    for (const t of data.results || []) results.set(t.id, t);
    process.stderr.write(`iNat taxa: ${Math.min(i + INAT_BATCH, ids.length)}/${ids.length}\n`);
    if (i + INAT_BATCH < ids.length) await sleep(INAT_SPACING_MS);
  }
  return results;
}

function iconicName(iconicId) {
  // Only Plantae/Fungi occur in these catalogs; map the rest through as-is.
  return { 47126: "Plantae", 47170: "Fungi" }[iconicId] || null;
}

async function gbifMatch(name, rank, kingdom) {
  const params = new URLSearchParams({ name, strict: "false" });
  if (rank) params.set("rank", String(rank).toUpperCase());
  if (kingdom) params.set("kingdom", kingdom);
  return fetchJson(`${GBIF_MATCH_API}?${params.toString()}`);
}

// GBIF classification key chain, coarse->fine, for hierarchy mapping later.
function classificationKeys(match) {
  const order = ["kingdomKey", "phylumKey", "classKey", "orderKey", "familyKey", "genusKey", "speciesKey"];
  const keys = order.map((k) => match[k]).filter((v) => Number.isFinite(v));
  if (Number.isFinite(match.usageKey) && !keys.includes(match.usageKey)) keys.push(match.usageKey);
  return keys;
}

async function main() {
  const catalogs = await loadCatalogs();
  const taxaById = collectTaxa(catalogs);
  let ids = [...taxaById.keys()].sort((a, b) => a - b);
  if (onlyIds) ids = ids.filter((id) => onlyIds.has(id));
  process.stderr.write(`Resolving ${ids.length} distinct iNat taxon ids...\n`);

  const inatTaxa = await fetchInatTaxa(ids);

  const out = [];
  const warnings = [];
  for (const id of ids) {
    const entry = taxaById.get(id);
    const inat = inatTaxa.get(id);
    if (!inat) {
      warnings.push(`iNat taxon ${id} not found`);
      continue;
    }
    const expectedKingdom = entry.categories.has("mushroom") ? "Fungi" : "Plantae";
    let match = null;
    try {
      match = await gbifMatch(inat.name, inat.rank, expectedKingdom);
    } catch (err) {
      warnings.push(`GBIF match failed for ${id} (${inat.name}): ${err.message}`);
    }
    await sleep(GBIF_SPACING_MS);

    const record = {
      inatId: id,
      inatName: inat.name,
      inatRank: inat.rank,
      inatIconic: iconicName(inat.iconic_taxon_id),
      expectedKingdom,
      speciesByMode: entry.speciesByMode,
      gbifUsageKey: match?.usageKey ?? null,
      gbifCanonical: match?.canonicalName ?? match?.scientificName ?? null,
      gbifRank: match?.rank ?? null,
      gbifKingdom: match?.kingdom ?? null,
      gbifStatus: match?.status ?? null,
      matchType: match?.matchType ?? "NONE",
      confidence: match?.confidence ?? 0,
      classificationKeys: match ? classificationKeys(match) : []
    };
    out.push(record);

    if (!match || match.matchType === "NONE" || !match.usageKey) {
      warnings.push(`No GBIF usageKey for ${id} (${inat.name} ${inat.rank})`);
    } else if (match.matchType !== "EXACT") {
      warnings.push(`Non-exact GBIF match for ${id} (${inat.name}) -> ${match.canonicalName} [${match.matchType}, conf ${match.confidence}]`);
    } else if (match.kingdom !== expectedKingdom) {
      warnings.push(`Kingdom mismatch for ${id} (${inat.name}): expected ${expectedKingdom}, GBIF ${match.kingdom}`);
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  const artifact = {
    source: "iNaturalist taxa API + GBIF species/match",
    inatTaxaApi: INAT_TAXA_API,
    gbifMatchApi: GBIF_MATCH_API,
    generatedAt: new Date().toISOString().slice(0, 10),
    taxonCount: out.length,
    taxa: out
  };
  await writeFile(OUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);

  process.stderr.write(`\nWrote ${OUT_PATH} (${out.length} taxa).\n`);
  if (warnings.length) {
    process.stderr.write(`\n${warnings.length} warning(s):\n`);
    warnings.forEach((w) => process.stderr.write(`  - ${w}\n`));
  } else {
    process.stderr.write(`All ${out.length} taxa matched EXACT with the expected kingdom.\n`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
