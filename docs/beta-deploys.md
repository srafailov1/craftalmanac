# Beta deploys (craftalmanac-beta)

A second Cloudflare Worker, `craftalmanac-beta`, serves the site from the LOCAL
WORKING TREE so work-in-progress can be checked live before anything is pushed
to production. It exists because the Mapbox token is URL-scoped: local previews
on ports other than 4173 (and any origin not on the token allowlist) get 403s
on basemap tiles and geocoding, so "does it look right on a real map" can only
be answered on an allowlisted URL.

## The two-track model

- **Production** — `wrangler.jsonc`, worker `craftalmanac`, craftalmanac.com.
  Deploys ONLY via the Cloudflare git integration when `main` is pushed.
  Nothing in this doc touches it.
- **Beta** — `wrangler.beta.jsonc`, worker `craftalmanac-beta`, stable
  workers.dev URL. Deploys ONLY by running the command below, from whatever is
  in the working tree at that moment (committed or not).

## Deploying to beta

```
npx wrangler deploy --config wrangler.beta.jsonc
```

- Requires the owner's Cloudflare OAuth login (`npx wrangler whoami` to check).
- The first deploy uploads the full asset tree (~12k files); later deploys
  upload only changed files and take seconds.
- `.assetsignore` applies to beta exactly as to production.

## How beta differs from production (by design)

- `run_worker_first: true` + `BETA` var: every response gets
  `X-Robots-Tag: noindex` (stamped in `worker.js`, guarded by `env.BETA`) so
  the staging copy never competes with craftalmanac.com in search. Production
  never sets `BETA` and keeps assets-first serving.
- The report form's rate limiter uses its own namespace (`1002`) so beta
  testing can't consume production's per-IP budget. Report emails still go to
  reports@craftalmanac.com.

## One-time setup (owner)

The beta URL must be on the Mapbox token's URL allowlist or the basemap will
403 exactly like an un-allowlisted local port: Mapbox account → Tokens → the
site's public token → add the beta origin (the workers.dev URL printed by the
deploy). Until then, beta serves everything except Mapbox tiles/geocoding.

## Checklist before pushing main

Beta is a preview, not a gate replacement: `bash scripts/check.sh` still has to
pass before committing, and the owner still reviews and pushes `main` to
release. Deploying beta never deploys production, and vice versa.
