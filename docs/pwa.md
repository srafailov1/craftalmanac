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
   map shows "cached data only" rather than erroring. Cached Mapbox entries
   expire after **30 days** (Mapbox Product Terms §2.8.1 caps on-device caching
   of Licensed Map Content at 30 days): each entry is stamped with a save-time
   header on write, expired entries count as misses on read, and sweeps on
   activate / SW startup evict them in bulk.
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

## "Save this area" — SHIPPED (Phase 5.5 complete)

User-triggered offline areas are live, implemented **page-side** (app.js) rather
than via the originally-stubbed SW message:

- **UI**: a download-glyph map control in the bottom-right cluster (next to
  zoom/geolocate) toggles the `#offline-panel` floating panel — save button with
  a live pre-save estimate (files/~MB for the current view), progress while
  saving, a list of saved areas (tap to fly there, Remove to evict), storage
  usage, and honest scope notes.
- **What a save stores**: the Falling Fruit chunk files intersecting the current
  viewport, plus the manifest and status raster the layer needs to boot cold.
  Records carry their access status inline (`accessClass`/`publicLand`/
  `accessNote`), so the rules layer works offline. Hard cap
  `SAVE_AREA_MAX_CHUNKS = 400` (~12 MB) — never the full ~82 MB corpus; a
  too-wide view disables the button with a "zoom in" hint.
- **Where it lives**: the dedicated `craft-almanac-saved-areas-v1` cache
  (`SAVED_AREAS_CACHE` in sw.js = `SAVED_AREAS_CACHE_NAME` in app.js — keep them
  in sync). It is **excluded from the activate cleanup**, so saves survive
  deploys, and the SW reads it **only as an offline fallback** after a network
  failure — an online session always prefers fresh data, so an old save can
  never shadow updated access rules. Per-area registry in localStorage
  (`craftalmanac.savedAreas.v1`); removal only evicts chunks no other saved
  area still claims.
- **Deliberately out of scope**: bulk-prefetching basemap tiles (Mapbox GL JS
  terms — offline map packs are a mobile-SDK feature). Browsing the area online
  opportunistically caches its tiles via `mapboxNetworkFirst`; the panel tells
  the user to pan the area once before going out. Live iNaturalist points and
  PAD-US public-land shading remain online-only, and the panel says so.
- `navigator.storage.persist()` is requested on first save (best-effort) so the
  browser is less likely to evict field data under storage pressure.
- **Fresh saves**: the save fetches with `cache: "no-cache"`, and
  `sameOriginCacheFirst` bypasses its runtime-cache lookup for such requests —
  a save snapshots save-day bytes, never whatever CACHE_NAME held from an
  earlier session (chunk files are not precached, so a chunks-only data deploy
  would otherwise never refresh them). Failed saves evict the chunks they wrote
  (unless another area claims them) so the never-rotating cache can't
  accumulate orphans.
- **Offline chunk tolerance**: `loadFallingFruit` uses `Promise.allSettled` and
  renders whichever chunks resolve — offline, a viewport straddling the edge of
  a saved area shows the saved sites instead of blanking the layer because one
  out-of-save chunk failed. It still throws (→ "source unavailable" reporting)
  only when every chunk fails.
