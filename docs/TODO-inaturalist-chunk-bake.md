# Work order: bake iNaturalist into precomputed point chunks

Status: **PHASES A, B, and C (wiring) COMPLETE and verified (2026-07-09).** The
national tree is built + access-baked + gate-validated; the app wiring is landed
behind `USE_BAKED_INATURALIST` (default OFF = live path unchanged). Remaining is
the owner-driven GO-LIVE (section 11) + Phase D docs + the manifest trim. Written
2026-07-09 from a 3-agent research pass.

This file is self-contained: a fresh session with no memory of the scoping
conversation can execute it. Re-check line anchors before editing (app.js moves).

## PHASE A RESULTS (2026-07-09) — all invariants passed

Validated end to end on 7 taxa in Virginia (9,072 GBIF records via the sync API):
- Overview aggregate count == plotted points, all 3 modes (food 2,444 / ink
  6,409 / medicine 4,927). accessCounts total == plotted, all 3 modes.
- 130/130 catalog anchors resolved to GBIF keys (1 harmless spelling-variant
  fuzzy: Purshia). National raw = **2,879,514** CC-eligible US research-grade
  records (GBIF's iNat mirror is 100% CC-eligible; ARR absent). 4-dec keep-ratio
  0.93 -> ~2.6M projected national. Obscuration 95.1% precise / 4.9%
  observer-obscured / 0 taxon-obscured.
- DWCA and gbif-json ingest paths produce byte-identical output.

Key design decisions taken during Phase A:
- **Schema (refines 8.6): each row stores the iNat ANCHOR taxon id, not one
  speciesId.** 6 taxa cross modes (e.g. Sambucus 52689 -> elderberry /
  ink-elderberry / medicine-elderberry) and goldenrod (48678) has no food
  species, so a single speciesId cannot resolve per mode. The app resolves
  anchor -> per-mode species from the active catalog, mirroring live
  getSpeciesForObservation. recordFields = `[id, anchor, lat, lng, idDate,
  observer, approximate]`. Manifest chunks use `countsByAnchor` /
  `centroidsByAnchor`; manifest carries an `anchors` list (anchor ->
  speciesByMode). Most-specific anchor wins (validated: S. racemosa records
  attribute to red-elderberry, not generic elderberry).
- **Latent bug the bake fixes:** getExpectedIconicTaxon returns "Plantae" for
  every non-`mushroom` category, so the LIVE app drops iNat observations for 7
  ink dye fungi/lichens (Fungi kingdom): turkey tail (54134), artist's conk
  (48473), wolf lichen (54613), chicken-of-the-woods (53713/487301), dyer's
  polypore (118084), tinder conk (127510), red-belted conk (495903/877361/
  877362). Anchor-based bake includes them correctly. Owner confirmed: INCLUDE.
- **PAD-US throttles large-geometry bursts** ("Too many large geometry
  non-cacheable requests"). Run fetch_padus_containment with
  `--concurrency=1 --spacing=1500 --retries=4 --backoff=3000` for dense
  public-land regions. The national build MUST use gentle settings.
- The access-cache + cell-containment dirs are BUILD-ONLY (in `.assetsignore`,
  never served). The iNat `data/inaturalist/us/access-cache/` must be added to
  `.assetsignore` too. Served file count = iNat CHUNK count only.

Confirmed section-8 decisions (owner, 2026-07-09):
1. Thinning = **4 decimals**. 2. Grid = **0.30 deg** (CHANGED from 0.15 after the
national build measured 29,240 chunks at 0.15, over Cloudflare's 20k cap; 0.30
-> 8,949 chunks / ~12,200 served total / ~6 MB manifest. Owner picked 0.30 over
0.25 for growth headroom). 3. Ingest = **taxonKey-scoped GBIF + post-filter on
GBIF hierarchy** (validated). 4. Observer-obscured = **keep, badged, shown at all
zooms, counted**. 5. Freshness = **fully static, quarterly rebuild** (no live
iNat). 6. Schema = **anchor-taxon** (above). 7. Tree = **parallel
`data/inaturalist/us/`**. 8. GBIF account: owner HAS it.

Phase B national build (2026-07-09): GBIF DWCA download key
`0030457-260623161305970`, **DOI 10.15468/dl.e6q6he**, CC BY-NC 4.0, 2,879,514
records (1.5 GB zip in `~/Documents/CraftAlmanac-archives/inaturalist/`). Build
run with `--grid=0.30 --thin=4`, `node --max-old-space-size=12288` (the builder
holds ~2.6M records; earlier 8 GB OOM'd, fixed by reading only needed DWCA
columns by index + compact tuples). National kept post-thin ~2.56M
(keep 0.9077); obscuration precise 2.74M / observer-obscured 115,162 (4.1%) /
taxon-obscured dropped 8,083 (0.3%); out-of-CONUS drops 17,164 + 34,431.

Scripts landed (uncommitted, pending owner review):
`resolve_inat_gbif_taxonkeys.mjs` (ran: `data/inaturalist/taxon-keys.json`),
`fetch_gbif_sample.mjs` (sync-API sampler, no creds), `build_inaturalist_subset.mjs`
(`--source=gbif-json|dwca`), `request_gbif_download.mjs` (national DWCA), and
`--dir`/`--tree` params added to `fetch_padus_containment.mjs` +
`build_access_status.mjs` (FF path unchanged; gate suite still green). The VA
`data/inaturalist/us/` tree is throwaway validation data — the national build
overwrites it; do NOT commit it.

Phase B mechanics: owner runs `request_gbif_download.mjs` (auth); the resulting
zip is public, so Claude can poll+download from the key. Then
`build_inaturalist_subset.mjs --source=dwca --input=<unzip> --thin=4`, gentle
`fetch_padus_containment.mjs --dir=inaturalist/us --concurrency=1`,
`build_access_status.mjs --tree=inaturalist`, then MEASURE chunk count vs the
20k cap and manifest size (VA extrapolates to a ~6 MB national manifest — watch
it; trim precision or drop per-chunk centroids if needed).

---

## 1. Purpose and outcome

Today the map draws occurrence points from two sources:

- **Falling Fruit**: precomputed into static "chunk" files baked into the repo
  (`data/falling-fruit/us/`), loaded at zoom >= 8. Its overview aggregate counts
  are ALSO precomputed from those same chunks, so the overview number equals the
  points that plot.
- **iNaturalist**: fetched LIVE from its API while browsing. The overview uses
  iNaturalist's `/v1/grid` endpoint (uncapped all-time observation totals, e.g.
  3,971 raspberries in Minnesota), but the point view fetches a capped SAMPLE
  (`/v1/observations`, max 200 records/tile, most-recent). So the overview count
  and the plotted points do not correspond, which reads as a bug (see the count
  investigation: it is not a bug, it is two different measures).

**The plan:** bake iNaturalist into precomputed point chunks the same way Falling
Fruit already is, thinned to roughly one point per distinct location. Then:

1. The overview aggregate counts EXACTLY the points that plot (they always agree,
   by construction, the same way Falling Fruit already does).
2. The observer-bias and repeat-sighting inflation disappear (one point per
   patch, not one per photo per year).
3. The live iNaturalist API dependency is removed: no rate-limit exposure under
   traffic spikes, faster loads, works offline. This is a scaling win, directly
   relevant to promoting the site more widely.

Cost: a real build (national data ingest + thinning + chunking + a periodic,
~quarterly rebuild), and the loss of live freshness and per-observation
drill-down for stacked sightings. Those trade-offs are acceptable for a foraging
map ("where does this plant grow" is stable).

**Success criteria (acceptance):**
- At any point-zoom viewport, the overview aggregate circle count for a region
  equals the number of iNaturalist points that plot when you zoom in (same as
  Falling Fruit today).
- Herbs (medicine) mode, which is iNaturalist-ONLY, is fully covered.
- Obscured-coordinate safety handling is preserved (taxon-obscured dropped,
  observer-obscured badged approximate).
- `bash scripts/check.sh` passes (existing gates plus any new ones).
- Total served file count stays under Cloudflare's 20,000-file cap.
- `ATTRIBUTION.md` updated before it ships (project policy).
- The live `/v1/grid` and live `/v1/observations` code paths are removed (or
  gated behind an optional freshness fallback, see decision 8.5).

---

## 2. How Falling Fruit is baked today (the pattern to mirror)

Everything under `data/falling-fruit/us/` (~125 MB total). Built by an offline
pipeline in `scripts/`. Mirror this shape.

### 2a. Chunk files
- `chunks/w<lng>_n<lat>.json`, one per occupied 0.15-degree grid cell (2,905
  files, 82 MB). Filename encodes the SW corner: `west=floor(lng/0.15)*0.15`,
  `south=floor(lat/0.15)*0.15`, value = `round(abs(corner)*100)` zero-padded to 5
  digits, `w`/`e` by lng sign and `s`/`n` by lat sign
  (`build_falling_fruit_subset.py:426` get_chunk_id, `:457` format_axis).
  `CHUNK_SIZE_DEGREES=0.15`. Example: point 44.233,-68.319 -> `w06840_n04410`.
- Each file is a JSON array of positional record-arrays (no keys), field order =
  `manifest.recordFields`. FF's 15 fields:
  `[id, speciesId, name, observedName, observedScientificName, lat, lng, note,
  confidence, sourceUrl, idDate, access, accessClass, publicLand, accessNote]`.
- Records are sorted within each chunk by `(speciesId, lat, lng, id)` before
  writing. This fixed order is what the access-cache row-alignment depends on.
- JSON minified.

### 2b. manifest.json (1.87 MB)
Top-level: `source, scope, chunkType('degree-grid'), chunkSizeDegrees(0.15),
recordFields[], states[], chunks[], recordCount (global)`. Each `chunks[]` entry:
`{id, bbox:[w,s,e,n], recordCount, countsBySpeciesId, centroidsBySpeciesId, path}`.
Each `states[]` entry carries `countsBySpeciesId` + `centroidsBySpeciesId` that
feed the coarse overview aggregate. Stage 3 later ADDS to each chunk:
`accessCounts{mode:{status:{species:n}}}` and `accessCentroids{mode:{status:[lng,lat,count]}}`.

### 2c. The four build stages
1. **`build_falling_fruit_subset.py`** (source -> chunks + manifest + summary).
   FF input is two archived CSV.bz2 files. Emits chunks, manifest, summary.json.
   FF matches source rows to catalog species by TEXT regex (its `RULES`);
   **iNaturalist will match by taxon id instead**, see section 4.
2. **`fetch_padus_containment.mjs`** (access-cache builder). For each chunk,
   fetches USGS PAD-US polygons intersecting `chunk.bbox`, computes per-record
   containment, writes `access-cache/<chunk>.json`: a JSON array positionally
   row-aligned to the sorted chunk records; `cacheRows[i]` = the PAD-US property
   objects whose polygon contains `records[i]` (empty `[]` if none). Asserts
   `containment.length === records.length`. PAD-US endpoint:
   `https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/PADUS_Public_Access/FeatureServer/0/query`
   with `where="Pub_Access IN ('OA','RA')"`, `geometryType=esriGeometryEnvelope`,
   `f=geojson`, outFields `OBJECTID,Unit_Nm,Pub_Access,MngNm_Desc,MngTp_Desc,DesTp_Desc,GIS_Acres`,
   page 1000, geometryPrecision 5, outSR 4326. Throttle 500ms, 2 concurrent, one
   retry w/ 2s backoff. `--limit`, `--force`. Skips chunks whose cache exists.
3. **`build_access_status.mjs`** (bakes the overview aggregates — THE heart of
   "counts equal plotted points"). Loads app.js source, extracts ~40 rule
   functions + const tables + species catalogs into a Node `vm`. Also loads
   `data/rules/*.json`, `contiguous-us-states.json`, `local-jurisdictions.json`,
   `usfs-forest-rules.json`. For each chunk, for each record, for each mode in
   `FALLING_FRUIT_MODES` (currently `['food','ink']` — **iNat build must add
   `'medicine'`**): sets `state.activeMap`, resolves `getImportedSpeciesId`, sets
   `context.__cachedUnits = containment[index]`, calls `computeRecordAccessRule`,
   accumulates `accessCounts`/`accessCentroids` by `rule.status`. Statuses:
   `['allowed','permit-required','private','private-unsourced','unknown','prohibited']`.
   Writes the counts back into the manifest chunks. Has synthetic spot assertions
   (Shenandoah blueberry->allowed, Monticello blackberry->prohibited, etc.).
4. **Status-raster track** (separate): `fetch_padus_cell_containment.mjs` ->
   `cell-containment/*.json` -> `build_status_raster.mjs` -> `status-raster.json`
   (39,501 cells at 0.05 degrees, per-cell `{food,ink,medicine}` status + `fr`
   fractions on boundary cells). Today this exists ONLY to give the LIVE
   iNaturalist overview counts an access status. Once iNat is baked, its role
   shrinks to the FF live-PAD-US gap fallback (`getStatusRasterAccessRule`,
   app.js ~9348) — keep it, but it no longer feeds an iNat aggregate.

### 2d. Validation gates
`scripts/validate_data.mjs` checks (a)-(g), wired into `scripts/check.sh`. Most
relevant:
- (b) chunk file row count == chunk.recordCount.
- (c) sum of countsBySpeciesId across chunks == manifest.recordCount.
- (d) `access-cache/<id>.json` exists, parses, length == chunk record count.
- (e) accessCounts per species <= source species count.
The invariant that makes "overview == plotted" hold: chunk row count == recordCount
== sum(countsBySpeciesId) == manifest.recordCount, and the aggregate circle count
IS the summed accessCounts of the in-view points. The iNat bake must enter this
same chain. Extend or parameterize these checks for the iNat chunk tree.

---

## 3. Ingest: use GBIF, not the iNaturalist API

**Recommendation (strong): pull a GBIF occurrence download in Darwin Core Archive
(DWCA) format.** Rationale:
- The iNaturalist REST API needs ~14,000-20,000 cursor-paginated requests
  (page pagination caps at 10,000 results, so large taxa need `id_above` cursor
  paging). At the polite ~1 req/sec it is 4-5.5+ hours and hits iNaturalist's
  ~2h rate-limit wall (the phenology build hit it at 5,650 requests). Fragile,
  multi-session.
- GBIF is one async, rate-limit-free file. It mirrors iNaturalist research-grade
  observations and is only ~1-2 weeks behind live (fine for quarterly rebuilds).
- **Do NOT use GBIF SIMPLE_CSV** — it omits `informationWithheld`, the field that
  distinguishes observer-obscured from taxon-obscured. Use `format=DWCA`.
- Do NOT use the iNaturalist export tool (200k-row cap, unusable at this scale).

### 3a. GBIF dataset + download mechanics
- Dataset: **iNaturalist Research-grade Observations**, dataset key
  `50c9509d-22c7-4a22-a47d-8c48425ef4a7`, DOI `10.15468/ab3s5x`, license
  CC BY-NC 4.0. (Global ~157M occurrences; US ~64.7M.)
- Requires a free GBIF.org account (username + password, HTTP Basic Auth).
  **Owner must create/provide a GBIF account** (see decision 8.x / prerequisites).
- Async flow: `POST https://api.gbif.org/v1/occurrence/download/request` with JSON
  `{notificationAddresses, sendNotification, format:"DWCA", predicate}` -> returns
  a download key -> poll `GET .../download/{key}` until `status=SUCCEEDED` ->
  fetch `.../download/request/{key}.zip`. Each download mints a citable DOI.
- Predicate (AND of): `equals DATASET_KEY=50c9509d-22c7-4a22-a47d-8c48425ef4a7`,
  `equals COUNTRY=US`, `equals HAS_COORDINATE=true`, `in TAXON_KEY=[app taxon keys]`.
  (Up to 100,000 predicate params allowed; ~106 taxonKeys is fine.)
- `pygbif`/`rgbif` libraries wrap this; or use raw REST.

### 3b. License reality (aligns with project values)
GBIF mirrors only CC0/CC-BY/CC-BY-NC research-grade records. Across the app's
taxa (US research geo): raw ~3.94M; CC-eligible ~2.89M (73.5%) — the effective
GBIF record count. The other ~26.5% are all-rights-reserved and absent from GBIF.
**Do not chase the ARR records** — excluding them keeps the compilation
license-clean and NC-consistent, matching CLAUDE.md's license-respect value.

### 3c. DWCA fields to read (occurrence.txt)
`occurrenceID`/`references` = `https://www.inaturalist.org/observations/{id}`
(drives sourceUrl); `taxonID` = the iNaturalist taxon id (leaf); `taxonKey`/
`speciesKey` = GBIF backbone key; `license`; `coordinateUncertaintyInMeters`;
`recordedBy`/`rightsHolder` = observer login (attribution); `decimalLatitude`/
`decimalLongitude`; `eventDate`; `informationWithheld` (obscuration). GBIF
interpreted coords are rounded to ~5 decimals (finer than our thinning, so fine).

### 3d. Obscured handling (safety-critical, map cleanly from GBIF)
Reproduce today's app logic (app.js ~9066-9071) from `informationWithheld`:
- contains **"protect threatened taxon"** (taxon-obscured, ~0.3% of records) ->
  **DROP the record entirely** (conservation obscuration of sensitive taxa;
  keeping them on a foraging map violates the project's ethics/safety stance).
- contains **"at the request of the observer"** (observer-obscured, ~4.0%) ->
  **KEEP but set `approximate=true`** on the baked row (randomized ~±20 km). The
  UI badge at app.js ~7624 ("APPROXIMATE, iNaturalist obscured this location for
  privacy (±~20 km)") depends on this flag. Thin these at their obscuration-cell
  resolution (~0.2 deg), not finer, so they do not stack; consider counting them
  only in the aggregate and not plotting them tight (decision 8.4).
- Research-grade already excludes captive/cultivated ("casual"), so no extra
  captive filter is needed.

### 3e. Taxon resolution (iNat taxon id -> GBIF taxonKey)
The catalog `scientificName` is prose ("Rubus occidentalis and Rubus idaeus"),
not matchable. Do this instead:
1. For each of the 130 catalog `inatTaxonIds`, fetch its canonical name + rank
   from `https://api.inaturalist.org/v1/taxa/{id}`.
2. Match to a GBIF taxonKey via `https://api.gbif.org/v1/species/match`.
3. Cache the ~130-row mapping table as a build artifact.
4. Scope the GBIF download by **TAXON_KEY** (hierarchical, captures descendants /
   subspecies) — NOT the leaf taxonID (GBIF DWCA has no iNat ancestry).
5. Map each downloaded record back to an app `speciesId` using the DWCA `taxonID`
   (iNat leaf id) + the mapping table (and its descendant iNat ids; fetch children
   once from the iNat taxa API). Port `getSpeciesForObservation` (app.js ~9092/9094)
   semantics: match by iconic taxon + taxon.id OR ancestry.includes(taxonId).

### 3f. Thinning (measured, tunable)
Thin to ~1 point per distinct location PER SPECIES (two species at one spot = two
points). Measured keep-ratios (real data): 4 decimals (~11 m) keeps 0.90-0.97;
3 decimals (~110 m) keeps 0.58-0.89 (urban taxa lose most). **Recommend 4 decimals
for v1.** Projected baked volume at 4dec: ~2.6-2.7M points, ~140-190 MB minified
(FF is 82 MB for 232k records; a lean iNat row `[id, speciesId, lat, lng, date,
observer, approxFlag]` is ~60-90 B). Compute manifest counts from the POST-thin,
POST-obscured-drop set so overview == plotted.

---

## 4. App rewiring (app.js)

Good news: **Falling Fruit's overview aggregate is ALREADY precomputed from static
chunks, and live iNat is merged into the SAME aggregate pipeline.** `getAggregateItems`
(app.js ~6367) merges FF manifest chunk items with live iNat items
(`state.inatAggregateItems`) and feeds both through the same
`getGridAggregateFeatures`/`getAggregateRecordCount`/`getAggregateItemCenter`. So a
baked iNat dataset in FF manifest+chunk shape reuses nearly all the FF loader +
aggregate machinery.

Changes:
- **Add an iNat chunk source** parallel to FF (recommended: a second chunk tree,
  e.g. `data/inaturalist/us/`, with its own manifest, same shape). Reuse the FF
  chunk loader / `expandFallingFruitRecord` / `mapFallingFruitRecord` pattern, or
  a thin iNat variant if recordFields differ (they will: add `approximate`,
  `observer`; you can drop FF-only fields like `note`/`accessNote` and let the
  app fill defaults). Decide merged-vs-parallel per decision 8.7.
- **Delete the live-grid subsystem**: `scheduleINaturalistAggregateLoad` (~7710),
  `loadINaturalistAggregates` (~7803), `getINaturalistAggregateTiles` (~8233),
  `fetchINaturalistAggregateTile(WithRetry)` (~7900/8140), `getINaturalistGridItems`,
  the `INATURALIST_AGGREGATE_SPECIES_ID` branch of `getAggregateRecordCount`, and
  the async paint-gate/bridge tied to live aggregate loads. Overview counts now
  come from the baked iNat manifest chunks.
- **Delete/gate the live point path**: `loadINaturalist` (~8034),
  `getINaturalistRequestBounds` (~8078), `fetchINaturalistBounds(WithRetry)`
  (~7913/8053), and route iNat points through the chunk loader. Keep
  `mapINaturalistObservation`'s field semantics only insofar as the point card
  needs them.
- **Preserve the obscured badge**: the baked row's `approximate` field must still
  drive the "±~20 km" badge (app.js ~7624). Point-card fields to carry per row:
  `id` (`inat-{obsid}`), `speciesId`, `name`, `observedName`,
  `observedScientificName`, `lat`, `lng`, `sourceUrl` (observation URL), `idDate`
  (observed_on), `observer`, `approximate`. `access`/`accessClass` resolve via the
  existing rule engine / access-cache like FF.
- **Herbs (medicine) is iNaturalist-ONLY** (`MAP_MODE_CONFIG.medicine
  loadFallingFruit:false`). The bake MUST cover medicine, and `build_access_status.mjs`
  must add `'medicine'` to its modes so Herbs gets baked accessCounts.
- 113 species -> 130 distinct iNat taxon IDs across food(45)/ink(54)/Herbs(14).

Losses to flag to the owner (inherent, not bugs):
- Repeat observations collapse: only the representative (most-recent research-grade)
  observation's URL/observer/date survive per location. Per-observation drill-down
  for stacked sightings is intentionally gone (this is WHY inflation disappears).
  Optionally store a `collapsedCount` for context.
- Freshness: points are as fresh as the last quarterly rebuild + GBIF's ~2-week
  lag, unless a live fallback is kept (decision 8.5).

---

## 5. Build steps (new scripts, in order)

Put new scripts in `scripts/`, mirror the FF naming. Suggested:
1. `resolve_inat_gbif_taxonkeys.mjs` — 130 iNat taxon ids -> GBIF taxonKeys +
   descendant iNat id lists; write a cached mapping artifact.
2. `request_gbif_download.mjs` — POST the DWCA predicate, poll to SUCCEEDED,
   download the `.zip`, archive it (like the FF CSV archive) with the DOI + date.
   Needs GBIF credentials from the environment.
3. `build_inaturalist_subset.mjs` (the analog of `build_falling_fruit_subset.py`)
   — parse `occurrence.txt`, filter (CC license already GBIF-guaranteed; obscured
   rules 3d; taxon match 3e; drop out-of-CONUS via the same states polygon test),
   THIN (3f), sort each chunk by `(speciesId, lat, lng, id)`, emit
   `data/inaturalist/us/chunks/*.json` + `manifest.json` (counts from post-thin
   set) + `summary.json` (record the thinning rule + GBIF DOI + snapshot date).
4. `fetch_padus_containment.mjs` — reuse (parameterize its dir) to build the iNat
   `access-cache/` from the written chunks. Keep the length-equality assertion.
5. `build_access_status.mjs` — reuse, add `'medicine'` to modes, run over the iNat
   chunks to bake `accessCounts`/`accessCentroids` into the iNat manifest.
6. Extend `validate_data.mjs` + `check.sh` to validate the iNat chunk tree the
   same way (checks b/c/d/e), and add an acceptance check: for a sample region,
   summed manifest `countsBySpeciesId` == chunk-plotted count.

Do the record sort + thinning in ONE deterministic pass that emits the final
ordered chunk arrays, THEN build the access-cache from those written files (as
`fetch_padus_containment` does), so the positional alignment holds.

---

## 6. Risks and mitigations (from research)
- **Volume/size**: ~2.6-2.7M points, ~140-190 MB (1-2x FF). Measure post-thin
  counts per 0.15 cell in a DRY RUN before committing; tune thinning / grid size.
- **Cloudflare 20,000-file cap**: repo serves ~3,247 files now (2,905 FF chunks);
  iNat at 0.15 deg adds ~5,000-9,000 -> ~8,000-12,000 total, under cap but VERIFY
  during a dry run. If tight, use a coarser iNat grid (0.20-0.25 deg) or pack
  multiple species per chunk. (Per-file cap 25 MiB; largest FF chunk is 5.3 MB.)
- **GBIF vs iNat taxonomy divergence**: taxonKey scoping may include/miss a few
  records vs exact iNat targeting. Post-filter DWCA on `taxonID` against the app's
  taxon ids + descendants; spot-check per-species counts vs iNat `total_results`.
- **Observer-obscured (~4%) randomized coords** cluster on cell centers — keep
  flagged approximate; consider aggregate-only (decision 8.4).
- **Account-gated async download** — store a GBIF service credential in the build
  env; the whole request/poll/download is scriptable.
- **Perceived "data loss"**: overview drops from e.g. 3,971 to a much smaller
  honest count. This is intended; message it (the relabel already shipped helps).

---

## 7. Reference anchors (verify before editing; app.js shifts)
- FF chunk id: `build_falling_fruit_subset.py:426` (get_chunk_id), `:457` (format_axis),
  `:34-50` (recordFields), `:368` (record sort).
- Access-cache builder: `fetch_padus_containment.mjs` (`:192-195` length assert).
- Access-status bake: `build_access_status.mjs` (`:16` modes, `:17` statuses,
  `:399` length assert, spot assertions near end).
- Status raster: `fetch_padus_cell_containment.mjs`, `build_status_raster.mjs:17-21`
  (representative species per mode), app read `app.js` ~6687 (getStatusRasterCellKey),
  ~9348 (getStatusRasterAccessRule).
- Validation: `scripts/validate_data.mjs:248` (check d), `scripts/check.sh`.
- Live iNat point path: `fetchINaturalistBounds` app.js ~8053, `loadINaturalist`
  ~8034, `getINaturalistRequestBounds` ~8078, `INATURALIST_MAX_PER_PAGE=200`
  ~app.js:13, `place_id=1` (INATURALIST_REGION_PLACE_IDS).
- Live iNat aggregate path: `fetchINaturalistAggregateTile` ~8140 (/v1/grid),
  `getINaturalistGridItems`, `getAggregateItems` ~6367 (the MERGE point),
  `getAggregateRecordCount` (INATURALIST_AGGREGATE_SPECIES_ID branch).
- Obscured logic: `mapINaturalistObservation` app.js ~9058-9071; badge ~7624.
- Species match: `getSpeciesForObservation` ~9092/9094.
- Catalogs: `foodSpeciesCatalog`/`inkSpeciesCatalog`/`medicineSpeciesCatalog`,
  `inatTaxonIds:` (113 lines -> 130 ids). Herbs = iNat-only.
- Cloudflare/asset constraints: `.assetsignore`, `wrangler.jsonc`.
- ATTRIBUTION.md iNaturalist section (~line 13-19) to rewrite.

---

## 8. Decisions to make FIRST (owner sign-off), with recommended defaults

1. **Thinning resolution** — REC: 4 decimals (~11 m, ~2.6-2.7M points, ~180 MB).
   Fallback to 3 decimals only if repo size forces it.
2. **iNat chunk grid size** — REC: reuse 0.15 deg for consistency; switch to
   0.20-0.25 deg only if the dry-run file count crowds the 20k cap.
3. **Ingest fidelity** — REC: taxonKey-scoped GBIF download PLUS a post-filter on
   the DWCA `taxonID` column against the app's ids + descendants.
4. **Observer-obscured (~4%) points** — REC: keep them, flagged `approximate`,
   count in the aggregate, thin coarsely (~0.2 deg); decide whether to suppress
   them at tightest zoom.
5. **Static vs freshness fallback** — REC: go fully static for v1 (no live iNat),
   accept up to ~3 months + GBIF's ~2-week lag; revisit a "last quarter live
   overlay" later if freshness matters.
6. **Baked record schema** — REC: lean iNat-specific recordFields
   `[id, speciesId, lat, lng, idDate, observer, approximate]` plus derived
   name/sci from the catalog at load time; keep `sourceUrl` (observation URL) if
   size allows (it aids attribution + the card link).
7. **Merged vs parallel chunk tree** — REC: parallel (`data/inaturalist/us/`),
   both trees feeding the same aggregate pipeline. Simpler than merging into the
   FF chunks; the aggregate already merges multiple item sources.
8. **GBIF account** — owner must create a GBIF.org account and provide credentials
   to the build environment (required for the download API).

---

## 9. Effort + phasing
Multi-day. Suggested phases (the executing session can fan out sub-agents per
phase, per CLAUDE.md's in-session fan-out convention):
- Phase A: taxon-key mapping + a SMALL GBIF download (a few taxa, one state) to
  validate the whole pipeline end to end (parse -> thin -> chunk -> access-cache
  -> access-status -> app loads it -> overview == plotted). Confirm decisions.
- Phase B: full national GBIF download + build; measure size/file count; tune.
- Phase C: app rewiring (add iNat chunk loader, delete live-grid + live-point
  subsystems, preserve obscured badge + Herbs coverage).
- Phase D: gates + ATTRIBUTION.md + acceptance verification + a documented
  quarterly-rebuild runbook.

---

## 10. PHASE C IMPLEMENTATION PLAN (refined post-Phase-A, 2026-07-09)

Verified architecture facts (re-check line anchors; app.js moves):
- `loadMapData` (~7920) fans out sources; iNat is `config.loadMinerals ?
  Promise.resolve([]) : loadINaturalist()` (~7935).
- `loadFallingFruit` (~8303) -> `getFallingFruitManifest` (~8344) ->
  `getVisibleFallingFruitChunks` (~8360) -> `loadFallingFruitChunk` (~8371) ->
  `expandFallingFruitRecord` (~8397) -> `mapFallingFruitRecord` (~9111).
- Aggregate reads per-chunk `countsBySpeciesId`/`centroidsBySpeciesId` and
  resolves per mode via `getImportedSpeciesId`: `getAggregateItems` (~6347),
  `getAggregateRecordCount` (~6549, countsBySpeciesId reduce ~6571),
  `getAggregateItemCenter` (~6577, centroids ~6609),
  `getAggregateItemCategoryCounts` (~3254).
- Constants: `FALLING_FRUIT_MANIFEST_URL` (:50), `FALLING_FRUIT_MIN_LOAD_ZOOM=8`
  (:53), `FALLING_FRUIT_MAX_VIEWPORT_CHUNKS=160` (:54),
  `FALLING_FRUIT_CHUNK_CACHE_MAX=400` (:59). State cache fields: `fallingFruit
  Manifest/ChunkCache/ChunkLoads/Records` (~2226-2231).
- MAP_MODE_CONFIG (~2090): food/ink `loadFallingFruit:true`; medicine
  `loadFallingFruit:false` (Herbs is iNat-only, so baked iNat is its ONLY point
  source). All non-mineral modes load iNat.

Build it behind a flag so the live path is the zero-risk default until verified:
`const USE_BAKED_INATURALIST = false;` (flip to true only once the NATIONAL iNat
tree is committed + served; a flag-off build is byte-identical to today).

New app.js pieces (mirror the FF names, add an anchor resolver):
1. Constants: `INATURALIST_MANIFEST_URL="./data/inaturalist/us/manifest.json"`,
   `INATURALIST_CHUNK_CACHE_MAX` (~400). State: `inatChunkManifest`,
   `inatChunkCache`, `inatChunkLoads`, `inatChunkRecords`.
2. `getActiveInatAnchorSpeciesMap()` — memoized per `state.activeMap`: build
   `Map(anchorTaxonId -> species)` from the ACTIVE `speciesCatalog`
   (`for species; for species.inatTaxonIds`). Clear the memo in the mode-switch
   path that already resets `speciesCatalog` (~3881). This is the ONE resolver
   both the point loader and the aggregate use.
3. `getInatChunkManifest()` / `getVisibleInatChunks()` / `loadInatChunk()` /
   `expandInatRecord(row, fields)` — copies of the FF equivalents pointed at the
   iNat URL + caches (recordFields differ: `[id,anchor,lat,lng,idDate,observer,
   approximate]`).
4. `mapInatChunkRecord(record)` — resolves `species =
   getActiveInatAnchorSpeciesMap().get(record.anchor)`; drop if absent. Build the
   card object the live `mapINaturalistObservation` produced: `id:"inat-"+record.id`,
   `speciesId:species.id`, `name/observedName` from species, `lat/lng`,
   `approximate:!!record.approximate` (DRIVES the "±~20 km" badge at ~7624),
   `source:"inaturalist"`, `idDate:record.idDate`, `observer:record.observer`,
   `sourceUrl:"https://www.inaturalist.org/observations/"+record.id`,
   accessClass "unknown"/publicLand false/accessNote as today. Access resolves
   via the rule engine + the served-chunk manifest accessCounts, same as FF.
5. `loadINaturalistChunks()` — mirror of `loadFallingFruit` over the iNat tree
   (respect FALLING_FRUIT_MIN_LOAD_ZOOM gating; iNat points also load at zoom>=8).
6. Wire: in `loadMapData`, when `USE_BAKED_INATURALIST`, use
   `loadINaturalistChunks()` in place of `loadINaturalist()` for all non-mineral
   modes (Herbs included). In `getAggregateItems` (~6347), when the flag is on,
   push the iNat manifest chunks (for iNat modes) INSTEAD OF the live
   `getINaturalistAggregateItems`.

Aggregate branches (safe to add unconditionally — they only fire for items that
HAVE `countsByAnchor`, which only exist once baked iNat chunks load):
- `getAggregateRecordCount`: if `item.countsByAnchor`, sum over anchors whose
  `getActiveInatAnchorSpeciesMap().get(anchor)` is in `selectedSpeciesIds`
  (honor the accessFilter path via the already-baked `item.accessCounts[mode]`,
  which IS keyed by final species id, so that path is unchanged).
- `getAggregateItemCenter`: same, over `item.centroidsByAnchor`.
- `getAggregateItemCategoryCounts`: same, mapping anchor -> species -> category.

Verification (against the VA tree, or national once built): flip the flag on,
point the URL at the local tree, and assert in the app that the overview circle
count equals the plotted point count per mode (matches the offline
`validate_data.mjs` iNat (f) check), the ±20 km badge shows on an
`approximate:1` record, Herbs mode shows points, and ink shows the dye fungi.

DELETION (only AFTER the flag path is verified against national data): remove
`loadINaturalist`, `getINaturalistRequestBounds`, `fetchINaturalistBounds(WithRetry)`,
`scheduleINaturalistAggregateLoad`, `loadINaturalistAggregates`,
`getINaturalistAggregateTiles`, `fetchINaturalistAggregateTile(WithRetry)`,
`getINaturalistGridItems`, the `INATURALIST_AGGREGATE_SPECIES_ID` aggregate
branch, and the live aggregate paint-gate/bridge. Keep the status raster as the
FF live-PAD-US gap fallback only. Then default the flag on (or drop it).

Phase D leftovers already staged this session: `.assetsignore` excludes
`data/inaturalist/us/access-cache/` + `taxon-keys.json`; `validate_data.mjs` has
the iNat (a)-(f) gate (conditional on the tree existing). Still TODO in D:
ATTRIBUTION.md rewrite (iNat section -> GBIF DWCA DOI + CC BY-NC 4.0, note the
compilation is CC-eligible-only), a quarterly-rebuild runbook, and deciding
whether to git-commit the ~thousands of iNat access-cache files (FF commits its
cache; iNat's is larger, so weigh repo size vs rebuild reproducibility).

Keep the live iNat path working behind a flag until Phase C is verified, so the
map never regresses mid-build.

---

## 11. PHASE C DONE + GO-LIVE CHECKLIST (2026-07-09)

Phase C wiring LANDED in app.js (all flag-gated on `USE_BAKED_INATURALIST`,
default false):
- Constants `USE_BAKED_INATURALIST`, `INATURALIST_MANIFEST_URL`,
  `INATURALIST_CHUNK_CACHE_MAX`; state `inatChunk{Manifest,Cache,Loads,Records}`
  + `inatAnchorSpeciesMap`.
- `getActiveInatAnchorSpeciesMap()` (memoized, cleared in `syncActiveCatalog`).
- `getInatChunkManifest / loadINaturalistChunks / loadINaturalistChunk /
  mapInatChunkRecord / observationPlaceLabel` (mirror the FF loader; reuse
  `expandFallingFruitRecord`, `bboxIntersectsBounds`, `recordInBounds`,
  `getChunkCenterDistance`, `touchCacheEntry`, `trimCache`).
- `loadMapData` uses `loadINaturalistChunks()` when the flag is on.
- `getAggregateItems` pushes `state.inatChunkManifest.chunks`;
  `getAggregateRecordCount / getAggregateItemCenter /
  getAggregateItemCategoryCounts` gained `countsByAnchor`/`centroidsByAnchor`
  branches; `updateFallingFruitAggregates` loads the iNat manifest at overview
  zoom; `scheduleINaturalistAggregateLoad` + `loadINaturalistAggregates` no-op
  when the flag is on.

VERIFIED (2026-07-09): `node --check` + dup-lint pass; a vm harness drove the
ACTUAL app fns against the national tree -> app `getAggregateRecordCount` sum ==
plotted per mode (food 932,250 / ink 1,420,267 / Herbs 558,444); cross-mode
(one Sambucus obs -> elderberry/ink-elderberry/medicine-elderberry) + approximate
badge + category counts correct; flag-OFF boot is clean in-browser (no console
errors, live path unchanged); resolver + `mapInatChunkRecord` + manifest-serving
verified in the browser runtime. NOT verified locally: the visual Mapbox paint
(local map render is rAF-throttled; verify on a deploy).

GO-LIVE (owner-driven, do as ONE reviewed commit so the site never 404s the
manifest):
1. Commit the tree: `data/inaturalist/us/` (chunks + manifest;
   access-cache is .assetsignore'd from serving but decide whether to git-commit
   it) and `data/inaturalist/taxon-keys.json`.
2. Flip `USE_BAKED_INATURALIST = true` in app.js.
3. Bump the asset version query strings in index.html AND the sw.js cache
   version (see the version-sync gate; current `counts3` / `v1-counts3`).
4. Deploy to a preview and VISUALLY confirm: overview circle counts match
   plotted points on zoom-in; Herbs mode shows points; ink shows the dye fungi
   (turkey tail etc.); the "±~20 km approximate" badge shows on an obscured
   point; the point card links to the iNaturalist observation.
5. Update ATTRIBUTION.md (ready text below) and run `bash scripts/check.sh`.
6. THEN the DELETION in section 10 (live path is now dead) can land in a
   follow-up, and the flag can be dropped.

READY ATTRIBUTION.md text (replace the "## iNaturalist" body's first paragraph;
DOI 10.15468/dl.e6q6he; keep em-dash-free per owner style):

  The map plots iNaturalist research-grade observations precomputed into static
  viewport chunks, the same way the Falling Fruit records are chunked. The
  observations are sourced from a GBIF occurrence download of the iNaturalist
  Research-grade Observations dataset (GBIF.org, DOI 10.15468/dl.e6q6he),
  filtered to the app's taxa in the contiguous United States and thinned to
  roughly one point per location per species. GBIF mirrors only CC0, CC BY, and
  CC BY-NC records, so the compilation stays license-clean and noncommercial.
  Each point links back to its iNaturalist observation page. iNaturalist content
  remains owned by the contributor under Creative Commons Attribution-
  NonCommercial (CC BY-NC) unless otherwise specified. Do not reuse photos or
  other media without checking the license on the individual observation.
  Coordinates that iNaturalist obscured at the observer's request are shown with
  an approximate-location badge; observations obscured to protect sensitive taxa
  are omitted.

FOLLOW-UP (non-blocking): the manifest is 17 MB raw / 3.6 MB gzip. To trim:
derive `bbox`/`path` from the chunk id (drop them from the manifest; the loader
already has the id), reduce centroid precision to 4 dec, and/or split
accessCounts/accessCentroids into a lazy sidecar loaded only when the access
filter is first used. Rebuilding with a trimmed format re-runs the subset +
access-status but NOT the access-cache (id-keyed).
