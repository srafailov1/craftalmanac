/*
 * Craft Almanac — service worker (Phase 5.5, field-first offline PWA)
 * ===================================================================
 *
 * Why this exists: foraging and rockhounding happen off-grid, with no signal.
 * The safety + harvesting-rules layer MUST be reachable there. So we cache the
 * small, high-value app shell + safety/rules/phenology data on install, and the
 * map degrades gracefully to "offline — cached data only" when Mapbox tiles
 * cannot load.
 *
 * DELIBERATE CACHING STRATEGY (see docs/pwa.md for the full rationale):
 *
 *   1. Same-origin shell + data  → CACHE-FIRST.
 *        Precached on install (the PRECACHE list below). Instant in the field
 *        and fully offline-capable. Runtime cache-first also picks up any
 *        same-origin file we did not precache (e.g. a data file added later),
 *        caching it on first successful fetch.
 *
 *   2. Mapbox style / tiles / glyphs / sprites / fonts  → NETWORK-FIRST,
 *        falling back to cache. Online users always get fresh tiles; offline
 *        users get whatever was cached from a previous online session; a tile
 *        MISS fails silently (we return a synthetic empty 504 rather than an
 *        error, so Mapbox GL treats it as an absent tile and the map keeps
 *        working with whatever it has). We deliberately DO NOT precache tiles —
 *        the full basemap is ~125 MB of remote data. Caching the small safety
 *        layer, not the tiles, is the whole point.
 *
 *   3. Live/personal APIs (iNaturalist, Open-Meteo, NOAA/tides, USGS PAD-US,
 *        Mapbox geocoding) → NEVER cached, NETWORK-ONLY. These are live and/or
 *        personal (they carry the user's location). Let them fail offline; the
 *        app already falls back conservatively when they do.
 *
 * BUMP `CACHE_VERSION` on every deploy that changes any precached file (the app
 * shell or a precached data file). On activate we delete every cache whose name
 * does not match the current version, so a bump cleanly evicts stale assets.
 * The app.js / styles.css `?v=` query strings are also bumped per deploy, which
 * additionally busts the HTTP cache for those two files.
 */

const CACHE_VERSION = "v1-phase5-teaching-1";
const CACHE_NAME = `craft-almanac-${CACHE_VERSION}`;

// Cache-busting query strings for the shell scripts/styles. Keep these in sync
// with index.html's ?v= query strings so the precache stores the exact URLs the
// page requests (a mismatch would silently precache a URL the page never asks
// for, leaving the real request to fall through to the network).
const ASSET_VERSION = "phase5-teaching-1";

// --- Precache list: the app shell + the small, off-grid-critical data. --------
// Rule of thumb: precache anything <= ~500 KB that the app fetches. Explicitly
// EXCLUDED (too large for the field precache; loaded on demand when online):
//   - data/minerals-us.json          (~1.2 MB)
//   - data/project-recipes.json      (~972 KB, lazy-loaded on the Projects sheet)
//   - data/falling-fruit/us/*        (chunks + manifest + status raster, ~94 MB)
// These still work via runtime cache-first once fetched online, they just are
// not guaranteed available on a cold offline start. Total precache is ~1.7 MB.
const PRECACHE = [
  // App shell (navigations resolve to "/"; index.html is the same document).
  "/",
  "/index.html",
  `/app.js?v=${ASSET_VERSION}`,
  `/styles.css?v=${ASSET_VERSION}`,
  // config.js is committed (public, URL-scoped Mapbox token) so it precaches
  // fine and the map can construct even offline (tiles just will not paint).
  "/config.js",
  "/manifest.webmanifest",

  // Icons (SVG; used by the manifest + apple-touch-icon).
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",

  // Fonts (self-hosted woff2; the display serif + UI/mono faces).
  "/fonts/fraunces/Fraunces-Display.woff2",
  "/fonts/fraunces/Fraunces-Display-Italic.woff2",
  "/fonts/public-sans/PublicSans-Regular.woff2",
  "/fonts/public-sans/PublicSans-Medium.woff2",
  "/fonts/public-sans/PublicSans-SemiBold.woff2",
  "/fonts/public-sans/PublicSans-Bold.woff2",
  "/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2",
  "/fonts/ibm-plex-mono/IBMPlexMono-Medium.woff2",

  // Safety + harvesting rules — the reason this PWA exists.
  "/data/rules/nps-gathering-rules.json",
  "/data/rules/site-access-rules.json",
  "/data/rules/mineral-access-rules.json",
  "/data/usfs-forest-rules.json",
  "/data/local-jurisdictions.json",

  // Phenology (per-mode "in season" curves).
  "/data/phenology/food.json",
  "/data/phenology/ink.json",
  "/data/phenology/medicine.json",

  // Conditions + boundaries the map draws locally.
  "/data/tide-stations.json",
  "/data/flush-thresholds.json",
  "/data/contiguous-us-boundary.json",
  "/data/contiguous-us-states.json",
  "/data/nps-historic-orchards.json",
];

// --- Host classification ------------------------------------------------------

// Mapbox map assets (basemap style, vector/raster tiles, glyphs, sprites). These
// get network-first + cache fallback + silent miss. NOTE: api.mapbox.com also
// serves geocoding (/geocoding/v5/...) which is a live/personal API — handled by
// isLiveApi() below and excluded from tile caching.
const MAPBOX_TILE_HOSTS = [
  "api.mapbox.com",
  "a.tiles.mapbox.com",
  "b.tiles.mapbox.com",
  "c.tiles.mapbox.com",
  "d.tiles.mapbox.com",
  "events.mapbox.com",
];

// Live/personal APIs — NEVER cached; allowed to fail offline.
const LIVE_API_HOSTS = [
  "api.inaturalist.org",
  "api.open-meteo.com",
  "api.weather.gov",
  "tidesandcurrents.noaa.gov",
  "api.tidesandcurrents.noaa.gov",
  "services.arcgis.com", // USGS PAD-US ArcGIS
  "gis1.usgs.gov",
];

function isMapboxTile(url) {
  if (!MAPBOX_TILE_HOSTS.includes(url.hostname)) return false;
  // Mapbox geocoding is a live/personal API, not a tile — exclude it here so it
  // is treated as network-only by isLiveApi().
  if (url.pathname.startsWith("/geocoding/")) return false;
  return true;
}

function isLiveApi(url) {
  if (LIVE_API_HOSTS.includes(url.hostname)) return true;
  // Mapbox geocoding (search) is live/personal.
  if (url.hostname === "api.mapbox.com" && url.pathname.startsWith("/geocoding/")) return true;
  return false;
}

// --- Install: precache the shell + small data --------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Add individually so one 404 (e.g. a renamed data file) does not abort
      // the entire precache — the rest of the offline safety layer still lands.
      await Promise.allSettled(
        PRECACHE.map(async (url) => {
          try {
            // cache: "reload" bypasses the HTTP cache so install always stores
            // the freshest bytes for the current deploy.
            const response = await fetch(new Request(url, { cache: "reload" }));
            if (response.ok) await cache.put(url, response.clone());
          } catch {
            /* offline during install, or a missing file — skip it */
          }
        })
      );
      // Activate this SW immediately on first install so the offline layer is
      // available without requiring a second navigation.
      await self.skipWaiting();
    })()
  );
});

// --- Activate: drop old caches, take control ---------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("craft-almanac-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// --- Fetch routing -----------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET; POST/PUT (analytics beacons, etc.) pass straight through.
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // 3. Live/personal APIs: never touched by the SW — straight to the network,
  //    fail naturally when offline.
  if (isLiveApi(url)) return;

  // 2. Mapbox tiles/style/glyphs: network-first, cache fallback, silent miss.
  if (isMapboxTile(url)) {
    event.respondWith(mapboxNetworkFirst(request));
    return;
  }

  // 1. Same-origin shell + data: cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(sameOriginCacheFirst(request));
    return;
  }

  // Anything else cross-origin we do not recognize: leave to the browser.
});

// Cache-first for same-origin shell/data. Navigation requests fall back to the
// precached app shell ("/") so a cold offline launch still boots the app.
async function sameOriginCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;

  // For navigations, any cached app-shell entry is a valid response (the app is
  // a single page; the URL hash carries state and is not part of the request).
  if (request.mode === "navigate") {
    const shell = (await cache.match("/index.html")) || (await cache.match("/"));
    if (shell) {
      // Refresh the shell in the background when online (stale-while-revalidate
      // for the document only), but return the cached copy immediately.
      fetchAndCache(request, cache).catch(() => {});
      return shell;
    }
  }

  try {
    const response = await fetch(request);
    // Cache successful same-origin GETs we did not precache (basic responses
    // only — opaque/error responses are not worth persisting).
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not cached. Last-ditch: hand back the app shell for a
    // navigation; otherwise a network error is the honest answer.
    if (request.mode === "navigate") {
      const shell = (await cache.match("/index.html")) || (await cache.match("/"));
      if (shell) return shell;
    }
    return Response.error();
  }
}

async function fetchAndCache(request, cache) {
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
  }
  return response;
}

// Network-first for Mapbox map assets: fresh tiles when online, cached tiles
// when offline, and a SILENT empty response on a full miss so a tile gap does
// not surface as a hard error inside Mapbox GL.
async function mapboxNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Tiles/glyphs are large but bounded per session; cache successful ones so
      // a previously-visited area still renders offline. (This is NOT the "save
      // this area" feature — it is opportunistic caching of what was viewed.)
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Silent miss: 504 with an empty body. Mapbox GL treats a non-2xx tile as
    // simply absent and keeps rendering the rest of the map, so the offline map
    // shows "cached data only" instead of throwing.
    return new Response("", {
      status: 504,
      statusText: "Offline — tile not cached",
    });
  }
}

// --- Message handler ---------------------------------------------------------
// FOLLOW-UP STUB (Phase 5.5 scope note): user-triggered "save this area"
// viewport tile caching lands here. The plan is a message of the shape
// { type: "CACHE_AREA", bbox: [w,s,e,n], minZoom, maxZoom, styleUrl } that
// enumerates the tile URLs for the current viewport/zoom range and pre-warms
// them into CACHE_NAME (with a hard cap so we never approach the full 125 MB
// basemap). Intentionally NOT implemented in this task — see docs/pwa.md
// ("save this area" follow-up). Left as an explicit stub so the seam is obvious.
self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "CACHE_AREA") {
    // TODO(phase5.5-followup): enumerate + pre-warm viewport tiles into
    // CACHE_NAME with a size cap. See docs/pwa.md. Acknowledge for now.
    event.ports?.[0]?.postMessage({ ok: false, reason: "not-implemented" });
    return;
  }
  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
