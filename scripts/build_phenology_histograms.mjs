#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const OUTPUT_DIR = path.join(ROOT, "data", "phenology");

const INATURALIST_HISTOGRAM_URL = "https://api.inaturalist.org/v1/observations/histogram";
const INATURALIST_PLACE_ID = "1";
const REQUEST_DELAY_MS = 250;
const MODES = ["food", "ink", "medicine"];
const MODE_CONSTS = {
  food: "foodSpeciesCatalog",
  ink: "inkSpeciesCatalog",
  medicine: "medicineSpeciesCatalog"
};

const ANNOTATIONS = {
  flowers: { term_id: "12", term_value_id: "13" },
  fruits: { term_id: "12", term_value_id: "14" }
};

const FLOWER_MATERIAL_SPECIES = new Set([
  "ink-honeysuckle",
  "ink-goldenrod"
]);

const args = new Set(process.argv.slice(2));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const closeChar = openChar === "[" ? "]" : openChar === "{" ? "}" : "";
  if (!closeChar) throw new Error(`Const ${name} does not start with an object or array literal`);
  const end = findMatchingDelimiter(source, expressionStart, openChar, closeChar);
  if (end < 0) throw new Error(`Could not parse const ${name}`);
  return source.slice(expressionStart, end + 1);
}

async function readCatalogs() {
  const appSource = await readFile(APP_PATH, "utf8");
  const context = {};
  vm.createContext(context);
  for (const name of Object.values(MODE_CONSTS)) {
    vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, context, { filename: APP_PATH });
  }
  return Object.fromEntries(MODES.map((mode) => [mode, context[MODE_CONSTS[mode]]]));
}

function getAnnotationForSpecies(mode, species) {
  if (mode === "food" && species.category !== "mushroom") return ANNOTATIONS.fruits;
  if (mode === "ink") {
    if (FLOWER_MATERIAL_SPECIES.has(species.id)) return ANNOTATIONS.flowers;
    return ANNOTATIONS.fruits;
  }
  return null;
}

function getHistogramUrl(species, annotation) {
  const params = new URLSearchParams({
    taxon_id: [...new Set(species.inatTaxonIds || [])].join(","),
    date_field: "observed",
    interval: "month_of_year",
    place_id: INATURALIST_PLACE_ID,
    geo: "true",
    quality_grade: "research"
  });
  if (annotation) {
    params.set("term_id", annotation.term_id);
    params.set("term_value_id", annotation.term_value_id);
  }
  return `${INATURALIST_HISTOGRAM_URL}?${params.toString()}`;
}

async function fetchHistogram(species, annotation) {
  const response = await fetch(getHistogramUrl(species, annotation));
  if (!response.ok) throw new Error(`iNaturalist returned ${response.status} for ${species.id}`);
  const data = await response.json();
  if (data.error) throw new Error(`iNaturalist error for ${species.id}: ${data.error}`);
  const months = data.results?.month_of_year || {};
  return Array.from({ length: 12 }, (_, index) => Number(months[String(index + 1)] || 0));
}

function relativeArray(counts) {
  const max = Math.max(...counts);
  if (!max) return Array(12).fill(0);
  return counts.map((count) => Number((count / max).toFixed(4)));
}

function peakMonths(array) {
  const max = Math.max(...array);
  return array
    .map((value, index) => (value === max ? index + 1 : null))
    .filter(Boolean);
}

function assertPhenologyData(catalogs, dataByMode) {
  for (const mode of MODES) {
    const data = dataByMode[mode];
    const expectedIds = new Set(catalogs[mode].map((species) => species.id));
    const actualIds = new Set(Object.keys(data));
    expectedIds.forEach((id) => {
      if (!actualIds.has(id)) throw new Error(`${mode} phenology missing ${id}`);
    });
    actualIds.forEach((id) => {
      if (!expectedIds.has(id)) throw new Error(`${mode} phenology has unexpected species ${id}`);
      const array = data[id];
      if (!Array.isArray(array) || array.length !== 12) {
        throw new Error(`${mode}.${id} must be a 12-month array`);
      }
      const sum = array.reduce((total, value) => {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
          throw new Error(`${mode}.${id} has invalid relative value ${value}`);
        }
        return total + value;
      }, 0);
      if (sum <= 0) throw new Error(`${mode}.${id} has no phenology signal`);
    });
  }

  const elderberryPeaks = peakMonths(dataByMode.food.elderberry);
  if (!elderberryPeaks.some((month) => [7, 8, 9].includes(month))) {
    throw new Error(`elderberry should peak in berry season; got months ${elderberryPeaks.join(", ")}`);
  }
  const walnutPeaks = peakMonths(dataByMode.food["black-walnut"]);
  if (!walnutPeaks.some((month) => [9, 10, 11].includes(month))) {
    throw new Error(`black walnut should peak in nut season; got months ${walnutPeaks.join(", ")}`);
  }
}

async function buildPhenology() {
  const catalogs = await readCatalogs();
  const dataByMode = {};
  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const mode of MODES) {
    const modeData = {};
    for (const species of catalogs[mode]) {
      const annotation = getAnnotationForSpecies(mode, species);
      const counts = await fetchHistogram(species, annotation);
      modeData[species.id] = relativeArray(counts);
      console.log(`${mode}/${species.id}: ${counts.reduce((sum, count) => sum + count, 0)} observations`);
      await sleep(REQUEST_DELAY_MS);
    }
    dataByMode[mode] = modeData;
    const outputPath = path.join(OUTPUT_DIR, `${mode}.json`);
    const tempPath = `${outputPath}.tmp-${process.pid}`;
    await writeFile(tempPath, `${JSON.stringify(modeData, null, 2)}\n`);
    await rename(tempPath, outputPath);
  }
  assertPhenologyData(catalogs, dataByMode);
}

async function verifyPhenology() {
  const catalogs = await readCatalogs();
  const dataByMode = {};
  for (const mode of MODES) {
    dataByMode[mode] = JSON.parse(await readFile(path.join(OUTPUT_DIR, `${mode}.json`), "utf8"));
  }
  assertPhenologyData(catalogs, dataByMode);
  console.log(`Verified ${MODES.map((mode) => `${mode}: ${Object.keys(dataByMode[mode]).length}`).join("; ")} phenology arrays`);
  console.log(`Sanity peaks: elderberry ${peakMonths(dataByMode.food.elderberry).join(", ")}; black-walnut ${peakMonths(dataByMode.food["black-walnut"]).join(", ")}`);
}

if (args.has("--verify")) {
  await verifyPhenology();
} else {
  await buildPhenology();
  await verifyPhenology();
}
