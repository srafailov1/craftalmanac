# Known Issues — Debug Queue

Issues queued for the daily tune-up pass. Investigate, fix, and remove entries
once verified on the live site. Keep this file current: future debugging
sessions rely on it for context.

## 1. Sparse-counts flash during zoom transitions around zoom 8 (PARTIAL FIX SHIPPED 2026-06-11 evening — see update; plan items 2–4 still open)

**Update 2026-06-11 evening (owner-reported, fixed in interactive session):**
Owner reproduced two related symptoms: (a) with default permissions, overview
circles dissolve into different smaller ones around zoom ~6.5–7 and "revive"
when zooming further; (b) with "Allowed" only, much of the map is empty at low
zoom and circle totals ride up and down with zoom. Three causes found and
fixed (commit "Stabilize aggregate counts across zoom and permission filters"):

1. **Duplicate `getSelectedAccessStatuses` definition** (was at lines 1535 and
   2140) — the second, array-returning copy silently overrode the Set-returning
   one, so `isAccessFilterActive()` compared `undefined !== 5` and returned
   true ALWAYS. Every overview paint took the permission-approximation path
   even with default permissions, and `loadINaturalistAggregates` re-armed the
   paint gate on every pass. Duplicate removed. **Watch for this class of bug:
   `node --check` passes on duplicate function declarations; consider a lint
   pass for duplicate top-level names in the 5am loop.**
2. **Per-bucket centroid status lookups** — iNat overview buckets (0.2°–1.4°)
   were assigned ONE status by looking up their count-weighted centroid in the
   0.05° status raster (82% unknown). Re-bucketing at each integer zoom moved
   centroids into different raster cells, flipping whole buckets in/out of
   filtered views. Now statuses are resolved per response cell at fetch time
   (`getINaturalistGridItems`) and each item carries
   `statusCountsByMode`/`statusCentroidsByMode`; counts and centroids blend
   the selected statuses. Status raster now always loads before tile fetches.
3. **Grid zoom churn** — plan item 1 below is DONE: `gridZoom` snaps to even
   values (2/4/6) in `getINaturalistAggregateTiles`, so the tile-key set is
   stable across continuous zooms (verified: identical tile ids from z6.0
   through z7.5).

**Follow-ups for the 5am loop:**
- Plan items 2 (prefetch/warm gz=2/4), 3 (data-availability-bounded bridge)
  and 4 (instrumentation) below are still open and still worth doing.
- Bucket resolution near the handoff: gz now caps at 6, so buckets are tile/32
  ≈ 0.175° while the display grid at zoom ~7.5–8 is finer (~0.09–0.12°). If
  the band looks chunky, bump bucketing to 64 per tile for gz 6 (watch the
  per-paint item count).
- **Structural limit, flag for owner:** with "Allowed" only at low zoom, iNat
  counts can only be as complete as the status raster (10.5k allowed cells of
  31.5k rastered; everything unrastered is "unknown"). Points that PAD-US
  marks allowed at point zoom will still be filtered out of the overview where
  the raster has no coverage. Real fix is raster coverage (build pipeline),
  not app code. Counts are now *stable* across zoom; completeness under
  allowed-only is a data question.

## 1a. Original report and plan (2026-06-11 morning, kept for context)

**Owner-confirmed 2026-06-11 (after the downward-bridge fix shipped):** the
flash still reproduces. Screenshot at ~zoom 7.5 over Charlottesville shows a
handful of small clusters near the viewport center and nothing elsewhere,
correcting after a beat.

**New diagnosis (code-level, matches the screenshot exactly):** the downward
bridge holds the CLUSTER layers visible — but cluster data only covers
`loadedPointBounds`, the smaller viewport that was loaded at zoom >= 8. Zooming
out to 7.5 roughly triples the visible area, so the bridge necessarily shows
correct clusters near the center and *empty space everywhere else*. That IS
the sparse state the owner sees; it is not a stale-buffer problem. The
structural issue: a zoom-out reveals territory for which NEITHER dataset is
loaded yet, so no choice of which stale layer to hold can fill it. The fix
must make aggregate data for the wider view available (near-)instantly.

**Plan for tonight's pass (in order):**
1. **Quantize the iNat grid zoom** so tile sets stop churning on every integer
   zoom: in `getINaturalistAggregateTiles`, snap `gridZoom` to even values
   (2/4/6) instead of `Math.floor(zoom)`. Cell resolution stays ample (64x64
   per tile); cache hit rate across a continuous zoom rises dramatically, so
   most downward crossings find their tiles already cached and the aggregate
   paint is immediate.
2. **Prefetch the zoom-out tile set while the user sits in the point band**:
   after a successful `loadMapData` at zoom >= 8, background-fetch the grid
   tiles for the padded viewport at the quantized gz the user would land on
   below 8 (and at startup, always warm the whole-region gz=2/4 set — it is
   only ~4-12 requests). Use the existing cache + `fetchINaturalistAggregateTileWithRetry`;
   throttle to concurrency 2 so it never competes with foreground loads.
3. **Keep the downward bridge but bound it by data availability, not time**:
   on a downward crossing, if all grid tiles for the target view are cached
   (common case after 1+2), skip the bridge entirely and paint aggregates
   synchronously. Only bridge when tiles are genuinely missing.
4. **Instrument before/after**: add a temporary `window.__handoffLog` that
   records (t, zoom, event, aggregateBridgeActive, pointDataReady,
   inatAggregateReady, missingTileCount, aggregateSourceFeatures) on every
   zoom/moveend/load-completion. Run a scripted jumpTo sequence 9 -> 7.5 -> 6
   -> 9 over Charlottesville, dump the log, and confirm: no state where
   visible layer's data covers less than the viewport for >1 frame. Remove
   the instrumentation before committing, or keep it behind a
   `window.FORAGE_DEBUG` flag.
5. If a residual flash remains after 1-3, the remaining suspect is the FF
   manifest aggregate recompute being deferred by `shouldDeferAggregatePaint`
   while iNat tiles fetch — consider painting FF-manifest-only aggregates
   immediately on downward crossings (they are complete nationwide from page
   load) and merging iNat counts in one later swap; weigh that single count
   step against the current empty-edges state (owner prefers complete-at-once,
   but FF-only edges may read better than empty edges — note tradeoff in the
   commit and flag for owner review).

**Verification note for the loop:** rendering-dependent checks
(`queryRenderedFeatures`) silently return 0 when the Chrome window is
occluded — the map's rAF loop pauses. Use the instrumentation log +
source-data assertions instead, and call out in the run summary that final
visual sign-off needs the owner (or a visible window).

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
