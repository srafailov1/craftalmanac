# Attribution and Data-Use Notes

This prototype combines live and cached public-interest data. It is non-commercial, but attribution and use limits still matter.

## iNaturalist

The map queries the supported iNaturalist API at runtime and links each observation back to its iNaturalist observation page. iNaturalist states that user-contributed content remains owned by the contributor and, unless otherwise specified, is licensed under Creative Commons Attribution-NonCommercial (CC BY-NC). Do not reuse photos or other media from iNaturalist without checking the license on the individual observation.

Source: https://www.inaturalist.org/pages/api+reference and https://www.inaturalist.org/pages/terms

## Falling Fruit

The local Falling Fruit subset was derived from `locations.csv.bz2` and `types.csv.bz2`, then filtered to records in Virginia, West Virginia, Maryland, Delaware, and Pennsylvania matching this app's species groups. Falling Fruit's data page says its data are licensed as Creative Commons Attribution-NonCommercial-ShareAlike 4.0 unless otherwise specified. Preserve original source/author attribution, keep this use non-commercial unless permission is obtained, and share adapted data under compatible terms.

Source: https://fallingfruit.org/data

The regional boundary used to filter the Falling Fruit subset is derived from iNaturalist place geometries for Virginia, West Virginia, Maryland, Delaware, and Pennsylvania.

Sources: https://www.inaturalist.org/places/virginia-us, https://www.inaturalist.org/places/west-virginia, https://www.inaturalist.org/places/maryland-us, https://www.inaturalist.org/places/delaware, and https://www.inaturalist.org/places/pennsylvania

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

## Safety

This app is a planning and discovery aid. It does not verify plant identification, ripeness, toxins, private-property boundaries, or current collection rules. Confirm identification independently, check posted rules and agency regulations, and do not harvest on private land or protected public land without permission.
