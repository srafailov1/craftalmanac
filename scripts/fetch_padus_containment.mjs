#!/usr/bin/env node
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const MANIFEST_PATH = path.join(ROOT, "data", "falling-fruit", "us", "manifest.json");
const CACHE_DIR = path.join(ROOT, "data", "falling-fruit", "us", "access-cache");
const FAILURES_PATH = path.join(CACHE_DIR, "_failures.json");

const PUBLIC_LANDS_URL = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/PADUS_Public_Access/FeatureServer/0/query";
const PUBLIC_LANDS_PAGE_SIZE = 1000;
const MAX_CONCURRENT_CHUNKS = 2;
const REQUEST_SPACING_MS = 500;
const RETRY_BACKOFF_MS = 2000;

const OUT_FIELDS = "OBJECTID,Unit_Nm,Pub_Access,MngNm_Desc,MngTp_Desc,DesTp_Desc,GIS_Acres";

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (match) args.set(match[1], match[2] ?? "true");
}

const limit = args.has("limit") ? Number(args.get("limit")) : Infinity;
const force = args.get("force") === "true";

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

function recordToPoint(record, fieldIndexes) {
  const lat = Number(record[fieldIndexes.lat]);
  const lng = Number(record[fieldIndexes.lng]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lng, lat];
}

function findContainingProperties(point, features) {
  if (!point) return [];
  const [lng, lat] = point;
  return features
    .filter((feature) => {
      const box = feature.__bbox;
      if (box && (lng < box[0] || lng > box[2] || lat < box[1] || lat > box[3])) return false;
      return pointInFeature(point, feature);
    })
    .map((feature) => feature.properties || {});
}

async function processChunk(chunk, fieldIndexes) {
  const cachePath = path.join(CACHE_DIR, `${chunk.id}.json`);
  if (!force && await fileExists(cachePath)) return { skipped: true };

  const chunkPath = path.resolve(ROOT, chunk.path.replace(/^\.\//, ""));
  const records = JSON.parse(await readFile(chunkPath, "utf8"));
  const features = await withRetry(() => fetchPadusFeatures(chunk.bbox));
  const containment = records.map((record) => findContainingProperties(recordToPoint(record, fieldIndexes), features));
  if (containment.length !== records.length) {
    throw new Error(`containment length ${containment.length} did not match record length ${records.length}`);
  }

  const tempPath = `${cachePath}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(containment)}\n`);
  await rename(tempPath, cachePath);
  return { skipped: false, records: records.length, features: features.length };
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
  const fieldIndexes = {
    lat: manifest.recordFields.indexOf("lat"),
    lng: manifest.recordFields.indexOf("lng")
  };
  if (fieldIndexes.lat < 0 || fieldIndexes.lng < 0) {
    throw new Error("manifest is missing lat/lng record fields");
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const chunks = manifest.chunks.slice(0, Number.isFinite(limit) ? limit : manifest.chunks.length);
  const failures = [];
  let completed = 0;
  let skipped = 0;
  let processedRecords = 0;

  await runWithConcurrency(chunks, MAX_CONCURRENT_CHUNKS, async (chunk) => {
    try {
      const result = await processChunk(chunk, fieldIndexes);
      completed += 1;
      if (result.skipped) skipped += 1;
      else processedRecords += result.records || 0;
      if (completed % 25 === 0 || completed === chunks.length) {
        console.log(`PAD-US containment: ${completed}/${chunks.length} chunks (${skipped} skipped, ${processedRecords} records processed)`);
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
  console.log(`PAD-US containment complete: ${chunks.length - skipped - failures.length} written, ${skipped} skipped, ${failures.length} failed.`);
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
