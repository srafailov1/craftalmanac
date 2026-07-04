# Work order — regionalize the seasonality model (Phase 5.3)

The critique's biggest CONTENT-CORRECTNESS finding: every species carries one
nationwide phenology curve (`data/phenology/<mode>.json`, built with iNaturalist
`place_id=1`), so "in season", the day slider, and the histogram present a
contiguous-US average as local truth — off by weeks outside mid-latitudes.

**Decision made (owner, 2026-07):** bin by **Köppen climate groups**, because
Köppen is defined on the seasonal distribution of temperature and rainfall (the
axis that drives timing) rather than winter-minimum extremes (hardiness zones).
The region scheme is authored in `data/phenology-regions.json` — 5 collapsed
CONUS Köppen groups (continental, subtropical, mediterranean, marine, semiarid)
with every state assigned to one. The honest interim caveat already ships
(Phase 1.4 / the Now view).

## Build — `scripts/build_phenology_histograms.mjs`

Key idea: **pull per-STATE once (iNat's queryable unit), then aggregate states
into Köppen groups by summing member-state monthly histograms.** This decouples
what iNat can query (states) from how we bin (groups) — re-binning later needs
no re-pull.

1. Resolve each state name in `data/phenology-regions.json` → iNat place_id
   (via `GET /v1/places/autocomplete?q=<state>`, filter place_type 8 / admin
   level state, country US; DC is place_type 8 too). Cache the name→place_id map
   to `data/phenology/.state-place-ids.json` (committed) so the resolve step
   isn't repeated.
2. For each mode × species × state: fetch the month-of-year histogram (reuse the
   existing annotation logic — fruits/flowers/fungal). Also fetch the `national`
   (place_id=1) curve per species as the fallback.
   - **RESUMABLE + POLITE**: ~113 species × 48 states ≈ 5,400 requests. Throttle
     ≥ 1.3s, honor Retry-After on 429 (the builder already has backoff — extend
     it). Write partial results to `data/phenology/.partial-<mode>.json` after
     every species so a mid-run failure resumes instead of restarting. Log a
     running count.
3. Aggregate: for each species, sum the raw monthly COUNTS of the states in each
   group, then relative-normalize the summed counts (0..1 over the 12 months) —
   normalize AFTER summing, not per-state. Emit region-keyed JSON per mode:
   `{ "<speciesId>": { "national":[12], "continental":[12], "subtropical":[12], ... } }`.
   - **Sparse-cell rule**: if a group's summed observation total for a species is
     below a floor (start at 40), DROP that group key for that species (the app
     falls back to `national`). Record every dropped cell to a
     `data/phenology/.sparse-report.json` so the result is auditable, not a
     black box.
4. Update the `--verify` gate to the region-keyed shape: every catalog species
   has at least a `national` 12-length 0..1 curve; any present group curve is
   12-length 0..1; region keys ⊆ the groups in phenology-regions.json.

## App — `app.js`

5. Load `data/phenology-regions.json` at boot (small; alongside the existing
   loaders). `getViewportRegion()`: point-in-state on `map.getCenter()` reusing
   the existing state polygons (`state.stateBoundaries` / the point-in-feature
   helpers) → the state's group; return `null`/`national` when outside CONUS.
6. Phenology lookup becomes
   `curve = phenology[id]?.[region] ?? phenology[id]?.national`. Touch points:
   `renderHistogram` (biotic), `isSpeciesAvailableOnSelectedDate`, and the Now
   view's PEAK/COMING logic. Keep `species.months` as the ultimate fallback when
   even `national` is missing.
7. Re-render phenology when the viewport region CHANGES (debounced on moveend;
   compare last region, cheap — most moves stay in-region).
8. Caveat handling: when the current species×region uses a real regional curve,
   the histogram caption can drop the "contiguous-US average" line for a
   region-named one (e.g. "Humid subtropical — regional timing"); when it falls
   back to `national`, KEEP the average caveat (and optionally note "national
   average — sparse local data"). Do not silently drop the caveat on fallback.
9. Add the region JSON + the new phenology files to the PWA precache list in
   `sw.js` (they're small, off-grid-relevant) and bump CACHE_VERSION/ASSET
   version per docs/pwa.md.

## Gates / acceptance
- `node scripts/build_phenology_histograms.mjs --verify` green; `bash scripts/check.sh` green.
- Moving the map between two groups (e.g. a Marine-WA center vs a Subtropical-GA
  center) visibly shifts the histogram / Now lists for a species with real
  regional variation (elderberry, morel).
- Sparse fallbacks show the national-average caveat, never a silent noisy curve.

## Boundaries
- Rule semantics, safety tags, catalogs untouched — seasonality axis only.
- The region assignment lives in `data/phenology-regions.json`; don't hardcode
  it in app.js or the builder — both read that file.
- Make the API build auditable: commit the state-place-id cache and the
  sparse-report so the result can be inspected without re-running.
