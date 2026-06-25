<!-- Research/scoping doc - produced 2026-06-25. Nothing here is shipped to the site. Generated via a multi-agent source-vetting pass; license/access claims were checked against the original terms pages. -->

# Stone & Mineral Data Sources for the Objects/3D Map — Findings

**Question answered:** Are there existing sites/repositories to source stone & mineral locality points for a Craft Almanac "Objects / 3D materials" map, and what is the licensing/permission picture?

**Short answer:** Yes. A clean, license-safe stack exists — but it is two separate layers that must never be conflated: (1) **public-domain USGS locality points** as a curated seed, under (2) a **hand-built federal+state permission overlay**. The best-coverage source (Mindat) is *not* legally importable today. "Occurrence is never permission" applies in full.

---

## 1. Ranked — usable LOCALITY data sources

Ranked by fitness for *this* project (license-clean + geolocated + cacheable + craft-relevant). "Fit" weighs all four.

| Rank | Source | Covers | Access | License | Fit |
|---|---|---|---|---|---|
| 1 | **USGS MRDS** (Mineral Resources Data System) | US mines/prospects/occurrences incl. soapstone/steatite, gypsum (=alabaster), serpentine; chert/obsidian/novaculite only via free-text fields | Bulk download (shapefile ~10MB, CSV ~23MB), WFS 1.1.0 / WMS 1.3.0, **no key**. Convert to GeoJSON offline | **US Public Domain** (Use/Access Constraints "none") | **Strong** — primary craft-stone import |
| 2 | **USGS USMIN** Mineral Deposit Database | Curated mine-feature points + districts, topo-digitized; economic/critical-mineral focus | Per-state bulk download (GDB/shapefile) on ScienceBase, **no key** | **US Public Domain** | Moderate — secondary/hazard overlay, few craft leads |
| 3 | **Washington Geological Survey** (WA DNR) Mines & Minerals | WA-only mine/mineral points, aggregate, geochem | Bulk download (Esri GDB only → convert), REST services, **no key** | **Attribution-only open** (CC-BY-equivalent; commercial + adapt explicitly granted) | Moderate — WA regional supplement |
| 4 | **Oregon DOGAMI MILO** | OR-only mineral occurrences/mines/prospects | Bulk GDB + live ArcGIS REST, **no key** | **AMBIGUOUS** — disclaimers only, no open grant → must clear with DOGAMI in writing | Moderate, blocked on license |
| 5 | **California CGS / Dept. of Conservation** (SMARA MLC) | CA-only; resource-significance polygons + some mine points | data.ca.gov GeoJSON/shapefile + REST | **Per-layer**: data.ca.gov MLC entries are **CC-BY**; ArcGIS-hub viewer layers unconfirmed | Weak — wrong shape; MRDS covers CA in PD |
| 6 | **OSM `landuse=quarry`** (Overpass/Geofabrik) | Active/disused quarries, mostly commercial construction stone | Overpass (no key, fair-use) or bulk extract → cache GeoJSON | **ODbL 1.0 share-alike** (usable; record distinctly) | Weak — commercial quarries, craft materials essentially untagged |

**Not importable (best coverage, fails the gate):**

| Source | Covers | Why excluded |
|---|---|---|
| **Mindat.org** (main DB) | Largest craft-stone locality DB (chert/obsidian/novaculite/soapstone/alabaster) | All-rights-reserved compilation copyright; no archiving/copying non-trivial portions; Cloudflare 403 to fetch. **Link-only.** |
| **OpenMindat API** | Same DB, machine-readable | Beta: "**not yet licensed for redistribution… private, non-commercial use only**." No-redistribution is the blocker. Re-check after promised CC BY-NC-SA launch. |
| **IAOS Obsidian Source Catalog** / **NWROSL obsidianlab.com** | Best US geologic obsidian-source coordinates that exist | All-rights-reserved, web-only, scrape-prohibited; private/commercial entity. Carries its own anti-collecting warning. |
| **MURR Archaeometry obsidian collection** | Reference obsidian sources | By-request loan policy, no open spatial dataset; wrong shape. |
| **RRUFF / AMCSD / GBIF-NMNH** | Spectral/crystal/biological reference | No locality layer (RRUFF/AMCSD) or biological-only red herring (GBIF). Not locality sources. |
| **Sonora obsidian EDXRF** (Mendeley, CC BY 4.0) | Geologic+archaeological obsidian, Sonora MX | Clean license *model*, but out of US scope and no coordinate column. |

---

## 2. Bedrock-inference note ("what stone is under here")

These return **polygons of rock TYPE**, not collectible deposit points. Use as a *context/background* layer beneath manually-placed points, or to sanity-check that a hand-entered locality sits in plausible lithology — never as the locality source itself, and never as a legality signal.

- **Macrostrat** — live REST API (`/geologic_units/map?lat=&lng=`), **no key**, returns lithology + per-unit source citations. **License: CC BY 4.0** (confirmed in API page *and* embedded in every response body). **Conditional**: requires attribution to "Macrostrat" + pass-through of the per-unit `source_id`/`refs` original-map citations. Best bedrock-context option; can be cached or called live like your existing iNaturalist/PAD-US calls.
- **USGS SGMC** (State Geologic Map Compilation, DS 1052) — 48-state bedrock polygons, LITH fields name chert/limestone/rhyolite/obsidian/etc. Bulk download + REST FeatureServer. **License: US Public Domain**, *conditional* on a per-unit check — metadata warns a few embedded source maps "contain copyrighted material." Coarse (~1:1M).
- **USGS Generalized Lithology** — **CC0** (cleanest license of all), but only 12 classes (chert/novaculite collapse to "sedimentary," obsidian to "volcanic") — too coarse to isolate craft stone. Lightweight basemap only.
- *Skip OneGeology* — international aggregator holding no data; its US content is just the USGS service you'd source directly, plus a logo/attribution obligation for zero added coverage.

---

## 3. Do NOT import — link only (all-rights-reserved community/editorial)

These are scrape-prohibited and/or all-rights-reserved. Several wrap public-domain federal data — **go to the primary source instead**. At most an outbound "go look here yourself" hyperlink; never copy coordinates.

| Site | What it is | Go to instead |
|---|---|---|
| **Mindat.org / OpenMindat** | Best locality DB | (no PD equivalent — re-check after their open-license launch) |
| **Rockhounding.org** | 1,000+ GPS-verified collecting sites + editorial legality notes (the exact thing you'd hand-build) | All-rights-reserved + 403 to fetch. Link only. Legality notes are editorial, not authoritative. |
| **Rockd** | Crowdsourced outcrop check-ins | Terms grant license to Rockd only, not third parties; also exposes contributors' real names + precise coords. Use Macrostrat for lithology. |
| **The Diggings** | Mining-claim/mine maps | All-rights-reserved wrapper of **BLM MLRS + PLSS** (public domain) → pull BLM directly |
| **Western Mining History** | Mine points (free + paid product) | Its points **ARE USGS MRDS** (public domain) → get free from mrdata.usgs.gov; don't pay |
| **RubyGlint / rockhoundingmap.com / rockhoundingmaps.com** | 260k+ aggregated locations | Aggregated from USGS/Mindat → chase the primary sources |
| **MyLandMatters / Land Matters** | Claims + withdrawals overlay (right *concept*) | Sourced from **BLM MLRS + PAD-US** → pull BLM/USGS directly |
| **The-Vug** | Dealer/event portal | No locality layer at all |
| **"All-50-states" law compilations** (Rockhound Resource, OakRocks, geology.com, RubyGlint) | Per-state legality prose | Research index only; re-derive facts from primary state statute/agency pages |

---

## 4. PERMISSION LAYER — the hard part

A locality dataset says a material **exists** somewhere. It says **nothing** about whether collecting is legal there. The legality layer is **separate, multi-source, and partly un-spatializable**, and it is the real work. Build it from public-domain primaries you pull directly — never from the community wrappers above.

### 4a. Spatial substrate (who owns/manages the ground) — all US Public Domain
- **BLM Surface Management Agency (SMA) polygons** — the base point-in-polygon layer: is this point on BLM / USFS / NPS / state / private land? `gis.blm.gov` REST + bulk GeoJSON. Clip to CONUS and simplify before caching (national file is large).
- **USFS Administrative Forest Boundaries** (FSGeodata) and **NPS Unit Boundaries** (NPS Open Data Hub) — turn the USFS-allowed / NPS-prohibited rules into spatial masks.
- **PAD-US** — *already integrated*; reuse for **manager identity** to route to the correct per-agency rule. Do **not** treat its Public Access class as collecting permission (you already flag this).

### 4b. "Subtract" layers — where casual collecting is removed (US Public Domain)
- **BLM MLRS Mining Claims (Not Closed)** — active claims extinguish casual-collecting rights (43 CFR 8365.1-5(b)(2)). PLSS-geocoded → **coarse/over-broad** (a claim shown over a whole section isn't the whole section); status changes often so a cached snapshot goes stale. Treat as "possible claim — verify locally."
- **BLM SMA Withdrawals + Special Public Purpose Withdrawals** — withdrawn/segregated lands. **Nuance:** withdrawal from mineral *entry* (claims) is **not** automatically a closure of 43 CFR 8365 casual specimen collecting — effect is purpose-specific. Do not auto-render every withdrawal as "no collecting."

### 4c. Rule semantics (hand-encoded text, exactly like your 36 CFR 2.1 / per-forest work) — all public domain
- **BLM — 43 CFR 8365.1-5(b)(2)**: noncommercial collection of *reasonable amounts* of rock/mineral/semiprecious gems generally allowed on BLM land **without permit**; excluded at developed rec sites, on active claims, on private mineral estate, in closed/withdrawn areas. Daily caps (e.g. 25 lb/day) are **field-office-specific**, not in 8365 itself. ~9 BLM-promoted rockhounding areas (Glass Buttes obsidian, Topaz/Dugway, Wiley Well geode beds) are a web list with no GIS layer — geocode by hand if used, conservatively.
- **USFS — FS-1091 / 36 CFR 228 Subpart C / 261**: rockhounding (agate, jasper, **obsidian, chert**, chalcedony, geodes, quartz) for personal/noncommercial use generally **allowed** on most NFS land under free use; NOT in wilderness/monuments/special areas, must not conflict with claims/leases, no mechanical equipment, check local ranger district. Pairs naturally with your existing `data/usfs-forest-rules.json` — add a rock/mineral facet alongside forest products.
- **NPS — 36 CFR 2.1(a)(1)(iv)**: rock/mineral/paleontological collecting **PROHIBITED in all NPS units**. The gathering exception covers only fruits/berries/nuts — *not* minerals. Narrow carve-outs: Whiskeytown gold panning (36 CFR 7.91), research permits. This is your hard "banned" mask. Mirrors your existing "permission required"/"occurrence is never permission" ethic.
- **State rules — no national spatial dataset exists.** Hand-encode per state per land-class from primary state geological-survey / state-land-office / state-park statute pages, attached to PAD-US state-trust/park polygons. State parks **almost universally prohibit**; trust-land rules **flip** (Utah SITLA allow-with-permit, 25 lb/day & 250 lb/yr; Arizona trust-land **prohibits**, lease required; Oregon rich in BLM-designated sites). High maintenance: 48 states × multiple land classes, re-verify annually. Start with 4–5 template states (UT, OR, AZ, WY, TX).

### How it overlays on localities
`locality point → PAD-US/BLM SMA manager → per-agency rock rule (BLM allow / USFS allow / NPS ban / state varies) → subtract active claims + withdrawals → label conservatively + "verify with local office before collecting."` This is the *same flow* as your existing forest-products encoding, with a rock/mineral facet. Agency ownership alone is **not** permission — the claim/withdrawal subtraction is mandatory and is the part with no clean spatial source.

---

## 5. ARPA / archaeological-site ethics caveat

Toolstone (especially obsidian and chert) sources are frequently also **archaeological sites**. This is a hard ethical/legal line, not a data caveat:
- **tDAR** (the Digital Archaeological Record) deliberately **obfuscates** all site locations to ≥1-mile squares; precise coordinates are confidential by ARPA / NHPA §304. This is the project's ethics anchor — the *opposite* of a "come collect here" signal.
- The **IAOS obsidian catalog** explicitly warns: collecting artifacts at sources "may be illegal… irrevocably erases and destroys the archaeological history." That warning is itself a reason to be cautious about surfacing obsidian sources as harvest spots.
- **Rule for the Objects map:** map only raw **geologic outcrops**; never map artifact/quarry archaeological-site localities as material sources. Carry an ARPA/archaeology disclaimer in popups and docs, alongside the existing safety/medicine disclaimers. Honor source obfuscation (Mindat blurs sensitive sites; don't defeat it).

---

## 6. What to add to ATTRIBUTION.md (per recommended source)

Drop-in lines matching the existing per-source / "access-rule summaries are not harvest permission" style:

- **USGS MRDS** — "Craft-stone locality seeds derived from the USGS Mineral Resources Data System (MRDS), filtered by commodity to lapidary/craft stone (soapstone/steatite, gypsum/alabaster, chert, obsidian, novaculite, serpentine), hand-verified, and cached as GeoJSON. MRDS is a U.S. Government work in the U.S. public domain (17 U.S.C. § 105; MRDS metadata Use/Access Constraints 'none'). Data frozen ~2011; positional accuracy varies (graded A–E). Occurrence/deposit data only — carries no collecting-legality. Credit: U.S. Geological Survey, Mineral Resources Data System, Reston, Virginia."
- **USGS USMIN** — "Mine-feature/quarry points from the USGS USMIN Mineral Deposit Database (per-state ScienceBase releases), used as a hazard/quarry overlay. U.S. Government work, public domain (17 U.S.C. § 105). Cite the specific release DOI. No collecting-legality signal; many features are claimed/withdrawn/private ground."
- **Macrostrat** (if bedrock context shipped) — "Bedrock lithology context from Macrostrat (`/geologic_units/map`), licensed **CC BY 4.0**. Attribute 'Macrostrat' and pass through the per-unit original-map source citations (`source_id`/`refs`) returned by the API; cite Peters et al. 2018 (doi:10.1029/2018GC007467). Rock-type context only — not a collectible-deposit locator and not collecting permission."
- **USGS SGMC** (if used instead/alongside) — "State bedrock-geology polygons from USGS SGMC (Data Series 1052), U.S. public domain; per-unit copyright note checked before caching flagged source units. Cite Horton 2017, doi:10.5066/F7WH2N65."
- **BLM SMA / MLRS Mining Claims / Withdrawals** — "Federal land-status, mining-claim, and withdrawal polygons from BLM (`gis.blm.gov` / GBP Hub), U.S. Government works in the public domain (17 U.S.C. § 105; data.gov us-pd). Used as the collecting-permission overlay's manager + 'subtract' layers. Claim/withdrawal geometry is PLSS-geocoded and approximate; 'as is', not a legal land survey — labeled 'verify locally,' not collecting permission."
- **USFS Administrative Forest / NPS Unit Boundaries** — "Jurisdiction polygons from USFS FSGeodata and NPS Land Resources Division, U.S. public domain (17 U.S.C. § 105), used to spatialize the hand-encoded USFS-allowed / NPS-prohibited rock rules. Boundary ≠ permission."
- **Rock/mineral collecting rule sources (access-rule summaries, not harvest permission)** — add under the existing "Access Rules" list: 43 CFR 8365.1-5(b)(2) + BLM Rock Collection FAQ (2024); USFS FS-1091 + 36 CFR 228 Subpart C / 261; NPS 36 CFR 2.1(a)(1)(iv) + NPS Rock Hunting Guidance; per-state rock-collecting rules cited to each state's primary statute/agency page. All federal regs/agency pages are public domain.
- **Washington Geological Survey** (if WA supplement shipped) — "WA mine/mineral points from the Washington Geological Survey (WA DNR), reused under WGS's attribution-only open terms ('free for any use… as long as you cite us'). Cite 'Washington Geological Survey (Washington Department of Natural Resources)' + dataset series number. Occurrence only; no collecting-legality."
- **OSM quarries** (if a commercial-quarry context layer ships) — "Quarry footprints filtered from OpenStreetMap (`landuse=quarry`) and cached as GeoJSON. **ODbL 1.0 share-alike** — recorded distinctly from the project's CC BY-NC sources; '© OpenStreetMap contributors' (link to openstreetmap.org/copyright) on the map and the ODbL text/link in the cached data. Kept architecturally separate so the site remains a Collective Database. Commercial quarries — not public collecting sites."
- **Mindat — DO NOT add as an importable source today.** If ever adopted post-open-license-launch: "Locality facts (name + coordinate, mineral lists) from Mindat.org via the OpenMindat API under CC BY-NC-SA 4.0; share-alike applies to the derived layer; photos and ODbL-derived polygons excluded. Occurrence only — paired with the permission overlay." Until launch, reference link only.