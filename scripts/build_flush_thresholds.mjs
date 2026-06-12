#!/usr/bin/env node
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const OUTPUT_PATH = path.join(ROOT, "data", "flush-thresholds.json");

const args = new Set(process.argv.slice(2));

const THRESHOLDS_BY_SPECIES = {
  morel: {
    thresholdMm72h: 25,
    windowHours: 72,
    confidence: "low",
    ownerReview: true,
    sourceNote: "Conservative heuristic for spring morel flush-likelihood only. Sources support cool, moist spring conditions and rain/moisture as important for morel fruiting, but no source found gives a defensible national mm-per-72h trigger.",
    sources: [
      {
        title: "MushroomExpert.com: Morels",
        url: "https://www.mushroomexpert.com/morels/index.html",
        note: "General morel ecology and spring fruiting reference; no rainfall threshold."
      },
      {
        title: "The Spruce: How to Grow Morel Mushrooms",
        url: "https://www.thespruce.com/how-to-grow-and-care-for-morel-mushrooms-4686369",
        note: "Describes cool, moist weather, scattered rain, and 60-70 F days as favorable; no wild-foraging threshold."
      }
    ]
  }
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

async function readFoodCatalog() {
  const appSource = await readFile(APP_PATH, "utf8");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`var foodSpeciesCatalog = ${extractConstExpression(appSource, "foodSpeciesCatalog")};`, context, { filename: APP_PATH });
  return context.foodSpeciesCatalog;
}

function getMushroomWhitelist(foodCatalog) {
  return foodCatalog.filter((species) => species.category === "mushroom");
}

function buildThresholdData(whitelist) {
  return Object.fromEntries(whitelist.map((species) => {
    const threshold = THRESHOLDS_BY_SPECIES[species.id];
    if (!threshold) throw new Error(`Missing flush threshold for whitelisted mushroom ${species.id}`);
    return [
      species.id,
      {
        commonName: species.commonName,
        scientificName: species.scientificName,
        ...threshold
      }
    ];
  }));
}

function assertThresholdData(whitelist, data) {
  const whitelistIds = new Set(whitelist.map((species) => species.id));
  const dataIds = new Set(Object.keys(data));
  whitelistIds.forEach((id) => {
    if (!dataIds.has(id)) throw new Error(`flush threshold missing whitelisted mushroom ${id}`);
  });
  dataIds.forEach((id) => {
    if (!whitelistIds.has(id)) throw new Error(`flush threshold includes non-whitelisted species ${id}`);
    const entry = data[id];
    if (!Number.isFinite(entry.thresholdMm72h) || entry.thresholdMm72h <= 0) {
      throw new Error(`${id} thresholdMm72h must be a positive number`);
    }
    if (entry.windowHours !== 72) throw new Error(`${id} windowHours must be 72`);
    if (!entry.sourceNote || !Array.isArray(entry.sources) || !entry.sources.length) {
      throw new Error(`${id} must include source notes`);
    }
    if (entry.confidence !== "low" || entry.ownerReview !== true) {
      throw new Error(`${id} must stay low-confidence and owner-review until approved`);
    }
  });
}

async function buildThresholds() {
  const whitelist = getMushroomWhitelist(await readFoodCatalog());
  const data = buildThresholdData(whitelist);
  assertThresholdData(whitelist, data);
  const tempPath = `${OUTPUT_PATH}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tempPath, OUTPUT_PATH);
  console.log(`Wrote ${Object.keys(data).length} flush threshold to ${path.relative(ROOT, OUTPUT_PATH)}`);
}

async function verifyThresholds() {
  const whitelist = getMushroomWhitelist(await readFoodCatalog());
  const data = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
  assertThresholdData(whitelist, data);
  console.log(`Verified flush thresholds for whitelisted mushrooms: ${Object.keys(data).join(", ")}`);
}

if (args.has("--verify")) {
  await verifyThresholds();
} else {
  await buildThresholds();
  await verifyThresholds();
}
