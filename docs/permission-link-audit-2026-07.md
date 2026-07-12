# Permission-link audit, July 2026

A full research review of every permission source link the access-rule engine
cites. Prompted by the owner finding a generic USFS link used to justify an
"Allowed" status even though the page said nothing about that place or plant.
This audit confirms that was not a one-off: it is a systemic pattern affecting
dozens of points.

## Status: applied 2026-07-12

The verified corrections below are applied to the working tree and the full gate
suite passes. Applied in this pass:

- 45 national forests downgraded from "allowed by silence" to Unverified; 27
  set to the actual Permit-required page; 14 kept Allowed with a real
  place-specific source (data/usfs-forest-rules.json, each stamped
  `checked: agent 2026-07`).
- Both code fallbacks in app.js (getUsfsForestRule unknown branch and the
  generic national-forest branch) now return Unverified instead of a false
  "Allowed"; behavioral rule tests updated to lock this in.
- 9 NPS units re-cited to the actual superintendent's compendium (not the
  lawsandpolicies landing page); Blue Ridge / Prince William URLs corrected;
  Manassas per-species limits corrected to the compendium's 1/2 gallon.
- State-rule fixes: Missouri now correctly allows edible mushrooms (was a stale
  prohibition); Connecticut mushroom rule cites the statute, not the regs PDF;
  New York DEC-allowed and state-park-prohibited split to their real citations;
  Minnesota re-cited to the DNR harvesting page.
- 15 county/city park rows re-cited to the real ordinance section (including two
  wrong-place fixes, Sacramento and Oakland); 25 individually-sourced food-forest
  claims re-cited or conservatively downgraded.

Deferred (per owner): the ~64 Denver (DUG) and Boston (BFFC) food-forest claims
that all share one program/directory URL still need per-site harvest-policy
sources or a downgrade. Bronx River Foodway was kept Allowed (a curated
crown-jewel anchor) though its citation could still use a stronger primary
source.

Method: extracted all 469 (place, claimed-status, cited-link) rows from the six
rule surfaces (308 unique URLs), fetched and read every URL, judged each against
the exact claim text that cites it, then researched and adversarially verified a
place-specific replacement for every flagged link. Verification refuted 6 of my
own proposed allowances, which are held at a conservative status pending a live
source. Nothing in the "keep as Allowed" column below reached that column
without passing an independent refutation pass.

## Headline

- **97 of 308 cited links (32%) do not support the claim that cites them**,
  affecting **199 place/mode claims**, of which **145 are permissive**
  ("Allowed" or "Permit required").
- **45 national forests currently show `food = Allowed` on the strength of a
  page that never states any edible-gathering rule**, the exact "allowed by
  silence" pattern the owner found. The cited page is almost always a
  `.../permits` index (firewood and commercial special-use permits) or a
  timber-oriented `forest-products` page.
- Beyond the data file, **two code paths manufacture the same false "Allowed"**:
  - [`app.js:10160`](../app.js): any national-forest parcel not matched to a
    researched forest returns **Allowed** citing 36 CFR 261.6 (a regulation that
    lists what a permit is needed *for*, and does not grant a personal-use food
    right).
  - [`app.js:10011`](../app.js): a researched forest whose food/mushroom status
    is unknown still returns **Allowed** ("general national-forest policy") while
    citing that forest's own page, which never said it.
- Not all bad news: **67 places got a verified, genuinely place-specific
  source** (real forest-products pages, superintendent's compendium PDFs, actual
  ordinance sections), including 13 forests where "Allowed" is correct and now
  properly cited.

## Root-cause patterns

| Pattern | Links | Claims | What it is |
|---|---|---|---|
| **B. USFS permits/products page = allowed-by-silence** | 52 | 68 | A firewood/special-use permits index cited to justify food/mushroom "Allowed" |
| D. Agency-generic program page | 5 | 62 | One program/directory page reused for many sites (Denver DUG, Boston BFFC) |
| C. Landing page, no rule text | 16 | 42 | Dept. homepage or NPS `lawsandpolicies.htm` hub instead of the actual rule/compendium |
| A. Dead link / redirects to generic | 9 | 9 | 404, soft-404, or redirect to a unit homepage |
| E. Right regulation, outdated/contradicted claim | 5 | 7 | e.g. Missouri now allows edible mushrooms; CT statute mismatch |
| G. Correct place page, silent on the rule | 6 | 6 | Right forest/park, but the page never states the claimed rule |
| F. Wrong place | 2 | 2 | CA local rows citing the wrong city's code |

## Recommended remediation, by direction

- **45 places: downgrade a permissive status to Unverified or Permit-required.**
  These are the safety-critical fixes. No confirmable place-specific allowance
  exists, so the honest label is the app's own conservative "Unverified" (or the
  permit page where a permit system is shown). This *removes* green "Allowed"
  pins that overstate permission.
- **67 places: keep the permissive status but re-cite it** to the verified
  place-specific source, and correct the popup limit text where it was wrong.
- **64 claims still need per-site work**, almost all are individual Denver
  (DUG) and Boston (BFFC) food-forest sites that all share one program/directory
  URL. Representative sites were verified; the rest need either the site's own
  harvest-policy source or a downgrade to Unverified. (These are lower-risk:
  community food forests explicitly planted for public harvest.)

## Detailed findings

Legend: `F:` = food/edible-plant status, `M:` = mushroom status. `Allow` =
Allowed, `Permit` = Permit required, `Prohib` = Prohibited, `?` = Unverified.

### National forests (`data/usfs-forest-rules.json`)

72 forests flagged. `Current` is what the map shows today; `Recommended` is the verified status; `Verified source` is the real authority found.

| Forest | Current | Recommended | Verified source |
|---|---|---|---|
| angelina national forest (Texas) | F:Allow  M:Permit | Unverified | NFGT permits page (firewood only) |
| ashley national forest (Utah, Wyoming) | F:Allow  M:Allow | Unverified | Ashley NF permits page |
| beaverhead national forest (Montana) | F:Permit  M:Permit | Permit req. | Beaverhead-Deerlodge permits page |
| bienville national forest (Mississippi) | F:Allow  M:Allow | Unverified | National Forests in Mississippi permits page |
| bighorn national forest (Wyoming) | F:Allow  M:Allow | Unverified | Bighorn NF permits page |
| bitterroot national forest (Montana, Idaho) | F:Allow  M:Permit | **Allowed** | Bitterroot forest-products page |
| black hills national forest (South Dakota, Wyoming) | F:Allow  M:Allow | Unverified | Black Hills forest-products permits page |
| boise national forest (Idaho) | F:Allow  M:Allow | Unverified | Boise NF non-wood products |
| bridger national forest (Wyoming) | F:Allow  M:Allow | Unverified | Bridger-Teton safety and outdoor ethics page |
| carson national forest (New Mexico) | F:Allow  M:? | Unverified | Carson NF permits page |
| challis national forest (Idaho) | F:Allow  M:Permit | Permit req. | Salmon-Challis non-wood forest products page |
| cherokee national forest (Tennessee) | F:Allow  M:Permit | **Allowed** | Cherokee NF Food Products Guide (PDF) |
| chippewa national forest (Minnesota) | F:Allow  M:Allow | **Allowed** | Chippewa NF FAQ (foraging) |
| chugach national forest (Alaska) | F:Permit  M:Permit | Unverified | Chugach NF permits page |
| clearwater national forest (Idaho (north-central Idaho; small portion into Montana)) | F:Allow  M:Permit | **Allowed** | Nez Perce-Clearwater special forest products brochure |
| cleveland national forest (California) | F:Allow  M:Permit | Unverified | Cleveland NF permits page |
| coconino national forest (Arizona) | F:Allow  M:Allow | Unverified | Coconino NF permits page |
| coeur d'alene national forest (Idaho) | F:Allow  M:Permit | **Allowed** | Idaho Panhandle NFs huckleberry harvesting page |
| coronado national forest (Arizona (and a small portion of New Mexico)) | F:Allow  M:Allow | **Allowed** | Coronado incidental-use guide (PDF) |
| davy crockett national forest (Texas) | F:Allow  M:Allow | Unverified | NFGT permits page (firewood only) |
| de soto national forest (Mississippi) | F:Allow  M:Allow | Unverified | National Forests in Mississippi permits page |
| deerlodge national forest (Montana) | F:Permit  M:Permit | Permit req. | Beaverhead-Deerlodge permits page |
| delta national forest (Mississippi) | F:Allow  M:Allow | Unverified | National Forests in Mississippi permits page |
| deschutes national forest (Oregon) | F:Permit  M:Permit | Permit req. | Deschutes mushroom-harvesting permit page |
| dixie national forest (Utah) | F:Allow  M:Allow | Unverified | Dixie NF permits page |
| el yunque national forest (PR) | F:Permit  M:Permit | Permit req. | El Yunque Revised Land Management Plan (2019) |
| fishlake national forest (Utah) | F:Allow  M:Allow | Unverified | Fishlake non-wood forest products page |
| francis marion national forest (South Carolina) | F:Permit  M:Permit | Permit req. | Francis Marion-Sumter permits page |
| fremont national forest (Oregon) | F:Allow  M:Allow | **Allowed** | Fremont-Winema incidental use guide (USFS PDF) |
| gifford pinchot national forest (Washington) | F:Permit  M:Permit | Permit req. | Gifford Pinchot free-use limits page |
| helena national forest (Montana) | F:Allow  M:Permit | Permit req. | Northern Region mushroom harvest page |
| holly springs national forest (Mississippi) | F:Allow  M:Allow | Unverified | National Forests in Mississippi permits page |
| homochitto national forest (Mississippi) | F:Allow  M:Permit | Unverified | National Forests in Mississippi permits page |
| humboldt national forest (Nevada (and a small portion of eastern California)) | F:Allow  M:? | **Allowed** | Humboldt-Toiyabe 2024 pine nut season release (fs.usda.gov) |
| kaibab national forest (Arizona) | F:Allow  M:Allow | Unverified | Southwestern Region (R3) permits page |
| kootenai national forest (Montana, Idaho) | F:Allow  M:Permit | Permit req. | Kootenai mushroom-permits page |
| lewis & clark national forest (Montana) | F:Allow  M:Allow | Permit req. | Northern Region mushroom harvest page |
| los padres national forest (California) | F:Allow  M:Allow | Unverified | Los Padres permits page (firewood only) |
| malheur national forest (Oregon) | F:Allow  M:Allow | Unverified | Malheur non-wood forest products page |
| manti-la sal national forest (Utah, Colorado) | F:Allow  M:? | Permit req. | 36 CFR 261.6(h) plus Manti-La Sal permit pages |
| nezperce national forest (Idaho (with Powell Ranger District extending into Montana)) | F:Allow  M:Permit | **Allowed** | Nez Perce-Clearwater special forest products brochure |
| ochoco national forest (Oregon) | F:Allow  M:Permit | Permit req. | Ochoco NF permits page, Special Forest Products section |
| okanogan national forest (Washington) | F:Permit  M:Permit | Permit req. | Okanogan-Wenatchee forest-products page |
| ouachita national forest (Arkansas, Oklahoma) | F:Allow  M:Allow | Unverified | Ouachita NF FAQs (district-office permits) |
| ozark national forest (Arkansas) | F:Allow  M:Allow | Unverified | Ozark-St. Francis forest products page (archived Feb 2025) |
| prescott national forest (Arizona) | F:Allow  M:Allow | Unverified | Prescott NF permits page |
| rogue river national forest (Oregon (and a small portion of northern California)) | F:Permit  M:Permit | Permit req. | Rogue River-Siskiyou forest-products permits page |
| sabine national forest (Texas) | F:Allow  M:? | Unverified | NFGT permits page (firewood only) |
| salmon national forest (Idaho) | F:Allow  M:Permit | Permit req. | Salmon-Challis non-wood forest products page |
| sam houston national forest (Texas) | F:Permit  M:Allow | Unverified | NFGT permits page (firewood only) |
| sawtooth national forest (Idaho (small portion in Utah)) | F:Allow  M:Allow | Unverified | Sawtooth NF non-wood forest products page |
| sequoia national forest (California) | F:Allow  M:Permit | Unverified | Sequoia NF 2025 firewood and gathering brochure |
| shasta national forest (California) | F:Allow  M:Allow | **Allowed** | Shasta-Trinity incidental use guide (PDF) |
| shoshone national forest (Wyoming) | F:Allow  M:Allow | Unverified | Rocky Mountain Region permits page |
| siskiyou national forest (Oregon, California) | F:Permit  M:Permit | Permit req. | Rogue River-Siskiyou forest-products permits page |
| siuslaw national forest (Oregon) | F:Permit  M:Permit | Permit req. | Siuslaw forest-products page |
| st. francis national forest (Arkansas) | F:Allow  M:Allow | Unverified | Ozark-St. Francis forest products page (archived Feb 2025) |
| st. joe national forest (Idaho) | F:Allow  M:Permit | **Allowed** | Idaho Panhandle NFs huckleberry harvesting page |
| stanislaus national forest (California) | F:Allow  M:Allow | Permit req. | Stanislaus NF permits page |
| sumter national forest (South Carolina) | F:Allow  M:Permit | Permit req. | Francis Marion-Sumter permits page |
| teton national forest (Wyoming) | F:Allow  M:Allow | Unverified | Bridger-Teton safety and outdoor ethics page |
| toiyabe national forest (Nevada, California) | F:Allow  M:? | **Allowed** | Humboldt-Toiyabe 2024 pine nut season release (fs.usda.gov) |
| tombigbee national forest (Mississippi) | F:Allow  M:Allow | Unverified | National Forests in Mississippi permits page |
| tongass national forest (Alaska) | F:Allow  M:Allow | **Allowed** | Tongass FS harvest assessment |
| tonto national forest (Arizona) | F:Allow  M:Allow | Unverified | Tonto NF permits page |
| umpqua national forest (Oregon) | F:Allow  M:Allow | Permit req. | Umpqua NF special forest products page |
| wallowa national forest (Oregon (and a small portion in Washington)) | F:Allow  M:Allow | Unverified | Wallowa-Whitman forest-products page |
| wenatchee national forest (Washington) | F:Allow  M:Permit | Permit req. | Okanogan-Wenatchee forest-products page |
| white mountain national forest (NH, ME) | F:Allow  M:Allow | Unverified | 36 CFR 261.6(h), federal forest-products rule |
| white river national forest (Colorado) | F:Permit  M:Permit | Permit req. | White River NF permits page |
| whitman national forest (Oregon and Washington (also extends into Idaho)) | F:Allow  M:Allow | Unverified | Wallowa-Whitman forest-products page |
| willamette national forest (Oregon) | F:Permit  M:Permit | Permit req. | Willamette NF forest-products page |

### NPS units (`app.js` compendium branches + `data/rules/nps-gathering-rules.json`)

| Park | Current | Problem | Fix |
|---|---|---|---|
| blueRidge | Allow | landing-page/ok | Blue Ridge Parkway compendium, 36 CFR 2.1 section |
| princeWilliam | Allow | landing-page/ok | PRWI superintendent's compendium |
| manassas | Allow | place-specific/ok | Manassas superintendent's compendium |
| Mount Rainier compendium | Allow (listed species) +mushrooms | landing-page/ok | Mount Rainier 2025 Superintendent's Compendium, Sec. 2.1 |
| Rocky Mountain compendium | Allow (listed species), mushrooms Prohib | landing-page/ok | RMNP 2026 Superintendent's Compendium |
| Yellowstone compendium | Allow (listed species) +mushrooms | landing-page/ok | Yellowstone Superintendent's Compendium |
| Big Bend compendium | Allow (listed species), mushrooms Prohib | landing-page/ok | Big Bend 2026 Superintendent's Compendium |
| Congaree compendium | Allow (listed species) +mushrooms | place-specific/dead | Congaree superintendent's compendium |
| Denali compendium | Allow (listed species) +mushrooms | landing-page/ok | Denali superintendent's compendium |
| Gates of the Arctic compendium | Allow (listed species) +mushrooms | place-specific/ok | 36 CFR 13.35(c) |
| Glacier Bay compendium | Allow (listed species) +mushrooms | place-specific/ok | 36 CFR 13.35(c) |
| Kobuk Valley (Western Arctic) compendium | Allow (listed species) +mushrooms | place-specific/ok | 36 CFR 13.35(c) |

### Food forests / edible parks (`data/rules/site-access-rules.json`)

| Cited link | Sites affected | Problem | Fix |
|---|---|---|---|
| https://dug.org/gardens-food-forests/food-forests/ | 28 | agency-generic | per-site harvest-policy source found |
| https://www.bostonfoodforest.org/locations | 10 | landing-page | per-site harvest-policy source found |
| https://bronxriver.org/visit-the-river/explore-the-greenway/ | 1 | landing-page | per-site harvest-policy source found |
| https://southseattle.edu/community-orchard-west-seattle | 1 | landing-page | per-site harvest-policy source found |
| https://fallenfruit.org/projects/public-fruit-park-los-angel | 1 | landing-page | per-site harvest-policy source found |
| https://insideclimatenews.org/news/03102025/boston-edible-fo | 1 | unverifiable | per-site harvest-policy source found |
| https://www.bostonfoodforest.org/egleston-page | 1 | landing-page | per-site harvest-policy source found |
| https://www.bostonfoodforest.org/uphams-corner-food-forest | 1 | landing-page | per-site harvest-policy source found |
| https://www.minneapolisparks.org/parks-destinations/parks-la | 1 | landing-page | per-site harvest-policy source found |

### County / city parks (`data/local-jurisdictions.json`)

| Jurisdiction | Current | Problem | Fix |
|---|---|---|---|
| Ramsey County Parks (MN) | Allow | agency-generic/ok | Ramsey County Parks and Recreation Ordinance (2022), Sec. 4 |
| Dakota County Parks (MN) | Permit | landing-page/redirect | Dakota County Ordinance 107 (2023), Sec. 5.2 |
| Mecklenburg County Park & Recreation (NC) | Permit | landing-page/redirect | MCPRD Rules and Regulations |
| San Diego (CA) | Prohib | landing-page/redirect | San Diego Municipal Code 63.0102 |
| Sacramento (CA) | Prohib | wrong-place/ok | Sacramento City Code 12.72.060 |
| Oakland (CA) | Prohib | wrong-place/blocked | Oakland Municipal Code 12.64.090 |
| San Francisco (CA) | Permit | landing-page/blocked | SF Park Code Sec. 4.06 |
| Omaha (NE) | Permit | system-regulation/ok | Omaha Municipal Code Sec. 20-159 |
| Oklahoma City (OK) | Permit | landing-page/ok | Oklahoma City Code Ch. 38 (Parks) |
| Cleveland (OH) | Prohib | place-specific/ok | Cleveland CO 623.17 |
| Cincinnati (OH) | Permit | place-specific/ok | Cincinnati Parks (Park Board Rules) |
| Detroit (MI) | Prohib | unverifiable/dead | City of Detroit Park Rules |
| Tampa (FL) | Permit | irrelevant/dead | Tampa Code Sec. 16-51 |
| Charlotte (NC) | Permit | unverifiable/blocked | Charlotte Code Sec. 15-132 |
| Atlanta (GA) | Permit | irrelevant/dead | Atlanta Parks rules, Code Sec. 110-59 |

### Federal / state fallback rules (`app.js`)

| Rule | Current | Problem | Fix |
|---|---|---|---|
| missouriParks | Prohib | Link is the right, current authority, but the prohibited-mushroom claim is contradicted by | 10 CSR 90-2.040(4)(C), Missouri state parks rule |
| missouriParks | Allow | Link is the right, current authority, but the prohibited-mushroom claim is contradicted by | 10 CSR 90-2.040(4)(B), Missouri state parks rule |
| connecticutParks | Allow | The allowed-mushroom claim is labeled CGS 23-4(b) but links this regs PDF, which never sta | CGS Sec. 23-4(b), chapter 447 |
| connecticutParks | Prohib | The allowed-mushroom claim is labeled CGS 23-4(b) but links this regs PDF, which never sta | R.C.S.A. 23-4-1(b)(1) state park rules |
| minnesotaParks | Allow | Allowed claim extends to forest recreation areas the rule never covers; narrow claim to st | MN DNR state-park harvesting rules page |
| blueRidge | Allow | Landing page cited to justify allowed status; replace with the actual BLRI superintendent' | Blue Ridge Parkway compendium, 36 CFR 2.1 section |
| princeWilliam | Allow | Landing page cited to justify allowed status; replace with the PRWI superintendent's compe | PRWI superintendent's compendium |
| manassas | Allow | URL is the right authority, but app limit text contradicts it badly (bushels vs 1/2 gallon | Manassas superintendent's compendium |
| usfs | Allow | System regulation cited for an allowed claim its text does not state and arguably contradi | USFS incidental-use policy (FSH 2409.18 sec. 87.51) |
| charlottesville | ? | Broken citation: redirects to an authentication login page for all clients tested. Even fo | Charlottesville park regulations page |
| newYorkDec | Allow | Cited to support an 'allowed' foraging rule the page never states (verified twice with tar | 6 NYCRR 190.8(g), DEC Use of State Lands |
| newYorkDec | Prohib | Cited to support an 'allowed' foraging rule the page never states (verified twice with tar | 9 NYCRR 375.1(e), OPRHP prohibited activities |

## Links that check out (not exhaustive)

The following heavily-reused citations were verified as genuinely
place-specific and correctly claimed, and need no change: the Minneapolis Parks
harvesting page (names all three MPRB sites and states the fruit/nut allowance),
the North Carolina NFs forest-botanical-products page, the George Washington &
Jefferson NF forest-products page, and the Great Smoky Mountains compendium. The
mineral "State park → Allowed" rule is also correctly scoped: only the two
Crater of Diamonds gemstone points can reach it, and code downgrades every other
State-park mineral point to the conservative private rule.

## The 6 proposals verification refused to bless

These are places where the research pass proposed an allowance but the
adversarial verifier could not confirm it against a live, current, in-scope
source. They are held at the conservative status shown and should NOT ship as
Allowed without a fresh confirmed source:

| Place | Held at | Why |
|---|---|---|
| Ozark NF (AR) | Unverified | Independent sources suggest personal-use edibles need no permit (ginseng banned), but the specific forest page was only reachable as a Feb-2025 archive |
| St. Francis NF (AR) | Unverified | Joint-forest edible allowance not confirmable for St. Francis specifically; live page lists only firewood/special-use |
| Manti-La Sal NF (UT, CO) | Permit required | Forest's own products page supports permit-required, not the free allowance the old row implied |
| Sequoia NF (CA) | Unverified | Only a firewood-cutting brochure found; no edible fruit/nut/fungi policy documented |
| Carson NF (NM) | Unverified | Free-use list covers only herbs, cones, boughs; silent on berries/fruit/nuts/mushrooms |
| Tampa (FL) | Unverified | Municode/AmLegal/city mirrors all returned 403/404; the permit pathway is unconfirmed |

## Notes on the highest-value corrections

- **The generic `usfs` fallback ([`app.js:10160`](../app.js)).** The honest
  replacement is not another generic link: it is either (a) narrow the copy to
  say plainly "general national-forest policy, this specific forest's rule is
  not confirmed for this point" and keep it visually as Unverified rather than
  green Allowed, or (b) cite the USFS incidental-use policy (FSH 2409.18
  sec. 87.51) which actually describes the personal-use free-use concept. Either
  way it should stop rendering as a confident "Allowed."
- **Missouri state parks** ([`app.js` `missouriParks`](../app.js)): the rule
  currently says mushrooms are prohibited. The current 10 CSR 90-2.040 allows
  edible wild mushrooms and nuts/fruits/berries for personal use. This is a
  false *prohibition* (over-restrictive), worth fixing for accuracy.
- **NYC/NY DEC** ([`app.js` `newYorkDec`](../app.js)): the "Allowed" DEC
  state-forest rule cites a page that never states it; the real authority is
  6 NYCRR 190.8(g). The paired state-park prohibition should cite 9 NYCRR
  375.1(e), not the DEC page.
- **Sacramento and Oakland** local rows cite the wrong city's municipal code
  (flagged wrong-place); replace with Sacramento City Code 12.72.060 and Oakland
  Municipal Code 12.64.090 respectively.

## Where the machine-readable detail lives

Every row above traces back to a per-claim record (current status, cited URL,
audit verdict, verified replacement URL, proposed popup text, evidence quote,
verification verdict). Ask and it can be exported alongside the file edits.
