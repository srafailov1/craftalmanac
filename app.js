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
// When a permission filter is on, cell statuses must resolve against the
// 0.05-degree raster, so tiles are fetched at this finer grid zoom even for
// the whole-region overview (~84 tiles, fetched once per taxon set, cached).
const INATURALIST_GRID_STATUS_ZOOM = 6;
const INATURALIST_GRID_MAX_STATUS_TILES = 96;
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
const MARKER_HALO_LAYER_ID = "forage-record-halo";
const MARKER_CLUSTERS_LAYER_ID = "forage-record-clusters";
const MARKER_CLUSTER_COUNT_LAYER_ID = "forage-record-cluster-count";
const MARKER_CLUSTER_MAX_ZOOM = 12;
const MARKER_CLUSTER_RADIUS = 40;
// Fraction of the loaded extent the viewport may drift past before the points
// are treated as "uncovered" and handed back to the aggregate while a fresh
// load runs. A non-zero margin keeps points on screen during ordinary panning
// (the old zero-tolerance check blanked everything on the slightest drift).
const MARKER_POINT_COVERAGE_TOLERANCE = 0.5;
const FALLING_FRUIT_AGGREGATE_SOURCE_ID = "falling-fruit-aggregates";
const FALLING_FRUIT_AGGREGATE_LAYER_ID = "falling-fruit-aggregate-circles";
const FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID = "falling-fruit-aggregate-counts";
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
const MAPBOX_STYLE = "mapbox://styles/mapbox/standard";
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
  alaskaParks: "https://www.law.cornell.edu/regulations/alaska/11-AAC-12.170",
  hawaiiParks: "https://dlnr.hawaii.gov/ecosystems/files/2013/09/HRS13-146_State-Parks.pdf",
  indianaDnr: "https://www.law.cornell.edu/regulations/indiana/312-IAC-8-2-10",
  iowaDnr: "https://www.legis.iowa.gov/docs/iac/chapter/571.54.pdf",
  kansasParks: "https://www.law.cornell.edu/regulations/kansas/K-A-R-115-8-20",
  missouriParks: "https://www.sos.mo.gov/cmsimages/adrules/csr/current/10csr/10c90-2.pdf",
  ohioParks: "https://codes.ohio.gov/ohio-administrative-code/rule-1501:46-3-10",
  oklahomaParks: "https://www.oklegislature.gov/cf_pdf/2025-26%20ENR/SB/SB447%20ENR.PDF",
  tennesseeParks: "https://publications.tnsosfiles.com/rules/0400/0400-02/0400-02-02.20210422.pdf",
  vermontParks: "https://www.law.cornell.edu/regulations/vermont/12-009-Code-Vt-R-12-020-009-X",
  wisconsinDnr: "https://docs.legis.wisconsin.gov/code/admin_code/nr/001/45/04",
  georgiaParks: "https://rules.sos.ga.gov/gac/391-5-1",
  nebraskaParks: "https://www.law.cornell.edu/regulations/nebraska/163-Neb-Admin-Code-ch-5-SS-001",
  wyomingParks: "https://www.law.cornell.edu/regulations/wyoming/024-1-Wyo-Code-R-SS-1-15",
  newMexicoParks: "https://www.emnrd.nm.gov/wp-content/uploads/sites/7/19.5.2_integrated_appvdDBpublished6252019.pdf",
  southCarolinaParks: "https://www.scstatehouse.gov/code/t51c003.php",
  westVirginiaParks: "https://www.law.cornell.edu/regulations/west-virginia/W-Va-C-S-R-SS-58-31-2",
  connecticutParks: "https://eregulations.ct.gov/eRegsPortal/Browse/getDocument?guid=%7B3C64A5F8-B731-4393-A6AB-EA64B91A3F63%7D",
  alabamaParks: "https://www.outdooralabama.com/sites/default/files/Enforcement/STATE%20PARKS%20DIVISION%20REG%20FOR%20LE%20PAGE.pdf",
  arizonaParks: "https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R12-8-103",
  arkansasParks: "https://www.arkansas.com/state-parks/about/rules-regulations",
  delawareParks: "https://www.law.cornell.edu/regulations/delaware/7-Del-Admin-Code-SS-9201-17.0",
  floridaParks: "http://flrules.elaws.us/fac/62d-2.013/",
  idahoParks: "https://adminrules.idaho.gov/rules/current/26/260120.pdf",
  kentuckyParks: "https://parks.ky.gov/parks/regulations",
  louisianaParks: "https://www.lastateparks.com/sites/default/files/2023-09/OSP%20Title25v01-11.pdf",
  maineParks: "https://www.law.cornell.edu/regulations/maine/C-M-R-01-670-ch-1",
  massachusettsParks: "https://www.law.cornell.edu/regulations/massachusetts/302-CMR-12-04",
  mississippiParks: "https://www.law.cornell.edu/regulations/mississippi/40-Miss-Code-R-SS-6-1-2",
  montanaParks: "https://fwp.mt.gov/binaries/content/assets/fwp/commission/2023/dec/public-use-rules-arm/final_12-603adp_11.16.2023.pdf",
  nevadaParks: "https://www.leg.state.nv.us/nrs/nrs-407.html",
  newHampshireParks: "https://www.nhstateparks.org/getmedia/78550992-2128-4844-97e3-ab8fde083a17/Res-7300-Parks-and-Rec-Adopted-Rule-eff-030114.aspx",
  newJerseyParks: "https://dep.nj.gov/wp-content/uploads/rules/rules/njac7_2.pdf",
  northDakotaParks: "https://ndlegis.gov/information/acdata/pdf/58-02-08.pdf",
  rhodeIslandParks: "https://rules.sos.ri.gov/regulations/Part/250-100-00-7",
  southDakotaParks: "https://sdlegislature.gov/Rules/Administrative/41:03:01",
  texasParks: "https://www.law.cornell.edu/regulations/texas/31-Tex-Admin-Code-SS-59-134",
  utahParks: "https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R651-620-2",
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
  illinoisDnr: "https://www.ilga.gov/agencies/JCAR/EntirePart?titlepart=01700110",
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
  },
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
// Access-status ring colors for the map markers. These mirror the prototype's
// status hues and the day-register --reg-st-* tokens so the marker ring matches
// the legend access ring (the legend brightens per register; markers stay
// constant, exactly as the prototype does). Solid rings; the status is read by
// hue. "permit" uses the legibility-tuned amber (#a8730a), per owner decision.
const ACCESS_MARKER_STYLES = {
  allowed: { label: "Allowed", color: "#2f8f46", dashed: false },
  "permit-required": { label: "Permit required", color: "#a8730a", dashed: false },
  private: { label: "Private", color: "#7e6654", dashed: false },
  "private-unsourced": { label: "Private / unsourced", color: "#7e6654", dashed: false },
  unknown: { label: "Unknown", color: "#8b8f86", dashed: false },
  prohibited: { label: "Prohibited", color: "#c74437", dashed: false }
};
const LEGEND_PERMISSION_OPTIONS = [
  { id: "allowed", label: "Allowed" },
  { id: "permit-required", label: "Permit required" },
  { id: "private", label: "Private" },
  { id: "unknown", label: "Unverified" }
];
// Maps an access status to its fixed-semantics register token suffix
// (--reg-st-<suffix>). Safety/access colors are identical across registers
// per CLAUDE.md; the token sets only shift lightness for contrast.
const ACCESS_STATUS_TOKEN = {
  allowed: "allowed",
  "permit-required": "permit",
  private: "private",
  "private-unsourced": "private",
  unknown: "unknown",
  prohibited: "prohibited"
};
// Per-dataset license strings, transcribed verbatim from ATTRIBUTION.md so the
// point card can show "observer + dataset + license" (launch blocker). Keep in
// sync with ATTRIBUTION.md. nps-orchard has no CC license stated there (NPS
// Historic Orchards section) — the clause is omitted rather than fabricated.
const LICENSE_BY_SOURCE = {
  inaturalist: "CC BY-NC",
  fallingfruit: "CC BY-NC-SA 4.0",
  "nps-orchard": "Public domain (U.S. Gov)"
};
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
  grape: ["lookalikes"],
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
// Safety-first (CLAUDE.md): a park's "edible fungi" allowance applies only to
// species on this whitelist. Any other mushroom stays prohibited, so a future
// non-whitelisted fungus can never silently inherit an "allowed" park rule.
const EDIBLE_FUNGUS_WHITELIST = new Set(["morel"]);
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
    notes: "Ripe clusters on woody vines with tendrils. Do not confuse with moonseed (Menispermum canadense), whose single crescent seed and toxic berries can be fatal."
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
  publicLandCoverage: null,
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
  activeSuggestionIndex: -1,
  selectedSpecies: new Set(),
  favoriteSpecies: new Set(readFavoriteSpecies()),
  savedLocations: new Set(readSavedLocations()),
  savedLocationsOnly: false,
  register: "day",
  // The user's explicit wind-animation choice, kept separate from the
  // power/data gate so toggling tabs or battery state can't override intent.
  // Off by default (owner decision); the rail's "Animate wind" toggle opts in.
  fxUserEnabled: false,
  location: { lat: 39.8, lng: -98.6 }
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
const geolocateControl = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showUserHeading: true
});
map.addControl(geolocateControl, "bottom-right");
// Follow the GPS fix so the register, sun/moon dial, weather, and nearest tide
// reflect the user's real location rather than the default CONUS center.
geolocateControl.on("geolocate", (position) => {
  if (position?.coords) {
    setForecastLocation(position.coords.latitude, position.coords.longitude, "Current location");
  }
});
map.scrollZoom.setWheelZoomRate?.(1 / 280);
map.scrollZoom.setZoomRate?.(1 / 60);
window.addEventListener("resize", () => {
  map.resize();
});

// ---------------------------------------------------------------------------
// Light registers (dawn/day/dusk/night)
//
// Drives body[data-register], which selects the --reg-* token sets added in
// Phase 1. Register is computed from real solar position at state.location
// (defaults to the map's initial center; Phase 4 conditions work will update
// it when the user searches a place or moves the map). MAPBOX_STYLE is
// Mapbox Standard, whose "basemap" config exposes lightPreset
// (dawn/day/dusk/night, matching these register names exactly) — the
// try/catch below is just defensive against future style changes.
// ---------------------------------------------------------------------------
const RAD = Math.PI / 180;

function dayNum(date) {
  return date / 864e5 - 0.5 + 2440588 - 2451545;
}

function sunAltitude(date, lat, lng) {
  const d = dayNum(+date);
  const g = RAD * (357.5291 + 0.98560028 * d);
  const q = RAD * (280.459 + 0.98564736 * d);
  const L = q + RAD * 1.915 * Math.sin(g) + RAD * 0.02 * Math.sin(2 * g);
  const e = RAD * 23.439;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const gmst = RAD * (280.16 + 360.9856235 * d);
  const H = gmst + RAD * lng - ra;
  return Math.asin(Math.sin(RAD * lat) * Math.sin(dec) + Math.cos(RAD * lat) * Math.cos(dec) * Math.cos(H)) / RAD;
}

function computeRegister(date, lat, lng) {
  const alt = sunAltitude(date, lat, lng);
  if (alt >= 8) return "day";
  if (alt <= -6) return "night";
  const rising = sunAltitude(new Date(+date + 20 * 6e4), lat, lng) > alt;
  return rising ? "dawn" : "dusk";
}

function syncLightPreset(reg) {
  try {
    map.setConfigProperty("basemap", "lightPreset", reg);
  } catch {
    // Defensive: no-op if the style ever lacks a "basemap" config.
  }
}

// simNow() lets the solar dial preview any hour: when state.simMins is set,
// the register engine and sun panel read the simulated clock instead of the
// wall clock. "Back to now" clears it.
function simNow() {
  if (state.simMins == null) return new Date();
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return new Date(+base + state.simMins * 60000);
}

// The solar dial reads the season scrubber's date (so sunrise/sunset and the
// day arc track the selected day of year) while taking the time-of-day from
// simNow() — dragging the sun previews an hour, sliding the season previews a
// day. The map light/register stay on the real date (simNow), so the season
// scrubber re-shapes the dial without changing the basemap lighting.
function dialDate() {
  const t = simNow();
  const d = getSelectedDate();
  d.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
  return d;
}

function applyRegister() {
  const reg = computeRegister(simNow(), state.location.lat, state.location.lng);
  if (reg === state.register) return;
  state.register = reg;
  document.body.dataset.register = reg;
  if (state.mapReady) { syncLightPreset(reg); updateMarkerHalo(); }
}

applyRegister();
setInterval(applyRegister, 60e3);

// ---------------------------------------------------------------------------
// Phase 4 — Conditions (additive layer). Sun/moon are computed client-side at
// state.location and always render. Rain/wind come from Open-Meteo; any fetch
// failure leaves state.weather null and the rail simply omits those segments —
// the map, popups, legend, season, and sheets never depend on conditions
// (the graceful-degradation contract, work-order Phase 4 gate).
// ---------------------------------------------------------------------------
function sunTimes(date, lat, lng) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  let rise = null, set = null, goldenEve = null, duskCivil = null, dawnCivil = null, prev = null;
  for (let m = 0; m <= 1440; m += 4) {
    const t = new Date(+day + m * 6e4);
    const alt = sunAltitude(t, lat, lng);
    if (prev !== null) {
      if (prev < 0 && alt >= 0) rise = t;
      if (prev >= 0 && alt < 0) set = t;
      if (prev >= 10 && alt < 10) goldenEve = t;
      if (prev >= -6 && alt < -6) duskCivil = t;
      if (prev < -6 && alt >= -6) dawnCivil = t;
    }
    prev = alt;
  }
  return { rise, set, goldenEve, duskCivil, dawnCivil };
}

function moonPhase(date) {
  const synodic = 29.53058867;
  const days = (+date / 864e5) - (Date.UTC(2000, 0, 6, 18, 14) / 864e5);
  const phase = (((days % synodic) + synodic) % synodic) / synodic;
  const illum = 0.5 * (1 - Math.cos(2 * Math.PI * phase));
  return { phase, illum, waxing: phase < 0.5 };
}

const CONDITIONS_TTL_MS = 30 * 60 * 1000;
let openConditionSeg = null;

function sumValues(values) {
  return values.reduce((total, value) => total + (value || 0), 0);
}
function round1(value) {
  return Math.round(value * 10) / 10;
}
function formatClockTime(date) {
  return date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}
function windTier(kmh) {
  return kmh < 8 ? "calm" : kmh < 20 ? "medium" : "fast";
}

function loadConditions(force) {
  const { lat, lng } = state.location;
  const cacheKey = `craftAlmanacWx:${lng.toFixed(2)},${lat.toFixed(2)}`;
  if (!force) {
    try {
      const cached = JSON.parse(window.localStorage?.getItem(cacheKey) || "null");
      if (cached && Date.now() - cached.t < CONDITIONS_TTL_MS) {
        state.weather = { ...cached.v, src: "cached" };
        renderConditionsRail();
        return Promise.resolve(state.weather);
      }
    } catch {
      // ignore cache read/parse errors
    }
  }
  const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
    "&longitude=" + lng +
    "&hourly=precipitation,cloud_cover,wind_speed_10m,wind_direction_10m" +
    "&past_days=3&forecast_days=7&timezone=auto";
  return fetchWithTimeout(url)
    .then((response) => {
      if (!response.ok) throw new Error("open-meteo " + response.status);
      return response.json();
    })
    .then((data) => {
      const hourly = data.hourly;
      const nowIndex = hourly.time.findIndex((t) => new Date(t) > new Date()) - 1;
      const i = Math.max(0, nowIndex);
      const past72 = sumValues(hourly.precipitation.slice(Math.max(0, i - 72), i));
      // 10 daily totals = 3 past days + today + 6 forecast (past_days=3); index 3
      // is today. Powers the rain panel's memory+forecast bars (Phase 4b).
      const daily = [];
      for (let d = 0; d < 10; d++) {
        daily.push(round1(sumValues(hourly.precipitation.slice(d * 24, d * 24 + 24))));
      }
      const weather = {
        past72: round1(past72),
        daily,
        wind: hourly.wind_speed_10m[i] || 0,
        windDir: hourly.wind_direction_10m[i] || 0,
        clouds: hourly.cloud_cover[i] || 0,
        fetched: Date.now(),
        src: "live"
      };
      state.weather = weather;
      try {
        window.localStorage?.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: weather }));
      } catch {
        // ignore storage quota errors
      }
      renderConditionsRail();
      return weather;
    })
    .catch(() => {
      // Degrade gracefully: no live data and no fresh cache → leave whatever
      // (possibly nothing) is in state.weather and never fabricate values.
      renderConditionsRail();
      return null;
    });
}

function conditionsIconSun() {
  return `<svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="4.4" fill="#e8b931"/>
    <g stroke="#e8b931" stroke-width="1.4" stroke-linecap="round">
    <line x1="11" y1="1.5" x2="11" y2="4"/><line x1="11" y1="18" x2="11" y2="20.5"/>
    <line x1="1.5" y1="11" x2="4" y2="11"/><line x1="18" y1="11" x2="20.5" y2="11"/>
    <line x1="4.2" y1="4.2" x2="6" y2="6"/><line x1="16" y1="16" x2="17.8" y2="17.8"/>
    <line x1="17.8" y1="4.2" x2="16" y2="6"/><line x1="6" y1="16" x2="4.2" y2="17.8"/></g></svg>`;
}
function conditionsIconMoon(mp) {
  const offset = (mp.waxing ? 1 : -1) * (11 * (1 - mp.illum));
  return `<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="var(--reg-sub)"/>
    <circle cx="${(11 + offset).toFixed(1)}" cy="11" r="8" fill="var(--reg-panel-a)"/></svg>`;
}
function conditionsIconRain() {
  // Register-aware fill (matches the wind/moon glyphs); the fixed blue dropped
  // below the contrast floor on the dark dusk/night rail.
  return `<svg viewBox="0 0 22 22"><path d="M11 3 C 14 8, 17 11, 17 14 A 6 6 0 1 1 5 14 C 5 11, 8 8, 11 3 Z" fill="var(--reg-sub)"/></svg>`;
}
function conditionsIconWind() {
  return `<svg viewBox="0 0 22 22" fill="none" stroke="var(--reg-sub)" stroke-width="1.6" stroke-linecap="round">
    <path d="M3 8 H 13 a 2.6 2.6 0 1 0 -2.6 -2.6"/><path d="M3 13 H 16 a 2.6 2.6 0 1 1 -2.6 2.6"/></svg>`;
}

function conditionsSegment(id, label, value, icon) {
  const active = openConditionSeg === id ? " active" : "";
  return `<button type="button" class="rail-seg${active}" data-seg="${id}">
    <span class="ic">${icon}</span><span><span class="k">${escapeHTML(label)}</span><span class="v">${escapeHTML(value)}</span></span>
  </button>`;
}

// Lowest per-species 72 h rainfall that could trigger a whitelisted-mushroom
// flush, read from the C3 threshold table (not a magic constant). Null until
// the table loads or if it is empty.
function minFlushThresholdMm() {
  if (!flushThresholds) return null;
  const vals = Object.values(flushThresholds)
    .map((t) => Number(t && t.thresholdMm72h))
    .filter((n) => Number.isFinite(n));
  return vals.length ? Math.min(...vals) : null;
}

// Fungal-flush messaging for the rain panel — food map only, driven by the C3
// threshold table (whitelisted mushrooms). Silent outside the food map and
// until the table loads, so the rail never asserts a flush the gated harvest
// surfaces (pulses, popup) would not (CLAUDE.md: no fungi without the whitelist).
function flushPanelNote(past72) {
  if (state.activeMap !== "food") return "";
  const min = minFlushThresholdMm();
  if (min == null) return "";
  return past72 >= min
    ? " — <b>fungal flush likely</b> for whitelisted mushrooms."
    : " — below the flush threshold.";
}

function renderConditionsRail() {
  if (!conditionsRail) return;
  const now = new Date();
  const { lat, lng } = state.location;
  const times = sunTimes(now, lat, lng);
  const mp = moonPhase(now);
  const weather = state.weather;
  let html = "";
  html += conditionsSegment("sun", "SUN", `${state.register.toUpperCase()} · set ${formatClockTime(times.set)}`, conditionsIconSun());
  html += conditionsSegment("moon", "MOON", `${Math.round(mp.illum * 100)}% ${mp.waxing ? "waxing" : "waning"}`, conditionsIconMoon(mp));
  if (weather) {
    const flushMin = minFlushThresholdMm();
    const flushNote = (state.activeMap === "food" && flushMin != null && weather.past72 >= flushMin) ? " · FLUSH" : "";
    html += conditionsSegment("rain", "RAIN 72H", `${weather.past72} mm${flushNote}`, conditionsIconRain());
    html += conditionsSegment("wind", "WIND", `${Math.round(weather.wind)} km/h · ${windTier(weather.wind).toUpperCase()}`, conditionsIconWind());
  }
  // Tide is always present in the rail (owner decision): near a NOAA station it
  // shows the next high/low; inland it reads "none nearby" and the panel
  // explains that tides are coastal-only.
  const nt = nextTide();
  let tideValue, tideRising = false;
  if (nt) {
    tideValue = `${nt.type === "L" ? "low" : "high"} ${formatClockTime(nt.t)}`;
    tideRising = nt.type === "H";
  } else {
    tideValue = state.tide ? "—" : "none nearby";
  }
  html += conditionsSegment("tide", "TIDE", tideValue, conditionsIconTide(tideRising));
  conditionsRail.innerHTML = html;
  // Mirror the current light register onto the masthead's conditions chip.
  if (mastCondVal) mastCondVal.textContent = (state.register || "").toUpperCase();
}

// --- Phase 4b: condition detail panels (click a rail segment) --------------
const WEATHER_AREA_MIN_ZOOM = 8;

function dirName(deg) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];
}

function svgMoon(mp, r = 22) {
  const d = r * 2 + 8, c = d / 2;
  const k = Math.cos(2 * Math.PI * mp.phase);
  const rx = Math.abs(k) * r;
  const half = mp.waxing ? 1 : -1;
  return `<svg viewBox="0 0 ${d} ${d}" width="${d}" height="${d}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${c}" cy="${c}" r="${r}" fill="var(--reg-panel)" stroke="var(--reg-sub)" stroke-width="1"/>
    <path d="M ${c} ${c - r} A ${r} ${r} 0 0 ${half > 0 ? 1 : 0} ${c} ${c + r} A ${rx} ${r} 0 0 ${(half > 0) === (k < 0) ? 1 : 0} ${c} ${c - r} Z" fill="var(--reg-ink)" opacity="0.85"/>
  </svg>`;
}

function svgMoonAxis(mp, w = 300) {
  const h = 74, y = 42, x0 = 30, x1 = w - 30;
  const x = x0 + mp.illum * (x1 - x0);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="var(--reg-hair)" stroke-width="2.2"/>
    <circle cx="${x0}" cy="${y}" r="11" fill="var(--reg-panel)" stroke="var(--reg-sub)" stroke-width="1.6"/>
    <circle cx="${x1}" cy="${y}" r="11" fill="var(--reg-ink)" opacity="0.85" stroke="var(--reg-sub)" stroke-width="1.2"/>
    <circle cx="${x.toFixed(1)}" cy="${y}" r="8" fill="var(--subject, var(--reg-accent))" stroke="var(--reg-panel)" stroke-width="2"/>
    <text x="${x0}" y="${y + 26}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="10.5" fill="var(--reg-sub)" text-anchor="middle">NEW</text>
    <text x="${x1}" y="${y + 26}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="10.5" fill="var(--reg-sub)" text-anchor="middle">FULL</text>
    <text x="${x.toFixed(1)}" y="${y - 17}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="11.5" fill="var(--reg-ink)" text-anchor="middle">${Math.round(mp.illum * 100)}% ${mp.waxing ? "→" : "←"}</text>
  </svg>`;
}

function svgCompass(dir, speed, r = 88) {
  const d = r * 2 + 18, c = d / 2;
  const a = (dir + 180) * RAD;
  const x2 = c + Math.sin(a) * (r - 18), y2 = c - Math.cos(a) * (r - 18);
  const x1 = c - Math.sin(a) * (r - 38), y1 = c + Math.cos(a) * (r - 38);
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const ticks = dirs.map((t, i) => {
    const ta = i * Math.PI / 4;
    const major = i % 2 === 0;
    return `<text x="${(c + Math.sin(ta) * (r + 2)).toFixed(1)}" y="${(c - Math.cos(ta) * (r + 2) + 3.5).toFixed(1)}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="${major ? 12 : 10.5}" fill="var(--reg-${major ? "ink" : "sub"})" text-anchor="middle">${t}</text>`;
  }).join("");
  let ring = "";
  for (let i = 0; i < 36; i++) {
    const ta = i * Math.PI / 18;
    const rr = i % 9 === 0 ? r - 26 : r - 21;
    ring += `<line x1="${(c + Math.sin(ta) * (r - 17)).toFixed(1)}" y1="${(c - Math.cos(ta) * (r - 17)).toFixed(1)}" x2="${(c + Math.sin(ta) * rr).toFixed(1)}" y2="${(c - Math.cos(ta) * rr).toFixed(1)}" stroke="var(--reg-hair)" stroke-width="1.2"/>`;
  }
  const tier = windTier(speed);
  return `<svg viewBox="0 0 ${d} ${d}" width="${d}" height="${d}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${c}" cy="${c}" r="${r - 17}" fill="none" stroke="var(--reg-hair)" stroke-width="1.4"/>
    ${ring}${ticks}
    <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--subject, var(--reg-accent))" stroke-width="4" stroke-linecap="round"/>
    <path d="M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 - Math.sin(a - 0.42) * 14).toFixed(1)} ${(y2 + Math.cos(a - 0.42) * 14).toFixed(1)} L ${(x2 - Math.sin(a + 0.42) * 14).toFixed(1)} ${(y2 + Math.cos(a + 0.42) * 14).toFixed(1)} Z" fill="var(--subject, var(--reg-accent))"/>
    <circle cx="${c}" cy="${c}" r="22" fill="var(--reg-panel)" stroke="var(--reg-hair)"/>
    <text x="${c}" y="${c - 2}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="15" fill="var(--reg-ink)" text-anchor="middle">${Math.round(speed)}</text>
    <text x="${c}" y="${c + 8}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="8" fill="var(--reg-sub)" text-anchor="middle">KM/H</text>
    <text x="${c}" y="${c + 17}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="8" fill="var(--reg-ink)" text-anchor="middle">${tier.toUpperCase()}</text>
  </svg>`;
}

// Wind compass wrapped in an animated streak overlay (ported from the
// prototype). Seven streaks advect at a speed-scaled duration; the .windflow
// box is rotated to the wind direction so the streaks blow the way the arrow
// points. Streaks pause under prefers-reduced-motion (CSS).
function windFlowHTML(dir, speed) {
  const dur = Math.max(1.4, 7 - speed * 0.18).toFixed(2) + "s";
  const streaks = Array.from({ length: 7 }, (_, i) => {
    const ox = (i - 3) * 14 + (i % 2 ? 5 : -4);
    const delay = ((i * 0.37) % 2.2).toFixed(2);
    return `<i style="--ox:${ox}px; --dur:${dur}; animation-delay:${delay}s"></i>`;
  }).join("");
  return `<div class="windbox">
    <div class="windflow" style="transform:rotate(${dir % 360}deg)">${streaks}</div>
    ${svgCompass(dir, speed)}
  </div>`;
}

function pickWindows(daily) {
  let rainDay = -1;
  for (let i = 4; i < 10; i++) if (daily[i] >= 5) { rainDay = i; break; }
  let dryStart = -1, dryEnd = -1;
  for (let i = 4; i < 9; i++) {
    if (daily[i] < 1 && daily[i + 1] < 1) {
      dryStart = i; dryEnd = i + 1;
      while (dryEnd + 1 < 10 && daily[dryEnd + 1] < 1) dryEnd++;
      break;
    }
  }
  const start = new Date(); start.setDate(start.getDate() - 3);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dn = (i) => (i === 3 ? "today" : dayNames[new Date(+start + i * 864e5).getDay()]);
  const out = [];
  if (rainDay > 0) out.push(`Rain expected ${dn(rainDay)} — check mushrooms ${dn(Math.min(rainDay + 2, 9))}.`);
  if (dryStart > 0) out.push(`Dry window ${dn(dryStart)}–${dn(dryEnd)}: berries, fiber, drying.`);
  return out.join(" ") || "No strong windows in the forecast.";
}

function conditionsDataAge() {
  const w = state.weather;
  if (!w || !w.fetched) return "";
  const age = Math.round((Date.now() - w.fetched) / 6e4);
  const freshness = w.src === "cached" ? `CACHED · ${age} MIN AGO` : age <= 1 ? "JUST FETCHED" : `${age} MIN AGO`;
  return `<div class="age">SOURCE: OPEN-METEO · ${freshness}</div>`;
}

function conditionsLocLine() {
  const label = state.locLabel || "DEFAULT AREA (CONUS)";
  const zoomOK = state.mapReady && map.getZoom() >= WEATHER_AREA_MIN_ZOOM;
  return `<div class="age">FORECAST FOR: ${escapeHTML(label)}</div>` + (zoomOK
    ? `<button class="now-btn" type="button" id="use-map-area">UPDATE TO MAP AREA</button>`
    : `<div class="age">ZOOM IN CLOSER TO UPDATE THE FORECAST TO THE MAP AREA</div>`);
}

function useMapArea() {
  if (!state.mapReady) return;
  const center = map.getCenter();
  const label = "MAP AREA · " + Math.abs(center.lat).toFixed(1) + "°" + (center.lat >= 0 ? "N" : "S") +
    " " + Math.abs(center.lng).toFixed(1) + "°" + (center.lng >= 0 ? "E" : "W");
  setForecastLocation(center.lat, center.lng, label);
}

function rainBars(daily) {
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const start = new Date(); start.setDate(start.getDate() - 3);
  const labels = Array.from({ length: 10 }, (_, i) => {
    const date = new Date(+start + i * 864e5);
    return { txt: dayNames[date.getDay()], today: i === 3 };
  });
  const maxV = Math.max(...daily, 1);
  const bars = daily.map((v, i) =>
    `<div class="bwrap"><span class="bval">${v > 0 ? v : ""}</span><div class="b ${i < 3 ? "past" : ""}${i === 3 ? " today" : ""}" style="height:${Math.max(4, (v / maxV) * 100)}%" title="${v} mm"></div></div>`).join("");
  const labelRow = labels.map((l) => `<span class="${l.today ? "today" : ""}">${l.today ? "TODAY" : l.txt}</span>`).join("");
  return `<div class="bars">${bars}</div><div class="bars-labels">${labelRow}</div>`;
}

// --- Solar dial (prototype #sun-dial): a draggable clock dial that simulates
// the time of day. Dragging the sun sets state.simMins, re-deriving the light
// register + map lightPreset WITHOUT rebuilding the panel (so the drag stays
// smooth); "Back to now" clears it. A small earth spins at the hub. -----------
const SUN_DIAL_SIZE = 200;
const DIAL_MONO = "'IBM Plex Mono', ui-monospace, monospace";

function dialAngle(date) {
  const mins = date.getHours() * 60 + date.getMinutes();
  return ((mins - 720) / 1440) * 2 * Math.PI;
}

function dialPos(phi, c, r) {
  return [c - r * Math.sin(phi), c - r * Math.cos(phi)];
}

function earthSVG(c, r) {
  return `<g>
    <circle cx="${c}" cy="${c}" r="${r}" fill="#3e6e8e" opacity="0.9"/>
    <g class="earth-spin">
      <clipPath id="ca-earth-clip"><circle cx="${c}" cy="${c}" r="${r}"/></clipPath>
      <g clip-path="url(#ca-earth-clip)" fill="#5e8e58" opacity="0.95">
        <path d="M ${c - r * 0.9} ${c - r * 0.4} q ${r * 0.5} ${-r * 0.5} ${r * 0.9} ${-r * 0.1} q ${r * 0.3} ${r * 0.3} ${-r * 0.1} ${r * 0.5} q ${-r * 0.6} ${r * 0.2} ${-r * 0.8} ${-r * 0.4} Z"/>
        <path d="M ${c + r * 0.2} ${c + r * 0.15} q ${r * 0.45} ${-r * 0.15} ${r * 0.6} ${r * 0.2} q ${-r * 0.1} ${r * 0.45} ${-r * 0.55} ${r * 0.35} q ${-r * 0.3} ${-r * 0.25} ${-r * 0.05} ${-r * 0.55} Z"/>
        <path d="M ${c - r * 0.5} ${c + r * 0.45} q ${r * 0.3} ${-r * 0.1} ${r * 0.4} ${r * 0.15} q ${-r * 0.2} ${r * 0.3} ${-r * 0.45} ${r * 0.1} Z"/>
      </g>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--reg-panel)" stroke-width="1"/>
    </g></g>`;
}

// Day-arc geometry for a given sunTimes result. Shared by the initial render
// (svgSunDial) and the live in-place updater (updateSunArc) so the arc, chord,
// and RISE/SET labels stay in sync as the season scrubber re-derives the times.
function dialArcGeom(st, c, r) {
  if (!st.rise || !st.set) return null;
  const [rx, ry] = dialPos(dialAngle(st.rise), c, r);
  const [ex, ey] = dialPos(dialAngle(st.set), c, r);
  return {
    rx, ry, ex, ey,
    // When a point sits low on the dial (late sunset near solstice), drop its
    // label above the point so RISE/SET don't collide with the MIDNIGHT anchor.
    riseLabelY: ry > c + r * 0.5 ? ry - 6 : ry + 13,
    setLabelY: ey > c + r * 0.5 ? ey - 6 : ey + 13,
    arcD: `M ${rx.toFixed(1)} ${ry.toFixed(1)} A ${r} ${r} 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`
  };
}

function svgSunDial(size = SUN_DIAL_SIZE) {
  const c = size / 2, r = size / 2 - 10;
  const now = dialDate();
  const { lat, lng } = state.location;
  const st = sunTimes(now, lat, lng);
  const phi = dialAngle(now);
  const [sx, sy] = dialPos(phi, c, r);
  let chord = "", dayArc = "";
  const geom = dialArcGeom(st, c, r);
  if (geom) {
    chord = `<line id="sun-chord" x1="${geom.rx.toFixed(1)}" y1="${geom.ry.toFixed(1)}" x2="${geom.ex.toFixed(1)}" y2="${geom.ey.toFixed(1)}" stroke="var(--reg-sub)" stroke-width="1" stroke-dasharray="3 3"/>
      <text id="sun-rise-label" x="${(geom.rx - 3).toFixed(1)}" y="${geom.riseLabelY.toFixed(1)}" font-family="${DIAL_MONO}" font-size="9.5" fill="var(--reg-sub)" text-anchor="end">RISE</text>
      <text id="sun-set-label" x="${(geom.ex + 3).toFixed(1)}" y="${geom.setLabelY.toFixed(1)}" font-family="${DIAL_MONO}" font-size="9.5" fill="var(--reg-sub)">SET</text>`;
    dayArc = `<path id="sun-arc" d="${geom.arcD}" fill="none" stroke="var(--reg-warn)" stroke-width="2.5" opacity="0.55" stroke-linecap="round"/>`;
  }
  const night = sunAltitude(now, lat, lng) < 0;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return `<svg id="sun-dial" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="slider" tabindex="0" aria-label="Preview time of day" aria-valuemin="0" aria-valuemax="1439" aria-valuenow="${nowMins}" aria-valuetext="${escapeHTML(formatClockTime(now))}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--reg-hair)" stroke-width="1.4"/>
    ${dayArc}${chord}
    ${earthSVG(c, Math.max(10, r * 0.22))}
    <circle id="sun-dot" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${Math.max(5, r * 0.12).toFixed(1)}" fill="${night ? "var(--reg-ink)" : "#e8b931"}" stroke="var(--reg-panel)" stroke-width="1.5"/>
    <text x="${c}" y="14" font-family="${DIAL_MONO}" font-size="9.5" fill="var(--reg-sub)" text-anchor="middle">NOON</text>
    <text x="${c}" y="${size - 4}" font-family="${DIAL_MONO}" font-size="9.5" fill="var(--reg-sub)" text-anchor="middle">MIDNIGHT</text>
  </svg>`;
}

// In-place update of the day arc, chord, and RISE/SET labels — lets the dial
// re-shape as the season scrubber changes the sunrise/sunset times without
// rebuilding the SVG (which would restart the earth-spin animation).
function updateSunArc(st, c, r) {
  const arc = document.getElementById("sun-arc");
  const chord = document.getElementById("sun-chord");
  const riseLabel = document.getElementById("sun-rise-label");
  const setLabel = document.getElementById("sun-set-label");
  const geom = dialArcGeom(st, c, r);
  const els = [arc, chord, riseLabel, setLabel];
  if (!geom) { els.forEach((el) => { if (el) el.style.display = "none"; }); return; }
  els.forEach((el) => { if (el) el.style.display = ""; });
  if (arc) arc.setAttribute("d", geom.arcD);
  if (chord) {
    chord.setAttribute("x1", geom.rx.toFixed(1));
    chord.setAttribute("y1", geom.ry.toFixed(1));
    chord.setAttribute("x2", geom.ex.toFixed(1));
    chord.setAttribute("y2", geom.ey.toFixed(1));
  }
  if (riseLabel) {
    riseLabel.setAttribute("x", (geom.rx - 3).toFixed(1));
    riseLabel.setAttribute("y", geom.riseLabelY.toFixed(1));
  }
  if (setLabel) {
    setLabel.setAttribute("x", (geom.ex + 3).toFixed(1));
    setLabel.setAttribute("y", geom.setLabelY.toFixed(1));
  }
}

function updateSunDial() {
  const dial = document.getElementById("sun-dial");
  if (!dial) return;
  const size = SUN_DIAL_SIZE, c = size / 2, r = size / 2 - 10;
  const now = dialDate();
  const { lat, lng } = state.location;
  const st = sunTimes(now, lat, lng);
  const [sx, sy] = dialPos(dialAngle(now), c, r);
  const dot = document.getElementById("sun-dot");
  if (dot) {
    dot.setAttribute("cx", sx.toFixed(1));
    dot.setAttribute("cy", sy.toFixed(1));
    dot.setAttribute("fill", sunAltitude(now, lat, lng) < 0 ? "var(--reg-ink)" : "#e8b931");
  }
  updateSunArc(st, c, r);
  dial.setAttribute("aria-valuenow", String(now.getHours() * 60 + now.getMinutes()));
  dial.setAttribute("aria-valuetext", formatClockTime(now));
  const rd = document.getElementById("sun-readout");
  if (rd) {
    rd.innerHTML = `<b>${escapeHTML(formatClockTime(now))}</b> · ${escapeHTML(state.register.toUpperCase())} REGISTER${state.simMins != null ? " (SIMULATED)" : ""}`;
  }
  const note = document.getElementById("sun-times-note");
  if (note) {
    note.innerHTML = `First light ${formatClockTime(st.dawnCivil)} · Rise ${formatClockTime(st.rise)} · Golden ${formatClockTime(st.goldenEve)} · Set ${formatClockTime(st.set)} · Dark ${formatClockTime(st.duskCivil)}.`;
  }
  if (railPanel) railPanel.classList.toggle("simulating", state.simMins != null);
}

// Re-derive the register from the simulated time without rebuilding the panel.
function applyRegisterLight() {
  const reg = computeRegister(simNow(), state.location.lat, state.location.lng);
  if (reg === state.register) return;
  state.register = reg;
  document.body.dataset.register = reg;
  if (state.mapReady) { syncLightPreset(reg); updateMarkerHalo(); }
}

function bindSunDial() {
  const dial = document.getElementById("sun-dial");
  if (!dial) return;
  let dragging = false;
  const fromEvent = (event) => {
    const rect = dial.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const phi = Math.atan2(-dx, -dy);
    const mins = Math.round((phi / (2 * Math.PI)) * 1440 + 720);
    state.simMins = ((mins % 1440) + 1440) % 1440;
    applyRegisterLight();
    updateSunDial();
  };
  const readout = () => document.getElementById("sun-readout");
  dial.addEventListener("pointerdown", (event) => {
    dragging = true;
    dial.classList.add("dragging");
    // Silence the readout's live region during the drag so the screen reader
    // isn't flooded with a clock tick on every pointermove.
    readout()?.setAttribute("aria-live", "off");
    try { dial.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    fromEvent(event);
    event.preventDefault();
  });
  dial.addEventListener("pointermove", (event) => { if (dragging) { fromEvent(event); event.preventDefault(); } });
  dial.addEventListener("pointerup", () => { dragging = false; dial.classList.remove("dragging"); readout()?.setAttribute("aria-live", "polite"); renderConditionsRail(); renderConditionPanel(); });
  dial.addEventListener("pointercancel", () => { dragging = false; dial.classList.remove("dragging"); readout()?.setAttribute("aria-live", "polite"); });
  // Keyboard scrubbing: arrows nudge the previewed time; Home/End jump to
  // midnight/end of day. One announcement per keypress (live region stays on).
  dial.addEventListener("keydown", (event) => {
    const cur = state.simMins == null ? (new Date().getHours() * 60 + new Date().getMinutes()) : state.simMins;
    let next = cur;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = cur + (event.shiftKey ? 60 : 15);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = cur - (event.shiftKey ? 60 : 15);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1439;
    else return;
    event.preventDefault();
    state.simMins = ((Math.round(next) % 1440) + 1440) % 1440;
    applyRegisterLight();
    updateSunDial();
  });
}

function renderConditionPanel() {
  if (!railPanel || !railPad) return;
  if (!openConditionSeg) {
    railPanel.classList.remove("open");
    railPanel.removeAttribute("data-subject");
    railPad.innerHTML = "";
    return;
  }
  railPanel.classList.add("open");
  railPanel.dataset.subject = openConditionSeg;
  const now = new Date();
  const { lat, lng } = state.location;
  const mp = moonPhase(now);
  const w = state.weather;
  let html = "";
  if (openConditionSeg === "sun") {
    // Sunrise/sunset follow the season scrubber (dialDate), and the note is kept
    // live by updateSunDial() as the slider moves.
    const st = sunTimes(dialDate(), lat, lng);
    html = `<h3>THE SUN</h3>
      <div class="fig">${svgSunDial()}</div>
      <div class="age" id="sun-readout" role="status" aria-live="polite" aria-atomic="true"></div>
      <button class="sun-now" type="button" id="sun-now">BACK TO NOW</button>
      <div class="note" id="sun-times-note" style="margin-top:10px">First light ${formatClockTime(st.dawnCivil)} · Rise ${formatClockTime(st.rise)} · Golden ${formatClockTime(st.goldenEve)} · Set ${formatClockTime(st.set)} · Dark ${formatClockTime(st.duskCivil)}.</div>
      <div class="note" style="margin-top:8px"><b>Drag the sun</b> to preview any hour — the map's light and the register follow. Many parks close gathering at dusk; the register keeps the same clock.</div>`;
  } else if (openConditionSeg === "moon") {
    html = `<h3>MOON</h3>
      <div class="fig">${svgMoon(mp)}</div>
      <div class="fig">${svgMoonAxis(mp)}</div>
      <div class="note">${Math.round(mp.illum * 100)}% illuminated, ${mp.waxing ? "waxing" : "waning"}. Bright-moon nights favor low-tide walks and evening foraging; headlamps off when you can.</div>
      <div class="age">COMPUTED LOCALLY — NO NETWORK</div>`;
  } else if (openConditionSeg === "rain") {
    html = w
      ? `<h3>RAIN — MEMORY &amp; FORECAST (MM)</h3>
        ${rainBars(w.daily)}
        <div class="note" style="margin-top:8px">Past 72 h: <b>${w.past72} mm</b>${flushPanelNote(w.past72)}<br>${escapeHTML(pickWindows(w.daily))}</div>
        ${conditionsLocLine()}${conditionsDataAge()}`
      : `<h3>RAIN</h3><div class="note">Live rainfall data is unavailable right now.</div>${conditionsLocLine()}`;
  } else if (openConditionSeg === "wind") {
    html = w
      ? `<h3>WIND &amp; CLOUD</h3>
        <div class="fig">${windFlowHTML(w.windDir, w.wind)}</div>
        <div class="note">${Math.round(w.wind)} km/h from ${dirName(w.windDir)} · cloud cover ${w.clouds}%.<br>Calm dry days are drying days; gusty days, stay clear of old canopy.</div>
        <label class="fx-toggle"><input type="checkbox" id="fx-toggle"${state.fxUserEnabled ? " checked" : ""}> Animate wind on the map (zoom 7.5+)</label>
        ${conditionsLocLine()}${conditionsDataAge()}`
      : `<h3>WIND</h3><div class="note">Live wind data is unavailable right now.</div>${conditionsLocLine()}`;
  } else if (openConditionSeg === "tide") {
    if (state.tide && state.tide.events) {
      const lowNext = state.tide.events.find((e) => e.type === "L" && +new Date(e.t) > Date.now());
      const windowLine = lowNext
        ? `Next low ${formatClockTime(lowNext.t)} (${lowNext.v.toFixed(1)} ft) — the intertidal window runs roughly 90 minutes either side.`
        : "";
      html = `<h3>TIDE — ${escapeHTML(state.tide.stationName || "NEAREST STATION")}</h3>
        <div class="fig">${svgTideCurve(state.tide.events)}</div>
        <div class="note">${windowLine}<br>Low tide is the gathering tide: seaweeds and shellfish beds open as the water falls. <b>Biotoxin closures always override</b> — closures are hand-encoded, never inferred.</div>
        <div class="age">SOURCE: NOAA CO-OPS · STATION ${escapeHTML(state.tide.stationId)} · PREDICTIONS</div>`;
    } else {
      html = `<h3>TIDE</h3>
        <div class="note">No NOAA tide station within ${TIDE_MAX_DISTANCE_KM} km of this location. Tides are coastal — search or pan the map to a shoreline and the nearest station's predictions load automatically.</div>`;
    }
  }
  railPad.innerHTML = html;
  const useAreaButton = document.getElementById("use-map-area");
  if (useAreaButton) useAreaButton.addEventListener("click", useMapArea);
  const fxToggle = document.getElementById("fx-toggle");
  if (fxToggle) {
    fxToggle.addEventListener("change", (event) => {
      // Record intent, then let the shared gate apply the power/zoom policy and
      // start/stop the loop — so the choice survives later auto-refreshes.
      state.fxUserEnabled = event.target.checked;
      refreshWindCanvasPower();
    });
  }
  if (openConditionSeg === "sun") {
    bindSunDial();
    updateSunDial();
    const sunNow = document.getElementById("sun-now");
    if (sunNow) {
      sunNow.addEventListener("click", () => {
        state.simMins = null;
        applyRegister();
        renderConditionPanel();
      });
    }
  }
}

function toggleConditionPanel(segId) {
  const leavingSun = openConditionSeg === "sun" && segId !== "sun";
  openConditionSeg = openConditionSeg === segId ? null : segId;
  // Leaving the sun panel ends the dial preview — otherwise the simulated
  // clock stays frozen and the 60s applyRegister keeps recomputing from it.
  if (leavingSun && state.simMins != null) {
    state.simMins = null;
    applyRegister();
  }
  renderConditionsRail();
  renderConditionPanel();
}

// Forecast location follows the chosen place (Phase 4); default stays CONUS
// center. Changing it re-runs the register and refetches conditions.
function setForecastLocation(lat, lng, label) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  state.location = { lat, lng };
  if (label) state.locLabel = label;
  applyRegister();
  renderConditionsRail();
  renderConditionPanel();
  loadConditions(true);
  loadTide();
}

// Once a drag that starts on the conditions rail commits to the horizontal
// axis, keep it scrolling the rail for the rest of the gesture — driving
// scrollLeft directly and swallowing the move events — so a finger that drifts
// off the rail (especially down onto the map) can't hand the gesture over to a
// map pan. touchstart stays the event target for the whole gesture, so the
// commitment survives the finger leaving the rail's bounds.
function lockRailHorizontalScroll(rail) {
  let startX = 0;
  let startY = 0;
  let scrollStart = 0;
  let axis = null;
  rail.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    scrollStart = rail.scrollLeft;
    axis = null;
  }, { passive: true });
  rail.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (axis === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    }
    if (axis === "x") {
      rail.scrollLeft = scrollStart - dx;
      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive: false });
  const release = () => { axis = null; };
  rail.addEventListener("touchend", release, { passive: true });
  rail.addEventListener("touchcancel", release, { passive: true });
}

function initConditions() {
  if (conditionsRail) {
    conditionsRail.addEventListener("click", (event) => {
      const seg = event.target.closest(".rail-seg");
      if (seg) toggleConditionPanel(seg.dataset.seg);
    });
    lockRailHorizontalScroll(conditionsRail);
  }
  renderConditionsRail();
  loadConditions();
  loadTide();
  loadFlushThresholds();
  setInterval(() => {
    renderConditionsRail();
    if (openConditionSeg) renderConditionPanel();
    refreshFlush();
  }, 60e3);
  setInterval(() => loadConditions(), CONDITIONS_TTL_MS);
  setInterval(() => loadTide(), TIDE_TTL_MS);
  initWindCanvas();
}

// --- Phase 4c: animated wind streak canvas (zoom ≥ 7.5) --------------------
// A pointer-events-none overlay sized to the map container. Particles are
// advected by the live wind vector and projected through map.project so they
// track the basemap. Off by default under prefers-reduced-motion; paused when
// the tab is hidden; below the zoom threshold the canvas stays clear (radar
// will own low zooms in 4e). Purely decorative — never blocks the map.
const WIND_CANVAS_MIN_ZOOM = 7.5;
const fxCanvas = document.getElementById("fx");
const fxCtx = fxCanvas ? fxCanvas.getContext("2d") : null;
let fxParticles = [];
let fxLastTs = 0;
let fxRafId = 0;
let fxBattery = null;

function isNightish() {
  return state.register === "night" || state.register === "dusk";
}

function fxResize() {
  if (!fxCanvas) return;
  const host = document.getElementById("map") || fxCanvas.parentElement;
  if (!host) return;
  const rect = host.getBoundingClientRect();
  fxCanvas.width = Math.max(1, Math.round(rect.width));
  fxCanvas.height = Math.max(1, Math.round(rect.height));
}

function fxViewBounds() {
  const b = map.getBounds();
  return { w: b.getWest(), e: b.getEast(), s: b.getSouth(), n: b.getNorth() };
}

function fxInitParticles() {
  if (!state.mapReady) return;
  const b = fxViewBounds(), dw = b.e - b.w, dh = b.n - b.s;
  fxParticles = Array.from({ length: 55 }, () => ({
    lng: b.w + Math.random() * dw, lat: b.s + Math.random() * dh, life: 60 + Math.random() * 80
  }));
}

function fxFrame(ts) {
  fxRafId = requestAnimationFrame(fxFrame);
  if (!fxCtx || document.hidden) return;
  const dt = Math.min(0.1, Math.max(0.001, ((ts || 0) - fxLastTs) / 1000));
  fxLastTs = ts || 0;
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  if (!state.fxOn || !state.weather || !state.mapReady) return;
  if (map.getZoom() < WIND_CANVAS_MIN_ZOOM) return;
  if (!fxParticles.length) fxInitParticles();
  const w = state.weather, night = isNightish();
  const b = fxViewBounds(), dw = b.e - b.w, dh = b.n - b.s;
  const tier = windTier(w.wind);
  const pxStreak = tier === "calm" ? 16 : tier === "medium" ? 42 : 90;
  const degPerPxX = dw / fxCanvas.width, degPerPxY = dh / fxCanvas.height;
  const bearing = (w.windDir + 180) * RAD;
  const vlng = Math.sin(bearing) * pxStreak * degPerPxX * dt;
  const vlat = Math.cos(bearing) * pxStreak * degPerPxY * dt;
  const tailPx = 34;
  const tailLng = Math.sin(bearing) * tailPx * degPerPxX, tailLat = Math.cos(bearing) * tailPx * degPerPxY;
  const headCol = night ? "240,248,242" : "58,72,64";
  fxCtx.lineCap = "round";
  fxCtx.lineWidth = 1.8;
  fxParticles.forEach((p, i) => {
    if (tier === "calm" && i % 2) return;
    p.lng += vlng; p.lat += vlat; p.life -= dt * 30;
    if (p.life <= 0 || p.lng < b.w - dw * 0.1 || p.lng > b.e + dw * 0.1 || p.lat < b.s - dh * 0.1 || p.lat > b.n + dh * 0.1) {
      p.lng = b.w + Math.random() * dw; p.lat = b.s + Math.random() * dh; p.life = 60 + Math.random() * 80;
    }
    const head = map.project([p.lng, p.lat]);
    const tail = map.project([p.lng - tailLng, p.lat - tailLat]);
    const alpha = Math.min(1, p.life / 40) * (night ? 0.8 : 0.55);
    const grad = fxCtx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    grad.addColorStop(0, "rgba(" + headCol + ",0)");
    grad.addColorStop(1, "rgba(" + headCol + "," + alpha + ")");
    fxCtx.strokeStyle = grad;
    fxCtx.beginPath();
    fxCtx.moveTo(tail.x, tail.y);
    fxCtx.lineTo(head.x, head.y);
    fxCtx.stroke();
  });
}

// Power/data heuristics — the wind canvas is purely decorative, so it stays
// off under reduced-motion/reduced-data, Data Saver, low-end hardware, or a
// draining battery (Phase 6). Each signal is feature-detected and optional.
function fxStaticDisabled() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  try { if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return true; } catch (e) {}
  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  if (conn && conn.saveData) return true;
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 2) return true;
  const mem = navigator.deviceMemory;
  if (typeof mem === "number" && mem > 0 && mem <= 1) return true;
  return false;
}

function fxBatterySaving() {
  return !!fxBattery && !fxBattery.charging &&
    typeof fxBattery.level === "number" && fxBattery.level <= 0.2;
}

function fxStart() {
  if (fxRafId || !fxCtx) return;
  fxLastTs = 0;
  fxRafId = requestAnimationFrame(fxFrame);
}

function fxStop() {
  if (fxRafId) { cancelAnimationFrame(fxRafId); fxRafId = 0; }
  if (fxCtx) fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
}

// Recompute whether the canvas may run and start/stop the rAF loop to match,
// so a disabled canvas costs zero frames (not just a blank per-frame draw).
// fxOn combines user intent with the power/data gate; the loop additionally
// only runs above the zoom threshold and while the tab is visible.
function refreshWindCanvasPower() {
  state.fxOn = state.fxUserEnabled && !fxStaticDisabled() && !fxBatterySaving();
  refreshWindCanvasZoomGate();
}

// Start/stop the loop for the transient conditions (zoom, visibility) without
// re-running the power heuristics — cheap enough to call on every zoom tick.
function refreshWindCanvasZoomGate() {
  if (!fxCtx) return;
  const shouldRun = state.fxOn && !document.hidden && state.mapReady
    && map.getZoom() >= WIND_CANVAS_MIN_ZOOM;
  if (shouldRun) {
    if (!fxParticles.length) fxInitParticles();
    fxStart();
  } else {
    fxStop();
  }
}

function initWindCanvas() {
  if (!fxCanvas) return;
  fxResize();
  window.addEventListener("resize", fxResize);
  if (typeof map !== "undefined" && map) {
    map.on("resize", fxResize);
    map.on("load", fxResize);
  }
  // React live to power/data/motion changes (canvas turns off and back on) and
  // to tab visibility so it never animates while hidden.
  const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (rm.addEventListener) rm.addEventListener("change", refreshWindCanvasPower);
  else if (rm.addListener) rm.addListener(refreshWindCanvasPower);
  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  if (conn && conn.addEventListener) conn.addEventListener("change", refreshWindCanvasPower);
  document.addEventListener("visibilitychange", refreshWindCanvasPower);
  if (typeof navigator.getBattery === "function") {
    navigator.getBattery().then((bat) => {
      fxBattery = bat;
      bat.addEventListener("levelchange", refreshWindCanvasPower);
      bat.addEventListener("chargingchange", refreshWindCanvasPower);
      refreshWindCanvasPower();
    }).catch(() => {});
  }
  refreshWindCanvasPower();
}

// --- Phase 4d: tide (NOAA CO-OPS via the C1 station index) -----------------
// Tide follows the forecast location (owner decision #3): the nearest of the
// ~3,017 CO-OPS stations is found by haversine and only shown when it is within
// TIDE_MAX_DISTANCE_KM (so deep-inland locations show no tide). Graceful: any
// failure leaves state.tide null and the tide segment/panel simply don't show.
const TIDE_MAX_DISTANCE_KM = 100;
const TIDE_TTL_MS = 60 * 60 * 1000;
let tideStationsCache = null;

function loadTideStations() {
  if (tideStationsCache) return Promise.resolve(tideStationsCache);
  return fetch("./data/tide-stations.json")
    .then((r) => { if (!r.ok) throw new Error("tide-stations " + r.status); return r.json(); })
    .then((data) => { if (Array.isArray(data)) tideStationsCache = data; return tideStationsCache; })
    .catch(() => tideStationsCache);
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const r = 6371;
  const dLat = (lat2 - lat1) * RAD, dLng = (lng2 - lng1) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

function nearestTideStation(lat, lng, stations) {
  let best = null, bestDist = Infinity;
  for (const station of stations) {
    const dist = haversineKm(lat, lng, station.lat, station.lng);
    if (dist < bestDist) { bestDist = dist; best = station; }
  }
  return best ? { station: best, distanceKm: bestDist } : null;
}

function nextTide() {
  if (!state.tide || !state.tide.events) return null;
  return state.tide.events.find((e) => +new Date(e.t) > Date.now()) || null;
}

function loadTide() {
  return loadTideStations().then((stations) => {
    if (!stations) { state.tide = null; renderConditionsRail(); return; }
    const nearest = nearestTideStation(state.location.lat, state.location.lng, stations);
    if (!nearest || nearest.distanceKm > TIDE_MAX_DISTANCE_KM) {
      state.tide = null;
      renderConditionsRail();
      // Keep the tide panel open when moving inland — it now explains that
      // tides are coastal-only rather than disappearing.
      if (openConditionSeg === "tide") renderConditionPanel();
      return;
    }
    const station = nearest.station;
    const cacheKey = `craftAlmanacTide:${station.id}`;
    try {
      const cached = JSON.parse(window.localStorage?.getItem(cacheKey) || "null");
      if (cached && Date.now() - cached.t < TIDE_TTL_MS) {
        state.tide = cached.v;
        renderConditionsRail();
        if (openConditionSeg === "tide") renderConditionPanel();
        return;
      }
    } catch {
      // ignore cache errors
    }
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const ds = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
    const url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions" +
      "&application=craftalmanac&station=" + encodeURIComponent(station.id) +
      "&begin_date=" + ds + "&range=48&datum=MLLW&interval=hilo&units=english&time_zone=lst_ldt&format=json";
    return fetchWithTimeout(url)
      .then((r) => { if (!r.ok) throw new Error("co-ops " + r.status); return r.json(); })
      .then((j) => {
        const events = (j.predictions || []).map((p) => ({ t: p.t, type: p.type, v: parseFloat(p.v) }));
        if (events.length) {
          state.tide = { events, stationId: station.id, stationName: station.name };
          try { window.localStorage?.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: state.tide })); } catch { /* quota */ }
        } else {
          state.tide = null;
        }
        renderConditionsRail();
        if (openConditionSeg === "tide") renderConditionPanel();
      })
      .catch(() => { state.tide = null; renderConditionsRail(); });
  });
}

function conditionsIconTide(rising) {
  return `<svg viewBox="0 0 22 22" fill="none" stroke="var(--reg-sub)" stroke-width="1.6" stroke-linecap="round">
    <path d="M2 14 Q 5.5 10, 9 14 T 16 14 T 23 14"/>
    <path d="M11 ${rising ? "10 V 4 M 8.5 6.5 L 11 4 L 13.5 6.5" : "4 V 10 M 8.5 7.5 L 11 10 L 13.5 7.5"}" stroke="var(--reg-accent)"/></svg>`;
}

function svgTideCurve(events, w = 320, h = 122) {
  if (!events || events.length < 2) return "";
  const now = Date.now();
  const t0 = now - 2 * 36e5, t1 = now + 26 * 36e5;
  const X = (t) => (t - t0) / (t1 - t0) * (w - 16) + 8;
  const vs = events.map((e) => e.v);
  const vmin = Math.min(...vs) - 0.4, vmax = Math.max(...vs) + 0.4;
  const Y = (v) => h - 24 - (v - vmin) / (vmax - vmin) * (h - 44);
  const pts = [];
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i], b = events[i + 1];
    const ta = +new Date(a.t), tb = +new Date(b.t);
    for (let s = 0; s <= 14; s++) {
      const u = s / 14, t = ta + (tb - ta) * u;
      if (t < t0 || t > t1) continue;
      const v = a.v + (b.v - a.v) * (1 - Math.cos(Math.PI * u)) / 2;
      pts.push([X(t), Y(v)]);
    }
  }
  if (pts.length < 2) return "";
  const path = "M " + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
  const marks = events.filter((e) => +new Date(e.t) >= t0 && +new Date(e.t) <= t1).map((e) => {
    const x = X(+new Date(e.t)), y = Y(e.v);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="var(--reg-accent)"/>
      <text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="9.5" fill="var(--reg-ink)" text-anchor="middle">${e.type}</text>
      <text x="${x.toFixed(1)}" y="${h - 4}" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="8.5" fill="var(--reg-sub)" text-anchor="middle">${formatClockTime(e.t)}</text>`;
  }).join("");
  const nowX = X(now);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <path d="${path} L ${pts[pts.length - 1][0].toFixed(1)} ${h - 18} L ${pts[0][0].toFixed(1)} ${h - 18} Z" fill="var(--reg-accent)" opacity="0.13"/>
    <path d="${path}" fill="none" stroke="var(--reg-accent)" stroke-width="2"/>
    <line x1="${nowX.toFixed(1)}" y1="10" x2="${nowX.toFixed(1)}" y2="${h - 18}" stroke="var(--reg-ink)" stroke-width="1" stroke-dasharray="2 3"/>
    <text x="${nowX.toFixed(1)}" y="8" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="9.5" fill="var(--reg-ink)" text-anchor="middle">NOW</text>
    ${marks}
  </svg>`;
}

// --- Phase 4e: RainViewer radar (low zoom) + rain-fed flush pulses ----------
// Radar is a raster precipitation layer shown below ~7.5 zoom (the wind canvas
// owns higher zooms — a clean handoff). Flush pulses mark whitelisted fungal
// points when the past-72h rainfall meets that species' C3 threshold, in food
// mode, on currently-visible (selected) records. C3 only lists whitelisted
// fungi, so "has a threshold" is the whitelist gate. Both fail safe: radar is
// an enhancement that's skipped on error; pulses clear when conditions aren't met.
let flushThresholds = null;
let flushMarkers = [];
let radarAdded = false;

function loadFlushThresholds() {
  if (flushThresholds) return Promise.resolve(flushThresholds);
  return fetch("./data/flush-thresholds.json")
    .then((r) => { if (!r.ok) throw new Error("flush-thresholds " + r.status); return r.json(); })
    .then((data) => { flushThresholds = data; return data; })
    .catch(() => flushThresholds);
}

function loadRadar() {
  if (radarAdded || !state.mapReady || map.getSource("radar")) return;
  fetchWithTimeout("https://api.rainviewer.com/public/weather-maps.json")
    .then((r) => { if (!r.ok) throw new Error("rainviewer " + r.status); return r.json(); })
    .then((j) => {
      const past = (j.radar && j.radar.past) || [];
      if (!past.length || map.getSource("radar")) return;
      const tiles = j.host + past[past.length - 1].path + "/256/{z}/{x}/{y}/2/1_1.png";
      map.addSource("radar", { type: "raster", tiles: [tiles], tileSize: 256, maxzoom: 6, attribution: "Radar © RainViewer" });
      const beforeId = map.getLayer(FALLING_FRUIT_AGGREGATE_LAYER_ID) ? FALLING_FRUIT_AGGREGATE_LAYER_ID : undefined;
      map.addLayer({
        id: "radar", type: "raster", source: "radar", slot: "top",
        paint: { "raster-opacity": 0, "raster-opacity-transition": { duration: 600 } }
      }, beforeId);
      radarAdded = true;
      updateRadarZoom();
    })
    .catch(() => { /* radar is an enhancement; the map works without it */ });
}

function updateRadarZoom() {
  if (!state.mapReady || !map.getLayer("radar")) return;
  const low = map.getZoom() < WIND_CANVAS_MIN_ZOOM;
  map.setPaintProperty("radar", "raster-opacity", low ? 0.55 : 0);
}

function refreshFlush() {
  flushMarkers.forEach((m) => m.remove());
  flushMarkers = [];
  if (!state.mapReady || !state.weather || state.activeMap !== "food" || !flushThresholds) return;
  const past72 = state.weather.past72;
  getVisibleRecords().forEach((record) => {
    const species = getSpecies(record.speciesId);
    if (!species || species.category !== "mushroom") return;
    const threshold = flushThresholds[species.id];
    if (!threshold || past72 < threshold.thresholdMm72h) return;
    const lat = Number(record.lat), lng = Number(record.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const el = document.createElement("div");
    el.className = "flush-pulse";
    el.title = `${species.commonName}: rain-fed flush likely (past 72 h ${past72} mm ≥ ${threshold.thresholdMm72h} mm)`;
    flushMarkers.push(new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
  });
}

const dataStatus = document.querySelector("#dataStatus");
const daySlider = document.querySelector("#daySlider");
const dateInput = document.querySelector("#dateInput");
const seasonDateLabel = document.querySelector("#seasonDateLabel");
const seasonName = document.querySelector("#seasonName");
const seasonHistogram = document.querySelector("#seasonHistogram");
const categoryList = document.querySelector("#categoryList");
const accessStatusList = document.querySelector("#accessStatusList");
const mapLegend = document.querySelector("#mapLegend");
const conditionsRail = document.querySelector("#conditions-rail");
const railPanel = document.querySelector("#rail-panel");
const railPad = document.querySelector("#rail-pad");
const locationSearchForm = document.querySelector("#locationSearchForm");
const locationSearchInput = document.querySelector("#locationSearchInput");
const locationSearchSuggestions = document.querySelector("#locationSearchSuggestions");
const locationSearchStatus = document.querySelector("#locationSearchStatus");
const welcomeModal = document.querySelector("#welcomeModal");
const welcomeModalButton = document.querySelector("#welcomeModalButton");
let categoryInputs = [];
const allSeasonsButton = document.querySelector("#allSeasonsButton");
const seasonReset = document.querySelector("#seasonReset");
const whenToggle = document.querySelector("#whenToggle");
const whenApply = document.querySelector("#whenApply");
const whenForm = document.querySelector("#whenForm");
const seasonHist = document.querySelector("#seasonHist");
const seasonHistHead = document.querySelector("#seasonHistHead");
const seasonCats = document.querySelector("#seasonCats");
const seasonBar = document.querySelector("#season-bar");
const legendSlot = document.querySelector("#legendSlot");
const legendMob = document.querySelector("#legendMob");
const masthead = document.querySelector("#masthead");
const mastMenuBtn = document.querySelector("#mastMenuBtn");
const mastSearchBtn = document.querySelector("#mastSearchBtn");
const mastCondBtn = document.querySelector("#mastCondBtn");
const mastCondVal = document.querySelector("#mastCondVal");

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
  // Coalesce into contiguous runs so a species dormant mid-year (e.g. chickweed,
  // Feb–May + Oct–Dec) reads "Feb-May, Oct-Dec" instead of a misleading
  // min–max "Feb-Dec" that implies summer availability.
  const sortedMonths = [...new Set(months)].filter((m) => m >= 1 && m <= 12).sort((a, b) => a - b);
  if (!sortedMonths.length) return "Unknown";
  const runs = [];
  let start = sortedMonths[0];
  let prev = sortedMonths[0];
  for (let i = 1; i < sortedMonths.length; i++) {
    if (sortedMonths[i] === prev + 1) { prev = sortedMonths[i]; continue; }
    runs.push([start, prev]);
    start = prev = sortedMonths[i];
  }
  runs.push([start, prev]);
  // Merge a run that wraps the year boundary (e.g. [11,12,1] -> "Nov-Jan").
  if (runs.length > 1 && runs[0][0] === 1 && runs[runs.length - 1][1] === 12) {
    const head = runs.shift();
    runs[runs.length - 1] = [runs[runs.length - 1][0], head[1]];
  }
  return runs
    .map(([a, b]) => (a === b ? MONTHS[a - 1] : `${MONTHS[a - 1]}-${MONTHS[b - 1]}`))
    .join(", ");
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

// Externally-sourced URLs (iNaturalist observation.uri, Falling Fruit chunk
// data) land in popup hrefs. escapeHTML neutralizes quotes but NOT a
// `javascript:`/`data:` scheme, so restrict hrefs to http(s) before emitting.
function safeHttpUrl(value) {
  if (!value) return "";
  try {
    const parsed = new URL(String(value), window.location.href);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") ? parsed.href : "";
  } catch {
    return "";
  }
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
  try {
    window.localStorage?.setItem(FAVORITE_SPECIES_STORAGE_KEY, JSON.stringify([...state.favoriteSpecies]));
  } catch { /* quota exceeded / Safari private mode — keep the in-memory set */ }
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
  try {
    window.localStorage?.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify([...state.savedLocations]));
  } catch { /* quota exceeded / Safari private mode — keep the in-memory set */ }
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
  state.selectedSpecies = new Set(speciesCatalog.map((species) => species.id));
  speciesCatalogByName = sortCatalogByName(speciesCatalog);
  speciesCatalogById = new Map(speciesCatalog.map((species) => [species.id, species]));
  CATEGORIES = config.categories.map((category) => category.id);
  CATEGORY_COLORS = config.categoryColors;
}

function renderModeChrome() {
  const config = getActiveMapConfig();
  const dataNotesEl = document.querySelector(".attribution-block .section-body p");
  if (dataNotesEl) dataNotesEl.textContent = config.dataNotes;
  // Persistent on-map herbalism disclaimer (CLAUDE.md non-negotiable; prototype
  // #mode-disclaimer) — shown only in the medicine/herbalism map.
  const disclaimer = document.getElementById("mode-disclaimer");
  if (disclaimer) disclaimer.hidden = state.activeMap !== "medicine";
  renderMapLegend();
}

function renderFilterControls() {
  const config = getActiveMapConfig();
  // #categoryList was removed in Phase 3e (replaced by the legend category
  // chips). Keep this guard for older markup, but species selection now lives
  // in state and is driven by floating legend chips plus Plants-sheet cards.
  if (categoryList) {
    categoryList.innerHTML = config.categories.map((category) => `
      <label class="category-option ${category.id}">
        <input type="checkbox" name="category" value="${category.id}" checked> ${category.label}
      </label>
    `).join("");
  }

  categoryInputs = [...document.querySelectorAll("input[name='category']")];
  categoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      setSpeciesByCategory(input.value, input.checked);
      render();
    });
  });
}

function initAccessControls() {
  // Phase 3e: the access filter now lives in state and is driven by the
  // floating legend's access chips; the old panel checkbox section is gone.
  state.selectedAccessStatuses = new Set(getDefaultAccessStatuses());
}

function getDefaultAccessStatuses() {
  return ACCESS_STATUS_OPTIONS.filter((option) => option.defaultChecked).map((option) => option.id);
}

function getSelectedAccessStatuses() {
  // Source of truth is state (Phase 3e removed the panel's access checkboxes);
  // the legend access chips read and write this set.
  if (!state.selectedAccessStatuses) {
    state.selectedAccessStatuses = new Set(getDefaultAccessStatuses());
  }
  return new Set(state.selectedAccessStatuses);
}

function toggleAccessStatus(statusId) {
  const set = state.selectedAccessStatuses
    || (state.selectedAccessStatuses = new Set(getDefaultAccessStatuses()));
  if (set.has(statusId)) {
    set.delete(statusId);
  } else {
    set.add(statusId);
  }
}

// Legend "ONLY ALLOWED" quick filter (prototype #only-allowed): toggles between
// allowed-only and the full default status set.
function setOnlyAllowed() {
  const set = getSelectedAccessStatuses();
  const onlyAllowed = set.size === 1 && set.has("allowed");
  state.selectedAccessStatuses = new Set(onlyAllowed ? getDefaultAccessStatuses() : ["allowed"]);
}

function isAccessFilterActive(selectedStatuses = getSelectedAccessStatuses()) {
  const defaults = getDefaultAccessStatuses();
  return selectedStatuses.size !== defaults.length || defaults.some((id) => !selectedStatuses.has(id));
}

function initWelcomeModal() {
  if (!welcomeModal || !welcomeModalButton) return;
  const hasSeenModal = window.localStorage?.getItem(WELCOME_MODAL_STORAGE_KEY) === "true";
  if (hasSeenModal) return;

  const focusAfterClose = document.querySelector(".mapboxgl-ctrl-zoom-in") || document.body;
  welcomeModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => welcomeModalButton.focus(), 0);

  let dismissed = false;
  const dismissWelcome = () => {
    if (dismissed) return;
    dismissed = true;
    // Dismissal IS acknowledgement (the only exit is "I understand"), so both
    // the button and Escape set the seen flag. Guard the write so a private-mode
    // / quota failure still closes the modal instead of trapping the user.
    try { window.localStorage?.setItem(WELCOME_MODAL_STORAGE_KEY, "true"); } catch { /* private mode */ }
    welcomeModal.hidden = true;
    document.body.classList.remove("modal-open");
    focusAfterClose?.focus?.();
  };

  welcomeModalButton.addEventListener("click", dismissWelcome, { once: true });

  welcomeModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); dismissWelcome(); return; }
    if (event.key !== "Tab") return;
    event.preventDefault();
    welcomeModalButton.focus();
  });
}

function getCategoryLabel(categoryId) {
  return getActiveMapConfig().categories.find((category) => category.id === categoryId)?.label || categoryId;
}

// Floating legend doubles as the interactive filter UI (Phase 3b). Category
// chips bulk-toggle species selection (same mechanism as the panel category
// checkboxes); access chips toggle the permission filter. Both drive the
// existing checkbox inputs, so the filtered-aggregates pipeline is unchanged;
// the panel's category/access sections are removed later in 3e.
function renderMapLegend() {
  if (!mapLegend) return;
  const config = getActiveMapConfig();
  const selectedAccess = getSelectedAccessStatuses();
  const permissionOptions = [...LEGEND_PERMISSION_OPTIONS, { id: "prohibited", label: "Prohibited" }];

  const accessChips = permissionOptions.map((status) => {
    const token = ACCESS_STATUS_TOKEN[status.id] || "unknown";
    const off = !selectedAccess.has(status.id);
    return `<button type="button" class="leg-chip${off ? " off" : ""}" data-leg-access="${escapeHTML(status.id)}" aria-pressed="${String(!off)}"><span class="ring" style="color: var(--reg-st-${token})"></span>${escapeHTML(status.label)}</button>`;
  }).join("");

  const categoryChips = config.categories.map((category) => {
    const selection = getCategorySelectionState(category.id);
    const color = config.categoryColors[category.id] || "#777";
    const cls = selection === "none" ? " off" : selection === "some" ? " partial" : "";
    return `<button type="button" class="leg-chip${cls}" data-leg-category="${escapeHTML(category.id)}" aria-pressed="${String(selection !== "none")}"><span class="swatch" style="color: ${escapeHTML(color)}"></span>${escapeHTML(category.label)}</button>`;
  }).join("");

  const modeName = { food: "FOOD", ink: "INK", medicine: "HERBALISM" }[state.activeMap] || String(state.activeMap || "").toUpperCase();
  const catHeading = config.speciesHeading.replace(/\s*&\s*(Species|Materials)/i, "").toUpperCase();
  const selected = getSelectedAccessStatuses();
  const onlyAllowedActive = selected.size === 1 && selected.has("allowed");

  // Prototype layout: a collapsed title bar (bottom-left) that expands UP on
  // hover/focus into two columns — ACCESS (rings) | CATEGORIES (filled squares).
  mapLegend.innerHTML = `
    <div class="legend-body">
      <div class="legend-cols">
        <div class="legend-col">
          <span class="legend-k">ACCESS</span>
          <div class="legend-chips">${accessChips}</div>
          <button type="button" class="legend-only${onlyAllowedActive ? " active" : ""}" data-legend-only="1" aria-pressed="${String(onlyAllowedActive)}">ONLY ALLOWED</button>
        </div>
        <div class="legend-col">
          <span class="legend-k">${escapeHTML(catHeading)}</span>
          <div class="legend-chips">${categoryChips}</div>
        </div>
      </div>
    </div>
    <div class="legend-title"><strong>LEGEND:</strong> PERMISSIONS AND POINTS</div>
    <div class="legend-active">ACTIVE MAP: ${escapeHTML(modeName)}</div>
  `;
}

function getCategorySelectionState(categoryId) {
  const inCategory = speciesCatalog.filter((species) => species.category === categoryId);
  if (!inCategory.length) return "none";
  const selected = inCategory.filter((species) => state.selectedSpecies.has(species.id)).length;
  if (selected === 0) return "none";
  if (selected === inCategory.length) return "all";
  return "some";
}

// One delegated handler on the legend container; survives innerHTML rebuilds.
function initMapLegend() {
  if (!mapLegend) return;
  mapLegend.addEventListener("click", (event) => {
    if (event.target.closest("[data-legend-only]")) {
      setOnlyAllowed();
      render();
      return;
    }
    const accessChip = event.target.closest("[data-leg-access]");
    if (accessChip) {
      toggleAccessStatus(accessChip.dataset.legAccess);
      render();
      return;
    }
    const categoryChip = event.target.closest("[data-leg-category]");
    if (categoryChip) {
      const id = categoryChip.dataset.legCategory;
      setSpeciesByCategory(id, getCategorySelectionState(id) !== "all");
      render();
    }
  });
  renderMapLegend();
}

// ---------------------------------------------------------------------------
// Masthead sheets (Phase 3d): Maps / Plants / Recipes / About overlays built on
// the .mini-card/.card-grid shells. Maps switches mode; Plants is backed by the
// live per-mode catalog; Recipes are the three placeholders per work-order §5
// #2; About carries the ethics + herbalism disclaimers (launch checklist).
// ---------------------------------------------------------------------------
const MODE_SHEET_INFO = {
  food: { label: "Food", color: "#6b7f2e", blurb: "Berries · fruit · mushrooms · nuts" },
  ink: { label: "Ink", color: "#3a3f3d", blurb: "Pigments by color, oak gall to goldenrod" },
  medicine: { label: "Herbalism", color: "#7a4a52", blurb: "Plants in the traditional materia medica" }
};
const RECIPE_PLACEHOLDERS = [
  { name: "Oak gall ink", meta: "6 steps · 2 days", color: "#3a3f3d" },
  { name: "Pokeberry ink", meta: "5 steps · evening", color: "#c03b5a" },
  { name: "Walnut dye bath", meta: "4 steps · weekend", color: "#5c4632" }
];

function sheetAboutHTML() {
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">CRAFT ALMANAC</div>
    <h2 class="serif">A map that keeps the almanac's hours</h2>
    <p>Craft Almanac shares local material availability, ethical harvesting practice, craft knowledge, and safety information — in collaboration with the places it maps. The map is the front door; plant profiles and project recipes live one tap away.</p>
    <p><strong>Occurrence is never permission.</strong> Records show where something has been seen, not that you may take it. Every point carries its parcel's rule, and unknowns say so.</p>
    <p><strong>Herbalism content is educational reference only</strong> — historical and traditional use, not medical advice.</p>
    <p><a href="./attribution.html" target="_blank" rel="noreferrer">Attribution and data-use notes →</a></p>
  `;
}

function sheetMapsHTML() {
  const cards = Object.keys(MODE_SHEET_INFO).map((mode) => {
    const info = MODE_SHEET_INFO[mode];
    const on = state.activeMap === mode ? " on" : "";
    const dnote = mode === "medicine"
      ? `<div class="dnote">EDUCATIONAL REFERENCE ONLY — NOT MEDICAL ADVICE</div>`
      : "";
    return `
      <div class="mini-card mode-card${on}" data-mode="${escapeHTML(mode)}" role="button" tabindex="0">
        <div class="spine" style="background: ${escapeHTML(info.color)}"></div>
        <h3 class="serif">${escapeHTML(info.label)}</h3>
        <div class="uses">${escapeHTML(info.blurb)}</div>
        ${dnote}
      </div>`;
  }).join("");
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">THE MAPS · ONE ACTIVE AT A TIME</div>
    <h2 class="serif">Choose your map</h2>
    <p>Each map shows the same places through a different practice. The legend categories and the season chart follow your choice.</p>
    <div class="card-grid">${cards}</div>
  `;
}

function sheetPlantsHTML() {
  const config = getActiveMapConfig();
  const cards = speciesCatalogByName.map((species) => {
    const color = CATEGORY_COLORS[species.category] || "#777";
    const season = getMonthRangeText(species.months);
    const uses = species.usedParts || getCategoryLabel(species.category);
    return `
      <div class="mini-card" data-species="${escapeHTML(species.id)}" role="button" tabindex="0">
        <div class="spine" style="background: ${escapeHTML(color)}"></div>
        <h3 class="serif">${escapeHTML(species.commonName)}</h3>
        <div class="m">${escapeHTML(species.scientificName)} · ${escapeHTML(season)}</div>
        <div class="uses">${escapeHTML(uses)}</div>
      </div>`;
  }).join("");
  // Herbalism profiles present medicinal use-parts, so the educational-use
  // disclaimer must travel with them (CLAUDE.md), as it does on the map note,
  // the Maps card, and the point card.
  const medNote = state.activeMap === "medicine"
    ? `<div class="dnote">EDUCATIONAL REFERENCE ONLY — NOT MEDICAL ADVICE</div>`
    : "";
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">THE SHELF · ${speciesCatalogByName.length} PROFILES</div>
    <h2 class="serif">${escapeHTML(config.speciesHeading)}</h2>
    <p>Tap a profile to show just that species on the map.</p>
    ${medNote}
    <div class="card-grid">${cards}</div>
  `;
}

function sheetRecipesHTML() {
  const cards = RECIPE_PLACEHOLDERS.map((recipe) => `
    <div class="mini-card recipe-card">
      <div class="spine" style="background: ${escapeHTML(recipe.color)}"></div>
      <h3 class="serif">${escapeHTML(recipe.name)}</h3>
      <div class="m">${escapeHTML(recipe.meta.toUpperCase())}</div>
      <div class="uses">gather → prepare → make</div>
    </div>`).join("");
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">THE PRESS · 3 RECIPES</div>
    <h2 class="serif">Project recipes</h2>
    <p>Full step-by-step recipes arrive after launch — these three are placeholders for the template.</p>
    <div class="card-grid">${cards}</div>
  `;
}

const SHEET_BUILDERS = {
  maps: sheetMapsHTML,
  plants: sheetPlantsHTML,
  recipes: sheetRecipesHTML,
  about: sheetAboutHTML
};

let sheetOpener = null;

function openSheet(name) {
  const sheetWrap = document.querySelector("#sheet-wrap");
  const sheetEl = document.querySelector("#sheet");
  const builder = SHEET_BUILDERS[name];
  if (!sheetWrap || !sheetEl || !builder) return;
  // Remember who opened it and neutralize the background so the modal traps
  // focus and pointer interaction (#sheet-wrap is a sibling of .app-shell).
  sheetOpener = document.activeElement;
  sheetEl.innerHTML = builder();
  sheetWrap.classList.add("open");
  sheetWrap.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector(".app-shell")?.setAttribute("inert", "");
  sheetEl.scrollTop = 0;
  sheetEl.querySelector(".closer")?.focus?.();
}

function closeSheet() {
  const sheetWrap = document.querySelector("#sheet-wrap");
  if (!sheetWrap) return;
  sheetWrap.classList.remove("open");
  sheetWrap.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.querySelector(".app-shell")?.removeAttribute("inert");
  // Restore focus to the control that opened the sheet (un-inert it first).
  if (sheetOpener && typeof sheetOpener.focus === "function") sheetOpener.focus();
  sheetOpener = null;
}

function selectOnlySpecies(speciesId) {
  state.savedLocationsOnly = false;
  state.selectedSpecies = new Set([speciesId]);
  render();
}

function initSheets() {
  const sheetWrap = document.querySelector("#sheet-wrap");
  const sheetEl = document.querySelector("#sheet");
  if (!sheetWrap || !sheetEl) return;
  document.querySelectorAll("#masthead .links button[data-sheet]").forEach((button) => {
    button.addEventListener("click", () => openSheet(button.dataset.sheet));
  });
  sheetEl.addEventListener("click", (event) => {
    if (event.target.closest(".closer")) { closeSheet(); return; }
    const modeCard = event.target.closest("[data-mode]");
    if (modeCard) { const mode = modeCard.dataset.mode; closeSheet(); setMapMode(mode); return; }
    const speciesCard = event.target.closest("[data-species]");
    if (speciesCard) { selectOnlySpecies(speciesCard.dataset.species); closeSheet(); }
  });
  sheetEl.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      const focusables = sheetEl.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-mode], [data-species]");
    if (!card) return;
    event.preventDefault();
    card.click();
  });
  sheetWrap.addEventListener("click", (event) => {
    if (event.target === sheetWrap) closeSheet();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheetWrap.classList.contains("open")) closeSheet();
  });
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

function toggleFavoriteSpecies(speciesId) {
  if (!speciesId) return;
  if (state.favoriteSpecies.has(speciesId)) {
    state.favoriteSpecies.delete(speciesId);
  } else {
    state.favoriteSpecies.add(speciesId);
  }
  saveFavoriteSpecies();
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
  loadPhenology(mode).then(() => { if (state.activeMap === mode) renderHistogram(); });
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
  // Keyboard combobox navigation over the suggestion listbox.
  locationSearchInput.addEventListener("keydown", (event) => {
    const open = locationSearchSuggestions && !locationSearchSuggestions.hidden && state.locationSuggestions.length;
    if (event.key === "ArrowDown") {
      if (!open) return;
      event.preventDefault();
      moveActiveSuggestion(1);
    } else if (event.key === "ArrowUp") {
      if (!open) return;
      event.preventDefault();
      moveActiveSuggestion(-1);
    } else if (event.key === "Enter") {
      if (open && state.activeSuggestionIndex >= 0) {
        event.preventDefault();
        chooseLocationSuggestion(state.locationSuggestions[state.activeSuggestionIndex]);
      }
      // otherwise fall through to the form's submit handler (best-match search)
    } else if (event.key === "Escape") {
      // Staged Escape: first press closes the open suggestions (and stops the
      // masthead's document-level Escape from also collapsing the search panel);
      // a second press, with no suggestions, falls through to close the panel.
      if (open) { event.preventDefault(); event.stopPropagation(); hideLocationSuggestions(); }
    }
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
  state.activeSuggestionIndex = -1;
  locationSearchSuggestions.innerHTML = state.locationSuggestions.map((feature, index) => `
    <button class="location-suggestion" type="button" role="option" id="locSug-${index}" aria-selected="false" data-suggestion-index="${index}">
      <span>${escapeHTML(feature.text || "Location")}</span>
      <small>${escapeHTML(getLocationSuggestionContext(feature))}</small>
    </button>
  `).join("");
  locationSearchSuggestions.hidden = false;
  locationSearchInput.setAttribute("aria-expanded", "true");
  locationSearchInput.removeAttribute("aria-activedescendant");
  locationSearchSuggestions.querySelectorAll("[data-suggestion-index]").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      chooseLocationSuggestion(state.locationSuggestions[Number(button.dataset.suggestionIndex)]);
    });
  });
}

// Move the active option (keyboard ArrowUp/Down), wrapping, and mirror it to
// aria-activedescendant + aria-selected so screen readers track the highlight.
function moveActiveSuggestion(delta) {
  if (!locationSearchSuggestions || locationSearchSuggestions.hidden) return;
  const count = state.locationSuggestions.length;
  if (!count) return;
  const next = (state.activeSuggestionIndex + delta + count) % count;
  state.activeSuggestionIndex = next;
  locationSearchSuggestions.querySelectorAll(".location-suggestion").forEach((el, i) => {
    const on = i === next;
    el.classList.toggle("active", on);
    el.setAttribute("aria-selected", String(on));
  });
  locationSearchInput.setAttribute("aria-activedescendant", `locSug-${next}`);
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
  // Collapse the mobile search drop-down once a place is chosen.
  setMastPanel(null);
  // Phase 4: conditions (sun/moon/rain/wind) follow the chosen place.
  setForecastLocation(feature.center[1], feature.center[0], (feature.place_name || feature.text || "").toUpperCase());
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
  state.activeSuggestionIndex = -1;
  if (locationSearchInput) {
    locationSearchInput.setAttribute("aria-expanded", "false");
    locationSearchInput.removeAttribute("aria-activedescendant");
  }
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
  initMapLegend();
  initSheets();
  initConditions();
  initLocationSearch();

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

  initWelcomeModal();

  // "Back to now" — reset the scrubber to today (prototype #season-reset).
  seasonReset.addEventListener("click", () => {
    state.selectedDay = getDayOfYear(new Date());
    state.allSeasons = false;
    render();
  });

  allSeasonsButton.addEventListener("click", () => {
    state.allSeasons = !state.allSeasons;
    render();
  });

  // "Set date" reveals the precise date-entry form (prototype #when-form).
  whenToggle.addEventListener("click", () => {
    // On phones SET DATE opens the day slider + histogram (.season-open) — the
    // slider is the only date control there. On wider screens it still reveals
    // the precise calendar entry form (prototype #when-form).
    if (window.matchMedia("(max-width: 720px)").matches) {
      const open = seasonBar.classList.toggle("season-open");
      whenToggle.classList.toggle("active", open);
      whenToggle.setAttribute("aria-expanded", String(open));
      whenForm.hidden = true;
      // Histogram (Set date) and legend never show at once on mobile.
      if (open && legendMob) {
        seasonBar.classList.remove("legend-open");
        legendMob.classList.remove("active");
        legendMob.setAttribute("aria-pressed", "false");
      }
      syncMapControlsOffset();
      return;
    }
    whenForm.hidden = !whenForm.hidden;
    whenToggle.classList.toggle("active", !whenForm.hidden);
    whenToggle.setAttribute("aria-expanded", String(!whenForm.hidden));
  });
  whenApply.addEventListener("click", () => {
    whenForm.hidden = true;
    whenToggle.classList.remove("active");
    whenToggle.setAttribute("aria-expanded", "false");
  });

  initMobileSeasonControls();
  initMobileMasthead();
  initMapControlsOffset();

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
    updateRadarZoom();
    refreshWindCanvasZoomGate();
  });

  map.on("moveend", () => {
    // Panning keeps the loaded points on screen — the fresh viewport's records
    // stream in underneath via scheduleDataLoad rather than blanking first.
    updateFallingFruitAggregates();
    updateMarkerPointVisibility();
    scheduleINaturalistAggregateLoad();
    scheduleDataLoad();
    schedulePublicLandLoad();
  });
}

function getSpecies(speciesId) {
  return speciesCatalogById.get(speciesId);
}

function getTaxonIds(species) {
  return species.inatTaxonIds || [];
}

function getExpectedIconicTaxon(species) {
  return species.category === "mushroom" ? "Fungi" : "Plantae";
}

function getSelectedCatalogItems() {
  return speciesCatalog.filter((species) => state.selectedSpecies.has(species.id));
}

function setSpeciesByCategory(category, checked) {
  speciesCatalog
    .filter((species) => species.category === category)
    .forEach((species) => {
      if (checked) state.selectedSpecies.add(species.id);
      else state.selectedSpecies.delete(species.id);
    });
}

function renderSpeciesState() {
  // The original species checkbox list has been retired; selection is state-backed.
}

function isSpeciesAvailableOnSelectedDate(species) {
  return state.allSeasons || species.months.includes(getSelectedMonth());
}

function getVisibleRecords() {
  const selectedAccessStatuses = new Set(getSelectedAccessStatuses());

  return state.records.filter((record) => {
    if (!state.selectedSpecies.has(record.speciesId)) return false;
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
  // Keep the open solar dial in sync with the season scrubber: re-derive the
  // sunrise/sunset arc and times live as the date slider moves (no-op when the
  // sun panel is closed). updateSunDial self-guards on the dial's presence.
  if (openConditionSeg === "sun") updateSunDial();
  renderSpeciesState();
  renderMapLegend();
  renderAccessFilterNote();
  renderHistogram();
  renderMarkers();
  updateFallingFruitAggregates();
  refreshFlush();
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
  const dayText = state.allSeasons
    ? "All seasons"
    : `${FULL_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  seasonDateLabel.textContent = dayText;
  // Announce the date, not the raw 1-365 number, to screen readers.
  daySlider.setAttribute("aria-valuetext", dayText);
  seasonName.textContent = state.allSeasons ? "Full year" : getSeason(selectedDate);
  daySlider.disabled = state.allSeasons;
  allSeasonsButton.classList.toggle("active", state.allSeasons);
  allSeasonsButton.setAttribute("aria-pressed", String(state.allSeasons));
  // "Back to now" only shows once the scrubber has moved off today (prototype
  // #season.scrubbed) or while in all-seasons mode.
  const scrubbed = state.allSeasons || state.selectedDay !== getDayOfYear(new Date());
  if (seasonReset) seasonReset.hidden = !scrubbed;
}

// Mobile (prototype): the floating legend folds INTO the season card, and the
// histogram pins via a CHART toggle (hover doesn't stick on touch). On phones we
// relocate #mapLegend into #legendSlot; on wider screens it returns to the map.
function initMobileSeasonControls() {
  if (!seasonBar || !legendSlot || !mapLegend) return;
  const legendHome = mapLegend.parentNode;
  const mq = window.matchMedia("(max-width: 720px)");
  const placeLegend = () => {
    if (mq.matches) {
      if (mapLegend.parentNode !== legendSlot) legendSlot.appendChild(mapLegend);
    } else if (mapLegend.parentNode !== legendHome) {
      legendHome.appendChild(mapLegend);
      seasonBar.classList.remove("legend-open");
    }
  };
  placeLegend();
  if (mq.addEventListener) mq.addEventListener("change", placeLegend);
  else if (mq.addListener) mq.addListener(placeLegend);

  if (legendMob) {
    legendMob.addEventListener("click", () => {
      const open = seasonBar.classList.toggle("legend-open");
      legendMob.classList.toggle("active", open);
      legendMob.setAttribute("aria-pressed", String(open));
      // Histogram (Set date) and legend never show at once on mobile.
      if (open && whenToggle) {
        seasonBar.classList.remove("season-open");
        whenToggle.classList.remove("active");
        whenToggle.setAttribute("aria-expanded", "false");
      }
      syncMapControlsOffset();
    });
  }
}

// --- Mobile masthead: collapse search + conditions into the top bar --------
// On phones the location search, the conditions rail, and the primary nav each
// occupied their own stacked card, eating ~180px off the top of the map. They
// now hang off icon triggers in the masthead and drop down one at a time.
function currentMastPanel() {
  if (!masthead) return null;
  if (masthead.classList.contains("menu-open")) return "menu";
  if (masthead.classList.contains("search-open")) return "search";
  if (masthead.classList.contains("cond-open")) return "cond";
  return null;
}

function setMastPanel(name) {
  if (!masthead) return;
  const classes = { menu: "menu-open", search: "search-open", cond: "cond-open" };
  Object.entries(classes).forEach(([key, cls]) => masthead.classList.toggle(cls, key === name));
  mastMenuBtn?.setAttribute("aria-expanded", String(name === "menu"));
  mastSearchBtn?.setAttribute("aria-expanded", String(name === "search"));
  mastCondBtn?.setAttribute("aria-expanded", String(name === "cond"));
  // Collapsing the conditions drop-down also closes any open detail panel, so a
  // sun/moon/rain card can't be left floating on the map with no rail behind it.
  if (name !== "cond" && openConditionSeg) toggleConditionPanel(openConditionSeg);
  if (name === "search" && locationSearchInput) {
    requestAnimationFrame(() => locationSearchInput.focus());
  }
}

function initMobileMasthead() {
  if (!masthead) return;
  const toggle = (name) => setMastPanel(currentMastPanel() === name ? null : name);
  mastMenuBtn?.addEventListener("click", (event) => { event.stopPropagation(); toggle("menu"); });
  mastSearchBtn?.addEventListener("click", (event) => { event.stopPropagation(); toggle("search"); });
  mastCondBtn?.addEventListener("click", (event) => { event.stopPropagation(); toggle("cond"); });
  // Picking a destination from the menu closes it.
  masthead.querySelectorAll(".links button[data-sheet]").forEach((button) => {
    button.addEventListener("click", () => setMastPanel(null));
  });
  // A tap outside the bar and its drop-downs dismisses whatever is open. Use
  // the event's composed path (captured at dispatch) rather than
  // target.closest(): tapping a conditions segment re-renders the rail and
  // detaches the tapped node mid-bubble, so closest() would see an orphan and
  // wrongly treat the in-rail tap as "outside".
  const SAFE = "#masthead, #search-bar, #conditions-rail, #rail-panel";
  document.addEventListener("click", (event) => {
    if (!currentMastPanel()) return;
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const insideSafe = path.length
      ? path.some((node) => node instanceof Element && node.matches?.(SAFE))
      : !!event.target.closest?.(SAFE);
    if (insideSafe) return;
    setMastPanel(null);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && currentMastPanel()) setMastPanel(null);
  });
}

// --- Keep the bottom-right map controls clear of the season card -----------
// The full-width season card sits over the zoom + "find my location" controls
// on phones. Park the controls just above the collapsed card (measured live so
// wrapping buttons never clip them). When the histogram/legend is expanded the
// card covers that corner anyway, so the controls fade out until it collapses.
function syncMapControlsOffset() {
  if (!seasonBar) return;
  if (!window.matchMedia("(max-width: 720px)").matches) {
    document.documentElement.style.removeProperty("--map-ctrl-bottom");
    document.body.classList.remove("season-expanded");
    return;
  }
  const expanded = seasonBar.classList.contains("season-open")
    || seasonBar.classList.contains("legend-open");
  document.body.classList.toggle("season-expanded", expanded);
  if (expanded) return;
  document.documentElement.style.setProperty(
    "--map-ctrl-bottom",
    `${Math.round(seasonBar.offsetHeight) + 16}px`
  );
}

function initMapControlsOffset() {
  if (!seasonBar) return;
  syncMapControlsOffset();
  if (window.ResizeObserver) {
    new ResizeObserver(() => syncMapControlsOffset()).observe(seasonBar);
  }
  window.addEventListener("resize", syncMapControlsOffset);
  window.addEventListener("orientationchange", syncMapControlsOffset);
}

// C2 phenology: per-species 12-month relative-abundance (0-1) curves, loaded
// per mode from data/phenology/<mode>.json. Cached; a null entry marks a failed
// load so the histogram falls back to binary species.months (graceful).
const phenologyByMode = {};
function loadPhenology(mode) {
  if (Object.prototype.hasOwnProperty.call(phenologyByMode, mode)) {
    return Promise.resolve(phenologyByMode[mode]);
  }
  return fetch(`./data/phenology/${mode}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`phenology ${mode}: ${response.status}`);
      return response.json();
    })
    .then((data) => { phenologyByMode[mode] = data; return data; })
    .catch(() => { phenologyByMode[mode] = null; return null; });
}

function renderHistogram() {
  const speciesForChart = speciesCatalog.filter((species) => (
    state.selectedSpecies.has(species.id)
  ));
  const phenology = phenologyByMode[state.activeMap] || null;
  const monthData = MONTHS.map((_, index) => {
    const month = index + 1;
    const weighted = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
    const counts = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
    speciesForChart.forEach((species) => {
      const curve = phenology?.[species.id];
      const inSeason = species.months.includes(month);
      // Real abundance when a curve exists; otherwise binary in-season presence.
      const intensity = curve ? (curve[index] || 0) : (inSeason ? 1 : 0);
      weighted[species.category] += intensity;
      // Bar heights stay phenology-weighted, but the tooltip count must match
      // the "IN SEASON BY MONTH" header: only count species listed for the month.
      if (inSeason) counts[species.category] += 1;
    });
    return { weighted, counts };
  });
  const totals = monthData.map((entry) => (
    CATEGORIES.reduce((sum, category) => sum + entry.weighted[category], 0)
  ));
  const maxTotal = Math.max(0.0001, ...totals);
  const activeMonth = getSelectedMonth();

  seasonHistogram.innerHTML = monthData.map((entry, index) => {
    const total = totals[index];
    const height = total > 0 ? Math.max(6, Math.round((total / maxTotal) * 104)) : 6;
    const activeClass = !state.allSeasons && index + 1 === activeMonth ? " active" : "";
    const segments = CATEGORIES.map((category) => {
      const value = entry.weighted[category];
      if (value <= 0) return "";
      const segmentHeight = Math.max(3, Math.round((value / total) * height));
      return `<div class="histogram-segment ${category}" style="height: ${segmentHeight}px"></div>`;
    }).join("");
    const title = CATEGORIES
      .filter((category) => entry.counts[category])
      .map((category) => `${getCategoryLabel(category)}: ${entry.counts[category]}`)
      .join(", ");
    // Month letters live in the static .season-months row below the bars now.
    return `<div class="histogram-bar${activeClass}" style="height: ${height}px" title="${MONTHS[index]}: ${title || "none in season"}">${segments}</div>`;
  }).join("");

  // Header reflects the active map; the category swatch legend sits below.
  const modeName = { food: "FOOD", ink: "INK", medicine: "HERBALISM" }[state.activeMap] || String(state.activeMap || "").toUpperCase();
  if (seasonHistHead) seasonHistHead.innerHTML = `IN SEASON BY MONTH · <b>${escapeHTML(modeName)} MAP</b> · STACKED BY CATEGORY`;
  renderSeasonCats();
}

function renderSeasonCats() {
  if (!seasonCats) return;
  const config = getActiveMapConfig();
  seasonCats.innerHTML = config.categories.map((category) => {
    const color = config.categoryColors[category.id] || "#777";
    return `<span class="season-cat"><i style="background:${escapeHTML(color)}"></i>${escapeHTML(category.label)}</span>`;
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
        observer: record.observer || "",
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
        months: Array.isArray(species.months) ? species.months.join(",") : "",
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
  // In the point band, keep the last complete overview aggregate on screen
  // until viewport-specific point data is ready. Repainting aggregates here
  // drops iNaturalist overview cells and creates the visible zoom-threshold
  // falloff shown in dense areas.
  if (map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) return;
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
    const statusCounts = item.statusCountsByMode?.[state.activeMap];
    if (statusCounts) {
      return [...selectedAccessStatuses].reduce((total, status) => (
        total + Number(statusCounts[status] || 0)
      ), 0);
    }
    // Legacy fallback for items cached before per-cell statuses existed.
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
  if (Array.isArray(aggregateCentroid)) {
    const statusCentroid = accessFilterActive
      ? getStatusWeightedCenter(
        item.statusCountsByMode?.[state.activeMap],
        item.statusCentroidsByMode?.[state.activeMap],
        selectedAccessStatuses
      )
      : null;
    return statusCentroid || [aggregateCentroid[0], aggregateCentroid[1]];
  }
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

function getStatusWeightedCenter(statusCounts, statusCentroids, selectedAccessStatuses) {
  if (!statusCounts || !statusCentroids) return null;
  let count = 0;
  let weightedLng = 0;
  let weightedLat = 0;
  selectedAccessStatuses.forEach((status) => {
    const centroid = statusCentroids[status];
    const statusCount = Number(statusCounts[status] || 0);
    if (!Array.isArray(centroid) || !statusCount) return;
    weightedLng += centroid[0] * statusCount;
    weightedLat += centroid[1] * statusCount;
    count += statusCount;
  });
  if (!count) return null;
  return [weightedLng / count, weightedLat / count];
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
        // Record-level rules may have been computed (and cached) before the
        // raster arrived; recompute them so provisional area statuses apply.
        state.accessRuleCache.clear();
        renderMarkers();
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
  // Match the prototype's occ-core: a category fill with the access-status color
  // as an OUTER ring (circle-stroke semantics — painted outward from the fill
  // edge), not an inner edge. Sizes are in the 26-unit icon space and scale with
  // icon-size; at the dominant detail zoom they land near the prototype's
  // on-screen radius 5.5 / stroke 2.4.
  const ringWidth = 2.8;
  const fillRadius = 6.4;
  const outlineRadius = fillRadius + ringWidth / 2;

  context.clearRect(0, 0, MARKER_ICON_SIZE, MARKER_ICON_SIZE);
  context.beginPath();
  context.arc(center, center, fillRadius, 0, Math.PI * 2);
  context.fillStyle = fillColor;
  context.fill();

  drawMarkerOutline(context, center, outlineRadius, style.color, style.dashed, ringWidth);

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
  initRegionBoundaryLayers();

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
      slot: "bottom",
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
    });
  }

  if (!map.getLayer(PUBLIC_LANDS_LINE_LAYER_ID)) {
    map.addLayer({
      id: PUBLIC_LANDS_LINE_LAYER_ID,
      type: "line",
      source: PUBLIC_LANDS_SOURCE_ID,
      minzoom: PUBLIC_LANDS_MIN_RENDER_ZOOM,
      slot: "bottom",
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
    });
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
      slot: "top",
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
        "circle-stroke-width": 1.25,
        "circle-emissive-strength": 1
      }
    });
  }

  if (!map.getLayer(FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID)) {
    map.addLayer({
      id: FALLING_FRUIT_AGGREGATE_COUNT_LAYER_ID,
      type: "symbol",
      source: FALLING_FRUIT_AGGREGATE_SOURCE_ID,
      slot: "top",
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
        "text-color": "#243a2a",
        "text-emissive-strength": 1
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
      slot: "top",
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
        "circle-stroke-width": 1.4,
        "circle-emissive-strength": 1
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
      slot: "top",
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
        "text-color": "#1f3d2b",
        "text-emissive-strength": 1
      }
    });
  }

  // Soft white halo behind individual markers, shown only at dusk/night so the
  // points lift off the dark basemap (prototype occ-halo). Added before the
  // marker symbol layer so it renders beneath; opacity is register-driven.
  if (!map.getLayer(MARKER_HALO_LAYER_ID)) {
    map.addLayer({
      id: MARKER_HALO_LAYER_ID,
      type: "circle",
      source: MARKERS_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      minzoom: FALLING_FRUIT_MIN_LOAD_ZOOM,
      slot: "top",
      layout: { "visibility": "none" },
      paint: {
        "circle-color": "#ffffff",
        "circle-blur": 1,
        "circle-opacity": 0,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 11, 14, 15],
        "circle-emissive-strength": 1
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
      slot: "top",
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
      },
      paint: {
        "icon-emissive-strength": 1
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
  // Once a point-band load has landed we keep the points up through any pan and
  // just refresh the data underneath them; viewport coverage no longer gates
  // visibility, so ordinary panning never blanks the map back to the aggregate
  // (the "points vanish when I pan" complaint). pointDataReady is cleared only
  // when crossing up into a genuinely new area (see the zoom handler), which is
  // where the aggregate→points handoff still belongs.
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
  // Allow the viewport to drift a fraction of the loaded extent past its edges
  // before declaring it uncovered, so ordinary panning keeps the already-loaded
  // points on screen instead of flashing back to the aggregate on every nudge.
  const lngTol = (loaded.east - loaded.west) * MARKER_POINT_COVERAGE_TOLERANCE;
  const latTol = (loaded.north - loaded.south) * MARKER_POINT_COVERAGE_TOLERANCE;
  return bounds.getWest() >= loaded.west - lngTol
    && bounds.getEast() <= loaded.east + lngTol
    && bounds.getSouth() >= loaded.south - latTol
    && bounds.getNorth() <= loaded.north + latTol;
}

function updateMarkerPointVisibility() {
  // Individual (unclustered) points and clusters coexist: the two layers are
  // separated by their point_count filters, so Mapbox draws clusters where
  // records are dense and individual pins where they are sparse. We no longer
  // hide every pin while a single cluster is on screen — that left dense areas
  // pinless right up to clusterMaxZoom and forced a costly querySourceFeatures
  // sweep on every sourcedata/move event (the "points never appear past the
  // clusters" + cluster-breakdown lag complaints).
  if (!state.mapReady || !map.getLayer(MARKERS_LAYER_ID)) return;
  const show = shouldShowPointLayers();
  setLayerVisibility(MARKERS_LAYER_ID, show);
  if (map.getLayer(MARKER_HALO_LAYER_ID)) setLayerVisibility(MARKER_HALO_LAYER_ID, show);
  updateMarkerHalo();
}

// The marker halo only shows at dusk/night (prototype occ-halo opacity 0.38).
function updateMarkerHalo() {
  if (!state.mapReady || !map.getLayer(MARKER_HALO_LAYER_ID)) return;
  map.setPaintProperty(MARKER_HALO_LAYER_ID, "circle-opacity", isNightish() ? 0.38 : 0);
}

async function initRegionBoundaryLayers() {
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
        slot: "bottom",
        paint: {
          "fill-color": "#f2efe5",
          "fill-opacity": 0.58
        }
      });
    }

    if (!map.getLayer(REGION_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: REGION_OUTLINE_LAYER_ID,
        type: "line",
        source: REGION_BOUNDARY_SOURCE_ID,
        slot: "bottom",
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
          ],
          "line-emissive-strength": 1
        }
      });
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
    const hp = feature.properties;
    const hoverStatus = hp.accessStatus || "unknown";
    const hoverStatusColor = `var(--reg-st-${ACCESS_STATUS_TOKEN[hoverStatus] || "unknown"})`;
    state.hoverPopup = new mapboxgl.Popup({
      className: "forage-hover-popup",
      closeButton: false,
      closeOnClick: false,
      offset: 12
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `<div class="hover-sp" style="background:${hp.categoryColor || "var(--reg-accent)"}"></div>`
        + `<div class="hover-nm">${escapeHTML(hp.speciesName)}</div>`
        + `<div class="hover-st" style="color:${hoverStatusColor}">${escapeHTML((hp.accessStatusLabel || "Unknown").toUpperCase())}</div>`
      )
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
      className: "forage-popup pt-popup",
      closeButton: false,
      closeOnClick: true,
      maxWidth: "none",
      offset: 14
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(getMarkerPopupHTML(feature.properties))
      .addTo(map);
    bindPopupActions(state.activePopup);
  });

}

function bindPopupActions(popup) {
  const element = popup.getElement();
  if (!element) return;
  const card = element.querySelector(".pt-card");
  const closeButton = element.querySelector(".pt-card .close");
  if (closeButton) {
    closeButton.addEventListener("click", () => popup.remove());
  }
  // Move focus into the dialog and let Escape dismiss it (keyboard parity with
  // the close button; the popup is non-modal so focus is not trapped).
  if (card) {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); popup.remove(); }
    });
    requestAnimationFrame(() => card.focus?.());
  }
  const saveButton = element.querySelector("[data-save-location]");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      toggleSavedLocation(saveButton.dataset.saveLocation);
      updateSaveLocationButton(saveButton);
      refreshSavedView();
    });
  }
}

// Bookmarking a location changes neither the catalog, the filters, nor which
// data to fetch — so skip the full render()'s iNat/Falling-Fruit/PAD-US reloads
// and map.resize, and just repaint the layers the saved set can affect (only
// the saved-only view actually changes what's visible).
function refreshSavedView() {
  renderMarkers();
  updateFallingFruitAggregates();
  refreshFlush();
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

// Monthly seasonality sparkline for the point card (ported from the prototype).
// `months` is a 12-element relative-abundance array; bars are tinted to the
// species' category color, mirroring the season histogram's fill.
function sparkline(months, color, w = 100, h = 24) {
  const mx = Math.max(...months, 1);
  const bars = months.map((v, i) => {
    const bh = Math.max(1.5, (v / mx) * h);
    return `<rect x="${(i * (w / 12) + 1).toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${(w / 12 - 2).toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="${color}"/>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${bars}</svg>`;
}

function getMarkerPopupHTML(properties) {
  const status = properties.accessStatus || "unknown";
  const statusColor = `var(--reg-st-${ACCESS_STATUS_TOKEN[status] || "unknown"})`;
  const accessLabel = escapeHTML(properties.accessStatusLabel || "Unknown");
  const sci = escapeHTML(properties.scientificName || properties.observedScientificName || "");

  // ID-source value: dataset (linked) · license · observer · observed date.
  // License from LICENSE_BY_SOURCE (verbatim from ATTRIBUTION.md); observer
  // present only on iNaturalist records — never fabricated for other sources.
  const safeSourceUrl = safeHttpUrl(properties.sourceUrl);
  const datasetMarkup = safeSourceUrl
    ? `<a class="src-link" href="${escapeHTML(safeSourceUrl)}" target="_blank" rel="noreferrer">${escapeHTML(properties.sourceLabel)}</a>`
    : `<span>${escapeHTML(properties.sourceLabel)}</span>`;
  const license = LICENSE_BY_SOURCE[properties.source] || "";
  const sourceBits = [datasetMarkup];
  if (license) sourceBits.push(escapeHTML(license));
  if (properties.observer) sourceBits.push(`obs. ${escapeHTML(properties.observer)}`);
  if (properties.idDate) sourceBits.push(escapeHTML(properties.idDate));
  const sourceVal = sourceBits.join(" · ");

  // Access rule citation, preserved verbatim from the access rule tables.
  const safeAccessSourceUrl = safeHttpUrl(properties.accessSourceUrl);
  const ruleCite = safeAccessSourceUrl
    ? `<a class="src-link" href="${escapeHTML(safeAccessSourceUrl)}" target="_blank" rel="noreferrer">${escapeHTML(properties.accessSourceLabel || "source")}</a>`
    : escapeHTML(properties.accessSourceLabel || "Local rules not yet sourced");
  const ruleLimit = escapeHTML(properties.accessLimit || "Unknown; confirm local rules before harvesting.");

  // On phones the card renders compact (prototype parity): drop the optional
  // USE row, seasonality sparkline, flush line, and harvest-ethic note.
  const compact = typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(max-width: 720px)").matches;

  const usedPartsRow = (!compact && properties.usedParts)
    ? `<div class="row"><span class="lab">USE</span><span class="val">${escapeHTML(properties.usedParts)}</span></div>`
    : "";
  const safetyTags = String(properties.safetyTags || "").split("|").filter(Boolean);
  const safetyRow = safetyTags.length
    ? `<div class="row safety"><span class="lab">SAFETY</span><span class="val">${safetyTags.map(escapeHTML).join(" · ")}</span></div>`
    : "";
  // Ethic reads as a soft trailing paragraph, not a labeled row (prototype).
  const ethicNote = (!compact && properties.harvestEthic)
    ? `<div class="ethic">${escapeHTML(properties.harvestEthic)}</div>`
    : "";

  // Seasonality sparkline + SEASON range, tinted to the category color.
  const monthSet = new Set(String(properties.months || "").split(",").map(Number).filter(Boolean));
  const monthsArr = Array.from({ length: 12 }, (_, i) => (monthSet.has(i + 1) ? 1 : 0));
  const seasonSpark = monthSet.size
    ? sparkline(monthsArr, properties.categoryColor || "var(--reg-accent)")
    : "";
  const seasonLine = compact
    ? ""
    : `<div class="season-line">${seasonSpark}<span class="t">SEASON · ${escapeHTML(properties.season)}</span></div>`;

  // In-card rain-fed flush callout — same eligibility as the on-map pulses
  // (food mode, whitelisted mushroom, past-72h rain ≥ the species threshold).
  const flushThresh = (flushThresholds && properties.category === "mushroom" && properties.speciesId)
    ? flushThresholds[properties.speciesId]
    : null;
  const flushOn = !compact && state.activeMap === "food" && state.weather && flushThresh
    && state.weather.past72 >= flushThresh.thresholdMm72h;
  const flushLine = flushOn ? `<div class="flush on">RAIN-FED FLUSH LIKELY THIS WEEK</div>` : "";

  const warning = properties.harvestStatus
    ? `<div class="oinp" style="color:var(--reg-warn)">${escapeHTML(properties.harvestStatus)} — ${escapeHTML(properties.harvestNote)}</div>`
    : "";
  // Medicine mode keeps the educational-use disclaimer prominent (CLAUDE.md).
  const medSafetyNote = getActiveMapConfig().safetyNote;
  const medNote = state.activeMap === "medicine" && medSafetyNote
    ? `<div class="med-note">${escapeHTML(medSafetyNote)}</div>`
    : "";
  const saved = isSavedLocation(properties.id);

  return `
    <div class="pt-card${compact ? " compact" : ""}" role="dialog" aria-label="${escapeHTML(properties.speciesName)} details" tabindex="-1">
      <div class="spine" style="background:${statusColor}"></div>
      <button class="close" type="button" aria-label="Close">&times;</button>
      <div class="pad">
        <h2>${escapeHTML(properties.speciesName)}</h2>
        <div class="sci">${sci}</div>
        <div class="row access"><span class="lab">ACCESS</span><span class="val" style="color:${statusColor}"><span class="ring"></span>${accessLabel}</span></div>
        <div class="row"><span class="lab">RULES</span><span class="val">${ruleLimit} · ${ruleCite}</span></div>
        ${safetyRow}
        ${usedPartsRow}
        <div class="row"><span class="lab">PLACE</span><span class="val">${escapeHTML(properties.name)}</span></div>
        <div class="row"><span class="lab">SOURCE</span><span class="val">${sourceVal}</span></div>
        ${seasonLine}
        ${flushLine}
        ${ethicNote}
        ${warning}
        <div class="oinp">OCCURRENCE IS NOT PERMISSION — CHECK THE PARCEL RULE</div>
        ${medNote}
        <button
          class="save-location-button ${saved ? "is-saved" : ""}"
          type="button"
          data-save-location="${escapeHTML(properties.id)}"
          aria-pressed="${String(saved)}"
        >${saved ? "Saved location" : "Save location"}</button>
      </div>
    </div>
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
  // Per-cell permission statuses are baked into grid items at fetch time, so
  // the status raster must be in memory before any tile fetch — always, not
  // just while a permission filter is active. Once cached this resolves
  // immediately, and permission toggles repaint from the stored splits
  // without re-arming the paint gate or refetching tiles.
  await loadStatusRaster();
  if (requestId !== state.activeINaturalistAggregateRequest) return;
  const tiles = getINaturalistAggregateTiles(map.getBounds(), map.getZoom());
  const missingTiles = tiles.filter((tile) => (
    !state.inatAggregateCache.has(getINaturalistAggregateCacheKey(taxonIds, tile))
  ));

  if (missingTiles.length) {
    // Gate repaints while tiles are in flight so partially covered viewports
    // never paint; the previous complete state stays up until the swap.
    setINaturalistAggregateReady(false);
    try {
      // Large status-resolution tile sets (filtered overview) fetch at lower
      // concurrency to stay polite to the iNaturalist tile API; they are a
      // one-time cost per taxon set, cached afterwards.
      const concurrency = missingTiles.length > INATURALIST_GRID_MAX_TILES ? 3 : 6;
      await mapWithConcurrency(missingTiles, concurrency, async (tile) => {
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
  if (state.mapReady && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
    // Overview zooms render entirely from aggregate tiles. Loading viewport
    // records here would overwrite the point-band record set with an
    // iNat-only subset (Falling Fruit declines below the point band), so the
    // cluster source — still claimed by loadedPointBounds and shown by the
    // handoff bridge and on re-entry into covered bounds — would suddenly
    // hold a fraction of its points: the "clusters fall off, then recover
    // with a lag" bug. Keep the last point-band records intact instead.
    if (state.records.length) {
      setDataStatus(`${state.records.length} records held for the point view; overview shows aggregate counts`);
    } else {
      setDataStatus("Overview shows aggregate counts; zoom in to load records");
    }
    return;
  }
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
  if (zoom < 5.4) return [baseBounds];

  const pointZoom = zoom >= FALLING_FRUIT_MIN_LOAD_ZOOM;
  const columns = pointZoom
    ? Math.min(4, Math.max(1, Math.ceil(getBoundsLngSpan(bounds) / 1.5)))
    : getBoundsLngSpan(bounds) > 9 ? 3 : 2;
  const rows = pointZoom
    ? Math.min(3, Math.max(1, Math.ceil((bounds.getNorth() - bounds.getSouth()) / 1.2)))
    : (bounds.getNorth() - bounds.getSouth()) > 5 ? 2 : 1;
  if (columns === 1 && rows === 1) return [baseBounds];
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
        perPage: pointZoom ? INATURALIST_MAX_PER_PAGE : INATURALIST_TILE_PER_PAGE
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
  // Permission statuses are resolved here, per response cell — the finest
  // resolution available — so each bucket carries stable per-status counts.
  // Resolving statuses at paint time from a bucket's count-weighted centroid
  // made whole buckets flip status (and pop in/out of filtered views) every
  // time re-bucketing at a new zoom moved the centroid into a different
  // status-raster cell.
  const bucketScale = (2 ** tile.z) * INATURALIST_GRID_CELL_BUCKETS;
  const modes = Object.keys(MAP_MODE_CONFIG);
  const buckets = new Map();
  Object.values(gridData?.data || {}).forEach((cell) => {
    const count = Number(cell?.cellCount || 0);
    const lng = Number(cell?.longitude);
    const lat = Number(cell?.latitude);
    if (!count || !Number.isFinite(lng) || !Number.isFinite(lat)) return;
    const key = `${Math.floor(lngToTileX(lng, bucketScale))}_${Math.floor(latToTileY(lat, bucketScale))}`;
    const bucket = buckets.get(key) || { count: 0, weightedLng: 0, weightedLat: 0, statusAgg: {} };
    bucket.count += count;
    bucket.weightedLng += lng * count;
    bucket.weightedLat += lat * count;
    const rasterEntry = state.statusRaster?.[getStatusRasterCellKey(lng, lat)];
    modes.forEach((mode) => {
      const status = rasterEntry?.[mode] || "unknown";
      const modeAgg = bucket.statusAgg[mode] || (bucket.statusAgg[mode] = {});
      const statusBucket = modeAgg[status] || (modeAgg[status] = { count: 0, weightedLng: 0, weightedLat: 0 });
      statusBucket.count += count;
      statusBucket.weightedLng += lng * count;
      statusBucket.weightedLat += lat * count;
    });
    buckets.set(key, bucket);
  });
  return [...buckets.entries()].map(([key, bucket]) => {
    const lng = bucket.weightedLng / bucket.count;
    const lat = bucket.weightedLat / bucket.count;
    const statusCountsByMode = {};
    const statusCentroidsByMode = {};
    Object.entries(bucket.statusAgg).forEach(([mode, modeAgg]) => {
      statusCountsByMode[mode] = {};
      statusCentroidsByMode[mode] = {};
      Object.entries(modeAgg).forEach(([status, statusBucket]) => {
        statusCountsByMode[mode][status] = statusBucket.count;
        statusCentroidsByMode[mode][status] = [
          statusBucket.weightedLng / statusBucket.count,
          statusBucket.weightedLat / statusBucket.count
        ];
      });
    });
    return {
      id: `inat-grid-${tile.id}-${key}`,
      bbox: [lng, lat, lng, lat],
      countsBySpeciesId: { [INATURALIST_AGGREGATE_SPECIES_ID]: bucket.count },
      centroidsBySpeciesId: { [INATURALIST_AGGREGATE_SPECIES_ID]: [lng, lat, bucket.count] },
      statusCountsByMode,
      statusCentroidsByMode
    };
  });
}

function getINaturalistAggregateTiles(bounds, zoom) {
  const area = getINaturalistAggregateBounds(bounds, zoom);
  // Snap the grid zoom to even values (2/4/6) so the tile-key set survives
  // continuous zooming. Flooring to every integer zoom invalidated the whole
  // cache key set at each crossing, forcing refetch + regroup mid-handoff —
  // the source of circles dissolving into different ones while zooming. Cell
  // resolution stays ample: every tile carries 64x64 response cells.
  const evenZoom = Math.floor(zoom / 2) * 2;
  let gridZoom = Math.min(INATURALIST_GRID_MAX_ZOOM, Math.max(INATURALIST_GRID_MIN_ZOOM, evenZoom));
  let maxTiles = INATURALIST_GRID_MAX_TILES;
  if (isAccessFilterActive()) {
    // Permission statuses resolve per response cell against the 0.05-degree
    // raster. At gz 2-4 a response cell spans 0.35-1.4 degrees, so its single
    // raster lookup is noise and filtered counts collapse (measured: 27 of
    // 1,845 national cells carried an "allowed" status — the rest of the
    // iNat contribution vanished from filtered overviews). Use the gz-6 set
    // whenever a filter is on: same per-cell fidelity as the viewport band,
    // ~84 region tiles fetched once per taxon set and cached after.
    gridZoom = Math.max(gridZoom, INATURALIST_GRID_STATUS_ZOOM);
    maxTiles = INATURALIST_GRID_MAX_STATUS_TILES;
  }
  let tiles = getGridTilesForArea(area, gridZoom);
  while (tiles.length > maxTiles && gridZoom > INATURALIST_GRID_MIN_ZOOM) {
    gridZoom -= 2;
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
    state.publicLandCoverage = null;
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
    let truncated = true;
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
      if ((data.features || []).length < PUBLIC_LANDS_PAGE_SIZE) {
        truncated = false;
        break;
      }
    }
    features.forEach((feature) => {
      feature.__bbox = getFeatureBbox(feature);
    });
    state.publicLandFeatures = features;
    // Coverage drives the raster fallback in computeRecordAccessRule: live
    // containment is authoritative only where this load actually saw every
    // intersecting polygon. A truncated page set means unseen polygons, so
    // records there may still use the precomputed raster.
    state.publicLandCoverage = {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      truncated
    };
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
    observer: observation.user?.login || "",
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
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!species || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: `fallingfruit-${record.id}`,
    speciesId: species.id,
    name: record.name || sourceLabel("fallingfruit"),
    observedName: record.observedName || species.commonName,
    observedScientificName: record.observedScientificName || species.scientificName,
    lat,
    lng,
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
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!species || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: `nps-orchard-${record.id}`,
    speciesId: species.id,
    name: record.name || sourceLabel("nps-orchard"),
    observedName: record.observedName || "Historic orchard",
    observedScientificName: record.observedScientificName || species.scientificName,
    lat,
    lng,
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

  const rasterRule = getStatusRasterAccessRule(record);
  if (rasterRule) return rasterRule;

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

function isRecordCoveredByLoadedPublicLands(record) {
  const coverage = state.publicLandCoverage;
  if (!coverage || coverage.truncated) return false;
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  return lng >= coverage.west && lng <= coverage.east
    && lat >= coverage.south && lat <= coverage.north;
}

function getStatusRasterAccessRule(record) {
  // Provisional area-level rule from the precomputed PAD-US containment
  // raster (0.05-degree cells; status of the cell center, computed offline by
  // the same rules engine as the live path). Live PAD-US polygons only load
  // per viewport at point zooms, take seconds, and can truncate at the paged
  // query cap — without this fallback every record degrades to
  // private-unsourced until the live polygons land, so filtered views (e.g.
  // "Allowed" only) go empty at exactly the zooms where clusters appear.
  // The fallback never overrides live containment (checked above via
  // coverage), curated site rules, or record-level private flags, and the
  // rule cache clears on every public-land load so live results replace it.
  if (isRecordCoveredByLoadedPublicLands(record)) return null;
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const status = state.statusRaster?.[getStatusRasterCellKey(lng, lat)]?.[state.activeMap];
  if (status !== "allowed" && status !== "permit-required" && status !== "prohibited") return null;
  const labels = {
    allowed: "Allowed",
    "permit-required": "Permit required",
    prohibited: "Prohibited"
  };
  return {
    status,
    label: labels[status],
    area: "Mapped public-access area (cached area rule)",
    limit: "Area-level match at roughly 5 km resolution; the boundary-sourced rule replaces this as the map loads.",
    note: "Provisional status from the precomputed access raster. Confirm the exact boundary and site rules before harvesting.",
    sourceLabel: "USGS PAD-US containment raster (cached)",
    sourceUrl: "https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-data-overview"
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
    const fungusBlock = unlistedFungusRule(species, area, "Blue Ridge Parkway compendium", ACCESS_RULE_SOURCES.blueRidge);
    if (fungusBlock) return fungusBlock;
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
    const fungusBlock = unlistedFungusRule(species, area, "Prince William Forest compendium", ACCESS_RULE_SOURCES.princeWilliam);
    if (fungusBlock) return fungusBlock;
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
    const fungusBlock = unlistedFungusRule(species, area, "Manassas compendium", ACCESS_RULE_SOURCES.manassas);
    if (fungusBlock) return fungusBlock;
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

  const stateRule = getStateSystemRule(stateCode, text, area, species);
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

// Curated park branches below allow "listed edible fungi" but carry no
// per-species flag; this gate keeps an unlisted mushroom from inheriting their
// "allowed" rule, mirroring the mushroomsAllowed check in getNpsCompendiumRule.
function unlistedFungusRule(species, area, sourceLabel, sourceUrl) {
  if (species.category !== "mushroom" || EDIBLE_FUNGUS_WHITELIST.has(species.id)) return null;
  return {
    status: "prohibited",
    label: "Prohibited",
    area,
    limit: `${species.commonName} are not on the edible-fungus whitelist for this park; do not harvest without species-level confirmation and written park authorization.`,
    note: "Foraging here is authorized only for specific edible fungi; unlisted mushrooms are treated as prohibited for safety.",
    sourceLabel,
    sourceUrl
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

function getStateSystemRule(stateCode, text, area, species) {
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

  if (stateCode === "IL") {
    // Illinois dedicated Nature Preserves (Natural Areas Preservation Act,
    // 525 ILCS 30) are excluded from the edible-collection exception in
    // 17 Ill. Adm. Code 110.70(a)(3): collection there conflicts with the Act.
    if (text.includes("nature preserve")) {
      return {
        status: "prohibited",
        label: "Prohibited",
        area,
        limit: "Collecting plants, fungi, or other natural material is prohibited in dedicated Illinois Nature Preserves.",
        note: "Illinois' edible-collection exception (17 Ill. Adm. Code 110.70(a)(3)) does not apply where collection would conflict with the Natural Areas Preservation Act (525 ILCS 30); dedicated nature preserves stay protected.",
        sourceLabel: "17 Ill. Adm. Code 110.70",
        sourceUrl: ACCESS_RULE_SOURCES.illinoisDnr
      };
    }
    if (text.includes("state park") || text.includes("state recreation")
      || text.includes("state fish") || text.includes("state forest")
      || text.includes("state natural area") || text.includes("state habitat")
      || text.includes("illinois department of natural resources")) {
      if (!foodMode) {
        return {
          status: "prohibited",
          label: "Prohibited",
          area,
          limit: "Removing any plant or plant part for craft or medicinal use is prohibited on Illinois DNR lands; the only exception is edible fungi, nuts, and berries gathered for personal consumption.",
          note: "Illinois' rule (17 Ill. Adm. Code 110.70(a)) prohibits injuring or removing any plant or part thereof, with a narrow exception only for edible fungi, nuts, and berries — not for craft or medicinal plant material.",
          sourceLabel: "17 Ill. Adm. Code 110.70",
          sourceUrl: ACCESS_RULE_SOURCES.illinoisDnr
        };
      }
      return {
        status: "allowed",
        label: "Allowed",
        area,
        limit: "Edible fungi, nuts, and berries (not ginseng berries) may be gathered for personal use only — not resale — during the site's regular open hours; not during open hunting-season hours, and not in dedicated nature preserves. Leaves, roots, stems, and whole plants are not covered.",
        note: "Illinois DNR lands allow personal-use collection of edible fungi, nuts, and berries under 17 Ill. Adm. Code 110.70(a)(3); individual site managers may further restrict it, so check posted rules.",
        sourceLabel: "17 Ill. Adm. Code 110.70",
        sourceUrl: ACCESS_RULE_SOURCES.illinoisDnr
      };
    }
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
      limit: "Berries, fruits, mushrooms, and similar edibles: up to 1 gallon per person per day for personal consumption, unless otherwise posted. Uprooting plants or collecting roots, tubers, flowers, and stems is prohibited.",
      note: "Oregon state parks allow personal-use gathering of edibles under OAR 736-010-0055(5); the limit was reduced from 5 gallons to 1 gallon per person per day effective March 2025 (PRD 3-2025). Check postings, and leave the plant itself unharmed.",
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


  // ===== 2026-06-16 state-park completion pass (38 new states; VA already encoded) =====

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
  if (stateCode === "AL" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Alabama state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "Ala. Admin. Code r. 220-5-.07(3) protects all park vegetation; foraging is not permitted in Alabama state parks.",
      sourceLabel: "Ala. Admin. Code r. 220-5-.07(3)", sourceUrl: ACCESS_RULE_SOURCES.alabamaParks };
  }
  if (stateCode === "AZ" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Arizona state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "A.A.C. R12-8-103 protects all park vegetation; foraging is not permitted in Arizona state parks.",
      sourceLabel: "A.A.C. R12-8-103", sourceUrl: ACCESS_RULE_SOURCES.arizonaParks };
  }
  if (stateCode === "AR" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Arkansas state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "Ark. Admin. Code Title 3, Subpart 10 protects all park vegetation; foraging is not permitted in Arkansas state parks.",
      sourceLabel: "Ark. Admin. Code Title 3, Subpart 10", sourceUrl: ACCESS_RULE_SOURCES.arkansasParks };
  }
  if (stateCode === "DE" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Delaware state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "7 Del. Admin. Code 9201-17.3 protects all park vegetation; foraging is not permitted in Delaware state parks.",
      sourceLabel: "7 Del. Admin. Code 9201-17.3", sourceUrl: ACCESS_RULE_SOURCES.delawareParks };
  }
  if (stateCode === "FL" && (text.includes("state park") || text.includes("state preserve") || text.includes("state reserve"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Florida state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "Fla. Admin. Code R. 62D-2.013 protects all park vegetation; foraging is not permitted in Florida state parks.",
      sourceLabel: "Fla. Admin. Code R. 62D-2.013", sourceUrl: ACCESS_RULE_SOURCES.floridaParks };
  }
  if (stateCode === "ID" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Idaho state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "IDAPA 26.01.20.125 protects all park vegetation; foraging is not permitted in Idaho state parks.",
      sourceLabel: "IDAPA 26.01.20.125", sourceUrl: ACCESS_RULE_SOURCES.idahoParks };
  }
  if (stateCode === "KY" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Kentucky state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "KRS 433.750 protects all park vegetation; foraging is not permitted in Kentucky state parks.",
      sourceLabel: "KRS 433.750", sourceUrl: ACCESS_RULE_SOURCES.kentuckyParks };
  }
  if (stateCode === "LA" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Louisiana state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "LAC Title 25, Pt. IX, § 303.B protects all park vegetation; foraging is not permitted in Louisiana state parks.",
      sourceLabel: "LAC Title 25, Pt. IX, § 303.B", sourceUrl: ACCESS_RULE_SOURCES.louisianaParks };
  }
  if (stateCode === "ME" && (text.includes("state park") || text.includes("state historic site"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Maine state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "C.M.R. 01-670, ch. 1, § 1 protects all park vegetation; foraging is not permitted in Maine state parks.",
      sourceLabel: "C.M.R. 01-670, ch. 1, § 1", sourceUrl: ACCESS_RULE_SOURCES.maineParks };
  }
  if (stateCode === "MA" && (text.includes("state park") || text.includes("state forest") || text.includes("state reservation"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Massachusetts state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "302 CMR 12.04 protects all park vegetation; foraging is not permitted in Massachusetts state parks.",
      sourceLabel: "302 CMR 12.04", sourceUrl: ACCESS_RULE_SOURCES.massachusettsParks };
  }
  if (stateCode === "MS" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Mississippi state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "40 Miss. Admin. Code Pt. 6, R. 1.2 protects all park vegetation; foraging is not permitted in Mississippi state parks.",
      sourceLabel: "40 Miss. Admin. Code Pt. 6, R. 1.2", sourceUrl: ACCESS_RULE_SOURCES.mississippiParks };
  }
  if (stateCode === "MT" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Montana state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "ARM 12.12.106 protects all park vegetation; foraging is not permitted in Montana state parks.",
      sourceLabel: "ARM 12.12.106", sourceUrl: ACCESS_RULE_SOURCES.montanaParks };
  }
  if (stateCode === "NV" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Nevada state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "NRS 407.250 / NAC 407 protects all park vegetation; foraging is not permitted in Nevada state parks.",
      sourceLabel: "NRS 407.250 / NAC 407", sourceUrl: ACCESS_RULE_SOURCES.nevadaParks };
  }
  if (stateCode === "NH" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a New Hampshire state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "N.H. Code Admin. R. Res 7301.05 protects all park vegetation; foraging is not permitted in New Hampshire state parks.",
      sourceLabel: "N.H. Code Admin. R. Res 7301.05", sourceUrl: ACCESS_RULE_SOURCES.newHampshireParks };
  }
  if (stateCode === "NJ" && (text.includes("state park") || text.includes("state forest"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a New Jersey state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "N.J.A.C. 7:2-2.10(a) protects all park vegetation; foraging is not permitted in New Jersey state parks.",
      sourceLabel: "N.J.A.C. 7:2-2.10(a)", sourceUrl: ACCESS_RULE_SOURCES.newJerseyParks };
  }
  if (stateCode === "ND" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a North Dakota state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "N.D. Admin. Code 58-02-08-10 protects all park vegetation; foraging is not permitted in North Dakota state parks.",
      sourceLabel: "N.D. Admin. Code 58-02-08-10", sourceUrl: ACCESS_RULE_SOURCES.northDakotaParks };
  }
  if (stateCode === "RI" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Rhode Island state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "250-RICR-100-00-7 § 7.20 protects all park vegetation; foraging is not permitted in Rhode Island state parks.",
      sourceLabel: "250-RICR-100-00-7 § 7.20", sourceUrl: ACCESS_RULE_SOURCES.rhodeIslandParks };
  }
  if (stateCode === "SD" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a South Dakota state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "SDAR 41:03:01:05 protects all park vegetation; foraging is not permitted in South Dakota state parks.",
      sourceLabel: "SDAR 41:03:01:05", sourceUrl: ACCESS_RULE_SOURCES.southDakotaParks };
  }
  if (stateCode === "TX" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Texas state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "31 TAC 59.134(l)(1) protects all park vegetation; foraging is not permitted in Texas state parks.",
      sourceLabel: "31 TAC 59.134(l)(1)", sourceUrl: ACCESS_RULE_SOURCES.texasParks };
  }
  if (stateCode === "UT" && (text.includes("state park"))) {
    return { status: "prohibited", label: "Prohibited", area,
      limit: "Removing, destroying, or disturbing plants in a Utah state park is prohibited; the park rule has no personal-use foraging exception.",
      note: "Utah Admin. Code R651-620-2 protects all park vegetation; foraging is not permitted in Utah state parks.",
      sourceLabel: "Utah Admin. Code R651-620-2", sourceUrl: ACCESS_RULE_SOURCES.utahParks };
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
  if (!dataStatus) return;
  dataStatus.textContent = message;
}

initControls();
render();
loadPhenology(state.activeMap).then(() => renderHistogram());
map.on("load", () => {
  state.mapReady = true;
  syncLightPreset(state.register);
  setINaturalistAggregateReady(false);
  initMapLayers();
  loadRadar();
  loadStateBoundaries();
  // The raster also backs provisional record-level rules at point zooms, so
  // load it at startup rather than only via the overview aggregate path.
  loadStatusRaster();
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
