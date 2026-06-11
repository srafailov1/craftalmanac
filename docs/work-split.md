# Work Split — who does what

Three agent tiers plus two scheduled Claude loops. The split exists to spend
each model's capability (and the owner's usage budgets) where it matters.
Owner reviews everything in GitHub Desktop; nobody pushes.

## Tier 1 — Claude (visionary / architectural)

Owns: brand identity and design rounds (see `docs/design/` on the
`design/relaunch` branch); architecture decisions and state machines (zoom
handoff, data pipelines' design); the permissions RULE system semantics
(what may be encoded, conservative defaults); review gates for the other
tiers; specs and work orders. The two 4am scheduled loops (debug tune-up
owning `KNOWN_ISSUES.md`; permissions research owning rule tables and
research docs) are Claude-tier work.

## Tier 2 — Codex (mid-level engineering)

Owns: well-specified multi-file engineering with judgment inside guardrails.
Specs come from Claude as work orders (`docs/TODO-*.md`) with phases,
acceptance gates, and Boundaries sections. Current assignment:
`docs/TODO-filtered-aggregates.md` — Phases 1–4 delivered and reviewed
(2026-06-12, approved); **Phase 5 (iNaturalist overview statuses) is the
active Codex task** — see the TODO file.

Codex queue:
1. TODO-filtered-aggregates Phase 5 (iNat status raster) — active.
2. After Phase 5: medicine-mode aggregate statuses (extend the bake to the
   medicine catalog so an active filter in Herbalism mode isn't empty —
   same pattern as food/ink; spec note in the TODO).
3. Mapbox Studio style implementation when the design direction is chosen
   (Claude provides the style spec from Round 2).

## Tier 3 — Qwen via opencode (junior, local, free)

Operating manual: `AGENTS.md` at repo root (hard rules live there).
Scope: single-file scripts, docs upkeep, mechanical validation — never core
app logic, never safety/permissions semantics, never data regeneration.

Qwen queue (work top-down, one per session):
1. **Data validation script.** Create `scripts/validate_data.mjs` (Node,
   no dependencies). Checks, printing PASS/FAIL per check and exiting
   nonzero on any failure: (a) every manifest chunk's `path` file exists
   and parses; (b) per-chunk row count equals `recordCount`; (c) summing
   `countsBySpeciesId` across chunks equals manifest `recordCount` total;
   (d) every chunk id has an `access-cache/` file and its array length
   equals the chunk's row count; (e) for each mode in `accessCounts`,
   per-species sums across statuses never exceed `countsBySpeciesId`;
   (f) `data/contiguous-us-states.json` has 49 states, each with bbox and
   MultiPolygon/Polygon geometry. Acceptance: running
   `node scripts/validate_data.mjs` on current data prints all PASS.
2. **Pre-commit check runner.** Create `scripts/check.sh` (bash, +x):
   runs `node --check app.js`, `node --check` on every `scripts/*.mjs`,
   then `node scripts/validate_data.mjs`. Clear summary, nonzero exit on
   failure. Acceptance: `bash scripts/check.sh` passes on current repo.
3. **Rule-test consolidation.** Create `scripts/test_rules.mjs`: extract
   rule functions from `app.js` by regex (the pattern is shown inside
   `scripts/build_access_status.mjs`) and assert: state-code lookups for
   5 known cities; NY/PA/WA/CA/NYC/CO/OR/MD/NC/MI/MN status outcomes for
   one synthetic land-text each (copy expected statuses from
   `docs/permissions-research-2026-06.md` tables); Great Smoky mushroom
   allowed; Rocky Mountain mushroom prohibited; Acadia mushroom prohibited.
   Acceptance: all assertions pass; wire it into `scripts/check.sh`.
4. **README refresh.** Update `README.md` to current reality: three modes,
   0.15-degree chunks, UTFGrid overview counts, permissions system and
   filtered aggregates, the docs/ map, the agent roster. Do not change
   ATTRIBUTION.md or safety language. Acceptance: no stale claims remain
   (grep for "0.05", "Mid-Atlantic", "starter records").
5. **Scripts README.** Create `scripts/README.md`: one paragraph per
   script — what it does, when to run it, inputs/outputs. Acceptance:
   covers every file in `scripts/`.

When the queue is empty, STOP — do not invent work. Ask for more via
`docs/qwen-questions.md`.

## Review chain

Qwen's commits -> reviewed by Codex or Claude before owner pushes.
Codex's commits -> reviewed by Claude (spot-validated, like the 2026-06-12
filtered-aggregates review). Claude's commits -> owner reviews directly.
Escalation files: `docs/qwen-questions.md`, `docs/codex-questions.md`.
