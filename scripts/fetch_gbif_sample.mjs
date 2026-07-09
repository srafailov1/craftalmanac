#!/usr/bin/env node
// Pull a bounded sample of GBIF occurrence records via the SYNCHRONOUS search
// API (no credentials, no async download). Used for Phase A end-to-end
// validation of the iNaturalist chunk-bake pipeline and for spot-checking the
// national DWCA build. The record shape written here is a superset of the DWCA
// occurrence.txt columns build_inaturalist_subset.mjs consumes, so the same
// downstream code path validates both ingest sources.
//
// The sync API caps deep paging at offset+limit <= 100000, so this is only for
// samples (a few taxa in one state). The national build uses format=DWCA
// (see request_gbif_download.mjs / docs/TODO-inaturalist-chunk-bake.md section 3).
//
// Usage:
//   node scripts/fetch_gbif_sample.mjs --taxa=56830,52740 --state=Virginia \
//        --out=/path/sample.json
//   node scripts/fetch_gbif_sample.mjs --taxa=all --state=Vermont --out=...

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const TAXON_KEYS_PATH = path.join(ROOT, "data", "inaturalist", "taxon-keys.json");

const DATASET_KEY = "50c9509d-22c7-4a22-a47d-8c48425ef4a7"; // iNaturalist Research-grade
const SEARCH_API = "https://api.gbif.org/v1/occurrence/search";
const PAGE = 300;
const HARD_OFFSET_CAP = 100000; // GBIF deep-paging limit.
const SPACING_MS = 120;

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) args.set(m[1], m[2] ?? "true");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fields we carry forward (superset of what the subset builder needs).
const KEEP = [
  "key", "occurrenceID", "references", "taxonID", "taxonKey", "acceptedTaxonKey",
  "speciesKey", "genusKey", "familyKey", "orderKey", "classKey", "phylumKey", "kingdomKey",
  "kingdom", "scientificName", "taxonRank", "license", "informationWithheld",
  "coordinateUncertaintyInMeters", "decimalLatitude", "decimalLongitude",
  "eventDate", "recordedBy", "rightsHolder", "stateProvince"
];

function slim(record) {
  const out = {};
  for (const k of KEEP) if (record[k] !== undefined) out[k] = record[k];
  return out;
}

async function fetchPage(taxonKeys, stateProvince, offset) {
  const params = new URLSearchParams({
    dataset_key: DATASET_KEY, country: "US", has_coordinate: "true",
    limit: String(PAGE), offset: String(offset)
  });
  if (stateProvince) params.set("stateProvince", stateProvince);
  for (const key of taxonKeys) params.append("taxon_key", String(key));
  const res = await fetch(`${SEARCH_API}?${params.toString()}`, {
    headers: { "User-Agent": "CraftAlmanac-build/1.0 (foraging map data pipeline)" }
  });
  if (!res.ok) throw new Error(`GBIF search HTTP ${res.status} at offset ${offset}`);
  return res.json();
}

async function main() {
  const artifact = JSON.parse(await readFile(TAXON_KEYS_PATH, "utf8"));
  const keyByInat = new Map(artifact.taxa.map((t) => [t.inatId, t.gbifUsageKey]));

  const taxaArg = args.get("taxa") || "all";
  const inatIds = taxaArg === "all"
    ? artifact.taxa.map((t) => t.inatId)
    : taxaArg.split(",").map((s) => Number(s.trim()));
  const taxonKeys = [...new Set(inatIds.map((id) => keyByInat.get(id)).filter(Boolean))];
  const stateProvince = args.get("state") || "";
  const outPath = args.get("out");
  if (!outPath) throw new Error("--out=<path> is required");

  process.stderr.write(`Fetching ${taxonKeys.length} taxonKeys${stateProvince ? ` in ${stateProvince}` : ""}...\n`);

  const records = [];
  let offset = 0;
  for (;;) {
    const data = await fetchPage(taxonKeys, stateProvince, offset);
    for (const r of data.results || []) records.push(slim(r));
    process.stderr.write(`  offset ${offset}: +${data.results?.length || 0} (total ${records.length}/${data.count})\n`);
    if (data.endOfRecords || !data.results?.length) break;
    offset += PAGE;
    if (offset >= HARD_OFFSET_CAP) {
      process.stderr.write(`  WARNING: hit GBIF ${HARD_OFFSET_CAP}-offset paging cap; sample truncated. Use DWCA for full coverage.\n`);
      break;
    }
    await sleep(SPACING_MS);
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify({
    source: "gbif-occurrence-search",
    datasetKey: DATASET_KEY,
    fetchedAt: new Date().toISOString().slice(0, 10),
    country: "US",
    stateProvince: stateProvince || null,
    taxonKeys,
    inatTaxonIds: inatIds,
    recordCount: records.length,
    records
  })}\n`);
  process.stderr.write(`\nWrote ${records.length} records to ${outPath}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
