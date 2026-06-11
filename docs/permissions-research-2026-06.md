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
| New River Gorge | ~1 gal/day list incl. mayapples & sumac; 3 gal for tree fruits/walnuts | Yes — ~1.5 gal | sourced |
| Acadia | ~1/2 dry gal fruits/berries; 1/2 gal nuts; 10 gal apples | No | sourced |
| Cuyahoga Valley | reasonable quantities fruits/berries/nuts, excluding listed rare species | No | sourced |
| Olympic | ~1 qt/day fruits/berries/nuts/mushrooms; cranberries & native blackberries 3.5 gal per 2 weeks; non-native fruit unlimited; seashells (handful/visit) | Yes | sourced |
| Mount Rainier | ~1 gal berries/day | Yes | sourced |
| Rocky Mountain | ~1 qt fruits/berries incl. chokecherries, rose hips | **Explicitly prohibited** | sourced |
| Yellowstone | ~1 qt/species/day berries + mushrooms, in-park consumption | Yes | sourced |
| Yosemite | ~1 pint/day berries + fungi, immediate consumption; Himalayan blackberry unlimited; apples/pears may be taken | Yes | sourced |
| Glacier | ~1 qt/day fruits/nuts/berries, hand only | No | sourced |
| Crater Lake | ~1 qt/day of 4 berry groups, in-park consumption | No | sourced |
| Grand Teton + Rockefeller Pkwy | ~1 qt/species/day fruits/berries/nuts/mushrooms, in-park | Yes | sourced |
| Redwood | ~1 gal berries; 1 gal hazelnuts; 10 gal tanoak acorns; 5 apples | No | sourced |
| Capitol Reef | Fruita orchards managed u-pick (free to eat in orchard; pay to carry out) | No | sourced |
| Death Valley | mesquite beans, pine nuts, grapes, non-native fruits (apples, figs, palms, pomegranates, black walnuts) | No | sourced |

Secondary compilation used: travel-experience-live.com "Foraging in National
Parks" (cross-links each park's official compendium). ~46 of 63 national parks
reportedly allow some gathering — the table above is the encoded subset;
checking the remaining parks' compendiums is a good future pass.

## State systems (encoded)

| State / system | Rule | Status |
|---|---|---|
| NY DEC state forests & Forest Preserve | Allowed — personal-consumption exception to plant-protection rule | verified (DEC rules page) |
| NY state parks (OPRHP) | Prohibited | sourced |
| PA DCNR state forests & parks | Allowed — edible fruits/nuts/berries/fungi, reasonable personal amounts; ginseng & listed species excluded | verified (DCNR pages) |
| WA state parks | Allowed — 2 gal/person/day edibles unless posted (WAC 352-28-030); natural area preserves excluded | verified (WAC text) |
| CA state parks | Prohibited unless posted per unit (14 CCR 4306) | verified (parks.ca.gov general provisions) |
| NYC parks | Prohibited (56 RCNY 1-04) | verified (nycgovparks.org) |

Future state passes worth doing (dense data): CO, OR, MD, NC, MI, MN, IL/Chicago
(Chicago Park District prohibits removal), Denver street-tree/right-of-way rules.

## Fine-grained sites

**Encoded (bounds in `SITE_ACCESS_RULES`):**
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

**Candidates — verified to exist, bounds not yet confirmed (next iteration):**
- Beacon Food Forest, Seattle WA (~47.576, -122.312) — public food forest,
  open community harvest. beaconfoodforest.org
- Urban Food Forest at Browns Mill, Atlanta GA (~33.70, -84.36) — nation's
  largest public food forest; harvest is community-prioritized and partly
  volunteer-managed; check aglanta.atlantaga.gov guidance before encoding as
  fully open.
- George Washington Carver Edible Park, Asheville NC (~35.596, -82.543) —
  first US public food forest (1997), free picking; bountifulcities.org.
- Festival Beach Food Forest, Austin TX; Philadelphia Orchard Project sites;
  Boston Food Forest Coalition sites — same pattern, all need boundary checks.
- Botanical gardens / arboreta (e.g., US National Arboretum, Brooklyn Botanic,
  Minnesota Landscape Arboretum) — uniformly prohibit collection; a generic
  "botanical garden / arboretum -> prohibited" PAD-US text rule is a good
  future addition.

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
