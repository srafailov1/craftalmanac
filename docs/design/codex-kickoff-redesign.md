# Codex Kickoff: Redesign Data Lane

Paste-ready prompt for starting Codex on its redesign deliverables.
Owner-approved 2026-06-12. C1–C3 may start immediately; C4 waits until
Phase 2 work exists on the branch to audit.

---

You are Codex, working the data lane of the Craft Almanac redesign
migration. Work on branch `design/relaunch` ONLY — never `main`. Commit
locally with short imperative messages; never push.

Read first: `CLAUDE.md`, then `docs/design/work-order-redesign.md`
(section 2, Codex lane — your contract), then
`docs/TODO-filtered-aggregates.md` (your existing discipline applies:
conservative defaults, offline outputs must equal what the app would
compute, verification before claiming done).

Your deliverables, in order:

**C1 — Tide station index.** `scripts/build_tide_stations.mjs` fetching the
NOAA CO-OPS metadata API (https://api.tidesandcurrents.noaa.gov/mdapi/prod/)
for all US tide-prediction stations, emitting `data/tide-stations.json`
(id, name, lat, lng — keep it small). Include a nearest-station helper
function spec in your integration note. Verify: spot-check 5 stations
against the CO-OPS website; Providence 8454000 must be present.
The app will resolve tide by the user's forecast location (geocoded place
or map-area), so the index must cover all US coasts including AK/HI.

**C2 — Phenology histograms.** Per-species 12-month relative-abundance
arrays from iNaturalist observation data (histogram endpoint), one file per
mode: `data/phenology/{food,ink,medicine}.json`, keyed by the species ids
in `app.js`'s catalogs. Generator script + license note (iNaturalist data
is CC; record exact terms for ATTRIBUTION.md). Verify: arrays sum > 0,
length 12, and a sanity check that at least elderberry and black walnut
peak in the months a forager would expect.

**C3 — Flush thresholds.** `data/flush-thresholds.json`: mm-per-72h rain
thresholds for the species on the edible-mushroom whitelist ONLY (check
`SAFETY_TAGS_BY_SPECIES` / the whitelist in `app.js`). Conservative values
with a source note per species; flag anything uncertain for owner review
rather than guessing. This gates a UI feature ("flush likely"), so err low
on confidence and high on threshold.

**C4 — HOLD.** Aggregates-on-Standard audit: do not start until the Phase 2
Standard-style branch state exists; you will be pinged.

Boundaries: do not edit `styles.css`, `index.html`, or the popup/rail/map
sections of `app.js`. Each deliverable lands as data + script + a short
integration note in `docs/design/notes-codex-<id>.md`. If a fetch source is
unreachable, document and stop rather than substituting another source.
