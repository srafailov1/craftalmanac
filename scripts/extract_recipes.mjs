#!/usr/bin/env node
// One-time (and re-runnable) extraction of PROJECT_RECIPES out of app.js into
// data/project-recipes.json. Every existing recipe is ink/dye, so each gets
// `map: "ink"` if it doesn't already carry a map. Idempotent: re-running after
// the const is gone reads the JSON and just re-normalizes/validates it.
//
// After extraction, app.js loads the JSON at startup (see loadProjectRecipes).
// Food and mineral cards are appended to the same JSON with their own `map`.
import { readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const OUT_PATH = path.join(ROOT, "data", "project-recipes.json");
const VALID_MAPS = new Set(["ink", "food", "medicine", "minerals"]);

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
      if (quote === "`" && char === "$" && next === "{") { templateExpressionDepth += 1; index += 1; continue; }
      if (templateExpressionDepth) {
        if (char === "{") templateExpressionDepth += 1;
        else if (char === "}") templateExpressionDepth -= 1;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") { quote = char; continue; }
    if (char === "/" && next === "/") { index = source.indexOf("\n", index); if (index < 0) return -1; continue; }
    if (char === "/" && next === "*") { index = source.indexOf("*/", index + 2); if (index < 0) return -1; index += 1; continue; }
    if (char === openChar) depth += 1;
    if (char === closeChar) { depth -= 1; if (depth === 0) return index; }
  }
  return -1;
}

function extractConstExpression(source, name) {
  const start = source.indexOf(`const ${name} =`);
  if (start < 0) return null;
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
const expr = extractConstExpression(appSource, "PROJECT_RECIPES");

let recipes;
if (expr) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`var PROJECT_RECIPES = ${expr};`, context, { filename: APP_PATH });
  recipes = context.PROJECT_RECIPES;
} else {
  // Const already removed — normalize the existing JSON instead.
  recipes = JSON.parse(await readFile(OUT_PATH, "utf8"));
}

if (!Array.isArray(recipes)) throw new Error("PROJECT_RECIPES did not parse to an array");

const ids = new Set();
for (const recipe of recipes) {
  if (!recipe.id) throw new Error(`recipe missing id: ${JSON.stringify(recipe).slice(0, 80)}`);
  if (ids.has(recipe.id)) throw new Error(`duplicate recipe id: ${recipe.id}`);
  ids.add(recipe.id);
  if (!recipe.map) recipe.map = "ink"; // every legacy recipe is ink/dye
  if (!VALID_MAPS.has(recipe.map)) throw new Error(`recipe ${recipe.id} has invalid map "${recipe.map}"`);
  if (!recipe.kind) throw new Error(`recipe ${recipe.id} missing kind`);
}

const tmp = `${OUT_PATH}.tmp-${process.pid}`;
await writeFile(tmp, `${JSON.stringify(recipes, null, 2)}\n`);
await rename(tmp, OUT_PATH);

const byMap = {};
for (const r of recipes) byMap[r.map] = (byMap[r.map] || 0) + 1;
console.log(`Wrote ${recipes.length} recipes to data/project-recipes.json`);
console.log(`  by map: ${Object.entries(byMap).map(([m, n]) => `${m}=${n}`).join(", ")}`);
