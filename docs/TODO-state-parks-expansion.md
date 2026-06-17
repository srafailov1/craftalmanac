# Work order: complete state-park foraging rules (50-state coverage)

Owner tier: Codex (multi-branch edit to one function, inside guardrails). Author:
Claude (2026-06-16 state-park research pass). Branch: `main`.

Rule **semantics** are Claude-owned and finalized in
`docs/permissions-research-2026-06-state-parks.md`. This order is the encode/fix
step plus the data-regen gate. Don't re-derive statuses; escalate doubts via
`docs/codex-questions.md`.

## Background

`getStateSystemRule(stateCode, text, area)` (app.js ~6259) resolves a state-land
permission from the Census `stateCode` plus PAD-US land-type `text.includes(...)`
predicates, with food/craft/medicine mode handling. **11 states are encoded**
(NY, PA, WA, CA, CO, IL, OR, MD, NC, MI, MN). The research mapped all 50; this
order adds the **39 missing states**, **fixes 1 stale encoded rule (Oregon)**,
and adds **species-aware handling** for the three category-split states.

Final landscape (verified): 18 allowed · 4 allowed-if-posted · 3 permit-required
· 25 prohibited. The single call site is [app.js:6106](../app.js); `species` is
already in scope there.

## Phase 0 — Fix the stale Oregon limit (existing code)

OAR 736-010-0055 was amended (PRD 3-2025, eff. **March 12, 2025**): the personal
limit dropped from 5 gallons to **1 gallon/person/day**. In the OR food-mode
branch (~app.js 6422), change:

- `"...edibles: up to 5 gallons per person per day for personal consumption..."`
  → `"...edibles: up to 1 gallon per person per day for personal consumption..."`
- Update the note to reference the current 1-gallon limit.

## Phase 1 — Make the resolver species-aware (for the category splits)

Three states split by species category and cannot be expressed by a single
per-mode status:

- **Missouri** — fruit/berries/seeds/nuts allowed, **mushrooms prohibited**.
- **Connecticut** — plants/berries prohibited, **mushrooms allowed** (inverse).
- **Hawaii** and **Tennessee** — fruits/berries allowed, mushrooms **not named**
  → exclude mushrooms conservatively (same one-liner).

Change the signature and the one call site:

```js
// app.js ~6106
const stateRule = getStateSystemRule(stateCode, text, area, species);
// app.js ~6259
function getStateSystemRule(stateCode, text, area, species) {
```

`species.category === "mushroom"` is the test (same convention as
`getNpsCompendiumRule`). Branches that don't split by category ignore the new
param — no behavior change for the existing 11 states.

## Phase 2 — Add the allowed / posted / permit / split branches

Paste these into `getStateSystemRule` (anywhere among the existing `if
(stateCode === ...)` blocks; order is irrelevant since each guards on a distinct
`stateCode`). Convention for food-only allowances: `if (!foodMode) return null;`
matches the encoded MI/PA/WA branches (craft/medicine fall through). Optional
hardening: return an explicit prohibited for non-food — not required here.

```js
  // ===== 2026-06-16 state-park completion pass =====

  // --- Allowed: personal-use edibles (mushrooms included) ---
  if (stateCode === "AK" && text.includes("state park")) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Berries, fruits, mushrooms, and similar edibles may be gathered for personal consumption (not for sale); the state-park rule sets no quantity limit.",
      note: "Alaska state parks allow personal-use gathering of edibles under 11 AAC 12.170(b); other plants and natural objects remain protected.",
      sourceLabel: "11 AAC 12.170", sourceUrl: ACCESS_RULE_SOURCES.alaskaParks };
  }
  if (stateCode === "IN" && (text.includes("state park") || text.includes("state recreation"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Berries, fruits, nuts, fallen cones, mushrooms, leaves, and greens may be collected for personal use; flower-picking and other plant collection remain prohibited.",
      note: "Indiana state parks (DNR properties) exempt listed edible items from the plant-collection prohibition under 312 IAC 8-2-10.",
      sourceLabel: "312 IAC 8-2-10", sourceUrl: ACCESS_RULE_SOURCES.indianaDnr };
  }
  if (stateCode === "IA" && (text.includes("state park") || text.includes("state recreation"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Mushrooms and asparagus may be harvested system-wide; fruits, nuts, and berries may be gathered for personal use unless a sign is posted prohibiting it.",
      note: "Iowa lands under Natural Resource Commission jurisdiction allow personal-use foraging under 571 IAC 54.1-54.2; dedicated state preserves are excluded.",
      sourceLabel: "Iowa Admin. Code 571—54", sourceUrl: ACCESS_RULE_SOURCES.iowaDnr };
  }
  if (stateCode === "KS" && (text.includes("state park") || text.includes("state recreation"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Noncommercial gathering of edible wild plants, wild fruits, nuts, or fungi for human consumption is permitted; commercial gathering is prohibited.",
      note: "Kansas excepts personal-use edible foraging from the vegetation-removal prohibition under K.A.R. 115-8-20(a)(4)(F).",
      sourceLabel: "K.A.R. 115-8-20", sourceUrl: ACCESS_RULE_SOURCES.kansasParks };
  }
  if (stateCode === "OH" && (text.includes("state park") || text.includes("state recreation"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Berries, fruit, tree nuts, and mushrooms (plus ground pine cones) may be gathered during daylight hours for personal use, not commercial.",
      note: "Ohio state parks permit personal-use foraging of listed edibles under Ohio Admin. Code 1501:46-3-10, except where a unit posts a restriction.",
      sourceLabel: "Ohio Admin. Code 1501:46-3-10", sourceUrl: ACCESS_RULE_SOURCES.ohioParks };
  }
  if (stateCode === "OK" && (text.includes("state park") || text.includes("state recreation"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Nuts, edible plants, and fungi may be foraged for personal consumption on state-managed public land (certified agricultural crops and protected species excluded).",
      note: "Oklahoma legalized personal-use foraging on state-managed public land in 2025 (61 O.S. § 335, SB 447, effective Nov 1 2025).",
      sourceLabel: "61 O.S. § 335 (SB 447, 2025)", sourceUrl: ACCESS_RULE_SOURCES.oklahomaParks };
  }
  if (stateCode === "VT" && (text.includes("state park") || text.includes("state forest"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Wild berries, fruits, seeds, nuts, and mushrooms may be collected for personal use; uprooting or cutting whole plants requires a written FPR permit.",
      note: "Vermont FPR-administered lands (state parks and forests) allow personal-use edible collection under 12-020-009 Code Vt. R.",
      sourceLabel: "12-020-009 Code Vt. R.", sourceUrl: ACCESS_RULE_SOURCES.vermontParks };
  }
  if (stateCode === "VA" && (text.includes("state park") || text.includes("state recreation"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Edible fruits, berries, fungi, and nuts may be collected for personal or individual use only; commercial collection is prohibited.",
      note: "Virginia state parks permit personal-use edible foraging under 4VAC5-30-50; all other plant material requires a permit. (Natural area preserves may be stricter — check postings.)",
      sourceLabel: "4VAC5-30-50", sourceUrl: ACCESS_RULE_SOURCES.virginiaParks };
  }
  if (stateCode === "WI" && (text.includes("state park") || text.includes("state forest") || text.includes("state recreation") || text.includes("state trail") || text.includes("state natural area"))) {
    if (!foodMode) return null;
    return { status: "allowed", label: "Allowed", area,
      limit: "Edible fruits, edible nuts, wild mushrooms, wild asparagus, and watercress may be hand-collected for personal consumption.",
      note: "Wisconsin DNR lands except personal-use edibles from the plant-protection rule under NR 45.04(1s)(a)1.",
      sourceLabel: "Wis. Admin. Code NR 45.04", sourceUrl: ACCESS_RULE_SOURCES.wisconsinDnr };
  }

  // --- Allowed with a mushroom split (need the species param) ---
  if (stateCode === "MO" && (text.includes("state park") || text.includes("state historic site"))) {
    if (!foodMode) return null;
    if (species.category === "mushroom") {
      return { status: "prohibited", label: "Prohibited", area,
        limit: "Mushrooms are not covered by Missouri's in-park foraging exception; only wild edible fruit, berries, seeds, and nuts may be collected.",
        note: "Missouri's edible exception (10 CSR 90-2.040(4)(B)) names fruit, berries, seeds, and nuts only — not fungi.",
        sourceLabel: "10 CSR 90-2.040", sourceUrl: ACCESS_RULE_SOURCES.missouriParks };
    }
    return { status: "allowed", label: "Allowed", area,
      limit: "Wild edible fruit, berries, seeds, and nuts: up to a one-gallon container per person for personal consumption (no roots/below-ground parts, no commercial harvest, no mushrooms).",
      note: "Missouri state parks allow personal-use collection of wild edible fruit, berries, seeds, and nuts under 10 CSR 90-2.040(4)(B).",
      sourceLabel: "10 CSR 90-2.040", sourceUrl: ACCESS_RULE_SOURCES.missouriParks };
  }
  if (stateCode === "HI" && (text.includes("state park") || text.includes("state recreation") || text.includes("state historical park") || text.includes("state wayside") || text.includes("state monument"))) {
    if (!foodMode) return null;
    if (species.category === "mushroom") {
      return { status: "prohibited", label: "Prohibited", area,
        limit: "Mushrooms are not named in Hawaii's renewable-natural-products allowance; treat mushroom collection as not permitted without local confirmation.",
        note: "HAR 13-146-32(c) lists fruits, berries, flowers, seeds, etc. — not fungi; the project excludes mushrooms conservatively.",
        sourceLabel: "HAR 13-146-32", sourceUrl: ACCESS_RULE_SOURCES.hawaiiParks };
    }
    return { status: "allowed", label: "Allowed", area,
      limit: "Reasonable quantities of renewable natural products (fruits, berries, flowers, seeds, pine cones, seaweeds, driftwood) for personal use; sale prohibited.",
      note: "Hawaii state parks allow personal-use gathering of renewable natural products under HAR 13-146-32(c).",
      sourceLabel: "HAR 13-146-32", sourceUrl: ACCESS_RULE_SOURCES.hawaiiParks };
  }
  if (stateCode === "TN" && (text.includes("state park") || text.includes("state recreation") || text.includes("state natural area"))) {
    if (!foodMode) return null;
    if (species.category === "mushroom") {
      return { status: "prohibited", label: "Prohibited", area,
        limit: "Mushrooms are not named in Tennessee's renewable-products allowance; treat mushroom collection as not permitted without local confirmation.",
        note: "Tenn. Comp. R. & Regs. 0400-02-02-.18(3) names fruits, berries, and driftwood — not fungi; the project excludes mushrooms conservatively.",
        sourceLabel: "Tenn. Comp. R. & Regs. 0400-02-02-.18", sourceUrl: ACCESS_RULE_SOURCES.tennesseeParks };
    }
    return { status: "allowed", label: "Allowed", area,
      limit: "Reasonable quantities of renewable natural products (fruits, berries, driftwood, and similar) for personal use; commercial collection prohibited.",
      note: "Tennessee state parks allow personal-use gathering of renewable natural products under Tenn. Comp. R. & Regs. 0400-02-02-.18(3).",
      sourceLabel: "Tenn. Comp. R. & Regs. 0400-02-02-.18", sourceUrl: ACCESS_RULE_SOURCES.tennesseeParks };
  }

  // --- Connecticut: mushrooms allowed, all other foraging prohibited ---
  if (stateCode === "CT" && (text.includes("state park") || text.includes("state forest"))) {
    if (foodMode && species.category === "mushroom") {
      return { status: "allowed", label: "Allowed", area,
        limit: "Mushroom collection is permitted in Connecticut state parks and forests; other plant, berry, and vegetation collection is prohibited.",
        note: "Connecticut bars removing vegetation (R.C.S.A. § 23-4-1(b)(1)) but Conn. Gen. Stat. § 23-4(b) expressly allows mushroom collection.",
        sourceLabel: "Conn. Gen. Stat. § 23-4(b)", sourceUrl: ACCESS_RULE_SOURCES.connecticutParks };
    }
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing vegetation, berries, fruits, or other plant material from Connecticut state parks and forests is prohibited; only mushroom collection is excepted.",
      note: "R.C.S.A. § 23-4-1(b)(1) protects all park vegetation; the only statutory exception (Conn. Gen. Stat. § 23-4(b)) is for mushrooms.",
      sourceLabel: "R.C.S.A. § 23-4-1", sourceUrl: ACCESS_RULE_SOURCES.connecticutParks };
  }

  // --- Allowed only where posted/designated -> render prohibited + caveat ---
  if (stateCode === "GA" && (text.includes("state park") || text.includes("state historic site"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Collecting plants or plant parts is prohibited in Georgia state parks unless a site manager has designated specific fruits or berries for that unit.",
      note: "Ga. Comp. R. & Regs. r. 391-5-1-.04 protects all plant material; any foraging exception is discretionary and unit-specific — check posted rules. Mushrooms are not covered.",
      sourceLabel: "Ga. Comp. R. & Regs. r. 391-5-1-.04", sourceUrl: ACCESS_RULE_SOURCES.georgiaParks };
  }
  if (stateCode === "NE" && (text.includes("state park") || text.includes("state historical park") || text.includes("state recreation"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing plant matter is prohibited in Nebraska state park areas unless specifically posted or permitted.",
      note: "163 Neb. Admin. Code ch. 5 § 001.14 protects plant matter and its products; foraging is allowed only where posted/permitted.",
      sourceLabel: "163 Neb. Admin. Code ch. 5 § 001.14", sourceUrl: ACCESS_RULE_SOURCES.nebraskaParks };
  }
  if (stateCode === "WY" && (text.includes("state park") || text.includes("state historic site") || text.includes("state recreation") || text.includes("state archaeological"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Collecting plants is prohibited in Wyoming state parks except fruits and berries the superintendent has specifically designated for personal consumption.",
      note: "024-1 Wyo. Code R. § 1-15 protects vegetation; only superintendent-designated fruits and berries may be gathered (no mushrooms) — check the unit.",
      sourceLabel: "024-1 Wyo. Code R. § 1-15", sourceUrl: ACCESS_RULE_SOURCES.wyomingParks };
  }

  // --- Permit-required ---
  if (stateCode === "NM" && text.includes("state park")) {
    return { status: "permit-required", label: "Permit required", area,
      limit: "Removing any plant or natural object from a New Mexico state park is prohibited except under a research/collection permit; foraging is not authorized.",
      note: "19.5.2.43 NMAC allows collection only by permit; no personal-use or edible foraging exception exists.",
      sourceLabel: "19.5.2.43 NMAC", sourceUrl: ACCESS_RULE_SOURCES.newMexicoParks };
  }
  if (stateCode === "SC" && text.includes("state park")) {
    return { status: "permit-required", label: "Permit required", area,
      limit: "Gathering any plant or plant part in a South Carolina state park is unlawful except by a permit issued by the department.",
      note: "S.C. Code Ann. § 51-3-145(D) bars all plant gathering without a department permit; no personal-use exception.",
      sourceLabel: "S.C. Code Ann. § 51-3-145(D)", sourceUrl: ACCESS_RULE_SOURCES.southCarolinaParks };
  }
  if (stateCode === "WV" && (text.includes("state park") || text.includes("state recreation") || text.includes("state forest"))) {
    return { status: "permit-required", label: "Permit required", area,
      limit: "Removing any plant or natural object from a West Virginia state park is prohibited except with prior written authorization.",
      note: "W. Va. Code R. § 58-31-2 bars removal of plants and natural objects absent written authorization or lawful hunting/fishing take.",
      sourceLabel: "W. Va. Code R. § 58-31-2", sourceUrl: ACCESS_RULE_SOURCES.westVirginiaParks };
  }
```

## Phase 3 — Add the 20 plain-prohibited states (template + table)

Each is a uniform prohibition (all modes). Stamp this template once per row,
substituting `CODE`, predicates, the limit/note citation, and the source
constant. Predicate is `text.includes("state park")` unless the row adds more.

```js
  if (stateCode === "CODE" && text.includes("state park")) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a STATE state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "CITATION protects all park vegetation; foraging is not permitted in STATE state parks.",
      sourceLabel: "CITATION", sourceUrl: ACCESS_RULE_SOURCES.SRC };
  }
```

| CODE | State | extra predicates | CITATION (sourceLabel) | SRC constant |
|---|---|---|---|---|
| AL | Alabama | — | Ala. Admin. Code r. 220-5-.07(3) | alabamaParks |
| AZ | Arizona | — | A.A.C. R12-8-103 | arizonaParks |
| AR | Arkansas | — | Ark. Admin. Code Title 3, Subpart 10 | arkansasParks |
| DE | Delaware | — | 7 Del. Admin. Code 9201-17.3 | delawareParks |
| FL | Florida | `state preserve`, `state reserve` | Fla. Admin. Code R. 62D-2.013 | floridaParks |
| ID | Idaho | `state recreation` | IDAPA 26.01.20.125 | idahoParks |
| KY | Kentucky | — | KRS 433.750 | kentuckyParks |
| LA | Louisiana | — | LAC Title 25, Pt. IX, § 303.B | louisianaParks |
| ME | Maine | `state historic site` | C.M.R. 01-670, ch. 1, § 1 | maineParks |
| MA | Massachusetts | `state forest`, `state reservation` | 302 CMR 12.04 | massachusettsParks |
| MS | Mississippi | — | 40 Miss. Admin. Code Pt. 6, R. 1.2 | mississippiParks |
| MT | Montana | — | ARM 12.12.106 | montanaParks |
| NV | Nevada | `state recreation` | NRS 407.250 / NAC 407 | nevadaParks |
| NH | New Hampshire | — | N.H. Code Admin. R. Res 7301.05 | newHampshireParks |
| NJ | New Jersey | `state forest` | N.J.A.C. 7:2-2.10(a) | newJerseyParks |
| ND | North Dakota | — | N.D. Admin. Code 58-02-08-10 | northDakotaParks |
| RI | Rhode Island | — | 250-RICR-100-00-7 § 7.20 | rhodeIslandParks |
| SD | South Dakota | `state recreation` | SDAR 41:03:01:05 | southDakotaParks |
| TX | Texas | `state recreation` | 31 TAC 59.134(l)(1) | texasParks |
| UT | Utah | — | Utah Admin. Code R651-620-2 | utahParks |

## Phase 4 — `ACCESS_RULE_SOURCES` additions

Add one URL constant per new state (39 total), using the `SRC` names above and
the allowed/posted/permit branch names (`alaskaParks`, `indianaDnr`, `iowaDnr`,
`kansasParks`, `ohioParks`, `oklahomaParks`, `vermontParks`, `virginiaParks`,
`wisconsinDnr`, `missouriParks`, `hawaiiParks`, `tennesseeParks`,
`connecticutParks`, `georgiaParks`, `nebraskaParks`, `wyomingParks`,
`newMexicoParks`, `southCarolinaParks`, `westVirginiaParks`). URLs are in the
**Appendix** at the end of this file. Also add matching
`ATTRIBUTION.md` rows (state-park regulation, public record / state government
work; "access-rule summary, not harvest permission" framing as with existing
state rows).

## Phase 5 — Regenerate access-status data (gate)

Permission rules changed, so rerun both:

```
node scripts/build_access_status.mjs
node scripts/build_status_raster.mjs
```

Bump the `app.js` cache token in `index.html`, then `bash scripts/check.sh`
(exit 0). State-park polygons are well-represented in PAD-US, so unlike the NPS
parks these rules will visibly change overview coverage in many states.

## Acceptance

- `node --check app.js` passes; `getStateSystemRule` signature takes `species`
  and the call site passes it.
- Oregon limit reads 1 gallon (Phase 0).
- Spot-checks via the rule path (extend `scripts/test_rules.mjs`): a `blackberry`
  in `"state park"` text resolves **allowed** for AK/IN/OH/VA/WI; **prohibited**
  for AL/FL/TX/NY; a mushroom species resolves **prohibited** in MO and
  **allowed** in CT; **allowed** in OH.
- `bash scripts/check.sh` exits 0.

## Boundaries

- **Do not** change rule statuses/limits — finalized in
  `docs/permissions-research-2026-06-state-parks.md`. Doubts →
  `docs/codex-questions.md`.
- **Do not** alter the existing 11 encoded states except the Oregon limit fix.
- The species param is for the three category splits only; existing branches must
  behave identically (they ignore it).
- Keep `getStateSystemRule`'s "specific prohibition wins" interaction with
  `getBestPublicLandAccessRule` intact — adding state prohibitions is consistent
  with it.

## Appendix — primary source URLs for `ACCESS_RULE_SOURCES` (39 new states)

Each is the primary regulation fetched and verified this pass. NC, TN, TX, and UT
were independently re-verified in a second run (all confirmed; UT citation
refined to Utah Admin. Code R651-620-2).

- `alaskaParks` (AK Alaska, allowed): https://www.law.cornell.edu/regulations/alaska/11-AAC-12.170
- `hawaiiParks` (HI Hawaii, allowed): https://dlnr.hawaii.gov/ecosystems/files/2013/09/HRS13-146_State-Parks.pdf
- `indianaDnr` (IN Indiana, allowed): https://www.law.cornell.edu/regulations/indiana/312-IAC-8-2-10
- `iowaDnr` (IA Iowa, allowed): https://www.legis.iowa.gov/docs/iac/chapter/571.54.pdf
- `kansasParks` (KS Kansas, allowed): https://www.law.cornell.edu/regulations/kansas/K-A-R-115-8-20
- `missouriParks` (MO Missouri, allowed*): https://www.sos.mo.gov/cmsimages/adrules/csr/current/10csr/10c90-2.pdf
- `ohioParks` (OH Ohio, allowed): https://codes.ohio.gov/ohio-administrative-code/rule-1501:46-3-10
- `oklahomaParks` (OK Oklahoma, allowed): https://www.oklegislature.gov/cf_pdf/2025-26%20ENR/SB/SB447%20ENR.PDF
- `tennesseeParks` (TN Tennessee, allowed*): https://publications.tnsosfiles.com/rules/0400/0400-02/0400-02-02.20210422.pdf
- `vermontParks` (VT Vermont, allowed): https://www.law.cornell.edu/regulations/vermont/12-009-Code-Vt-R-12-020-009-X
- `virginiaParks` (VA Virginia, allowed): https://law.lis.virginia.gov/admincode/title4/agency5/chapter30/section50/
- `wisconsinDnr` (WI Wisconsin, allowed): https://docs.legis.wisconsin.gov/code/admin_code/nr/001/45/04
- `georgiaParks` (GA Georgia, allowed-if-posted): https://rules.sos.ga.gov/gac/391-5-1
- `nebraskaParks` (NE Nebraska, allowed-if-posted): https://www.law.cornell.edu/regulations/nebraska/163-Neb-Admin-Code-ch-5-SS-001
- `wyomingParks` (WY Wyoming, allowed-if-posted): https://www.law.cornell.edu/regulations/wyoming/024-1-Wyo-Code-R-SS-1-15
- `newMexicoParks` (NM New Mexico, permit-required): https://www.emnrd.nm.gov/wp-content/uploads/sites/7/19.5.2_integrated_appvdDBpublished6252019.pdf
- `southCarolinaParks` (SC South Carolina, permit-required): https://www.scstatehouse.gov/code/t51c003.php
- `westVirginiaParks` (WV West Virginia, permit-required): https://www.law.cornell.edu/regulations/west-virginia/W-Va-C-S-R-SS-58-31-2
- `connecticutParks` (CT Connecticut, prohibited; mushrooms allowed): https://eregulations.ct.gov/eRegsPortal/Browse/getDocument?guid=%7B3C64A5F8-B731-4393-A6AB-EA64B91A3F63%7D
- `alabamaParks` (AL Alabama, prohibited): https://www.outdooralabama.com/sites/default/files/Enforcement/STATE%20PARKS%20DIVISION%20REG%20FOR%20LE%20PAGE.pdf
- `arizonaParks` (AZ Arizona, prohibited): https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R12-8-103
- `arkansasParks` (AR Arkansas, prohibited): https://www.arkansas.com/state-parks/about/rules-regulations
- `delawareParks` (DE Delaware, prohibited): https://www.law.cornell.edu/regulations/delaware/7-Del-Admin-Code-SS-9201-17.0
- `floridaParks` (FL Florida, prohibited): http://flrules.elaws.us/fac/62d-2.013/
- `idahoParks` (ID Idaho, prohibited): https://adminrules.idaho.gov/rules/current/26/260120.pdf
- `kentuckyParks` (KY Kentucky, prohibited): https://parks.ky.gov/parks/regulations
- `louisianaParks` (LA Louisiana, prohibited): https://www.lastateparks.com/sites/default/files/2023-09/OSP%20Title25v01-11.pdf
- `maineParks` (ME Maine, prohibited): https://www.law.cornell.edu/regulations/maine/C-M-R-01-670-ch-1
- `massachusettsParks` (MA Massachusetts, prohibited): https://www.law.cornell.edu/regulations/massachusetts/302-CMR-12-04
- `mississippiParks` (MS Mississippi, prohibited): https://www.law.cornell.edu/regulations/mississippi/40-Miss-Code-R-SS-6-1-2
- `montanaParks` (MT Montana, prohibited): https://fwp.mt.gov/binaries/content/assets/fwp/commission/2023/dec/public-use-rules-arm/final_12-603adp_11.16.2023.pdf
- `nevadaParks` (NV Nevada, prohibited): https://www.leg.state.nv.us/nrs/nrs-407.html
- `newHampshireParks` (NH New Hampshire, prohibited): https://www.nhstateparks.org/getmedia/78550992-2128-4844-97e3-ab8fde083a17/Res-7300-Parks-and-Rec-Adopted-Rule-eff-030114.aspx
- `newJerseyParks` (NJ New Jersey, prohibited): https://dep.nj.gov/wp-content/uploads/rules/rules/njac7_2.pdf
- `northDakotaParks` (ND North Dakota, prohibited): https://ndlegis.gov/information/acdata/pdf/58-02-08.pdf
- `rhodeIslandParks` (RI Rhode Island, prohibited): https://rules.sos.ri.gov/regulations/Part/250-100-00-7
- `southDakotaParks` (SD South Dakota, prohibited): https://sdlegislature.gov/Rules/Administrative/41:03:01
- `texasParks` (TX Texas, prohibited): https://www.law.cornell.edu/regulations/texas/31-Tex-Admin-Code-SS-59-134
- `utahParks` (UT Utah, prohibited): https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R651-620-2

\* Missouri & Tennessee use the species-aware mushroom split (Phase 1).
