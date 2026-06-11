# TODO: Permission-Filtered Overview Aggregates

**Owner-approved project. Assigned to Codex.** Goal: the Access & Permissions
filter should genuinely re-aggregate the zoomed-out overview circles, by
precomputing a permission status for every Falling Fruit record offline.
When this ships, the interim beacon layer and access-filter notice
(`PERMISSION_BEACON_*`, `#accessFilterNote`) are removed.

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
