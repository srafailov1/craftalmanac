# Work orders — Fable review handoff (2026-07-06)

Context: a full-codebase review (7 dimensions, every finding adversarially
verified) ran 2026-07-06 against the mission in `PRODUCT.md` and the
2026-07-05 live-site critique (`.impeccable/critique/`). 28 findings were
confirmed; the high-value ones landed the same day (commits `4f9a221` →
`80d6a4e`). This file is the queue of what remains, scoped so a fresh agent
can execute without re-deriving context. Every item below was verified
against the code as of those commits — re-check line anchors before editing.

## A. Owner visual sign-off (no code needed — checklist)

Local headless verification was blocked by the occluded-window rAF stall
(see memory/KNOWN_ISSUES); these landed code-verified but deserve one live
look on craftalmanac.com after deploy:

1. **Status line** — season bar's last row shows "Loading current map
   data...", then a record count that fades after ~6s; source outages and
   token errors persist. Check day + night registers.
2. **Point card footer** — open a tall minerals or medicine card on a
   laptop and a phone: the OCCURRENCE IS NOT PERMISSION line + Save button
   stay pinned below the scrolling body; card never hides under the season
   bar (cap is min(60vh, 520px)).
3. **Dotted rings** — prohibited/private markers draw dotted access rings
   at point zoom; confirm the dots read at small icon sizes and in the
   night register.
4. **Nav switching** — with Materials open, click About in the masthead:
   the sheet switches in one click; clicking the open sheet's own button
   still closes; Escape unchanged.
5. **Shelf "Open nearest in view"** — at z≥8 with records loaded, the
   button opens the species' nearest point card; keyboard path: Tab to it
   inside the sheet, Enter activates, focus lands in the card.
6. **Legend note** — the cluster-tint explainer reads well in the hover
   legend; wording is editable at app.js `renderMapLegend`.

## B. Remaining verified findings (unlanded)

### B1. Saved-area registry/cache reconcile (low, ~half day)
`localStorage` registry and `SAVED_AREAS_CACHE` can desync (persist write
swallowed → invisible permanent orphans in a never-rotating cache).
Verified-correct design (the naive fix is a no-op — see below):
- After `persistSavedAreas()` in `saveCurrentOfflineArea`, read the key
  back; if the new area id is missing, REPLACE the success notice with a
  warning ("saved for this session, but this browser isn't remembering
  saved areas"). Do NOT roll back the cache writes — a persist-failure
  save still works for the session by design (comment at the persist site),
  and the naive rollback reuses a claimed-set that already contains this
  attempt's chunks, deleting nothing.
- In `initOfflineAreas`, BEFORE wiring the save button (or guarded on
  `state.savedAreaBusy`), reconcile: open the cache, `cache.keys()`, map
  Request URLs → chunk ids by pathname, delete entries not claimed by any
  `state.savedAreas[].chunkIds`; drop the manifest + status-raster entries
  only when the registry is empty. This also cleans crash/multi-tab
  leftovers.

### B2. ink-honeysuckle purge (bundle into the next full subset regen)
183 orphan records across 85 chunks ship in the baked data (render
nowhere). validate_data check (g) now guards the class with the orphan
grandfathered. On the next `build_falling_fruit_subset.py` regen (needs
the archived CSVs at `~/Documents/CraftAlmanac-archives/falling-fruit/`
and a full PAD-US access-cache rebuild — plan for the ~live-service cost):
remove `ink-honeysuckle` from `GRANDFATHERED_ORPHAN_SPECIES` in
scripts/validate_data.mjs so the gate goes strict. Do NOT hand-drop rows
from chunks: check (d) requires positional row alignment with the
access-cache; a surgical purge must delete the same indices from both.

### B3. Desktop histogram affordance (~1–2 h)
The signature chart only appears on hover/focus-within of the season bar —
invisible to a mouse user who never hovers. Add a small always-visible
"CHART" toggle in the season-meta row (desktop; mirror the mobile
`legendMob` wiring) and a `#season-bar.season-open .season-hist` rule
OUTSIDE the ≤720px media query (the existing .season-open rules are
mobile-scoped; without the desktop rule the chart collapses when the
button loses focus).

### B4. Three-level marker dash pattern (optional polish, ~1–2 h)
Restrictive statuses now use the two-level dotted/solid channel. The full
proposal: prohibited = dotted, permit-required = dashed
(`context.setLineDash([4,3])` in a new `drawMarkerOutline` branch),
allowed = solid — closes the remaining allowed-vs-permit hue-only pair for
deutans. Mirror in the legend ring chips (emit a `data-st` attr at the
accessChips builder; `border-style: dotted/dashed` per status — chips
already pair with text so this is consistency, not safety). Eyeball dots
at 2–3 zoom levels; icon cache keys already include status.

### B5. Dead-CSS sweep (~1 h, mechanical)
The sidebar-era block was removed, but stragglers remain (verify each has
zero references in app.js/index.html/attribution.html before deleting —
match whole class tokens, not substrings): `.count`, and inside the mobile
media query: `.control-group`, `.section-heading`, `.section-toggle`,
`.section-body`. Consider a tiny gate script that extracts class tokens
from styles.css and greps the HTML/JS surfaces, allowlisting Mapbox's
`.mapboxgl-*` and dynamically-composed names (`.leg-chip`, `histogram-*`,
register/status suffixes).

### B6. KNOWN_ISSUES item 1 plan items 2–4 (pre-existing queue)
Prefetch/warm gz 2/4 aggregate tiles; data-availability-bounded downward
bridge; zoom-handoff instrumentation. Unchanged priority — the harness
(`scripts/test_zoom_handoff.mjs`) is in place to protect refactors.

### B7. getVisibleRecords memoization (only if phones jank)
Deferred from Phase 4.6. Profile minerals-mode slider drags on a phone
first; if render() cost is dominated by the per-frame filter, memoize on
(records identity, selectedSpecies version, day/workability, access set).

## C. Bigger decisions (owner gates — do not start without a yes)

- **Accounts / favorites / contributions**: full feasibility memo lives in
  Claude's memory (`accounts-feature-feasibility-2026-07`) — repo head
  start, auth options (hand-rolled Google OIDC in a Worker vs Better Auth
  + D1), licensing fit, and the two conflicts: the About sheet's "no
  account and no tracking" promise and the plan's explicit deferral of
  community contributions. Needs PRIVACY.md/TERMS.md before any Google
  consent screen.
- **Phase 6**: publish the rules corpus as a versioned dataset + docs
  page; outreach drafts on request (MN task force, extension services,
  herbaria). Owner-led; agent drafts materials when asked.
- **Register-aware static pages**: the 261 pages are day-register only;
  a dusk/night variant would match the app after dark. Purely cosmetic,
  moderate template work, zero safety impact.

## D. Conventions reminders for whoever picks this up

- `bash scripts/check.sh` before every commit — it now also enforces
  sw.js/index.html version sync and manifest species resolvability.
- Bump BOTH index.html `?v=` strings AND sw.js ASSET_VERSION/CACHE_VERSION
  together (the gate fails otherwise).
- Never hand-edit `materials/`/`projects/`/`cards/` — generator + regen
  (`--verify` gates catch staleness).
- Occurrence is never permission: any surface touching access status keeps
  its caution text; safety text ≥11px.
