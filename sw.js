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
 *      NAVIGATIONS are handled separately (see the fetch router): ONLY the app
 *      shell ("/" and "/index.html") is served network-first with a precached
 *      shell fallback. Navigations to standalone content pages (/materials/*,
 *      /projects/*, /cards/*, /attribution.html) are NOT intercepted at all —
 *      they go straight to the network so the browser handles Cloudflare's
 *      ".html" -> extensionless 307 itself. The SW must never hand a redirected
 *      response back to a navigation (that is a network error in every engine —
 *      it was the Chrome-only "This site can't be reached" bug).
 *
 *   2. Mapbox style / tiles / glyphs / sprites / fonts  → NETWORK-FIRST,
 *        falling back to cache. Online users always get fresh tiles; offline
 *        users get whatever was cached from a previous online session; a tile
 *        MISS fails silently (we return a synthetic empty 504 rather than an
 *        error, so Mapbox GL treats it as an absent tile and the map keeps
 *        working with whatever it has). We deliberately DO NOT precache tiles —
 *        the full basemap is ~125 MB of remote data. Caching the small safety
 *        layer, not the tiles, is the whole point.
 *        Cached Mapbox entries EXPIRE AFTER 30 DAYS (Mapbox Product Terms
 *        §2.8.1 caps on-device caching of Licensed Map Content at 30 days):
 *        each put is stamped with a save-time header, expired entries are
 *        treated as misses at read time, and sweeps clear them in bulk.
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

const CACHE_VERSION = "v1-onboard-1";
const CACHE_NAME = `craft-almanac-${CACHE_VERSION}`;

// User-saved offline areas ("save this area", Phase 5.5). DELIBERATELY not
// keyed to CACHE_VERSION: the activate cleanup rotates CACHE_NAME on every
// deploy, and a field user's saved area must survive app updates. The page
// owns writes to this cache (app.js saveCurrentOfflineArea, same constant);
// the SW only reads it as a fallback after a CACHE_NAME miss.
const SAVED_AREAS_CACHE = "craft-almanac-saved-areas-v1";

// Cache-busting query strings for the shell scripts/styles. Keep these in sync
// with index.html's ?v= query strings so the precache stores the exact URLs the
// page requests (a mismatch would silently precache a URL the page never asks
// for, leaving the real request to fall through to the network).
const ASSET_VERSION = "onboard-1";

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

  // Phenology (per-mode region-keyed "in season" curves) + the Köppen region map
  // that selects a species' regional curve from the viewport (Phase 5.3).
  "/data/phenology/food.json",
  "/data/phenology/ink.json",
  "/data/phenology/medicine.json",
  "/data/phenology-regions.json",

  // Conditions + boundaries the map draws locally.
  "/data/tide-stations.json",
  "/data/flush-thresholds.json",
  "/data/contiguous-us-boundary.json",
  "/data/contiguous-us-states.json",
  "/data/nps-historic-orchards.json",
];

// Pathname view of the precache list (query strings stripped) so the fetch
// router can tell precached files (cache-first, rotated by CACHE_VERSION
// bumps) from non-precached bulk data (network-first — see router 1c).
const PRECACHED_PATHS = new Set(PRECACHE.map((entry) => entry.split("?")[0]));

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

// Mapbox Product Terms §2.8.1 (June 17, 2026 version) permits on-device caching
// of Licensed Map Content for a MAXIMUM OF 30 DAYS. Every Mapbox entry we
// cache is stamped with this save-time header at put (the upstream Date header
// is not reliably exposed on cross-origin responses), and any entry older than
// 30 days is treated as a miss at read time and swept in bulk on activate /
// SW startup. A fresh network fetch re-stamps the entry, so the window runs
// from the last successful download.
const MAPBOX_CACHED_AT_HEADER = "x-ca-cached-at";
const MAPBOX_TILE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

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

// Is this same-origin URL the single-page app shell itself? ONLY "/" and
// "/index.html" are the SPA — everything else same-origin (/materials/*,
// /projects/*, /cards/*, /attribution.html, and any future standalone tree) is a
// genuine server-rendered document that must reach the network, not the shell.
//
// This is why it must be an exact allow-list, not a prefix deny-list: the shell
// fallback is what makes a cold OFFLINE launch boot the map, but it MUST NOT be
// substituted for a content-page navigation (that both serves the wrong page AND,
// because those pages 307-normalize ".html" -> extensionless on Cloudflare, risks
// the SW handing a redirected response to a navigation — which Chrome aborts as
// net::ERR_FAILED). Keeping the shell scoped to "/" leaves content navigations to
// the browser's own clean 307 -> 200 path (identical to a no-SW client).
function isAppShellNavigation(url) {
  return url.pathname === "/" || url.pathname === "/index.html";
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
            if (response.ok) {
              // Never store a redirected response: Cloudflare 307s /index.html
              // -> "/", and a cached redirected response served to a navigation
              // is a network error in every engine. Rebuild it as a clean 200
              // from the same bytes (the Workbox copyResponse pattern).
              const clean = response.redirected
                ? new Response(await response.arrayBuffer(), {
                    status: 200,
                    headers: response.headers,
                  })
                : response.clone();
              await cache.put(url, clean);
            }
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
          .filter((name) => name.startsWith("craft-almanac-") && name !== CACHE_NAME && name !== SAVED_AREAS_CACHE)
          .map((name) => caches.delete(name))
      );
      // Evict Mapbox entries past the 30-day cap (Mapbox Product Terms §2.8.1).
      // Mostly relevant when the cache survived the deploy (CACHE_VERSION
      // unchanged); read-time expiry in mapboxNetworkFirst is the backstop.
      await sweepExpiredMapboxEntries().catch(() => {});
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

  if (url.origin === self.location.origin) {
    // 1a. Navigations to STANDALONE content pages (/materials/*, /projects/*,
    //     /cards/*, /attribution.html, and any future tree): DO NOT intercept.
    //     Let the browser handle them exactly as a no-SW client would — including
    //     Cloudflare's ".html" -> extensionless 307. If the SW instead followed
    //     that redirect and returned the result, the browser would reject the
    //     whole navigation: a redirected/opaque-redirect response for a
    //     manual-redirect navigation is a network error in every engine (Chrome
    //     surfaces it as "This site can't be reached"). Passing through — no
    //     respondWith — means the SW never touches these navigations, so they can
    //     never fail at the redirect boundary. Offline, the browser shows its own
    //     offline page for these; that is acceptable because the off-grid-critical
    //     surface is the map shell, which stays precached (handled in 1b).
    if (request.mode === "navigate" && !isAppShellNavigation(url)) {
      return;
    }

    // 1b. The SPA shell navigation ("/" or "/index.html"): network-first so an
    //     online user gets the freshest document, with the precached shell as the
    //     offline fallback that boots the map on a cold offline launch.
    if (request.mode === "navigate") {
      event.respondWith(appShellNavigation(request));
      return;
    }

    // 1c. Non-precached bulk data (Falling Fruit chunks/manifest/status raster,
    //     minerals, project recipes): NETWORK-FIRST. These bake access-status
    //     fields but are not precached, so a chunks-only data deploy never
    //     rotates CACHE_NAME — cache-first would pin stale safety data for
    //     online users indefinitely. Network-first keeps online users fresh
    //     (the browser HTTP cache still absorbs repeats) while the runtime +
    //     saved-areas caches keep the offline fallback.
    if (url.pathname.startsWith("/data/") && !PRECACHED_PATHS.has(url.pathname)) {
      event.respondWith(dataNetworkFirst(request));
      return;
    }

    // 1d. All other same-origin GETs (app.js, styles.css, fonts, precached
    //     data files): cache-first.
    event.respondWith(sameOriginCacheFirst(request));
    return;
  }

  // Anything else cross-origin we do not recognize: leave to the browser.
});

// Navigation handler for the app shell ONLY ("/" and "/index.html"). Cache-first
// with background revalidate (stale-while-revalidate) so a cold launch boots the
// map INSTANTLY from the precache — critical on the slow/flaky field connections
// this PWA exists for — and refreshes the document in the background when online.
// Never resolves a navigation with a redirected response: the precached shell is
// non-redirected, and the network path (only taken when nothing is cached) rebuilds
// a clean response if it ever followed a redirect (a redirected response for a
// navigation is a network error in every engine — the bug this whole change fixes).
async function appShellNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached =
    (await cache.match(request, { ignoreSearch: false })) ||
    (await cache.match("/index.html")) ||
    (await cache.match("/"));

  if (cached) {
    // Return the cached shell immediately; refresh it in the background. The
    // revalidate is fire-and-forget and can never reject the returned navigation.
    (async () => {
      try {
        const fresh = await fetch(request);
        if (fresh.ok && fresh.type === "basic" && !fresh.redirected) {
          await cache.put(request, fresh.clone());
        }
      } catch {
        /* offline — keep the cached shell */
      }
    })();
    // Belt-and-braces for caches poisoned before the install-time redirect
    // scrub existed: never hand a redirected response to a navigation.
    if (cached.redirected) {
      return new Response(await cached.arrayBuffer(), {
        status: 200,
        headers: cached.headers,
      });
    }
    return cached;
  }

  // Nothing cached yet (pre-install or evicted): go to the network, but never
  // hand a redirected response back to the navigation.
  try {
    const response = await fetch(request);
    if (response.redirected) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return Response.error();
  }
}

// Cache-first for same-origin, NON-navigation requests (app.js, styles.css,
// fonts, and the precached + runtime-cached data files). Navigations never reach
// here — they are routed to appShellNavigation() or passed through to the browser
// by the fetch handler above.
async function sameOriginCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  // Honor explicit freshness requests: "save this area" fetches with
  // cache:"no-cache" so a save snapshots TODAY'S data — serving it the runtime
  // copy here would silently enshrine stale bytes (chunk files are not
  // precached, so a chunks-only data deploy never rotates CACHE_NAME).
  const wantsFresh = request.cache === "no-cache" || request.cache === "reload";
  const cached = wantsFresh ? null : await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Cache successful same-origin GETs we did not precache (basic responses
    // only — opaque/error responses are not worth persisting).
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    // A fetch that demanded freshness (cache:"no-cache" — the "save this area"
    // snapshot path) must FAIL here, not fall back: serving a months-old saved
    // copy would let a failed re-save silently re-register stale access data
    // as a fresh snapshot. The save flow's retry/abort path reports honestly.
    if (wantsFresh) return Response.error();
    // Network failed. Before giving up, check the user's saved offline areas
    // ("save this area"). ORDER MATTERS for safety: the saved-areas cache never
    // rotates, so it must only ever serve as an OFFLINE fallback — if it were
    // checked before the network, a months-old save could keep shadowing fresh
    // data (including updated access rules) for an online user.
    const savedAreas = await caches.open(SAVED_AREAS_CACHE);
    const savedCopy = await savedAreas.match(request, { ignoreSearch: false });
    if (savedCopy) return savedCopy;
    // Offline and not cached: a network error is the honest answer for a
    // subresource (the app degrades gracefully when a data file is absent).
    return Response.error();
  }
}

// Network-first for non-precached /data/ files (see router 1c). Fresh bytes
// when online; offline falls back to the runtime cache, then the user's saved
// areas — the same safe order as sameOriginCacheFirst's failure path.
async function dataNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const wantsFresh = request.cache === "no-cache" || request.cache === "reload";
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    // Freshness-demanding fetches (the save-area snapshot path) fail honestly.
    if (wantsFresh) return Response.error();
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    const savedAreas = await caches.open(SAVED_AREAS_CACHE);
    const savedCopy = await savedAreas.match(request, { ignoreSearch: false });
    if (savedCopy) return savedCopy;
    return Response.error();
  }
}

// Sweep-once-per-SW-startup latch for mapboxNetworkFirst below.
let mapboxSweepKicked = false;

// Network-first for Mapbox map assets: fresh tiles when online, cached tiles
// when offline (if saved within the last 30 days — see MAPBOX_TILE_MAX_AGE_MS),
// and a SILENT empty response on a full miss so a tile gap does not surface as
// a hard error inside Mapbox GL.
async function mapboxNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  // The activate sweep only runs on deploys, but SW startups happen constantly;
  // sweeping once per startup keeps entries an online user never re-reads from
  // outliving the 30-day cap between deploys.
  if (!mapboxSweepKicked) {
    mapboxSweepKicked = true;
    sweepExpiredMapboxEntries().catch(() => {});
  }
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Tiles/glyphs are large but bounded per session; cache successful ones so
      // a previously-visited area still renders offline. (This is NOT the "save
      // this area" feature — it is opportunistic caching of what was viewed.)
      putStampedMapboxEntry(cache, request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      if (isFreshMapboxEntry(cached)) return cached;
      // Older than 30 days (or unstamped): §2.8.1 says it must not be served.
      // Delete it and fall through to the synthetic miss below.
      cache.delete(request).catch(() => {});
    }
    // Silent miss: 504 with an empty body. Mapbox GL treats a non-2xx tile as
    // simply absent and keeps rendering the rest of the map, so the offline map
    // shows "cached data only" instead of throwing.
    return new Response("", {
      status: 504,
      statusText: "Offline — tile not cached",
    });
  }
}

// Store a Mapbox response stamped with the save time. Rebuilding the response
// is required to add the header (fetched Response headers are immutable), and
// buffering the body is fine — tiles/glyphs/sprites are individually small.
async function putStampedMapboxEntry(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.set(MAPBOX_CACHED_AT_HEADER, String(Date.now()));
  const body = await response.arrayBuffer();
  await cache.put(
    request,
    new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  );
}

// An entry is servable only if its save-time stamp proves it is within the
// 30-day window. Missing/garbled stamps and future timestamps (a clock that
// moved backwards) cannot prove that, so they count as expired.
function isFreshMapboxEntry(cachedResponse) {
  const cachedAt = Number(cachedResponse.headers.get(MAPBOX_CACHED_AT_HEADER));
  if (!Number.isFinite(cachedAt)) return false;
  const age = Date.now() - cachedAt;
  return age >= 0 && age <= MAPBOX_TILE_MAX_AGE_MS;
}

// Bulk-delete expired Mapbox entries. Runs on activate and once per SW
// startup; read-time expiry in mapboxNetworkFirst remains the backstop.
async function sweepExpiredMapboxEntries() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  await Promise.all(
    requests.map(async (request) => {
      let url;
      try {
        url = new URL(request.url);
      } catch {
        return;
      }
      if (!isMapboxTile(url)) return;
      const cached = await cache.match(request);
      if (cached && !isFreshMapboxEntry(cached)) {
        await cache.delete(request);
      }
    })
  );
}

// --- Message handler ---------------------------------------------------------
// "Save this area" (Phase 5.5) SHIPPED page-side, not here: app.js
// (saveCurrentOfflineArea) enumerates the Falling Fruit chunk files covering
// the current viewport from the manifest and writes them into
// SAVED_AREAS_CACHE with the window Cache API — the page owns the progress UI,
// the per-area registry (localStorage), and removal. The SW's only roles are
// (a) excluding SAVED_AREAS_CACHE from the activate cleanup so saves survive
// deploys, and (b) reading it as the offline fallback in sameOriginCacheFirst.
// Basemap tiles are deliberately NOT bulk-prefetched (Mapbox GL JS terms;
// offline map packs are a mobile-SDK feature) — mapboxNetworkFirst's
// opportunistic caching of browsed tiles is the whole basemap story.
self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
