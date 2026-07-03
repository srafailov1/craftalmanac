#!/usr/bin/env node
// Validate data/project-recipes.json: it is the (formerly in-app.js) recipe
// content, now fetched at runtime. Assert structural integrity so a bad edit
// (or a bad card added by a content pass) fails the build instead of the UI.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const RECIPES_PATH = path.join(ROOT, "data", "project-recipes.json");
const APP_PATH = path.join(ROOT, "app.js");

const VALID_MAPS = new Set(["ink", "food", "medicine", "minerals"]);
const recipes = JSON.parse(await readFile(RECIPES_PATH, "utf8"));
if (!Array.isArray(recipes)) throw fail("project-recipes.json is not an array");

function fail(msg) { console.error(`FAIL: ${msg}`); process.exit(1); }

const ids = new Set();
const kindsByMap = {};
for (const r of recipes) {
  if (!r || typeof r !== "object") fail(`recipe is not an object: ${JSON.stringify(r).slice(0, 60)}`);
  if (!r.id) fail(`recipe missing id: ${JSON.stringify(r).slice(0, 80)}`);
  if (ids.has(r.id)) fail(`duplicate recipe id: ${r.id}`);
  ids.add(r.id);
  if (!VALID_MAPS.has(r.map)) fail(`recipe ${r.id} has invalid/missing map "${r.map}"`);
  if (!r.kind) fail(`recipe ${r.id} missing kind`);
  if (!r.name) fail(`recipe ${r.id} missing name`);
  // Cards render a card face (name/teaser) and a detail (steps). Require the
  // minimum the detail view reads so a half-authored card can't ship blank.
  if (!Array.isArray(r.steps) || !r.steps.length) fail(`recipe ${r.id} has no steps`);
  if (!Array.isArray(r.ingredients)) fail(`recipe ${r.id} ingredients must be an array`);
  // A card flagged toxic must carry the safety list the detail view promises.
  if (r.toxic && (!Array.isArray(r.safety) || !r.safety.length)) {
    fail(`recipe ${r.id} is toxic:true but has no safety[] entries`);
  }
  (kindsByMap[r.map] ||= new Set()).add(r.kind);
}

// Every recipe's kind must be reachable from a shelf in app.js's PROJECT_SHELVES
// (else it silently lands in the OTHER catch-all). Parse the layout loosely.
const appSource = await readFile(APP_PATH, "utf8");
const shelvesMatch = appSource.match(/const PROJECT_SHELVES = (\{[\s\S]*?\n\});/);
if (!shelvesMatch) fail("could not find PROJECT_SHELVES in app.js");
const shelfKinds = new Set([...shelvesMatch[1].matchAll(/kinds:\s*\[([^\]]*)\]/g)]
  .flatMap((m) => m[1].split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean)));
const unshelved = [];
for (const [map, kinds] of Object.entries(kindsByMap)) {
  for (const kind of kinds) if (!shelfKinds.has(kind)) unshelved.push(`${map}:${kind}`);
}
if (unshelved.length) {
  console.warn(`WARN: kinds with no named shelf (will fall into OTHER): ${unshelved.join(", ")}`);
}

const byMap = Object.fromEntries(recipes.reduce((m, r) => m.set(r.map, (m.get(r.map) || 0) + 1), new Map()));
console.log(`PASS: ${recipes.length} project recipes valid (${Object.entries(byMap).map(([m, n]) => `${m}=${n}`).join(", ")}).`);
