# Mapbox killswitch (emergency map shutdown)

If the site gets popular enough that Mapbox usage threatens real cost (there is
no spend cap on the Mapbox account), the map can be shut off in about a minute
without touching the repo, and the site degrades gracefully instead of looking
broken.

## Why this design

- Hiding the map behind a modal does NOT stop billing: Mapbox GL keeps
  fetching the style and tiles behind it, and every page load still counts as
  a billed map load. The only thing that stops spend is a dead token.
- Unauthorized (401) requests are not billed by Mapbox, so revoking the token
  stops spend immediately, even for visitors who already have the page open in
  a tab (their next tile/style request fails).
- The app is built to treat a dead token as a deliberate state: the basemap
  auth error triggers a full-screen "live map paused" takeover panel, and the
  Materials / Projects / About sheets (which never touch Mapbox) stay usable.

## To flip the killswitch (preferred path, ~1 minute, no deploy)

1. Log in at account.mapbox.com > Tokens.
2. Find the URL-scoped public token used by craftalmanac.com (it is the one in
   `config.js`).
3. Delete it (or rotate it, which kills the old value the same way).
4. Done. Within a minute or two, every visitor gets the paused takeover panel
   instead of a map, and Mapbox billing stops. No commit, no push, no deploy.

The site keeps working in degraded mode: masthead, Materials, Projects, and
About sheets all function. Only map-tied chrome (season bar, search,
conditions, legend, map switcher) retires with the map.

## Alternate path (requires a push)

Edit `config.js` and replace the token with any syntactically token-shaped but
invalid string (for example change a few trailing characters), then commit and
push. Same end state via the same 401 path. Do NOT set the token to an empty
string if you can avoid it: with no token at all, Mapbox GL throws during boot
and the app halts early; the site still shows the paused panel (a minimal
variant), but the sheets are not available in that state.

## To relaunch

1. Create a new public token in the Mapbox dashboard, URL-restricted to
   `craftalmanac.com` (and the beta workers.dev URL if still in use, see
   `docs/beta-deploys.md`).
2. Put it in `config.js`, commit, push (auto-deploys).
3. Visitors with a cached `config.js` recover on their next shell reload; the
   service worker precache rotates on the next asset-version bump, so bump
   `?v=` in `index.html` plus `ASSET_VERSION`/`CACHE_VERSION` in `sw.js` with
   the relaunch commit to force it.

## How the code handles it

- `app.js` `map.on("error")` (bottom of file): 401/403 shows the "paused"
  takeover immediately; 429/rate-limit shows a status line first and escalates
  to the "over capacity" takeover after 3 rate-limit errors, so one blipped
  tile never retires the map.
- `showMapTakeover()` (same section) builds the panel, hides map-tied UI via
  the `map-takeover-active` body class, and keeps the masthead sheet nav
  above the panel. Styles live at the bottom of `styles.css`.
- The no-token boot guard sits just above the `new mapboxgl.Map(...)` call.

## Longer term

The permanent fix for cost exposure is migrating the basemap to MapLibre GL
with a free/self-hosted tile source (OpenFreeMap, Protomaps). Tracked in the
launch-readiness notes; this killswitch is the bridge until then.
