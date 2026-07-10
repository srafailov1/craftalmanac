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

// Baked iNaturalist chunk tree (data/inaturalist/us), the analog of the Falling
// Fruit tree: precomputed occurrence points + a manifest whose per-chunk
// countsByAnchor/accessCounts make the overview aggregate equal the plotted
// points by construction (see docs/TODO-inaturalist-chunk-bake.md). When the
// flag is on, this REPLACES the live iNaturalist grid + observation API paths.
// The national tree is committed and served, so the baked path is live. The
// live /v1/grid + /v1/observations code remains gated behind this flag until a
// follow-up removes it (see docs/TODO-inaturalist-chunk-bake.md sections 10-11).
const USE_BAKED_INATURALIST = true;
const INATURALIST_MANIFEST_URL = "./data/inaturalist/us/manifest.json";
const INATURALIST_CHUNK_CACHE_MAX = 400;
// "Save this area" (Phase 5.5): user-triggered offline caching of the Falling
// Fruit chunk files covering the current viewport. The cache name MUST match
// SAVED_AREAS_CACHE in sw.js (the SW reads it as its offline fallback and
// excludes it from the deploy-time cache rotation so saves survive updates).
const SAVED_AREAS_CACHE_NAME = "craft-almanac-saved-areas-v1";
const SAVED_AREAS_STORAGE_KEY = "craftalmanac.savedAreas.v1";
// Hard cap per save — the whole dataset is ~2,900 chunks / ~82 MB and must
// never be saved wholesale ("never the full corpus"); 400 chunks ≈ 12 MB.
const SAVE_AREA_MAX_CHUNKS = 400;
const SAVE_AREA_FETCH_CONCURRENCY = 6;
// Pre-save size hint only (chunks average ~29 KB; real bytes counted while saving).
const SAVE_AREA_APPROX_CHUNK_BYTES = 29 * 1024;
// iNaturalist chunks are coarser (0.30 deg) and denser, so they average larger.
const SAVE_AREA_APPROX_INAT_CHUNK_BYTES = 42 * 1024;
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
  dried: "#b7792f",
  skincare: "#3f8d76",
  kitchen: "#9a5f9f",
  greens: "#6b8e23",
  garden: "#6978b8"
};
// Per-plant color for Herbs project card spines, keyed by plantId, so a shelf
// shows a mix of plant colors instead of one flat category color. Each hue nods
// to the plant's signature color (flower, berry, or foliage).
const MEDICINE_SPECIES_COLORS = {
  "medicine-yarrow": "#c9b458",          // cream-gold flower heads
  "medicine-witch-hazel": "#d98f2b",     // spidery orange-yellow winter bloom
  "medicine-elderberry": "#4d2e63",      // dark ripe berries
  "medicine-echinacea": "#c05f88",       // pink-purple coneflower
  "medicine-bergamot": "#8a5fa8",        // lavender bee balm
  "medicine-goldenrod": "#c99414",       // deep goldenrod plumes
  "medicine-dandelion": "#e6b800",       // bright yellow flower
  "medicine-mullein": "#9aa24e",         // gray-green stalk, soft yellow spike
  "medicine-violet": "#6a4a9c",          // violet flower
  "medicine-cleavers": "#7fa758",        // fresh spring green
  "medicine-garlic-mustard": "#5f8a43",  // leafy green
  "medicine-jewelweed": "#e2742e",       // orange spotted flower
  "medicine-broadleaf-plantain": "#6d8a4a", // broad green leaf
  "medicine-chickweed": "#a7c07a"        // pale green mat
};
// Minerals map: each craft-material type is its own category/color (1:1 with the
// mineralSpeciesCatalog), the way ink colors map to dye materials.
const MINERAL_CATEGORY_COLORS = {
  clay: "#a8682f",
  alabaster: "#d8c3a5",
  pipestone: "#a23b34",
  soapstone: "#3f8d76",
  serpentine: "#7c9048",
  limestone: "#9a8f6e",
  marble: "#cfcac2",
  slate: "#5c677d",
  obsidian: "#33323a",
  silica: "#8a93a0",
  novaculite: "#c4623f",
  quartz: "#3f86c4",
  agate: "#caa060",
  "petrified-wood": "#6b4a2e",
  gemstone: "#a8497e"
};
// Workability scale (replaces the meaningless season slider in mineral mode):
// 0 = softest (carve / throw) → 100 = hardest (sharpen / knap / facet). Roughly
// tracks Mohs hardness and the craft it fits.
const MINERAL_WORKABILITY = {
  clay: 6, alabaster: 9, pipestone: 16, soapstone: 14, serpentine: 30,
  limestone: 34, marble: 36, slate: 40, obsidian: 55, silica: 72,
  quartz: 74, agate: 73, "petrified-wood": 74, novaculite: 78, gemstone: 96
};
// The histogram draws one equal-width column per material, sorted soft→hard.
// Band membership works in COLUMN space (not raw workability values, which
// bunch unevenly — 6..40 spans eight columns, 55..96 spans seven) so the
// slider thumb's x-position maps proportionally onto the histogram: thumb at
// 50% highlights the middle columns, at 100% the right edge.
const MINERAL_WORKABILITY_ORDER = Object.keys(MINERAL_WORKABILITY)
  .sort((a, b) => MINERAL_WORKABILITY[a] - MINERAL_WORKABILITY[b]);
const MINERAL_WORKABILITY_BAND_COLS = 3; // ± columns highlighted around the thumb

function mineralSliderColumn() {
  return (state.mineralWorkability / 100) * (MINERAL_WORKABILITY_ORDER.length - 1);
}

function mineralCategoryInBand(categoryId) {
  const index = MINERAL_WORKABILITY_ORDER.indexOf(categoryId);
  if (index < 0) return true; // unknown material — never silently hidden
  return Math.abs(index - mineralSliderColumn()) <= MINERAL_WORKABILITY_BAND_COLS;
}
function mineralWorkBand(value) {
  if (value < 28) return { label: "Soft, carving & pottery", examples: "clay · alabaster · soapstone · pipestone" };
  if (value < 56) return { label: "Medium, carving & engraving", examples: "serpentine · marble · slate · obsidian" };
  return { label: "Hard, sharpening, knapping & lapidary", examples: "chert · quartz · agate · novaculite · gemstone" };
}
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
  blueRidge: "https://www.nps.gov/blri/learn/management/lawsandpolicies.htm",
  princeWilliam: "https://www.nps.gov/prwi/learn/management/lawsandpolicies.htm",
  manassas: "https://www.nps.gov/mana/learn/management/compendium.htm",
  usfs: "https://www.ecfr.gov/current/title-36/chapter-II/part-261/subpart-A/section-261.6",
  blm: "https://www.blm.gov/programs/natural-resources/forests-and-woodlands/forest-product-permits",
  usfws: "https://www.ecfr.gov/current/title-50/chapter-I/subchapter-C/part-27",
  usace: "https://www.ecfr.gov/current/title-36/chapter-III/part-327",
  virginiaParks: "https://law.lis.virginia.gov/admincode/title4/agency5/chapter30/section50/",
  virginiaStateForests: "https://law.lis.virginia.gov/admincode/title4/agency10/chapter30/section50/",
  virginiaWma: "https://dwr.virginia.gov/wp-content/uploads/media/wma-rules.pdf",
  beaconFoodForest: "https://www.beaconfoodforest.org/openharvest",
  charlottesville: "https://www.charlottesville.gov/166/Parks-Recreation",
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
  botanicalGardens: "https://www.ecfr.gov/current/title-7/subtitle-A/part-500"
};

// Park-specific 36 CFR 2.1(c) gathering designations, matched against PAD-US
// unit text before the generic NPS prohibition. Food mode only — the earlier
// non-food NPS branch keeps craft/medicine collection marked prohibited.
// Limits reflect recent superintendent's compendiums; always confirm current.
// Loaded at boot from data/rules/nps-gathering-rules.json (see
// loadAccessRuleTables and docs/rules-schema.md); empty until then —
// getNpsCompendiumRule returns null and NPS land falls back to the generic
// 36 CFR 2.1 prohibition.
let NPS_GATHERING_RULES = [];

// Curated per-site rules (food forests, edible parks, campuses with public-
// harvest policies), matched by bounding box before the public-land rules.
// Loaded at boot from data/rules/site-access-rules.json (see
// loadAccessRuleTables and docs/rules-schema.md); empty until then — records
// fall through to the public-land / conservative-private resolution paths.
let SITE_ACCESS_RULES = [];
const ACCESS_STATUS_OPTIONS = [
  { id: "allowed", label: "Allowed", defaultChecked: true },
  { id: "permit-required", label: "Permit required", defaultChecked: true },
  { id: "private", label: "Private", defaultChecked: true },
  { id: "private-unsourced", label: "Private / unchecked", defaultChecked: true },
  { id: "unknown", label: "Unverified", defaultChecked: true },
  { id: "prohibited", label: "Prohibited", defaultChecked: false }
];
// Access-status ring colors for the map markers. These mirror the prototype's
// status hues and the day-register --reg-st-* tokens so the marker ring matches
// the legend access ring (the legend brightens per register; markers stay
// constant, exactly as the prototype does). Solid rings; the status is read by
// hue — OWNER DECISION 2026-07-06: no dashed/dotted pattern channel on the
// rings (a three-level pattern shipped briefly and was reverted; the hover
// label and point card carry the textual channel). "permit" uses the
// legibility-tuned amber (#a8730a), per owner decision.
const ACCESS_MARKER_STYLES = {
  allowed: { label: "Allowed", color: "#2f8f46", dashed: false },
  "permit-required": { label: "Permit required", color: "#a8730a", dashed: false },
  private: { label: "Private", color: "#7e6654", dashed: false },
  "private-unsourced": { label: "Private / unchecked", color: "#7e6654", dashed: false },
  unknown: { label: "Unverified", color: "#8b8f86", dashed: false },
  prohibited: { label: "Prohibited", color: "#c74437", dashed: false }
};
// Each legend chip governs a GROUP of underlying statuses: the "Private" chip
// must cover both sourced-private and private-unsourced records ("Private /
// unchecked" cards) — the latter had no chip at all before 2026-07-07, so
// turning "Private" off silently left the far larger unchecked set visible.
const LEGEND_PERMISSION_OPTIONS = [
  { id: "allowed", label: "Allowed", statuses: ["allowed"] },
  { id: "permit-required", label: "Permit required", statuses: ["permit-required"] },
  { id: "private", label: "Private", statuses: ["private", "private-unsourced"] },
  { id: "unknown", label: "Unverified", statuses: ["unknown"] }
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
  "nps-orchard": "Public domain (U.S. Gov)",
  mineral: "Public domain (U.S. Gov)"
};
const MARKER_ICON_SIZE = 26;
const MARKER_ICON_PIXEL_RATIO = 3;
const WELCOME_MODAL_STORAGE_KEY = "craftAlmanacWelcomeSeen";
const FAVORITE_SPECIES_STORAGE_KEY = "craftAlmanacFavoriteSpecies";
const SAVED_LOCATIONS_STORAGE_KEY = "craftAlmanacSavedLocations";
const REGISTER_OVERRIDE_STORAGE_KEY = "craftAlmanacRegisterOverride";
// Valid pinned map-light choices; anything else means "auto" (follow the sun).
const REGISTER_OVERRIDE_VALUES = new Set(["day", "night"]);
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
  morel: ["deadly lookalike"],
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
  "medicine-cleavers": ["drug interactions"],
  "medicine-broadleaf-plantain": ["avoid contaminated/sprayed ground", "lookalikes"],
  "medicine-goldenrod": ["ragweed confusion (pollen allergy)", "avoid rayless/rare Solidago", "drug interactions"],
  "medicine-garlic-mustard": ["confirm ID before eating", "contains cyanide/oxalates, cook", "invasive, bag pulled plants"],
  // ---- 2026-06 contiguous-US food expansion (safety tags reflect the
  // adversarial safety-review pass; details live in each species' notes) ----
  "red-mulberry": ["ripe fruit only", "toxic parts", "lookalikes", "conservation concern"],
  thimbleberry: ["ripe fruit only", "lookalikes"],
  salmonberry: ["ripe fruit only", "lookalikes"],
  "himalayan-blackberry": ["lookalikes"],
  cranberry: ["lookalikes", "drug interactions"],
  "red-elderberry": ["toxic parts", "cook before eating", "remove seeds", "deadly lookalike"],
  buffaloberry: ["eat in moderation", "lookalikes"],
  "juniper-berry": ["positively identify species", "deadly lookalike", "avoid pregnancy", "drug interactions", "eat in moderation"],
  kinnikinnick: ["cook before eating", "toxic parts", "lookalikes"],
  wintergreen: ["salicylate content", "avoid pregnancy", "not for children", "drug interactions", "deadly lookalike"],
  chokecherry: ["toxic parts", "remove seeds", "cook before eating", "lookalikes"],
  "pin-cherry": ["toxic parts", "remove seeds", "lookalikes"],
  "rose-hips": ["remove seeds", "lookalikes", "thorns"],
  hawthorn: ["remove seeds", "lookalikes", "thorns", "drug interactions"],
  mayapple: ["toxic parts", "ripe fruit only", "remove seeds", "eat in moderation", "avoid pregnancy", "drug interactions"],
  "prickly-pear": ["spines/glochids", "ripe fruit only", "lookalikes", "eat in moderation"],
  "pinyon-pine-nut": ["lookalikes", "over-harvest concern"],
  "mesquite-bean": ["mold/aflatoxin risk", "lookalikes"],
  chinquapin: ["spines", "lookalikes", "conservation concern"],
  // ---- 2026-06 ink/dye expansion ----
  "ink-himalayan-blackberry": ["fugitive color", "invasive"],
  "ink-prickly-pear": ["glochids/spines", "fugitive color"],
  "ink-rouge-plant": ["toxic berries, do not ingest", "stains skin"],
  "ink-bee-plant": ["dye/paint only, do not ingest"],
  "ink-brazilian-pepper": ["urushiol, contact dermatitis", "never burn", "wear gloves"],
  "ink-oregon-grape": ["berberine, do not ingest dye", "berries not roots"],
  "dye-artemisia": ["aromatic, do not ingest", "not white sage (Salvia)"],
  "dye-mormon-tea": ["alkaloids, dye only"],
  "dye-camphor": ["camphor volatiles, ventilate", "toxic if ingested"],
  "dye-canaigre": ["high tannin/oxalate, do not ingest"],
  "dye-st-johns-wort": ["photosensitivity, wear gloves", "do not ingest"],
  "dye-curly-dock": ["oxalic acid in leaves, use root"],
  "dye-eucalyptus": ["leaves/oil toxic if ingested", "ventilate"],
  "dye-honey-mesquite": ["thorns", "tannin stains skin"],
  "dye-manzanita": ["shed/fallen only, some species rare"],
  "dye-one-seed-juniper": ["dye only, do not ingest", "not savin juniper"],
  "dye-madrone": ["shed bark only"],
  "dye-rabbitbrush": ["possible contact sensitivity", "dye only"],
  "dye-scotch-broom": ["alkaloids, do not ingest"],
  "dye-spanish-moss": ["rinse, may harbor chiggers/mites"],
  "dye-toyon": ["cyanide fumes, simmer outdoors", "do not ingest"],
  "dye-wild-fennel": ["poison-hemlock lookalike, confirm ID", "do not ingest"],
  "dye-dyers-woad": ["caustic vat (lye)", "removal only, bag seed heads"],
  "dye-mountain-mahogany": ["cyanogenic foliage, do not ingest", "pruned/fallen bark only"],
  "ink-carolina-redroot": ["toxic, do not ingest", "observe only"],
  "ink-tanoak": ["dead/felled wood only", "mind SOD quarantine"],
  "ink-western-redcedar": ["culturally sacred, observe only"],
  "ink-wolf-lichen": ["toxic (vulpinic acid)", "slow-growing, observe only"],
  // ---- 2026-06 fungal dyes (dye use only; see docs/mushroom-inks-research.md) ----
  "ink-dyers-polypore": ["dye use only, do not eat", "seasonal fruiting, pin is not a standing harvest", "advanced process, iron modifier is caustic"],
  "ink-turkey-tail": ["dye use only, do not eat", "identify carefully, non-toxic lookalikes"],
  "ink-artists-conk": ["dye use only, do not eat", "identify carefully, similar conks"],
  "ink-red-belted-conk": ["dye use only, do not eat", "identify carefully, similar conks"],
  "ink-tinder-conk": ["dye use only, do not eat", "identify carefully, similar conks"],
  "ink-chicken-of-the-woods": ["dye use only, do not eat here", "identify carefully, toxic lookalike (jack-o'-lantern)", "seasonal fruiting, pin is not a standing harvest"],
  // ---- Explicit "considered" decisions for established species (safety-tag
  // completeness gate, scripts/test_safety_tags.mjs). [] means reviewed with no
  // notable ingestion/contact hazard beyond general foraging caution. ----
  blueberry: [],
  blackberry: ["thorns"],
  raspberry: ["thorns"],
  wineberry: ["thorns", "invasive"],
  ribes: ["lookalikes"],
  huckleberry: ["lookalikes"],
  "cornelian-cherry": ["remove seeds"],
  serviceberry: ["lookalikes"],
  persimmon: ["ripe fruit only", "astringent unripe"],
  pawpaw: ["ripe fruit only", "skin/seeds not for eating"],
  "black-walnut": ["hard shell", "staining hulls"],
  hickory: ["hard shell", "lookalikes"],
  hazelnut: ["lookalikes"],
  apple: ["seeds not for eating"],
  pear: [],
  peach: ["remove pit"],
  fig: ["latex sap irritant"],
  "ink-black-walnut": ["stains skin, wear gloves", "dye only"],
  "ink-oak": ["tannin, dye only"],
  "ink-hickory": ["stains skin, wear gloves", "dye only"],
  "ink-sumac": ["lookalikes, avoid poison sumac", "dye only"],
  "ink-goldenrod": ["dye only"],
  "ink-osage-orange": ["milky sap irritant", "dye only"],
  "ink-autumn-olive": ["invasive", "dye only"],
  "ink-wineberry": ["invasive", "dye only"],
  "ink-tupelo": ["dye only"],
  "dye-cliffrose": ["dye only"],
  "dye-coyote-brush": ["dye only"],
  "dye-douglas-fir": ["dye only"],
  "dye-greenthread": ["dye only, traditionally a beverage; treat here as dye"],
  "dye-plains-coreopsis": ["dye only"],
  "dye-alder": ["dye only"],
  "dye-wax-myrtle": ["dye only"]
};
// Point-card rendering of safety tags: the catalog keeps tags terse (they also
// feed the static-page and field-card generators), but on the card a bare
// "lookalikes" under-communicates the hazard. Terse tags expand to a fuller
// phrase at render time via this map; tags that are already self-explanatory
// ("confirm ID before eating", "urushiol — contact dermatitis") pass through
// unchanged. Expansions clarify the existing tag only — no new safety claims.
const SAFETY_TAG_SENTENCES = {
  "lookalikes": "has lookalikes, confirm identification",
  "deadly lookalike": "deadly lookalike exists, expert identification required",
  "remove pit": "remove the pit before eating",
  "remove seeds": "remove the seeds before eating",
  "spines": "spines, handle with gloves",
  "thorns": "thorns, handle with care",
  "spines/glochids": "spines and glochids, wear thick gloves",
  "glochids/spines": "glochids and spines, wear thick gloves",
  "invasive": "invasive, removal helps native habitat",
  "ventilate": "work in a ventilated space",
  "do not ingest": "do not ingest any part",
  "dye only": "dye use only, not for eating",
  "observe only": "observe only, do not harvest",
  "wear gloves": "wear gloves when handling",
  "stains skin": "stains skin, wear gloves",
  "hard shell": "hard shell, crack with care",
  "toxic parts": "some parts are toxic, know which before use",
  "never burn": "never burn this material",
  "drug interactions": "may interact with medications, check first",
  "avoid pregnancy": "avoid during pregnancy",
  "external use only": "external use only, do not ingest",
  "ripe fruit only": "only fully ripe fruit is edible",
  "salicylate content": "contains salicylates (the aspirin family)",
  "conservation concern": "conservation concern, harvest sparingly, if at all",
  "over-harvest concern": "over-harvest concern, take lightly",
  "milky sap irritant": "milky sap can irritate skin",
  "latex sap irritant": "latex sap can irritate skin",
  "staining hulls": "hulls stain skin and clothing",
  "astringent unripe": "astringent until fully ripe",
  "berries not roots": "harvest berries, not roots",
  "seeds not for eating": "the seeds are not edible",
  "skin/seeds not for eating": "skin and seeds are not edible",
  "dead/felled wood only": "collect from dead or felled wood only",
  "shed bark only": "collect naturally shed bark only",
  "not savin juniper": "confirm it is not savin juniper (toxic)",
  "not white sage (Salvia)": "confirm it is not white sage (Salvia), culturally protected",
  "ragweed confusion (pollen allergy)": "can be confused with ragweed (pollen allergy)",
  "mind SOD quarantine": "observe sudden-oak-death quarantine rules",
  "fugitive color": "fugitive color, fades with light",
  "tannin stains skin": "tannin stains skin, wear gloves",
  "eat in moderation": "eat in moderation",
  "not for children": "not for children"
};
function expandSafetyTag(tag) {
  return SAFETY_TAG_SENTENCES[tag] || tag;
}
// Safety-first (CLAUDE.md): a park's "edible fungi" allowance applies only to
// species on this whitelist. Any other mushroom stays prohibited, so a future
// non-whitelisted fungus can never silently inherit an "allowed" park rule.
const EDIBLE_FUNGUS_WHITELIST = new Set(["morel"]);
// Cross-map permission extension (owner decision 2026-07-07): a food "Allowed"
// carries across into the ink/herbalism maps for the SAME material at the same
// location — EXCEPT for these non-food species, whose harvest takes a live root,
// live bark, the whole living plant, or a fungal fruiting body. Edible-
// consumption / personal-gathering exceptions do not cover those, so on such
// edibles-only land they resolve to "needs the managing agency's permission"
// instead of inheriting the food allowance. This does NOT apply on broad
// forest-products land (USFS/BLM), where personal harvest of roots/bark is not
// edibles-scoped — see the broadForestProducts flag. Fallen / shed / dead /
// pruned material and fruit / nuts / berries / foliage EXTEND normally (madrone
// shed bark, alder fallen-limb bark, walnut fallen hulls, elderberry berries all
// carry across). Observe-only species (tanoak, wolf-lichen, etc.) are handled by
// the separate harvest-ethic channel ("observe only, do not harvest"), not here,
// so their legal access ring stays consistent across land types. Set verified by
// a three-pass unanimous harvest-part classification of every non-food species'
// usedParts field; see isNonFoodHarvestRestricted / restrictedNonFoodHarvestRule.
const NONFOOD_HARVEST_NEEDS_PERMISSION = new Set([
  // Live roots / taproots / tubers / rhizomes dug from a living plant
  "dye-canaigre", "dye-curly-dock", "ink-carolina-redroot",
  "medicine-echinacea", "medicine-dandelion", "medicine-garlic-mustard",
  // Live bark or heartwood cut/stripped from a living plant
  "dye-toyon", "ink-osage-orange", "ink-western-redcedar", "medicine-witch-hazel",
  // Whole living plant taken (uprooted or cut entire)
  "ink-bee-plant", "dye-greenthread",
  // Fungal fruiting bodies (also the project's fungi-safety stance)
  "ink-dyers-polypore", "ink-turkey-tail", "ink-artists-conk",
  "ink-red-belted-conk", "ink-tinder-conk", "ink-chicken-of-the-woods"
]);
// Shenandoah National Park uses a per-species compendium allow-list, not a
// generic edible exception, so the cross-map extension there must respect the
// food>=non-food invariant: a non-food species may only inherit Shenandoah's
// "Allowed" if its FOOD-equivalent material is on the compendium list. These are
// the non-food species whose food twin is Shenandoah-listed (food entry has no
// shenandoahAllowed:false flag). Every other non-food species stays prohibited
// at Shenandoah, exactly as its food twin (or non-listed plant) would be. Keep
// in sync with the food catalog's Shenandoah listing.
const NONFOOD_SHENANDOAH_LISTED = new Set([
  "ink-black-walnut", "ink-hickory", "ink-wineberry",
  "ink-elderberry", "ink-wild-grape", "medicine-elderberry"
]);
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
  "ink-goldenrod": "light harvest",
  "ink-osage-orange": "fallen material preferred",
  "ink-pokeweed": "light harvest",
  "ink-autumn-olive": "invasive removal",
  "ink-wineberry": "invasive removal",
  "ink-elderberry": "light harvest",
  "ink-privet": "invasive removal",
  "ink-wild-grape": "light harvest",
  "ink-tupelo": "light harvest",
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
  "medicine-cleavers": "light harvest",
  // ---- 2026-06 contiguous-US food expansion ----
  "red-mulberry": "fallen material preferred",
  thimbleberry: "light harvest",
  salmonberry: "light harvest",
  "himalayan-blackberry": "invasive removal",
  cranberry: "light harvest",
  "red-elderberry": "light harvest",
  buffaloberry: "light harvest",
  "juniper-berry": "light harvest",
  kinnikinnick: "light harvest",
  wintergreen: "light harvest",
  chokecherry: "light harvest",
  "pin-cherry": "light harvest",
  "rose-hips": "light harvest",
  hawthorn: "light harvest",
  mayapple: "light harvest",
  "prickly-pear": "light harvest",
  "pinyon-pine-nut": "light harvest",
  "mesquite-bean": "light harvest",
  chinquapin: "fallen material preferred",
  // ---- 2026-06 ink/dye expansion ----
  "ink-himalayan-blackberry": "invasive removal",
  "ink-prickly-pear": "light harvest",
  "ink-rouge-plant": "light harvest",
  "ink-bee-plant": "light harvest",
  "ink-brazilian-pepper": "invasive removal",
  "ink-oregon-grape": "light harvest",
  "dye-artemisia": "light harvest",
  "dye-mormon-tea": "light harvest",
  "dye-camphor": "invasive removal",
  "dye-canaigre": "light harvest",
  "dye-cliffrose": "light harvest",
  "dye-st-johns-wort": "invasive removal",
  "dye-coyote-brush": "light harvest",
  "dye-curly-dock": "invasive removal",
  "dye-douglas-fir": "fallen material preferred",
  "dye-eucalyptus": "invasive removal",
  "dye-greenthread": "light harvest",
  "dye-honey-mesquite": "light harvest",
  "dye-manzanita": "fallen material preferred",
  "dye-one-seed-juniper": "fallen material preferred",
  "dye-madrone": "fallen material preferred",
  "dye-plains-coreopsis": "light harvest",
  "dye-alder": "fallen material preferred",
  "dye-rabbitbrush": "light harvest",
  "dye-scotch-broom": "invasive removal",
  "dye-wax-myrtle": "light harvest",
  "dye-spanish-moss": "fallen material preferred",
  "dye-toyon": "light harvest",
  "dye-wild-fennel": "invasive removal",
  "dye-dyers-woad": "invasive removal",
  "dye-mountain-mahogany": "light harvest",
  "ink-carolina-redroot": "observe only",
  "ink-tanoak": "observe only",
  "ink-western-redcedar": "observe only",
  "ink-wolf-lichen": "observe only",
  // ---- 2026-06 fungal dyes: abundant wood-decay brackets, low-impact ----
  "ink-dyers-polypore": "light harvest",
  "ink-turkey-tail": "light harvest",
  "ink-artists-conk": "light harvest",
  "ink-red-belted-conk": "light harvest",
  "ink-tinder-conk": "light harvest",
  "ink-chicken-of-the-woods": "light harvest"
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
  },
  // ============================================================
  // 2026-06 contiguous-US food expansion. Researched + adversarially
  // safety-reviewed; notes carry the corrected toxic-parts and named
  // lookalikes. All are absent from Shenandoah's compendium list
  // (shenandoahAllowed: false); permission at the parks that DO designate
  // them resolves through NPS_GATHERING_RULES at point zoom.
  // ============================================================
  {
    id: "red-mulberry",
    commonName: "Red mulberries",
    scientificName: "Morus rubra",
    category: "berry",
    months: [6, 7, 8],
    inatTaxonIds: [54801],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Native bottomland tree; ID by sandpaper-rough leaves. Eat only fully ripe deep purple-black fruit, unripe fruit, raw leaves/shoots, and the milky sap are toxic raw (stomach upset plus reported nervous-system effects) and the sap irritates skin. Don't confuse the dark fruit with pokeweed (a herbaceous plant with magenta stems and round berries in hanging clusters). Native and locally protected, take only ripe or fallen fruit and don't cut the tree."
  },
  {
    id: "thimbleberry",
    commonName: "Thimbleberries",
    scientificName: "Rubus parviflorus",
    category: "berry",
    groupLabel: "Blackberries and raspberries",
    months: [7, 8, 9],
    inatTaxonIds: [51646],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Thornless montane/Pacific bramble with large maple-like fuzzy leaves and a soft red fruit that pulls off like a thimble cap. Eat only ripe fruit (not leaves or shoots). Confirm the aggregate-cap structure to avoid same-habitat red baneberry (deadly, single shiny berries on a stalk) and red elderberry; avoid poison oak/ivy contact while picking."
  },
  {
    id: "salmonberry",
    commonName: "Salmonberries",
    scientificName: "Rubus spectabilis",
    category: "berry",
    groupLabel: "Blackberries and raspberries",
    months: [5, 6, 7, 8],
    inatTaxonIds: [47543],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Pacific Northwest bramble of moist coastal forests and stream banks; raspberry-like orange-to-red fruit that detaches like a cap. Eat ripe fruit. Distinguish from red elderberry (a woody shrub with compound leaves and conical clusters, toxic raw)."
  },
  {
    id: "himalayan-blackberry",
    commonName: "Himalayan blackberries",
    scientificName: "Rubus armeniacus",
    category: "berry",
    groupLabel: "Blackberries and raspberries",
    months: [7, 8, 9, 10],
    inatTaxonIds: [61317],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Aggressive West Coast invasive forming dense thorny thickets, harvest freely as invasive removal. Eat fully ripe black fruit. The bumpy multi-bead aggregate berry distinguishes true blackberry from smooth-skinned toxic lookalikes (pokeweed, nightshade, Virginia creeper); mind the stout recurved thorns."
  },
  {
    id: "cranberry",
    commonName: "Wild cranberries",
    scientificName: "Vaccinium macrocarpon and Vaccinium oxycoccos",
    category: "berry",
    months: [9, 10, 11],
    inatTaxonIds: [63749, 126560],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Trailing wiry vine with tiny leathery leaves and firm tart red berries on acidic bog/fen moss; classic harvest after first frost. Reject any berry on an UPRIGHT shrub on the same moss hummock, bog rosemary (Andromeda) and bog laurel (Kalmia) are toxic in all parts. Peatlands are sensitive; tread lightly. May interact with warfarin."
  },
  {
    id: "red-elderberry",
    commonName: "Red elderberries",
    scientificName: "Sambucus racemosa",
    category: "berry",
    months: [7, 8],
    inatTaxonIds: [57824],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Bright-red berries in conical clusters (not the flat-topped clusters of blue/black elderberry), and more toxic raw than other elderberries. Eat only fully ripe berries, cooked, with all seeds removed, the seeds carry the highest toxin load; never eat raw fruit, stems, or leaves. DEADLY lookalike: red baneberry (Actaea rubra), a herbaceous plant whose red berries can be fatal."
  },
  {
    id: "buffaloberry",
    commonName: "Buffaloberries",
    scientificName: "Shepherdia argentea",
    category: "berry",
    months: [7, 8, 9, 10],
    inatTaxonIds: [79071],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Northern-plains streambank shrub with silvery scaly opposite leaves, thorns, and clustered red berries; best after frost. Raw berries foam from saponins and act as a laxative in quantity, eat in moderation or cook. Distinguish from invasive Russian olive (alternate leaves) and from bush honeysuckle (no thorns or silvery scales; mildly toxic)."
  },
  {
    id: "juniper-berry",
    commonName: "Juniper berries",
    scientificName: "Juniperus",
    category: "berry",
    months: [9, 10, 11],
    inatTaxonIds: [47574],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Culinary spice from the soft ripe blue-black cones of edible junipers (common, one-seed, alligator, California, eastern red cedar), used sparingly. NEVER eat ornamental savin juniper (Juniperus sabina) or cade (J. oxycedrus, red-brown berries), toxic. Avoid in pregnancy/breastfeeding and with kidney disease; interacts with diabetes, diuretic, lithium, and blood-thinning medications."
  },
  {
    id: "kinnikinnick",
    commonName: "Kinnikinnick (bearberry)",
    scientificName: "Arctostaphylos uva-ursi",
    category: "berry",
    months: [9, 10, 11, 12],
    inatTaxonIds: [68049],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Low trailing evergreen mat-shrub with leathery paddle leaves and dry, mealy red berries best cooked. The berries are bland but edible; the leaves are a traditional medicine/smoking herb (not a food) and contain hydroquinone. Slow-growing, harvest lightly."
  },
  {
    id: "wintergreen",
    commonName: "Wintergreen berries",
    scientificName: "Gaultheria procumbens",
    category: "berry",
    months: [9, 10, 11, 12, 1, 2, 3, 4],
    inatTaxonIds: [62376],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Low evergreen woodland groundcover; crush a leaf or berry to confirm the strong wintergreen scent (separates it from scentless partridgeberry). Contains aspirin-like methyl salicylate, eat only small amounts and avoid with aspirin sensitivity or blood thinners, in pregnancy/breastfeeding, and in children. DEADLY lookalike: baneberry (Actaea), red berries in the same woods, separated by aroma, taller stature, and compound leaves."
  },
  {
    id: "chokecherry",
    commonName: "Chokecherries",
    scientificName: "Prunus virginiana",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [7, 8, 9],
    inatTaxonIds: [54835],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Elongated drooping clusters of pea-sized fruit ripening dark on finely toothed leaves. Use only ripe flesh, cooked; never crush or eat the pits, leaves, twigs, or bark (cyanogenic). Confirm the single hard pit and bottlebrush cluster, toxic lookalikes include buckthorn, red elderberry, and pokeweed/nightshade (the last two can be fatal). Culturally significant to Plains and northern tribes."
  },
  {
    id: "pin-cherry",
    commonName: "Pin cherries",
    scientificName: "Prunus pensylvanica",
    category: "fruit",
    groupLabel: "Cherries and plums",
    months: [7, 8, 9],
    inatTaxonIds: [54833],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Bright-red single-seeded cherries on long stalks, on a fast-growing pioneer tree. Ripe flesh is edible (tart; usually cooked), never crush or eat the pits, leaves, or bark (cyanogenic, like all wild cherries). Distinguish from buckthorn and bush honeysuckle berries."
  },
  {
    id: "rose-hips",
    commonName: "Rose hips",
    scientificName: "Rosa",
    category: "fruit",
    months: [8, 9, 10, 11, 12],
    inatTaxonIds: [53438],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Firm red-orange fruits on thorny canes with pinnate leaves and a dried five-point crown at the tip; sweetest after frost. Split each hip and remove the seeds and irritant internal hairs before eating. Confirm thorns + pinnate leaves + calyx crown to avoid toxic red-berried lookalikes (bittersweet nightshade on twining stems, yew arils with a deadly seed, honeysuckle). Naturalized multiflora rose is invasive; native roses warrant light harvest."
  },
  {
    id: "hawthorn",
    commonName: "Hawthorn haws",
    scientificName: "Crataegus",
    category: "fruit",
    months: [9, 10, 11],
    inatTaxonIds: [51148],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Small red-to-black pomes ('haws') on thorny shrubs. The flesh is edible, never crush or eat the cyanogenic seeds, and mind the sharp thorns (puncture-infection risk). Distinguish from blackthorn/sloe, thornless buckthorn, and firethorn. Hawthorn interacts with heart medications (digoxin, beta-blockers)."
  },
  {
    id: "mayapple",
    commonName: "Mayapple fruit",
    scientificName: "Podophyllum peltatum",
    category: "fruit",
    months: [7, 8, 9],
    inatTaxonIds: [49288],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Harvest ONLY the fully ripe (soft, yellow, often fallen) fruit; remove the seeds and skin and eat just a small amount (laxative in excess). EVERY other part, leaves, stem, root, seeds, and green unripe fruit, contains podophyllotoxin and is seriously toxic (potentially fatal, no antidote). Abortifacient: avoid in pregnancy and with chemotherapy/cell-cycle drugs; handling the foliage or root can irritate skin. Harvest sparingly from slow-spreading colonies."
  },
  {
    id: "prickly-pear",
    commonName: "Prickly pear fruit (tunas)",
    scientificName: "Opuntia",
    category: "fruit",
    months: [8, 9, 10],
    inatTaxonIds: [47902],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Ripe red-to-purple tunas pull free easily from the pad; burn, scrub, and peel to remove the tiny barbed glochids before eating, and chew or spit the hard seeds (impaction risk in quantity). Pads carry oxalates. Never eat a milky-sap succulent, that signals a toxic non-cactus. Some native Opuntia are protected; harvest abundant or naturalized stands and check local status."
  },
  {
    id: "pinyon-pine-nut",
    commonName: "Pinyon pine nuts",
    scientificName: "Pinus edulis and Pinus monophylla",
    category: "nut",
    months: [9, 10, 11],
    inatTaxonIds: [57902, 57892],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Large wingless seeds from pinyon cones in pinyon-juniper woodland; edible raw or roasted. Don't confuse pinyon with the juniper 'berries' growing alongside, and never eat ornamental savin juniper or yew arils (deadly seed). Pinyon woodlands face drought die-off and the nuts are a vital Indigenous (Shoshone/Paiute/Washo/Navajo/Hopi) and wildlife food, take only a share and honor tribal collecting rights; occurrence is not permission."
  },
  {
    id: "mesquite-bean",
    commonName: "Mesquite pods",
    scientificName: "Prosopis (Neltuma)",
    category: "nut",
    months: [7, 8, 9],
    inatTaxonIds: [1493090],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Grind the sweet ripe pod pulp (not the hard seeds) into flour. Food-safety critical: pick dry, brittle pods straight off the tree BEFORE the summer monsoon and never wet or wash them, rain-dampened pods can carry aflatoxin even when they look clean; reject bitter, chalky, or mold-spotted pods. Confirm true mesquite: many desert legumes (mescal bean, coral bean, rattlebox, catclaw, paloverde, senna) are toxic. A keystone wildlife and Indigenous food."
  },
  {
    id: "chinquapin",
    commonName: "Chinquapin nuts",
    scientificName: "Chrysolepis sempervirens and Castanea pumila",
    category: "nut",
    months: [8, 9, 10],
    inatTaxonIds: [53386, 84363],
    parkLimit: "Confirm local rules; not listed in the encoded Shenandoah compendium allowance.",
    shenandoahAllowed: false,
    notes: "Small sweet chestnut-relative nut in a dense, sea-urchin-spiny bur; collect fallen, opened burs (wear gloves). DEADLY-ish lookalike: buckeye/horse chestnut (Aesculus) has a smooth leathery husk with one large bitter nut, and its toxin survives cooking, only correct ID is safe. Note the name collision with chinquapin oak (an acorn, not a bur). Some chinquapin lineages are rare or blight-declining, harvest only abundant stands and leave seed for wildlife."
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
    usedParts: "Fallen green-to-black hulls.",
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
    usedParts: "Fallen oak galls and acorn caps.",
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
    usedParts: "Outer nut hulls (fallen).",
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
    usedParts: "Ripe berry clusters (drupes).",
    notes: "True Rhus sumacs are tannin-rich and useful for brown or modifier inks."
  },
  {
    id: "ink-goldenrod",
    commonName: "Goldenrod",
    scientificName: "Solidago",
    category: "yellow",
    months: [8, 9, 10],
    inatTaxonIds: [48678],
    shenandoahAllowed: false,
    usedParts: "Flowering tops in bloom.",
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
    usedParts: "Heartwood and fallen fruit.",
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
    usedParts: "Ripe dark berries.",
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
    usedParts: "Ripe red fruit.",
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
    usedParts: "Ripe fruit.",
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
    usedParts: "Ripe berries (ripe only).",
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
    usedParts: "Ripe berries.",
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
    usedParts: "Dark ripe fruit.",
    notes: "Dark fruits can make blue-purple inks; this group includes inedible Boston ivy for pigment mapping."
  },
  {
    id: "ink-tupelo",
    commonName: "Black tupelo (black gum)",
    scientificName: "Nyssa sylvatica",
    category: "purple",
    months: [9, 10, 11],
    inatTaxonIds: [54802],
    shenandoahAllowed: false,
    usedParts: "Ripe blue-black drupes.",
    notes: "Ripe blue-black drupes make a dusky grape-purple ink; the fruit is edible but very sour. Leave plenty, important fall food for birds."
  },
  // ---- 2026-06 ink/dye expansion beyond the temperate East (candidates pass).
  // Inks (berry/fruit/pigment) ----
  {
    id: "ink-himalayan-blackberry",
    commonName: "Himalayan blackberry",
    scientificName: "Rubus armeniacus",
    category: "purple",
    months: [7, 8, 9],
    inatTaxonIds: [61317],
    shenandoahAllowed: false,
    usedParts: "Ripe black berries.",
    notes: "Crushed ripe berries give a quick purple ink, but it is fugitive (fades toward gray), so treat it as casual/ephemeral. This Pacific-Northwest shrub invasive is good to remove."
  },
  {
    id: "ink-prickly-pear",
    commonName: "Prickly pear",
    scientificName: "Opuntia polyacantha, O. engelmannii",
    category: "red",
    months: [8, 9, 10],
    inatTaxonIds: [78269, 78264],
    shenandoahAllowed: false,
    usedParts: "Ripe fruit (tunas).",
    notes: "Ripe tunas yield a vivid magenta betalain ink; handle glochid spines with tongs and gloves. The color is fugitive, and it is the plant's own pigment, not cochineal."
  },
  {
    id: "ink-rouge-plant",
    commonName: "Rouge plant (pigeonberry)",
    scientificName: "Rivina humilis",
    category: "red",
    months: [8, 9, 10, 11],
    inatTaxonIds: [133291],
    shenandoahAllowed: false,
    usedParts: "Ripe red berries.",
    notes: "Ripe berries make a fugitive rouge-red ink. The berries are toxic if eaten, do not ingest, and expect stained hands."
  },
  {
    id: "ink-bee-plant",
    commonName: "Rocky Mountain bee plant",
    scientificName: "Cleomella serrulata",
    category: "black",
    months: [6, 7, 8],
    inatTaxonIds: [1415100],
    shenandoahAllowed: false,
    usedParts: "Whole flowering plant, boiled to a resin.",
    notes: "Boiled down to a black resin, this self-seeding annual is the ancestral Puebloan pottery-paint black (and a Navajo yellow-green dye). Cutting plants is low-impact; pungent, paint/dye use only."
  },
  {
    id: "ink-brazilian-pepper",
    commonName: "Brazilian pepper",
    scientificName: "Schinus terebinthifolia",
    category: "red",
    months: [11, 12, 1],
    inatTaxonIds: [130872],
    shenandoahAllowed: false,
    usedParts: "Ripe red berries.",
    notes: "A Florida-prohibited invasive worth removing, its berries give a red stain, but it is a poison-ivy relative: urushiol causes contact dermatitis, and the smoke is hazardous. Gloves; never burn."
  },
  {
    id: "ink-oregon-grape",
    commonName: "Oregon grape & barberry",
    scientificName: "Berberis aquifolium, B. repens, B. fremontii, B. trifoliolata",
    category: "blue",
    months: [7, 8, 9],
    inatTaxonIds: [126887, 133104, 75752, 273862],
    shenandoahAllowed: false,
    usedParts: "Ripe dusky-blue berries (not the roots).",
    notes: "Ripe dusky-blue berries make a pH-shifting blue-purple ink. The bright berberine yellow lives in the roots and bark, but digging kills these slow-growing shrubs, use berries, not roots."
  },
  // ---- Dyes (foliage / bark / whole-plant) ----
  {
    id: "dye-artemisia",
    commonName: "Sagebrush & mugwort",
    scientificName: "Artemisia tridentata, A. californica, A. douglasiana",
    category: "yellow",
    months: [5, 6, 7, 8, 9, 10],
    inatTaxonIds: [75598, 53357, 52854],
    shenandoahAllowed: false,
    usedParts: "Leaves and soft stems.",
    notes: "Sagebrush and mugwort foliage give yellow-to-olive dye (greener with iron); light tip-harvest is negligible. This is Artemisia, NOT white sage (Salvia), don't confuse the two."
  },
  {
    id: "dye-mormon-tea",
    commonName: "Mormon tea (Ephedra)",
    scientificName: "Ephedra viridis",
    category: "brown",
    months: [4, 5, 6, 7, 8, 9],
    inatTaxonIds: [57891],
    shenandoahAllowed: false,
    usedParts: "Green jointed twigs.",
    notes: "Green Ephedra twigs give a soft desert tan; clip from the abundant stem mass and leave the plant rooted. Dye-only, some Ephedra carry alkaloids, so do not ingest."
  },
  {
    id: "dye-camphor",
    commonName: "Camphor tree",
    scientificName: "Cinnamomum camphora",
    category: "brown",
    months: [4, 5, 6, 7, 8, 9, 10],
    inatTaxonIds: [1591063],
    shenandoahAllowed: false,
    usedParts: "Mature/old leaves and leaf litter.",
    notes: "Old leaves of this Florida Category-I invasive give a dark brown; removal supports control. Strong camphor volatiles, ventilate; toxic if ingested."
  },
  {
    id: "dye-canaigre",
    commonName: "Canaigre (tanner's dock)",
    scientificName: "Rumex hymenosepalus",
    category: "brown",
    months: [9, 10, 11],
    inatTaxonIds: [58291],
    shenandoahAllowed: false,
    usedParts: "Tannin-rich tuberous roots.",
    notes: "Tannin-rich tubers give a warm brown and act as their own mordant; a partial dig leaves the colony intact. High in tannin and oxalate, do not ingest."
  },
  {
    id: "dye-cliffrose",
    commonName: "Cliffrose",
    scientificName: "Purshia stansburyana",
    category: "yellow",
    months: [5, 6, 7, 8],
    inatTaxonIds: [78787],
    shenandoahAllowed: false,
    usedParts: "Leafy twig tips.",
    notes: "Leafy twig tips give a Navajo gold. Abundant, but also valuable wildlife browse and erosion control, clip tips lightly."
  },
  {
    id: "dye-st-johns-wort",
    commonName: "St. John's wort (Klamath weed)",
    scientificName: "Hypericum perforatum",
    category: "yellow",
    months: [6, 7, 8],
    inatTaxonIds: [56077],
    shenandoahAllowed: false,
    usedParts: "Flowering tops; crushed dark glands for red.",
    notes: "Flowering tops give yellow; the dark petal glands a surprising red. This invasive 'Klamath weed' is good to remove, but hypericin causes photosensitivity, so wear gloves."
  },
  {
    id: "dye-coyote-brush",
    commonName: "Coyote brush",
    scientificName: "Baccharis pilularis",
    category: "yellow",
    months: [8, 9, 10, 11],
    inatTaxonIds: [53359],
    shenandoahAllowed: false,
    usedParts: "Leaves and young branch tips.",
    notes: "Leaves and young tips of this ubiquitous coastal-scrub shrub give yellow-to-khaki dye; it resprouts vigorously and shrugs off light harvest."
  },
  {
    id: "dye-curly-dock",
    commonName: "Curly dock",
    scientificName: "Rumex crispus",
    category: "brown",
    months: [9, 10, 11],
    inatTaxonIds: [53197],
    shenandoahAllowed: false,
    usedParts: "Yellow forking taproot.",
    notes: "The yellow taproot of this weedy naturalized dock gives a brown dye, and digging it out doubles as removal. Leaves are high in oxalic acid; use the root."
  },
  {
    id: "dye-douglas-fir",
    commonName: "Douglas-fir",
    scientificName: "Pseudotsuga menziesii",
    category: "brown",
    months: [9, 10, 11, 12],
    inatTaxonIds: [48256],
    shenandoahAllowed: false,
    usedParts: "Fallen cones, bark, and mill waste.",
    notes: "Fallen cones and bark give peach-to-tan dye with zero impact on living trees, a pure waste-stream pigment from the forest floor and lumber yards."
  },
  {
    id: "dye-eucalyptus",
    commonName: "Eucalyptus",
    scientificName: "Eucalyptus",
    category: "brown",
    months: [5, 6, 7, 8, 9, 10],
    inatTaxonIds: [51815],
    shenandoahAllowed: false,
    usedParts: "Leaves and shed bark.",
    notes: "Leaf and shed-bark litter from this naturalized tree give rare true rusts and reds. Leaves and oil are toxic if ingested; ventilate when simmering."
  },
  {
    id: "dye-greenthread",
    commonName: "Greenthread (Navajo tea)",
    scientificName: "Thelesperma megapotamicum",
    category: "yellow",
    months: [6, 7, 8, 9],
    inatTaxonIds: [79345],
    shenandoahAllowed: false,
    usedParts: "Whole flowering plant.",
    notes: "The whole flowering plant gives yellow-to-orange; it reseeds, so cut a few inches above the soil. A long-standing Pueblo/Navajo dye and tea plant."
  },
  {
    id: "dye-honey-mesquite",
    commonName: "Honey mesquite",
    scientificName: "Neltuma glandulosa (Prosopis glandulosa)",
    category: "brown",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [1493134],
    shenandoahAllowed: false,
    usedParts: "Shed bark, fallen wood, exuded gum.",
    notes: "Shed bark and dark exuded gum give brown-to-black; use fallen wood and gum, not wounds to living trees. Sharp thorns; tannin sap stains skin."
  },
  {
    id: "dye-manzanita",
    commonName: "Manzanita",
    scientificName: "Arctostaphylos",
    category: "brown",
    months: [6, 7, 8, 9],
    inatTaxonIds: [47179],
    shenandoahAllowed: false,
    usedParts: "Shed bark and fallen leaves.",
    notes: "Shed red bark and fallen leaves give rosy-browns. Listed at genus level, use shed and fallen material of common species only; never dig or cut whole plants (some are rare)."
  },
  {
    id: "dye-one-seed-juniper",
    commonName: "One-seed juniper",
    scientificName: "Juniperus monosperma",
    category: "brown",
    months: [9, 10, 11],
    inatTaxonIds: [120145],
    shenandoahAllowed: false,
    usedParts: "Shed bark, twigs, berries; green-needle ash as mordant.",
    notes: "Shed bark, twigs, and berries give tan and brown; the green-needle ash is a traditional Navajo alkaline mordant. Dye-only, not for ingestion; not savin juniper (J. sabina)."
  },
  {
    id: "dye-madrone",
    commonName: "Pacific madrone",
    scientificName: "Arbutus menziesii",
    category: "brown",
    months: [7, 8, 9],
    inatTaxonIds: [51046],
    shenandoahAllowed: false,
    usedParts: "Naturally shed bark sheets.",
    notes: "Madrone sheds its cinnamon bark in thin sheets each summer, collect the sloughed sheets off the ground for a pink-brown dye. Don't strip living bark (it is root-rot sensitive)."
  },
  {
    id: "dye-plains-coreopsis",
    commonName: "Plains coreopsis",
    scientificName: "Coreopsis tinctoria",
    category: "yellow",
    months: [6, 7, 8, 9],
    inatTaxonIds: [76445],
    shenandoahAllowed: false,
    usedParts: "Flower heads in bloom.",
    notes: "'Tinctoria' means 'used for dyeing', the flowers give reliable gold-to-orange. A heavy self-seeder, so flower harvest and garden patches are low-impact. (Use this, not the rare giant coreopsis.)"
  },
  {
    id: "dye-alder",
    commonName: "Alder",
    scientificName: "Alnus rubra, A. incana",
    category: "brown",
    months: [4, 5, 6, 7, 8, 9],
    inatTaxonIds: [56034, 75377],
    shenandoahAllowed: false,
    usedParts: "Inner bark of fallen limbs and prunings.",
    notes: "Bark from fallen alder limbs and coppice prunings gives orange-red-brown; both red and mountain alder coppice vigorously, so take fallen material, not live trunks."
  },
  {
    id: "dye-rabbitbrush",
    commonName: "Rabbitbrush",
    scientificName: "Ericameria nauseosa, Chrysothamnus viscidiflorus",
    category: "yellow",
    months: [8, 9, 10],
    inatTaxonIds: [57934, 76329],
    shenandoahAllowed: false,
    usedParts: "Flowering tops.",
    notes: "Flowering tops give the Southwest's most sustainable bright yellow; snip tops and leave the shrub intact. A well-documented Hopi/Navajo dye; dye-only."
  },
  {
    id: "dye-scotch-broom",
    commonName: "Scotch broom",
    scientificName: "Cytisus scoparius",
    category: "yellow",
    months: [4, 5, 6],
    inatTaxonIds: [48538],
    shenandoahAllowed: false,
    usedParts: "Flowers and flowering tips.",
    notes: "Blossoms give a buttery yellow, and cutting this top-priority noxious weed supports control. Seeds and foliage carry toxic alkaloids, do not ingest."
  },
  {
    id: "dye-wax-myrtle",
    commonName: "Southern wax myrtle",
    scientificName: "Morella cerifera",
    category: "yellow",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [119956],
    shenandoahAllowed: false,
    usedParts: "Leaves.",
    notes: "Leaves give a pale gold that shifts gray-green with iron; this fast-resprouting Gulf evergreen shrugs off light leaf harvest. (The waxy berries are for candle wax.)"
  },
  {
    id: "dye-spanish-moss",
    commonName: "Spanish moss",
    scientificName: "Tillandsia usneoides",
    category: "brown",
    months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    inatTaxonIds: [49569],
    shenandoahAllowed: false,
    usedParts: "Storm-fallen strands, off the ground.",
    notes: "Storm-fallen strands gathered off the ground give tan-to-brown with minimal impact. Rinse and inspect, wild moss can harbor chiggers and mites."
  },
  {
    id: "dye-toyon",
    commonName: "Toyon (California holly)",
    scientificName: "Heteromeles arbutifolia",
    category: "brown",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [53405],
    shenandoahAllowed: false,
    usedParts: "Leaves and bark.",
    notes: "Leaves and bark give red-brown, but as a Rosaceae the heated bath releases cyanide fumes, so simmer OUTDOORS only. Abundant and resprouting; do not ingest."
  },
  {
    id: "dye-wild-fennel",
    commonName: "Wild fennel",
    scientificName: "Foeniculum vulgare",
    category: "yellow",
    months: [6, 7, 8, 9, 10],
    inatTaxonIds: [53052],
    shenandoahAllowed: false,
    usedParts: "Fronds, flowers, seed heads.",
    notes: "Fronds and seed heads of this Cal-IPC invasive give a luteolin yellow; removal helps native habitat. Confirm ID, it resembles toxic poison hemlock (fennel smells of licorice)."
  },
  {
    id: "dye-dyers-woad",
    commonName: "Dyer's woad",
    scientificName: "Isatis tinctoria",
    category: "blue",
    months: [4, 5, 6],
    inatTaxonIds: [77509],
    shenandoahAllowed: false,
    usedParts: "Leaves (eradication harvest only).",
    notes: "Leaves give an indigo-type blue, but this is an aggressive noxious weed: harvest only to eradicate existing stands and bag the seed heads. The vat uses caustic lye; dye-only."
  },
  {
    id: "dye-mountain-mahogany",
    commonName: "Mountain mahogany",
    scientificName: "Cercocarpus montanus",
    category: "brown",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [52378],
    shenandoahAllowed: false,
    usedParts: "Bark from pruned or fallen branches.",
    notes: "Bark from pruned or fallen branches gives a deep reddish-brown; do not dig the taproot (it kills the slow shrub). An important Navajo/Pueblo dye, handle respectfully; foliage is cyanogenic."
  },
  // ---- Educational-only / observe-only (cultural, regional, or conservation
  // knowledge required; published with an explicit stamp, not as harvest targets) ----
  {
    id: "ink-carolina-redroot",
    commonName: "Carolina redroot",
    scientificName: "Lachnanthes caroliniana",
    category: "red",
    months: [6, 7, 8, 9],
    inatTaxonIds: [164401],
    shenandoahAllowed: false,
    educationalOnly: true,
    usedParts: "Rhizome/root, observe only; do not dig wild.",
    notes: "Educational only. A documented Indigenous red dye, but the color is in the root of a wetland perennial, digging destroys the plant and its bog habitat, and the plant is toxic. Observe; do not harvest wild."
  },
  {
    id: "ink-tanoak",
    commonName: "Tanoak",
    scientificName: "Notholithocarpus densiflorus",
    category: "brown",
    months: [6, 7, 8, 9, 10],
    inatTaxonIds: [69823],
    shenandoahAllowed: false,
    educationalOnly: true,
    usedParts: "Bark from already-dead/felled wood only.",
    notes: "Educational only. Bark gives brown to iron-black, but the tree is in steep decline from Sudden Oak Death and is a cultural acorn staple, use only already-dead or felled wood, and mind SOD quarantine rules."
  },
  {
    id: "ink-western-redcedar",
    commonName: "Western redcedar",
    scientificName: "Thuja plicata",
    category: "brown",
    months: [5, 6, 7, 8, 9],
    inatTaxonIds: [48252],
    shenandoahAllowed: false,
    educationalOnly: true,
    usedParts: "Bark, observe only; off-limits for casual harvest.",
    notes: "Educational only. A sacred 'tree of life' to PNW Coast Salish nations; bark harvest can kill these climate-stressed trees. Listed to honor it, seek permission and local knowledge, not a how-to."
  },
  {
    id: "ink-wolf-lichen",
    commonName: "Wolf lichen",
    scientificName: "Letharia vulpina",
    category: "yellow",
    months: [4, 5, 6, 7, 8, 9, 10],
    inatTaxonIds: [54613],
    shenandoahAllowed: false,
    educationalOnly: true,
    usedParts: "Wind-fallen branches only, observe only.",
    notes: "Educational only. A vivid chartreuse-yellow lichen that grows ~4 mm a year and is toxic (vulpinic acid); over-collection has wiped out local stands. Observe only, use onion skins for yellow instead."
  },
  // ---- 2026-06 fungal dyes (Tier-A wood polypores; see docs/mushroom-inks-research.md).
  // Persistent/annual wood-decay brackets, non-toxic, muted yellow/gold/brown palette
  // (iron shifts toward green/grey). Framed strictly for DYE USE — never as food. ----
  {
    id: "ink-dyers-polypore",
    commonName: "Dyer's polypore",
    scientificName: "Phaeolus schweinitzii",
    category: "yellow",
    months: [7, 8, 9, 10, 11],
    inatTaxonIds: [118084],
    shenandoahAllowed: false,
    usedParts: "Fresh or dried fruiting bodies, simmered for pigment on alum-mordanted wool.",
    notes: "Dye use only, do not eat. The classic dye polypore: reliable yellows and golds on alum, and its signature green comes only from an iron modifier (a caustic, staining step). A velvety rust-brown annual bracket at the base of living or dead conifers; no deadly lookalike, but old specimens resemble other brown brackets (Inonotus, Fomitopsis), none for eating either. Annual fruiting, so a pin marks a past fruiting, not a standing harvest."
  },
  {
    id: "ink-turkey-tail",
    commonName: "Turkey tail",
    scientificName: "Trametes versicolor",
    category: "yellow",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    inatTaxonIds: [54134],
    shenandoahAllowed: false,
    usedParts: "Fresh brackets, simmered for pigment on alum-mordanted wool (iron pushes toward greenish/rust).",
    notes: "Dye use only, do not eat. The easiest dyer to find, thin, banded, year-round brackets on dead hardwood. Color is modest (tans and golds; greenish with iron). Non-toxic lookalikes include false turkey tail (Stereum ostrea) and Trichaptum; none are food. Identify carefully before harvesting."
  },
  {
    id: "ink-artists-conk",
    commonName: "Artist's conk",
    scientificName: "Ganoderma applanatum",
    category: "brown",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    inatTaxonIds: [48473],
    shenandoahAllowed: false,
    usedParts: "Fresh or dried perennial conk, simmered for pigment on alum-mordanted wool (iron deepens toward grey-brown).",
    notes: "Dye use only, do not eat (it is woody and inedible regardless). A large perennial shelf polypore on dead or dying hardwood, visible year-round, so genuinely mappable. Gives warm browns. Similar conks (other Ganoderma, Fomitopsis) are likewise dye or medicinal, not casual food, identify carefully."
  },
  {
    id: "ink-red-belted-conk",
    commonName: "Red-belted conk",
    scientificName: "Fomitopsis mounceae complex",
    category: "yellow",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    inatTaxonIds: [877361, 495903, 877362],
    shenandoahAllowed: false,
    usedParts: "Fresh or dried perennial conk, simmered for pigment on alum-mordanted wool (iron shifts toward grey/olive).",
    notes: "Dye use only, do not eat (woody). This maps the North American complex, F. mounceae, F. ochracea, and F. schrenkii, not the European \"Fomitopsis pinicola,\" which barely occurs here. A perennial banded conk with a red-orange margin on conifer and hardwood, visible year-round. Yellow/tan/brown palette; no deadly lookalike, but identify carefully."
  },
  {
    id: "ink-tinder-conk",
    commonName: "Tinder conk",
    scientificName: "Fomes fomentarius",
    category: "yellow",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    inatTaxonIds: [127510],
    shenandoahAllowed: false,
    usedParts: "Fresh or dried perennial conk (and its inner trama), simmered for pigment on alum-mordanted wool.",
    notes: "Dye use only, do not eat (woody; also the traditional amadou / tinder fungus). A hoof-shaped perennial conk on hardwood, especially birch and beech, visible year-round. Yellows, golds, and browns; browner or greyer with iron. No deadly lookalike, but identify carefully before harvesting."
  },
  {
    id: "ink-chicken-of-the-woods",
    commonName: "Chicken of the woods",
    scientificName: "Laetiporus sulphureus / cincinnatus",
    category: "yellow",
    months: [6, 7, 8, 9, 10, 11],
    inatTaxonIds: [53713, 487301],
    shenandoahAllowed: false,
    usedParts: "Fresh brackets, simmered for pigment on alum-mordanted wool (iron dulls toward olive/brown).",
    notes: "Listed here for DYE USE, its bright oranges, yellows, and golds, not as an eat-me signal. It is a popular edible when expertly identified and thoroughly cooked, but reactions are common, especially from brackets grown on conifer, eucalyptus, yew, or cedar. Toxic lookalike: the jack-o'-lantern (Omphalotus illudens) is gilled, clusters at tree bases, and causes serious GI illness, Laetiporus is pored (no gills), so check the underside. Annual fruiting; a pin marks a past fruiting, not a standing harvest."
  }
];

const medicineSpeciesCatalog = [
  {
    id: "medicine-jewelweed",
    commonName: "Jewelweed",
    scientificName: "Impatiens capensis",
    category: "garden",
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
    category: "greens",
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
    category: "dried",
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
    category: "greens",
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
    category: "skincare",
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
    category: "dried",
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
    category: "dried",
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
    category: "garden",
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
    category: "dried",
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
    category: "dried",
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
    category: "kitchen",
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
    category: "greens",
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
    category: "kitchen",
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
    category: "greens",
    months: [3, 4, 5, 6],
    inatTaxonIds: [53059],
    shenandoahAllowed: false,
    usedParts: "Tender aerial parts before seed.",
    notes: "Clinging spring annual; collect before the plant becomes tough and seedy, where permitted."
  }
];

// Minerals map: each "species" is a craft-material type (no iNaturalist taxon —
// localities come from cached USGS MRDS points, not live observations). months
// spans the full year because stone is not seasonal; the season scrubber simply
// never filters minerals out. Each material is its own category/color.
const mineralSpeciesCatalog = [
  {
    id: "mineral-quartz",
    commonName: "Quartz crystal",
    scientificName: "Quartz · SiO₂",
    category: "quartz",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    usedParts: "Lapidary, cabochons, faceting, carving, and bead/wire-wrap work.",
    notes: "Mount Ida / Montgomery Co. is a famous quartz-crystal district, but most named \"mines\" are commercial pay-to-dig or claimed ground, not free collecting."
  },
  {
    id: "mineral-novaculite",
    commonName: "Novaculite whetstone",
    scientificName: "Novaculite (microcrystalline quartz)",
    category: "novaculite",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    usedParts: "Sharpening stones, whetstones and oilstones, plus knapping and fine carving/inlay.",
    notes: "The classic Arkansas whetstone (Novaculite Uplift), graded by density: Washita (coarse) → Soft → Hard → Black/Translucent Arkansas (extra-fine). MRDS files most under \"Silica,\" so treat positions as a curated seed."
  },
  {
    id: "mineral-silica",
    commonName: "Silica (chert / flint)",
    scientificName: "Silica · SiO₂ (chert, flint, novaculite)",
    category: "silica",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    usedParts: "Knapping toolstone (flint / chert); also the holding bucket for unlabeled novaculite.",
    notes: "Knappable chert/flint (and unconfirmed novaculite). Toolstone outcrops are often archaeological sites, this maps raw geology only; collecting artifacts is illegal (ARPA)."
  },
  {
    id: "mineral-soapstone",
    commonName: "Soapstone (steatite)",
    scientificName: "Steatite (talc-rich rock)",
    category: "soapstone",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["asbestos risk, cut/grind wet", "use respiratory protection"],
    usedParts: "Carving, bowls, pipes, beads, figurines, molds, and cookware.",
    notes: "Soft, heat-stable carving stone of Appalachia (VA/NC/GA), New England, and the Pacific NW, from pure high-talc soapstone (softest) to harder steatite that holds finer detail. Eastern steatite outcrops are often prehistoric quarry sites (ARPA)."
  },
  {
    id: "mineral-clay",
    commonName: "Clay (pottery)",
    scientificName: "Clay minerals (kaolinite group)",
    category: "clay",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["silica dust, process wet"],
    usedParts: "Hand-built and wheel-thrown pottery, tile, and tobacco-pipe clay.",
    notes: "Regional clays: plastic ball clay (throwing), white kaolin (porcelain/glaze), iron-bearing stoneware/earthenware (hand-building), and high-alumina fire clay (kiln furniture)."
  },
  {
    id: "mineral-slate",
    commonName: "Slate (engraving & inlay)",
    scientificName: "Slate (metamorphic rock)",
    category: "slate",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    usedParts: "Engraving, inlay, coasters, and flagstone craft.",
    notes: "Splits into flat sheets for engraving and inlay, the Slate Valley belt (VT/NY), the PA Slate Belt, Buckingham (VA), and Monson (ME). Mostly private quarry operations; prefer waste-pile slate obtained with the operator's permission."
  },
  {
    id: "mineral-gemstone",
    commonName: "Gemstone / diamond",
    scientificName: "Diamond & gemstone (various)",
    category: "gemstone",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    usedParts: "Faceting, cabochons, and bead/setting work.",
    notes: "The Prairie Creek diatreme, Crater of Diamonds State Park, the rare public site where visitors may dig and keep diamonds (to cut and set) for a fee."
  },
  {
    id: "mineral-alabaster",
    commonName: "Alabaster (gypsum)",
    scientificName: "Gypsum · CaSO₄·2H₂O",
    category: "alabaster",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["gypsum dust, work wet or masked"],
    usedParts: "Carving, sculpture, lamps, boxes, and translucent inlay.",
    notes: "Soft (Mohs ~2), fine-grained massive gypsum that carves with hand tools and takes a soft translucent polish. From the gypsum districts of CO, OK, NM, UT, WY, and TX; collect loose float and quarry-waste blocks, not fresh outcrop. Bulk gypsum is a salable federal mineral, casual specimen collecting only."
  },
  {
    id: "mineral-pipestone",
    commonName: "Pipestone (catlinite)",
    scientificName: "Catlinite (indurated red claystone)",
    category: "pipestone",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["culturally restricted, see the collecting rule", "clay/silica dust, work wet"],
    usedParts: "Carving, traditionally ceremonial pipe bowls, effigies, and beads.",
    notes: "Soft red claystone of the Upper Midwest (MN, SD, WI). CRITICAL: quarrying at Pipestone National Monument is reserved by federal law to enrolled members of federally recognized tribes, it is not open public collecting. Treat pipestone as culturally restricted; see the rule on each point."
  },
  {
    id: "mineral-serpentine",
    commonName: "Serpentine",
    scientificName: "Serpentinite (antigorite / chrysotile)",
    category: "serpentine",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["may contain natural asbestos, cut/grind wet", "HEPA respiratory protection"],
    usedParts: "Carving and lapidary, figurines, bowls, beads, and cabochons.",
    notes: "Green carving/lapidary stone of the CA Coast Ranges and Sierra foothills and the VT/Appalachian ultramafic belt. Gather float and loose blocks; avoid disturbing serpentine barrens (rare endemic plants). Serpentinite frequently hosts naturally occurring asbestos, a real hazard."
  },
  {
    id: "mineral-limestone",
    commonName: "Limestone (carving freestone)",
    scientificName: "Limestone (dimension freestone)",
    category: "limestone",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["carving dust, mask + eye protection"],
    usedParts: "Carving and lettering, sculpture, relief, and architectural detail.",
    notes: "Soft, homogeneous freestone for carving, the classic is Salem (Indiana) limestone (Owen/Monroe/Lawrence Cos.); also TX, KS, MN. Source mill off-cuts and reject blocks rather than outcrop. Note: most MRDS \"limestone\" is aggregate or cement stone, not carving freestone."
  },
  {
    id: "mineral-marble",
    commonName: "Marble (carving / statuary)",
    scientificName: "Marble (metamorphic calcite)",
    category: "marble",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["carving dust + flying chips, mask + eye protection"],
    usedParts: "Sculpture and relief carving, inlay, and polished accents.",
    notes: "Fine statuary and craft marble, Danby/Proctor (VT), Tate (GA), Yule (CO), Tennessee marble, Sylacauga (AL). Statuary grades are near-exhausted or tightly held; source quarry scrap/reject by purchase or permission rather than pulling outcrop. Calcite, no silica hazard, but fine dust and chips."
  },
  {
    id: "mineral-obsidian",
    commonName: "Obsidian",
    scientificName: "Obsidian (volcanic glass)",
    category: "obsidian",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["extremely sharp, laceration risk", "silica/glass dust when grinding"],
    usedParts: "Knapping, pressure-flaked points and blades; some lapidary.",
    notes: "Premium volcanic-glass knapping toolstone of the West (OR Glass Buttes, CA, ID, NM, NV, AZ, UT, WY). Surface-collect loose float at designated open areas only; obsidian sources are the most heavily studied archaeological toolstone (ARPA) and are prohibited in NPS units such as Yellowstone."
  },
  {
    id: "mineral-agate",
    commonName: "Agate / chalcedony / jasper",
    scientificName: "Chalcedony (cryptocrystalline quartz)",
    category: "agate",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["silica dust, cut/grind wet"],
    usedParts: "Lapidary, cabbing, tumbling, beads, inlay, and knife scales.",
    notes: "The workhorse lapidary stone, Lake Superior agate (MN/WI/MI), Montana/moss agate, and jasper across OR, WY, TX, ID. Surface-collect float and gravel-bar material; take reasonable personal amounts and refill holes. Not on active mining claims without consent."
  },
  {
    id: "mineral-petrified-wood",
    commonName: "Petrified wood",
    scientificName: "Silicified wood (chalcedony / agate)",
    category: "petrified-wood",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    safetyTags: ["silica dust, cut/grind wet"],
    usedParts: "Lapidary, cabochons, slabs, bookends, and beads.",
    notes: "Silicified wood that cuts and polishes like agate, AZ, OR, WA, WY, UT, CO, TX, MT. On BLM land, free casual collection is capped at 25 lb/day + 250 lb/yr for personal use; STRICTLY prohibited in NPS units (Petrified Forest NP), removal there is a federal offense."
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
    dataNotes: `Chunked iNaturalist research-grade observations (via GBIF) across ${REGION_NAME}, chunked community records from Falling Fruit, public access boundaries from USGS PAD-US, and historic orchards from the National Park Service.`,
    rulesLabel: "Harvesting rules and limits",
    loadFallingFruit: true,
    loadNpsOrchards: true
  },
  ink: {
    id: "ink",
    speciesHeading: "Ink & Dye Colors & Materials",
    lede: `Discover plants, trees, and fruits that can produce natural inks and dyes across ${REGION_STATES} by season and habitat. The list favors abundant native species that can be harvested lightly, as well as invasive plants whose careful removal can support surrounding ecosystems.`,
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
    dataNotes: `Chunked iNaturalist research-grade observations (via GBIF) across ${REGION_NAME}, relevant chunked community records from Falling Fruit, public access boundaries from USGS PAD-US, and local collection rules where sourced. Ink and dye materials still require permission to collect.`,
    rulesLabel: "Collection rules and limits",
    loadFallingFruit: true,
    loadNpsOrchards: false
  },
  medicine: {
    id: "medicine",
    speciesHeading: "Herbs & Species",
    lede: `Explore the herb plants across ${REGION_STATES} by season and habitat, and the projects you can make from them: dried bundles, skin and body preparations, teas and syrups, wild greens, and garden crafts. This map is an educational reference to traditional use, not medical advice, and not a harvest recommendation.`,
    safetyNote: "This map is educational. Positively identify any plant before harvesting, prefer cultivated or purchased material where a lookalike is dangerous, and do not ingest or apply wild plants without guidance from a qualified practitioner.",
    categories: [
      { id: "dried", label: "Dried & Everlasting" },
      { id: "skincare", label: "Skin & Body" },
      { id: "kitchen", label: "Teas, Syrups & Edible Flowers" },
      { id: "greens", label: "Wild Greens" },
      { id: "garden", label: "Garden & Household" }
    ],
    categoryColors: MEDICINE_CATEGORY_COLORS,
    catalog: medicineSpeciesCatalog,
    sourceNames: ["iNaturalist"],
    dataNotes: `Chunked iNaturalist research-grade observations (via GBIF), public access boundaries from USGS PAD-US, and local collection rules where sourced across ${REGION_NAME}. Plant and project notes are educational, historical and traditional, and are not instructions for treatment.`,
    rulesLabel: "Collection rules and limits",
    loadFallingFruit: false,
    loadNpsOrchards: false
  },
  minerals: {
    id: "minerals",
    speciesHeading: "Materials & Craft Stone",
    lede: `Locate craft stone across the contiguous US, pottery clay, carving stone (soapstone, alabaster, serpentine, marble), whetstones and knapping toolstone (novaculite, chert, obsidian), and lapidary material. Each point is a recorded mineral locality, not a collecting permission: stone-collecting rules differ sharply by land manager, and some materials are culturally restricted.`,
    categories: [
      { id: "clay", label: "Clay (pottery)" },
      { id: "alabaster", label: "Alabaster (gypsum)" },
      { id: "pipestone", label: "Pipestone (catlinite)" },
      { id: "soapstone", label: "Soapstone (steatite)" },
      { id: "serpentine", label: "Serpentine" },
      { id: "limestone", label: "Limestone (carving)" },
      { id: "marble", label: "Marble (carving)" },
      { id: "slate", label: "Slate (engraving)" },
      { id: "obsidian", label: "Obsidian (knapping)" },
      { id: "silica", label: "Silica (chert / flint)" },
      { id: "novaculite", label: "Novaculite whetstone" },
      { id: "quartz", label: "Quartz crystal" },
      { id: "agate", label: "Agate / jasper" },
      { id: "petrified-wood", label: "Petrified wood" },
      { id: "gemstone", label: "Gemstone / diamond" }
    ],
    categoryColors: MINERAL_CATEGORY_COLORS,
    catalog: mineralSpeciesCatalog,
    sourceNames: ["USGS MRDS"],
    dataNotes: `Recorded mineral localities from the USGS Mineral Resources Data System (public domain), a historic economic-mining inventory frozen at roughly 2011–2022 with positional grades, many points are old, inactive, or abandoned workings, so treat each as a curated seed rather than a live collecting spot. Never enter shafts, adits, or pits: collect only surface float. Land-manager context comes from NPS, USDA Forest Service, BLM, and USGS PAD-US boundaries. Occurrence is never collecting permission, rock and mineral collecting is generally allowed on BLM and national-forest land in reasonable amounts, prohibited in all national parks, varies on state land, and needs landowner permission on private land. Pipestone and some toolstone sources are culturally restricted.`,
    rulesLabel: "Rock & mineral collecting rules",
    loadFallingFruit: false,
    loadNpsOrchards: false,
    loadMinerals: true
    // National scope: mineral clusters render at every zoom (see
    // shouldShowPointLayers / applyMarkerZoomRangeForMode). No initialView —
    // that flyTo was a relic of the Arkansas-only era and made selecting
    // Minerals yank the view out to national while every other map stays put.
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
  activeMap: "ink",
  selectedDay: getDayOfYear(new Date()),
  allSeasons: false,
  // Context for the "Report an error" form sheet: { subject, page } describing
  // where the report was opened from (a record, a panel). Set by openReportForm.
  reportContext: null,
  mineralWorkability: 50, // 0-100 workability slider position (minerals mode only)
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
  // Highest loadMapData requestId that has finished (applied or was
  // superseded). activeRequest !== settledRequest means a load is in flight;
  // the boot idle backstop and the superseded-retry check it so they never
  // stack a redundant load on top of a healthy one.
  settledRequest: 0,
  activeINaturalistAggregateRequest: 0,
  activePublicRequest: 0,
  fallingFruitManifest: null,
  statusRaster: null,
  statusRasterPromise: null,
  fallingFruitChunkCache: new Map(),
  fallingFruitChunkLoads: new Map(),
  fallingFruitRecords: null,
  // Baked iNaturalist chunk tree (parallels the Falling Fruit fields above).
  inatChunkManifest: null,
  inatChunkCache: new Map(),
  inatChunkLoads: new Map(),
  inatChunkRecords: null,
  inatAnchorSpeciesMap: null, // memoized anchor->species for state.activeMap
  npsOrchardData: null,
  npsOrchardRecords: null,
  mineralData: null,
  mineralRecords: null,
  publicLandFeatures: [],
  publicLandCoverage: null,
  stateBoundaries: null,
  lastPhenologyRegion: null,
  localJurisdictions: null,
  usfsForestRules: null,
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
  // "Save this area" offline registry + in-flight progress (null when idle).
  savedAreas: readSavedAreas(),
  savedAreaBusy: null,
  // "Available" filters: show only species / projects whose material is in
  // season on the selected day (folds the old standalone "Now" view into the
  // Materials and Projects shelves). Independent per sheet, same selected day.
  materialsAvailableOnly: false,
  projectsAvailableOnly: false,
  register: "day",
  // The user's explicit wind-animation choice, kept separate from the
  // power/data gate so toggling tabs or battery state can't override intent.
  // Off by default (owner decision); the rail's "Animate wind" toggle opts in.
  fxUserEnabled: false,
  // Pinned map-light choice ("day"/"night") or null = auto (follow the sun).
  registerOverride: readRegisterOverride(),
  location: { lat: 39.8, lng: -98.6 }
};

// ---------------------------------------------------------------------------
// Shareable URL state. The hash carries map mode, view, and the day/workability
// filter so a teacher can bookmark or send "the pipestone view". Read once at
// boot (hash wins over the last-used-map fallback); written back with
// replaceState as the user moves — never pushState, so Back still leaves the app.
// ---------------------------------------------------------------------------
const ACTIVE_MAP_STORAGE_KEY = "craftAlmanacActiveMap";

function parseUrlBootState() {
  const boot = { center: null, zoom: null, speciesId: null, hadDayFilter: false };
  let params = null;
  try {
    params = new URLSearchParams(window.location.hash.slice(1));
  } catch {
    return boot;
  }
  const mode = params.get("map");
  const storedMode = (() => {
    try { return window.localStorage?.getItem(ACTIVE_MAP_STORAGE_KEY) || ""; } catch { return ""; }
  })();
  if (mode && MAP_MODE_CONFIG[mode]) state.activeMap = mode;
  else if (storedMode && MAP_MODE_CONFIG[storedMode]) state.activeMap = storedMode;
  // Booting into minerals defaults to "All materials" — the same open state
  // setMapMode forces on UI entry — unless the hash carries an explicit filter.
  if (MAP_MODE_CONFIG[state.activeMap]?.loadMinerals && !params.has("w") && params.get("season") !== "all") {
    state.allSeasons = true;
  }
  const c = (params.get("c") || "").split(",").map(Number);
  const z = Number(params.get("z"));
  if (c.length === 2 && c.every(Number.isFinite) && Number.isFinite(z)) {
    boot.center = [c[0], c[1]];
    boot.zoom = Math.min(19, Math.max(2.4, z));
  }
  if (params.get("season") === "all") state.allSeasons = true;
  const day = Number(params.get("day"));
  if (Number.isFinite(day) && day >= 1 && day <= 366) {
    state.selectedDay = Math.round(day);
    state.allSeasons = false;
    boot.hadDayFilter = true;
  }
  const w = Number(params.get("w"));
  if (Number.isFinite(w) && w >= 0 && w <= 100 && state.activeMap === "minerals") {
    state.mineralWorkability = Math.round(w);
    state.allSeasons = false;
    boot.hadDayFilter = true;
  }
  boot.speciesId = params.get("sp") || null;
  return boot;
}

const urlBootState = parseUrlBootState();

let urlHashTimer = null;
function updateUrlHash() {
  if (!state.mapReady) return;
  window.clearTimeout(urlHashTimer);
  urlHashTimer = window.setTimeout(() => {
    const c = map.getCenter();
    const params = new URLSearchParams();
    params.set("map", state.activeMap);
    params.set("c", `${c.lng.toFixed(4)},${c.lat.toFixed(4)}`);
    params.set("z", map.getZoom().toFixed(2));
    if (state.allSeasons) params.set("season", "all");
    else if (state.activeMap === "minerals") params.set("w", String(state.mineralWorkability));
    else params.set("day", String(state.selectedDay));
    if (state.selectedSpecies.size === 1) params.set("sp", [...state.selectedSpecies][0]);
    try {
      window.history.replaceState(null, "", `#${params.toString()}`);
    } catch { /* history API unavailable — non-essential */ }
  }, 250);
}

// ---- Map takeover (Mapbox killswitch, docs/mapbox-killswitch.md) ----
// A basemap auth error only happens when the token is dead, and revoking the
// token in the Mapbox dashboard IS the owner's emergency killswitch (revoked
// requests 401 and are not billed). Swap the broken map for an honest paused
// panel; the material/project/about sheets don't need Mapbox and stay usable.
// Sustained 429s (an organic traffic spike hitting provider rate limits) get
// the same takeover, but only after a few errors so one blipped tile doesn't
// retire the map for the whole session. This block MUST precede the no-token
// guard below: its let-bindings would otherwise still be in their temporal
// dead zone when the guard calls showMapTakeover during a halted boot.
const MAP_TAKEOVER_RATE_LIMIT_THRESHOLD = 3;
let mapTakeoverShown = false;
let mapRateLimitErrors = 0;

function showMapTakeover(kind, { minimal = false } = {}) {
  if (mapTakeoverShown) return;
  const mapArea = document.querySelector(".map-area");
  if (!mapArea) return;
  mapTakeoverShown = true;
  document.body.classList.add("map-takeover-active");
  // Minimal mode: the no-token boot halt, where nothing else in this file has
  // run, so the sheet buttons and masthead nav would be dead weight.
  if (minimal) document.body.classList.add("map-takeover-minimal");
  const paused = kind === "paused";
  const stamp = paused ? "CRAFT ALMANAC · LIVE MAP PAUSED" : "CRAFT ALMANAC · MAP OVER CAPACITY";
  const heading = paused ? "The live map is taking a break" : "The map is over capacity right now";
  const bodyCopy = paused
    ? "Craft Almanac has grown past what our map hosting can support right now, so we have switched the live map off while we make room. The map will be back."
    : "A lot of people are exploring at once and our map provider is limiting new tiles. Please try again in a little while.";
  const followup = minimal
    ? "Please check back soon."
    : "In the meantime, the material guides, project recipes, and access notes all still work:";
  const actions = minimal ? "" : `
    <div class="takeover-actions">
      <button type="button" data-takeover-sheet="plants">Materials</button>
      <button type="button" data-takeover-sheet="projects">Projects</button>
      <button type="button" data-takeover-sheet="about">About</button>
    </div>`;
  const panel = document.createElement("section");
  panel.id = "map-takeover";
  panel.setAttribute("aria-label", "Map unavailable");
  panel.innerHTML = `
    <div class="takeover-card">
      <p class="takeover-stamp">${stamp}</p>
      <h2 class="takeover-title" tabindex="-1">${heading}</h2>
      <p class="takeover-body">${bodyCopy}</p>
      <p class="takeover-body">${followup}</p>
      ${actions}
    </div>`;
  panel.querySelectorAll("[data-takeover-sheet]").forEach((button) => {
    button.addEventListener("click", () => openSheet(button.dataset.takeoverSheet));
  });
  mapArea.appendChild(panel);
  // Announce the takeover by moving focus to its heading, unless a modal
  // (welcome or a sheet) holds focus; the panel is still there when it closes.
  if (!document.body.classList.contains("modal-open")) {
    panel.querySelector(".takeover-title")?.focus?.();
  }
}

mapboxgl.accessToken = MAPBOX_TOKEN;

// Killswitch guard (docs/mapbox-killswitch.md): with no token at all the Map
// constructor throws and the rest of this file never runs, sheets included,
// so show the static paused takeover first and halt on our own terms. The
// graceful killswitch path is a REVOKED token (still present in config.js),
// which boots fully and degrades via the map "error" handler at the bottom.
if (!MAPBOX_TOKEN) {
  showMapTakeover("paused", { minimal: true });
  throw new Error("Craft Almanac: no Mapbox token configured; map boot halted (see docs/mapbox-killswitch.md)");
}

const map = new mapboxgl.Map({
  container: "map",
  style: MAPBOX_STYLE,
  center: urlBootState.center || [-98.6, 39.8],
  zoom: urlBootState.zoom ?? 3.25,
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
// Keep the shareable hash tracking the view (debounced inside updateUrlHash).
map.on("moveend", updateUrlHash);
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
  // A pinned override wins over the computed solar register (persisted user
  // choice); the default stays auto — night foragers keep the dark basemap.
  const reg = state.registerOverride || computeRegister(simNow(), state.location.lat, state.location.lng);
  if (reg === state.register) return;
  state.register = reg;
  document.body.dataset.register = reg;
  if (state.mapReady) {
    syncLightPreset(reg);
    updateMarkerHalo();
    // Category swatches/segments/cluster tints are register-aware
    // (registerCategoryColor), so crossing into/out of dusk+night must repaint
    // them. mapReady also guards the boot call, which runs before the DOM refs
    // are declared.
    renderMapLegend();
    renderHistogram();
    updateClusterTint();
    // The overview aggregate's dominant-category tint is baked with the
    // register's lightened hues, so re-tint it on a register change too
    // (self-guards to the low-zoom overview band).
    updateFallingFruitAggregates();
  }
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
  return date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ", ";
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
    ? ", <b>fungal flush likely</b> for whitelisted mushrooms."
    : ", below the flush threshold.";
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
    tideValue = state.tide ? ", " : "none nearby";
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
  if (rainDay > 0) out.push(`Rain expected ${dn(rainDay)}, check mushrooms ${dn(Math.min(rainDay + 2, 9))}.`);
  if (dryStart > 0) out.push(`Dry window ${dn(dryStart)}–${dn(dryEnd)}: berries, fiber, drying.`);
  return out.join(" ") || "No strong windows in the forecast.";
}

function conditionsDataAge() {
  const w = state.weather;
  if (!w || !w.fetched) return "";
  const age = Math.round((Date.now() - w.fetched) / 6e4);
  const freshness = w.src === "cached" ? `CACHED · ${age} MIN AGO` : age <= 1 ? "JUST FETCHED" : `${age} MIN AGO`;
  return `<div class="age">SOURCE: <a href="https://open-meteo.com" target="_blank" rel="noopener">OPEN-METEO</a> · ${freshness}</div>`;
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

// The dial's time preview re-derives the register via applyRegister(): it
// respects a pinned MAP LIGHT override (a pin must not flip during a preview)
// and repaints the register-baked surfaces (legend, histogram, cluster and
// aggregate tints) only on actual register transitions — its early return
// keeps the per-pointermove cost nil.
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
    applyRegister();
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
    applyRegister();
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
      <div class="reg-lock" role="group" aria-label="Map light">
        <span class="reg-lock-lab">MAP LIGHT</span>
        <button type="button" class="reg-opt${!state.registerOverride ? " on" : ""}" data-reg="auto" aria-pressed="${String(!state.registerOverride)}">Auto</button>
        <button type="button" class="reg-opt${state.registerOverride === "day" ? " on" : ""}" data-reg="day" aria-pressed="${String(state.registerOverride === "day")}">Day</button>
        <button type="button" class="reg-opt${state.registerOverride === "night" ? " on" : ""}" data-reg="night" aria-pressed="${String(state.registerOverride === "night")}">Night</button>
      </div>
      <div class="note" id="sun-times-note" style="margin-top:10px">First light ${formatClockTime(st.dawnCivil)} · Rise ${formatClockTime(st.rise)} · Golden ${formatClockTime(st.goldenEve)} · Set ${formatClockTime(st.set)} · Dark ${formatClockTime(st.duskCivil)}.</div>
      <div class="note" style="margin-top:8px"><b>Drag the sun</b> to preview any hour, or pin the map light above. Many parks close gathering at dusk; the register keeps the same clock.</div>`;
  } else if (openConditionSeg === "moon") {
    html = `<h3>MOON</h3>
      <div class="fig">${svgMoon(mp)}</div>
      <div class="fig">${svgMoonAxis(mp)}</div>
      <div class="note">${Math.round(mp.illum * 100)}% illuminated, ${mp.waxing ? "waxing" : "waning"}. Bright-moon nights favor low-tide walks and evening foraging; headlamps off when you can.</div>
      <div class="age">COMPUTED LOCALLY, NO NETWORK</div>`;
  } else if (openConditionSeg === "rain") {
    html = w
      ? `<h3>RAIN, MEMORY &amp; FORECAST (MM)</h3>
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
        ? `Next low ${formatClockTime(lowNext.t)} (${lowNext.v.toFixed(1)} ft), the intertidal window runs roughly 90 minutes either side.`
        : "";
      html = `<h3>TIDE, ${escapeHTML(state.tide.stationName || "NEAREST STATION")}</h3>
        <div class="fig">${svgTideCurve(state.tide.events)}</div>
        <div class="note">${windowLine}<br>Low tide is the gathering tide: seaweeds and shellfish beds open as the water falls. <b>Biotoxin closures always override</b>, closures are hand-encoded, never inferred.</div>
        <div class="age">SOURCE: NOAA CO-OPS · STATION ${escapeHTML(state.tide.stationId)} · PREDICTIONS</div>`;
    } else {
      html = `<h3>TIDE</h3>
        <div class="note">No NOAA tide station within ${TIDE_MAX_DISTANCE_KM} km of this location. Tides are coastal, search or pan the map to a shoreline and the nearest station's predictions load automatically.</div>`;
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
    railPad.querySelectorAll(".reg-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        setRegisterOverride(btn.dataset.reg === "auto" ? null : btn.dataset.reg);
        renderConditionsRail();
        renderConditionPanel();
      });
    });
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

// Category hues on the dark dusk/night registers: very dark colors (ink black
// #252321, obsidian #33323a) vanish against the dark panels and basemap, so
// blend them toward white just enough to clear a luminance floor. Same hue
// family, lightness floor only — mirrors the fixed-semantics --reg-st-* pattern.
// The auto day/night basemap is a deliberate feature (night foragers shouldn't
// be blinded); this keeps the data legible on it instead of overriding it.
function registerCategoryColor(hex) {
  if (!isNightish()) return hex;
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const FLOOR = 0.42;
  if (lum >= FLOOR) return hex;
  const t = (FLOOR - lum) / (1 - lum); // exact white-blend to reach the floor
  r = Math.round(r + (255 - r) * t);
  g = Math.round(g + (255 - g) * t);
  b = Math.round(b + (255 - b) * t);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Blend two hex colors (t = share of `b`). Used to soften the dominant-category
// cluster tint toward the base cream so tinted clusters read as one family.
function mixHex(a, b, t) {
  const pa = /^#?([0-9a-f]{6})$/i.exec(String(a || ""));
  const pb = /^#?([0-9a-f]{6})$/i.exec(String(b || ""));
  if (!pa || !pb) return a;
  const na = parseInt(pa[1], 16);
  const nb = parseInt(pb[1], 16);
  const ch = (x, y) => Math.round(x + (y - x) * t);
  const r = ch((na >> 16) & 255, (nb >> 16) & 255);
  const g = ch((na >> 8) & 255, (nb >> 8) & 255);
  const bl = ch(na & 255, nb & 255);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

// Dominant-category cluster fill for the ACTIVE mode: each cluster is tinted by
// its most common member category (70% category hue / 30% base cream), so the
// overview answers "what is here", not just "how many". First >=max branch
// wins ties; clusters with no counted members fall back to the base cream.
const CLUSTER_BASE_FILL = "#eef4e9";
const AGGREGATE_BASE_FILL = "#f7f2df";

// Per-category record counts for one aggregate cell, keyed by active-mode
// category. Returns null for iNaturalist-collapsed overview cells (which carry
// a single opaque taxon count with no species breakdown) and for cells with no
// selected-species records — those stay the base cream at full zoom-out.
function getAggregateItemCategoryCounts(item, selectedSpeciesIds) {
  // Baked iNaturalist chunk: counts keyed by anchor taxon id -> active species.
  if (item.countsByAnchor) {
    const anchorMap = getActiveInatAnchorSpeciesMap();
    const out = {};
    let any = false;
    for (const [anchor, n] of Object.entries(item.countsByAnchor)) {
      const species = anchorMap.get(Number(anchor));
      if (!species || !selectedSpeciesIds.has(species.id)) continue;
      out[species.category] = (out[species.category] || 0) + Number(n || 0);
      any = true;
    }
    return any ? out : null;
  }
  const counts = item.countsBySpeciesId;
  if (!counts || counts[INATURALIST_AGGREGATE_SPECIES_ID] != null) return null;
  const out = {};
  let any = false;
  for (const [sourceSpeciesId, n] of Object.entries(counts)) {
    const importedSpeciesId = getImportedSpeciesId(sourceSpeciesId);
    if (!selectedSpeciesIds.has(importedSpeciesId)) continue;
    const species = getSpecies(importedSpeciesId);
    if (!species) continue;
    out[species.category] = (out[species.category] || 0) + Number(n || 0);
    any = true;
  }
  return any ? out : null;
}

// Dominant-category fill for an aggregate cell from its per-category counts
// (70% register-aware category hue / 30% base cream, matching the cluster tint).
// Null when there's no category data, so the paint falls back to the cream.
function dominantAggregateCategoryColor(catCounts) {
  if (!catCounts) return null;
  const config = getActiveMapConfig();
  let bestCat = null;
  let bestCount = 0;
  for (const [cat, n] of Object.entries(catCounts)) {
    if (n > bestCount) { bestCount = n; bestCat = cat; }
  }
  if (!bestCat || !bestCount) return null;
  return mixHex(registerCategoryColor(config.categoryColors[bestCat] || "#777777"), AGGREGATE_BASE_FILL, 0.3);
}

function clusterColorExpression() {
  const config = getActiveMapConfig();
  const counts = config.categories.map((category) => ["coalesce", ["get", `n_${category.id}`], 0]);
  if (!counts.length) return CLUSTER_BASE_FILL;
  const maxExpr = ["max", ...counts, 0];
  const caseExpr = ["case"];
  config.categories.forEach((category, index) => {
    caseExpr.push([">=", counts[index], maxExpr]);
    caseExpr.push(mixHex(registerCategoryColor(config.categoryColors[category.id] || "#777777"), CLUSTER_BASE_FILL, 0.3));
  });
  caseExpr.push(CLUSTER_BASE_FILL);
  // Guard: if every count is 0 (legacy features without a category), stay cream.
  return ["case", [">", maxExpr, 0], caseExpr, CLUSTER_BASE_FILL];
}

function updateClusterTint() {
  if (!state.mapReady || !map.getLayer(MARKER_CLUSTERS_LAYER_ID)) return;
  map.setPaintProperty(MARKER_CLUSTERS_LAYER_ID, "circle-color", clusterColorExpression());
  // Count labels sit on arbitrary category hues now, so give them a halo.
  if (map.getLayer(MARKER_CLUSTER_COUNT_LAYER_ID)) {
    map.setPaintProperty(MARKER_CLUSTER_COUNT_LAYER_ID, "text-halo-color", "rgba(255,255,255,0.88)");
    map.setPaintProperty(MARKER_CLUSTER_COUNT_LAYER_ID, "text-halo-width", 1.1);
  }
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
// Signature of the flush marker set last painted; lets refreshFlush skip the
// DOM teardown+rebuild on renders where the flush set did not change.
let flushSignature = "";
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
      map.addSource("radar", { type: "raster", tiles: [tiles], tileSize: 256, maxzoom: 6, attribution: "Weather data by <a href=\"https://rainviewer.com\" target=\"_blank\" rel=\"noopener\">RainViewer</a>" });
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

function refreshFlush(visibleRecords) {
  const active = state.mapReady && state.weather && state.activeMap === "food" && flushThresholds;
  if (!active) {
    if (flushMarkers.length) { flushMarkers.forEach((m) => m.remove()); flushMarkers = []; }
    flushSignature = "";
    return;
  }
  const past72 = state.weather.past72;
  const eligible = (visibleRecords || getVisibleRecords()).filter((record) => {
    const species = getSpecies(record.speciesId);
    if (!species || species.category !== "mushroom") return false;
    const threshold = flushThresholds[species.id];
    if (!threshold || past72 < threshold.thresholdMm72h) return false;
    return Number.isFinite(Number(record.lat)) && Number.isFinite(Number(record.lng));
  });
  // Skip the DOM churn when the flush set is unchanged (the common case on a
  // slider drag / filter tap — flush depends only on visible mushrooms and the
  // 72 h rainfall, neither of which most renders touch). Rebuild otherwise.
  const signature = `${past72}|${eligible.map((r) => r.id).join(",")}`;
  if (signature === flushSignature) return;
  flushSignature = signature;
  flushMarkers.forEach((m) => m.remove());
  flushMarkers = [];
  eligible.forEach((record) => {
    const species = getSpecies(record.speciesId);
    const threshold = flushThresholds[species.id];
    const el = document.createElement("div");
    el.className = "flush-pulse";
    el.title = `${species.commonName}: rain-fed flush likely (past 72 h ${past72} mm ≥ ${threshold.thresholdMm72h} mm)`;
    flushMarkers.push(new mapboxgl.Marker({ element: el }).setLngLat([Number(record.lng), Number(record.lat)]).addTo(map));
  });
}

const dataStatus = document.querySelector("#dataStatus");
const daySlider = document.querySelector("#daySlider");
const dateInput = document.querySelector("#dateInput");
const seasonDateLabel = document.querySelector("#seasonDateLabel");
const seasonName = document.querySelector("#seasonName");
const seasonHistogram = document.querySelector("#seasonHistogram");
const mapLegend = document.querySelector("#mapLegend");
const conditionsRail = document.querySelector("#conditions-rail");
const railPanel = document.querySelector("#rail-panel");
const railPad = document.querySelector("#rail-pad");
const offlinePanel = document.querySelector("#offline-panel");
let offlineCtrlButton = null;
const locationSearchForm = document.querySelector("#locationSearchForm");
const locationSearchInput = document.querySelector("#locationSearchInput");
const locationSearchSuggestions = document.querySelector("#locationSearchSuggestions");
const locationSearchStatus = document.querySelector("#locationSearchStatus");
const welcomeModal = document.querySelector("#welcomeModal");
const welcomeModalButton = document.querySelector("#welcomeModalButton");
const allSeasonsButton = document.querySelector("#allSeasonsButton");
const seasonReset = document.querySelector("#seasonReset");
const histToggle = document.querySelector("#histToggle");
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
  if (sortedMonths.length === 12) return "Year-round";
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
    "nps-orchard": "National Park Service",
    mineral: "USGS MRDS"
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

// Pinned map-light choice ("day"/"night"), or null for auto (follow the sun).
// Lets an evening user read colored data on a light basemap instead of the
// near-black night register the 60s solar tick would otherwise force.
function readRegisterOverride() {
  try {
    const stored = window.localStorage?.getItem(REGISTER_OVERRIDE_STORAGE_KEY) || "";
    return REGISTER_OVERRIDE_VALUES.has(stored) ? stored : null;
  } catch {
    return null;
  }
}

function setRegisterOverride(value) {
  const next = REGISTER_OVERRIDE_VALUES.has(value) ? value : null;
  state.registerOverride = next;
  try {
    if (next) window.localStorage?.setItem(REGISTER_OVERRIDE_STORAGE_KEY, next);
    else window.localStorage?.removeItem(REGISTER_OVERRIDE_STORAGE_KEY);
  } catch { /* private mode — keep the in-memory choice */ }
  // Clearing to auto also ends any sun-dial preview so the live sun resumes.
  if (!next) state.simMins = null;
  const prevRegister = state.register;
  applyRegister();
  // The Mapbox lightPreset relight trails the (instant) chrome flip by several
  // silent seconds — dark panels float over a daylight map meanwhile. Say what
  // is happening and clear the note once the map settles. Pinning via the
  // Auto/Day/Night control is the only path that gets the cue; the sun-dial
  // preview drags through registers too fast for a per-change message.
  // Skip the cue when a sticky loading/outage/error message owns the line —
  // burying "iNaturalist unavailable" under a light notice (which then clears
  // to a healthy count on idle) would silently erase a real warning.
  if (state.mapReady && state.register !== prevRegister
    && dataStatusKind !== "loading" && dataStatusKind !== "outage" && dataStatusKind !== "error") {
    setDataStatus("Adjusting map light…", { kind: "notice" });
    map.once("idle", () => {
      if (dataStatusKind === "notice") {
        setDataStatus("", { kind: "idle" });
        updateRecordCountStatus();
      }
    });
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
  // The baked-iNaturalist anchor->species map is per-mode; drop the memo so it
  // rebuilds from the new active catalog on next use.
  state.inatAnchorSpeciesMap = null;
}

// Baked iNaturalist: map an anchor taxon id to the active mode's catalog species
// (the offline analog of live getSpeciesForObservation, which resolves per
// active mode). Memoized per mode; cleared in syncActiveCatalog.
function getActiveInatAnchorSpeciesMap() {
  if (state.inatAnchorSpeciesMap) return state.inatAnchorSpeciesMap;
  const map = new Map();
  for (const species of speciesCatalog) {
    for (const taxonId of species.inatTaxonIds || []) map.set(taxonId, species);
  }
  state.inatAnchorSpeciesMap = map;
  return map;
}

function renderModeChrome() {
  const config = getActiveMapConfig();
  // Per-mode source notes (config.dataNotes) are surfaced in the About sheet,
  // which reads the active config when opened; the lede is surfaced in the
  // Shelf/Materials sheet. No persistent DOM mount is needed here.
  // Persistent on-map herbalism disclaimer (CLAUDE.md non-negotiable; prototype
  // #mode-disclaimer) — shown only in the medicine/herbalism map.
  const disclaimer = document.getElementById("mode-disclaimer");
  if (disclaimer) disclaimer.hidden = state.activeMap !== "medicine";
  // Mode switching lives in the Maps sheet (masthead pills were tried and
  // removed 2026-07: four pills + nav + conditions rail overflowed the top bar
  // at common widths). URL `#map=` state and the legend's ACTIVE MAP line
  // remain the persistent mode indicators.
  // Minerals mode swaps the bottom rail from the season scrubber to the
  // workability slider. The nav label stays the mode-neutral "Materials"
  // (honest across plants, fungi, and stone), so no per-mode text swap.
  const isMineral = !!config.loadMinerals;
  if (seasonBar) seasonBar.classList.toggle("mode-minerals", isMineral);
  if (daySlider) {
    if (isMineral) { daySlider.min = "0"; daySlider.max = "100"; }
    else { daySlider.min = "1"; daySlider.max = String(getDaysInYear(ACTIVE_YEAR)); }
  }
  if (allSeasonsButton) allSeasonsButton.textContent = isMineral ? "All materials" : "All seasons";
  if (whenToggle) whenToggle.textContent = isMineral ? "Workability" : "Set date";
  applyMarkerZoomRangeForMode();
  updateClusterTint();
  renderMapLegend();
  // Keep the mobile active-map chip in sync with the current map.
  const mapChip = document.getElementById("activeMapChip");
  if (mapChip) {
    const info = MODE_SHEET_INFO[state.activeMap];
    mapChip.innerHTML =
      `<span class="amc-dot" style="background:${info ? info.color : "#888"}"></span>`
      + `<span class="amc-label">${info ? escapeHTML(info.label) : ""}</span>`
      + `<span class="amc-caret" aria-hidden="true">▾</span>`;
  }
}

// Phase 3e removed the sidebar's #categoryList checkbox panel; category and
// species selection live in state, driven by the floating legend chips and
// the Materials-sheet cards (the dead #categoryList/#accessStatusList
// remnants were fully deleted 2026-07).

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

// One legend chip can govern several underlying statuses (see
// LEGEND_PERMISSION_OPTIONS): a chip reads as ON when ANY of its statuses is
// selected, and toggling flips the whole group together.
function getLegendChipStatuses(chipId) {
  if (chipId === "prohibited") return ["prohibited"];
  const option = LEGEND_PERMISSION_OPTIONS.find((entry) => entry.id === chipId);
  return option?.statuses || [chipId];
}

function toggleAccessChip(chipId) {
  const set = state.selectedAccessStatuses
    || (state.selectedAccessStatuses = new Set(getDefaultAccessStatuses()));
  const statuses = getLegendChipStatuses(chipId);
  const anyOn = statuses.some((id) => set.has(id));
  statuses.forEach((id) => {
    if (anyOn) set.delete(id);
    else set.add(id);
  });
}

// Short mono badge lines for the collapsed legend: every user-applied filter
// that hides data must stay visible after the legend folds shut, or a pan an
// hour later reads as "no data here". The prohibited-off DEFAULT is deliberate
// design (not a user filter) and is not badged; the expanded chips carry it.
function getActiveFilterSummary() {
  const bits = [];
  const selected = getSelectedAccessStatuses();
  if (selected.size === 1 && selected.has("allowed")) {
    bits.push("ALLOWED ONLY");
  } else if (isAccessFilterActive(selected)) {
    const chipIds = [...LEGEND_PERMISSION_OPTIONS.map((o) => o.id), "prohibited"];
    const onCount = chipIds.filter((id) => getLegendChipStatuses(id).some((s) => selected.has(s))).length;
    if (onCount === chipIds.length) {
      // All groups on = the only deviation is prohibited being VISIBLE; a
      // "FILTERS: ACCESS 5/5" badge would misread as a restriction.
      bits.push("PROHIBITED SHOWN");
    } else {
      bits.push(`ACCESS ${onCount}/${chipIds.length}`);
    }
  }
  if (state.savedLocationsOnly) bits.push("SAVED ONLY");
  const total = speciesCatalog.length;
  const picked = speciesCatalog.filter((species) => state.selectedSpecies.has(species.id));
  if (picked.length === 1) {
    bits.push(`${String(picked[0].commonName || picked[0].id).toUpperCase()} ONLY`);
  } else if (total && picked.length < total) {
    bits.push(`${picked.length}/${total} SPECIES`);
  }
  return bits;
}

// Loaded-vs-shown record counts for the current viewport; null before the map
// is ready. "Loaded" is the fetched set (viewport-scoped for food/ink/medicine,
// national for minerals), "visible" is what survives the active filters.
function getRecordViewCounts(visibleRecords) {
  if (!state.mapReady) return null;
  const bounds = map.getBounds();
  const visible = visibleRecords || getVisibleRecords();
  const loadedInView = state.records.filter((record) => recordInBounds(record, bounds)).length;
  const visibleInView = visible.filter((record) => recordInBounds(record, bounds)).length;
  return { loadedInView, visibleInView };
}

// A bare `sp=` deep link (shared from a static material/project page) isolates
// the species but carries no center/zoom, so the visitor lands on the national
// map where no point records load (zoom ≥ 8 is required). Rather than leave an
// unexplained empty map, name the material and point them at the place search.
function promptSearchForDeepLink(materialName) {
  const mapArea = document.querySelector(".map-area");
  if (!mapArea || document.getElementById("deepLinkPrompt")) return;
  const chip = document.createElement("div");
  chip.id = "deepLinkPrompt";
  chip.className = "floating";
  chip.setAttribute("role", "note");
  chip.innerHTML = `<span>Showing <b>${escapeHTML(materialName)}</b>. Search your town to see it near you.</span><button type="button" aria-label="Dismiss">&times;</button>`;
  mapArea.appendChild(chip);
  chip.querySelector("button").addEventListener("click", () => chip.remove());
  // Best-effort: reveal + focus the place search once boot wiring has settled.
  window.setTimeout(() => {
    try {
      const masthead = document.getElementById("masthead");
      if (masthead && !masthead.classList.contains("search-open")) {
        document.getElementById("mastSearchBtn")?.click();
      }
      document.getElementById("locationSearchInput")?.focus({ preventScroll: true });
    } catch { /* non-fatal */ }
  }, 600);
}

// Offline indicator (Phase 5.5 PWA): a small, honest chip that makes the
// offline capability legible. Foraging/rockhounding happen off-grid — the
// cached rules + safety layer still work, but map tiles and live conditions
// may not, so we say so. Reuses the .floating panel + coach-chip styling.
// The chip is dismissible, but reappears if the connection drops again after a
// return to online (each fresh offline event re-shows it).
let offlineChipDismissed = false;

function setOfflineChip(show) {
  const mapArea = document.querySelector(".map-area");
  if (!mapArea) return;
  let chip = document.getElementById("offlineChip");

  if (!show) {
    // Back online: remove the chip and reset the dismissal so a later drop
    // shows it again.
    if (chip) chip.remove();
    offlineChipDismissed = false;
    return;
  }

  // Offline. Respect a manual dismissal for this offline stretch; don't double up.
  if (offlineChipDismissed || chip) return;
  chip = document.createElement("div");
  chip.id = "offlineChip";
  chip.className = "floating";
  chip.setAttribute("role", "status");
  chip.setAttribute("aria-live", "polite");
  chip.innerHTML = `<span>Offline, showing cached rules &amp; data; map tiles and live conditions may be unavailable.</span><button type="button" aria-label="Dismiss offline notice">&times;</button>`;
  mapArea.appendChild(chip);
  chip.querySelector("button").addEventListener("click", () => {
    offlineChipDismissed = true;
    chip.remove();
  });
}

function initOfflineIndicator() {
  // The online/offline events are the source of truth for a live transition;
  // we do not re-query navigator.onLine there (a synthetic event may not update
  // it, and the event already tells us the direction).
  window.addEventListener("online", () => setOfflineChip(false));
  window.addEventListener("offline", () => {
    offlineChipDismissed = false; // a fresh drop overrides an earlier dismissal
    setOfflineChip(true);
  });
  // Reflect the current state on load (e.g. launched already offline).
  setOfflineChip(navigator.onLine === false);
}

function initWelcomeModal() {
  if (!welcomeModal || !welcomeModalButton) return;
  // An inline script in index.html already un-hides the modal at first CSS
  // paint (it is the first-visit LCP element and must not wait for this file
  // to evaluate). Everything here is idempotent on top of that early reveal;
  // the inline script reads the same storage key by literal value.
  const hasSeenModal = window.localStorage?.getItem(WELCOME_MODAL_STORAGE_KEY) === "true";
  if (hasSeenModal) return;

  // Keyboard flow should resume at the app's own chrome, not Mapbox's zoom
  // cluster in the far corner. Resolved at DISMISS time (not init) and only to
  // a VISIBLE control: at narrow widths the nav links are collapsed behind the
  // menu trigger, and focusing a display:none element is a silent no-op.
  const resolveFocusAfterClose = () => {
    const candidates = [
      document.querySelector("#masthead .links button[data-sheet]"),
      document.querySelector("#mastMenuBtn"),
      document.querySelector(".mapboxgl-ctrl-zoom-in")
    ];
    return candidates.find((el) => el && el.offsetParent !== null) || document.body;
  };
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
    resolveFocusAfterClose()?.focus?.();
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
  const permissionOptions = [...LEGEND_PERMISSION_OPTIONS, { id: "prohibited", label: "Prohibited", statuses: ["prohibited"] }];

  const accessChips = permissionOptions.map((status) => {
    const token = ACCESS_STATUS_TOKEN[status.id] || "unknown";
    const off = !getLegendChipStatuses(status.id).some((id) => selectedAccess.has(id));
    return `<button type="button" class="leg-chip${off ? " off" : ""}" data-leg-access="${escapeHTML(status.id)}" aria-pressed="${String(!off)}"><span class="ring" style="color: var(--reg-st-${token})"></span>${escapeHTML(status.label)}</button>`;
  }).join("");

  const categoryChips = config.categories.map((category) => {
    const selection = getCategorySelectionState(category.id);
    const color = registerCategoryColor(config.categoryColors[category.id] || "#777");
    const cls = selection === "none" ? " off" : selection === "some" ? " partial" : "";
    return `<button type="button" class="leg-chip${cls}" data-leg-category="${escapeHTML(category.id)}" aria-pressed="${String(selection !== "none")}"><span class="swatch" style="color: ${escapeHTML(color)}"></span>${escapeHTML(category.label)}</button>`;
  }).join("");

  const modeName = { food: "FOOD", ink: "INK", medicine: "HERBS", minerals: "MINERALS" }[state.activeMap] || String(state.activeMap || "").toUpperCase();
  const catHeading = config.speciesHeading.replace(/\s*&\s*(Species|Materials)/i, "").toUpperCase();
  const selected = getSelectedAccessStatuses();
  const onlyAllowedActive = selected.size === 1 && selected.has("allowed");
  const filterBits = getActiveFilterSummary();

  // Prototype layout: a collapsed title bar (bottom-left) that expands UP on
  // hover/focus into two columns — ACCESS (rings) | CATEGORIES (filled squares).
  mapLegend.innerHTML = `
    <div class="legend-body">
      <div class="legend-body-inner">
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
      <div class="legend-note">Cluster bubbles take the tint of their most common category, never an access status.</div>
      </div>
    </div>
    ${filterBits.length ? `<div class="legend-filters">FILTERS: ${filterBits.map(escapeHTML).join(" · ")} <button type="button" class="legend-clear" data-legend-clear="1">Clear</button></div>` : ""}
    <div class="legend-title"><strong>LEGEND:</strong> PERMISSIONS AND POINTS</div>
    <div class="legend-active">ACTIVE MAP: ${escapeHTML(modeName)}</div>
  `;

  // The collapsed title/active lines are hidden on phones (the legend lives in
  // the season bar's slot there), so mirror the filters-active state onto the
  // mobile "Legend" toggle as a dot + spoken summary.
  const legendMobButton = document.getElementById("legendMob");
  if (legendMobButton) {
    legendMobButton.classList.toggle("has-filters", filterBits.length > 0);
    legendMobButton.setAttribute(
      "aria-label",
      filterBits.length ? `Legend, filters active: ${filterBits.join(", ").toLowerCase()}` : "Legend"
    );
  }
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
    if (event.target.closest("[data-legend-clear]")) {
      resetLegendFilters();
      return;
    }
    // scheduleRender (not render): the full rebuild runs after this tap's
    // frame paints, so the click itself stays responsive.
    if (event.target.closest("[data-legend-only]")) {
      setOnlyAllowed();
      scheduleRender();
      return;
    }
    const accessChip = event.target.closest("[data-leg-access]");
    if (accessChip) {
      toggleAccessChip(accessChip.dataset.legAccess);
      scheduleRender();
      return;
    }
    const categoryChip = event.target.closest("[data-leg-category]");
    if (categoryChip) {
      const id = categoryChip.dataset.legCategory;
      setSpeciesByCategory(id, getCategorySelectionState(id) !== "all");
      scheduleRender();
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
  ink: { label: "Ink/Dye", color: "#3a3f3d", blurb: "Inks & dyes by color, oak gall to rabbitbrush" },
  medicine: { label: "Herbs", color: "#7a4a52", blurb: "Herb plants and the projects made from them" },
  minerals: { label: "Minerals", color: "#5c677d", blurb: "Craft stone & minerals, quartz, novaculite, soapstone, clay" }
};
// Project recipes: foraged-ink "Projects" replacing the launch placeholders.
// Each opens a drilled-in recipe card (ingredient list with required vs
// optional additives, required/optional tools, timeline, steps, color
// modifiers, lightfastness, preservation, other uses, safety, sources).
// Ink cards carry a `category` matching INK_CATEGORY_COLORS for the spine;
// technique cards (modifier/binder/preservative) use a neutral spine.
// Content is researched + safety/chemistry-verified; "craft, not food" and
// "occurrence is not permission" travel with every card (CLAUDE.md values).
// Project recipes live in data/project-recipes.json (extracted from app.js in
// Phase 4 — the ~600KB of recipe prose was 55% of the file). Loaded once at
// startup; each recipe carries a `map` field (ink/food/medicine/minerals) so
// the Projects sheet filters to the active map. Empty until the fetch resolves;
// the Projects sheet shows a loading state and re-renders on arrival.
let PROJECT_RECIPES = [];
let projectRecipesLoaded = false;

function loadProjectRecipes() {
  if (projectRecipesLoaded) return Promise.resolve(PROJECT_RECIPES);
  return fetch("./data/project-recipes.json")
    .then((response) => {
      if (!response.ok) throw new Error(`project-recipes: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      PROJECT_RECIPES = Array.isArray(data) ? data : [];
      projectRecipesLoaded = true;
      // If the Projects sheet is open when the data lands, rebuild it in place.
      if (typeof state !== "undefined" && state.openSheet === "projects") openSheet("projects");
      return PROJECT_RECIPES;
    })
    .catch(() => { projectRecipesLoaded = true; return PROJECT_RECIPES; });
}

function sheetAboutHTML() {
  const config = getActiveMapConfig();
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">CRAFT ALMANAC</div>
    <h2 class="serif">A map that keeps the almanac's seasons</h2>
    <p>Craft Almanac shares local material availability, ethical harvesting practice, craft knowledge, and safety information, in collaboration with the places it maps. It is made for teachers, foragers, and makers sourcing materials responsibly. The map is the front door; material profiles and project recipes live one tap away.</p>
    <p><strong>Occurrence is never permission.</strong> Records show where something has been seen, not that you may take it. Where we have researched it, a point carries the harvesting rule for the land it sits on, read from primary law, and where we haven't, it says so plainly.</p>
    <p><strong>Herbs content is educational reference only</strong>, historical and traditional use, not medical advice.</p>
    <div class="about-block">
      <div class="k">THIS MAP'S SOURCES</div>
      <p>${escapeHTML(config.dataNotes)}</p>
    </div>
    <div class="about-block">
      <div class="k">WHO MADE THIS</div>
      <p>Craft Almanac is developed and maintained by Sasson Rafailov, a design theorist, craftsperson, and Assistant Professor of Architecture at the University of Virginia. The site supports his theory of craft as a situated, relational practice, one which is enriched when people know where their materials come from and how they exist in the world unto themselves. He is committed to sharing this approach in both his design and teaching practice, where he encourages people to use craft as a vehicle to form ethical, fulfilling, and productive relationships with the material world.</p>
      <p>The map grows out of that practice and that classroom. It is a tool for helping craftspeople and students around the United States meet their local landscapes as collaborators and active supporters of their creative ambitions. It aspires towards these aims by prioritizing ethical foraging principles, keeping track of seasonal variations in material availability, as well as legal frameworks that allow all people to participate in the natural abundance of their environment.</p>
    </div>
    <div class="about-block">
      <div class="k">TERMS &amp; PRIVACY</div>
      <p>The harvesting rules were compiled by an automated research process (an AI research agent reading primary sources such as park compendiums, 36 CFR, and state and federal regulations) and are reviewed by the site's author. They are informational, not legal advice; rules change, and any entry can be wrong or out of date. Always confirm current rules with the land manager before collecting. Everything here is offered without warranty for educational use, and you assume the risk of any harvest or preparation you undertake.</p>
      <p>There is no account, no cookies, and no tracking. Your device stores only your own preferences and saved places (kept in this browser, never sent anywhere). As you browse, your browser talks directly to the services that draw the map and its data: Mapbox (basemap and place search), iNaturalist (occurrences), USGS and Esri (public-land boundaries), Open-Meteo and RainViewer (weather and radar), and Cloudflare (the host). Each of these receives your IP address and the map area you are viewing.</p>
      <p>The one thing you can send us is an error report. If you use the report form, the note you write, and your email address if you choose to add one, is transmitted to us so a correction can reach the maintainer. Nothing else about you is collected, and the form sets no cookie.</p>
      <p>Spotted a wrong rule, a questionable identification, or anything unsafe? <button type="button" class="report-link" data-report data-report-subject="About &amp; Terms panel">Report an error →</button> Corrections are welcome and help keep the map trustworthy.</p>
      <p>Craft Almanac is a noncommercial project: the code is licensed under the PolyForm Noncommercial License 1.0.0, and original content, recipes, species notes, and the rule summaries, under CC BY-NC-SA 4.0 (the underlying legal facts in the rules are public and unrestricted). Inbound data sources keep their own licenses.</p>
    </div>
    <p><a href="./materials/" target="_blank" rel="noreferrer">Material profiles →</a> · <a href="./projects/" target="_blank" rel="noreferrer">Project pages →</a> · <a href="./cards/" target="_blank" rel="noreferrer">Printable field cards →</a></p>
    <p><a href="./attribution.html" target="_blank" rel="noreferrer">Attribution and data-use notes →</a></p>
  `;
}

// "Report an error" form sheet. Lets a visitor write a correction from the site
// and have it reach reports@craftalmanac.com (via the /api/report Worker),
// instead of being handed off to their mail app. A plain mailto stays as the
// fallback for when JS or the endpoint is unavailable. The hidden "website"
// field is a honeypot; a person never sees or fills it.
function sheetReportHTML() {
  const ctx = state.reportContext || {};
  const subjectLabel = (ctx.subject || "").trim();
  const mailSubject = subjectLabel
    ? `Craft Almanac error report: ${subjectLabel}`
    : "Craft Almanac error report";
  const mailtoHref = `mailto:reports@craftalmanac.com?subject=${encodeURIComponent(mailSubject)}`;
  const contextRow = subjectLabel
    ? `<p class="report-context">Reporting: <strong>${escapeHTML(subjectLabel)}</strong></p>`
    : "";
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">CRAFT ALMANAC</div>
    <h2 class="serif">Report an error</h2>
    <p>Spotted a wrong rule, a questionable identification, or anything unsafe? Tell us here and it reaches the maintainer directly. Corrections are welcome and help keep the map trustworthy.</p>
    ${contextRow}
    ${ctx.pointSpecific ? "" : `<p class="report-hint">Reporting a specific point on the map? Please include the material and where it is. The easiest way is to copy the map's web address, which holds the exact coordinates.</p>`}
    <form class="report-form" novalidate
          data-report-mailto="${escapeHTML(mailtoHref)}"
          data-report-subject="${escapeHTML(subjectLabel)}"
          data-report-page="${escapeHTML(ctx.page || "")}">
      <label class="report-field">
        <span class="report-label">What's wrong? <em>(required)</em></span>
        <textarea class="report-message" name="message" rows="5" maxlength="5000"
                  required placeholder="What did you find, and where? Include the species or place if you can."></textarea>
      </label>
      <label class="report-field">
        <span class="report-label">Your email <em>(optional, so we can follow up)</em></span>
        <input class="report-email" type="email" name="email" maxlength="300"
               autocomplete="email" inputmode="email" placeholder="you@example.com">
      </label>
      <div class="report-hp" aria-hidden="true">
        <label>Leave this field empty
          <input type="text" name="website" tabindex="-1" autocomplete="off">
        </label>
      </div>
      <p class="report-status" role="status" aria-live="polite"></p>
      <div class="report-actions">
        <button class="report-submit" type="submit">Send report</button>
        <a class="report-mailto" href="${escapeHTML(mailtoHref)}">Prefer your own mail app?</a>
      </div>
    </form>
  `;
}

function setReportStatus(el, text, kind) {
  if (!el) return;
  el.textContent = text || "";
  el.className = "report-status" + (kind ? " is-" + kind : "");
}

// Wire the report form: submit over fetch to /api/report (no page navigation),
// show inline status, and keep the mailto fallback's body in sync with the draft
// so a click there carries the text over. Falls back gracefully on any failure.
function wireReportForm(sheetEl) {
  const form = sheetEl.querySelector(".report-form");
  if (!form) return;
  const message = form.querySelector(".report-message");
  const emailEl = form.querySelector(".report-email");
  const status = form.querySelector(".report-status");
  const submit = form.querySelector(".report-submit");
  const mailto = form.querySelector(".report-mailto");
  const baseMailto = form.dataset.reportMailto || "mailto:reports@craftalmanac.com";
  // Focus synchronously, like openSheet's closer focus: the sheet is already
  // visible here, and a deferred (rAF) focus loses the race with the browser
  // resetting focus to <body> after the trigger element is removed.
  message?.focus();

  // Carry the in-progress draft into the mailto fallback so switching to email
  // never loses what they typed.
  const syncMailto = () => {
    const body = message.value.trim();
    mailto.href = body ? `${baseMailto}&body=${encodeURIComponent(body)}` : baseMailto;
  };
  message.addEventListener("input", syncMailto);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.sending === "1") return;
    const text = message.value.trim();
    if (!text) {
      setReportStatus(status, "Please add a short note about what's wrong.", "err");
      message.focus();
      return;
    }
    form.dataset.sending = "1";
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = "Sending…";
    setReportStatus(status, "Sending…", "");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json", "x-requested-with": "fetch" },
        body: JSON.stringify({
          message: text,
          email: emailEl.value.trim(),
          website: form.querySelector('[name="website"]').value,
          context: form.dataset.reportSubject || "",
          page: form.dataset.reportPage || location.href
        })
      });
      let data = {};
      try { data = await res.json(); } catch { /* non-JSON error body */ }
      if (res.ok && data.ok) {
        showReportSent(form, data.message);
        return;
      }
      setReportStatus(status, data.message || "We couldn't send that. Use the email link below and it'll reach us directly.", "err");
    } catch {
      setReportStatus(status, "We couldn't reach the server. Use the email link below and it'll reach us directly.", "err");
    }
    submit.disabled = false;
    submit.textContent = label;
    form.dataset.sending = "0";
  });
}

// Replace the form with a confirmation once a report is delivered — a clear done
// state that also blocks accidental duplicate sends.
function showReportSent(form, msg) {
  const done = document.createElement("div");
  done.className = "report-done";
  done.setAttribute("role", "status");
  const heading = document.createElement("p");
  heading.className = "report-done-title";
  heading.textContent = msg || "Thanks — your report was sent. We read every one.";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "report-submit";
  close.textContent = "Close";
  close.addEventListener("click", () => closeSheet());
  done.append(heading, close);
  form.replaceWith(done);
  close.focus();
}

function sheetMapsHTML() {
  const cards = Object.keys(MODE_SHEET_INFO).map((mode) => {
    const info = MODE_SHEET_INFO[mode];
    const on = state.activeMap === mode ? " on" : "";
    const dnote = mode === "medicine"
      ? `<div class="dnote">EDUCATIONAL REFERENCE ONLY, NOT MEDICAL ADVICE</div>`
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
  // Stone isn't seasonal, so the minerals "shelf" shows the material category
  // instead of a (misleading) Jan-Dec month range next to the scientific name,
  // and the seasonal "Available" filter doesn't apply (minerals filter by the
  // workability slider on the map).
  const isMineral = config.loadMinerals;
  const availOnly = !isMineral && state.materialsAvailableOnly;
  const availCount = isMineral ? 0 : speciesCatalogByName.filter(isSpeciesInSeasonOnSelectedDay).length;
  const list = availOnly ? speciesCatalogByName.filter(isSpeciesInSeasonOnSelectedDay) : speciesCatalogByName;

  // The keyboard/SR route to point cards (PRODUCT.md promise): the map's
  // canvas markers are mouse-only, so each shelf card offers its species'
  // nearest in-view record. Enabled only when a record is actually in the
  // viewport (records load at point-band zoom, >= 8).
  const openableSpecies = new Set();
  if (state.mapReady) {
    const shelfBounds = map.getBounds();
    for (const record of state.records) {
      if (recordInBounds(record, shelfBounds)) openableSpecies.add(record.speciesId);
    }
  }

  const cards = list.map((species) => {
    const color = CATEGORY_COLORS[species.category] || "#777";
    const meta = isMineral
      ? `${species.scientificName} · ${getCategoryLabel(species.category)}`
      : `${species.scientificName} · ${getMonthRangeText(species.months)}`;
    const uses = species.usedParts || getCategoryLabel(species.category);
    const openButton = openableSpecies.has(species.id)
      ? `<button type="button" class="mini-card-open" data-open-record="${escapeHTML(species.id)}">Open nearest in view</button>`
      : `<button type="button" class="mini-card-open" disabled aria-label="Open nearest in view, unavailable" title="No record in the current view, zoom the map to an area with this species first">Open nearest in view</button>`;
    return `
      <div class="mini-card" data-species="${escapeHTML(species.id)}" role="button" tabindex="0">
        <div class="spine" style="background: ${escapeHTML(color)}"></div>
        <h3 class="serif">${escapeHTML(species.commonName)}</h3>
        <div class="m">${escapeHTML(meta)}</div>
        <div class="uses">${escapeHTML(uses)}</div>
        <a class="mini-card-link" href="/materials/${escapeHTML(species.id)}.html" target="_blank" rel="noopener">Full profile ↗</a>
        ${openButton}
      </div>`;
  }).join("");

  // "Available" filter — folds the old standalone Now view into the shelf. The
  // date follows the season slider's selected day; toggling shows only species
  // in their harvest window that day. Hidden for minerals (not seasonal).
  const selDate = getSelectedDate();
  const availLabel = `Available ${FULL_MONTHS[selDate.getMonth()]} ${selDate.getDate()}`;
  const filterRow = isMineral ? "" : `
    <div class="mat-filter" role="group" aria-label="Filter materials">
      <button type="button" class="mat-filter-btn${availOnly ? "" : " on"}" data-materials-filter="all" aria-pressed="${String(!availOnly)}">All · ${speciesCatalogByName.length}</button>
      <button type="button" class="mat-filter-btn${availOnly ? " on" : ""}" data-materials-filter="available" aria-pressed="${String(availOnly)}">${escapeHTML(availLabel)} · ${availCount}</button>
    </div>`;

  const emptyNote = (availOnly && !list.length)
    ? `<p>Nothing on this map is in season on ${escapeHTML(FULL_MONTHS[selDate.getMonth()])} ${selDate.getDate()}. Switch to <strong>All</strong>, or move the date slider on the map.</p>`
    : "";
  const matRegionLabel = getActiveRegionCaveatLabel();
  const matTiming = matRegionLabel
    ? `Timing is ${escapeHTML(matRegionLabel)} regional, local timing still varies.`
    : "Timing is a contiguous-US average, local timing varies by weeks.";
  const caveat = availOnly
    ? `<div class="now-foot">${matTiming} Occurrence is never permission.</div>`
    : "";

  // Herbs profiles present traditional use-parts, so the educational-use
  // disclaimer must travel with them (CLAUDE.md), as it does on the map note,
  // the Maps card, and the point card.
  const medNote = state.activeMap === "medicine"
    ? `<div class="dnote">EDUCATIONAL REFERENCE ONLY, NOT MEDICAL ADVICE</div>`
    : "";

  // At overview zooms records aren't loaded, so EVERY "Open nearest in view"
  // button renders disabled with no visible reason. Say why once, up top.
  // (Also shown while the map is still booting — records aren't loaded then
  // either, and the same remedy applies.)
  const zoomNote = (!isMineral && (!state.mapReady || map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM))
    ? `<div class="dnote">ZOOM THE MAP IN TO LOAD RECORDS, "OPEN NEAREST IN VIEW" WORKS AT NEIGHBORHOOD ZOOM</div>`
    : "";
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">THE SHELF · ${speciesCatalogByName.length} PROFILES</div>
    <h2 class="serif">${escapeHTML(config.speciesHeading)}</h2>
    <p class="sheet-lede">${escapeHTML(config.lede)}</p>
    ${filterRow}
    <p>Tap a profile to show just that species on the map.</p>
    ${zoomNote}
    ${medNote}
    ${emptyNote}
    <div class="card-grid">${cards}</div>
    ${caveat}
  `;
}

function getProjectSpineColor(recipe) {
  // Herbs cards take the color of the PLANT used, so a shelf shows a mix of
  // plant colors rather than one flat category color. Ink cards key off the ink
  // color category; food and mineral cards fall back to the recipe's result
  // swatch (the finished dish/stone color) — every card gets a meaningful spine.
  if (recipe.plantId && MEDICINE_SPECIES_COLORS[recipe.plantId]) return MEDICINE_SPECIES_COLORS[recipe.plantId];
  if (recipe.category && INK_CATEGORY_COLORS[recipe.category]) return INK_CATEGORY_COLORS[recipe.category];
  if (typeof recipe.swatch === "string" && /^#?[0-9a-f]{6}$/i.test(recipe.swatch)) return recipe.swatch;
  return "#5a615b"; // technique / neutral
}

// Pick black or white text for legibility over a given hex fill (relative
// luminance threshold; only the light yellows land on black text).
function getContrastText(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#1f2421" : "#ffffff";
}

// Turn [[recipe-id|label]] tokens into in-text links that open that recipe
// card; everything outside the tokens is HTML-escaped as usual. Also
// auto-links the first mention of "iron water" per field to the iron-acetate
// card so the recipe is always one tap away (skipped on that card itself).
function linkifyRecipes(text, selfId, state) {
  const tokenRe = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g;
  // `state` is shared across the strings of one passage (e.g. the whole
  // ingredients list) so the iron modifier links at most once per passage.
  const st = state || { linked: false };
  const emit = (chunk) => {
    if (selfId === "tech-iron-acetate" || st.linked) return escapeHTML(chunk);
    const im = /iron (?:acetate|water)/i.exec(chunk);
    if (!im) return escapeHTML(chunk);
    st.linked = true;
    return escapeHTML(chunk.slice(0, im.index))
      + `<button type="button" class="recipe-link" data-recipe="tech-iron-acetate">${escapeHTML(im[0])}</button>`
      + escapeHTML(chunk.slice(im.index + im[0].length));
  };
  let out = "";
  let last = 0;
  let m;
  while ((m = tokenRe.exec(text)) !== null) {
    out += emit(text.slice(last, m.index));
    out += `<button type="button" class="recipe-link" data-recipe="${escapeHTML(m[1])}">${escapeHTML(m[2])}</button>`;
    last = tokenRe.lastIndex;
  }
  out += emit(text.slice(last));
  return out;
}

function projectCardHTML(recipe) {
  const color = getProjectSpineColor(recipe);
  const meta = [recipe.color, recipe.difficulty].filter(Boolean).join(" · ");
  const eduTag = recipe.educationalOnly ? `<div class="pc-edu">EDUCATIONAL ONLY</div>` : "";
  return `
    <div class="mini-card project-card${recipe.educationalOnly ? " is-edu" : ""}" data-recipe="${escapeHTML(recipe.id)}" role="button" tabindex="0">
      <div class="spine" style="background: ${escapeHTML(color)}"></div>
      <h3 class="serif">${escapeHTML(recipe.name)}</h3>
      <div class="m">${escapeHTML(meta.toUpperCase())}</div>
      ${eduTag}
      <div class="uses">${escapeHTML(recipe.teaser || "")}<span class="pc-arrow" aria-hidden="true">→</span></div>
      <a class="mini-card-link" href="/projects/${escapeHTML(recipe.id)}.html" target="_blank" rel="noopener">Recipe page ↗</a>
    </div>`;
}

// Per-map shelf layout: which recipe `kind`s group under which heading, in
// order. Any recipe whose kind isn't named here falls into a trailing OTHER
// shelf, so a new kind is never silently hidden.
const PROJECT_SHELVES = {
  ink: [
    { label: "PLANT INKS", kinds: ["ink"] },
    { label: "PLANT DYES", kinds: ["dye"] },
    { label: "PIGMENTS & FORMS", kinds: ["pigment"] },
    { label: "MODIFIERS · PRESERVING", kinds: ["modifier", "preservative"] },
    { label: "BINDERS", kinds: ["binder"] }
  ],
  food: [
    { label: "FRESH USE", kinds: ["fresh"] },
    { label: "PRESERVE FOR LATER", kinds: ["preserve"] },
    { label: "WASTE REDUCTION", kinds: ["waste"] }
  ],
  minerals: [
    { label: "CLAY BODIES", kinds: ["clay"] },
    { label: "GLAZES", kinds: ["glaze"] },
    { label: "CRAFT & CARVING", kinds: ["craft"] }
  ],
  medicine: [
    { label: "DRIED & EVERLASTING", kinds: ["dried"] },
    { label: "SKIN & BODY", kinds: ["skincare"] },
    { label: "TEAS, SYRUPS & EDIBLE FLOWERS", kinds: ["kitchen"] },
    { label: "WILD GREENS", kinds: ["greens"] },
    { label: "GARDEN & HOUSEHOLD", kinds: ["garden"] }
  ]
};

const PROJECT_INTRO = {
  ink: "Make ink, dye, and pigment from the plants on the map. Every recipe is craft, not food; harvest only where it is permitted.",
  food: "Fresh dishes, tested preserves, and waste-reduction projects built on the food species on the map. Confirm identification and follow the safety notes; harvest only where it is permitted.",
  minerals: "Clay bodies, glazes, and carving/lapidary projects built on the craft stone on the map. Mind the dust, lime, and asbestos hazards in each card; occurrence is not collecting permission.",
  medicine: "Herbal crafts, skin and body preparations, teas and syrups, wild greens, and garden projects built on the herb plants on the map. Every card is educational and traditional, never medical: identify your plant, prefer cultivated or bought material where a lookalike is dangerous, and harvest only where it is permitted."
};

function sheetProjectsHTML() {
  const map = state.activeMap;
  const isMineral = getActiveMapConfig().loadMinerals;
  const allMapRecipes = PROJECT_RECIPES.filter((r) => (r.map || "ink") === map);
  // "Available" filter — a project shows when its source material is in season
  // on the selected day. Hidden for minerals (stone keeps no season).
  const availOnly = !isMineral && state.projectsAvailableOnly;
  const availCount = isMineral ? 0 : allMapRecipes.filter(isProjectAvailableOnSelectedDay).length;
  const mapRecipes = availOnly ? allMapRecipes.filter(isProjectAvailableOnSelectedDay) : allMapRecipes;

  // Each shelf collapses to a horizontally-scrollable row; the toggle expands
  // it into a wrapped grid to show the whole category at once.
  const shelfHTML = (label, list) => list.length
    ? `<section class="proj-shelf">
         <div class="shelf-head">
           <span class="card-grid-label">${escapeHTML(label)} · ${list.length}</span>
           ${list.length > 3
             ? `<button class="shelf-toggle" type="button" data-shelf-toggle aria-expanded="false">Expand</button>`
             : ""}
         </div>
         <div class="shelf-row">${list.map(projectCardHTML).join("")}</div>
       </section>`
    : "";

  const layout = PROJECT_SHELVES[map] || [];
  const claimedKinds = new Set(layout.flatMap((s) => s.kinds));
  const shelves = layout.map((s) => shelfHTML(s.label, mapRecipes.filter((r) => s.kinds.includes(r.kind))));
  const others = mapRecipes.filter((r) => !claimedKinds.has(r.kind));
  if (others.length) shelves.push(shelfHTML("OTHER", others));

  // Loading / empty states so the sheet never looks broken before the fetch
  // lands or for a map that has no cards yet.
  let body;
  if (!projectRecipesLoaded && !PROJECT_RECIPES.length) {
    body = `<p class="proj-scope">Loading projects…</p>`;
  } else if (!allMapRecipes.length) {
    const other = map === "food" ? "Ink/Dye" : "Ink/Dye and Food";
    body = `<p class="proj-scope">Projects for this map are coming soon. In the meantime, the ${other} maps have full project benches, switch maps from <strong>Maps</strong>.</p>`;
  } else if (availOnly && !mapRecipes.length) {
    const selDate = getSelectedDate();
    body = `<p class="proj-scope">No project's material is in season on ${escapeHTML(FULL_MONTHS[selDate.getMonth()])} ${selDate.getDate()}. Switch to <strong>All</strong>, or move the date slider on the map.</p>`;
  } else {
    body = `<div class="proj-shelves">${shelves.join("")}</div>`;
  }

  // Filter toggle (only once recipes are loaded, seasonal maps only).
  const selDate = getSelectedDate();
  const filterRow = (!isMineral && projectRecipesLoaded && allMapRecipes.length) ? `
    <div class="mat-filter" role="group" aria-label="Filter projects">
      <button type="button" class="mat-filter-btn${availOnly ? "" : " on"}" data-projects-filter="all" aria-pressed="${String(!availOnly)}">All · ${allMapRecipes.length}</button>
      <button type="button" class="mat-filter-btn${availOnly ? " on" : ""}" data-projects-filter="available" aria-pressed="${String(availOnly)}">In season ${FULL_MONTHS[selDate.getMonth()]} ${selDate.getDate()} · ${availCount}</button>
    </div>` : "";
  const projRegionLabel = getActiveRegionCaveatLabel();
  const projTiming = projRegionLabel
    ? `"In season" is ${escapeHTML(projRegionLabel)} regional, local timing still varies.`
    : `"In season" is a contiguous-US average, local timing varies by weeks.`;
  const caveat = availOnly
    ? `<div class="now-foot">${projTiming} Techniques and binders with no seasonal material always show.</div>`
    : "";

  const mapLabel = { ink: "INK & DYE", food: "FOOD", minerals: "MINERALS", medicine: "HERBS" }[map] || map.toUpperCase();
  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="k">THE PRESS · ${allMapRecipes.length} PROJECTS · ${mapLabel}</div>
    <h2 class="serif">Projects</h2>
    <p>${escapeHTML(PROJECT_INTRO[map] || PROJECT_INTRO.ink)} Tap a project for the full recipe, ingredients, tools, timeline, and step by step. Scroll a row sideways, or Expand a category to see all of it.</p>
    ${filterRow}
    ${body}
    ${caveat}
  `;
}

function recipeIngredientHTML(i, selfId, state) {
  const optTag = i.required ? "" : `<span class="opt-tag">(Optional)</span> `;
  const amt = i.amount ? ` · ${linkifyRecipes(i.amount, selfId, state)}` : "";
  const note = i.note ? `, ${linkifyRecipes(i.note, selfId, state)}` : "";
  return `<li>${optTag}<span class="ing-item">${linkifyRecipes(i.item, selfId, state)}</span>${amt}${note}</li>`;
}

function recipeDetailHTML(recipe) {
  const inkColor = recipe.swatch || getProjectSpineColor(recipe);
  const textColor = getContrastText(inkColor);

  // Four tags only, in order: color · lightfastness · skill · time.
  const chips = [];
  if ((recipe.kind === "ink" || recipe.kind === "dye") && recipe.color) {
    chips.push(`<span class="chip chip-color" style="background:${escapeHTML(inkColor)};color:${textColor}">${escapeHTML(recipe.color)}</span>`);
  }
  if (recipe.lightfastness) chips.push(`<span class="chip lf-${escapeHTML(recipe.lightfastness.rating)}">lightfastness: ${escapeHTML(recipe.lightfastness.rating)}</span>`);
  if (recipe.difficulty) chips.push(`<span class="chip">${escapeHTML(recipe.difficulty)}</span>`);
  if (recipe.timeline) {
    const t = recipe.timeline;
    const time = [t.active ? `${t.active} active` : "", t.passive ? `${t.passive} passive` : ""].filter(Boolean).join(" · ");
    if (time) chips.push(`<span class="chip">${escapeHTML(time)}</span>`);
  }

  // Each passage gets its own "linked once" flag so the iron-acetate modifier
  // links at most once per ingredients list / step list / tools / safety block.
  const ings = recipe.ingredients || [];
  const ingState = { linked: false };
  const ingHTML = ings.map((i) => recipeIngredientHTML(i, recipe.id, ingState)).join("");
  const stepState = { linked: false };
  const stepsHTML = (recipe.steps || []).map((s) => `<li>${linkifyRecipes(s, recipe.id, stepState)}</li>`).join("");
  const safeState = { linked: false };
  const safetyHTML = (recipe.safety || []).map((s) => `<li>${linkifyRecipes(s, recipe.id, safeState)}</li>`).join("");
  const srcHTML = (recipe.sources || []).map((s) => `<a href="${escapeHTML(s.url)}" target="_blank" rel="noreferrer">${escapeHTML(s.title)} →</a>`).join("");
  const toolState = { linked: false };
  const reqToolsHTML = linkifyRecipes((recipe.toolsRequired || []).join(", "), recipe.id, toolState);
  const optTools = (recipe.toolsOptional || []).length
    ? `<p><span class="tool-lab">Optional</span> ${linkifyRecipes(recipe.toolsOptional.join(", "), recipe.id, toolState)}</p>`
    : "";

  return `
    <button class="closer" type="button" aria-label="Close">&times;</button>
    <div class="recipe-detail">
      <button class="proj-back" type="button" data-recipe-back>← All projects</button>
      <h2 class="serif">${escapeHTML(recipe.name)}</h2>
      ${recipe.hook ? `<p class="recipe-hook">${escapeHTML(recipe.hook)}</p>` : ""}
      <div class="recipe-meta">${chips.join("")}</div>

      ${recipe.educationalOnly ? `<div class="edu-stamp recipe-edu">EDUCATIONAL ONLY, NOT A HARVEST RECOMMENDATION. This material is culturally sacred, conservation-sensitive, or requires regional/Indigenous knowledge to source ethically. Seek permission and local knowledge first; do not harvest casually.</div>` : ""}

      ${recipe.toxic ? `<div class="safety-box"><h3>Safety first</h3><ul>${safetyHTML}</ul></div>` : ""}

      <div class="recipe-sec"><h3>Ingredients</h3><ul class="ing-list">${ingHTML}</ul></div>

      <div class="recipe-sec"><h3>Tools</h3>
        <p><span class="tool-lab">Required</span> ${reqToolsHTML}</p>
        ${optTools}
      </div>

      <div class="recipe-sec"><h3>Steps</h3><ol class="steps-list">${stepsHTML}</ol></div>

      ${recipe.modifiers ? `<div class="recipe-sec"><h3>Color &amp; modifiers</h3><p>${linkifyRecipes(recipe.modifiers, recipe.id)}</p></div>` : ""}
      ${recipe.lightfastness ? `<div class="recipe-sec"><h3>Lightfastness</h3><p>${linkifyRecipes(recipe.lightfastness.note, recipe.id)}</p></div>` : ""}
      ${recipe.preservation ? `<div class="recipe-sec"><h3>Preservation</h3><p>${linkifyRecipes(recipe.preservation, recipe.id)}</p></div>` : ""}
      ${recipe.yield ? `<div class="recipe-sec"><h3>Yield &amp; shelf life</h3><p>${linkifyRecipes(recipe.yield, recipe.id)}</p></div>` : ""}
      ${recipe.beyondInk ? `<div class="beyond-box"><div class="recipe-sec" style="margin:0"><h3>Beyond ink</h3><p>${linkifyRecipes(recipe.beyondInk, recipe.id)}</p></div></div>` : ""}

      ${(!recipe.toxic && safetyHTML) ? `<div class="recipe-sec"><h3>Safety</h3><ul class="ing-list">${safetyHTML}</ul></div>` : ""}

      ${srcHTML ? `<div class="recipe-sec recipe-sources"><h3>Sources</h3>${srcHTML}</div>` : ""}
      <div class="recipe-oinp">Craft, not food · Occurrence is not permission, harvest only where allowed</div>
    </div>
  `;
}

function showProjectsGrid() {
  const sheetEl = document.querySelector("#sheet");
  if (!sheetEl) return;
  sheetEl.innerHTML = sheetProjectsHTML();
  sheetEl.scrollTop = 0;
  sheetEl.querySelector(".closer")?.focus?.();
}

function openRecipeDetail(id) {
  const sheetEl = document.querySelector("#sheet");
  if (!sheetEl) return;
  // A recipe link can be tapped from a species note before the Projects sheet
  // (and its data) has ever been opened — load on demand, then retry.
  if (!projectRecipesLoaded) {
    sheetEl.innerHTML = `<button class="closer" type="button" aria-label="Close">&times;</button><p class="proj-scope">Loading project…</p>`;
    loadProjectRecipes().then(() => openRecipeDetail(id));
    return;
  }
  const recipe = PROJECT_RECIPES.find((r) => r.id === id);
  if (!recipe) return;
  sheetEl.innerHTML = recipeDetailHTML(recipe);
  sheetEl.scrollTop = 0;
  sheetEl.querySelector(".proj-back")?.focus?.();
}

// ---------------------------------------------------------------------------
// Phase 5.7 "Now" sheet — the almanac cadence view: "what should I look for
// right now?" for the active map. Always computed from TODAY's real date
// (never the season slider). Ranking uses the per-species phenology curves
// where they exist and falls back to the binary species.months windows, so
// the sheet degrades gracefully offline / before the lazy curve fetch lands.
// The curves are a contiguous-US average — the footer carries the same
// honesty caveat as the season histogram (Phase 1.4).
// ---------------------------------------------------------------------------
// Whether a species is in its harvest window on the season slider's selected
// day, independent of the map's "All seasons" toggle. The single in-season
// predicate behind BOTH the Materials and Projects "Available" filters.
//
// Phase 5.3: prefer the phenology curve for the current viewport region (the
// regional curve where the species has one, else national). A month counts as
// in-season when its curve value clears a small fraction of the curve's peak
// (IN_SEASON_CURVE_THRESHOLD · max) — i.e. there's a real observation signal
// that month, localized by climate. Falls back to the binary species.months
// window when no curve is loaded/present (offline, sparse cell, or pre-fetch),
// so the filter never gets stricter than the hand-authored months.
const IN_SEASON_CURVE_THRESHOLD = 0.15;
function isSpeciesInSeasonOnSelectedDay(species) {
  const month = getSelectedMonth();
  const region = getViewportRegion();
  const { curve } = getPhenologyCurve(state.activeMap, species.id, region);
  if (Array.isArray(curve)) {
    const max = Math.max(...curve);
    if (max > 0) return (curve[month - 1] || 0) >= IN_SEASON_CURVE_THRESHOLD * max;
  }
  return Array.isArray(species.months) && species.months.includes(month);
}

// A project is "available" on the selected day when its source material
// (plantId) is a catalog species in season that day. Recipes with no plantId
// (techniques, binders, modifiers) or an unresolvable one aren't tied to a
// seasonal harvest, so they count as always available (never hidden on a hunch).
function isProjectAvailableOnSelectedDay(recipe) {
  if (!recipe.plantId) return true;
  const species = speciesCatalogById.get(recipe.plantId);
  if (!species) return true;
  return isSpeciesInSeasonOnSelectedDay(species);
}

const SHEET_BUILDERS = {
  maps: sheetMapsHTML,
  plants: sheetPlantsHTML,
  projects: sheetProjectsHTML,
  about: sheetAboutHTML,
  report: sheetReportHTML
};

let sheetOpener = null;

function openSheet(name) {
  const sheetWrap = document.querySelector("#sheet-wrap");
  const sheetEl = document.querySelector("#sheet");
  const builder = SHEET_BUILDERS[name];
  if (!sheetWrap || !sheetEl || !builder) return;
  // Remember who opened it and neutralize the background so the modal traps
  // focus and pointer interaction (#sheet-wrap is a sibling of .app-shell).
  // Only capture on a fresh open: a sheet-to-sheet switch (masthead hit-test
  // below, or the internal openSheet re-invocations) would otherwise capture
  // an about-to-be-destroyed in-sheet element and break close's focus restore.
  if (!state.openSheet) sheetOpener = document.activeElement;
  state.openSheet = name;
  // Projects prose is lazy-loaded (data/project-recipes.json); kick the fetch
  // when the sheet opens — loadProjectRecipes re-renders here once it lands.
  if (name === "projects" && !projectRecipesLoaded) loadProjectRecipes();
  sheetEl.innerHTML = builder();
  sheetWrap.classList.add("open");
  sheetWrap.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector(".app-shell")?.setAttribute("inert", "");
  sheetEl.scrollTop = 0;
  // The report form wires its own submit + moves focus to the message field;
  // every other sheet starts focus on the close button.
  if (name === "report") wireReportForm(sheetEl);
  else sheetEl.querySelector(".closer")?.focus?.();
}

// Open the "Report an error" form sheet, carrying context describing where the
// report came from. `context` is { subject, page }: subject is a short human
// label (species + place, or a panel name) shown to the reporter and used as the
// email subject; page is the URL/identifier we send along for the maintainer.
function openReportForm(context) {
  state.reportContext = context || null;
  openSheet("report");
}

function closeSheet() {
  const sheetWrap = document.querySelector("#sheet-wrap");
  if (!sheetWrap) return;
  sheetWrap.classList.remove("open");
  sheetWrap.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.querySelector(".app-shell")?.removeAttribute("inert");
  state.openSheet = null;
  // Restore focus to the control that opened the sheet (un-inert it first).
  if (sheetOpener && typeof sheetOpener.focus === "function") sheetOpener.focus();
  sheetOpener = null;
}

// Reset everything summarized in the legend's FILTERS line back to the default
// (all species shown, default access statuses, saved-only off) so a visitor who
// isolated one species — e.g. via a material page's "open on the map" link — can
// get back to the full map in one click. Leaves the season/day control alone.
function resetLegendFilters() {
  state.selectedSpecies = new Set(speciesCatalog.map((species) => species.id));
  state.selectedAccessStatuses = new Set(getDefaultAccessStatuses());
  state.savedLocationsOnly = false;
  // Also snap the season scrubber back to today and drop All seasons (mirrors
  // "Back to now") — isolating a species forces allSeasons on, so a plain
  // species reset would otherwise leave the map stuck in the all-year view.
  // Minerals reuses this control as the workability band (default = all
  // materials, allSeasons true), so leave its slider alone.
  if (!getActiveMapConfig().loadMinerals) {
    state.selectedDay = getDayOfYear(new Date());
    state.allSeasons = false;
  }
  render();
}

function selectOnlySpecies(speciesId) {
  state.savedLocationsOnly = false;
  state.selectedSpecies = new Set([speciesId]);
  // Isolating one species also lifts the season/day filter (state.allSeasons):
  // otherwise "Open on the map" from a material's static page — or a shelf tap —
  // lands on an empty map whenever that species is out of season on the selected
  // day. Showing the one species wherever it occurs is the intent of isolating it.
  state.allSeasons = true;
  render();
}

// Keyboard/SR route to a point card (the map's canvas markers are mouse-only;
// PRODUCT.md promises popups as a keyboard-reachable primary flow). Isolates
// the species — the same action as tapping its shelf card, so the record's
// marker is actually rendered — then opens the in-view record nearest the map
// center. bindPopupActions moves focus into the opened card.
function openNearestRecordInView(speciesId) {
  if (!state.mapReady) return;
  const bounds = map.getBounds();
  const center = map.getCenter();
  let best = null;
  let bestDist = Infinity;
  for (const record of state.records) {
    if (record.speciesId !== speciesId || !recordInBounds(record, bounds)) continue;
    const dLat = Number(record.lat) - center.lat;
    const dLng = Number(record.lng) - center.lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) { bestDist = dist; best = record; }
  }
  if (!best) return;
  selectOnlySpecies(speciesId);
  closeSheet();
  const feature = buildRecordFeature(best);
  if (feature) openRecordCard(feature);
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
    // "Report an error" (e.g. in the About panel) switches to the report form
    // sheet, carrying a subject label describing where it was opened from.
    const reportOpen = event.target.closest("[data-report]");
    if (reportOpen) {
      openReportForm({ subject: reportOpen.dataset.reportSubject || "", page: location.href });
      return;
    }
    // In-card links (e.g. "Full profile ↗") open the standalone page in a new
    // tab — let the anchor navigate instead of isolating/opening the card behind it.
    if (event.target.closest("a[href]")) return;
    const matFilter = event.target.closest("[data-materials-filter]");
    if (matFilter) {
      state.materialsAvailableOnly = matFilter.dataset.materialsFilter === "available";
      openSheet("plants"); // re-render the shelf in place
      return;
    }
    const projFilter = event.target.closest("[data-projects-filter]");
    if (projFilter) {
      state.projectsAvailableOnly = projFilter.dataset.projectsFilter === "available";
      showProjectsGrid(); // re-render the projects grid in place
      return;
    }
    const modeCard = event.target.closest("[data-mode]");
    if (modeCard) { const mode = modeCard.dataset.mode; closeSheet(); setMapMode(mode); return; }
    // Checked BEFORE the species-card branch: the button nests inside a
    // [data-species] card, which would otherwise swallow the click.
    const openRecord = event.target.closest("[data-open-record]");
    if (openRecord) { openNearestRecordInView(openRecord.dataset.openRecord); return; }
    const speciesCard = event.target.closest("[data-species]");
    if (speciesCard) { selectOnlySpecies(speciesCard.dataset.species); closeSheet(); return; }
    if (event.target.closest("[data-recipe-back]")) { showProjectsGrid(); return; }
    const shelfToggle = event.target.closest("[data-shelf-toggle]");
    if (shelfToggle) {
      const row = shelfToggle.closest(".proj-shelf")?.querySelector(".shelf-row");
      if (row) {
        const expanded = row.classList.toggle("expanded");
        shelfToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        shelfToggle.textContent = expanded ? "Collapse" : "Expand";
      }
      return;
    }
    const recipeCard = event.target.closest("[data-recipe]");
    if (recipeCard) { openRecipeDetail(recipeCard.dataset.recipe); }
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
    // A focused in-card link handles its own Enter/Space (native navigation),
    // and the open-record button its own native activation; don't also fire
    // the card's isolate/open action behind them.
    if (event.target.closest("a[href]")) return;
    if (event.target.closest("[data-open-record]")) return;
    const card = event.target.closest("[data-mode], [data-species], [data-recipe]");
    if (!card) return;
    event.preventDefault();
    card.click();
  });
  sheetWrap.addEventListener("click", (event) => {
    if (event.target !== sheetWrap) return;
    // The open sheet's backdrop covers the masthead (the .app-shell is inert),
    // so a click meant for a nav button lands here and used to close the
    // sheet — making every cross-sheet move cost two clicks. Hit-test the nav
    // labels and switch directly instead. (elementsFromPoint is unreliable on
    // inert subtrees; rects are not.) Measure the LABEL GLYPHS via a Range,
    // not the button box: the "·" separator is an ::after inside each button,
    // which inflates the box ~21px past the label, and strict box containment
    // sent separator/gap clicks to the wrong button or to closeSheet. Nearest
    // label within a small slop wins; the zero-width guard skips the collapsed
    // mobile nav, and clicking the CURRENT sheet's own label still falls
    // through to close — the toggle feel is preserved.
    const SLOP = 14; // px of forgiveness around each 20px-tall label
    let hit = null;
    let hitDist = Infinity;
    document.querySelectorAll("#masthead .links button[data-sheet]").forEach((button) => {
      const range = document.createRange();
      range.selectNodeContents(button); // glyphs only; excludes the ::after separator
      const r = range.getBoundingClientRect();
      if (!(r.width > 0)) return;
      const dx = Math.max(r.left - event.clientX, event.clientX - r.right, 0);
      const dy = Math.max(r.top - event.clientY, event.clientY - r.bottom, 0);
      const d = Math.max(dx, dy);
      if (d <= SLOP && d < hitDist) { hit = button; hitDist = d; }
    });
    if (hit && hit.dataset.sheet !== state.openSheet) {
      openSheet(hit.dataset.sheet);
      return;
    }
    closeSheet();
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
    // Minerals open showing all materials; the workability slider filters from there.
    if (MAP_MODE_CONFIG[mode].loadMinerals) state.allSeasons = true;
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
  // Leave the season bar in a clean resting state. closeSeasonExpanders folds
  // the mobile SET DATE / CHART / legend drop-ups and re-syncs their triggers
  // (on mobile, SET DATE owns .season-open, not #whenForm — clearing only the
  // form's toggle would strand the panel open with its button reading closed).
  // The desktop #whenForm calendar is separate, so hide it explicitly too.
  closeSeasonExpanders();
  if (whenForm && !whenForm.hidden) {
    whenForm.hidden = true;
    whenToggle?.classList.remove("active");
    whenToggle?.setAttribute("aria-expanded", "false");
  }
  syncActiveCatalog();
  renderModeChrome();
  updateLayerHandoff();
  // Deferred: lets the mode-switch tap (sheet close + chrome swap) paint
  // before the full marker/legend/histogram rebuild runs.
  scheduleRender();
  // Returning users come back to the map they last used; the URL always names
  // the active map so links stay shareable.
  try { window.localStorage?.setItem(ACTIVE_MAP_STORAGE_KEY, mode); } catch { /* private mode */ }
  updateUrlHash();
  // Modes whose data is geographically limited (Minerals → Arkansas) fly the map
  // to where their points actually are, so the layer isn't an empty national view.
  const initialView = MAP_MODE_CONFIG[mode].initialView;
  if (initialView && state.mapReady) {
    map.flyTo({ center: initialView.center, zoom: initialView.zoom, duration: 900 });
  }
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
  if (!suggestions) return; // lookup failed; its own status line stands
  if (suggestions[0]) {
    chooseLocationSuggestion(suggestions[0]);
    return;
  }
  setLocationSearchStatus("No matching place found.");
}

// Returns an array of features on success (possibly empty), or null when the
// lookup FAILED and this function already wrote its own status line. Callers
// must not overwrite the status on null, or "Search unavailable" turns into a
// misleading "No matching places found" when the user is simply offline.
async function fetchLocationSuggestions(query, limit = 5) {
  if (!MAPBOX_TOKEN) {
    setLocationSearchStatus("Location search needs a Mapbox token.");
    return null;
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
    return null;
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
  state.locationSuggestions = suggestions || [];
  // null = lookup failed and its status ("Search unavailable...") must stand.
  if (suggestions) setLocationSearchStatus(suggestions.length ? "" : "No matching places found.");
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

// NOTE: an "In view" record-list (keyboard route to point cards) shipped
// briefly and was removed as bar clutter (owner decision, 2026-07). Its
// replacement lives in the Materials sheet as designated: each shelf card's
// "Open nearest in view" button (openNearestRecordInView) routes through the
// same buildRecordFeature(record) -> openRecordCard(feature) path.

function initControls() {
  syncActiveCatalog();
  renderModeChrome();
  // Deep link: #...&sp=<speciesId> isolates one species (the same action as
  // tapping its Materials card). Applied after the catalog sync so the id is
  // resolvable; silently ignored if it isn't in the active catalog.
  if (urlBootState.speciesId && speciesCatalogById.has(urlBootState.speciesId)) {
    selectOnlySpecies(urlBootState.speciesId);
    // selectOnlySpecies lifts the season filter (right for shelf taps and the
    // static pages' bare sp links), but a shared hash that ALSO carries an
    // explicit day/workability filter must keep it — restore what was parsed.
    if (urlBootState.hadDayFilter) state.allSeasons = false;
    // Bare deep link (no center/zoom): don't strand the visitor on the empty
    // national map — name the material and steer them to the place search.
    if (!urlBootState.center) {
      const sp = speciesCatalogById.get(urlBootState.speciesId);
      promptSearchForDeepLink(sp?.commonName || "this material");
    }
  }
  // Minerals boots with the 0–100 workability range renderModeChrome() just
  // set; overwriting max with 365 here would misscale the band filter and
  // hide most minerals (the first render() syncs the value).
  if (!getActiveMapConfig().loadMinerals) {
    daySlider.max = String(getDaysInYear(ACTIVE_YEAR));
    daySlider.value = String(state.selectedDay);
  }
  dateInput.value = getDateInputValue(getSelectedDate());
  dateInput.min = `${ACTIVE_YEAR}-01-01`;
  dateInput.max = `${ACTIVE_YEAR}-12-31`;
  initAccessControls();
  initMapLegend();
  initSheets();
  initConditions();
  initLocationSearch();

  daySlider.addEventListener("input", () => {
    if (state.activeMap === "minerals") {
      state.mineralWorkability = Number(daySlider.value);
      state.allSeasons = false; // engage the workability band filter
      scheduleRender(); // rAF-coalesced: drags fire several inputs per frame
      return;
    }
    state.selectedDay = Number(daySlider.value);
    state.allSeasons = false;
    scheduleRender();
  });

  dateInput.addEventListener("change", () => {
    const date = new Date(`${dateInput.value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return;
    state.selectedDay = getDayOfYear(date);
    state.allSeasons = false;
    scheduleRender();
  });

  initWelcomeModal();

  // "Back to now" — reset the scrubber to today (prototype #season-reset).
  seasonReset.addEventListener("click", () => {
    state.selectedDay = getDayOfYear(new Date());
    state.allSeasons = false;
    scheduleRender();
  });

  allSeasonsButton.addEventListener("click", () => {
    state.allSeasons = !state.allSeasons;
    scheduleRender();
  });

  // "Chart" (desktop) pins the season histogram open — the visible
  // affordance for what was otherwise a hover/focus-only reveal. Mobile
  // hides this button (SET DATE opens the chart + slider there).
  histToggle.addEventListener("click", () => {
    const open = seasonBar.classList.toggle("season-open");
    histToggle.classList.toggle("active", open);
    histToggle.setAttribute("aria-expanded", String(open));
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
    // Minerals has no date entry — the workability slider (always visible on
    // desktop) is the control, so the "Workability" button must never open the
    // calendar form. It is hidden on desktop in minerals mode; guard anyway.
    if (state.activeMap === "minerals") return;
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
      if (aggregateTilesCachedForView()) {
        // Warm crossing (tiles prefetched or previously fetched): swap now
        // instead of waiting out the 260ms schedule debounce. The bridge
        // still settles on idle, so the old source buffer never paints —
        // clusters hold for roughly one idle cycle, not debounce + fetch.
        // (KNOWN_ISSUES item 1 plan 3; a hard visibility flip without the
        // idle wait would risk the documented async-setData old-buffer
        // flash, so "skip the bridge" is realized as "shrink it to the
        // paint".)
        window.clearTimeout(state.inatAggregateTimer);
        logHandoff("down-cross-warm");
        loadINaturalistAggregates();
      } else {
        logHandoff("down-cross-cold");
        scheduleINaturalistAggregateLoad();
      }
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
    // Phase 5.3: re-render the season histogram only when the map center crossed
    // into a different Köppen region (cheap id compare; most pans stay in-region),
    // so the regional curves + region-named caveat track the viewport. The
    // Materials/Projects sheets are modal over the map (the map can't move while
    // one is open), so the next sheet-open naturally reflects the current region.
    const region = getViewportRegion();
    if (region !== state.lastPhenologyRegion) {
      state.lastPhenologyRegion = region;
      renderHistogram();
    }
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
  // Minerals aren't seasonal: the bottom slider is a workability filter instead.
  // "All materials" (allSeasons) shows everything; otherwise show materials within
  // a band of the slider's soft→hard position.
  if (state.activeMap === "minerals") {
    if (state.allSeasons) return true;
    return mineralCategoryInBand(species.category);
  }
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
  renderHistogram();
  // getVisibleRecords() filters the whole loaded set and resolves a per-record
  // access rule for each survivor: the dominant per-frame cost. Compute it ONCE
  // and thread it through markers, the "N in view" count, and flush pulses,
  // which each used to recompute it (2 passes normally, 3 in food mode).
  const visibleRecords = state.mapReady ? getVisibleRecords() : null;
  renderMarkers(visibleRecords);
  updateFallingFruitAggregates();
  refreshFlush(visibleRecords);
  if (state.mapReady) {
    scheduleINaturalistAggregateLoad();
    scheduleDataLoad();
    schedulePublicLandLoad();
    // NOTE: render() used to force map.resize() every call — a forced layout
    // with no relationship to state changes. The window-resize listener and the
    // season-bar ResizeObserver own resize now.
  }
  updateUrlHash();
}

// One render per frame, max: input events (slider drags especially) can fire
// several times per frame, and render() rebuilds markers + histogram + legend.
// The rAF -> setTimeout(0) hop lets the interaction's own frame PAINT before
// the heavy rebuild runs (rAF callbacks run pre-paint, so rAF alone would
// still block the tap's presentation and count against INP); the rebuilt UI
// lands one frame later, which is imperceptible.
let renderQueuedFrame = false;
function scheduleRender() {
  if (renderQueuedFrame) return;
  renderQueuedFrame = true;
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      renderQueuedFrame = false;
      render();
    }, 0);
  });
}

function renderSeasonControls() {
  if (state.activeMap === "minerals") {
    const all = state.allSeasons;
    const band = mineralWorkBand(state.mineralWorkability);
    const readout = all ? "All materials" : band.label;
    daySlider.value = String(state.mineralWorkability);
    daySlider.disabled = false; // draggable even in "all" mode, so a drag starts filtering
    daySlider.setAttribute("aria-valuetext", readout);
    seasonDateLabel.textContent = readout;
    seasonName.textContent = all ? "" : band.examples;
    allSeasonsButton.classList.toggle("active", all);
    allSeasonsButton.setAttribute("aria-pressed", String(all));
    if (seasonReset) seasonReset.hidden = true;
    return;
  }
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
        histToggle?.classList.remove("active");
        histToggle?.setAttribute("aria-expanded", "false");
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

// Fold away the season drop-up (SET DATE histogram on mobile, the CHART pin
// on desktop) and the legend, resetting their triggers, so the bar collapses
// to its slim resting height.
function closeSeasonExpanders() {
  if (!seasonBar) return;
  let changed = false;
  if (seasonBar.classList.contains("season-open")) {
    seasonBar.classList.remove("season-open");
    histToggle?.classList.remove("active");
    histToggle?.setAttribute("aria-expanded", "false");
    // On desktop whenToggle's state tracks the #whenForm calendar, not
    // season-open — resetting it here would desync an open form. Mobile's
    // SET DATE is the season-open owner there.
    if (window.matchMedia("(max-width: 720px)").matches) {
      whenToggle?.classList.remove("active");
      whenToggle?.setAttribute("aria-expanded", "false");
    }
    changed = true;
  }
  if (seasonBar.classList.contains("legend-open")) {
    seasonBar.classList.remove("legend-open");
    legendMob?.classList.remove("active");
    legendMob?.setAttribute("aria-pressed", "false");
    changed = true;
  }
  if (changed) syncMapControlsOffset();
}

// Tapping the map itself should feel like "put everything away" — collapse every
// open card at once instead of making people hunt for the same trigger that
// opened each one. Phones only; map-canvas taps never land on the floating cards
// (those sit above the canvas), so this fires only for genuine taps on the map.
function collapseMobilePanels() {
  if (!window.matchMedia("(max-width: 720px)").matches) return;
  setMastPanel(null);     // search / conditions / menu drop-downs (+ rail detail)
  closeSeasonExpanders(); // SET DATE histogram + folded legend
}

function initMobileMasthead() {
  if (!masthead) return;
  const toggle = (name) => setMastPanel(currentMastPanel() === name ? null : name);
  mastMenuBtn?.addEventListener("click", (event) => { event.stopPropagation(); toggle("menu"); });
  mastSearchBtn?.addEventListener("click", (event) => { event.stopPropagation(); toggle("search"); });
  mastCondBtn?.addEventListener("click", (event) => { event.stopPropagation(); toggle("cond"); });
  // Mobile-only active-map chip: shows which of the four maps is active and
  // opens the Maps sheet to switch (the desktop nav already exposes this).
  document.getElementById("activeMapChip")?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMastPanel(null);
    openSheet("maps");
  });
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
    if (event.key !== "Escape") return;
    if (currentMastPanel()) setMastPanel(null);
    closeSeasonExpanders();
  });
  // Tapping back into the map collapses every open card (see collapseMobilePanels).
  map.on("click", collapseMobilePanels);
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
// per mode from data/phenology/<mode>.json. Region-keyed (Phase 5.3): each
// species maps to { national:[12], <köppen-group>:[12], ... }. Cached; a null
// entry marks a failed load so the histogram falls back to binary species.months.
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

// Köppen-collapsed climate regions (data/phenology-regions.json): the state ->
// group map + group labels used to pick a species' regional phenology curve for
// the current viewport. Loaded once at boot; the lookups below no-op gracefully
// until it lands (falling back to the national curve, then species.months).
let phenologyRegions = null;
function loadPhenologyRegions() {
  if (phenologyRegions) return Promise.resolve(phenologyRegions);
  return fetch("./data/phenology-regions.json")
    .then((response) => {
      if (!response.ok) throw new Error(`phenology-regions: ${response.status}`);
      return response.json();
    })
    .then((data) => { phenologyRegions = data; return data; })
    .catch(() => { phenologyRegions = null; return null; });
}

// Which Köppen group contains the map's current center. Reuses the Census state
// polygons already loaded for record->state attribution: point-in-state on
// map.getCenter() -> that state's group. Returns null outside CONUS (or before
// the boundaries / region map load) so lookups fall back to `national`.
function getViewportRegion() {
  if (!phenologyRegions || !state.stateBoundaries || !map) return null;
  let center;
  try {
    center = map.getCenter();
  } catch {
    return null;
  }
  if (!center) return null;
  const lng = Number(center.lng);
  const lat = Number(center.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  const match = state.stateBoundaries.find((entry) => (
    lng >= entry.bbox[0] && lng <= entry.bbox[2]
    && lat >= entry.bbox[1] && lat <= entry.bbox[3]
    && pointInFeature([lng, lat], entry)
  ));
  if (!match) return null;
  return phenologyRegions.states[match.name] || null;
}

// Human-readable label for a Köppen group id (for the region-named caveat), e.g.
// "subtropical" -> "Humid subtropical". Falls back to null when unknown.
function getRegionLabel(region) {
  return phenologyRegions?.groups?.[region]?.label || null;
}

// A species' phenology curve for a viewport region: the regional curve when the
// species has one for that group, else the national curve. Returns null when the
// mode's phenology hasn't loaded or the species isn't present (callers then fall
// back to species.months). Also reports which key was used so captions can name
// the region only when a real regional curve is in play.
function getPhenologyCurve(mode, speciesId, region) {
  const phenology = phenologyByMode[mode];
  const entry = phenology?.[speciesId];
  if (!entry) return { curve: null, region: null };
  if (region && Array.isArray(entry[region])) return { curve: entry[region], region };
  if (Array.isArray(entry.national)) return { curve: entry.national, region: null };
  return { curve: null, region: null };
}

// The Köppen-region label to name in the Materials/Projects "Available" caveat,
// but only when the active map's loaded phenology actually carries a regional
// curve for the current viewport region (so the caveat is truthful — else it
// returns null and callers keep the honest "contiguous-US average" wording).
function getActiveRegionCaveatLabel() {
  const region = getViewportRegion();
  if (!region) return null;
  const phenology = phenologyByMode[state.activeMap];
  if (!phenology) return null;
  const hasRegionalCurve = Object.values(phenology)
    .some((entry) => entry && Array.isArray(entry[region]));
  return hasRegionalCurve ? getRegionLabel(region) : null;
}

function renderHistogram() {
  // Minerals aren't seasonal — instead of a month chart, show the material
  // distribution across the workability (soft → hard) axis the slider filters on.
  if (getActiveMapConfig().loadMinerals) { renderMineralHistogram(); return; }
  if (seasonHistogram) seasonHistogram.classList.remove("mineral-hist");
  const speciesForChart = speciesCatalog.filter((species) => (
    state.selectedSpecies.has(species.id)
  ));
  const region = getViewportRegion();
  // Resolve each charted species' curve once (regional where available, else
  // national). Track whether ANY charted species used a real regional curve so
  // the caveat can be region-named only when the chart genuinely reflects it.
  let usedRegionalCurve = false;
  const curveBySpecies = new Map();
  speciesForChart.forEach((species) => {
    const { curve, region: usedRegion } = getPhenologyCurve(state.activeMap, species.id, region);
    curveBySpecies.set(species.id, curve);
    if (usedRegion) usedRegionalCurve = true;
  });
  const monthData = MONTHS.map((_, index) => {
    const month = index + 1;
    const weighted = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
    const counts = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
    speciesForChart.forEach((species) => {
      const curve = curveBySpecies.get(species.id);
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
      // Inline register-aware color (not the CSS class hue) so dark categories
      // like ink "black" stay visible on the night panel.
      const segColor = registerCategoryColor(getActiveMapConfig().categoryColors[category] || "#777");
      return `<div class="histogram-segment ${category}" style="height: ${segmentHeight}px; background: ${escapeHTML(segColor)}"></div>`;
    }).join("");
    const title = CATEGORIES
      .filter((category) => entry.counts[category])
      .map((category) => `${getCategoryLabel(category)}: ${entry.counts[category]}`)
      .join(", ");
    // Month letters live in the static .season-months row below the bars now.
    // title (sighted hover) AND aria-label + role=img (keyboard/SR) both carry
    // the per-month data — the bars are plain divs otherwise silent to AT.
    const barText = `${MONTHS[index]}: ${title || "none in season"}`;
    return `<div class="histogram-bar${activeClass}" style="height: ${height}px" role="img" aria-label="${escapeHTML(barText)}" title="${barText}">${segments}</div>`;
  }).join("");

  // Header reflects the active map; the category swatch legend sits below.
  // The caveat is load-bearing: it names the Köppen region when the chart is
  // drawn from a real regional curve (Phase 5.3), and keeps the honest
  // contiguous-US-average caveat when falling back to the national curve.
  const modeName = { food: "FOOD", ink: "INK", medicine: "HERBS", minerals: "MINERALS" }[state.activeMap] || String(state.activeMap || "").toUpperCase();
  const regionLabel = usedRegionalCurve ? getRegionLabel(region) : null;
  const caveatText = regionLabel
    ? `${regionLabel}, regional timing (local ripening still varies).`
    : "Contiguous-US average, local ripening can differ by weeks.";
  if (seasonHistHead) seasonHistHead.innerHTML = `IN SEASON BY MONTH · <b>${escapeHTML(modeName)} MAP</b> · STACKED BY CATEGORY<span class="season-caveat">${escapeHTML(caveatText)}</span>`;
  renderSeasonCats();
}

// Minerals histogram: one bar per craft material, ordered soft → hard, height by
// number of localities, colored by category — the distribution the workability
// slider filters across. Bars inside the active band are highlighted.
function renderMineralHistogram() {
  if (!seasonHistogram) return;
  const config = getActiveMapConfig();
  const counts = {};
  state.records.forEach((record) => {
    if (!state.selectedSpecies.has(record.speciesId)) return;
    const species = getSpecies(record.speciesId);
    if (!species) return;
    counts[species.category] = (counts[species.category] || 0) + 1;
  });
  const cats = config.categories
    .map((category) => category.id)
    .filter((id) => MINERAL_WORKABILITY[id] != null)
    .sort((a, b) => MINERAL_WORKABILITY[a] - MINERAL_WORKABILITY[b]);
  const max = Math.max(1, ...cats.map((id) => counts[id] || 0));
  const activeBand = !state.allSeasons;
  seasonHistogram.classList.add("mineral-hist");
  seasonHistogram.innerHTML = cats.map((id) => {
    const n = counts[id] || 0;
    const height = n > 0 ? Math.max(6, Math.round((n / max) * 104)) : 6;
    const color = registerCategoryColor(config.categoryColors[id] || "#777");
    const inBand = activeBand && mineralCategoryInBand(id);
    const label = getCategoryLabel(id);
    // Short label (parenthetical stripped, long names trimmed to their first
    // word) sits under each bar so the material is readable at a glance; the
    // full label + count stay in the hover title. Relative heights only — MRDS
    // caps several materials at ~500 localities, so absolute counts would
    // misread as real-world abundance.
    let shortLabel = label.replace(/\s*\([^)]*\)\s*/g, "").trim().split(" / ")[0];
    if (shortLabel.length > 14) shortLabel = shortLabel.split(" ")[0];
    const mbarText = `${label}: ${n} localit${n === 1 ? "y" : "ies"}`;
    return `<div class="histogram-bar${inBand ? " active" : ""}" role="img" aria-label="${escapeHTML(mbarText)}" title="${escapeHTML(mbarText)}"><div class="histogram-segment" style="height: ${height}px; background: ${escapeHTML(color)}"></div><span class="mbar-label">${escapeHTML(shortLabel)}</span></div>`;
  }).join("");
  if (seasonHistHead) seasonHistHead.innerHTML = `MATERIALS BY WORKABILITY · <b>MINERALS MAP</b> · SOFT → HARD`;
  renderSeasonCats();
}

function renderSeasonCats() {
  if (!seasonCats) return;
  const config = getActiveMapConfig();
  seasonCats.innerHTML = config.categories.map((category) => {
    const color = registerCategoryColor(config.categoryColors[category.id] || "#777");
    return `<span class="season-cat"><i style="background:${escapeHTML(color)}"></i>${escapeHTML(category.label)}</span>`;
  }).join("");
}

// Build the marker GeoJSON feature (geometry + full popup properties) for one
// record. Shared by renderMarkers and the "In view" record list, so the list's
// cards are byte-identical to the map's. Returns null for unmappable records.
function buildRecordFeature(record) {
  const species = getSpecies(record.speciesId);
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!species || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const accessRule = getRecordAccessRule(record, species);
  const categoryColor = CATEGORY_COLORS[species.category] || Object.values(CATEGORY_COLORS)[0];
  const markerIcon = getMarkerIconName(species.category, accessRule.status);
  ensureMarkerIcon(markerIcon, categoryColor, accessRule.status);

  return {
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
      approximate: !!record.approximate,
      observer: record.observer || "",
      idDate: record.idDate || "",
      name: record.name || species.commonName,
      usedParts: species.usedParts || "",
      safetyTags: getSpeciesSafetyTags(species).join("|"),
      harvestEthic: getSpeciesHarvestEthicLabel(species),
      educationalOnly: !!species.educationalOnly,
      accessNote: accessRule.note,
      accessStatus: accessRule.status,
      accessStatusLabel: accessRule.label,
      accessArea: accessRule.area,
      accessLimit: accessRule.limit,
      accessSourceLabel: accessRule.sourceLabel,
      accessSourceUrl: accessRule.sourceUrl,
      // Structured rule provenance (data/rules/*.json `checked` field),
      // flattened for Mapbox GL property serialization. Empty when the rule
      // is a generic/live fallback with no researched table entry.
      checkedBy: accessRule.checked?.by || "",
      checkedDate: accessRule.checked?.date || "",
      rulesLabel: getActiveMapConfig().rulesLabel,
      season: getMonthRangeText(species.months),
      months: Array.isArray(species.months) ? species.months.join(",") : "",
      // Stone isn't seasonal; carry the catalog detail (type range, grades,
      // safety) instead so it can surface on the mineral point card.
      notes: record.source === "mineral" ? (species.notes || "") : "",
      confidence: record.confidence || "community",
      harvestStatus: record.harvestStatus || "",
      harvestNote: record.accessNote || "Confirm site rules before harvesting."
    }
  };
}

function renderMarkers(visibleRecords) {
  if (!state.mapReady || !map.getSource(MARKERS_SOURCE_ID)) return;

  // Standalone callers (mode switch, PAD-US load, boot loaders, status raster)
  // pass nothing and get a fresh pass; render() threads its shared visible set
  // so one frame resolves per-record access rules once, not two or three times.
  const visible = visibleRecords || getVisibleRecords();
  const features = visible
    .map(buildRecordFeature)
    .filter(Boolean);

  map.getSource(MARKERS_SOURCE_ID).setData({
    type: "FeatureCollection",
    features
  });
  updateRecordCountStatus(visible);
}

// Persistent "N in view" line for the season bar: unlike the old transient
// success message it stays current across filter toggles (the stale-"229"
// bug: chips re-rendered markers but nothing re-wrote the count). Yields to
// loading/outage/error messages, and leaves overview zooms to loadMapData's
// aggregate-count notices.
function updateRecordCountStatus(visibleRecords) {
  if (!state.mapReady) return;
  if (dataStatusKind === "loading" || dataStatusKind === "outage" || dataStatusKind === "error" || dataStatusKind === "notice") return;
  const config = getActiveMapConfig();
  const isMinerals = !!config.loadMinerals;
  if (!isMinerals && (!state.pointDataReady || map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM)) return;
  // Right after a mode switch the record set is empty because the load hasn't
  // landed yet — "0 nationwide" would read as broken. Let the loading message
  // own the line until the minerals file arrives.
  if (isMinerals && !state.records.length) return;
  const counts = getRecordViewCounts(visibleRecords);
  if (!counts) return;
  const { loadedInView, visibleInView } = counts;
  const hidden = Math.max(0, loadedInView - visibleInView);
  const filtersOn = getActiveFilterSummary().length > 0;
  let message;
  if (visibleInView === 0) {
    // Empty viewports were dead ends: a blank map over a "4881 records
    // loaded" line reads as broken. Say WHY it is empty and what to do next.
    if (loadedInView > 0 && isMinerals) {
      // In minerals the usual reason everything is hidden is the workability
      // band (the bottom slider), not the legend.
      const bandHint = !state.allSeasons ? "widen the workability band or " : "";
      message = `0 of ${loadedInView} localities in view shown, ${bandHint}adjust the legend filters`;
    } else if (loadedInView > 0) {
      const seasonHint = !state.allSeasons ? "tap All seasons or " : "";
      message = `0 of ${loadedInView} records in view shown, ${seasonHint}adjust the legend filters`;
    } else if (isMinerals) {
      const near = describeNearestRecord();
      message = near
        ? `No localities in view, nearest is ${near} · ${state.records.length} nationwide`
        : `No localities in view · ${state.records.length} nationwide`;
    } else {
      message = "No records in this view, zoom out or pan toward a town or park";
    }
  } else if (isMinerals) {
    const noun = visibleInView === 1 ? "locality" : "localities";
    message = `${visibleInView} ${noun} in view · ${state.records.length} nationwide · ${config.sourceNames.join(", ")}`;
    if (hidden && filtersOn) message = `Showing ${visibleInView} of ${loadedInView} localities in view · ${state.records.length} nationwide`;
  } else if (hidden && filtersOn) {
    message = `Showing ${visibleInView} of ${loadedInView} records in view · ${hidden} hidden by current filters`;
  } else {
    const noun = visibleInView === 1 ? "record" : "records";
    // Live iNaturalist points are a most-recent per-tile sample, so at point
    // zoom they map fewer finds than the overview's all-time total; the note
    // explained that drop as sampling, not data loss. The baked path plots the
    // same set the overview counts (overview == plotted by construction), so
    // there is no drop and no note.
    const sampleNote = (!USE_BAKED_INATURALIST && config.sourceNames.includes("iNaturalist"))
      ? " · recent iNaturalist sample"
      : "";
    message = `${visibleInView} ${noun} in view · ${config.sourceNames.join(", ")}${sampleNote}`;
  }
  setDataStatus(message, { kind: "count" });
}

// "Nearest is ~120 mi NE" hint for empty minerals viewports — the mineral set
// is national and in memory, so the nearest locality is always computable.
// Food/ink/medicine records are viewport-loaded; there is nothing beyond the
// viewport to measure against, so those modes get no nearest hint.
function describeNearestRecord() {
  if (!state.mapReady || !state.records.length) return null;
  const center = map.getCenter();
  let best = null;
  let bestKm = Infinity;
  for (const record of state.records) {
    const lat = Number(record.lat);
    const lng = Number(record.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const km = haversineKm(center.lat, center.lng, lat, lng);
    if (km < bestKm) { bestKm = km; best = record; }
  }
  if (!best || !Number.isFinite(bestKm)) return null;
  // A locality just outside the viewport edge rounds to "~0 mi", which reads as
  // a bug; floor the displayed distance to 1 mi.
  const miles = Math.max(1, Math.round(bestKm * 0.621371));
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLng = toRad(Number(best.lng) - center.lng);
  const lat1 = toRad(center.lat);
  const lat2 = toRad(Number(best.lat));
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dir = dirs[Math.round(bearing / 45) % 8];
  return `~${miles} mi ${dir}`;
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
  const config = getActiveMapConfig();
  // Baked iNaturalist modes that don't load Falling Fruit (Herbs) skip the FF
  // manifest; the baked iNat manifest is loaded so getAggregateItems can add
  // its chunks. Flag-off behavior is unchanged (FF manifest only, live grid).
  const ffManifestPromise = (USE_BAKED_INATURALIST && !config.loadFallingFruit)
    ? Promise.resolve({ chunks: [] })
    : getFallingFruitManifest();
  const inatManifestPromise = (USE_BAKED_INATURALIST && !config.loadMinerals)
    ? getInatChunkManifest().catch(() => null)
    : Promise.resolve(null);
  Promise.all([ffManifestPromise, inatManifestPromise])
    .then(([manifest]) => {
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
  const config = getActiveMapConfig();
  const items = config.loadFallingFruit
    ? [...(manifest.chunks || [])]
    : [];
  if (USE_BAKED_INATURALIST) {
    // Baked iNaturalist manifest chunks feed the overview for every iNat mode
    // (food/ink/Herbs). They carry countsByAnchor, which the aggregate
    // consumers resolve to the active-mode species; getGridAggregateFeatures
    // still bbox-filters them.
    if (!config.loadMinerals && state.inatChunkManifest?.chunks) {
      items.push(...state.inatChunkManifest.chunks);
    }
  } else if (state.mapReady && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
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
      weightedLat: 0,
      catCounts: {}
    };
    group.count += count;
    group.weightedLng += center[0] * count;
    group.weightedLat += center[1] * count;
    const itemCats = getAggregateItemCategoryCounts(item, selectedSpeciesIds);
    if (itemCats) {
      for (const [cat, n] of Object.entries(itemCats)) group.catCounts[cat] = (group.catCounts[cat] || 0) + n;
    }
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
    count: group.count,
    catCounts: Object.keys(group.catCounts).length ? group.catCounts : null
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
      catCounts: { ...(feature.properties.catCounts || {}) },
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
    count: node.count,
    catCounts: node.catCounts && Object.keys(node.catCounts).length ? node.catCounts : null
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
  const catCounts = { ...(a.catCounts || {}) };
  for (const [cat, n] of Object.entries(b.catCounts || {})) catCounts[cat] = (catCounts[cat] || 0) + n;
  return {
    ids: [...a.ids, ...b.ids],
    levels: new Set([...a.levels, ...b.levels]),
    labels: [...a.labels, ...b.labels],
    count,
    weightedLng: a.weightedLng + b.weightedLng,
    weightedLat: a.weightedLat + b.weightedLat,
    catCounts,
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
      // Status counts can be fractional when a cell's count was apportioned
      // across statuses by area share (thin-park apportioning); round the
      // displayed total so circle labels stay whole numbers.
      return Math.round([...selectedAccessStatuses].reduce((total, status) => (
        total + Number(statusCounts[status] || 0)
      ), 0));
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
  // Baked iNaturalist chunk: counts keyed by anchor taxon id, resolved to the
  // active-mode species (the access-filter path above already handles the
  // species-keyed accessCounts, so this is only the unfiltered overview).
  if (item.countsByAnchor) {
    const anchorMap = getActiveInatAnchorSpeciesMap();
    return Object.entries(item.countsByAnchor).reduce((total, [anchor, count]) => {
      const species = anchorMap.get(Number(anchor));
      return species && selectedSpeciesIds.has(species.id) ? total + Number(count || 0) : total;
    }, 0);
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
  // Baked iNaturalist chunk: a single count-weighted center is baked per chunk
  // (see below's item.center fallback); species/access filtering re-counts but
  // does not re-center within the chunk.
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
    // priority: "low" keeps this multi-MB fetch from outcompeting basemap
    // tiles and point chunks on first load (ignored where unsupported).
    state.statusRasterPromise = fetch(STATUS_RASTER_URL, { priority: "low" })
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

function getAggregateFeature({ id, level, label, center, count, catCounts }) {
  const properties = {
    id,
    level,
    label,
    count,
    countLabel: formatAggregateCount(count)
  };
  // catCounts (per-category record counts) is carried on the in-memory feature
  // so mergeOverlappingAggregateFeatures can combine it; the resolved dominant
  // color is what the paint reads. Both are harmless if serialized.
  if (catCounts) {
    properties.catCounts = catCounts;
    const catColor = dominantAggregateCategoryColor(catCounts);
    if (catColor) properties.catColor = catColor;
  }
  return {
    type: "Feature",
    id,
    geometry: {
      type: "Point",
      coordinates: center
    },
    properties
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
        // Dominant-category tint where the cell has per-species (Falling Fruit)
        // counts; falls back to cream for iNaturalist-collapsed overview cells.
        "circle-color": ["coalesce", ["get", "catColor"], "#f7f2df"],
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
        // Halo so counts stay legible on the tinted circles.
        "text-halo-color": "rgba(255,255,255,0.85)",
        "text-halo-width": 1,
        "text-emissive-strength": 1
      }
    });
  }

  if (!map.getSource(MARKERS_SOURCE_ID)) {
    // Per-category member counts aggregated into every cluster, for the
    // dominant-category tint (updateClusterTint). clusterProperties are fixed
    // at source creation, so this carries the union of all four modes'
    // category ids (~29, all distinct); only the active mode's are read.
    const clusterProperties = {};
    Object.values(MAP_MODE_CONFIG).forEach((cfg) => cfg.categories.forEach((category) => {
      clusterProperties[`n_${category.id}`] = ["+", ["case", ["==", ["get", "category"], category.id], 1, 0]];
    }));
    map.addSource(MARKERS_SOURCE_ID, {
      type: "geojson",
      cluster: true,
      clusterMaxZoom: MARKER_CLUSTER_MAX_ZOOM,
      clusterRadius: MARKER_CLUSTER_RADIUS,
      clusterProperties,
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
  // Mode-dependent layer state that no-ops before mapReady: re-apply now that
  // the layers exist (matters when a URL hash boots straight into a mode).
  applyMarkerZoomRangeForMode();
  updateClusterTint();
  updateMarkerHalo();
  updateLayerHandoff();

  map.on("sourcedata", (event) => {
    if (event.sourceId !== MARKERS_SOURCE_ID || !event.isSourceLoaded) return;
    updateMarkerPointVisibility();
  });
}

function shouldShowPointLayers() {
  // Minerals are a small, self-contained (non-aggregate) set loaded once from a
  // static file, so their clusters/points show at every zoom — no aggregate band
  // to hand off to. (Needed for the US-wide expansion: zoom out must not blank it.)
  if (getActiveMapConfig().loadMinerals) return state.mapReady && state.records.length > 0;
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

// Minerals render as clusters/points at every zoom (see shouldShowPointLayers), so
// drop the marker layers' minzoom in mineral mode; restore the point-band defaults
// (clusters from the bridge zoom, points from the point band) for the other modes.
const MINERAL_MARKER_MIN_ZOOM = 2;
function applyMarkerZoomRangeForMode() {
  if (!state.mapReady) return;
  const isMineral = getActiveMapConfig().loadMinerals;
  const clusterMin = isMineral ? MINERAL_MARKER_MIN_ZOOM : MARKER_CLUSTER_BRIDGE_MIN_ZOOM;
  const pointMin = isMineral ? MINERAL_MARKER_MIN_ZOOM : FALLING_FRUIT_MIN_LOAD_ZOOM;
  const setRange = (id, min) => { if (map.getLayer(id)) map.setLayerZoomRange(id, min, 24); };
  setRange(MARKER_CLUSTERS_LAYER_ID, clusterMin);
  setRange(MARKER_CLUSTER_COUNT_LAYER_ID, clusterMin);
  setRange(MARKER_HALO_LAYER_ID, pointMin);
  setRange(MARKERS_LAYER_ID, pointMin);
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
  // 0.55 (was 0.38): the night basemap stays — auto day/night is deliberate so
  // night foragers aren't blinded — so the halo does the legibility work,
  // lifting dark category icons off the dark ground.
  map.setPaintProperty(MARKER_HALO_LAYER_ID, "circle-opacity", isNightish() ? 0.55 : 0);
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
        + `<div class="hover-st" style="color:${hoverStatusColor}">${escapeHTML((hp.accessStatusLabel || "Unverified").toUpperCase())}</div>`
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
    openRecordCard(feature);
  });

}

// Open the point card for a marker feature (from a map click OR the shelf's
// "Open nearest in view" button — the keyboard route to the same dialog).
function openRecordCard(feature) {
  if (!feature?.geometry?.coordinates) return;
  state.hoverPopup?.remove();
  state.hoverPopup = null;
  state.activePopup?.remove();
  state.activePopup = new mapboxgl.Popup({
    className: "forage-popup pt-popup",
    closeButton: false,
    closeOnClick: true,
    maxWidth: "none",
    offset: 14,
    anchor: "top" // always open downward, in tandem with the auto-pan below
  })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(getMarkerPopupHTML(feature.properties))
    .addTo(map);
  bindPopupActions(state.activePopup);
  // Auto-pan so the card fits without the user scrolling the map: raise the
  // clicked point into the upper third so the (top-anchored) card opens down
  // into the open space below it.
  const mapH = map.getContainer().clientHeight || 600;
  map.easeTo({
    center: feature.geometry.coordinates,
    offset: [0, -Math.round(mapH * 0.34)],
    duration: 450
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
  // "Report an error" opens the in-site report form sheet, carrying the record's
  // species/place as the subject, instead of launching the visitor's mail app.
  const reportButton = element.querySelector("[data-report]");
  if (reportButton) {
    reportButton.addEventListener("click", () => {
      openReportForm({
        subject: reportButton.dataset.reportSubject || "",
        page: reportButton.dataset.reportPage || "",
        // Opened from a point card: the record's species + place is already the
        // subject, so the form skips the "tell us the location" hint.
        pointSpecific: true
      });
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
  // "Where did it go?" pointer: saved points surface in the Offline areas
  // panel's SAVED list, which nothing else on the card hints at.
  const note = button.parentElement?.querySelector(".save-note");
  if (note) note.hidden = !saved;
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

// "YYYY-MM" (rule checked.date) -> "Jun 2026" for the provenance chip;
// returns "" for anything unparseable so a bad date never renders raw.
function formatCheckedMonth(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || ""));
  if (!match) return "";
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const name = names[Number(match[2]) - 1];
  return name ? `${name} ${match[1]}` : "";
}

function getMarkerPopupHTML(properties) {
  const status = properties.accessStatus || "unknown";
  const statusColor = `var(--reg-st-${ACCESS_STATUS_TOKEN[status] || "unknown"})`;
  const accessLabel = escapeHTML(properties.accessStatusLabel || "Unverified");
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
    : escapeHTML(properties.accessSourceLabel || "Local rules not yet researched");
  const ruleLimit = escapeHTML(properties.accessLimit || "Unknown; confirm local rules before harvesting.");

  // Provenance of the rule itself, read from the structured `checked` field
  // the rule tables carry (data/rules/*.json — see docs/rules-schema.md).
  // "Verified" is reserved for rules the owner personally re-verified
  // (checked.by === "owner" -> green "✓ VERIFIED <Mon YYYY>" chip); rules
  // encoded/checked by the scheduled agent loops get a neutral
  // "CHECKED <Mon YYYY>" chip; generic defaults and live fallbacks carry no
  // provenance and get no chip. The note prose follows the chip — together
  // the single most important trust cue on the card.
  const accessNoteText = properties.accessNote ? String(properties.accessNote) : "";
  const checkedBy = properties.checkedBy || "";
  const checkedMonth = formatCheckedMonth(properties.checkedDate);
  const ownerVerified = checkedBy === "owner";
  const ruleChip = (ownerVerified || checkedBy === "agent")
    ? `<span class="rule-chip">${ownerVerified ? "✓ VERIFIED" : "CHECKED"}${checkedMonth ? ` ${checkedMonth}` : ""}</span> `
    : "";
  const ruleNote = (accessNoteText || ruleChip)
    ? `<div class="rule-note${ownerVerified ? " verified" : ""}">${ruleChip}${escapeHTML(accessNoteText)}</div>`
    : "";

  // On phones the card renders compact (prototype parity): drop the optional
  // USE row, seasonality sparkline, flush line, and harvest-ethic note.
  const compact = typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(max-width: 720px)").matches;

  // Stone is not seasonal or "harvested" like a plant, so the mineral card drops
  // the season sparkline + harvest-ethic and instead surfaces the catalog detail
  // (material type range, grades, and safety) that has no other home in the UI.
  const isMineral = properties.source === "mineral";
  const usedPartsRow = (!compact && properties.usedParts)
    ? `<div class="row"><span class="lab">USE</span><span class="val">${escapeHTML(properties.usedParts)}</span></div>`
    : "";
  const detailRow = (!compact && isMineral && properties.notes)
    ? `<div class="row"><span class="lab">DETAIL</span><span class="val">${escapeHTML(properties.notes)}</span></div>`
    : "";
  const safetyTags = String(properties.safetyTags || "").split("|").filter(Boolean);
  const safetyRow = safetyTags.length
    ? `<div class="row safety"><span class="lab">SAFETY</span><span class="val">${safetyTags.map((tag) => escapeHTML(expandSafetyTag(tag))).join(" · ")}</span></div>`
    : "";
  // Ethic reads as a soft trailing paragraph, not a labeled row (prototype).
  const ethicNote = (!compact && !isMineral && properties.harvestEthic)
    ? `<div class="ethic">${escapeHTML(properties.harvestEthic)}</div>`
    : "";

  // Seasonality sparkline + SEASON range, tinted to the category color.
  const monthSet = new Set(String(properties.months || "").split(",").map(Number).filter(Boolean));
  const monthsArr = Array.from({ length: 12 }, (_, i) => (monthSet.has(i + 1) ? 1 : 0));
  const seasonSpark = monthSet.size
    ? sparkline(monthsArr, properties.categoryColor || "var(--reg-accent)")
    : "";
  const seasonLine = (compact || isMineral)
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
    ? `<div class="oinp" style="color:var(--reg-warn-text, var(--reg-warn))">${escapeHTML(properties.harvestStatus)}, ${escapeHTML(properties.harvestNote)}</div>`
    : "";
  // Medicine mode keeps the educational-use disclaimer prominent (CLAUDE.md).
  const medSafetyNote = getActiveMapConfig().safetyNote;
  const medNote = state.activeMap === "medicine" && medSafetyNote
    ? `<div class="med-note">${escapeHTML(medSafetyNote)}</div>`
    : "";
  // Some ink/dye materials are published for reference only — culturally sacred,
  // conservation-sensitive, or requiring regional/Indigenous knowledge to harvest
  // ethically. They carry an explicit educational-only stamp, never a how-to.
  const eduStamp = properties.educationalOnly
    ? `<div class="edu-stamp">EDUCATIONAL ONLY, NOT A HARVEST RECOMMENDATION. Seek permission or local/cultural knowledge first.</div>`
    : "";
  // MRDS localities are largely historic mine workings, positionally graded and
  // frozen ~2011–2022 (see ATTRIBUTION.md). Surface both the physical hazard of
  // old workings and the data-age caveat where the user actually looks.
  const mineralHazard = isMineral
    ? `<div class="mine-hazard">HISTORIC MINE RECORD, many MRDS sites are inactive or abandoned workings. Never enter shafts, adits, or pits; collect only surface float, and confirm the site is not on posted or hazardous ground. Locations are a curated seed (USGS MRDS, ~2011–2022), not a guarantee that material is present or reachable today.</div>`
    : "";
  // Points whose coordinates iNaturalist obscured for user geoprivacy are shown
  // as an area hint, never a precise spot (see mapINaturalistObservation).
  const approxNote = properties.approximate
    ? `<div class="approx-note">APPROXIMATE, iNaturalist obscured this location for privacy (±~20&nbsp;km). Treat it as an area, not a spot.</div>`
    : "";
  // LAND row: name the managing unit when the resolved rule knows it (PAD-US
  // Unit_Nm, curated site rules, local jurisdictions, NPS orchards), so the
  // footer's "check who manages this land" has an answer on the card itself.
  // Generic placeholders from the fallback rule branches add nothing over the
  // ACCESS status, so they render no row and the caution carries the weight.
  const GENERIC_AREAS = new Set([
    "Mapped public-access land",
    "Private or unverified location",
    "PAD-US public land",
    // Falling Fruit access strings that describe, but do not name, the land;
    // the ACCESS status already carries their meaning.
    "Private or overhanging property",
    "Reported public access",
    "Public",
    "Private",
    "Private but overhanging",
    // Mineral rule-table placeholder (~61% of MRDS points) and the NPS orchard
    // defaults: status descriptions and agency boilerplate the ACCESS and
    // RULES lines already state, not land names.
    "Private, leased, or claimed ground",
    "National Park Service historic orchard",
    "National Park Service"
  ]);
  const landRow = (properties.accessArea && !GENERIC_AREAS.has(properties.accessArea))
    ? `<div class="row"><span class="lab">LAND</span><span class="val">${escapeHTML(properties.accessArea)}</span></div>`
    : "";
  const saved = isSavedLocation(properties.id);
  // The map-tap card is the primary decision surface: link it to the full
  // profile (identification + toxic lookalikes live there) and give a one-tap,
  // pre-addressed way to report a wrong rule or a dangerous entry.
  const profileHref = `/materials/${escapeHTML(properties.speciesId)}.html`;
  // Subject label carried into the report form (shown to the reporter and used
  // as the email subject); the form itself posts to /api/report.
  const reportSubjectLabel = `${properties.speciesName}${properties.name ? ", " + properties.name : ""}`;

  return `
    <div class="pt-card${compact ? " compact" : ""}" role="dialog" aria-label="${escapeHTML(properties.speciesName)} details" tabindex="-1">
      <div class="spine" style="background:${statusColor}"></div>
      <button class="close" type="button" aria-label="Close">&times;</button>
      <div class="pad">
        <h2>${escapeHTML(properties.speciesName)}</h2>
        <div class="sci">${sci}</div>
        ${eduStamp}
        <div class="row access"><span class="lab">ACCESS</span><span class="val"><span class="ring" style="color:${statusColor}"></span>${accessLabel}</span></div>
        ${landRow}
        <div class="row"><span class="lab">RULES</span><span class="val">${ruleLimit} · ${ruleCite}${ruleNote}</span></div>
        ${safetyRow}
        ${usedPartsRow}
        ${detailRow}
        ${approxNote}
        <div class="row"><span class="lab">SOURCE</span><span class="val">${sourceVal}</span></div>
        ${seasonLine}
        ${flushLine}
        ${ethicNote}
        ${warning}
        ${mineralHazard}
        ${medNote}
      </div>
      <div class="pt-foot">
        <div class="oinp">OCCURRENCE IS NOT PERMISSION, CHECK WHO MANAGES THIS LAND</div>
        <div class="pt-links">
          <a class="pt-link" href="${profileHref}" target="_blank" rel="noopener">Full profile ↗</a>
          <button class="pt-link" type="button" data-report data-report-subject="${escapeHTML(reportSubjectLabel)}" data-report-page="${escapeHTML(profileHref)}">Report an error</button>
        </div>
        <button
          class="save-location-button ${saved ? "is-saved" : ""}"
          type="button"
          data-save-location="${escapeHTML(properties.id)}"
          aria-pressed="${String(saved)}"
        >${saved ? "Saved location" : "Save location"}</button>
        <div class="save-note"${saved ? "" : " hidden"}>In your saved list, open Offline areas (bottom right) to revisit or keep offline.</div>
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
  // The baked iNaturalist manifest supplies the overview aggregate; the live
  // /v1/grid path is inert when USE_BAKED_INATURALIST.
  if (USE_BAKED_INATURALIST) return;
  window.clearTimeout(state.inatAggregateTimer);
  state.inatAggregateTimer = window.setTimeout(loadINaturalistAggregates, INATURALIST_AGGREGATE_DELAY);
}

// Opt-in handoff instrumentation (KNOWN_ISSUES item 1 plan 4): set
// window.FORAGE_DEBUG = true and read window.__handoffLog. Deliberately NOT
// called from the extracted state-machine functions (updateLayerHandoff etc.)
// — scripts/test_zoom_handoff.mjs evals those into a stub sandbox where this
// helper doesn't exist.
function logHandoff(event, extra) {
  if (!window.FORAGE_DEBUG) return;
  const log = (window.__handoffLog = window.__handoffLog || []);
  log.push({
    t: Math.round(performance.now()),
    zoom: state.mapReady ? Number(map.getZoom().toFixed(2)) : null,
    event,
    bridge: state.aggregateBridgeActive,
    pointDataReady: state.pointDataReady,
    aggReady: state.inatAggregateReady,
    ...(extra || {})
  });
}

// True when every aggregate tile the CURRENT view needs is already cached for
// the CURRENT taxon set — the warm case where the aggregate swap can run
// immediately (zero fetches), so the downward handoff needn't wait out the
// schedule debounce (KNOWN_ISSUES item 1 plan 3). A changed taxon set (day
// moved, species toggled while in the point band) is never warm: it must take
// the full gated load path.
function aggregateTilesCachedForView() {
  if (!state.mapReady || state.savedLocationsOnly || !state.statusRaster) return false;
  const selectedSpecies = getSelectedCatalogItems()
    .filter((species) => isSpeciesAvailableOnSelectedDate(species));
  const taxonIds = getINaturalistTaxonIdString(selectedSpecies);
  if (!taxonIds || taxonIds !== state.inatAggregateTaxonKey) return false;
  return getINaturalistAggregateTiles(map.getBounds(), map.getZoom())
    .every((tile) => state.inatAggregateCache.has(getINaturalistAggregateCacheKey(taxonIds, tile)));
}

// Background tile-cache warmer (KNOWN_ISSUES item 1 plan 2): fetch the
// aggregate grid tiles a zoom-out WOULD need before the user zooms out, so
// downward crossings find them cached and the handoff paints immediately.
// Strictly best-effort: concurrency 2 (never competes with foreground loads,
// which run 3-6), results go only into the shared tile cache — no
// state.inatAggregateItems, ready-gate, or paint mutations. Supersession is
// per CHANNEL: a new pan's "band" prefetch cancels the previous pan's (its
// viewport is stale), but the one-shot "boot" region warm and the band warms
// are complementary and must never cancel each other. options.regionWide
// computes tiles from the whole-region bounds regardless of the current
// viewport (a boot restored to a city view would otherwise warm ~2 tiles and
// leave the first zoom-out cold anyway).
async function prefetchINaturalistAggregateTiles(zoomTargets, { channel = "band", regionWide = false } = {}) {
  // The live /v1/grid overview is retired when USE_BAKED_INATURALIST: its warm
  // cache is never read by getAggregateItems (which uses the baked manifest
  // chunks), so warming it fires ~10-20 api.inaturalist.org requests per load
  // whose results are discarded — pure waste, and it re-exposes the rate-limit
  // risk the bake removed. Mirror the scheduleINaturalistAggregateLoad guard.
  if (USE_BAKED_INATURALIST) return;
  if (!state.mapReady || state.savedLocationsOnly) return;
  const selectedSpecies = getSelectedCatalogItems()
    .filter((species) => isSpeciesAvailableOnSelectedDate(species));
  const taxonIds = getINaturalistTaxonIdString(selectedSpecies);
  if (!taxonIds) return;
  const ids = state.aggregatePrefetchIds || (state.aggregatePrefetchIds = {});
  const prefetchId = (ids[channel] || 0) + 1;
  ids[channel] = prefetchId;
  // Statuses are baked into grid items at fetch time — raster first (cached
  // after the boot load, so this usually resolves immediately).
  await loadStatusRaster();
  if (ids[channel] !== prefetchId) return;
  const bounds = regionWide
    ? new mapboxgl.LngLatBounds(REGION_MAX_BOUNDS[0], REGION_MAX_BOUNDS[1])
    : map.getBounds();
  const seen = new Set();
  const missing = [];
  for (const zoom of zoomTargets) {
    for (const tile of getINaturalistAggregateTiles(bounds, zoom)) {
      const key = getINaturalistAggregateCacheKey(taxonIds, tile);
      if (seen.has(key) || state.inatAggregateCache.has(key)) continue;
      seen.add(key);
      missing.push({ tile, key });
    }
  }
  if (!missing.length) return;
  logHandoff("prefetch-start", { channel, tiles: missing.length });
  await mapWithConcurrency(missing, 2, async ({ tile, key }) => {
    if (ids[channel] !== prefetchId) return null;
    if (state.inatAggregateCache.has(key)) return null; // foreground got it
    try {
      const items = await fetchINaturalistAggregateTileWithRetry(taxonIds, tile);
      touchCacheEntry(state.inatAggregateCache, key, items);
    } catch { /* best-effort warm — the foreground path retries on demand */ }
    return null;
  });
  trimCache(state.inatAggregateCache, INATURALIST_AGGREGATE_CACHE_MAX);
  logHandoff("prefetch-done", { channel, tiles: missing.length });
}

async function loadINaturalistAggregates() {
  // Baked overview aggregate: mark ready immediately and let the manifest paint
  // (no live /v1/grid fetch, no deferral gate).
  if (USE_BAKED_INATURALIST) {
    setINaturalistAggregateReady(true);
    updateFallingFruitAggregates();
    return;
  }
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
  // Snapshot the already-cached tiles NOW: a background prefetch's trim could
  // otherwise evict them from the shared LRU while this load awaits its
  // missing fetches, and the swap below would silently drop their cells while
  // still reporting a complete paint.
  const cachedTileItems = new Map();
  const missingTiles = [];
  for (const tile of tiles) {
    const cacheKey = getINaturalistAggregateCacheKey(taxonIds, tile);
    const items = state.inatAggregateCache.get(cacheKey);
    if (items) cachedTileItems.set(cacheKey, items);
    else missingTiles.push(tile);
  }

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
    // Prefer the live cache (fresh fetches from this pass), fall back to the
    // pre-await snapshot for anything evicted mid-flight; failed tiles have
    // neither and stay uncached so the next pass retries them.
    const items = state.inatAggregateCache.get(cacheKey) || cachedTileItems.get(cacheKey);
    if (items) touchCacheEntry(state.inatAggregateCache, cacheKey, items);
    return items || [];
  }));
  trimCache(state.inatAggregateCache, INATURALIST_AGGREGATE_CACHE_MAX);
  logHandoff("agg-swap", { tiles: tiles.length, fetched: missingTiles.length, items: state.inatAggregateItems.length });
  setINaturalistAggregateReady(true);
  updateFallingFruitAggregates();
}

function setINaturalistAggregateReady(ready) {
  state.inatAggregateReady = ready;
  state.aggregateGateStart = ready ? null : performance.now();
}

// Backoff for one retryable fetch step: honor Retry-After on 429/5xx (capped),
// else a jittered default. Retrying a throttling API after a fixed 800ms only
// doubles the pressure exactly when the API is asking for room.
function retryDelayMs(error, fallbackMs = 800) {
  const retryAfter = Number(error?.retryAfterSeconds);
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 15000);
  return fallbackMs + Math.floor(Math.random() * 400);
}

async function fetchINaturalistAggregateTileWithRetry(taxonIds, tile) {
  try {
    return await fetchINaturalistAggregateTile(taxonIds, tile);
  } catch (error) {
    await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs(error)));
    return fetchINaturalistAggregateTile(taxonIds, tile);
  }
}

// The point (viewport-record) path needs the same Retry-After-aware single
// retry the aggregate path has: a classroom sharing one NAT/IP can trip
// iNaturalist's rate limit, and the herbalism map is iNaturalist-only, so an
// un-retried 429 renders it empty for everyone on that connection.
async function fetchINaturalistBoundsWithRetry(taxonIds, bounds) {
  try {
    return await fetchINaturalistBounds(taxonIds, bounds);
  } catch (error) {
    await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs(error)));
    return fetchINaturalistBounds(taxonIds, bounds);
  }
}

function getNonzeroAggregateItems(items) {
  return items.filter((item) => (
    getAggregateRecordCount(item, new Set(), new Set(), false) > 0
  ));
}

async function loadMapData() {
  // Minerals load in full regardless of zoom (static file, no aggregate overview),
  // so they must skip the below-point-band early-return that food/ink rely on.
  if (state.mapReady && !getActiveMapConfig().loadMinerals && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
    // Overview zooms render entirely from aggregate tiles. Loading viewport
    // records here would overwrite the point-band record set with an
    // iNat-only subset (Falling Fruit declines below the point band), so the
    // cluster source — still claimed by loadedPointBounds and shown by the
    // handoff bridge and on re-entry into covered bounds — would suddenly
    // hold a fraction of its points: the "clusters fall off, then recover
    // with a lag" bug. Keep the last point-band records intact instead.
    // Retire a stale point-band record count (it describes a view we just
    // left); loading/outage/error messages keep the line until resolved.
    if (dataStatusKind === "count" || dataStatusKind === "notice") setDataStatus("");
    return;
  }
  const requestId = state.activeRequest + 1;
  state.activeRequest = requestId;
  const config = getActiveMapConfig();
  const loadBounds = state.mapReady ? map.getBounds() : null;
  const loadZoom = state.mapReady ? map.getZoom() : 0;
  const hadRecords = state.records.length > 0;
  if (!hadRecords) setDataStatus("Loading current map data...", { kind: "loading" });

  const [inatResult, fallingFruitResult, npsOrchardResult, mineralResult] = await Promise.allSettled([
    config.loadMinerals ? Promise.resolve([]) : (USE_BAKED_INATURALIST ? loadINaturalistChunks() : loadINaturalist()),
    config.loadFallingFruit ? loadFallingFruit() : Promise.resolve([]),
    config.loadNpsOrchards ? loadNpsOrchards() : Promise.resolve([]),
    config.loadMinerals ? loadMinerals() : Promise.resolve([])
  ]);

  if (requestId !== state.activeRequest) {
    state.settledRequest = Math.max(state.settledRequest, requestId);
    // Superseded mid-flight. Normally the newer request applies instead, but
    // if it parked (early return, rejected manifest) the point band would stay
    // silently empty with no camera event to heal it. Arm one delayed retry
    // that re-checks AT FIRE TIME: if the newer request applied by then
    // (pointDataReady) or is still honestly in flight, it no-ops instead of
    // stacking a redundant remap/render pass on top of a healthy load.
    if (!state.pointDataReady && loadZoom >= FALLING_FRUIT_MIN_LOAD_ZOOM) {
      window.setTimeout(() => {
        if (!state.pointDataReady
          && state.activeRequest === state.settledRequest
          && state.mapReady && map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) {
          loadMapData();
        }
      }, DATA_REFRESH_DELAY);
    }
    return;
  }
  state.settledRequest = Math.max(state.settledRequest, requestId);

  if (USE_BAKED_INATURALIST) {
    // Baked chunk records are already viewport-scoped; no live record cache.
    state.inatRecords = inatResult.status === "fulfilled"
      ? inatResult.value
      : (state.inatChunkRecords || []);
  } else {
    if (inatResult.status === "fulfilled") {
      inatResult.value.forEach((record) => touchCacheEntry(state.inatRecordCache, record.id, record));
      trimCache(state.inatRecordCache, INATURALIST_RECORD_CACHE_MAX);
    }
    state.inatRecords = getCachedINaturalistRecordsInBounds();
  }

  const fallingFruitRecords = fallingFruitResult.status === "fulfilled"
    ? fallingFruitResult.value
    : state.fallingFruitRecords || [];
  const npsOrchardRecords = npsOrchardResult.status === "fulfilled"
    ? npsOrchardResult.value
    : state.npsOrchardRecords || [];
  const mineralRecords = mineralResult.status === "fulfilled"
    ? mineralResult.value
    : state.mineralRecords || [];
  const nextRecords = [...state.inatRecords, ...fallingFruitRecords, ...npsOrchardRecords, ...mineralRecords];

  state.records = nextRecords;
  renderMarkers();
  // Re-render the histogram and cluster tint now that records have arrived.
  // renderMarkers alone updates the point source, but the minerals histogram
  // counts from state.records (empty at mode-open), so without this it stayed
  // blank until the slider forced a full render(); the cluster tint likewise
  // needs a repaint once the freshly-loaded features are in the source.
  renderHistogram();
  updateClusterTint();
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
  // Minerals show clusters at every zoom, but the mode-switch handoff ran while
  // state.records was still empty, leaving the cluster layers hidden. Below the
  // point band nothing else re-runs the handoff without a zoom event, so the
  // map sat blank until the first zoom. Re-run it now that the records landed.
  if (state.mapReady && config.loadMinerals) updateLayerHandoff();

  const failedSources = [
    inatResult.status === "rejected" ? "iNaturalist" : "",
    config.loadFallingFruit && fallingFruitResult.status === "rejected" ? "Falling Fruit" : "",
    config.loadNpsOrchards && npsOrchardResult.status === "rejected" ? "NPS orchards" : "",
    config.loadMinerals && mineralResult.status === "rejected" ? "USGS MRDS" : ""
  ].filter(Boolean);
  if (failedSources.length) {
    // Source outages stay visible — the map is silently partial otherwise.
    setDataStatus(`${state.records.length} records loaded; ${failedSources.join(", ")} unavailable`, { kind: "outage" });
  } else {
    // Hand the line to the persistent in-view count (it was blocked while the
    // sticky loading message owned the line).
    setDataStatus("", { kind: "idle" });
    updateRecordCountStatus();
  }
  logHandoff("points-loaded", { records: state.records.length });

  // While the user sits in the point band, warm the aggregate tiles a
  // zoom-out from HERE would need (gz6 for the first landing band under 8;
  // gz4 whole-region is usually already warm from boot and dedups to zero).
  // Cache-dedup'd, concurrency 2 — repeats after ordinary pans cost nothing.
  if (state.mapReady && !config.loadMinerals && map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM) {
    prefetchINaturalistAggregateTiles([7, 4]);
  }
}

async function loadINaturalist() {
  const selectedSpecies = getSelectedCatalogItems()
    .filter((species) => isSpeciesAvailableOnSelectedDate(species));

  const taxonIds = getINaturalistTaxonIdString(selectedSpecies);

  if (!taxonIds) return [];

  const bounds = map.getBounds();
  const tiles = getINaturalistRequestBounds(bounds, map.getZoom());
  // Same politeness as the aggregate path: capped concurrency instead of firing
  // every viewport tile at once (a classroom of panning students is the
  // realistic burst case against iNaturalist's published rate guidance).
  const results = await mapWithConcurrency(tiles, 4, (tile) => fetchINaturalistBoundsWithRetry(taxonIds, tile));
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
  if (!response.ok) {
    const error = new Error(`iNaturalist returned ${response.status}`);
    error.retryAfterSeconds = Number(response.headers.get("retry-after"));
    throw error;
  }
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
  if (!response.ok) {
    const error = new Error(`iNaturalist grid returned ${response.status}`);
    error.retryAfterSeconds = Number(response.headers.get("retry-after"));
    throw error;
  }
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
      const modeAgg = bucket.statusAgg[mode] || (bucket.statusAgg[mode] = {});
      const addPortion = (status, portion) => {
        if (!portion) return;
        const statusBucket = modeAgg[status] || (modeAgg[status] = { count: 0, weightedLng: 0, weightedLat: 0 });
        statusBucket.count += portion;
        statusBucket.weightedLng += lng * portion;
        statusBucket.weightedLat += lat * portion;
      };
      // Thin-park apportioning (KNOWN_ISSUES 1b): cells that straddle a permission
      // boundary carry per-status area fractions (`fr`), so split the cell count
      // across statuses by area share instead of assigning all of it to the
      // single centre-point status. Uniform cells have no `fr` and behave as before.
      const fractions = rasterEntry?.fr?.[mode];
      if (fractions) {
        Object.entries(fractions).forEach(([status, share]) => addPortion(status, count * share));
      } else {
        addPortion(rasterEntry?.[mode] || "unknown", count);
      }
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

  // Tolerate per-chunk failures: offline with a saved area, chunks outside the
  // save are absent by design — render the chunks that DID resolve instead of
  // letting one miss blank the whole layer. Only when every chunk fails do we
  // rethrow, preserving the online "Falling Fruit unavailable" reporting.
  const results = await Promise.allSettled(chunks.map(loadFallingFruitChunk));
  if (results.length && results.every((r) => r.status === "rejected")) {
    throw results[0].reason;
  }
  state.fallingFruitRecords = chunks
    .flatMap((chunk) => state.fallingFruitChunkCache.get(chunk.id) || [])
    .filter((record) => recordInBounds(record, bounds))
    .map(mapFallingFruitRecord)
    .filter(Boolean);
  return state.fallingFruitRecords;
}

let fallingFruitManifestLoad = null;
async function getFallingFruitManifest() {
  if (state.fallingFruitManifest) return state.fallingFruitManifest;
  // Share one in-flight fetch: the offline panel's estimate and the map load
  // can race here, and the manifest is ~1.9 MB — never download it twice.
  if (!fallingFruitManifestLoad) {
    fallingFruitManifestLoad = (async () => {
      const response = await fetch(FALLING_FRUIT_MANIFEST_URL);
      if (!response.ok) throw new Error(`Falling Fruit manifest returned ${response.status}`);
      state.fallingFruitManifest = await response.json();
      return state.fallingFruitManifest;
    })();
    fallingFruitManifestLoad.catch(() => { fallingFruitManifestLoad = null; });
  }
  return fallingFruitManifestLoad;
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

// ---------------------------------------------------------------------------
// Baked iNaturalist chunk loader (the analog of the Falling Fruit loader above,
// active only when USE_BAKED_INATURALIST). Each row carries an anchor taxon id
// resolved to the active-mode species; access resolves through the same rule
// engine + baked manifest accessCounts as Falling Fruit.
// ---------------------------------------------------------------------------
let inatChunkManifestLoad = null;
async function getInatChunkManifest() {
  if (state.inatChunkManifest) return state.inatChunkManifest;
  if (!inatChunkManifestLoad) {
    inatChunkManifestLoad = (async () => {
      // priority: "low" keeps this 3.9 MB (gz) / ~18 MB manifest from
      // outcompeting basemap tiles + app.js on first paint; the overview
      // aggregate can lag the basemap by a beat. The main-thread JSON.parse
      // (~160 ms desktop, more on mobile) remains the durable cost to address
      // bake-side (a leaner overview manifest); see docs TODO.
      const response = await fetch(INATURALIST_MANIFEST_URL, { priority: "low" });
      if (!response.ok) throw new Error(`iNaturalist manifest returned ${response.status}`);
      state.inatChunkManifest = await response.json();
      return state.inatChunkManifest;
    })();
    inatChunkManifestLoad.catch(() => { inatChunkManifestLoad = null; });
  }
  return inatChunkManifestLoad;
}

async function loadINaturalistChunks() {
  if (state.mapReady && map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM) {
    state.inatChunkRecords = [];
    return [];
  }
  const manifest = await getInatChunkManifest();
  const bounds = map.getBounds();
  let chunks = (manifest.chunks || []).filter((chunk) => bboxIntersectsBounds(chunk.bbox, bounds));
  if (!chunks.length) {
    state.inatChunkRecords = [];
    return [];
  }
  if (chunks.length > FALLING_FRUIT_MAX_VIEWPORT_CHUNKS) {
    const center = bounds.getCenter();
    chunks = [...chunks]
      .sort((a, b) => getChunkCenterDistance(a, center) - getChunkCenterDistance(b, center))
      .slice(0, FALLING_FRUIT_MAX_VIEWPORT_CHUNKS);
  }
  const results = await Promise.allSettled(chunks.map(loadINaturalistChunk));
  if (results.length && results.every((result) => result.status === "rejected")) {
    throw results[0].reason;
  }
  state.inatChunkRecords = chunks
    .flatMap((chunk) => state.inatChunkCache.get(chunk.id) || [])
    .filter((record) => recordInBounds(record, bounds))
    .map(mapInatChunkRecord)
    .filter(Boolean);
  return state.inatChunkRecords;
}

async function loadINaturalistChunk(chunk) {
  if (state.inatChunkCache.has(chunk.id)) {
    touchCacheEntry(state.inatChunkCache, chunk.id, state.inatChunkCache.get(chunk.id));
    return;
  }
  const inFlight = state.inatChunkLoads.get(chunk.id);
  if (inFlight) return inFlight;
  const request = (async () => {
    const response = await fetch(chunk.path);
    if (!response.ok) throw new Error(`iNaturalist chunk ${chunk.id} returned ${response.status}`);
    const rows = await response.json();
    const fields = state.inatChunkManifest?.recordFields || [];
    state.inatChunkCache.set(chunk.id, rows.map((row) => expandFallingFruitRecord(row, fields)));
    trimCache(state.inatChunkCache, INATURALIST_CHUNK_CACHE_MAX);
  })();
  state.inatChunkLoads.set(chunk.id, request);
  try {
    await request;
  } finally {
    state.inatChunkLoads.delete(chunk.id);
  }
}

function mapInatChunkRecord(record) {
  const species = getActiveInatAnchorSpeciesMap().get(Number(record.anchor));
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!species || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: `inat-${record.id}`,
    speciesId: species.id,
    name: observationPlaceLabel(record) || species.commonName,
    observedName: species.commonName,
    observedScientificName: species.scientificName,
    lat,
    lng,
    // Drives the "APPROXIMATE, iNaturalist obscured this location" badge for
    // observer-obscured points (baked from GBIF informationWithheld).
    approximate: Boolean(Number(record.approximate)),
    source: "inaturalist",
    note: `Research-grade iNaturalist observation ${record.id}${record.idDate ? `, observed ${record.idDate}` : ""}.`,
    confidence: "research",
    idDate: record.idDate || "",
    observer: record.observer || "",
    sourceUrl: `https://www.inaturalist.org/observations/${record.id}`,
    accessClass: "unknown",
    publicLand: false,
    // No boilerplate access note: on the card it only restated what the ACCESS
    // status, the "Access not sourced" citation, and the footer caution
    // already say (iNaturalist records never carry contributor access notes).
    accessNote: ""
  };
}

function observationPlaceLabel(record) {
  // Baked rows carry no place_guess; use the observer login as a light label so
  // the card has a source line, matching the live card's observer credit.
  return record.observer ? `Observed by ${record.observer}` : "";
}

// ---------------------------------------------------------------------------
// "Save this area" — user-triggered offline caching (Phase 5.5).
//
// Saves the Falling Fruit chunk files covering the current viewport (plus the
// manifest + status raster the app needs to boot the layer cold) into the
// version-stable SAVED_AREAS_CACHE_NAME cache, which sw.js reads as its
// OFFLINE fallback only — online sessions always prefer network-fresh data, so
// a months-old save can never shadow updated access rules. Saved records keep
// the access status baked into each chunk row (accessClass / publicLand /
// accessNote), so the rules layer works in the field without a signal. The
// basemap is deliberately NOT bulk-prefetched (Mapbox GL JS terms); browsing
// the area online opportunistically caches its tiles (see sw.js).
// ---------------------------------------------------------------------------
function readSavedAreas() {
  try {
    const stored = JSON.parse(window.localStorage?.getItem(SAVED_AREAS_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((area) => area && typeof area.id === "string" && Array.isArray(area.chunkIds))
      // Areas saved before iNaturalist chunks were cached have no inatChunkIds.
      .map((area) => (Array.isArray(area.inatChunkIds) ? area : { ...area, inatChunkIds: [] }));
  } catch {
    return [];
  }
}

function persistSavedAreas() {
  try {
    window.localStorage?.setItem(SAVED_AREAS_STORAGE_KEY, JSON.stringify(state.savedAreas));
  } catch { /* quota / private mode — keep the in-memory list */ }
}

function savedAreaChunkPath(chunkId) {
  return `./data/falling-fruit/us/chunks/${chunkId}.json`;
}

// iNaturalist chunk ids share the Falling Fruit filename format but live in a
// separate tree (and use a different grid), so they are tracked and pathed
// separately in the saved-area registry.
function savedAreaInatChunkPath(chunkId) {
  return `./data/inaturalist/us/chunks/${chunkId}.json`;
}

// Cross-tab mutual exclusion for SAVED_AREAS_CACHE writers. The in-memory
// state.savedAreaBusy flag only covers THIS tab; without a lock, a startup
// reconcile in a fresh tab could delete chunks a save in another tab has
// written but not yet registered. Web Locks are origin-scoped in all current
// engines; where unavailable, callers run unguarded (single-tab semantics,
// the pre-lock behavior).
const SAVED_AREAS_LOCK = "craftalmanac-saved-areas";

// Resolves to a release function once the lock is held (waits for holders).
function acquireSavedAreasLock() {
  if (!navigator.locks?.request) return Promise.resolve(() => {});
  return new Promise((resolveAcquire) => {
    let releaseResolve;
    const released = new Promise((resolve) => { releaseResolve = resolve; });
    navigator.locks.request(SAVED_AREAS_LOCK, () => {
      resolveAcquire(releaseResolve);
      return released;
    }).catch(() => resolveAcquire(() => {}));
  });
}

function formatSavedBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

// The chunks a save of the CURRENT viewport would cover — also drives the
// panel's pre-save estimate line, so the button and the save agree exactly.
// The FF + iNaturalist chunks a save of the current viewport would cover. A save
// caches both trees so every material map (Food, Ink, and Herbs) works offline
// in the saved area, not just the ones backed by Falling Fruit.
async function getSaveableAreaChunks() {
  const bounds = map.getBounds();
  const ffManifest = await getFallingFruitManifest();
  const ff = getVisibleFallingFruitChunks(ffManifest, bounds);
  let inat = [];
  if (USE_BAKED_INATURALIST) {
    const inatManifest = await getInatChunkManifest();
    inat = (inatManifest.chunks || []).filter((chunk) => bboxIntersectsBounds(chunk.bbox, bounds));
  }
  return { ff, inat, count: ff.length + inat.length };
}

async function saveCurrentOfflineArea() {
  if (state.savedAreaBusy) return;
  // Claim the busy flag SYNCHRONOUSLY — every await below is a window where a
  // second tap could otherwise start a concurrent save.
  const busy = { done: 0, total: 0, bytes: 0, chunkBytes: 0, failed: 0 };
  state.savedAreaBusy = busy;
  let notice = null;
  let releaseSavedAreasLock = () => {};
  try {
    // Cross-tab guard: hold the writers' lock for the whole write + register
    // sequence so another tab's reconcile can't collect our chunks mid-save.
    releaseSavedAreasLock = await acquireSavedAreasLock();
    if (navigator.onLine === false) {
      notice = "You're offline, connect to save an area.";
      return;
    }
    let saveable;
    try {
      saveable = await getSaveableAreaChunks();
    } catch {
      notice = "Couldn't load the site catalog, check your connection and try again.";
      return;
    }
    if (!saveable.count) {
      notice = "No catalogued sites in this view. Pan or zoom to the area you want to save.";
      return;
    }
    if (saveable.count > SAVE_AREA_MAX_CHUNKS) {
      notice = `This view spans ${saveable.count} files, zoom in to a smaller area (limit ${SAVE_AREA_MAX_CHUNKS}).`;
      return;
    }

    // Ask the browser not to evict field data under storage pressure. Best-effort.
    try { navigator.storage?.persist?.(); } catch { /* unsupported */ }

    const bounds = map.getBounds();
    const supportFiles = [FALLING_FRUIT_MANIFEST_URL, STATUS_RASTER_URL];
    // The iNaturalist manifest is needed to boot its chunks offline.
    if (USE_BAKED_INATURALIST && saveable.inat.length) supportFiles.push(INATURALIST_MANIFEST_URL);
    busy.total = saveable.count + supportFiles.length;
    renderOfflinePanel();

    const cache = await caches.open(SAVED_AREAS_CACHE_NAME);
    const fetchIntoCache = async (url, isChunk) => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          // cache:"no-cache" makes this save-time FRESH: the SW bypasses its
          // runtime cache for it (see sameOriginCacheFirst) and the HTTP cache
          // revalidates — a save must snapshot today's data, not whatever bytes
          // happened to be cached since the last deploy.
          const response = await fetch(url, { cache: "no-cache" });
          if (!response.ok) throw new Error(`${url}: ${response.status}`);
          const buffer = await response.arrayBuffer();
          await cache.put(url, new Response(buffer, { headers: { "Content-Type": "application/json" } }));
          busy.bytes += buffer.byteLength;
          if (isChunk) busy.chunkBytes += buffer.byteLength;
          return true;
        } catch (err) {
          // Storage-full is not a connectivity problem — flag it so the
          // failure notice tells the user to free space, and skip the retry
          // (repeating a quota-rejected put is futile).
          if (err && err.name === "QuotaExceededError") {
            busy.quota = true;
            return false;
          }
          if (attempt === 1) return false;
        }
      }
      return false;
    };
    const step = (ok) => {
      busy.done += 1;
      if (!ok) busy.failed += 1;
      // Re-render every few files so progress reads live without thrashing.
      if (busy.done % 5 === 0 || busy.done === busy.total) renderOfflinePanel();
      announceOffline(`Saving ${busy.done} of ${busy.total} files`);
    };

    for (const url of supportFiles) step(await fetchIntoCache(url, false));
    await mapWithConcurrency([...saveable.ff, ...saveable.inat], SAVE_AREA_FETCH_CONCURRENCY, async (chunk) => {
      step(await fetchIntoCache(chunk.path, true));
    });

    if (busy.failed > 0) {
      // Nothing was registered — evict this attempt's chunks so the
      // never-rotating cache doesn't accumulate orphans (keep any chunk an
      // existing saved area still claims). FF and iNat chunk ids share a
      // filename format, so claim-check each tree against its own registry set.
      const ffClaimed = new Set(state.savedAreas.flatMap((area) => area.chunkIds));
      const inatClaimed = new Set(state.savedAreas.flatMap((area) => area.inatChunkIds || []));
      for (const chunk of saveable.ff) {
        if (!ffClaimed.has(chunk.id)) await cache.delete(chunk.path);
      }
      for (const chunk of saveable.inat) {
        if (!inatClaimed.has(chunk.id)) await cache.delete(chunk.path);
      }
      if (!state.savedAreas.length) {
        await cache.delete(FALLING_FRUIT_MANIFEST_URL);
        await cache.delete(STATUS_RASTER_URL);
        await cache.delete(INATURALIST_MANIFEST_URL);
      }
      notice = busy.quota
        ? "Browser storage is full, remove a saved area or free space, then try again."
        : `${busy.failed} of ${busy.total} files failed, nothing was saved. Check your connection and try again.`;
      return;
    }
    const center = bounds.getCenter();
    const areaId = `area-${Date.now().toString(36)}`;
    state.savedAreas.push({
      id: areaId,
      savedAt: new Date().toISOString(),
      bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      center: [Number(center.lng.toFixed(4)), Number(center.lat.toFixed(4))],
      zoom: Number(map.getZoom().toFixed(2)),
      chunkIds: saveable.ff.map((chunk) => chunk.id),
      inatChunkIds: saveable.inat.map((chunk) => chunk.id),
      records: [...saveable.ff, ...saveable.inat].reduce((sum, chunk) => sum + (chunk.recordCount || 0), 0),
      // Chunk bytes only: the shared manifests + raster are SHARED across areas
      // (one cache entry each), so counting them per-area would double-book.
      bytes: busy.chunkBytes
    });
    persistSavedAreas();
    // Read the registry back: if this browser silently refused the write
    // (private mode, quota), the save still works for THIS session — the
    // cache holds the bytes and the in-memory list knows them — but it will
    // be forgotten on the next visit (and its chunks reclaimed by the
    // startup reconcile). Say so instead of promising persistence.
    const remembered = readSavedAreas().some((area) => area.id === areaId);
    notice = remembered
      ? "Saved. These sites now work without a signal, browse the area once online so the basemap keeps its tiles too."
      : "Saved for this session, but this browser isn't remembering saved areas (private mode or blocked storage), the save will be gone on your next visit.";
  } catch {
    // Unexpected failure (Cache API denied, private mode): say SOMETHING —
    // the panel resetting silently would read as a broken button — and don't
    // leak an unhandled rejection to the click handler.
    notice = "Saving failed, this browser may be blocking offline storage (private mode?).";
  } finally {
    // ALWAYS clear the busy flag — an unexpected throw (caches.open denied,
    // quota, private mode) must not wedge the panel at "Saving…" forever.
    releaseSavedAreasLock();
    state.savedAreaBusy = null;
    renderOfflinePanel(notice ? { notice } : {});
    if (notice) announceOffline(notice);
  }
}

async function removeSavedArea(areaId) {
  // Never evict while a save is writing — the in-flight save may be about to
  // claim chunks this removal would delete (its Remove buttons render disabled
  // too; this guard covers keyboard/scripted paths).
  if (state.savedAreaBusy) return;
  const area = state.savedAreas.find((entry) => entry.id === areaId);
  if (!area) return;
  state.savedAreas = state.savedAreas.filter((entry) => entry.id !== areaId);
  persistSavedAreas();
  renderOfflinePanel();
  let releaseSavedAreasLock = () => {};
  try {
    releaseSavedAreasLock = await acquireSavedAreasLock();
    const cache = await caches.open(SAVED_AREAS_CACHE_NAME);
    // Only evict chunks no other saved area still claims. FF and iNat are
    // tracked separately (shared filename format, different trees).
    const stillClaimed = new Set(state.savedAreas.flatMap((entry) => entry.chunkIds));
    for (const chunkId of area.chunkIds) {
      if (!stillClaimed.has(chunkId)) await cache.delete(savedAreaChunkPath(chunkId));
    }
    const stillClaimedInat = new Set(state.savedAreas.flatMap((entry) => entry.inatChunkIds || []));
    for (const chunkId of (area.inatChunkIds || [])) {
      if (!stillClaimedInat.has(chunkId)) await cache.delete(savedAreaInatChunkPath(chunkId));
    }
    if (!state.savedAreas.length) {
      await cache.delete(FALLING_FRUIT_MANIFEST_URL);
      await cache.delete(STATUS_RASTER_URL);
      await cache.delete(INATURALIST_MANIFEST_URL);
    }
  } catch { /* cache API unavailable — registry is already updated */ } finally {
    releaseSavedAreasLock();
  }
}

// --- Offline panel UI (toggled from the bottom-right map control) ------------
function isOfflinePanelOpen() {
  return !!offlinePanel && !offlinePanel.hidden;
}

function positionOfflinePanel() {
  if (!offlinePanel) return;
  // Sit just above the bottom-right control cluster, tracking whatever offset
  // the season bar currently imposes on it (see initMapControlsOffset).
  const ctrlCluster = document.querySelector(".mapboxgl-ctrl-bottom-right");
  const gap = 10;
  const clusterTop = ctrlCluster ? ctrlCluster.getBoundingClientRect().top : window.innerHeight - 180;
  const bottom = Math.max(90, Math.round(window.innerHeight - clusterTop + gap));
  offlinePanel.style.bottom = `${bottom}px`;
  // Cap the height to the space actually left between the masthead and the
  // cluster — on phones the raised cluster leaves little room, and an uncapped
  // panel clips its header (and eventually the save button) off-screen.
  const mastheadClearance = 84;
  offlinePanel.style.maxHeight = `${Math.max(180, Math.round(clusterTop - gap - mastheadClearance))}px`;
}

function toggleOfflinePanel(forceOpen) {
  if (!offlinePanel) return;
  const open = typeof forceOpen === "boolean" ? forceOpen : offlinePanel.hidden;
  offlinePanel.hidden = !open;
  offlineCtrlButton?.setAttribute("aria-expanded", String(open));
  if (open) {
    positionOfflinePanel();
    renderOfflinePanel();
  }
}

// Screen-reader announcements survive the panel's wholesale innerHTML rebuilds
// because the live region lives OUTSIDE the panel (index.html #offlineLive).
function announceOffline(message) {
  const live = document.querySelector("#offlineLive");
  if (live) live.textContent = message;
}

async function renderOfflinePanel(options = {}) {
  if (!offlinePanel || offlinePanel.hidden) return;
  const busy = state.savedAreaBusy;
  const offline = navigator.onLine === false;

  // First paint synchronously — the estimate below may need the ~1.9 MB
  // manifest, and an empty panel that stays blank for seconds reads as broken.
  if (!offlinePanel.innerHTML) {
    offlinePanel.innerHTML = `<div class="k">OFFLINE AREAS</div><p class="off-lede">Sizing up this view…</p>`;
  }

  // Pre-save estimate for the current view (skipped mid-save and offline).
  let estimate = null;
  if (!busy && !offline) {
    try {
      const saveable = await getSaveableAreaChunks();
      const savesInat = USE_BAKED_INATURALIST && saveable.inat.length > 0;
      let catalogSaved = false;
      try {
        const savedCache = await caches.open(SAVED_AREAS_CACHE_NAME);
        catalogSaved = !!(await savedCache.match(FALLING_FRUIT_MANIFEST_URL))
          && (!savesInat || !!(await savedCache.match(INATURALIST_MANIFEST_URL)));
      } catch { /* Cache API unavailable — assume first save */ }
      const bytes = saveable.ff.length * SAVE_AREA_APPROX_CHUNK_BYTES
        + saveable.inat.length * SAVE_AREA_APPROX_INAT_CHUNK_BYTES;
      estimate = { count: saveable.count, bytes, catalogSaved, savesInat };
    } catch { estimate = null; }
  }

  const rows = [];
  rows.push(`<div class="k">OFFLINE AREAS<button class="off-close" type="button" aria-label="Close">&times;</button></div>`);
  rows.push(`<p class="off-lede">Save the catalogued sites in the current view, so the map still knows them where there's no signal.</p>`);

  if (busy) {
    rows.push(`<div class="off-progress" role="status">Saving… ${busy.done}/${busy.total} files · ${formatSavedBytes(busy.bytes)}</div>`);
  } else {
    let disabled = "";
    let hint = "";
    if (offline) {
      disabled = "disabled";
      hint = "You're offline, saved areas below still work.";
    } else if (estimate && estimate.count === 0) {
      disabled = "disabled";
      hint = "No catalogued sites in this view, pan or zoom first.";
    } else if (estimate && estimate.count > SAVE_AREA_MAX_CHUNKS) {
      disabled = "disabled";
      hint = `This view spans ${estimate.count} files, zoom in to a smaller area (limit ${SAVE_AREA_MAX_CHUNKS}).`;
    } else if (estimate) {
      // Shared catalog = FF manifest + status raster (~5.4 MB), plus the
      // iNaturalist manifest (~17 MB) when the view has iNaturalist chunks.
      const sharedCatalog = estimate.savesInat ? "~22 MB" : "~5.4 MB";
      const catalogNote = estimate.catalogSaved ? "" : ` + ${sharedCatalog} shared catalog on the first save`;
      hint = `≈ ${estimate.count} site files · ~${formatSavedBytes(estimate.bytes)}${catalogNote}.`;
    }
    rows.push(`<button class="off-save" id="offlineSaveBtn" type="button" ${disabled}>Save this view</button>`);
    if (hint) rows.push(`<div class="off-hint">${escapeHTML(hint)}</div>`);
  }

  if (options.notice) {
    rows.push(`<div class="off-notice" role="status">${escapeHTML(options.notice)}</div>`);
  }

  if (state.savedAreas.length) {
    rows.push(`<div class="off-list-label">SAVED</div>`);
    for (const area of state.savedAreas) {
      const when = new Date(area.savedAt);
      const dateLabel = Number.isNaN(when.getTime()) ? "" : `${FULL_MONTHS[when.getMonth()]} ${when.getDate()}`;
      const centerLabel = Array.isArray(area.center) ? `${area.center[1].toFixed(2)}, ${area.center[0].toFixed(2)}` : "";
      rows.push(`
        <div class="off-area" data-area="${escapeHTML(area.id)}">
          <button class="off-goto" type="button" data-goto-area="${escapeHTML(area.id)}" title="Fly to this area">
            <span class="off-area-t">${escapeHTML(dateLabel)} · ${escapeHTML(centerLabel)}</span>
            <span class="off-area-m">${area.records.toLocaleString()} sites · ${formatSavedBytes(area.bytes)}</span>
          </button>
          <button class="off-remove" type="button" data-remove-area="${escapeHTML(area.id)}" aria-label="Remove this saved area"${busy ? " disabled" : ""}>Remove</button>
        </div>`);
    }
  }

  // Honest scope notes — what offline does and does not cover. Saves store the
  // Falling Fruit + iNaturalist chunks, covering the Food, Ink & Dye, and Herbs
  // maps; minerals are a separate national dataset that only caches as viewed.
  const modeNote = state.activeMap === "minerals"
    ? `<div>Mineral localities are their own national dataset (cached once viewed); saves cover the Food, Ink &amp; Dye, and Herbs site catalogs.</div>`
    : "";
  rows.push(`<div class="off-notes">
    ${modeNote}
    <div>Saved sites keep their access status. The public-land shading layer needs a connection.</div>
    <div>The basemap keeps only tiles you browse while online, pan the area once before you go.</div>
    <div>Occurrence is never permission.</div>
  </div>`);

  if (navigator.storage?.estimate) {
    try {
      const { usage } = await navigator.storage.estimate();
      if (Number.isFinite(usage)) rows.push(`<div class="off-storage">Browser storage in use: ${formatSavedBytes(usage)}</div>`);
    } catch { /* unsupported */ }
  }

  offlinePanel.innerHTML = rows.join("");
}

function initOfflineAreas() {
  if (!offlinePanel) return;

  // Bottom-right map control (next to zoom/geolocate): toggles the panel.
  class OfflineAreaControl {
    onAdd() {
      this._container = document.createElement("div");
      this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "offline-ctrl-btn";
      button.setAttribute("aria-label", "Offline areas, save this view for field use");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v10"></path><path d="M8 9l4 4 4-4"></path><path d="M4 17h16"></path><path d="M4 21h16"></path></svg>`;
      button.addEventListener("click", () => toggleOfflinePanel());
      offlineCtrlButton = button;
      this._container.appendChild(button);
      return this._container;
    }
    onRemove() {
      this._container?.remove();
    }
  }
  map.addControl(new OfflineAreaControl(), "bottom-right");

  offlinePanel.addEventListener("click", (event) => {
    if (event.target.closest(".off-close")) { toggleOfflinePanel(false); return; }
    if (event.target.closest("#offlineSaveBtn")) { saveCurrentOfflineArea(); return; }
    const goto = event.target.closest("[data-goto-area]");
    if (goto) {
      const area = state.savedAreas.find((entry) => entry.id === goto.dataset.gotoArea);
      if (area && Array.isArray(area.center)) {
        map.flyTo({ center: area.center, zoom: area.zoom || 10 });
        toggleOfflinePanel(false);
      }
      return;
    }
    const remove = event.target.closest("[data-remove-area]");
    if (remove) removeSavedArea(remove.dataset.removeArea);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOfflinePanelOpen()) return;
    // Only close when this panel is the topmost layer — a sheet (z-index 30)
    // or an open masthead drop-down owns Escape while it covers the panel.
    if (document.querySelector("#sheet-wrap.open")) return;
    if (typeof currentMastPanel === "function" && currentMastPanel()) return;
    toggleOfflinePanel(false);
  });
  // Keep the pre-save estimate honest as the user pans with the panel open.
  map.on("moveend", () => { if (isOfflinePanelOpen() && !state.savedAreaBusy) renderOfflinePanel(); });
  window.addEventListener("resize", () => { if (isOfflinePanelOpen()) positionOfflinePanel(); });
  window.addEventListener("online", () => { if (isOfflinePanelOpen()) renderOfflinePanel(); });
  window.addEventListener("offline", () => { if (isOfflinePanelOpen()) renderOfflinePanel(); });
  reconcileSavedAreaCache();
}

// One-time startup reconcile. The chunk bytes live in SAVED_AREAS_CACHE_NAME
// (deliberately never rotated by deploys) while the user-visible listing
// lives in localStorage — if a persist write was ever swallowed (private
// mode, quota) or a save crashed mid-flight, its entries would sit in the
// cache invisibly and permanently, with no UI path to remove them. Delete
// whatever the registry doesn't claim; drop the shared manifest + raster
// once no areas remain. sw.js only READS this cache, so removing
// unregistered entries cannot break anything. Bails whenever a save is in
// flight so it never deletes chunks a running save just wrote.
async function reconcileSavedAreaCache() {
  if (!("caches" in window)) return;
  try {
    if (state.savedAreaBusy) return;
    // Cross-tab guard: only reconcile while holding the writers' lock, and
    // skip entirely if any tab's save currently holds it. Where Web Locks
    // are unavailable, fall back to the per-tab busy checks below.
    const run = async () => {
      if (state.savedAreaBusy) return;
      const cache = await caches.open(SAVED_AREAS_CACHE_NAME);
      const keys = await cache.keys();
      // Re-read the registry INSIDE the lock: another tab's completed save
      // lives in localStorage but not in this tab's boot-time snapshot.
      const registries = [...state.savedAreas, ...readSavedAreas()];
      const ffClaimed = new Set(registries.flatMap((area) => area.chunkIds));
      const inatClaimed = new Set(registries.flatMap((area) => area.inatChunkIds || []));
      const anySaved = registries.length > 0;
      const sharedPaths = new Set([
        new URL(FALLING_FRUIT_MANIFEST_URL, window.location.href).pathname,
        new URL(STATUS_RASTER_URL, window.location.href).pathname,
        new URL(INATURALIST_MANIFEST_URL, window.location.href).pathname
      ]);
      for (const request of keys) {
        if (state.savedAreaBusy) return; // a save started mid-reconcile — stop
        const pathname = new URL(request.url).pathname;
        if (sharedPaths.has(pathname)) {
          if (!anySaved) await cache.delete(request);
          continue;
        }
        // FF and iNat chunk ids share a filename format; match on the tree.
        const inatMatch = /\/inaturalist\/us\/chunks\/([^/]+)\.json$/.exec(pathname);
        if (inatMatch) {
          if (!inatClaimed.has(inatMatch[1])) await cache.delete(request);
          continue;
        }
        const ffMatch = /\/falling-fruit\/us\/chunks\/([^/]+)\.json$/.exec(pathname);
        if (ffMatch && ffClaimed.has(ffMatch[1])) continue;
        await cache.delete(request);
      }
    };
    if (navigator.locks?.request) {
      await navigator.locks.request(SAVED_AREAS_LOCK, { ifAvailable: true }, (lock) => (lock ? run() : null));
    } else {
      await run();
    }
  } catch { /* Cache API unavailable/denied — nothing to reconcile */ }
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

async function loadMinerals() {
  // Static, viewport-independent set (a curated regional subset), loaded once and
  // cached — the analogue of loadNpsOrchards for the Minerals mode. Localities are
  // USGS MRDS points; rules are baked per-record (see computeRecordAccessRule).
  if (!state.mineralData) {
    const response = await fetch("./data/minerals-us.json");
    if (!response.ok) throw new Error(`Minerals returned ${response.status}`);
    state.mineralData = await response.json();
  }
  state.mineralRecords = state.mineralData
    .map(mapMineralRecord)
    .filter(Boolean);
  return state.mineralRecords;
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

  // iNaturalist obscures coordinates in two distinct ways, and we treat them
  // differently on a harvest map:
  //  - taxon_geoprivacy "obscured"/"private" is CONSERVATION obscuration applied
  //    automatically to threatened/sensitive taxa specifically to keep collectors
  //    away. Re-plotting those points on a foraging map works against the reason
  //    they were obscured, so we drop them entirely.
  //  - user geoprivacy (geoprivacy "obscured"/"private", or the derived
  //    `obscured` flag) randomizes the point within a ~0.2° (~20–30 km) cell. We
  //    keep those as occurrence hints but flag them approximate so the card never
  //    presents them as a precise spot.
  const taxonGeoprivacy = String(observation.taxon_geoprivacy || "").toLowerCase();
  if (taxonGeoprivacy === "obscured" || taxonGeoprivacy === "private") return null;

  const geoprivacy = String(observation.geoprivacy || "").toLowerCase();
  const approximate = observation.obscured === true
    || geoprivacy === "obscured" || geoprivacy === "private";

  return {
    id: `inat-${observation.id}`,
    speciesId: species.id,
    name: observation.place_guess || observation.taxon?.preferred_common_name || species.commonName,
    observedName: observation.taxon?.preferred_common_name || species.commonName,
    observedScientificName: observation.taxon?.name || species.scientificName,
    lat: coordinates[1],
    lng: coordinates[0],
    approximate,
    source: "inaturalist",
    note: `Observed ${observation.observed_on || "date unknown"}; iNaturalist ID ${observation.id}.`,
    confidence: observation.quality_grade || "community",
    idDate: observation.observed_on || "",
    observer: observation.user?.login || "",
    sourceUrl: observation.uri || `https://www.inaturalist.org/observations/${observation.id}`,
    accessClass: "unknown",
    publicLand: false,
    // Same as the baked-chunk mapper: no boilerplate access note on the card.
    accessNote: ""
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

// Falling Fruit records suppressed from the map: points that are technically
// present in the source data but read as errors or are marginal/unsafe to
// suggest. The underlying data is left intact; these are filtered at render
// time by Falling Fruit id (add reported ids here).
const EXCLUDED_FALLING_FRUIT_IDS = new Set([
  // Raspberry bushes "overhanging the quarry ... can be picked from the water"
  // near Waite Park, MN: accurate to the contributor's note, but the pin lands
  // in a water-filled granite quarry, so it reads as a berry dropped in a lake,
  // and picking from a cliff or the water is not a harvest we want to suggest.
  // Reported via the error form, 2026-07 (Falling Fruit location 2114982).
  "2114982-2422",
]);

function mapFallingFruitRecord(record) {
  if (EXCLUDED_FALLING_FRUIT_IDS.has(record.id)) return null;
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
    // The bake writes "Access unknown in Falling Fruit." into records with no
    // access field (build_falling_fruit_subset.py); on the point card that
    // only restates what the ACCESS status and the "Access not sourced"
    // citation already say, so drop the sentinel and keep real contributor
    // notes. The rule branches each have their own specific fallback note.
    accessNote: record.accessNote === "Access unknown in Falling Fruit." ? "" : (record.accessNote || "")
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

function mapMineralRecord(record) {
  const species = speciesCatalogById.get(record.speciesId);
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!species || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const place = record.county ? `${record.name} · ${record.county} Co.` : record.name;
  return {
    id: record.id,
    speciesId: species.id,
    name: place,
    observedName: record.name,
    observedScientificName: species.scientificName,
    lat,
    lng,
    source: "mineral",
    note: "USGS Mineral Resources Data System (MRDS) locality.",
    confidence: "MRDS record",
    sourceUrl: record.url || "https://mrdata.usgs.gov/mrds/",
    idDate: "",
    // perm drives the baked land-manager rule in getMineralAccessRule.
    perm: record.perm || "Private / other",
    access: record.perm || "",
    accessClass: "unknown",
    publicLand: ["USFS", "BLM", "State park", "State trust", "State park (protected)"].includes(record.perm),
    accessNote: ""
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

// Rock & mineral collecting rules, keyed by the land manager baked into each
// MRDS record (data/minerals-us.json). Stone collecting is governed
// differently from foraging — the 36 CFR 2.1 food exception does not cover it.
// Loaded at boot from data/rules/mineral-access-rules.json (see
// loadAccessRuleTables and docs/rules-schema.md); empty until then —
// getMineralAccessRule falls back to the conservative private default.
let MINERAL_ACCESS_RULES = {};

function getMineralAccessRule(record) {
  let perm = record.perm;
  // The Crater of Diamonds finders-keepers exception only covers gems/diamonds dug in
  // the park's search field — never a clay or other locality that merely sits near it.
  // Downgrade any non-gemstone "State park" point to the conservative private rule so it
  // can never inherit dig-and-keep permission (belt-and-suspenders for the baked data).
  if (perm === "State park" && record.speciesId !== "mineral-gemstone") {
    perm = "Private / other";
  }
  // Load-window fallback: the rule table is fetched at boot
  // (loadAccessRuleTables); until it arrives, resolve every mineral point to
  // the same conservative private default as unknown ground — never permissive.
  const base = MINERAL_ACCESS_RULES[perm] || MINERAL_ACCESS_RULES["Private / other"] || {
    status: "private",
    area: "Private, leased, or claimed ground",
    limit: "No public collecting right at this point. Most recorded localities sit on private, leased, or actively claimed land, secure written landowner permission, and check for active mining claims, before collecting.",
    note: "Land status is not publicly sourced for this exact point; treat it as private unless you can verify otherwise.",
    sourceLabel: "Land status not sourced",
    sourceUrl: ""
  };
  return {
    status: base.status,
    label: ACCESS_MARKER_STYLES[base.status]?.label || "Unverified",
    area: base.area,
    limit: base.limit,
    note: base.note,
    sourceLabel: base.sourceLabel,
    sourceUrl: base.sourceUrl,
    checked: base.checked
  };
}

function computeRecordAccessRule(record, species) {
  if (record.source === "mineral") {
    return getMineralAccessRule(record);
  }
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
      note: record.accessNote || "This point is on private or overhanging property.",
      sourceLabel: "Falling Fruit access note",
      sourceUrl: record.sourceUrl || "https://fallingfruit.org/"
    };
  }

  const rasterRule = getStatusRasterAccessRule(record, species);
  if (rasterRule) return rasterRule;

  if (record.publicLand && record.accessClass === "open") {
    return {
      status: "unknown",
      label: "Unverified",
      area: record.access || "Reported public access",
      limit: "This spot is reported as publicly accessible, but its harvesting rules aren't confirmed, check the managing agency's posted rules before collecting.",
      note: record.accessNote || "Reported as publicly accessible; confirm the managing agency's rules before harvesting.",
      sourceLabel: "Falling Fruit access note",
      sourceUrl: record.sourceUrl || "https://fallingfruit.org/"
    };
  }

  return {
    status: "private-unsourced",
    label: "Private / unchecked",
    area: "Private or unverified location",
    limit: "Secure permission from the landowner or managing institution before collecting.",
    // No fallback note here: on the card the unknown-ness is already stated by
    // the ACCESS status and the "Access not sourced" citation, and the
    // treat-as-private instruction is the limit above. A third restatement
    // buried the two that matter. Real contributor notes still flow through.
    note: record.accessNote || "",
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

function getStatusRasterAccessRule(record, species) {
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
  // The raster stores one status per cell per mode, computed with a non-
  // restricted representative species, so it cannot express the restricted-
  // harvest downgrade (live root/bark/whole-plant/fungus). Rather than let a
  // restricted species inherit a cell's "allowed"/"permit" here, drop back to
  // the conservative default until the live per-species rule loads at point
  // zoom. (It also cannot tell edibles-only from broad forest-products land, so
  // a blanket downgrade would wrongly prohibit these species on USFS/BLM.)
  if (isNonFoodHarvestRestricted(species) && status !== "prohibited") return null;
  const labels = {
    allowed: "Allowed",
    "permit-required": "Permit required",
    prohibited: "Prohibited"
  };
  return {
    status,
    label: labels[status],
    area: "Mapped public-access land",
    limit: "Area-level status for this location. Confirm the managing agency's posted rules and the exact boundary before collecting.",
    note: "Estimated from public-land boundaries; a more specific rule may apply at this exact spot.",
    sourceLabel: "USGS PAD-US public-access boundaries",
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
    // Boundaries just became available, so getViewportRegion() can now resolve
    // the map center. Seed the tracked region and repaint the histogram once so
    // the initial view uses its regional curve without needing a pan first.
    state.lastPhenologyRegion = getViewportRegion();
    renderHistogram();
  } catch {
    // State-specific rules degrade to generic fallbacks without boundaries.
  }
}

async function loadLocalJurisdictions() {
  // City/county park rules are applied geographically: PAD-US carries no
  // city/agency name (only "City Land"/"County Land" + "Local Government"), so
  // each record is located inside a Census place/county polygon and matched to
  // the jurisdiction's hand-encoded rule. See
  // docs/permissions-research-2026-06-local-parks.md.
  try {
    const response = await fetch("./data/local-jurisdictions.json");
    if (!response.ok) return;
    state.localJurisdictions = (await response.json()).jurisdictions || [];
    state.accessRuleCache.clear();
    renderMarkers();
  } catch {
    // Local park rules degrade to the generic "unknown" fallback without geometry.
  }
}

async function loadUsfsForestRules() {
  // Each national forest sets its own forest-products rules, so a record on
  // national-forest land is matched to its forest by name and gets that
  // forest's status + its own forest-products page as the source
  // (data/usfs-forest-rules.json). Forests without a researched entry fall
  // back to the general national-forest rule in getPublicLandAccessRule.
  try {
    const response = await fetch("./data/usfs-forest-rules.json");
    if (!response.ok) return;
    state.usfsForestRules = (await response.json()).forests || [];
    state.accessRuleCache.clear();
    renderMarkers();
  } catch {
    // Falls back to the general national-forest rule without per-forest data.
  }
}

async function loadAccessRuleTables() {
  // The three hand-encoded rule tables live in versioned JSON under
  // data/rules/ (extracted by scripts/extract_rules.mjs; schema in
  // docs/rules-schema.md) and gate record-level access resolution. Until they
  // load the tables are empty and every resolver falls back conservatively —
  // generic NPS prohibition, mineral private/other default, no curated site
  // overrides — never a permissive default. After load, drop cached rules and
  // re-render so any markers resolved against the empty tables re-resolve.
  const fetchTable = (file) => fetch(`./data/rules/${file}`)
    .then((response) => {
      if (!response.ok) throw new Error(`${file} ${response.status}`);
      return response.json();
    });
  try {
    const [nps, site, mineral] = await Promise.all([
      fetchTable("nps-gathering-rules.json"),
      fetchTable("site-access-rules.json"),
      fetchTable("mineral-access-rules.json")
    ]);
    NPS_GATHERING_RULES = nps.rules || [];
    SITE_ACCESS_RULES = site.rules || [];
    MINERAL_ACCESS_RULES = mineral.rules || {};
    state.accessRuleCache.clear();
    render();
  } catch {
    // Conservative defaults stay in effect; a reload retries the fetch.
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

function getLocalParkRule(record, text, stateCode, area) {
  if (!state.localJurisdictions || !record) return null;
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // Local-government park land (PAD-US "City Land"/"County Land") matched to the
  // containing Census city/county polygon. The guard ("city land"/"county land")
  // keeps a city park and a county park in the same place from cross-matching.
  const match = state.localJurisdictions.find((j) => {
    if (stateCode && j.stateCode && j.stateCode !== stateCode) return false;
    const guardOk = j.guard === "both"
      ? (text.includes("city land") || text.includes("county land"))
      : text.includes(j.guard);
    if (!guardOk) return false;
    return lng >= j.bbox[0] && lng <= j.bbox[2]
      && lat >= j.bbox[1] && lat <= j.bbox[3]
      && pointInFeature([lng, lat], j);
  });
  if (!match) return null;
  // Local-government foraging allowances are edible-only, but the food "Allowed"
  // still carries across to the ink/herbalism maps for the same low-impact
  // material (getPublicLandAccessRule wrapper); it only downgrades a
  // restricted-harvest species (live root/bark/whole-plant/fungus). So this
  // returns the jurisdiction's rule for every map and the wrapper handles the
  // non-food restriction; permit-required/prohibited rules carry across
  // unchanged. Dedicated food forests / edible parks that grant craft use are
  // curated per-mode in SITE_ACCESS_RULES, which resolves before this.
  return {
    status: match.status,
    label: match.label,
    area: area || match.area,
    limit: match.limit,
    note: match.note,
    sourceLabel: match.sourceLabel,
    sourceUrl: match.sourceUrl
  };
}

function getUsfsForestRule(text, species, area) {
  if (!state.usfsForestRules) return null;
  // match the specific national forest by name (entries are sorted
  // longest-name-first so e.g. "george washington and jefferson" wins over
  // "george washington")
  const entry = state.usfsForestRules.find((forest) => text.includes(forest.match));
  if (!entry) return null;
  const isMushroom = !!(species && species.category === "mushroom");
  const status = isMushroom ? entry.mush : entry.food;
  const detail = (isMushroom ? entry.mushNote : entry.foodLimit) || "";
  // When a forest has no edible-relevant page (its only page was timber/firewood,
  // so the link was dropped), cite the national-forest default rule instead of a
  // page that doesn't speak to edible foraging.
  const sourceUrl = entry.url || ACCESS_RULE_SOURCES.usfs;
  const sourceLabel = entry.url ? `${area} forest-products page` : "National-forest default rule (36 CFR 261.6)";
  // broadForestProducts: national-forest personal use covers roots/bark/boughs,
  // not just edibles, so the non-food restricted-harvest downgrade skips USFS.
  const base = { area, sourceLabel, sourceUrl, broadForestProducts: true };
  if (status === "allowed") {
    return { ...base, status: "allowed", label: "Allowed",
      limit: detail || "Edible items may be gathered for personal use at this forest without a permit; larger or commercial harvests require a forest-products permit.",
      note: `Specific to ${area}; confirm current limits and seasonal closures on the forest's forest-products page before collecting.` };
  }
  if (status === "permit-required") {
    return { ...base, status: "permit-required", label: "Permit required",
      limit: detail || `${area} requires a forest-products permit (sometimes free of charge) to collect ${isMushroom ? "mushrooms" : "edible plant material"}; no general no-permit personal-use allowance is published.`,
      note: `Specific to ${area}; obtain the forest-products permit from this forest before collecting.` };
  }
  if (status === "prohibited") {
    return { ...base, status: "prohibited", label: "Prohibited",
      limit: detail || `${area} does not permit ${isMushroom ? "mushroom" : "this"} collection.`,
      note: `Specific to ${area}.` };
  }
  // Status unknown for this category: fall back to the national-forest baseline,
  // but still cite THIS forest's own page so the user can confirm there.
  return { ...base, status: "allowed", label: "Allowed",
    limit: "Incidental personal-use gathering is generally allowed without a permit on national forests; larger or commercial harvests need a permit.",
    note: `${area} hasn't published a specific ${isMushroom ? "mushroom" : "edible-plant"} rule we could confirm, this is the general national-forest policy; ${entry.url ? ("check " + area + "'s forest-products page") : "contact the forest"} before collecting.` };
}

// Public-land access for a record, with the cross-map permission extension
// applied. resolvePublicLandRule resolves the location as the food map would
// (the same rule runs for every map now); non-food maps inherit that result —
// EXTENDING the food allowance — except that a restricted-harvest species (live
// root / bark / whole plant / fungus, see NONFOOD_HARVEST_NEEDS_PERMISSION) on
// edibles-only land is downgraded to "needs agency permission". Broad forest-
// products land (USFS/BLM, flagged broadForestProducts) is left alone: its
// personal-use harvest is not edibles-scoped, so roots/bark carry across there.
function getPublicLandAccessRule(properties, species, stateCode, record) {
  const rule = resolvePublicLandRule(properties, species, stateCode, record);
  if (rule
    && !rule.broadForestProducts
    && isNonFoodHarvestRestricted(species)
    && (rule.status === "allowed" || rule.status === "permit-required")) {
    return restrictedNonFoodHarvestRule(rule.area, rule.sourceLabel, rule.sourceUrl);
  }
  return rule;
}

function resolvePublicLandRule(properties, species, stateCode, record) {
  const text = getPublicLandText(properties);
  const area = getPublicLandName(properties);

  if (text.includes("botanic") || text.includes("arboretum")) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Botanical gardens and arboreta protect their living collections: do not collect plants or plant parts, including flowers, leaves, seeds, fruits, or cuttings.",
      note: "Curated plant collections are research and conservation assets; collection is uniformly prohibited (e.g., the U.S. National Arboretum, whose conduct rules bar removing any plant material) unless the institution explicitly authorizes it.",
      sourceLabel: "U.S. National Arboretum conduct rules (7 CFR Part 500, representative)",
      sourceUrl: ACCESS_RULE_SOURCES.botanicalGardens
    };
  }

  if (isNycLocalPark(text, stateCode, record)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "Removing plants, flowers, or other vegetation from New York City parks is prohibited without the Commissioner's permission.",
      note: "This is New York City parkland; NYC Parks rules protect all park vegetation, so foraging is not permitted.",
      sourceLabel: "NYC Parks rules 1-04",
      sourceUrl: ACCESS_RULE_SOURCES.nycParks
    };
  }

  // NPS land runs the same food resolution for every map: compendium parks below
  // return "allowed" for listed material and the generic NPS branch further down
  // returns "prohibited" for the rest. The non-food maps inherit that; the
  // getPublicLandAccessRule wrapper downgrades restricted-harvest species.

  if (text.includes("shenandoah national park")) {
    // Shenandoah gates by a per-species compendium allow-list. Food mode uses the
    // catalog's shenandoahAllowed flag; non-food maps may inherit "Allowed" only
    // when the food-equivalent material is listed (NONFOOD_SHENANDOAH_LISTED),
    // keeping non-food no more permissive than food. Unlisted species stay
    // prohibited on every map.
    const shenandoahListed = state.activeMap === "food"
      ? species.shenandoahAllowed !== false
      : NONFOOD_SHENANDOAH_LISTED.has(species.id);
    if (!shenandoahListed) {
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

  const usfsForestRule = getUsfsForestRule(text, species, area);
  if (usfsForestRule) return usfsForestRule;

  if (isUsfsLand(text)) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      // broadForestProducts: national-forest personal use is not edibles-scoped
      // (36 CFR 261.6 covers roots, bark, boughs, etc.), so the non-food
      // restricted-harvest downgrade does not apply here.
      broadForestProducts: true,
      limit: "Small amounts for personal use are generally allowed without a permit; larger quantities or commercial collection require a forest-products permit.",
      note: `This is the national-forest-wide default under 36 CFR 261.6, incidental personal-use gathering is usually allowed, with permits for larger or commercial harvests. The specific designated species, free-use limits, permits, and closures are set by ${area}; confirm them on ${area}'s forest-products page or with the local ranger district before collecting.`,
      sourceLabel: "National-forest products rule (36 CFR 261.6)",
      sourceUrl: ACCESS_RULE_SOURCES.usfs
    };
  }

  if (isBlmLand(text)) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      // broadForestProducts: BLM personal-use collection covers plants/roots, not
      // just edibles, so the non-food restricted-harvest downgrade does not apply.
      broadForestProducts: true,
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
      note: "50 CFR Part 27 prohibits plant disturbance unless the refuge specifically authorizes it, check the refuge's own rules page before collecting anything.",
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

  const localRule = getLocalParkRule(record, text, stateCode, area);
  if (localRule) return localRule;

  if (stateCode === "VA" && isVirginiaWma(text)) {
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
      label: "Unverified",
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
      label: "Unverified",
      area,
      limit: "Albemarle public access is mapped, but a specific county foraging rule has not been confirmed.",
      note: "Treat county park records as access hints only until posted park rules or county code can be checked.",
      sourceLabel: "Albemarle Parks & Recreation",
      sourceUrl: ACCESS_RULE_SOURCES.albemarle
    };
  }

  return {
    status: properties.Pub_Access === "RA" ? "permit-required" : "unknown",
    label: properties.Pub_Access === "RA" ? "Permit required" : "Unverified",
    area,
    limit: properties.Pub_Access === "RA"
      ? "PAD-US marks this area as restricted public access; check the managing agency before harvesting."
      : "PAD-US marks this area as open public access, but the harvest rule has not yet been researched.",
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
      sourceUrl: entry.sourceUrl,
      checked: entry.checked
    };
  }
  return {
    status: "allowed",
    label: "Allowed",
    area,
    limit: entry.limit,
    note: entry.note,
    sourceLabel: entry.sourceLabel,
    sourceUrl: entry.sourceUrl,
    checked: entry.checked
  };
}

// True when the current (ink/herbalism) map harvests this species by a live
// root, live bark, or the whole living plant (or it is a fungus / observe-only
// species). Those harvests are NOT covered by a personal-gathering or edible-
// consumption exception, so they do not inherit a food "Allowed"; everything
// else on the non-food maps extends the food resolution for the same location.
// Always false in food mode. See NONFOOD_HARVEST_NEEDS_PERMISSION.
function isNonFoodHarvestRestricted(species) {
  return state.activeMap !== "food"
    && !!species
    && NONFOOD_HARVEST_NEEDS_PERMISSION.has(species.id);
}

// Rule for a non-food species whose harvest is restricted (see above) on land
// that otherwise permits personal gathering. The food "Allowed" carries across
// the maps for fruit and fallen material, but not for this species' live-root /
// live-bark / whole-plant harvest, so it needs the managing agency's permission.
function restrictedNonFoodHarvestRule(area, sourceLabel, sourceUrl) {
  return {
    status: "prohibited",
    label: "Prohibited",
    area,
    limit: "Personal gathering here carries across the maps for fruit, nuts, berries, foliage, and fallen material, but this species is harvested from its live roots, bark, or whole body, which that allowance does not cover. Get the managing agency's written permission before harvesting here.",
    note: "The food-gathering allowance extends across the maps for low-impact material; live-root, live-bark, and whole-plant harvest is not covered, so treat it as prohibited unless the agency permits it.",
    sourceLabel: sourceLabel || "Land manager plant-protection rule",
    sourceUrl: sourceUrl || ""
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
      return {
        status: "allowed",
        label: "Allowed",
        area,
        limit: "Edible fungi, nuts, and berries (not ginseng berries) may be gathered for personal use only, not resale, during the site's regular open hours; not during open hunting-season hours, and not in dedicated nature preserves. Leaves, roots, stems, and whole plants are not covered.",
        note: "Illinois DNR lands allow personal-use collection of edible fungi, nuts, and berries under 17 Ill. Adm. Code 110.70(a)(3); individual site managers may further restrict it, so check posted rules.",
        sourceLabel: "17 Ill. Adm. Code 110.70",
        sourceUrl: ACCESS_RULE_SOURCES.illinoisDnr
      };
    }
  }

  if (stateCode === "OR" && (text.includes("state park") || text.includes("state recreation") || text.includes("state natural area") || text.includes("state scenic"))) {
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
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Mushrooms, nuts, berries, and tree fruits may be harvested from Michigan state-managed lands for personal use (state land rules cap personal take at about 25 pounds); not for resale.",
      note: "Michigan DNR allows wild-food foraging on state land, but not plants that are destroyed or damaged by harvest, no fiddleheads, ramps, ginseng, whole plants, or tree tapping.",
      sourceLabel: "Michigan DNR foraging guidance",
      sourceUrl: ACCESS_RULE_SOURCES.michiganDnr
    };
  }

  if (stateCode === "MN" && (text.includes("state park") || text.includes("forest recreation area"))) {
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
    return { status: "allowed", label: "Allowed", area,
      limit: "Berries, fruits, mushrooms, and similar edibles may be gathered for personal consumption (not for sale); the state-park rule sets no quantity limit.",
      note: "Alaska state parks allow personal-use gathering of edibles under 11 AAC 12.170(b); other plants and natural objects remain protected.",
      sourceLabel: "11 AAC 12.170", sourceUrl: ACCESS_RULE_SOURCES.alaskaParks };
  }
  if (stateCode === "IN" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Berries, fruits, nuts, fallen cones, mushrooms, leaves, and greens may be collected for personal use; flower-picking and other plant collection remain prohibited.",
      note: "Indiana state parks (DNR properties) exempt listed edible items from the plant-collection prohibition under 312 IAC 8-2-10.",
      sourceLabel: "312 IAC 8-2-10", sourceUrl: ACCESS_RULE_SOURCES.indianaDnr };
  }
  if (stateCode === "IA" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Mushrooms and asparagus may be harvested system-wide; fruits, nuts, and berries may be gathered for personal use unless a sign is posted prohibiting it.",
      note: "Iowa lands under Natural Resource Commission jurisdiction allow personal-use foraging under 571 IAC 54.1-54.2; dedicated state preserves are excluded.",
      sourceLabel: "Iowa Admin. Code 571, 54", sourceUrl: ACCESS_RULE_SOURCES.iowaDnr };
  }
  if (stateCode === "KS" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Noncommercial gathering of edible wild plants, wild fruits, nuts, or fungi for human consumption is permitted; commercial gathering is prohibited.",
      note: "Kansas excepts personal-use edible foraging from the vegetation-removal prohibition under K.A.R. 115-8-20(a)(4)(F).",
      sourceLabel: "K.A.R. 115-8-20", sourceUrl: ACCESS_RULE_SOURCES.kansasParks };
  }
  if (stateCode === "OH" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Berries, fruit, tree nuts, and mushrooms (plus ground pine cones) may be gathered during daylight hours for personal use, not commercial.",
      note: "Ohio state parks permit personal-use foraging of listed edibles under Ohio Admin. Code 1501:46-3-10, except where a unit posts a restriction.",
      sourceLabel: "Ohio Admin. Code 1501:46-3-10", sourceUrl: ACCESS_RULE_SOURCES.ohioParks };
  }
  if (stateCode === "OK" && (text.includes("state park") || text.includes("state recreation"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Nuts, edible plants, and fungi may be foraged for personal consumption on state-managed public land (certified agricultural crops and protected species excluded).",
      note: "Oklahoma legalized personal-use foraging on state-managed public land in 2025 (61 O.S. § 335, SB 447, effective Nov 1 2025).",
      sourceLabel: "61 O.S. § 335 (SB 447, 2025)", sourceUrl: ACCESS_RULE_SOURCES.oklahomaParks };
  }
  if (stateCode === "VT" && (text.includes("state park") || text.includes("state forest"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Wild berries, fruits, seeds, nuts, and mushrooms may be collected for personal use; uprooting or cutting whole plants requires a written FPR permit.",
      note: "Vermont FPR-administered lands (state parks and forests) allow personal-use edible collection under 12-020-009 Code Vt. R.",
      sourceLabel: "12-020-009 Code Vt. R.", sourceUrl: ACCESS_RULE_SOURCES.vermontParks };
  }
  if (stateCode === "WI" && (text.includes("state park") || text.includes("state forest") || text.includes("state recreation") || text.includes("state trail") || text.includes("state natural area"))) {
    return { status: "allowed", label: "Allowed", area,
      limit: "Edible fruits, edible nuts, wild mushrooms, wild asparagus, and watercress may be hand-collected for personal consumption.",
      note: "Wisconsin DNR lands except personal-use edibles from the plant-protection rule under NR 45.04(1s)(a)1.",
      sourceLabel: "Wis. Admin. Code NR 45.04", sourceUrl: ACCESS_RULE_SOURCES.wisconsinDnr };
  }

  // --- Allowed with a mushroom split (need the species param) ---
  if (stateCode === "MO" && (text.includes("state park") || text.includes("state historic site"))) {    if (species.category === "mushroom") {
      return { status: "prohibited", label: "Prohibited", area,
        limit: "Mushrooms are not covered by Missouri's in-park foraging exception; only wild edible fruit, berries, seeds, and nuts may be collected.",
        note: "Missouri's edible exception (10 CSR 90-2.040(4)(B)) names fruit, berries, seeds, and nuts only, not fungi.",
        sourceLabel: "10 CSR 90-2.040", sourceUrl: ACCESS_RULE_SOURCES.missouriParks };
    }
    return { status: "allowed", label: "Allowed", area,
      limit: "Wild edible fruit, berries, seeds, and nuts: up to a one-gallon container per person for personal consumption (no roots/below-ground parts, no commercial harvest, no mushrooms).",
      note: "Missouri state parks allow personal-use collection of wild edible fruit, berries, seeds, and nuts under 10 CSR 90-2.040(4)(B).",
      sourceLabel: "10 CSR 90-2.040", sourceUrl: ACCESS_RULE_SOURCES.missouriParks };
  }
  if (stateCode === "HI" && (text.includes("state park") || text.includes("state recreation") || text.includes("state historical park") || text.includes("state wayside") || text.includes("state monument"))) {    if (species.category === "mushroom") {
      return { status: "prohibited", label: "Prohibited", area,
        limit: "Mushrooms are not named in Hawaii's renewable-natural-products allowance; treat mushroom collection as not permitted without local confirmation.",
        note: "HAR 13-146-32(c) lists fruits, berries, flowers, seeds, etc., not fungi; the project excludes mushrooms conservatively.",
        sourceLabel: "HAR 13-146-32", sourceUrl: ACCESS_RULE_SOURCES.hawaiiParks };
    }
    return { status: "allowed", label: "Allowed", area,
      limit: "Reasonable quantities of renewable natural products (fruits, berries, flowers, seeds, pine cones, seaweeds, driftwood) for personal use; sale prohibited.",
      note: "Hawaii state parks allow personal-use gathering of renewable natural products under HAR 13-146-32(c).",
      sourceLabel: "HAR 13-146-32", sourceUrl: ACCESS_RULE_SOURCES.hawaiiParks };
  }
  if (stateCode === "TN" && (text.includes("state park") || text.includes("state recreation") || text.includes("state natural area"))) {    if (species.category === "mushroom") {
      return { status: "prohibited", label: "Prohibited", area,
        limit: "Mushrooms are not named in Tennessee's renewable-products allowance; treat mushroom collection as not permitted without local confirmation.",
        note: "Tenn. Comp. R. & Regs. 0400-02-02-.18(3) names fruits, berries, and driftwood, not fungi; the project excludes mushrooms conservatively.",
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
      note: "Ga. Comp. R. & Regs. r. 391-5-1-.04 protects all plant material; any foraging exception is discretionary and unit-specific, check posted rules. Mushrooms are not covered.",
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
      note: "024-1 Wyo. Code R. § 1-15 protects vegetation; only superintendent-designated fruits and berries may be gathered (no mushrooms), check the unit.",
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

// Writes the season bar's status line (#dataStatus). Sticky by default —
// loading progress, source outages, and token errors stay visible until
// replaced. Pass transient:true for success/informational messages so they
// clear after a beat instead of living on the map forever. `kind` records
// what currently owns the line so the persistent record-count writer never
// clobbers an outage/error/loading message (priority lives in
// updateRecordCountStatus, the only reader).
let dataStatusTimer = null;
let dataStatusKind = "idle";
function setDataStatus(message, { transient = false, kind = "info" } = {}) {
  if (!dataStatus) return;
  window.clearTimeout(dataStatusTimer);
  // #dataStatus is a role="status" live region: re-assigning identical text
  // re-announces the whole line to screen readers. renderMarkers re-runs the
  // count writer on every render/pan, usually with an unchanged message, so
  // only touch the DOM when the text actually changes.
  if (dataStatus.textContent !== message) dataStatus.textContent = message;
  dataStatusKind = message ? kind : "idle";
  // Mirror the kind onto the element so CSS can promote error/outage lines
  // out of the muted secondary color (see #dataStatus[data-kind] rules).
  dataStatus.dataset.kind = dataStatusKind;
  if (transient && message) {
    dataStatusTimer = window.setTimeout(() => {
      dataStatus.textContent = "";
      dataStatusKind = "idle";
      dataStatus.dataset.kind = "idle";
    }, 6000);
  }
}

initControls();
initOfflineIndicator();
initOfflineAreas();
render();
// Rule tables load immediately (not gated on the map): they gate record-level
// access resolution, and resolvers fall back conservatively until they land.
loadAccessRuleTables();
// Region map + the active mode's phenology feed the regional curves. Load both,
// then paint the histogram once (getViewportRegion no-ops until stateBoundaries
// also land on map "load", at which point moveend re-renders in-region).
loadPhenologyRegions();
loadPhenology(state.activeMap).then(() => renderHistogram());
map.on("load", () => {
  state.mapReady = true;
  // A hash deep-link can boot straight into the point band, so the "was I
  // below point zoom" tracker must start from the real boot zoom or the first
  // zoom gesture spuriously runs the crossing-up reset branch.
  state.wasBelowPointZoom = map.getZoom() < FALLING_FRUIT_MIN_LOAD_ZOOM;
  syncLightPreset(state.register);
  setINaturalistAggregateReady(false);
  initMapLayers();
  loadRadar();
  loadStateBoundaries();
  loadLocalJurisdictions();
  loadUsfsForestRules();
  // The raster also backs provisional record-level rules at point zooms, so
  // warm it near startup rather than only via the overview aggregate path —
  // but from idle time: it is a ~3.8 MB fetch+parse, and eagerly racing it
  // against basemap tiles delayed the first paint. Overview boots still get
  // it promptly because loadINaturalistAggregates awaits it directly.
  const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1500));
  idle(() => loadStatusRaster());
  render();
  loadMapData();
  // Boot backstop: a hash deep-link into the point band has no follow-up
  // moveend to rescue a dropped or parked first load (moveend is the only
  // retry trigger, and an untouched boot never fires one). Re-check once the
  // map settles; idempotent because manifests and chunks dedup through their
  // shared in-flight promises/caches and the newest activeRequest wins. The
  // settledRequest check keeps it from superseding a healthy load that is
  // simply still fetching (tiles idle before the low-priority manifests); a
  // load that parks after being superseded re-arms its own delayed retry.
  map.once("idle", () => {
    if (!getActiveMapConfig().loadMinerals
      && map.getZoom() >= FALLING_FRUIT_MIN_LOAD_ZOOM
      && !state.pointDataReady
      && state.activeRequest === state.settledRequest) {
      loadMapData();
    }
  });
  schedulePublicLandLoad();
  // Warm the whole-region gz 2/4 aggregate tile sets once boot settles
  // (~4-12 requests at concurrency 2): a boot into the point band otherwise
  // has NO aggregate tiles, so the first zoom-out always paid the fetch.
  window.setTimeout(() => prefetchINaturalistAggregateTiles([2, 4], { channel: "boot", regionWide: true }), 3000);
});

map.on("error", (event) => {
  const message = event?.error?.message || "";
  const status = event?.error?.status;
  if (message.includes("401") || message.includes("403") || status === 401 || status === 403) {
    // Dead token: the deliberate killswitch. Retire the map honestly. The
    // token is URL-restricted, so a non-allowlisted origin (a new local port,
    // an un-allowlisted beta URL) lands here too; the warn keeps a developer
    // from mistaking that for the production killswitch.
    if (!mapTakeoverShown) {
      console.warn("Craft Almanac: basemap auth error (401/403); showing the paused takeover. Revoked token = killswitch, non-allowlisted origin = use the allowlisted local port. See docs/mapbox-killswitch.md.");
    }
    showMapTakeover("paused");
  } else if (message.includes("429") || status === 429 || /quota|rate.?limit|too many requests/i.test(message)) {
    // A traffic spike that exhausts the Mapbox map-load quota surfaces as 429 /
    // rate-limit, not 401/403 — surface it honestly so the map never just blanks.
    mapRateLimitErrors += 1;
    if (mapRateLimitErrors >= MAP_TAKEOVER_RATE_LIMIT_THRESHOLD) {
      showMapTakeover("busy");
    } else {
      setDataStatus("The map is temporarily over capacity. Please try again in a little while.", { kind: "error" });
    }
  }
});
