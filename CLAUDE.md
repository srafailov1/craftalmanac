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

Static site, no build step, no framework, no package manager. Vanilla JS + Mapbox GL JS.

- `index.html` — single page (~150 lines)
- `app.js` — entire application (~3,900 lines). Constants and species catalogs at top; `MAP_MODE_CONFIG` (line ~762) defines the three modes: **food**, **ink**, **medicine**, each with its own species catalog, categories, and colors; `state` object (~834); DOM refs (~900+); then ~170 functions.
- `styles.css` — all styling
- `config.js` — Mapbox public token (`window.FORAGE_CONFIG`); committed intentionally, URL-scoped in the Mapbox account
- `data/` — US boundary GeoJSON (Census-derived), NPS historic orchards, and `falling-fruit/us/` (~94 MB of viewport chunks + manifest; loaded lazily at zoom ≥ 8)
- `scripts/` — Python generators: `build_falling_fruit_subset.py` (regenerates chunks from Falling Fruit CSV archives), `build_nps_orchards.py`

## Data sources

Live: iNaturalist API (observations), USGS PAD-US ArcGIS service (public-access polygons). Cached/derived: Falling Fruit chunks, NPS orchards, Census boundaries. Access-rule summaries are hand-encoded from NPS compendiums and 36 CFR 2.1 — see `ATTRIBUTION.md` for all sources and caveats.

## Known issues

`KNOWN_ISSUES.md` is the debug queue owned by the 5am tune-up loop; the 3am
health check also logs failures here. Check it at the start of debugging
sessions; update or clear entries as they're resolved.

## Collaborators

Three agent tiers — see `docs/work-split.md` for the full split and queues.
Claude: architecture, design, rule semantics, reviews, and five staggered
overnight scheduled loops that feed each other's outputs (times have
load-balancing jitter):

- **3am — data/source health check** (read-only): probes the iNaturalist and
  USGS PAD-US APIs, Falling Fruit/GeoJSON integrity, and external source
  links; logs failures to `KNOWN_ISSUES.md`.
- **4am — permissions research**: verifies primary sources and encodes rules;
  owns the rule tables and research docs; routes oversized work to a
  "Hand-offs" section.
- **5am — debug tune-up**: owns `KNOWN_ISSUES.md`; fixes bugs and perf, hands
  off large refactors.
- **6am — queue grooming** (doc-only): turns the night's hand-offs into scoped
  work orders for Codex and Qwen, prunes/de-dupes the queues.
- **7am — attribution/license audit**: confirms every data source has an
  `ATTRIBUTION.md` entry with correct license terms; flags ambiguous licenses
  for the owner.

Codex: mid-level engineering from work orders (`docs/TODO-*.md`). Qwen (local,
via opencode): junior tasks per `AGENTS.md` and the queue in
`docs/work-split.md`. Stay out of each other's areas; Boundaries sections are
the contract. Design work lives on the `design/relaunch` branch, never `main`.

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
