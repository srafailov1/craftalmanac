#!/usr/bin/env node

import fs from "fs";
import path from "path";
import vm from "vm";

const ROOT = process.cwd();
const MANIFEST_PATH = "data/falling-fruit/us/manifest.json";
const STATES_PATH = "data/contiguous-us-states.json";
const ACCESS_CACHE_DIR = "data/falling-fruit/us/access-cache";

let hadFailure = false;

function fail(message) {
  hadFailure = true;
  console.log(`FAIL: ${message}`);
}

function readJson(relativePath) {
  const fullPath = path.resolve(ROOT, relativePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    return { __readError: error.message };
  }
}

function exists(relativePath) {
  return fs.existsSync(path.resolve(ROOT, relativePath));
}

function normalizeProjectPath(rawPath) {
  if (typeof rawPath !== "string" || rawPath.length === 0) return null;
  return rawPath.replace(/^\.\//, "");
}

function toCount(value) {
  const count = Number(value || 0);
  return Number.isFinite(count) ? count : 0;
}

function sumObjectValues(object) {
  return Object.values(object || {}).reduce((total, value) => total + toCount(value), 0);
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

function extractFunctionSource(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Could not find function ${name}`);
  const bodyStart = source.indexOf("{", start);
  const end = findMatchingDelimiter(source, bodyStart, "{", "}");
  if (end < 0) throw new Error(`Could not parse function ${name}`);
  return source.slice(start, end + 1);
}

function buildImportContext() {
  const appSource = fs.readFileSync(path.resolve(ROOT, "app.js"), "utf8");
  const context = { state: { activeMap: "food" } };
  vm.createContext(context);
  [
    "INK_FALLING_FRUIT_SPECIES_ALIASES",
    "foodSpeciesCatalog",
    "inkSpeciesCatalog"
  ].forEach((name) => {
    vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, context, { filename: "app.js" });
  });
  vm.runInContext(extractFunctionSource(appSource, "getImportedSpeciesId"), context, { filename: "app.js" });
  return {
    context,
    catalogByMode: {
      food: new Map(context.foodSpeciesCatalog.map((species) => [species.id, species])),
      ink: new Map(context.inkSpeciesCatalog.map((species) => [species.id, species]))
    }
  };
}

function runCheck(label, body) {
  console.log(`${label}...`);
  const failuresBefore = hadFailure;
  try {
    body();
  } catch (error) {
    fail(error.message);
  }
  if (hadFailure === failuresBefore) {
    console.log(`PASS: ${label}`);
  }
  console.log("");
}

function getManifest() {
  const manifest = readJson(MANIFEST_PATH);
  if (manifest?.__readError) {
    fail(`${MANIFEST_PATH} could not be read or parsed: ${manifest.__readError}`);
    return null;
  }
  if (!Array.isArray(manifest.chunks)) {
    fail(`${MANIFEST_PATH} must contain a chunks array`);
    return null;
  }
  return manifest;
}

function getChunkPath(chunk) {
  const chunkPath = normalizeProjectPath(chunk.path);
  if (!chunkPath) {
    fail(`Chunk ${chunk.id || "<missing id>"} is missing a path`);
    return null;
  }
  return chunkPath;
}

function getChunkRows(chunk, cache) {
  if (cache.has(chunk.id)) return cache.get(chunk.id);
  const chunkPath = getChunkPath(chunk);
  if (!chunkPath) return null;
  const rows = readJson(chunkPath);
  if (rows?.__readError) {
    fail(`${chunkPath} could not be read or parsed: ${rows.__readError}`);
    return null;
  }
  cache.set(chunk.id, rows);
  return rows;
}

function expectedCountsForMode(chunk, mode, importContext) {
  const catalog = importContext.catalogByMode[mode];
  const expected = {};
  Object.entries(chunk.countsBySpeciesId || {}).forEach(([sourceSpeciesId, count]) => {
    importContext.context.state.activeMap = mode;
    const modeSpeciesId = importContext.context.getImportedSpeciesId(sourceSpeciesId);
    if (!catalog?.has(modeSpeciesId)) return;
    expected[modeSpeciesId] = (expected[modeSpeciesId] || 0) + toCount(count);
  });
  return expected;
}

const manifest = getManifest();
const chunkRows = new Map();
const chunks = manifest?.chunks || [];

runCheck("Check (a): every manifest chunk path exists and parses", () => {
  chunks.forEach((chunk) => {
    const chunkPath = getChunkPath(chunk);
    if (!chunkPath) return;
    if (!exists(chunkPath)) {
      fail(`Chunk ${chunk.id} path does not exist: ${chunkPath}`);
      return;
    }
    getChunkRows(chunk, chunkRows);
  });
});

runCheck("Check (b): per-chunk row count equals recordCount", () => {
  chunks.forEach((chunk) => {
    const rows = getChunkRows(chunk, chunkRows);
    if (!Array.isArray(rows)) {
      fail(`Chunk ${chunk.id} path did not parse to an array`);
      return;
    }
    if (rows.length !== toCount(chunk.recordCount)) {
      fail(`Chunk ${chunk.id} recordCount is ${chunk.recordCount}, but file has ${rows.length} rows`);
    }
  });
});

runCheck("Check (c): countsBySpeciesId across chunks equals manifest recordCount", () => {
  const total = chunks.reduce((chunkTotal, chunk) => {
    if (!chunk.countsBySpeciesId || typeof chunk.countsBySpeciesId !== "object") {
      fail(`Chunk ${chunk.id} is missing countsBySpeciesId`);
      return chunkTotal;
    }
    return chunkTotal + sumObjectValues(chunk.countsBySpeciesId);
  }, 0);
  if (total !== toCount(manifest?.recordCount)) {
    fail(`Summed countsBySpeciesId total is ${total}, manifest.recordCount is ${manifest?.recordCount}`);
  }
});

runCheck("Check (d): every chunk has matching access-cache rows", () => {
  chunks.forEach((chunk) => {
    const rows = getChunkRows(chunk, chunkRows);
    if (!Array.isArray(rows)) return;
    const cachePath = `${ACCESS_CACHE_DIR}/${chunk.id}.json`;
    if (!exists(cachePath)) {
      fail(`Access cache does not exist for chunk ${chunk.id}: ${cachePath}`);
      return;
    }
    const cacheRows = readJson(cachePath);
    if (cacheRows?.__readError) {
      fail(`${cachePath} could not be read or parsed: ${cacheRows.__readError}`);
      return;
    }
    if (!Array.isArray(cacheRows)) {
      fail(`${cachePath} did not parse to an array`);
      return;
    }
    if (cacheRows.length !== rows.length) {
      fail(`Access cache ${cachePath} has ${cacheRows.length} rows, chunk has ${rows.length}`);
    }
  });
});

runCheck("Check (e): accessCounts per species never exceed chunk species counts", () => {
  const importContext = buildImportContext();
  chunks.forEach((chunk) => {
    Object.entries(chunk.accessCounts || {}).forEach(([mode, byStatus]) => {
      const expected = expectedCountsForMode(chunk, mode, importContext);
      const actual = {};
      Object.entries(byStatus || {}).forEach(([status, bySpecies]) => {
        Object.entries(bySpecies || {}).forEach(([speciesId, count]) => {
          actual[speciesId] = (actual[speciesId] || 0) + toCount(count);
        });
      });
      Object.entries(actual).forEach(([speciesId, count]) => {
        const expectedCount = expected[speciesId] || 0;
        if (count > expectedCount) {
          fail(`Chunk ${chunk.id} ${mode} ${speciesId} access total is ${count}, source count is ${expectedCount}`);
        }
      });
    });
  });
});

// Source species ids that are KNOWN to resolve to no catalog entry: dropped
// from a catalog after the data was baked, kept in the raw chunks as harmless
// orphans until the next full subset regen (see KNOWN_ISSUES.md, 2026-07-03).
// Anything NOT on this list that resolves nowhere fails the check — a fresh
// orphan means a regen or catalog rename shipped records no mode can render.
const GRANDFATHERED_ORPHAN_SPECIES = new Set(["ink-honeysuckle"]);

runCheck("Check (g): every manifest source species resolves to a catalog species in some mode", () => {
  const importContext = buildImportContext();
  const sourceIds = new Set();
  chunks.forEach((chunk) => {
    Object.keys(chunk.countsBySpeciesId || {}).forEach((id) => sourceIds.add(id));
  });
  (manifest?.states || []).forEach((state) => {
    Object.keys(state.countsBySpeciesId || {}).forEach((id) => sourceIds.add(id));
  });
  const orphans = [];
  sourceIds.forEach((sourceSpeciesId) => {
    const resolves = ["food", "ink"].some((mode) => {
      importContext.context.state.activeMap = mode;
      const modeSpeciesId = importContext.context.getImportedSpeciesId(sourceSpeciesId);
      return importContext.catalogByMode[mode]?.has(modeSpeciesId);
    });
    if (!resolves && !GRANDFATHERED_ORPHAN_SPECIES.has(sourceSpeciesId)) {
      orphans.push(sourceSpeciesId);
    }
  });
  orphans.forEach((id) => {
    fail(`Source species ${id} resolves to no catalog entry in any mode (dead records in the baked data)`);
  });
});

runCheck("Check (f): contiguous US states have bbox and Polygon/MultiPolygon geometry", () => {
  const statesData = readJson(STATES_PATH);
  if (statesData?.__readError) {
    fail(`${STATES_PATH} could not be read or parsed: ${statesData.__readError}`);
    return;
  }
  if (!Array.isArray(statesData.states)) {
    fail(`${STATES_PATH} must contain a states array`);
    return;
  }
  if (statesData.states.length !== 49) {
    fail(`${STATES_PATH} should contain 49 states, found ${statesData.states.length}`);
  }
  statesData.states.forEach((state) => {
    const name = state.name || state.code || "<unnamed state>";
    if (!Array.isArray(state.bbox) || state.bbox.length !== 4 || state.bbox.some((value) => !Number.isFinite(Number(value)))) {
      fail(`${name} has missing or invalid bbox`);
    }
    const geometryType = state.geometry?.type;
    if (geometryType !== "Polygon" && geometryType !== "MultiPolygon") {
      fail(`${name} has invalid geometry type: ${geometryType || "<missing>"}`);
    }
  });
});

// ---------------------------------------------------------------------------
// iNaturalist chunk tree (data/inaturalist/us). Validated only when present, so
// the gate stays green before the national bake lands. Mirrors checks (a)-(e)
// but keyed by anchor taxon id resolved per mode through the catalogs'
// inatTaxonIds (see docs/TODO-inaturalist-chunk-bake.md).
const INAT_MANIFEST_PATH = "data/inaturalist/us/manifest.json";
const INAT_ACCESS_CACHE_DIR = "data/inaturalist/us/access-cache";

function buildAnchorMaps() {
  const appSource = fs.readFileSync(path.resolve(ROOT, "app.js"), "utf8");
  const context = {};
  vm.createContext(context);
  ["foodSpeciesCatalog", "inkSpeciesCatalog", "medicineSpeciesCatalog"].forEach((name) => {
    vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, context, { filename: "app.js" });
  });
  const maps = {};
  for (const [mode, cat] of [["food", context.foodSpeciesCatalog], ["ink", context.inkSpeciesCatalog], ["medicine", context.medicineSpeciesCatalog]]) {
    const m = new Map();
    for (const sp of cat) for (const t of sp.inatTaxonIds || []) m.set(Number(t), sp.id);
    maps[mode] = m;
  }
  return maps;
}

if (exists(INAT_MANIFEST_PATH)) {
  const inatManifest = readJson(INAT_MANIFEST_PATH);
  const inatRows = new Map();
  const getInatRows = (chunk) => {
    if (inatRows.has(chunk.id)) return inatRows.get(chunk.id);
    const p = normalizeProjectPath(chunk.path);
    const rows = p ? readJson(p) : null;
    inatRows.set(chunk.id, rows);
    return rows;
  };

  runCheck("iNat (a): every manifest chunk path exists and parses to an array", () => {
    if (inatManifest?.__readError || !Array.isArray(inatManifest.chunks)) {
      fail(`${INAT_MANIFEST_PATH} unreadable or missing chunks array`);
      return;
    }
    inatManifest.chunks.forEach((chunk) => {
      const p = normalizeProjectPath(chunk.path);
      if (!p || !exists(p)) { fail(`iNat chunk ${chunk.id} path missing: ${p}`); return; }
      const rows = getInatRows(chunk);
      if (rows?.__readError || !Array.isArray(rows)) fail(`iNat chunk ${chunk.id} did not parse to an array`);
    });
  });

  runCheck("iNat (b): per-chunk row count equals recordCount", () => {
    (inatManifest.chunks || []).forEach((chunk) => {
      const rows = getInatRows(chunk);
      if (Array.isArray(rows) && rows.length !== toCount(chunk.recordCount)) {
        fail(`iNat chunk ${chunk.id} recordCount ${chunk.recordCount} != file rows ${rows.length}`);
      }
    });
  });

  runCheck("iNat (c): summed countsByAnchor equals manifest.recordCount", () => {
    const total = (inatManifest.chunks || []).reduce((sum, chunk) => {
      if (!chunk.countsByAnchor || typeof chunk.countsByAnchor !== "object") {
        fail(`iNat chunk ${chunk.id} missing countsByAnchor`);
        return sum;
      }
      return sum + sumObjectValues(chunk.countsByAnchor);
    }, 0);
    if (total !== toCount(inatManifest.recordCount)) {
      fail(`iNat summed countsByAnchor ${total} != manifest.recordCount ${inatManifest.recordCount}`);
    }
  });

  runCheck("iNat (d): access-cache rows align (when the cache is present)", () => {
    if (!exists(INAT_ACCESS_CACHE_DIR)) {
      console.log("  (skipped: no iNat access-cache dir)");
      return;
    }
    (inatManifest.chunks || []).forEach((chunk) => {
      const rows = getInatRows(chunk);
      if (!Array.isArray(rows)) return;
      const cachePath = `${INAT_ACCESS_CACHE_DIR}/${chunk.id}.json`;
      if (!exists(cachePath)) { fail(`iNat access cache missing for ${chunk.id}`); return; }
      const cacheRows = readJson(cachePath);
      if (!Array.isArray(cacheRows) || cacheRows.length !== rows.length) {
        fail(`iNat access cache ${cachePath} length != chunk rows`);
      }
    });
  });

  runCheck("iNat (e): every manifest anchor resolves to a catalog species in some mode", () => {
    const maps = buildAnchorMaps();
    const anchors = new Set();
    (inatManifest.chunks || []).forEach((chunk) => Object.keys(chunk.countsByAnchor || {}).forEach((a) => anchors.add(Number(a))));
    anchors.forEach((anchor) => {
      const resolves = ["food", "ink", "medicine"].some((mode) => maps[mode].has(anchor));
      if (!resolves) fail(`iNat anchor ${anchor} resolves to no catalog species in any mode (dead baked records)`);
    });
  });

  runCheck("iNat (f): overview count equals plotted points per mode (acceptance)", () => {
    const maps = buildAnchorMaps();
    const anchorIdx = (inatManifest.recordFields || []).indexOf("anchor");
    if (anchorIdx < 0) { fail("iNat manifest recordFields missing 'anchor'"); return; }
    for (const mode of ["food", "ink", "medicine"]) {
      let overview = 0;
      let plotted = 0;
      (inatManifest.chunks || []).forEach((chunk) => {
        for (const [anchor, n] of Object.entries(chunk.countsByAnchor || {})) {
          if (maps[mode].has(Number(anchor))) overview += toCount(n);
        }
        const rows = getInatRows(chunk);
        if (Array.isArray(rows)) rows.forEach((r) => { if (maps[mode].has(Number(r[anchorIdx]))) plotted += 1; });
      });
      if (overview !== plotted) fail(`iNat ${mode}: overview ${overview} != plotted ${plotted}`);
    }
  });
}

if (hadFailure) {
  console.log("Validation FAILED");
  process.exit(1);
}

console.log("Validation PASSED");
