---
target: live site craftalmanac.com
total_score: 28
p0_count: 0
p1_count: 3
timestamp: 2026-07-05T16-19-35Z
slug: craftalmanac-com
---
# Critique — craftalmanac.com (live site, desktop 1440×900 + narrow 896px; Chrome)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | `#dataStatus` element missing from index.html — all wired loading/status messages (app.js:7150, 7138) silently dropped; map sits blank ~10s with no feedback |
| 2 | Match System / Real World | 4 | n/a — plain access words, seasons, sun hours, field-guide voice |
| 3 | User Control and Freedom | 3 | Esc/✕/Back-to-now all work; no radar opt-out |
| 4 | Consistency and Standards | 3 | Nav click while a sheet is open closes it instead of switching (2 clicks per switch); pink doubles as category (berries) and access (prohibited) |
| 5 | Error Prevention | 3 | Only-allowed filter, permission labels, disclaimers at decision points |
| 6 | Recognition Rather Than Recall | 3 | Cluster-bubble tint (dominant category) untaught; histogram hidden behind unhinted hover |
| 7 | Flexibility and Efficiency | 3 | Full state-in-URL, visible focus, draggable sun; no shortcut list |
| 8 | Aesthetic and Minimalist Design | 3 | Cohesive specimen-label identity; default-on radar noise; stripe-card repetition |
| 9 | Error Recovery | 1 | Error messages exist in code (token-blocked at app.js:9726, source failures at 7212) but render nowhere — element missing; local token failure = silent beige void |
| 10 | Help and Documentation | 3 | Welcome modal, "Try:" toast, thorough About, self-explaining offline panel |
| **Total** | | **28/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**LLM assessment:** This does not read as AI-generated. The identity is earned and specific: Fraunces + Public Sans + Plex Mono specimen-label system, data-as-decoration everywhere (seasonal stacked histogram, sun-path dial with a draggable sun, day/dawn/dusk/night register engine tied to real sun times, two-tone map markers). The one pervasive tell-adjacent pattern is the colored left-stripe border, which appears on nearly every card surface: mode-picker cards, Materials shelf cards, Projects recipe cards, safety callouts, and the entire static profile-page card. On recipe cards the stripe encodes the actual pigment color (semantic); elsewhere it is decoration.

**Deterministic scan:** 757 findings across 267 files, but only ~4 templated patterns: `side-tab` ×261 (every material/project page, `border-left-width: 4px` at line 89 of the shared template, plus `div.safety` callouts), `overused-font` ×266 (Fraunces — a committed brand choice; treated as accepted risk), `em-dash-overuse` ×228 (10–57 per page; AI-cadence tell in body copy), `flat-type-hierarchy` ×1 (attribution.html), `numbered-section-markers` ×1 (a recipe — legitimate sequence, false positive). index.html itself: clean.

**In-page overlays:** App shell: 7 findings — tiny text (9–10.5px) on #mode-disclaimer (a safety surface), #seasonHistHead, .legend-title, .season-caveat; wide tracking flagged on those same mono labels (deliberate specimen style, but at 10.5px it costs legibility); `max-height` layout transitions on #seasonHist and .legend-body; cream body background (rgb(248,246,239) — intentional ink+paper core). Material page: `side-tab` on div.safety, **low-contrast 4.4:1** #c74437 on #fbf0ee (section label). Project page: `side-tab` on div.safety.mild, **low-contrast 3.7:1** #a8730a on #f9f2e4 (the amber "SAFETY" label on the tinted callout — an AA failure on the safety-critical element, repeated across ~261 static pages). a.cta white on #6b7f2e = 4.5:1 exactly (passes at threshold).

**Overlay visibility:** Chrome's private-network-access policy blocked injecting the detector into the live HTTPS page, so overlays ran on an identical localhost copy — visible in the **[Human] Craft Almanac — detector overlays** tab (curly-dock project page with side-tab + low-contrast highlights).

## Overall Impression
A real, personal, values-forward field tool that no one would mistake for template output — the register engine, sun dial, and specimen-label popups are genuinely distinctive. The gap between its design ambition and its feedback layer is the story: the app is silent exactly when a field user most needs reassurance (data loading, source failure, empty viewport), and the machinery to fix it already exists in app.js but writes to an element that was lost in the redesign.

## What's Working
1. **Identity carried by data, not ornament.** The seasonal histogram, sun-path dial, night register with glowing markers, and mono specimen labels make the map itself the brand. This is exactly the "data is the decoration" principle executed well.
2. **Ethics and safety are architecture, not copy.** "Occurrence is never permission" appears at every decision moment — welcome modal, popup footer, offline panel, static-page footer — and mode disclaimers survive every mode switch. The curly-dock safety callout (oxalates, non-food pots) is real, plainly-said guidance.
3. **Field-tool engineering.** Full state-in-URL deep links, offline saving with honest size estimates and caveats, register engine, visible keyboard focus, aria-live regions.

## Priority Issues

**[P1] The status/error line is dead — `#dataStatus` doesn't exist.**
- Why: app.js:3521 queries `#dataStatus`; index.html has no such element. Every wired message — "Loading current map data..." (7150), record counts (7138), source failures (7212), "Mapbox tiles are blocked for this origin" (9726) — is silently dropped. Result: blank map for ~10s on load with zero feedback, silent minerals-empty viewports, and completely silent hard failures. Worst for the on-phone rural-3G field user, i.e. the core persona.
- Fix: restore a status element (e.g., a slim line in the legend chip or above the season bar) + aria-live="polite". One insertion point fixes four findings.
- Suggested command: /impeccable harden

**[P1] Safety-label contrast fails AA on ~261 static pages.**
- Why: the amber mono section label on tinted safety callouts (#a8730a on #f9f2e4) measures 3.7:1; the red variant (#c74437 on #fbf0ee) 4.4:1. These sit on the highest-stakes element of each page, and the project promises contrast-safe palettes (the check.sh gate evidently doesn't cover static-page combos).
- Fix: darken the label colors on tinted grounds (or de-tint the ground); add these pairs to the contrast gate.
- Suggested command: /impeccable polish

**[P1] Popups outgrow the viewport and hide their own footer.**
- Why: .mapboxgl-popup-content has no max-height (measured 563px tall, bottom at 698 of 757px window); the "OCCURRENCE IS NOT PERMISSION" caution and the Save location action end up beneath the season bar. On a phone this is worse.
- Fix: max-height (~60vh) with internal scroll, or auto-pan padding that accounts for the season bar; keep the caution line pinned visible.
- Suggested command: /impeccable adapt

**[P2] The left-stripe card pattern is everywhere.**
- Why: 4px colored left borders on mode cards, shelf cards, recipe cards, safety callouts, and the whole static profile card — the single most recognizable AI-UI tell, and it dilutes the otherwise hand-made identity. Where the stripe means something (pigment color on recipe cards) that meaning is better carried by the existing swatch chip.
- Fix: replace with full hairline borders + the swatch dot (recipe/material cards), and background tint alone for safety callouts; one template + one sheet-renderer change clears 261 detector hits.
- Suggested command: /impeccable polish

**[P2] Progressive disclosure hides two load-bearing surfaces.**
- Why: the season histogram — the almanac's signature chart — appears only on hover of the season bar (no affordance, no keyboard path, desktop only); nav clicks close the open sheet instead of switching (every cross-sheet move costs two clicks); the mode disclaimer and legend titles render at 9–10.5px, small for sunlight reading of safety text.
- Fix: add a visible "chart" affordance on the season bar + show histogram on focus-within; make nav buttons switch sheets directly; bump micro-label sizes to ≥11–12px.
- Suggested command: /impeccable clarify

## Persona Red Flags

**Jordan (first-timer):** The blank-loading map reads as "site is broken" — nothing says data is coming. The big rose cluster bubble over Cornell reads as "prohibited-ish" when it actually means "berries-dominant"; bubble tint is never explained. The welcome modal and "Try: search your town" toast are genuinely good onboarding.

**Sam (accessibility):** Visible 2px focus outlines, aria-live regions, labeled controls — better than most map tools. But: the histogram is unreachable without a mouse hover; two-tone canvas markers encode access + category by color alone at ~10px with no shape/pattern channel (colorblind users lose the access ring vs. category fill distinction the PRODUCT.md explicitly promises to protect); popup footer content is visually occluded by the season bar.

**Casey (mobile field use):** Full phone-width testing was blocked (fullscreen Chrome refused window resize), but at 896px the masthead collapses correctly and the season bar compacts with a Legend button. The popup-height and dead-status-line issues both amplify on phones and slow connections — Casey is the persona the P1s hit hardest.

## Minor Observations
- Herbalism Projects sheet keeps the ink/dye intro copy ("Make ink, dye, and pigment...") above its otherwise-good empty state.
- Radar overlay is default-on with no toggle (threshold-gated in code, fails safe); at national zoom it competes with clusters.
- Wordmark isn't a home/reset control; clicking it does nothing.
- "Enter the map" button is visually timid for the one brand moment with a captive audience.
- Em-dash density (10–57/page) is an AI-cadence tell in otherwise excellent copy.
- Cluster click didn't visibly zoom during testing — likely the occluded-window rAF throttling artifact rather than a bug; worth a quick manual check.
- attribution.html has a flat type hierarchy (three sizes within 1.8:1 overall).

## Questions to Consider
- What if the map told you what it's doing? A one-line status strip (already wired in app.js) turns silence into trust — the almanac voice could even own it: "Gathering July's records…"
- Should the histogram be a citizen, not an easter egg? A slim always-visible sparkline above the slider that expands on hover/focus would put the signature data forward.
- If the stripe means pigment, why not let the swatch say it? The chips already do this better.
