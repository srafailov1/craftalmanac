# Codex Kickoff: C4 — Aggregates-on-Standard audit

Paste-ready prompt. C4 was on HOLD pending Phase 2 branch state; that state
now exists (commit `2a8936f` on `design/relaunch`).

---

You are Codex, working the data lane of the Craft Almanac redesign
migration. Work on branch `design/relaunch` ONLY — never `main`. Pull/merge
first if your checkout is behind; commit locally with short imperative
messages; never push.

Read first: `CLAUDE.md`, then `docs/design/work-order-redesign.md` section 2
(your lane contract — C4), then `docs/design/standard-style-spec.md` in
full, especially section 4 ("C4 — Codex's audit"). The map style migration
this audits is already applied in `app.js` (commit `2a8936f`) — `MAPBOX_STYLE`
is now `mapbox://styles/mapbox/standard`, and
`FALLING_FRUIT_AGGREGATE_LAYER_ID`/`FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID`/
`FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID` (rows 5-7 of the spec's layer table)
already have `slot: "top"` and `circle-emissive-strength: 1` /
`text-emissive-strength: 1` set in `app.js`. Your job is to audit those three
properties/layers, not to add them.

**Your deliverable:** `docs/design/notes-codex-c4.md`, a written integration
note. No edits to `app.js`, `styles.css`, or `index.html` — Claude applies
any resulting changes.

**What to check**, using a throwaway test page against
`mapbox://styles/mapbox/standard` (you do not need the rest of the app —
stand up a minimal page with the three layer definitions from
`standard-style-spec.md` rows 5-7, or read them directly out of `app.js`):

1. With `circle-emissive-strength: 1` on row 5 and `text-emissive-strength: 1`
   on rows 6-7, confirm the aggregate circle fill/stroke and count/label text
   colors are pixel-identical across all four `lightPreset` values
   (`dawn`/`day`/`dusk`/`night`) at zoom 3-8.
2. Confirm `text-emissive-strength` is a recognized paint property for
   `type: "symbol"` text in Mapbox GL JS v3.23.1 (the version `index.html`
   loads). If it logs a style-validation warning instead of applying, note
   the warning text and propose the correct property/value if different —
   this is the one item most likely to need a follow-up `app.js` edit from
   Claude.
3. With rows 5-7 all in `slot: "top"` (same slot as rows 8-10, the marker
   cluster/point layers), confirm the zoom-handoff bridge between aggregate
   circles and individual point markers doesn't introduce a new z-order
   flicker beyond what existed on `outdoors-v12`.
4. Note any interaction between row 7's state-name labels (`maxzoom: 4.2`)
   and Standard's own place-label density at zoom 3-4.

**Boundaries:** read-only on `app.js`/`styles.css`/`index.html`; output is
the note only. If a check can't be run (e.g., no browser available in your
environment), say so explicitly per item rather than guessing — a partial
note with honest gaps is more useful than a complete-looking one with
unverified claims.

When done, this fills the remaining gap in the Phase 2 verification pass —
Claude will fold your findings into the live zoom x register check (task
#15) once a local server is available.
