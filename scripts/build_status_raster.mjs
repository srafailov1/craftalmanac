#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const STATE_BOUNDARY_PATH = path.join(ROOT, "data", "contiguous-us-states.json");
const LOCAL_JURISDICTIONS_PATH = path.join(ROOT, "data", "local-jurisdictions.json");
const USFS_FOREST_RULES_PATH = path.join(ROOT, "data", "usfs-forest-rules.json");
const CELL_CACHE_DIR = path.join(ROOT, "data", "falling-fruit", "us", "cell-containment");
const RASTER_PATH = path.join(ROOT, "data", "falling-fruit", "us", "status-raster.json");

const MODES = ["food", "ink", "medicine"];
const REPRESENTATIVE_SPECIES_BY_MODE = {
  food: "blackberry",
  ink: "ink-black-walnut",
  medicine: "medicine-broadleaf-plantain"
};

// Must match fetch_padus_cell_containment.mjs CELL_SAMPLE_OFFSETS exactly: the
// per-cell `samples` arrays are stored in this fixed order so the sample points
// can be reconstructed here from the cell center for thin-park apportioning.
const CELL_SIZE_DEGREES = 0.05;
const CELL_SAMPLE_QUARTER = CELL_SIZE_DEGREES / 4;
const CELL_SAMPLE_OFFSETS = [
  [0, 0],
  [CELL_SAMPLE_QUARTER, CELL_SAMPLE_QUARTER],
  [-CELL_SAMPLE_QUARTER, CELL_SAMPLE_QUARTER],
  [CELL_SAMPLE_QUARTER, -CELL_SAMPLE_QUARTER],
  [-CELL_SAMPLE_QUARTER, -CELL_SAMPLE_QUARTER]
];

function roundCoord(value) {
  return Number(value.toFixed(5));
}

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
    }
  };
  vm.createContext(context);

  [
    "ACCESS_RULE_SOURCES",
    "ACCESS_STATUS_OPTIONS",
    "EDIBLE_FUNGUS_WHITELIST",
    "foodSpeciesCatalog",
    "inkSpeciesCatalog",
    "medicineSpeciesCatalog"
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
    "getSiteAccessRule",
    "getRecordStateCode",
    "getPublicLandAccessRule",
    "getNpsCompendiumRule",
    "stateEdibleOnlyNonFoodRule",
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

function getCatalogByMode(context) {
  return {
    food: new Map(context.foodSpeciesCatalog.map((species) => [species.id, species])),
    ink: new Map(context.inkSpeciesCatalog.map((species) => [species.id, species])),
    medicine: new Map(context.medicineSpeciesCatalog.map((species) => [species.id, species]))
  };
}

function makeCellRecord(cell) {
  const [lng, lat] = cell.center;
  return {
    id: `status-raster-${cell.key}`,
    source: "inat-status-raster",
    lat,
    lng,
    access: "",
    accessClass: "unknown",
    publicLand: false,
    accessNote: "Area-rule raster for live iNaturalist overview counts.",
    sourceUrl: ""
  };
}

function getStatusForUnitsAt(context, mode, species, point, units) {
  context.state.activeMap = mode;
  const record = makeCellRecord({ center: point });
  const siteRule = context.getSiteAccessRule(record);
  if (siteRule) return siteRule.status;
  const stateCode = context.getRecordStateCode(record);
  const features = (units || []).map((properties) => ({ properties }));
  const landRule = context.getBestPublicLandAccessRule(features, species, stateCode, record);
  return landRule?.status || "unknown";
}

// The units containing the CENTER sample point. Boundary cells carry the full
// 5-point `samples` (CELL_SAMPLE_OFFSETS order); samples[0] is the [0,0] center
// offset. Uniform cells have no `samples`, so cell.units is already equal across
// every sample point.
function getCenterUnits(cell) {
  return Array.isArray(cell.samples) && cell.samples.length === CELL_SAMPLE_OFFSETS.length
    ? (cell.samples[0] || [])
    : (cell.units || []);
}

function getCellStatus(context, mode, species, cell) {
  // Record-level (single) status keeps center-point semantics: resolve from only
  // the units containing the CENTER sample point so a big permissive unit that
  // merely clips the cell can't overstate permission at the center (KNOWN_ISSUES
  // 1b step 2a).
  return getStatusForUnitsAt(context, mode, species, cell.center, getCenterUnits(cell));
}

// Thin-park apportioning (KNOWN_ISSUES 1b): for a boundary cell (one carrying a
// `samples` array of 5 per-sample-point unit sets), resolve the status at each
// sample point and return the share per status. Returns null when this mode is
// uniform across the 5 points (the single `status` already captures it).
function getCellStatusFractions(context, mode, species, cell) {
  if (!Array.isArray(cell.samples) || cell.samples.length !== CELL_SAMPLE_OFFSETS.length) return null;
  const [clng, clat] = cell.center;
  const counts = {};
  CELL_SAMPLE_OFFSETS.forEach(([dx, dy], index) => {
    const point = [roundCoord(clng + dx), roundCoord(clat + dy)];
    const status = getStatusForUnitsAt(context, mode, species, point, cell.samples[index]);
    counts[status] = (counts[status] || 0) + 1;
  });
  const statuses = Object.keys(counts);
  if (statuses.length <= 1) return null;
  const total = CELL_SAMPLE_OFFSETS.length;
  const fractions = {};
  statuses.forEach((status) => {
    fractions[status] = Number((counts[status] / total).toFixed(3));
  });
  return fractions;
}

function publicLandTextFromUnits(units) {
  return (units || [])
    .map((properties) => [
      properties.Unit_Nm,
      properties.MngNm_Desc,
      properties.MngTp_Desc,
      properties.DesTp_Desc
    ].filter(Boolean).join(" ").toLowerCase())
    .join(" | ");
}

// True when the cell's CENTER point sits inside an NYC local park. Uses the
// center-point containment (getCenterUnits) rather than the cell-intersection
// union so validation matches the record-level (single) status semantics.
function isManhattanNycParkCell(context, cell) {
  const record = makeCellRecord(cell);
  const [lng, lat] = cell.center;
  if (lat < 40.68 || lat > 40.88 || lng < -74.03 || lng > -73.9) return false;
  return getCenterUnits(cell).some((properties) => (
    context.isNycLocalPark(context.getPublicLandText(properties), "NY", record)
  ));
}

const SAMPLE_POINT_COUNT = CELL_SAMPLE_OFFSETS.length;

// Union a unit into a {list, sig} accumulator, deduping by JSON signature.
function addUnit(acc, unit) {
  const signature = JSON.stringify(unit);
  if (acc.sig.has(signature)) return;
  acc.sig.add(signature);
  acc.list.push(unit);
}

async function readCellCacheFiles() {
  const files = (await readdir(CELL_CACHE_DIR))
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .sort();
  const cellsByKey = new Map();
  for (const file of files) {
    const chunkCells = JSON.parse(await readFile(path.join(CELL_CACHE_DIR, file), "utf8"));
    const isRegionFile = file.startsWith("region-");
    if (!Array.isArray(chunkCells)) throw new Error(`${file}: expected a cell array`);
    if (!isRegionFile && chunkCells.length !== 9) throw new Error(`${file}: expected 9 cells, got ${chunkCells.length}`);
    chunkCells.forEach((cell) => {
      // Uniform cells carry no `samples`; every sample point then equals `units`.
      const sampleArrays = Array.isArray(cell.samples) && cell.samples.length === SAMPLE_POINT_COUNT
        ? cell.samples
        : Array.from({ length: SAMPLE_POINT_COUNT }, () => cell.units || []);
      let entry = cellsByKey.get(cell.key);
      if (!entry) {
        entry = {
          key: cell.key,
          center: cell.center,
          unitsAcc: { list: [], sig: new Set() },
          sampleAccs: Array.from({ length: SAMPLE_POINT_COUNT }, () => ({ list: [], sig: new Set() })),
          chunkFile: file
        };
        cellsByKey.set(cell.key, entry);
      } else {
        entry.chunkFile = `${entry.chunkFile},${file}`;
      }
      (cell.units || []).forEach((unit) => addUnit(entry.unitsAcc, unit));
      sampleArrays.forEach((units, index) => {
        (units || []).forEach((unit) => addUnit(entry.sampleAccs[index], unit));
      });
    });
  }
  // Finalize: drop signature helpers; keep `samples` only for boundary cells
  // (sample points that disagree). `units` stays the cross-file union, so the
  // single-status bake is unchanged.
  return [...cellsByKey.values()].map((entry) => {
    const out = { key: entry.key, center: entry.center, units: entry.unitsAcc.list, chunkFile: entry.chunkFile };
    const sampleSigs = entry.sampleAccs.map((acc) => [...acc.sig].sort().join(","));
    const uniform = sampleSigs.every((sig) => sig === sampleSigs[0]);
    if (!uniform) out.samples = entry.sampleAccs.map((acc) => acc.list);
    return out;
  });
}

function validateRaster(context, cells, raster, statusIds) {
  // Select by the CENTER sample's containment (not the cell-intersection union):
  // boundary cells whose union merely clips Great Smoky but whose center is empty
  // or in an adjacent unit (Nantahala NF, Blue Ridge Parkway, Foothills WMA) are
  // no longer expected to bake food/allowed. Cells whose center is actually
  // inside Great Smoky must still resolve food/allowed.
  const smokyCells = cells.filter((cell) => publicLandTextFromUnits(getCenterUnits(cell)).includes("great smoky"));
  if (!smokyCells.length) throw new Error("Raster validation failed: found no Great Smoky cells");
  const smokyBad = smokyCells.filter((cell) => raster[cell.key]?.food !== "allowed");
  if (smokyBad.length) throw new Error(`Raster validation failed: ${smokyBad.length} Great Smoky cells were not food/allowed`);

  const manhattanParkCells = cells.filter((cell) => isManhattanNycParkCell(context, cell));
  if (!manhattanParkCells.length) throw new Error("Raster validation failed: found no Manhattan NYC-park cells");
  const manhattanBad = manhattanParkCells.filter((cell) => raster[cell.key]?.food !== "prohibited");
  if (manhattanBad.length) throw new Error(`Raster validation failed: ${manhattanBad.length} Manhattan NYC-park cells were not food/prohibited`);

  const emptyUnknownCell = cells.find((cell) => {
    if ((cell.units || []).length) return false;
    const status = raster[cell.key];
    return MODES.every((mode) => status?.[mode] === "unknown");
  });
  if (!emptyUnknownCell) throw new Error("Raster validation failed: no empty cached-unit cell resolved unknown for every mode");

  let fractionCells = 0;
  Object.entries(raster).forEach(([key, status]) => {
    MODES.forEach((mode) => {
      if (!statusIds.has(status[mode])) throw new Error(`${key} ${mode}: unexpected status ${status[mode]}`);
    });
    if (!status.fr) return;
    fractionCells += 1;
    Object.entries(status.fr).forEach(([mode, fractions]) => {
      if (!MODES.includes(mode)) throw new Error(`${key}: fr has non-mode key ${mode}`);
      let sum = 0;
      Object.entries(fractions).forEach(([fractionStatus, share]) => {
        if (!statusIds.has(fractionStatus)) throw new Error(`${key} fr.${mode}: unexpected status ${fractionStatus}`);
        if (!(share > 0 && share <= 1)) throw new Error(`${key} fr.${mode}.${fractionStatus}: share out of range ${share}`);
        sum += share;
      });
      if (Math.abs(sum - 1) > 0.005) throw new Error(`${key} fr.${mode}: fractions sum to ${sum}, expected 1`);
      if (Object.keys(fractions).length < 2) throw new Error(`${key} fr.${mode}: single-status fraction should have been omitted`);
    });
  });

  return {
    smokyCells: smokyCells.length,
    manhattanParkCells: manhattanParkCells.length,
    emptyUnknownSample: emptyUnknownCell.key,
    fractionCells
  };
}

async function main() {
  const context = await buildRuleContext();
  const catalogByMode = getCatalogByMode(context);
  const representativeSpecies = Object.fromEntries(MODES.map((mode) => {
    const speciesId = REPRESENTATIVE_SPECIES_BY_MODE[mode];
    const species = catalogByMode[mode].get(speciesId);
    if (!species) throw new Error(`Representative species ${speciesId} missing from ${mode} catalog`);
    return [mode, species];
  }));
  const statusIds = new Set(context.ACCESS_STATUS_OPTIONS.map((status) => status.id));
  const cells = await readCellCacheFiles();
  const raster = {};

  let fractionCellCount = 0;
  cells.forEach((cell) => {
    if (raster[cell.key]) throw new Error(`Duplicate status raster cell key ${cell.key}`);
    const entry = Object.fromEntries(MODES.map((mode) => [
      mode,
      getCellStatus(context, mode, representativeSpecies[mode], cell)
    ]));
    if (Array.isArray(cell.samples)) {
      const fr = {};
      MODES.forEach((mode) => {
        const fractions = getCellStatusFractions(context, mode, representativeSpecies[mode], cell);
        if (fractions) fr[mode] = fractions;
      });
      if (Object.keys(fr).length) {
        entry.fr = fr;
        fractionCellCount += 1;
      }
    }
    raster[cell.key] = entry;
  });

  const validation = validateRaster(context, cells, raster, statusIds);
  await writeFile(RASTER_PATH, `${JSON.stringify(raster)}\n`);
  console.log(`Wrote status raster for ${cells.length} cells to ${path.relative(ROOT, RASTER_PATH)}.`);
  console.log(`Representative species: ${JSON.stringify(REPRESENTATIVE_SPECIES_BY_MODE)}`);
  console.log(`Apportioned (statusFractions) cells: ${fractionCellCount}`);
  console.log(`Validation: ${JSON.stringify(validation)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
