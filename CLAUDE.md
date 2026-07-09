# Craft Almanac — Material Maps

A map-based site sharing local material availability, ethical harvesting practices, craft knowledge, and safety information. Used in the owner's teaching, research, and personal craft work.

## Project values (apply to all work)

- Maintain a high ethical standard for material engagement and knowledge distribution.
- Occurrence data is never harvest permission. Keep that distinction explicit in UI text, popups, and docs.
- Safety first: no new mushroom/fungi taxa without a species-level edible whitelist; the medicine mode carries an educational-use disclaimer — preserve it.
- Favor abundant, resilient species suited to low-impact harvesting; invasive removal is encouraged where it supports ecosystems.
- Respect data licenses (mostly CC BY-NC variants). Any new data source must be added to `ATTRIBUTION.md` with license notes before it ships.
- Permission-required sources (e.g., NPS historic orchards) stay labeled that way.

## Architecture

Static assets served by a thin Cloudflare Worker, no build step, no framework, no
package manager. Vanilla JS + Mapbox GL JS. The Worker exists only for the report
form; every real file is still served as a static asset.

- `worker.js` — Cloudflare Worker entrypoint (`main` in `wrangler.jsonc`). Handles
  `POST /api/report` (the in-site "Report an error" form) by sending to
  `reports@craftalmanac.com` via the Cloudflare Email Sending `send_email` binding;
  every other request falls through to `env.ASSETS.fetch`. Abuse control is a
  honeypot field + per-IP `ratelimits` binding (no cookies). No npm deps. Requires
  a one-time `wrangler email sending enable craftalmanac.com` on the account before
  sends succeed; until then the forms degrade to a `mailto:` fallback. `.assetsignore`
  keeps `worker.js` out of the served origin.
- `index.html` — single page (~120 lines)
- `app.js` — entire application (~11,000 lines; re-check anchors, it moves).
  Constants, safety tags, and rule tables at top; species catalogs from ~line 690;
  `MAP_MODE_CONFIG` (line ~2105) defines the four modes: **food**, **ink**,
  **medicine**, **minerals**, each with its own catalog, categories, and colors;
  `state` object (~2213); the map + register engine follows; then the render,
  load, aggregate, offline, and access-rule functions. Large content tables
  (PROJECT_RECIPES, material profiles) were extracted to fetched JSON in `data/`.
- `styles.css` — all styling (~3,400 lines; `--reg-*` register tokens ~line 1310)
- `config.js` — Mapbox public token (`window.FORAGE_CONFIG`); committed intentionally, URL-scoped in the Mapbox account
- `data/` — US boundary GeoJSON (Census-derived), NPS historic orchards, USGS MRDS
  minerals (`minerals-us.json`), USFS forest rules, local jurisdictions, phenology
  curves, tide stations, `falling-fruit/us/` (~125 MB of viewport chunks +
  manifest), and `inaturalist/us/` (baked iNaturalist points from a GBIF DWCA
  download: ~2.56 M points in ~8,900 0.30-degree chunks + manifest). Both chunk
  trees load lazily at zoom ≥ 8; their access-cache dirs are build-only.
- `scripts/` — Python + Node generators and the gate suite (`check.sh`;
  `build_falling_fruit_subset.py` takes `--types/--locations` archive paths;
  `build_inaturalist_subset.mjs` + friends bake the iNaturalist tree, see
  `docs/TODO-inaturalist-chunk-bake.md`)
- Adding a 5th mode touches more than `MAP_MODE_CONFIG` — follow
  `docs/adding-a-mode.md`.

## Data sources

Live: USGS PAD-US ArcGIS service (public-access polygons). Cached/derived: Falling Fruit chunks, iNaturalist chunks (baked from a quarterly GBIF DWCA download; the live iNaturalist API is retired for the map, though `USE_BAKED_INATURALIST` still gates a removable fallback), NPS orchards, Census boundaries. Access-rule summaries are hand-encoded from NPS compendiums and 36 CFR 2.1 — see `ATTRIBUTION.md` for all sources and caveats.

## Known issues

`KNOWN_ISSUES.md` is the debug queue. Check it at the start of debugging
sessions; update or clear entries as they're resolved. `bash scripts/check.sh`
runs the full gate suite (syntax, dup-lint, data validation, safety-tag
completeness, rule tests, phenology↔catalog, overview coverage, contrast) and
must pass before committing; a GitHub Action (`.github/workflows/check.yml`)
also runs it on push/PR.

## Collaborators

**As of 2026-07, Claude is the only agent on the project.** Codex and Qwen are
retired; the multi-tier work-split in `docs/work-split.md` and the Codex/Qwen
references in `AGENTS.md` are historical. When a task is too large for one
context, Claude fans out its OWN sub-agents/sessions (in-session) rather than
handing to external tiers, and writes scoped work orders in `docs/TODO-*.md`
for those runs. The overnight scheduled Claude loops still apply where the
owner keeps them running (3am health check → `KNOWN_ISSUES.md`; 4am permissions
research → rule tables; 5am debug tune-up → `KNOWN_ISSUES.md`; 7am
attribution/license audit → `ATTRIBUTION.md`).

The active roadmap is `docs/critique-remediation-plan.md` (phases 1–4 landed;
phase 5 strategic work and its OWNER GATEs remain).

## Workflow

- Repo: `github.com/srafailov1/craftalmanac`, branch `main`. Cloudflare (Workers static assets, `wrangler.jsonc`) auto-deploys on push.
- Claude edits files and commits locally with descriptive messages; the user reviews in GitHub Desktop and pushes. Claude never pushes.
- Bump static asset version query strings in `index.html` when changing `app.js`/`styles.css` (see commit history convention).
- Test locally: `python3 -m http.server 4173 --bind 127.0.0.1`

## Conventions

- Keep the single-file structure (`app.js`, `styles.css`) unless the user asks to split.
- Commit messages: short imperative subject, like the existing history ("Smooth aggregate zoom handoff").
- Species catalog entries carry safety tags (`SAFETY_TAGS_BY_SPECIES`) and harvest-ethic labels (`HARVEST_ETHIC_BY_SPECIES`) — new species need both considered.
- Don't commit `.DS_Store`; respect `.gitignore` (wrangler/env files).
