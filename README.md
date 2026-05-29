# Craft Almanac Mid-Atlantic Material Maps

A local-first prototype for mapping edible plants, mushrooms, and craft materials across Virginia, West Virginia, Maryland, Delaware, and Pennsylvania.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

## Current prototype

- Interactive Mapbox Outdoors basemap with movement constrained to the five-state Mid-Atlantic region.
- Day-of-year filtering, a "Ripe today" shortcut, and a stacked seasonal availability chart.
- Category filters for fruit, berries, nuts, and mushrooms.
- Human-readable food groups in the sidebar, with more specific observed taxa shown in map popups.
- Automatic iNaturalist observation loading for the current map bounds, selected state place scopes, and selected species groups.
- Trimmed Mid-Atlantic Falling Fruit import at `data/falling-fruit-mid-atlantic.json`.
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

Falling Fruit is not represented with starter records anymore. The browser app loads a trimmed Mid-Atlantic JSON export from `data/falling-fruit-mid-atlantic.json`. Regenerate it from the downloaded Falling Fruit CSV archives with:

```sh
python3 scripts/build_falling_fruit_subset.py
```

The subset currently filters the full Falling Fruit archive to the app's material groups and the regional boundary stored in `data/mid-atlantic-boundary.json`.

iNaturalist data is useful for occurrence hints, not harvest permission. Some observations have obscured or generalized coordinates, and many taxa need edible-species filtering before they should be shown as forage recommendations.

The public-access overlay comes from USGS PAD-US. It can help screen for likely public access, but it is not a harvesting-rights layer. Access and permissions filters use Falling Fruit access notes, NPS records, and coordinates inside currently loaded PAD-US open/restricted access polygons where available.

The NPS historic orchard subset is generated from the NPS Cultural Landscapes ArcGIS service:

```sh
python3 scripts/build_nps_orchards.py
```

Those records are intentionally labeled as permission-required because NPS asks visitors not to take fruit or cuttings from documented historic orchards without permission.

See `ATTRIBUTION.md` for source links, license notes, and safety caveats.

## Good next steps

- Add a city, county, or state selector if the regional Falling Fruit subset feels too broad.
- Add a "verified by me" layer for personal notes and harvest history.
- Build a safer species whitelist for edible fungi before adding more mushroom taxa.
- Add plant-part metadata: fruit, nut, berry, mushroom, leaf, shoot, flower, root.
- Consider more regional sources: state wildlife/park/forest data for VA, WV, MD, DE, and PA; USFS recreation/open data; municipal open-data tree inventories; and USDA/USFS Forest Inventory and Analysis occurrence data.
