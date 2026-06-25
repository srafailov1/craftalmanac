export const meta = {
  name: 'craft-3d-materials-research',
  description: 'Research candidate materials for the Craft Almanac 3D/Objects map: craft survey + Indigenous practices, cross-referenced with harvest ethics, permission structure, and iNaturalist geolocatability',
  phases: [
    { title: 'Discover', detail: 'fan out across craft domains + Indigenous culture areas (contiguous US)' },
    { title: 'Consolidate', detail: 'dedupe/merge into a master candidate list + coverage gaps' },
    { title: 'Gap-fill', detail: 'one discovery agent per flagged coverage gap' },
    { title: 'Verify', detail: 'adversarial per-candidate check: iNat taxon/obs, conservation, legal, cultural, permission fit' },
    { title: 'Synthesize', detail: 'produce candidates-file markdown + findings report' },
  ],
}

// ---------- Shared context handed to every agent ----------
const SITE = `
PROJECT: "Craft Almanac" — a map of local material availability + ethical harvesting practices for the CONTIGUOUS US only (exclude Hawaii, US Virgin Islands, Alaska, PR). It has three live maps (modes): FOOD, INK, MEDICINE. The NEXT map is an "Objects / 3D materials" mode (physical craft materials you shape into objects — NOT dyes/inks, NOT food, NOT medicine).

HOW A MATERIAL IS MAPPED (geolocation mechanism — this is decisive):
- Each catalog entry is tied to one or more iNaturalist TAXON IDs. The map plots live iNaturalist OBSERVATIONS of that taxon (the source organism), over a USGS PAD-US public-access polygon layer, with hand-encoded harvest/collection RULES (from NPS compendiums, 36 CFR 2.1, USFS forest rules, state/local park rules) shown in popups.
- "Falling Fruit" point data exists but is FOOD-FORAGE-oriented (edible street trees etc.) — generally NOT useful for craft materials.
- So a material is GEOLOCATABLE on this site only if its source organism (a plant/tree/etc.) has a usable iNaturalist taxon with reasonable US observation density. Materials that are NOT a mappable organism (loose seashells on a beach, "dead-and-down firewood" as a generic category, shed antler) cannot be plotted as species observations — they would require manually-placed points at permitted locations, or representation via the permission layer only. Call this out per candidate.

HARVEST-ETHIC LABELS (the site uses exactly these; pick the best fit):
- "light harvest" — abundant, resilient; take a small share, plant survives.
- "fallen material preferred" — gather what has dropped (cones, shed bark, downed wood, naturally shed sheets); do not cut/strip living material.
- "invasive removal" — non-native/weedy; careful removal benefits the ecosystem (ENCOURAGED).
- "cultivated preferred" — best sourced from gardens/cultivated stock or with landowner permission.
- "observe only" — do NOT harvest (protected, slow-growing, overharvested, sacred/culturally-appropriated, legally restricted, or seriously toxic). Still worth showing as an educational/identification entry.

PROJECT ETHICS (hard rules — apply them):
- Occurrence data is NEVER harvest permission. Keep that distinction explicit.
- Favor abundant, resilient species suited to low-impact harvesting; invasive removal is encouraged.
- Respect cultural practice: many of the best craft materials are central to Indigenous traditions. Featuring the MATERIAL + identification + a respectful cultural-context note is fine; encouraging casual wild-harvest of a sacred/ceremonial or culturally-stewarded material is NOT. White sage (Salvia apiana) is the canonical "do-not / appropriated" case already flagged on the site. Sacred materials (e.g. western redcedar to PNW nations) -> observe only.
- Separate out overharvested / slow-growing / protected / legally-restricted / seriously-toxic materials as FLAGGED ("observe only" or do-not-add-casually).

PERMISSION STRUCTURE — IMPORTANT NUANCE FOR CRAFT MATERIALS:
- The federal "you may gather edible fruits/nuts/berries/mushrooms for personal consumption" rule (36 CFR 2.1) is a FOOD exception. It does NOT authorize collecting plant STEMS, BARK, ROOTS, NEEDLES, or whole plants for CRAFT on most NPS land — that is generally prohibited for the general public.
- USFS National Forests commonly allow PERSONAL-USE gathering of some "special forest products" (pine cones, boughs, some plant material), sometimes by free-use permit. BLM allows small personal-use amounts.
- Invasive-removal is often actively encouraged across many land types.
- Many craft materials are realistically sourced on PRIVATE / cultivated land, or only with a permit.
- For each candidate, state honestly where craft harvest is plausibly PERMITTED vs. where it is not, given these rule types. Do not assume food-style permission carries over.
`

const ETHIC_LABELS = `Use one of: "light harvest", "fallen material preferred", "invasive removal", "cultivated preferred", "observe only".`

const WEBTOOLS = `FIRST load web tools: call ToolSearch with query "select:WebSearch,WebFetch" then use them. To verify iNaturalist geolocatability, you can WebFetch the API directly: taxon lookup "https://api.inaturalist.org/v1/taxa?q=NAME" (gives taxon id + name), and US observation count "https://api.inaturalist.org/v1/observations?taxon_id=ID&place_id=1&per_page=0" (read total_results; place_id=1 is the United States). Cite real sources (URLs).`

// ---------- Schemas ----------
const CANDIDATE_FIELDS = {
  material: { type: 'string', description: 'Common/material name (e.g. "Pine needles (longleaf)", "Kudzu vine")' },
  scientificName: { type: 'string' },
  craft: { type: 'string', description: 'The 3D craft/object use (basketry, cordage, carving, broom, gourd, etc.)' },
  partUsed: { type: 'string' },
  region: { type: 'string', description: 'Contiguous-US region(s) where it occurs/is used' },
  proposedHarvestEthic: { type: 'string', description: ETHIC_LABELS },
  culturalContext: { type: 'string', description: 'Indigenous/traditional craft context, if any; note appropriation/sacred concerns' },
  safety: { type: 'string', description: 'Handling/ID/toxicity cautions, or "—"' },
  geolocatability: { type: 'string', description: 'Is the source organism mappable via iNaturalist? Or does it need manual points / permission-layer only?' },
  whyFitsOrFlag: { type: 'string', description: 'One line: why it fits the criteria, or why it should be FLAGGED' },
  sources: { type: 'array', items: { type: 'string' } },
}
const DISCOVERY_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: { type: 'object', properties: CANDIDATE_FIELDS, required: ['material', 'scientificName', 'craft', 'partUsed', 'region', 'proposedHarvestEthic', 'geolocatability', 'whyFitsOrFlag'] },
    },
  },
  required: ['candidates'],
}

const CONSOLIDATE_FIELDS = Object.assign({}, CANDIDATE_FIELDS, {
  prelimVerdict: { type: 'string', description: 'feature | flag | exclude' },
  mergedFrom: { type: 'string', description: 'which craft/region lenses surfaced it' },
})
const CONSOLIDATE_SCHEMA = {
  type: 'object',
  properties: {
    master: {
      type: 'array',
      items: { type: 'object', properties: CONSOLIDATE_FIELDS, required: ['material', 'scientificName', 'craft', 'partUsed', 'region', 'proposedHarvestEthic', 'geolocatability', 'prelimVerdict'] },
    },
    coverageGaps: { type: 'array', items: { type: 'string' }, description: 'Craft types, regions, or material classes that look under-covered and deserve a focused gap-fill search' },
  },
  required: ['master', 'coverageGaps'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    material: { type: 'string' },
    scientificName: { type: 'string' },
    inatTaxonId: { type: 'string', description: 'iNaturalist taxon id, or "none" if not found' },
    inatUsObservations: { type: 'string', description: 'Approx US observation count from the API, or note if unmappable' },
    geolocatable: { type: 'string', description: 'yes | weak | no' },
    conservationStatus: { type: 'string', description: 'NatureServe/United Plant Savers/state status; "abundant/secure" if so' },
    legalRestrictions: { type: 'string', description: 'Federal/state harvest-law restrictions (e.g. Migratory Bird Treaty Act for feathers, noxious-weed status, protected-plant lists), or "none known"' },
    culturalSensitivity: { type: 'string', description: 'Appropriation/sacred-material concerns and how to handle, or "none significant"' },
    permissionFit: { type: 'string', description: 'Where craft harvest is plausibly permitted given the site rule types (USFS/BLM personal-use, private/cultivated, invasive-removal), and where it is NOT (NPS general prohibition)' },
    correctedHarvestEthic: { type: 'string', description: ETHIC_LABELS },
    verdict: { type: 'string', description: 'feature | flag | exclude' },
    confidence: { type: 'string', description: 'high | medium | low' },
    rationale: { type: 'string' },
    citations: { type: 'array', items: { type: 'string' } },
  },
  required: ['material', 'scientificName', 'inatTaxonId', 'geolocatable', 'verdict', 'correctedHarvestEthic', 'permissionFit', 'rationale'],
}

const EXISTING_SCHEMA = {
  type: 'object',
  properties: {
    evaluations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          candidate: { type: 'string' },
          geolocationAnswer: { type: 'string', description: 'Concretely: is it in our databases (iNaturalist/Falling Fruit), or must we hand-place points / use the permission layer?' },
          craftDepth: { type: 'string', description: 'How rich/thin is the actual 3D-craft use?' },
          permissionNotes: { type: 'string' },
          recommendation: { type: 'string', description: 'keep / keep-with-caveats / drop, and why' },
        },
        required: ['candidate', 'geolocationAnswer', 'craftDepth', 'recommendation'],
      },
    },
  },
  required: ['evaluations'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    markdownSection: { type: 'string', description: 'The complete markdown block to APPEND to docs/new-materials-candidates.md, ready to paste.' },
    findingsSummary: { type: 'string', description: 'A markdown findings report for the project owner (the narrative answer to their request).' },
  },
  required: ['markdownSection', 'findingsSummary'],
}

// ---------- Phase 1: Discover ----------
phase('Discover')

const CRAFT_DOMAINS = [
  { key: 'basketry-wood-splint', focus: 'Wood/splint basketry & woven-wood objects: white oak splint, black ash splint, hickory splint, rivercane (Arundinaria gigantea), willow rods, honeysuckle/grapevine stems. Source materials and which are abundant/low-impact vs. tree-killing.' },
  { key: 'basketry-coiled-grass', focus: 'Coiled/twined basketry from grasses, sedges, rushes, roots: sweetgrass (Hierochloe/Anthoxanthum), deergrass (Muhlenbergia rigens), sedge root (Carex), bear grass (Xerophyllum tenax), bulrush/tule (Schoenoplectus), cattail (Typha), longleaf/loblolly pine needles, broomsedge.' },
  { key: 'cordage-fiber', focus: 'Cordage, string, netting and woven fiber: dogbane/Indian hemp (Apocynum cannabinum), stinging nettle (Urtica dioica), milkweed (Asclepias), yucca (Yucca), agave (Agave), basswood/linden inner bark (Tilia), fireweed, evening primrose. Which give fiber sustainably (stems harvested dormant) vs. need bark stripping.' },
  { key: 'invasive-craft', focus: 'INVASIVE / weedy plants usable for 3D craft (strong invasive-removal angle): kudzu vine (Pueraria montana), oriental bittersweet (Celastrus orbiculatus), English ivy (Hedera helix), wisteria (Wisteria sinensis), Japanese honeysuckle vine (Lonicera japonica), multiflora rose canes, common reed/phragmites (Phragmites australis), running bamboo (Phyllostachys), Himalayan blackberry canes, periwinkle. Basketry, wreaths, cordage, structural weaving.' },
  { key: 'conifer-pine', focus: 'Pine & conifer craft materials: longleaf (Pinus palustris), loblolly (P. taeda), slash (P. elliottii), ponderosa (P. ponderosa) needles for coiled basketry; pine cones for decorative craft; spruce root (Picea) and pine pitch/resin; fallen cones. Distinguish living-tree harm vs. fallen-needle/cone gathering.' },
  { key: 'greenwood-carving', focus: 'Green woodworking / carving / shaped wood from branches & fallen wood: spoon & bowl carving woods (birch, maple, cherry, walnut), walking sticks, diamond willow, burls, shrink pots, fallen/storm-down branches; and the "dead-and-down firewood" category. Emphasize fallen-material sourcing and where collecting downed wood is permitted (USFS/BLM personal use, NPS campfire-only).' },
  { key: 'gourd-broom-seat', focus: 'Gourds (Lagenaria/Cucurbita), broom-making (broomcorn Sorghum, broom sedge), chair-seat & stool weaving (rush/cattail/bulrush splint, hickory bark), and dried botanical 3D elements (teasel, lotus pods, milkweed pods, Osage orange). Note which are cultivated vs. wild.' },
  { key: 'nonplant-3d', focus: 'NON-PLANT 3D materials with heavy ethics/legal screening: unoccupied seashells (where shelling is legal), shed deer/elk ANTLER, feathers (NOTE: Migratory Bird Treaty Act + Bald and Golden Eagle Protection Act make most wild bird feathers ILLEGAL to possess — flag hard), bone, porcupine quills, clay/pottery temper. For each: legality, geolocatability (none are iNaturalist species observations of the object), and whether the site can responsibly feature it.' },
  { key: 'bark-sheet', focus: 'Bark & sheet materials for containers/canoes/boxes: birch bark (Betula papyrifera/nigra), western redcedar bark, cottonwood/poplar bark, tulip poplar, cherry bark, elm bark. MOST bark harvest girdles/kills living trees and several are culturally sacred — clarify which (if any) are defensible (storm-fallen, already-dead/felled, cultivated) vs. observe-only.' },
]

const REGIONS = [
  { key: 'ind-northeast-woodlands', focus: 'Indigenous craft — Northeast / Eastern Woodlands (Wabanaki/Penobscot/Passamaquoddy, Haudenosaunee, Anishinaabe): black ash splint basketry, sweetgrass, birch bark (wiigwaas) containers/canoes, sweet flag, basswood cordage, porcupine quillwork. Materials, cultural significance, and which fit the site criteria vs. which are sacred/stewarded.' },
  { key: 'ind-southeast', focus: 'Indigenous craft — Southeast (Cherokee, Choctaw, Chitimacha, Coushatta, Seminole): rivercane (Arundinaria) double-weave basketry, white oak splint, longleaf pine needle coiling, sweetgrass, honeysuckle, bloodroot/butternut/walnut as object-dyes. Note rivercane canebrake decline (conservation flag).' },
  { key: 'ind-plains-prairie', focus: 'Indigenous craft — Plains & Prairie (Lakota, Cheyenne, Pawnee, Osage): willow, cattail, bulrush mats, porcupine quillwork, parfleche (rawhide — note this is an animal product), cornhusk, sweetgrass braids, gourd rattles. Which plant materials are featureable.' },
  { key: 'ind-southwest-pueblo-oodham', focus: 'Indigenous craft — Southwest Pueblo/Hopi/Zuni/Tohono Oodham: yucca (Yucca elata) coiled & plaited basketry, beargrass (Nolina), sumac (Rhus trilobata), willow, devils claw (Proboscidea/Martynia) black basketry element, agave, cottonwood (kachina carving). Devils claw is often cultivated by Tohono Oodham — note.' },
  { key: 'ind-southwest-navajo-apache', focus: 'Indigenous craft — Navajo (Dine) & Apache: sumac (Rhus trilobata) coiled wedding baskets, willow, devils claw, yucca, mulberry (Apache burden baskets), cottonwood, sotol. Cultural significance of the Navajo wedding basket; sourcing ethics.' },
  { key: 'ind-california', focus: 'Indigenous craft — California (Pomo, Karuk, Hupa, Yurok, Chumash, Maidu, Washoe): the great basketry traditions. Sedge root (Carex barbarae), redbud (Cercis occidentalis) shoots/bark, willow (Salix), bracken fern root (Pteridium) black element, deergrass (Muhlenbergia rigens), gray/digger pine root (Pinus sabiniana), maidenhair fern stem, sourberry (Rhus aromatica/trilobata), tule. Cultural-burning stewardship context; which fit the criteria.' },
  { key: 'ind-great-basin-plateau', focus: 'Indigenous craft — Great Basin & Plateau (Washoe, Paiute, Shoshone, Nez Perce, Yakama, Klamath): willow coiled/twined baskets, sumac, dogbane/hemp (Apocynum) cordage & cornhusk-style flat bags, tule duck decoys & mats, cattail, beargrass. Washoe degikup baskets context.' },
  { key: 'ind-pacific-northwest', focus: 'Indigenous craft — Pacific Northwest coast & interior (Coast Salish, Makah, Quinault, Nez Perce, Yakama): western redcedar (Thuja plicata) bark & root (SACRED — flag), Sitka spruce root, beargrass (Xerophyllum), cattail mats, sweetgrass, cedar withes. Clarify sacred/observe-only vs. featureable.' },
  { key: 'ind-appropriation-ethics', focus: 'CROSS-CUTTING ethics synthesis: across contiguous-US Indigenous craft materials, produce the list of materials that should be FLAGGED as observe-only / culturally-sensitive (sacred, ceremonially-restricted, stewarded, or commodified-by-appropriation — e.g. white sage, sweetgrass over-commercialization, western redcedar, eagle/migratory-bird feathers) AND the list of materials that ARE appropriate to feature with a respectful identification + cultural-context note (abundant, secular, widely-taught). Be specific about the principle distinguishing the two.' },
]

const discoveryThunks = []
for (const d of CRAFT_DOMAINS) {
  discoveryThunks.push(() => agent(
    `${SITE}\n\n${WEBTOOLS}\n\nYOU ARE A DISCOVERY RESEARCHER for the Craft Almanac 3D/Objects map. Research this craft domain and return candidate materials (contiguous US only):\n\nDOMAIN: ${d.focus}\n\nFor EACH plausible material: give scientific name, the 3D craft use, part used, region, a proposed harvest-ethic label (${ETHIC_LABELS}), any cultural context, safety/handling notes, an honest geolocatability assessment (is the source organism mappable via iNaturalist, or does it need manual points / permission-layer only?), and a one-line "why it fits the criteria" OR "why it should be flagged". Prefer abundant/resilient, fallen-material, and invasive-removal materials. Be thorough — aim for breadth — but do not invent uses; ground each in real craft tradition or documented practice. Cite sources.`,
    { label: `discover:${d.key}`, phase: 'Discover', schema: DISCOVERY_SCHEMA }
  ))
}
for (const r of REGIONS) {
  discoveryThunks.push(() => agent(
    `${SITE}\n\n${WEBTOOLS}\n\nYOU ARE AN ETHNOBOTANY / INDIGENOUS-CRAFT RESEARCHER for the Craft Almanac 3D/Objects map (contiguous US only). This is the project's PRIORITY focus area. Research the materials used in the craft traditions described below, with rigor and cultural respect:\n\n${r.focus}\n\nFor EACH material return: scientific name, the craft use, part used, region, proposed harvest-ethic label (${ETHIC_LABELS}), the cultural context (which peoples, significance), safety notes, geolocatability via iNaturalist, and a one-line judgment on whether it can be featured under the site's criteria OR must be flagged (sacred/stewarded/appropriated/protected -> observe only). The guiding principle: featuring a MATERIAL with identification + respectful context is acceptable; encouraging casual wild-harvest of sacred/ceremonially-restricted/stewarded materials is NOT. Be specific and cite sources.`,
    { label: `region:${r.key}`, phase: 'Discover', schema: DISCOVERY_SCHEMA }
  ))
}
// Existing-candidates re-evaluation (runs alongside discovery)
discoveryThunks.push(() => agent(
  `${SITE}\n\n${WEBTOOLS}\n\nThe project owner already listed four tentative 3D-material candidates and is skeptical of some. Evaluate each one HONESTLY and concretely:\n\n1) UNOCCUPIED SEASHELLS — Owner's key question: are these geolocated in any database we use (iNaturalist, Falling Fruit), or must we hand-place points at beaches where shelling is legal / represent them via the permission layer only? Check whether iNaturalist shell/mollusk observations would actually serve (they map live animals, not empty shells on permitted beaches). Where is beach shelling legal vs. prohibited (e.g. many NPS seashores allow small personal amounts; some prohibit)?\n2) DEAD-AND-DOWN FIREWOOD — is this a mappable "material" at all, or just a land-use rule? Where is collecting downed wood permitted (USFS/BLM personal use, NPS campfire-only)?\n3) WILDFLOWERS — what actual 3D-craft (not dye/ink) use is there? (pressed/dried arrangements, everlastings). How thin is it? Geolocatability?\n4) PINE MATERIALS — needles (longleaf/loblolly) for basketry, cones, pitch. Which sub-uses are strong?\n\nReturn an evaluation per candidate with a clear keep / keep-with-caveats / drop recommendation. Cite sources.`,
  { label: 'reeval:existing-4', phase: 'Discover', schema: EXISTING_SCHEMA }
))

const rawDiscovery = (await parallel(discoveryThunks)).filter(Boolean)
const existingEval = rawDiscovery.find(r => r && Array.isArray(r.evaluations)) || { evaluations: [] }
const allCandidates = rawDiscovery
  .filter(r => r && Array.isArray(r.candidates))
  .flatMap(r => r.candidates)
log(`Discovery surfaced ${allCandidates.length} raw candidate rows across ${CRAFT_DOMAINS.length} craft domains + ${REGIONS.length} Indigenous regions.`)

// ---------- Phase 2: Consolidate ----------
phase('Consolidate')
const consolidated = await agent(
  `${SITE}\n\nYou are CONSOLIDATING the raw discovery output for the 3D/Objects map. Below is a JSON array of candidate material rows surfaced by ${CRAFT_DOMAINS.length} craft-domain researchers and ${REGIONS.length} Indigenous-craft researchers (many overlap — e.g. willow, sumac, yucca, devil's claw appear across regions).\n\nProduce a DEDUPED, MERGED master list. Merge rows for the same material/species into one entry, combining the craft uses, regions, cultural contexts, and the strictest applicable safety/ethic. For each merged entry assign a prelimVerdict of "feature" (abundant/secular/mappable + plausibly harvestable), "flag" (sacred/stewarded/appropriated/protected/slow-growing/overharvested/legally-restricted/seriously-toxic -> show as observe-only/cautionary), or "exclude" (not actually a 3D craft material, not geolocatable AND no value, or out of contiguous-US scope). Keep entries that are flagged — flagging is valuable. Also return a coverageGaps list: craft types, culture areas, or material classes that look under-covered and warrant a focused follow-up search.\n\nRAW CANDIDATES JSON:\n${JSON.stringify(allCandidates)}`,
  { label: 'consolidate', phase: 'Consolidate', schema: CONSOLIDATE_SCHEMA, effort: 'high' }
)
let master = consolidated.master || []
log(`Consolidated to ${master.length} unique candidates. Coverage gaps flagged: ${(consolidated.coverageGaps || []).length}.`)

// ---------- Phase 3: Gap-fill ----------
phase('Gap-fill')
const gaps = (consolidated.coverageGaps || []).slice(0, 8)
if (gaps.length) {
  const gapResults = (await parallel(gaps.map(g => () => agent(
    `${SITE}\n\n${WEBTOOLS}\n\nFocused gap-fill search for the 3D/Objects map (contiguous US only). A consolidation pass found this area under-covered:\n\nGAP: ${g}\n\nReturn any additional candidate materials for this gap, with the full per-candidate fields (scientific name, craft use, part, region, proposed harvest ethic [${ETHIC_LABELS}], cultural context, safety, geolocatability via iNaturalist, why-fits-or-flag). Ground each in real practice and cite sources.`,
    { label: `gap:${g.slice(0, 28)}`, phase: 'Gap-fill', schema: DISCOVERY_SCHEMA }
  )))).filter(Boolean)
  const gapCandidates = gapResults.flatMap(r => r.candidates || [])
  const seen = new Set(master.map(m => (m.scientificName || '').toLowerCase().trim()))
  let added = 0
  for (const c of gapCandidates) {
    const k = (c.scientificName || '').toLowerCase().trim()
    if (k && !seen.has(k)) { seen.add(k); master.push(Object.assign({ prelimVerdict: 'feature', mergedFrom: 'gap-fill' }, c)); added++ }
  }
  log(`Gap-fill added ${added} new candidates (from ${gapCandidates.length} surfaced).`)
} else {
  log('No coverage gaps flagged; skipping gap-fill.')
}

// ---------- Phase 4: Verify (adversarial, per candidate) ----------
phase('Verify')
const verified = (await parallel(master.map(c => () => agent(
  `${SITE}\n\n${WEBTOOLS}\n\nYou are an ADVERSARIAL VERIFIER. Pressure-test this candidate material for the 3D/Objects map. Be skeptical: the project's reputation depends on not recommending something that is protected, illegal to harvest, culturally inappropriate to wild-harvest, or unmappable.\n\nCANDIDATE (JSON): ${JSON.stringify(c)}\n\nVerify and report, with citations:\n- iNaturalist taxon id + approximate US observation count (use the API as described). Decide geolocatable = yes / weak / no.\n- Conservation status (NatureServe, United Plant Savers at-risk/to-watch, state rare/protected lists). Is it genuinely abundant?\n- Legal restrictions on harvesting THIS PART for craft: noxious-weed status, state protected-plant laws, the Migratory Bird Treaty Act / Bald & Golden Eagle Protection Act (for feathers), antler/wildlife-part rules, NPS/federal collection prohibition.\n- Cultural sensitivity: is wild-harvest of this material sacred/ceremonially-restricted/stewarded/appropriated? How should the site handle it?\n- Permission fit: WHERE is craft harvest of this part plausibly permitted given the site's rule types (USFS/BLM personal-use special-forest-products, private/cultivated land, invasive-removal), and where is it NOT (NPS general plant-collection prohibition — remember the 36 CFR 2.1 food exception does NOT cover craft material)?\n- correctedHarvestEthic (${ETHIC_LABELS}) and a final verdict: "feature" (safe, abundant, mappable, harvestable somewhere defensibly), "flag" (include only as observe-only / cautionary), or "exclude" (drop). Give confidence + rationale.`,
  { label: `verify:${(c.material || '?').slice(0, 26)}`, phase: 'Verify', schema: VERIFY_SCHEMA, effort: 'high' }
).then(v => v ? Object.assign({}, c, v) : null)))).filter(Boolean)

const feature = verified.filter(v => v.verdict === 'feature')
const flag = verified.filter(v => v.verdict === 'flag')
const exclude = verified.filter(v => v.verdict === 'exclude')
log(`Verified ${verified.length}: ${feature.length} feature, ${flag.length} flag (observe-only), ${exclude.length} exclude.`)

// ---------- Phase 5: Synthesize ----------
phase('Synthesize')
const FORMAT = `
OUTPUT FORMAT for markdownSection — match the existing docs/new-materials-candidates.md conventions:
- Start with an H1: "# 3D / Objects-mode material candidates (2026-06-25 research pass)" and a short intro paragraph noting: contiguous-US only; nothing here is added to the site yet (owner review); each entry would still need an iNaturalist taxon id, seasonality, safety tags, and a category mapping before inclusion; and the KEY permission insight (craft material harvest is governed differently and generally more strictly than food — the 36 CFR 2.1 food exception does not cover craft parts).
- A "## Permission & geolocation structure for a 3D map" subsection (a few paragraphs): explain that geolocation works only for materials whose source organism is mappable in iNaturalist; that loose seashells / dead-and-down firewood / shed antler are NOT species observations and need manual points or permission-layer treatment; and where craft harvest is realistically permitted (USFS/BLM personal-use, private/cultivated, invasive-removal) vs not (NPS).
- A "## 3D / craft material candidates for review" subsection with a markdown table: | Material | Scientific name | Craft use | Part used | Region(s) | Harvest ethic | iNat / geolocatable | Safety | Notes | — one row per FEATURE candidate.
- A "## ⚠ FLAGGED — do NOT add casually (observe-only / culturally sensitive / restricted)" subsection with a table: | Material | Scientific name | Craft use | Region(s) | Flag — why to withhold | Safety | — one row per FLAG candidate.
- A "## Indigenous craft practices (contiguous US) — featureable vs. flagged" subsection: a concise narrative organized by culture area (Eastern Woodlands, Southeast, Plains, Southwest, California, Great Basin/Plateau, Pacific NW), stating the materials and the principle that distinguishes featureable (abundant/secular/widely-taught, shown with respectful context) from observe-only (sacred/ceremonial/stewarded/appropriated).
- A "## Re-evaluation of the four existing 3D candidates" subsection: seashells (answer the geolocation question directly), firewood, wildflowers, pine materials — each with a keep / keep-with-caveats / drop call.
- A "## Excluded this pass" short list with one-line reasons.
Use real iNaturalist taxon ids where the verification found them.`

const synthesis = await agent(
  `${SITE}\n\nYou are SYNTHESIZING the final research deliverable for the project owner. You have verified candidate data and the re-evaluation of the four existing candidates. Write (1) markdownSection to append to the candidates doc, and (2) findingsSummary — a clear, honest narrative report answering the owner's request: a breadth survey of crafts whose materials fit the harvest ethics, with the strongest recommendations called out; the permission-structure insight; the Indigenous-practices findings with appropriation flags; and the verdict on the four existing candidates (especially the seashell geolocation question). Recommend a concrete shortlist of the best initial materials for the map and note the biggest caveats.\n\n${FORMAT}\n\nFEATURE candidates (JSON): ${JSON.stringify(feature)}\n\nFLAGGED candidates (JSON): ${JSON.stringify(flag)}\n\nEXCLUDED (JSON, names+rationale only): ${JSON.stringify(exclude.map(e => ({ material: e.material, scientificName: e.scientificName, rationale: e.rationale })))}\n\nEXISTING-4 re-evaluation (JSON): ${JSON.stringify(existingEval.evaluations)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA, effort: 'high' }
)

return {
  counts: { raw: allCandidates.length, master: master.length, feature: feature.length, flag: flag.length, exclude: exclude.length },
  markdownSection: synthesis.markdownSection,
  findingsSummary: synthesis.findingsSummary,
}
