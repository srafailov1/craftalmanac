# Codex Onboarding Prompt

Paste everything below this line into Codex when starting it on this repo.

---

You worked on this repo (Craft Almanac, craftalmanac.com) earlier and built
the original prototype. The project has changed substantially since, and your
role is changing too. Read `CLAUDE.md` at the repo root first — it is the
authoritative guide to values, architecture, and workflow — then read
`docs/TODO-filtered-aggregates.md`, which is your work order.

## What changed since you last worked here

**Data layer.** Falling Fruit viewport chunks were re-gridded from 0.05° to
0.15° (6,063 -> 2,905 files; `scripts/merge_falling_fruit_chunks.py`;
`build_falling_fruit_subset.py` now emits 0.15° directly). The over-cap
viewport case loads nearest-to-center chunks instead of dropping everything.

**Overview aggregation was rebuilt.** The zoomed-out circles (zoom < 8) now
combine Falling Fruit manifest counts with live iNaturalist counts fetched as
UTFGrid tiles (`/v1/grid/{z}/{x}/{y}.grid.json`, 4-12 requests per view
instead of ~220 per-rectangle count queries). Painting is atomic: partial
data never renders. There is a gated handoff state machine between aggregate
circles and point clusters around zoom 8 (`updateLayerHandoff`, paint gates,
bridge timers). It is the subject of an active debugging effort tracked in
`KNOWN_ISSUES.md`. **Do not modify the handoff/bridge/aggregate-paint code.**

**Clustering/display tuning.** Cluster radius 40, clusterMaxZoom 12;
individual points stay hidden while any cluster is in the viewport (a
density-adaptive reveal). Aggregate buckets are sized to ~110 screen px at
all zooms.

**Permissions system (the big one).** Every record gets a harvesting-
permission status (allowed / permit-required / private / private-unsourced /
unknown / prohibited) computed in `app.js` by `computeRecordAccessRule`:
site-specific rules (`SITE_ACCESS_RULES`: Monticello, UVA gardens, four
public food forests), NPS park compendium designations
(`NPS_GATHERING_RULES`: 16 parks, all verified against primary compendiums),
state systems (NY, PA, WA, CA, NYC, CO, OR, MD, NC, MI, MN — keyed by a
state code derived from Census polygons in
`data/contiguous-us-states.json` via `getRecordStateCode`), federal defaults
(USFS/BLM allowed; USFWS refuges and Army Corps prohibited), and PAD-US
public-access polygons fetched live from an ArcGIS service (paginated; note
the service returns errors as HTTP 200 bodies — check `data.error`).
Research provenance lives in `docs/permissions-research-2026-06.md`;
`ATTRIBUTION.md` lists every source and must be updated before any new data
source ships.

**Process.** Two scheduled Claude agents run nightly at 4am: a debug/tune-up
pass (owns `KNOWN_ISSUES.md` and the zoom-handoff bug) and a permissions-
research pass (owns `NPS_GATHERING_RULES`/`SITE_ACCESS_RULES`/state rules and
the research docs). Commits are made locally with short imperative subjects;
the owner reviews in GitHub Desktop and pushes; **nobody ever pushes**.
Bump the `?v=` asset version strings in `index.html` whenever `app.js` or
`styles.css` change. The stack is intentionally framework-free: vanilla JS,
single `app.js`, no build step, no package manager — keep it that way.

## Your new role

You are the data-pipeline engineer for one project: **permission-filtered
overview aggregates**, specified completely in
`docs/TODO-filtered-aggregates.md`. It is deliberately mechanical: a
resumable fetch script, point-in-polygon computation, a manifest schema
extension, validation gates, and a contained app.js integration. Follow the
spec's phases in order, one commit per phase, and respect its "Boundaries"
section — the nightly agents own the areas listed there, and overlapping
edits will collide at 4am.

Two hard rules from the project's ethics: never present an unverified or
approximated permission as verified (the spec's validation gates exist for
this), and never weaken safety or disclaimer language anywhere.

If something in the spec is ambiguous or app.js has drifted from what the
spec describes, stop and leave a note in your commit message or a
`docs/codex-questions.md` file rather than guessing.
