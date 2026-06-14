# Claude Code kickoff #2 — finish the Craft Almanac relaunch

You're continuing an in-progress redesign of Craft Almanac (a static, no-build,
vanilla JS + Mapbox GL map site). Work stays on branch **`design/relaunch`**
(never `main`). The previous session vendored the fonts, did Phase 6 hardening,
and brought the relaunch into close visual parity with the owner-approved
prototype across seven passes. This session finishes the remaining polish and
drives Phase 7 (content + cutover).

## First, read these (in order)
1. `CLAUDE.md` — project values + non-negotiables (auto-loaded). Key: occurrence
   is never harvest permission; safety/access colors are fixed semantics per
   register; the herbalism educational-use disclaimer stays prominent; no build
   step; vanilla JS/CSS only; new data sources enter `ATTRIBUTION.md` first.
2. `docs/design/relaunch-handoff.md` — what shipped last session, current state,
   verification status, and the full "what remains" list. **Start here.**
3. `docs/design/decisions.md` — running design log, newest first (read the top
   ~10 entries; that's this migration's recent history).
4. `docs/design/prototype-parity-audit.md` — the verified parity catalog (69
   fix-targets). The completeness section lists what's still open.
5. `docs/design/work-order-redesign.md` — the 7-phase plan + launch checklist
   (§Phase 7, §4 Launch checklist).
6. `prototype/index.html` — the **prototype of record**. Where it and the
   relaunch disagree on anything visual, **the prototype wins.**

## Where things stand (done)
Branch `design/relaunch`, all committed + pushed. Cache tokens currently
`?v=parity-disclaimer-1` (both `styles.css` and `app.js`).
- **Fonts** vendored + type system live.
- **Phase 6** hardening: contrast audit (`scripts/audit_contrast.mjs`, in
  `check.sh`), keyboard focus path, wind-canvas power heuristics.
- **Seven parity passes** (data points + legend mirror + colors · legend layout ·
  season slider · draggable solar dial · mobile legend fold-in · night halo ·
  herbalism disclaimer + rail chrome). See the handoff doc for the commit table.

Two owner decisions already made (honor them): **(1)** prototype hues, but keep
the permit/warn amber legible (`#a8730a`); **(2)** season controls are hybrid —
keep the dedicated search bar, otherwise match the prototype.

## What to do next (recommended order)

### 1. Production visual check (do this first, ~15 min)
The headless preview can't paint individual Mapbox markers, so last session's
marker **fill/stroke ring** and **night halo** were verified by logic only. Load
the deployed site (or ask the owner) and confirm at zoom ≥ 8: points show a
category fill + an outer access-status ring, the legend mirrors them, and a soft
white halo lifts points off the dark basemap in the dusk/night registers. Also
spot-check the draggable sun dial and the season histogram render with real data.

### 2. Remaining parity polish (completeness — medium/low)
From `prototype-parity-audit.md` (completeness section), still open:
- Point card season-line: monthly **sparkline + RIPE range**.
- Wind panel: the animated **`.windflow` streak overlay** in the rose.
- **Hover tip**: species spine + colored status line; use `--reg-*` tokens.
- **Welcome modal**: adapt to the register palette (currently day-only).
- `.pt-card.compact` mobile variant (dead CSS — apply or remove).
- Low: card RAIN-FED FLUSH line, ethic as a flowing paragraph, card wording
  CHECK→VERIFY, compass size, `med-note` tint, fx-toggle label.

### 3. Cleanup
Remove dead CSS from the rebuilds: legacy `.season-actions` / `.season-bands` /
`.date-entry` and the retired-sidebar species-list/favorite rules.

### 4. Phase 7 — content + cutover (work-order §Phase 7, §4 checklist)
- Real **About** copy; **Plants** sheet backed by the full catalogs; the three
  **recipes** (owner authors the content; build/confirm the template). Remove any
  demo banners/records; retire `prototype/` → `docs/design/archive/`.
- Then the **owner** merges `design/relaunch` → `main`, pushes, verifies, tags
  `relaunch-1`. Rehearse rollback (re-promote last pre-merge build).

### 5. Gates before sign-off
- Phase 5 **mobile on-device walkthrough** (owner, real phone).
- **Lighthouse** perf/a11y against the deploy (localhost skews it — no tiles).

## Conventions (also in CLAUDE.md / the work order)
- Branch `design/relaunch`. **Commit locally with short imperative messages;
  never push** — the owner reviews in GitHub Desktop and pushes/promotes.
- When you change `app.js` or `styles.css`, **bump its `?v=` cache token** in
  `index.html` (current: `?v=parity-disclaimer-1`).
- Add a `docs/design/decisions.md` entry (newest first) per change.
- `node --check app.js` must pass; keep `scripts/check.sh` green. Test locally:
  `python3 -m http.server 4173 --bind 127.0.0.1`, open `http://127.0.0.1:4173/`.

## Verification (what worked well last session)
- **Node harnesses** for logic: slice a function out of `app.js` and run it in
  `vm` with small stubs (used for the marker geometry, the dial click→time math,
  the wind-power heuristics). No browser needed.
- **The preview** for layout/behavior: `python3` server + the preview tools.
  Resize the viewport to a desktop width (≥ 860) for desktop rules and to 375 for
  mobile — the default preview viewport is narrow and triggers the mobile media
  queries. After a reload, call `map.resize()` (the headless canvas desyncs).
- The map needs a real foreground tab / the deploy domain to paint Mapbox tiles
  and individual markers; verify those there, not in the headless preview.

Pick up at step 1 unless the owner redirects. Keep changes minimal and
behavior-preserving outside the intended scope; end each piece with `node --check`
+ `check.sh` green, a `decisions.md` entry, a version-token bump, and a local
commit.
