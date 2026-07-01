# Attribution and Data-Use Notes

This prototype combines live and cached public-interest data. It is non-commercial, but attribution and use limits still matter.

## iNaturalist

The map queries the supported iNaturalist API at runtime and links each observation back to its iNaturalist observation page. iNaturalist states that user-contributed content remains owned by the contributor and, unless otherwise specified, is licensed under Creative Commons Attribution-NonCommercial (CC BY-NC). Do not reuse photos or other media from iNaturalist without checking the license on the individual observation.

The local phenology histograms in `data/phenology/` are derived from aggregated iNaturalist observation counts returned by the histogram API. They do not include observation records, photos, observer names, or media; keep the derived use non-commercial, credit iNaturalist and its contributors, and do not imply that iNaturalist endorses the app.

Source: https://www.inaturalist.org/pages/api+reference and https://www.inaturalist.org/pages/terms

## NOAA CO-OPS Tide Stations and Predictions

The tide-station index is derived from the NOAA Center for Operational Oceanographic Products and Services (CO-OPS) metadata API, filtered to US tide-prediction stations and stored locally with station id, name, latitude, and longitude only. At runtime, the conditions rail queries the CO-OPS Data API for tide predictions at the nearest station to the forecast location, nationwide. NOAA data and information are generally not copyrighted in the United States, but NOAA asks users to credit NOAA as the source and not imply endorsement.

Sources: https://api.tidesandcurrents.noaa.gov/mdapi/prod/ and https://api.tidesandcurrents.noaa.gov/api/prod/

## Open-Meteo Weather

The conditions rail (sun, rain memory and forecast, wind, flush pulses) queries the Open-Meteo forecast API at runtime for the forecast location (geocoded place, or the map area at zoom ≥ 8 via "update to map area"). Open-Meteo's API data is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0); this non-commercial educational use stays within Open-Meteo's free-tier rate limits. Attribution and a link to Open-Meteo are required wherever its data is displayed.

Source: https://open-meteo.com/en/license

## RainViewer Radar

The low-zoom sky layer overlays RainViewer's animated precipitation radar tiles (past frames, refreshed every 5 minutes). Use is under RainViewer's free-tier terms for personal/educational/small-community projects, which require visible attribution ("Weather data by RainViewer") with a link back to rainviewer.com. RainViewer does not guarantee data availability or format stability; the conditions code degrades gracefully if a fetch fails.

Source: https://www.rainviewer.com/api.html

## Flush Threshold Source Notes

The mushroom flush threshold table is a conservative owner-review data file, not a safety or identification source. Its morel entry cites public mycology/gardening references for the general relationship between morel fruiting, spring moisture, and mild weather; the exact `mm/72h` trigger is an app heuristic and is flagged low-confidence in the data file.

Sources: https://www.mushroomexpert.com/morels/index.html and https://www.thespruce.com/how-to-grow-and-care-for-morel-mushrooms-4686369

## Falling Fruit

The local Falling Fruit subset was derived from `locations.csv.bz2` and `types.csv.bz2`, then filtered to matching species groups in the contiguous United States. The browser loads this data through a manifest and small viewport chunks rather than one national JSON file. Falling Fruit's data page says its data are licensed as Creative Commons Attribution-NonCommercial-ShareAlike 4.0 unless otherwise specified. Preserve original source/author attribution, keep this use non-commercial unless permission is obtained, and share adapted data under compatible terms.

Source: https://fallingfruit.org/data

The state and national boundaries used to filter and chunk the Falling Fruit subset are derived from U.S. Census Bureau 2023 cartographic boundary files.

City and county park-rule boundaries (`data/local-jurisdictions.json`) are simplified incorporated-place and county polygons retrieved from the U.S. Census Bureau TIGERweb REST services, paired with hand-encoded municipal/county foraging rules. PAD-US carries no city/agency identity for local park land (only "City Land"/"County Land"), so each record is located inside the Census polygon and matched to the jurisdiction's rule. The per-jurisdiction ordinance/source links are enumerated in that file (`sourceUrl` per entry) and in `docs/permissions-research-2026-06-local-parks.md`. License: Census TIGERweb geometry is a U.S. Government work in the public domain (17 U.S.C. § 105); municipal/county park codes are public government records cited as access-rule summaries, not harvest permission.

## U.S. Boundary

The contiguous United States outline used for the map boundary and exterior opacity mask is derived from the U.S. Census Bureau 2023 cartographic boundary file for the national outline at 1:20,000,000 scale, filtered to the lower 48 states.

Source: https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html

## USGS PAD-US Public Access

The public-land overlay is queried live from the USGS PAD-US Public Access feature service. PAD-US is the official U.S. protected-areas inventory, but the Public Access field is a general access category, not a foraging permission layer. USGS notes that the public-access measure includes Open, Restricted, Closed, or Unknown access and that not all areas have been locally reviewed.

Source: https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-web-services

Suggested citation: U.S. Geological Survey Gap Analysis Project, 2024, Protected Areas Database of the United States (PAD-US) 4: U.S. Geological Survey data release, https://doi.org/10.5066/P96WBCHS

## National Park Service Historic Orchards

The historic orchard layer is derived from the NPS Cultural Landscapes historic orchard map. NPS describes the map as informational and not for navigation or resource management. NPS also asks visitors not to take fruit or cuttings from these historic resources without permission, so orchard records in this app are displayed as "permission required."

License: as a work of the U.S. National Park Service (a federal agency), the underlying orchard data is a U.S. Government work in the public domain under 17 U.S.C. § 105. The "permission required" status is an access/stewardship request, not a copyright term — the two are independent. Point cards therefore cite the dataset as "National Park Service · Public domain (U.S. Gov)." *(Owner/7am audit loop: please confirm this public-domain characterization.)*

Source: https://www.nps.gov/subjects/culturallandscapes/historic-orchards-in-national-parks.htm

## USGS Mineral Resources Data System (Minerals map)

The Minerals map's locality points (`data/minerals-arkansas.json`) are derived from the USGS Mineral Resources Data System (MRDS), 2022 release. The national MRDS extract was filtered to the Ouachita / Hot Springs region of Arkansas and to craft-relevant commodities (quartz, soapstone/steatite and talc/pyrophyllite, clay and kaolin, slate, gemstone/diamond, and silica), then cached as a small point set. MRDS is an economic-mining inventory: it has **no commodity code for novaculite or chert**, so the Arkansas whetstone is recovered by free-text vetting (novaculite/whetstone/oilstone/Washita/etc.) and by treating "Silica" points inside the Novaculite Uplift counties (Garland, Hot Spring, Montgomery, Polk, Pike, Saline) as novaculite — treat positions and material categories as a **curated seed, not authoritative**, and note that positional accuracy varies (MRDS grades A–E) and the data is frozen at ~2011/2022. Catalog descriptions of the clay, carving-stone, and whetstone type ranges draw on general geologic references (Arkansas Geological Survey commodity summaries); these are public-domain facts, not a licensed dataset.

License: MRDS is produced by the U.S. Geological Survey (a federal agency) and is a U.S. Government work in the public domain under 17 U.S.C. § 105 (the MRDS metadata states Use/Access Constraints "none"). Point cards cite the dataset as "USGS MRDS · Public domain (U.S. Gov)" and link to each record's `show-mrds.php` page.

Each record carries a land-manager classification (`perm`) used to show rock-collecting rules. This classification is derived at build time from the **USDA Forest Service** Ouachita National Forest administrative boundary (a U.S. Government work, public domain) plus a factual Crater of Diamonds State Park (Prairie Creek) locality assignment. The Crater dig-and-keep rule is applied only to gemstone/diamond localities in the diatreme (so a nearby clay or other pit can never inherit it), and named commercial pay-to-dig quartz operations in the Mount Ida district are downgraded to a conservative "Claimed / fee-dig" status rather than the forest-wide free-use rule. No National Park Service points occur in this window, and **no ODbL/OpenStreetMap geometry is used or shipped** in the site data. The build script is `scripts/build_minerals_data.py`.

**Occurrence is never collecting permission.** Rock and mineral collecting is governed differently from foraging — the 36 CFR 2.1 personal-use exception for fruits/nuts/berries does **not** cover rocks or minerals. The per-record rule text is summarized from primary sources: the USFS Rockhounding Guide (FS-1091) and 36 CFR 228 Subpart C, the National Park Service prohibition (36 CFR 2.1), BLM mining-claim/rockhounding policy (43 CFR 8365.1-5), and Arkansas State Parks' Crater of Diamonds dig-and-keep policy. These are access-rule summaries, not a harvest-permission layer.

Sources: https://mrdata.usgs.gov/mrds/ · https://www.fs.usda.gov/sites/default/files/rockhounding-guide-fseprd768373.pdf · https://www.ecfr.gov/current/title-36/section-2.1 · https://www.ecfr.gov/current/title-43/section-8365.1-5 · https://www.arkansas.com/state-parks/explore/parks/crater-of-diamonds-state-park

## Mapbox (basemap and geocoding)

The map renders Mapbox GL JS basemap tiles and uses the Mapbox Geocoding API for the address/place search box (public token in `config.js`, URL-scoped in the Mapbox account). Required Mapbox and OpenStreetMap attribution is displayed on the map itself via the Mapbox attribution control (`attributionControl: true`). Use is governed by the Mapbox Terms of Service; this is a rendering/geocoding service, not a craft data source.

**Standard style note:** the redesign migrates the basemap from `outdoors-v12` to Mapbox Standard, using its `lightPreset` (dawn/day/dusk/night) to drive the site's light-register system, and `circle-emissive-strength: 1` on custom point layers so they stay visible under non-day lighting. Maps using Mapbox Standard or a style derived from it must display both the Mapbox logo and text attribution, same as other Mapbox styles; the existing `attributionControl: true` setup continues to satisfy this.

Source: https://www.mapbox.com/legal/tos and https://docs.mapbox.com/help/getting-started/attribution/

## Fonts (self-hosted)

The redesign self-hosts three typeface families as static `woff2` files under `fonts/`, each with its license alongside. All three are licensed under the SIL Open Font License, Version 1.1 (OFL-1.1), which permits embedding and redistribution with the license included; the full license text is committed as `fonts/<family>/OFL.txt`.

- **Fraunces** (display / headings) — Copyright 2018 The Fraunces Project Authors. One fixed static instance is shipped (not the variable font): the 144 pt optical-size SemiBold cut (weight 600, `SOFT=0`, `WONK=0`) plus its italic, converted to `woff2` from the upstream static TTFs. Source: https://github.com/undercasetype/Fraunces
- **Public Sans** (UI text) — Copyright 2015 The Public Sans Project Authors (U.S. Web Design System). Static weights 400/500/600/700. Source: https://github.com/uswds/public-sans
- **IBM Plex Mono** (labels) — Copyright © 2017 IBM Corp. with Reserved Font Name "Plex". Static weights 400/500. Source: https://github.com/IBM/plex

The Public Sans and IBM Plex Mono `woff2` are the Latin-subset static instances served by Google Fonts (same OFL faces); Fraunces was built from the upstream static TTFs. OFL Reserved Font Names ("Plex") mean any modified/rebuilt versions must be renamed — these files are unmodified and keep their original family names.

Source: https://scripts.sil.org/OFL

## Access Rules

The harvesting rules and limits shown in popups are rule summaries matched to the public-land polygon containing a record. They are not legal advice and should be treated as a starting point for checking posted rules, current compendiums, special closures, permits, and agency updates.

Primary rule sources currently encoded:

- Shenandoah National Park superintendent's compendium: https://www.nps.gov/shen/learn/management/compendium.htm#CP_JUMP_5595647
- Blue Ridge Parkway superintendent's compendium (laws & policies): https://www.nps.gov/blri/learn/management/lawsandpolicies.htm
- Prince William Forest Park superintendent's compendium (laws & policies): https://www.nps.gov/prwi/learn/management/lawsandpolicies.htm
- Manassas National Battlefield Park superintendent's compendium: https://www.nps.gov/mana/learn/management/compendium.htm
- National Park Service general plant-removal rule, 36 CFR 2.1: https://www.ecfr.gov/current/title-36/chapter-I/part-2/section-2.1
- National-forest forest-products rule, 36 CFR 261.6 (the national-forest-wide default, used only for forests without a researched per-forest entry; specific designated species, free-use limits, and permits are set by each individual forest, not abstracted from any one forest): https://www.ecfr.gov/current/title-36/chapter-II/part-261/subpart-A/section-261.6
- Per-forest national-forest foraging rules (`data/usfs-forest-rules.json`): each of the 155 national forests is matched by name and cited to **its own** fs.usda.gov forest-products / special-forest-products page, researched June 2026 (69 allow free personal use, 41 require a permit, 45 unconfirmed → general default; mushrooms tracked separately: 61 allowed, 55 permit-required, 1 prohibited, 38 unconfirmed). The per-forest source links are enumerated in that file. License: U.S. Forest Service pages are U.S. Government works in the public domain (17 U.S.C. § 105), cited as access-rule summaries, not harvest permission.
- Virginia state park regulation on plant removal and edible fruits, berries, fungi, and nuts: https://law.lis.virginia.gov/admincode/title4/agency5/chapter30/section50/
- Virginia state forest regulation on plant removal and edible fruits, berries, fungi, and nuts: https://law.lis.virginia.gov/admincode/title4/agency10/chapter30/section50/
- Virginia DWR Wildlife Management Area rules: https://dwr.virginia.gov/wp-content/uploads/media/wma-rules.pdf
- Monticello trail rules and visitor guidance: https://www.monticello.org/visit/hiking-trails/trail-hours-faqs
- Great Smoky Mountains superintendent's compendium (verified against primary source June 2026): https://www.nps.gov/grsm/learn/management/compendium.htm
- Acadia superintendent's compendium (verified against primary source June 2026): https://www.nps.gov/acad/learn/management/sc.htm
- Olympic superintendent's compendium (verified against primary source June 2026): https://www.nps.gov/olym/learn/management/superintendent-s-compendium.htm
- New River Gorge superintendent's compendium (verified June 2026): https://www.nps.gov/neri/learn/management/superintendents-compendium.htm
- Cuyahoga Valley superintendent's compendium (verified June 2026, approved April 2026): https://www.nps.gov/cuva/learn/management/superintendents-compendium.htm
- Mount Rainier 2025 superintendent's compendium (verified June 2026): https://www.nps.gov/mora/learn/management/lawsandpolicies.htm
- Rocky Mountain 2025 superintendent's compendium (verified June 2026): https://www.nps.gov/romo/learn/management/rmnp_compendium.htm
- Yellowstone superintendent's compendium (laws & policies; verified June 2026): https://www.nps.gov/yell/learn/management/lawsandpolicies.htm
- Yosemite superintendent's compendium, September 2025 (verified June 2026): https://www.nps.gov/yose/learn/management/upload/yose-compendium.pdf
- Glacier superintendent's compendium (verified June 2026): https://www.nps.gov/glac/learn/management/compendium.htm
- Crater Lake superintendent's compendium (verified June 2026): https://www.nps.gov/crla/learn/management/superintendent-s-compendium.htm
- Grand Teton superintendent's compendium (verified June 2026): https://www.nps.gov/grte/learn/management/compendium.htm
- Redwood National and State Parks superintendent's compendium (verified June 2026): https://www.nps.gov/redw/learn/management/superintendent-s-compendium.htm
- Capitol Reef Fruita orchard regulations (verified June 2026): https://www.nps.gov/care/learn/historyculture/orchards.htm
- Death Valley superintendent's compendium via the park rules page (verified June 2026): https://www.nps.gov/deva/learn/management/rules-and-regulations.htm
- Indiana Dunes National Park natural-items rules page (verified June 2026): https://www.nps.gov/indu/learn/management/naturalitems.htm
- Sequoia & Kings Canyon National Parks edible-collection rules page (verified June 2026; per-species limits in the superintendent's compendium at https://www.nps.gov/seki/learn/management/superintendent-s-compendium.htm): https://www.nps.gov/seki/planyourvisit/wherecani.htm
- Big Bend compendium (verified June 2026): https://www.nps.gov/bibe/learn/management/superintendents-compendium.htm
- Biscayne compendium (verified June 2026): https://www.nps.gov/bisc/learn/management/superintendents-compendium.htm
- Black Canyon of the Gunnison compendium (verified June 2026): https://www.nps.gov/blca/learn/management/superintendents-compendium.htm
- Carlsbad Caverns compendium (verified June 2026): https://www.nps.gov/cave/learn/management/upload/2026-CAVE-Superintendent-s-Compendium-version-01-29-2026.pdf
- Congaree compendium (verified June 2026): https://www.nps.gov/cong/learn/management/upload/CONG-Supt-Compendium_Updated-1-5-2026_Signed-1.pdf
- Denali compendium (laws & policies; verified June 2026): https://www.nps.gov/dena/learn/management/lawsandpolicies.htm
- Dry Tortugas compendium (verified June 2026): https://www.nps.gov/drto/learn/management/superintendent-s-compendium.htm
- Gates of the Arctic compendium (verified June 2026): https://www.nps.gov/locations/alaska/upload/2026-GAAR-Superintendent-s-Compendium-508.pdf
- Gateway Arch compendium (verified June 2026): https://www.nps.gov/jeff/learn/management/superintendent-s-compendium-for-2026.htm
- Glacier Bay compendium (verified June 2026): https://www.nps.gov/locations/alaska/upload/GLBACompendium-2025_FINAL_11-25_SuptSigOnFile_508.pdf
- Grand Canyon compendium (verified June 2026): https://www.nps.gov/grca/learn/management/upload/grca-supt-compendium.pdf
- Great Basin compendium (verified June 2026): https://www.nps.gov/grba/learn/management/superintendent-s-compendium.htm
- Great Sand Dunes compendium (verified June 2026): https://www.nps.gov/grsa/learn/management/superintendent-s-compendium-great-sand-dunes-national-park-2026.htm
- Guadalupe Mountains compendium (verified June 2026): https://www.nps.gov/gumo/learn/management/upload/2026-NPS-GUMO_Superintendents_Compendium_.pdf
- Haleakalā compendium (verified June 2026): https://www.nps.gov/hale/learn/management/compendium.htm
- Hawaiʻi Volcanoes compendium (verified June 2026): https://www.nps.gov/havo/learn/management/superintendents-compendium.htm
- Hot Springs compendium (verified June 2026): https://www.nps.gov/hosp/learn/management/superintendents-compendium.htm
- Isle Royale compendium (verified June 2026): https://www.nps.gov/isro/learn/management/upload/ISRO_Web_Accessible_Superintendents_Compendium_2025_Updated.pdf
- Katmai compendium (verified June 2026): https://www.nps.gov/locations/alaska/upload/KATM-Compendium-2026_final_508.pdf
- Kenai Fjords collecting & harvesting page (verified June 2026): https://www.nps.gov/kefj/planyourvisit/collecting-and-harvesting.htm
- Kobuk Valley (Western Arctic) compendium (verified June 2026): https://www.nps.gov/locations/alaska/upload/2026-WEAR-Superintendent-s-Compendium-508.pdf
- Lake Clark compendium (verified June 2026): https://www.nps.gov/locations/alaska/upload/2026-LACL-Compendium-with-Maps-508.pdf
- Lassen Volcanic compendium (verified June 2026): https://www.nps.gov/lavo/learn/management/compendium.htm
- Mammoth Cave compendium (verified June 2026): https://www.nps.gov/maca/learn/management/superintendents-compendium.htm
- Mesa Verde compendium (verified June 2026): https://www.nps.gov/meve/learn/management/upload/MEVE_Superintendents_Compendium_01-09-26_508.pdf
- North Cascades compendium (verified June 2026): https://www.nps.gov/noca/learn/management/superintendent-compendium.htm
- Pinnacles compendium (verified June 2026): https://www.nps.gov/pinn/learn/management/superintendent-s-compendium.htm
- Saguaro compendium (verified June 2026): https://www.nps.gov/sagu/learn/management/compendium.htm
- Theodore Roosevelt compendium (verified June 2026): https://www.nps.gov/thro/learn/management/superintendent-s-compendium.htm
- Virgin Islands compendium (verified June 2026): https://www.nps.gov/viis/learn/management/upload/VIIS-Superintendent-Compendium-2022-07-20-508-compliant_signed.pdf
- Voyageurs compendium (verified June 2026): https://www.nps.gov/voya/learn/management/superintendents-compendium.htm
- Wind Cave compendium (verified June 2026): https://www.nps.gov/wica/learn/management/superintendent-s-compendium.htm
- Wrangell–St. Elias compendium (verified June 2026): https://www.nps.gov/locations/alaska/upload/WRST-Compendium_with_maps_1-22-2026_508_signed.pdf
- Zion compendium (verified June 2026): https://www.nps.gov/zion/learn/management/upload/2025-Superintendent-s-Compendium.pdf
- BLM personal-use collection of renewable plant materials: https://www.blm.gov/programs/natural-resources/forests-and-woodlands/forest-product-permits
- National wildlife refuge default plant protection, 50 CFR Part 27: https://www.ecfr.gov/current/title-50/chapter-I/subchapter-C/part-27
- Army Corps project-land vegetation protection, 36 CFR Part 327: https://www.ecfr.gov/current/title-36/chapter-III/part-327
- New York DEC state forest and Forest Preserve use rules: https://dec.ny.gov/nature/forests-trees/state-forests/rules-for-use
- Pennsylvania DCNR state forest rules and regulations: https://www.pa.gov/agencies/dcnr/recreation/where-to-go/state-forests/rules-and-regulations
- Washington state parks edible harvest rule, WAC 352-28-030: https://app.leg.wa.gov/wac/default.aspx?cite=352-28-030
- California state park plant protection (14 CCR 4306): https://www.parks.ca.gov/?page_id=21301
- 11 AAC 12.170 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/alaska/11-AAC-12.170
- 312 IAC 8-2-10 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/indiana/312-IAC-8-2-10
- Iowa Admin. Code 571—54 (state-park foraging rule, verified June 2026): https://www.legis.iowa.gov/docs/iac/chapter/571.54.pdf
- K.A.R. 115-8-20 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/kansas/K-A-R-115-8-20
- Ohio Admin. Code 1501:46-3-10 (state-park foraging rule, verified June 2026): https://codes.ohio.gov/ohio-administrative-code/rule-1501:46-3-10
- 61 O.S. § 335 (SB 447, 2025) (state-park foraging rule, verified June 2026): https://www.oklegislature.gov/cf_pdf/2025-26%20ENR/SB/SB447%20ENR.PDF
- 12-020-009 Code Vt. R. (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/vermont/12-009-Code-Vt-R-12-020-009-X
- Wis. Admin. Code NR 45.04 (state-park foraging rule, verified June 2026): https://docs.legis.wisconsin.gov/code/admin_code/nr/001/45/04
- 10 CSR 90-2.040 (state-park foraging rule, verified June 2026): https://www.sos.mo.gov/cmsimages/adrules/csr/current/10csr/10c90-2.pdf
- HAR 13-146-32 (state-park foraging rule, verified June 2026): https://dlnr.hawaii.gov/ecosystems/files/2013/09/HRS13-146_State-Parks.pdf
- Tenn. Comp. R. & Regs. 0400-02-02-.18 (state-park foraging rule, verified June 2026): https://publications.tnsosfiles.com/rules/0400/0400-02/0400-02-02.20210422.pdf
- Conn. Gen. Stat. § 23-4(b) (state-park foraging rule, verified June 2026): https://eregulations.ct.gov/eRegsPortal/Browse/getDocument?guid=%7B3C64A5F8-B731-4393-A6AB-EA64B91A3F63%7D
- Ga. Comp. R. & Regs. r. 391-5-1-.04 (state-park foraging rule, verified June 2026): https://rules.sos.ga.gov/gac/391-5-1
- 163 Neb. Admin. Code ch. 5 § 001.14 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/nebraska/163-Neb-Admin-Code-ch-5-SS-001
- 024-1 Wyo. Code R. § 1-15 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/wyoming/024-1-Wyo-Code-R-SS-1-15
- 19.5.2.43 NMAC (state-park foraging rule, verified June 2026): https://www.emnrd.nm.gov/wp-content/uploads/sites/7/19.5.2_integrated_appvdDBpublished6252019.pdf
- S.C. Code Ann. § 51-3-145(D) (state-park foraging rule, verified June 2026): https://www.scstatehouse.gov/code/t51c003.php
- W. Va. Code R. § 58-31-2 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/west-virginia/W-Va-C-S-R-SS-58-31-2
- Ala. Admin. Code r. 220-5-.07(3) (state-park foraging rule, verified June 2026): https://www.outdooralabama.com/sites/default/files/Enforcement/STATE%20PARKS%20DIVISION%20REG%20FOR%20LE%20PAGE.pdf
- A.A.C. R12-8-103 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R12-8-103
- Ark. Admin. Code Title 3, Subpart 10 (state-park foraging rule, verified June 2026): https://www.arkansas.com/state-parks/about/rules-regulations
- 7 Del. Admin. Code 9201-17.3 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/delaware/7-Del-Admin-Code-SS-9201-17.0
- Fla. Admin. Code R. 62D-2.013 (state-park foraging rule, verified June 2026): http://flrules.elaws.us/fac/62d-2.013/
- IDAPA 26.01.20.125 (state-park foraging rule, verified June 2026): https://adminrules.idaho.gov/rules/current/26/260120.pdf
- KRS 433.750 (state-park foraging rule, verified June 2026): https://parks.ky.gov/parks/regulations
- LAC Title 25, Pt. IX, § 303.B (state-park foraging rule, verified June 2026): https://www.lastateparks.com/sites/default/files/2023-09/OSP%20Title25v01-11.pdf
- C.M.R. 01-670, ch. 1, § 1 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/maine/C-M-R-01-670-ch-1
- 302 CMR 12.04 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/massachusetts/302-CMR-12-04
- 40 Miss. Admin. Code Pt. 6, R. 1.2 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/mississippi/40-Miss-Code-R-SS-6-1-2
- ARM 12.12.106 (state-park foraging rule, verified June 2026): https://fwp.mt.gov/binaries/content/assets/fwp/commission/2023/dec/public-use-rules-arm/final_12-603adp_11.16.2023.pdf
- NRS 407.250 / NAC 407 (state-park foraging rule, verified June 2026): https://www.leg.state.nv.us/nrs/nrs-407.html
- N.H. Code Admin. R. Res 7301.05 (state-park foraging rule, verified June 2026): https://www.nhstateparks.org/getmedia/78550992-2128-4844-97e3-ab8fde083a17/Res-7300-Parks-and-Rec-Adopted-Rule-eff-030114.aspx
- N.J.A.C. 7:2-2.10(a) (state-park foraging rule, verified June 2026): https://dep.nj.gov/wp-content/uploads/rules/rules/njac7_2.pdf
- N.D. Admin. Code 58-02-08-10 (state-park foraging rule, verified June 2026): https://ndlegis.gov/information/acdata/pdf/58-02-08.pdf
- 250-RICR-100-00-7 § 7.20 (state-park foraging rule, verified June 2026): https://rules.sos.ri.gov/regulations/Part/250-100-00-7
- SDAR 41:03:01:05 (state-park foraging rule, verified June 2026): https://sdlegislature.gov/Rules/Administrative/41:03:01
- 31 TAC 59.134(l)(1) (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/texas/31-Tex-Admin-Code-SS-59-134
- Utah Admin. Code R651-620-2 (state-park foraging rule, verified June 2026): https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R651-620-2
- New York City parks vegetation rule, 56 RCNY 1-04: https://www.nycgovparks.org/rules/section-1-04/
- Monticello guest policies (no collection on Foundation property): https://www.monticello.org/visit/tips-for-visiting/guest-policies
- UVA pavilion gardens edible-landscape guidance: https://sustainability.virginia.edu/blog/exploring-edible-food-grown-grounds
- City of Charlottesville Parks & Trails (municipal-government informational page; no city-specific foraging rule confirmed — used as an access/locator label only, and records are displayed in-app as "rule not confirmed"): https://www.charlottesville.gov/166/Parks-Recreation
- Albemarle County Parks & Recreation (county-government informational page; no county-specific foraging rule confirmed — used as an access/locator label only, and records are displayed in-app as "rule not confirmed"): https://www.albemarle.org/government/parks-recreation
- Beacon Food Forest open harvest policy (site bounds centered on 47.567, -122.313 at 15th Ave S & S Dakota St, Seattle; refine against parcel data if needed): https://www.beaconfoodforest.org/openharvest
- Dr. George Washington Carver Edible Park visitor guidance, City of Asheville Parks & Recreation: https://www.ashevillenc.gov/news/park-views-dr-george-washington-carver-edible-park/
- Festival Beach Food Forest FAQ and harvest guidance (see also EPA brownfields success story, EPA 560-F-20-172): https://festivalbeach.org/frequently-asked-questions/
- Urban Food Forest at Browns Mill, AgLanta (City of Atlanta); detailed harvest-guidelines page offline as of June 2026: https://aglanta.atlantaga.gov/urban-food-forest-at-browns-mill-1
- Bronx River Foodway public-harvest policy (geocoded June 2026): https://bronxriver.org/visit-the-river/explore-the-greenway/foodway
- Del Aire Public Fruit Park public-harvest policy (geocoded June 2026): https://fallenfruit.org/projects/public-fruit-park-los-angeles/
- Charlotte's Blueberry Park public-harvest policy (geocoded June 2026): https://www.parkstacoma.gov/place/charlottes-blueberry-park/
- Bloomington Community Orchard public-harvest policy (geocoded June 2026): https://bloomingtoncommunityorchard.org/site/visit/
- Refuge Food Forest public-harvest policy (geocoded June 2026): https://www.normalil.gov/1372/Refuge-Food-Forest
- Lawrence Community Orchard public-harvest policy (geocoded June 2026): https://www.sunriseprojectks.org/lftp
- Emerson Street Food Forest public-harvest policy (geocoded June 2026): https://www.hyattsville.org/1122/Emerson-Street-Food-Forest
- McClanahan Food Forest (McClanahan Park) public-harvest policy (geocoded June 2026): https://www.hyattsville.org/902/Food-Forests
- White Marsh Park Edible Trail public-harvest policy (geocoded June 2026): https://news.maryland.gov/dnr/2026/04/24/marylands-edible-understory-is-on-the-verge-of-being-discovered/
- Wetherby Edible Forest public-harvest policy (geocoded June 2026): https://www.backyardabundance.org/wetherby
- Community Orchard of West Seattle public-harvest policy (geocoded June 2026): https://southseattle.edu/community-orchard-west-seattle
- Edgewater Food Forest public-harvest policy (geocoded June 2026): https://insideclimatenews.org/news/03102025/boston-edible-food-forests/
- Boston Nature Center Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Egleston Community Orchard public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/egleston-page
- Ellington Street Community Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Maple Street Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Uphams Corner Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/uphams-corner-food-forest
- Old West Church Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Savin Hill Wildlife Garden Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Hope Garden public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Leland Cooperative Garden Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Frederick Douglass Peace Park public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Egleston Branch Library Food Forest public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Sherman Street Green Space / Fairy Hollow public-harvest policy (geocoded June 2026): https://www.bostonfoodforest.org/locations
- Barnum Orchard (Barnum Food Forest) public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Cook Park Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Living Light of Peace Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Fairmont DCIS School Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Samuels Elementary Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Nome Park Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Wheat Ridge Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- 48th & Julian Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Athmar Park Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Doull Elementary Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Kepner Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- The Urban Farm Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Ute Trail Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- APDC Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Morey Middle School Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Glenbrook Greenhouse Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Maxwell Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Edgewater Kaizen Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Vista Peak Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- GES Food Forest (Globeville/Elyria-Swansea) public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Bradley International Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Greenway Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- STEAM Academy Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Lake Middle School Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Crumley Park Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Newlon Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Martinez Park Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Sanderson Gulch Food Forest public-harvest policy (geocoded June 2026): https://dug.org/gardens-food-forests/food-forests/
- Adams Triangle (Adams Grove Community Orchard) public-harvest policy (geocoded June 2026): https://www.minneapolisparks.org/activities-events/harvesting/
- Bridal Veil Gardens public-harvest policy (geocoded June 2026): https://www.minneapolisparks.org/activities-events/harvesting/
- Lyndale Farmstead public-harvest policy (geocoded June 2026): https://www.minneapolisparks.org/activities-events/harvesting/
- Lovell Square (community orchard / urban-agriculture plots) public-harvest policy (geocoded June 2026): https://www.minneapolisparks.org/parks-destinations/parks-lakes/lovell_square/
- U.S. National Arboretum conduct rules, 7 CFR Part 500 (representative source for the generic botanical-garden/arboretum prohibition): https://www.ecfr.gov/current/title-7/subtitle-A/part-500
- Colorado Parks and Wildlife land regulations, 2 CCR 405-1 #100: https://www.law.cornell.edu/regulations/colorado/2-CCR-405-1-100
- Oregon state park resources rule, OAR 736-010-0055: https://secure.sos.state.or.us/oard/view.action?ruleNumber=736-010-0055
- Maryland state park plant protection, COMAR 08.07.06.13 (CC BY-NC-SA via Open Law Library): https://regs.maryland.gov/us/md/exec/comar/08.07.06.13
- Maryland state forest plant protection and forest-product permits, COMAR 08.07.01.13: https://regs.maryland.gov/us/md/exec/comar/08.07.01.13
- North Carolina parks natural-resource protection, 07 NCAC 13B .0201: http://reports.oah.state.nc.us/ncac/title%2007%20-%20natural%20and%20cultural%20resources/chapter%2013%20-%20parks%20and%20recreation%20area%20rules/chapter%2013%20rules.pdf
- Michigan DNR foraging guidance for state-managed lands: https://www.michigan.gov/dnr/things-to-do/foraging
- Minnesota state park plant rules, Minnesota Rules 6100.0900 (rule text quoted verbatim in the Sept 2025 MN Sustainable Foraging Task Force memo): https://www.revisor.mn.gov/rules/6100.0900/
- Illinois DNR public-lands plant rule, 17 Ill. Adm. Code 110.70 (edible fungi, nuts, and berries personal-use exception under 110.70(a)(3); official Illinois Administrative Code, a state government work): https://www.ilga.gov/agencies/JCAR/EntirePart?titlepart=01700110
- Minnesota Sustainable Foraging Task Force 50-state foraging-law list (roadmap reference for future state passes): https://www.lcc.mn.gov/foraging/meetings/20250909/Foraging-Laws-List

## Safety

This app is a planning and discovery aid. It does not verify plant identification, ripeness, toxins, private-property boundaries, or current collection rules. Confirm identification independently, check posted rules and agency regulations, and do not harvest on private land or protected public land without permission.
