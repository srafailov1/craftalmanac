# Craft Almanac — Material Maps

A map-based guide to where craft and forage materials grow across the contiguous
United States — by season, by habitat, and, uniquely, by the actual harvesting
rule for the land under each point. Made for teachers, foragers, and makers who
want to source materials responsibly.

**Occurrence is never permission.** Every point carries the rule for the land it
sits on, encoded from primary law (park compendiums, 36 CFR, state statutes,
USFS/BLM regulations); where a rule isn't known, the map says so. This
parcel-level rules layer is the thing Falling Fruit, iNaturalist, and
rockhounding maps don't have.

## The four maps

One map is active at a time; the legend categories and the season chart follow
your choice.

- **Food** — edible plants, fruit, nuts, and mushrooms. Backed by iNaturalist,
  Falling Fruit, NPS historic orchards, and deep NPS/state-park rule tables.
  Mushrooms follow a hard species-level edible whitelist (safety first).
- **Ink / Dye** — plants, trees, and fruits that make natural inks and dyes,
  organized by output color, plus 60 authored project recipes (chemistry,
  lightfastness, history, and waste-stream ethic).
- **Herbalism** — plants of the traditional materia medica. Educational
  reference to historical and traditional use only — not medical advice.
- **Minerals** — craft stone and minerals (pottery clay, carving stone,
  whetstone/knapping toolstone, lapidary material) from the USGS Mineral
  Resources Data System, with land-manager collecting rules. MRDS is a historic
  mining inventory; many localities are inactive or abandoned workings.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. There is no build step, framework, or package
manager — it is vanilla JS + Mapbox GL JS.

## Mapbox

Add a Mapbox public access token to `config.js`:

```js
window.FORAGE_CONFIG = {
  mapboxToken: "pk..."
};
```

The committed token is intentionally URL-scoped in the Mapbox account.

## Data sources

Live: iNaturalist API (research-grade observations), USGS PAD-US public-access
polygons. Cached/derived: Falling Fruit viewport chunks
(`data/falling-fruit/us/`, loaded lazily at zoom ≥ 8), USGS MRDS minerals
(`data/minerals-us.json`), NPS historic orchards, per-species phenology curves,
and Census-derived US boundaries. Access-rule summaries are hand-encoded from
primary sources — see `ATTRIBUTION.md` for every source, license, and caveat.

Regenerate derived data with the Python/Node generators in `scripts/`:

```sh
python3 scripts/build_falling_fruit_subset.py   # Falling Fruit chunks
python3 scripts/build_nps_orchards.py           # NPS historic orchards
```

Run the validation and rule-test suite before committing:

```sh
bash scripts/check.sh
```

## Safety and ethics

- Occurrence data is never harvest permission; the distinction is kept explicit
  in the UI, popups, and docs.
- No new mushroom/fungi taxa without a species-level edible whitelist.
- Herbalism content carries an educational-use disclaimer; it is preserved
  everywhere the mode appears.
- Data licenses (mostly CC BY-NC variants) are respected; every source is listed
  in `ATTRIBUTION.md`. Permission-required sources (e.g. NPS historic orchards)
  stay labeled that way.

## License

- **Code** — [PolyForm Noncommercial 1.0.0](LICENSE.md).
  Required Notice: Copyright © 2026 Sasson Rafailov (Craft Almanac)
- **Original content** (recipes, species notes, safety writing, docs) —
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/),
  matching the inbound data's terms. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Rules datasets** — the underlying legal facts are public and unrestricted;
  the prose summaries, verification notes, and compilation are CC BY-NC-SA 4.0,
  offered without warranty for educational use (see LICENSE-CONTENT.md).
- **Inbound data** — each source keeps its own license; see `ATTRIBUTION.md`.

See `ATTRIBUTION.md` for source links, license notes, and safety caveats, and
`docs/critique-remediation-plan.md` for the current improvement roadmap.
