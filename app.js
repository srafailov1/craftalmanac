const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const ACTIVE_YEAR = new Date().getFullYear();
let CATEGORIES = ["fruit", "berry", "nut", "mushroom"];
const MAPBOX_TOKEN = window.FORAGE_CONFIG?.mapboxToken || "";
const DATA_REFRESH_DELAY = 550;
const PUBLIC_LANDS_REFRESH_DELAY = 650;
const LIVE_DATA_TIMEOUT = 9000;
const INATURALIST_DEFAULT_PER_PAGE = 120;
const INATURALIST_MAX_PER_PAGE = 200;
const INATURALIST_TILE_PER_PAGE = 50;
const INATURALIST_AGGREGATE_DELAY = 260;
const INATURALIST_GRID_MIN_ZOOM = 2;
const INATURALIST_GRID_MAX_ZOOM = 7;
const INATURALIST_GRID_MAX_TILES = 24;
const INATURALIST_GRID_CELL_BUCKETS = 32;
const AGGREGATE_FIRST_PAINT_GRACE_MS = 2500;
const AGGREGATE_BRIDGE_MAX_MS = 2500;
// Cluster layers stay renderable a bit below the point band so they can
// bridge the downward handoff while a fresh aggregate paint is prepared.
const MARKER_CLUSTER_BRIDGE_MIN_ZOOM = 6.4;
const INATURALIST_AGGREGATE_SPECIES_ID = "__inat-aggregate";
const INATURALIST_REGION_PLACE_IDS = "1";
const PUBLIC_LANDS_URL = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/PADUS_Public_Access/FeatureServer/0/query";
const PUBLIC_LANDS_PAGE_SIZE = 1000;
const PUBLIC_LANDS_MAX_PAGES = 4;
const MARKERS_SOURCE_ID = "forage-records";
const MARKERS_LAYER_ID = "forage-record-points";
const MARKER_CLUSTERS_LAYER_ID = "forage-record-clusters";
const MARKER_CLUSTER_COUNT_LAYER_ID = "forage-record-cluster-count";
const MARKER_CLUSTER_MAX_ZOOM = 12;
const MARKER_CLUSTER_RADIUS = 40;
const FALLING_FRUIT_AGGREGATE_SOURCE_ID = "falling-fruit-aggregates";
const FALLING_FRUIT_AGGREGATE_LAYER_ID = "falling-fruit-aggregate-circles";
const FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID = "falling-fruit-aggregate-counts";
const FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID = "falling-fruit-aggregate-labels";
const FALLING_FRUIT_MANIFEST_URL = "./data/falling-fruit/us/manifest.json";
const STATUS_RASTER_URL = "./data/falling-fruit/us/status-raster.json";
const STATUS_RASTER_CELL_SIZE_DEGREES = 0.05;
const FALLING_FRUIT_MIN_LOAD_ZOOM = 8;
const FALLING_FRUIT_MAX_VIEWPORT_CHUNKS = 160;
// Live-data caches grow as the user pans; trim the oldest entries past these
// caps so long sessions don't accumulate unbounded memory.
const INATURALIST_RECORD_CACHE_MAX = 12000;
const INATURALIST_AGGREGATE_CACHE_MAX = 800;
const FALLING_FRUIT_CHUNK_CACHE_MAX = 400;
const PUBLIC_LANDS_MIN_RENDER_ZOOM = 8;
const PUBLIC_LANDS_SOURCE_ID = "public-lands";
const PUBLIC_LANDS_FILL_LAYER_ID = "public-lands-fill";
const PUBLIC_LANDS_LINE_LAYER_ID = "public-lands-line";
const REGION_BOUNDARY_SOURCE_ID = "region-boundary";
const REGION_MASK_SOURCE_ID = "region-mask";
const REGION_MASK_LAYER_ID = "region-mask-fill";
const REGION_OUTLINE_LAYER_ID = "region-outline";
const MAPBOX_STYLE = "mapbox://styles/mapbox/outdoors-v12";
const REGION_MAX_BOUNDS = [
  [-127.0, 22.5],
  [-65.0, 50.8]
];
const REGION_NAME = "the contiguous United States";
const REGION_STATES = "the contiguous United States";
const FOOD_CATEGORY_COLORS = {
  berry: "#d12f7a",
  fruit: "#1b8a5a",
  nut: "#c47a15",
  mushroom: "#6f4acb"
};
const INK_CATEGORY_COLORS = {
  black: "#252321",
  brown: "#8a5a2b",
  yellow: "#d8a829",
  red: "#bf4150",
  purple: "#624c9f",
  blue: "#316d8f"
};
const MEDICINE_CATEGORY_COLORS = {
  topical: "#3f8d76",
  immune: "#6978b8",
  digestive: "#b7792f",
  lymphatic: "#9a5f9f"
};
let CATEGORY_COLORS = FOOD_CATEGORY_COLORS;
const ACCESS_RULE_SOURCES = {
  npsGeneral: "https://www.ecfr.gov/current/title-36/chapter-I/part-2/section-2.1",
  shenandoah: "https://www.nps.gov/shen/learn/management/compendium.htm#CP_JUMP_5595647",
  blueRidge: "https://www.nps.gov/blri/learn/management/superintendent-s-compendium.htm",
  princeWilliam: "https://www.nps.gov/prwi/learn/management/superintendents-compendium.htm",
  manassas: "https://www.nps.gov/mana/learn/management/compendium.htm",
  usfs: "https://www.fs.usda.gov/r08/gwj/permits/forest-products-permits",
  blm: "https://www.blm.gov/programs/natural-resources/forests-and-woodlands/forest-product-permits",
  usfws: "https://www.ecfr.gov/current/title-50/chapter-I/subchapter-C/part-27",
  usace: "https://www.ecfr.gov/current/title-36/chapter-III/part-327",
  virginiaParks: "https://law.lis.virginia.gov/admincode/title4/agency5/chapter30/section50/",
  virginiaStateForests: "https://law.lis.virginia.gov/admincode/title4/agency10/chapter30/section50/",
  virginiaWma: "https://dwr.virginia.gov/wp-content/uploads/media/wma-rules.pdf",
  beaconFoodForest: "https://www.beaconfoodforest.org/openharvest",
  charlottesville: "https://www.charlottesville.gov/658/Parks-Trails",
  albemarle: "https://www.albemarle.org/government/parks-recreation",
  newYorkDec: "https://dec.ny.gov/nature/forests-trees/state-forests/rules-for-use",
  pennsylvaniaDcnr: "https://www.pa.gov/agencies/dcnr/recreation/where-to-go/state-forests/rules-and-regulations",
  washingtonParks: "https://app.leg.wa.gov/wac/default.aspx?cite=352-28-030",
  californiaParks: "https://www.parks.ca.gov/?page_id=21301",
  nycParks: "https://www.nycgovparks.org/rules/section-1-04/",
  monticello: "https://www.monticello.org/visit/tips-for-visiting/guest-policies",
  uvaGardens: "https://sustainability.virginia.edu/blog/exploring-edible-food-grown-grounds",
  coloradoParks: "https://www.law.cornell.edu/regulations/colorado/2-CCR-405-1-100",
  oregonParks: "https://secure.sos.state.or.us/oard/view.action?ruleNumber=736-010-0055",
  marylandParks: "https://regs.maryland.gov/us/md/exec/comar/08.07.06.13",
  marylandForests: "https://regs.maryland.gov/us/md/exec/comar/08.07.01.13",
  northCarolinaParks: "http://reports.oah.state.nc.us/ncac/title%2007%20-%20natural%20and%20cultural%20resources/chapter%2013%20-%20parks%20and%20recreation%20area%20rules/chapter%2013%20rules.pdf",
  michiganDnr: "https://www.michigan.gov/dnr/things-to-do/foraging",
  minnesotaParks: "https://www.revisor.mn.gov/rules/6100.0900/",
  carverEdiblePark: "https://www.ashevillenc.gov/news/park-views-dr-george-washington-carver-edible-park/",
  festivalBeachFoodForest: "https://festivalbeach.org/frequently-asked-questions/",
  brownsMillFoodForest: "https://aglanta.atlantaga.gov/urban-food-forest-at-browns-mill-1",
  botanicalGardens: "https://www.usna.usda.gov/visit/rules-and-guidelines/"
};

// Park-specific 36 CFR 2.1(c) gathering designations, matched against PAD-US
// unit text before the generic NPS prohibition. Food mode only — the earlier
// non-food NPS branch keeps craft/medicine collection marked prohibited.
// Limits reflect recent superintendent's compendiums; always confirm current.
const NPS_GATHERING_RULES = [
  {
    match: "great smoky",
    sourceLabel: "Great Smoky Mountains compendium",
    sourceUrl: "https://www.nps.gov/grsm/learn/management/compendium.htm",
    mushroomsAllowed: true,
    limit: "Listed fruits, berries, and nuts: 1 pound per person per day per species (apples, pears, and peaches excepted); edible soil-growing mushrooms: 1 pound combined, 100+ feet from roads and facilities.",
    note: "Great Smoky Mountains designates listed species for hand-gathering 200+ feet from nature trails; ramps may not be collected. Confirm the species appears in the compendium list. Verified against the current compendium, June 2026."
  },
  {
    match: "new river gorge",
    sourceLabel: "New River Gorge compendium",
    sourceUrl: "https://www.nps.gov/neri/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: true,
    limit: "Listed berries and fruits (including mayapples and sumac berries): 1 gallon per person per day; apples, black walnuts, peaches, pears, persimmons, and plums: 3 gallons; edible mushrooms (morel, oyster, chanterelle, puffball, black trumpet, dryad's saddle, sulphur shelf): 1.5 gallons.",
    note: "New River Gorge designates listed fruits, nuts, and mushrooms for personal-use gathering. Ramps were removed from the designation (depleted populations) and ginseng is illegal to harvest on NPS land. Verified against the current compendium, June 2026."
  },
  {
    match: "acadia",
    sourceLabel: "Acadia compendium",
    sourceUrl: "https://www.nps.gov/acad/learn/management/sc.htm",
    mushroomsAllowed: false,
    mushroomNote: "Acadia's compendium explicitly prohibits collecting mushrooms (and conifer cones, lichens, and fiddlehead ferns): too little is known about harvest effects on fungi and their role in the ecosystem.",
    limit: "Edible fruits and berries (excluding apples): 1 dry half-gallon per person per day; apples: up to 10 dry gallons; unshelled nuts: 1/2 gallon; unoccupied seashells: 1 pint. Gathering must not damage the plant.",
    note: "Acadia designates edible fruits, berries, nuts, and unoccupied seashells for hand-gathering; mushroom collection is explicitly prohibited. Verified against the current compendium, June 2026."
  },
  {
    match: "cuyahoga valley",
    sourceLabel: "Cuyahoga Valley compendium",
    sourceUrl: "https://www.nps.gov/cuva/learn/management/superintendents-compendium.htm",
    mushroomsAllowed: false,
    mushroomNote: "Cuyahoga Valley's compendium explicitly prohibits collecting fungi (mushrooms) and bulbs in any quantity; the adjacent Summit and Cleveland Metroparks also prohibit foraging.",
    limit: "Reasonable quantities of edible fruit, berries, or nuts for personal use, excluding state or federally listed rare, threatened, or endangered plants. Fungi (mushrooms) and bulbs may not be collected in any quantity.",
    note: "Cuyahoga Valley permits hand-collection of edible fruit, berries, and nuts; mushroom and bulb collection is explicitly prohibited. Verified against the current compendium, June 2026."
  },
  {
    match: "olympic national park",
    sourceLabel: "Olympic compendium",
    sourceUrl: "https://www.nps.gov/olym/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: true,
    limit: "Edible fruits, berries, nuts, and mushroom fruiting bodies: 1 quart per person per day, except within 200 feet of nature trails, special trails, and natural study areas. Cranberries and native blackberries: 3 1/2 gallons once per two-week period. Exotic species (apples, pears, non-native blackberries) are exempt from limits. Unoccupied seashells: a handful per visit.",
    note: "Olympic designates edible fruits, berries, nuts, mushrooms, and unoccupied seashells for hand-gathering for personal consumption. Verified against the current compendium, June 2026."
  },
  {
    match: "mount rainier",
    sourceLabel: "Mount Rainier compendium",
    sourceUrl: "https://www.nps.gov/mora/learn/management/lawsandpolicies.htm",
    mushroomsAllowed: true,
    limit: "Listed berries (blueberries, highbush cranberries, gooseberries, salmonberries, blackberries, thimbleberries, serviceberries, strawberries) and edible mushrooms: no more than 1 gallon per person per day, gathered by hand.",
    note: "Mount Rainier designates listed berries and edible fungi for hand-gathering; stay on trail in the Paradise, Sunrise, Tipsoo Lake, and Ohanapecosh hot springs areas. Verified against the 2025 compendium, June 2026."
  },
  {
    match: "rocky mountain national park",
    sourceLabel: "Rocky Mountain compendium",
    sourceUrl: "https://www.nps.gov/romo/learn/management/rmnp_compendium.htm",
    mushroomsAllowed: false,
    mushroomNote: "Rocky Mountain's compendium explicitly states edible mushrooms are not permitted to be gathered or consumed.",
    limit: "Listed fruits and berries (blueberries and huckleberries, chokecherries, red elderberries, raspberries, rose hips, strawberries): 1 quart per person per day for personal consumption.",
    note: "Rocky Mountain designates listed fruits and berries for hand-gathering; mushroom collection is explicitly prohibited. Verified against the 2025 compendium, June 2026."
  },
  {
    match: "yellowstone",
    sourceLabel: "Yellowstone compendium",
    sourceUrl: "https://www.nps.gov/yell/learn/management/compendium.htm",
    mushroomsAllowed: true,
    limit: "Edible berries and mushrooms: 1 quart per species per person per day; possession and consumption are restricted to park areas.",
    note: "Yellowstone allows limited berry and mushroom gathering consumed inside the park. Verified against the current compendium, June 2026."
  },
  {
    match: "yosemite",
    sourceLabel: "Yosemite compendium",
    sourceUrl: "https://www.nps.gov/yose/learn/management/upload/yose-compendium.pdf",
    mushroomsAllowed: true,
    limit: "Listed berries (blackberries, raspberries, elderberries, strawberries, thimbleberries, huckleberries): 1 pint per person per day each, for immediate consumption; invasive Himalayan blackberries: unlimited; edible fungi: 1 pint per day, cut (not pulled); apples and pears may be gathered and transported for non-commercial use.",
    note: "Yosemite allows small-quantity berry and fungus gathering for immediate consumption. Verified against the September 2025 compendium, June 2026."
  },
  {
    match: "glacier national park",
    sourceLabel: "Glacier compendium",
    sourceUrl: "https://www.nps.gov/glac/learn/management/compendium.htm",
    mushroomsAllowed: false,
    mushroomNote: "Glacier's compendium explicitly prohibits picking, gathering, or harvesting mushrooms; removing fruiting bodies removes the spores that continue the fungus's reproductive cycle.",
    limit: "Edible fruits, nuts, and berries: 1 quart per person per day, gathered by hand; bush rakes and other harvesting devices are prohibited. Mushroom gathering is prohibited.",
    note: "Glacier designates edible fruits, nuts, and berries for hand-gathering; harvesting tools and mushroom collection are explicitly prohibited. Verified against the current compendium, June 2026."
  },
  {
    match: "crater lake",
    sourceLabel: "Crater Lake compendium",
    sourceUrl: "https://www.nps.gov/crla/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: false,
    limit: "Blueberries, huckleberries, Pacific serviceberries, and western thimbleberries: 1 quart per person per day possession limit each; all park areas are open to collection of these berries.",
    note: "Crater Lake designates four berry groups for hand-gathering; other gathering (including mushrooms) is not designated. Verified against the current compendium, June 2026."
  },
  {
    match: "grand teton",
    sourceLabel: "Grand Teton compendium",
    sourceUrl: "https://www.nps.gov/grte/learn/management/compendium.htm",
    mushroomsAllowed: true,
    limit: "Edible fruits, berries, nuts, and mushrooms: 1 quart per species per person per day; possession and consumption are restricted to park areas.",
    note: "Grand Teton (and the adjacent Rockefeller Parkway) allows gathering of specified vegetation for immediate personal consumption. Verified against the current compendium, June 2026."
  },
  {
    match: "redwood",
    sourceLabel: "Redwood compendium",
    sourceUrl: "https://www.nps.gov/redw/learn/management/superintendent-s-compendium.htm",
    mushroomsAllowed: false,
    limit: "All berry species: 1 gallon per person per day; apples: 5 per day; tanoak acorns: 10 gallons; hazelnuts: 1 gallon; unoccupied seashells: 1 gallon (below the storm-wave limit only).",
    note: "Redwood designates berries, listed nuts, apples, and seashells for hand-gathering; mushrooms are not designated. Verified against the current compendium, June 2026."
  },
  {
    match: "capitol reef",
    sourceLabel: "Capitol Reef orchards",
    sourceUrl: "https://www.nps.gov/care/learn/historyculture/orchards.htm",
    mushroomsAllowed: false,
    limit: "Fruita historic orchards: harvest only ripe fruit from orchards posted with \"U-Pick Fruit\" signs; fruit taken from the orchards must be paid for at the self-pay station.",
    note: "Capitol Reef's historic orchards operate a managed u-pick program rather than wild gathering; never climb the historic trees. Verified against the park's current orchard regulations, June 2026."
  },
  {
    match: "death valley",
    sourceLabel: "Death Valley compendium",
    sourceUrl: "https://www.nps.gov/deva/learn/management/rules-and-regulations.htm",
    mushroomsAllowed: false,
    limit: "Pine nuts, mesquite beans, grapes, and fruit from non-native trees (palms, apples, figs, black walnuts, pomegranates): less than 1 quart per person per day and no more than 5 total quarts per calendar year.",
    note: "Death Valley designates several native and non-native foods for hand-gathering in small personal-use amounts. Verified against the current compendium, June 2026."
  },
  {
    match: "indiana dunes",
    sourceLabel: "Indiana Dunes natural-items rules",
    sourceUrl: "https://www.nps.gov/indu/learn/management/naturalitems.htm",
    mushroomsAllowed: false,
    mushroomNote: "Indiana Dunes prohibits picking or removing mushrooms (along with all flowers, leaves, and seeds) under 36 CFR 2.1(a)(1)(ii); only fruits, nuts, and berries are designated for personal-use collection.",
    limit: "Fruits, nuts, and berries: up to a handful per person for personal, non-commercial use (36 CFR 2.1(c)(1)); prickly pear cactus is fully protected. A small amount of unoccupied seashells may also be taken.",
    note: "Indiana Dunes designates only fruits, nuts, and berries (a handful per person) for personal-use hand-collection; all other plant material, including mushrooms, flowers, leaves, and seeds, is protected. Verified against the park's natural-items rules page, June 2026."
  },
  {
    match: "sequoia national park",
    sourceLabel: "Sequoia & Kings Canyon park rules",
    sourceUrl: "https://www.nps.gov/seki/planyourvisit/wherecani.htm",
    mushroomsAllowed: true,
    limit: "Berries, mushrooms, and a few other plants may be collected for immediate personal consumption only; per-species daily limits are set in the park compendium. Collecting inedible natural objects (wildflowers, cones, rocks, bones) is prohibited.",
    note: "Sequoia and Kings Canyon allow gathering of berries, mushrooms, and a few designated plants for immediate consumption within the park; confirm the species and current limit in the superintendent's compendium (https://www.nps.gov/seki/learn/management/superintendent-s-compendium.htm). Verified against the park's rules page, June 2026."
  },
  {
    match: "kings canyon",
    sourceLabel: "Sequoia & Kings Canyon park rules",
    sourceUrl: "https://www.nps.gov/seki/planyourvisit/wherecani.htm",
    mushroomsAllowed: true,
    limit: "Berries, mushrooms, and a few other plants may be collected for immediate personal consumption only; per-species daily limits are set in the park compendium. Collecting inedible natural objects (wildflowers, cones, rocks, bones) is prohibited.",
    note: "Sequoia and Kings Canyon allow gathering of berries, mushrooms, and a few designated plants for immediate consumption within the park; confirm the species and current limit in the superintendent's compendium (https://www.nps.gov/seki/learn/management/superintendent-s-compendium.htm). Verified against the park's rules page, June 2026."
  }
];

const SITE_ACCESS_RULES = [
  {
    name: "Beacon Food Forest",
    bounds: { south: 47.5648, west: -122.3137, north: 47.5683, east: -122.3105 },
    rules: {
      food: {
        status: "allowed",
        label: "Allowed",
        area: "Beacon Food Forest (Seattle)",
        limit: "Open harvest year-round for anyone: take what you need of what's ripe and abundant, and leave some for others. Do not pick from the P-patch plots (stone-walled rectangles/hexagons, rented by individual gardeners) or the food bank plot.",
        note: "A 7-acre public food forest on Seattle Public Utilities land beside Jefferson Park, founded on an open-harvest, fair-share-for-all policy.",
        sourceLabel: "Beacon Food Forest open harvest policy",
        sourceUrl: ACCESS_RULE_SOURCES.beaconFoodForest
      },
      medicine: {
        status: "allowed",
        label: "Allowed",
        area: "Beacon Food Forest (Seattle)",
        limit: "The open-harvest invitation covers the site's medicinal plantings: harvest gently, take only what's abundant, and leave some for others. Do not pick from P-patch plots or the food bank plot.",
        note: "Please leave the sust̓əlǰixʷali Traditional Indian Medicine garden, tended by the Seattle Indian Health Board, to its caretakers unless invited.",
        sourceLabel: "Beacon Food Forest open harvest policy",
        sourceUrl: ACCESS_RULE_SOURCES.beaconFoodForest
      },
      default: {
        status: "allowed",
        label: "Allowed",
        area: "Beacon Food Forest (Seattle)",
        limit: "The open-harvest invitation extends to the site's crafting plants: harvest gently, take only what's abundant, and leave some for others. Do not pick from P-patch plots or the food bank plot.",
        note: "Beacon Food Forest describes more than 100 edible, medicinal, and crafting plants open for community harvest.",
        sourceLabel: "Beacon Food Forest open harvest policy",
        sourceUrl: ACCESS_RULE_SOURCES.beaconFoodForest
      }
    }
  },
  {
    name: "Dr. George Washington Carver Edible Park",
    bounds: { south: 35.5933, west: -82.5478, north: 35.5947, east: -82.5462 },
    rules: {
      food: {
        status: "allowed",
        label: "Allowed",
        area: "Dr. George Washington Carver Edible Park (Asheville)",
        limit: "Visitors are encouraged to enjoy freshly picked produce from the park's 40+ fruit and nut species, and discouraged from taking more than their fair share.",
        note: "The nation's first public food forest (1997), a City of Asheville park maintained with Bountiful Cities. Leave the community-garden plots to their gardeners.",
        sourceLabel: "City of Asheville Parks & Recreation",
        sourceUrl: ACCESS_RULE_SOURCES.carverEdiblePark
      },
      default: {
        status: "unknown",
        label: "Unknown",
        area: "Dr. George Washington Carver Edible Park (Asheville)",
        limit: "The city's open invitation covers picking produce to eat; collection of craft or medicinal material is not addressed.",
        note: "Ask Bountiful Cities or Asheville Parks & Recreation before collecting non-food material.",
        sourceLabel: "City of Asheville Parks & Recreation",
        sourceUrl: ACCESS_RULE_SOURCES.carverEdiblePark
      }
    }
  },
  {
    name: "Festival Beach Food Forest",
    bounds: { south: 30.2529, west: -97.7361, north: 30.2542, east: -97.7346 },
    rules: {
      food: {
        status: "allowed",
        label: "Allowed",
        area: "Festival Beach Food Forest (Austin)",
        limit: "Open foraging of fruits, vegetables, and herbs, free for the taking: gather only what's abundant and healthy, take only what you need, and leave some to reseed.",
        note: "A fence-less public food forest on Austin parkland beside the Festival Beach Community Garden — don't pick from the garden's individual plots. Double-check identification; not every plant here is edible.",
        sourceLabel: "Festival Beach Food Forest",
        sourceUrl: ACCESS_RULE_SOURCES.festivalBeachFoodForest
      },
      medicine: {
        status: "allowed",
        label: "Allowed",
        area: "Festival Beach Food Forest (Austin)",
        limit: "The food forest grows medicinal herbs as part of its public plantings, with signage on which plants are medicinal: harvest gently and take only what you need.",
        note: "Confirm identification against the site's signage, and leave enough for the plant to recover and others to share.",
        sourceLabel: "Festival Beach Food Forest",
        sourceUrl: ACCESS_RULE_SOURCES.festivalBeachFoodForest
      },
      default: {
        status: "unknown",
        label: "Unknown",
        area: "Festival Beach Food Forest (Austin)",
        limit: "The open-foraging invitation covers food and medicinal herbs; collection of craft material is not addressed — \"take food, not the forest.\"",
        note: "Ask the food forest stewards before collecting non-food material.",
        sourceLabel: "Festival Beach Food Forest",
        sourceUrl: ACCESS_RULE_SOURCES.festivalBeachFoodForest
      }
    }
  },
  {
    name: "Urban Food Forest at Browns Mill",
    bounds: { south: 33.6921, west: -84.376, north: 33.6939, east: -84.374 },
    rules: {
      food: {
        status: "allowed",
        label: "Allowed",
        area: "Urban Food Forest at Browns Mill (Atlanta)",
        limit: "The City of Atlanta's public food forest grows nuts, fruits, vegetables, herbs, and mushrooms for public consumption; harvest modestly and follow posted guidance and any volunteer-led harvest practices.",
        note: "The nation's largest public food forest, community-managed with excess harvests shared with local food pantries. The city's detailed harvest-guidelines page is currently offline — follow on-site signage.",
        sourceLabel: "AgLanta (City of Atlanta)",
        sourceUrl: ACCESS_RULE_SOURCES.brownsMillFoodForest
      },
      default: {
        status: "unknown",
        label: "Unknown",
        area: "Urban Food Forest at Browns Mill (Atlanta)",
        limit: "The city's public-consumption invitation covers food; collection of craft or medicinal material is not addressed.",
        note: "Ask the AgLanta team or on-site stewards before collecting non-food material.",
        sourceLabel: "AgLanta (City of Atlanta)",
        sourceUrl: ACCESS_RULE_SOURCES.brownsMillFoodForest
      }
    }
  },
  {
    name: "Monticello (Thomas Jefferson Foundation)",
    bounds: { south: 37.9985, west: -78.464, north: 38.0165, east: -78.438 },
    rules: {
      default: {
        status: "prohibited",
        label: "Prohibited",
        area: "Monticello (Thomas Jefferson Foundation)",
        limit: "No harvesting or collection of any plant material on Monticello property, including the Saunders-Monticello Trail.",
        note: "Monticello is a private historic museum property; its gardens and grounds are protected landscapes.",
        sourceLabel: "Monticello guest policies",
        sourceUrl: ACCESS_RULE_SOURCES.monticello
      }
    }
  },
  {
    name: "UVA Pavilion Gardens",
    bounds: { south: 38.033, west: -78.506, north: 38.0378, east: -78.5018 },
    rules: {
      food: {
        status: "allowed",
        label: "Allowed",
        area: "University of Virginia pavilion gardens",
        limit: "Ripe fruits, nuts, and herbs in the pavilion gardens are open for respectful picking and consumption when the gardens are not in use for events.",
        note: "UVA's garden teams invite tasting of ripe produce; do not pick unripe fruit or clip branches.",
        sourceLabel: "UVA Sustainability",
        sourceUrl: ACCESS_RULE_SOURCES.uvaGardens
      },
      medicine: {
        status: "allowed",
        label: "Allowed",
        area: "University of Virginia pavilion gardens",
        limit: "Ripe herbs may be picked for personal consumption; do not clip branches or take more than a meal's worth.",
        note: "UVA's invitation covers edible consumption of ripe garden produce; treat medicinal gathering as the same light, respectful tasting.",
        sourceLabel: "UVA Sustainability",
        sourceUrl: ACCESS_RULE_SOURCES.uvaGardens
      },
      default: {
        status: "unknown",
        label: "Unknown",
        area: "University of Virginia pavilion gardens",
        limit: "UVA's open-picking invitation covers ripe edible produce; collection of craft material is not addressed.",
        note: "Ask UVA's gardens staff before collecting non-food material.",
        sourceLabel: "UVA Sustainability",
        sourceUrl: ACCESS_RULE_SOURCES.uvaGardens
      }
    }
  }
];
const ACCESS_STATUS_OPTIONS = [
  { id: "allowed", label: "Allowed", defaultChecked: true },
  { id: "permit-required", label: "Permit required", defaultChecked: true },
  { id: "private", label: "Private", defaultChecked: true },
  { id: "private-unsourced", label: "Private / unsourced", defaultChecked: true },
  { id: "unknown", label: "Unknown", defaultChecked: true },
  { id: "prohibited", label: "Prohibited", defaultChecked: false }
];
const ACCESS_MARKER_STYLES = {
  allowed: { label: "Allowed", color: "#111111", dashed: false },
  "permit-required": { label: "Permit required", color: "#111111", dashed: true },
  private: { label: "Private", color: "#ffffff", dashed: false, shadow: true },
  "private-unsourced": { label: "Private / unsourced", color: "#ffffff", dashed: true, shadow: true },
  unknown: { label: "Unknown", color: "#ffffff", dashed: true, shadow: true },
  prohibited: { label: "Prohibited", color: "#d51f1f", dashed: false }
};
const LEGEND_PERMISSION_OPTIONS = [
  { id: "allowed", label: "Allowed" },
  { id: "permit-required", label: "Permit required" },
  { id: "private", label: "Private" },
  { id: "unknown", label: "Unverified" }
];
const MARKER_ICON_SIZE = 26;
const MARKER_ICON_PIXEL_RATIO = 3;
const WELCOME_MODAL_STORAGE_KEY = "craftAlmanacWelcomeSeen";
const FAVORITE_SPECIES_STORAGE_KEY = "craftAlmanacFavoriteSpecies";
const SAVED_LOCATIONS_STORAGE_KEY = "craftAlmanacSavedLocations";
const HARVEST_ETHIC_LABELS = {
  "fallen material preferred": "Fallen material preferred",
  "light harvest": "Light harvest",
  "invasive removal": "Invasive removal",
  "cultivated preferred": "Cultivated preferred",
  "observe only": "Observe only"
};
const SAFETY_TAGS_BY_SPECIES = {
  elderberry: ["toxic parts", "lookalikes"],
  "black-cherry": ["toxic parts"],
  "sweet-cherry": ["toxic parts"],
  "sour-cherry": ["toxic parts"],
  plum: ["toxic parts"],
  sumac: ["lookalikes"],
  morel: ["lookalikes"],
  "wild-strawberry": ["lookalikes"],
  "ink-pokeweed": ["toxic parts", "do not ingest"],
  "ink-elderberry": ["toxic parts", "do not ingest"],
  "ink-privet": ["toxic parts", "do not ingest"],
  "ink-wild-grape": ["toxic parts", "do not ingest"],
  "medicine-jewelweed": ["external use only", "do not ingest"],
  "medicine-yarrow": ["lookalikes", "avoid pregnancy", "drug interactions"],
  "medicine-chickweed": ["lookalikes"],
  "medicine-witch-hazel": ["external use only"],
  "medicine-elderberry": ["toxic parts", "drug interactions"],
  "medicine-echinacea": ["drug interactions", "root harvest discouraged"],
  "medicine-mullein": ["external use only"],
  "medicine-bergamot": ["avoid pregnancy", "drug interactions"],
  "medicine-dandelion": ["drug interactions", "root harvest discouraged"],
  "medicine-violet": ["lookalikes"],
  "medicine-cleavers": ["drug interactions"]
};
const HARVEST_ETHIC_BY_SPECIES = {
  morel: "light harvest",
  blueberry: "light harvest",
  blackberry: "light harvest",
  raspberry: "light harvest",
  wineberry: "invasive removal",
  grape: "light harvest",
  elderberry: "light harvest",
  ribes: "light harvest",
  huckleberry: "light harvest",
  "black-cherry": "light harvest",
  "sweet-cherry": "light harvest",
  "sour-cherry": "light harvest",
  plum: "light harvest",
  "cornelian-cherry": "light harvest",
  serviceberry: "light harvest",
  "wild-strawberry": "light harvest",
  persimmon: "light harvest",
  pawpaw: "light harvest",
  sumac: "light harvest",
  "black-walnut": "fallen material preferred",
  hickory: "fallen material preferred",
  hazelnut: "light harvest",
  apple: "light harvest",
  pear: "light harvest",
  peach: "light harvest",
  fig: "light harvest",
  "ink-black-walnut": "fallen material preferred",
  "ink-oak": "fallen material preferred",
  "ink-hickory": "fallen material preferred",
  "ink-sumac": "light harvest",
  "ink-honeysuckle": "invasive removal",
  "ink-goldenrod": "light harvest",
  "ink-osage-orange": "fallen material preferred",
  "ink-pokeweed": "light harvest",
  "ink-autumn-olive": "invasive removal",
  "ink-wineberry": "invasive removal",
  "ink-elderberry": "light harvest",
  "ink-privet": "invasive removal",
  "ink-wild-grape": "light harvest",
  "medicine-jewelweed": "light harvest",
  "medicine-broadleaf-plantain": "light harvest",
  "medicine-yarrow": "light harvest",
  "medicine-chickweed": "light harvest",
  "medicine-witch-hazel": "observe only",
  "medicine-elderberry": "light harvest",
  "medicine-echinacea": "cultivated preferred",
  "medicine-mullein": "light harvest",
  "medicine-bergamot": "light harvest",
  "medicine-goldenrod": "light harvest",
  "medicine-dandelion": "light harvest",
  "medicine-garlic-mustard": "invasive removal",
  "medicine-violet": "light harvest",
  "medicine-cleavers": "light harvest"
};

const foodSpeciesCatalog = [
  {
    id: "morel",
    commonName: "Morel mushrooms",
    scientificName: "Morchella",
    category: "mushroom",
    months: [3, 4, 5],
    inatTaxonIds: [56830],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Spring flushes after warm rain. Confirm every mushroom carefully."
  },
  {
    id: "blueberry",
    commonName: "Blueberries",
    scientificName: "Vaccinium",
    category: "berry",
    months: [6, 7, 8],
    inatTaxonIds: [52740, 84270],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Often found in acidic soils, open woods, and sunny edges."
  },
  {
    id: "blackberry",
    commonName: "Blackberries",
    scientificName: "Rubus allegheniensis and related blackberries",
    category: "berry",
    groupLabel: "Blackberries and raspberries",
    months: [6, 7, 8],
    inatTaxonIds: [82110, 1276041],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Cane fruits are common around edges and sunny disturbed ground."
  },
  {
    id: "raspberry",
    commonName: "Raspberries",
    scientificName: "Rubus occidentalis and Rubus idaeus",
    category: "berry",
    groupLabel: "Blackberries and raspberries",
    months: [6, 7, 8],
    inatTaxonIds: [125489, 54436],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Black and red raspberries ripen around early to mid summer; confirm cane and fruit traits."
  },
  {
    id: "wineberry",
    commonName: "Wineberries",
    scientificName: "Rubus phoenicolasius",
    category: "berry",
    groupLabel: "Blackberries and raspberries",
    months: [6, 7, 8],
    inatTaxonIds: [84227],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "An invasive bramble with sticky red hairs; fruit is often easy to distinguish when ripe."
  },
  {
    id: "grape",
    commonName: "Wild grapes",
    scientificName: "Vitis",
    category: "fruit",
    months: [8, 9, 10],
    inatTaxonIds: [128931, 68053],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Look for ripe clusters on vines along edges; avoid confusing unrelated vines."
  },
  {
    id: "elderberry",
    commonName: "Elderberries",
    scientificName: "Sambucus",
    category: "berry",
    months: [7, 8, 9],
    inatTaxonIds: [52689],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Only ripe cooked berries are generally used; leaves and stems are unsafe."
  },
  {
    id: "ribes",
    commonName: "Gooseberries and currants",
    scientificName: "Ribes",
    category: "berry",
    months: [6, 7, 8],
    inatTaxonIds: [84803, 125487],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Small shrubs with tart fruit; some are prickly or streamside."
  },
  {
    id: "huckleberry",
    commonName: "Huckleberries",
    scientificName: "Gaylussacia",
    category: "berry",
    months: [7, 8, 9],
    inatTaxonIds: [48345],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Similar habitat to blueberries, often on dry acidic ridges."
  },
  {
    id: "black-cherry",
    commonName: "Black cherries",
    scientificName: "Prunus serotina",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [7, 8, 9],
    inatTaxonIds: [54834],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Fruit flesh can be used when ripe, but pits, leaves, and wilted foliage are hazardous."
  },
  {
    id: "sweet-cherry",
    commonName: "Sweet cherries",
    scientificName: "Prunus avium",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [6, 7],
    inatTaxonIds: [61964],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Often associated with plantings and old homestead sites; check property access closely."
  },
  {
    id: "sour-cherry",
    commonName: "Sour cherries",
    scientificName: "Prunus cerasus",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [6, 7],
    inatTaxonIds: [68763],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Tart cultivated or escaped cherries; check access before harvesting around neighborhoods."
  },
  {
    id: "plum",
    commonName: "Plums",
    scientificName: "Prunus americana and Prunus mexicana",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [6, 7, 8, 9],
    inatTaxonIds: [48629, 128755],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Wild and escaped plums vary in size and flavor; avoid leaves, pits, and wilted foliage."
  },
  {
    id: "cornelian-cherry",
    commonName: "Cornelian cherries",
    scientificName: "Cornus mas",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [7, 8, 9],
    inatTaxonIds: [55858],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "A dogwood fruit often found in plantings; not a true cherry, but commonly foraged where access allows."
  },
  {
    id: "serviceberry",
    commonName: "Serviceberries",
    scientificName: "Amelanchier",
    category: "berry",
    months: [5, 6, 7],
    inatTaxonIds: [49230],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Early summer fruit on small trees; also called juneberries."
  },
  {
    id: "wild-strawberry",
    commonName: "Wild strawberries",
    scientificName: "Fragaria virginiana and Fragaria vesca",
    category: "berry",
    months: [4, 5, 6],
    inatTaxonIds: [77155, 50298],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Low spring fruit; confirm true wild strawberries rather than ornamental lookalikes."
  },
  {
    id: "persimmon",
    commonName: "Persimmons",
    scientificName: "Diospyros virginiana",
    category: "fruit",
    months: [9, 10, 11, 12],
    inatTaxonIds: [83435],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Best after softening; unripe fruit is sharply astringent."
  },
  {
    id: "pawpaw",
    commonName: "Pawpaws",
    scientificName: "Asimina triloba",
    category: "fruit",
    months: [8, 9, 10],
    inatTaxonIds: [50897],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Soft custardlike fruit from understory trees, often near streams and rich slopes."
  },
  {
    id: "sumac",
    commonName: "Sumac berries",
    scientificName: "Rhus",
    category: "berry",
    months: [8, 9, 10, 11],
    inatTaxonIds: [54765],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Use only true Rhus sumacs with fuzzy red fruit clusters; avoid poison sumac and uncertain IDs."
  },
  {
    id: "black-walnut",
    commonName: "Black walnuts",
    scientificName: "Juglans nigra",
    category: "nut",
    months: [9, 10, 11],
    inatTaxonIds: [54504],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Green husks stain heavily; nuts need processing and curing."
  },
  {
    id: "hickory",
    commonName: "Hickory nuts",
    scientificName: "Carya",
    category: "nut",
    months: [9, 10, 11],
    inatTaxonIds: [54791, 54789, 84305],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Shells and flavor vary by species; shagbark, pignut, and mockernut are shown in detail on map records."
  },
  {
    id: "hazelnut",
    commonName: "Hazelnuts",
    scientificName: "Corylus americana",
    category: "nut",
    months: [8, 9, 10],
    inatTaxonIds: [54770],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Often grows as thickets; nuts ripen inside fringed husks."
  },
  {
    id: "apple",
    commonName: "Apples",
    scientificName: "Malus domestica",
    category: "fruit",
    months: [8, 9, 10, 11],
    inatTaxonIds: [469472],
    parkLimit: "1 bushel per person per day in Shenandoah National Park",
    notes: "Old homestead trees and urban plantings are likely sources."
  },
  {
    id: "pear",
    commonName: "Pears",
    scientificName: "Pyrus communis",
    category: "fruit",
    months: [8, 9, 10],
    inatTaxonIds: [63951],
    parkLimit: "1 bushel per person per day in Shenandoah National Park",
    notes: "Check property access before harvesting in neighborhoods."
  },
  {
    id: "peach",
    commonName: "Peaches",
    scientificName: "Prunus persica",
    category: "fruit",
    months: [6, 7, 8],
    inatTaxonIds: [78755],
    parkLimit: "1 bushel per person per day in Shenandoah National Park",
    notes: "Included in the park list, though less common as a wild forage."
  },
  {
    id: "fig",
    commonName: "Figs",
    scientificName: "Ficus carica",
    category: "fruit",
    months: [8, 9, 10],
    inatTaxonIds: [60218],
    parkLimit: "Not listed for Shenandoah National Park",
    shenandoahAllowed: false,
    notes: "Usually a cultivated or escaped planting; confirm property access before harvesting."
  }
];

const inkSpeciesCatalog = [
  {
    id: "ink-black-walnut",
    commonName: "Black walnut",
    scientificName: "Juglans nigra",
    category: "black",
    months: [9, 10, 11],
    inatTaxonIds: [54504],
    shenandoahAllowed: false,
    notes: "Green hulls make dark brown to black ink; wear gloves and avoid damaging trees."
  },
  {
    id: "ink-oak",
    commonName: "Oak galls and acorn caps",
    scientificName: "Quercus",
    category: "black",
    months: [9, 10, 11, 12],
    inatTaxonIds: [47851],
    shenandoahAllowed: false,
    notes: "Tannin-rich galls and caps can make gray, brown, and iron-black inks."
  },
  {
    id: "ink-hickory",
    commonName: "Hickory hulls",
    scientificName: "Carya",
    category: "brown",
    months: [9, 10, 11],
    inatTaxonIds: [54788],
    shenandoahAllowed: false,
    notes: "Outer hulls produce warm brown ink and dye; gather fallen hulls where allowed."
  },
  {
    id: "ink-sumac",
    commonName: "Sumac",
    scientificName: "Rhus",
    category: "brown",
    months: [8, 9, 10, 11],
    inatTaxonIds: [54765],
    shenandoahAllowed: false,
    notes: "True Rhus sumacs are tannin-rich and useful for brown or modifier inks."
  },
  {
    id: "ink-honeysuckle",
    commonName: "Honeysuckle",
    scientificName: "Lonicera",
    category: "yellow",
    months: [5, 6, 7],
    inatTaxonIds: [51874],
    shenandoahAllowed: false,
    notes: "Flowers and leaves can shift toward pale yellow or greenish ink."
  },
  {
    id: "ink-goldenrod",
    commonName: "Goldenrod",
    scientificName: "Solidago",
    category: "yellow",
    months: [8, 9, 10],
    inatTaxonIds: [48678],
    shenandoahAllowed: false,
    notes: "Flowering tops produce yellow ink and dye when collected in bloom."
  },
  {
    id: "ink-osage-orange",
    commonName: "Osage orange",
    scientificName: "Maclura pomifera",
    category: "yellow",
    months: [9, 10, 11],
    inatTaxonIds: [58205],
    shenandoahAllowed: false,
    notes: "Wood and fruit can produce strong yellow tones; avoid cutting living wood without permission."
  },
  {
    id: "ink-pokeweed",
    commonName: "Pokeweed",
    scientificName: "Phytolacca americana",
    category: "red",
    months: [8, 9, 10],
    inatTaxonIds: [48599],
    shenandoahAllowed: false,
    notes: "Berries make vivid magenta ink but the plant is toxic; handle carefully and label clearly."
  },
  {
    id: "ink-autumn-olive",
    commonName: "Autumn olive",
    scientificName: "Elaeagnus umbellata",
    category: "red",
    months: [9, 10, 11],
    inatTaxonIds: [64697],
    shenandoahAllowed: false,
    notes: "Ripe fruit can make pink-red ink; this invasive shrub is common on edges."
  },
  {
    id: "ink-wineberry",
    commonName: "Wineberry",
    scientificName: "Rubus phoenicolasius",
    category: "red",
    months: [6, 7, 8],
    inatTaxonIds: [84227],
    shenandoahAllowed: false,
    notes: "Fruit gives pink-red stains and inks; plants are bristly and often invasive."
  },
  {
    id: "ink-elderberry",
    commonName: "Elderberry",
    scientificName: "Sambucus",
    category: "purple",
    months: [7, 8, 9],
    inatTaxonIds: [52689],
    shenandoahAllowed: false,
    notes: "Ripe berries can make purple ink; leaves, stems, and unripe parts are unsafe."
  },
  {
    id: "ink-privet",
    commonName: "Privet",
    scientificName: "Ligustrum",
    category: "blue",
    months: [9, 10, 11, 12],
    inatTaxonIds: [69819],
    shenandoahAllowed: false,
    notes: "Berries can shift blue, purple, or green; many privets are invasive and fruits are not edible."
  },
  {
    id: "ink-wild-grape",
    commonName: "Wild grapes and Boston ivy",
    scientificName: "Vitis and Parthenocissus tricuspidata",
    category: "purple",
    months: [8, 9, 10],
    inatTaxonIds: [60773, 166162],
    shenandoahAllowed: false,
    notes: "Dark fruits can make blue-purple inks; this group includes inedible Boston ivy for pigment mapping."
  }
];

const medicineSpeciesCatalog = [
  {
    id: "medicine-jewelweed",
    commonName: "Jewelweed",
    scientificName: "Impatiens capensis",
    category: "topical",
    months: [6, 7, 8, 9],
    inatTaxonIds: [47888],
    shenandoahAllowed: false,
    usedParts: "Fresh aerial parts, especially leaves and stems.",
    notes: "Traditionally used externally; harvest small amounts from abundant patches and avoid uprooting wetland plants."
  },
  {
    id: "medicine-broadleaf-plantain",
    commonName: "Broadleaf plantain",
    scientificName: "Plantago major",
    category: "topical",
    months: [4, 5, 6, 7, 8, 9, 10],
    inatTaxonIds: [58961],
    shenandoahAllowed: false,
    usedParts: "Leaves.",
    notes: "A common lawn and trail-edge plant; avoid contaminated soils, roadsides, and sprayed areas."
  },
  {
    id: "medicine-yarrow",
    commonName: "Yarrow",
    scientificName: "Achillea millefolium",
    category: "topical",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [52821],
    shenandoahAllowed: false,
    usedParts: "Flowering tops and leaves.",
    notes: "Confirm the aromatic, finely divided leaves; avoid confusing with toxic lookalikes in the carrot family."
  },
  {
    id: "medicine-chickweed",
    commonName: "Chickweed",
    scientificName: "Stellaria media",
    category: "topical",
    months: [2, 3, 4, 5, 10, 11, 12],
    inatTaxonIds: [53298],
    shenandoahAllowed: false,
    usedParts: "Tender aerial parts.",
    notes: "Cool-season groundcover; harvest lightly from clean, abundant patches."
  },
  {
    id: "medicine-witch-hazel",
    commonName: "Witch hazel",
    scientificName: "Hamamelis virginiana",
    category: "topical",
    months: [9, 10, 11, 12],
    inatTaxonIds: [51970],
    shenandoahAllowed: false,
    usedParts: "Leaves, twigs, and bark.",
    notes: "Woody-part harvest can harm shrubs; favor observation unless pruning material is already available with permission."
  },
  {
    id: "medicine-elderberry",
    commonName: "Elderberry",
    scientificName: "Sambucus",
    category: "immune",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [52689],
    shenandoahAllowed: false,
    usedParts: "Flowers and fully ripe cooked berries.",
    notes: "Leaves, stems, and unripe fruit are unsafe; confirm species and preparation guidance before use."
  },
  {
    id: "medicine-echinacea",
    commonName: "Echinacea",
    scientificName: "Echinacea purpurea",
    category: "immune",
    months: [6, 7, 8, 9],
    inatTaxonIds: [48627],
    shenandoahAllowed: false,
    usedParts: "Roots, leaves, and flowering tops.",
    notes: "Often cultivated or planted; avoid taking roots from wild or uncertain-access populations."
  },
  {
    id: "medicine-mullein",
    commonName: "Mullein",
    scientificName: "Verbascum thapsus",
    category: "immune",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [59029],
    shenandoahAllowed: false,
    usedParts: "Leaves and flowers.",
    notes: "Second-year flower stalks are conspicuous; collect leaves and flowers sparingly where permitted."
  },
  {
    id: "medicine-bergamot",
    commonName: "Wild bergamot / bee balm",
    scientificName: "Monarda fistulosa",
    category: "immune",
    months: [6, 7, 8, 9],
    inatTaxonIds: [85320],
    shenandoahAllowed: false,
    usedParts: "Leaves and flowering tops.",
    notes: "Aromatic mint-family plant; leave enough flowers for pollinators and seed set."
  },
  {
    id: "medicine-goldenrod",
    commonName: "Goldenrod",
    scientificName: "Solidago",
    category: "immune",
    months: [8, 9, 10],
    inatTaxonIds: [48678],
    shenandoahAllowed: false,
    usedParts: "Flowering tops and leaves.",
    notes: "Abundant late-season flowers; harvest selectively and avoid rare or uncertain Solidago species."
  },
  {
    id: "medicine-dandelion",
    commonName: "Dandelion",
    scientificName: "Taraxacum officinale",
    category: "digestive",
    months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    inatTaxonIds: [47602],
    shenandoahAllowed: false,
    usedParts: "Leaves, flowers, and roots.",
    notes: "Common in disturbed ground; avoid treated lawns and compacted roadsides."
  },
  {
    id: "medicine-garlic-mustard",
    commonName: "Garlic mustard",
    scientificName: "Alliaria petiolata",
    category: "digestive",
    months: [3, 4, 5, 6],
    inatTaxonIds: [56061],
    shenandoahAllowed: false,
    usedParts: "Leaves, roots, flowers, and seeds.",
    notes: "Invasive biennial; bag and remove pulled plants where local rules allow, because seeds can spread."
  },
  {
    id: "medicine-violet",
    commonName: "Violet",
    scientificName: "Viola sororia",
    category: "lymphatic",
    months: [3, 4, 5, 6],
    inatTaxonIds: [82816],
    shenandoahAllowed: false,
    usedParts: "Leaves and flowers.",
    notes: "Harvest only from abundant clean patches; avoid yellow violets and uncertain IDs."
  },
  {
    id: "medicine-cleavers",
    commonName: "Cleavers",
    scientificName: "Galium aparine",
    category: "lymphatic",
    months: [3, 4, 5, 6],
    inatTaxonIds: [53059],
    shenandoahAllowed: false,
    usedParts: "Tender aerial parts before seed.",
    notes: "Clinging spring annual; collect before the plant becomes tough and seedy, where permitted."
  }
];

const MAP_MODE_CONFIG = {
  food: {
    id: "food",
    speciesHeading: "Food Types & Species",
    lede: `Track edible plants and mushrooms across ${REGION_STATES} by place, date, and permissions. The species list focuses on abundant, resilient edibles suited to responsible, low-impact harvesting.`,
    categories: [
      { id: "berry", label: "Berries" },
      { id: "fruit", label: "Fruit" },
      { id: "mushroom", label: "Mushrooms" },
      { id: "nut", label: "Nuts" }
    ],
    categoryColors: FOOD_CATEGORY_COLORS,
    catalog: foodSpeciesCatalog,
    sourceNames: ["iNaturalist", "Falling Fruit", "NPS orchards"],
    dataNotes: `Live observations from iNaturalist across ${REGION_NAME}, chunked community records from Falling Fruit, public access boundaries from USGS PAD-US, and historic orchards from the National Park Service.`,
    rulesLabel: "Harvesting rules and limits",
    loadFallingFruit: true,
    loadNpsOrchards: true
  },
  ink: {
    id: "ink",
    speciesHeading: "Ink Colors & Materials",
    lede: `Discover plants, trees, and fruits that can produce natural inks across ${REGION_STATES} by season and habitat. The list favors abundant native species that can be harvested lightly, as well as invasive plants whose careful removal can support surrounding ecosystems.`,
    categories: [
      { id: "black", label: "Black / gray" },
      { id: "blue", label: "Blue / green" },
      { id: "brown", label: "Brown" },
      { id: "purple", label: "Purple" },
      { id: "red", label: "Red / pink" },
      { id: "yellow", label: "Yellow / gold" }
    ],
    categoryColors: INK_CATEGORY_COLORS,
    catalog: inkSpeciesCatalog,
    sourceNames: ["iNaturalist", "Falling Fruit"],
    dataNotes: `Live observations from iNaturalist across ${REGION_NAME}, relevant chunked community records from Falling Fruit, public access boundaries from USGS PAD-US, and local collection rules where sourced. Ink materials still require permission to collect.`,
    rulesLabel: "Collection rules and limits",
    loadFallingFruit: true,
    loadNpsOrchards: false
  },
  medicine: {
    id: "medicine",
    speciesHeading: "Therapeutic Uses & Species",
    lede: `Explore therapeutic plants across ${REGION_STATES} by season and habitat.`,
    safetyNote: "This map is provided for educational purposes. Do not ingest or apply wild plants without guidance from a qualified practitioner or trained herbalist.",
    categories: [
      { id: "digestive", label: "Digestive" },
      { id: "immune", label: "Immune" },
      { id: "lymphatic", label: "Lymphatic" },
      { id: "topical", label: "Topical" }
    ],
    categoryColors: MEDICINE_CATEGORY_COLORS,
    catalog: medicineSpeciesCatalog,
    sourceNames: ["iNaturalist"],
    dataNotes: `Live observations from iNaturalist, public access boundaries from USGS PAD-US, and local collection rules where sourced across ${REGION_NAME}. Plant-use notes are educational and are not instructions for treatment.`,
    rulesLabel: "Collection rules and limits",
    loadFallingFruit: false,
    loadNpsOrchards: false
  }
};

let speciesCatalog = foodSpeciesCatalog;
let speciesCatalogByName = sortCatalogByName(speciesCatalog);
let speciesCatalogById = new Map(speciesCatalog.map((species) => [species.id, species]));

const INK_FALLING_FRUIT_SPECIES_ALIASES = {
  "black-walnut": "ink-black-walnut",
  elderberry: "ink-elderberry",
  grape: "ink-wild-grape",
  hickory: "ink-hickory",
  sumac: "ink-sumac",
  wineberry: "ink-wineberry"
};

const state = {
  activeMap: "food",
  selectedDay: getDayOfYear(new Date()),
  allSeasons: false,
  records: [],
  inatRecords: [],
  inatRecordCache: new Map(),
  inatAggregateCache: new Map(),
  inatAggregateItems: [],
  inatAggregateTaxonKey: "",
  inatAggregateReady: false,
  aggregateGateStart: null,
  aggregateGateTimer: null,
  aggregateBridgeActive: false,
  aggregateBridgeId: 0,
  aggregateBridgeTimer: null,
  loadTimer: null,
  inatAggregateTimer: null,
  publicLoadTimer: null,
  aggregateTimer: null,
  activeRequest: 0,
  activeINaturalistAggregateRequest: 0,
  activePublicRequest: 0,
  fallingFruitManifest: null,
  statusRaster: null,
  statusRasterPromise: null,
  fallingFruitChunkCache: new Map(),
  fallingFruitChunkLoads: new Map(),
  fallingFruitRecords: null,
  npsOrchardData: null,
  npsOrchardRecords: null,
  publicLandFeatures: [],
  stateBoundaries: null,
  accessRuleCache: new Map(),
  pointDataReady: false,
  loadedPointBounds: null,
  wasBelowPointZoom: true,
  lastShowPoints: false,
  mapReady: false,
  publicLayerLoadedKey: "",
  publicLayerVisible: true,
  activePopup: null,
  hoverPopup: null,
  locationSuggestionTimer: null,
  locationSuggestions: [],
  favoriteSpecies: new Set(readFavoriteSpecies()),
  savedLocations: new Set(readSavedLocations()),
  savedLocationsOnly: false
};

mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  style: MAPBOX_STYLE,
  center: [-98.6, 39.8],
  zoom: 3.25,
  minZoom: 2.4,
  maxZoom: 19,
  maxBounds: REGION_MAX_BOUNDS,
  renderWorldCopies: false,
  fadeDuration: 0,
  refreshExpiredTiles: false,
  pitchWithRotate: false,
  dragRotate: false,
  attributionControl: true
});

map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showUserHeading: true
}), "bottom-right");
map.scrollZoom.setWheelZoomRate?.(1 / 280);
map.scrollZoom.setZoomRate?.(1 / 60);
window.addEventListener("resize", () => {
  syncPanelGripLabel();
  map.resize();
});

const dataStatus = document.querySelector("#dataStatus");
const speciesCount = document.querySelector("#speciesCount");
const daySlider = document.querySelector("#daySlider");
const dateInput = document.querySelector("#dateInput");
const seasonDateLabel = document.querySelector("#seasonDateLabel");
const seasonName = document.querySelector("#seasonName");
const seasonHistogram = document.querySelector("#seasonHistogram");
const mapLede = document.querySelector("#mapLede");
const mapSafetyNote = document.querySelector("#mapSafetyNote");
const speciesSectionTitle = document.querySelector("#speciesSectionTitle");
const categoryList = document.querySelector("#categoryList");
const speciesList = document.querySelector("#speciesList");
const accessStatusList = document.querySelector("#accessStatusList");
const mapLegend = document.querySelector("#mapLegend");
const locationSearchForm = document.querySelector("#locationSearchForm");
const locationSearchInput = document.querySelector("#locationSearchInput");
const locationSearchSuggestions = document.querySelector("#locationSearchSuggestions");
const locationSearchStatus = document.querySelector("#locationSearchStatus");
const welcomeModal = document.querySelector("#welcomeModal");
const welcomeModalButton = document.querySelector("#welcomeModalButton");
const mapModeButtons = [...document.querySelectorAll("[data-map-mode]")];
let categoryInputs = [];
let accessStatusInputs = [];
const todayButton = document.querySelector("#todayButton");
const allSeasonsButton = document.querySelector("#allSeasonsButton");
const appShell = document.querySelector(".app-shell");
const controlPanel = document.querySelector("#controlPanel");
const panelGrip = document.querySelector("#panelGrip");
const sectionToggles = [...document.querySelectorAll(".section-toggle")];
const MOBILE_PANEL_MIN_HEIGHT = 92;
const MOBILE_PANEL_DEFAULT_HEIGHT = 420;
const MOBILE_PANEL_MARGIN = 20;
let panelDragState = null;

function getDayOfYear(date) {
  // UTC math avoids daylight-saving off-by-one errors in local-time subtraction.
  const dayMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const startMs = Date.UTC(date.getFullYear(), 0, 0);
  return Math.floor((dayMs - startMs) / 86400000);
}

function getDateForDay(day) {
  return new Date(ACTIVE_YEAR, 0, day);
}

function getDaysInYear(year) {
  return getDayOfYear(new Date(year, 11, 31));
}

function getDateInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getSelectedDate() {
  return getDateForDay(state.selectedDay);
}

function getSelectedMonth() {
  return getSelectedDate().getMonth() + 1;
}

function getSeason(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) return "Spring";
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 22)) return "Summer";
  if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day < 21)) return "Fall";
  return "Winter";
}

function getMonthRangeText(months) {
  const sortedMonths = [...months].sort((a, b) => a - b);
  if (!sortedMonths.length) return "Unknown";
  return `${MONTHS[sortedMonths[0] - 1]}-${MONTHS[sortedMonths[sortedMonths.length - 1] - 1]}`;
}

function sourceLabel(source) {
  return {
    inaturalist: "iNaturalist",
    fallingfruit: "Falling Fruit",
    "nps-orchard": "National Park Service"
  }[source] || source;
}

function formatFallingFruitDate(value) {
  if (!value) return "";
  // Date-only strings parse as UTC midnight; force local time so the date
  // doesn't shift back a day in timezones west of UTC.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "";
  return getDateInputValue(date);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readFavoriteSpecies() {
  try {
    const storedFavorites = JSON.parse(window.localStorage?.getItem(FAVORITE_SPECIES_STORAGE_KEY) || "[]");
    return Array.isArray(storedFavorites) ? storedFavorites.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveFavoriteSpecies() {
  window.localStorage?.setItem(FAVORITE_SPECIES_STORAGE_KEY, JSON.stringify([...state.favoriteSpecies]));
}

function isFavoriteSpecies(speciesId) {
  return state.favoriteSpecies.has(speciesId);
}

function readSavedLocations() {
  try {
    const storedLocations = JSON.parse(window.localStorage?.getItem(SAVED_LOCATIONS_STORAGE_KEY) || "[]");
    return Array.isArray(storedLocations) ? storedLocations.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveSavedLocations() {
  window.localStorage?.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify([...state.savedLocations]));
}

function isSavedLocation(recordId) {
  return state.savedLocations.has(recordId);
}

function sortCatalogByName(catalog) {
  return [...catalog].sort((a, b) => (
    a.commonName.localeCompare(b.commonName, undefined, { sensitivity: "base" })
  ));
}

function getActiveMapConfig() {
  return MAP_MODE_CONFIG[state.activeMap] || MAP_MODE_CONFIG.food;
}

function syncActiveCatalog() {
  const config = getActiveMapConfig();
  speciesCatalog = config.catalog;
  speciesCatalogByName = sortCatalogByName(speciesCatalog);
  speciesCatalogById = new Map(speciesCatalog.map((species) => [species.id, species]));
  CATEGORIES = config.categories.map((category) => category.id);
  CATEGORY_COLORS = config.categoryColors;
}

function renderModeChrome() {
  const config = getActiveMapConfig();
  mapLede.textContent = config.lede;
  mapSafetyNote.textContent = config.safetyNote || "";
  mapSafetyNote.hidden = !config.safetyNote;
  speciesSectionTitle.textContent = config.speciesHeading;
  document.querySelector(".attribution-block .section-body p").textContent = config.dataNotes;
  mapModeButtons.forEach((button) => {
    const isActive = button.dataset.mapMode === state.activeMap;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderMapLegend();
}

function renderFilterControls() {
  const config = getActiveMapConfig();
  categoryList.innerHTML = config.categories.map((category) => `
    <label class="category-option ${category.id}">
      <input type="checkbox" name="category" value="${category.id}" checked> ${category.label}
    </label>
  `).join("");

  speciesList.innerHTML = getSpeciesListHTML();

  categoryInputs = [...document.querySelectorAll("input[name='category']")];
  document.querySelectorAll("input[name='species']").forEach((input) => {
    input.addEventListener("change", render);
  });
  document.querySelectorAll("input[name='species-group']").forEach((input) => {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => {
      setSpeciesByGroup(input.value, input.checked);
      render();
    });
  });
  document.querySelectorAll(".species-group-arrow-button").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleSpeciesGroup(toggle);
    });
    toggle.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      toggleSpeciesGroup(toggle);
    });
  });
  categoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      setSpeciesByCategory(input.value, input.checked);
      syncCategoryCheckboxes();
      render();
    });
  });
  document.querySelectorAll("[data-favorite-species]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavoriteSpecies(button.dataset.favoriteSpecies);
    });
  });
}

function initAccessControls() {
  accessStatusList.innerHTML = ACCESS_STATUS_OPTIONS.map((status) => `
    <label class="permission-option ${status.id}">
      <input type="checkbox" name="access-status" value="${status.id}" ${status.defaultChecked ? "checked" : ""}>
      ${status.label}
    </label>
  `).join("");
  accessStatusInputs = [...document.querySelectorAll("input[name='access-status']")];
  accessStatusInputs.forEach((input) => {
    input.addEventListener("change", () => {
      renderMapLegend();
      render();
    });
  });

  document.querySelector("#selectAllAccessButton").addEventListener("click", () => {
    accessStatusInputs.forEach((input) => {
      input.checked = true;
    });
    renderMapLegend();
    render();
  });

  document.querySelector("#clearAccessButton").addEventListener("click", () => {
    accessStatusInputs.forEach((input) => {
      input.checked = false;
    });
    renderMapLegend();
    render();
  });
}

function getDefaultAccessStatuses() {
  return ACCESS_STATUS_OPTIONS.filter((option) => option.defaultChecked).map((option) => option.id);
}

function getSelectedAccessStatuses() {
  return new Set(getCheckedValues("access-status"));
}

function isAccessFilterActive(selectedStatuses = getSelectedAccessStatuses()) {
  const defaults = getDefaultAccessStatuses();
  return selectedStatuses.size !== defaults.length || defaults.some((id) => !selectedStatuses.has(id));
}

function initWelcomeModal() {
  if (!welcomeModal || !welcomeModalButton) return;
  const hasSeenModal = window.localStorage?.getItem(WELCOME_MODAL_STORAGE_KEY) === "true";
  if (hasSeenModal) return;

  const focusAfterClose = panelGrip || document.querySelector(".mapboxgl-ctrl-zoom-in") || document.body;
  welcomeModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => welcomeModalButton.focus(), 0);

  welcomeModalButton.addEventListener("click", () => {
    window.localStorage?.setItem(WELCOME_MODAL_STORAGE_KEY, "true");
    welcomeModal.hidden = true;
    document.body.classList.remove("modal-open");
    focusAfterClose?.focus?.();
  }, { once: true });

  welcomeModal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    welcomeModalButton.focus();
  });
}

function getCategoryLabel(categoryId) {
  return getActiveMapConfig().categories.find((category) => category.id === categoryId)?.label || categoryId;
}

function renderMapLegend() {
  if (!mapLegend) return;
  const config = getActiveMapConfig();
  const showProhibited = getCheckedValues("access-status").includes("prohibited");
  const permissionOptions = showProhibited
    ? [...LEGEND_PERMISSION_OPTIONS, { id: "prohibited", label: "Prohibited" }]
    : LEGEND_PERMISSION_OPTIONS;
  const permissionRows = permissionOptions.map((status) => `
    <span class="legend-row">
      <span class="legend-dot outline-${status.id}" aria-hidden="true"></span>
      <span>${status.label}</span>
    </span>
  `).join("");
  const categoryRows = config.categories.map((category) => `
    <span class="legend-row">
      <span class="legend-swatch" style="background: ${escapeHTML(config.categoryColors[category.id] || "#777")}" aria-hidden="true"></span>
      <span>${escapeHTML(category.label)}</span>
    </span>
  `).join("");

  mapLegend.innerHTML = `
    <div class="legend-section">
      <strong>Harvesting Permissions</strong>
      <div class="legend-grid">${permissionRows}</div>
    </div>
    <div class="legend-section">
      <strong>${escapeHTML(config.speciesHeading.replace(" & Species", ""))}</strong>
      <div class="legend-grid">${categoryRows}</div>
    </div>
  `;
}

function getSpeciesSafetyTags(species) {
  return species.safetyTags || SAFETY_TAGS_BY_SPECIES[species.id] || [];
}

function getSpeciesHarvestEthic(species) {
  return species.harvestEthic || HARVEST_ETHIC_BY_SPECIES[species.id] || "light harvest";
}

function getSpeciesHarvestEthicLabel(species) {
  return HARVEST_ETHIC_LABELS[getSpeciesHarvestEthic(species)] || getSpeciesHarvestEthic(species);
}

function getSpeciesListHTML() {
  const grouped = new Map();
  const singleItems = [];
  speciesCatalogByName.forEach((species) => {
    if (!species.groupLabel) {
      singleItems.push(species);
      return;
    }
    if (!grouped.has(species.groupLabel)) grouped.set(species.groupLabel, []);
    grouped.get(species.groupLabel).push(species);
  });

  const rows = [
    ...singleItems.map((species) => ({
      type: "single",
      label: species.commonName,
      html: getSpeciesCheckboxHTML(species)
    })),
    ...[...grouped.entries()].map(([label, speciesItems]) => ({
      type: "group",
      label,
      html: getSpeciesGroupHTML(label, speciesItems)
    }))
  ];

  return rows
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
    .map((row) => row.html)
    .join("");
}

function getSpeciesCheckboxHTML(species) {
  const favorite = isFavoriteSpecies(species.id);
  return `
    <label data-category="${species.category}" class="${species.groupLabel ? "is-child-species" : ""}">
      <span class="species-name">
        <input type="checkbox" name="species" value="${species.id}" checked>
        ${species.commonName}
      </span>
      <span class="species-meta">
        <button
          class="favorite-button ${favorite ? "is-favorite" : ""}"
          type="button"
          data-favorite-species="${species.id}"
          aria-pressed="${String(favorite)}"
          aria-label="${favorite ? "Remove" : "Add"} ${escapeHTML(species.commonName)} ${favorite ? "from" : "to"} favorites"
          title="${favorite ? "Remove from favorites" : "Add to favorites"}"
        >&#9733;</button>
        <span class="type-pill ${species.category}">${getCategoryLabel(species.category)}</span>
      </span>
    </label>
  `;
}

function toggleFavoriteSpecies(speciesId) {
  if (!speciesId) return;
  if (state.favoriteSpecies.has(speciesId)) {
    state.favoriteSpecies.delete(speciesId);
  } else {
    state.favoriteSpecies.add(speciesId);
  }
  saveFavoriteSpecies();
  renderFavoriteSpeciesState();
}

function getSpeciesGroupHTML(label, speciesItems) {
  const sortedItems = sortCatalogByName(speciesItems);
  const category = sortedItems[0]?.category || "";
  return `
    <div class="species-group is-open">
      <div class="species-group-summary">
        <span class="species-group-title-wrap">
          <label class="species-group-title">
            <input type="checkbox" name="species-group" value="${escapeHTML(label)}" checked>
            ${escapeHTML(label)}
          </label>
          <span class="species-group-arrow-button" role="button" tabindex="0" aria-label="Collapse ${escapeHTML(label)}">
            <span class="species-group-arrow" aria-hidden="true"></span>
          </span>
        </span>
        <span class="species-group-actions">
          <span class="type-pill ${category}">${getCategoryLabel(category)}</span>
        </span>
      </div>
      <div class="species-group-list">
        ${sortedItems.map(getSpeciesCheckboxHTML).join("")}
      </div>
    </div>
  `;
}

function toggleSpeciesGroup(toggle) {
  const group = toggle.closest(".species-group");
  if (!group) return;
  const isOpen = group.classList.toggle("is-open");
  group.querySelector(".species-group-list").hidden = !isOpen;
  toggle.setAttribute("aria-label", `${isOpen ? "Collapse" : "Expand"} ${getSpeciesGroupLabel(group)}`);
}

function getSpeciesGroupLabel(group) {
  return group.querySelector("input[name='species-group']")?.value || "group";
}

function setMapMode(mode) {
  if (!MAP_MODE_CONFIG[mode] || mode === state.activeMap) return;
    state.activeMap = mode;
    state.records = [];
    state.inatRecords = [];
    state.inatRecordCache.clear();
    state.accessRuleCache.clear();
    state.savedLocationsOnly = false;
    state.pointDataReady = false;
    state.loadedPointBounds = null;
    state.activeRequest += 1;
  cancelAggregateBridge();
  state.activePopup?.remove();
  state.hoverPopup?.remove();
  syncActiveCatalog();
  renderModeChrome();
  renderFilterControls();
  updateLayerHandoff();
  render();
}

function initLocationSearch() {
  if (!locationSearchForm || !locationSearchInput) return;
  locationSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = locationSearchInput.value.trim();
    if (!query) return;
    await searchLocation(query);
  });
  locationSearchInput.addEventListener("input", () => {
    window.clearTimeout(state.locationSuggestionTimer);
    state.locationSuggestionTimer = window.setTimeout(() => {
      updateLocationSuggestions(locationSearchInput.value.trim());
    }, 220);
  });
  locationSearchInput.addEventListener("blur", () => {
    window.setTimeout(() => hideLocationSuggestions(), 160);
  });
  locationSearchInput.addEventListener("focus", () => {
    renderLocationSuggestions();
  });
}

async function searchLocation(query) {
  const matchingSuggestion = state.locationSuggestions.find((feature) => (
    feature.place_name?.toLowerCase() === query.toLowerCase()
    || feature.text?.toLowerCase() === query.toLowerCase()
  ));
  if (matchingSuggestion) {
    chooseLocationSuggestion(matchingSuggestion);
    return;
  }

  const suggestions = await fetchLocationSuggestions(query, 1);
  if (suggestions[0]) {
    chooseLocationSuggestion(suggestions[0]);
    return;
  }
  setLocationSearchStatus("No matching place found.");
}

async function fetchLocationSuggestions(query, limit = 5) {
  if (!MAPBOX_TOKEN) {
    setLocationSearchStatus("Location search needs a Mapbox token.");
    return [];
  }

  const [[west, south], [east, north]] = REGION_MAX_BOUNDS;
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    country: "us",
    bbox: [west, south, east, north].join(","),
    limit: String(limit),
    autocomplete: "true",
    types: "country,region,postcode,district,place,locality,neighborhood,address,poi"
  });

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Mapbox geocoder returned ${response.status}`);
    const data = await response.json();
    return (data.features || []).filter((feature) => feature.center);
  } catch {
    setLocationSearchStatus("Search unavailable. Try again in a moment.");
    return [];
  }
}

async function updateLocationSuggestions(query) {
  if (query.length < 2) {
    state.locationSuggestions = [];
    hideLocationSuggestions();
    setLocationSearchStatus("");
    return;
  }
  const suggestions = await fetchLocationSuggestions(query, 5);
  if (locationSearchInput.value.trim() !== query) return;
  state.locationSuggestions = suggestions;
  setLocationSearchStatus(suggestions.length ? "" : "No matching places found.");
  renderLocationSuggestions();
}

function renderLocationSuggestions() {
  if (!locationSearchSuggestions) return;
  if (!state.locationSuggestions.length || document.activeElement !== locationSearchInput) {
    hideLocationSuggestions();
    return;
  }
  locationSearchSuggestions.innerHTML = state.locationSuggestions.map((feature, index) => `
    <button class="location-suggestion" type="button" role="option" data-suggestion-index="${index}">
      <span>${escapeHTML(feature.text || "Location")}</span>
      <small>${escapeHTML(getLocationSuggestionContext(feature))}</small>
    </button>
  `).join("");
  locationSearchSuggestions.hidden = false;
  locationSearchSuggestions.querySelectorAll("[data-suggestion-index]").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      chooseLocationSuggestion(state.locationSuggestions[Number(button.dataset.suggestionIndex)]);
    });
  });
}

function getLocationSuggestionContext(feature) {
  return feature.place_name
    ? feature.place_name.replace(feature.text, "").replace(/^,\s*/, "")
    : "";
}

function chooseLocationSuggestion(feature) {
  if (!feature?.center) return;
  locationSearchInput.value = feature.place_name || feature.text || "";
  hideLocationSuggestions();
  setLocationSearchStatus("");
  if (Array.isArray(feature.bbox) && feature.bbox.length === 4) {
    map.fitBounds([
      [feature.bbox[0], feature.bbox[1]],
      [feature.bbox[2], feature.bbox[3]]
    ], {
      padding: 72,
      maxZoom: 12,
      duration: 900
    });
    return;
  }
  map.flyTo({
    center: feature.center,
    zoom: Math.max(map.getZoom(), 11),
    duration: 900,
    essential: true
  });
}

function hideLocationSuggestions() {
  if (!locationSearchSuggestions) return;
  locationSearchSuggestions.hidden = true;
  locationSearchSuggestions.innerHTML = "";
}

function setLocationSearchStatus(message) {
  if (!locationSearchStatus) return;
  locationSearchStatus.textContent = message;
  locationSearchStatus.hidden = !message;
}

function initControls() {
  syncActiveCatalog();
  renderModeChrome();
  daySlider.max = String(getDaysInYear(ACTIVE_YEAR));
  daySlider.value = String(state.selectedDay);
  dateInput.value = getDateInputValue(getSelectedDate());
  dateInput.min = `${ACTIVE_YEAR}-01-01`;
  dateInput.max = `${ACTIVE_YEAR}-12-31`;
  renderFilterControls();
  initAccessControls();
  initLocationSearch();
  syncPanelGripLabel();

  daySlider.addEventListener("input", () => {
    state.selectedDay = Number(daySlider.value);
    state.allSeasons = false;
    render();
  });

  dateInput.addEventListener("change", () => {
    const date = new Date(`${dateInput.value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return;
    state.selectedDay = getDayOfYear(date);
    state.allSeasons = false;
    render();
  });

  mapModeButtons.forEach((button) => {
    button.addEventListener("click", () => setMapMode(button.dataset.mapMode));
  });

  panelGrip.addEventListener("pointerdown", handlePanelGripPointerDown);
  initWelcomeModal();

  sectionToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const section = toggle.closest(".mobile-section");
      if (!section) return;
      const shouldOpen = !section.classList.contains("is-open");
      section.classList.toggle("is-open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      requestAnimationFrame(() => map.resize());
    });
  });

  todayButton.addEventListener("click", () => {
    state.selectedDay = getDayOfYear(new Date());
    state.allSeasons = false;
    render();
  });

  allSeasonsButton.addEventListener("click", () => {
    state.allSeasons = !state.allSeasons;
    render();
  });

  document.querySelector("#selectAllSpeciesButton").addEventListener("click", () => {
    state.savedLocationsOnly = false;
    document.querySelectorAll("input[name='species']").forEach((input) => {
      input.checked = true;
    });
    syncCategoryCheckboxes();
    render();
  });

  document.querySelector("#selectFavoriteSpeciesButton").addEventListener("click", () => {
    state.savedLocationsOnly = false;
    document.querySelectorAll("input[name='species']").forEach((input) => {
      input.checked = state.favoriteSpecies.has(input.value);
    });
    syncCategoryCheckboxes();
    render();
  });

  document.querySelector("#selectSavedLocationsButton").addEventListener("click", () => {
    state.savedLocationsOnly = !state.savedLocationsOnly;
    if (state.savedLocationsOnly) {
      document.querySelectorAll("input[name='species']").forEach((input) => {
        input.checked = true;
      });
      syncCategoryCheckboxes();
    }
    render();
  });

  document.querySelector("#clearSpeciesButton").addEventListener("click", () => {
    state.savedLocationsOnly = false;
    document.querySelectorAll("input[name='species']").forEach((input) => {
      input.checked = false;
    });
    syncCategoryCheckboxes();
    render();
  });

  map.on("move", () => {
    if (shouldRebalanceAggregatesOnMove()) {
      scheduleFallingFruitAggregateUpdate();
    }
  });

  map.on("zoom", () => {
    const belowPointZoom = map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM;
    if (!belowPointZoom && state.wasBelowPointZoom && !isViewportCoveredByLoadedPoints()) {
      state.pointDataReady = false;
    }
    if (belowPointZoom && !state.wasBelowPointZoom) {
      // Crossing down: hold the aggregate repaint until grid counts for this
      // viewport are confirmed, instead of painting a sparse interim state.
      // Clusters stay up (their records are already loaded) until the fresh
      // aggregate paint lands — symmetric with the upward handoff bridge.
      setINaturalistAggregateReady(false);
      beginAggregateBridge();
      scheduleINaturalistAggregateLoad();
    }
    state.wasBelowPointZoom = belowPointZoom;
    updateLayerHandoff();
  });

  map.on("moveend", () => {
    updateFallingFruitAggregates();
    updateMarkerPointVisibility();
    scheduleINaturalistAggregateLoad();
    scheduleDataLoad();
    schedulePublicLandLoad();
  });
}

function setPanelCollapsed(collapsed) {
  controlPanel.classList.toggle("is-collapsed", collapsed);
  panelGrip.setAttribute("aria-expanded", String(!collapsed));
  if (collapsed) {
    setPanelHeight(MOBILE_PANEL_MIN_HEIGHT);
  } else {
    setPanelHeight(Math.max(MOBILE_PANEL_DEFAULT_HEIGHT, MOBILE_PANEL_MIN_HEIGHT));
  }
  requestAnimationFrame(() => map.resize());
}

function handlePanelGripPointerDown(event) {
  if (!isMobilePanel()) {
    event.preventDefault();
    setDesktopPanelCollapsed(!controlPanel.classList.contains("is-desktop-collapsed"));
    return;
  }
  event.preventDefault();
  const startHeight = controlPanel.getBoundingClientRect().height;
  panelDragState = {
    pointerId: event.pointerId,
    startY: event.clientY,
    startHeight,
    moved: false
  };
  controlPanel.classList.add("is-resizing");
  panelGrip.setPointerCapture(event.pointerId);
  panelGrip.addEventListener("pointermove", handlePanelGripPointerMove);
  panelGrip.addEventListener("pointerup", handlePanelGripPointerUp);
  panelGrip.addEventListener("pointercancel", handlePanelGripPointerUp);
}

function setDesktopPanelCollapsed(collapsed) {
  controlPanel.classList.toggle("is-desktop-collapsed", collapsed);
  appShell?.classList.toggle("panel-collapsed", collapsed);
  panelGrip.setAttribute("aria-expanded", String(!collapsed));
  syncPanelGripLabel();
  resizeMapAfterLayoutChange();
}

function resizeMapAfterLayoutChange() {
  if (!state.mapReady) return;
  const view = {
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch()
  };
  const resize = () => {
    map.resize();
    map.jumpTo(view);
  };
  requestAnimationFrame(resize);
}

function syncPanelGripLabel() {
  const label = panelGrip?.querySelector(".panel-grip-label");
  if (!label) return;
  if (isMobilePanel()) {
    label.textContent = "Menu";
    return;
  }
  label.textContent = controlPanel.classList.contains("is-desktop-collapsed") ? "Menu" : "Map";
}

function handlePanelGripPointerMove(event) {
  if (!panelDragState || event.pointerId !== panelDragState.pointerId) return;
  const delta = panelDragState.startY - event.clientY;
  if (Math.abs(delta) > 6) panelDragState.moved = true;
  const nextHeight = panelDragState.startHeight + delta;
  setPanelHeight(nextHeight);
}

function handlePanelGripPointerUp(event) {
  if (!panelDragState || event.pointerId !== panelDragState.pointerId) return;
  const wasTap = !panelDragState.moved;
  panelGrip.releasePointerCapture(event.pointerId);
  panelGrip.removeEventListener("pointermove", handlePanelGripPointerMove);
  panelGrip.removeEventListener("pointerup", handlePanelGripPointerUp);
  panelGrip.removeEventListener("pointercancel", handlePanelGripPointerUp);
  controlPanel.classList.remove("is-resizing");
  panelDragState = null;

  if (wasTap) {
    const isCollapsed = controlPanel.classList.contains("is-collapsed");
    setPanelCollapsed(!isCollapsed);
    return;
  }

  const currentHeight = controlPanel.getBoundingClientRect().height;
  if (currentHeight <= MOBILE_PANEL_MIN_HEIGHT + 20) {
    setPanelCollapsed(true);
  } else {
    controlPanel.classList.remove("is-collapsed");
    panelGrip.setAttribute("aria-expanded", "true");
    setPanelHeight(currentHeight);
  }
}

function setPanelHeight(height) {
  const maxHeight = getPanelMaxHeight();
  const nextHeight = Math.min(Math.max(height, MOBILE_PANEL_MIN_HEIGHT), maxHeight);
  controlPanel.style.setProperty("--panel-height", `${nextHeight}px`);
  controlPanel.classList.toggle("is-collapsed", nextHeight <= MOBILE_PANEL_MIN_HEIGHT + 2);
  panelGrip.setAttribute("aria-expanded", String(nextHeight > MOBILE_PANEL_MIN_HEIGHT + 2));
  requestAnimationFrame(() => map.resize());
}

function getPanelMaxHeight() {
  return Math.max(MOBILE_PANEL_MIN_HEIGHT, window.innerHeight - MOBILE_PANEL_MARGIN);
}

function isMobilePanel() {
  return window.matchMedia("(max-width: 860px)").matches;
}

function getSpecies(speciesId) {
  return speciesCatalogById.get(speciesId);
}

function getSpeciesInput(speciesId) {
  return document.querySelector(`input[name='species'][value='${speciesId}']`);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name='${name}']:checked`)].map((input) => input.value);
}

function getSelectedAccessStatuses() {
  return getCheckedValues("access-status");
}

function getTaxonIds(species) {
  return species.inatTaxonIds || [];
}

function getExpectedIconicTaxon(species) {
  return species.category === "mushroom" ? "Fungi" : "Plantae";
}

function getSelectedCatalogItems() {
  const selectedIds = new Set(getCheckedValues("species"));
  return speciesCatalog.filter((species) => selectedIds.has(species.id));
}

function setSpeciesByCategory(category, checked) {
  speciesCatalog
    .filter((species) => species.category === category)
    .forEach((species) => {
      const input = getSpeciesInput(species.id);
      if (input) input.checked = checked;
    });
}

function setSpeciesByGroup(groupLabel, checked) {
  speciesCatalog
    .filter((species) => species.groupLabel === groupLabel)
    .forEach((species) => {
      const input = getSpeciesInput(species.id);
      if (input) input.checked = checked;
    });
}

function syncCategoryCheckboxes() {
  categoryInputs.forEach((input) => {
    const speciesInCategory = speciesCatalog.filter((species) => species.category === input.value);
    const selectedCount = speciesInCategory.filter((species) => getSpeciesInput(species.id)?.checked).length;
    input.checked = selectedCount === speciesInCategory.length;
    input.indeterminate = selectedCount > 0 && selectedCount < speciesInCategory.length;
  });
}

function syncSpeciesGroupCheckboxes() {
  document.querySelectorAll("input[name='species-group']").forEach((input) => {
    const speciesInGroup = speciesCatalog.filter((species) => species.groupLabel === input.value);
    const selectedCount = speciesInGroup.filter((species) => getSpeciesInput(species.id)?.checked).length;
    input.checked = selectedCount === speciesInGroup.length;
    input.indeterminate = selectedCount > 0 && selectedCount < speciesInGroup.length;
    input.closest(".species-group")?.querySelector(".species-group-summary")?.classList.toggle("is-selected", input.checked);
  });
}

function renderSpeciesState() {
  const selectedSpecies = getCheckedValues("species");
  speciesCount.textContent = selectedSpecies.length;
  document.querySelector("#selectSavedLocationsButton")?.classList.toggle("active", state.savedLocationsOnly);
  document.querySelectorAll(".species-list label:not(.species-group-title)").forEach((label) => {
    const input = label.querySelector("input[name='species']");
    label.classList.toggle("is-selected", input?.checked);
  });
  document.querySelectorAll(".species-list .species-group-title").forEach((label) => {
    label.classList.remove("is-selected");
  });
  syncCategoryCheckboxes();
  syncSpeciesGroupCheckboxes();
  renderFavoriteSpeciesState();
}

function renderFavoriteSpeciesState() {
  document.querySelectorAll("[data-favorite-species]").forEach((button) => {
    const species = getSpecies(button.dataset.favoriteSpecies);
    const favorite = state.favoriteSpecies.has(button.dataset.favoriteSpecies);
    button.classList.toggle("is-favorite", favorite);
    button.setAttribute("aria-pressed", String(favorite));
    if (species) {
      button.setAttribute("aria-label", `${favorite ? "Remove" : "Add"} ${species.commonName} ${favorite ? "from" : "to"} favorites`);
    }
    button.setAttribute("title", favorite ? "Remove from favorites" : "Add to favorites");
  });
}

function isSpeciesAvailableOnSelectedDate(species) {
  return state.allSeasons || species.months.includes(getSelectedMonth());
}

function getVisibleRecords() {
  const selectedSpecies = new Set(getCheckedValues("species"));
  const selectedAccessStatuses = new Set(getSelectedAccessStatuses());

  return state.records.filter((record) => {
    if (!selectedSpecies.has(record.speciesId)) return false;
    const species = getSpecies(record.speciesId);
    if (!species) return false;
    if (state.savedLocationsOnly && !state.savedLocations.has(record.id)) return false;
    if (!isSpeciesAvailableOnSelectedDate(species)) return false;
    const accessRule = getRecordAccessRule(record, species);
    return selectedAccessStatuses.has(accessRule.status);
  });
}

function render() {
  renderSeasonControls();
  renderSpeciesState();
  renderAccessFilterNote();
  renderHistogram();
  renderMarkers();
  updateFallingFruitAggregates();
  if (state.mapReady) {
    scheduleINaturalistAggregateLoad();
    scheduleDataLoad();
    schedulePublicLandLoad();
    requestAnimationFrame(() => map.resize());
  }
}

function renderAccessFilterNote() {
  const note = document.querySelector("#accessFilterNote");
  if (!note) return;
  note.hidden = !isAccessFilterActive();
}

function renderSeasonControls() {
  const selectedDate = getSelectedDate();
  daySlider.value = String(state.selectedDay);
  dateInput.value = getDateInputValue(selectedDate);
  seasonDateLabel.textContent = state.allSeasons
    ? "All seasons"
    : `${FULL_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  seasonName.textContent = state.allSeasons ? "Full year" : getSeason(selectedDate);
  daySlider.disabled = state.allSeasons;
  dateInput.disabled = state.allSeasons;
  todayButton.classList.toggle("active", !state.allSeasons);
  allSeasonsButton.classList.toggle("active", state.allSeasons);
}

function renderHistogram() {
  const selectedSpecies = getCheckedValues("species");
  const speciesForChart = speciesCatalog.filter((species) => (
    selectedSpecies.includes(species.id)
  ));
  const monthBreakdowns = MONTHS.map((_, index) => {
    const month = index + 1;
    const breakdown = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
    speciesForChart.forEach((species) => {
      if (species.months.includes(month)) breakdown[species.category] += 1;
    });
    return breakdown;
  });
  const totals = monthBreakdowns.map((breakdown) => (
    CATEGORIES.reduce((sum, category) => sum + breakdown[category], 0)
  ));
  const maxCount = Math.max(1, ...totals);
  const activeMonth = getSelectedMonth();

  seasonHistogram.innerHTML = monthBreakdowns.map((breakdown, index) => {
    const total = totals[index];
    const height = total ? Math.max(8, Math.round((total / maxCount) * 68)) : 8;
    const activeClass = !state.allSeasons && index + 1 === activeMonth ? " active" : "";
    const segments = CATEGORIES.map((category) => {
      const count = breakdown[category];
      if (!count) return "";
      const segmentHeight = Math.max(6, Math.round((count / total) * height));
      return `<div class="histogram-segment ${category}" style="height: ${segmentHeight}px"></div>`;
    }).join("");
    const title = CATEGORIES
      .filter((category) => breakdown[category])
      .map((category) => `${category}: ${breakdown[category]}`)
      .join(", ");
    return `
      <div class="histogram-bar${activeClass}" style="height: ${height}px" title="${MONTHS[index]}: ${title || "none"}">
        ${segments}
        <span class="histogram-label">${MONTHS[index]}</span>
      </div>
    `;
  }).join("");
}

function renderMarkers() {
  if (!state.mapReady || !map.getSource(MARKERS_SOURCE_ID)) return;

  const features = getVisibleRecords().flatMap((record) => {
    const species = getSpecies(record.speciesId);
    const lat = Number(record.lat);
    const lng = Number(record.lng);
    if (!species || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return [];
    }
    const accessRule = getRecordAccessRule(record, species);
    const categoryColor = CATEGORY_COLORS[species.category] || Object.values(CATEGORY_COLORS)[0];
    const markerIcon = getMarkerIconName(species.category, accessRule.status);
    ensureMarkerIcon(markerIcon, categoryColor, accessRule.status);

    return [{
      type: "Feature",
      id: record.id,
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      properties: {
        id: record.id,
        savedLocation: isSavedLocation(record.id),
        speciesId: record.speciesId,
        speciesName: species.commonName,
        scientificName: species.scientificName,
        observedName: record.observedName || species.commonName,
        observedScientificName: record.observedScientificName || species.scientificName,
        category: species.category,
        categoryColor,
        markerIcon,
        source: record.source,
        sourceLabel: sourceLabel(record.source),
        sourceUrl: record.sourceUrl || "",
        idDate: record.idDate || "",
        name: record.name || species.commonName,
        usedParts: species.usedParts || "",
        safetyTags: getSpeciesSafetyTags(species).join("|"),
        harvestEthic: getSpeciesHarvestEthicLabel(species),
        accessNote: accessRule.note,
        accessStatus: accessRule.status,
        accessStatusLabel: accessRule.label,
        accessArea: accessRule.area,
        accessLimit: accessRule.limit,
        accessSourceLabel: accessRule.sourceLabel,
        accessSourceUrl: accessRule.sourceUrl,
        rulesLabel: getActiveMapConfig().rulesLabel,
        season: getMonthRangeText(species.months),
        confidence: record.confidence || "community",
        harvestStatus: record.harvestStatus || "",
        harvestNote: record.accessNote || "Confirm site rules before harvesting."
      }
    }];
  });

  map.getSource(MARKERS_SOURCE_ID).setData({
    type: "FeatureCollection",
    features
  });
}

function updateFallingFruitAggregates() {
  if (!state.mapReady || !map.getSource(FALLING_FRUIT_AGGREGATE_SOURCE_ID)) return;
  if (shouldShowPointLayers()) return;
  if (shouldDeferAggregatePaint()) return;
  window.clearTimeout(state.aggregateTimer);
  getFallingFruitManifest()
    .then((manifest) => {
      if (!state.mapReady || !map.getSource(FALLING_FRUIT_AGGREGATE_SOURCE_ID)) return;
      if (shouldDeferAggregatePaint()) return;
      map.getSource(FALLING_FRUIT_AGGREGATE_SOURCE_ID).setData(getFallingFruitAggregateCollection(manifest));
      settleAggregateBridgeAfterPaint();
    })
    .catch(() => {
      map.getSource(FALLING_FRUIT_AGGREGATE_SOURCE_ID)?.setData({
        type: "FeatureCollection",
        features: []
      });
    });
}

function scheduleFallingFruitAggregateUpdate() {
  window.clearTimeout(state.aggregateTimer);
  state.aggregateTimer = window.setTimeout(updateFallingFruitAggregates, 90);
}

function shouldDeferAggregatePaint() {
  // Hold the overview paint briefly while iNaturalist grid counts are in flight,
  // so the page settles in one pass instead of repainting as counts stream in.
  if (state.inatAggregateReady || state.savedLocationsOnly) return false;
  if (map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) return false;
  if (state.aggregateGateStart === null) return false;
  const elapsed = performance.now() - state.aggregateGateStart;
  if (elapsed >= AGGREGATE_FIRST_PAINT_GRACE_MS) return false;
  window.clearTimeout(state.aggregateGateTimer);
  state.aggregateGateTimer = window.setTimeout(
    updateFallingFruitAggregates,
    AGGREGATE_FIRST_PAINT_GRACE_MS - elapsed + 50
  );
  return true;
}

function getFallingFruitAggregateCollection(manifest) {
  if (state.savedLocationsOnly) {
    return {
      type: "FeatureCollection",
      features: []
    };
  }
  const selectedSpeciesIds = new Set(getSelectedCatalogItems()
    .filter(isSpeciesAvailableOnSelectedDate)
    .map((species) => species.id));
  if (!selectedSpeciesIds.size) {
    return {
      type: "FeatureCollection",
      features: []
    };
  }

  const zoom = state.mapReady ? map.getZoom() : 0;
  const bounds = state.mapReady ? map.getBounds() : null;
  const selectedAccessStatuses = getSelectedAccessStatuses();
  const accessFilterActive = isAccessFilterActive(selectedAccessStatuses);
  const useViewportAggregation = shouldUseViewportAggregateBounds(zoom, bounds);
  const aggregateBounds = useViewportAggregation && bounds ? getPaddedAggregateBounds(bounds, zoom) : null;
  const aggregateItems = getAggregateItems(manifest, selectedSpeciesIds, aggregateBounds, accessFilterActive);
  const mode = useViewportAggregation ? "screen" : "geo";
  const gridSize = useViewportAggregation ? getAggregateScreenGridSize(zoom) : getAggregateGeoGridSize(zoom);
  const features = getGridAggregateFeatures(aggregateItems, selectedSpeciesIds, gridSize, aggregateBounds, mode, selectedAccessStatuses, accessFilterActive);

  return {
    type: "FeatureCollection",
    features
  };
}

function shouldRebalanceAggregatesOnMove() {
  if (!state.mapReady || map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) return false;
  // Rebalancing mid-gesture competes with the renderer; zoomend/moveend covers it.
  if (map.isZooming()) return false;
  return shouldUseViewportAggregateBounds(map.getZoom(), map.getBounds());
}

function shouldUseViewportAggregateBounds(zoom, bounds) {
  if (!bounds) return false;
  return zoom >= 6.4 || getBoundsLngSpan(bounds) <= 12;
}

function getAggregateItems(manifest, selectedSpeciesIds, bounds, accessFilterActive = false) {
  const items = getActiveMapConfig().loadFallingFruit
    ? [...(manifest.chunks || [])]
    : [];
  if (state.mapReady && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
    items.push(...getINaturalistAggregateItems(bounds));
  }
  return items;
}

function getINaturalistAggregateItems(bounds) {
  return state.inatAggregateItems.filter((item) => (
    !bounds || bboxIntersectsBounds(item.bbox, bounds)
  ));
}

function getGridAggregateFeatures(items, selectedSpeciesIds, gridSize, bounds, mode, selectedAccessStatuses, accessFilterActive) {
  const groups = new Map();
  items.forEach((item) => {
    if (bounds && !bboxIntersectsBounds(item.bbox, bounds)) return;
    const count = getAggregateRecordCount(item, selectedSpeciesIds, selectedAccessStatuses, accessFilterActive);
    if (!count) return;
    const center = getAggregateItemCenter(item, selectedSpeciesIds, selectedAccessStatuses, accessFilterActive);
    const key = getAggregateGridKey(center, gridSize, mode);
    const group = groups.get(key) || {
      id: key,
      level: "grid",
      label: "",
      count: 0,
      weightedLng: 0,
      weightedLat: 0
    };
    group.count += count;
    group.weightedLng += center[0] * count;
    group.weightedLat += center[1] * count;
    groups.set(key, group);
  });

  const features = [...groups.values()].map((group) => getAggregateFeature({
    id: `grid-${group.id}`,
    level: "grid",
    label: "",
    center: [
      group.weightedLng / group.count,
      group.weightedLat / group.count
    ],
    count: group.count
  }));
  return mergeOverlappingAggregateFeatures(features, mode === "geo" ? 8 : 6);
}

function getAggregateGridKey(center, gridSize, mode) {
  if (mode === "screen") {
    // Pure mercator math; map.project is too slow for thousands of cells per pass.
    const scale = getWorldPixelScale();
    const x = lngToTileX(center[0], scale);
    const y = latToTileY(center[1], scale);
    return `${Math.floor(x / gridSize)}_${Math.floor(y / gridSize)}`;
  }
  const west = Math.floor(center[0] / gridSize) * gridSize;
  const south = Math.floor(center[1] / gridSize) * gridSize;
  return `${west.toFixed(2)}_${south.toFixed(2)}`;
}

function getWorldPixelScale() {
  return 512 * (2 ** (state.mapReady ? map.getZoom() : 0));
}

function getAggregateGeoGridSize(zoom) {
  // Target a constant ~110 screen pixels per bucket at every zoom (capped at
  // 2.4 degrees so the wide national overview keeps its familiar grain).
  // Fixed degree sizes produced ~32px buckets around zoom 5-6, exploding the
  // group count and making that zoom band sluggish.
  const degreesPerPixel = 360 / (512 * (2 ** zoom));
  return Math.min(2.4, 110 * degreesPerPixel);
}

function getAggregateScreenGridSize(zoom) {
  if (zoom < 4.2) return 150;
  if (zoom < 5.2) return 130;
  if (zoom < 6.3) return 110;
  if (zoom < 7.2) return 86;
  return 64;
}

function getPaddedAggregateBounds(bounds, zoom) {
  const padRatio = zoom < 5.5 ? 0.18 : 0.1;
  const lngPad = getBoundsLngSpan(bounds) * padRatio;
  const latPad = (bounds.getNorth() - bounds.getSouth()) * padRatio;
  return {
    getWest: () => Math.max(REGION_MAX_BOUNDS[0][0], bounds.getWest() - lngPad),
    getSouth: () => Math.max(REGION_MAX_BOUNDS[0][1], bounds.getSouth() - latPad),
    getEast: () => Math.min(REGION_MAX_BOUNDS[1][0], bounds.getEast() + lngPad),
    getNorth: () => Math.min(REGION_MAX_BOUNDS[1][1], bounds.getNorth() + latPad)
  };
}

function getBoundsLngSpan(bounds) {
  return bounds.getEast() - bounds.getWest();
}

function mergeOverlappingAggregateFeatures(features, padding = 6) {
  if (!state.mapReady || features.length < 2) return features;
  const scale = getWorldPixelScale();
  let nodes = features.map((feature) => {
    const point = {
      x: lngToTileX(feature.geometry.coordinates[0], scale),
      y: latToTileY(feature.geometry.coordinates[1], scale)
    };
    return {
      ids: [feature.properties.id],
      levels: new Set([feature.properties.level]),
      labels: feature.properties.label ? [feature.properties.label] : [],
      count: Number(feature.properties.count || 0),
      weightedLng: feature.geometry.coordinates[0] * Number(feature.properties.count || 0),
      weightedLat: feature.geometry.coordinates[1] * Number(feature.properties.count || 0),
      x: point.x,
      y: point.y,
      radius: getAggregateScreenRadius(feature.properties.count)
    };
  });

  let merged = true;
  while (merged) {
    merged = false;
    outer:
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (distance > a.radius + b.radius + padding) continue;
        nodes.splice(j, 1);
        nodes[i] = mergeAggregateNodes(a, b, scale);
        merged = true;
        break outer;
      }
    }
  }

  return nodes.map((node) => getAggregateFeature({
    id: `merged-${node.ids.sort().join("-")}`,
    level: node.levels.size === 1 ? [...node.levels][0] : "region",
    label: node.labels.length === 1 ? node.labels[0] : "",
    center: [
      node.weightedLng / node.count,
      node.weightedLat / node.count
    ],
    count: node.count
  }));
}

function mergeAggregateNodes(a, b, scale) {
  const count = a.count + b.count;
  const lng = (a.weightedLng + b.weightedLng) / count;
  const lat = (a.weightedLat + b.weightedLat) / count;
  const point = {
    x: lngToTileX(lng, scale),
    y: latToTileY(lat, scale)
  };
  return {
    ids: [...a.ids, ...b.ids],
    levels: new Set([...a.levels, ...b.levels]),
    labels: [...a.labels, ...b.labels],
    count,
    weightedLng: a.weightedLng + b.weightedLng,
    weightedLat: a.weightedLat + b.weightedLat,
    x: point.x,
    y: point.y,
    radius: getAggregateScreenRadius(count)
  };
}

function getAggregateScreenRadius(count) {
  const stops = [
    [1, 7],
    [25, 11],
    [250, 16],
    [2500, 22],
    [25000, 28]
  ];
  for (let index = 1; index < stops.length; index += 1) {
    const [stopCount, stopRadius] = stops[index];
    const [prevCount, prevRadius] = stops[index - 1];
    if (count > stopCount) continue;
    const progress = (count - prevCount) / (stopCount - prevCount);
    return prevRadius + progress * (stopRadius - prevRadius);
  }
  return stops[stops.length - 1][1];
}

function getAggregateRecordCount(item, selectedSpeciesIds, selectedAccessStatuses, accessFilterActive) {
  if (item.countsBySpeciesId?.[INATURALIST_AGGREGATE_SPECIES_ID]) {
    const count = Number(item.countsBySpeciesId[INATURALIST_AGGREGATE_SPECIES_ID] || 0);
    if (!accessFilterActive) return count;
    return accessStatusSelectionHas(selectedAccessStatuses, getINaturalistAggregateAccessStatus(item)) ? count : 0;
  }
  const modeAccessCounts = item.accessCounts?.[state.activeMap];
  if (accessFilterActive && modeAccessCounts) {
    return [...selectedAccessStatuses].reduce((total, status) => (
      total + getFilteredAccessStatusCount(modeAccessCounts[status], selectedSpeciesIds)
    ), 0);
  }
  return Object.entries(item.countsBySpeciesId || {}).reduce((total, [sourceSpeciesId, count]) => {
    const importedSpeciesId = getImportedSpeciesId(sourceSpeciesId);
    return selectedSpeciesIds.has(importedSpeciesId) ? total + Number(count || 0) : total;
  }, 0);
}

function getAggregateItemCenter(item, selectedSpeciesIds, selectedAccessStatuses, accessFilterActive) {
  const aggregateCentroid = item.centroidsBySpeciesId?.[INATURALIST_AGGREGATE_SPECIES_ID];
  if (Array.isArray(aggregateCentroid)) return [aggregateCentroid[0], aggregateCentroid[1]];
  const modeAccessCentroids = item.accessCentroids?.[state.activeMap];
  const modeAccessCounts = item.accessCounts?.[state.activeMap];
  if (accessFilterActive && modeAccessCentroids) {
    let accessCount = 0;
    let accessWeightedLng = 0;
    let accessWeightedLat = 0;
    selectedAccessStatuses.forEach((status) => {
      const centroid = modeAccessCentroids[status];
      if (!Array.isArray(centroid)) return;
      const centroidCount = getFilteredAccessStatusCount(modeAccessCounts?.[status], selectedSpeciesIds);
      if (!centroidCount) return;
      accessWeightedLng += Number(centroid[0]) * centroidCount;
      accessWeightedLat += Number(centroid[1]) * centroidCount;
      accessCount += centroidCount;
    });
    if (accessCount) return [accessWeightedLng / accessCount, accessWeightedLat / accessCount];
  }
  let count = 0;
  let weightedLng = 0;
  let weightedLat = 0;
  Object.entries(item.centroidsBySpeciesId || {}).forEach(([sourceSpeciesId, centroid]) => {
    const importedSpeciesId = getImportedSpeciesId(sourceSpeciesId);
    if (!selectedSpeciesIds.has(importedSpeciesId) || !Array.isArray(centroid)) return;
    const centroidCount = Number(centroid[2] || item.countsBySpeciesId?.[sourceSpeciesId] || 0);
    if (!centroidCount) return;
    weightedLng += Number(centroid[0]) * centroidCount;
    weightedLat += Number(centroid[1]) * centroidCount;
    count += centroidCount;
  });
  if (count) return [weightedLng / count, weightedLat / count];
  return item.center || getBboxCenter(item.bbox);
}

function getFilteredAccessStatusCount(speciesCounts, selectedSpeciesIds) {
  return Object.entries(speciesCounts || {}).reduce((total, [speciesId, count]) => (
    selectedSpeciesIds.has(speciesId) ? total + Number(count || 0) : total
  ), 0);
}

function accessStatusSelectionHas(selectedAccessStatuses, status) {
  return typeof selectedAccessStatuses?.has === "function"
    ? selectedAccessStatuses.has(status)
    : selectedAccessStatuses.includes(status);
}

function getINaturalistAggregateAccessStatus(item) {
  const centroid = item.centroidsBySpeciesId?.[INATURALIST_AGGREGATE_SPECIES_ID];
  if (!Array.isArray(centroid)) return "unknown";
  const key = getStatusRasterCellKey(Number(centroid[0]), Number(centroid[1]));
  return state.statusRaster?.[key]?.[state.activeMap] || "unknown";
}

function getStatusRasterCellKey(lng, lat) {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return "";
  const west = Math.floor(lng / STATUS_RASTER_CELL_SIZE_DEGREES) * STATUS_RASTER_CELL_SIZE_DEGREES;
  const south = Math.floor(lat / STATUS_RASTER_CELL_SIZE_DEGREES) * STATUS_RASTER_CELL_SIZE_DEGREES;
  return `${formatRasterCoord(west, "w", "e")}_${formatRasterCoord(south, "s", "n")}`;
}

function formatRasterCoord(value, negativePrefix, positivePrefix) {
  const rounded = Number(value.toFixed(5));
  const prefix = rounded < 0 ? negativePrefix : positivePrefix;
  const absolute = Math.round(Math.abs(rounded) * 100);
  return `${prefix}${String(absolute).padStart(5, "0")}`;
}

async function loadStatusRaster() {
  if (state.statusRaster) return state.statusRaster;
  if (!state.statusRasterPromise) {
    state.statusRasterPromise = fetch(STATUS_RASTER_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`status raster returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        state.statusRaster = data || {};
        return state.statusRaster;
      })
      .catch((error) => {
        console.warn("Status raster unavailable; live overview permissions fall back to unknown.", error);
        state.statusRaster = {};
        return state.statusRaster;
      });
  }
  return state.statusRasterPromise;
}

function getAggregateFeature({ id, level, label, center, count }) {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "Point",
      coordinates: center
    },
    properties: {
      id,
      level,
      label,
      count,
      countLabel: formatAggregateCount(count)
    }
  };
}

function getBboxCenter(bbox) {
  const [west, south, east, north] = bbox;
  return [(west + east) / 2, (south + north) / 2];
}

function formatAggregateCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 1000) return `${Math.round(count / 100) / 10}k`.replace(".0k", "k");
  return String(count);
}

function getMarkerIconName(category, accessStatus) {
  return `marker-${category}-${accessStatus}`;
}

function ensureMarkerIcon(iconName, fillColor, accessStatus) {
  if (!state.mapReady || map.hasImage(iconName)) return;
  const style = ACCESS_MARKER_STYLES[accessStatus] || ACCESS_MARKER_STYLES.unknown;
  const canvas = document.createElement("canvas");
  canvas.width = MARKER_ICON_SIZE * MARKER_ICON_PIXEL_RATIO;
  canvas.height = MARKER_ICON_SIZE * MARKER_ICON_PIXEL_RATIO;
  const context = canvas.getContext("2d");
  context.scale(MARKER_ICON_PIXEL_RATIO, MARKER_ICON_PIXEL_RATIO);
  const center = MARKER_ICON_SIZE / 2;
  const fillRadius = 6.5;
  const outlineRadius = 5.3;

  context.clearRect(0, 0, MARKER_ICON_SIZE, MARKER_ICON_SIZE);
  context.beginPath();
  context.arc(center, center, fillRadius, 0, Math.PI * 2);
  context.fillStyle = fillColor;
  context.fill();

  drawMarkerOutline(context, center, outlineRadius, style.color, style.dashed, 1.8);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  map.addImage(iconName, imageData, { pixelRatio: MARKER_ICON_PIXEL_RATIO });
}

function drawMarkerOutline(context, center, radius, color, dashed, lineWidth) {
  context.save();
  if (dashed) {
    const dotCount = 14;
    const dotRadius = lineWidth * 0.42;
    context.fillStyle = color;
    for (let index = 0; index < dotCount; index += 1) {
      const angle = (Math.PI * 2 * index) / dotCount;
      context.beginPath();
      context.arc(
        center + Math.cos(angle) * radius,
        center + Math.sin(angle) * radius,
        dotRadius,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  } else {
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function getCachedINaturalistRecordsInBounds() {
  if (!state.mapReady) return [...state.inatRecordCache.values()];
  const bounds = map.getBounds();
  return [...state.inatRecordCache.values()].filter((record) => recordInBounds(record, bounds));
}

function recordInBounds(record, bounds) {
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= bounds.getSouth()
    && lat <= bounds.getNorth()
    && lng >= bounds.getWest()
    && lng <= bounds.getEast();
}

function initMapLayers() {
  const firstLineOrSymbolLayerId = getFirstLineOrSymbolLayerId();

  initRegionBoundaryLayers(firstLineOrSymbolLayerId);

  if (!map.getSource(PUBLIC_LANDS_SOURCE_ID)) {
    map.addSource(PUBLIC_LANDS_SOURCE_ID, {
      type: "geojson",
      data: getPublicLandCollection()
    });
  }

  if (!map.getLayer(PUBLIC_LANDS_FILL_LAYER_ID)) {
    map.addLayer({
      id: PUBLIC_LANDS_FILL_LAYER_ID,
      type: "fill",
      source: PUBLIC_LANDS_SOURCE_ID,
      minzoom: PUBLIC_LANDS_MIN_RENDER_ZOOM,
      paint: {
        "fill-color": [
          "case",
          ["==", ["get", "Pub_Access"], "RA"],
          "#3b8c7e",
          "#75ad37"
        ],
        "fill-opacity": [
          "case",
          ["==", ["get", "Pub_Access"], "RA"],
          0.16,
          0.18
        ]
      }
    }, firstLineOrSymbolLayerId);
  }

  if (!map.getLayer(PUBLIC_LANDS_LINE_LAYER_ID)) {
    map.addLayer({
      id: PUBLIC_LANDS_LINE_LAYER_ID,
      type: "line",
      source: PUBLIC_LANDS_SOURCE_ID,
      minzoom: PUBLIC_LANDS_MIN_RENDER_ZOOM,
      paint: {
        "line-color": [
          "case",
          ["==", ["get", "Pub_Access"], "RA"],
          "#2f786c",
          "#4f8f32"
        ],
        "line-width": 1,
        "line-opacity": 0.72
      }
    }, firstLineOrSymbolLayerId);
  }

  if (!map.getSource(FALLING_FRUIT_AGGREGATE_SOURCE_ID)) {
    map.addSource(FALLING_FRUIT_AGGREGATE_SOURCE_ID, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });
  }

  if (!map.getLayer(FALLING_FRUIT_AGGREGATE_LAYER_ID)) {
    map.addLayer({
      id: FALLING_FRUIT_AGGREGATE_LAYER_ID,
      type: "circle",
      source: FALLING_FRUIT_AGGREGATE_SOURCE_ID,
      paint: {
        "circle-color": "#f7f2df",
        "circle-opacity": 0.86,
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "count"],
          1, 7,
          25, 11,
          250, 16,
          2500, 22,
          25000, 28
        ],
        "circle-stroke-color": "#243a2a",
        "circle-stroke-opacity": 0.78,
        "circle-stroke-width": 1.25
      }
    });
  }

  if (!map.getLayer(FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID)) {
    map.addLayer({
      id: FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID,
      type: "symbol",
      source: FALLING_FRUIT_AGGREGATE_SOURCE_ID,
      layout: {
        "text-field": ["get", "countLabel"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["get", "count"],
          1, 11,
          250, 13,
          25000, 14
        ],
        "text-allow-overlap": true,
        "text-ignore-placement": true
      },
      paint: {
        "text-color": "#243a2a"
      }
    });
  }

  if (!map.getLayer(FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID)) {
    map.addLayer({
      id: FALLING_FRUIT_AGGREGATE_LABEL_LAYER_ID,
      type: "symbol",
      source: FALLING_FRUIT_AGGREGATE_SOURCE_ID,
      maxzoom: 4.2,
      filter: ["==", ["get", "level"], "state"],
      layout: {
        "text-field": ["get", "label"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 10,
        "text-offset": [0, 2.2],
        "text-allow-overlap": false,
        "text-ignore-placement": false
      },
      paint: {
        "text-color": "#243a2a",
        "text-halo-color": "#f7f2df",
        "text-halo-width": 1.4
      }
    });
  }

  if (!map.getSource(MARKERS_SOURCE_ID)) {
    map.addSource(MARKERS_SOURCE_ID, {
      type: "geojson",
      cluster: true,
      clusterMaxZoom: MARKER_CLUSTER_MAX_ZOOM,
      clusterRadius: MARKER_CLUSTER_RADIUS,
      data: {
        type: "FeatureCollection",
        features: []
      }
    });
  }

  if (!map.getLayer(MARKER_CLUSTERS_LAYER_ID)) {
    map.addLayer({
      id: MARKER_CLUSTERS_LAYER_ID,
      type: "circle",
      source: MARKERS_SOURCE_ID,
      minzoom: MARKER_CLUSTER_BRIDGE_MIN_ZOOM,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#eef4e9",
          25,
          "#dbe8d0",
          100,
          "#c7d8b8"
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          15,
          25,
          19,
          100,
          24
        ],
        "circle-stroke-color": "#1f3d2b",
        "circle-stroke-opacity": 0.75,
        "circle-stroke-width": 1.4
      }
    });
  }

  if (!map.getLayer(MARKER_CLUSTER_COUNT_LAYER_ID)) {
    map.addLayer({
      id: MARKER_CLUSTER_COUNT_LAYER_ID,
      type: "symbol",
      source: MARKERS_SOURCE_ID,
      minzoom: MARKER_CLUSTER_BRIDGE_MIN_ZOOM,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": [
          "step",
          ["get", "point_count"],
          11,
          25,
          12,
          100,
          13
        ],
        "text-allow-overlap": true,
        "text-ignore-placement": true
      },
      paint: {
        "text-color": "#1f3d2b"
      }
    });
  }

  if (!map.getLayer(MARKERS_LAYER_ID)) {
    map.addLayer({
      id: MARKERS_LAYER_ID,
      type: "symbol",
      source: MARKERS_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      minzoom: FALLING_FRUIT_MIN_LOAD_ZOOM,
      layout: {
        "visibility": "none",
        "icon-image": ["get", "markerIcon"],
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6, 0.74,
          10, 0.86,
          14, 1.06
        ],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true
      }
    });
  }

  updatePublicLandVisibility();
  bindMapInteractions();
  updateLayerHandoff();

  map.on("sourcedata", (event) => {
    if (event.sourceId !== MARKERS_SOURCE_ID || !event.isSourceLoaded) return;
    updateMarkerPointVisibility();
  });
}

function shouldShowPointLayers() {
  return state.mapReady
    && map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM
    && state.pointDataReady;
}

function updateLayerHandoff() {
  // Aggregate circles stay on screen until the point data for this viewport
  // has actually loaded, then the two swap in a single pass — no empty gap
  // while clusters fetch at the zoom-8 crossing. The downward crossing is
  // symmetric: clusters stay up until a fresh aggregate paint has rendered.
  if (!state.mapReady) return;
  const showPoints = shouldShowPointLayers();
  if (showPoints && state.aggregateBridgeActive) cancelAggregateBridge();
  const bridging = state.aggregateBridgeActive;
  setLayerVisibility(FALLING_FRUIT_AGGREGATE_LAYER_ID, !showPoints && !bridging);
  setLayerVisibility(FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID, !showPoints && !bridging);
  setLayerVisibility(MARKER_CLUSTERS_LAYER_ID, showPoints || bridging);
  setLayerVisibility(MARKER_CLUSTER_COUNT_LAYER_ID, showPoints || bridging);
  if (showPoints !== state.lastShowPoints) {
    state.lastShowPoints = showPoints;
    updateMarkerPointVisibility();
  }
}

function beginAggregateBridge() {
  // Only bridge when the clusters actually have point data to show.
  if (!state.pointDataReady || !state.loadedPointBounds) return;
  state.aggregateBridgeActive = true;
  state.aggregateBridgeId += 1;
  window.clearTimeout(state.aggregateBridgeTimer);
  // Safety valve: never hold the bridge past the paint grace window.
  state.aggregateBridgeTimer = window.setTimeout(() => {
    cancelAggregateBridge();
    updateLayerHandoff();
  }, AGGREGATE_BRIDGE_MAX_MS);
}

function cancelAggregateBridge() {
  window.clearTimeout(state.aggregateBridgeTimer);
  state.aggregateBridgeTimer = null;
  state.aggregateBridgeActive = false;
}

function settleAggregateBridgeAfterPaint() {
  // A fresh aggregate paint just went into the source; flip the bridge once
  // the new tiles have rendered so the old buffer never shows.
  if (!state.aggregateBridgeActive || !state.inatAggregateReady) return;
  const bridgeId = state.aggregateBridgeId;
  map.once("idle", () => {
    if (!state.aggregateBridgeActive || state.aggregateBridgeId !== bridgeId) return;
    cancelAggregateBridge();
    updateLayerHandoff();
  });
}

function setLayerVisibility(layerId, visible) {
  if (!map.getLayer(layerId)) return;
  const visibility = visible ? "visible" : "none";
  if (map.getLayoutProperty(layerId, "visibility") !== visibility) {
    map.setLayoutProperty(layerId, "visibility", visibility);
  }
}

function isViewportCoveredByLoadedPoints() {
  const loaded = state.loadedPointBounds;
  if (!loaded) return false;
  const bounds = map.getBounds();
  return bounds.getWest() >= loaded.west
    && bounds.getEast() <= loaded.east
    && bounds.getSouth() >= loaded.south
    && bounds.getNorth() <= loaded.north;
}

function updateMarkerPointVisibility() {
  // Individual points stay hidden while any cluster is in the viewport, so a
  // given view reveals all of its points at once. Denser areas need more zoom.
  if (!state.mapReady || !map.getLayer(MARKERS_LAYER_ID)) return;
  setLayerVisibility(MARKERS_LAYER_ID, shouldShowPointLayers() && !viewportHasMarkerClusters());
}

function viewportHasMarkerClusters() {
  if (map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) return false;
  const bounds = map.getBounds();
  return map.querySourceFeatures(MARKERS_SOURCE_ID, { filter: ["has", "point_count"] })
    .some((feature) => {
      const [lng, lat] = feature.geometry?.coordinates || [];
      return lng >= bounds.getWest()
        && lng <= bounds.getEast()
        && lat >= bounds.getSouth()
        && lat <= bounds.getNorth();
    });
}

async function initRegionBoundaryLayers(firstLineOrSymbolLayerId) {
  try {
    const response = await fetch("./data/contiguous-us-boundary.json");
    if (!response.ok) return;
    const geometry = await response.json();
    const feature = {
      type: "Feature",
      properties: {},
      geometry
    };
    const mask = getOutsideRegionMask(geometry);

    if (!map.getSource(REGION_BOUNDARY_SOURCE_ID)) {
      map.addSource(REGION_BOUNDARY_SOURCE_ID, {
        type: "geojson",
        data: feature
      });
    }

    if (!map.getSource(REGION_MASK_SOURCE_ID)) {
      map.addSource(REGION_MASK_SOURCE_ID, {
        type: "geojson",
        data: mask
      });
    }

    if (!map.getLayer(REGION_MASK_LAYER_ID)) {
      map.addLayer({
        id: REGION_MASK_LAYER_ID,
        type: "fill",
        source: REGION_MASK_SOURCE_ID,
        paint: {
          "fill-color": "#f2efe5",
          "fill-opacity": 0.58
        }
      }, firstLineOrSymbolLayerId);
    }

    if (!map.getLayer(REGION_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: REGION_OUTLINE_LAYER_ID,
        type: "line",
        source: REGION_BOUNDARY_SOURCE_ID,
        paint: {
          "line-color": "#1f3d2b",
          "line-opacity": 0.86,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6, 1.6,
            10, 2.2,
            14, 3
          ]
        }
      }, firstLineOrSymbolLayerId);
    }
  } catch {
    // The boundary is visual guidance; the app can still run without it.
  }
}

function getOutsideRegionMask(geometry) {
  const worldRing = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85]
  ];
  const holes = geometry.type === "Polygon"
    ? geometry.coordinates.map((ring) => [...ring].reverse())
    : geometry.coordinates.flatMap((polygon) => polygon.map((ring) => [...ring].reverse()));

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [worldRing, ...holes]
    }
  };
}

function getFirstLineOrSymbolLayerId() {
  return map.getStyle().layers.find((layer) => layer.type === "line" || layer.type === "symbol")?.id;
}

function bindMapInteractions() {
  map.on("mouseenter", MARKER_CLUSTERS_LAYER_ID, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", MARKER_CLUSTERS_LAYER_ID, () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("click", MARKER_CLUSTERS_LAYER_ID, (event) => {
    const feature = event.features?.[0];
    const clusterId = feature?.properties?.cluster_id;
    if (clusterId === undefined) return;
    const source = map.getSource(MARKERS_SOURCE_ID);
    let handled = false;
    const zoomToCluster = (zoom) => {
      if (handled || !Number.isFinite(zoom)) return;
      handled = true;
      map.easeTo({
        center: feature.geometry.coordinates,
        zoom: Math.min(zoom + 0.25, map.getMaxZoom()),
        duration: 420
      });
    };
    const expansionZoom = source.getClusterExpansionZoom(clusterId, (error, zoom) => {
      if (error) return;
      zoomToCluster(zoom);
    });
    expansionZoom?.then?.(zoomToCluster).catch?.(() => {});
  });

  map.on("mouseenter", MARKERS_LAYER_ID, (event) => {
    map.getCanvas().style.cursor = "pointer";
    const feature = event.features?.[0];
    if (!feature) return;
    state.hoverPopup?.remove();
    state.hoverPopup = new mapboxgl.Popup({
      className: "forage-hover-popup",
      closeButton: false,
      closeOnClick: false,
      offset: 12
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(`<p class="popup-title">${escapeHTML(feature.properties.speciesName)}</p>`)
      .addTo(map);
  });

  map.on("mouseleave", MARKERS_LAYER_ID, () => {
    map.getCanvas().style.cursor = "";
    state.hoverPopup?.remove();
    state.hoverPopup = null;
  });

  map.on("click", MARKERS_LAYER_ID, (event) => {
    const feature = event.features?.[0];
    if (!feature) return;
    state.hoverPopup?.remove();
    state.hoverPopup = null;
    state.activePopup?.remove();
    state.activePopup = new mapboxgl.Popup({
      className: "forage-popup",
      closeButton: true,
      closeOnClick: true,
      maxWidth: "340px",
      offset: 12
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(getMarkerPopupHTML(feature.properties))
      .addTo(map);
    bindPopupActions(state.activePopup);
  });

}

function bindPopupActions(popup) {
  const element = popup.getElement();
  const saveButton = element?.querySelector("[data-save-location]");
  if (!saveButton) return;
  saveButton.addEventListener("click", () => {
    toggleSavedLocation(saveButton.dataset.saveLocation);
    updateSaveLocationButton(saveButton);
    render();
  });
}

function toggleSavedLocation(recordId) {
  if (!recordId) return;
  if (state.savedLocations.has(recordId)) {
    state.savedLocations.delete(recordId);
  } else {
    state.savedLocations.add(recordId);
  }
  saveSavedLocations();
}

function updateSaveLocationButton(button) {
  const saved = state.savedLocations.has(button.dataset.saveLocation);
  button.classList.toggle("is-saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.textContent = saved ? "Saved location" : "Save location";
}

function getMarkerPopupHTML(properties) {
  const sourceMarkup = properties.sourceUrl
    ? `<a class="popup-source" href="${escapeHTML(properties.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHTML(properties.sourceLabel)}</a>${properties.idDate ? ` · ${escapeHTML(properties.idDate)}` : ""}`
    : `<span class="popup-source">${escapeHTML(properties.sourceLabel)}${properties.idDate ? ` · ${escapeHTML(properties.idDate)}` : ""}</span>`;
  const accessSourceMarkup = properties.accessSourceUrl
    ? `<a class="popup-source" href="${escapeHTML(properties.accessSourceUrl)}" target="_blank" rel="noreferrer">${escapeHTML(properties.accessSourceLabel)}</a>`
    : escapeHTML(properties.accessSourceLabel || "Local rules not yet sourced");
  const accessStatusClass = escapeHTML(properties.accessStatus || "unknown");
  const ruleStatus = `<span class="access-status ${accessStatusClass}">${escapeHTML(properties.accessStatusLabel || "Unknown")}</span>`;
  const rulesText = [
    properties.accessLimit || "Unknown; confirm local rules before harvesting."
  ].filter(Boolean).map(escapeHTML).join(" · ");
  const usedParts = properties.usedParts
    ? `<dt>Used parts</dt><dd>${escapeHTML(properties.usedParts)}</dd>`
    : "";
  const safetyTags = String(properties.safetyTags || "")
    .split("|")
    .filter(Boolean);
  const safetyMarkup = safetyTags.length
    ? `<dt>Safety tags</dt><dd><span class="tag-list">${safetyTags.map((tag) => `<span class="safety-tag">${escapeHTML(tag)}</span>`).join("")}</span></dd>`
    : "";
  const harvestEthic = properties.harvestEthic
    ? `<dt>Harvest ethic</dt><dd><span class="ethic-tag">${escapeHTML(properties.harvestEthic)}</span></dd>`
    : "";
  const warning = properties.harvestStatus
    ? `<p class="popup-warning">${escapeHTML(properties.harvestStatus)}: ${escapeHTML(properties.harvestNote)}</p>`
    : "";
  const saved = isSavedLocation(properties.id);

  return `
    <p class="popup-title">${escapeHTML(properties.speciesName)}</p>
    <p class="popup-meta">${escapeHTML(properties.observedName)} · ${escapeHTML(properties.observedScientificName)}</p>
    <dl class="popup-grid">
      <dt>Place</dt><dd>${escapeHTML(properties.name)}</dd>
      <dt>ID source</dt><dd>${sourceMarkup}</dd>
      ${usedParts}
      ${safetyMarkup}
      ${harvestEthic}
      <dt>${escapeHTML(properties.rulesLabel || "Harvesting rules and limits")}</dt><dd>${ruleStatus} ${rulesText} · ${accessSourceMarkup}</dd>
      <dt>Season</dt><dd>${escapeHTML(properties.season)}</dd>
    </dl>
    ${warning}
    <button
      class="save-location-button ${saved ? "is-saved" : ""}"
      type="button"
      data-save-location="${escapeHTML(properties.id)}"
      aria-pressed="${String(saved)}"
    >${saved ? "Saved location" : "Save location"}</button>
  `;
}

function getPublicLandCollection() {
  return {
    type: "FeatureCollection",
    features: state.publicLandFeatures
  };
}

function updatePublicLandVisibility() {
  if (!state.mapReady) return;
  const visibility = state.publicLayerVisible ? "visible" : "none";
  [PUBLIC_LANDS_FILL_LAYER_ID, PUBLIC_LANDS_LINE_LAYER_ID].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}

function scheduleDataLoad() {
  window.clearTimeout(state.loadTimer);
  state.loadTimer = window.setTimeout(loadMapData, DATA_REFRESH_DELAY);
}

function scheduleINaturalistAggregateLoad() {
  window.clearTimeout(state.inatAggregateTimer);
  state.inatAggregateTimer = window.setTimeout(loadINaturalistAggregates, INATURALIST_AGGREGATE_DELAY);
}

async function loadINaturalistAggregates() {
  if (!state.mapReady || state.savedLocationsOnly) {
    state.inatAggregateItems = [];
    state.inatAggregateTaxonKey = "";
    setINaturalistAggregateReady(true);
    updateFallingFruitAggregates();
    return;
  }
  if (map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) {
    // Keep the last aggregate cells: they bridge the handoff while point
    // data loads after crossing the point-zoom threshold.
    setINaturalistAggregateReady(true);
    return;
  }

  const selectedSpecies = getSelectedCatalogItems()
    .filter((species) => isSpeciesAvailableOnSelectedDate(species));
  const taxonIds = getINaturalistTaxonIdString(selectedSpecies);
  if (!taxonIds) {
    state.inatAggregateItems = [];
    state.inatAggregateTaxonKey = "";
    setINaturalistAggregateReady(true);
    updateFallingFruitAggregates();
    return;
  }

  const requestId = state.activeINaturalistAggregateRequest + 1;
  state.activeINaturalistAggregateRequest = requestId;
  const taxonChanged = state.inatAggregateTaxonKey !== taxonIds;
  state.inatAggregateTaxonKey = taxonIds;
  if (taxonChanged) {
    state.inatAggregateItems = [];
    setINaturalistAggregateReady(false);
  }
  if (isAccessFilterActive()) {
    setINaturalistAggregateReady(false);
    await loadStatusRaster();
    if (requestId !== state.activeINaturalistAggregateRequest) return;
  }
  const tiles = getINaturalistAggregateTiles(map.getBounds(), map.getZoom());
  const missingTiles = tiles.filter((tile) => (
    !state.inatAggregateCache.has(getINaturalistAggregateCacheKey(taxonIds, tile))
  ));

  if (missingTiles.length) {
    // Gate repaints while tiles are in flight so partially covered viewports
    // never paint; the previous complete state stays up until the swap.
    setINaturalistAggregateReady(false);
    try {
      await mapWithConcurrency(missingTiles, 6, async (tile) => {
        if (requestId !== state.activeINaturalistAggregateRequest) return null;
        const items = await fetchINaturalistAggregateTileWithRetry(taxonIds, tile);
        touchCacheEntry(state.inatAggregateCache, getINaturalistAggregateCacheKey(taxonIds, tile), items);
        return items;
      });
    } catch {
      // Tiles that failed twice stay uncached and are retried on the next pass.
    }
    if (requestId !== state.activeINaturalistAggregateRequest) return;
  }

  // Swap the full tile set in at once so counts never paint partially.
  state.inatAggregateItems = getNonzeroAggregateItems(tiles.flatMap((tile) => {
    const cacheKey = getINaturalistAggregateCacheKey(taxonIds, tile);
    const items = state.inatAggregateCache.get(cacheKey);
    // Failed tiles stay uncached so the next pass retries them.
    if (items) touchCacheEntry(state.inatAggregateCache, cacheKey, items);
    return items || [];
  }));
  trimCache(state.inatAggregateCache, INATURALIST_AGGREGATE_CACHE_MAX);
  setINaturalistAggregateReady(true);
  updateFallingFruitAggregates();
}

function setINaturalistAggregateReady(ready) {
  state.inatAggregateReady = ready;
  state.aggregateGateStart = ready ? null : performance.now();
}

async function fetchINaturalistAggregateTileWithRetry(taxonIds, tile) {
  try {
    return await fetchINaturalistAggregateTile(taxonIds, tile);
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    return fetchINaturalistAggregateTile(taxonIds, tile);
  }
}

function getNonzeroAggregateItems(items) {
  return items.filter((item) => (
    getAggregateRecordCount(item, new Set(), new Set(), false) > 0
  ));
}

async function loadMapData() {
  const requestId = state.activeRequest + 1;
  state.activeRequest = requestId;
  const config = getActiveMapConfig();
  const loadBounds = state.mapReady ? map.getBounds() : null;
  const loadZoom = state.mapReady ? map.getZoom() : 0;
  const hadRecords = state.records.length > 0;
  if (!hadRecords) setDataStatus("Loading current map data...");

  const [inatResult, fallingFruitResult, npsOrchardResult] = await Promise.allSettled([
    loadINaturalist(),
    config.loadFallingFruit ? loadFallingFruit() : Promise.resolve([]),
    config.loadNpsOrchards ? loadNpsOrchards() : Promise.resolve([])
  ]);

  if (requestId !== state.activeRequest) return;

  if (inatResult.status === "fulfilled") {
    inatResult.value.forEach((record) => touchCacheEntry(state.inatRecordCache, record.id, record));
    trimCache(state.inatRecordCache, INATURALIST_RECORD_CACHE_MAX);
  }
  state.inatRecords = getCachedINaturalistRecordsInBounds();

  const fallingFruitRecords = fallingFruitResult.status === "fulfilled"
    ? fallingFruitResult.value
    : state.fallingFruitRecords || [];
  const npsOrchardRecords = npsOrchardResult.status === "fulfilled"
    ? npsOrchardResult.value
    : state.npsOrchardRecords || [];
  const nextRecords = [...state.inatRecords, ...fallingFruitRecords, ...npsOrchardRecords];

  state.records = nextRecords;
  renderMarkers();
  // Only a load that STARTED in the point band carries Falling Fruit data; a
  // load kicked off below zoom 8 that finishes after the user crosses up must
  // not end the bridge, or sparse iNaturalist-only clusters flash in.
  if (state.mapReady && loadBounds
    && loadZoom >= FALLING_FRUIT_MIN_LOAD_ZOOM
    && map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) {
    state.pointDataReady = true;
    state.loadedPointBounds = {
      west: loadBounds.getWest(),
      south: loadBounds.getSouth(),
      east: loadBounds.getEast(),
      north: loadBounds.getNorth()
    };
    updateLayerHandoff();
  }
  if (state.mapReady && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
    updateFallingFruitAggregates();
  }

  const failedSources = [
    inatResult.status === "rejected" ? "iNaturalist" : "",
    config.loadFallingFruit && fallingFruitResult.status === "rejected" ? "Falling Fruit" : "",
    config.loadNpsOrchards && npsOrchardResult.status === "rejected" ? "NPS orchards" : ""
  ].filter(Boolean);
  setDataStatus(failedSources.length
    ? `${state.records.length} records loaded; ${failedSources.join(", ")} unavailable`
    : `${state.records.length} current records loaded from ${config.sourceNames.join(", ")}`);
}

async function loadINaturalist() {
  const selectedSpecies = getSelectedCatalogItems()
    .filter((species) => isSpeciesAvailableOnSelectedDate(species));

  const taxonIds = getINaturalistTaxonIdString(selectedSpecies);

  if (!taxonIds) return [];

  const bounds = map.getBounds();
  const tiles = getINaturalistRequestBounds(bounds, map.getZoom());
  const results = await Promise.all(tiles.map((tile) => fetchINaturalistBounds(taxonIds, tile)));
  return dedupeRecords(results.flatMap((data) => data.results || []))
    .map(mapINaturalistObservation)
    .filter(Boolean);
}

async function fetchINaturalistBounds(taxonIds, bounds) {
  const params = new URLSearchParams({
    taxon_id: taxonIds,
    swlat: bounds.south.toFixed(5),
    swlng: bounds.west.toFixed(5),
    nelat: bounds.north.toFixed(5),
    nelng: bounds.east.toFixed(5),
    geo: "true",
    photos: "true",
    quality_grade: "research",
    place_id: INATURALIST_REGION_PLACE_IDS,
    per_page: String(bounds.perPage),
    order: "desc",
    order_by: "observed_on"
  });

  const response = await fetchWithTimeout(`https://api.inaturalist.org/v1/observations?${params.toString()}`);
  if (!response.ok) throw new Error(`iNaturalist returned ${response.status}`);
  return response.json();
}

function getINaturalistRequestBounds(bounds, zoom) {
  const baseBounds = {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    // At point zooms, fetch the API maximum so dense viewports stay as full
    // as the aggregate circles implied they would be.
    perPage: zoom >= FALLING_FRUIT_MIN_LOAD_ZOOM
      ? INATURALIST_MAX_PER_PAGE
      : INATURALIST_DEFAULT_PER_PAGE
  };
  if (zoom < 5.4 || zoom >= FALLING_FRUIT_MIN_LOAD_ZOOM) return [baseBounds];

  const columns = getBoundsLngSpan(bounds) > 9 ? 3 : 2;
  const rows = (bounds.getNorth() - bounds.getSouth()) > 5 ? 2 : 1;
  const lngStep = (baseBounds.east - baseBounds.west) / columns;
  const latStep = (baseBounds.north - baseBounds.south) / rows;
  const tiles = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      tiles.push({
        west: baseBounds.west + column * lngStep,
        south: baseBounds.south + row * latStep,
        east: column === columns - 1 ? baseBounds.east : baseBounds.west + (column + 1) * lngStep,
        north: row === rows - 1 ? baseBounds.north : baseBounds.south + (row + 1) * latStep,
        perPage: INATURALIST_TILE_PER_PAGE
      });
    }
  }
  return tiles;
}

function dedupeRecords(records) {
  return [...new Map(records.map((record) => [record.id, record])).values()];
}

function touchCacheEntry(cache, key, value) {
  // Delete-then-set keeps insertion order as recency order, so trimming from
  // the front evicts the least recently touched entries first.
  cache.delete(key);
  cache.set(key, value);
}

function trimCache(cache, maxEntries) {
  while (cache.size > maxEntries) {
    cache.delete(cache.keys().next().value);
  }
}

function getINaturalistTaxonIdString(speciesItems) {
  return [...new Set(speciesItems.flatMap(getTaxonIds))]
    .sort((a, b) => a - b)
    .join(",");
}

async function fetchINaturalistAggregateTile(taxonIds, tile) {
  // One UTFGrid request returns 64x64 aggregated cell counts for the whole tile,
  // replacing dozens of per-rectangle count queries and staying inside API limits.
  const params = new URLSearchParams({
    taxon_id: taxonIds,
    geo: "true",
    quality_grade: "research",
    place_id: INATURALIST_REGION_PLACE_IDS
  });

  const response = await fetchWithTimeout(`https://api.inaturalist.org/v1/grid/${tile.z}/${tile.x}/${tile.y}.grid.json?${params.toString()}`);
  if (!response.ok) throw new Error(`iNaturalist grid returned ${response.status}`);
  const data = await response.json();
  return getINaturalistGridItems(tile, data);
}

function getINaturalistGridItems(tile, gridData) {
  // Merge the 64x64 response cells into 32x32 buckets per tile. Display buckets
  // are never finer than tile/8, so this is visually lossless but caps the item
  // count the per-frame aggregation code has to walk.
  const bucketScale = (2 ** tile.z) * INATURALIST_GRID_CELL_BUCKETS;
  const buckets = new Map();
  Object.values(gridData?.data || {}).forEach((cell) => {
    const count = Number(cell?.cellCount || 0);
    const lng = Number(cell?.longitude);
    const lat = Number(cell?.latitude);
    if (!count || !Number.isFinite(lng) || !Number.isFinite(lat)) return;
    const key = `${Math.floor(lngToTileX(lng, bucketScale))}_${Math.floor(latToTileY(lat, bucketScale))}`;
    const bucket = buckets.get(key) || { count: 0, weightedLng: 0, weightedLat: 0 };
    bucket.count += count;
    bucket.weightedLng += lng * count;
    bucket.weightedLat += lat * count;
    buckets.set(key, bucket);
  });
  return [...buckets.entries()].map(([key, bucket]) => {
    const lng = bucket.weightedLng / bucket.count;
    const lat = bucket.weightedLat / bucket.count;
    return {
      id: `inat-grid-${tile.id}-${key}`,
      bbox: [lng, lat, lng, lat],
      countsBySpeciesId: { [INATURALIST_AGGREGATE_SPECIES_ID]: bucket.count },
      centroidsBySpeciesId: { [INATURALIST_AGGREGATE_SPECIES_ID]: [lng, lat, bucket.count] }
    };
  });
}

function getINaturalistAggregateTiles(bounds, zoom) {
  const area = getINaturalistAggregateBounds(bounds, zoom);
  let gridZoom = Math.min(INATURALIST_GRID_MAX_ZOOM, Math.max(INATURALIST_GRID_MIN_ZOOM, Math.floor(zoom)));
  let tiles = getGridTilesForArea(area, gridZoom);
  while (tiles.length > INATURALIST_GRID_MAX_TILES && gridZoom > INATURALIST_GRID_MIN_ZOOM) {
    gridZoom -= 1;
    tiles = getGridTilesForArea(area, gridZoom);
  }
  return tiles;
}

function getGridTilesForArea(area, zoomLevel) {
  const scale = 2 ** zoomLevel;
  const minX = Math.max(0, Math.floor(lngToTileX(area.west, scale)));
  const maxX = Math.min(scale - 1, Math.floor(lngToTileX(area.east, scale)));
  const minY = Math.max(0, Math.floor(latToTileY(area.north, scale)));
  const maxY = Math.min(scale - 1, Math.floor(latToTileY(area.south, scale)));
  const tiles = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tiles.push({ z: zoomLevel, x, y, id: `${zoomLevel}/${x}/${y}` });
    }
  }
  return tiles;
}

function lngToTileX(lng, scale) {
  return ((lng + 180) / 360) * scale;
}

function latToTileY(lat, scale) {
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const rad = (clamped * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * scale;
}

function getINaturalistAggregateBounds(bounds, zoom) {
  if (!shouldUseViewportAggregateBounds(zoom, bounds)) {
    return {
      west: REGION_MAX_BOUNDS[0][0],
      south: REGION_MAX_BOUNDS[0][1],
      east: REGION_MAX_BOUNDS[1][0],
      north: REGION_MAX_BOUNDS[1][1]
    };
  }
  const paddedBounds = getPaddedAggregateBounds(bounds, zoom);
  return {
    west: paddedBounds.getWest(),
    south: paddedBounds.getSouth(),
    east: paddedBounds.getEast(),
    north: paddedBounds.getNorth()
  };
}

function getINaturalistAggregateCacheKey(taxonIds, tile) {
  return `${taxonIds}|${tile.id}`;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

async function loadFallingFruit() {
  // Errors propagate so loadMapData can keep the previous records and report
  // the source as unavailable instead of silently dropping every point.
  if (state.mapReady && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
    state.fallingFruitRecords = [];
    return [];
  }

  const manifest = await getFallingFruitManifest();
  const bounds = map.getBounds();
  let chunks = getVisibleFallingFruitChunks(manifest, bounds);
  if (!chunks.length) {
    state.fallingFruitRecords = [];
    return [];
  }
  if (chunks.length > FALLING_FRUIT_MAX_VIEWPORT_CHUNKS) {
    // Never drop everything: load the chunks nearest the viewport center
    // up to the cap, so dense regions degrade gracefully at the edges.
    const center = bounds.getCenter();
    chunks = [...chunks]
      .sort((a, b) => getChunkCenterDistance(a, center) - getChunkCenterDistance(b, center))
      .slice(0, FALLING_FRUIT_MAX_VIEWPORT_CHUNKS);
  }

  await Promise.all(chunks.map(loadFallingFruitChunk));
  state.fallingFruitRecords = chunks
    .flatMap((chunk) => state.fallingFruitChunkCache.get(chunk.id) || [])
    .filter((record) => recordInBounds(record, bounds))
    .map(mapFallingFruitRecord)
    .filter(Boolean);
  return state.fallingFruitRecords;
}

async function getFallingFruitManifest() {
  if (state.fallingFruitManifest) return state.fallingFruitManifest;
  const response = await fetch(FALLING_FRUIT_MANIFEST_URL);
  if (!response.ok) throw new Error(`Falling Fruit manifest returned ${response.status}`);
  state.fallingFruitManifest = await response.json();
  return state.fallingFruitManifest;
}

function getVisibleFallingFruitChunks(manifest, bounds) {
  return (manifest.chunks || [])
    .filter((chunk) => bboxIntersectsBounds(chunk.bbox, bounds));
}

function getChunkCenterDistance(chunk, center) {
  const lng = (chunk.bbox[0] + chunk.bbox[2]) / 2 - center.lng;
  const lat = (chunk.bbox[1] + chunk.bbox[3]) / 2 - center.lat;
  return lng * lng + lat * lat;
}

async function loadFallingFruitChunk(chunk) {
  if (state.fallingFruitChunkCache.has(chunk.id)) {
    // Refresh recency so chunks for the current viewport are evicted last.
    touchCacheEntry(state.fallingFruitChunkCache, chunk.id, state.fallingFruitChunkCache.get(chunk.id));
    return;
  }
  // Overlapping loads share one in-flight fetch per chunk instead of
  // re-downloading the same file.
  const inFlight = state.fallingFruitChunkLoads.get(chunk.id);
  if (inFlight) return inFlight;
  const request = (async () => {
    const response = await fetch(chunk.path);
    if (!response.ok) throw new Error(`Falling Fruit chunk ${chunk.id} returned ${response.status}`);
    const rows = await response.json();
    const fields = state.fallingFruitManifest?.recordFields || [];
    state.fallingFruitChunkCache.set(chunk.id, rows.map((row) => expandFallingFruitRecord(row, fields)));
    trimCache(state.fallingFruitChunkCache, FALLING_FRUIT_CHUNK_CACHE_MAX);
  })();
  state.fallingFruitChunkLoads.set(chunk.id, request);
  try {
    await request;
  } finally {
    state.fallingFruitChunkLoads.delete(chunk.id);
  }
}

function expandFallingFruitRecord(row, fields) {
  if (!Array.isArray(row)) return row;
  return fields.reduce((record, field, index) => {
    record[field] = row[index];
    return record;
  }, {});
}

function bboxIntersectsBounds(bbox, bounds) {
  if (!bbox || bbox.length !== 4) return false;
  const [west, south, east, north] = bbox;
  return east >= bounds.getWest()
    && west <= bounds.getEast()
    && north >= bounds.getSouth()
    && south <= bounds.getNorth();
}

async function loadNpsOrchards() {
  // Errors propagate so loadMapData can keep the previous records and report
  // the source as unavailable.
  if (!state.npsOrchardData) {
    const response = await fetch("./data/nps-historic-orchards.json");
    if (!response.ok) throw new Error(`NPS orchards returned ${response.status}`);
    state.npsOrchardData = await response.json();
  }
  state.npsOrchardRecords = state.npsOrchardData
    .filter((record) => !state.mapReady || recordInBounds(record, map.getBounds()))
    .map(mapNpsOrchardRecord)
    .filter(Boolean);
  return state.npsOrchardRecords;
}

function schedulePublicLandLoad() {
  window.clearTimeout(state.publicLoadTimer);
  if (map.getZoom() < PUBLIC_LANDS_MIN_RENDER_ZOOM) {
    state.activePublicRequest += 1;
    state.publicLandFeatures = [];
    state.publicLayerLoadedKey = "";
    state.accessRuleCache.clear();
    updatePublicLandSource();
    return;
  }
  state.publicLoadTimer = window.setTimeout(loadPublicLands, PUBLIC_LANDS_REFRESH_DELAY);
}

async function loadPublicLands() {
  const bounds = map.getBounds();
  const boundsKey = [
    bounds.getSouth().toFixed(2),
    bounds.getWest().toFixed(2),
    bounds.getNorth().toFixed(2),
    bounds.getEast().toFixed(2)
  ].join(",");
  if (boundsKey === state.publicLayerLoadedKey) return;

  const requestId = state.activePublicRequest + 1;
  state.activePublicRequest = requestId;

  try {
    const features = [];
    for (let page = 0; page < PUBLIC_LANDS_MAX_PAGES; page += 1) {
      const params = new URLSearchParams({
        where: "Pub_Access IN ('OA','RA')",
        geometry: [
          bounds.getWest().toFixed(5),
          bounds.getSouth().toFixed(5),
          bounds.getEast().toFixed(5),
          bounds.getNorth().toFixed(5)
        ].join(","),
        geometryType: "esriGeometryEnvelope",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "OBJECTID,Unit_Nm,Pub_Access,MngNm_Desc,MngTp_Desc,DesTp_Desc,GIS_Acres",
        returnGeometry: "true",
        outSR: "4326",
        geometryPrecision: "5",
        f: "geojson",
        resultRecordCount: String(PUBLIC_LANDS_PAGE_SIZE),
        resultOffset: String(page * PUBLIC_LANDS_PAGE_SIZE)
      });
      const response = await fetchWithTimeout(`${PUBLIC_LANDS_URL}?${params.toString()}`);
      if (!response.ok) throw new Error(`PAD-US returned ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(`PAD-US query error: ${data.error.message || data.error.code || "unknown"}`);
      if (requestId !== state.activePublicRequest) return;
      features.push(...(data.features || []));
      if ((data.features || []).length < PUBLIC_LANDS_PAGE_SIZE) break;
    }
    features.forEach((feature) => {
      feature.__bbox = getFeatureBbox(feature);
    });
    state.publicLandFeatures = features;
    state.publicLayerLoadedKey = boundsKey;
    state.accessRuleCache.clear();
    updatePublicLandSource();
    renderMarkers();
  } catch (error) {
    if (requestId !== state.activePublicRequest) return;
    // Keep the last loaded polygons on a transient failure: blanking them
    // would silently downgrade every marker's access label to unsourced.
    // The loaded key stays unset, so the next moveend retries this viewport.
  }
}

function updatePublicLandSource() {
  if (state.mapReady && map.getSource(PUBLIC_LANDS_SOURCE_ID)) {
    map.getSource(PUBLIC_LANDS_SOURCE_ID).setData(getPublicLandCollection());
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      controller.abort();
      reject(new Error("request timed out"));
    }, LIVE_DATA_TIMEOUT);
  });
  try {
    return await Promise.race([fetch(url, {
      ...options,
      signal: controller.signal
    }), timeout]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function mapINaturalistObservation(observation) {
  const coordinates = observation.geojson?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;

  const species = getSpeciesForObservation(observation);
  if (!species) return null;

  return {
    id: `inat-${observation.id}`,
    speciesId: species.id,
    name: observation.place_guess || observation.taxon?.preferred_common_name || species.commonName,
    observedName: observation.taxon?.preferred_common_name || species.commonName,
    observedScientificName: observation.taxon?.name || species.scientificName,
    lat: coordinates[1],
    lng: coordinates[0],
    source: "inaturalist",
    note: `Observed ${observation.observed_on || "date unknown"}; iNaturalist ID ${observation.id}.`,
    confidence: observation.quality_grade || "community",
    idDate: observation.observed_on || "",
    sourceUrl: observation.uri || `https://www.inaturalist.org/observations/${observation.id}`,
    accessClass: "unknown",
    publicLand: false,
    accessNote: "Land access unknown from iNaturalist. Use the public lands layer and local rules before harvesting."
  };
}

function getSpeciesForObservation(observation) {
  const taxon = observation.taxon;
  if (!taxon?.id) return null;
  const ancestry = taxon.ancestry ? taxon.ancestry.split("/").map(Number) : [];
  const matchingSpecies = speciesCatalog.filter((item) => {
    if (taxon.iconic_taxon_name !== getExpectedIconicTaxon(item)) return false;
    return getTaxonIds(item).some((taxonId) => taxon.id === taxonId || ancestry.includes(taxonId));
  });
  if (!matchingSpecies.length) return null;

  return matchingSpecies
    .map((item) => ({
      item,
      exact: getTaxonIds(item).includes(taxon.id),
      score: getTaxonIds(item).reduce((best, taxonId) => {
        if (taxon.id === taxonId) return Math.max(best, 1000);
        const depth = ancestry.indexOf(taxonId);
        return depth >= 0 ? Math.max(best, depth) : best;
      }, -1)
    }))
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score)
    [0].item;
}

function mapFallingFruitRecord(record) {
  const speciesId = getImportedSpeciesId(record.speciesId);
  const species = speciesCatalogById.get(speciesId);
  if (!species || !record.lat || !record.lng) return null;
  return {
    id: `fallingfruit-${record.id}`,
    speciesId: species.id,
    name: record.name || sourceLabel("fallingfruit"),
    observedName: record.observedName || species.commonName,
    observedScientificName: record.observedScientificName || species.scientificName,
    lat: record.lat,
    lng: record.lng,
    source: "fallingfruit",
    note: record.note || "Imported Falling Fruit record.",
    confidence: record.confidence || "community",
    sourceUrl: record.sourceUrl || "https://fallingfruit.org/",
    idDate: formatFallingFruitDate(record.idDate),
    access: record.access || "",
    accessClass: record.accessClass || "unknown",
    publicLand: Boolean(record.publicLand),
    accessNote: record.accessNote || "Access unknown in Falling Fruit."
  };
}

function getImportedSpeciesId(speciesId) {
  if (state.activeMap === "ink") {
    return INK_FALLING_FRUIT_SPECIES_ALIASES[speciesId] || speciesId;
  }
  if (state.activeMap === "food" && speciesId === "prunus") return "sweet-cherry";
  return speciesId;
}

function mapNpsOrchardRecord(record) {
  const speciesId = getImportedSpeciesId(record.speciesId);
  const species = speciesCatalogById.get(speciesId);
  if (!species || !record.lat || !record.lng) return null;
  return {
    id: `nps-orchard-${record.id}`,
    speciesId: species.id,
    name: record.name || sourceLabel("nps-orchard"),
    observedName: record.observedName || "Historic orchard",
    observedScientificName: record.observedScientificName || species.scientificName,
    lat: record.lat,
    lng: record.lng,
    source: "nps-orchard",
    note: record.note || "Historic orchard or fruit tree documented by the National Park Service.",
    confidence: record.confidence || "cultural landscape record",
    sourceUrl: record.sourceUrl || "https://www.nps.gov/subjects/culturallandscapes/historic-orchards-in-national-parks.htm",
    idDate: record.idDate || "",
    access: record.access || "National Park Service",
    accessClass: record.accessClass || "restricted",
    publicLand: true,
    accessNote: record.accessNote || "NPS cultural landscape record. Do not take fruit or cuttings without park permission.",
    harvestStatus: record.harvestStatus || "Permission required"
  };
}

function getRecordAccessRule(record, species) {
  // Cached per record; cleared whenever public-land features or the map mode change.
  const cached = state.accessRuleCache.get(record.id);
  if (cached) return cached;
  const rule = computeRecordAccessRule(record, species);
  state.accessRuleCache.set(record.id, rule);
  return rule;
}

function computeRecordAccessRule(record, species) {
  if (record.source === "nps-orchard") {
    return {
      status: "permit-required",
      label: "Permit required",
      area: record.access || "National Park Service historic orchard",
      limit: "Historic orchard or cultural landscape record; do not take fruit or cuttings without park permission.",
      note: "NPS cultural landscape records can identify fruit trees, but they are not a harvest permission layer.",
      sourceLabel: "NPS historic orchards",
      sourceUrl: "https://www.nps.gov/subjects/culturallandscapes/historic-orchards-in-national-parks.htm"
    };
  }

  const siteRule = getSiteAccessRule(record);
  if (siteRule) return siteRule;

  const landRule = getBestPublicLandAccessRule(getContainingPublicLands(record), species, getRecordStateCode(record), record);
  if (landRule) return landRule;

  if (record.accessClass === "private") {
    return {
      status: "private",
      label: "Private",
      area: record.access || "Private or overhanging property",
      limit: "Secure explicit property-owner permission before collecting.",
      note: record.accessNote || "Falling Fruit marks this record as private or overhanging.",
      sourceLabel: "Falling Fruit access note",
      sourceUrl: record.sourceUrl || "https://fallingfruit.org/"
    };
  }

  if (record.publicLand && record.accessClass === "open") {
    return {
      status: "unknown",
      label: "Unknown",
      area: record.access || "Community-marked public access",
      limit: "Public access is reported, but harvest rules still need a local source.",
      note: record.accessNote || "Falling Fruit marks this record as public; confirm rules before harvesting.",
      sourceLabel: "Falling Fruit access note",
      sourceUrl: record.sourceUrl || "https://fallingfruit.org/"
    };
  }

  return {
    status: "private-unsourced",
    label: "Private / unsourced",
    area: "No sourced public access match",
    limit: "Secure permission from the landowner or managing institution before collecting.",
    note: record.accessNote || "This point is not matched to a sourced public access area.",
    sourceLabel: "Access not sourced",
    sourceUrl: ""
  };
}

function getSiteAccessRule(record) {
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const site = SITE_ACCESS_RULES.find((rule) => (
    lat >= rule.bounds.south
    && lat <= rule.bounds.north
    && lng >= rule.bounds.west
    && lng <= rule.bounds.east
  ));
  if (!site) return null;
  return site.rules[state.activeMap] || site.rules.default || null;
}

async function loadStateBoundaries() {
  // PAD-US's public-access layer does not carry usable state attribution
  // (ST_Name is "Not Applicable" on designation features), so state-specific
  // rules locate each record inside Census state polygons instead.
  try {
    const response = await fetch("./data/contiguous-us-states.json");
    if (!response.ok) return;
    state.stateBoundaries = (await response.json()).states || [];
    state.accessRuleCache.clear();
    renderMarkers();
  } catch {
    // State-specific rules degrade to generic fallbacks without boundaries.
  }
}

function getRecordStateCode(record) {
  if (!state.stateBoundaries) return "";
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const match = state.stateBoundaries.find((entry) => (
    lng >= entry.bbox[0] && lng <= entry.bbox[2]
    && lat >= entry.bbox[1] && lat <= entry.bbox[3]
    && pointInFeature([lng, lat], entry)
  ));
  return match ? match.id.toUpperCase() : "";
}

function getPublicLandAccessRule(properties, species, stateCode, record) {
  const text = getPublicLandText(properties);
  const area = getPublicLandName(properties);

  if (text.includes("botanic") || text.includes("arboretum")) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Botanical gardens and arboreta protect their living collections: do not collect plants or plant parts, including flowers, leaves, seeds, fruits, or cuttings.",
      note: "Curated plant collections are research and conservation assets; collection is uniformly prohibited (e.g., the U.S. National Arboretum's rules) unless the institution explicitly authorizes it.",
      sourceLabel: "U.S. National Arboretum rules (representative)",
      sourceUrl: ACCESS_RULE_SOURCES.botanicalGardens
    };
  }

  if (isNycLocalPark(text, stateCode, record)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Removing plants, flowers, or other vegetation from New York City parks is prohibited without the Commissioner's permission.",
      note: "PAD-US identifies this as local city parkland inside New York City; applying the NYC Parks vegetation rule.",
      sourceLabel: "NYC Parks rules 1-04",
      sourceUrl: ACCESS_RULE_SOURCES.nycParks
    };
  }

  if (state.activeMap !== "food" && isNationalParkServiceLand(text)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Collection is not authorized here unless the park has issued a specific exception or permit.",
      note: "The encoded NPS exceptions are food-focused and should not be treated as permission to collect non-food plant materials.",
      sourceLabel: "36 CFR 2.1",
      sourceUrl: ACCESS_RULE_SOURCES.npsGeneral
    };
  }

  if (text.includes("shenandoah national park")) {
    if (species.shenandoahAllowed === false) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: `${species.commonName} are not listed in the encoded Shenandoah compendium allowance; do not harvest without written park authorization.`,
        note: "Shenandoah allows hand-gathering only for the foods specifically authorized in its superintendent's compendium.",
        sourceLabel: "Shenandoah compendium",
        sourceUrl: ACCESS_RULE_SOURCES.shenandoah
      };
    }

    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: getShenandoahLimit(species),
      note: "Shenandoah's compendium allows hand-gathering listed fruits, nuts, berries, and morels for personal use within posted daily limits.",
      sourceLabel: "Shenandoah compendium",
      sourceUrl: ACCESS_RULE_SOURCES.shenandoah
    };
  }

  if (text.includes("blue ridge parkway")) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: getBlueRidgeLimit(species),
      note: "Blue Ridge Parkway's compendium allows limited personal collection of listed fruits, nuts, berries, and edible fungi.",
      sourceLabel: "Blue Ridge Parkway compendium",
      sourceUrl: ACCESS_RULE_SOURCES.blueRidge
    };
  }

  if (text.includes("prince william forest park")) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: getPrinceWilliamLimit(species),
      note: "Prince William Forest Park allows limited personal collection of listed fruits, nuts, berries, and edible fungi.",
      sourceLabel: "Prince William Forest compendium",
      sourceUrl: ACCESS_RULE_SOURCES.princeWilliam
    };
  }

  if (text.includes("manassas national battlefield")) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: getManassasLimit(species),
      note: "Manassas National Battlefield Park allows personal collection of listed fruits, nuts, berries, and morels within its compendium limits.",
      sourceLabel: "Manassas compendium",
      sourceUrl: ACCESS_RULE_SOURCES.manassas
    };
  }

  const compendiumRule = getNpsCompendiumRule(text, area, species);
  if (compendiumRule) return compendiumRule;

  if (isNationalParkServiceLand(text)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "NPS plant removal is prohibited unless that park's superintendent has specifically authorized an exception.",
      note: "This NPS unit does not match one of the personal-use compendium allowances currently encoded in the app.",
      sourceLabel: "36 CFR 2.1",
      sourceUrl: ACCESS_RULE_SOURCES.npsGeneral
    };
  }

  if (isUsfsLand(text)) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Small amounts for personal use are generally allowed without a permit; larger quantities or commercial collection require a forest-products permit.",
      note: "Most national forests allow incidental personal-use gathering, but rules vary by forest — check the local ranger district for permit requirements and closures.",
      sourceLabel: "USFS forest products permits",
      sourceUrl: ACCESS_RULE_SOURCES.usfs
    };
  }

  if (isBlmLand(text)) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Small amounts of berries, nuts, mushrooms, plants, seeds, flowers, and cones may be collected for personal use in most areas without a permit.",
      note: "BLM allows reasonable personal-use collection of renewable plant materials; local restrictions can apply, so check the managing field office.",
      sourceLabel: "BLM forest product permits",
      sourceUrl: ACCESS_RULE_SOURCES.blm
    };
  }

  if (isWildlifeRefugeLand(text)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Plant gathering on national wildlife refuges is prohibited by default; some refuges authorize berry or mushroom picking with posted limits.",
      note: "50 CFR Part 27 prohibits plant disturbance unless the refuge specifically authorizes it — check the refuge's own rules page before collecting anything.",
      sourceLabel: "50 CFR Part 27",
      sourceUrl: ACCESS_RULE_SOURCES.usfws
    };
  }

  if (isArmyCorpsLand(text)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Removal or injury of vegetation on Corps project lands is prohibited without written permission of the District Commander.",
      note: "36 CFR Part 327 protects vegetation on Army Corps water-project lands; only dead firewood gathering in designated areas is generally allowed.",
      sourceLabel: "36 CFR Part 327",
      sourceUrl: ACCESS_RULE_SOURCES.usace
    };
  }

  const stateRule = getStateSystemRule(stateCode, text, area);
  if (stateRule) return stateRule;

  if (stateCode === "VA" && isVirginiaWma(text)) {
    if (state.activeMap !== "food") {
      return {
        status: "unknown",
        label: "Unknown",
        area,
        limit: "Rules for this plant use are not currently sourced; confirm access requirements and posted site rules before collecting.",
        note: "Confirm DWR access requirements and posted site rules before collecting plant material.",
        sourceLabel: "Virginia WMA rules",
        sourceUrl: ACCESS_RULE_SOURCES.virginiaWma
      };
    }

    return {
      status: "permit-required",
      label: "Permit required",
      area,
      limit: "Berries, mushrooms, and other fruits may be gathered for personal use, but adult visitors need a hunting, fishing, trapping, boating registration, or WMA access permit.",
      note: "Virginia DWR WMA rules allow personal-use gathering of berries, mushrooms, and other fruits while requiring access authorization for many visitors.",
      sourceLabel: "Virginia WMA rules",
      sourceUrl: ACCESS_RULE_SOURCES.virginiaWma
    };
  }

  if (stateCode === "VA" && isVirginiaStateForest(text)) {
    if (state.activeMap !== "food") {
      return {
        status: "unknown",
        label: "Unknown",
        area,
        limit: "Rules for this plant use are not currently sourced; confirm posted rules before collecting.",
        note: "Do not assume the edible-collection exception applies to leaves, roots, bark, wood, flowers, or galls.",
        sourceLabel: "Virginia state forest regulations",
        sourceUrl: ACCESS_RULE_SOURCES.virginiaStateForests
      };
    }

    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Edible fruits, berries, fungi, and nuts may be collected for personal individual use only.",
      note: "Virginia state forest regulations prohibit collecting plants generally, with an exception for edible fruits, berries, fungi, and nuts for personal individual use.",
      sourceLabel: "Virginia state forest regulations",
      sourceUrl: ACCESS_RULE_SOURCES.virginiaStateForests
    };
  }

  if (stateCode === "VA" && isVirginiaStateParkOrDcrLand(text)) {
    if (state.activeMap !== "food") {
      return {
        status: "unknown",
        label: "Unknown",
        area,
        limit: "Rules for this plant use are not currently sourced; confirm posted rules before collecting.",
        note: "Do not assume the edible-collection exception applies to leaves, roots, bark, wood, flowers, or galls.",
        sourceLabel: "Virginia state park regulations",
        sourceUrl: ACCESS_RULE_SOURCES.virginiaParks
      };
    }

    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Edible fruits, berries, fungi, and nuts may be collected for personal individual use only.",
      note: "Virginia park regulations prohibit removing plants generally, with an exception for edible fruits, berries, fungi, and nuts for personal individual use.",
      sourceLabel: "Virginia state park regulations",
      sourceUrl: ACCESS_RULE_SOURCES.virginiaParks
    };
  }

  if (text.includes("charlottesville")) {
    return {
      status: "unknown",
      label: "Unknown",
      area,
      limit: "Charlottesville public access is mapped, but a specific city foraging rule has not been confirmed.",
      note: "Treat municipal park records as access hints only until posted park rules or city code can be checked.",
      sourceLabel: "Charlottesville Parks & Trails",
      sourceUrl: ACCESS_RULE_SOURCES.charlottesville
    };
  }

  if (text.includes("albemarle")) {
    return {
      status: "unknown",
      label: "Unknown",
      area,
      limit: "Albemarle public access is mapped, but a specific county foraging rule has not been confirmed.",
      note: "Treat county park records as access hints only until posted park rules or county code can be checked.",
      sourceLabel: "Albemarle Parks & Recreation",
      sourceUrl: ACCESS_RULE_SOURCES.albemarle
    };
  }

  return {
    status: properties.Pub_Access === "RA" ? "permit-required" : "unknown",
    label: properties.Pub_Access === "RA" ? "Permit required" : "Unknown",
    area,
    limit: properties.Pub_Access === "RA"
      ? "PAD-US marks this area as restricted public access; check the managing agency before harvesting."
      : "PAD-US marks this area as open public access, but harvest rules are not yet sourced.",
    note: "Public access does not always include permission to collect plants or fungi.",
    sourceLabel: "USGS PAD-US public access",
    sourceUrl: "https://www.usgs.gov/programs/gap-analysis-project/science/protected-areas"
  };
}

function getNpsCompendiumRule(text, area, species) {
  const entry = NPS_GATHERING_RULES.find((rule) => text.includes(rule.match));
  if (!entry) return null;
  if (species.category === "mushroom" && !entry.mushroomsAllowed) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: entry.mushroomNote || "Mushrooms are not designated for gathering in this park's compendium.",
      note: entry.note,
      sourceLabel: entry.sourceLabel,
      sourceUrl: entry.sourceUrl
    };
  }
  return {
    status: "allowed",
    label: "Allowed",
    area,
    limit: entry.limit,
    note: entry.note,
    sourceLabel: entry.sourceLabel,
    sourceUrl: entry.sourceUrl
  };
}

function getStateSystemRule(stateCode, text, area) {
  const foodMode = state.activeMap === "food";

  if (text.includes("new york city") || text.includes("city of new york")) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Removing plants, flowers, or other vegetation from New York City parks is prohibited without the Commissioner's permission.",
      note: "NYC Parks rule 1-04 protects all park vegetation; foraging is not permitted in city parks.",
      sourceLabel: "NYC Parks rules 1-04",
      sourceUrl: ACCESS_RULE_SOURCES.nycParks
    };
  }

  if (stateCode === "NY") {
    if (text.includes("state forest") || text.includes("forest preserve") || text.includes("environmental conservation")) {
      if (!foodMode) return null;
      return {
        status: "allowed",
        label: "Allowed",
        area,
        limit: "Plants and fungi may be gathered for personal consumption on DEC state forests and Forest Preserve lands; commercial collection requires a permit.",
        note: "New York DEC land rules make a personal-consumption exception to the plant-protection rule. Harvest lightly and avoid protected species.",
        sourceLabel: "NYSDEC state forest rules",
        sourceUrl: ACCESS_RULE_SOURCES.newYorkDec
      };
    }
    if (text.includes("state park")) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: "Foraging is prohibited in New York state parks.",
        note: "The personal-consumption exception applies to DEC lands, not the OPRHP state park system.",
        sourceLabel: "NYSDEC state land rules",
        sourceUrl: ACCESS_RULE_SOURCES.newYorkDec
      };
    }
  }

  if (stateCode === "PA"
    && (text.includes("state forest") || text.includes("state park") || text.includes("conservation and natural resources"))) {
    if (!foodMode) return null;
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Edible fruits, nuts, berries, and fungi may be gathered in reasonable amounts for personal or family consumption; protected species (including ginseng) excluded.",
      note: "Pennsylvania DCNR allows personal-use gathering of edible wild plants in state parks and forests; commercial collection is prohibited.",
      sourceLabel: "PA DCNR rules",
      sourceUrl: ACCESS_RULE_SOURCES.pennsylvaniaDcnr
    };
  }

  if (stateCode === "WA") {
    if (text.includes("natural area preserve")) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: "No harvest of edible plants or fruiting bodies is allowed within Washington natural area preserves.",
        note: "WAC 352-28-030 excludes natural area preserves from the state-park harvest allowance.",
        sourceLabel: "WAC 352-28-030",
        sourceUrl: ACCESS_RULE_SOURCES.washingtonParks
      };
    }
    if (text.includes("state park")) {
      if (!foodMode) return null;
      return {
        status: "allowed",
        label: "Allowed",
        area,
        limit: "Edible plants, mushrooms, berries, and nuts: up to 2 gallons per person per day unless otherwise posted.",
        note: "Washington state parks allow recreational harvest of edibles under WAC 352-28-030; posted park rules can restrict it.",
        sourceLabel: "WAC 352-28-030",
        sourceUrl: ACCESS_RULE_SOURCES.washingtonParks
      };
    }
  }

  if (stateCode === "CA" && text.includes("state park")) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Picking or removing any plant material in California state parks is prohibited unless gathering is specifically authorized and posted for that unit.",
      note: "California's park regulations (14 CCR 4306) protect all vegetation; a few units post berry or mushroom exceptions at headquarters.",
      sourceLabel: "California state park regulations",
      sourceUrl: ACCESS_RULE_SOURCES.californiaParks
    };
  }

  if (stateCode === "CO" && (text.includes("state park") || text.includes("colorado parks and wildlife"))) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Removing, destroying, mutilating, modifying, or defacing any plant or vegetation is prohibited on Colorado Parks and Wildlife lands (firewood from designated areas and noxious weeds excepted).",
      note: "Colorado's park regulations (2 CCR 405-1 #100) contain no edible-plant exception; foraging is prohibited in Colorado state parks unless posted otherwise.",
      sourceLabel: "Colorado parks regulations (2 CCR 405-1)",
      sourceUrl: ACCESS_RULE_SOURCES.coloradoParks
    };
  }

  if (stateCode === "OR" && (text.includes("state park") || text.includes("state recreation") || text.includes("state natural area") || text.includes("state scenic"))) {
    if (!foodMode) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: "Picking, cutting, trimming, uprooting, or removing living vegetation — including roots, tubers, flowers, and stems — requires written park permission outside the edible-gathering exception.",
        note: "Oregon's rule (OAR 736-010-0055) allows gathering edibles and small non-living souvenirs, but collection of living plant material for craft or medicine is not authorized. Federally recognized Oregon tribal members retain customary-practice rights.",
        sourceLabel: "OAR 736-010-0055",
        sourceUrl: ACCESS_RULE_SOURCES.oregonParks
      };
    }
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Berries, fruits, mushrooms, and similar edibles: up to 5 gallons per person per day for personal consumption, unless otherwise posted. Uprooting plants or collecting roots, tubers, flowers, and stems is prohibited.",
      note: "Oregon state parks allow personal-use gathering of edibles under OAR 736-010-0055(5); check postings, and leave the plant itself unharmed.",
      sourceLabel: "OAR 736-010-0055",
      sourceUrl: ACCESS_RULE_SOURCES.oregonParks
    };
  }

  if (stateCode === "MD") {
    if (text.includes("state park")) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: "Removing, disturbing, damaging, or destroying any plant, rock, mineral, or animal in a Maryland state park is prohibited; the Maryland Park Service may issue permits.",
        note: "Maryland's park rule (COMAR 08.07.06.13) protects all plants with no edible exception; berry picking has been cited under this rule.",
        sourceLabel: "COMAR 08.07.06.13",
        sourceUrl: ACCESS_RULE_SOURCES.marylandParks
      };
    }
    if (text.includes("state forest")) {
      return {
        status: "permit-required",
        label: "Permit required",
        area,
        limit: "Plants may not be removed from Maryland state forests without authorization; forest products may be taken after obtaining a permit from the Maryland Forest Service.",
        note: "COMAR 08.07.01.13 protects all plants in state forests; timber, firewood, and other forest products require a Service permit.",
        sourceLabel: "COMAR 08.07.01.13",
        sourceUrl: ACCESS_RULE_SOURCES.marylandForests
      };
    }
  }

  if (stateCode === "NC" && (text.includes("state park") || text.includes("state recreation area") || text.includes("state natural area"))) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Removing, possessing, or disturbing any plant, fungus, or mineral in North Carolina state park areas is prohibited; collection is limited to research-permit holders from scientific institutions.",
      note: "North Carolina's park rule (07 NCAC 13B .0201) has no personal-use foraging exception; research permits for personal or commercial purposes are expressly prohibited.",
      sourceLabel: "07 NCAC 13B .0201",
      sourceUrl: ACCESS_RULE_SOURCES.northCarolinaParks
    };
  }

  if (stateCode === "MI"
    && (text.includes("state park") || text.includes("state recreation") || text.includes("state forest") || text.includes("state game") || text.includes("wildlife area"))) {
    if (!foodMode) return null;
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Mushrooms, nuts, berries, and tree fruits may be harvested from Michigan state-managed lands for personal use (state land rules cap personal take at about 25 pounds); not for resale.",
      note: "Michigan DNR allows wild-food foraging on state land, but not plants that are destroyed or damaged by harvest — no fiddleheads, ramps, ginseng, whole plants, or tree tapping.",
      sourceLabel: "Michigan DNR foraging guidance",
      sourceUrl: ACCESS_RULE_SOURCES.michiganDnr
    };
  }

  if (stateCode === "MN" && (text.includes("state park") || text.includes("forest recreation area"))) {
    if (!foodMode) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: "Collecting or possessing naturally occurring plants in a fresh state is prohibited in Minnesota state parks; only edible fruit and mushrooms are excepted, for personal use.",
        note: "Minnesota Rules 6100.0900 protects park vegetation; the edible exception does not extend to craft or medicinal plant material.",
        sourceLabel: "Minnesota Rules 6100.0900",
        sourceUrl: ACCESS_RULE_SOURCES.minnesotaParks
      };
    }
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Edible fruit and mushrooms may be harvested for personal, noncommercial use in Minnesota state parks and forest recreation areas; nuts and other plant parts are not included in the exception.",
      note: "Minnesota Rules 6100.0900 excepts edible fruit and mushrooms from the park plant-protection rule; commercial harvest requires the commissioner's written permission.",
      sourceLabel: "Minnesota Rules 6100.0900",
      sourceUrl: ACCESS_RULE_SOURCES.minnesotaParks
    };
  }

  return null;
}

function getBestPublicLandAccessRule(features, species, stateCode, record) {
  if (!features.length) return null;
  const candidates = features.map((feature) => ({
    rule: getPublicLandAccessRule(feature.properties || {}, species, stateCode, record),
    text: getPublicLandText(feature.properties || {}),
    acres: Number(feature.properties?.GIS_Acres) || 0
  }));
  const shenandoahNationalPark = candidates.find((candidate) => (
    candidate.text.includes("shenandoah national park")
  ));
  if (shenandoahNationalPark) return shenandoahNationalPark.rule;

  const specificProhibition = candidates
    .filter((candidate) => candidate.rule.status === "prohibited" && candidate.rule.sourceLabel !== "36 CFR 2.1")
    .sort((a, b) => a.acres - b.acres)[0];
  if (specificProhibition) return specificProhibition.rule;

  const largerLandRules = candidates
    .filter((candidate) => !(candidate.rule.status === "prohibited" && candidate.rule.sourceLabel === "36 CFR 2.1"))
    .sort((a, b) => b.acres - a.acres);
  if (largerLandRules.length) return largerLandRules[0].rule;

  return candidates.sort((a, b) => b.acres - a.acres)[0].rule;
}

function getPublicLandText(properties) {
  return [
    properties.Unit_Nm,
    properties.MngNm_Desc,
    properties.MngTp_Desc,
    properties.DesTp_Desc
  ].filter(Boolean).join(" ").toLowerCase();
}

function getPublicLandName(properties) {
  return properties.Unit_Nm || properties.MngNm_Desc || "PAD-US public land";
}

function isNationalParkServiceLand(text) {
  // Conservative by design: unmatched NPS-style units default to the
  // 36 CFR 2.1 prohibition rather than a more permissive agency rule.
  return text.includes("national park service")
    || text.includes("national park")
    || text.includes("national battlefield")
    || text.includes("national historical park")
    || text.includes("national historic site")
    || text.includes("national military park")
    || text.includes("national monument")
    || text.includes("national seashore")
    || text.includes("national lakeshore")
    || text.includes("national preserve")
    || text.includes("memorial parkway");
}

function isNycLocalPark(text, stateCode, record) {
  if (stateCode !== "NY" || !isRecordInNycArea(record)) return false;
  const localPark = text.includes("local park")
    || text.includes("local recreation area")
    || text.includes("local other or unknown");
  return text.includes("city land")
    && text.includes("local government")
    && localPark;
}

function isRecordInNycArea(record) {
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= 40.47
    && lat <= 40.92
    && lng >= -74.26
    && lng <= -73.7;
}

function isUsfsLand(text) {
  return text.includes("forest service")
    || text.includes("national forest")
    || text.includes("national grassland");
}

function isBlmLand(text) {
  return text.includes("bureau of land management")
    || text.includes("blm");
}

function isWildlifeRefugeLand(text) {
  return text.includes("national wildlife refuge")
    || text.includes("fish and wildlife service")
    || text.includes("waterfowl production area");
}

function isArmyCorpsLand(text) {
  return text.includes("army corps")
    || text.includes("corps of engineers");
}

function isVirginiaWma(text) {
  return text.includes("wildlife management area")
    || text.includes("department of wildlife resources")
    || text.includes("virginia department of game")
    || text.includes("virginia dwr");
}

function isVirginiaStateForest(text) {
  return text.includes("state forest")
    || text.includes("virginia department of forestry");
}

function isVirginiaStateParkOrDcrLand(text) {
  return text.includes("state park")
    || text.includes("virginia department of conservation")
    || text.includes("department of conservation and recreation")
    || text.includes("natural area preserve");
}

function getShenandoahLimit(species) {
  if (["apple", "pear", "peach"].includes(species.id)) {
    return `${species.commonName}: 1 bushel per person per day.`;
  }
  return `${species.commonName}: 1 gallon per person per day.`;
}

function getBlueRidgeLimit(species) {
  if (species.category === "nut" || ["apple", "pear", "peach", "persimmon"].includes(species.id)) {
    return `${species.commonName}: 1 bushel per person per day.`;
  }
  return `${species.commonName}: 1 gallon per person per day.`;
}

function getPrinceWilliamLimit(species) {
  if (species.category === "mushroom") return "Edible fungi: 1 quart in aggregate per person per day.";
  if (species.category === "nut") return `${species.commonName}: 1 quart per species per person per day.`;
  return `${species.commonName}: 1 pint per species per person per day.`;
}

function getManassasLimit(species) {
  if (species.category === "mushroom") return `${species.commonName}: 1 gallon per person per day.`;
  if (species.category === "nut") return `${species.commonName}: 1 bushel per species per person per day.`;
  if (species.category === "berry") return `${species.commonName}: 1/2 gallon per species per person per day.`;
  return `${species.commonName}: 2 bushels per species per person per day.`;
}

function getContainingPublicLands(record) {
  if (!state.publicLandFeatures.length) return [];
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  return state.publicLandFeatures.filter((feature) => {
    // Cheap bbox rejection first; full point-in-polygon only for candidates.
    const box = feature.__bbox;
    if (box && (lng < box[0] || lng > box[2] || lat < box[1] || lat > box[3])) return false;
    return pointInFeature([lng, lat], feature);
  });
}

function getFeatureBbox(feature) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  const scanPolygon = (rings) => rings.forEach((ring) => ring.forEach(([lng, lat]) => {
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat < south) south = lat;
    if (lat > north) north = lat;
  }));
  const geometry = feature.geometry;
  if (geometry?.type === "Polygon") scanPolygon(geometry.coordinates);
  else if (geometry?.type === "MultiPolygon") geometry.coordinates.forEach(scanPolygon);
  return [west, south, east, north];
}

function pointInFeature(point, feature) {
  const geometry = feature.geometry;
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }
  return false;
}

function pointInPolygon(point, polygon) {
  if (!polygon?.length || !pointInRing(point, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y))
      && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function setDataStatus(message) {
  dataStatus.textContent = message;
}

initControls();
render();
map.on("load", () => {
  state.mapReady = true;
  setINaturalistAggregateReady(false);
  initMapLayers();
  loadStateBoundaries();
  render();
  loadMapData();
  schedulePublicLandLoad();
});

map.on("error", (event) => {
  const message = event?.error?.message || "";
  if (message.includes("401") || message.includes("403")) {
    setDataStatus("Mapbox tiles are blocked for this origin. Add this URL to the token restrictions.");
  }
});
