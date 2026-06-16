# Harvesting Permissions Research — June 2026 Pass

Findings from the nationwide permissions expansion. Status key:
**verified** = read from the primary source this pass; **sourced** = taken from
a secondary compilation with the primary linked, numbers hedged with "about"
in the app; **candidate** = found but not yet encoded.

## Broad federal categories (all encoded)

| Land | Rule encoded | Status | Source |
|---|---|---|---|
| USFS national forests & grasslands | Allowed — small personal-use amounts, permits for more; varies by forest | verified (BLM/USFS pages) | fs.usda.gov forest-products pages |
| BLM lands | Allowed — reasonable personal-use amounts of berries, nuts, mushrooms, plants, seeds, flowers, cones | verified | blm.gov forest-product-permits, "Can I Keep This?" |
| National wildlife refuges (USFWS) | Prohibited by default (50 CFR Part 27); individual refuges authorize berry/mushroom picking (e.g., Mingo 2 gal/day, Seney, Minnesota Valley, Neal Smith allow; Wm. L. Finley prohibits) | verified | ecfr.gov 50 CFR 27; fws.gov refuge pages |
| Army Corps project lands | Prohibited — vegetation protected (36 CFR 327.14); dead firewood in designated areas only | verified | ecfr.gov 36 CFR 327 |

## NPS compendium gathering designations (encoded; food mode only)

| Park | Key allowance | Mushrooms | Status |
|---|---|---|---|
| Great Smoky Mountains | 16-item species list, 1 lb/person/day/species (apples, pears, peaches excepted); 200 ft from nature trails; no ramps | Yes — 1 lb combined, soil/down-log only, 100 ft from facilities | **verified** (primary, June 2026) |
| New River Gorge | 1 gal/day list incl. mayapples & sumac berries; 3 gal apples/black walnuts/peaches/pears/persimmons/plums; ramps removed from designation; ginseng illegal | Yes — 1.5 gal, named species (morel, oyster, chanterelle, puffball, black trumpet, dryad's saddle, sulphur shelf) | **verified** (primary, June 2026) |
| Acadia | 1 dry half-gal/day fruits/berries (apples excepted); apples 10 dry gal; unshelled nuts 1/2 gal; seashells 1 pint | **Explicitly prohibited** (also cones, lichens, fiddleheads) | **verified** (primary, June 2026) |
| Cuyahoga Valley | reasonable quantities fruits/berries/nuts, excluding listed rare species (compendium approved 4/7/2026; moved to its own page) | **Explicitly prohibited** (fungi and bulbs, any quantity) | **verified** (primary, June 2026) |
| Olympic | 1 qt/day fruits/berries/nuts/mushrooms, 200+ ft from nature/special trails & natural study areas; cranberries & native blackberries 3.5 gal once per 2 weeks; exotics (apples, pears, non-native blackberries) exempt; seashells handful/visit | Yes | **verified** (primary, June 2026) |
| Mount Rainier | listed berries + edible fungi, 1 gal/person/day combined, hand only; stay on trail at Paradise/Sunrise/Tipsoo/Ohanapecosh | Yes | **verified** (2025 compendium PDF, June 2026) |
| Rocky Mountain | listed species (blueberries/huckleberry, chokecherries, red elderberries, raspberries, rose hips, strawberries) 1 qt/day | **Explicitly prohibited** | **verified** (2025 compendium PDF, June 2026) |
| Yellowstone | 1 qt/species/day berries + mushrooms; possession/consumption restricted to park areas | Yes | **verified** (2026 compendium PDF, June 2026) |
| Yosemite | listed berries 1 pint/day each, immediate consumption; Himalayan blackberry unlimited; fungi 1 pint/day, cut not pulled; apples/pears transportable, non-commercial | Yes | **verified** (Sept 2025 compendium PDF, June 2026) |
| Glacier | 1 qt/day fruits/nuts/berries, hand only; bush rakes prohibited | **Explicitly prohibited** (spore-cycle rationale) | **verified** (primary, June 2026) |
| Crater Lake | blueberries, huckleberries, Pacific serviceberries, western thimbleberries: 1 qt/day possession limit each, all areas open (current text is a possession limit, not in-park-consumption) | No | **verified** (primary, June 2026) |
| Grand Teton + Rockefeller Pkwy | 1 qt/species/day fruits/berries/nuts/mushrooms; possession/consumption restricted to park areas | Yes | **verified** (primary, June 2026) |
| Redwood | all berry species 1 gal/day; apples 5/day; tanoak acorns 10 gal; hazelnuts 1 gal; seashells 1 gal below storm-wave limit | No | **verified** (primary, June 2026) |
| Capitol Reef | Fruita orchards: ripe fruit only from posted "U-Pick Fruit" orchards; fruit taken must be paid for at self-pay station (free-sampling claim dropped — not in current text) | No | **verified** (orchards page, June 2026) |
| Death Valley | pine nuts, mesquite beans, grapes, non-native tree fruit (palms, apples, figs, black walnuts, pomegranates): <1 qt/day AND max 5 qt/calendar year | No | **verified** (rules page compendium, June 2026) |
| Indiana Dunes | fruits, nuts & berries: a handful per person for personal use (36 CFR 2.1(c)(1)); prickly pear fully protected; unoccupied seashells small amount | **Explicitly prohibited** (mushrooms, flowers, leaves, seeds all protected under 2.1(a)(1)(ii)) | **verified** (natural-items rules page, June 2026) |
| Sequoia & Kings Canyon | berries, mushrooms, and a few other plants for immediate personal consumption only; per-species limits in the compendium; inedible objects (wildflowers, cones, rocks) prohibited | Yes | **verified** (park rules page, June 2026; quantities in compendium) |

17 NPS parks now encoded (Sequoia and Kings Canyon are two PAD-US units sharing
one rule), all verified against current primary sources (June 2026). Indiana
Dunes (dense Chicago-metro data) and Sequoia & Kings Canyon (dense Sierra data)
added this pass. Note: **Shenandoah is NOT in this table** — it already has a
richer dedicated per-species code path (`shenandoahAllowed` flags +
`getShenandoahLimit`, app.js ~4294) that runs ahead of `getNpsCompendiumRule`;
do not add a `NPS_GATHERING_RULES` entry for it (a broad "shenandoah" match
would also wrongly catch Shenandoah River State Park in VA). ~46 of 63 national
parks reportedly allow some gathering — adding parks beyond this subset is the
remaining NPS work. **Update 2026-06-15:** that remaining work is now researched.
All 44 not-yet-encoded National Parks were verified against current 2025–2026
compendiums — 34 allow some general-visitor gathering, 10 prohibit it — in
`permissions-research-2026-06-nps-expansion.md`, with the paste-ready encode work
order in `TODO-nps-compendium-expansion.md` (not yet applied to `app.js`).

## State systems (encoded)

| State / system | Rule | Status |
|---|---|---|
| NY DEC state forests & Forest Preserve | Allowed — personal-consumption exception to plant-protection rule | verified (DEC rules page) |
| NY state parks (OPRHP) | Prohibited | sourced |
| PA DCNR state forests & parks | Allowed — edible fruits/nuts/berries/fungi, reasonable personal amounts; ginseng & listed species excluded | verified (DCNR pages) |
| WA state parks | Allowed — 2 gal/person/day edibles unless posted (WAC 352-28-030); natural area preserves excluded | verified (WAC text) |
| CA state parks | Prohibited unless posted per unit (14 CCR 4306) | verified (parks.ca.gov general provisions) |
| NYC parks | Prohibited (56 RCNY 1-04) | verified (nycgovparks.org) |
| CO state parks / CPW lands | Prohibited — no edible exception in 2 CCR 405-1 #100 (firewood areas & noxious weeds excepted) | verified (rule text, June 2026) |
| OR state parks | Allowed (food) — berries/fruits/mushrooms/similar edibles 5 gal/person/day unless posted (OAR 736-010-0055(5)); uprooting & roots/flowers/stems prohibited (craft/medicine -> prohibited; tribal customary rights preserved) | verified (rule text, June 2026) |
| MD state parks | Prohibited (COMAR 08.07.06.13, no edible exception) | verified (rule text, June 2026) |
| MD state forests | Permit required — forest products by Service permit (COMAR 08.07.01.13) | verified (rule text, June 2026) |
| NC state parks/rec/natural areas | Prohibited (07 NCAC 13B .0201; research permits only, personal/commercial expressly barred) | verified (rule text, June 2026) |
| MI DNR state lands (parks, rec areas, forests, game/wildlife areas) | Allowed (food) — mushrooms/nuts/berries/tree fruits, personal use, about 25 lb cap per state-land rules; no plants destroyed by harvest (no fiddleheads, ramps, ginseng, tapping); no resale | verified (DNR pages, June 2026) |
| MN state parks & forest recreation areas | Allowed (food) — edible fruit & mushrooms ONLY, personal noncommercial use (Minn. R. 6100.0900 subp. 1, 2E); everything else incl. nuts prohibited; craft/medicine -> prohibited | sourced-verbatim (rule text quoted in official MN LCC task force memo, Sept 2025; revisor.mn.gov linked) |
| IL DNR lands (state parks, recreation/fish & wildlife/forest/natural areas) | Allowed (food) — edible fungi, nuts & berries ONLY, personal use not for resale (17 Ill. Adm. Code 110.70(a)(3)); ginseng berries excluded; only during the site's regular open hours and NOT during open hunting-season hours; dedicated Nature Preserves (Natural Areas Preservation Act, 525 ILCS 30) excluded -> prohibited; craft/medicine -> prohibited | verified (primary: ilga.gov official admin code, confirmed against Justia codified text current through June 2025; June 2026) |

**Remaining state/city queue:** Chicago Park District (city parks) code and
Denver parks + street-tree/right-of-way rules — both still need primary sources.
**(Update 2026-06-16:** Illinois *state* DNR lands are now encoded and verified —
17 Ill. Adm. Code 110.70(a)(3), see the IL row above. The Chicago Park District
*municipal* rule is a separate authority and is what remains for the Chicago
metro; Denver is still queued.)

**Roadmap reference:** the Minnesota Sustainable Foraging Task Force memo
(Sept 9, 2025, lcc.mn.gov) compiles citations for all 50 states — prohibited
vs. personal-use-allowed — and is the working list for future state passes.

## Fine-grained sites

**Encoded (bounds in `SITE_ACCESS_RULES`):**
- **Beacon Food Forest, Seattle WA** — allowed, all three modes (June 2026,
  primary source beaconfoodforest.org/openharvest). Open harvest year-round
  for anyone; site invites harvest of "more than 100 edible, medicinal, and
  crafting plants" — the explicit crafting language is why the default
  (ink/craft) mode is allowed too. Exceptions kept in the limit text: P-patch
  plots and the food bank plot. Medicine-mode note asks users to leave the
  sust̓əlǰixʷali Traditional Indian Medicine garden (Seattle Indian Health
  Board) to its caretakers. Bounds 47.5648..47.5683 N, -122.3137..-122.3105 W.
  NOTE: the first-pass bounds (47.5748..47.5778) were ~1 km too far north,
  derived from a bad candidate coordinate; corrected against Atlas Obscura's
  pin (47.5672, -122.3135) and the repo's own Falling Fruit record
  (47.568, -122.313), both consistent with the Seattle street grid.
- **Monticello** — prohibited, all modes. Private Thomas Jefferson Foundation
  museum property incl. Saunders-Monticello Trail. Note: the guest-policies
  page protects the property generally but does not contain an explicit
  "no picking" sentence; owner attests the ban. Bounds 37.9985..38.0165 N,
  -78.464..-78.438 W.
- **UVA Pavilion Gardens** — allowed (food/medicine) with respect guidance:
  UVA Sustainability invites consumption of ripe fruits, nuts, and herbs when
  gardens are not in event use; no unripe picking, no clipping branches.
  Craft/ink collection not addressed -> unknown. Bounds 38.033..38.0378 N,
  -78.506..-78.5018 W.

- **Dr. George Washington Carver Edible Park, Asheville NC** — food allowed
  (verified June 2026, City of Asheville Parks & Rec page: visitors encouraged
  to enjoy freshly picked produce, no more than a fair share); craft/medicine
  unknown. Bounds 35.5933..35.5947 N, -82.5478..-82.5462 W, centered on the
  repo Falling Fruit record (35.594, -82.547; 1.5-acre site by Stephens-Lee
  Community Center).
- **Festival Beach Food Forest, Austin TX** — food + medicine allowed
  (verified June 2026, festivalbeach.org FAQ: fruits/vegetables/herbs "free
  for the taking," medicinal plants signposted; EPA 560-F-20-172 confirms);
  craft unknown ("take food, not the forest"). Bounds 30.2529..30.2542 N,
  -97.7361..-97.7346 W around the Google pin 30.2535, -97.7354 (2/3-acre
  phase 1, 2.43-acre site, west of RBJ Center).
- **Urban Food Forest at Browns Mill, Atlanta GA** — food allowed, SOURCED not
  verified: the AgLanta page confirms the public-consumption purpose but the
  detailed harvest-guidelines page is offline (June 2026) — app note says to
  follow on-site signage; craft/medicine unknown. Bounds 33.6921..33.6939 N,
  -84.376..-84.374, centered on the repo Falling Fruit record (33.693,
  -84.375, "Access: Permitted by owner", 2217 Browns Mill Rd SE). Re-verify
  guidelines when the page returns.

**Also encoded this pass:** generic PAD-US text rule — any unit whose name
contains "botanic" or "arboretum" -> prohibited, all modes (representative
primary source: U.S. National Arboretum rules; collection of plants or plant
parts uniformly prohibited). Sits ahead of the NPS branches in
getPublicLandAccessRule.

**Candidates — verified to exist, bounds not yet confirmed (next iteration):**
- Philadelphia Orchard Project sites; Boston Food Forest Coalition sites —
  same pattern as the encoded food forests, need policy + boundary checks.

## Run log

- **2026-06-16 (Illinois state-lands pass):** Verified and encoded **Illinois
  DNR public lands** as a new state system in `getStateSystemRule`. Primary
  source read this pass: 17 Ill. Adm. Code 110.70(a)(3) on the official Illinois
  General Assembly admin-code site (ilga.gov), confirmed against the Justia
  codified text (current through Register Vol. 49, June 2025). Food mode →
  allowed for edible fungi, nuts, and berries (personal use, not for resale; no
  ginseng berries; the site's regular open hours only, not during open hunting
  seasons); dedicated Nature Preserves (Natural Areas Preservation Act) →
  prohibited; craft/medicine → prohibited (the exception is food-only). Matchers
  are IL-gated and anchored on state designations + the IDNR manager string, so
  they don't catch Cook County forest-preserve / Chicago Park District /
  municipal / federal land (federal matchers already resolve earlier). Added 4 IL
  cases to `scripts/test_rules.mjs` (all pass), the source row to
  `ATTRIBUTION.md`, and bumped the `index.html` asset token
  `mobile-relayout-4 → il-foraging-1`. Manifest + status-raster regenerated:
  exactly 8 manifest chunks and 8 raster cells changed, **all inside Illinois** —
  ~37 Falling Fruit records moved unknown → allowed (food) / prohibited
  (ink·medicine), nothing elsewhere drifted. Also fixed the two regen scripts,
  which were broken on `main` before this pass (see Hand-offs). Next in queue:
  Chicago Park District (city) + Denver primary sources; Philadelphia Orchard
  Project / Boston Food Forest Coalition site bounds; broad sources (state trust
  lands, TNC preserves).

- **2026-06-15 (national-park completion pass):** Researched all 44 capital-P
  National Parks not previously encoded (the 63 minus the 19 prior). One
  research agent per park read the park's current superintendent's compendium
  (many parsed straight from the signed PDF) plus official rules pages on
  nps.gov; a second independent agent adversarially re-verified each finding,
  biased toward catching overstated permission. Result: **34 allow** some
  general-visitor personal gathering, **10 prohibit** it (general visitors);
  all 44 **verified** against 2025–2026 sources. The adversarial pass caught
  American Samoa (boilerplate 2.1(c) header, no populated species list → tribal
  subsistence only → prohibited) and corrected Great Sand Dunes' limits; North
  Cascades' mushroom flag was hand-corrected (its source designates edible
  fungi). Findings: `permissions-research-2026-06-nps-expansion.md`; encode work
  order (paste-ready entries, not yet applied): `TODO-nps-compendium-expansion.md`.
  All 63 National Parks now have a verified gathering determination. Note on
  Alaska parks: seven use 36 CFR 13.35(c) (general-visitor gathering), distinct
  from ANILCA Title VIII subsistence — encoded as the general-visitor rule.

- **2026-06-11 (third pass, NPS expansion):** Verified and encoded two NPS
  gathering designations beyond the original 16. **Indiana Dunes** —
  natural-items rules page (updated April 22, 2026) allows a handful of
  fruits/nuts/berries per person for personal use; mushrooms (and
  flowers/leaves/seeds) explicitly prohibited, so encoded with
  `mushroomsAllowed: false` + mushroomNote. **Sequoia & Kings Canyon** — the
  park's edible-collection rules page allows berries, mushrooms, and a few other
  plants for immediate consumption (per-species limits live in the compendium);
  encoded as two precise `NPS_GATHERING_RULES` entries ("sequoia national park"
  and "kings canyon") to avoid false-matching Sequoia National Forest / Giant
  Sequoia National Monument. Both added to `NPS_GATHERING_RULES`,
  `ATTRIBUTION.md`, and the table above. **Correction:** I initially started to
  encode **Shenandoah** here, then found it already has a dedicated per-species
  code path (app.js ~4294) that is richer than a compendium entry and runs
  first; reverted — see the note under the NPS table. Next in queue: more dense
  NPS parks (Mammoth Cave, Congaree, Hot Springs, Pinnacles), then the
  IL/Chicago + Denver state/city items and the Philadelphia Orchard Project /
  Boston Food Forest Coalition site bounds.

- **2026-06-11 (second pass, queue-clearing):** Verified all 12 remaining
  "sourced" NPS compendiums against current primary sources — every encoded
  park is now **verified**, hedges removed, limits corrected (notable: Death
  Valley adds a 5 qt/calendar-year cap; Cuyahoga explicitly bans bulbs too;
  Glacier and Rocky Mountain mushroom bans now explicit; Crater Lake is a
  possession limit, not in-park consumption; Capitol Reef free-sampling claim
  dropped). **Fixed Beacon Food Forest bounds** (~1 km error). Encoded Carver
  Edible Park (verified) and Festival Beach Food Forest (verified) into
  SITE_ACCESS_RULES; Browns Mill encoded as sourced (guidelines page offline).
  Added generic botanical-garden/arboretum -> prohibited rule. Encoded six
  state systems: CO (prohibited), OR (food 5 gal/day), MD (parks prohibited /
  forests permit), NC (prohibited), MI (food allowed, DNR lands), MN (fruit &
  mushrooms only). Chicago + Denver remain queued (no reachable primary
  source this session). Found the MN LCC 50-state foraging-law memo as the
  roadmap for future passes.

- **2026-06-11:** Verified Acadia and Olympic against current compendium pages
  (sourced → verified; Acadia limits unchanged but mushroom prohibition is now
  explicit with the park's rationale; Olympic limits unchanged, trail-buffer
  and seashell details added). Encoded Beacon Food Forest into
  SITE_ACCESS_RULES (all modes allowed; first candidate promoted). Next in
  queue: remaining "sourced" compendiums (Mount Rainier, Yosemite, Yellowstone,
  Glacier, Crater Lake, Grand Teton, Redwood, New River Gorge, Cuyahoga,
  Rocky Mountain, Capitol Reef, Death Valley), Browns Mill / Carver Edible
  Park bounds, and the CO/OR/MD/NC/MI/MN state passes.

## Known limitations of this pass

- Park compendium limits marked "sourced" were taken from a 2022-era
  compilation; each should be reverified against the current compendium
  (the daily tune-up task could verify one or two per run).
- Compendium allowances are species-list-specific; the app currently shows
  "allowed" for any food-mode species in those parks with a confirm-the-list
  note. Per-park species flags (like `shenandoahAllowed`) would be more exact.
- State_Nm-based state matching only applies to freshly fetched PAD-US
  features; nothing breaks for older cached features, they just fall through
  to the generic fallback.

## Hand-offs

- **Overview status-raster coverage gap (→ Codex, spec written).** The low-zoom
  iNaturalist overview reads cell status from the baked status raster, which is
  generated only for the Falling Fruit chunk footprint
  (`fetch_padus_cell_containment.mjs` walks manifest chunks →
  `build_status_raster.mjs` bakes those cells). Encoded rule areas without
  Falling Fruit data (Sequoia / Kings Canyon NP have 0 FF chunks; the Indiana
  Dunes park polygon falls outside its nearby chunk's cells) get no raster cell,
  so the overview shows `"unknown"` and cannot reflect their encoded permission
  even though the high-zoom point layer labels them correctly. This is why
  rebuilding the manifest/raster after the 2026-06-11 NPS additions produced
  byte-identical output. Full work order: `docs/TODO-overview-rule-coverage.md`
  (queued as Codex item 4 in `docs/work-split.md`). Rule semantics stay
  Claude-owned; the hand-off is only the cell-coverage/data-regen mechanism.

- **Regen-script extraction lists drifted from `app.js` (FIXED 2026-06-16; →
  hardening hand-off).** Before this pass, both `scripts/build_access_status.mjs`
  and `scripts/build_status_raster.mjs` crashed on current `main` (confirmed on a
  pristine checkout): `computeRecordAccessRule` calls the runtime-only
  `getStatusRasterAccessRule` (added with the 2026-06-11 provisional-raster fix)
  and `getPublicLandAccessRule` calls `unlistedFungusRule`, neither of which was
  in the scripts' VM extraction/stub lists — so the manifest/raster maintenance
  gate was unrunnable. Fixed minimally and faithfully: stubbed
  `getStatusRasterAccessRule → null` at bake time (the manifest is the
  ground-truth source that *feeds* the raster, so the provisional fallback must
  not bake back in — and the diff confirmed zero non-Illinois drift), extracted
  `unlistedFungusRule` + the `EDIBLE_FUNGUS_WHITELIST` constant, and taught the
  shared `extractConstExpression` helper to parse `new Set(...)`/`new Map(...)`
  initializers. **Hand-off (→ Codex or the 5am tune-up):** add a guard so this
  can't silently regress — e.g. a check that every identifier referenced by an
  extracted function is itself extracted or stubbed, wired into
  `scripts/check.sh`, or a tiny smoke step that runs both regen scripts to a
  throwaway path and asserts exit 0. Rule semantics are unchanged; this is purely
  build-tooling robustness.

## Filtered aggregate maintenance

- When permission rules in `app.js` change, rerun
  `node scripts/build_access_status.mjs` so `data/falling-fruit/us/manifest.json`
  refreshes its baked `accessCounts` and `accessCentroids` from the current
  rule logic. Then rerun `node scripts/build_status_raster.mjs` so live
  iNaturalist overview filtering uses the same current area-rule statuses.
  The PAD-US containment caches do not need to be rebuilt unless PAD-US
  boundaries or public-access units are being refreshed.
