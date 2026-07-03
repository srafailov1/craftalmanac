#!/usr/bin/env node
// Headless regression harness for the aggregate<->points zoom-handoff state
// machine (Phase 4.8; KNOWN_ISSUES item 1 / 1a). The handoff is the codebase's
// proven weak point (five successive fixes: f42dfff, f35c6cb, 5684f68, 87a094c,
// 151b6d5) and its only verification standard today is the owner manually
// wheel/pinch-zooming over Charlottesville and NYC.
//
// STRATEGY: (a) extract — not (b) port. The real transition functions
// (shouldShowPointLayers, updateLayerHandoff, the aggregate-bridge trio,
// isViewportCoveredByLoadedPoints, setINaturalistAggregateReady,
// shouldDeferAggregatePaint, updateMarkerPointVisibility) are sliced verbatim
// out of app.js and executed in a vm context against a stub `map`/`state`/
// `window`/`performance`. This keeps the test bound to the shipping code — it
// cannot silently drift, and it exercises the actual predicate logic rather
// than a paraphrase of it. Extraction is clean here because these functions
// only touch a small, easily-stubbed surface (map camera/layer methods, the
// mutable `state` object, timers). We re-implement ONLY the tiny orchestration
// that lives inline in the app's `map.on("zoom")` / `map.on("moveend")`
// handlers and in loadMapData's completion block (there is no standalone
// function to extract for those), and we assert below that the source lines
// we're mirroring still exist in app.js so that port can't drift either.
//
// Node-only. No mapbox-gl dependency. Fast. Exits non-zero on the first failed
// invariant, naming the sequence and the invariant.
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");

// ---------------------------------------------------------------------------
// Source extraction (delimiter matcher mirrors scripts/test_safety_tags.mjs:
// skips strings, template literals, and // and /* */ comments so braces inside
// them don't unbalance the depth counter).
// ---------------------------------------------------------------------------
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
  if (!closeChar) {
    // Scalar const (number/string). Read to end of statement.
    const semi = source.indexOf(";", equals);
    return source.slice(equals + 1, semi).trim();
  }
  const end = findMatchingDelimiter(source, expressionStart, openChar, closeChar);
  if (end < 0) throw new Error(`Could not parse const ${name}`);
  return source.slice(expressionStart, end + 1);
}

// Pull a whole `function name(...) { ... }` declaration verbatim.
function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Could not find function ${name}`);
  const braceStart = source.indexOf("{", source.indexOf(")", start));
  if (braceStart < 0) throw new Error(`Could not find body of function ${name}`);
  const braceEnd = findMatchingDelimiter(source, braceStart, "{", "}");
  if (braceEnd < 0) throw new Error(`Could not parse function ${name}`);
  return source.slice(start, braceEnd + 1);
}

const appSource = await readFile(APP_PATH, "utf8");

// ---------------------------------------------------------------------------
// Drift guard for the small inline orchestration we mirror (not extractable —
// it lives inside anonymous map.on(...) callbacks and loadMapData). If any of
// these load-bearing source fragments disappears or is reworded, this test
// must be revisited rather than silently passing against stale assumptions.
// ---------------------------------------------------------------------------
const DRIFT_ANCHORS = [
  // zoom handler: upward clear of pointDataReady when the new area isn't covered
  "if (!belowPointZoom && state.wasBelowPointZoom && !isViewportCoveredByLoadedPoints()) {",
  "state.pointDataReady = false;",
  // zoom handler: downward crossing arms the bridge + gate + aggregate load
  "if (belowPointZoom && !state.wasBelowPointZoom) {",
  "setINaturalistAggregateReady(false);",
  "beginAggregateBridge();",
  // loadMapData completion: only a point-band-started load promotes point data
  "&& loadZoom >= FALLING_FRUIT_MIN_LOAD_ZOOM",
  "state.pointDataReady = true;",
  // moveend re-paints aggregates + refreshes point visibility (pan path)
  "updateFallingFruitAggregates();",
  "updateMarkerPointVisibility();"
];
for (const anchor of DRIFT_ANCHORS) {
  if (!appSource.includes(anchor)) {
    console.error("FAIL: drift guard — app.js no longer contains the mirrored orchestration line:");
    console.error(`  ${anchor}`);
    console.error("The ported zoom/moveend/loadMapData logic in this harness may be stale. Revisit before trusting it.");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Build the vm context: stub globals + stub map/state, then eval the extracted
// real functions into it so they close over our stubs.
// ---------------------------------------------------------------------------
const SCALAR_CONSTS = [
  "AGGREGATE_FIRST_PAINT_GRACE_MS",
  "AGGREGATE_BRIDGE_MAX_MS",
  "MARKER_CLUSTER_BRIDGE_MIN_ZOOM",
  "MARKER_POINT_COVERAGE_TOLERANCE",
  "FALLING_FRUIT_MIN_LOAD_ZOOM",
  "MINERAL_MARKER_MIN_ZOOM",
  "MARKERS_LAYER_ID",
  "MARKER_HALO_LAYER_ID",
  "MARKER_CLUSTERS_LAYER_ID",
  "MARKER_CLUSTER_COUNT_LAYER_ID",
  "FALLING_FRUIT_AGGREGATE_LAYER_ID",
  "FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID"
];

const EXTRACTED_FUNCTIONS = [
  "shouldShowPointLayers",
  "applyMarkerZoomRangeForMode",
  "updateLayerHandoff",
  "beginAggregateBridge",
  "cancelAggregateBridge",
  "settleAggregateBridgeAfterPaint",
  "setLayerVisibility",
  "isViewportCoveredByLoadedPoints",
  "updateMarkerPointVisibility",
  "updateMarkerHalo",
  "setINaturalistAggregateReady",
  "shouldDeferAggregatePaint"
];

// The layer ids the handoff touches, used by the stub map to model visibility.
const LAYER_IDS = [
  "forage-record-points",
  "forage-record-halo",
  "forage-record-clusters",
  "forage-record-cluster-count",
  "falling-fruit-aggregate-circles",
  "falling-fruit-aggregate-counts"
];
const AGGREGATE_LAYERS = ["falling-fruit-aggregate-circles", "falling-fruit-aggregate-counts"];
const MARKER_LAYERS = [
  "forage-record-points",
  "forage-record-clusters",
  "forage-record-cluster-count"
];

// ---------------------------------------------------------------------------
// Harness: a fresh world (map + state + timers) per sequence.
// ---------------------------------------------------------------------------
function makeWorld({ loadMinerals = false } = {}) {
  // Deterministic virtual clock so timers and performance.now() are scriptable.
  let now = 0;
  const timers = new Map();
  let timerId = 1;

  // Camera / layer model.
  const cam = {
    zoom: 4,
    bounds: makeBounds(-80, 37, -78, 39),
    zooming: false
  };
  const layerVisibility = new Map(LAYER_IDS.map((id) => [id, "visible"]));
  const layerZoomRange = new Map();
  const onceHandlers = new Map(); // event -> [fn]

  const map = {
    getZoom: () => cam.zoom,
    getBounds: () => cam.bounds,
    isZooming: () => cam.zooming,
    getLayer: (id) => (LAYER_IDS.includes(id) ? { id } : undefined),
    getSource: () => ({ setData() {} }),
    getLayoutProperty: (id, prop) => (prop === "visibility" ? layerVisibility.get(id) : undefined),
    setLayoutProperty: (id, prop, value) => {
      if (prop === "visibility") layerVisibility.set(id, value);
    },
    setLayerZoomRange: (id, min, max) => { layerZoomRange.set(id, [min, max]); },
    setPaintProperty: () => {},
    once: (event, fn) => {
      const list = onceHandlers.get(event) || [];
      list.push(fn);
      onceHandlers.set(event, list);
    }
  };

  const state = {
    mapReady: true,
    records: [],
    pointDataReady: false,
    loadedPointBounds: null,
    wasBelowPointZoom: true,
    lastShowPoints: false,
    aggregateBridgeActive: false,
    aggregateBridgeId: 0,
    aggregateBridgeTimer: null,
    aggregateTimer: null,
    aggregateGateTimer: null,
    aggregateGateStart: null,
    inatAggregateReady: false,
    savedLocationsOnly: false
  };

  const windowStub = {
    setTimeout: (fn, ms = 0) => {
      const id = timerId++;
      timers.set(id, { fn, at: now + ms });
      return id;
    },
    clearTimeout: (id) => { timers.delete(id); },
    FORAGE_CONFIG: {}
  };

  const performanceStub = { now: () => now };

  const sandbox = {
    map,
    state,
    window: windowStub,
    performance: performanceStub,
    // getActiveMapConfig is the only app dependency the extracted functions
    // reach outside the state/map surface; stub the single field they read.
    getActiveMapConfig: () => ({ loadMinerals }),
    isNightish: () => false,
    console
  };

  vm.createContext(sandbox);
  for (const name of SCALAR_CONSTS) {
    if (name === "MINERAL_MARKER_MIN_ZOOM") {
      // Declared next to applyMarkerZoomRangeForMode, not at the top block.
      vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, sandbox, { filename: APP_PATH });
      continue;
    }
    vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, sandbox, { filename: APP_PATH });
  }
  for (const name of EXTRACTED_FUNCTIONS) {
    vm.runInContext(extractFunction(appSource, name), sandbox, { filename: APP_PATH });
  }

  // Test-controlled clock: advance virtual time, firing due timers in order.
  function tick(ms) {
    const target = now + ms;
    while (true) {
      let soonest = null;
      for (const [id, t] of timers) {
        if (t.at <= target && (soonest === null || t.at < soonest.at || (t.at === soonest.at && id < soonest.id))) {
          soonest = { id, at: t.at, fn: t.fn };
        }
      }
      if (!soonest) break;
      now = soonest.at;
      timers.delete(soonest.id);
      soonest.fn();
    }
    now = target;
  }

  // Fire a Mapbox "idle" (used by settleAggregateBridgeAfterPaint's once).
  function fireIdle() {
    const list = onceHandlers.get("idle") || [];
    onceHandlers.set("idle", []);
    for (const fn of list) fn();
  }

  return {
    map, state, sandbox, cam, layerVisibility, layerZoomRange, timers, onceHandlers,
    tick, fireIdle,
    getNow: () => now,
    call: (name, ...args) => sandbox[name](...args)
  };
}

function makeBounds(west, south, east, north) {
  return {
    getWest: () => west,
    getEast: () => east,
    getSouth: () => south,
    getNorth: () => north,
    west, south, east, north
  };
}

// ---------------------------------------------------------------------------
// Orchestration mirrors of the inline map.on(...) / loadMapData logic. These
// are the ONLY ported (not extracted) pieces; the DRIFT_ANCHORS above assert
// their source counterparts still exist in app.js. Each mirror calls the
// REAL extracted functions for every predicate/transition it can.
// ---------------------------------------------------------------------------

// map.on("zoom") handler (app.js ~6679-6697).
function zoomTo(w, zoom) {
  const { state, cam } = w;
  cam.zoom = zoom;
  const belowPointZoom = zoom < w.sandbox.FALLING_FRUIT_MIN_LOAD_ZOOM;
  if (!belowPointZoom && state.wasBelowPointZoom && !w.call("isViewportCoveredByLoadedPoints")) {
    state.pointDataReady = false;
  }
  if (belowPointZoom && !state.wasBelowPointZoom) {
    w.call("setINaturalistAggregateReady", false);
    w.call("beginAggregateBridge");
    // scheduleINaturalistAggregateLoad() is a network fetch; its terminal
    // effect on this machine is a later setINaturalistAggregateReady(true) +
    // updateFallingFruitAggregates(), which the test drives explicitly via
    // completeAggregateLoad().
  }
  state.wasBelowPointZoom = belowPointZoom;
  w.call("updateLayerHandoff");
}

// map.on("moveend") pan path (app.js ~6699-6707): repaint aggregates + refresh
// point visibility. Below the point band updateFallingFruitAggregates may
// settle the bridge; here we model only the visibility refresh, which is the
// part that could blank points on a pan.
function pan(w, west, south, east, north) {
  w.cam.bounds = makeBounds(west, south, east, north);
  w.call("updateMarkerPointVisibility");
  w.call("updateLayerHandoff");
}

// loadMapData completion in the point band (app.js ~8719-8730): a load that
// STARTED and FINISHED at point zoom promotes the point data and hands off.
function completePointLoad(w, loadBounds, loadZoom, recordCount = 200) {
  const { state, sandbox } = w;
  state.records = new Array(recordCount).fill(0);
  if (loadZoom >= sandbox.FALLING_FRUIT_MIN_LOAD_ZOOM
    && w.cam.zoom >= sandbox.FALLING_FRUIT_MIN_LOAD_ZOOM) {
    state.pointDataReady = true;
    state.loadedPointBounds = {
      west: loadBounds.getWest(),
      south: loadBounds.getSouth(),
      east: loadBounds.getEast(),
      north: loadBounds.getNorth()
    };
    w.call("updateLayerHandoff");
  }
}

// loadINaturalistAggregates terminal effect below the point band (app.js
// ~8620-8630): the tile set landed, mark ready + repaint. updateFallingFruit-
// Aggregates then calls settleAggregateBridgeAfterPaint(); we run that + the
// idle flip it schedules.
function completeAggregateLoad(w) {
  w.call("setINaturalistAggregateReady", true);
  w.call("settleAggregateBridgeAfterPaint");
  w.fireIdle();
}

// ---------------------------------------------------------------------------
// Invariants.
// ---------------------------------------------------------------------------
function anyVisible(w, ids) {
  return ids.some((id) => w.layerVisibility.get(id) === "visible");
}

// Invariant A: never a fully-blank state (every marker AND every aggregate
// layer hidden) while data for the viewport exists. "data for the viewport
// exists" = records are loaded (point path) OR we are below the point band
// where aggregates are the data source. i.e. some visible layer must cover the
// viewport's data. (KNOWN_ISSUES item 1 / 1a step 4.)
function assertNotBlank(w, seq, step) {
  const markerVisible = anyVisible(w, MARKER_LAYERS);
  const aggregateVisible = anyVisible(w, AGGREGATE_LAYERS);
  const belowBand = w.cam.zoom < w.sandbox.FALLING_FRUIT_MIN_LOAD_ZOOM;
  const dataExists = w.state.records.length > 0 || belowBand;
  if (dataExists && !markerVisible && !aggregateVisible) {
    fail(seq, "no-blank-while-data-exists",
      `${step}: every marker AND aggregate layer hidden at zoom ${w.cam.zoom} `
      + `(records=${w.state.records.length}, pointDataReady=${w.state.pointDataReady}, `
      + `bridgeActive=${w.state.aggregateBridgeActive})`);
  }
}

// Invariant B: exactly the "showPoints || bridging ? markers : aggregates"
// contract holds — the two families are never both on (double-paint) and,
// combined with A, never both off. This catches a handoff that flips one side
// without the other.
function assertNoDoublePaint(w, seq, step) {
  const markerVisible = anyVisible(w, MARKER_LAYERS.filter((id) => id !== "forage-record-points"));
  const aggregateVisible = anyVisible(w, AGGREGATE_LAYERS);
  // Individual points (forage-record-points) legitimately coexist with nothing
  // else here; clusters vs aggregates are the mutually-exclusive pair.
  if (markerVisible && aggregateVisible) {
    fail(seq, "no-double-paint",
      `${step}: cluster layers AND aggregate layers both visible at zoom ${w.cam.zoom} `
      + `(showPoints=${w.state.lastShowPoints}, bridgeActive=${w.state.aggregateBridgeActive})`);
  }
}

// Invariant C: the aggregate bridge always terminates — it never stays active
// with no pending timer AND no pending idle settle. Checked at end-of-sequence
// after the clock has been advanced past AGGREGATE_BRIDGE_MAX_MS.
function assertBridgeTerminates(w, seq) {
  if (w.state.aggregateBridgeActive) {
    fail(seq, "bridge-terminates",
      `bridge still active after clock advanced past AGGREGATE_BRIDGE_MAX_MS `
      + `(timer=${w.state.aggregateBridgeTimer}, bridgeId=${w.state.aggregateBridgeId})`);
  }
}

// ---------------------------------------------------------------------------
// Reporting.
// ---------------------------------------------------------------------------
const failures = [];
const pending = [];
function fail(seq, invariant, detail) {
  failures.push({ seq, invariant, detail });
  throw new FailSignal();
}
class FailSignal extends Error {}

function runSequence(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    if (err instanceof FailSignal) return; // recorded in failures[]
    throw err;
  }
}

// Convenience: assert both blanking invariants at a step.
function check(w, seq, step) {
  assertNotBlank(w, seq, step);
  assertNoDoublePaint(w, seq, step);
}

// ---------------------------------------------------------------------------
// Sequences.
// ---------------------------------------------------------------------------

// 1. Zoom-in crossing FALLING_FRUIT_MIN_LOAD_ZOOM: aggregate -> gate -> points.
runSequence("zoom-in-cross (aggregate -> gate -> points)", () => {
  const seq = "zoom-in-cross";
  const w = makeWorld();
  // Start below the band with aggregates ready and painted.
  w.call("setINaturalistAggregateReady", true);
  zoomTo(w, 5);
  check(w, seq, "start below band");
  // Cross up into the point band. Point data has NOT loaded yet — the gate.
  zoomTo(w, 8.5);
  // During the gate (points not ready, no bridge), aggregates must still cover
  // the (now-empty-of-records) view so the map isn't blank. records=0 here so
  // dataExists is false above the band; the real guarantee is that when the
  // load lands the swap is clean. Verify the interim isn't a double-paint.
  assertNoDoublePaint(w, seq, "gate: points loading");
  // Load lands for this viewport.
  completePointLoad(w, w.cam.bounds, 8.5);
  check(w, seq, "after point load");
  if (!anyVisible(w, MARKER_LAYERS)) {
    fail(seq, "points-shown-after-load", "clusters not visible after point-band load completed");
  }
  if (anyVisible(w, AGGREGATE_LAYERS)) {
    fail(seq, "aggregates-hidden-after-load", "aggregate layers still visible after point handoff");
  }
  w.tick(5000);
  assertBridgeTerminates(w, seq);
});

// 2. Zoom-out crossing: points -> bridge -> aggregate paint -> settle.
runSequence("zoom-out-cross (points -> bridge -> aggregate -> settle)", () => {
  const seq = "zoom-out-cross";
  const w = makeWorld();
  // Establish loaded points at zoom 9.
  zoomTo(w, 9);
  completePointLoad(w, w.cam.bounds, 9);
  check(w, seq, "points established");
  // Zoom out below the band. The downward crossing arms the bridge: clusters
  // stay up (records loaded) until a fresh aggregate paint lands.
  zoomTo(w, 7);
  if (!w.state.aggregateBridgeActive) {
    fail(seq, "bridge-armed-on-downcross", "bridge not active immediately after downward crossing");
  }
  check(w, seq, "during bridge");
  if (!anyVisible(w, MARKER_LAYERS)) {
    fail(seq, "clusters-held-during-bridge",
      "clusters hidden during downward bridge (the sparse-empty-edges state)");
  }
  // The aggregate tiles land; the bridge settles on the next idle.
  completeAggregateLoad(w);
  check(w, seq, "after aggregate settle");
  if (w.state.aggregateBridgeActive) {
    fail(seq, "bridge-settled", "bridge still active after aggregate paint + idle");
  }
  if (!anyVisible(w, AGGREGATE_LAYERS)) {
    fail(seq, "aggregates-shown-after-settle", "aggregate layers not visible after bridge settle");
  }
  w.tick(5000);
  assertBridgeTerminates(w, seq);
});

// 3. Pan while at point zoom: points must NOT blank to aggregate.
runSequence("pan-at-point-zoom (points must not blank)", () => {
  const seq = "pan-at-point-zoom";
  const w = makeWorld();
  zoomTo(w, 9);
  const loaded = makeBounds(-80, 37, -78, 39);
  w.cam.bounds = loaded;
  completePointLoad(w, loaded, 9);
  check(w, seq, "points loaded");
  if (!anyVisible(w, MARKER_LAYERS)) {
    fail(seq, "points-shown", "clusters not visible at point zoom after load");
  }
  // Pan partly out of the loaded extent but within tolerance (0.5 of extent).
  pan(w, -79.5, 37.5, -77.5, 39.5);
  check(w, seq, "small pan within tolerance");
  if (!anyVisible(w, MARKER_LAYERS)) {
    fail(seq, "points-vanish-on-pan",
      "clusters blanked on ordinary pan at point zoom (the 'points vanish when I pan' regression)");
  }
  if (anyVisible(w, AGGREGATE_LAYERS)) {
    fail(seq, "no-aggregate-flash-on-pan",
      "aggregate layers flashed on during a pan at point zoom");
  }
  // Pan far past the loaded extent (still at point zoom, no re-cross of the
  // band). shouldShowPointLayers no longer gates on coverage at point zoom, so
  // points STAY up (data refreshes underneath); the map must not blank.
  pan(w, -60, 30, -50, 40);
  check(w, seq, "large pan, still point zoom");
  if (!anyVisible(w, MARKER_LAYERS)) {
    fail(seq, "points-vanish-on-far-pan",
      "clusters blanked on a far pan at point zoom (no band re-cross occurred)");
  }
  w.tick(5000);
  assertBridgeTerminates(w, seq);
});

// 4. Rapid wheel reversals mid-bridge (down/up/down/up across the band).
runSequence("rapid-wheel-reversals (mid-bridge)", () => {
  const seq = "rapid-wheel-reversals";
  const w = makeWorld();
  zoomTo(w, 9);
  const loaded = makeBounds(-80, 37, -78, 39);
  w.cam.bounds = loaded;
  completePointLoad(w, loaded, 9);
  check(w, seq, "points loaded");
  // Flurry of crossings without letting loads or timers complete.
  const zooms = [7, 8.5, 6.5, 8.2, 7.4, 9.1, 7.8];
  zooms.forEach((z, i) => {
    zoomTo(w, z);
    check(w, seq, `reversal ${i} -> zoom ${z}`);
  });
  // End below the band with the bridge possibly active; let the aggregate land.
  zoomTo(w, 6);
  check(w, seq, "settled below band");
  completeAggregateLoad(w);
  check(w, seq, "aggregate landed");
  // Advance well past the safety-valve timeout; the bridge must terminate no
  // matter how the reversals interleaved with the id-versioned settle.
  w.tick(AGG_BRIDGE_MAX_MS(w) + 1000);
  assertBridgeTerminates(w, seq);
});

// 5. Load-completion racing the bridge timer.
//    (a) load lands just before the timer  (b) timer fires before any load.
runSequence("load-races-timer (settle wins)", () => {
  const seq = "load-races-timer-settle";
  const w = makeWorld();
  zoomTo(w, 9);
  const loaded = makeBounds(-80, 37, -78, 39);
  w.cam.bounds = loaded;
  completePointLoad(w, loaded, 9);
  // Down-cross arms the bridge + its AGGREGATE_BRIDGE_MAX_MS timer.
  zoomTo(w, 7);
  check(w, seq, "bridge armed");
  // Advance almost to the timeout, then land the aggregate: settle should win.
  w.tick(AGG_BRIDGE_MAX_MS(w) - 100);
  check(w, seq, "just before timeout");
  completeAggregateLoad(w);
  check(w, seq, "aggregate settled before timeout");
  if (w.state.aggregateBridgeActive) {
    fail(seq, "settle-wins", "bridge still active after settle landed before timeout");
  }
  // Now let the original timer fire — it must be a no-op (already cancelled).
  const aggVisibleBefore = anyVisible(w, AGGREGATE_LAYERS);
  w.tick(1000);
  check(w, seq, "after stale timer fires");
  if (anyVisible(w, AGGREGATE_LAYERS) !== aggVisibleBefore) {
    fail(seq, "stale-timer-noop", "stale bridge timer changed layer state after settle");
  }
  assertBridgeTerminates(w, seq);
});

runSequence("load-races-timer (timer wins, no load)", () => {
  const seq = "load-races-timer-timeout";
  const w = makeWorld();
  zoomTo(w, 9);
  const loaded = makeBounds(-80, 37, -78, 39);
  w.cam.bounds = loaded;
  completePointLoad(w, loaded, 9);
  zoomTo(w, 7);
  check(w, seq, "bridge armed");
  // Aggregate load never completes (e.g. tile fetch hung). The safety-valve
  // timer must still terminate the bridge and hand off to aggregates.
  w.tick(AGG_BRIDGE_MAX_MS(w) + 50);
  check(w, seq, "after safety-valve timeout");
  if (w.state.aggregateBridgeActive) {
    fail(seq, "timer-terminates", "safety-valve timer did not terminate a never-completing bridge");
  }
  assertBridgeTerminates(w, seq);
});

// 6. Extra: a load that STARTED below the band and finishes after crossing up
//    must NOT promote point data (the 87a094c fix). This guards against sparse
//    iNat-only clusters flashing in on the upward crossing.
runSequence("stale-below-band-load (must not promote)", () => {
  const seq = "stale-below-band-load";
  const w = makeWorld();
  zoomTo(w, 6);
  w.call("setINaturalistAggregateReady", true);
  // A load kicked off at zoom 6 (loadZoom below the band). User crosses up.
  zoomTo(w, 8.5);
  // The stale load finishes now, but loadZoom (6) was below the band.
  completePointLoad(w, w.cam.bounds, 6, 40);
  if (w.state.pointDataReady) {
    fail(seq, "stale-load-no-promote",
      "a below-band-started load promoted pointDataReady after crossing up (87a094c regression)");
  }
  assertNoDoublePaint(w, seq, "after stale load");
  w.tick(5000);
  assertBridgeTerminates(w, seq);
});

function AGG_BRIDGE_MAX_MS(w) {
  return w.sandbox.AGGREGATE_BRIDGE_MAX_MS;
}

// ---------------------------------------------------------------------------
// Result.
// ---------------------------------------------------------------------------
if (pending.length) {
  console.log("\nPending (documented current behavior — see KNOWN_ISSUES):");
  for (const p of pending) console.log(`  XFAIL ${p.seq}: ${p.detail}`);
}

if (failures.length) {
  console.error(`\nFAIL: ${failures.length} zoom-handoff invariant(s) violated:`);
  for (const f of failures) {
    console.error(`  [${f.seq}] invariant "${f.invariant}"`);
    console.error(`     ${f.detail}`);
  }
  process.exit(1);
}

console.log("\nPASS: zoom-handoff state machine holds all invariants across every scripted sequence.");
