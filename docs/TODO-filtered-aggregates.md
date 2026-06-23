# TODO: Permission-Filtered Overview Aggregates

**Owner-approved project. Assigned to Codex.** Goal: the Access & Permissions
filter should genuinely re-aggregate the zoomed-out overview circles, by
precomputing a permission status for every Falling Fruit record offline.
When this ships, the interim beacon layer and access-filter notice
(`PERMISSION_BEACON_*`, `#accessFilterNote`) are removed.

> **STATUS (reviewed by Claude, 2026-06-12):** Phases 1-4 delivered in
> commits 9b4d453 / b73576a / 015583b and APPROVED. Independent validation:
> 2,905/2,905 containment caches with zero failures; per-chunk status sums
> reconcile (12,101 species checks, 0 violations); Manhattan majority
> prohibited within NYC-park containment; Monticello chunk correctly has no
> records inside the prohibition bounds. The NYC local-park inference
> (`docs/permission-inferences-2026-06.md`) is approved — its bounding box
> excludes Yonkers and the state-code guard excludes NJ; the nightly
> permissions-research loop now owns refining it. The adapted Shenandoah
> validation gate (FF has no in-park records) is accepted.
>
> **STATUS 2026-06-23: ✅ ALL PHASES COMPLETE.** Phase 5 (iNaturalist overview
> statuses via the baked `status-raster.json`) shipped — the cell-containment
> cache, the status-raster bake, and the app integration are all in place;
> `status-raster.json` (39,388 cells) re-baked 2026-06-23 → byte-identical (in
> sync). The only open refinement to the overview filter is the thin-park
> proportional apportioning tracked in `KNOWN_ISSUES.md` item 1b (the raster
> currently bakes one status per cell, not per-status fractions).

## Phase 5 — iNaturalist overview statuses (approximate, clearly labeled)

iNaturalist overview counts are live UTFGrid totals and can never carry
exact per-record permissions. Approximate them by area instead of hiding
them, and label the approximation honestly.

1. **Cell containment cache.** New script or extension of
   `scripts/fetch_padus_containment.mjs`: for each manifest chunk bbox,
   while its PAD-US polygons are fetched (reuse the existing per-chunk
   flow and its soft-error handling), classify the 3x3 grid of 0.05-degree
   cell centers inside that bbox and write
   `data/falling-fruit/us/cell-containment/{chunkId}.json` — per cell:
   the containing-unit property objects (properties only, no geometry).
   ~26k cells total; resumable and throttled exactly like Phase 1.
2. **Status raster bake.** Extend `scripts/build_access_status.mjs` (or a
   sibling sharing its extraction harness) to emit
   `data/falling-fruit/us/status-raster.json`: one entry per 0.05-degree
   cell -> `{food, ink, medicine}` statuses, computed through the SAME
   extracted rule chain used for records (site rules by cell center, land
   rule from cached units, fallback unknown). Note: medicine statuses are
   computed here even though FF records don't load in medicine mode — the
   raster is what makes the filter meaningful in Herbalism.
   Validation gates: raster cells inside Great Smoky -> allowed (food);
   inside Manhattan NYC-park cells -> prohibited; cells with no cached
   units -> unknown. Rerun instruction joins the maintenance note in
   `docs/permissions-research-2026-06.md`.
3. **App integration.** When the access filter is active at overview zoom:
   instead of dropping iNaturalist aggregate items, look up each item's
   centroid in the status raster (simple lat/lng -> 0.05 cell key; load
   the raster lazily once) and include the item only if its cell status
   for the active mode is among the selected statuses. Centroids outside
   raster coverage classify as "unknown". Update `#accessFilterNote` text:
   live observation counts are filtered by AREA rules, approximately —
   point-level labels remain exact. Falling Fruit aggregate behavior
   (exact, baked) is unchanged.
4. **Verification.** Unit-test the cell-key math and three raster lookups
   with the extraction harness; `node --check app.js`; bump `?v=` strings;
   one commit per step above. The same Boundaries section at the bottom of
   this file still applies.

Read `CLAUDE.md` first (project values, conventions, workflow). Key values
here: occurrence is never permission; conservative defaults; every offline
status must equal what the app itself would compute for the same record.

## Why offline precomputation

Overview circles (zoom < 8) are built from pre-aggregated counts in
`data/falling-fruit/us/manifest.json` (2,905 chunks, 231,798 records) plus
live iNaturalist grid totals. Permission status is computed per record in
`app.js` (`computeRecordAccessRule`) and needs PAD-US polygon containment,
which is only fetched near point zoom. So statuses must be precomputed and
baked into the manifest.

## Phase 1 — PAD-US containment cache (mechanical, resumable)

New script `scripts/fetch_padus_containment.mjs` (Node, no deps beyond
built-ins):

- For each chunk in the manifest: query the PAD-US service used in `app.js`
  (`PUBLIC_LANDS_URL`) with the chunk's bbox as an envelope, `where:
  Pub_Access IN ('OA','RA')`, `outFields:
  OBJECTID,Unit_Nm,Pub_Access,MngNm_Desc,MngTp_Desc,DesTp_Desc,GIS_Acres`,
  `f: geojson`, paginated 1000/page exactly like `loadPublicLands` (including
  `resultOffset` and the soft-error check: a `data.error` body arrives as
  HTTP 200 — treat it as a failure. This burned us once; see commit 7674d88).
- Point-in-polygon every record in the chunk against the returned features
  (port `pointInRing`/`pointInPolygon`/`pointInFeature` from app.js verbatim,
  with the bbox pre-filter from `getFeatureBbox`).
- Write `data/falling-fruit/us/access-cache/{chunkId}.json`: an array aligned
  with the chunk's record array; each element is the list of containing-unit
  property objects (properties only — never geometry; keep the cache small).
- Resumable: skip chunk ids whose cache file exists. Throttle: max 2
  concurrent requests, 500ms spacing, retry once with backoff on failure,
  log failures to `access-cache/_failures.json` and continue. Expect ~1-2
  hours for a full run. Re-run until `_failures.json` is empty.
- Commit the cache directory. It only changes when PAD-US units change;
  a yearly refresh is plenty.

## Phase 2 — status computation + manifest schema (rule fidelity critical)

New script `scripts/build_access_status.mjs`:

- **Do not reimplement rule logic.** Extract the rule functions and constants
  from `app.js` by regex and `eval` them in Node — the proven harness pattern
  (see the unit-test blocks in recent commit messages; pattern:
  `src.match(new RegExp("function NAME\\([^)]*\\) \\{[\\s\\S]*?\\n\\}"))`).
  Provide a fake `state` object (`activeMap`, `accessRuleCache: new Map()`,
  `stateBoundaries` loaded from `data/contiguous-us-states.json`). This
  guarantees the offline statuses match the live app for the same inputs.
- For each record, for each mode that loads Falling Fruit (**food** and
  **ink** only): replicate `computeRecordAccessRule`'s exact order:
  1. site rule (`getSiteAccessRule`-equivalent over `SITE_ACCESS_RULES`
     bounds, mode-aware via `rules[mode] || rules.default`),
  2. land rule via `getBestPublicLandAccessRule(cachedUnits.map(p =>
     ({properties: p})), species, stateCode)` where `cachedUnits` comes from
     the Phase 1 cache and `stateCode` from `getRecordStateCode`,
  3. `accessClass === "private"` -> private,
  4. `publicLand && accessClass === "open"` -> unknown,
  5. fallback -> private-unsourced.
- Species resolution per mode matters: apply `getImportedSpeciesId` (ink-mode
  aliases like black-walnut -> ink-black-walnut, and food-mode prunus ->
  sweet-cherry) and look the species up in that mode's catalog. Records whose
  species doesn't exist in a mode's catalog get no status for that mode (they
  never display there).
- Augment each manifest chunk entry with:
  ```
  "accessCounts": {
    "food": { "<status>": { "<speciesId>": count, ... }, ... },
    "ink":  { ... }
  },
  "accessCentroids": {
    "food": { "<status>": [lng, lat, n], ... },
    "ink":  { ... }
  }
  ```
  Statuses are the six ids in `ACCESS_STATUS_OPTIONS`. Keep it sparse (omit
  empty statuses). `accessCentroids` is per-status only (not per-species) —
  positional approximation is fine at overview zoom.
- **Validation gates (script must enforce, exit nonzero on failure):**
  - For every chunk and mode: summing `accessCounts[mode][*][speciesId]`
    across statuses equals `countsBySpeciesId[speciesId]` for every species
    present in that mode's catalog (after aliasing).
  - Spot assertions: a Shenandoah-interior chunk is majority `allowed` for
    blueberry in food mode; the Monticello-area records are `prohibited`;
    a Manhattan chunk is majority `prohibited`.
  - Total record count unchanged.
- The script must be **re-runnable after rule changes**: when the nightly
  permissions-research loop adds rules to `app.js`, rerunning this script
  (Phase 1 cache untouched) refreshes statuses. Add that instruction to the
  end of `docs/permissions-research-2026-06.md` once this ships.

## Phase 3 — app integration

- `getAggregateRecordCount` / `getAggregateItemCenter` in `app.js`: when the
  access-status selection differs from the full set AND the item has
  `accessCounts`, intersect selected statuses with selected species for the
  active mode (fall back to current behavior for items without the data).
- iNaturalist grid cells cannot be status-filtered (live totals). **Decided:**
  when the access filter is active at overview zoom, exclude iNat aggregate
  items entirely and skip the grid fetches; repurpose `#accessFilterNote` to
  say live iNaturalist counts are hidden while permission filters are active.
  When the filter is default, behavior is unchanged.
- Remove the beacon layer, its legend row, and related code
  (`PERMISSION_BEACON_*`, `getPermissionBeaconCollection`,
  `updatePermissionBeacons`, beacon map handlers, `.legend-beacon` CSS).
- Medicine mode loads no Falling Fruit; aggregates there are iNat-only, so an
  active filter shows an empty overview plus the note — acceptable, mention
  it in the commit message.
- Keep point-level classification exactly as is (live PAD-US; it can be
  fresher than the baked statuses — that drift is accepted and documented).

## Phase 4 — verification & handoff

- `node --check app.js`; unit-test the new aggregate filtering with the
  extraction harness (filtered count = sum of selected statuses x species).
- Local serve (`python3 -m http.server 4173`) smoke test: default filter ->
  unchanged overview; "Allowed"-only -> Shenandoah/GRSM areas keep counts,
  Manhattan goes quiet.
- Bump asset version query strings in `index.html`. Update `ATTRIBUTION.md`
  only if a new data source was used (none expected). Commit locally with
  short imperative subjects, one commit per phase. **Never push.**
- Flag in the final commit message anything ambiguous found in rule
  replication — the owner reviews everything in GitHub Desktop.

## Boundaries (do not touch)

- The zoom-handoff/bridge code (`updateLayerHandoff`, `beginAggregateBridge`,
  aggregate paint gating) — an active debug effort owns it; see
  `KNOWN_ISSUES.md`. Coordinate by not overlapping.
- Species catalogs, safety tags, harvest-ethic labels, and any safety or
  disclaimer language.
- `SITE_ACCESS_RULES` / `NPS_GATHERING_RULES` contents (the nightly research
  loop owns them); your scripts only consume them.
