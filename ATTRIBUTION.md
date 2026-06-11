# Attribution and Data-Use Notes

This prototype combines live and cached public-interest data. It is non-commercial, but attribution and use limits still matter.

## iNaturalist

The map queries the supported iNaturalist API at runtime and links each observation back to its iNaturalist observation page. iNaturalist states that user-contributed content remains owned by the contributor and, unless otherwise specified, is licensed under Creative Commons Attribution-NonCommercial (CC BY-NC). Do not reuse photos or other media from iNaturalist without checking the license on the individual observation.

Source: https://www.inaturalist.org/pages/api+reference and https://www.inaturalist.org/pages/terms

## Falling Fruit

The local Falling Fruit subset was derived from `locations.csv.bz2` and `types.csv.bz2`, then filtered to matching species groups in the contiguous United States. The browser loads this data through a manifest and small viewport chunks rather than one national JSON file. Falling Fruit's data page says its data are licensed as Creative Commons Attribution-NonCommercial-ShareAlike 4.0 unless otherwise specified. Preserve original source/author attribution, keep this use non-commercial unless permission is obtained, and share adapted data under compatible terms.

Source: https://fallingfruit.org/data

The state and national boundaries used to filter and chunk the Falling Fruit subset are derived from U.S. Census Bureau 2023 cartographic boundary files.

## U.S. Boundary

The contiguous United States outline used for the map boundary and exterior opacity mask is derived from the U.S. Census Bureau 2023 cartographic boundary file for the national outline at 1:20,000,000 scale, filtered to the lower 48 states.

Source: https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html

## USGS PAD-US Public Access

The public-land overlay is queried live from the USGS PAD-US Public Access feature service. PAD-US is the official U.S. protected-areas inventory, but the Public Access field is a general access category, not a foraging permission layer. USGS notes that the public-access measure includes Open, Restricted, Closed, or Unknown access and that not all areas have been locally reviewed.

Source: https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-web-services

Suggested citation: U.S. Geological Survey Gap Analysis Project, 2024, Protected Areas Database of the United States (PAD-US) 4: U.S. Geological Survey data release, https://doi.org/10.5066/P96WBCHS

## National Park Service Historic Orchards

The historic orchard layer is derived from the NPS Cultural Landscapes historic orchard map. NPS describes the map as informational and not for navigation or resource management. NPS also asks visitors not to take fruit or cuttings from these historic resources without permission, so orchard records in this app are displayed as "permission required."

Source: https://www.nps.gov/subjects/culturallandscapes/historic-orchards-in-national-parks.htm

## Access Rules

The harvesting rules and limits shown in popups are rule summaries matched to the public-land polygon containing a record. They are not legal advice and should be treated as a starting point for checking posted rules, current compendiums, special closures, permits, and agency updates.

Primary rule sources currently encoded:

- Shenandoah National Park superintendent's compendium: https://www.nps.gov/shen/learn/management/compendium.htm#CP_JUMP_5595647
- Blue Ridge Parkway superintendent's compendium: https://www.nps.gov/blri/learn/management/superintendent-s-compendium.htm
- Prince William Forest Park superintendent's compendium: https://www.nps.gov/prwi/learn/management/superintendents-compendium.htm
- Manassas National Battlefield Park superintendent's compendium: https://www.nps.gov/mana/learn/management/compendium.htm
- National Park Service general plant-removal rule, 36 CFR 2.1: https://www.ecfr.gov/current/title-36/chapter-I/part-2/section-2.1
- George Washington and Jefferson National Forests forest-products permits: https://www.fs.usda.gov/r08/gwj/permits/forest-products-permits
- Virginia state park regulation on plant removal and edible fruits, berries, fungi, and nuts: https://law.lis.virginia.gov/admincode/title4/agency5/chapter30/section50/
- Virginia state forest regulation on plant removal and edible fruits, berries, fungi, and nuts: https://law.lis.virginia.gov/admincode/title4/agency10/chapter30/section50/
- Virginia DWR Wildlife Management Area rules: https://dwr.virginia.gov/wp-content/uploads/media/wma-rules.pdf
- Monticello trail rules and visitor guidance: https://www.monticello.org/visit/hiking-trails/trail-hours-faqs
- Great Smoky Mountains superintendent's compendium (verified against primary source June 2026): https://www.nps.gov/grsm/learn/management/compendium.htm
- Additional park compendium gathering designations (New River Gorge, Acadia, Cuyahoga Valley, Olympic, Mount Rainier, Rocky Mountain, Yellowstone, Yosemite, Glacier, Crater Lake, Grand Teton, Redwood, Capitol Reef, Death Valley), encoded from each park's compendium page with limits summarized using "about" hedging; reverify against the current year's compendium. See docs/permissions-research-2026-06.md for per-park verification status.
- BLM personal-use collection of renewable plant materials: https://www.blm.gov/programs/natural-resources/forests-and-woodlands/forest-product-permits
- National wildlife refuge default plant protection, 50 CFR Part 27: https://www.ecfr.gov/current/title-50/chapter-I/subchapter-C/part-27
- Army Corps project-land vegetation protection, 36 CFR Part 327: https://www.ecfr.gov/current/title-36/chapter-III/part-327
- New York DEC state forest and Forest Preserve use rules: https://dec.ny.gov/nature/forests-trees/state-forests/rules-for-use
- Pennsylvania DCNR state forest rules and regulations: https://www.pa.gov/agencies/dcnr/recreation/where-to-go/state-forests/rules-and-regulations
- Washington state parks edible harvest rule, WAC 352-28-030: https://app.leg.wa.gov/wac/default.aspx?cite=352-28-030
- California state park plant protection (14 CCR 4306): https://www.parks.ca.gov/?page_id=21301
- New York City parks vegetation rule, 56 RCNY 1-04: https://www.nycgovparks.org/rules/section-1-04/
- Monticello guest policies (no collection on Foundation property): https://www.monticello.org/visit/tips-for-visiting/guest-policies
- UVA pavilion gardens edible-landscape guidance: https://sustainability.virginia.edu/blog/exploring-edible-food-grown-grounds

## Safety

This app is a planning and discovery aid. It does not verify plant identification, ripeness, toxins, private-property boundaries, or current collection rules. Confirm identification independently, check posted rules and agency regulations, and do not harvest on private land or protected public land without permission.
