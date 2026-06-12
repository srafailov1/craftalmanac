#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const CELL_CACHE_DIR = path.join(ROOT, "data", "falling-fruit", "us", "cell-containment");
const RASTER_PATH = path.join(ROOT, "data", "falling-fruit", "us", "status-raster.json");

const TARGETS = [
  { label: "Sequoia National Park", match: "sequoia national park", expectedFood: "allowed" },
  { label: "Kings Canyon National Park", match: "kings canyon", expectedFood: "allowed" },
  { label: "Indiana Dunes National Park", match: "indiana dunes", expectedFood: "allowed" }
];

function getPublicLandText(cell) {
  return (cell.units || [])
    .map((properties) => [
      properties.Unit_Nm,
      properties.MngNm_Desc,
      properties.MngTp_Desc,
      properties.DesTp_Desc
    ].filter(Boolean).join(" ").toLowerCase())
    .join(" | ");
}

async function readCellCacheFiles() {
  const files = (await readdir(CELL_CACHE_DIR))
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .sort();
  const cells = [];
  for (const file of files) {
    const fileCells = JSON.parse(await readFile(path.join(CELL_CACHE_DIR, file), "utf8"));
    if (!Array.isArray(fileCells)) throw new Error(`${file}: expected a cell array`);
    fileCells.forEach((cell) => cells.push({ ...cell, cacheFile: file }));
  }
  return cells;
}

function assertTargetCoverage(target, cells, raster) {
  const matches = cells.filter((cell) => getPublicLandText(cell).includes(target.match));
  if (!matches.length) {
    throw new Error(`${target.label}: found no cached PAD-US cells`);
  }
  const allowedMatches = matches.filter((cell) => raster[cell.key]?.food === target.expectedFood);
  if (!allowedMatches.length) {
    const sample = matches.slice(0, 5).map((cell) => ({
      key: cell.key,
      cacheFile: cell.cacheFile,
      food: raster[cell.key]?.food || "missing"
    }));
    throw new Error(`${target.label}: expected at least one food/${target.expectedFood} raster cell, got ${JSON.stringify(sample)}`);
  }
  return {
    cells: matches.length,
    sample: allowedMatches[0].key,
    cacheFile: allowedMatches[0].cacheFile
  };
}

async function main() {
  const [cells, raster] = await Promise.all([
    readCellCacheFiles(),
    readFile(RASTER_PATH, "utf8").then(JSON.parse)
  ]);
  const results = Object.fromEntries(TARGETS.map((target) => [
    target.label,
    assertTargetCoverage(target, cells, raster)
  ]));
  console.log(`Overview coverage assertions passed: ${JSON.stringify(results)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
