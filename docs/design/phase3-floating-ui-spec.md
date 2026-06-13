# Phase 3 spec — Floating UI (`work-order-redesign.md` §Phase 3)

**Status:** drafted 2026-06-13, not yet applied. Written after confirming
Phase 2 is fully closed (region-outline fix + dead-label removal,
`docs/design/decisions.md`) and that Phase 3's data dependencies are in:
C1 (`data/tide-stations.json`), C2 (`data/phenology/{food,ink,medicine}.json`),
C3 (`data/flush-thresholds.json`), C4 (`docs/design/notes-codex-c4.md`) are
all landed. Phase 1's CSS shells for this phase
(`.pt-card`, `.mini-card`/`.card-grid`, `.leg-chip`/`.rail-seg`, `.floating`,
the four `--reg-*` token sets) are already in `styles.css` (~line 1565+) and
currently unused by any markup — Phase 3's job is largely to wire markup/JS
to these existing shells, not invent new CSS.

Per `work-order-redesign.md` §2, all of Phase 3 is Claude's lane (map init,
popups, legend, season slider, sheets are Claude-only). **No Codex/Qwen
prerequisite work blocks Phase 3 kickoff.** Codex's queue items (C-series
done; `docs/work-split.md` items 3-4 are independent housekeeping/data work)
and Qwen's queue (`work-split.md` items 4-12, mostly docs/housekeeping) can
run in parallel at any time without affecting this spec — see "Parallel
queue" at the end if useful.

Nightly loops are paused, so each sub-phase below should land with its own
`node --check`, version bump, and `decisions.md` entry, the same discipline
the loops would otherwise enforce.

## Sequencing

Five sub-phases, ordered so each is independently landable and reviewable
(matches the project's "phase ends with gate + local commit" convention):

1. **3a — Anchored point popups** (`.pt-card`). Highest priority: the launch
   checklist's "every point popup shows record attribution and the ethics
   line" is a launch blocker, the CSS shell is ready, and it touches only
   `getMarkerPopupHTML`/`bindPopupActions` + a thin layer of new helpers —
   no panel/masthead restructuring required. **Recommended starting point.**
2. **3b — Legend** (`.leg-chip`). Per-mode category filters wired to
   `MAP_MODE_CONFIG`, access-status chips replacing the current
   `accessStatusList`/`categoryList` panel sections.
3. **3c — Season slider**. Real phenology stacks from C2
   (`data/phenology/<mode>.json`) replacing/feeding `renderSeasonControls()`
   (`app.js:2328`) and the existing histogram.
4. **3d — Masthead + sheets**. Maps/Plants/Recipes/About sheets using
   `.mini-card`/`.card-grid`; Plants sheet backed by the real catalogs
   (`speciesCatalog` per mode); Recipes ship as the three placeholders per
   `work-order-redesign.md` §5 decision #2.
5. **3e — Old panel removal**. Remove `#controlPanel` sections only after
   each replacement (3b legend, 3c season, 3d species/access lists) is
   verified live. Mobile responsive pass is Phase 5, not here — 3e should
   leave the existing `mobile-section`/`is-collapsed` mechanics alone until
   then, or note explicitly if a piece can't be removed without it.

Conditions rail (sun/moon/rain/wind/tide, `.rail-seg`) is **Phase 4**, not
Phase 3 — `.rail-seg` exists in CSS now but has no consumer until Phase 4's
fetcher lands.

## 3a — Anchored point popups (detailed)

**Files:** `app.js` (`getMarkerPopupHTML` ~3493-3542, `bindPopupActions`
~3465-3474, the `mapboxgl.Popup` construction at ~3450-3461 — switch
`className` and drop the old `.popup-*` class usage), `styles.css` (only if
`.pt-card` needs small additions — see gaps below; do not duplicate the
Phase-1 shell).

**Current state:** `getMarkerPopupHTML` already returns a `<dl class="popup-grid">`
with Place, ID source (`sourceUrl`/`sourceLabel`/`idDate`, dataset-specific:
`inaturalist`/`fallingfruit`/`nps-orchard`), used parts, safety tags, harvest
ethic, access/rules row (`accessStatus`, `accessSourceUrl`/`accessSourceLabel`),
season, and a save-location button. This is most of the *content* Phase 3
needs — the work is restructuring it into the `.pt-card` hierarchy
(`.pt-card .spine` colored by access status, `h2` species name, `.sci`
scientific name, `.row.access`/`.row.safety`/generic `.row`s, `.season-line`,
`.ethic`, `.flush`) and closing two content gaps:

- **License field (launch checklist: "observer + dataset + license").**
  Dataset license currently lives only in `ATTRIBUTION.md`
  (per-source, CC BY-NC variants). Add a small per-`source` license map
  (`inaturalist` -> CC BY-NC 4.0 etc., matching `ATTRIBUTION.md` exactly) and
  surface it in the ID-source row, e.g. "iNaturalist · CC BY-NC 4.0 · observed
  2026-05-02". Pull the exact license strings from `ATTRIBUTION.md` rather
  than re-deriving them — if any source's `ATTRIBUTION.md` entry is missing a
  license, that's a separate `ATTRIBUTION.md` gap to flag, not a popup bug.
- **Observer field for iNaturalist records.** `mapINaturalistObservation`
  (`app.js:4237`) doesn't currently keep `observation.user.login` /
  `observation.user.name`. Add `observer: observation.user?.login || ""` to
  the mapped record and surface it ("Observed by `<observer>`, 2026-05-02")
  when present; omit the clause when absent (Falling Fruit / NPS orchard
  records have no observer concept — don't fabricate one).

**Ethics line (CLAUDE.md non-negotiable):** every popup gets the
"occurrence is not harvest permission" line via `.pt-card .ethic` —
reuse/trim the existing `popup-warning`/access-note copy rather than adding a
second disclaimer; one clear line, not two competing ones.

**Spine/access color:** `.pt-card .spine` background = the `--reg-st-*`
token matching `accessStatus` (`allowed`/`permit`/`prohibited`/`private`/
`unknown`) — this is the "safety colors are fixed semantics in every
register" rule from CLAUDE.md, and the tokens already exist per-register.

**Medicine mode:** `.pt-card` for medicine-mode species must keep the
educational-use disclaimer prominent (CLAUDE.md) — likely its own `.row` or
folded into `.ethic`, not dropped during restructuring.

**Hover popup** (`forage-hover-popup`, ~3427-3435): leave as a minimal
title-only tooltip; `.pt-card.compact` exists in CSS for a future denser
variant but is not required for 3a's gate.

**Gate:**
- `node --check app.js` passes; version bump.
- Click-through popups for one species per access status (allowed, permit,
  permit-required, private, unknown) across all three modes (food/ink/
  medicine) via Claude-in-Chrome against `http://127.0.0.1:4173/`: each shows
  species name, scientific name, access status with correct spine color,
  rules citation, season line, ethics line, dataset attribution including
  license, and observer when present (iNaturalist).
- Medicine-mode popup retains the herbalism disclaimer.
- All four registers (`day`/`dawn`/`dusk`/`night`): `.pt-card` background/
  text/hairlines follow `--reg-panel-a`/`--reg-ink`/`--reg-hair` (should be
  automatic via the existing token-driven CSS — spot-check one register
  other than `day`).
- Save-location button still works (`bindPopupActions`/`toggleSavedLocation`
  unchanged in behavior).
- `decisions.md` entry; commit.

## Parallel queue (optional, non-blocking)

If useful while 3a-3e proceed, Codex/Qwen items that don't touch
`app.js`/`styles.css`/`index.html` map-init/popup/legend/season/sheet code
can run independently — e.g. `docs/work-split.md` Qwen items 4 (README
refresh) and 11-12 (escalation stubs, `.DS_Store` cleanup) are self-contained
and gate-checkable. Not required for Phase 3, but free progress if the owner
wants Qwen's queue moving in parallel. No specific item is prescribed here;
flag if you'd like a prompt drafted for one.
