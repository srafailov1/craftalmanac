#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const DATA_DIR = path.join(ROOT, "data");
const OUTPUT_DIR = path.join(DATA_DIR, "phenology");
const REGIONS_PATH = path.join(DATA_DIR, "phenology-regions.json");
const STATE_IDS_PATH = path.join(OUTPUT_DIR, ".state-place-ids.json");
const SPARSE_REPORT_PATH = path.join(OUTPUT_DIR, ".sparse-report.json");

const INATURALIST_HISTOGRAM_URL = "https://api.inaturalist.org/v1/observations/histogram";
const INATURALIST_AUTOCOMPLETE_URL = "https://api.inaturalist.org/v1/places/autocomplete";
const NATIONAL_PLACE_ID = "1";
// Politeness: iNaturalist asks for <= 1 req/s sustained. Stay above that.
const REQUEST_DELAY_MS = 1300;
// A Köppen group needs at least this many summed observations across its member
// states to keep its own curve; below the floor we drop the group key and the
// app falls back to the national curve rather than showing a noisy signal.
const SPARSE_FLOOR = 40;
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
  "ink-goldenrod"
]);

// Fungal dye species carry no plant flowering/fruiting phenology annotations, so
// they use the general research-grade observation histogram — i.e. when the
// fruiting body is actually seen, which is the persistence/visibility signal.
const FUNGAL_INK_SPECIES = new Set([
  "ink-dyers-polypore",
  "ink-turkey-tail",
  "ink-artists-conk",
  "ink-red-belted-conk",
  "ink-tinder-conk",
  "ink-chicken-of-the-woods"
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

async function readRegions() {
  return JSON.parse(await readFile(REGIONS_PATH, "utf8"));
}

function getAnnotationForSpecies(mode, species) {
  if (mode === "food" && species.category !== "mushroom") return ANNOTATIONS.fruits;
  if (mode === "ink") {
    if (FLOWER_MATERIAL_SPECIES.has(species.id)) return ANNOTATIONS.flowers;
    if (FUNGAL_INK_SPECIES.has(species.id)) return null;
    return ANNOTATIONS.fruits;
  }
  return null;
}

async function readJSONOr(pathName, fallback) {
  try {
    return JSON.parse(await readFile(pathName, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJSONAtomic(pathName, value) {
  const tempPath = `${pathName}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`);
  await rename(tempPath, pathName);
}

// --- HTTP with backoff --------------------------------------------------------
// Shared fetch wrapper: honors Retry-After on 429, exponential backoff on
// 429/5xx. Returns the parsed JSON body or throws after exhausting retries.
async function fetchJSONWithBackoff(url, label) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let response;
    try {
      response = await fetch(url);
    } catch (err) {
      const wait = 2000 * (attempt + 1);
      console.log(`  ${label}: network error (${err.message}), backing off ${wait}ms (attempt ${attempt + 1}/6)`);
      await sleep(wait);
      lastError = err;
      continue;
    }
    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 2000 * (attempt + 1) ** 2;
      console.log(`  ${label}: HTTP ${response.status}, backing off ${wait}ms (attempt ${attempt + 1}/6)`);
      await sleep(wait);
      lastError = new Error(`iNaturalist returned ${response.status} for ${label}`);
      continue;
    }
    if (!response.ok) throw new Error(`iNaturalist returned ${response.status} for ${label}`);
    const data = await response.json();
    if (data.error) throw new Error(`iNaturalist error for ${label}: ${data.error}`);
    return data;
  }
  throw lastError || new Error(`iNaturalist failed for ${label}`);
}

// --- State place-id resolution ------------------------------------------------
// Resolve each state name in phenology-regions.json to its iNaturalist place_id
// via /places/autocomplete, filtering to place_type 8 (state / admin level) in
// the US. Cache name -> id so this step never repeats. Sanity anchors documented
// in the work order: Virginia = 7, West Virginia = 33.
async function resolveStatePlaceIds(regions) {
  const cache = await readJSONOr(STATE_IDS_PATH, {});
  const stateNames = Object.keys(regions.states);
  let resolvedCount = 0;
  let changed = false;
  for (const name of stateNames) {
    if (cache[name]) {
      resolvedCount += 1;
      continue;
    }
    const url = `${INATURALIST_AUTOCOMPLETE_URL}?${new URLSearchParams({ q: name }).toString()}`;
    const data = await fetchJSONWithBackoff(url, `place:${name}`);
    const results = data.results || [];
    // place_type 8 = state; admin_level 10 also marks US states. Require an exact
    // (case-insensitive) name match AND that the place descends from the US
    // national place (ancestor id 1). iNaturalist carries multiple place_type-8
    // places named e.g. "Florida" (community-curated duplicates outside the
    // canonical admin hierarchy); the US-ancestor guard picks the real US state
    // (Florida -> 21, not 7539).
    const nameMatches = (place) => String(place.name).toLowerCase() === name.toLowerCase();
    const underUS = (place) => Array.isArray(place.ancestor_place_ids) && place.ancestor_place_ids.includes(1);
    const match = results.find((place) => place.place_type === 8 && nameMatches(place) && underUS(place))
      || results.find((place) => place.admin_level === 10 && nameMatches(place) && underUS(place))
      || results.find((place) => place.place_type === 8 && nameMatches(place));
    if (!match) {
      throw new Error(`Could not resolve place_id for state "${name}" (${results.length} candidates)`);
    }
    cache[name] = match.id;
    resolvedCount += 1;
    changed = true;
    console.log(`  place ${name} -> ${match.id}`);
    await writeJSONAtomic(STATE_IDS_PATH, cache);
    await sleep(REQUEST_DELAY_MS);
  }
  // Sanity anchors from the work order.
  const anchors = { Virginia: 7, "West Virginia": 33 };
  for (const [name, expected] of Object.entries(anchors)) {
    if (cache[name] != null && cache[name] !== expected) {
      throw new Error(`place_id sanity check failed: ${name} resolved to ${cache[name]}, expected ${expected}`);
    }
  }
  if (changed) await writeJSONAtomic(STATE_IDS_PATH, cache);
  console.log(`Resolved ${resolvedCount}/${stateNames.length} state place ids`);
  return cache;
}

// --- Histogram fetch ----------------------------------------------------------
function getHistogramUrl(species, annotation, placeId) {
  const params = new URLSearchParams({
    taxon_id: [...new Set(species.inatTaxonIds || [])].join(","),
    date_field: "observed",
    interval: "month_of_year",
    place_id: String(placeId),
    geo: "true",
    quality_grade: "research"
  });
  if (annotation) {
    params.set("term_id", annotation.term_id);
    params.set("term_value_id", annotation.term_value_id);
  }
  return `${INATURALIST_HISTOGRAM_URL}?${params.toString()}`;
}

// Returns raw month-of-year COUNTS (length 12); aggregation happens later.
async function fetchHistogramCounts(species, annotation, placeId, label) {
  const url = getHistogramUrl(species, annotation, placeId);
  const data = await fetchJSONWithBackoff(url, label);
  const months = data.results?.month_of_year || {};
  return Array.from({ length: 12 }, (_, index) => Number(months[String(index + 1)] || 0));
}

function relativeArray(counts) {
  const max = Math.max(...counts);
  if (!max) return Array(12).fill(0);
  return counts.map((count) => Number((count / max).toFixed(4)));
}

function sumCounts(a, b) {
  return a.map((value, index) => value + (b[index] || 0));
}

function total(counts) {
  return counts.reduce((sum, value) => sum + value, 0);
}

// Conifers (juniper cones, pinyon seeds) carry no iNaturalist "fruiting"
// phenology annotations, so the national histogram comes back empty. Fall back
// to a flat curve over the species' catalog harvest months so the display + the
// verify gate still have a (harvest-season) signal for `national`.
function monthsFallbackArray(species) {
  const months = new Set((species.months || []).map(Number));
  return Array.from({ length: 12 }, (_, index) => (months.has(index + 1) ? 1 : 0));
}

function peakMonths(array) {
  const max = Math.max(...array);
  return array
    .map((value, index) => (value === max ? index + 1 : null))
    .filter(Boolean);
}

// --- Aggregation --------------------------------------------------------------
// From per-state raw counts, build the region-keyed curve object for one
// species: sum member-state counts per Köppen group, THEN relative-normalize;
// drop groups below the sparse floor (logged by the caller). `national` always
// present (real curve, or harvest-months fallback when no annotation signal).
function aggregateSpecies(species, stateCounts, nationalCounts, regions, sparseLog) {
  const groupToStates = {};
  for (const [stateName, group] of Object.entries(regions.states)) {
    (groupToStates[group] ||= []).push(stateName);
  }
  const out = {};
  const nationalTotal = total(nationalCounts);
  out.national = nationalTotal > 0 ? relativeArray(nationalCounts) : monthsFallbackArray(species);

  for (const group of Object.keys(regions.groups)) {
    const members = groupToStates[group] || [];
    let summed = Array(12).fill(0);
    for (const stateName of members) {
      const counts = stateCounts[stateName];
      if (counts) summed = sumCounts(summed, counts);
    }
    const groupTotal = total(summed);
    if (groupTotal < SPARSE_FLOOR) {
      sparseLog.push({ mode: species.__mode, species: species.id, group, total: groupTotal, floor: SPARSE_FLOOR });
      continue;
    }
    out[group] = relativeArray(summed);
  }
  return out;
}

// --- Build --------------------------------------------------------------------
async function buildPhenology() {
  const catalogs = await readCatalogs();
  const regions = await readRegions();
  await mkdir(OUTPUT_DIR, { recursive: true });

  const stateIds = await resolveStatePlaceIds(regions);
  const stateNames = Object.keys(regions.states);

  const sparseLog = [];
  let totalRequests = 0;
  const requestBudget = MODES.reduce((sum, mode) => sum + catalogs[mode].length, 0) * (stateNames.length + 1);
  console.log(`Fetching per-state histograms: ~${requestBudget} requests across ${MODES.length} modes.`);

  for (const mode of MODES) {
    // .partial-<mode>.json holds raw per-state + national COUNTS keyed by species
    // id, so a crash/429 resumes: we skip any (species) cell already present.
    const partialPath = path.join(OUTPUT_DIR, `.partial-${mode}.json`);
    const partial = await readJSONOr(partialPath, {});
    const speciesList = catalogs[mode];
    let done = 0;

    for (const species of speciesList) {
      done += 1;
      if (partial[species.id]) {
        console.log(`[${mode} ${done}/${speciesList.length}] ${species.id}: cached (resume)`);
        continue;
      }
      const annotation = getAnnotationForSpecies(mode, species);
      const stateCounts = {};
      for (const stateName of stateNames) {
        const placeId = stateIds[stateName];
        const counts = await fetchHistogramCounts(species, annotation, placeId, `${mode}/${species.id}@${stateName}`);
        stateCounts[stateName] = counts;
        totalRequests += 1;
        await sleep(REQUEST_DELAY_MS);
      }
      const nationalCounts = await fetchHistogramCounts(species, annotation, NATIONAL_PLACE_ID, `${mode}/${species.id}@national`);
      totalRequests += 1;
      await sleep(REQUEST_DELAY_MS);

      partial[species.id] = { states: stateCounts, national: nationalCounts };
      // Persist after EVERY species so a mid-run failure resumes here.
      await writeJSONAtomic(partialPath, partial);
      const stateObsTotal = Object.values(stateCounts).reduce((sum, c) => sum + total(c), 0);
      console.log(`[${mode} ${done}/${speciesList.length}] ${species.id}: national=${total(nationalCounts)} states=${stateObsTotal} (req ${totalRequests}/${requestBudget})`);
    }

    // Aggregate this mode from the (now complete) partial counts.
    const modeData = {};
    for (const species of speciesList) {
      species.__mode = mode;
      const cell = partial[species.id];
      modeData[species.id] = aggregateSpecies(species, cell.states, cell.national, regions, sparseLog);
      delete species.__mode;
    }
    await writeJSONAtomic(path.join(OUTPUT_DIR, `${mode}.json`), modeData);
    console.log(`Wrote ${mode}.json (${Object.keys(modeData).length} species)`);
  }

  await writeJSONAtomic(SPARSE_REPORT_PATH, {
    floor: SPARSE_FLOOR,
    generated: new Date().toISOString(),
    droppedCells: sparseLog.length,
    cells: sparseLog
  });
  console.log(`Dropped ${sparseLog.length} sparse species×region cells (see .sparse-report.json)`);
}

// --- Verify -------------------------------------------------------------------
function assertRegionKeyedData(catalogs, regions, dataByMode) {
  const validGroups = new Set(Object.keys(regions.groups));
  for (const mode of MODES) {
    const data = dataByMode[mode];
    const expectedIds = new Set(catalogs[mode].map((species) => species.id));
    const actualIds = new Set(Object.keys(data));
    expectedIds.forEach((id) => {
      if (!actualIds.has(id)) throw new Error(`${mode} phenology missing ${id}`);
    });
    actualIds.forEach((id) => {
      if (!expectedIds.has(id)) throw new Error(`${mode} phenology has unexpected species ${id}`);
      const entry = data[id];
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`${mode}.${id} must be a region-keyed object`);
      }
      if (!Array.isArray(entry.national)) {
        throw new Error(`${mode}.${id} missing required national curve`);
      }
      for (const [region, array] of Object.entries(entry)) {
        if (region !== "national" && !validGroups.has(region)) {
          throw new Error(`${mode}.${id} has region "${region}" not in phenology-regions.json groups`);
        }
        if (!Array.isArray(array) || array.length !== 12) {
          throw new Error(`${mode}.${id}.${region} must be a 12-month array`);
        }
        const sum = array.reduce((totalSum, value) => {
          if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new Error(`${mode}.${id}.${region} has invalid relative value ${value}`);
          }
          return totalSum + value;
        }, 0);
        if (region === "national" && sum <= 0) {
          throw new Error(`${mode}.${id}.national has no phenology signal`);
        }
      }
    });
  }

  const elderberryPeaks = peakMonths(dataByMode.food.elderberry.national);
  if (!elderberryPeaks.some((month) => [7, 8, 9].includes(month))) {
    throw new Error(`elderberry (national) should peak in berry season; got months ${elderberryPeaks.join(", ")}`);
  }
  const walnutPeaks = peakMonths(dataByMode.food["black-walnut"].national);
  if (!walnutPeaks.some((month) => [9, 10, 11].includes(month))) {
    throw new Error(`black walnut (national) should peak in nut season; got months ${walnutPeaks.join(", ")}`);
  }
}

async function verifyPhenology() {
  const catalogs = await readCatalogs();
  const regions = await readRegions();
  const dataByMode = {};
  for (const mode of MODES) {
    dataByMode[mode] = JSON.parse(await readFile(path.join(OUTPUT_DIR, `${mode}.json`), "utf8"));
  }
  assertRegionKeyedData(catalogs, regions, dataByMode);
  const summary = MODES.map((mode) => {
    const entries = Object.values(dataByMode[mode]);
    const regionCells = entries.reduce((sum, entry) => sum + (Object.keys(entry).length - 1), 0);
    return `${mode}: ${entries.length} species / ${regionCells} region curves`;
  }).join("; ");
  console.log(`Verified region-keyed phenology — ${summary}`);
  console.log(`Sanity peaks (national): elderberry ${peakMonths(dataByMode.food.elderberry.national).join(", ")}; black-walnut ${peakMonths(dataByMode.food["black-walnut"].national).join(", ")}`);
}

async function resolvePlacesOnly() {
  const regions = await readRegions();
  await mkdir(OUTPUT_DIR, { recursive: true });
  await resolveStatePlaceIds(regions);
}

if (args.has("--verify")) {
  await verifyPhenology();
} else if (args.has("--resolve-places")) {
  await resolvePlacesOnly();
} else {
  await buildPhenology();
  await verifyPhenology();
}
