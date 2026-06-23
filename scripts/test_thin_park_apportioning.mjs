#!/usr/bin/env node
// Gate for the thin-park apportioning (KNOWN_ISSUES item 1b).
//
// Thin/patchwork parks (the motivating case is Indiana Dunes NP) occupy narrow
// strips inside 0.05-degree status-raster cells. The single-status raster marks
// any cell that touches an "allowed" park as allowed, so a permission-filtered
// overview counted the WHOLE iNaturalist cell as allowed even when most of the
// cell is private land. The fix bakes per-status area fractions (`fr`) on
// boundary cells so the app apportions each cell's count by area share.
//
// This gate asserts, against the baked raster alone (no app/network needed):
//   1. The Indiana Dunes area carries apportioned cells (fr.food with a
//      fractional `allowed` share strictly between 0 and 1).
//   2. Every fraction set is sane (>=2 statuses, shares in (0,1], sum ~= 1).
//   3. Apportioning REDUCES the allowed weight vs. the old whole-cell behaviour
//      (0 < apportioned allowed weight < binary allowed-cell count), i.e. the
//      over-count is actually corrected without erasing the park.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RASTER_PATH = path.join(ROOT, "data", "falling-fruit", "us", "status-raster.json");
const CELL_SIZE_DEGREES = 0.05;

// Padded Indiana Dunes NP extent (matches NPS_REGION_BOUNDS_BY_MATCH + padding).
const DUNES = { south: 41.50, west: -87.30, north: 41.85, east: -86.75 };

function cellCenterFromKey(key) {
  const match = key.match(/^([we])(\d{5})_([ns])(\d{5})$/);
  if (!match) return null;
  const west = (match[1] === "w" ? -1 : 1) * (Number(match[2]) / 100);
  const south = (match[3] === "s" ? -1 : 1) * (Number(match[4]) / 100);
  return [west + CELL_SIZE_DEGREES / 2, south + CELL_SIZE_DEGREES / 2];
}

function inBox([lng, lat], box) {
  return lng >= box.west && lng <= box.east && lat >= box.south && lat <= box.north;
}

const raster = JSON.parse(await readFile(RASTER_PATH, "utf8"));
const errors = [];

const dunesCells = Object.entries(raster).filter(([key]) => {
  const center = cellCenterFromKey(key);
  return center && inBox(center, DUNES);
});

let apportionedAllowedCells = 0;
let binaryAllowedCells = 0;
let apportionedAllowedWeight = 0;

for (const [key, entry] of dunesCells) {
  if (entry.food === "allowed") binaryAllowedCells += 1;
  const foodFractions = entry.fr?.food;
  if (foodFractions) {
    const statuses = Object.keys(foodFractions);
    if (statuses.length < 2) errors.push(`${key}: fr.food has a single status (should be omitted)`);
    let sum = 0;
    for (const [status, share] of Object.entries(foodFractions)) {
      if (!(share > 0 && share <= 1)) errors.push(`${key}: fr.food.${status} share ${share} out of range`);
      sum += share;
    }
    if (Math.abs(sum - 1) > 0.005) errors.push(`${key}: fr.food shares sum to ${sum.toFixed(3)}, expected 1`);
    const allowedShare = foodFractions.allowed || 0;
    if (allowedShare > 0 && allowedShare < 1) apportionedAllowedCells += 1;
    apportionedAllowedWeight += allowedShare;
  } else {
    apportionedAllowedWeight += entry.food === "allowed" ? 1 : 0;
  }
}

if (!dunesCells.length) errors.push("found no Indiana Dunes raster cells");
if (!apportionedAllowedCells) {
  errors.push("no Indiana Dunes cell carries a fractional food=allowed share — apportioning is not baked (run fetch_padus_cell_containment.mjs then build_status_raster.mjs)");
}
if (!(apportionedAllowedWeight > 0)) {
  errors.push("apportioned food=allowed weight is 0 — the park was erased, not apportioned");
}
if (!(apportionedAllowedWeight < binaryAllowedCells)) {
  errors.push(`apportioning did not reduce the allowed over-count (apportioned weight ${apportionedAllowedWeight.toFixed(2)} >= binary allowed cells ${binaryAllowedCells})`);
}

if (errors.length) {
  console.error("Thin-park apportioning check FAILED:");
  errors.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(
  `Thin-park apportioning OK: ${dunesCells.length} Indiana Dunes cells, ` +
  `${apportionedAllowedCells} apportioned; food=allowed weight ` +
  `${apportionedAllowedWeight.toFixed(2)} vs. binary ${binaryAllowedCells} whole-cell ` +
  `(over-count reduced by ${(binaryAllowedCells - apportionedAllowedWeight).toFixed(2)} cell-equivalents).`
);
