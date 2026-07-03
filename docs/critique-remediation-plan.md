# Critique Remediation Plan — 2026-07

Source: full-site critique (mission / identity / functionality / design / data-trust /
strategy, July 2026). This file is the working checklist. Each phase is a set of
small commits on `minerals-map`; the owner reviews in GitHub Desktop between phases
and can reorder, cut, or pivot at any checkpoint. Items marked **OWNER GATE** need a
decision or personal input before they can ship.

Status legend: `[ ]` todo · `[x]` done · `[~]` in progress · `[!]` blocked/gate

---

## Phase 1 — Safety & trust corrections (smallest diffs, highest values-alignment)

The four findings that touch correctness and the project's own "safety first /
occurrence is not permission" values. All are surgical app.js/scripts edits.

- [x] 1.1 Render the rule's `accessNote` (incl. "Verified … June 2026" text) in the
      point card — the trust signal is computed but currently dropped before render.
      *Done: `.rule-note`, verified rows show a green ✓; commit e7bb490.*
- [x] 1.2 Handle iNaturalist obscured coordinates: skip taxon-obscured (conservation)
      observations entirely; badge observer-obscured points as approximate (±20 km)
      instead of plotting them as precise harvest spots. *Done: `mapINaturalistObservation`
      drops taxon-obscured, flags `approximate`; `.approx-note` badge.*
- [x] 1.3 Abandoned-mine hazard language in Minerals: lede/dataNotes sentence + a
      standing note on every MRDS point card (never enter shafts/adits; surface
      float only). Include the MRDS data-age framing ("historic mining inventory,
      frozen ~2011–2022"). *Done: `.mine-hazard` block + dataNotes.*
- [x] 1.4 Seasonality honesty caveat: one visible line on the season/histogram panel —
      timing is a contiguous-US average; local ripening varies by weeks. (Full
      regional phenology is Phase 5.) *Done: `.season-caveat`.*
- [x] 1.5 Safety-tag completeness gate in `scripts/check.sh` + fill the three missing
      medicine species (broadleaf-plantain, goldenrod, garlic-mustard). *Done:
      `scripts/test_safety_tags.mjs`; all 113 food/ink/medicine species now explicit.
      Note: harvest-ethic gate deferred — default "light harvest" is acceptable.*
- [x] 1.6 De-jargon safety-critical copy: "parcel rule" → "who manages this land";
      "unsourced" → "unchecked"/"not yet researched". *Done.*

**Checkpoint 1:** review the commits; nothing structural has moved. **DONE (commit e7bb490).**

> ✅ RESOLVED: the pre-existing `ink-honeysuckle` chunk mismatch (~86
> validate_data failures) was fixed on a parallel branch and cherry-picked into
> main (commit 1d32504). `scripts/check.sh` is now fully green.

## Phase 2 — Say what it is (copy, identity, onboarding)

- [x] 2.1 Welcome modal restructure: mission + differentiator first, safety block
      second (set off with a rule), all warnings preserved. Button: "Enter the map".
- [x] 2.2 Revive dead copy: `config.lede` atop the Materials sheet; `config.dataNotes`
      in a new About "This map's sources" block; removed the dead DOM write.
- [~] 2.3 **OWNER GATE — needs your words:** About now has a "Who made this" block
      with a clearly-marked `[OWNER — replace this…]` placeholder, plus a
      "Terms & privacy" block (no-warranty + Open-Meteo/Mapbox privacy). **Replace
      the placeholder with your real byline before pushing.**
- [x] 2.4 Nav label "Plants" → "Materials"; per-mode swap removed.
- [x] 2.5 "Therapeutic Uses" → "Traditional Uses"; enriched the thin medicine lede.
- [x] 2.6 Projects eyebrow reads "INK & DYE"; non-ink modes get a scope note.
- [x] 2.7 README rewritten for the four-mode product + rules layer.
- [x] 2.8 Wordmark bumped to 21px/600 (18px mobile) so the display serif reads.

**Checkpoint 2:** the product now introduces itself correctly. **DONE (commit a3704fa).**
One OWNER action outstanding: replace the About "Who made this" placeholder.

## Phase 3 — UX repairs (interaction)

- [x] 3.1 Register override: Auto / Day / Night toggle in the conditions-rail sun
      panel, persisted in localStorage; `color-scheme: dark` under dusk/night.
      *Done, commit 3d4c93c.*
- [x] 3.2 Category-tinted clusters: cluster sources aggregate per-category counts;
      fill = dominant category of the ACTIVE mode (70% hue / 30% cream),
      register-aware; count labels get a halo. Expression verified accepted by
      Mapbox GL live; visual pass on next unoccluded look. *Commit b5398aa.*
      (Sub-zoom-8 aggregate tint deferred — different data path, no per-category
      counts baked yet.)
- [x] 3.3 Masthead mode pills (Food · Ink/Dye · Herbalism · Minerals) with mode
      colors; desktop always-visible; mobile keeps menu→Maps. *Commit b5398aa.*
- [x] 3.4 URL hash state (map, center/zoom, day/workability/all-seasons, isolated
      species) + restore; last map persists. Verified end-to-end in Chrome.
      *Commit b5398aa.*
- [x] 3.5 Minerals chrome: Workability button no longer opens the date form (guarded
      + hidden on desktop); legend expands to min(70vh,460px)+scroll so all 15
      chips are reachable. Histogram header already correct at runtime
      ("MATERIALS BY WORKABILITY"). *Done, commit 3d4c93c.*
- [x] 3.6 Register-aware category colors: registerCategoryColor() lifts dark hues
      to a luminance floor on dusk/night (legend, histograms, season cats, cluster
      tint); auto day/night basemap kept deliberately (owner decision — night
      foragers), marker halo raised to 0.55 to lift dark icons. *Commit 1b9cf23.*
      (Dawn/dusk accent-contrast audit still open — tracked under 3.6b below.)
- [x] 3.7 Text selection in point cards; ≥24px targets for legend chips / season
      buttons; 16px slider thumb. *Done, commit 3d4c93c.*
- [x] 3.8 First-run coach chip (search your town → open Materials), dismissible,
      auto-dismissed by doing either action. *Commit b5398aa.*
- [~] 3.9 "In view" record list shipped (bb48969) then REMOVED as bar clutter
      per owner (commit d6fa623). The keyboard-route need is unmet again; the
      building blocks (buildRecordFeature → openRecordCard) remain, so a future
      keyboard route belongs in the Materials sheet, not the season bar.
- [ ] 3.6b Small follow-up: lift dawn (#d98a6a) and dusk (#ff9447) accents to
      ≥4.5:1 against their panels (audit_contrast.mjs candidate).

**Checkpoint 3: DONE** (commits 3d4c93c, 1b9cf23, b5398aa, bb48969) plus the
owner-directed edits (welcome copy, About profile, histogram counts). Note:
local Mapbox rendering stalls when the browser window is occluded (Chrome
throttles rAF; Mapbox load never fires) — this, not the token, caused most
local blank-map flakiness. Cluster-tint visuals deserve one unoccluded look.

## Phase 4 — Engineering foundations

- [x] 4.1 Extracted PROJECT_RECIPES → `data/project-recipes.json` (app.js
      ~17k→~10.8k lines); lazy-loaded, per-map shelves, validation gate.
      *Commit b21e029.* Created the per-map `map`/`kind` seam the food + mineral
      project cards drop into (in flight — background agents transforming
      `docs/research/*` into `data/project-recipes.{food,mineral}.json`).
- [!] 4.2 Extract rules tables + catalogs → JSON. **Still a scoped work order:
      `docs/TODO-content-extraction.md` Phase B** — lower priority than the
      cards; coordinate its schema with Phase 5.2 provenance fields.
- [x] 4.3 `.assetsignore` shipped (keeps ATTRIBUTION.md deployed). *Commit c6b01d6.*
- [x] 4.4 CI workflow shipped (`.github/workflows/check.yml`); the
      ink-honeysuckle fix is merged so the suite is now GREEN.
      **OWNER: enable required-status branch protection** (Settings → Branches).
- [~] 4.5 Builder paths parameterized (`--types/--locations`). **OWNER items
      remaining:** archive the Falling Fruit CSVs out of ~/Downloads and record
      the snapshot date in ATTRIBUTION.md; run `git gc` when no other agent
      session holds the repo (it hit a lock from the parallel session — the
      pack is only 22 MiB, just ~180 orphaned tmp objects to clear).
- [x] 4.6 Perf: rAF-coalesced slider renders; unconditional map.resize()
      removed from render(); Retry-After-aware iNat backoff; point-band loads
      through mapWithConcurrency(4). *Commit c6b01d6.* (getVisibleRecords
      memoization left as a follow-up if minerals drags still jank on phones.)
- [x] 4.7 CLAUDE.md anchors refreshed + `docs/adding-a-mode.md` written.
      *Commit c6b01d6.* (Auto-regenerating the anchors is a nice-to-have for
      the 5am loop.)
- [~] 4.8 Zoom-handoff regression harness. **In flight** — background agent
      building `scripts/test_zoom_handoff.mjs` per `docs/TODO-zoom-handoff-harness.md`.

**Checkpoint 4: DONE and MERGED TO MAIN.** ink-honeysuckle fix cherry-picked,
full suite green, main fast-forwarded to include all Phase 1–4 work (commit
b21e029). Remaining: 4.2 (rules/catalog extraction, work order) and the three
in-flight background agents (food cards, mineral cards, handoff harness).

## Phase 5 — Strategic builds (the position-changers)

Order matters here (license → provenance → publication):

- [ ] 5.1 **OWNER GATE (legal):** choose licenses — code (recommend MIT), original
      content/recipes (recommend CC BY-NC-SA 4.0 to match inbound data's spirit),
      rules dataset (recommend CC BY 4.0 or ODbL with no-warranty terms). I draft
      LICENSE + terms; you confirm.
- [ ] 5.2 Rule provenance schema: machine-readable `verifiedBy` (agent-draft vs
      owner-verified) + `verifiedDate` on every rule; "Verified" language in the UI
      renders only for owner-verified entries; staleness monitor (age + content
      drift, not just link liveness) added to the 3am/4am loops.
- [ ] 5.3 Regionalized phenology: per-state/climate-band iNat histogram pulls
      (pipeline already accepts place_id), region-keyed curves, viewport-based
      window selection. Removes the Phase-1 caveat where data supports it.
- [ ] 5.4 Static per-species and per-recipe pages generated from the extracted JSON
      (same scripts/build_* pattern; app itself stays no-build) + sitemap.xml,
      robots.txt, og:image/og:url. Deep-links into the map via Phase-3 URL state.
- [ ] 5.5 Offline PWA: manifest + service worker caching shell, rules, safety tags,
      phenology + user-triggered "save this area" (never the full 125 MB).
- [ ] 5.6 Teaching pack: @media print one-pagers (species/region + matched rule +
      safety tags) and QR field cards sharing the offline card code path.
- [ ] 5.7 Almanac cadence: "What's ready now" location-aware view; digest/RSS later
      if wanted.

**Checkpoint 5:** each 5.x is independently shippable; pivot freely.

## Phase 6 — Publication & partnerships (owner-led)

- [ ] 6.1 Publish the rules corpus (versioned dataset + docs page) once 5.1 + 5.2
      are done.
- [ ] 6.2 Outreach candidates: MN Sustainable Foraging Task Force, extension
      services, university herbaria, park departments. I draft materials on request.

## Explicitly deferred (deliberate "not now")

- No 5th map mode until medicine/minerals reach honest depth or are relabeled as
  reference layers (deepen before widening).
- No community contributions beyond (later, if ever) owner-verified rule
  corrections and private class layers.
- No monetization work: iNaturalist (CC BY-NC) and Falling Fruit (CC BY-NC-SA)
  forbid it as currently built; revisit only with a licensing strategy.
