# Codex C4 — Aggregates-on-Standard Audit

Date: 2026-06-13

Branch state audited: `design/relaunch` at `ef52bf8`, including Phase 2 commit
`2a8936f` (`Migrate map style to Mapbox Standard per spec`).

Scope: rows 5-7 of `docs/design/standard-style-spec.md`, the
`FALLING_FRUIT_AGGREGATE_*` layers only. No `app.js`, `styles.css`, or
`index.html` edits were made.

## Code-Read Result

`app.js` is configured as the spec describes:

- `MAPBOX_STYLE` is `mapbox://styles/mapbox/standard`.
- `falling-fruit-aggregate-circles` has `slot: "top"` and
  `circle-emissive-strength: 1`.
- `falling-fruit-aggregate-counts` has `slot: "top"` and
  `text-emissive-strength: 1`.
- `falling-fruit-aggregate-labels` has `slot: "top"`, `maxzoom: 4.2`, and
  `text-emissive-strength: 1`.
- Rows 8-10 are also in `slot: "top"`, so the aggregate and marker/cluster
  layers share the intended Standard slot.

## Item 1 — Pixel Identity Across Light Presets

Status: not completed in this environment.

I built a throwaway Standard test page in `/private/tmp` with the row 5-7
layer definitions and separated test features for circle fill/stroke, count
text, and state-label text. The in-app browser could load the local HTML but
blocked the Mapbox GL JS bundle before `window.mapboxgl` initialized
(`net::ERR_BLOCKED_BY_CLIENT` for local script routes, followed by minified
Mapbox startup errors when other serving approaches were attempted). There is
also no standalone Playwright/Chromium package available in this checkout.

Result: I could not honestly confirm pixel-identical rendered colors across
`dawn`, `day`, `dusk`, and `night` at zoom 3-8. This should be folded into
Claude's live browser pass on the local app once a normal browser session is
available.

Expected outcome from static configuration: row 5's circle colors should stay
fixed because `circle-emissive-strength: 1` is present; row 6-7 text colors
should stay fixed if Mapbox applies `text-emissive-strength` as specified.

## Item 2 — `text-emissive-strength` Support

Status: confirmed by the pinned Mapbox GL JS v3.23.1 bundle.

The downloaded `https://api.mapbox.com/mapbox-gl-js/v3.23.1/mapbox-gl.js`
bundle includes `text-emissive-strength` in the symbol paint specification:

- `paint_symbol["text-emissive-strength"]`
- type `number`
- default `1`
- minimum `0`
- transition-enabled
- data-driven
- shader binding maps it to `emissive_strength`

The same bundle also includes `circle-emissive-strength` and
`icon-emissive-strength`, matching the Standard-style spec's row 5 and rows
8-10 assumptions.

I could not observe a browser console validation pass because the browser
blocked the Mapbox GL bundle before map initialization. Based on the pinned
bundle's own style-spec entries, `text-emissive-strength: 1` is recognized for
symbol text in Mapbox GL JS v3.23.1 and no follow-up property-name change is
recommended.

## Item 3 — Slot/Z-Order and Zoom-Handoff Bridge

Status: not completed as a rendered check in this environment.

Static ordering is favorable:

- Rows 5-7 are added before rows 8-10 in `initMapLayers()`.
- All six layers use `slot: "top"`.
- `updateLayerHandoff()` toggles visibility between aggregate rows 5-6 and
  marker/cluster rows 8-9; it does not depend on basemap layer ids.
- Row 7 state labels remain independent of the bridge and are limited by
  `maxzoom: 4.2`.

I could not render the bridge animation or compare it against `outdoors-v12`
because the local browser could not execute Mapbox GL. Follow-up for Claude:
in the live zoom x register pass, watch zoom 6.4-8 with dense aggregate and
point data loaded. The specific thing to verify is that same-slot placement
does not create a brief frame where cluster circles render beneath aggregate
circles or Standard place labels during the aggregate-to-point swap.

## Item 4 — State Labels vs. Standard Place Labels

Status: not completed as a rendered check in this environment.

Static risk remains as flagged in the spec:

- Row 7 renders state-name labels in `slot: "top"` at zoom `< 4.2`.
- It uses `text-allow-overlap: false` and `text-ignore-placement: false`, so
  labels participate in collision placement rather than forcing overlap.
- Because it is in the top slot, any accepted row 7 label can sit above dense
  Standard basemap labels at zoom 3-4.

Follow-up for Claude: during the live Standard verification pass, check CONUS
zoom 3, eastern-US zoom 4, and the Northeast corridor. If row 7 competes with
Standard city/state labels, the least invasive options are to lower its
`maxzoom`, reduce `text-size`, or keep the layer hidden unless aggregate
labels are genuinely useful in the new legend/season context.

## Recommendation

No immediate `app.js` property-name correction is needed for rows 5-7.
`text-emissive-strength` is present in the pinned Mapbox GL JS v3.23.1 symbol
paint spec.

The remaining C4 gap is rendered verification only: pixel identity,
zoom-handoff z-order, and row 7 label density still need a normal browser
session that can execute Mapbox GL JS.
