---
target: craftalmanac.com (live, post-remediation)
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-07-07T20-29-17Z
slug: craftalmanac-com
---
# Design Critique — craftalmanac.com (live), 2026-07-07 (post-remediation)

Re-critique after the four-phase remediation of the earlier 31/40 pass. The deployed site now serves `review-fixes-1` (confirmed: the old service worker was serving a cached shell; forcing the SW update surfaced the new code). Reviewed live at 1440px with a working Mapbox map; the deterministic detector ran in-page against an identical localhost copy of the deployed DOM.

## Design Health Score

| # | Heuristic | Score | Δ | Key finding |
|---|-----------|-------|---|-------------|
| 1 | Visibility of System Status | 4 | +1 | Filters now badge on the collapsed legend ("FILTERS: ALLOWED ONLY / APPLES ONLY"); count refreshes live on every filter change ("Showing 57 of 403 · 346 hidden"); herbalism now carries a count ("162 records in view · iNaturalist") |
| 2 | Match System / Real World | 4 | — | Safety tags now read as sentences ("the seeds are not edible" vs raw "skin/seeds not for eating"); "Unverified" unified with the legend chip |
| 3 | User Control and Freedom | 3 | — | Mode switch now resets the stale Set-date form; no new escape/undo affordances |
| 4 | Consistency and Standards | 4 | +1 | Callout grammar unified to full borders (verified: safety-box, beyond-box both 1px/8px, no side stripes); count line present in all four modes; access label vocabulary consistent |
| 5 | Error Prevention | 3 | — | Unchanged this round |
| 6 | Recognition Rather Than Recall | 4 | +1 | Filter state is now visible instead of remembered; save-location points to the Offline panel |
| 7 | Flexibility and Efficiency | 3 | — | Keyboard route to point cards hardened (aria) + tab order fixed, but still no shortcuts / clickable histogram |
| 8 | Aesthetic and Minimalist Design | 4 | — | Cleaner (unified callouts, welcome wordmark now in Fraunces); one new low-contrast disclaimer keeps it off a 5 |
| 9 | Error Recovery | 3 | +1 | Empty viewports now guide ("0 of 402 records in view shown — tap All seasons or adjust the legend filters"; minerals "nearest is ~X mi"); count yields to outage/loading messages |
| 10 | Help and Documentation | 3 | — | Disabled-button explanation + zoom-in note added; core help unchanged |
| **Total** | | **35/40** | **+4** | **Good — top of band** |

Trend: **31 → 35**. The +4 is concentrated exactly where the remediation aimed — the three former P1s (invisible filters, empty dead-ends, silent state) plus callout/label consistency. The dimensions the work didn't touch (Control, Prevention, Flexibility, Help) held at 3, which is honest: this was a targeted fix pass, not a redesign.

## Anti-Patterns Verdict

**Still not AI-generated.** The remediation reinforced the identity rather than diluting it: safety tags now read as authored sentences, callouts share one full-border grammar, the welcome wordmark finally wears the Fraunces display face. No new slop families were introduced; the side-stripe borders the first pass flagged are gone (converted to full borders, verified live).

**Deterministic scan.** CLI on `index.html`: clean (all UI is JS-built). In-page overlay (localhost copy, identical to deployed): **44 findings**, families unchanged from the prior 56:
- **~37 wide-tracking** — almost all the `div.m` specimen-label class, one deliberate mono voice repeated across cards. Intentional; not 37 decisions.
- **7 tiny-text** (10–11.5px): mode-disclaimer, seasonHistHead, season-caveat, legend-note, legend-title, `.k`, and the **new `.dnote`**. The specimen voice, but genuinely small.
- **2 layout-transition** — `#seasonHist` and `.legend-body` still animate `max-height` (the reduced-motion fallback was added, but the transitions were not converted to `grid-template-rows`/transform, so the detector still flags them).
- **1 low-contrast — NEW, introduced by the remediation** — see the top priority issue below.
- **1 cream-palette** (`#f8f6ef` body) — the documented ink+paper core, a committed identity choice; false positive.

The raw 56→44 drop is mostly DOM-state variance (fewer shelf `.m` labels in the sampled view), **not** a real reduction — the honest read is "same families, one fixed, one new."

**Overlay:** live-site injection is blocked by Chrome's Private Network Access rule (localhost→https), same as the first run; the overlay ran on the byte-identical localhost DOM instead.

## What's Working (verified live on the deployed code)

1. **The invisible-state problem is solved.** Toggling any access chip or isolating a species badges the collapsed legend and updates the count in the same beat ("Showing 57 of 403 records in view · 346 hidden by current filters"). The stale-229 bug is gone; the count is now filter-aware.
2. **Empty viewports are no longer dead ends.** "0 of 402 records in view shown — tap All seasons or adjust the legend filters"; minerals report the nearest locality and a nationwide total. First-time mode-switchers get an explanation instead of a blank map.
3. **Safety reads as guidance.** Point-card SAFETY rows render full sentences ("the seeds are not edible") sourced from the same terse catalog tags; the pinned OCCURRENCE footer and Save button survive; the save note now tells you where saves live.

## Priority Issues

**[P2] The new `.dnote` disclaimer fails AA — a contrast regression from the remediation**
- **What:** `#sheet .dnote` (the medicine "EDUCATIONAL REFERENCE ONLY — NOT MEDICAL ADVICE" line and the "ZOOM THE MAP IN…" hint) renders `--reg-warn` (#a8730a) at 11px on the white sheet panel — **4.1:1**, below the 4.5:1 body floor. The Phase-4 fix that styled the previously-unstyled `.dnote` picked a warn color that clears the gate (which treats warn as a 3.0 graphical label) but not the real body-text floor. It lands on a safety disclaimer, which makes it worse than a generic contrast miss.
- **Fix:** darken the sheet-`.dnote` text in the light registers (e.g. a `--reg-warn-text` of #8a5e08 = 5.1:1, mirroring the static-page safety labels and the `--reg-accent-text` pattern), keep the light warn in dark registers, and add the token to the contrast gate so 11px warn-on-panel is checked at 4.5:1.
- **Suggested command:** /impeccable clarify (or fix inline — it's one token)

**[P2] The empty-state hint can name the wrong cause**
- **What:** With ALLOWED-ONLY active over Ithaca, the line reads "0 of 402 records in view shown — **tap All seasons** or adjust the legend filters" — but the season isn't the cause; the access filter is. The season hint fires whenever `!allSeasons`, independent of whether season actually hid anything.
- **Fix:** only surface the season hint when the selected-day season filter is what removed records (compare the count with vs without the season predicate); otherwise lead with "adjust the legend filters."
- **Suggested command:** /impeccable clarify

**[P3] Two `max-height` reveals still animate layout**
- **What:** `#seasonHist` and `.legend-body` expand via `max-height` transitions (flagged by the detector both runs). The reduced-motion path is now correct, but the default still animates a layout property.
- **Fix:** convert to `grid-template-rows: 0fr → 1fr` (or a transform reveal) with the scroll moved to an inner element.
- **Suggested command:** /impeccable animate

**[P3] Card affordance triple still needs learning**
- Each Materials card carries three distinct actions (body isolates on the map, "Full profile ↗" opens a tab, "Open nearest in view" pans + opens the card). The styling now distinguishes them (link vs button), but three behaviors on one card is still a first-timer cost.

## Persona Red Flags (residual)

**Sam (accessibility):** the keyboard route to point cards works and moves focus into the card (verified), and the disabled "Open nearest" button now carries a concise aria-label — real gains. Remaining: the new `.dnote` safety disclaimer at 4.1:1 is exactly the low-vision case that matters most; map markers are still canvas-only (the shelf "Open nearest" is the sole keyboard path).

**Priya (teacher, projecting):** the 10–11.5px mono labels and the 4.1:1 `.dnote` wash out on a classroom projector; the count line and filter badge are readable, but the disclaimer — the thing she most wants legible when teaching — is the weakest link.

**Jordan (first-timer):** dramatically better — filter state is visible, empty views explain themselves, safety reads as sentences. Residual: cluster-bubble colors still unexplained until the legend is hovered.

## Minor Observations

- The 56→44 detector delta is DOM-state variance, not a design win — worth not over-reading.
- Saved locations are now *pointed to* but still live only inside the Offline panel; a first-class "field bag" surface remains the bigger opportunity.
- The mobile filter dot now uses `--reg-accent-text` (clears 3:1 in every register) — good, but a real-device phone pass is still owner-owned.

## Questions to Consider

- Should the warn color have a dedicated text-weight token everywhere it sits on a light panel (the same fix `--reg-accent-text` got), so no future warn-on-white text can slip below AA?
- Is the histogram's `max-height` reveal worth converting to a grid-rows animation now that it's the one remaining flagged layout-transition, or is it below the line?
- Now that filter state is visible, does "Prohibited" want to render dimmed-by-default (teach where *not* to harvest) rather than hidden?
