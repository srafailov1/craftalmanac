# Relaunch handoff — session summary (2026-06-13 → 14)

Consolidated summary of the work done this session on `design/relaunch`, the
current state, and what remains before cutover. Per-change detail (with
prototype/relaunch line refs and verification notes) is in
`docs/design/decisions.md` (newest first); the full parity catalog is in
`docs/design/prototype-parity-audit.md`.

Branch: **`design/relaunch`** (never `main`). Session-1 work (below) is
committed and pushed; the **session-2 (2026-06-14)** parity-polish + cleanup
commits (`de3e197`…`d71b93d`) are committed locally and **awaiting the owner's
push**. Current cache tokens: `styles.css?v=cleanup-css-1`,
`app.js?v=cleanup-css-1`.

**Session 2 (2026-06-14) — completed the remaining parity polish + scoped
cleanup** (detail in `decisions.md`, passes 8–11 + cleanup): point card
(sparkline / in-card flush line / ethic paragraph / `.pt-card.compact` on phones
/ CHECK wording / med-note `color-mix` tint); hover tip (category spine + serif
name + register-colored status line); wind panel (animated `.windflow` overlay +
larger r=88 compass); welcome modal rethemed to the register palette; and removal
of the retired-sidebar `species-list`/`favorite`/`type-pill` + `season-actions`/
`season-bands`/`date-entry` dead CSS. All five gated green (`node --check`,
`scripts/check.sh`, console clean) and verified live in the preview. Sections A
and B below are now **done**; what's left is Phase 7 content/cutover + the owner
gates.

---

## What shipped this session

### 1. Fonts vendored + type system activated — `9a06be6`
Self-hosted the OFL set under `fonts/` (Fraunces 144pt-SemiBold display + italic,
Public Sans UI, IBM Plex Mono labels), uncommented the `@font-face` scaffold, and
pointed every component at `--font-display`/`--font-ui`/`--font-mono`. Added a
Fonts section to `ATTRIBUTION.md`.

### 2. Phase 6 hardening — `cedc925`, `afb0fd5`, `ea23129`
- **Contrast audit** (`scripts/audit_contrast.mjs`, wired into `scripts/check.sh`):
  WCAG check of every register foreground token against its panel; fixed the
  failures it found.
- **Keyboard focus path**: one register-aware `:focus-visible` ring across every
  floating-UI control; fixed `.welcome-primary` (it had stripped its outline).
- **Wind-canvas power heuristics**: the decorative canvas stays off under
  reduced-motion/data, Data Saver, low-end hardware, or a draining battery, and
  the rAF loop fully stops when disabled.

### 3. Prototype fidelity audit — `4d23aeb` (doc)
Ran a multi-agent audit (6 surface diffs, every finding adversarially verified):
**80 findings → 69 fix-targets, 7 intentional, 4 dropped**. Catalog +
per-finding fixes in `docs/design/prototype-parity-audit.md`. Two owner
decisions captured this session:
- **Colors:** prototype hues everywhere, but keep the permit/warn amber darkened
  (`#a8730a`) where the prototype fails WCAG badly. The contrast audit records
  the three owner-approved sub-floor pairs as `APPR` (non-failing).
- **Season controls:** hybrid — keep the dedicated search bar; otherwise match
  the prototype's season controls.

### 4. Seven prototype-parity passes
| Pass | Commit | What |
|---|---|---|
| Data points + legend mirror + colors | `4d23aeb` | Markers: prototype status palette (was black/white/red), status ring as an **outer** collar (~2.4px). Legend: categories = **filled squares**, access = **rings** (shared palette). Reverted dawn accent + dawn/dusk muted text to prototype; kept legible amber. |
| Legend layout | `1fafa3d` | Bottom-left; collapses to a title bar, **hover/focus-expands** into two columns (ACCESS \| CATEGORIES); **ONLY ALLOWED** filter. |
| Season slider | `3026ada` | Bottom-center 690px; **hover/pinned histogram** (header + 118px stacked bars + month-letter row + category swatches); native range **restyled to the prototype's thin line + round cursor** + WINTER/SPRING/SUMMER/FALL; meta with Back-to-now + All-seasons + Set-date form. |
| Solar dial | `8d371f9` | The **draggable** `#sun-dial` (was text-only): day arc, rise/set, NOON/MIDNIGHT, gold/ink sun dot, spinning earth; **drag simulates the hour** → register + map lightPreset follow (`simNow`/`state.simMins`); BACK TO NOW resets. Also fixed the wind fx-toggle to start/stop the canvas loop. |
| Mobile fold-in | `dff711b` | On phones (`matchMedia ≤720`) the legend **relocates into the season card** (`#legendSlot`) via **Legend** toggle; **Chart** toggle pins the histogram (hover doesn't stick on touch). |
| Night halo | `ade8ea5` | White blurred `circle` layer below the markers; opacity 0.38 at dusk/night via `updateMarkerHalo()` (tracks the dial simulation too). |
| Disclaimer + rail chrome | `47a6caa` | Persistent on-map **herbalism disclaimer** (medicine mode only — CLAUDE.md non-negotiable). `.now-btn` legibility fix (white→`--reg-panel`, pill); `#conditions-rail` padding 3→6. |

---

## Verification status

- `node --check app.js` and `scripts/check.sh` are **green** after every commit
  (check.sh now also runs the contrast audit).
- Logic verified by node harnesses: the marker icon geometry (fill + outer
  ring), the dial click→time round-trip, and the wind-power heuristics.
- Layout/behavior verified live in the Claude preview (desktop **and** a 375px
  mobile pass): legend two-column + ONLY ALLOWED; season card scrub / Back-to-now
  / All-seasons / Set-date; the dial dragging through day↔night with BACK TO NOW;
  the mobile legend-into-season fold-in.
- **Caveat — needs a real foreground / production look:** individual map markers
  do not paint under the headless preview's WebGL throttle, so the marker
  **fill/stroke ring** and the **night halo** were verified by logic + layer
  inspection, not pixels. Confirm these on the deployed site (the Mapbox token is
  URL-scoped, so localhost may not show tiles — the deploy domain does).

---

## What remains before cutover

### A. Remaining parity — ✅ DONE (session 2, 2026-06-14)
All the completeness items below shipped (`decisions.md` passes 8–11):
- ✅ **Point card** season-line: monthly **sparkline** (tinted to the category
  color) + the `SEASON · <range>` text. (Relaunch has no distinct RIPE field;
  the range text is the equivalent.)
- ✅ **Wind panel**: animated **`.windflow` streak overlay** + larger compass.
- ✅ **Hover tip**: category spine + serif name + register-colored status line.
- ✅ **Welcome modal**: rethemed to the register palette.
- ✅ `.pt-card.compact` mobile variant now applied (`matchMedia` at build time).
- ✅ Low items: card **RAIN-FED FLUSH** line; ethic as a flowing paragraph; card
  wording **VERIFY → CHECK** (prototype); compass r 72→88; `med-note` tint via
  `color-mix(var(--reg-warn))`.
- **Deliberately kept** (documented): the wind **fx-toggle** label keeps the
  relaunch's clearer "Animate wind on the map (zoom 7.5+)" copy (adds the real
  zoom threshold).
- **Intentional / no action** (owner-confirmed or deliberate): per-species pigment
  vs category fill, low-zoom aggregate circles, the dedicated search bar, the
  vendored fonts, `#sheet` closer size.

### B. Cleanup — ✅ DONE (scoped, session 2)
- ✅ Removed `.season-actions` / `.season-bands` / `.date-entry` and the
  retired-sidebar `species-list` / `species-group-*` / `favorite` / `type-pill`
  rules (all 0 live refs, verified first).
- **Deferred** (next dead-CSS pass): the retired *filter* CSS — `.filter-list` /
  `.type-list` / `.category-option*` / `.access-list` / `.permission-*` and the
  panel chrome `.control-group` / `.section-*` / `.fine-print` — left because
  `.category-option` and `.attribution-block` still have inert guarded refs in
  `app.js`, and these fall outside the handoff's named scope.

### B2. Phase 7 scaffolding — already in place (verified session 2)
- **About** sheet (`sheetAboutHTML`): real mission + "occurrence is never
  permission" + herbalism-educational-only + attribution link. Launch-ready
  (owner may still refine tone).
- **Plants** sheet (`sheetPlantsHTML`): backed by the live `speciesCatalogByName`
  (full per-mode catalog), tap-to-filter. Done.
- **Recipes** sheet (`sheetRecipesHTML`): the three-card template + placeholders
  (oak-gall / pokeberry / walnut) with the "full recipes after launch" note —
  the intended pre-cutover state; **owner authors the recipe content**.
- No demo banners/sample records exist to remove.

### C. Phase 7 — content + cutover (owner + Claude)
Scaffolding done (see B2). What's left:
- **Recipe content** (owner authors): swap the three placeholders in
  `RECIPE_PLACEHOLDERS` / `sheetRecipesHTML` for real step-by-step recipes once
  written. Template is ready.
- **Retire `prototype/` → `docs/design/archive/`** — left in place for now
  (it's still the parity reference); do this `git mv` at the cutover moment.
- Cutover: owner merges `design/relaunch` → `main`, push, verify, tag
  `relaunch-1`; rollback rehearsed (re-promote last pre-merge build).

### D. Gates
- Phase 5 **mobile on-device walkthrough** (owner, real phone).
- **Lighthouse** perf/a11y against the deploy (localhost skews it — no tiles).
- The production marker visual check from the caveat above.
