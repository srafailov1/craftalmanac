#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { writeSplitManifest } from "./split_access_manifest.mjs";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const STATE_BOUNDARY_PATH = path.join(ROOT, "data", "contiguous-us-states.json");
const LOCAL_JURISDICTIONS_PATH = path.join(ROOT, "data", "local-jurisdictions.json");
const USFS_FOREST_RULES_PATH = path.join(ROOT, "data", "usfs-forest-rules.json");

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) args.set(m[1], m[2] ?? "true");
}

// --tree selects the chunk tree. Falling Fruit (default) keys records by a
// source speciesId resolved per mode through getImportedSpeciesId; iNaturalist
// keys records by iNat anchor taxon id resolved per mode through the catalogs'
// inatTaxonIds, and covers medicine (Herbs) as well.
const CATALOG_CONST_BY_MODE = {
  food: "foodSpeciesCatalog",
  ink: "inkSpeciesCatalog",
  medicine: "medicineSpeciesCatalog"
};
const TREE_CONFIG = {
  "falling-fruit": {
    dir: "falling-fruit/us",
    modes: ["food", "ink"],
    countField: "countsBySpeciesId",
    requiredFields: ["id", "speciesId", "lat", "lng", "access", "accessClass", "publicLand", "accessNote", "sourceUrl"],
    dataSpotAssertions: true,
    writeAccessCentroids: true
  },
  inaturalist: {
    dir: "inaturalist/us",
    modes: ["food", "ink", "medicine"],
    countField: "countsByAnchor",
    requiredFields: ["id", "anchor", "lat", "lng"],
    dataSpotAssertions: false,
    // iNaturalist chunks carry one count-weighted center for all aggregate
    // positioning, so per-status access centroids are not baked (keeps the boot
    // manifest small); access-filtered overview circles use the chunk center.
    writeAccessCentroids: false
  }
};
const TREE = args.get("tree") || "falling-fruit";
const cfg = TREE_CONFIG[TREE];
if (!cfg) throw new Error(`unknown --tree=${TREE} (expected falling-fruit or inaturalist)`);
const LIMIT = args.has("limit") ? Number(args.get("limit")) : Infinity;

const MANIFEST_PATH = path.join(ROOT, "data", cfg.dir, "manifest.json");
const CACHE_DIR = path.join(ROOT, "data", cfg.dir, "access-cache");
const MODES = cfg.modes;
const STATUS_IDS = ["allowed", "permit-required", "private", "private-unsourced", "unknown", "prohibited"];

function findMatchingDelimiter(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let templateExpressionDepth = 0;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (quote === "`" && char === "$" && next === "{") {
        templateExpressionDepth += 1;
        index += 1;
        continue;
      }
      if (templateExpressionDepth) {
        if (char === "{") templateExpressionDepth += 1;
        else if (char === "}") templateExpressionDepth -= 1;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "/" && next === "/") {
      index = source.indexOf("\n", index);
      if (index < 0) return -1;
      continue;
    }
    if (char === "/" && next === "*") {
      index = source.indexOf("*/", index + 2);
      if (index < 0) return -1;
      index += 1;
      continue;
    }
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function extractConstExpression(source, name) {
  const start = source.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`Could not find const ${name}`);
  const equals = source.indexOf("=", start);
  let expressionStart = equals + 1;
  while (/\s/.test(source[expressionStart])) expressionStart += 1;
  const openChar = source[expressionStart];
  if (openChar === "[" || openChar === "{") {
    const closeChar = openChar === "[" ? "]" : "}";
    const end = findMatchingDelimiter(source, expressionStart, openChar, closeChar);
    if (end < 0) throw new Error(`Could not parse const ${name}`);
    return source.slice(expressionStart, end + 1);
  }
  // Constructor initializer such as `new Set([...])` or `new Map([...])`.
  if (source.startsWith("new ", expressionStart)) {
    const parenOpen = source.indexOf("(", expressionStart);
    const end = findMatchingDelimiter(source, parenOpen, "(", ")");
    if (end < 0) throw new Error(`Could not parse const ${name}`);
    return source.slice(expressionStart, end + 1);
  }
  throw new Error(`Const ${name} does not start with an object, array, or constructor literal`);
}

function extractFunctionSource(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Could not find function ${name}`);
  const bodyStart = source.indexOf("{", start);
  const end = findMatchingDelimiter(source, bodyStart, "{", "}");
  if (end < 0) throw new Error(`Could not parse function ${name}`);
  return source.slice(start, end + 1);
}

async function buildRuleContext() {
  const appSource = await readFile(APP_PATH, "utf8");
  const stateBoundaries = JSON.parse(await readFile(STATE_BOUNDARY_PATH, "utf8")).states || [];
  const localJurisdictions = JSON.parse(await readFile(LOCAL_JURISDICTIONS_PATH, "utf8")).jurisdictions || [];
  const usfsForestRules = JSON.parse(await readFile(USFS_FOREST_RULES_PATH, "utf8")).forests || [];
  const context = {
    console,
    Map,
    state: {
      activeMap: "food",
      stateBoundaries,
      localJurisdictions,
      usfsForestRules,
      accessRuleCache: new Map()
    },
    __cachedUnits: []
  };
  context.getContainingPublicLands = () => (
    context.__cachedUnits.map((properties) => ({ properties }))
  );
  // getStatusRasterAccessRule is a runtime-only provisional fallback that reads
  // the loaded status raster; the manifest baked here is the ground-truth source
  // that FEEDS that raster, so the fallback must not bake back in. Stub to null
  // (mirrors the live behavior when live PAD-US containment covers the record).
  context.getStatusRasterAccessRule = () => null;
  vm.createContext(context);

  [
    "ACCESS_RULE_SOURCES",
    "ACCESS_STATUS_OPTIONS",
    "EDIBLE_FUNGUS_WHITELIST",
    "NONFOOD_HARVEST_NEEDS_PERMISSION",
    "NONFOOD_SHENANDOAH_LISTED",
    "INK_FALLING_FRUIT_SPECIES_ALIASES",
    // Only the catalogs for the active tree's modes (iNaturalist adds medicine).
    ...MODES.map((mode) => CATALOG_CONST_BY_MODE[mode])
  ].forEach((name) => {
    const expression = extractConstExpression(appSource, name);
    vm.runInContext(`var ${name} = ${expression};`, context, { filename: APP_PATH });
  });

  // The rule tables now live in versioned JSON (data/rules/, loaded at boot by
  // loadAccessRuleTables in app.js); feed the vm the same data the app fetches.
  for (const [name, file] of [
    ["NPS_GATHERING_RULES", "nps-gathering-rules.json"],
    ["SITE_ACCESS_RULES", "site-access-rules.json"]
  ]) {
    const rules = JSON.parse(await readFile(path.join(ROOT, "data", "rules", file), "utf8")).rules;
    vm.runInContext(`var ${name} = ${JSON.stringify(rules)};`, context, { filename: file });
  }

  [
    "getImportedSpeciesId",
    "computeRecordAccessRule",
    "getSiteAccessRule",
    "getRecordStateCode",
    "getPublicLandAccessRule",
    "resolvePublicLandRule",
    "isNonFoodHarvestRestricted",
    "restrictedNonFoodHarvestRule",
    "getNpsCompendiumRule",
    "getStateSystemRule",
    "getLocalParkRule",
    "getUsfsForestRule",
    "unlistedFungusRule",
    "getBestPublicLandAccessRule",
    "getPublicLandText",
    "getPublicLandName",
    "isNationalParkServiceLand",
    "isNycLocalPark",
    "isRecordInNycArea",
    "isUsfsLand",
    "isBlmLand",
    "isWildlifeRefugeLand",
    "isArmyCorpsLand",
    "isVirginiaWma",
    "isVirginiaStateForest",
    "isVirginiaStateParkOrDcrLand",
    "getShenandoahLimit",
    "getBlueRidgeLimit",
    "getPrinceWilliamLimit",
    "getManassasLimit",
    "pointInFeature",
    "pointInPolygon",
    "pointInRing"
  ].forEach((name) => {
    vm.runInContext(extractFunctionSource(appSource, name), context, { filename: APP_PATH });
  });

  return context;
}

function getRecordObject(rawRecord, fields, speciesId) {
  const get = (field) => rawRecord[fields[field]];
  if (TREE === "inaturalist") {
    // Mirrors mapINaturalistObservation's access defaults (app.js ~9068-9070):
    // land access is unknown from iNaturalist; the rule engine + PAD-US
    // containment (cachedUnits) resolve the actual status.
    return {
      id: `inat-${get("id")}`,
      speciesId,
      source: "inaturalist",
      lat: get("lat"),
      lng: get("lng"),
      access: "",
      accessClass: "unknown",
      publicLand: false,
      accessNote: "Land access unknown from iNaturalist. Use the public lands layer and local rules before harvesting.",
      sourceUrl: `https://www.inaturalist.org/observations/${get("id")}`
    };
  }
  return {
    id: `fallingfruit-${get("id")}`,
    speciesId,
    source: "fallingfruit",
    lat: get("lat"),
    lng: get("lng"),
    access: get("access") || "",
    accessClass: get("accessClass") || "unknown",
    publicLand: Boolean(get("publicLand")),
    accessNote: get("accessNote") || "Access unknown in Falling Fruit.",
    sourceUrl: get("sourceUrl") || "https://fallingfruit.org/"
  };
}

function makeFieldIndex(recordFields) {
  const fields = Object.fromEntries(recordFields.map((field, index) => [field, index]));
  cfg.requiredFields.forEach((field) => {
    if (!(field in fields)) throw new Error(`manifest is missing ${field} record field`);
  });
  return fields;
}

// Per-mode record -> catalog species id. Falling Fruit resolves a source
// speciesId through getImportedSpeciesId; iNaturalist resolves an anchor taxon
// id through the mode catalog's inatTaxonIds (anchorSpeciesByMode, built once).
let anchorSpeciesByMode = {};
function buildAnchorSpeciesByMode(catalogByMode) {
  const maps = {};
  for (const mode of MODES) {
    const m = new Map();
    for (const [, species] of catalogByMode[mode]) {
      for (const taxonId of species.inatTaxonIds || []) m.set(taxonId, species.id);
    }
    maps[mode] = m;
  }
  return maps;
}
function resolveModeSpeciesId(context, mode, key) {
  if (TREE === "inaturalist") return anchorSpeciesByMode[mode].get(Number(key));
  context.state.activeMap = mode;
  return context.getImportedSpeciesId(key);
}

function addCount(counts, status, speciesId) {
  counts[status] ||= {};
  counts[status][speciesId] = (counts[status][speciesId] || 0) + 1;
}

function addCentroid(centroids, status, lng, lat) {
  const current = centroids[status] || { lng: 0, lat: 0, count: 0 };
  current.lng += lng;
  current.lat += lat;
  current.count += 1;
  centroids[status] = current;
}

function finalizeCentroids(centroids) {
  return Object.fromEntries(Object.entries(centroids).map(([status, value]) => [
    status,
    [
      Number((value.lng / value.count).toFixed(5)),
      Number((value.lat / value.count).toFixed(5)),
      value.count
    ]
  ]));
}

function getExpectedModeCounts(context, chunk, catalogById, mode) {
  const expected = {};
  Object.entries(chunk[cfg.countField] || {}).forEach(([key, count]) => {
    const speciesId = resolveModeSpeciesId(context, mode, key);
    if (!speciesId || !catalogById.has(speciesId)) return;
    expected[speciesId] = (expected[speciesId] || 0) + Number(count || 0);
  });
  return expected;
}

function getActualModeCounts(accessCounts) {
  const actual = {};
  Object.values(accessCounts || {}).forEach((speciesCounts) => {
    Object.entries(speciesCounts || {}).forEach(([speciesId, count]) => {
      actual[speciesId] = (actual[speciesId] || 0) + Number(count || 0);
    });
  });
  return actual;
}

function validateChunkCounts(context, chunk, catalogByMode) {
  MODES.forEach((mode) => {
    const expected = getExpectedModeCounts(context, chunk, catalogByMode[mode], mode);
    const actual = getActualModeCounts(chunk.accessCounts?.[mode]);
    const speciesIds = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    speciesIds.forEach((speciesId) => {
      if ((expected[speciesId] || 0) !== (actual[speciesId] || 0)) {
        throw new Error(`${chunk.id} ${mode} ${speciesId}: expected ${expected[speciesId] || 0}, got ${actual[speciesId] || 0}`);
      }
    });
  });
}

function isInsideBounds(rawRecord, fields, bounds) {
  const lat = Number(rawRecord[fields.lat]);
  const lng = Number(rawRecord[fields.lng]);
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= bounds.south
    && lat <= bounds.north
    && lng >= bounds.west
    && lng <= bounds.east;
}

function addSpotObservation(spots, context, mode, speciesId, status, rawRecord, fields, cachedUnits) {
  const lat = Number(rawRecord[fields.lat]);
  const lng = Number(rawRecord[fields.lng]);
  if (isInsideBounds(rawRecord, fields, { south: 37.9985, west: -78.464, north: 38.0165, east: -78.438 })) {
    spots.monticello.total += 1;
    if (status === "prohibited") spots.monticello.prohibited += 1;
  }
  if (mode === "food" && lat >= 40.68 && lat <= 40.88 && lng >= -74.03 && lng <= -73.9) {
    const record = { lat, lng };
    const isLocalPark = cachedUnits.some((properties) => (
      context.isNycLocalPark(context.getPublicLandText(properties), "NY", record)
    ));
    if (isLocalPark) {
      spots.manhattanLocalPark.total += 1;
      if (status === "prohibited") spots.manhattanLocalPark.prohibited += 1;
    }
  }
}

function validateShenandoahBlueberryRule(context, catalogByMode) {
  const species = catalogByMode.food.get("blueberry");
  if (!species) throw new Error("Shenandoah blueberry assertion failed: food catalog is missing blueberry");
  context.state.activeMap = "food";
  context.__cachedUnits = [{
    OBJECTID: -1,
    Unit_Nm: "Shenandoah National Park",
    Pub_Access: "OA",
    MngNm_Desc: "National Park Service",
    MngTp_Desc: "Federal",
    DesTp_Desc: "National Park",
    GIS_Acres: 199223
  }];
  const rule = context.computeRecordAccessRule({
    id: "synthetic-shenandoah-blueberry",
    speciesId: "blueberry",
    source: "fallingfruit",
    lat: 38.53,
    lng: -78.43,
    access: "",
    accessClass: "unknown",
    publicLand: false,
    accessNote: "",
    sourceUrl: ""
  }, species);
  context.__cachedUnits = [];
  if (rule.status !== "allowed") {
    throw new Error(`Shenandoah blueberry rule assertion failed: expected allowed, got ${rule.status}`);
  }
  return rule.status;
}

function validateMonticelloRule(context, catalogByMode) {
  const species = catalogByMode.food.get("blackberry");
  if (!species) throw new Error("Monticello assertion failed: food catalog is missing blackberry");
  context.state.activeMap = "food";
  context.__cachedUnits = [];
  const rule = context.computeRecordAccessRule({
    id: "synthetic-monticello-blackberry",
    speciesId: "blackberry",
    source: "fallingfruit",
    lat: 38.008,
    lng: -78.451,
    access: "",
    accessClass: "unknown",
    publicLand: false,
    accessNote: "",
    sourceUrl: ""
  }, species);
  if (rule.status !== "prohibited") {
    throw new Error(`Monticello rule assertion failed: expected prohibited, got ${rule.status}`);
  }
  return rule.status;
}

function validateSpotAssertions(context, catalogByMode, spots, dryRun) {
  // Synthetic rule-engine checks run for every tree (they inject records, so
  // they need no source data).
  const shenandoahBlueberry = validateShenandoahBlueberryRule(context, catalogByMode);
  const monticelloRule = validateMonticelloRule(context, catalogByMode);
  // Data-scan spot assertions depend on Falling-Fruit-specific geographies
  // (Monticello, Manhattan local parks) that an arbitrary iNaturalist subset
  // need not contain, so they only run for a full Falling Fruit bake.
  if (cfg.dataSpotAssertions && !dryRun) {
    if (spots.monticello.total && spots.monticello.prohibited !== spots.monticello.total) {
      throw new Error(`Monticello spot assertion failed: ${JSON.stringify(spots.monticello)}`);
    }
    if (!spots.manhattanLocalPark.total || spots.manhattanLocalPark.prohibited <= spots.manhattanLocalPark.total / 2) {
      throw new Error(`Manhattan local park spot assertion failed: ${JSON.stringify(spots.manhattanLocalPark)}`);
    }
  }
  return { shenandoahBlueberry, monticelloRule };
}

async function main() {
  const context = await buildRuleContext();
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const fields = makeFieldIndex(manifest.recordFields);
  const catalogByMode = {};
  for (const mode of MODES) {
    catalogByMode[mode] = new Map(context[CATALOG_CONST_BY_MODE[mode]].map((species) => [species.id, species]));
  }
  anchorSpeciesByMode = buildAnchorSpeciesByMode(catalogByMode);
  const spots = {
    monticello: { total: 0, prohibited: 0 },
    manhattanLocalPark: { total: 0, prohibited: 0 }
  };
  // Record key used to resolve a per-mode species: source speciesId (FF) or
  // anchor taxon id (iNat).
  const keyField = TREE === "inaturalist" ? fields.anchor : fields.speciesId;
  const dryRun = Number.isFinite(LIMIT);
  const chunks = dryRun ? manifest.chunks.slice(0, LIMIT) : manifest.chunks;
  let totalRecords = 0;

  for (const chunk of chunks) {
    const chunkPath = path.resolve(ROOT, chunk.path.replace(/^\.\//, ""));
    const cachePath = path.join(CACHE_DIR, `${chunk.id}.json`);
    const records = JSON.parse(await readFile(chunkPath, "utf8"));
    const containment = JSON.parse(await readFile(cachePath, "utf8"));
    if (records.length !== containment.length || records.length !== chunk.recordCount) {
      throw new Error(`${chunk.id}: record/cache/manifest length mismatch`);
    }
    totalRecords += records.length;

    const accessCounts = {};
    const centroidAccumulators = {};
    MODES.forEach((mode) => {
      accessCounts[mode] = {};
      centroidAccumulators[mode] = {};
    });

    records.forEach((rawRecord, index) => {
      const recordKey = rawRecord[keyField];
      MODES.forEach((mode) => {
        context.state.activeMap = mode;
        const speciesId = resolveModeSpeciesId(context, mode, recordKey);
        const species = speciesId && catalogByMode[mode].get(speciesId);
        if (!species) return;
        const cachedUnits = containment[index] || [];
        context.__cachedUnits = cachedUnits;
        const record = getRecordObject(rawRecord, fields, speciesId);
        const rule = context.computeRecordAccessRule(record, species);
        if (!STATUS_IDS.includes(rule.status)) {
          throw new Error(`${chunk.id}: unexpected status ${rule.status}`);
        }
        addCount(accessCounts[mode], rule.status, speciesId);
        addCentroid(centroidAccumulators[mode], rule.status, Number(record.lng), Number(record.lat));
        if (cfg.dataSpotAssertions) {
          addSpotObservation(spots, context, mode, speciesId, rule.status, rawRecord, fields, cachedUnits);
        }
      });
    });

    chunk.accessCounts = Object.fromEntries(Object.entries(accessCounts).map(([mode, statuses]) => [
      mode,
      Object.fromEntries(Object.entries(statuses).filter(([, speciesCounts]) => Object.keys(speciesCounts).length))
    ]));
    if (cfg.writeAccessCentroids) {
      chunk.accessCentroids = Object.fromEntries(Object.entries(centroidAccumulators).map(([mode, centroids]) => [
        mode,
        finalizeCentroids(centroids)
      ]));
    }

    validateChunkCounts(context, chunk, catalogByMode);
  }

  const syntheticAssertions = validateSpotAssertions(context, catalogByMode, spots, dryRun);
  if (dryRun) {
    console.log(`Dry run (--limit=${LIMIT}): validated ${chunks.length} chunks, ${totalRecords} records. Manifest NOT written.`);
    console.log(`Spot assertions: ${JSON.stringify({ ...syntheticAssertions, ...spots })}`);
    return;
  }
  if (totalRecords !== manifest.recordCount) {
    throw new Error(`Total record count changed: manifest ${manifest.recordCount}, chunks ${totalRecords}`);
  }
  // Split the access data (accessCounts/accessCentroids) into a sibling
  // manifest-access.json so the default overview boot never downloads it — it
  // is read only when a permission filter is active. writeSplitManifest strips
  // those keys from the chunks it writes to manifest.json (validation above
  // already ran with them inline). See scripts/split_access_manifest.mjs.
  const split = await writeSplitManifest(path.dirname(MANIFEST_PATH), manifest);
  console.log(`Wrote access status aggregates for ${split.chunks} chunks and ${totalRecords} records (access split into manifest-access.json, ${split.accessEntries} entries).`);
  console.log(`Spot assertions: ${JSON.stringify({ ...syntheticAssertions, ...spots })}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
