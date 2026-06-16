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

**Update 2026-06-11 late evening (owner retested after pushing 5a16cb6 — both
symptoms persisted; two further root causes found and fixed, commit "Hold
point-band records below zoom 8; provisional raster access rules"):**

4. **Below-zoom-8 loads clobbered the cluster source.** `loadMapData` ran on
   every moveend at ANY zoom; below 8, `loadFallingFruit` declines and returns
   `[]`, so each overview pan/zoom replaced `state.records` (and the marker
   source via `renderMarkers`) with a sparse iNat-only subset — while
   `loadedPointBounds`/`pointDataReady` still claimed coverage. Zooming back
   into "covered" bounds showed clusters instantly from the gutted set, which
   then recovered after a refetch: the owner's "clusters rapidly fall off,
   then recover with a lag." Fix: `loadMapData` early-returns below the point
   band and keeps the last point-band record set intact (also removes
   pointless iNat API traffic at overview zooms, and gives the downward
   handoff bridge stable data).
5. **Record-level "allowed" required live PAD-US polygons.** Live polygons
   are cleared below zoom 8, fetched per viewport above it (seconds of
   latency), and silently truncated at the 4-page query cap on wide
   viewports — until they land, every record degraded to private-unsourced,
   so the "Allowed"-only filter hid everything at exactly the zooms where
   clusters appear. Fix: provisional area-level rule from the precomputed
   PAD-US containment raster (`getStatusRasterAccessRule`), used only where
   live polygons don't cover the record (`state.publicLandCoverage`, with
   truncation tracked), never overriding site rules or record-level private
   flags; rule cache clears on land load so live containment replaces it.
   Raster now loads at startup, and `loadPublicLands` records coverage +
   truncation.

**Update 2026-06-12 (owner retest: allowed-only clusters now appear much
sooner, but still absent at FULL zoom out; fixed, commit "Resolve filtered
overview tiles at status grid zoom"):** at gz 2-4 a UTFGrid response cell
spans 0.35-1.4 degrees, so its single 0.05-degree raster lookup is noise —
measured nationally: only 27 of 1,845 cells carried an "allowed" status and
the filtered overview total collapsed to ~3.5k. Fix: when a permission filter
is active, `getINaturalistAggregateTiles` resolves the whole region at gz 6
(~84 tiles, capped at 96, concurrency 3 when fetching >24 tiles, cached per
taxon set; identical tile ids to the viewport band so zooming under a filter
hits cache). Default-permission behavior unchanged. First filtered overview
paint waits a few seconds on the one-time fetch — previous paint holds via
the existing gate.

## 1b. Thin-park raster blindness — WORK ORDER for tonight's loops (queued 2026-06-12, owner-reported)

**Symptom (owner screenshot, Indiana Dunes, allowed-only + all seasons,
~z9.7):** inflated overview circles (170/444) that "break down" into far
fewer points. The inflation half is fixed by "Resolve filtered overview tiles
at status grid zoom" (fine cells can't grab whole-bucket counts). The
remaining half is UNDER-counting in thin/patchwork parks, and it is a DATA
problem, not app code.

**Measured ground truth (live, Dunes viewport ~[-87.5,41.2]-[-86.6,41.9],
food mode, all seasons):** 200 iNat records loaded; live PAD-US containment:
80 allowed / 6 permit-required / 93 private-unsourced / 21 unknown.
Recovery of those 80 by every cell-granularity scheme: per-record raster
lookup = 17; gz6 centroid cells = ~0; gz7 = 13-20; area-weighted fraction
apportioning = 0.8-13. Root cause: `fetch_padus_cell_containment.mjs` tests
only each 0.05-degree cell's CENTER (`findContainingProperties(cell.center,
features)`), so a 2-4 km park strip in ~5 km cells yields almost no allowed
cells (Indiana Dunes: 12), and observations concentrate inside exactly those
strips.

**Work order (pipeline, then app):**
1. `fetch_padus_cell_containment.mjs`: sample each cell at 5 points (center
   + 4 quarter-diagonal offsets at ±0.0125 degrees). Containment is computed
   LOCALLY against already-fetched chunk/region features, so this adds no
   PAD-US API traffic for cached areas. Store per cell: `units` per sample
   point hit, plus `insideFraction` per unit set.
2. `build_status_raster.mjs`: emit per mode (a) `status` — CONSERVATIVE, for
   record-level provisional rules: keep center-point semantics (or require
   >=3/5 points) so individual points never overstate permission; (b)
   `statusFractions` — share of sample points per status, for aggregate
   apportioning.
3. App: when a permission filter is active, split UTFGrid cell counts by
   `statusFractions` of overlapped raster cells (footprint overlap as in
   `getRasterStatusFractions` sketch in git history of this debugging
   session) instead of the single-status lookup; record-level fallback keeps
   using `status` unchanged.
4. **Acceptance test:** in the Dunes viewport above, per-record raster
   statuses should recover >= 60 of the 80 live-allowed records, and the
   filtered overview total should land within ~2x of 80 (currently ~0-20).
   Also re-run the Shenandoah check (allowed-only at z6.5 over
   Charlottesville previously totalled ~601 — should not regress) and
   `scripts/check.sh`.

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

**Live verification 2026-06-11 (Chrome automation on craftalmanac.com @
point-band-rules-1):** both owner-reported symptoms PASS. Default
permissions: z9 -> 6.5 -> pans -> z9 over Charlottesville, marker total 285
(28 clusters + 23 singles) at t0 == t+5s, records held at 467 below z8.
Allowed-only: 22 aggregate circles / 601 records at z6.5; 76 allowed records
as 8 clusters + 7 singles at z9 (Shenandoah NP wineberry, BRP blueberry,
34-cluster at Charlottesville). Remaining for owner: human wheel/pinch-zoom
pass per the verification standard below (scripted jumpTo cannot reproduce
gesture event timing), and the NYC cold-cache run.

**Verification note for the loop:** rendering-dependent checks
(`queryRenderedFeatures`) silently return 0 when the Chrome window is
occluded — the map's rAF loop pauses. Additionally, after `jumpTo` or
`setData` in an automated tab, GeoJSON source re-tiling can stall
indefinitely (source `_data` updated, `querySourceFeatures` empty, nothing
painted) until a real camera change drives frames — issue a tiny
`map.panBy([2,0])` nudge before sampling, and never interpret a blank
post-jumpTo read as a bug without one. Use the instrumentation log +
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

## 2. `falling-fruit-aggregate-labels` (row 7, state-name labels) never renders — RESOLVED 2026-06-13 (removed dead layer)

**Resolution (nightly loops paused, decided directly):** removed
`FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID` (constant + `map.addLayer` block,
`app.js`) rather than restoring a `level: "state"` generator. Rationale: the
layer was permanently inert (filter `["==", ["get", "level"], "state"]` never
matched any feature — every aggregate feature is `level: "grid"` with
`label: ""`), it predates the grid-bucket rework, and the redesign's Phase 3
floating legend/season UI is the intended place for state/region context, not
a map-painted label layer. `docs/design/standard-style-spec.md` row 7 updated
to record the removal. `node --check app.js` passes; bumped `index.html`'s
`app.js` cache token to `?v=standard-style-3`.

<details><summary>Original report (2026-06-13, kept for context)</summary>

**Symptom:** at zoom 3-4, no state-name labels appear anywhere (verified via
`queryRenderedFeatures`: 0 features for `falling-fruit-aggregate-labels` at
zoom 3 over CONUS, with 88 grid-aggregate features present).

**Root cause:** the layer's filter is `["==", ["get", "level"], "state"]`
(`app.js` ~line 3100), but every aggregate feature produced today comes from
`getGridAggregateFeatures` with `level: "grid"` and a hardcoded `label: ""`
(`app.js` ~lines 2563-2586). No code path ever emits `level: "state"`
features — this looks like a leftover from a pre-grid-bucket design (possibly
predating the "Resolve filtered overview tiles at status grid zoom" rework in
item 1). The layer is currently inert.

**Why it surfaced now:** `docs/design/standard-style-spec.md` row 7 flagged
"check state labels don't collide with Standard's place labels at zoom 3-4"
as part of Phase 2 verification. There's nothing to collide — the check
trivially passes, but only because the feature is dead, not because it's
fine.

</details>

## 3. Misleading month-range text for split-season species — RESOLVED 2026-06-15

**Symptom:** `getMonthRangeText(species.months)` rendered a naive min–max range,
so chickweed (the one catalog species with non-contiguous months,
`[2,3,4,5,10,11,12]` — Feb–May then Oct–Dec, dormant in summer heat) displayed
as **"Feb-Dec"** in the point card's availability/"season" line, implying it is
gatherable all summer when it specifically is not. All other 15 distinct month
patterns are contiguous and were unaffected.

**Fix (commit "Coalesce split-season month ranges in availability text"):**
`getMonthRangeText` now coalesces sorted, de-duplicated months into contiguous
runs and joins them — chickweed reads **"Feb-May, Oct-Dec"**. Verified by
extracting the live function from app.js and unit-testing: identical output to
the old code on all 15 contiguous patterns (zero regressions), plus empty →
"Unknown", single month, and unsorted/duplicate inputs. Display-text only — no
permission-rule change, so no `build_access_status.mjs` rerun. Bumped
`index.html` app.js token `allowed-overview-1` → `month-runs-1`.
**Note for the owner / 6am loop:** `design/relaunch` carries an equivalent fix
to this same function in its staged WIP; this implementation matches it
textually so a future design→main merge stays conflict-free.

## Tune-up run log — 2026-06-15 (5am debug loop)

Health pass on `main` (no regressions found beyond item 2):
- `node --check app.js` — clean.
- **Duplicate top-level declaration scan** (explicitly requested under item 1
  after the `getSelectedAccessStatuses` double-definition bug): clean — 323
  distinct top-level names, zero duplicate `function`/`var` declarations that
  `node --check` would silently accept. The harness lives at
  `/tmp/dupscan.mjs` during the run; consider committing it to `scripts/` as a
  permanent lint if the owner wants it to persist (small hand-off below).
- All local data files referenced by app.js resolve: the 5 top-level JSON files,
  plus all 2905 Falling Fruit chunk `path`s sampled (chunks/manifest counts
  match: 2905 = 2905), status-raster, boundaries, states, NPS orchards.
- Local serve (`python3 -m http.server 4173`) returns 200 for `/`, app.js,
  styles.css, config.js, and the data endpoints above.

## Tune-up run log — 2026-06-16 (5am debug loop)

Full health pass on `main` (clean working tree). No code-fixable correctness
bug surfaced in the safely-verifiable zones, so this run is **doc-only** (queue
triage + run log + environment flag); the open queue items are all either
handed off or owner/rendering-verification-dependent (see below). Per the loop
contract — "a local commit, or none if nothing is safe to fix; never ship an
unverified fix" — no change was forced into the delicate aggregate/access path.

Reproduced / verified this run:
- `scripts/check.sh` — **ALL PASS**: `node --check app.js`, `node --check` on
  every `scripts/*.mjs`, `validate_data.mjs`, `test_rules.mjs` (incl. the new
  Illinois DNR cases), `test_overview_coverage.mjs`, and `audit_contrast.mjs`
  (the two `APPR` rows are the owner-approved dawn/dusk prototype values, not
  regressions).
- **Duplicate top-level declaration scan** (item 1's recurring ask): clean — no
  `function`/`const`/`let`/`var` name declared twice that `node --check` would
  silently accept.
- **Bug-pattern sweep**: no `parseInt` without radix; no bare `YYYY-MM-DD`
  `new Date()` parsing (the two date paths deliberately force local time); no
  unguarded `Math.max/min(...arr)` spreads (all length-checked or `,1`-floored).
- **Safety invariants intact**: "Occurrence is never permission" + on-map
  "OCCURRENCE IS NOT PERMISSION — CHECK THE PARCEL RULE" banner; medicine
  educational-use disclaimer (config `safetyNote` + card `med-note` + About
  "NOT MEDICAL ADVICE"); NPS permit-required / historic-orchard labels;
  `EDIBLE_FUNGUS_WHITELIST = {morel}` fungus gate (app.js ~541).
- **Local serve**: 200 for `/`, index.html, app.js, styles.css, config.js, all
  8 data endpoints, and a sampled Falling Fruit chunk fetched at its
  root-relative `chunk.path` (an initial 404 was a test-path artifact, not a
  broken load — `app.js:5515` fetches `chunk.path` relative to the page).
- **NEW — phenology↔catalog consistency** (the Jun-15 phenology feature has no
  automated test): every mode's curve set exactly matches its catalog —
  **food 26/26, ink 13/13, medicine 14/14**, zero orphans, zero missing curves,
  every species carries `months[]`. Curve files are format-valid (12 elements,
  peak-normalized to 1, values in [0,1]). New optional lint hand-off #3 below.
- Read ~25 pure helpers (date/season/month/format/geo/solar/tide/histogram/
  popup) — all correct; the obvious display bugs were already fixed (items 2,3).
- Reviewed the three newest app.js commits (IL DNR rule `6568c5e`, mobile
  masthead/card `dd2f9d4`, season-card `f838c92`): well-formed, no non-rule bug.

Open queue after this run: items 1/1a are code-fixed + owner-verified at
`point-band-rules-1` (residual = the structural raster-coverage **data** limit
+ the owner's human wheel/pinch zoom sign-off); item 1b stays the queued
data-pipeline work order for Codex; the item-1 plan follow-ups 2–4
(prefetch/warm gz2-4, data-availability-bounded bridge, instrumentation) remain
open but are rendering-**timing** work that needs a visible window / owner
sign-off — not safely verifiable in a headless pass, so not attempted here.

## Hand-offs (for the 6am queue-grooming loop)

1. **Thin-park raster blindness (item 1b) is the queued data-pipeline work
   order** — unchanged this run; it is a data/build problem
   (`fetch_padus_cell_containment.mjs` center-only cell sampling), too large for
   the debug pass. Route it to Codex (`docs/TODO-*.md`) per item 1b's pipeline
   steps and acceptance test. Items 1/1a remain code-fixed and owner-verified at
   `point-band-rules-1`; the residual is the structural raster-coverage limit
   (data) plus the owner's human wheel/pinch-zoom sign-off — not app code.
2. **(Optional) Persist the duplicate-name lint:** consider a small Codex/Qwen
   task to add `scripts/lint_top_level_dupes.mjs` (the `/tmp/dupscan.mjs` logic)
   and wire it into `scripts/check.sh`, so the `getSelectedAccessStatuses`-class
   bug is caught automatically rather than re-scanned each 5am run.
3. **(Optional) Add a phenology↔catalog consistency check to
   `scripts/validate_data.mjs`:** it already extracts `foodSpeciesCatalog` /
   `inkSpeciesCatalog` via `vm.runInContext`, but nothing asserts that
   `data/phenology/<mode>.json` keys match the per-mode catalog ids (incl.
   `medicineSpeciesCatalog`) or that each curve is a 12-element array
   normalized to a peak of 1. Verified clean by hand this run (food 26/26, ink
   13/13, medicine 14/14), but a future catalog/curve edit could drift silently
   — the histogram just falls back to binary `months[]`, so it wouldn't throw.
   Small Codex/Qwen task; wire into `scripts/check.sh`.

## Environment anomaly — FLAG FOR OWNER (2026-06-15)

When this run started, the connected repo was **parked on `design/relaunch`**
(not `main`) with staged design WIP (app.js/index.html/styles.css + a junk
`__r2.md` that is a byte-identical copy of README.md), plus stale git lock files
(`.git/index.lock`, `packed-refs.lock`, `refs/heads/design/relaunch.lock`,
`refs/tags/__perm_probe__.lock`, `objects/maintenance.lock`) and untracked probe
files (`__pb`, `__probe_root`, `outputs/__p2`) — the signature of a crashed
permission-probe process (note the `__perm_probe__` tag). The mounted filesystem
also **blocks `unlink` (Operation not permitted) while allowing create/rename**,
so normal `git checkout main` (would need to delete 50 design-only files) and
`git stash` are not possible in place. This loop therefore did its work on a
**separate `main` worktree** (`git worktree add /tmp/ca-main main`), leaving the
`design/relaunch` checkout and its staged WIP completely untouched, and committed
on `main` there. Stale `.lock` files were renamed aside (could not be deleted).
The design WIP and probe files are intact and were not committed. Owner may want
to (a) clean up the probe junk + stale `.git/*.lock.*` files manually, and
(b) check why the repo was left on `design/relaunch`.

**Update 2026-06-16 (5am loop):** the branch situation is **resolved** — the
repo is now on `main` with a clean working tree (the `design/relaunch` merge
landed: `f8a4604` "retire design/relaunch", plus the Phase-7 retire/merge
commits). This loop worked **in place on `main`** (no separate worktree
needed). Two carry-overs remain for the owner:
- The **`unlink` block persists** (`rm` → "Operation not permitted"; create and
  rename still work). `git status` itself re-creates a `.git/index.lock` it then
  can't unlink, so each status read leaves a stale lock; I renamed the bare
  `.git/index.lock` / `HEAD.lock` / `objects/maintenance.lock` aside into
  `.git/_stalelocks/` before committing (rename is permitted). Commits succeed
  via git's lock→target rename path. Stale `.git/**/*.lock*` files are
  accumulating and can only be cleared by the owner (or once the mount allows
  unlink).
- **Probe junk lingers** at repo root: `.__probe_junk` (untracked, 0 bytes, from
  the earlier crashed probe). I also created `.__unlink_test` while confirming
  the unlink restriction and **could not delete it** (same block) — both are
  untracked, were **not** staged/committed, and are safe for the owner to `rm`.
