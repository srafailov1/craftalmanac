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

- [ ] 1.1 Render the rule's `accessNote` (incl. "Verified … June 2026" text) in the
      point card — the trust signal is computed but currently dropped before render.
- [ ] 1.2 Handle iNaturalist obscured coordinates: skip taxon-obscured (conservation)
      observations entirely; badge observer-obscured points as approximate (±20 km)
      instead of plotting them as precise harvest spots.
- [ ] 1.3 Abandoned-mine hazard language in Minerals: lede/dataNotes sentence + a
      standing note on every MRDS point card (never enter shafts/adits; surface
      float only). Include the MRDS data-age framing ("historic mining inventory,
      frozen ~2011–2022") from ATTRIBUTION.md.
- [ ] 1.4 Seasonality honesty caveat: one visible line on the season/histogram panel —
      timing is a contiguous-US average; local ripening varies by weeks. (Full
      regional phenology is Phase 5.)
- [ ] 1.5 Safety-tag completeness gate in `scripts/check.sh` (every catalog species
      must have an explicit SAFETY_TAGS_BY_SPECIES and HARVEST_ETHIC_BY_SPECIES
      decision) + fill the three missing medicine species (broadleaf-plantain,
      goldenrod, garlic-mustard).
- [ ] 1.6 De-jargon safety-critical copy: "parcel rule" → plain language;
      user-facing "unsourced" → "not yet researched"; keep the firm register.

**Checkpoint 1:** review the commits; nothing structural has moved.

## Phase 2 — Say what it is (copy, identity, onboarding)

- [ ] 2.1 Welcome modal restructure: mission + differentiator first ("every point
      carries the actual harvesting rule for the land under it"), safety block
      second, all existing warnings preserved.
- [ ] 2.2 Revive the dead per-mode `lede` copy (wire into the Maps sheet cards) and
      fix the broken `dataNotes` mount (render into the About sheet).
- [ ] 2.3 **OWNER GATE (review wording):** authored About — byline, why it exists,
      teaching/research context, region; plus one privacy sentence (locate button →
      Open-Meteo; search → Mapbox) and one no-warranty/educational-use sentence.
      I will draft; you edit before pushing.
- [ ] 2.4 Nav label fix: "Plants" → mode-neutral label (matches the existing
      "The Shelf" brand); remove the per-mode text swap hack.
- [ ] 2.5 Unify herbalism naming (one name everywhere; "Therapeutic Uses" →
      "Traditional Uses").
- [ ] 2.6 Scope Projects to its mode: label as ink/dye where it appears in other
      modes, with an honest "projects for this map are planned" note.
- [ ] 2.7 README rewrite: describe the real four-mode product and the rules layer.
- [ ] 2.8 Wordmark presence: larger lockup so the display serif actually displays.

**Checkpoint 2:** the product now introduces itself correctly.

## Phase 3 — UX repairs (interaction)

- [ ] 3.1 Register override: Day / Auto toggle, persisted in localStorage;
      `color-scheme: dark` under dusk/night.
- [ ] 3.2 Category-tinted clusters + aggregate tint (dominant-category hue + count)
      so overview zooms stop being uniform cream dots. Highest-leverage visual fix.
- [ ] 3.3 Mode switcher promoted to the masthead (persistent segmented control with
      the four mode colors); "which map am I on" visible at all times.
- [ ] 3.4 URL hash state (mode, center/zoom, day, species filter) + restore; persist
      last active map. Shareable classroom links.
- [ ] 3.5 Minerals chrome: Workability button must not open the date form (live
      bug); legend max-height clip (15 chips unreachable on desktop); histogram
      header stops saying "IN SEASON BY MONTH" in minerals.
- [ ] 3.6 Register-aware category colors (ink-black swatch is invisible at night);
      lift dawn/dusk accents to ≥4.5:1.
- [ ] 3.7 Text selection in point cards; ≥24px targets for legend chips / season
      buttons / slider thumb.
- [ ] 3.8 One guided first-run task after the welcome modal (dismissible coach chip).
- [ ] 3.9 Keyboard/list route to map records — an "In this view" list that opens the
      existing point card. Fixes the WCAG 2.1.1 failure; largest Phase-3 item.

**Checkpoint 3:** demo pass across all four modes, day + night, desktop + mobile.

## Phase 4 — Engineering foundations

- [ ] 4.1 Extract PROJECT_RECIPES (~594 KB, 55% of app.js) to
      `data/project-recipes.json`, lazy-loaded when the Projects sheet opens.
- [ ] 4.2 Extract rules tables (NPS/SITE/MINERAL) and species catalogs to fetched
      JSON with a documented schema — this is also the groundwork for Phase 5
      publication and the offline manifest.
- [ ] 4.3 `.assetsignore`: stop deploying build caches (37 MB unused), internal
      docs, scripts. **Must keep ATTRIBUTION.md** (attribution.html fetches it).
- [ ] 4.4 **OWNER GATE (repo settings):** GitHub Actions workflow running
      `scripts/check.sh` on push/PR. I write the workflow file; enabling
      Actions/branch protection is yours.
- [ ] 4.5 Repo hygiene: `git gc` (packed history is only ~22 MiB; no rewrite
      needed); parameterize `build_falling_fruit_subset.py` input paths; record the
      Falling Fruit snapshot date in ATTRIBUTION.md; archive the source CSVs out of
      ~/Downloads (**OWNER GATE:** where — R2 bucket or external drive).
- [ ] 4.6 Perf: split render() cheap/expensive paths, rAF-coalesce slider input,
      drop the unconditional map.resize(); add 429/Retry-After backoff and route
      iNat point loads through the concurrency helper.
- [ ] 4.7 Self-updating CLAUDE.md anchors (line counts, mode list) + `docs/adding-a-mode.md`
      checklist; refresh stale CLAUDE.md numbers now.
- [ ] 4.8 Headless regression harness for the zoom-handoff state machine, wired into
      check.sh.

**Checkpoint 4:** app behavior identical, foundations moved. Good merge point to main.

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
