#!/usr/bin/env node
import { access, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const MANIFEST_PATH = path.join(ROOT, "data", "falling-fruit", "us", "manifest.json");
const CACHE_DIR = path.join(ROOT, "data", "falling-fruit", "us", "cell-containment");
const FAILURES_PATH = path.join(CACHE_DIR, "_failures.json");
const REGION_FAILURES_PATH = path.join(CACHE_DIR, "_region_failures.json");
const APP_PATH = path.join(ROOT, "app.js");

const PUBLIC_LANDS_URL = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/PADUS_Public_Access/FeatureServer/0/query";
const PUBLIC_LANDS_PAGE_SIZE = 1000;
const MAX_CONCURRENT_CHUNKS = 2;
const REQUEST_SPACING_MS = 500;
const RETRY_BACKOFF_MS = 2000;
const CELL_SIZE_DEGREES = 0.05;

// Thin-park apportioning (KNOWN_ISSUES 1b): each cell is sampled at 5 points
// (center + 4 quarter-diagonal offsets at +/- CELL_SIZE/4) so build_status_raster
// can bake per-status fractions for cells that straddle a permission boundary.
// Fixed order: center, NE, NW, SE, SW — build_status_raster reconstructs the
// same points from the cell center, so only the per-sample unit sets are stored.
const CELL_SAMPLE_QUARTER = CELL_SIZE_DEGREES / 4;
const CELL_SAMPLE_OFFSETS = [
  [0, 0],
  [CELL_SAMPLE_QUARTER, CELL_SAMPLE_QUARTER],
  [-CELL_SAMPLE_QUARTER, CELL_SAMPLE_QUARTER],
  [CELL_SAMPLE_QUARTER, -CELL_SAMPLE_QUARTER],
  [-CELL_SAMPLE_QUARTER, -CELL_SAMPLE_QUARTER]
];

const OUT_FIELDS = "OBJECTID,Unit_Nm,Pub_Access,MngNm_Desc,MngTp_Desc,DesTp_Desc,GIS_Acres";
const REGION_BBOX_PADDING_DEGREES = 0.05;

// Region cache files are named region-*.json and store the same per-cell
// record shape as FF chunk files, but they may contain any number of cells.
const NPS_REGION_BOUNDS_BY_MATCH = {
  "acadia": { south: 44.20, west: -68.45, north: 44.45, east: -68.10 },
  "capitol reef": { south: 37.55, west: -111.35, north: 38.40, east: -110.65 },
  "crater lake": { south: 42.78, west: -122.25, north: 43.05, east: -121.95 },
  "cuyahoga valley": { south: 41.15, west: -81.70, north: 41.40, east: -81.45 },
  "death valley": { south: 35.65, west: -117.00, north: 37.40, east: -116.10 },
  "glacier national park": { south: 48.20, west: -114.50, north: 49.05, east: -113.35 },
  "grand teton": { south: 43.45, west: -110.95, north: 44.10, east: -110.45 },
  "great smoky": { south: 35.40, west: -84.05, north: 35.85, east: -83.10 },
  "indiana dunes": { south: 41.55, west: -87.25, north: 41.80, east: -86.80 },
  "kings canyon": { south: 36.65, west: -119.10, north: 37.05, east: -118.20 },
  "mount rainier": { south: 46.65, west: -122.05, north: 47.05, east: -121.45 },
  "new river gorge": { south: 37.75, west: -81.25, north: 38.20, east: -80.80 },
  "olympic national park": { south: 47.45, west: -124.80, north: 48.25, east: -123.25 },
  "redwood": { south: 40.25, west: -124.20, north: 42.10, east: -123.70 },
  "rocky mountain national park": { south: 40.15, west: -105.90, north: 40.55, east: -105.45 },
  "sequoia national park": { south: 36.25, west: -118.95, north: 36.85, east: -118.30 },
  "yellowstone": { south: 44.10, west: -111.20, north: 45.15, east: -109.80 },
  "yosemite": { south: 37.45, west: -120.00, north: 38.20, east: -119.15 },
  // 2026-06-16: 29 of the 34 newly-encoded national parks (lower-48 + Hawaii +
  // moderate Alaska). The 3 Alaska giants (Denali, Gates of the Arctic,
  // Wrangell-St. Elias) are deferred — their 0.05-degree grids run to tens of
  // thousands of cells and would bloat the raster for areas with negligible
  // iNaturalist overview traffic; their point-level rules still apply.
  "big bend national park": { south: 28.97, west: -103.78, north: 29.7, east: -102.84 },
  "biscayne": { south: 25.32, west: -80.35, north: 25.67, east: -80.1 },
  "black canyon of the gunnison": { south: 38.5, west: -107.83, north: 38.64, east: -107.62 },
  "carlsbad caverns": { south: 32.07, west: -104.65, north: 32.2, east: -104.38 },
  "congaree": { south: 33.74, west: -80.87, north: 33.84, east: -80.6 },
  "dry tortugas": { south: 24.57, west: -82.97, north: 24.73, east: -81.76 },
  "gateway arch": { south: 38.62, west: -90.19, north: 38.63, east: -90.18 },
  "grand canyon national park": { south: 35.75, west: -113.98, north: 36.82, east: -111.63 },
  "great basin national park": { south: 38.82, west: -114.36, north: 39.06, east: -114.12 },
  "great sand dunes": { south: 37.66, west: -105.73, north: 37.92, east: -105.5 },
  "guadalupe mountains": { south: 31.81, west: -105.03, north: 32, east: -104.71 },
  "haleakala": { south: 20.63, west: -156.25, north: 20.77, east: -156.04 },
  "hawaii volcanoes": { south: 18.97, west: -155.81, north: 19.5, east: -155.02 },
  "hot springs national park": { south: 34.5, west: -93.11, north: 34.56, east: -93.02 },
  "isle royale": { south: 47.12, west: -89.42, north: 48.26, east: -88.26 },
  "kenai fjords": { south: 59.43, west: -150.98, north: 60.3, east: -149.52 },
  "kobuk valley": { south: 67.0, west: -160.3, north: 67.87, east: -157.83 },
  "lake clark": { south: 59.85, west: -154.25, north: 61.51, east: -152.2 },
  "lassen volcanic": { south: 40.34, west: -121.61, north: 40.59, east: -121.27 },
  "mammoth cave": { south: 37.1, west: -86.27, north: 37.27, east: -86.03 },
  "mesa verde": { south: 37.16, west: -108.56, north: 37.35, east: -108.34 },
  "north cascades": { south: 48.37, west: -121.64, north: 49.0, east: -120.64 },
  "pinnacles": { south: 36.41, west: -121.25, north: 36.56, east: -121.1 },
  "saguaro national park": { south: 32.12, west: -111.24, north: 32.35, east: -110.6 },
  "theodore roosevelt national park": { south: 46.9, west: -103.63, north: 47.63, east: -103.26 },
  "virgin islands national park": { south: 18.3, west: -64.94, north: 18.38, east: -64.68 },
  "voyageurs": { south: 48.3, west: -93.2, north: 48.63, east: -92.46 },
  "wind cave": { south: 43.5, west: -103.55, north: 43.64, east: -103.34 },
  "zion national park": { south: 37.15, west: -113.21, north: 37.5, east: -112.86 }
};

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (match) args.set(match[1], match[2] ?? "true");
}

const limit = args.has("limit") ? Number(args.get("limit")) : Infinity;
const force = args.get("force") === "true";
const regionsOnly = args.get("regions-only") === "true";
const chunksOnly = args.get("chunks-only") === "true";
// Optional: restrict the region pass to regions whose id/label contains this
// substring (case-insensitive). Useful for targeted re-fetches / validation.
const regionMatch = args.has("region-match") ? String(args.get("region-match")).toLowerCase() : null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

let requestQueue = Promise.resolve();
let lastRequestAt = 0;

async function throttledFetch(url) {
  let release;
  const previous = requestQueue;
  requestQueue = new Promise((resolve) => {
    release = resolve;
  });
  await previous;
  const wait = Math.max(0, lastRequestAt + REQUEST_SPACING_MS - Date.now());
  if (wait) await sleep(wait);
  lastRequestAt = Date.now();
  release();
  return fetch(url);
}

function buildPadusUrl(bbox, offset) {
  const [west, south, east, north] = bbox;
  const params = new URLSearchParams({
    where: "Pub_Access IN ('OA','RA')",
    geometry: [
      west.toFixed(5),
      south.toFixed(5),
      east.toFixed(5),
      north.toFixed(5)
    ].join(","),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: OUT_FIELDS,
    returnGeometry: "true",
    outSR: "4326",
    geometryPrecision: "5",
    f: "geojson",
    resultRecordCount: String(PUBLIC_LANDS_PAGE_SIZE),
    resultOffset: String(offset)
  });
  return `${PUBLIC_LANDS_URL}?${params.toString()}`;
}

async function fetchPadusPage(bbox, offset) {
  const url = buildPadusUrl(bbox, offset);
  const response = await throttledFetch(url);
  if (!response.ok) throw new Error(`PAD-US returned ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(`PAD-US query error: ${data.error.message || data.error.code || "unknown"}`);
  return data.features || [];
}

async function fetchPadusFeatures(bbox) {
  const features = [];
  for (let offset = 0; ; offset += PUBLIC_LANDS_PAGE_SIZE) {
    const page = await fetchPadusPage(bbox, offset);
    features.push(...page);
    if (page.length < PUBLIC_LANDS_PAGE_SIZE) break;
  }
  features.forEach((feature) => {
    feature.__bbox = getFeatureBbox(feature);
  });
  return features;
}

async function withRetry(operation) {
  try {
    return await operation();
  } catch (firstError) {
    await sleep(RETRY_BACKOFF_MS);
    try {
      return await operation();
    } catch (secondError) {
      secondError.message = `${secondError.message} (after retry; first error: ${firstError.message})`;
      throw secondError;
    }
  }
}

function getFeatureBbox(feature) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  const scanPolygon = (rings) => rings.forEach((ring) => ring.forEach(([lng, lat]) => {
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat < south) south = lat;
    if (lat > north) north = lat;
  }));
  const geometry = feature.geometry;
  if (geometry?.type === "Polygon") scanPolygon(geometry.coordinates);
  else if (geometry?.type === "MultiPolygon") geometry.coordinates.forEach(scanPolygon);
  return [west, south, east, north];
}

function pointInFeature(point, feature) {
  const geometry = feature.geometry;
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }
  return false;
}

function pointInPolygon(point, polygon) {
  if (!polygon?.length || !pointInRing(point, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y))
      && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function makeCellKey(west, south) {
  return `${formatLngCellCoord(west)}_${formatLatCellCoord(south)}`;
}

function formatLngCellCoord(value) {
  const direction = value < 0 ? "w" : "e";
  const absolute = Math.round(Math.abs(value) * 100);
  return `${direction}${String(absolute).padStart(5, "0")}`;
}

function formatLatCellCoord(value) {
  const direction = value < 0 ? "s" : "n";
  const absolute = Math.round(Math.abs(value) * 100);
  return `${direction}${String(absolute).padStart(5, "0")}`;
}

function getCellCenters(bbox) {
  const [west, south] = bbox;
  const cells = [];
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      const cellWest = roundCoord(west + (x * CELL_SIZE_DEGREES));
      const cellSouth = roundCoord(south + (y * CELL_SIZE_DEGREES));
      const lng = roundCoord(cellWest + (CELL_SIZE_DEGREES / 2));
      const lat = roundCoord(cellSouth + (CELL_SIZE_DEGREES / 2));
      cells.push({
        key: makeCellKey(cellWest, cellSouth),
        center: [lng, lat],
        units: []
      });
    }
  }
  return cells;
}

function roundCoord(value) {
  return Number(value.toFixed(5));
}

function findContainingProperties(point, features) {
  const [lng, lat] = point;
  return features
    .filter((feature) => {
      const box = feature.__bbox;
      if (box && (lng < box[0] || lng > box[2] || lat < box[1] || lat > box[3])) return false;
      return pointInFeature(point, feature);
    })
    .map((feature) => feature.properties || {});
}

function unitSetSignature(units) {
  return units
    .map((u) => String(u.OBJECTID ?? `${u.Unit_Nm}|${u.MngNm_Desc}|${u.DesTp_Desc}`))
    .sort()
    .join(",");
}

// Per-sample-point containment for proportional apportioning. Returns the 5
// per-sample unit arrays (CELL_SAMPLE_OFFSETS order) ONLY when the sample
// points disagree; returns null for a uniform cell (every sample resolves to
// the same unit set), in which case the cell's single `units`/`status` already
// captures it and apportioning is trivially 1.0.
function computeCellSamples(center, features) {
  const [clng, clat] = center;
  const sampleUnits = CELL_SAMPLE_OFFSETS.map(([dx, dy]) =>
    findContainingProperties([roundCoord(clng + dx), roundCoord(clat + dy)], features)
  );
  const sigs = sampleUnits.map(unitSetSignature);
  if (sigs.every((sig) => sig === sigs[0])) return null;
  return sampleUnits;
}

function findIntersectingProperties(cell, features) {
  const box = getCellBbox(cell);
  return features
    .filter((feature) => cellIntersectsFeature(cell, box, feature))
    .map((feature) => feature.properties || {});
}

function getCellBbox(cell) {
  const [lng, lat] = cell.center;
  const half = CELL_SIZE_DEGREES / 2;
  return [
    roundCoord(lng - half),
    roundCoord(lat - half),
    roundCoord(lng + half),
    roundCoord(lat + half)
  ];
}

function cellIntersectsFeature(cell, cellBbox, feature) {
  const featureBbox = feature.__bbox;
  if (!featureBbox || !bboxesIntersect(cellBbox, featureBbox)) return false;
  const [west, south, east, north] = cellBbox;
  const [lng, lat] = cell.center;
  const samplePoints = [
    [lng, lat],
    [west, south],
    [west, north],
    [east, south],
    [east, north]
  ];
  if (samplePoints.some((point) => pointInFeature(point, feature))) return true;
  return featureHasVertexInBbox(feature, cellBbox);
}

function bboxesIntersect(a, b) {
  return a[2] >= b[0]
    && a[0] <= b[2]
    && a[3] >= b[1]
    && a[1] <= b[3];
}

function featureHasVertexInBbox(feature, bbox) {
  const [west, south, east, north] = bbox;
  let found = false;
  const testRing = (ring) => {
    for (const [lng, lat] of ring) {
      if (lng >= west && lng <= east && lat >= south && lat <= north) {
        found = true;
        return;
      }
    }
  };
  const scanPolygon = (rings) => {
    for (const ring of rings) {
      if (found) return;
      testRing(ring);
    }
  };
  const geometry = feature.geometry;
  if (geometry?.type === "Polygon") scanPolygon(geometry.coordinates);
  else if (geometry?.type === "MultiPolygon") geometry.coordinates.forEach(scanPolygon);
  return found;
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

async function readRuleLists() {
  // The rule tables now live in versioned JSON (data/rules/, loaded at boot by
  // loadAccessRuleTables in app.js); read the same files the app fetches.
  const rulesDir = path.join(ROOT, "data", "rules");
  return {
    npsRules: JSON.parse(await readFile(path.join(rulesDir, "nps-gathering-rules.json"), "utf8")).rules || [],
    siteRules: JSON.parse(await readFile(path.join(rulesDir, "site-access-rules.json"), "utf8")).rules || []
  };
}

async function loadExistingCellKeys(excludeFile = "") {
  const files = (await readdir(CACHE_DIR))
    .filter((file) => file.endsWith(".json") && !file.startsWith("_") && file !== excludeFile);
  const keys = new Set();
  for (const file of files) {
    const cells = JSON.parse(await readFile(path.join(CACHE_DIR, file), "utf8"));
    cells.forEach((cell) => {
      if (cell?.key) keys.add(cell.key);
    });
  }
  return keys;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function padBounds(bounds) {
  return {
    south: roundCoord(bounds.south - REGION_BBOX_PADDING_DEGREES),
    west: roundCoord(bounds.west - REGION_BBOX_PADDING_DEGREES),
    north: roundCoord(bounds.north + REGION_BBOX_PADDING_DEGREES),
    east: roundCoord(bounds.east + REGION_BBOX_PADDING_DEGREES)
  };
}

function boundsToBbox(bounds) {
  return [bounds.west, bounds.south, bounds.east, bounds.north];
}

function getRegionCells(bounds, existingKeys) {
  const cells = [];
  const westStart = Math.floor(bounds.west / CELL_SIZE_DEGREES) * CELL_SIZE_DEGREES;
  const southStart = Math.floor(bounds.south / CELL_SIZE_DEGREES) * CELL_SIZE_DEGREES;
  const eastEnd = Math.ceil(bounds.east / CELL_SIZE_DEGREES) * CELL_SIZE_DEGREES;
  const northEnd = Math.ceil(bounds.north / CELL_SIZE_DEGREES) * CELL_SIZE_DEGREES;
  for (let south = southStart; south < northEnd; south += CELL_SIZE_DEGREES) {
    for (let west = westStart; west < eastEnd; west += CELL_SIZE_DEGREES) {
      const cellWest = roundCoord(west);
      const cellSouth = roundCoord(south);
      const key = makeCellKey(cellWest, cellSouth);
      if (existingKeys.has(key)) continue;
      cells.push({
        key,
        center: [
          roundCoord(cellWest + (CELL_SIZE_DEGREES / 2)),
          roundCoord(cellSouth + (CELL_SIZE_DEGREES / 2))
        ],
        units: []
      });
    }
  }
  return cells;
}

async function getRuleRegions() {
  const { npsRules, siteRules } = await readRuleLists();
  const regions = [];
  npsRules.forEach((rule) => {
    const bounds = NPS_REGION_BOUNDS_BY_MATCH[rule.match];
    if (!bounds) {
      console.warn(`Skipping region cells for "${rule.match}": no bbox in NPS_REGION_BOUNDS_BY_MATCH (deferred — e.g. oversized Alaska parks). Point-level rules still apply.`);
      return;
    }
    regions.push({
      id: `nps-${slugify(rule.match)}`,
      label: rule.match,
      bbox: boundsToBbox(padBounds(bounds))
    });
  });
  siteRules.filter((rule) => rule.bounds).forEach((rule) => {
    regions.push({
      id: `site-${slugify(rule.name)}`,
      label: rule.name,
      bbox: boundsToBbox(padBounds(rule.bounds))
    });
  });
  return regions;
}

async function processRegion(region) {
  const cacheFile = `region-${region.id}.json`;
  const cachePath = path.join(CACHE_DIR, cacheFile);
  if (!force && await fileExists(cachePath)) return { skipped: true };

  const existingKeys = await loadExistingCellKeys(cacheFile);
  const bounds = {
    west: region.bbox[0],
    south: region.bbox[1],
    east: region.bbox[2],
    north: region.bbox[3]
  };
  const cells = getRegionCells(bounds, existingKeys);
  const features = await withRetry(() => fetchPadusFeatures(region.bbox));
  const populatedCells = cells.map((cell) => {
    const units = findIntersectingProperties(cell, features);
    const samples = computeCellSamples(cell.center, features);
    return samples ? { ...cell, units, samples } : { ...cell, units };
  });

  const tempPath = `${cachePath}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(populatedCells)}\n`);
  await rename(tempPath, cachePath);
  return { skipped: false, cells: populatedCells.length, features: features.length };
}

async function processChunk(chunk) {
  const cachePath = path.join(CACHE_DIR, `${chunk.id}.json`);
  if (!force && await fileExists(cachePath)) return { skipped: true };

  const features = await withRetry(() => fetchPadusFeatures(chunk.bbox));
  const cells = getCellCenters(chunk.bbox).map((cell) => {
    const units = findContainingProperties(cell.center, features);
    const samples = computeCellSamples(cell.center, features);
    return samples ? { ...cell, units, samples } : { ...cell, units };
  });
  if (cells.length !== 9) {
    throw new Error(`expected 9 cell centers, got ${cells.length}`);
  }

  const tempPath = `${cachePath}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(cells)}\n`);
  await rename(tempPath, cachePath);
  return { skipped: false, cells: cells.length, features: features.length };
}

async function runWithConcurrency(items, concurrency, worker) {
  let cursor = 0;
  const results = [];
  async function runWorker() {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runWorker));
  return results;
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  await mkdir(CACHE_DIR, { recursive: true });
  const chunks = manifest.chunks.slice(0, Number.isFinite(limit) ? limit : manifest.chunks.length);
  const failures = [];
  let completed = 0;
  let skipped = 0;
  let processedCells = 0;

  if (!regionsOnly) {
    await runWithConcurrency(chunks, MAX_CONCURRENT_CHUNKS, async (chunk) => {
      try {
        const result = await processChunk(chunk);
        completed += 1;
        if (result.skipped) skipped += 1;
        else processedCells += result.cells || 0;
        if (completed % 25 === 0 || completed === chunks.length) {
          console.log(`PAD-US cell containment: ${completed}/${chunks.length} chunks (${skipped} skipped, ${processedCells} cells processed)`);
        }
      } catch (error) {
        completed += 1;
        failures.push({
          id: chunk.id,
          bbox: chunk.bbox,
          message: error.message
        });
        console.error(`Failed ${chunk.id}: ${error.message}`);
      }
    });

    await writeFile(FAILURES_PATH, `${JSON.stringify(failures, null, 2)}\n`);
    console.log(`PAD-US cell containment complete: ${chunks.length - skipped - failures.length} written, ${skipped} skipped, ${failures.length} failed.`);
  }

  if (!chunksOnly) {
    let regions = await getRuleRegions();
    if (regionMatch) {
      regions = regions.filter((region) =>
        region.id.toLowerCase().includes(regionMatch) || region.label.toLowerCase().includes(regionMatch));
    }
    const regionFailures = [];
    let completedRegions = 0;
    let skippedRegions = 0;
    let processedRegionCells = 0;
    await runWithConcurrency(regions, MAX_CONCURRENT_CHUNKS, async (region) => {
      try {
        const result = await processRegion(region);
        completedRegions += 1;
        if (result.skipped) skippedRegions += 1;
        else processedRegionCells += result.cells || 0;
        console.log(`PAD-US rule-region containment: ${completedRegions}/${regions.length} regions (${skippedRegions} skipped, ${processedRegionCells} cells processed)`);
      } catch (error) {
        completedRegions += 1;
        regionFailures.push({
          id: region.id,
          label: region.label,
          bbox: region.bbox,
          message: error.message
        });
        console.error(`Failed ${region.id}: ${error.message}`);
      }
    });
    await writeFile(REGION_FAILURES_PATH, `${JSON.stringify(regionFailures, null, 2)}\n`);
    console.log(`PAD-US rule-region containment complete: ${regions.length - skippedRegions - regionFailures.length} written, ${skippedRegions} skipped, ${regionFailures.length} failed.`);
    failures.push(...regionFailures);
  }

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
