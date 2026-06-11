# Known Issues — Debug Queue

Issues queued for the daily tune-up pass. Investigate, fix, and remove entries
once verified on the live site. Keep this file current: future debugging
sessions rely on it for context.

## 1. Sparse-counts flash during zoom transitions around zoom 8 (OPEN)

**Symptom:** Zooming through the aggregate/cluster handoff band (viewport
roughly 100–200 miles wide, zoom ~7–9), the map briefly shows far fewer
points than it should — small circles with low counts (often 1s and 2s, or
iNaturalist-only cluster counts like "3" where "127" is correct). It
self-corrects within ~1–2 seconds. Reproduces in both zoom directions and
survives several attempted fixes. Reproduce by zooming continuously in/out
over Charlottesville, VA (dense Falling Fruit + iNaturalist area).

**Architecture context:** Below zoom 8 the map shows aggregate circles
(Falling Fruit manifest counts + iNaturalist UTFGrid cell counts). At zoom >= 8
it shows cluster/point layers fed by `loadMapData()` (iNaturalist records +
Falling Fruit chunk files). `updateLayerHandoff()` swaps layer visibility based
on `state.pointDataReady`; `setINaturalistAggregateReady()` +
`shouldDeferAggregatePaint()` gate aggregate repaints until grid tiles arrive.

**Fixes already applied (all helped, none fully resolved):**
- `f42dfff` — atomic swap of iNat grid counts (fixed west-to-east sweep)
- `f35c6cb` — merged FF chunks 0.05° -> 0.15° (fixed total dropout over metros;
  the per-viewport chunk cap of 160 no longer triggers in tested cities)
- `5684f68` — handoff bridge: aggregates stay visible at zoom >= 8 until point
  data for the viewport finishes loading
- `87a094c` — bridge only ends when the data load both STARTED and finished at
  point zoom (fixed stale below-8 loads ending the bridge with iNat-only records)
- `151b6d5` — paint gate re-arms on downward crossings and while grid tiles are
  in flight; removed the one-count per-record fallback items

**Leading remaining hypothesis (untested):** the downward crossing flips
visibility to the aggregate layers instantly, but the aggregate *source* still
contains data last painted for a different viewport/zoom (possibly stale or
sparse for the current view). The gate prevents repaints but cannot make stale
source content correct. Likely fix: make the downward handoff symmetric with
the upward one — keep the CLUSTER layers visible (records are already loaded)
until the aggregate swap for the current viewport completes, then flip. Check
`map.on("zoom")` handler and `updateLayerHandoff()` in `app.js`.

**Other things to check:**
- Whether the flash coincides with the geo/viewport aggregation mode switch at
  zoom 6.4 (`shouldUseViewportAggregateBounds`) — grid tile ids change with
  `Math.floor(zoom)`, so crossing integer zooms invalidates the tile cache key
  set and may trigger a gated refetch where stale-painted content shows.
- GeoJSON `setData` -> tile regeneration is async; a visibility flip in the
  same frame as `setData` can render the old buffer briefly.
- Verify on the live site with Chrome DevTools: throttle network to Fast 4G,
  zoom through Charlottesville, watch which layer paints the sparse state
  (aggregates vs clusters) — that distinguishes stale-source from gate-miss.

**Verification standard:** zoom continuously 6 -> 10 -> 6 over Charlottesville
and over NYC with cold cache (hard reload between directions); counts must
never visibly drop and recover. Test wheel-zoom, double-click zoom, and
pinch-trackpad zoom separately — they produce different event timing.
