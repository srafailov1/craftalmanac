#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const STATE_BOUNDARY_PATH = path.join(ROOT, "data", "contiguous-us-states.json");
const CELL_CACHE_DIR = path.join(ROOT, "data", "falling-fruit", "us", "cell-containment");
const RASTER_PATH = path.join(ROOT, "data", "falling-fruit", "us", "status-raster.json");

const MODES = ["food", "ink", "medicine"];
const REPRESENTATIVE_SPECIES_BY_MODE = {
  food: "blackberry",
  ink: "ink-black-walnut",
  medicine: "medicine-broadleaf-plantain"
};

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
  const closeChar = openChar === "[" ? "]" : openChar === "{" ? "}" : "";
  if (!closeChar) throw new Error(`Const ${name} does not start with an object or array literal`);
  const end = findMatchingDelimiter(source, expressionStart, openChar, closeChar);
  if (end < 0) throw new Error(`Could not parse const ${name}`);
  return source.slice(expressionStart, end + 1);
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
  const context = {
    console,
    Map,
    state: {
      activeMap: "food",
      stateBoundaries,
      accessRuleCache: new Map()
    }
  };
  vm.createContext(context);

  [
    "ACCESS_RULE_SOURCES",
    "NPS_GATHERING_RULES",
    "SITE_ACCESS_RULES",
    "ACCESS_STATUS_OPTIONS",
    "foodSpeciesCatalog",
    "inkSpeciesCatalog",
    "medicineSpeciesCatalog"
  ].forEach((name) => {
    const expression = extractConstExpression(appSource, name);
    vm.runInContext(`var ${name} = ${expression};`, context, { filename: APP_PATH });
  });

  [
    "getSiteAccessRule",
    "getRecordStateCode",
    "getPublicLandAccessRule",
    "getNpsCompendiumRule",
    "getStateSystemRule",
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

function getCellStatus(context, mode, species, cell) {
  context.state.activeMap = mode;
  const record = makeCellRecord(cell);
  const siteRule = context.getSiteAccessRule(record);
  if (siteRule) return siteRule.status;
  const stateCode = context.getRecordStateCode(record);
  const features = (cell.units || []).map((properties) => ({ properties }));
  const landRule = context.getBestPublicLandAccessRule(features, species, stateCode, record);
  return landRule?.status || "unknown";
}

function getPublicLandTextFromCell(cell) {
  return (cell.units || [])
    .map((properties) => [
      properties.Unit_Nm,
      properties.MngNm_Desc,
      properties.MngTp_Desc,
      properties.DesTp_Desc
    ].filter(Boolean).join(" ").toLowerCase())
    .join(" | ");
}

function isManhattanNycParkCell(context, cell) {
  const record = makeCellRecord(cell);
  const [lng, lat] = cell.center;
  if (lat < 40.68 || lat > 40.88 || lng < -74.03 || lng > -73.9) return false;
  return (cell.units || []).some((properties) => (
    context.isNycLocalPark(context.getPublicLandText(properties), "NY", record)
  ));
}

async function readCellCacheFiles() {
  const files = (await readdir(CELL_CACHE_DIR))
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .sort();
  const cells = [];
  for (const file of files) {
    const chunkCells = JSON.parse(await readFile(path.join(CELL_CACHE_DIR, file), "utf8"));
    if (chunkCells.length !== 9) throw new Error(`${file}: expected 9 cells, got ${chunkCells.length}`);
    chunkCells.forEach((cell) => cells.push({ ...cell, chunkFile: file }));
  }
  return cells;
}

function validateRaster(context, cells, raster, statusIds) {
  const smokyCells = cells.filter((cell) => getPublicLandTextFromCell(cell).includes("great smoky"));
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

  Object.entries(raster).forEach(([key, status]) => {
    MODES.forEach((mode) => {
      if (!statusIds.has(status[mode])) throw new Error(`${key} ${mode}: unexpected status ${status[mode]}`);
    });
  });

  return {
    smokyCells: smokyCells.length,
    manhattanParkCells: manhattanParkCells.length,
    emptyUnknownSample: emptyUnknownCell.key
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

  cells.forEach((cell) => {
    if (raster[cell.key]) throw new Error(`Duplicate status raster cell key ${cell.key}`);
    raster[cell.key] = Object.fromEntries(MODES.map((mode) => [
      mode,
      getCellStatus(context, mode, representativeSpecies[mode], cell)
    ]));
  });

  const validation = validateRaster(context, cells, raster, statusIds);
  await writeFile(RASTER_PATH, `${JSON.stringify(raster)}\n`);
  console.log(`Wrote status raster for ${cells.length} cells to ${path.relative(ROOT, RASTER_PATH)}.`);
  console.log(`Representative species: ${JSON.stringify(REPRESENTATIVE_SPECIES_BY_MODE)}`);
  console.log(`Validation: ${JSON.stringify(validation)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
