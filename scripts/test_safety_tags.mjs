#!/usr/bin/env node
// Safety-tag completeness gate.
//
// getSpeciesSafetyTags() falls back to [] for any species missing from
// SAFETY_TAGS_BY_SPECIES, so a new catalog entry can ship with an *unconsidered*
// safety decision and no warning (the same silent-drift class the phenology
// --verify gate already closes). This gate fails the build when a food, ink, or
// medicine species has neither an inline `safetyTags` property nor an explicit
// entry in SAFETY_TAGS_BY_SPECIES.
//
// A species with genuinely no notable hazard is still required to be explicit:
// add `"<id>": []` to SAFETY_TAGS_BY_SPECIES to record "considered, none".
//
// Minerals are intentionally out of scope — their hazards live in per-material
// notes and the mine-hazard card block, not this ingestion/contact tag map.
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");

const CATALOG_CONSTS = {
  food: "foodSpeciesCatalog",
  ink: "inkSpeciesCatalog",
  medicine: "medicineSpeciesCatalog"
};
const TAG_MAP_CONST = "SAFETY_TAGS_BY_SPECIES";

// Mirrors scripts/build_phenology_histograms.mjs: skips strings, template
// literals, and // and /* */ comments so brackets inside them don't unbalance.
function findMatchingDelimiter(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let templateExpressionDepth = 0;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
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
    if (char === "\"" || char === "'" || char === "`") { quote = char; continue; }
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

const appSource = await readFile(APP_PATH, "utf8");
const context = {};
vm.createContext(context);
for (const name of [...Object.values(CATALOG_CONSTS), TAG_MAP_CONST]) {
  vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, context, { filename: APP_PATH });
}

const tagMap = context[TAG_MAP_CONST];
const missing = [];
for (const [mode, constName] of Object.entries(CATALOG_CONSTS)) {
  const catalog = context[constName];
  if (!Array.isArray(catalog)) throw new Error(`Catalog ${constName} did not parse to an array`);
  for (const species of catalog) {
    const consideredInline = Array.isArray(species.safetyTags);
    const consideredInMap = Object.prototype.hasOwnProperty.call(tagMap, species.id);
    if (!consideredInline && !consideredInMap) {
      missing.push(`${mode}: ${species.id} (${species.commonName || "?"})`);
    }
  }
}

if (missing.length) {
  console.error(`FAIL: ${missing.length} species have no considered safety-tag decision.`);
  console.error("Add an entry to SAFETY_TAGS_BY_SPECIES (use [] to mark 'considered, no hazard'):");
  for (const line of missing) console.error(`  - ${line}`);
  process.exit(1);
}

const total = Object.values(CATALOG_CONSTS)
  .reduce((sum, name) => sum + context[name].length, 0);
console.log(`PASS: all ${total} food/ink/medicine species have a considered safety-tag decision.`);
