# Phase 4 spec — Conditions (`work-order-redesign.md` §Phase 4)

**Status:** drafted 2026-06-13, after Phase 3 (3a–3e) landed and verified.
Phase 4 adds the live-conditions layer (sun, moon, rain, wind, tide, radar,
flush pulses) on top of the floating UI. All of Phase 4 is Claude's lane; data
deps are in: **C1** `data/tide-stations.json` (3,017 NOAA CO-OPS stations) and
**C3** `data/flush-thresholds.json` (per-species mm/72h, `ownerReview` flagged).

Already in place from earlier phases: the register engine (`sunAltitude`,
`computeRegister`, `applyRegister`, `syncLightPreset`), `state.location`
(defaults to CONUS center `[-98.6, 39.8]`), and the Phase-1 `.rail-seg` CSS
shell. Reference implementation is `prototype/index.html` rev 14 (owner-approved).

## The contract that governs every sub-phase

**Graceful degradation (the Phase 4 gate).** Conditions are strictly additive.
With every condition endpoint blocked, the site must be exactly as usable as it
was at end of Phase 3, with **zero console errors**. Therefore:

- Every fetch is wrapped in try/catch and is non-blocking; a failure leaves the
  relevant `state` field null and simply omits that rail segment/panel.
- **No fabricated data.** Unlike the prototype's "offline sample", production
  degrades to *absent* (the segment doesn't render), never to fake numbers.
- TTL caches (localStorage) reduce calls and survive brief outages; every live
  panel shows a SOURCE + data-age line so users can judge freshness.
- The map, popups, legend, season, and sheets never depend on conditions.

**Forecast location.** Conditions are computed for `state.location`. It updates
on (a) place search (the chosen geocode result) and (b) an explicit
"update to map area" control shown at zoom ≥ 8 (owner decision #3). Changing it
re-runs `applyRegister()` and refetches conditions. Default stays CONUS center.

**Non-negotiables.** Mushroom features (flush pulses) stay restricted to the
species-level edible whitelist (CLAUDE.md); C3 thresholds are `ownerReview`
heuristics and must be labeled as likelihood, never instruction. New sources are
already in `ATTRIBUTION.md` (Open-Meteo CC BY 4.0, NOAA CO-OPS, RainViewer).

## Endpoints (all keyless)

- **Open-Meteo** `api.open-meteo.com/v1/forecast` — `hourly=precipitation,
  cloud_cover,wind_speed_10m,wind_direction_10m&past_days=3&forecast_days=7&
  timezone=auto`. Drives rain-72h, wind, clouds, daily precip, picking windows.
- **NOAA CO-OPS** `api.tidesandcurrents.noaa.gov/api/prod/datagetter` —
  `product=predictions` for the nearest C1 station; high/low events + curve.
- **RainViewer** `api.rainviewer.com/public/weather-maps.json` → raster tiles;
  low-zoom precipitation layer (maxzoom ~6) with handoff to the existing
  aggregate/point layers.

## Sequencing (each sub-phase: own gate + `node --check` + version bump +
`decisions.md` entry + local commit, same discipline as Phase 3)

1. **4a — Rail foundation (sun/moon/rain/wind).** Floating `#conditions-rail`
   (`.floating` + `.rail-seg`). SUN (register + set time) and MOON (illum % +
   waxing/waning) from ported client astronomy (`sunTimes`, `moonPhase`) — no
   network, so they always render and prove the degradation path. Open-Meteo
   fetcher (`loadConditions`) adds RAIN 72H + WIND segments when data is present.
   Forecast location follows place search; periodic refresh (30 min TTL + on
   register tick). **Recommended start; lands the contract.**
2. **4b — Detail panels.** Click a segment → floating panel (`#rail-panel`):
   sun times (first light/rise/golden/set/dark), moon visualization, rain
   forecast + picking windows, wind. SOURCE + data-age line. "Update to map
   area" control (zoom ≥ 8).
3. **4c — Wind canvas.** Animated streak overlay at zoom ≥ 7.5, live wind
   vector, `prefers-reduced-motion` + tab-hidden aware, rail toggle, off by
   default on reduced-motion.
4. **4d — Tide.** Nearest CO-OPS station from C1 (haversine over 3,017 stations,
   cached), TIDE segment + tide-curve panel; only shown when a station is within
   a sane distance of the forecast location.
5. **4e — Radar + flush pulses.** RainViewer raster layer at low zoom with
   z-order handoff; flush pulses on fungal points gated on C3 thresholds **and**
   the existing mushroom whitelist + food mode + mushroom category selected.

## Gate (Phase 4 overall)

Kill-switch: with Open-Meteo/CO-OPS/RainViewer blocked, the site is fully usable
and console-clean; the rail shows only sun/moon. With endpoints live, the rail
and panels match authoritative sources for two test locations (one coastal for
tide). No new `KNOWN_ISSUES` entries from the conditions code.
