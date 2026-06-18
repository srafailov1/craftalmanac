# Work order: encode local / municipal park foraging rules

Owner tier: Codex. Author: Claude (2026-06-16 local-parks pass). Branch: `main`.

Rule **semantics** are Claude-owned and finalized in
`docs/permissions-research-2026-06-local-parks.md`. This order is the encode step.
Doubts → `docs/codex-questions.md`.

## Background & guardrail

After the federal/state branches, `getPublicLandAccessRule` falls through to a
generic default of **`"unknown"`** for unmatched local PAD-US land
([app.js:6205](../app.js)). **That fallback MUST stay `"unknown"`** — do not add a
blanket "local park → prohibited" rule. This order adds *named* overrides only;
the long tail of unresearched town parks keeps falling through to `"unknown"`.

Research covered 66 major systems: 43 prohibited, 16 permit-required, 1
allowed-if-posted, 6 unknown — plus foraging-allowed county systems and
food-forest sites found via sweep. Classification is strictly evidence-based (no
conservative bias): the 6 "unknown" systems get **no entry** (they already render
`"unknown"`).

## ⚠ PAD-US AUDIT (2026-06-16) — matching approach REVISED

A live audit of the PAD-US service the app uses ([app.js:32](../app.js)) found the
text-match design below **does not work** and must not be shipped as written.
The app reads only four fields — `Unit_Nm, MngNm_Desc, MngTp_Desc, DesTp_Desc` —
and for local government land they contain only **coarse categories**, never the
city/agency identity:

- `MngTp_Desc` = `"Local Government"`; `MngNm_Desc` ∈ {`"City Land"`,
  `"County Land"`, `"Other or Unknown Local Government"`}; `DesTp_Desc` ∈
  {`"Local Park"`, `"Local Recreation Area"`, `"Local Conservation Area"`, …}.
- City/agency names are essentially absent: `"Chicago Park District"` → **0
  records**; `"New York City"` → 9; **Griffith Park** (LA's flagship) is stored as
  `Unit_Nm="Griffith Park", MngNm_Desc="City Land", DesTp_Desc="Local Park"` —
  "Los Angeles" appears nowhere. Park names also collide across cities ("Griffith
  Park" also exists in Winston-Salem NC).

**Consequence:** a `text.includes("los angeles")` / `"chicago park district"` rule
matches (almost) nothing — a dead rule. The only way to apply a per-jurisdiction
municipal rule is **geographically**: a bounding box / boundary polygon for the
jurisdiction + the `Local Government` category guard + `stateCode` — exactly how
the existing `isNycLocalPark` (NYC bbox + `city land` + `local government` +
`local park`) already works. **The NPS and state passes are unaffected** (national
park names are in `Unit_Nm`; `DesTp_Desc='State Park'` is standardized) — encode
those as written.

### Revised plan (by value, given the audit)

- **Tier 1 — food-forest / edible-park sites → `SITE_ACCESS_RULES` (do first).**
  These are point locations with small bounding boxes (the existing
  Beacon/Browns Mill pattern), need no city-boundary data, and are the
  *highest-value* change (they flip specific spots from `unknown` → `allowed`).
  Next data step: geocode + bound each Phase-3 site and confirm current policy.
- **Tier 2 — foraging-friendly county systems (fast-follow).** Encode Dane County
  WI; Ramsey/Dakota/Washington County MN; Columbus & Franklin County Metro Parks
  OH via **Census county boundary polygons** + the `Local Government` category
  guard. Note: the three Twin Cities counties are adjacent with *different* rules
  (Ramsey allowed; Dakota/Washington permit), so **county polygons (point-in-
  polygon), not bounding boxes**, are required to tell them apart. This adds a
  county-geometry data dependency (Census TIGER), analogous to the existing state
  boundaries.
- **Tier 3 — the ~59 city prohibitions/permits (defer / optional).** Each needs a
  per-city boundary polygon to apply, and the payoff is only turning big-city
  parks from `unknown` → `prohibited`/`permit`. Since the owner chose to **keep
  the `unknown` fallback**, leaving these as `unknown` is consistent and honest.
  The researched rules below remain the source of truth if/when city-boundary
  geometry is added; do **not** encode them via text matching.

The text-match design in the next section is **retained only for reference** and
is **superseded** by the geographic approach above. Use the reference tables as
the researched rule source-of-truth; do not implement the `LOCAL_PARK_RULES`
text matcher.

## Design (SUPERSEDED — see audit above): `LOCAL_PARK_RULES` table + `getLocalParkRule` matcher

60 named overrides is too many for inline `if` branches. Mirror the
`NPS_GATHERING_RULES` pattern: a data table + a matcher, keyed on the **managing
agency/owner name** as it appears in PAD-US, guarded by `stateCode`.

```js
// near NPS_GATHERING_RULES (app.js ~136)
const LOCAL_PARK_RULES = [
  // { state, match, status, label, limit, note, sourceLabel, sourceUrl }
  // match = lowercase substring expected in the PAD-US text (Unit_Nm / MngNm_Desc),
  // guarded by state so short names ("los angeles") can't collide across states.
  ...
];

function getLocalParkRule(text, stateCode, area) {
  const entry = LOCAL_PARK_RULES.find(
    (r) => r.state === stateCode && text.includes(r.match)
  );
  if (!entry) return null;
  return {
    status: entry.status, label: entry.label, area,
    limit: entry.limit, note: entry.note,
    sourceLabel: entry.sourceLabel, sourceUrl: entry.sourceUrl,
  };
}
```

Wire it in `getPublicLandAccessRule` **after** `getStateSystemRule` and **before**
the generic fallback (app.js ~6106):

```js
  const stateRule = getStateSystemRule(stateCode, text, area, species);
  if (stateRule) return stateRule;

  const localRule = getLocalParkRule(text, stateCode, area);   // <-- add
  if (localRule) return localRule;                             // <-- add

  // ... existing VA/Charlottesville/Albemarle branches and the unknown fallback stay as-is
```

**PAD-US matching caveat (read first):** before finalizing each `match`, sample
the actual `Unit_Nm` / `MngNm_Desc` / `MngTp_Desc` values PAD-US uses for that
system (the regex-extraction harness in `scripts/build_access_status.mjs` can dump
them). Use the substring that reliably identifies the agency (e.g.
`"chicago park district"`, `"cook county forest preserve"`, `"city of los
angeles"`, `"east bay regional"`). If PAD-US doesn't carry the name, leave it out
— that record correctly stays `"unknown"`. Prefer specific agency strings over
bare city names where a collision is plausible.

## Phase 1 — Allowed / permit county systems (the positives; full entries)

These are the high-value "allowed" local pins. Paste into `LOCAL_PARK_RULES`:

```js
  {
    state: "WI", match: "dane county",
    status: "allowed", label: "Allowed",
    limit: "Edible fruits, nuts, and mushrooms may be foraged for personal (non-commercial) use; follow posted guidelines (leave enough for wildlife, no digging).",
    note: "Dane County Parks permits personal-use foraging of edible fruits, nuts, and mushrooms system-wide. Verified June 2026.",
    sourceLabel: "Dane County Parks foraging policy", sourceUrl: ACCESS_RULE_SOURCES.daneCountyParks
  },
  {
    state: "MN", match: "ramsey county",
    status: "allowed", label: "Allowed",
    limit: "Fruits, nuts, and mushrooms on park property may be foraged for personal use; commercial harvest prohibited.",
    note: "Ramsey County Parks added a personal-use foraging allowance in its 2022 Parks Ordinance (Reg. Pt. 4(a)). Verified June 2026.",
    sourceLabel: "Ramsey County 2022 Parks Ordinance", sourceUrl: ACCESS_RULE_SOURCES.ramseyCountyParks
  },
  {
    state: "MN", match: "dakota county",
    status: "permit-required", label: "Permit required",
    limit: "Foraging of identified above-ground items in designated areas is allowed with a Special Use Permit; no digging or excavating.",
    note: "Dakota County Ordinance 107 § 5.2 allows designated-area foraging with a Special Use Permit. Verified June 2026.",
    sourceLabel: "Dakota County Ordinance 107", sourceUrl: ACCESS_RULE_SOURCES.dakotaCountyParks
  },
  {
    state: "MN", match: "washington county",
    status: "permit-required", label: "Permit required",
    limit: "Personal-use foraging of fungi, berries, nuts, seeds, flowers, and leaves (no roots) in designated areas with a free Foraging Permit.",
    note: "Washington County Parks Ordinance #218 ch. V permits designated-area foraging under a free permit. Verified June 2026.",
    sourceLabel: "Washington County Parks Ordinance #218", sourceUrl: ACCESS_RULE_SOURCES.washingtonCountyMnParks
  },
  {
    state: "OH", match: "franklin county",   // Columbus & Franklin County Metro Parks; confirm PAD-US carries "metro parks"/"franklin county"
    status: "allowed-if-posted", label: "Allowed where posted",
    limit: "Collecting leaves, mushrooms, fruits, or seeds is permitted (no permit) in general picnic areas; other areas and other materials are protected.",
    note: "Columbus & Franklin County Metro Parks' rules carry a standing no-permit exception for leaves/mushrooms/fruits/seeds in picnic areas. Verified June 2026.",
    sourceLabel: "Franklin Co. Metro Park District Rules § 1.1", sourceUrl: ACCESS_RULE_SOURCES.columbusMetroParks
  },
```

Note `"allowed-if-posted"` reuses the status already produced elsewhere; confirm
the app's label/legend handles it (CA state parks use the same).

## Phase 2 — Prohibited & permit-required city/system overrides (table-driven)

Generate one `LOCAL_PARK_RULES` entry per row below. Use this shape; `status` is
`"prohibited"` or `"permit-required"` per the table; `limit`/`note` per the
templates; `sourceUrl` per the Appendix.

```js
  { state: "ST", match: "<agency substring>", status: "prohibited", label: "Prohibited",
    limit: "Removing or injuring plants, fruit, or vegetation in <System> parks is prohibited without authorization.",
    note: "<System>'s park ordinance (<citation>) protects all park vegetation; foraging is not permitted.",
    sourceLabel: "<citation>", sourceUrl: ACCESS_RULE_SOURCES.<src> },

  { state: "ST", match: "<agency substring>", status: "permit-required", label: "Permit required",
    limit: "Collecting plants or plant parts in <System> parks requires a permit; no general personal-use foraging.",
    note: "<System>'s park ordinance (<citation>) allows removal only by permit.",
    sourceLabel: "<citation>", sourceUrl: ACCESS_RULE_SOURCES.<src> },
```

**Prohibited (43)** — `jurisdiction · ST · citation` (propose `match` from the
agency name; validate against PAD-US):

| Jurisdiction | ST | Citation |
|---|---|---|
| Los Angeles | CA | LAMC § 63.44(B) |
| San Diego | CA | SDMC § 63.0102(c)(4) |
| San Jose | CA | SJMC § 13.44.070 |
| Fresno | CA | FMC § 5-502 |
| Sacramento | CA | SCC § 12.32.070 |
| Oakland | CA | OMC § 12.30.010 |
| Phoenix | AZ | Phoenix City Code § 34-15 |
| Tucson | AZ | Tucson Code ch. 21 |
| Maricopa County Parks | AZ | Park Rules (resource protection) |
| Dallas | TX | Dallas City Code ch. 32 |
| Denver | CO | DPR Park Use Rules § 4.3 |
| Colorado Springs | CO | City Code § 9.9.102 |
| Albuquerque | NM | ROA 1994 park ordinance |
| Seattle | WA | SMC 18.12.070 |
| King County Parks | WA | KCC 7.12.515(A) |
| Portland | OR | Portland City Code § 20.12.100(C)(3) |
| Metro regional parks (Portland) | OR | Metro Code § 10.03.020 |
| Tulsa | OK | Tulsa Code title 26 |
| Indianapolis | IN | Rev. Code § 631-106 |
| Columbus (city) | OH | Columbus City Codes § 919.09 |
| Cleveland (city) | OH | Cleveland Cod. Ord. § 559.31 |
| Cleveland Metroparks | OH | Park Rules & Regs § 2 |
| Detroit | MI | Detroit Park Rules #57-2-3 |
| Huron-Clinton Metroparks | MI | HCMA Rule 1 |
| Milwaukee (Milwaukee County) | WI | Milw. Co. Code ch. 47 |
| Memphis | TN | Memphis Code § 12-84-2 |
| Nashville | TN | Metro Code § 13.24.480 |
| Louisville | KY | Metro Code § 42.31 |
| New Orleans | LA | Code ch. 106 |
| Baltimore | MD | Rec & Parks rules § 22.08 |
| Boston | MA | Parks Rules & Regs § 2(e) |
| Pittsburgh | PA | Pittsburgh Code ch. 473 |
| Miami | FL | Miami Code ch. 38 |
| Jacksonville | FL | Code ch. 28 pt. 7 |
| Raleigh | NC | RCC pt. 9 ch. 2 art. B |
| Washington | DC | D.C. Code § 22-3310 |
| Cook County Forest Preserve | IL | FPDCC Code tit. 3 |
| Forest Preserve Dist. of DuPage County | IL | Ord. 20-076 |
| Forest Preserve Dist. of Will County | IL | Ord. 124 |
| East Bay Regional Park District | CA | Ordinance 38 § 804 |
| Marin County Parks | CA | Marin Co. Code § 10.04.020 |
| Midpeninsula Regional Open Space | CA | Use Ordinance R-20-105 |

**Permit-required (16):**

| Jurisdiction | ST | Citation |
|---|---|---|
| San Francisco | CA | SF Park Code § 4.06 |
| Austin | TX | Austin City Code § 8-1-11(E) |
| El Paso | TX | El Paso Code § 13.24.140 |
| Philadelphia | PA | Parks & Rec Regs § 401(B) |
| Atlanta | GA | Atlanta Code § 110-59 |
| Charlotte / Mecklenburg | NC | Charlotte Code ch. 15; MCPRD rules |
| Mecklenburg County | NC | Parks & Rec Ordinance |
| Cincinnati | OH | Board of Park Commissioners rules |
| Tampa | FL | Tampa Code § 16-51 |
| Honolulu | HI | ROH § 10-1.2 |
| Oklahoma City | OK | OKC Code ch. 53 |
| Omaha | NE | Omaha Code ch. 21 |
| Chicago Park District | IL | CPD Code ch. 7 § B.5 |
| Fairfax County Park Authority | VA | Policy Manual App. (regs) |
| Five Rivers MetroParks (Dayton) | OH | Five Rivers MetroParks Code § 13 |
| Three Rivers Park District | MN | TRPD Ordinance ch. 5 |

> Note: Charlotte/Mecklenburg may already be encoded in `getStateSystemRule`
> (a Charlotte row appears in the master research doc's state-systems table). If
> so, **do not duplicate** — keep the existing branch and skip the table rows for
> Charlotte and Mecklenburg County.

**Do NOT encode (stay `"unknown"`):** Houston, San Antonio, Fort Worth (TX); Las
Vegas (NV); Kansas City, St. Louis (MO). Researched, no codified rule found.

## Phase 3 — Food-forest / edible-park sites → `SITE_ACCESS_RULES`

These allow public harvest but need **lat/long bounds** before encoding (same as
the existing Beacon/Carver/Festival/Browns Mill entries — each needs a confirmed
bounding box). Treat as candidates; confirm bounds + current policy per site.
Already encoded: Beacon Food Forest, Carver Edible Park, Festival Beach, Browns
Mill. New candidates (see landscape doc §E2 for the full list + URLs), highest
value first:

- **Bronx River Foodway**, Concrete Plant Park, Bronx NY (NYC's only legal public
  foraging site — overrides NYC's prohibition).
- **Boston Food Forest Coalition** — 13 sites (addresses listed in the sweep data).
- **Denver Urban Gardens** food forests — 29 sites.
- **Del Aire Public Fruit Park**, Hawthorne CA; **Charlotte's Blueberry Park**,
  Tacoma WA; **Bloomington Community Orchard** IN; **Refuge Food Forest**, Normal
  IL; **Lawrence Community Orchard** KS; **Hyattsville food forests** MD; **White
  Marsh Park Edible Trail**, Queen Anne's Co. MD; **Madison Edible Landscapes** WI.
- Lower confidence / per-site policy: Philadelphia Orchard Project (60+),
  Community Orchard of West Seattle, Wetherby/McPherson (Iowa City), Dunbar/Spring
  (Tucson, rights-of-way not a park).

Also note the **Minneapolis MPRB designated orchards** (Adams Triangle, Bridal
Veil Gardens, etc.) as allowed site overrides within Minneapolis (city = prohibited).

Indigenous cultural-easement sites (Oakland Joaquin Miller; Midpen Mount Umunhum;
Sonoma Tolay Lake) are **tribal gathering, not general-public** — document with a
respect note; do not encode as public "allowed".

## Phase 4 — `ACCESS_RULE_SOURCES` & attribution

Add a URL constant per encoded system (names used above: `daneCountyParks`,
`ramseyCountyParks`, `dakotaCountyParks`, `washingtonCountyMnParks`,
`columbusMetroParks`, plus one per prohibited/permit city — URLs in the Appendix).
Add matching `ATTRIBUTION.md` rows (municipal code / park ordinance; public
government record; "access-rule summary, not harvest permission" framing).

## Phase 5 — Regenerate access-status data (gate)

```
node scripts/build_access_status.mjs
node scripts/build_status_raster.mjs
```
Bump the `app.js` cache token in `index.html`; `bash scripts/check.sh` exits 0.
Municipal park polygons are dense in metros, so overview coverage will shift in
many cities.

## Acceptance

- `node --check app.js` passes; `getLocalParkRule` is wired after
  `getStateSystemRule` and before the generic fallback; the `"unknown"` fallback
  is unchanged.
- Spot-checks (extend `scripts/test_rules.mjs`): a record whose PAD-US text
  contains `"dane county"` (WI) → `allowed`; `"city of los angeles"` (CA) →
  `prohibited`; `"chicago park district"` (IL) → `permit-required`; a Houston
  city-park record → still `"unknown"`.
- `bash scripts/check.sh` exits 0.

## Boundaries

- **Keep the `"unknown"` fallback** ([app.js:6205](../app.js)) exactly as is. No
  blanket local-park default.
- Do not encode the 6 "unknown" systems, and do not infer prohibited from silence.
- Do not duplicate any municipal rule already in `getStateSystemRule` (NYC;
  possibly Charlotte/Mecklenburg).
- Validate every `match` against real PAD-US `Unit_Nm`/`MngNm_Desc` values before
  shipping; a too-broad match that catches the wrong jurisdiction is a bug.
- Rule statuses/citations are finalized in the landscape doc — don't re-derive.

## Appendix — primary source URLs

Prohibited & permit-required cities and the allowed county systems, for
`ACCESS_RULE_SOURCES`. (Food-forest site URLs are in the landscape doc §E2.)

- Dane County Parks (WI, allowed): https://parks-lwrd.danecounty.gov/recreation/Foraging
- Ramsey County Parks (MN, allowed): https://www.ramseycountymn.gov/residents/parks-recreation/21st-century-parks-initiative/park-ordinance-project
- Dakota County Parks (MN, permit): https://www.co.dakota.mn.us/LawJustice/Ordinances/Documents/CountyOrdinance107.pdf
- Washington County Parks (MN, permit): https://www.washingtoncountymn.gov/3798/Foraging
- Columbus & Franklin County Metro Parks (OH, posted): https://www.metroparks.net/wp-content/uploads/2019/05/Rules-and-Regulations-2019.pdf
- Los Angeles (CA): https://www.laparks.org/venice/pdf/lamc63.pdf
- San Diego (CA): https://docs.sandiego.gov/municode/MuniCodeChapter06/Ch06Art03Division01.pdf
- San Jose (CA): https://library.municode.com/ca/san_jose/codes/code_of_ordinances?nodeId=TIT13STSIPUPL_CH13.44PA
- Fresno (CA): https://library.municode.com/ca/fresno/codes/code_of_ordinances?nodeId=MUCOFR_CH5CIFA
- Sacramento (CA): https://cdnsm5-hosted.civiclive.com/UserFiles/Servers/Server_16676053/File/Park%20Codes.pdf
- Oakland (CA): https://oaklandor.municipal.codes/OMC/12.30.010
- East Bay Regional Park District (CA): https://www.ebparks.org/sites/default/files/Ord38-09052023FINAL.pdf
- Marin County Parks (CA): https://library.municode.com/ca/marin_county/codes/municipal_code?nodeId=TIT10PA
- Midpeninsula Regional Open Space (CA): https://www.openspace.org/sites/default/files/20200923_2ndReadingRevisedOrdinanceforUseofMidpenLands_R-20-105.pdf
- San Francisco (CA, permit): https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_park/0-0-0-2
- Phoenix (AZ): https://phoenix.municipal.codes/CC/34-15
- Tucson (AZ): https://codelibrary.amlegal.com/codes/tucson/latest/tucson_az/0-0-0-16266
- Maricopa County Parks (AZ): https://www.maricopacountyparks.net/park-locator/white-tank-mountain-regional-park/park-information/park-rules/
- Dallas (TX): https://dallasparks.org/DocumentCenter/View/743/Dallas-City-Code---Chapter-32
- Austin (TX, permit): https://library.municode.com/tx/austin/codes/code_of_ordinances?nodeId=TIT8PARE_CH8-1PAAD_ART2REPAUS
- El Paso (TX, permit): https://www.quickscores.com/downloads/elpaso_City_of_El_Paso_Ordinance_13.24__City_Parks_and_Recreation_Areas.pdf
- Denver (CO): https://www.denvergov.org/files/assets/public/v/1/parks-and-recreation/documents/park-use-rules-regulations_denver-parks-recreation.pdf
- Colorado Springs (CO): https://codelibrary.amlegal.com/codes/coloradospringsco/latest/coloradosprings_co/0-0-0-17277
- Albuquerque (NM): https://www.cabq.gov/parksandrecreation/resources-rules/city-of-albuquerque-park-ordinance
- Seattle (WA): https://library.municode.com/wa/seattle/codes/municipal_code?nodeId=TIT18PARE_CH18.12PACO
- King County Parks (WA): https://aqua.kingcounty.gov/council/clerk/code/10_Title_7.htm
- Portland (OR): https://www.portland.gov/code/20/12/100
- Metro regional parks (OR): https://www.oregonmetro.gov/sites/default/files/2026-06/metro-code-complete-effective-20260605.pdf
- Tulsa (OK): https://tulsaparks.recdesk.com/Community/Page?pageId=36855
- Oklahoma City (OK, permit): http://okc-ok.elaws.us/code/coor_ch53_arti_sec53-3
- Indianapolis (IN): https://library.municode.com/in/indianapolis_-_marion_county/codes/code_of_ordinances?nodeId=TITIIIPUHEWE_CH631PARE
- Columbus city (OH): https://library.municode.com/oh/columbus/codes/code_of_ordinances?nodeId=TIT9STPAPUPRCO_CH919PARURE_919.09DEALPR
- Cleveland city (OH): https://codelibrary.amlegal.com/codes/cleveland/latest/cleveland_oh/0-0-0-29681
- Cleveland Metroparks (OH): https://www.clevelandmetroparks.com/about/cleveland-metroparks-organization/cleveland-metroparks-police-department-safety/park-rules-regulations
- Cincinnati (OH, permit): https://www.cincinnati-oh.gov/cincyparks/news/for-the-love-of-nature-forgo-foraging-in-cincy-parks/
- Five Rivers MetroParks (OH, permit): https://www.metroparks.org/wp-content/uploads/2016/03/MetroParks-Code-Of-Ordinances-2023.pdf
- Detroit (MI): https://detroitmi.gov/departments/parks-recreation/about-parks-and-recreation/park-rules
- Huron-Clinton Metroparks (MI): https://www.metroparks.com/rules-and-regulations/
- Milwaukee County (WI): https://library.municode.com/wi/milwaukee_county/codes/code_of_ordinances?nodeId=MICOCOGEORVOI_CH47PAPA
- Memphis (TN): https://library.municode.com/tn/memphis/codes/code_of_ordinances?nodeId=TIT12STSIPUPL_CH12-84PAPARENA
- Nashville (TN): https://filetransfer.nashville.gov/portals/0/sitecontent/Parks/docs/about/PolicyManual.pdf
- Louisville (KY): https://codelibrary.amlegal.com/codes/louisvillemetro/latest/loukymetro/0-0-0-31145
- New Orleans (LA): https://library.municode.com/la/new_orleans/codes/code_of_ordinances?nodeId=PTIICO_CH106PARE
- Baltimore (MD): https://codes.baltimorecity.gov/us/md/cities/baltimore/cobra/attachments/22.08-Park_Management_and_Use.pdf
- Boston (MA): https://www.boston.gov/departments/parks-and-recreation/parks-rules-and-regulations
- Pittsburgh (PA): https://ecode360.com/45446845
- Philadelphia (PA, permit): https://www.phila.gov/media/20240228151106/Parks-and-Recreation-regulations-update-202308.pdf
- Miami (FL): http://miami-fl.elaws.us/code/coor_chco01_ch38_artii_sec38-52
- Jacksonville (FL): https://www.jacksonville.gov/Departments/Parks-and-Recreation (Ch. 28 Pt. 7)
- Tampa (FL, permit): https://library.municode.com/fl/tampa/codes/code_of_ordinances?nodeId=COOR_CH16PARE_ARTIIIFAAC_S16-51
- Raleigh (NC): https://library.municode.com/nc/raleigh/codes/code_of_ordinances?nodeId=DIVIICOGEOR_PT9PARECUAF_CH2PA
- Atlanta (GA, permit): http://atlanta.elaws.us/code/coor_ptii_ch110_artiii_div1_sec110-59
- Honolulu (HI, permit): https://codelibrary.amlegal.com/codes/honolulu/latest/honolulu/0-0-0-7060
- Omaha (NE, permit): https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=PTIIMUCO_CH21PARE
- Washington DC: https://code.dccouncil.gov/us/dc/council/code/sections/22-3310
- Cook County Forest Preserve (IL): https://library.municode.com/il/cook_county/codes/forest_preserve?nodeId=TIT3PORE
- DuPage County FPD (IL): https://www.dupageforest.org/hubfs/About/Documents/General-Use-Regulation-Ordinance-2020.pdf
- Will County FPD (IL): https://www.reconnectwithnature.org (General Use Ordinance No. 124)
- Chicago Park District (IL, permit): https://chicagoparkdistrict.com/media/35436/download?inline=
- Fairfax County Park Authority (VA, permit): https://www.fairfaxcounty.gov/parks/sites/parks/files/assets/documents/administrative/policy-appendix-regulations.pdf
- Three Rivers Park District (MN, permit): https://www.threeriversparks.org/sites/default/files/pdfs/ordinance.pdf
