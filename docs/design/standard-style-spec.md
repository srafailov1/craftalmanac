# Mapbox Standard style spec (Phase 2)

**Status: applied (`2a8936f`), live verification pending.** §1-2 are landed in
`app.js`/`index.html`. §3's zoom 3-16 x 4-register verification gate needs an
interactive session with a local HTTP server reachable from
Claude-in-Chrome (`python3 -m http.server 4173 --bind 127.0.0.1`, then
`http://127.0.0.1:4173/`) — see `docs/design/decisions.md` 2026-06-13 entry.
§4 (C4) has not landed yet; fold it into the same verification pass. Map
initialization edits stay Claude-only per `work-order-redesign.md` §2 —
Codex's role here is the C4 audit in §4, delivered as a written note, not
`app.js`/`styles.css`/`index.html` edits.

## 1. What changes

- `MAPBOX_STYLE` (`app.js:63`) moves from `"mapbox://styles/mapbox/outdoors-v12"`
  to `"mapbox://styles/mapbox/standard"`.
- The register engine (landed this session, commit `fcb2856`) already calls
  `map.setConfigProperty("basemap", "lightPreset", reg)` with `reg` in
  `{dawn, day, dusk, night}` via `syncLightPreset()`. These are exactly
  Standard's four `lightPreset` values — confirmed against Mapbox's Standard
  guide, no mapping table needed. `syncLightPreset` is currently a no-op
  (outdoors-v12 has no `"basemap"` config); it activates automatically once
  `MAPBOX_STYLE` changes.
- Standard has no "insert before this basemap layer" position the way
  outdoors-v12 did. Every layer added in `initMapLayers()` /
  `initRegionBoundaryLayers()` needs a `slot` (`"bottom" | "middle" | "top"`)
  instead of `firstLineOrSymbolLayerId`. `getFirstLineOrSymbolLayerId()` and
  the `firstLineOrSymbolLayerId` plumbing become dead code — Claude removes
  them as part of the actual edit (not in scope for this spec).
- Per the rev6 "dark points at night" lesson (prototype `416e4b9`), every
  point/marker layer gets its `*-emissive-strength` paint property set to
  `1` so its color stays identical across all four registers. Polygon/line
  context layers (public lands, region mask/outline) are left at the
  default (`0`) so they can pick up Standard's per-register land tinting —
  flagged for verification in §3, not prescribed.

## 2. Layer-by-layer plan (all 10 production layers)

| # | Layer ID | Type | Current insertion | Target `slot` | Emissive property | Notes |
|---|---|---|---|---|---|---|
| 1 | `REGION_MASK_LAYER_ID` | fill | before `firstLineOrSymbolLayerId` | `bottom` | none (verify) | Masks everything outside the CONUS boundary (`#f2efe5` @ 0.58 opacity). Fill layers render under all symbols regardless of slot, so this mainly affects ordering vs. Standard's own land/water. Check it doesn't fight Standard's ocean/atmosphere styling in dusk/night. |
| 2 | `REGION_OUTLINE_LAYER_ID` | line | before `firstLineOrSymbolLayerId` | `bottom` | none (verify) | CONUS border, `#1f3d2b` @ 0.86. **Flag:** this color may lose contrast against dark dusk/night grounds (`--reg-ground` is `#453e4a`/darker) — if so, this is one to set `line-emissive-strength: 1` on, or recolor via a `--reg-*` token in a later phase. |
| 3 | `PUBLIC_LANDS_FILL_LAYER_ID` | fill | before `firstLineOrSymbolLayerId`, `minzoom: PUBLIC_LANDS_MIN_RENDER_ZOOM` (8) | `bottom` | none (verify) | PAD-US polygons, `#3b8c7e`/`#75ad37` @ 0.16–0.18. Subtle by design; verify it stays visible (not washed out or over-saturated) across registers. |
| 4 | `PUBLIC_LANDS_LINE_LAYER_ID` | line | before `firstLineOrSymbolLayerId`, same minzoom | `bottom` | none (verify) | `#2f786c`/`#4f8f32` @ 0.72, width 1. Same verification as #3. |
| 5 | `FALLING_FRUIT_AGGREGATE_LAYER_ID` | circle | appended (no `beforeId`) | `top` | `circle-emissive-strength: 1` | Aggregate circles, `#f7f2df` fill / `#243a2a` stroke. **C4 layer** — also carries iNat aggregate items (Phase 5 raster). |
| 6 | `FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID` | symbol | appended | `top` | `text-emissive-strength: 1` (verify property exists — §4) | Count labels, `#243a2a`. **C4 layer.** |
| 7 | `FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID` | symbol | appended, `maxzoom: 4.2` | `top` | `text-emissive-strength: 1` (verify) | State-name labels at zoom < 4.2. **C4 layer. Flag:** already renders above outdoors-v12's place labels today (no `beforeId`); re-check overlap against Standard's place-label density at zoom 3–4. |
| 8 | `MARKER_CLUSTERS_LAYER_ID` | circle | appended, `minzoom: MARKER_CLUSTER_BRIDGE_MIN_ZOOM` (6.4) | `top` | `circle-emissive-strength: 1` | Cluster circles, step-colored by `point_count`, `#1f3d2b` stroke. |
| 9 | `MARKER_CLUSTER_COUNT_LAYER_ID` | symbol | appended, same minzoom | `top` | `text-emissive-strength: 1` (verify) | Cluster count labels, `#1f3d2b`. |
| 10 | `MARKERS_LAYER_ID` | symbol | appended, `minzoom: FALLING_FRUIT_MIN_LOAD_ZOOM` (8) | `top` | `icon-emissive-strength: 1` (verify) | Individual point markers, canvas-drawn `icon-image` sprites via `map.addImage`. |

All `top`-slot layers (5–10) preserve their current relative order (they're
all appended today with no `beforeId`); slot assignment alone should not
reorder them relative to each other. `bottom`-slot layers (1–4) preserve
their current "below roads/symbols" relationship since fill/line layers
render under symbols regardless of slot.

## 3. Verification gate (Phase 2 gate, `work-order-redesign.md` §3)

"All existing layers verified at zoom 3–16 in all four registers." Concretely:

- Zooms to check: 3 (CONUS overview, aggregates), 5–7 (regional aggregates,
  pre-bridge), 8 (zoom-handoff bridge), 11 (chunk-loaded points), 16 (max
  detail / popups).
- Registers: force each of `day`/`dawn`/`dusk`/`night` from devtools without
  waiting for real time — `document.body.dataset.register = "night"; map.setConfigProperty("basemap","lightPreset","night")`.
  (`state.register` should be set too, or the 60s interval will revert it on
  the next tick — easiest is to also set `state.register = "night"`.)
- For each (zoom, register) combination, confirm:
  - Public-land fills/lines (rows 3–4) and the region mask/outline (rows 1–2)
    remain legible against that register's `--reg-ground`.
  - Aggregate circles/counts and marker clusters/points (rows 5–10) render
    in their fixed colors, unchanged from `day`, per the "data graphics
    consistent across registers" principle.
  - State-name labels (row 7) at zoom 3–4 don't badly collide with Standard's
    own place labels.
  - The zoom-handoff bridge (`updateLayerHandoff`, `beginAggregateBridge`,
    aggregate↔point transitions around zoom 6.4–8) still fires — this logic
    is style-agnostic (`map.on("sourcedata", ...)`) but confirm empirically.
- `node --check app.js`; bump `?v=` query strings for `app.js`/`styles.css`
  in `index.html`.
- `KNOWN_ISSUES.md` gains no new entries across two nightly runs.

## 4. C4 — Codex's audit (filtered-aggregates layers only)

**Scope:** rows 5–7 only (`FALLING_FRUIT_AGGREGATE_*`) — the layers Codex's
filtered-aggregates pipeline (Falling Fruit chunks + Phase 5 iNat status
raster) feeds.

**Deliverable:** a written integration note, `docs/design/notes-codex-c4.md`
— no edits to `app.js`, `styles.css`, or `index.html` (Claude applies any
resulting changes during the actual migration edit).

**What to check**, using a throwaway test page against
`mapbox://styles/mapbox/standard` (doesn't need to wait for Claude's `app.js`
edit — Codex can stand this up independently):

1. With `circle-emissive-strength: 1` on row 5 and `text-emissive-strength: 1`
   on rows 6–7, confirm the aggregate circle fill/stroke and count/label text
   colors are pixel-identical across all four `lightPreset` values at zoom
   3–8.
2. Confirm `text-emissive-strength` is a recognized paint property for
   `type: "symbol"` text in the pinned Mapbox GL JS version (`index.html`
   loads `mapbox-gl.js` v3.23.1). If it's unsupported, Mapbox logs a style
   validation warning to the console without breaking the map — note any
   such warning and propose the correct property name/value if different.
3. With rows 5–7 all in `slot: "top"`, confirm the zoom-handoff bridge
   between aggregate circles and individual point markers (also `slot:
   "top"`, rows 8–10) doesn't introduce a new z-order flicker beyond what
   exists today on outdoors-v12.
4. Note any interaction between row 7's state labels (zoom < 4.2) and
   Standard's place-label density at the same zoom — this overlaps with the
   general flag in row 7 above, but C4 owns the aggregate-label half of it.

## 5. Fallback (owner decision #4, deferred)

If, after this spec, one session of Claude's effort on rows 1–4 and 8–10
(plus landing C4's findings for 5–7) still leaves the aggregates pipeline or
zoom-handoff broken under Standard in a way that isn't a quick fix: ship the
four registers as two classic styles (e.g., `outdoors-v12` for day/dawn, a
custom dark style for dusk/night) and defer Standard. This is a live decision
at that point, not pre-built.
