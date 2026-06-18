#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const MANIFEST_PATH = path.join(ROOT, "data", "falling-fruit", "us", "manifest.json");
const STATE_BOUNDARY_PATH = path.join(ROOT, "data", "contiguous-us-states.json");
const LOCAL_JURISDICTIONS_PATH = path.join(ROOT, "data", "local-jurisdictions.json");
const USFS_FOREST_RULES_PATH = path.join(ROOT, "data", "usfs-forest-rules.json");
const CACHE_DIR = path.join(ROOT, "data", "falling-fruit", "us", "access-cache");

const FALLING_FRUIT_MODES = ["food", "ink"];
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
    "NPS_GATHERING_RULES",
    "SITE_ACCESS_RULES",
    "ACCESS_STATUS_OPTIONS",
    "EDIBLE_FUNGUS_WHITELIST",
    "INK_FALLING_FRUIT_SPECIES_ALIASES",
    "foodSpeciesCatalog",
    "inkSpeciesCatalog"
  ].forEach((name) => {
    const expression = extractConstExpression(appSource, name);
    vm.runInContext(`var ${name} = ${expression};`, context, { filename: APP_PATH });
  });

  [
    "getImportedSpeciesId",
    "computeRecordAccessRule",
    "getSiteAccessRule",
    "getRecordStateCode",
    "getPublicLandAccessRule",
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
  ["id", "speciesId", "lat", "lng", "access", "accessClass", "publicLand", "accessNote", "sourceUrl"].forEach((field) => {
    if (!(field in fields)) throw new Error(`manifest is missing ${field} record field`);
  });
  return fields;
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

function getModeSpeciesId(context, mode, sourceSpeciesId) {
  context.state.activeMap = mode;
  return context.getImportedSpeciesId(sourceSpeciesId);
}

function getExpectedModeCounts(context, chunk, catalogById, mode) {
  const expected = {};
  Object.entries(chunk.countsBySpeciesId || {}).forEach(([sourceSpeciesId, count]) => {
    const speciesId = getModeSpeciesId(context, mode, sourceSpeciesId);
    if (!catalogById.has(speciesId)) return;
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
  FALLING_FRUIT_MODES.forEach((mode) => {
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

function validateSpotAssertions(context, catalogByMode, spots) {
  const shenandoahBlueberry = validateShenandoahBlueberryRule(context, catalogByMode);
  const monticelloRule = validateMonticelloRule(context, catalogByMode);
  if (spots.monticello.total && spots.monticello.prohibited !== spots.monticello.total) {
    throw new Error(`Monticello spot assertion failed: ${JSON.stringify(spots.monticello)}`);
  }
  if (!spots.manhattanLocalPark.total || spots.manhattanLocalPark.prohibited <= spots.manhattanLocalPark.total / 2) {
    throw new Error(`Manhattan local park spot assertion failed: ${JSON.stringify(spots.manhattanLocalPark)}`);
  }
  return { shenandoahBlueberry, monticelloRule };
}

async function main() {
  const context = await buildRuleContext();
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const fields = makeFieldIndex(manifest.recordFields);
  const catalogByMode = {
    food: new Map(context.foodSpeciesCatalog.map((species) => [species.id, species])),
    ink: new Map(context.inkSpeciesCatalog.map((species) => [species.id, species]))
  };
  const spots = {
    monticello: { total: 0, prohibited: 0 },
    manhattanLocalPark: { total: 0, prohibited: 0 }
  };
  let totalRecords = 0;

  for (const chunk of manifest.chunks) {
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
    FALLING_FRUIT_MODES.forEach((mode) => {
      accessCounts[mode] = {};
      centroidAccumulators[mode] = {};
    });

    records.forEach((rawRecord, index) => {
      const sourceSpeciesId = rawRecord[fields.speciesId];
      FALLING_FRUIT_MODES.forEach((mode) => {
        context.state.activeMap = mode;
        const speciesId = context.getImportedSpeciesId(sourceSpeciesId);
        const species = catalogByMode[mode].get(speciesId);
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
        addSpotObservation(spots, context, mode, speciesId, rule.status, rawRecord, fields, cachedUnits);
      });
    });

    chunk.accessCounts = Object.fromEntries(Object.entries(accessCounts).map(([mode, statuses]) => [
      mode,
      Object.fromEntries(Object.entries(statuses).filter(([, speciesCounts]) => Object.keys(speciesCounts).length))
    ]));
    chunk.accessCentroids = Object.fromEntries(Object.entries(centroidAccumulators).map(([mode, centroids]) => [
      mode,
      finalizeCentroids(centroids)
    ]));

    validateChunkCounts(context, chunk, catalogByMode);
  }

  if (totalRecords !== manifest.recordCount) {
    throw new Error(`Total record count changed: manifest ${manifest.recordCount}, chunks ${totalRecords}`);
  }
  const syntheticAssertions = validateSpotAssertions(context, catalogByMode, spots);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest)}\n`);
  console.log(`Wrote access status aggregates for ${manifest.chunks.length} chunks and ${totalRecords} records.`);
  console.log(`Spot assertions: ${JSON.stringify({ ...syntheticAssertions, ...spots })}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
