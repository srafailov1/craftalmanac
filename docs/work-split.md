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
Scope: documentation refreshes, scripts README, file inventories, simple shell
runners over commands that already work, smoke tests, and tightly scoped
mechanical edits whose pass/fail is obvious from the task text alone. Never
core app logic, never safety/permissions semantics, never data regeneration.

**Do NOT assign Qwen tasks that involve (route these to Codex or Claude):**
- extracting functions or constants out of `app.js` into a VM/Node harness
  (the regex-extraction pattern in `scripts/build_access_status.mjs` is
  senior-tier work);
- permission-rule semantics — what status a piece of land or species should
  return, or any reasoning about NPS/state/PAD-US rule predicates;
- safety language, disclaimers, or species safety/harvest-ethic tags;
- interpreting a data schema beyond the explicit field examples a task spells
  out (e.g. manifest `chunks` vs `states`, `accessCounts` nesting);
- tests or checks that can print PASS without actually asserting the intended
  behavior. If a junior task needs a test that truly exercises rule logic, it
  is not a junior task.

Why: across the 2026-06 queue Qwen misread the manifest schema (used
`manifest.states` instead of `manifest.chunks`), printed PASS after inner
failures, and wrote rule tests that passed without asserting real behavior
(null records, synthetic land text that matched no app.js predicate, a
mushroom test whose species lacked `category: "mushroom"`). It reliably
handles docs and simple runners; it does not reliably handle app.js semantics.

Qwen queue (work top-down from the first item not marked DONE or BLOCKED, one per fresh session):
1. **Data validation script — DONE.** `scripts/validate_data.mjs` exists and
   passes on current data. (Originally drafted by Qwen; repaired and committed
   by Codex — schema-interpretation bugs put it over the junior line.) Do not
   redo this item unless a senior agent asks.
2. **Pre-commit check runner — DONE.** `scripts/check.sh` exists, is
   executable, and passes on current data. Do not redo this item unless a
   senior agent asks.
3. **Rule-test consolidation — DONE (Claude/Codex-tier, reassigned off Qwen).**
   `scripts/test_rules.mjs` extracts the rule functions from `app.js` and
   asserts state-code lookups for 5 cities, the NY/PA/WA/CA/NYC/CO/OR/MD/NC/MI/MN
   status matrix, and Great Smoky / Rocky Mountain / Acadia mushroom outcomes;
   it is wired into `scripts/check.sh`. Expected statuses are read from the
   encoded `app.js` logic (the cited `docs/permissions-research-2026-06.md` does
   not exist; `docs/permission-inferences-2026-06.md` is the closest doc). This
   item required app.js extraction and rule semantics, so it was never a safe
   Qwen assignment — it is logged here as senior-tier work, completed. Do not
   re-queue it for Qwen.
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
