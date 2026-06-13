# Design Decisions Log

Running log so identity choices stay coherent across sessions and
collaborators. Newest first.

- **2026-06-13 — Handed the rest of sidebar retirement to Codex.** Owner is out
  of Claude usage for now, so the final two steps (species selection →
  `state.selectedSpecies`, then delete `#controlPanel` + rewire
  `renderModeChrome`/`panelGrip`/`setDataStatus`) are written up as an
  executable, touchpoint-by-touchpoint work order in
  `docs/design/codex-kickoff-sidebar-retirement.md`. This crosses into Claude's
  normal lane (app.js filter logic + index.html + styles.css) — explicitly
  owner-authorized. Current committed state (`3d37443`) is clean and pushable:
  floating season slider + search live, panel down to brand block + species
  list + data status. After Codex finishes, next is Phase 5 (mobile) / Phase 6
  (hardening).

- **2026-06-13 — Sidebar retirement (SR2 of 3): floating season slider +
  search.** With the owner clearing the per-species-multi-select constraint
  ("ok to get rid of the original sidebar; I'll reorganize filters later"),
  began retiring `#controlPanel`. This step relocated the two controls the
  floating UI didn't yet have a home for — the **season scrubber** and
  **location search** — into floating elements, matching the redesign: a
  bottom-left `#season-bar` (`.floating`) with the date readout, By date / All
  seasons, the real-phenology histogram, the WINTER/SPRING/SUMMER/FALL slider
  track, and the date field; and a top-left `#search-bar` (`.floating`) holding
  the geocode search. **Reused the existing element ids** (`#daySlider`,
  `#seasonHistogram`, `#locationSearchForm`, etc.) so all the working
  date/geocoding JS is untouched — this is a DOM relocation + register-aware
  restyle, no logic change. Removed the panel's location-search and Seasonality
  sections; the panel now holds only the brand block + species list + data
  status (removed next in SR1/SR3).

  **Gate — passed.** `node --check` clean (app.js unchanged). Live
  (`styles.css?v=floating-season-1`): both floating controls render
  register-aware; the histogram shows 12 bars with the active month outlined;
  scrubbing `#daySlider` updates the date readout ("July 19") and re-renders;
  search input present. Screenshot confirms the redesign look. They sit 14px
  from the map-area's left edge (right of the still-present panel) and will be
  flush-left once the panel is gone. Next: SR1 (species selection → state,
  remove species list), then SR3 (remove the panel shell + rewire).

- **2026-06-13 — Phase 4e applied: RainViewer radar + flush pulses. Phase 4
  complete.** **Radar:** `loadRadar` fetches RainViewer `weather-maps.json`,
  takes the latest past frame, and adds a raster layer (slot `top`, maxzoom 6)
  inserted *below* the Falling-Fruit aggregate circles so counts/points stay
  readable; `updateRadarZoom` shows it at `raster-opacity` 0.55 below zoom 7.5
  and 0 at/above — a clean handoff with the wind canvas (which owns ≥ 7.5).
  Wired into the map `load` handler and the zoom handler. **Flush pulses:**
  `refreshFlush` adds pulsing DOM markers on visible mushroom records when the
  past-72h rainfall meets that species' C3 threshold, in food mode. C3
  (`data/flush-thresholds.json`) currently lists only `morel` (25 mm,
  `ownerReview`), so "has a threshold" is the whitelist gate; `.flush-pulse` is
  reduced-motion aware. Called from `render()` and the 60 s tick. Both fail
  safe — radar is skipped on fetch error; pulses clear whenever weather is
  absent, mode isn't food, or the threshold isn't met.

  **Gate — passed.** `node --check` clean. Flush verified live
  (`?v=phase4e-1`): a synthetic morel record at past-72h 30 mm (≥ 25) in food
  mode yields exactly 1 pulse; 10 mm → 0; ink mode → 0; C3 has only `morel`.
  Radar verified in `outputs/verify_4e.mjs` (10 checks): source+raster layer
  added with the latest-frame tile URL, inserted below the aggregate circles,
  RainViewer attribution present, opacity handoff (0.55 < 7.5, 0 ≥ 7.5), and
  graceful failure (fetch reject → no throw, no layer; empty past → no layer).
  Note: the map's `load` event doesn't fire in the backgrounded automated tab
  (WebGL render throttling), so `mapReady` stays false there and the radar's
  *visual* render needs a foreground tab — the user verified the live site in
  production. Bumped both `index.html` tokens to `?v=phase4e-1`.

  **Phase 4 conditions complete (4a–4e):** rail (sun/moon/rain/wind/tide),
  detail panels, wind canvas, tide, radar, flush pulses. The
  graceful-degradation gate holds across the layer — every fetch is try/caught
  and additive; with all of Open-Meteo / CO-OPS / RainViewer blocked the rail
  falls back to client-only sun/moon and the map is unaffected. Remaining
  work-order phases: Phase 5 mobile, Phase 6 hardening, Phase 7 content/cutover.

- **2026-06-13 — Phase 4d applied: tide (NOAA CO-OPS via the C1 index).**
  Tide now follows the forecast location (owner decision #3): `loadTideStations`
  loads the 3,017-station C1 index (`data/tide-stations.json`), `nearestTideStation`
  finds the closest by haversine, and tide only shows when that station is within
  `TIDE_MAX_DISTANCE_KM` (100 km) — so deep-inland forecast locations show no
  tide. For a nearby station, `loadTide` fetches NOAA CO-OPS hi/lo predictions
  (48 h, MLLW, `interval=hilo`), cached 1 h per station id. Added a **TIDE** rail
  segment (next high/low + time, `conditionsIconTide`) and a tide panel with the
  ported `svgTideCurve` (cosine-interpolated curve, H/L marks, NOW line), the
  next-low intertidal-window line, the **"biotoxin closures always override"**
  safety note (preserved verbatim), and a NOAA CO-OPS source line. `loadTide`
  runs on init, on `setForecastLocation`, and hourly; graceful — any failure or
  inland location leaves `state.tide` null and the segment/panel simply absent.

  **Gate — passed.** `node --check` clean. Live via Claude-in-Chrome
  (`?v=phase4d-1`): C1 index loads (3,017 stations); CONUS-center default is
  inland so `state.tide` is null and no TIDE segment shows; nearest station to
  Providence resolves to "Providence, State Pier no.1" (id 8454000) at ~2 km;
  setting that as the forecast location loads 8 CO-OPS hi/lo events (CORS works
  from the browser), the rail shows "TIDE · high 07:22 PM", and the panel renders
  the curve with the station name + "SOURCE: NOAA CO-OPS · STATION 8454000".
  Screenshot confirms the curve + safety note. No CSS change (tide reuses the 4b
  panel styles + `data-subject="tide"` accent); bumped `app.js` to `?v=phase4d-1`.
  Next: 4e radar + flush pulses (C3 + whitelist) — the last Phase 4 sub-phase.

- **2026-06-13 — Phase 4c applied: animated wind canvas.** Added a
  `pointer-events:none` `<canvas id="fx">` overlay (z-index 3, between basemap
  and the floating UI) inside `.map-area`. Ported the prototype's streak
  particle system: 55 particles advected by the live wind vector
  (tier-quantized speed: calm/medium/fast) and projected through `map.project`
  so they track the basemap; gradient-tail streaks colored for day vs night.
  **Key production fix:** the canvas is sized to the **map container**
  (`#map` getBoundingClientRect) rather than the window, since the left panel
  offsets the map — otherwise particles would misalign. Gated to zoom ≥ 7.5
  (`WIND_CANVAS_MIN_ZOOM`; radar will own lower zooms in 4e), paused when the
  tab is hidden, and **off by default under `prefers-reduced-motion`**
  (`state.fxOn`). Added the "Animate wind on the map" toggle to the wind panel.
  Purely decorative and fully guarded — never blocks the map (pointer-events
  none) and draws nothing when off/hidden/zoomed-out/weatherless.

  **Gate — passed.** `node --check` clean. `outputs/verify_4c.mjs` (8-check
  harness over the real extracted `fxFrame`): particles populate to 55, a
  stroke is drawn per active particle, calm draws fewer streaks than fast, and
  each guard (tab-hidden, zoom < 7.5, `fxOn` off, no weather) correctly draws
  nothing — all pass. Live via Claude-in-Chrome (`?v=phase4c-1`): `#fx` present
  and sized to the map container (`1076×851`, not the window), `state.fxOn`
  defaults true (no reduced-motion), the wind-panel toggle flips `state.fxOn`,
  and `document.hidden` is honored (the automated tab is backgrounded, so the
  canvas correctly stays paused there — visual confirmation of the streaks
  needs a foreground tab). Bumped both `index.html` tokens to `?v=phase4c-1`.
  Next: 4d tide (C1 nearest station).

- **2026-06-13 — Phase 4b applied: condition detail panels.** Clicking a rail
  segment now opens a floating `#rail-panel` (`.floating` + `.spine` + `.pad`
  shells) with a per-subject accent (`data-subject` → `--subject` color + border).
  **Sun:** first-light/rise/golden/set/dark times + current register (computed
  locally, no network). **Moon:** ported `svgMoon` + `svgMoonAxis` phase
  visualizations. **Rain:** 10-day memory+forecast bars (3 past + today + 6
  ahead, today outlined) from the now-10-entry `daily`, past-72h total with the
  flush-threshold note, and `pickWindows` (rain/dry-window guidance). **Wind:**
  ported `svgCompass` rose (direction + speed + tier) + cloud cover. Rain/wind
  panels carry the **FORECAST FOR** label + **UPDATE TO MAP AREA** button
  (shown only at zoom ≥ 8; otherwise a "zoom in closer" hint) and a SOURCE +
  data-age line; `useMapArea` sets the forecast location to the map center.
  `toggleConditionPanel` toggles open/active state; the 60 s tick refreshes an
  open panel. Place search now passes a label to `setForecastLocation`.
  Tide panel deferred to 4d; the wind-canvas toggle to 4c. Degradation holds:
  rain/wind panels show "unavailable right now" when `state.weather` is null.

  **Gate — passed.** `node --check` clean. Live via Claude-in-Chrome
  (`?v=phase4b-1`): each segment opens its panel with the right heading,
  subject accent, and visualization (moon SVGs, rain `.bars`, wind compass
  SVG), marks its rail segment active, and toggles closed; the rain panel shows
  the bars, picking windows, FORECAST FOR, the zoom-in hint (zoom < 8), and
  SOURCE: OPEN-METEO · JUST FETCHED. No app console errors. Bumped both
  `index.html` tokens to `?v=phase4b-1`. Next: 4c wind canvas.

- **2026-06-13 — Phase 4 spec drafted + 4a applied: conditions rail
  foundation.** Wrote `docs/design/phase4-conditions-spec.md` (sequencing
  4a–4e, the graceful-degradation gate, endpoints, forecast-location model,
  C1/C3 + whitelist integration). Then landed **4a**: a floating
  `#conditions-rail` (`.floating` + the Phase-1 `.rail-seg` shell) at top-right
  of the map. SUN (register + sunset time) and MOON (illumination % +
  waxing/waning) come from ported client astronomy (`sunTimes` built on the
  existing `sunAltitude`, `moonPhase`) — no network, so they always render.
  `loadConditions` fetches Open-Meteo (precip past-72h, daily, wind, clouds)
  for `state.location` with a 30-min localStorage TTL cache + `data-age`/`src`
  tagging; RAIN 72H and WIND segments appear only when weather is present.
  **Degradation contract (the Phase 4 gate) is built in:** the fetch is
  `try/catch`, resolves (never throws), and on failure leaves `state.weather`
  null with **no fabricated values** — unlike the prototype's "offline sample",
  production simply omits the weather segments. Forecast location now follows
  place search (`chooseLocationSuggestion` → `setForecastLocation`, which also
  re-runs `applyRegister`); `initConditions` renders once + refreshes the rail
  each minute and refetches on the TTL. The conditions layer is fully
  decoupled — the map/popups/legend/season/sheets never read it.

  **Gate — passed.** `node --check` clean. Wrote `outputs/verify_4a.mjs`
  (22-assertion harness over the real extracted functions): sun/moon math,
  Open-Meteo parse (`past72`, 7-day `daily`, wind), the cache path (fresh cache
  avoids network), and the **kill-switch** (stubbed `fetch` rejection → resolves
  null, no throw, no fabricated data, rail keeps sun/moon) — all pass. Live via
  Claude-in-Chrome (`?v=phase4a-1`): rail shows SUN/MOON/RAIN/WIND from live
  Open-Meteo (`src:"live"`), register-aware bg; blocking `fetch` in-page leaves
  the rail at sun/moon only with no throw and `state.weather` null;
  `setForecastLocation(Providence)` updates location + refetches. No app console
  errors (only an unrelated browser extension). Bumped both `index.html` tokens
  to `?v=phase4a-1`. Next: 4b (detail panels + update-to-map-area), then 4c
  wind canvas, 4d tide (C1), 4e radar + flush pulses (C3 + whitelist).

- **2026-06-13 — Phase 3e applied: removed the replaced panel sections +
  migrated the access filter to state.** Removed three `#controlPanel` pieces
  now covered by the floating UI: the **Access & Permissions** section
  (replaced by the legend's access chips), the **category-filter checkboxes**
  (`#categoryList`, replaced by the legend's category chips), and the **Data
  Notes** section (replaced by the About sheet's attribution link). To free the
  access filter from the removed checkboxes, migrated its source of truth to
  `state.selectedAccessStatuses` (init in `initAccessControls`, lazy-init guard
  in `getSelectedAccessStatuses`, new `toggleAccessStatus` used by the legend
  chip handler); `renderMapLegend` reads the set directly. Guarded the
  now-optional DOM refs: `renderModeChrome`'s Data-Notes write and
  `renderFilterControls`'s `#categoryList` populate both no-op when the element
  is absent; removed the unused `accessStatusInputs` and the old
  checkbox-wiring in `initAccessControls`.

  **Intentionally retained** (noted for a later cutover pass / owner call, not
  mechanical removals): the **species list** stays — it is the per-species
  selection source of truth and the Plants sheet only *single*-selects, so
  removing it would drop multi-species filtering (the approved prototype filters
  by category only; confirm with owner before dropping per-species selection);
  the **Seasonality** block stays in the panel (3c enriched its data but did not
  relocate it to a floating `#season`); the **brand block** stays (its wordmark
  is cosmetically duplicated by the masthead, but it also still hosts the mode
  tabs and the lede/safety line); **location search** stays (not a Phase 3
  surface). Old passive-legend CSS and the now-unused panel CSS classes are left
  in place for a later cleanup.

  **Gate — passed.** `node --check` clean. Live via Claude-in-Chrome
  (`?v=phase3e-1`): the three sections are gone from the DOM, species list /
  season / location search remain; `state.selectedAccessStatuses` initializes to
  the five defaults (prohibited excluded); clicking the legend's Prohibited chip
  adds it to both `state` and `getSelectedAccessStatuses()` (pipeline sees it)
  and toggles back; category chips still drive species (none↔all); all four
  sheets still open and the Plants sheet still single-selects; 26 species
  selected by default. No app console errors (only an unrelated browser-extension
  message). Map re-checked after load: `mapReady` true and all nine Phase-2
  Standard layers present (region mask/outline, public-lands fill/line, the
  Falling-Fruit aggregate + record cluster/point layers) — no regression to the
  map/aggregates pipeline. Bumped `app.js` token to `?v=phase3e-1`.

  **Phase 3 complete (3a–3e).** Launch-checklist items now satisfied: every
  popup shows record attribution (observer + dataset + license) and the ethics
  line; herbalism disclaimer appears in the Maps sheet, the medicine-mode popup,
  and About. Remaining for later phases: Phase 4 conditions rail (`.rail-seg`
  consumer), Phase 5 mobile, plus the deferred items above and popup season
  sparklines.

- **2026-06-13 — Phase 3d applied: masthead + Maps/Plants/Recipes/About
  sheets.** Added the floating `#masthead` (wordmark + four nav buttons) inside
  `.map-area` so it sits right of the panel during the transition and lands
  top-left once the panel is removed in 3e; added a body-level `#sheet-wrap`
  modal (`position:fixed`, backdrop) holding a `.floating #sheet`. Four sheets,
  all on the Phase-1 `.mini-card`/`.card-grid` shells: **Maps** (one mode card
  per `MAP_MODE_CONFIG` mode — clicking calls `setMapMode`; active card flagged
  `.on`; the Herbalism card keeps the not-medical-advice `.dnote`), **Plants**
  (backed by the live `speciesCatalogByName` — name/scientific/season/uses,
  category-colored spine; clicking selects only that species via
  `selectOnlySpecies` and closes), **Recipes** (the three placeholders per
  work-order §5 #2 — oak-gall ink, pokeberry ink, walnut dye bath — non-interactive
  `.recipe-card`s), **About** (mission + "occurrence is never permission" +
  herbalism-educational-only, plus an attribution link — drops the prototype's
  demo-data disclaimer since production isn't demo). Open/close wired via a
  delegated handler on `#sheet`, masthead buttons, backdrop click, and Escape;
  cards are keyboard-activatable (Enter/Space). CSS ported register-aware
  (`#masthead`, `#sheet-wrap`/`#sheet`, `.closer`, `.serif`, `.mode-card.on`,
  `.mini-card .dnote`); `#sheet` overrides `.floating`'s
  `position:absolute`→`relative` and `user-select:none`→`text` so it centers in
  the flex wrap and stays selectable.

  **Gate — passed.** `node --check` clean. Live via Claude-in-Chrome
  (`?v=phase3d-1`): masthead shows maps/plants/recipes/about; all four sheets
  open with correct headings and card counts (Maps 3, Plants 26 = food catalog,
  Recipes 3, About text-only); Maps medicine card has the disclaimer and the
  active card is `.on`; About contains the herbalism disclaimer (launch
  checklist: disclaimer in menu + sheet + About). Interactions: clicking the
  Apples profile selects only `apple` and closes the sheet (then restored to
  26); clicking the Ink map card flips `state.activeMap` to `ink` and closes
  (switched back to food). Screenshot confirms the card grid + masthead.
  Bumped both `index.html` tokens to `?v=phase3d-1`. Next: 3e — remove the now-
  duplicated `#controlPanel` sections (brand/tabs, category & access lists,
  data-notes) and migrate the access-status source of truth off the removed
  checkboxes; leave mobile mechanics for Phase 5.

- **2026-06-13 — Phase 3c applied: season histogram on real C2 phenology.**
  Replaced the synthetic histogram (binary `species.months` membership counts)
  with real per-species 12-month relative-abundance curves from C2
  (`data/phenology/<mode>.json`). Added `phenologyByMode` cache + `loadPhenology`
  (fetch per mode, cached, a cached `null` on failure → graceful fallback to
  the old binary behavior). `renderHistogram` now weights each month/category
  by summed abundance (`curve[monthIndex]`), falling back to binary presence
  for any species lacking a curve; bar heights and stacked segments reflect
  real intensity. The tooltip still reports the count of in-season species per
  category (now using `getCategoryLabel`, "in season" = `species.months` or
  abundance ≥ 0.15). DOM/CSS unchanged (same `.histogram-bar`/`.histogram-segment`
  classes), and the date-availability marker filter
  (`isSpeciesAvailableOnSelectedDate`) is untouched — so this is a visual
  enrichment only, no filtering change. `loadPhenology` is fired at boot (after
  the initial `render()`) and on `setMapMode`, each re-rendering the histogram
  once data resolves.

  **Gate — passed.** `node --check` clean. Live via Claude-in-Chrome
  (`?v=phase3c-1`): `food.json` loads with 26 species curves; isolating
  **morel** drives the histogram peak to month index 3 (April), exactly
  matching morel's curve peak — proving the chart consumes the real curve, not
  binary months; with all species selected the 12 bar heights vary (seasonal
  arc peaking Jun–Aug). Screenshot confirms a natural abundance curve stacked
  by category. Bumped `app.js` token to `?v=phase3c-1` (styles.css unchanged).
  Deferred: per-mode "date · time · place" control and popup season
  sparklines (both lean on Phase 4 location/conditions) — noted, not in 3c.
  Next: 3d (masthead + sheets).

- **2026-06-13 — Phase 3b applied: interactive `.leg-chip` legend.** Rebuilt
  `renderMapLegend()` from a passive dot/swatch legend into the redesign's
  interactive filter control. Two chip groups: **Access** (one chip per
  permission status incl. prohibited; ring colored by `--reg-st-<token>`;
  `.off`/0.32-opacity when deselected) and **Categories** (one chip per
  `MAP_MODE_CONFIG` category; ring = category color; `.off` when none of its
  species are selected, `.partial` filled ring when some). Chips keep ink-color
  labels with colored rings for contrast (Q2-friendly), rather than the
  prototype's fully-colored chip. **Pipeline untouched:** chips drive the
  existing checkbox inputs — access chips toggle the matching
  `input[name='access-status']`, category chips call `setSpeciesByCategory`
  (new `getCategorySelectionState` reports all/some/none from the species
  inputs) — so `getSelectedAccessStatuses`/the filtered-aggregates path see no
  change. A single delegated click handler (`initMapLegend`, wired after
  `initAccessControls`) survives the innerHTML rebuilds; `render()` now also
  calls `renderMapLegend()` so chip states stay in sync when species selection
  changes from anywhere (e.g. the panel species list). The panel's
  category/access sections still exist as the backing store and are removed in
  3e (when the access-status source of truth migrates off the checkboxes).
  `.map-legend` is now register-aware (`--reg-panel-a`/`--reg-hair`/`--reg-ink`/
  `--reg-glow` + backdrop blur), matching `.pt-card`.

  **Gate — passed.** `node --check` clean. Live via Claude-in-Chrome
  (`?v=phase3b-1`): 5 access chips + 4 food category chips render; initial
  off-state = `["prohibited"]` for access and `[]` for categories (correct
  defaults); clicking the Prohibited chip flips its `.off` class and adds
  `prohibited` to `getSelectedAccessStatuses()` (pipeline sees it), toggling
  back restores it; clicking the Berries chip drives its category to "none"
  (`.off`) and back to "all"; legend bg computes `--reg-panel-a`. Bumped
  `index.html` tokens to `?v=phase3b-1`. Next: 3c (season slider w/ C2
  phenology); old passive legend rules left dead for 3e cleanup.

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
