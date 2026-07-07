---
target: craftalmanac.com (live site)
total_score: 31
p0_count: 0
p1_count: 3
timestamp: 2026-07-07T15-51-37Z
slug: craftalmanac-com
---
# Design Critique — craftalmanac.com (live), 2026-07-07

Reviewed live at 1512×804 and 896×1368 via Chrome; detector run in-page on three surfaces (map app with Materials sheet open, a material profile page, a project recipe page) plus a CLI scan of `index.html`. Live-site script injection is blocked by Chrome's Private Network Access rules, so the overlay run happened against a localhost copy (identical DOM; map tiles absent). True phone-width could not be tested (browser window refused resize — likely fullscreen); responsive behavior was verified at 896px and code-reviewed below that. One process disclosure: reproducing the first-run welcome modal required clearing the site's localStorage in this Chrome profile, which also wiped its welcome-seen flag, weather cache, and any saved locations.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Collapsed legend hides active filters; herbalism points appear ~6s after "Loading…" text vanishes; count line went stale (229) after un-filtering |
| 2 | Match System / Real World | 4 | Best-in-class domain language; minor drift ("Unverified" chip vs "Private / unchecked" popup) |
| 3 | User Control and Freedom | 3 | Escape/× everywhere; but Set-date form persists into Minerals where dates are meaningless |
| 4 | Consistency and Standards | 3 | Three click behaviors per card; count line absent in Herbalism; stripe vs full-border callout grammar |
| 5 | Error Prevention | 3 | Prohibited-off default, permission labels, cluster-tint explainer, safety-first recipe blocks |
| 6 | Recognition Rather Than Recall | 3 | Cluster colors unexplained until legend discovered; saved locations live only inside the Offline panel |
| 7 | Flexibility and Efficiency | 3 | URL-hash deep links excellent; tab order starts in Mapbox corner; histogram bars not clickable |
| 8 | Aesthetic and Minimalist Design | 4 | Data-as-decoration genuinely achieved |
| 9 | Error Recovery | 2 | Empty viewports give zero guidance while the count line claims thousands loaded |
| 10 | Help and Documentation | 3 | Welcome modal, first-run hint, thorough About, field cards; no inline explainer for the workability scale |
| **Total** | | **31/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**Does this look AI-generated? No.** This is one of the more distinctive product surfaces I've reviewed: specimen-label popups, named subsystems ("The Shelf", "The Press"), a seasonal histogram with climate-region honesty captions, a draggable sun-clock that drives day/dawn/dusk/night UI registers, and a minerals mode that rethinks the season slider as a SOFT/MEDIUM/HARD workability scale. The identity is carried by information, not ornament.

**LLM assessment:** the risks are internal, not generic: the mono-uppercase micro-label voice is applied very widely, and safety strings sometimes surface as raw data tags rather than sentences. Nothing reads as template scaffolding.

**Deterministic scan:** CLI scan of `index.html` — clean (exit 0; all UI is JS-built, so the browser run matters). In-page runs:
- **Map app (Materials sheet open): 56 hits.** ~46 are `wide-tracking` on the same `.m` specimen-label class — one deliberate voice repeated across cards, not 46 separate decisions; treated as intentional. Real signal: 6 `tiny-text` hits (10–11.5px body text: legend note 10px, `.k` labels 10.5px, histogram head 11px, herbalism disclaimer banner 11.5px); 1 `low-contrast` at exactly 4.5:1 (olive `#6b7f2e` on white, `.k`); 2 `layout-transition` hits (`max-height` animated on `#seasonHist` and `.legend-body`).
- **Material page: 2 hits.** `side-tab` (border-left 4px + radius on `div.safety`) and the same boundary contrast (white on `#6b7f2e`, `a.cta`).
- **Project page: 2 hits.** Same pair (`div.safety.mild`, `a.cta`).
- **False positives:** `cream-palette` on `#f8f6ef` — the documented ink+paper almanac core, a committed identity choice, not the AI-default reflex; the mass `wide-tracking` hits per above.
- **Detector caught what the eye missed:** the two `max-height` layout transitions and how little contrast headroom the olive accent has — it sits exactly on the WCAG AA line in both directions (text-on-white and white-on-text).

**Visual overlays:** injection into the live https site is blocked (Private Network Access preflight to localhost hangs), so overlays were rendered in the localhost tab instead; that tab was left on the project-recipe page and both helper servers have been stopped. Fallback signal: live-origin overlay unavailable; localhost DOM is byte-identical.

## Overall Impression

This is a mature, opinionated field tool with a real point of view — the almanac identity is earned through information design rather than decoration, and the ethics/safety mandate is structurally embedded (sticky "occurrence is not permission" footers, per-source honesty lines, plain-language rules). What holds it at 31/40 is operational feedback, not aesthetics: the app quietly hides data (access filters, empty viewports, load gaps) without telling you, and the core map flow has no keyboard path. The single biggest opportunity: make invisible state visible — filters, in-view counts, and zero-result guidance.

## What's Working

1. **Rules-first specimen popups.** ACCESS/RULES/SAFETY/SOURCE label rows, license + observer attribution, harvest-ethic line, and a sticky "OCCURRENCE IS NOT PERMISSION — CHECK WHO MANAGES THIS LAND" footer. The per-source honesty ("Access unknown in Falling Fruit.") builds exactly the trust the product needs.
2. **Mode-aware almanac engine.** The season bar becomes a stacked phenology histogram with regional-climate captions in Food/Ink, and a workability scale listing materials per hardness band in Minerals; the sun-clock panel ties registers to field practice ("Many parks close gathering at dusk"). No competitor-shaped SaaS chrome anywhere.
3. **Honest system surfaces.** The Offline panel states file counts, sizes, storage in use, and what will NOT work offline; About covers sources, authorship, licensing, and privacy in plain language; the first-run hint ("Try: search your town…") teaches the core loop in one sentence.

## Priority Issues

**[P1] Active filters are invisible once the legend collapses**
- **What:** Toggling "ONLY ALLOWED" (or any access chip; "Prohibited" starts off by default) filters the map, but the collapsed legend line still reads only "LEGEND: PERMISSIONS AND POINTS · ACTIVE MAP: FOOD". The record count also failed to refresh after un-filtering (stayed at 229 while markers visibly returned).
- **Why it matters:** A field user who filtered an hour ago pans to a new town, sees near-nothing, and concludes there's no data — silent data hiding in a tool whose whole promise is completeness of the rules layer.
- **Fix:** Put filter state on the collapsed line ("FILTERS · 3/5 ACCESS · ONLY ALLOWED") and make the count line always render "N of M in view."
- **Suggested command:** /impeccable clarify

**[P1] Empty viewports are dead ends**
- **What:** Herbalism and Minerals at Ithaca zoom show a blank map while the status line says "4881 current records loaded from USGS MRDS" (national total). Zero-result views get no message at all; in Herbalism the count line doesn't render in the first place, and points appeared ~6 seconds after "Loading current map data…" disappeared.
- **Why it matters:** First-time mode-switchers can't distinguish "no data here" from "broken" from "still loading" — the exact moment a teacher demos the site to a class.
- **Fix:** A per-viewport zero state with next actions ("0 records in view — zoom out, tap All seasons, or head toward the nearest record ~12 mi NE"), plus keep the loading indicator up until markers actually render.
- **Suggested command:** /impeccable onboard

**[P1] The core flow has no keyboard path**
- **What:** Occurrence points are canvas features; popups open only by pointer. Sequential tab order additionally enters at the Mapbox control corner (zoom/locate/attribution) rather than the app chrome. Focus styling itself is well covered (shared `:focus-visible` block, `:focus-within` legend expansion).
- **Why it matters:** The primary task — inspect a point's access rule — is unavailable to keyboard and switch users; screen-reader users get a styled but empty stage.
- **Fix:** A keyboard-reachable "materials in view" list (the rail panel is a natural home) whose items open the same popup content; reorder or skip-link past map controls.
- **Suggested command:** /impeccable harden

**[P2] Safety tags render as raw data strings**
- **What:** Popup SAFETY rows show bare catalog tags: "lookalikes", "remove pit", "external use only". On the Clay page the tag "silica dust — process wet" appears as a bullet directly under a prose sentence that already says it.
- **Why it matters:** Safety is the project's stated first value, and "lookalikes" carries none of the urgency of "has dangerous lookalikes — confirm ID before eating." The terseness reads like debug output inside an otherwise carefully-written surface.
- **Fix:** Map each tag to a full sentence at render time (the tag vocabulary is small and centralized in `SAFETY_TAGS_BY_SPECIES`), and dedupe tags already covered by page prose.
- **Suggested command:** /impeccable clarify

**[P2] State-feedback loose ends cluster around mode switches**
- **What:** The Set-date form stays open when switching into Minerals (where dates do nothing); the night-register map style lags the chrome by ~5–8 silent seconds (dark UI floating on a daylight map); the chart affordance differs by mode (opened via "All seasons" in Food, an explicit "Chart" button in Minerals); `max-height` transitions on the histogram and legend animate layout.
- **Why it matters:** Each is small, but they all land on the same seam — mode/register switching — which is the product's signature move, so the seams show exactly where the design is most original.
- **Fix:** Reset transient forms on mode change; show a brief "adjusting map light…" state (or pre-warm the style); unify the chart toggle; swap `max-height` transitions for grid-template-rows or transform-based reveals.
- **Suggested command:** /impeccable polish

## Persona Red Flags

**Jordan (First-Timer):** Welcome modal and the "Try: search your town…" toast are genuinely good. Then: pink/green cluster bubbles with no visible key until the legend is hovered; "Private / unchecked" vs "Unverified" vocabulary drift; three different click behaviors on one card (body = isolate on map, FULL PROFILE = new tab, OPEN NEAREST IN VIEW = pan); raw "lookalikes" tag. Jordan survives, but each mystery costs trust in a safety tool.

**Sam (Accessibility-Dependent):** Cannot open any point popup — the core task — via keyboard; tab order begins at Mapbox's zoom cluster; the legend does expand on focus (good); aria-live regions exist for search and offline status (good). Verdict: chrome is accessible, the map's content is not.

**Priya (project persona — teacher projecting in class, from PRODUCT.md's students/teachers audience):** 10–10.5px mono labels and the 11.5px herbalism disclaimer wash out on a classroom projector; the olive accent at exactly 4.5:1 has zero headroom on a low-contrast projector; hover-expanded legend is awkward while lecturing. The histogram, in contrast, projects beautifully.

**Casey (Distracted Mobile):** Unverified live (window refused resize). At 896px the tablet layout is correct (icon masthead, compact season bar). Code shows real breakpoints (520/720/860/1180), a mobile Legend toggle, and 4 `prefers-reduced-motion` blocks. Flagging as needs-a-real-phone-pass, not as a failure.

## Minor Observations

- Vertical mouse-wheel scrolling dies over horizontal shelf rows in the Projects/Materials sheets (the row swallows the wheel event) — a scroll trap on the sheets' main reading path.
- Callout grammar splits: four `border-left: 3px` stripe callouts in the app (`.mine-hazard`, `.beyond-box`, `.proj-scope`, `.off-notice`) and `div.safety` side-tabs on static pages, versus full-border safety boxes elsewhere. Consolidate on the full-border/tint treatment; the 5px `.spine` on cards is a distinct, named brand motif and reads as intentional — keep it.
- Saved locations land only inside the Offline panel's SAVED list; the popup button flips to "Saved location" but never says where it went.
- Histogram month bars look clickable but aren't — letting them set the date would close a natural loop.
- "FULL PROFILE ↗" opens a new tab without warning; fine for field use, but the ↗ is doing a lot of unexplained work.
- The welcome modal is typeset in plain UI sans — the one surface with no trace of the site's Fraunces identity.
- The stale-count bug after un-filtering (229 stuck) looks like the count only refreshes on data loads, not filter changes — worth a small state audit.
- Olive `#6b7f2e` sits at exactly 4.5:1 against white in both directions; one register tweak from a WCAG failure. Consider darkening a step for text-on-white uses.

## Questions to Consider

- Should "Prohibited" be hidden by default — or shown dimmed? A map that teaches where you *can't* harvest may serve the ethics mission better than one that omits it.
- Is the Offline panel really the home for saved locations, or is a "Field bag" (saved + offline + printable cards) its own first-class surface?
- What would the night register look like if it were *instant* — is the Mapbox style swap pre-warmable?
- If the histogram is the almanac's signature chart, should it be interactive everywhere it appears (set date, filter category)?
