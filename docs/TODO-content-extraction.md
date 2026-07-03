# Work order — extract embedded content from app.js to fetched JSON

Phase 4.1/4.2 of `docs/critique-remediation-plan.md`. app.js is ~75% embedded
content (measured: 821KB const data vs 274KB functions; PROJECT_RECIPES alone
is ~594KB = 55% of the file). Every code tweak forces users to re-download all
of it, and the content can't be linted, diffed, or reused as data.

## Phase A — PROJECT_RECIPES → data/project-recipes.json

1. Write `scripts/extract_recipes.mjs`: vm-extract `PROJECT_RECIPES` from
   app.js (reuse the extractor in `build_phenology_histograms.mjs` /
   `test_safety_tags.mjs`), write `data/project-recipes.json`, and print a
   checksum of the parsed structure.
2. In app.js: replace the const with `let PROJECT_RECIPES = [];` plus a
   startup `fetch("./data/project-recipes.json")` that fills it and re-renders
   the Projects sheet if it is open. All consumers (sheetProjectsHTML,
   openRecipeDetail, recipe-link buttons in species notes) must handle the
   empty-until-loaded state with a "loading projects…" placeholder.
3. Gate: a node script asserts the JSON parses, every recipe keeps its id/kind,
   and the count matches the pre-extraction checksum. Wire into check.sh.
4. Bump the asset version; verify the Projects sheet, a recipe detail, and a
   species-note recipe link in the browser.

## Phase B — rules tables + species catalogs → data/

Same pattern for `NPS_GATHERING_RULES`, `SITE_ACCESS_RULES`,
`MINERAL_ACCESS_RULES`, `usfs` remains a file already, and the four
`*SpeciesCatalog` consts. IMPORTANT: these load at startup before first render
(unlike recipes they gate rule resolution), so they need a boot barrier —
follow how `flush-thresholds.json` is loaded and gated today.

Phase B is also the groundwork for Phase 5.1/5.2 (rules dataset publication +
provenance fields); coordinate the JSON schema with
`docs/critique-remediation-plan.md` 5.2 (add `verifiedBy`/`verifiedDate` per
rule while restructuring).

## Boundaries

- Do NOT change rule SEMANTICS, safety tags, or catalog content — this is a
  pure format move. Any diff in vm-extracted structure fails the gate.
- Scripts that vm-extract consts from app.js (`validate_data.mjs`,
  `test_rules.mjs`, `test_safety_tags.mjs`, `build_phenology_histograms.mjs`)
  must be updated to read the JSON instead — keep their assertions identical.
- Keep the no-build-step constraint: plain fetched JSON, no bundler.
- Coordinate with the planned service worker (plan 5.5): the extracted files
  belong in the offline shell manifest in the same change or a fast follow.
