#!/usr/bin/env node
// Build precomputed iNaturalist point chunks (the analog of
// build_falling_fruit_subset.py). Reads GBIF occurrence records (from a
// synchronous-search sample for Phase A, or a DWCA occurrence.txt for the
// national build), maps each record to a catalog anchor by GBIF taxon
// hierarchy, applies iNaturalist obscuration rules, thins to ~one point per
// distinct location per anchor, and writes 0.15-degree chunk files + a manifest
// mirroring data/falling-fruit/us/.
//
// See docs/TODO-inaturalist-chunk-bake.md. Key design choice (refines decision
// 8.6): each baked row stores the matched iNat ANCHOR taxon id, not a single
// resolved speciesId, because 6 taxa map to different species across
// food/ink/medicine (e.g. Sambucus -> elderberry / ink-elderberry /
// medicine-elderberry) and goldenrod has no food species at all. The app
// resolves anchor -> per-mode species from the active catalog at load time,
// exactly the way live getSpeciesForObservation resolves per active mode.
//
// Usage:
//   node scripts/build_inaturalist_subset.mjs --source=gbif-json \
//        --input=<sample.json> [--thin=4] [--out=data/inaturalist/us]
//   node scripts/build_inaturalist_subset.mjs --source=dwca \
//        --input=<dir-with-occurrence.txt> [...]

import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const TAXON_KEYS_PATH = path.join(ROOT, "data", "inaturalist", "taxon-keys.json");
const STATE_BOUNDARY_PATH = path.join(ROOT, "data", "contiguous-us-states.json");

const CHUNK_AXIS_SCALE = 100;
const OBSCURED_THIN_DEGREES = 0.2; // observer-obscured points are randomized in ~0.2 deg cells.
const RECORD_FIELDS = ["id", "anchor", "lat", "lng", "idDate", "observer", "approximate"];

// Contiguous U.S. bounding screen (mirrors build_falling_fruit_subset.py). State
// polygons are checked after this so AK/HI/territories are excluded.
const BOUNDS = { south: 24.0, north: 49.6, west: -125.2, east: -66.8 };

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) args.set(m[1], m[2] ?? "true");
}
const SOURCE = args.get("source") || "gbif-json";
const INPUT = args.get("input");
const THIN_DECIMALS = args.has("thin") ? Number(args.get("thin")) : 4;
// iNat chunk grid. 0.15 (FF's value) yields ~29k chunks nationally, over
// Cloudflare's 20k-file cap; a coarser grid trades fewer, larger chunk files.
const CHUNK_SIZE_DEGREES = args.has("grid") ? Number(args.get("grid")) : 0.15;
const OUT_DIR = path.resolve(ROOT, args.get("out") || "data/inaturalist/us");
if (!INPUT) throw new Error("--input=<file|dir> is required");

// --- anchors -----------------------------------------------------------------
async function loadAnchors() {
  const artifact = JSON.parse(await readFile(TAXON_KEYS_PATH, "utf8"));
  const byGbifKey = new Map();
  const byInatId = new Map();
  for (const t of artifact.taxa) {
    if (t.gbifUsageKey) byGbifKey.set(t.gbifUsageKey, t);
    byInatId.set(t.inatId, t);
  }
  return { list: artifact.taxa, byGbifKey, byInatId };
}

// Resolve a record to its most-specific catalog anchor. Prefer an exact iNat
// leaf-id match (mirrors getSpeciesForObservation's exact-id priority), else the
// deepest GBIF classification key that is an anchor.
function resolveAnchor(rec, anchors) {
  if (rec.taxonID && anchors.byInatId.has(rec.taxonID)) {
    return anchors.byInatId.get(rec.taxonID);
  }
  let best = null;
  let bestDepth = -1;
  rec.gbifKeyChain.forEach((key, depth) => {
    if (anchors.byGbifKey.has(key) && depth > bestDepth) {
      best = anchors.byGbifKey.get(key);
      bestDepth = depth;
    }
  });
  return best;
}

// --- obscuration (mirrors mapINaturalistObservation, app.js ~9036-9051) -------
// taxon-obscured (conservation) -> drop; observer-obscured -> keep, approximate.
function classifyObscuration(informationWithheld) {
  const iw = String(informationWithheld || "");
  if (!iw) return { drop: false, approximate: false };
  if (/request of the observer/i.test(iw)) return { drop: false, approximate: true };
  if (/threatened|endangered|sensitive|conservation|protect/i.test(iw)) return { drop: true, approximate: true };
  // Any other withholding: keep but flag approximate (never present as precise).
  return { drop: false, approximate: true, other: iw };
}

// --- normalizers -------------------------------------------------------------
function obsIdFromUrl(url) {
  const m = String(url || "").match(/observations\/(\d+)/);
  return m ? Number(m[1]) : null;
}
function keyChain(rec) {
  const order = ["kingdomKey", "phylumKey", "classKey", "orderKey", "familyKey", "genusKey", "speciesKey", "taxonKey"];
  const chain = [];
  for (const k of order) {
    const v = Number(rec[k]);
    if (Number.isFinite(v) && !chain.includes(v)) chain.push(v);
  }
  return chain;
}
function normalizeGbifJson(rec) {
  return {
    obsId: obsIdFromUrl(rec.occurrenceID || rec.references),
    taxonID: Number(rec.taxonID) || null,
    gbifKeyChain: keyChain(rec),
    kingdom: rec.kingdom || "",
    lat: Number(rec.decimalLatitude),
    lng: Number(rec.decimalLongitude),
    uncertainty: Number(rec.coordinateUncertaintyInMeters) || null,
    informationWithheld: rec.informationWithheld || "",
    eventDate: String(rec.eventDate || "").slice(0, 10),
    recordedBy: rec.recordedBy || ""
  };
}

async function* readGbifJson(inputPath) {
  const data = JSON.parse(await readFile(inputPath, "utf8"));
  for (const rec of data.records || []) yield normalizeGbifJson(rec);
}

// DWCA occurrence.txt: tab-separated, first line is a header of DwC term names.
// occurrence.txt has ~230 columns; building a 230-key object per row across
// 2.9M rows OOMs, so read ONLY the needed columns by their header index.
const DWCA_NEEDED = [
  "occurrenceID", "references", "taxonID", "kingdomKey", "phylumKey", "classKey",
  "orderKey", "familyKey", "genusKey", "speciesKey", "taxonKey", "kingdom",
  "decimalLatitude", "decimalLongitude", "coordinateUncertaintyInMeters",
  "informationWithheld", "eventDate", "recordedBy"
];
async function* readDwca(inputPath) {
  const stat = await readdir(inputPath).catch(() => null);
  const file = stat ? path.join(inputPath, "occurrence.txt") : inputPath;
  const rl = readline.createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity });
  let idx = null;
  for await (const line of rl) {
    const cols = line.split("\t");
    if (!idx) {
      idx = {};
      cols.forEach((name, i) => { if (DWCA_NEEDED.includes(name)) idx[name] = i; });
      for (const f of DWCA_NEEDED) if (idx[f] === undefined) throw new Error(`DWCA occurrence.txt missing column ${f}`);
      continue;
    }
    const get = (f) => cols[idx[f]];
    yield normalizeGbifJson({
      occurrenceID: get("occurrenceID"), references: get("references"),
      taxonID: get("taxonID"), kingdomKey: get("kingdomKey"), phylumKey: get("phylumKey"),
      classKey: get("classKey"), orderKey: get("orderKey"), familyKey: get("familyKey"),
      genusKey: get("genusKey"), speciesKey: get("speciesKey"), taxonKey: get("taxonKey"),
      kingdom: get("kingdom"), decimalLatitude: get("decimalLatitude"),
      decimalLongitude: get("decimalLongitude"),
      coordinateUncertaintyInMeters: get("coordinateUncertaintyInMeters"),
      informationWithheld: get("informationWithheld"), eventDate: get("eventDate"),
      recordedBy: get("recordedBy")
    });
  }
}

function readRecords(source, inputPath) {
  if (source === "gbif-json") return readGbifJson(inputPath);
  if (source === "dwca") return readDwca(inputPath);
  throw new Error(`unknown --source=${source}`);
}

// --- geometry ----------------------------------------------------------------
function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function pointInPolygon(lng, lat, polygon) {
  if (!polygon.length || !pointInRing(lng, lat, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(lng, lat, hole));
}
function inBbox(lng, lat, bbox) {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}
async function loadStates() {
  const data = JSON.parse(await readFile(STATE_BOUNDARY_PATH, "utf8"));
  return data.states.map((s) => ({
    id: s.id, name: s.name, bbox: s.bbox,
    polygons: s.geometry.type === "Polygon" ? [s.geometry.coordinates] : s.geometry.coordinates
  }));
}
function findState(lng, lat, states) {
  for (const s of states) {
    if (!inBbox(lng, lat, s.bbox)) continue;
    if (s.polygons.some((poly) => pointInPolygon(lng, lat, poly))) return s;
  }
  return null;
}

// --- chunk ids (mirror build_falling_fruit_subset.py) ------------------------
function formatAxis(value, neg, pos) {
  const prefix = value < 0 ? neg : pos;
  const scaled = Math.round(Math.abs(value) * CHUNK_AXIS_SCALE);
  return `${prefix}${String(scaled).padStart(5, "0")}`;
}
function chunkId(lat, lng) {
  const west = Math.floor(lng / CHUNK_SIZE_DEGREES) * CHUNK_SIZE_DEGREES;
  const south = Math.floor(lat / CHUNK_SIZE_DEGREES) * CHUNK_SIZE_DEGREES;
  return `${formatAxis(west, "w", "e")}_${formatAxis(south, "s", "n")}`;
}
function parseAxis(part) {
  const sign = (part[0] === "w" || part[0] === "s") ? -1 : 1;
  return sign * Number(part.slice(1)) / CHUNK_AXIS_SCALE;
}
function chunkBbox(id) {
  const [lngPart, latPart] = id.split("_");
  const west = parseAxis(lngPart);
  const south = parseAxis(latPart);
  return [west, south, Number((west + CHUNK_SIZE_DEGREES).toFixed(5)), Number((south + CHUNK_SIZE_DEGREES).toFixed(5))];
}
function bboxCenter(bbox) {
  return [Number(((bbox[0] + bbox[2]) / 2).toFixed(5)), Number(((bbox[1] + bbox[3]) / 2).toFixed(5))];
}
const round = (v, d) => Number(v.toFixed(d));

// --- main --------------------------------------------------------------------
async function main() {
  const anchors = await loadAnchors();
  const states = await loadStates();

  const stats = {
    scanned: 0, noObsId: 0, noAnchor: 0, outOfBounds: 0, noState: 0,
    taxonObscuredDropped: 0, observerObscured: 0, otherWithheld: 0, precise: 0,
    keptPreThin: 0, collapsedTotal: 0
  };

  // Thinning: dedupe by (anchor, cell). Precise cells at THIN_DECIMALS; obscured
  // cells at OBSCURED_THIN_DEGREES. Keep the most-recent record per cell. Values
  // are COMPACT TUPLES (not objects) so ~2.6M records fit in memory, and they
  // are held exactly once (chunksById later references the same tuples).
  // Tuple: [id, anchor, lat, lng, idDate, observer, approximate, stateId].
  const R = { ID: 0, ANCHOR: 1, LAT: 2, LNG: 3, DATE: 4, OBS: 5, APPROX: 6, STATE: 7 };
  const preciseKeep = new Map();
  const obscuredKeep = new Map();

  for await (const rec of readRecords(SOURCE, INPUT)) {
    stats.scanned += 1;
    if (!Number.isFinite(rec.lat) || !Number.isFinite(rec.lng)) { stats.outOfBounds += 1; continue; }
    if (!inBbox(rec.lng, rec.lat, [BOUNDS.west, BOUNDS.south, BOUNDS.east, BOUNDS.north])) { stats.outOfBounds += 1; continue; }

    const anchor = resolveAnchor(rec, anchors);
    if (!anchor) { stats.noAnchor += 1; continue; }
    if (!rec.obsId) { stats.noObsId += 1; continue; }

    const obsc = classifyObscuration(rec.informationWithheld);
    if (obsc.drop) { stats.taxonObscuredDropped += 1; continue; }
    if (obsc.other) stats.otherWithheld += 1;
    else if (obsc.approximate) stats.observerObscured += 1;
    else stats.precise += 1;

    const state = findState(rec.lng, rec.lat, states);
    if (!state) { stats.noState += 1; continue; }
    stats.keptPreThin += 1;

    const approximate = obsc.approximate ? 1 : 0;
    const map = approximate ? obscuredKeep : preciseKeep;
    const cellLat = approximate ? Math.floor(rec.lat / OBSCURED_THIN_DEGREES) : round(rec.lat, THIN_DECIMALS);
    const cellLng = approximate ? Math.floor(rec.lng / OBSCURED_THIN_DEGREES) : round(rec.lng, THIN_DECIMALS);
    const key = `${anchor.inatId}|${cellLat}|${cellLng}`;
    const idDate = rec.eventDate || "";

    const existing = map.get(key);
    if (!existing) {
      map.set(key, [rec.obsId, anchor.inatId, round(rec.lat, 5), round(rec.lng, 5), idDate, rec.recordedBy || "", approximate, state.id]);
    } else {
      stats.collapsedTotal += 1;
      if (idDate > (existing[R.DATE] || "")) {
        existing[R.ID] = rec.obsId; existing[R.LAT] = round(rec.lat, 5); existing[R.LNG] = round(rec.lng, 5);
        existing[R.DATE] = idDate; existing[R.OBS] = rec.recordedBy || ""; existing[R.STATE] = state.id;
      }
    }
  }

  stats.keptPostThin = preciseKeep.size + obscuredKeep.size;

  // Group into chunks + per-state aggregates. Records held ONCE; chunksById
  // stores references to the same tuples (no second copy).
  const chunksById = new Map();
  const stateAgg = new Map();
  const anchorSet = new Set();
  for (const keepMap of [preciseKeep, obscuredKeep]) {
    for (const t of keepMap.values()) {
      anchorSet.add(t[R.ANCHOR]);
      const id = chunkId(t[R.LAT], t[R.LNG]);
      let arr = chunksById.get(id);
      if (!arr) { arr = []; chunksById.set(id, arr); }
      arr.push(t);
      let sa = stateAgg.get(t[R.STATE]);
      if (!sa) { sa = { counts: {}, centroids: {} }; stateAgg.set(t[R.STATE], sa); }
      sa.counts[t[R.ANCHOR]] = (sa.counts[t[R.ANCHOR]] || 0) + 1;
      (sa.centroids[t[R.ANCHOR]] ||= [0, 0, 0]);
      sa.centroids[t[R.ANCHOR]][0] += t[R.LNG]; sa.centroids[t[R.ANCHOR]][1] += t[R.LAT]; sa.centroids[t[R.ANCHOR]][2] += 1;
    }
  }
  preciseKeep.clear();
  obscuredKeep.clear();

  const chunksDir = path.join(OUT_DIR, "chunks");
  await mkdir(chunksDir, { recursive: true });
  // Clear stale chunk files (mirrors build_falling_fruit_subset.py).
  for (const f of await readdir(chunksDir).catch(() => [])) {
    if (f.endsWith(".json")) await rm(path.join(chunksDir, f));
  }

  const manifestChunks = [];
  let totalRecords = 0;
  const globalCounts = {};
  for (const [id, records] of [...chunksById.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    // Sort by (anchor, lat, lng, id) for stable access-cache row alignment.
    records.sort((a, b) => a[R.ANCHOR] - b[R.ANCHOR] || a[R.LAT] - b[R.LAT] || a[R.LNG] - b[R.LNG] || a[R.ID] - b[R.ID]);
    const rows = records.map((t) => t.slice(0, 7));
    await writeFile(path.join(chunksDir, `${id}.json`), JSON.stringify(rows));
    totalRecords += rows.length;

    const counts = {};
    const centroids = {};
    for (const t of records) {
      const a = t[R.ANCHOR];
      counts[a] = (counts[a] || 0) + 1;
      (centroids[a] ||= [0, 0, 0]);
      centroids[a][0] += t[R.LNG]; centroids[a][1] += t[R.LAT]; centroids[a][2] += 1;
      globalCounts[a] = (globalCounts[a] || 0) + 1;
    }
    manifestChunks.push({
      id, bbox: chunkBbox(id), recordCount: rows.length,
      countsByAnchor: sortedCounts(counts),
      centroidsByAnchor: finalizeCentroids(centroids),
      path: `./data/inaturalist/us/chunks/${id}.json`
    });
  }

  const stateById = new Map(states.map((s) => [s.id, s]));
  const manifestStates = [...stateAgg.entries()].map(([sid, agg]) => {
    const s = stateById.get(sid);
    return {
      id: sid, name: s.name, bbox: s.bbox, center: bboxCenter(s.bbox),
      recordCount: Object.values(agg.counts).reduce((a, b) => a + b, 0),
      countsByAnchor: sortedCounts(agg.counts),
      centroidsByAnchor: finalizeCentroids(agg.centroids)
    };
  }).sort((a, b) => a.id.localeCompare(b.id));

  const manifest = {
    source: "iNaturalist Research-grade Observations (via GBIF)",
    datasetKey: "50c9509d-22c7-4a22-a47d-8c48425ef4a7",
    scope: "contiguous-us",
    chunkType: "degree-grid",
    chunkSizeDegrees: CHUNK_SIZE_DEGREES,
    recordFields: RECORD_FIELDS,
    thinDecimals: THIN_DECIMALS,
    obscuredThinDegrees: OBSCURED_THIN_DEGREES,
    anchors: anchors.list
      .filter((t) => anchorSet.has(t.inatId))
      .map((t) => ({ anchor: t.inatId, name: t.inatName, speciesByMode: t.speciesByMode })),
    states: manifestStates,
    chunks: manifestChunks,
    recordCount: totalRecords
  };
  await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest));

  const summary = {
    source: SOURCE, input: INPUT,
    generatedAt: new Date().toISOString().slice(0, 10),
    thinning: { preciseDecimals: THIN_DECIMALS, obscuredCellDegrees: OBSCURED_THIN_DEGREES,
      rule: "one point per anchor per cell, most-recent representative" },
    chunkSizeDegrees: CHUNK_SIZE_DEGREES,
    chunkCount: manifestChunks.length,
    recordCount: totalRecords,
    stats,
    keepRatioPostThin: stats.keptPreThin ? Number((stats.keptPostThin / stats.keptPreThin).toFixed(4)) : null,
    countsByAnchor: sortedCounts(globalCounts)
  };
  await writeFile(path.join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
}

function sortedCounts(counts) {
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v]).sort((a, b) => Number(a[0]) - Number(b[0])));
}
function finalizeCentroids(centroids) {
  const out = {};
  for (const [k, [lngSum, latSum, count]] of Object.entries(centroids).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    if (!count) continue;
    out[k] = [Number((lngSum / count).toFixed(5)), Number((latSum / count).toFixed(5)), count];
  }
  return out;
}

main().catch((err) => { console.error(err); process.exit(1); });
