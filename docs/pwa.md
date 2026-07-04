# Offline PWA (Phase 5.5)

Craft Almanac is a **field-first** tool: foraging and rockhounding happen
off-grid, with no signal. The safety + harvesting-rules layer must be reachable
there. This is the offline story.

## What ships

| File | Role |
| --- | --- |
| `manifest.webmanifest` | Install metadata (name, colors, icons, standalone display). |
| `sw.js` | Service worker: precache + runtime caching strategy. |
| `icons/icon.svg`, `icons/icon-maskable.svg` | App icons (SVG, dependency-free). |
| `scripts/build_pwa_icons.mjs` | Regenerates the icon SVGs from the favicon source. |
| `index.html` | `<link rel="manifest">`, apple meta tags, SW registration. |
| `app.js` | `initOfflineIndicator()` — the offline chip. |

Icons are **SVG**, not PNG, on purpose: this repo has no build step and no
package manager, so there is no rasterizer to emit PNGs. Web app manifests
accept `"type": "image/svg+xml"` icons, which stay crisp at every density and
keep the whole thing build-free. To change the icon, edit the favicon path in
`index.html`, mirror it in `scripts/build_pwa_icons.mjs`, and rerun the script.

## What's cached vs. not — and why

The design decision is: **cache the small, high-value safety layer, not the
~125 MB of basemap tiles and Falling Fruit chunks.** A phone in the field has
finite storage and the offline value is the shell + rules + safety, with the map
degrading gracefully to "offline — cached data only" when tiles cannot load.

**Precached on install** (`PRECACHE` in `sw.js`, ~1.7 MB total):

- App shell: `/`, `index.html`, `app.js`, `styles.css`, `config.js`,
  `manifest.webmanifest`, the two icon SVGs, and all self-hosted fonts.
- Safety + harvesting rules: `data/rules/*.json`, `data/usfs-forest-rules.json`,
  `data/local-jurisdictions.json`.
- Phenology: `data/phenology/{food,ink,medicine}.json`.
- Map-drawn boundaries + conditions: `data/tide-stations.json`,
  `data/flush-thresholds.json`, `data/contiguous-us-boundary.json`,
  `data/contiguous-us-states.json`, `data/nps-historic-orchards.json`.

Rule of thumb: precache anything the app fetches that is **≤ ~500 KB**.

**Deliberately NOT precached** (too large; loaded on demand when online, then
opportunistically served from the runtime cache if revisited):

- `data/minerals-us.json` (~1.2 MB)
- `data/project-recipes.json` (~972 KB, lazy-loaded on the Projects sheet)
- `data/falling-fruit/us/*` (chunks + manifest + status raster, ~94 MB)

**Never cached** (network-only, allowed to fail offline): the live/personal
APIs — iNaturalist, Open-Meteo, NOAA tides/weather, USGS PAD-US, and Mapbox
**geocoding** (search). These are live and/or carry the user's location.

## Runtime strategy per resource type

1. **Same-origin shell + data → cache-first.** Instant in the field, fully
   offline-capable. Navigations fall back to the precached app shell so a cold
   offline launch still boots. Same-origin files not in the precache list are
   cached on first successful fetch.
2. **Mapbox tiles / style / glyphs / sprites → network-first, cache fallback,
   silent miss.** Online users get fresh tiles; offline users get whatever was
   cached from a previous online session; a full miss returns a synthetic empty
   `504` so Mapbox GL treats the tile as simply absent and keeps rendering — the
   map shows "cached data only" rather than erroring.
3. **Live/personal APIs → network-only, never cached.** They fail offline; the
   app already falls back conservatively when they do.

## Bumping `CACHE_VERSION` on deploy

When you change **any precached file** (the app shell or a precached data file),
bump `CACHE_VERSION` in `sw.js` (e.g. `v1-phase5-pwa-1` → `v2-...`). On
`activate` the worker deletes every `craft-almanac-*` cache that is not the
current one, cleanly evicting stale assets.

Also keep these three in sync per deploy (they all encode the same version):

- `CACHE_VERSION` / `ASSET_VERSION` in `sw.js`
- the `?v=` query strings on `app.js` and `styles.css` in `index.html`

The `?v=` strings bust the HTTP cache for those two files; `ASSET_VERSION` in
`sw.js` makes the precache store the exact versioned URLs the page requests.

## "Save this area" — follow-up stub

User-triggered viewport tile caching ("save this area") is a **follow-up**, not
part of this task. The seam is already in place: `sw.js` has a `message` handler
that recognizes `{ type: "CACHE_AREA", ... }` and currently replies
`{ ok: false, reason: "not-implemented" }`. When implemented it will enumerate
the tile URLs for the current viewport + zoom range and pre-warm them into the
cache **with a hard size cap** so it never approaches the full basemap. See the
`TODO(phase5.5-followup)` comment in `sw.js`.
