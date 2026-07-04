# Work order — regionalize the seasonality model (Phase 5.3)

The critique's single biggest CONTENT-CORRECTNESS finding. Every species carries
one nationwide month window (`species.months` in the catalogs) and one national
phenology curve (`data/phenology/<mode>.json`, built with iNaturalist
`place_id=1` = all of the US). So "in season", the day slider, and the histogram
present a contiguous-US average as local truth — off by 4–8 weeks for users
outside the mid-latitude band (elderberry ripens weeks apart in New England vs
the Gulf; morels fruit March in Georgia, May–June in Michigan).

The honest interim caveat already ships (the histogram header line "Contiguous-US
average — local ripening can differ by weeks", commit in Phase 1.4). This work
order replaces the average with region-aware curves and removes the caveat where
data supports it.

## OWNER DECISION NEEDED FIRST — regional scheme

Pick the binning before building (affects API volume and per-region sample size):

- **Option A — 4 coarse latitude/climate bands** (recommended default):
  Northeast/Upper-Midwest (cold), Southeast/Gulf (warm-humid), Mountain-West/
  Southwest (arid), Pacific (maritime). ~4× the API calls of the national build
  (~113 species × 4), robust sample sizes, viewport→band is a simple lat/long
  lookup. Best correctness-per-cost.
- **Option B — per-state (48)**: most precise, but 48× API volume (rate-limited,
  ~hours, likely 429s) and many species×state cells too sparse to be reliable.
  Not recommended.
- **Option C — iNaturalist place hierarchy** (e.g. EPA Level II ecoregions if
  iNat has place_ids for them): ecologically correct but requires mapping
  viewport→place_id and confirming iNat coverage. Higher effort.

Default to A unless the owner says otherwise.

## Build

1. `scripts/build_phenology_histograms.mjs`: parameterize `INATURALIST_PLACE_ID`
   → an array of `{ regionKey, placeId, bbox }`. For each mode × species ×
   region, fetch the month-of-year histogram (keep the existing 1.2s throttle +
   Retry-After backoff — the whole build is long; make it resumable / cache
   partial results to a temp file so a 429 mid-run doesn't lose everything).
   Emit region-keyed JSON: `{ "<speciesId>": { "<regionKey>": [12 floats], ... } }`
   per mode, plus a `national` fallback key per species (reuse place_id=1) for
   sparse regions / when the viewport region is unknown.
   - Sparse-cell rule: if a region has < N total observations for a species
     (pick a floor, e.g. 30), fall back to that species' `national` curve rather
     than shipping a noisy curve. Record which cells fell back.
2. Update the `--verify` gate to the region-keyed shape (every catalog species
   has at least a `national` curve; region curves are 12-length 0–1).

## App

3. `app.js`: a `getViewportRegion()` from `map.getCenter()` (lat/long → regionKey
   via the band bboxes). `phenologyByMode` lookups become
   `curve = phenology[speciesId]?.[region] ?? phenology[speciesId]?.national`.
   Touch points: the histogram builder (`renderHistogram`), and
   `isSpeciesAvailableOnSelectedDate` — derive the month window from the regional
   curve (months above a relative-abundance threshold) instead of the hand-set
   `species.months`, OR keep `species.months` as the fallback and only tighten
   with regional data. Re-render phenology on `moveend` when the region changes
   (debounced; region changes are rare, so cheap).
4. Remove/relax the national-average caveat once a region's curve is in use;
   keep it as a fallback-state label ("national average — sparse local data")
   when a species falls back to `national` for the current region.

## Gates / acceptance
- `node scripts/build_phenology_histograms.mjs --verify` green; `bash scripts/check.sh` green.
- The date slider / histogram visibly shift when the map moves between two bands
  for a species with real regional variation (e.g. morel, elderberry).
- Don't silently drop the caveat where data is sparse — show the fallback label.

## Boundaries
- Rule semantics, safety tags, catalogs untouched. This is the seasonality axis only.
- The API build is the slow/fragile part — make it resumable and log every
  sparse-fallback so the result is auditable, not a black box.
