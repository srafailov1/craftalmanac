# Work order: encode the 34 remaining National-Park gathering rules

Owner tier: Codex (mechanical multi-entry edit inside guardrails). Author: Claude
(2026-06-15 permissions completion pass). Branch: `main`.

Rule **semantics** below are Claude-owned and already decided — this work order is
the encode/paste step plus the data-regen gate. Do not re-derive allowances or
change limits; if a source looks wrong, escalate via `docs/codex-questions.md`
rather than editing the rule text.

## Background

`docs/permissions-research-2026-06-nps-expansion.md` researched the 44 National
Parks not previously encoded. 34 allow some general-visitor personal gathering
and need `NPS_GATHERING_RULES` entries; 10 prohibit it and need **no change**
(they already resolve to prohibited via `isNationalParkServiceLand`, app.js
~6045). All 34 are verified against current 2025–2026 compendiums.

## Goal

Append 34 entries to `NPS_GATHERING_RULES` (app.js, array starts ~line 136), add
the matching `ATTRIBUTION.md` source rows, then rerun the two access-status build
scripts so the overview reflects the new rules. No behavioral/logic changes — the
entries plug into the existing `getNpsCompendiumRule` shape unchanged.

## Phase 1 — Append the entries to `NPS_GATHERING_RULES`

Paste the block below at the **end** of the `NPS_GATHERING_RULES` array (after the
`kings canyon` entry, before the closing `];` at ~line 287). Order within the
array does not affect correctness — `getNpsCompendiumRule` returns the first
`text.includes(rule.match)` hit, and every existing park is matched by its own
earlier entry, so appended entries only ever catch the new parks. The `match`
strings below were chosen to avoid collisions (see Phase 1 notes).

```js
  // ---- 2026-06-15 National-Park completion pass (34 parks). ----
  // Lower-48 / Hawaii designations (36 CFR 2.1(c)):
  {
    match: "big bend national park",
    sourceLabel: "Big Bend compendium",
    sourceUrl: "https://www.nps.gov/bibe/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: false,
    mushroomNote: "Big Bend's compendium does not designate mushrooms; they remain prohibited under 36 CFR 2.1(a).",
    limit: "Fruits, nuts, and berries: gathered by hand for immediate personal consumption on site, edible items only, no more than one handful per person per day; prickly pears excepted at 1 quart per person per day. No collection permit required.",
    note: "Big Bend designates wild fruits, nuts, and berries for hand-gathering and immediate on-site consumption; mushrooms are not designated. Verified against the current (2026) compendium, June 2026."
  },
  {
    match: "biscayne",
    sourceLabel: "Biscayne compendium",
    sourceUrl: "https://www.nps.gov/bisc/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: false,
    limit: "Ripe coconuts found on the ground only: collected by hand for personal use; coconuts still on the trees may not be collected or disturbed. No other fruits, berries, or nuts are designated; seashell collection is prohibited.",
    note: "Biscayne designates only ground-fallen ripe coconuts for personal-use collection. Verified against the current compendium (approved September 2025), June 2026."
  },
  {
    match: "black canyon of the gunnison",
    sourceLabel: "Black Canyon of the Gunnison compendium",
    sourceUrl: "https://www.nps.gov/blca/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: false,
    mushroomNote: "Black Canyon of the Gunnison's compendium explicitly prohibits mushroom collection to protect the future reproductive capacity of native species.",
    limit: "Fruits, nuts, and berries: gathered by hand for personal use or consumption, limited to one dry pint per person per day (general category; no individual species named).",
    note: "Black Canyon of the Gunnison designates fruits, nuts, and berries for hand-gathering; mushroom collection is explicitly prohibited. Verified against the current compendium (updated June 4, 2026), June 2026."
  },
  {
    match: "carlsbad caverns",
    sourceLabel: "Carlsbad Caverns compendium",
    sourceUrl: "https://www.nps.gov/cave/learn/management/upload/2026-CAVE-Superintendent-s-Compendium-version-01-29-2026.pdf",
    mushroomsAllowed: false,
    limit: "Nuts and prickly pear cactus fruits (only within 100 feet of Walnut Canyon Road and the Scenic Loop Drive) and fruit from the historic Rattlesnake Springs orchard trees: gathered by hand, no more than one gallon of fruits/nuts per person per day.",
    note: "Carlsbad Caverns designates nuts, prickly pear fruits, and Rattlesnake Springs orchard fruit for hand-gathering; mushrooms are not designated. Verified against the 2026 compendium (version 01-29-2026), June 2026."
  },
  {
    match: "guadalupe mountains",
    sourceLabel: "Guadalupe Mountains compendium",
    sourceUrl: "https://www.nps.gov/gumo/learn/management/upload/2026-NPS-GUMO_Superintendents_Compendium_.pdf",
    mushroomsAllowed: false,
    limit: "Fruits of cactus and fruit trees: 1 quart per person per day; ground-collected nuts (pecans, acorns, piñons): 1 quart per person per day; all edible berries: by hand for immediate on-site consumption, one handful per person.",
    note: "Guadalupe Mountains designates cactus/tree fruits, ground nuts, and berries for hand-gathering; mushrooms are not designated. Verified against the 2026 compendium (May 26, 2026), June 2026."
  },
  {
    match: "grand canyon national park",
    sourceLabel: "Grand Canyon compendium",
    sourceUrl: "https://www.nps.gov/grca/learn/management/upload/grca-supt-compendium.pdf",
    mushroomsAllowed: false,
    limit: "Pinyon nuts only: gathered by hand for personal use, up to 25 pounds (in shell) per gatherer per day; not within campgrounds or housing areas. No fruits or berries are designated; sale or commercial use is prohibited.",
    note: "Grand Canyon designates only pinyon nuts for hand-gathering. Verified against the 2025 compendium (December 20, 2025), June 2026."
  },
  {
    match: "saguaro national park",
    sourceLabel: "Saguaro compendium",
    sourceUrl: "https://www.nps.gov/sagu/learn/management/compendium.htm",
    mushroomsAllowed: false,
    limit: "A reasonable amount of native fruit (saguaro, prickly pear, cholla buds, barrel cactus, and other native species) for personal use and immediate on-site consumption; no numeric quantity stated.",
    note: "Saguaro designates native fruit for hand-gathering and on-site consumption; mushrooms are not designated. Tohono O'odham traditional harvest of saguaro fruit and cholla buds is separately authorized. Verified against the compendium effective January 8, 2026, June 2026."
  },
  {
    match: "haleakala",
    sourceLabel: "Haleakalā compendium",
    sourceUrl: "https://www.nps.gov/hale/learn/management/compendium.htm",
    mushroomsAllowed: false,
    limit: "'Ōhelo berries (Vaccinium sp.), 'ākala berries (Rubus hawaiiensis), and kukui nuts (Aleurites moluccana): 1 quart per person per day each, gathered by hand for personal use. Certain non-native fruits and foliage only with written permission of the superintendent.",
    note: "Haleakalā designates three native species for hand-gathering; mushrooms are not designated. Verified against the compendium effective March 3, 2026, June 2026."
  },
  {
    match: "hawaii volcanoes",
    sourceLabel: "Hawaiʻi Volcanoes compendium",
    sourceUrl: "https://www.nps.gov/havo/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: false,
    limit: "Eleven designated species (avocado, blackberry, coconut, guava, passion fruit, 'ōhelo berries, pohā, thimbleberry, strawberry guava, white strawberry, yellow raspberry): hand-gathered for personal use; 'ōhelo berries limited to 1 quart per person per month. No commercial collection.",
    note: "Hawaiʻi Volcanoes designates eleven fruit species (mostly non-native) for hand-gathering; mushrooms are not designated. Verified against the compendium updated November 14, 2025, June 2026."
  },
  {
    match: "lassen volcanic",
    sourceLabel: "Lassen Volcanic compendium",
    sourceUrl: "https://www.nps.gov/lavo/learn/management/compendium.htm",
    mushroomsAllowed: false,
    limit: "Pine nuts, blue elderberry, bush chinquapin, currants and gooseberries, serviceberry, chokecherry, and other listed fruits/nuts/plant materials: gathered by hand for personal use, possession limit one pint per person per day.",
    note: "Lassen Volcanic designates listed fruits, nuts, and berries for hand-gathering; mushrooms are not designated. Verified against the compendium approved June 8, 2026, June 2026."
  },
  {
    match: "north cascades",
    sourceLabel: "North Cascades compendium",
    sourceUrl: "https://www.nps.gov/noca/learn/management/superintendent-compendium.htm",
    mushroomsAllowed: true,
    limit: "Edible fruits and berries (~21 named species incl. blackberry, blueberry, blue elderberry, chokecherry, cranberry, currant, gooseberry, hazelnut, hawthorn, huckleberry, kinnikinnick): one liter (1 quart) per person per day; apples unlimited for non-commercial use; edible fungi must be cut, not pulled.",
    note: "North Cascades designates a broad berry/fruit list plus edible fungi for hand-gathering. Verified against the compendium approved December 3, 2025, June 2026. (Ross Lake and Lake Chelan NRA-specific rules were not separately confirmed.)"
  },
  {
    match: "pinnacles",
    sourceLabel: "Pinnacles compendium",
    sourceUrl: "https://www.nps.gov/pinn/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: true,
    limit: "Fruit, nuts, berries, and the fruiting bodies of fungi from any edible species: collected for personal consumption while in the park; no numeric quantity limit stated.",
    note: "Pinnacles designates fruit, nuts, berries, and edible fungi for hand-gathering and in-park consumption; park biologists determined this does not adversely affect resources. Verified against the compendium dated December 23, 2025, June 2026."
  },
  {
    match: "mesa verde",
    sourceLabel: "Mesa Verde compendium",
    sourceUrl: "https://www.nps.gov/meve/learn/management/upload/MEVE_Superintendents_Compendium_01-09-26_508.pdf",
    mushroomsAllowed: false,
    limit: "Pinyon nuts, chokecherries, juniper berries, and prickly pear fruit: 1 pound per person per day each, gathered by hand within arm's reach in front-country areas open to the public.",
    note: "Mesa Verde designates four native species for hand-gathering in front-country areas; mushrooms are not designated. Verified against the 2026 compendium (January 9, 2026), June 2026."
  },
  {
    match: "great sand dunes",
    sourceLabel: "Great Sand Dunes compendium",
    sourceUrl: "https://www.nps.gov/grsa/learn/management/superintendent-s-compendium-great-sand-dunes-national-park-2026.htm",
    mushroomsAllowed: true,
    limit: "Edible nuts (1 gallon), edible berries (1 quart each), and edible mushrooms (2 pounds): per person per calendar year, gathered by hand for personal use (general category; no named species).",
    note: "Great Sand Dunes designates edible nuts, berries, and mushrooms for hand-gathering with annual per-person limits. Verified against the 2026 compendium, June 2026."
  },
  {
    match: "great basin national park",
    sourceLabel: "Great Basin compendium",
    sourceUrl: "https://www.nps.gov/grba/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: true,
    limit: "Pinyon pine nuts/cones (Pinus monophylla): 25 lb of nuts or 3 bags of cones (each ≤ 2 ft × 3 ft) per household per year, fall season; historic Lehman Orchard fruit for personal non-commercial use; other fruits, nuts, mushrooms, and berries: 2 quarts per family per day combined.",
    note: "Great Basin designates pinyon pine, Lehman Orchard fruit, and other edible fruits/nuts/mushrooms/berries for hand-gathering. Verified against the compendium updated March 12, 2026, June 2026."
  },
  {
    match: "zion national park",
    sourceLabel: "Zion compendium",
    sourceUrl: "https://www.nps.gov/zion/learn/management/upload/2025-Superintendent-s-Compendium.pdf",
    mushroomsAllowed: false,
    limit: "All wild or domestic fruits, berries, and nuts: gathered/possessed/consumed in quantities consumed by a single individual the same day, or 1 pound per individual, and limited to a total of 5 pounds for groups of five or more. Hand-gathering for personal use.",
    note: "Zion designates all wild and domestic fruits, berries, and nuts for personal-use hand-gathering; mushrooms are not designated. Verified against the 2025 compendium, June 2026."
  },
  {
    match: "wind cave",
    sourceLabel: "Wind Cave compendium",
    sourceUrl: "https://www.nps.gov/wica/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: false,
    mushroomNote: "Wind Cave's compendium explicitly prohibits the collection of mushrooms and pinecones.",
    limit: "Chokecherry (Prunus virginiana) and wild/American plum (Prunus americana) only: 1 quart per person per day, non-commercial use.",
    note: "Wind Cave designates chokecherry and wild plum for hand-gathering; mushroom and pinecone collection is explicitly prohibited. Verified against the compendium approved May 25, 2026, June 2026."
  },
  {
    match: "theodore roosevelt national park",
    sourceLabel: "Theodore Roosevelt compendium",
    sourceUrl: "https://www.nps.gov/thro/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: true,
    limit: "Buffaloberry, chokecherry, currant, juneberry, juniper berry, plum, rose hip, skunkbush sumac berry, wild strawberry, and wild mushroom: up to 1 quart per person per day, gathered by hand for personal use. Commercial use not authorized.",
    note: "Theodore Roosevelt designates listed fruits and berries plus wild mushrooms for hand-gathering. Verified against the compendium approved March 21, 2025, June 2026."
  },
  {
    match: "voyageurs",
    sourceLabel: "Voyageurs compendium",
    sourceUrl: "https://www.nps.gov/voya/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: true,
    limit: "Strawberries, chokecherries, rose hips, blackberries, raspberries, blueberries, cranberries, mushrooms, wild rice, and acorns: 1 gallon per person per day total, hand-collected for personal use.",
    note: "Voyageurs designates listed fruits, berries, mushrooms, wild rice, and acorns for hand-gathering. Verified against the compendium updated June 8, 2026, June 2026."
  },
  {
    match: "isle royale",
    sourceLabel: "Isle Royale compendium",
    sourceUrl: "https://www.nps.gov/isro/learn/management/upload/ISRO_Web_Accessible_Superintendents_Compendium_2025_Updated.pdf",
    mushroomsAllowed: true,
    limit: "Apples, beach peas, blueberries, chokecherries, cranberries, currants, elderberries, hazelnuts, juneberries, mushrooms, pin cherries, raspberries, rhubarb, rose hips, strawberries, thimbleberries, wintergreen berries, and other listed items: hand-gathered for personal use, up to 4 quarts per person per day.",
    note: "Isle Royale designates a broad list of berries, fruits, nuts, and mushrooms for hand-gathering. Verified against the compendium revised September 16, 2025, June 2026."
  },
  {
    match: "mammoth cave",
    sourceLabel: "Mammoth Cave compendium",
    sourceUrl: "https://www.nps.gov/maca/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: true,
    limit: "Blackberries, blueberries, raspberries, mulberries, elderberries, grapes, persimmons, paw-paws, walnuts, hickory nuts, serviceberry, hazelnut, and edible fungi (all species combined, including morels): one gallon per person per day combined. Edible fungi must be carried in a mesh container so spores disperse; inedible fungi may not be collected.",
    note: "Mammoth Cave designates a broad fruit/nut list plus edible fungi for hand-gathering under a combined one-gallon daily limit. Verified against the compendium signed January 9, 2026, June 2026."
  },
  {
    match: "hot springs national park",
    sourceLabel: "Hot Springs compendium",
    sourceUrl: "https://www.nps.gov/hosp/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: true,
    limit: "Plums, blackberries, hickory nuts, persimmons, grapes, muscadines, blueberries, juneberries, and edible fungi: 1 pint per person per day each; edible fungi must be cut, not pulled or dug.",
    note: "Hot Springs designates eight fruit/nut species plus edible fungi for hand-gathering. Verified against the compendium dated December 23, 2025, June 2026."
  },
  {
    match: "congaree",
    sourceLabel: "Congaree compendium",
    sourceUrl: "https://www.nps.gov/cong/learn/management/upload/CONG-Supt-Compendium_Updated-1-5-2026_Signed-1.pdf",
    mushroomsAllowed: true,
    limit: "Blackberries, grapes, blueberries, paw paw fruit, wild plums, walnuts, and edible mushrooms: gathered by hand for personal use, 1 liter per person per day each; possession and consumption restricted to the park.",
    note: "Congaree designates six fruit/nut species plus edible mushrooms for hand-gathering. Verified against the compendium revised January 5, 2026, June 2026."
  },
  // Florida coastal designations:
  {
    match: "biscayne national park",
    sourceLabel: "Biscayne compendium",
    sourceUrl: "https://www.nps.gov/bisc/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: false,
    limit: "Ripe coconuts found on the ground only: collected by hand for personal use; coconuts still on the trees may not be collected or disturbed.",
    note: "DUPLICATE-GUARD: remove this entry if the shorter \"biscayne\" match above is kept. Only one Biscayne entry should ship."
  },
  {
    match: "dry tortugas",
    sourceLabel: "Dry Tortugas compendium",
    sourceUrl: "https://www.nps.gov/drto/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: false,
    limit: "Sea grapes (Coccoloba uvifera): up to 1 quart per person for immediate personal consumption, from trees in public areas; coconuts (Cocos nucifera): only those already fallen to the ground in public areas. No other items are designated.",
    note: "Dry Tortugas (administered with Everglades) designates sea grapes and ground-fallen coconuts for hand-gathering. Verified against the compendium updated January 14, 2026, June 2026."
  },
  {
    match: "gateway arch",
    sourceLabel: "Gateway Arch compendium",
    sourceUrl: "https://www.nps.gov/jeff/learn/management/superintendent-s-compendium-for-2026.htm",
    mushroomsAllowed: false,
    limit: "Nuts (such as acorns) collected from the ground only: gathered by hand, 1 quart per person per day. No fruits or berries are designated; commercial use is prohibited.",
    note: "Gateway Arch designates only ground-collected nuts for hand-gathering. Verified against the 2026 compendium (effective May 28, 2026), June 2026."
  },
  {
    match: "virgin islands national park",
    sourceLabel: "Virgin Islands compendium",
    sourceUrl: "https://www.nps.gov/viis/learn/management/upload/VIIS-Superintendent-Compendium-2022-07-20-508-compliant_signed.pdf",
    mushroomsAllowed: false,
    limit: "Coconuts, limes, mammey apples, soursop, hog plums, papayas, mangoes, genips, guavas, sweet limes, sugar apples, seagrapes, guavaberries, plant seeds (non-listed species), salt, and hoop/wisp vine: gathered by hand for personal use or consumption; no quantity limit specified.",
    note: "Virgin Islands designates listed tropical fruits, seeds, salt, and vines for hand-gathering; mushrooms are not designated. Verified against the 2022 compendium (signed July 2022 — oldest in the set; re-verify if a newer compendium is posted), June 2026."
  },
  // Alaska parklands — gathering allowed under 36 CFR 13.35(c), separate from
  // ANILCA Title VIII subsistence. Denali/Katmai anchored to the former
  // monument/old-park core; preserves and 1980 additions carry separate rules.
  {
    match: "denali national park",
    sourceLabel: "Denali compendium",
    sourceUrl: "https://www.nps.gov/dena/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: true,
    limit: "All edible fruits, berries, mushrooms, and nuts within the former Mount McKinley National Park area: gathered by hand for personal use or consumption (no numeric limit). The 1980 ANILCA park additions and the preserve carry separate subsistence rules.",
    note: "Denali designates all edible fruits, berries, mushrooms, and nuts in the historic park core for general-visitor hand-gathering (36 CFR 13.35(c)); this is separate from ANILCA Title VIII subsistence. Verified against the April 2025 compendium, June 2026."
  },
  {
    match: "gates of the arctic",
    sourceLabel: "Gates of the Arctic compendium",
    sourceUrl: "https://www.nps.gov/locations/alaska/upload/2026-GAAR-Superintendent-s-Compendium-508.pdf",
    mushroomsAllowed: true,
    limit: "Natural plant food items, including fruits, berries, and mushrooms (excluding threatened/endangered species), plus driftwood and unoccupied seashells: gathered by hand for personal use only under 36 CFR 13.35(c); no quantity limit posted.",
    note: "Gates of the Arctic allows general-visitor hand-gathering of berries, fruits, and mushrooms under the Alaska-specific 36 CFR 13.35(c); separate from ANILCA subsistence. Verified against the 2026 compendium, June 2026."
  },
  {
    match: "glacier bay",
    sourceLabel: "Glacier Bay compendium",
    sourceUrl: "https://www.nps.gov/locations/alaska/upload/GLBACompendium-2025_FINAL_11-25_SuptSigOnFile_508.pdf",
    mushroomsAllowed: true,
    limit: "Natural plant food items, including fruits, berries, and mushrooms (excluding threatened/endangered species), plus driftwood and unoccupied seashells: gathered by hand for personal use only under 36 CFR 13.35(c); no quantity restriction at present.",
    note: "Glacier Bay allows general-visitor hand-gathering of berries, fruits, and mushrooms under the Alaska-specific 36 CFR 13.35(c); separate from ANILCA subsistence. Verified against the 2025 compendium (November 2025), June 2026."
  },
  {
    match: "katmai",
    sourceLabel: "Katmai compendium",
    sourceUrl: "https://www.nps.gov/locations/alaska/upload/KATM-Compendium-2026_final_508.pdf",
    mushroomsAllowed: false,
    mushroomNote: "Katmai's compendium designates fruits, berries, nuts, and seashells but not mushrooms in the former-monument core; mushrooms remain prohibited under 36 CFR 2.1(a).",
    limit: "All edible fruits, berries, nuts, and unoccupied seashells within the former Katmai National Monument: gathered by hand for personal use or consumption (by category; no numeric limit). The 1980 ANILCA additions and the preserve carry separate subsistence allowances.",
    note: "Katmai designates all edible fruits, berries, nuts, and seashells in the historic monument core for general-visitor hand-gathering. Verified against the January 2026 compendium, June 2026."
  },
  {
    match: "kobuk valley",
    sourceLabel: "Kobuk Valley (Western Arctic) compendium",
    sourceUrl: "https://www.nps.gov/locations/alaska/upload/2026-WEAR-Superintendent-s-Compendium-508.pdf",
    mushroomsAllowed: true,
    limit: "Natural plant food items, including fruits, berries, and mushrooms (excluding threatened/endangered species): gathered by hand for personal, non-commercial use under 36 CFR 13.35(c); no quantity restriction at present.",
    note: "Kobuk Valley (Western Arctic Parklands) allows general-visitor hand-gathering of berries, fruits, and mushrooms under the Alaska-specific 36 CFR 13.35(c); separate from ANILCA subsistence. Verified against the 2026 WEAR compendium, June 2026."
  },
  {
    match: "lake clark",
    sourceLabel: "Lake Clark compendium",
    sourceUrl: "https://www.nps.gov/locations/alaska/upload/2026-LACL-Compendium-with-Maps-508.pdf",
    mushroomsAllowed: true,
    limit: "Natural plant food items, including fruits, berries, and mushrooms (excluding threatened/endangered species): gathered by hand for personal, non-commercial use under 36 CFR 13.35(c); no superintendent quantity limit at present.",
    note: "Lake Clark allows general-visitor hand-gathering of berries, fruits, and mushrooms under the Alaska-specific 36 CFR 13.35(c); separate from ANILCA subsistence. Verified against the compendium updated January 23, 2026, June 2026."
  },
  {
    match: "kenai fjords",
    sourceLabel: "Kenai Fjords collecting & harvesting page",
    sourceUrl: "https://www.nps.gov/kefj/planyourvisit/collecting-and-harvesting.htm",
    mushroomsAllowed: true,
    limit: "Mushrooms, nuts, berries, and similar items: small quantities collected by hand for personal use (no tools); commercial harvesting prohibited. No numeric limit or named species.",
    note: "Kenai Fjords allows small-quantity hand-gathering of berries, nuts, and mushrooms for personal use (stated on the park's Collecting & Harvesting page; the 2025 compendium carries no separate 2.1(c) list). Verified June 2026."
  },
  {
    match: "wrangell",
    sourceLabel: "Wrangell–St. Elias compendium",
    sourceUrl: "https://www.nps.gov/locations/alaska/upload/WRST-Compendium_with_maps_1-22-2026_508_signed.pdf",
    mushroomsAllowed: true,
    limit: "Natural plant food items, including fruits, berries, and mushrooms (excluding threatened/endangered species): gathered by hand for personal use only under 36 CFR 13.35(c). Mushrooms are capped at two 5-gallon containers of whole, fresh mushrooms per person per day; no numeric cap on fruits/berries.",
    note: "Wrangell–St. Elias allows general-visitor hand-gathering of berries, fruits, and mushrooms under the Alaska-specific 36 CFR 13.35(c); separate from ANILCA subsistence. Verified against the compendium dated January 22, 2026, June 2026."
  },
```

### Phase 1 notes (read before pasting)

- **Remove one Biscayne entry.** I included both a short `"biscayne"` and a long
  `"biscayne national park"` (the latter tagged DUPLICATE-GUARD). Keep exactly
  **one** — the short `"biscayne"` is sufficient and there is no colliding unit.
  Delete the DUPLICATE-GUARD block. (It is in the paste only to make the choice
  explicit; shipping both would create a dead second entry that never matches.)
- **`grand canyon national park`**, not `grand canyon`: the short form would also
  match *Grand Canyon-Parashant National Monument* (different management) and
  wrongly apply the pinyon-nut rule there.
- **`glacier bay`** is safe against the encoded `glacier national park` (neither
  string is a substring of the other).
- **`wrangell`** is intentionally short to survive PAD-US `Unit_Nm` variants
  ("Wrangell-St. Elias" / "Wrangell - St Elias" / with or without the period). No
  other NPS unit name contains "wrangell".
- **Hawaiʻi unit names**: PAD-US generally stores ASCII (`Haleakala`,
  `Hawaii Volcanoes`), so `haleakala` and `hawaii volcanoes` match. If a future
  feed uses the ʻokina/macron, these two matches need adjusting — they are the
  only accent-sensitive matches in the set.
- The 10 prohibited parks (Arches, Badlands, Bryce Canyon, Canyonlands, Channel
  Islands, Everglades, Joshua Tree, American Samoa, Petrified Forest, White
  Sands) get **no entry** — they already resolve to prohibited via the NPS
  default. Adding an entry for them would be wrong (the shape only encodes
  allowances).

## Phase 2 — `ATTRIBUTION.md` source rows

Add one row/line per new park under the NPS compendium section, matching the
existing format (source name, URL, license/access note: NPS compendiums are
public-domain U.S. Government works; cite as the park's current Superintendent's
Compendium). 34 parks; the source URLs are the `sourceUrl` values above. Keep the
"permission-required / access-rule summary, not harvest permission" framing
consistent with the existing NPS rows.

## Phase 3 — Regenerate access-status data (gate)

Per the standing rule (permissions-research doc): whenever `app.js` permission
rules change, rerun both:

```
node scripts/build_access_status.mjs    # refreshes manifest accessCounts/accessCentroids
node scripts/build_status_raster.mjs    # refreshes the iNat overview status raster
```

Then bump the `app.js` cache-version query string in `index.html` (history
convention) and run `bash scripts/check.sh` (must exit 0). Note: most of these 34
parks have **zero Falling Fruit chunks**, so — exactly as documented in
`docs/TODO-overview-rule-coverage.md` — the raster rebuild may be near-identical
until that coverage work ships. That is expected and is not a failure of this
change; the high-zoom point layer will label these parks correctly regardless.

## Acceptance

- `node --check app.js` passes; `NPS_GATHERING_RULES` has 34 new entries (one
  Biscayne, not two).
- Spot-check via the rule path (or `scripts/test_rules.mjs`): a `blackberry` in
  text containing `"mammoth cave national park"` → `allowed`; a mushroom-category
  whitelisted species in `"zion national park"` → `prohibited` (mushroomsAllowed
  false); the same in `"pinnacles national park"` → `allowed`.
- The 10 prohibited parks still resolve `prohibited` (unchanged default).
- `bash scripts/check.sh` exits 0.

## Boundaries

- **Do not** change rule **semantics**, limits, or `mushroomsAllowed` flags — they
  are Claude-owned and finalized in `docs/permissions-research-2026-06-nps-expansion.md`.
  Questions → `docs/codex-questions.md`.
- **Do not** add `NPS_GATHERING_RULES` entries for the 10 prohibited parks.
- **Do not** add any new mushroom/fungi taxon to the species catalog or the
  edible-fungus whitelist. `mushroomsAllowed: true` only relabels
  already-whitelisted species within these parks; the safety whitelist
  (`EDIBLE_FUNGUS_WHITELIST` / `unlistedFungusRule`) stays the gate.
- **Do not** touch Shenandoah's dedicated path or any existing entry.
