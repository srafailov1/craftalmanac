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
2. **Mapbox Standard style — UNBLOCKED.** Spec is `docs/design/standard-style-spec.md`
   (2026-06-13). Codex's part is the C4 audit (spec §4): a written note
   `docs/design/notes-codex-c4.md` on the three `FALLING_FRUIT_AGGREGATE_*`
   layers (emissive-strength property support in the pinned Mapbox GL JS
   3.23.1, color consistency across `lightPreset`s, zoom-handoff bridge
   interaction). No `app.js`/`styles.css`/`index.html` edits — Claude applies
   the actual migration (map init is Claude-only per `work-order-redesign.md`).
3. **Link-checker reference-extraction spec (unblocks Qwen #7).** Author the
   spec Qwen needs to build `scripts/check_links.mjs`. Define exactly what
   counts as a local reference in `index.html`: which attributes (`href`,
   `src`), how `?v=` cache-bust query strings are stripped before resolving to
   disk, which schemes/hosts to skip (absolute `http(s)://`, the Mapbox CDN,
   `data:` URIs), and how root-relative vs. relative paths resolve against the
   repo root. Deliver as a short work order `docs/TODO-link-checker.md` with a
   Boundaries section and the gate Qwen runs (`node scripts/check_links.mjs`
   exits 0 on the current tree; the script is wired into `scripts/check.sh`).
   Deciding what forms count as references is the senior part; Qwen runs the
   implement→gate loop. Diagnostic context: 2026-06-11 health check confirmed
   `index.html` cache tokens are consistent (`filtered-access-3`) and the tree
   is clean, so this is greenfield, not a regression fix.
4. **Extend overview status-raster coverage to encoded-rule areas — spec ready:
   `docs/TODO-overview-rule-coverage.md`.** Root cause (confirmed in code): the
   low-zoom iNaturalist overview colors cells from the baked status raster,
   which is generated only for the Falling Fruit chunk footprint. Encoded rule
   areas with no Falling Fruit data (e.g. Sequoia / Kings Canyon NP, the Indiana
   Dunes park polygon) therefore have no raster cell and show `"unknown"` when
   zoomed out, even though the high-zoom point layer labels them correctly. The
   work order extends `fetch_padus_cell_containment.mjs` + `build_status_raster.mjs`
   to cover the `NPS_GATHERING_RULES` parks and bounded `SITE_ACCESS_RULES`
   sites, with a node gate asserting Sequoia/Kings Canyon/Indiana Dunes resolve
   `food=allowed` in the rebuilt raster. Boundaries: rule **semantics** stay in
   `app.js` (Claude-owned); this only changes which cells are baked. Data
   regeneration, so explicitly off Qwen.

## Tier 3 — Qwen via opencode (junior, local, free)

Operating manual: `AGENTS.md` at repo root (hard rules live there).

Goal: push as much of the project's mechanical, high-volume, low-judgment work
onto Qwen as we safely can. It is free and local, so every task it clears is a
Claude/Codex credit saved — the aim is to keep its queue full of well-formed,
gated work, not to leave it idle. Scope: documentation refreshes, scripts
README, file inventories, link/asset and version-consistency checkers,
whitespace/newline normalization, smoke tests, simple shell runners over
commands that already work, running senior-written extractor scripts, and
tightly scoped mechanical edits whose pass/fail is obvious from the task text
alone. Never core app logic, never safety/permissions semantics, never data
regeneration.

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

### Get more out of Qwen: the gate pattern

The way to hand Qwen bigger jobs without raising risk is to make correctness
machine-checkable. A senior (Claude or Codex) writes the spec **and a
verification command** — a script or one-liner that exits 0 only when the task
is done correctly. Qwen then runs the implement → run → fix loop against that
gate for free. Spend senior credits on the part that needs judgment (defining
"done" precisely and writing the gate); spend Qwen's local compute on the grind
of satisfying it. A task with a real gate is safe for Qwen even when it touches
several files; a task without one is not, however small it looks.

### Qwen task template

Every Qwen queue item should be written so it reads mechanically:

- **Files:** exact path(s) to create or edit (line ranges for existing files).
- **Steps:** the concrete actions, in order.
- **Verification:** one command that exits 0 when done (e.g. `bash scripts/check.sh`,
  a `grep`/`comm` one-liner, `node --check`).
- **Acceptance:** the criteria that command enforces, stated plainly.
- **Boundaries:** files/areas not to touch (always includes safety/permission text).

If an item can't be written this way, it isn't a Qwen item — keep it with Codex
or Claude.

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
6. **Docs inventory — `docs/INDEX.md`.** Create it: one line per file under
   `docs/` (recursively), formatted `path — short description`. Take the
   description from each file's first heading/title line only; do not summarize
   or interpret permissions/rule content. Boundaries: read-only except the new
   file. Verification (prints nothing when every doc is listed):
   `comm -23 <(find docs -type f ! -name INDEX.md | sort) <(grep -oE 'docs/[^ —]+' docs/INDEX.md | sort)`.
7. **Link/asset existence checker — `scripts/check_links.mjs`.** Using the
   reference-extraction spec a senior hands you, assert every local file
   referenced by `index.html` (href/src and `?v=` assets) exists on disk; exit
   nonzero listing any miss. Wire it into `scripts/check.sh`. Boundaries: do not
   modify `index.html`. Verification: `node scripts/check_links.mjs` exits 0 on
   the current tree and `node --check scripts/check_links.mjs` passes. (If the
   task arrives without the extraction spec, escalate — inventing what counts as
   a reference is not your call.)
8. **Cache-version consistency — fold into `scripts/check.sh`.** Add a step that
   asserts the `?v=` query strings on `app.js` and `styles.css` in `index.html`
   share the same version token. Boundaries: do not edit `index.html`; only add
   a check. Verification: `bash scripts/check.sh` exits 0 now, and flips to
   nonzero if you desync the two tokens in a scratch copy.
9. **Whitespace / final-newline normalization (docs + scripts only).** Trim
   trailing whitespace and ensure exactly one final newline on every `*.md`
   under `docs/` and every file under `scripts/`. Boundaries: never touch
   `app.js`, `styles.css`, `index.html`, `config.js`, `data/`, `ATTRIBUTION.md`,
   `CLAUDE.md`, or any safety text. Verification: the normalizer is idempotent —
   a second run leaves a clean `git status --short` — and `bash scripts/check.sh`
   still exits 0.
10. **Standing task — run senior-written extractors.** When a senior places an
    extractor script in `scripts/` with its run command and expected output
    shape, run it and format the output into the named file. You run the gate;
    you never author extraction logic or interpret `app.js`. Acceptance: the
    senior's stated verification command exits 0.
11. **Create the escalation stub files.** `docs/work-split.md` and the TODO
    docs route blocked work to `docs/qwen-questions.md` and
    `docs/codex-questions.md`, but neither file exists yet.
    - Files: create `docs/qwen-questions.md` and `docs/codex-questions.md`.
    - Steps: give each an H1 title (`# Qwen Questions` / `# Codex Questions`)
      and one sentence stating it is the escalation channel back to a senior
      agent; leave the body empty (no invented questions).
    - Verification: `test -f docs/qwen-questions.md && test -f docs/codex-questions.md`
      exits 0.
    - Acceptance: both files exist, each with a title line.
    - Boundaries: create only these two files; touch nothing else.
12. **Remove stray `.DS_Store` files from the working tree.** macOS left
    `.DS_Store` files in the repo root and `docs/`; they are gitignored and
    untracked but clutter the tree.
    - Files: delete every `.DS_Store` under the repo (none are git-tracked, so
      this only removes ignored junk).
    - Steps: `find . -name .DS_Store -not -path './.git/*' -delete`.
    - Verification: `find . -name .DS_Store -not -path './.git/*'` prints
      nothing afterward, and `git status --short` stays clean.
    - Boundaries: delete only `.DS_Store`; do not remove or modify any other
      file.

Items 6–9 and 11–12 are scoped and ready; 10 is a standing pattern. When the
queue is empty, STOP — do not invent work. Ask for more via
`docs/qwen-questions.md`.

## Review chain

Qwen's commits -> reviewed by Codex or Claude before owner pushes.
Codex's commits -> reviewed by Claude (spot-validated, like the 2026-06-12
filtered-aggregates review). Claude's commits -> owner reviews directly.
Escalation files: `docs/qwen-questions.md`, `docs/codex-questions.md`.
