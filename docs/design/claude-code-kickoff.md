# Claude Code kickoff — continue the Craft Almanac redesign

You're picking up an in-progress redesign migration of Craft Almanac (a static,
no-build, vanilla JS + Mapbox GL map site). Work continues on branch
**`design/relaunch`** (never `main`).

## First, read these (in order)
1. `CLAUDE.md` — project values + non-negotiables (auto-loaded). Key:
   occurrence is never harvest permission; safety/access colors stay fixed
   across light registers; the medicine/herbalism educational-use disclaimer
   stays prominent; no build step; vanilla JS/CSS only; new data sources enter
   `ATTRIBUTION.md` before they ship.
2. `docs/design/decisions.md` — the running design log, **newest first**. Read
   the top ~12 entries; that's the full recent history of this migration.
3. `docs/design/work-order-redesign.md` — the 7-phase plan, lanes, launch checklist.
4. `docs/design/phase3-floating-ui-spec.md`, `docs/design/phase4-conditions-spec.md`
   — detailed specs for the phases already done (reference).

## Where things stand (done)
- **Phases 0–4 complete:** design tokens + light registers (dawn/day/dusk/night
  via Mapbox Standard `lightPreset`); the floating UI — anchored `.pt-card`
  popups (with observer + dataset + license attribution), an interactive legend
  (category + access-status filter chips), a real-phenology season slider,
  masthead + Maps/Plants/Recipes/About sheets; and the full conditions layer —
  rail (sun/moon/rain/wind/tide) + detail panels, animated wind canvas, NOAA
  tide, RainViewer radar, and rain-fed flush pulses. All on a graceful-
  degradation contract (any conditions endpoint can fail and the map stays
  fully usable).
- **Original sidebar fully retired:** species selection migrated to
  `state.selectedSpecies` (driven by the legend chips + Plants sheet);
  `#controlPanel` deleted; season slider + search relocated to floating
  elements (`#season-bar`, `#search-bar`).
- **Phase 5 (mobile) done:** a `@media (max-width:720px)` layer stacks the
  floating UI on phones (verified no-overlap; desktop untouched). Pending the
  owner's on-device walkthrough (the work-order gate).

Latest commits on `design/relaunch` (newest first): `a703fb4` Phase 5 mobile ·
`45f3261` retire sidebar shell · `a577306` species→state · `3d37443` floating
season+search · then the Phase 4a–4e and Phase 3 commits.

## What to do next (recommended order)

### 1. Vendor the redesign fonts — highest visual impact, and you're suited for it
The Cowork sandbox was network-blocked from font CDNs, so the OFL set was never
vendored; the site falls back to Georgia/system, which is the main reason it
still reads closer to the original than the prototype. You have local network
access, so:
- Read `docs/design/fonts-needed.md` (exact files, weights, the Fraunces
  fixed-instance choice).
- Self-host **Fraunces** (display, the specified fixed instance + italic),
  **Public Sans** (UI), **IBM Plex Mono** (labels) as `woff2` under `fonts/…`,
  matching the `@font-face` `src` paths already at the top of `styles.css`
  (those rules exist but point at missing files).
- The `--font-display` / `--font-ui` / `--font-mono` vars are defined in `:root`
  but **unused** — point the components at them. `grep` `styles.css` for
  `Georgia` (→ `var(--font-display)` for the wordmark / `.serif` / `.pt-card h2`
  / `#season-bar .season-readout strong`) and for `ui-monospace` (→
  `var(--font-mono)` for the mono labels: `.lab`, `.sci`, `.k`, rail/legend
  labels, `.age`, `.bars-labels`, etc.); set body/UI text to `var(--font-ui)`.
- Confirm the OFL terms and add a fonts entry to `ATTRIBUTION.md`.
- Gate: real faces render in all four registers, no layout breakage,
  `node --check app.js` clean, version-bump `styles.css`.

### 2. Phase 6 — hardening (work-order §Phase 6)
Contrast audit across the four registers (every status color × register ground
meets thresholds — the plan assigns this to Qwen's Q2, but you can do it);
keyboard path; performance pass (radar + viewport chunks + wind canvas at the
zoom boundaries); console-clean sweep; version-string bumps. Gate: clean
console; a11y/contrast within agreed floors.

### 3. Phase 7 — content + cutover
Real About copy; Plants sheet backed by the full catalogs; the three sample
recipes (owner authors the content); remove any demo banners; then the **owner**
merges `design/relaunch` → `main`.

## Conventions (also in CLAUDE.md / the work order)
- Branch `design/relaunch`. **Commit locally with short imperative messages;
  never push** — the owner reviews in GitHub Desktop and pushes/promotes.
- When you change `app.js` or `styles.css`, **bump its `?v=` cache token** in
  `index.html` (current: `app.js?v=sidebar-retired-1`, `styles.css?v=mobile-2`).
- Add a `docs/design/decisions.md` entry (newest first) for each change.
- `node --check app.js` must pass. Test locally:
  `python3 -m http.server 4173 --bind 127.0.0.1`, open `http://127.0.0.1:4173/`.

## Verification (what's high-leverage here)
- `node --check app.js` for syntax after every JS change.
- **Node harnesses** were the backbone of verification in this migration:
  extract a top-level function from `app.js` by name (read the file, slice from
  `function NAME(` to the next column-0 `}`), `vm.runInContext` it with small
  stubs, and assert behavior. This is how the popup builder, the conditions
  kill-switch, the wind-canvas guards, the radar zoom-handoff, and the
  species-selection migration were each verified — the relevant `decisions.md`
  entries describe what each checked. Great for logic; no browser needed.
- The map/browser: run the local server and look (or ask the owner). The map
  needs a real foreground tab to fire Mapbox's `load`; the public token is
  URL-scoped, so bare-IP/localhost may not show tiles but the deploy domain does.

## Environment notes (you're inheriting from a Cowork session)
- **Git works normally for you.** The Cowork sandbox had a FUSE-mount quirk
  (couldn't `unlink` inside `.git`; occasional `index.lock` deadlocks) — you
  won't hit it. A stale `.git/*.lock` is leftover from that and is safe to remove.
- You can fetch fonts/allowlisted resources locally (the sandbox couldn't),
  which is why the font task is yours to finish.
- Codex completed the sidebar-retirement steps from
  `docs/design/codex-kickoff-sidebar-retirement.md` (done and verified).

Pick up at step 1 unless the owner redirects. Keep changes minimal and
behavior-preserving outside the intended scope, and end each piece with its
gate + a `decisions.md` entry + a local commit.
