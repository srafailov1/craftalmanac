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
acceptance gates, and Boundaries sections. Recent assignment
`docs/TODO-filtered-aggregates.md` Phases 1–5 is delivered.

Codex queue:
1. TODO-filtered-aggregates Phase 5 (iNat status raster) — DONE. Phase 5
   covers medicine mode end to end — step 2 bakes `{food, ink, medicine}`
   statuses into the cell raster and step 3 filters the iNat-only medicine
   overview through it.
2. Mapbox Studio style implementation — BLOCKED until the `design/relaunch`
   Round 2 direction is chosen; Claude provides the style spec from Round 2.
   Do not start before the spec lands.

## Tier 3 — Qwen via opencode (junior, local, free)

Operating manual: `AGENTS.md` at repo root (hard rules live there).
Scope: single-file scripts, docs upkeep, mechanical validation — never core
app logic, never safety/permissions semantics, never data regeneration.

Qwen queue (work top-down from the first item not marked DONE or BLOCKED, one per fresh session):
1. **Data validation script — DONE.** `scripts/validate_data.mjs` exists and
   passes on current data. Do not redo this item unless a senior agent asks.
2. **Pre-commit check runner — DONE.** `scripts/check.sh` exists, is
   executable, and passes on current data. Do not redo this item unless a
   senior agent asks.
3. **Rule-test consolidation — ACTIVE.** Create `scripts/test_rules.mjs`:
   extract rule functions from `app.js` by regex (reuse the extraction pattern
   shown inside `scripts/build_access_status.mjs`) and assert: state-code
   lookups for 5 known cities; NY/PA/WA/CA/NYC/CO/OR/MD/NC/MI/MN status
   outcomes for one synthetic land-text each (copy expected statuses from
   `docs/permissions-research-2026-06.md` tables); Great Smoky mushroom
   allowed; Rocky Mountain mushroom prohibited; Acadia mushroom prohibited.
   Acceptance: `node scripts/test_rules.mjs` passes; `bash scripts/check.sh`
   passes after wiring `scripts/test_rules.mjs` into `scripts/check.sh`.
4. **README refresh.** Update `README.md` to current reality: the three
   modes (food / ink / medicine), 0.15-degree chunks, UTFGrid overview
   counts, the permissions system and filtered aggregates, the docs/ map,
   and the agent roster. The current README still frames the catalog as a
   Shenandoah-only "starter species list" (line ~38) and a single food mode
   (line ~19) — both are stale. Do not change ATTRIBUTION.md or safety
   language. Acceptance: (a) `grep -niE "starter species|0\.05|Mid-Atlantic"
   README.md` returns nothing; (b) the README names all three modes and the
   permission filter; (c) the line about Falling Fruit no longer being
   "starter records" stays accurate (it is a correct negation — do not flag
   it). Leave the existing edible-fungi whitelist caveat intact.
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
