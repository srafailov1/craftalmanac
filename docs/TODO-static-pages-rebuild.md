# Work order — rebuild the static SEO pages (high priority)

Owner feedback (2026-07-04): the static material/project pages exist for SEO
(good) but are **built poorly** and can't do their job as the first thing a
search visitor sees:

1. **Design is the OLD prototype look** — tan `#faf8f0` background, Georgia
   serif, system mono — matching `attribution.html`, NOT the current app
   (Fraunces Display / Public Sans / IBM Plex Mono; day-register palette
   `--reg-ground #f1f5ec`, ink `#1f2421`, olive accent `#6b7f2e`, category
   color spines).
2. **Material pages are content-thin** — a data table (season / used parts /
   ethic) + a one-line catalog `note`. No real information about the material
   itself (what it is, how to ID it + lookalikes, habitat, craft use).
3. **"Open on the map" CTA blanks the map when the material is out of season**
   — the deep link isolates the species (`selectOnlySpecies`) but doesn't touch
   season state, so an out-of-season isolate shows nothing.
4. If built well, the pages should also be **linked out from the map's Material
   and Project cards** ("full profile →").

## In flight
- **Material content**: workflow `material-profiles-research` (run
  wf_e67da536-04f) — 9 batches, research → adversarial safety/accuracy verify,
  producing structured profiles for all 128 materials (summary, identification
  incl. toxic lookalikes, habitat, craftUse, safetyNote, sources). Orchestrator
  collects → writes `data/material-profiles.json`.

## Status

- **Part A — DONE** (this commit): 128 researched profiles in
  `data/material-profiles.json`; `scripts/build_static_pages.mjs` redesigned to
  the app's register day theme (self-hosted Fraunces/Public Sans/IBM Plex Mono,
  `--reg-*` palette, category color spines, sheet/card look) and enriched with
  the profile (summary hero, Identification & lookalikes, Habitat & range, craft
  use, safety, sources) + materials↔projects cross-links; `build_field_cards.mjs`
  shares the font/palette refresh. All pages regenerated; both `--verify` gates
  green. Committed separately from the in-flight phenology work.
- **Part B — PENDING**: app.js fast-follows, still gated on the phenology
  build's app.js changes committing first (concurrent app.js writers corrupt the
  tree).

## To do (orchestrator, after profiles land)

### A. Generator redesign — `scripts/build_static_pages.mjs` (NON-app.js; safe to do while phenology build runs) — DONE
- Replace the inline CSS with a shared stylesheet matching the APP's day theme:
  self-host the real fonts (link `/fonts/...` woff2, or an inlined @font-face
  block pointing at them), the `--reg-*` day palette, the type ramp (Fraunces
  display headings, Public Sans body, Plex Mono small-caps labels), category
  color spines, and the sheet/card visual language. Keep it dependency-free and
  JS-free. Preserve the `@media print` teaching-pack rules (safety never hidden).
- Enrich material pages with the researched profile: hero (name / sci name /
  category chip / summary), **Identification & lookalikes** (safety-critical),
  **Habitat & season**, **Craft use**, safety block, sources — then the map CTA.
- **Cross-link materials ↔ projects**: material pages list "Make with it:"
  → the recipes whose `plantId` == the species id (data already in
  project-recipes.json); recipe pages already name their material — link it to
  the material page.
- Field cards (`scripts/build_field_cards.mjs`) share the CSS refresh.
- Keep the `--verify` staleness gates green; regenerate all pages + sitemap.

### B. app.js fast-follows — DO ONLY AFTER the phenology build's app.js changes are committed (concurrent app.js writers corrupt the tree)
- **Blank-map fix**: when arriving via `#...&sp=<id>` OR isolating a single
  species out of season, set `state.allSeasons = true` (or snap the day into the
  species' season) so "Open on the map" always shows the material. Touch
  `selectOnlySpecies` and/or the `urlBootState.speciesId` path.
- **Map-card cross-links**: add a "full profile →" link on the Materials sheet
  cards and Projects cards → `/materials/<id>.html` and `/projects/<id>.html`.

## Boundaries
- No safety/rule semantics changes. The researched profiles are safety-reviewed;
  never soften an existing safety tag.
- Surgical commits: keep the static-pages work (generator + pages + profiles)
  in its own commit, separate from the in-flight phenology work.
