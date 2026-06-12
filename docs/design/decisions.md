# Design Decisions Log

Running log so identity choices stay coherent across sessions and
collaborators. Newest first.

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
