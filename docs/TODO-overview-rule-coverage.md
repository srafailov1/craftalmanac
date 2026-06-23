# Work order: extend overview status-raster coverage to encoded-rule areas

> **STATUS: ✅ COMPLETE — core deliverables shipped 2026-06-18 in `2e82dac`
> ("Extend overview raster coverage"), broadened to 29 more parks in `4b5ee0b`
> ("Extend low-zoom overview coverage to the new national parks"). Verified
> 2026-06-23: `fetch_padus_cell_containment.mjs` has a region/bbox path
> (`NPS_REGION_BOUNDS_BY_MATCH` + `getRuleRegions`) that reads the rule lists
> from `app.js`; `build_status_raster.mjs` consumes the `region-*.json` cache;
> `scripts/test_overview_coverage.mjs` (Sequoia 38 cells, Kings Canyon 87,
> Indiana Dunes 12, all `food=allowed`) is wired into `scripts/check.sh` and
> passes; the 0.05° cell grid / `getStatusRasterCellKey` formula is unchanged.
> Raster re-baked 2026-06-23 → byte-identical (in sync). No further action.
>
> NOTE: This solved the **missing-coverage** half (rule areas with no Falling
> Fruit chunks now have raster cells). The separate **thin-park under/over-count**
> refinement (proportional `statusFractions` apportioning) is tracked in
> `KNOWN_ISSUES.md` item 1b and is NOT done — see that item.**

Owner tier: Codex. Author: Claude (2026-06-11 permissions pass). Branch: `main`.

## Problem (confirmed in code)

At low zoom (< 8) the map paints a live-iNaturalist overview. Each aggregate
cell's permission status comes from the baked status raster:

- `app.js` `getINaturalistAggregateAccessStatus()` (~line 2726) keys the cell's
  iNat centroid into `state.statusRaster[key][activeMap]`; a missing key returns
  `"unknown"`.
- `scripts/build_status_raster.mjs` bakes that raster **only** from the
  `data/falling-fruit/us/cell-containment/` cache (`readCellCacheFiles`, which
  also asserts exactly 9 cells per file).
- `scripts/fetch_padus_cell_containment.mjs` generates that cache by walking the
  **Falling Fruit manifest chunks** and fetching PAD-US containment for the
  0.05° cells inside each chunk.

Net effect: **overview permission coverage == the Falling Fruit chunk
footprint.** Anywhere with iNaturalist data but no Falling Fruit chunk has no
raster cell, so the overview shows `"unknown"` and cannot reflect the encoded
permission rule — even though the high-zoom point layer labels those same
records correctly (it computes the rule live).

Concretely (verified 2026-06-11): the newly encoded NPS gathering rules for
**Sequoia** and **Kings Canyon** (0 Falling Fruit chunks each) and **Indiana
Dunes** (a nearby FF chunk exists but its cached cells do not contain the park
polygon) are correct at the point level but absent from the overview. Rerunning
both build scripts produced byte-identical output for exactly this reason.

## Goal

Make the overview reflect encoded permission rules in areas that lack Falling
Fruit data, **without** an unbounded all-CONUS PAD-US fetch. Scope coverage to
the encoded-rule areas: the parks in `NPS_GATHERING_RULES` and the bounded
sites in `SITE_ACCESS_RULES`, padded slightly. (This also generalizes: any
future bounded rule area gets overview coverage from the same mechanism.)

## Phases

1. **Define coverage targets.** Produce the list of 0.05° cells to add: the
   cells covering the (padded) bounding boxes of each `NPS_GATHERING_RULES`
   park and each bounded `SITE_ACCESS_RULES` site that are **not already** in
   the cell-containment cache. Park extents: query PAD-US for the unit extent by
   `Unit_Nm`, or maintain a small explicit bbox table in the script — your call,
   but keep it data-driven from the rule lists where practical so new rules are
   picked up automatically.
2. **Fetch containment for the new cells.** Extend
   `fetch_padus_cell_containment.mjs` to also accept an explicit region/cell
   list (in addition to the manifest-chunk path), fetch PAD-US containment with
   the **same throttling** (500 ms spacing, concurrency 2, retry/backoff), and
   persist results in the cell-containment cache. **Design question to resolve:**
   `readCellCacheFiles` currently requires 9 cells per file (one FF chunk). The
   new cells will not group into FF chunks, so either (a) introduce a parallel
   cache file naming/format for region cells and teach `readCellCacheFiles` to
   read both, or (b) relax the 9-cell invariant. Pick one, document it in the
   script header, and keep the per-cell record shape identical (`key`, `center`,
   `units`).
3. **Rebuild the raster.** Rerun `node scripts/build_status_raster.mjs` and
   commit the regenerated `status-raster.json`. Confirm previously covered cells
   are unchanged (Great Smoky food=allowed, Manhattan NYC-park food=prohibited
   still pass the existing in-script validation).
4. **Gate.** Add `scripts/test_overview_coverage.mjs` (or fold into
   `test_rules.mjs`) asserting the rebuilt raster has cells whose center lies in
   Sequoia NP, Kings Canyon NP, and Indiana Dunes NP, each with
   `food === "allowed"` (representative species is `blackberry`). Wire it into
   `scripts/check.sh`. Acceptance: the gate exits 0 and `bash scripts/check.sh`
   stays green.

## Boundaries

- **Do not** change permission-rule semantics in `app.js`
  (`NPS_GATHERING_RULES`, `SITE_ACCESS_RULES`, `getStateSystemRule`, the agency
  matchers). Those are Claude-tier; this work only changes which cells get baked,
  not what status a cell resolves to.
- **Do not** fetch all of CONUS; keep the fetch bounded to the rule-area cells.
- **Do not** change the 0.05° cell grid size or the
  `getStatusRasterCellKey` formula — overview lookups depend on it.
- Keep the existing FF-chunk cell files and their schema intact.

## Notes

- Cell size is 0.05° (`CELL_SIZE_DEGREES` in `fetch_padus_cell_containment.mjs`;
  matches `getStatusRasterCellKey`). Keep them in lockstep.
- The Falling Fruit *count* layer is a separate concern and correctly shows
  near-zero in these remote parks; this work order is only about the iNaturalist
  overview's permission **status**, not record counts.
- After this ships, the standing rule still holds: whenever permission rules
  change, rerun `build_access_status.mjs` **and** `build_status_raster.mjs`.
