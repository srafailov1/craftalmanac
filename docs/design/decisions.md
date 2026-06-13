# Design Decisions Log

Running log so identity choices stay coherent across sessions and
collaborators. Newest first.

- **2026-06-13 — Phase 3a applied: anchored `.pt-card` popups (launch
  blocker).** Restructured `getMarkerPopupHTML` from the old `.popup-grid`
  `<dl>` into the Phase-1 `.pt-card` hierarchy (spine / `h2` / `.sci` /
  `.row`s / `.season-line` / `.oinp` ethics line). The left spine and the
  ACCESS ring+label are colored by a new `ACCESS_STATUS_TOKEN` map
  (accessStatus → `--reg-st-*` suffix: allowed/permit/private/unknown/
  prohibited; `private-unsourced` folds into `private`), so safety/access
  color stays fixed-semantics across registers per CLAUDE.md. Closed the
  launch-blocker "observer + dataset + license" gap: added `LICENSE_BY_SOURCE`
  (transcribed verbatim from `ATTRIBUTION.md` — iNaturalist CC BY-NC,
  Falling Fruit CC BY-NC-SA 4.0) surfaced in the SOURCE row, and threaded an
  `observer` field from `mapINaturalistObservation` (`observation.user?.login`)
  through the marker feature properties into the card ("obs. <login>"); omitted
  for Falling Fruit / NPS (no observer concept — not fabricated). The ethics
  line ("OCCURRENCE IS NOT PERMISSION — VERIFY THE PARCEL RULE") now renders on
  **every** popup via `.oinp`; medicine mode additionally renders the
  educational-use disclaimer prominently in a new `.med-note` callout. Rule
  citations (accessSourceLabel/url) and limits are preserved verbatim.

  **NPS-orchard license gap resolved + flagged.** `ATTRIBUTION.md` had no
  license for NPS orchards, so the popup first omitted the clause (no
  fabrication). Resolved it accurately: added a note that NPS Cultural
  Landscapes data is a U.S. Government work in the public domain (17 U.S.C.
  § 105) — orthogonal to the "permission required" *access* status — and set
  `LICENSE_BY_SOURCE["nps-orchard"] = "Public domain (U.S. Gov)"`. Flagged in
  `ATTRIBUTION.md` for owner / 7am-audit-loop confirmation.

  **Wiring:** popup construction switched to `className: "forage-popup
  pt-popup"`, `closeButton: false` (the card owns its own `.close`),
  `maxWidth: "none"` (card sets `width: min(336px,88vw)`), offset 14;
  `bindPopupActions` now wires the custom `.close` to `popup.remove()` and
  keeps the unchanged save-location handler. CSS additions (small, no Phase-1
  shell duplication): `.pt-popup .mapboxgl-popup-content` strips Mapbox's
  default padding/bg/shadow and hides the tip so the card reads as a clean
  floating card; `.pt-card .src-link` (accent underline) and `.pt-card
  .med-note` (warn-bordered callout).

  **Gate — passed.** `node --check app.js` clean. Wrote a 760-assertion
  harness (`outputs/verify_3a.mjs`, throwaway) exercising the real extracted
  `getMarkerPopupHTML` over every access-status × dataset-source × mode combo
  + edge cases (missing url/observer/date, harvest warning, unknown-status
  fallback) — all pass. Live-verified via Claude-in-Chrome against the owner's
  running `http://127.0.0.1:4173/` (served the new `?v=phase3a-1` assets):
  rendered sample cards show observer+dataset+license, ethics line, and the
  medicine `.med-note`; allowed spine computes `rgb(47,143,70)` in `day` and
  `rgb(91,224,138)` in `night` (= `--reg-st-allowed` per register), card
  bg/ink follow `--reg-panel-a`/`--reg-ink`, and the `.pt-popup` content
  wrapper is transparent with 0 padding. End-to-end on a **real** `mapboxgl.
  Popup` built through the page's own path: opens, renders `.pt-card`, and the
  custom close button closes it (`isOpen` true → false). Bumped `index.html`
  asset tokens to `?v=phase3a-1` (both `app.js` and `styles.css`). Next: 3b
  (legend) — the old `#controlPanel` species/access lists stay until 3e.

- **2026-06-13 — Phase 3 spec drafted (`docs/design/phase3-floating-ui-spec.md`),
  not yet applied.** Confirmed all Phase 3 data deps (C1-C4) are landed and
  Phase 1's `.pt-card`/`.mini-card`/`.leg-chip`/`.rail-seg`/`.floating` CSS
  shells already exist unused in `styles.css`. Broke Phase 3 into 3a (anchored
  popups — launch blocker, CSS ready, recommended start), 3b (legend), 3c
  (season slider w/ C2 phenology), 3d (masthead + sheets), 3e (old panel
  removal, after each replacement verified). All of Phase 3 is Claude-only
  per `work-order-redesign.md` §2 — no Codex/Qwen prerequisite blocks
  kickoff. 3a detailed: restructure `getMarkerPopupHTML` into `.pt-card`,
  add a per-source license map (from `ATTRIBUTION.md`) and an `observer`
  field for iNaturalist records to close the "observer + dataset + license"
  attribution gap, keep the ethics line and medicine disclaimer.

- **2026-06-13 — Resolved KNOWN_ISSUES #2 directly (nightly loops paused).**
  Removed the dead `falling-fruit-aggregate-labels` layer
  (`FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID`, constant + `map.addLayer` block)
  rather than restoring a `level: "state"` aggregate generator — it was
  permanently inert pre-grid-bucket legacy code, and state/region context
  belongs in Phase 3's floating legend/season UI rather than a map-painted
  label layer. Updated `standard-style-spec.md` row 7 and closed
  `KNOWN_ISSUES.md` #2. `node --check app.js` passes; bumped `index.html`'s
  `app.js` cache token to `?v=standard-style-3`.

- **2026-06-13 — Phase 2 §3 live-verification gate run and closed.** Ran the
  `standard-style-spec.md` §3 zoom 3-16 x 4-register matrix via
  Claude-in-Chrome against `http://127.0.0.1:4173/` (local server from
  `python3 -m http.server 4173 --bind 127.0.0.1`):

  - All 10 production layers present with the slots and `*-emissive-strength`
    values the spec table prescribes — exact match, rows 1-10.
  - Registers (`day`/`dawn`/`dusk`/`night`) switch cleanly via
    `map.setConfigProperty("basemap","lightPreset", reg)` +
    `state.register`/`document.body.dataset.register`; aggregate/cluster/
    marker colors (rows 5-10) stay pixel-identical across registers as
    intended.
  - Zoom-handoff bridge (aggregates -> clusters) fires correctly at the
    zoom 6.5/7.5/8.5 sample points (feature counts 130/0 -> 187/0 -> 0/63),
    with no z-order flicker between `slot: "top"` aggregate and cluster
    layers.
  - Popups still render full species/ethics/permission text at zoom 16
    (checked an Indiana Dunes raspberry point — "Harvesting rules and
    limits: ALLOWED").
  - **Found and fixed:** row 2 (`region-outline`, `#1f3d2b` @ 0.86) had
    near-zero contrast against Standard's `night` exterior at zoom 3.
    Added `"line-emissive-strength": 1` to its paint properties (same
    mechanism as rows 5-10) — confirmed via screenshot that the CONUS
    outline is now clearly visible against the dark `night` basemap.
    `node --check app.js` passes; bumped `index.html`'s `app.js` cache
    token to `?v=standard-style-2`.
  - **Found, not a gate blocker:** row 7 (`falling-fruit-aggregate-labels`,
    state-name labels at zoom < 4.2) is dead code — its `level === "state"`
    filter never matches any feature, since `getGridAggregateFeatures` only
    emits `level: "grid"` with `label: ""`. The spec's "no collision with
    Standard's place labels" check trivially passes because there's nothing
    to render. Logged as `KNOWN_ISSUES.md` #2 for the 4am/5am loops to
    decide: restore a real `level: "state"` aggregate generator, or remove
    the dead layer.

  Gate closed: `docs/design/standard-style-spec.md` §3 is satisfied (one
  follow-up fix applied, one pre-existing dead-code issue routed
  separately).

- **2026-06-13 — C4 audit landed (`02e210c`), folded into the spec.** Codex
  reviewed `app.js` at `2a8936f` against `standard-style-spec.md` §4
  (rows 5-7, the `FALLING_FRUIT_AGGREGATE_*` layers): code matches the spec
  exactly. It also confirmed, by reading the pinned Mapbox GL JS v3.23.1
  bundle directly, that `text-emissive-strength`, `circle-emissive-strength`,
  and `icon-emissive-strength` are all real, recognized paint properties (no
  property-name fix needed anywhere in rows 5-10) — this resolves the
  "(verify property exists)" flags on rows 6, 7, 9, 10. Codex hit the same
  no-browser wall I did (its in-app test page got `ERR_BLOCKED_BY_CLIENT` on
  the Mapbox GL bundle, no Playwright available) for the three rendered
  checks (pixel identity across registers, zoom-handoff z-order with rows
  5-7/8-10 sharing `slot: "top"`, and row 7 state-label collisions with
  Standard's place labels at zoom 3-4) — folded these into task #15's live
  pass, with row 7 fallback options (lower `maxzoom`, smaller `text-size`, or
  hide) noted in the spec if it collides.

- **2026-06-13 — Standard style migration applied (`2a8936f`), live
  verification still pending.** Applied `docs/design/standard-style-spec.md`
  in full: `MAPBOX_STYLE` -> `mapbox://styles/mapbox/standard`; all 10
  production layers got their `slot` (`bottom` for region mask/outline +
  public-lands fill/line, `top` for the Falling Fruit aggregate/cluster/
  marker layers); `circle-emissive-strength`/`text-emissive-strength`/
  `icon-emissive-strength: 1` added to every `top`-slot point/symbol layer
  per the rev6 night-dimming lesson; removed the now-dead
  `getFirstLineOrSymbolLayerId`/`firstLineOrSymbolLayerId` plumbing. Updated
  the register-engine comments (`syncLightPreset`) since
  `map.setConfigProperty("basemap","lightPreset", reg)` is no longer a no-op.
  `node --check app.js` passes; bumped `index.html`'s `app.js` cache token to
  `?v=standard-style-1`.

  **Could not complete the spec's zoom 3-16 x 4-register live-verification
  gate this session** — no headless browser in the sandbox, and the
  Claude-in-Chrome browser tool refuses `file://` navigation (treated as an
  internal page) and there's no local HTTP server running for it to reach
  (`http://127.0.0.1:4173/` -> connection refused). **Next interactive
  session:** run `python3 -m http.server 4173 --bind 127.0.0.1` from the repo
  root, then use Claude-in-Chrome against `http://127.0.0.1:4173/` to run the
  spec §3 matrix (force `state.register`/`document.body.dataset.register`/
  `map.setConfigProperty` per register, check zooms 3/5-7/8/11/16). This is
  also the right moment to capture the deferred baseline screenshots (task
  #11) — capture *before* forcing registers, since `day` should still match
  pre-migration renders.

  Rows 1-2 (region mask/outline) and 3-4 (public lands fill/line) were left
  at default (no) emissive-strength per spec, flagged for verification —
  specifically check the region outline (`#1f3d2b` @ 0.86) for contrast
  against `--reg-ground` in dusk/night. Codex's C4 audit
  (`docs/design/notes-codex-c4.md`, spec §4) has not landed yet — fold its
  findings into the same verification pass when both are ready.

- **2026-06-13 — Phase 2 started: register engine landed, Standard style
  spec written.** Codex C1-C3 (tide stations, phenology, flush thresholds)
  reviewed clean, no fixes needed — see `craftalmanac-design-round2`
  memory. Then, on `design/relaunch`: ported `sunAltitude`/`computeRegister`
  from prototype rev 14 (`fcb2856`) — `state.register`/`state.location`
  added to `app.js`'s `state` object (location defaults to the map's CONUS
  center, [-98.6, 39.8]; Phase 4 conditions work will update it from
  place search/map moves). `applyRegister()` runs once at script load and
  every 60s, setting `body[data-register]` from real solar position and
  calling the new `syncLightPreset()` (`map.setConfigProperty("basemap",
  "lightPreset", reg)` in try/catch — a no-op on outdoors-v12, activates once
  Standard lands). Verified in Node: at the time of this session (day, mid-
  June, CONUS center) the engine computes `"day"`, matching the existing
  hardcoded default — zero visual change right now; a full-day sweep
  produces all four registers (`day`/`dusk`/`night`/`dawn`), confirming the
  thresholds (alt >= 8 day, <= -6 night, else dawn/dusk by rising sun) work
  end to end. This *is* a real (intentional) visual change for users at
  non-day local times — that's the point of Phase 2, per the "data graphics
  consistent across registers" principle for the layers that get
  emissive-strength in the next step.

  **Standard style spec (`4f8fb95`):** wrote
  `docs/design/standard-style-spec.md` — full layer-by-layer plan for all 10
  production layers (slot assignments, `*-emissive-strength` per the rev6
  night-dimming lesson, confirmed against Mapbox's current Standard docs:
  `lightPreset` values are exactly `dawn`/`day`/`dusk`/`night`, slots are
  `top`/`middle`/`bottom`, fill/line layers render under symbols regardless
  of slot). Unblocked `docs/work-split.md` item #2/C4: Codex's part is a
  written audit note on the 3 `FALLING_FRUIT_AGGREGATE_*` layers only
  (emissive-strength property support in the pinned Mapbox GL JS 3.23.1,
  cross-register color consistency, zoom-handoff interaction) — no app.js/
  styles.css/index.html edits, Claude applies the actual migration.

  **Still open for Phase 2:** the actual `MAPBOX_STYLE` → Standard migration
  (task #14) — apply the spec, verify zoom 3-16 x 4 registers (can force
  registers from devtools without waiting for real time/location), fold in
  Codex's C4 note. Baseline screenshots (task #11) deferred to right before
  that migration starts — the meaningful "before" state is pre-Standard-map,
  not pre-register-engine (today's daytime render is unchanged). Fallback
  (two classic styles) stays a live decision per owner decision #4.

- **2026-06-12 (evening) — Phase 0 complete; Phase 1 deferred.** Scheduled
  run on `design/relaunch`. Cleared stale `.git/index.lock` (no running git
  process); removed nine untracked working-tree files/dirs left from a prior
  session that were byte-identical to `main`'s committed versions, then
  merged `main` cleanly (`c3d2ec3`) — one add/add conflict in `AGENTS.md`,
  resolved by taking `main`'s more developed version per "production code
  wins" (it's a strict superset of the design-branch copy: extra "well-formed
  task" section, broader Qwen task list). `node --check app.js` passes
  post-merge. ATTRIBUTION.md (`4321143`) gained NOAA CO-OPS tide-predictions
  note (extends the existing station-index entry), Open-Meteo (CC BY 4.0,
  non-commercial free tier), RainViewer (free-tier attribution required), and
  a Mapbox Standard note (lightPreset + `circle-emissive-strength: 1`,
  existing attribution control covers it) — all four sourced and verified via
  web search this session. Fonts (`349e5ef`): could not download Fraunces/
  Public Sans/IBM Plex Mono — sandbox network blocks `fonts.google.com`,
  `fonts.gstatic.com`, `github.com`, `raw.githubusercontent.com`,
  `cdn.jsdelivr.net` (all 403 blocked-by-allowlist). Documented the exact
  file list, directory layout, and Fraunces fixed-instance choice (weight
  600, optical size 144/"Display", SOFT=0/WONK=0, + italic) in
  `docs/design/fonts-needed.md`, and added a commented (inert) `@font-face`
  scaffold at the top of `styles.css` for `--font-display`/`--font-ui`/
  `--font-mono` — zero visual change, drop-in once files exist. Baseline
  screenshots: no headless browser in the sandbox (no chromium, npm registry
  blocked for puppeteer/playwright) and computer-use needs interactive
  owner approval — **baselines still await the next interactive session**.
  **Gate:** `node --check app.js` clean, ATTRIBUTION.md complete for all four
  new sources, git history clean (no stray locks, working tree clean) — gate
  passes.

  **Phase 1 (`35045d8`) done same session.** Ported the four register
  variable sets (day/dawn/dusk/night, from rev 14 `prototype/index.html`
  lines 31-59) and the card/chip/spine component shells (`.pt-card`,
  `.mini-card`, `.card-grid`, `.leg-chip`, `.rail-seg`, `.floating`, `.spine`)
  into `styles.css`, namespaced `--reg-*` to avoid colliding with the
  existing production tokens (e.g. prototype `--ink:#1F2421` vs production
  `--ink:#20241f` — same name, different value, would have shifted colors if
  merged into one set). `body` in `index.html` now carries
  `data-register="day"`; `:root, body[data-register="day"]` defines the day
  set so it's always-on, dawn/dusk/night sit behind attribute selectors that
  don't match anything yet. None of the new classes appear in current markup.
  Net: zero visual change (verified by reasoning + brace-balance/`node --check`,
  not a screenshot diff — baselines still pending). Bumped
  `styles.css?v=filtered-access-4` → `?v=register-tokens-1` since the file
  changed. **Next session:** Phase 2 (Standard map + register engine) is the
  riskiest phase — start by getting baseline screenshots in an interactive
  session before touching the map style, then wire the solar-math register
  engine to actually set `data-register` and confirm dawn/dusk/night render
  correctly with the new tokens before porting the ~10 production layers to
  Standard slots.

- **2026-06-12 — Prototype approved; migration work order written.** The
  living-map prototype closed at rev 14 (`d4252a7`) after fourteen owner
  review rounds. `docs/design/work-order-redesign.md` now governs the
  migration to production: seven phases (tokens → Standard-style map +
  registers → floating UI → conditions → mobile → hardening → cutover),
  lanes for Claude (architecture/UI), Codex (tide-station index, real
  phenology histograms, flush thresholds, aggregates-on-Standard audit),
  and Qwen (gate-verified test/audit scripts), launch checklist, and five
  owner decision asks (fonts, recipes, tide scope, style fallback,
  timeline). Launch blockers: ATTRIBUTION.md entries and per-record
  attribution on point cards.


- **2026-06-12 — Round 5 delivered: live prototype.** `prototype/index.html`
  (single file, no build step; run `python3 -m http.server 4173` from repo
  root, open `/prototype/`). Owner adjustments honored: Quiet Pigment cards;
  season-slider histogram on hover only; permissions legend/filter
  (toggleable status chips); About / Plants / Recipes entry points in the
  masthead (sheets, not a nav menu). Built in priority order: map-dominant
  UX → Mapbox Standard lightPreset registers (auto from client-side solar
  math, manual override persisted) → sun/moon rail segments → rain memory
  **and 7-day forecast** (Open-Meteo; flush pulses on fungal points ≥18 mm
  /72 h; picking-window helper) → animated wind/cloud canvas (live wind
  vector; reduced-motion + tab-hidden aware; toggle in rail) → tide (NOAA
  CO-OPS station 8454000). Demo viewport: Providence, RI. All occurrence
  points are invented and labeled DEMO; weather/sun/moon/tide are live with
  cached fallbacks. Map failure degrades to schematic UI-review mode.
  Live APIs could not be exercised from the sandbox (network allowlist) —
  first browser run should verify Open-Meteo + CO-OPS fetches.
  Before any public deploy: add Open-Meteo + NOAA CO-OPS to ATTRIBUTION.md.

- **2026-06-11 — Round 4 delivered: The Living Map (synthesis).** Owner
  converged: Field Desk UX (map dominant, floating cards) + Pigment Index
  light-mode color/text (no seasonal typeface changes) + Night Survey as the
  night register of a time-of-day light system + Overprint as a boldness
  dial. New almanac layer: live conditions on the map — weather (rain
  memory → fungi flush pulses, wind streaks, frost isoline), sun/moon
  (client-side solar math drives four registers: dawn/day/dusk/night via
  CSS variables + Mapbox lightPreset), tide (NOAA CO-OPS; intertidal bands,
  tide clock, biotoxin closures override everything). All sources free and
  key-less (NWS, Open-Meteo, CO-OPS); graceful degradation contract; new
  sources require ATTRIBUTION.md entries. Card boldness options: 1 Quiet
  Pigment / 2 Bold Edition (recommended default) / 3 Poster Overprint, as a
  per-surface dial; safety chips fixed at every volume.
  `round-4-living-map.pdf` (17 pp, generator `build_round4_deck.py`).
  Proposed Round 5: live one-page prototype (real map, sun math, rain
  memory, Bold Edition cards, day/night). Awaiting owner's five asks (p. 17).

- **2026-06-11 — Round 3 delivered: site versions.** Owner asked for a broad
  contemporary-web-design pass, not mission-filtered, focused on UX/UI for
  the site's needs (map, plant cards, project recipes), decoupled from the
  Round 1–2 graphic identities. `round-3-site-versions.pdf` (23 pp,
  generator `build_round3_deck.py`): genre research (Awwwards 2025 tier,
  Linear/Felt/Raycast product-UX school, Snow Fall/Pudding/Stripe editorial
  school, 2026 calm-UI currents) distilled into six static-buildable
  patterns, then three UX skeletons: A **Field Desk** (map-as-app, cmd-K,
  season scrubber, cook mode), B **The Long Season** (scrollytelling weekly
  entry, sticky editorial plant spreads, stepped recipe stories),
  C **Card Table** (bento home, literal tilt/flip plant cards, recipe step
  decks). Identity and UX are now separate decisions; any Round 2 world can
  skin any skeleton. Awaiting owner's four asks (p. 23).

- **2026-06-11 — Round 1 rejected; Round 2 delivered.** Owner critique:
  Round 1's three directions read as variations of one cream-paper almanac
  world, too close to the current site. Round 2
  (`round-2-directions.pdf`, 25 pp, generator `build_round2_deck.py`)
  opens with precedent research (Emergence, Mushroom Color Atlas, firefly
  cartography, riso/print culture, 2026 adaptive-identity currents) and
  presents three forced-apart worlds: I **Night Survey** (dark firefly
  map, luminous serif, seasons as light temperature), II **Overprint**
  (riso two-ink editions, wood-type poster scale, broadside guides),
  III **Pigment Index** (material-derived color fields, kinetic variable
  display, seasonal ground tints). Constants in all three: fixed safety
  chip semantics, ethics line in every popup, CSS-variable
  implementability, no photography. Awaiting owner decisions (five asks
  on p. 25).

- **2026-06-12 — Round 1 deck delivered.** `round-1-directions.pdf` (20 pp):
  three directions (I Specimen Modern, II The Living Almanac, III Forage
  Press), four pages each, plus side-by-side, risks, and decision asks.
  Display faces are stand-ins; recommendations named per direction.
  Generator: `build_round1_deck.py`. Awaiting owner decisions (which world,
  wordmark energy, cross-borrows, teaching conflicts).

- **2026-06-12 — Discovery complete; brief written.** Process: studio decks
  first, then prototypes. Round 1 will present three directions: Specimen
  Modern, The Living Almanac, Forage Press (working titles). See `brief.md`.
- **2026-06-12 — Name.** Craft Almanac stays; alternatives may be proposed
  as directions develop.
