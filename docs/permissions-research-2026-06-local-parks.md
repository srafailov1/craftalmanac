# Local / Municipal Park Foraging Landscape — June 2026

Finer-grained pass on **city, municipal, county, and regional park systems** —
the layer beneath the federal and state passes. 66 of the largest/most-significant
systems were researched against their **primary municipal code / park ordinance**;
nationwide sweeps then hunted for the foraging-*allowed* exceptions (food forests,
community orchards, county foraging programs).

Classification is **strictly evidence-based, no conservative bias** (per owner
direction): **allowed / prohibited / permit-required** only where a sourced
ordinance says so; **unknown** where a system was researched but has no clear
codified rule. The app's generic catch-all for unmatched local PAD-US land
**stays `"unknown"`** ([app.js:6205](../app.js)) — this pass adds named
overrides, it does not change that default.

## Headline finding

Of 66 major systems: **43 prohibited · 16 permit-required · 1 allowed-if-posted ·
6 unknown — and ZERO with a flat "foraging allowed" general rule.** The dominant
municipal pattern is a blanket "no removing/injuring plants in parks" ordinance.
Where the public *can* legally forage on local land, it is almost always via one
of two narrow channels:

1. **Dedicated food-forest / edible-park / community-orchard sites** with an
   explicit public-harvest policy (site-level, not system-wide).
2. **A handful of foraging-friendly county/regional systems** (Dane County WI;
   Ramsey/Dakota/Washington County MN; Columbus & Franklin County Metro Parks OH).

The adversarial verify pass made 10 changes — notably **downgrading several
Texas/Nevada cities from "prohibited" to "unknown"** when the cited code didn't
actually bar collection, and **correcting Columbus Metro Parks up to
allowed-if-posted**.

## A. Prohibited (43)

General ordinance bars removing/cutting/injuring plants in parks; no
personal-use exception. Foraging not permitted without unit authorization.

| System | Citation | System | Citation |
|---|---|---|---|
| Los Angeles, CA | LAMC § 63.44(B) | Indianapolis, IN | Rev. Code § 631-106 |
| San Diego, CA | SDMC § 63.0102(c)(4) | Columbus, OH | City Code § 919.09 |
| San Jose, CA | SJMC § 13.44.070 | Cleveland, OH | Cod. Ord. § 559.31 |
| San Francisco… | *(permit — see B)* | Detroit, MI | Park Rules #57-2-3 |
| Fresno, CA | FMC § 5-502 | Milwaukee, WI (Milw. Co.) | Milw. Co. Code ch. 47 |
| Sacramento, CA | SCC § 12.32.070 | Memphis, TN | Code § 12-84-2 |
| Oakland, CA | OMC § 12.30.010 | Nashville, TN | Metro Code § 13.24.480 |
| Phoenix, AZ | Phoenix Code § 34-15 | Louisville, KY | Metro Code § 42.31 |
| Tucson, AZ | Tucson Code ch. 21 | New Orleans, LA | Code ch. 106 |
| Dallas, TX | City Code ch. 32 | Baltimore, MD | Rec & Parks § 22.08 |
| Denver, CO | DPR Park Use Rules § 4.3 | Boston, MA | Parks Rules § 2(e) |
| Colorado Springs, CO | City Code § 9.9.102 | Pittsburgh, PA | Code ch. 473 |
| Albuquerque, NM | ROA 1994 (parks) | Miami, FL | Code ch. 38 |
| Seattle, WA | SMC 18.12.070 | Jacksonville, FL | Code ch. 28 pt. 7 |
| Portland, OR | City Code § 20.12.100 | Raleigh, NC | RCC pt. 9 ch. 2 |
| Tulsa, OK | Code title 26 | Washington, DC | D.C. Code § 22-3310 |
| **Regional/county prohibited:** | | | |
| Cook County FPD (IL) | FPDCC Code tit. 3 | DuPage County FPD (IL) | Ord. 20-076 |
| Will County FPD (IL) | Ord. 124 | Cleveland Metroparks (OH) | Rules & Regs § 2 |
| Huron-Clinton Metroparks (MI) | HCMA Rule 1 | Maricopa County Parks (AZ) | Park Rules |
| East Bay Regional Park Dist. (CA) | Ord. 38 § 804 | Marin County Parks (CA) | Code § 10.04.020 |
| King County Parks (WA) | KCC 7.12.515(A) | Midpen. Reg. Open Space (CA) | Use Ord. R-20-105 |
| Metro regional parks, Portland (OR) | Metro Code § 10.03.020 | | |

## B. Permit-required (16)

Removal/collection only with a permit; no general personal-use foraging.

| System | Citation |
|---|---|
| San Francisco, CA | SF Park Code § 4.06 |
| Austin, TX | City Code § 8-1-11(E) |
| El Paso, TX | Code § 13.24.140 |
| Philadelphia, PA | Parks & Rec Regs § 401(B) |
| Atlanta, GA | Code § 110-59 |
| Charlotte, NC | Code ch. 15; MCPRD rules |
| Cincinnati, OH | Board of Park Commissioners rules |
| Tampa, FL | Code § 16-51 |
| Honolulu, HI | ROH § 10-1.2 |
| Oklahoma City, OK | Code ch. 53 |
| Omaha, NE | Code ch. 21 |
| Chicago Park District, IL | Code ch. 7 § B.5 (permit exception) |
| Mecklenburg County, NC | Parks & Rec Ordinance |
| Fairfax County Park Authority, VA | Policy Manual App. (regs) |
| Five Rivers MetroParks (Dayton, OH) | Code § 13 |
| Three Rivers Park District (MN) | Ordinance ch. 5 |

## C. Allowed if posted / designated (1)

| System | Rule | Citation |
|---|---|---|
| Columbus & Franklin County Metro Parks (OH) | Codified **standing no-permit exception**: collecting leaves, mushrooms, fruits, or seeds in general picnic areas is allowed (default rule otherwise prohibits) | Franklin Co. Metro Park Dist. Rules § 1.1 |

## D. Unknown — researched, no codified rule (6)

These were researched but their municipal codes contain **no rule addressing
plant/fruit/mushroom collection** (often a tree-protection or general-conduct
chapter that doesn't reach foraging). Per owner direction these stay **unknown**,
not inferred-prohibited — and the app already renders such records "unknown."

| System | Note |
|---|---|
| Houston, TX | Code ch. 32 (Sec. 32-6 trees/shrubs) does not bar public collection |
| San Antonio, TX | No collection/removal rule found for city parks |
| Fort Worth, TX | No foraging/plant-removal rule in the park code (verifier downgraded from prohibited) |
| Las Vegas, NV | LVMC 13.36.020 park prohibitions don't list plant/fruit collection |
| Kansas City, MO | Ch. 53 surveyed; no plant-collection rule |
| St. Louis, MO | No park-system-wide collection rule located |

## E. Foraging-ALLOWED exceptions (from nationwide sweeps)

The positive cases. **These are where the map gains "allowed" local pins.**

### E1. Foraging-friendly county / regional systems (encode as agency rules)

| System | Allowance | Source |
|---|---|---|
| **Dane County Parks (WI)** | System-wide: edible fruits, nuts, and mushrooms for personal (non-resale) use; posted guidelines | parks-lwrd.danecounty.gov/recreation/Foraging |
| **Ramsey County Parks (MN)** | Fruits, nuts, mushrooms for personal use (2022 Parks Ordinance, Reg. Pt. 4(a)) | ramseycountymn.gov park ordinance |
| **Dakota County Parks (MN)** | Above-ground items in designated areas, **Special Use Permit required**; no digging | County Ordinance 107, § 5.2 |
| **Washington County Parks (MN)** | Fungi/berries/nuts/seeds/flowers/leaves, personal use, designated areas, **free Foraging Permit** | Parks Ordinance #218 ch. V |
| **Columbus & Franklin County Metro Parks (OH)** | Leaves/mushrooms/fruits/seeds in picnic areas, no permit (see §C) | Metro Park Dist. Rules § 1.1 |

A clear **Upper-Midwest cluster** (MN counties + Dane County WI) is the most
foraging-permissive local regime in the country.

### E2. Food forests / edible parks / community orchards (site-level → `SITE_ACCESS_RULES`)

Public-harvest sites. **Already encoded (4):** Beacon Food Forest (Seattle WA),
Dr. G.W. Carver Edible Park (Asheville NC), Festival Beach Food Forest (Austin
TX), Urban Food Forest at Browns Mill (Atlanta GA).

New high-confidence candidates (bounds to confirm before encoding, as with the
existing four):

| Site | City / State | Policy |
|---|---|---|
| Bronx River Foodway, Concrete Plant Park | Bronx, NYC NY | **NYC's only legal public foraging site** (NYC Parks + Bronx River Alliance) |
| Boston Food Forest Coalition — 13 edible parks | Boston MA | Open to all, free to harvest, "take what you need" (community land trust + City) |
| Denver Urban Gardens food forests — 29 sites | Denver metro CO | "Pick ripe fruit to share"; free public harvest |
| Del Aire Public Fruit Park | Hawthorne (LA County) CA | CA's first public fruit park (Fallen Fruit / LA County Arts) |
| Charlotte's Blueberry Park | Tacoma WA | Free public u-pick, 3,300+ blueberry bushes (Metro Parks Tacoma) |
| Bloomington Community Orchard | Bloomington IN | Public, dawn–dusk, all fruit free to harvest (City parkland) |
| Refuge Food Forest | Normal IL | Open to public, produce free to pick (Town of Normal + ISU) |
| Lawrence Community Orchard | Lawrence KS | Free food park, anyone may pick (county/public land) |
| Hyattsville food forests (Emerson St; McClanahan) | Hyattsville MD | "Anyone is welcome to visit and harvest" (City plantings) |
| White Marsh Park Edible Trail | Queen Anne's County MD | Public edible trail, pick the branch's fruit/nuts (MD DNR + County) |
| Madison Edible Landscapes | Madison WI | Fruit/nut plantings on city land, public harvest (MGO 8.32) |
| Wetherby & McPherson Edible Forests | Iowa City IA | City parkland edible forests (medium confidence) |
| Philadelphia Orchard Project — 60+ orchards | Philadelphia PA | Per-site free-harvest; POPHarvest gleaning (low — per-site policies vary) |
| Community Orchard of West Seattle | Seattle WA | Free neighborhood fruit (college grounds; low confidence) |
| Dunbar/Spring Native Food Forest | Tucson AZ | Native food/medicine in public rights-of-way (low; not a park) |

### E3. Cultural conservation easements — Indigenous gathering (document, ≠ general public)

Tribal gathering rights granted on public land — **not** general-visitor foraging;
record with a respect note, like the NPS/state tribal carve-outs.

| Site | Easement | Tribe |
|---|---|---|
| Joaquin Miller Park, Oakland CA | Cultural Conservation Easement (Nov 2022) | Sogorea Teʼ / Confederated Villages of Lisjan |
| Mount Umunhum, Midpeninsula Open Space CA | Cultural Conservation Easement (Dec 2017) | Amah Mutsun Tribal Band |
| Tolay Lake Regional Park, Sonoma County CA | 20-yr co-management agreement | Federated Indians of Graton Rancheria |

## Architecture & encoding notes

- **City rule vs. site override:** the food-forest sites sit *inside* cities whose
  general rule is prohibited/permit (Beacon in Seattle, Browns Mill in Atlanta,
  Festival Beach in Austin, Bronx River Foodway in NYC). `SITE_ACCESS_RULES`
  already resolves ahead of the city rule, so a bounded "allowed" site correctly
  overrides the city's "prohibited" default. Both layers are encode-worthy.
- **Minneapolis nuance:** MPRB's general ordinance (PB2-2) prohibits foraging, but
  a 2017 amendment permits personal harvest of *approved fruit/nut trees at
  designated community-orchard sites* (Adams Triangle, Bridal Veil Gardens, etc.).
  Encode Minneapolis city = prohibited, with the designated MPRB orchards as
  allowed site overrides.
- **PAD-US matching — audited 2026-06-16, requires geography.** A live audit of
  the PAD-US service confirmed the four fields the app reads
  (`Unit_Nm/MngNm_Desc/MngTp_Desc/DesTp_Desc`) carry only **coarse categories**
  for local land (`"City Land"`, `"Local Government"`, `"Local Park"`), **never
  the city/agency name** (`"Chicago Park District"` → 0 records; Griffith Park
  shows no "Los Angeles"). So per-jurisdiction municipal rules **cannot** be
  text-matched on city/agency name — they must be applied **geographically**
  (bounding box / boundary polygon + the `Local Government` category guard +
  `stateCode`), exactly like the existing `isNycLocalPark`. Encode priority by
  value: food-forest sites (small bboxes) → county systems (county polygons) →
  city-wide rules (deferred; stay `unknown`). See
  `TODO-local-parks-expansion.md` for the revised plan. (NPS/state passes are
  unaffected — their unit/designation names are standardized in PAD-US.)
- **The `"unknown"` fallback is unchanged.** No blanket "local park → prohibited"
  rule is added; the long tail of unresearched town parks stays honest-unknown.

## Provenance

66 city/regional systems researched June 16 2026 via a fan-out workflow (one
agent per system reading the primary municipal code/ordinance + an independent
adversarial verifier for every non-unknown classification), plus 6 nationwide
exception sweeps (41 raw discoveries, deduped above). All citations are to the
primary code where reachable. Encode work order:
`docs/TODO-local-parks-expansion.md`.
