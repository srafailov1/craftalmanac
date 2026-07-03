# Adding a map mode — the full checklist

`MAP_MODE_CONFIG` makes the UI side of a new mode look like one config entry.
It isn't. These are all the touchpoints a 5th mode requires, gathered from what
the minerals mode actually took. Work top-down; the gates catch some but not
all of these.

## Required (app.js unless noted)

1. **`MAP_MODE_CONFIG` entry** — id, speciesHeading, `lede` (shown atop the
   Materials sheet), categories + `categoryColors`, catalog, sourceNames,
   `dataNotes` (shown in About → "This map's sources"), rulesLabel, source-load
   flags, optional `initialView` / `safetyNote`.
2. **Species catalog** (`<mode>SpeciesCatalog`) — every entry needs
   `months` (or a non-seasonal design decision), `inatTaxonIds` if iNat-backed,
   `usedParts`, `notes`.
3. **Safety tags** — an explicit `SAFETY_TAGS_BY_SPECIES` decision per species
   (`[]` = considered, no notable hazard). Gate: `scripts/test_safety_tags.mjs`
   fails the build if missing. Consider `HARVEST_ETHIC_BY_SPECIES` too.
4. **Mushroom policy** — any fungus needs `EDIBLE_FUNGUS_WHITELIST` review
   (CLAUDE.md non-negotiable; non-whitelisted fungi force-prohibit).
5. **Rule semantics** — how does the mode map onto land-manager rules?
   - `getStateSystemRule` branches on food vs non-food; a new consumptive mode
     needs its own review of every state entry.
   - NPS: 36 CFR 2.1 food exception does NOT cover non-food taking; check
     `NPS_GATHERING_RULES` semantics.
   - If the mode has its own land-manager table (like `MINERAL_ACCESS_RULES`),
     add rule tests to `scripts/test_rules.mjs`.
6. **Status raster** — the low-zoom overview raster bakes per-mode statuses
   (`{food, ink, medicine}` today). A new mode needs
   `scripts/build_status_raster.mjs` + `fetch_padus_cell_containment.mjs`
   extended and the raster REBUILT, or the overview shows unknown.
7. **Phenology** — `data/phenology/<mode>.json` via
   `build_phenology_histograms.mjs` (add the mode to MODE_CONSTS), or a
   non-seasonal axis like minerals' workability. Gate: the `--verify` check.
8. **Falling Fruit aliases** — if FF records should appear in the mode, add
   `<MODE>_FALLING_FRUIT_SPECIES_ALIASES` and set `loadFallingFruit`.
9. **Mode-specific chrome** — season bar behavior (see `mode-minerals`),
   histogram (`renderHistogram` branch), conditions-rail gates (flush/tide are
   food-only by literal check), marker zoom ranges
   (`applyMarkerZoomRangeForMode`), cluster tint (categories are picked up
   automatically from MAP_MODE_CONFIG — cluster `clusterProperties` are built
   from the union of all modes at source creation, so NEW category ids need a
   page reload to exist on clusters).
10. **Copy surfaces** — Maps sheet card (`MODE_SHEET_INFO`), masthead mode pill
    (automatic from MODE_SHEET_INFO), README, welcome modal map list.
11. **Attribution** — every new data source gets an `ATTRIBUTION.md` entry with
    license notes BEFORE it ships (CLAUDE.md non-negotiable).
12. **URL state** — mode id becomes a `#map=` value automatically; check
    `parseUrlBootState` assumptions (day vs workability params).

## Checks before commit

```sh
bash scripts/check.sh
```

Then hand-verify: mode switch from every other mode, popup card fields, legend
categories, histogram, "In view" list, and the mode's rule text on a known
parcel (e.g. an NPS unit, a national forest, private land).
