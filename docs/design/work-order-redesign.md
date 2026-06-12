# Work Order: Living-Map Redesign Migration

**Status:** Approved plan, awaiting owner kickoff per phase.
**Branch:** all work on `design/relaunch`. `main` stays stable until Phase 7
cutover. The owner pushes; agents commit locally only.
**Prototype of record:** `prototype/index.html` (rev 14, d4252a7) — the
owner-approved reference for every visual and interaction decision below.
Where this document and the prototype disagree, the prototype wins.

Read `CLAUDE.md` first. Non-negotiables that apply to every task in every
lane: occurrence is never permission; safety colors are fixed semantics in
every register; the medicine/herbalism disclaimer stays prominent; no new
mushroom taxa without the species-level whitelist; no build step, vanilla
JS/CSS only; new data sources enter `ATTRIBUTION.md` before they ship.

---

## 1. What is being migrated

The prototype proved a design and a set of systems on demo data. Production
(`app.js` ~3,900 lines, `styles.css`, `index.html`) has the real data and
rules. The migration carries these prototype systems into production
without losing any production behavior:

| System | Prototype source | Production target |
|---|---|---|
| Light registers (dawn/day/dusk/night) | CSS var sets + solar math | `styles.css` tokens + register engine in `app.js` |
| Solar dial + simulated time | sun panel | conditions rail |
| Conditions rail (sun, moon, rain, wind, tide) | rail + panels | new floating UI region |
| Radar at low zoom (RainViewer) | `loadRadar` | raster layer beside existing aggregates |
| Wind streak canvas (zoom ≥ 7.5) | `fx` canvas | overlay canvas, tier-quantized |
| Quiet Pigment card system | floating cards | all popups, panels, sheets |
| Anchored point popups (access/use/safety + attribution) | `cardHTML` | replaces existing popup builder |
| Legend (bold LEGEND:, active map, category + access filters) | `#legend` | replaces current panel filters UI |
| Season slider (date label, hover histogram, date/time/place) | `#season` | replaces current season UI |
| Masthead nav + sheets (Maps/Plants/Recipes/About) | `#masthead` | replaces current panel chrome |
| Mobile responsive layer | media queries + toggles | same technique, real content |

Production behaviors that must survive unchanged: the three mode catalogs
and their categories, safety tags and harvest-ethic labels per species,
access-status computation and rule citations (NPS compendiums, 36 CFR 2.1),
PAD-US polygons, Falling Fruit viewport chunks at zoom ≥ 8, the
filtered-aggregates pipeline, attribution page, and the iNaturalist API
integration.

## 2. Lanes and boundaries (the contract)

**Claude (interactive sessions with the owner).** Architecture and all
design-sensitive surfaces: styles.css token system, map style migration,
register engine, floating UI, popups, legend, season slider, sheets, mobile
layer, and final integration review of everything entering
`design/relaunch`. Claude is the only lane that edits map initialization
and popup logic.

**Codex (per `docs/TODO-filtered-aggregates.md` discipline).** Data and
pipeline lane, deliverables as files + scripts, never UI:
- C1. Tide station index: `data/tide-stations.json` (NOAA CO-OPS station
  list with coords) + `scripts/build_tide_stations.mjs`; nearest-station
  lookup must be verifiable against the CO-OPS metadata API.
- C2. Phenology histograms: per-species 12-month relative-abundance arrays
  derived from iNaturalist observation data,
  `data/phenology/<mode>.json` + generator script. These power the season
  slider stack and popup sparklines with real curves instead of the
  prototype's synthetic bells.
- C3. Flush-threshold table for whitelisted fungi (mm/72h per species,
  conservative, sourced) — lands as data reviewed by the owner.
- C4. Filtered-aggregates compatibility audit for the Standard style
  (slot placement of its layers) — Codex owns its own layers' port.
Boundaries: Codex does not edit `styles.css`, popup or rail code. Output is
data, scripts, and a written integration note per deliverable.

**Qwen (per `AGENTS.md`: small tasks, each with a verification gate).**
- Q1. Solar/lunar math module test harness: `scripts/test_solar.mjs`
  asserting rise/set/phase against published almanac values for 3 dates ×
  3 cities. Gate: `node scripts/test_solar.mjs` exits 0.
- Q2. Register-contrast audit script: checks every (status color × register
  ground) pair meets contrast thresholds; emits a report. Gate: exit 0.
- Q3. Font-size floor sweep: assert no rendered CSS font-size < 10.5px.
  Gate: a grep-based check script exits 0.
- Q4. Reduced-motion audit: every animation has a `prefers-reduced-motion`
  path. Gate: checklist script exits 0.
Boundaries: Qwen never edits `app.js` map/popup/rail sections; it works on
`scripts/` and isolated CSS token blocks only, one task per session, with
the gate command stated in the task.

**Nightly agents (unchanged, on `main`).** The 4am debug loop keeps owning
`KNOWN_ISSUES.md`; the permissions loop keeps owning rule tables. After
cutover, migration-watch items enter the debug queue. Neither agent works
on `design/relaunch`.

**Conflict rule:** if two lanes need the same file, Claude sequences the
work; nobody resolves someone else's merge conflict.

## 3. Phases

Each phase ends with its gate passing and a local commit the owner can
review in GitHub Desktop. Phases are ordered by dependency; within a phase,
lane tasks can run in parallel.

### Phase 0 — Pre-flight (Claude, ½ session)
- Merge current `main` into `design/relaunch` (overnight fixes, AGENTS.md).
- `ATTRIBUTION.md`: add Open-Meteo (non-commercial terms noted), NOAA
  CO-OPS, RainViewer (radar tiles), and a Mapbox Standard note.
- Decide fonts (owner ask #1 below); if licensed-free, vendor the files.
- Baseline screenshot set of production for regression comparison.
**Gate:** site runs unchanged from `design/relaunch`; ATTRIBUTION complete.

### Phase 1 — Design tokens (Claude + Q3)
- Port the four register variable sets, type scale (10.5px floor), card
  shells, chips, and spine-tab components into `styles.css` behind
  `body[data-register]`, defaulting to `day` so nothing changes visually
  until the engine lands.
**Gate:** production renders pixel-equivalent in `day`; Q3 sweep passes.

### Phase 2 — Map style + registers (Claude + C4 + Q1) — *riskiest phase*
- Migrate `outdoors-v12` → Mapbox Standard: port all ~10 production layers
  to slots; `circle-emissive-strength: 1` on every point layer (the night-
  dimming lesson); verify PAD-US fills, aggregates, chunks at all zooms.
- Fallback decision point: if Standard breaks the aggregates pipeline
  beyond one session of effort, ship registers as two classic styles
  (outdoors + custom dark) and defer Standard.
- Land solar math + register engine + solar dial; manual override persists.
**Gate:** all existing layers verified at zoom 3–16 in all four registers;
Q1 tests pass; KNOWN_ISSUES gains no new entries for two nightly runs.

### Phase 3 — Floating UI (Claude, with C2 data)
- Masthead + sheets; legend with per-mode category filters wired to the
  real `MAP_MODE_CONFIG` categories; season slider with real phenology
  stacks (C2) and date/time/place; anchored popups with access/use/safety
  hierarchy, rule citations preserved verbatim, and **record attribution
  (observer + dataset + license) — launch blocker**, sourced per record
  from iNaturalist/Falling Fruit fields.
- Old panel UI removed only when each replacement is verified.
**Gate:** every species/mode/status reachable through the new UI; popup
attribution present for both live and cached data sources; ethics line in
every popup.

### Phase 4 — Conditions (Claude + C1/C3)
- Fetcher block in `app.js` (Open-Meteo, CO-OPS via C1 index, RainViewer)
  with TTL caches, data-age labels, FORECAST FOR + update-to-map-area
  (zoom ≥ 8), and the graceful-degradation contract: every condition
  failure leaves the site exactly as functional as today's.
- Rail + panels (sun/moon/rain/wind/tide), flush pulses gated on C3
  thresholds and the existing mushroom whitelist, wind canvas, radar layer
  with zoom handoff.
**Gate:** kill-switch test — with all condition endpoints blocked, the site
is fully usable and shows no errors; with them live, panels match
authoritative sources for two test locations.

### Phase 5 — Mobile (Claude + Q4)
- Port the responsive layer: scrollable rail, bottom-sheet panels, legend
  inside the season card (mutually exclusive toggles), compact popups.
**Gate:** owner walkthrough on a real phone; Q4 audit passes.

### Phase 6 — Hardening (Qwen Q2 + Claude)
- Contrast audit across registers; keyboard path; performance pass (radar
  + chunks + canvas at zoom boundaries; canvas off on `battery-saver`
  heuristics); error-console-clean sweep; version-string bumps.
**Gate:** Q2 report clean; Lighthouse perf/a11y within agreed floors;
`scripts/check.sh` green.

### Phase 7 — Content + cutover (owner + Claude)
- Real About page; Plants sheet backed by the full catalogs; Recipes —
  owner authors the first three (oak-gall ink, elderberry ink, walnut dye);
  Claude builds the template. Demo banners and demo records removed;
  `prototype/` retired to `docs/design/archive/`.
- Cutover: owner sign-off → merge `design/relaunch` → `main` → push →
  verify production → tag `relaunch-1`. Rollback = re-promote the last
  pre-merge `main` build in Cloudflare (one click, rehearsed in Phase 6).
**Gate:** launch checklist (below) fully checked.

## 4. Launch checklist

- [ ] ATTRIBUTION.md covers Open-Meteo, NOAA CO-OPS, RainViewer, Mapbox.
- [ ] Every point popup shows record attribution and the ethics line.
- [ ] Safety chips identical across registers; Q2 contrast report clean.
- [ ] Herbalism disclaimer in menu, sheet, and About.
- [ ] Mushroom features (flush pulses included) restricted to whitelist.
- [ ] Conditions kill-switch test passes.
- [ ] Mobile walkthrough approved by owner.
- [ ] KNOWN_ISSUES.md has no open blocker tagged `relaunch`.
- [ ] Rollback rehearsed.
- [ ] `main` build re-promoted to production until the cutover moment.

## 5. Owner decisions (answered 2026-06-12)

1. **Fonts — DECIDED.** Self-hosted OFL set approved: Fraunces (display,
   fixed instance), Public Sans (UI), IBM Plex Mono (labels).
2. **Recipe content — DECIDED.** The three sample recipes (oak-gall ink,
   pokeberry ink, walnut dye bath) ship as placeholders through migration;
   the owner authors real content after cutover prep.
3. **Tide scope — DECIDED.** Same model as weather: tide follows the
   forecast location (geocoded place or update-to-map-area at zoom ≥ 8),
   nearest station nationwide. C1 builds the full US station index.
4. **Standard-style fallback — DEFERRED.** No pre-approval; decide live if
   Phase 2 hits its effort limit.
5. **Timeline — accepted** (~2–3 weeks at current pace). Phase 0 begins via
   scheduled session 2026-06-12 8:01 PM.

## 6. Standing risks

- **Standard migration** is the long pole; mitigated by the Phase 2
  fallback and by C4 happening early.
- **API drift** (RainViewer changed shape once already during prototyping);
  mitigated by the degradation contract and data-age labels.
- **Single-file growth**: app.js gains roughly 1,200 lines; keep the
  section banner convention so the nightly debug agent can navigate.
- **Lane collisions**: the conflict rule above, plus phase sequencing.
