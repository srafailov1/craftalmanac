# Work orders — Speed & responsiveness (2026-07-15)

Context: the site's data is rich and accurate, but speed and responsiveness
suffer under the weight of what we represent. This is the execution plan for
fixing that. It was produced by a four-dimension performance audit (data
loading, render/interaction, boot path, payload formats) whose load-bearing
claims were each adversarially verified by an independent agent against the
code at commit `5fd7c375` (asset version `permlinks1`). Line anchors were
correct on 2026-07-15; **re-check anchors before editing — app.js moves.**

This file is scoped so a fresh agent (Opus-class) can execute phase by phase
without re-deriving context. Do the phases in order; items within a phase are
independently landable. Every landed item follows the house workflow: local
commit with a short imperative subject, `bash scripts/check.sh` green before
committing, asset-version `?v=` bump in `index.html` + `sw.js` when
`app.js`/`styles.css` change, never push (owner pushes), beta-deploy for live
checks (`npx wrangler deploy --config wrangler.beta.jsonc`).

## Goal and measurement

Cloudflare RUM showed ~50% good LCP/INP before the 2026-07-09 quick wins
(commits `d6740c5`, `1f9018a`, `8735d35`, `f058bbc5`). Those landed: modal
reveal at first CSS paint, vendored+deferred scripts, immutable caching,
render() computing `getVisibleRecords()` once per frame, and the iNat
manifest trim (18.3→10.4 MB raw). This plan is the next tier.

Targets (measure on the beta worker with Lighthouse/DevTools traces, and on
production RUM after the owner pushes):

- **INP:** a filter tap (legend chip, species select, slider tick) produces
  no main-thread task over ~100 ms on a mid-range phone profile (4x CPU
  throttle). Today a single tap re-runs the full render pass (see P1).
- **Boot bandwidth:** gzipped bytes fetched before the national overview is
  interactive drop from ~2.8 MB to under ~1.5 MB (see P3.1 — the two
  manifests are 1.7 MB gz of that today).
- **Long tasks:** no JSON.parse or aggregate walk over ~50 ms on the main
  thread during pan/zoom (see P2.3).
- **No behavior change:** overview counts, rule resolutions, and safety text
  byte-identical before/after each item (techniques below).

Measurement notes: headless local checks hit the occluded-window Mapbox rAF
stall (the `load` event never fires; see KNOWN_ISSUES item-1 verification
note) — verify data-layer claims via `window.FORAGE_DEBUG = true` +
`window.__handoffLog`, source-data assertions, and count-line text
comparison; final visual/interaction sign-off needs a visible window or the
owner. The `web-perf` flow (Chrome DevTools traces against the beta URL) is
the right way to get before/after INP/LCP numbers.

## Current cost map (verified 2026-07-15)

Cold first visit, food mode, national zoom (~3.25), gzipped wire bytes:

| Payload | gz | When | Notes |
|---|---|---|---|
| vendor mapbox-gl.js | 475 KB | boot, defer | 1.78 MB raw eval |
| app.js | 154 KB | boot, defer | 530 KB raw, unminified, 11,158 lines |
| styles.css + mapbox css | ~31 KB | render-blocking | |
| fonts (4 preloaded) | ~65 KB | boot | SW precaches 8 |
| rule tables + phenology | ~35 KB | boot | rules/, phenology/ |
| contiguous-us-states.json | 83 KB | map load | |
| local-jurisdictions.json | 52 KB | map load | used only at point zoom (P2.4) |
| usfs-forest-rules.json | 26 KB | map load | used only at point zoom (P2.4) |
| FF manifest | ~300 KB | first overview paint | 1.87 MB raw parse |
| **iNat manifest** | **~1.4 MB** | first overview paint | 10.39 MB raw, ~119 ms parse |
| status raster | 151 KB | idle | 3.76 MB raw parse |
| SW precache | ~3.5 MB raw | first install, after `load` | competes with the manifest fetches, not first paint |

Point band (zoom ≥ 8): up to 160 chunk fetches per source with no
concurrency cap or abort (P2.1/P2.2). Corpus: FF 2,905 chunks / ~8.2 MB gz;
iNat 8,949 chunks / ~51.5 MB gz (lazy, viewport-driven).

## Constraints — read before coding

1. **Safety and framing text is untouchable.** "Occurrence is never
   permission" banners/cards, the medicine educational-use disclaimer, the
   fungus whitelist, permit-required/historic-orchard labels. Perf work must
   not reword, defer past first interaction, or drop any of it.
2. **The marker source is `cluster: true`** (app.js:7169-7179). `setFilter`
   on its layers does NOT update cluster counts — clustering is source-level,
   recomputed only on `setData`. Do not re-attempt the "switch filtering to
   setFilter" idea; the lever is making `setData` rebuilds cheaper and rarer.
3. **No build step is the current stance.** Anything introducing a
   deploy-time transform (minification, bundling) is OWNER GATE — propose,
   don't land. Runtime-only changes (Workers, fetch order, memoization) are
   fair game.
4. **Owner-settled decisions:** solid color-coded rings only (never re-add
   dash/dot patterns); overview-cluster counts vs zoomed point counts differ
   by design (iNat all-time vs 200/tile sample — not a bug); PolyForm
   NC/CC BY-NC-SA licensing (never suggest permissive/monetization).
5. **The gate suite parses app.js source text.** ~13 scripts extract
   constants from app.js via `indexOf("const NAME =")` + vm (inventory in
   P4.2). Any refactor that renames/moves a top-level const must run
   `bash scripts/check.sh` and fix extractors in the same commit.
6. **`data/*` re-bakes in place** (no version strings; `_headers` gives it
   `max-age=3600, stale-while-revalidate=86400`). Manifest and chunks must
   stay mutually consistent within a deploy.

---

## P1 — Interaction responsiveness (app.js only, no data changes)

The dominant interaction cost: any state change — one legend chip, one
slider tick — runs the whole `render()` (app.js:5792-5818): legend innerHTML
rebuild, histogram innerHTML rebuild, full marker `setData` (supercluster
reindex), and at overview zoom a full aggregate recompute over up to ~11,854
manifest chunk entries. The one part already optimized is
`getVisibleRecords()` threading (computed once per render, app.js:5805).

### P1.1 Signature-guard the two unguarded `setData` paths (high impact, low risk)

- `renderMarkers` (app.js:6334-6350) rebuilds the FeatureCollection and calls
  `setData` unconditionally; its only early return is source readiness.
  `refreshFlush` already has the pattern to copy: a signature computed from
  the eligible set that short-circuits the rebuild (app.js:3760-3762).
  Compute a cheap signature over the visible record ids + the inputs that
  change feature properties (mode, register/tint inputs, access statuses per
  record are already baked into features — enumerate `buildRecordFeature`'s
  actual inputs at app.js:6270-6332 and sign those). Skip `setData` when
  unchanged. Seven standalone call sites (app.js:6909, 7671, 8251, 9455,
  9853, 9875, 9892) bypass even rAF coalescing today and will benefit most.
- `updateFallingFruitAggregates` (app.js:6445-6478) `setData`s the aggregate
  source at 6469 with no guard. Sign over (mode, selected-species signature,
  access-filter signature, quantized aggregate bounds, manifest identity)
  and skip when unchanged.
- Acceptance: with FORAGE_DEBUG-style counters (temporary), a slider drag
  that doesn't change the visible set produces 0 `setData` calls; toggling a
  chip produces exactly 1 per affected source. Count-line text and cluster
  totals byte-identical before/after on a scripted viewport tour.

### P1.2 Memoize the overview aggregate collection (high impact, medium risk)

`getFallingFruitAggregateCollection` (app.js:6501-6533) →
`getAggregateItems` (6547-6564) → `getGridAggregateFeatures` (6572-6611)
recomputes everything per paint: concatenates 2,905 FF + 8,949 iNat chunk
entries, and per item runs `getAggregateRecordCount` (6758-6794, per-anchor
map reductions), `getAggregateItemCenter` (6796-6842), and
`getAggregateItemCategoryCounts` (3351-3377) — 3 passes per item. When
`shouldUseViewportAggregateBounds` is false (zoom < 6.4 AND viewport wider
than 12° lng, app.js:6542-6545) there is no bbox pre-filter and all ~11.8k
items are walked. This fires on every moveend (5717-5720) and on every
`render()` (5807) — i.e. on every filter tap at overview zoom.

- Memoize the built FeatureCollection keyed on the same signature as P1.1's
  aggregate guard. A chip toggle that reverts (toggle on, toggle off) should
  hit cache. Invalidate on manifest arrival.
- Secondary (only if still hot after memoization): fuse the 3 per-item
  passes into one, and hoist the per-item `Object.entries` allocations.
- Acceptance: overview paint after a repeated filter toggle does zero chunk
  iteration (cache hit); gates stay green (`test_overview_coverage.mjs`,
  validate check f — note check f is iNat-only); AND an explicit
  before/after comparison of the FF aggregate FeatureCollection (counts +
  centers per cell, scripted at a few zooms/filters) comes back identical,
  since no gate covers the FF side.

### P1.3 Route the remaining synchronous `render()` interaction callers through `scheduleRender()` (low effort)

`selectOnlySpecies` (render at app.js:5145; interaction callers 5211, 5167,
5209 — note the boot-path caller at 5568 must stay correct) and
`resetLegendFilters` (render at app.js:5134; caller 4378) run the full
rebuild inside the tap's task. The sibling legend branches already use
`scheduleRender()` with a paint-first rationale comment (4381-4398) — make
these consistent. (`loadAccessRuleTables`' direct `render()` at 9921 is
handled by P1.5, not here.)

### P1.4 Stop the `sourcedata` repaint churn (low effort)

`updateMarkerPointVisibility` runs on every `isSourceLoaded` sourcedata
event for the marker source (app.js:7306-7309). Its two
`setLayerVisibility` calls are diff-guarded (7394-7400), but
`updateMarkerHalo` (7433-7439) calls `setPaintProperty` unconditionally —
and Mapbox GL's `setPaintProperty` dirties style state and triggers a
repaint even when the value is unchanged. The halo value depends only on
`state.register` (app.js:3297-3299), not source data: cache the last-set
value and skip the write, or move the halo update to register changes only.

### P1.5 Coalesce the boot/load invalidation storm (medium effort)

Eight code paths do `state.accessRuleCache.clear()`; seven pair it with an
immediate re-render: mode switch (5314), status raster (6908-6909), viewport
PAD-US (9453-9455), state boundaries (9852-9853), local jurisdictions
(9874-9875), USFS rules (9891-9892), rule tables (9920-9921); the eighth is
the zoom-out PAD-US branch (9383, clear + `updatePublicLandSource()` only,
no re-render). On a zoom ≥ 8 deep-link boot (and minerals boots) most of
these land after records exist, so the full record set's rules re-resolve
~5-6 times. Replace the pattern with one `invalidateAccessRules()` helper
that clears the cache and schedules a single debounced FULL
`scheduleRender()` (~100 ms) so near-simultaneous arrivals coalesce.
Caution: the sites are not homogeneous — rule tables run a full `render()`,
state boundaries add a histogram reseed, PAD-US adds
`updatePublicLandSource()` — and rule/boundary arrival changes
`getVisibleRecords()` results, so legend/histogram must refresh too. The
helper must schedule the full render (not a marker-only refresh) and each
site keeps its extra source updates outside the helper.

### P1.6 Scope PAD-US invalidation to the loaded bounds (medium effort)

Every per-viewport PAD-US load fully clears the access-rule cache
(app.js:9453) — but the new polygons can only change rules for records
inside the fetched bounds. The cache is keyed by `record.id` only
(app.js:9669-9672), so scoped invalidation needs a record lookup: iterate
`state.records`, and for records within the loaded bounds delete their cache
entries; leave the rest. Panning at point zoom then stops re-running
point-in-polygon (`getContainingPublicLands`, app.js:10989-11000, O(records
× features × vertices)) for records whose viewport never changed.
- Acceptance: pan a dense point-band viewport; instrument
  `computeRecordAccessRule` call counts before/after — should drop to
  roughly the newly-covered records. Rule outputs identical on a sampled
  viewport (the 2026-07-09 byte-identical count-line technique).

### P1.7 Cheap render-pass guards (low effort, batch together)

- `renderMapLegend` (4329) and the histogram trio (6181, 6214, 6261): build
  the HTML string, compare to the last one, skip `innerHTML` when unchanged.
- `renderMineralHistogram` (6225-6238): memoize category counts by filter
  signature instead of re-counting 4,881 records per render.
- `getViewportRegion` (6085-6104): memoize by rounded map center +
  boundaries identity (it does point-in-polygon over 49 states every render).
- `getVisibleRecords` (5778-5790): hoist the two per-call `Set` allocations
  (`getSelectedAccessStatuses` at 4088-4091 allocates another).

---

## P2 — Load pipeline (network scheduling + main-thread parse)

### P2.1 Abort superseded chunk fetches (medium effort)

`loadFallingFruitChunk`/`loadINaturalistChunk` fetch with no signal
(app.js:8677, 8764); `loadMapData` bumps `state.activeRequest`
(8190-8191) but only discards results after `Promise.allSettled` resolves
(8205). A fast pan leaves up to hundreds of stale fetches downloading and
parsing. Give each `loadMapData` generation an `AbortController`; on
supersession abort the fetches for chunks NOT wanted by the new viewport
(the in-flight dedup maps at 8674-8675/8761-8762 mean still-wanted chunks
should be left to finish and be reused). Aborted entries must be removed
from the in-flight maps so a later request refetches cleanly.

### P2.2 Concurrency-limit and prioritize chunk fetches (low effort)

Both loaders fire `Promise.allSettled(chunks.map(load))` — up to 160
simultaneous fetches per source (8626, 8744), 320 when a mode loads both.
`mapWithConcurrency` (8584-8596) already exists and is used elsewhere (8020,
8104, 8322, 8982). Apply it here (start ~12 per source), ordering chunks by
distance to viewport center (the sort already exists for the >160 cap at
8613-8619; apply it always) so the visible middle populates first.

### P2.3 Move heavy JSON parsing to a Web Worker (high impact, medium effort)

There is no Worker anywhere in app.js; all 25 `response.json()` sites parse
on the main thread, including the iNat manifest (10.39 MB raw, ~119 ms
parse), FF manifest (1.87 MB), status raster (3.76 MB, then an immediate
cache clear + renderMarkers at 6908-6909), and every viewport chunk.

- Add a small static `parse-worker.js` (new served asset: add to sw.js
  precache and keep out of `.assetsignore`; no build step needed — it's one
  plain file) that fetches+parses a URL off-thread and posts the object
  back. Route the three multi-MB boot payloads through it first; chunks
  second if profiling still shows parse tasks > 50 ms during pans.
- Structured-clone cost on receive is real but far smaller than parse; if a
  payload profile shows otherwise, fall back to main-thread for that one.
- Progressive enhancement: if Worker construction fails, fall back to the
  current `response.json()` path (single code path via a helper).
- Acceptance: DevTools trace during boot and during a fast point-band pan
  shows no parse-attributed main-thread task > 50 ms.

### P2.4 Defer the point-zoom-only rule files (low effort)

`local-jurisdictions.json` (507 KB raw / 52 KB gz) and
`usfs-forest-rules.json` (128 KB / 26 KB) load at map load (11101-11103) but
are consumed ONLY inside `computeRecordAccessRule`'s public-land path
(10164, 10228 via 9735), which cannot execute before zoom 8 (records and
PAD-US polygons both gate on zoom ≥ 8). Defer both to first point-band
entry — including deep-link boots that start in-band (11093-11096). Their
completion handlers already self-heal (clear + re-render; after P1.5, the
coalesced helper). `contiguous-us-states.json` is different: it drives
overview-visible phenology region selection (histogram bar shapes,
Materials/Projects "Available" filters) — defer it to idle at most, not to
point-band entry.

### P2.5 Delete the dead live-iNaturalist code (low effort, do late in P2)

With `USE_BAKED_INATURALIST = true` (app.js:69), ~360 lines of standalone
functions are unreachable (inventory verified 2026-07-15: 
`getINaturalistAggregateItems` 6566, `getCachedINaturalistRecordsInBounds`
7021, `getNonzeroAggregateItems` 8168, both fetch-retry helpers 8146/8159,
`loadINaturalist` 8309, `fetchINaturalistBounds` 8328,
`getINaturalistRequestBounds` 8353, `dedupeRecords` 8392,
`fetchINaturalistAggregateTile` 8415, `getINaturalistGridItems` 8435,
`getINaturalistAggregateTiles` 8508, `getGridTilesForArea` 8537,
`getINaturalistAggregateBounds` 8562, `getINaturalistAggregateCacheKey`
8580, `mapINaturalistObservation` 9489, `getSpeciesForObservation` 9535),
plus inert bodies in `prefetchINaturalistAggregateTiles` (7986) and
`loadINaturalistAggregates` (8033) and their call sites, plus orphaned state
fields/constants — ~490 lines total. This is bake Phase C/D
(docs/TODO-inaturalist-chunk-bake.md). Keep shared helpers
(`retryDelayMs`, `lngToTileX`/`latToTileY`, `touchCacheEntry`/`trimCache`,
`fetchWithTimeout`, `mapWithConcurrency`). Also remove the always-false
`aggregateTilesCachedForView` call from the zoom handler (7964, called at
5694). CLAUDE.md documents the flag as gating a removable fallback — this
work order is that removal; flag it in the commit message so the owner sees
the fallback is gone. Fix the stale manifest-size comment at app.js:8711-8715
("3.9 MB gz / ~18 MB" → actual ~1.4 MB gz / 10.4 MB raw) in the same pass.

---

## P3 — Payload diet (bake pipeline + app changes)

### P3.1 Pre-baked overview summary — retire the manifests from the boot path (highest single win)

Today the national overview downloads ~1.7 MB gz (both manifests) and pays
two multi-MB parses to draw circles. Verified (2026-07-15): the baked
overview path reads ONLY these per-chunk fields — `bbox`;
`countsBySpeciesId` + `centroidsBySpeciesId` (FF); `countsByAnchor` +
`center` (iNat); and under an access filter `accessCounts[mode][status]
[speciesId]` + `accessCentroids[mode][status]` (FF only; iNat cells
re-count but re-center to `item.center`). `path` and `recordCount` are
never read by the overview, and the status raster is NOT read by the baked
overview at all (coloring is dominant-category; the raster serves
record-level rules at zoom ≥ 8).

Work order:
1. New bake script `scripts/build_overview_summary.mjs`: from both
   manifests, emit `data/overview-summary.json` bucketed to a coarse grid
   (e.g. the 0.30° chunk grid or coarser), preserving per-species/per-anchor
   counts, count-weighted centers, and the access-filter fields above.
   Target ≤ ~300 KB gz. Wire a gate that asserts summary totals ==
   manifest totals per mode/species/status.
2. App: overview paints read the summary; the two manifests load only when
   approaching the point band (e.g. zoom ≥ 6) since chunk paths (derivable
   from id — see P3.2) are only needed there. Keep the manifest fetches
   behind the existing single-flight getters.
3. Gates that must stay green: `test_overview_coverage.mjs`, validate
   check f ("iNat overview count equals plotted points per mode"),
   `test_zoom_handoff.mjs` (it drift-guards orchestration lines — expect to
   update its extraction list).
4. Risk: the screen-pixel merge (6663) and species/access filtering are
   runtime-dynamic, so the summary must keep per-species granularity —
   don't pre-render circles. If per-species access counts blow the size
   budget, bucket coarser rather than dropping granularity.

### P3.2 Manifest format trims (secondary once P3.1 lands)

- Drop the fully-derivable `path` strings (all 8,949 iNat paths are exactly
  `./data/inaturalist/us/chunks/<id>.json`; FF equivalent) — derive in the
  loaders. ~3-5% gz each.
- iNat `accessCounts` is 67.9% of the manifest's raw bytes; columnar/
  short-key encoding is the 10-15% gz opportunity. Only worth it if the
  manifest remains on any latency-sensitive path after P3.1.

### P3.3 FF chunk regen: drop redundant fields (~15-25% gz off the big chunks)

Verified blast radius (2026-07-15): the PAD-US access-cache is keyed by
CHUNK ID + POSITIONAL ROW INDEX (fetch_padus_containment.mjs:198-211;
build_access_status.mjs:483-505) — a regen that preserves the chunk grid,
per-chunk row count, and row order (the builder's sort on
speciesId/lat/lng/id is deterministic over preserved fields,
build_falling_fruit_subset.py:368) does NOT invalidate it and needs no
PAD-US refetch. `build_access_status.mjs` must be re-run afterward (cheap,
local) because the subset builder rewrites manifest.json without
accessCounts/accessCentroids.

**Part A — field drops (cache-safe, do this):** drop per record
`confidence` (constant "community" across the dataset; app consumers
already default to it — no app change), `sourceUrl` (derive
`https://fallingfruit.org/locations/<id-prefix>` in
`mapFallingFruitRecord`, app.js:9572-9601), `accessNote` (derive from
`access` via classify_access's fixed templates,
build_falling_fruit_subset.py:240-275). None of these are sort-key inputs,
so row order — and therefore the positional cache alignment — is
preserved. Update in one pass: `build_falling_fruit_subset.py`
RECORD_FIELDS, manifest `recordFields`, `build_access_status.mjs`
requiredFields + getRecordObject (it hard-requires accessNote/sourceUrl
today and throws), `mapFallingFruitRecord`. `expandFallingFruitRecord`
(8692) is generic — no change. Bundle the ink-honeysuckle orphan purge
(docs/TODO-fable-handoff.md B2) into this regen.

**Part B — coordinate rounding (NOT cache-safe; separate decision):**
coords carry 8 decimals typically (outliers to 15); 6 is ample. But lat/lng
are sort-key inputs (build_falling_fruit_subset.py:368), so rounding can
reorder rows that tie after rounding — and the positional
`containment[index]` cache would then map PAD-US results to the WRONG
records. No gate catches this: validate check d is row-COUNT-only, and
runtime rule spot-checks exercise the live-polygon path, not the baked
cache. Do NOT round coordinates unless the containment cache is rebuilt in
the same pass (`fetch_padus_containment.mjs --force` — a rate-limited live
PAD-US refetch of ~2,900 chunks). Given Part A already captures most of the
gz win, the default is: ship Part A alone, and fold Part B into the next
full PAD-US refetch whenever one happens for other reasons (e.g. the
KNOWN_ISSUES 1b apportioning work order).

### P3.4 iNat chunk observer dictionary (optional, ~11% gz off the 51 MB corpus)

`observer` usernames are ~21% of a large chunk's raw bytes (3,747 distinct
across 19,596 records in the biggest chunk). Bake a per-chunk string table +
integer indexes (`build_inaturalist_subset.mjs`), decode in the chunk
loader. Corpus is lazy-loaded, so this is bandwidth relief for heavy point-
band users, not boot. Do after P3.1/P3.3.

### P3.5 Stop deploying unserved data (trivial)

`data/material-profiles.json` (321 KB) is read only by
`scripts/build_static_pages.mjs`; `data/mid-atlantic-boundary.json` (35 KB)
only by `scripts/build_nps_orchards.py`. Neither is fetched by any served
code. Add both to `.assetsignore` (they stay in the repo for the build
scripts). Also correct CLAUDE.md's claim that material profiles are
runtime-fetched JSON — only project-recipes.json is.

### P3.6 OWNER GATE — longer chunk caching

`/data/*` gets 1 h + 24 h SWR; the SW's `dataNetworkFirst` (sw.js:439-458)
always hits the network first while online, so repeat pans re-download
chunks after HTTP-cache expiry. Options to put to the owner: (a) version
the chunk-tree directory per bake (`us-v2/`) and mark it immutable — best,
but changes bake/deploy conventions; (b) raise the TTL to ~7 days (chunks
change only on quarterly re-bakes; manifest/chunk consistency window
widens accordingly); (c) SW stale-while-revalidate for chunk paths. Don't
land without a decision.

---

## P4 — Boot JS cost (both items OWNER GATE)

### P4.1 Minify app.js + styles.css at deploy (owner decision on the no-build-step stance)

530 KB raw / 154 KB gz, unminified, parsed on every cold load; minification
(esbuild, no bundling) would roughly halve both wire and parse cost while
the repo stays readable source. Smallest-footprint proposal: a
`scripts/deploy.sh` that esbuild-minifies into `dist/` and wranglers from
there; beta first. The sw.js/index.html version-sync gate and the app.js
source-text extractors (P4.2 inventory) all read the SOURCE file, so they
are unaffected — but `report_dead_css.mjs` and anything else scanning
served output must be pointed at source explicitly. Present cost/benefit to
the owner; do not land unilaterally.

### P4.2 Extract the static data tables (only if P4.1 is rejected; high effort)

Lines ~101-2210 are ~2,000 lines of static data (color maps, safety tags,
harvest ethics, four species catalogs, MAP_MODE_CONFIG). The proven
migration template is `test_rules_extraction.mjs` + the three rule tables
already moved to boot-fetched JSON (`let` declarations at app.js:277, 284,
9682). BUT the extraction surface is large — these scripts pull those
consts from app.js source text and would all need updating in the same
pass: validate_data.mjs, build_phenology_histograms.mjs,
test_safety_tags.mjs, build_static_pages.mjs, build_field_cards.mjs,
test_rules.mjs, test_rules_extraction.mjs, build_access_status.mjs,
build_status_raster.mjs, build_flush_thresholds.mjs,
resolve_inat_gbif_taxonkeys.mjs (inventory with line numbers in the
2026-07-15 verification record). The catalogs are also needed synchronously
at first render, so extraction means a boot-fetch dependency or an inline
`JSON.parse("...")` (faster than object literals). Verdict: P4.1 delivers
most of the same win for a tenth of the risk; do this only if minification
is declined and boot profiling still shows app.js parse as a top cost.

---

## Smaller verified findings (batch into adjacent work)

- FF manifest fetch has no `priority` hint (app.js:8645) while the bigger
  iNat one is `priority:"low"` (8716) — add `low` (or drop both to
  point-band-entry per P3.1).
- Font preload set (4, index.html:35-38) vs SW precache set (8,
  sw.js:99-106) — align.
- Desktop still pays stacked `backdrop-filter` blurs over the WebGL canvas
  (.season-bar, .floating, .pt-card — styles.css:366, 1031, 1055; already
  disabled on coarse pointers). Option: suspend blur during map movement
  via a `movestart`/`moveend` class. Visual change — owner sign-off.
- `.flush-pulse` DOM markers carry infinite CSS animations
  (styles.css:2737-2749) re-transformed every frame; bounded by flushing
  mushrooms, fine unless profiling says otherwise.
- `describeNearestRecord` (6417-6443) haversines all 4,881 minerals when a
  minerals viewport is empty — memoize by viewport key if it shows up.
- PAD-US pages fetch sequentially (9406-9436); leave as-is for API
  politeness unless the owner wants concurrency 2.
- `report_dead_css.mjs` flags `.is-err`/`.is-ok` which are runtime-composed
  (app.js:4533) — add to its ALLOW_TOKENS.
- First-install SW precache (~3.5 MB) races the overview manifest fetches
  after `load`. If P3.1 lands, the manifests leave the boot path and this
  mostly self-resolves; otherwise consider staggering the precache install
  (e.g. shell first, fonts/data on idle).

## Suggested execution order

1. **P1.1 + P1.3 + P1.4 + P1.7** (one commit or a small series) — pure
   app.js, biggest INP relief per line changed.
2. **P1.5 + P1.6** — invalidation coalescing/scoping.
3. **P2.2 + P2.1** — chunk fetch discipline; then **P2.3** (Worker parses).
4. **P2.4** — defer the point-zoom-only rule files (low effort, pairs
   naturally with P1.5's coalesced invalidation).
5. **P1.2** — aggregate memoization (after P1.1's signatures exist).
6. **P3.5** (trivial) + **P2.5** (dead code) + comment fixes.
7. **P3.1** — overview summary bake + app switch (the big bandwidth win).
8. **P3.3 Part A** — FF chunk field-drop regen (bundle honeysuckle purge);
   Part B only rides along with a full PAD-US refetch.
9. Put **P3.6 / P4.1** to the owner; land per decision.
10. **P3.2 / P3.4** — only if their paths remain hot after the above.

Each step: `bash scripts/check.sh` green, asset version bumped when
app.js/styles.css change (update sw.js ASSET_VERSION/CACHE_VERSION in sync —
gate-enforced), local commit, beta deploy + trace when the change is
observable, owner sign-off items collected in the commit message.
