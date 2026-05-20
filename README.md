# Virginia Forage Map

A local-first prototype for mapping edible plants and mushrooms around Charlottesville, Virginia.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

## Current prototype

- Interactive Mapbox Outdoors basemap centered on Charlottesville when `config.js` has a Mapbox token, with an OpenStreetMap fallback for local testing.
- Day-of-year filtering, a "Ripe today" shortcut, and a stacked seasonal availability chart.
- Category filters for fruit, berries, nuts, and mushrooms.
- Human-readable food groups in the sidebar, with more specific observed taxa shown in map popups.
- Automatic iNaturalist observation loading for the current map bounds and selected food groups.
- Trimmed Falling Fruit import at `data/falling-fruit-charlottesville.json`.
- Public access polygons from USGS PAD-US, queried live for the current map bounds.
- Historic orchard records from the National Park Service cultural landscapes map, marked as permission-required.

## Mapbox

Add a Mapbox public access token to `config.js`:

```js
window.FORAGE_CONFIG = {
  mapboxToken: "pk..."
};
```

## Data notes

The starter species list is based on Shenandoah National Park's 2026 Superintendent's Compendium section on fruits, nuts, berries, and edible fungi that may be gathered by hand for personal use. The prototype intentionally excludes the broad "other edible fungi" bucket until mushrooms can be handled with a species-level edible whitelist. Park rules are not a general foraging license elsewhere; land ownership, local ordinances, and species-level safety still need to be checked.

Falling Fruit is not represented with starter records anymore. The browser app loads a trimmed central-Virginia JSON export from `data/falling-fruit-charlottesville.json`. Regenerate it from the downloaded Falling Fruit CSV archives with:

```sh
python3 scripts/build_falling_fruit_subset.py
```

The subset currently filters the full Falling Fruit archive to the app's food groups and a central Virginia bounding box covering Charlottesville and the Shenandoah-facing area.

iNaturalist data is useful for occurrence hints, not harvest permission. Some observations have obscured or generalized coordinates, and many taxa need edible-species filtering before they should be shown as forage recommendations.

The public-access overlay comes from USGS PAD-US. It can help screen for likely public access, but it is not a harvesting-rights layer. "Public access only" keeps records with Falling Fruit public-access metadata, NPS public-land records, or coordinates inside currently loaded PAD-US open/restricted access polygons.

The NPS historic orchard subset is generated from the NPS Cultural Landscapes ArcGIS service:

```sh
python3 scripts/build_nps_orchards.py
```

Those records are intentionally labeled as permission-required because NPS asks visitors not to take fruit or cuttings from documented historic orchards without permission.

See `ATTRIBUTION.md` for source links, license notes, and safety caveats.

## Good next steps

- Add a second stricter Charlottesville-only Falling Fruit subset if the central Virginia file feels too broad.
- Add a "verified by me" layer for personal notes and harvest history.
- Build a safer species whitelist for edible fungi before adding more mushroom taxa.
- Add plant-part metadata: fruit, nut, berry, mushroom, leaf, shoot, flower, root.
- Consider more regional sources: Virginia DWR public access and wildlife management areas, Virginia DCR natural area/park data, USFS recreation/open data for George Washington and Jefferson National Forests, municipal open-data tree inventories, and USDA/USFS Forest Inventory and Analysis occurrence data.
