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
const INATURALIST_VIRGINIA_PLACE_ID = "7";
const PUBLIC_LANDS_URL = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/PADUS_Public_Access/FeatureServer/0/query";
const MARKERS_SOURCE_ID = "forage-records";
const MARKERS_LAYER_ID = "forage-record-points";
const PUBLIC_LANDS_SOURCE_ID = "public-lands";
const PUBLIC_LANDS_FILL_LAYER_ID = "public-lands-fill";
const PUBLIC_LANDS_LINE_LAYER_ID = "public-lands-line";
const VIRGINIA_BOUNDARY_SOURCE_ID = "virginia-boundary";
const VIRGINIA_MASK_SOURCE_ID = "virginia-mask";
const VIRGINIA_MASK_LAYER_ID = "virginia-mask-fill";
const VIRGINIA_OUTLINE_LAYER_ID = "virginia-outline";
const MAPBOX_STYLE = "mapbox://styles/mapbox/outdoors-v12";
const VIRGINIA_MAX_BOUNDS = [
  [-84.1, 36.25],
  [-74.8, 39.75]
];
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
  virginiaParks: "https://law.lis.virginia.gov/admincode/title4/agency5/chapter30/section50/",
  virginiaStateForests: "https://law.lis.virginia.gov/admincode/title4/agency10/chapter30/section50/",
  virginiaWma: "https://dwr.virginia.gov/wp-content/uploads/media/wma-rules.pdf",
  charlottesville: "https://www.charlottesville.gov/658/Parks-Trails",
  albemarle: "https://www.albemarle.org/government/parks-recreation"
};
const SITE_ACCESS_RULES = [];
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
    lede: "Track edible plants and mushrooms across Virginia by place, date, and permissions. The species list focuses on abundant, resilient edibles suited to responsible, low-impact harvesting.",
    categories: [
      { id: "berry", label: "Berries" },
      { id: "fruit", label: "Fruit" },
      { id: "mushroom", label: "Mushrooms" },
      { id: "nut", label: "Nuts" }
    ],
    categoryColors: FOOD_CATEGORY_COLORS,
    catalog: foodSpeciesCatalog,
    sourceNames: ["iNaturalist", "Falling Fruit", "NPS orchards"],
    dataNotes: "Live observations from iNaturalist, community records from Falling Fruit, public access boundaries from USGS PAD-US, and historic orchards from the National Park Service.",
    rulesLabel: "Harvesting rules and limits",
    loadFallingFruit: true,
    loadNpsOrchards: true
  },
  ink: {
    id: "ink",
    speciesHeading: "Ink Colors & Materials",
    lede: "Discover plants, trees, and fruits that can produce natural inks across Virginia by season and habitat. The list favors abundant native species that can be harvested lightly, as well as invasive plants whose careful removal can support surrounding ecosystems.",
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
    dataNotes: "Live observations from iNaturalist, relevant community records from Falling Fruit, public access boundaries from USGS PAD-US, and local collection rules where sourced. Ink materials still require permission to collect.",
    rulesLabel: "Collection rules and limits",
    loadFallingFruit: true,
    loadNpsOrchards: false
  },
  medicine: {
    id: "medicine",
    speciesHeading: "Therapeutic Uses & Species",
    lede: "Explore therapeutic plants across Virginia by season and habitat.",
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
    dataNotes: "Live observations from iNaturalist, public access boundaries from USGS PAD-US, and local collection rules where sourced. Plant-use notes are educational and are not instructions for treatment.",
    rulesLabel: "Collection rules and limits",
    loadFallingFruit: false,
    loadNpsOrchards: false
  }
};

let speciesCatalog = foodSpeciesCatalog;
let speciesCatalogByName = sortCatalogByName(speciesCatalog);

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
  loadTimer: null,
  publicLoadTimer: null,
  activeRequest: 0,
  activePublicRequest: 0,
  fallingFruitData: null,
  fallingFruitRecords: null,
  npsOrchardRecords: null,
  publicLandFeatures: [],
  mapReady: false,
  publicLayerLoadedKey: "",
  publicLayerVisible: true,
  activePopup: null,
  hoverPopup: null
};

mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  style: MAPBOX_STYLE,
  center: [-78.5034, 38.0356],
  zoom: 13,
  minZoom: 6,
  maxZoom: 19,
  maxBounds: VIRGINIA_MAX_BOUNDS,
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
window.addEventListener("resize", () => map.resize());

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
const welcomeModal = document.querySelector("#welcomeModal");
const welcomeModalButton = document.querySelector("#welcomeModalButton");
const mapModeButtons = [...document.querySelectorAll("[data-map-mode]")];
let categoryInputs = [];
let accessStatusInputs = [];
const todayButton = document.querySelector("#todayButton");
const allSeasonsButton = document.querySelector("#allSeasonsButton");
const controlPanel = document.querySelector("#controlPanel");
const panelGrip = document.querySelector("#panelGrip");
const sectionToggles = [...document.querySelectorAll(".section-toggle")];
const MOBILE_PANEL_MIN_HEIGHT = 92;
const MOBILE_PANEL_DEFAULT_HEIGHT = 420;
const MOBILE_PANEL_MARGIN = 20;
let panelDragState = null;

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
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
  const date = new Date(value);
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
  return `
    <label data-category="${species.category}" class="${species.groupLabel ? "is-child-species" : ""}">
      <span class="species-name">
        <input type="checkbox" name="species" value="${species.id}" checked>
        ${species.commonName}
      </span>
      <span class="type-pill ${species.category}">${getCategoryLabel(species.category)}</span>
    </label>
  `;
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
  state.activeRequest += 1;
  state.activePopup?.remove();
  state.hoverPopup?.remove();
  syncActiveCatalog();
  renderModeChrome();
  renderFilterControls();
  render();
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
    document.querySelectorAll("input[name='species']").forEach((input) => {
      input.checked = true;
    });
    syncCategoryCheckboxes();
    render();
  });

  document.querySelector("#clearSpeciesButton").addEventListener("click", () => {
    document.querySelectorAll("input[name='species']").forEach((input) => {
      input.checked = false;
    });
    syncCategoryCheckboxes();
    render();
  });

  map.on("moveend", () => {
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
  if (!isMobilePanel()) return;
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
  return speciesCatalog.find((species) => species.id === speciesId);
}

function getSpeciesInput(speciesId) {
  return document.querySelector(`input[name='species'][value='${speciesId}']`);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name='${name}']:checked`)].map((input) => input.value);
}

function getSelectedAccessStatuses() {
  const selectedStatuses = getCheckedValues("access-status");
  return selectedStatuses.length
    ? selectedStatuses
    : [];
}

function getTaxonIds(species) {
  return species.inatTaxonIds || [];
}

function getExpectedIconicTaxon(species) {
  return species.category === "mushroom" ? "Fungi" : "Plantae";
}

function getSelectedCatalogItems() {
  const selectedIds = getCheckedValues("species");
  return speciesCatalog.filter((species) => selectedIds.includes(species.id));
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
  document.querySelectorAll(".species-list label:not(.species-group-title)").forEach((label) => {
    const input = label.querySelector("input[name='species']");
    label.classList.toggle("is-selected", input?.checked);
  });
  document.querySelectorAll(".species-list .species-group-title").forEach((label) => {
    label.classList.remove("is-selected");
  });
  syncCategoryCheckboxes();
  syncSpeciesGroupCheckboxes();
}

function isSpeciesAvailableOnSelectedDate(species) {
  return state.allSeasons || species.months.includes(getSelectedMonth());
}

function getVisibleRecords() {
  const selectedSpecies = getCheckedValues("species");
  const selectedAccessStatuses = getSelectedAccessStatuses();

  return state.records.filter((record) => {
    const species = getSpecies(record.speciesId);
    if (!species) return false;
    const accessRule = getRecordAccessRule(record, species);
    if (!selectedAccessStatuses.includes(accessRule.status)) return false;
    return isSpeciesAvailableOnSelectedDate(species)
      && selectedSpecies.includes(record.speciesId);
  });
}

function render() {
  renderSeasonControls();
  renderSpeciesState();
  renderHistogram();
  renderMarkers();
  if (state.mapReady) {
    scheduleDataLoad();
    schedulePublicLandLoad();
    requestAnimationFrame(() => map.resize());
  }
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

  initVirginiaBoundaryLayers(firstLineOrSymbolLayerId);

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

  if (!map.getSource(MARKERS_SOURCE_ID)) {
    map.addSource(MARKERS_SOURCE_ID, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });
  }

  if (!map.getLayer(MARKERS_LAYER_ID)) {
    map.addLayer({
      id: MARKERS_LAYER_ID,
      type: "symbol",
      source: MARKERS_SOURCE_ID,
      layout: {
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
}

async function initVirginiaBoundaryLayers(firstLineOrSymbolLayerId) {
  try {
    const response = await fetch("./data/virginia-boundary.json");
    if (!response.ok) return;
    const geometry = await response.json();
    const feature = {
      type: "Feature",
      properties: {},
      geometry
    };
    const mask = getOutsideVirginiaMask(geometry);

    if (!map.getSource(VIRGINIA_BOUNDARY_SOURCE_ID)) {
      map.addSource(VIRGINIA_BOUNDARY_SOURCE_ID, {
        type: "geojson",
        data: feature
      });
    }

    if (!map.getSource(VIRGINIA_MASK_SOURCE_ID)) {
      map.addSource(VIRGINIA_MASK_SOURCE_ID, {
        type: "geojson",
        data: mask
      });
    }

    if (!map.getLayer(VIRGINIA_MASK_LAYER_ID)) {
      map.addLayer({
        id: VIRGINIA_MASK_LAYER_ID,
        type: "fill",
        source: VIRGINIA_MASK_SOURCE_ID,
        paint: {
          "fill-color": "#f2efe5",
          "fill-opacity": 0.58
        }
      }, firstLineOrSymbolLayerId);
    }

    if (!map.getLayer(VIRGINIA_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: VIRGINIA_OUTLINE_LAYER_ID,
        type: "line",
        source: VIRGINIA_BOUNDARY_SOURCE_ID,
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

function getOutsideVirginiaMask(geometry) {
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
  });

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

async function loadMapData() {
  const requestId = state.activeRequest + 1;
  state.activeRequest = requestId;
  const config = getActiveMapConfig();
  const hadRecords = state.records.length > 0;
  if (!hadRecords) setDataStatus("Loading current map data...");

  const [inatResult, fallingFruitResult, npsOrchardResult] = await Promise.allSettled([
    loadINaturalist(),
    config.loadFallingFruit ? loadFallingFruit() : Promise.resolve([]),
    config.loadNpsOrchards ? loadNpsOrchards() : Promise.resolve([])
  ]);

  if (requestId !== state.activeRequest) return;

  if (inatResult.status === "fulfilled") {
    inatResult.value.forEach((record) => state.inatRecordCache.set(record.id, record));
  }
  state.inatRecords = getCachedINaturalistRecordsInBounds();

  const fallingFruitRecords = fallingFruitResult.status === "fulfilled"
    ? fallingFruitResult.value
    : state.fallingFruitRecords || [];
  const npsOrchardRecords = npsOrchardResult.status === "fulfilled"
    ? npsOrchardResult.value
    : state.npsOrchardRecords || [];
  const nextRecords = [...state.inatRecords, ...fallingFruitRecords, ...npsOrchardRecords];

  if (nextRecords.length) {
    state.records = nextRecords;
    renderMarkers();
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

  const taxonIds = selectedSpecies
    .flatMap(getTaxonIds)
    .join(",");

  if (!taxonIds) return [];

  const bounds = map.getBounds();
  const params = new URLSearchParams({
    taxon_id: taxonIds,
    swlat: bounds.getSouth().toFixed(5),
    swlng: bounds.getWest().toFixed(5),
    nelat: bounds.getNorth().toFixed(5),
    nelng: bounds.getEast().toFixed(5),
    geo: "true",
    photos: "true",
    quality_grade: "research",
    place_id: INATURALIST_VIRGINIA_PLACE_ID,
    per_page: "120",
    order: "desc",
    order_by: "observed_on"
  });

  const response = await fetchWithTimeout(`https://api.inaturalist.org/v1/observations?${params.toString()}`);
  if (!response.ok) throw new Error(`iNaturalist returned ${response.status}`);
  const data = await response.json();
  return data.results
    .map(mapINaturalistObservation)
    .filter(Boolean);
}

async function loadFallingFruit() {
  try {
    if (!state.fallingFruitData) {
      const response = await fetch("./data/falling-fruit-virginia.json");
      if (!response.ok) return [];
      state.fallingFruitData = await response.json();
    }

    state.fallingFruitRecords = state.fallingFruitData
      .map(mapFallingFruitRecord)
      .filter(Boolean);
    return state.fallingFruitRecords;
  } catch {
    return [];
  }
}

async function loadNpsOrchards() {
  if (state.npsOrchardRecords) {
    return state.npsOrchardRecords;
  }

  try {
    const response = await fetch("./data/nps-historic-orchards.json");
    if (!response.ok) return [];
    const data = await response.json();
    state.npsOrchardRecords = data
      .map(mapNpsOrchardRecord)
      .filter(Boolean);
    return state.npsOrchardRecords;
  } catch {
    return [];
  }
}

function schedulePublicLandLoad() {
  window.clearTimeout(state.publicLoadTimer);
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
      resultRecordCount: "1000"
    });
    const response = await fetchWithTimeout(`${PUBLIC_LANDS_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`PAD-US returned ${response.status}`);
    const data = await response.json();
    if (requestId !== state.activePublicRequest) return;
    state.publicLandFeatures = data.features || [];
    state.publicLayerLoadedKey = boundsKey;
    updatePublicLandSource();
    renderMarkers();
  } catch (error) {
    if (requestId !== state.activePublicRequest) return;
    state.publicLandFeatures = [];
    updatePublicLandSource();
    renderMarkers();
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
  const species = speciesCatalog.find((item) => item.id === speciesId);
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
  const species = speciesCatalog.find((item) => item.id === speciesId);
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

  const landRule = getBestPublicLandAccessRule(getContainingPublicLands(record), species);
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
  return site?.rule || null;
}

function getPublicLandAccessRule(properties, species) {
  const text = getPublicLandText(properties);
  const area = getPublicLandName(properties);

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

  if (isNationalParkServiceLand(text)) {
    return {
      status: "prohibited",
      label: "Prohibited",
      area,
      limit: "NPS plant removal is prohibited unless that park's superintendent has specifically authorized an exception.",
      note: "This NPS unit does not match one of the Virginia personal-use compendium allowances currently encoded in the app.",
      sourceLabel: "36 CFR 2.1",
      sourceUrl: ACCESS_RULE_SOURCES.npsGeneral
    };
  }

  if (isUsfsLand(text)) {
    return {
      status: "allowed",
      label: "Allowed",
      area,
      limit: "Small amounts for personal use are allowed without a permit; larger quantities or commercial collection require a forest-products permit.",
      note: "George Washington and Jefferson National Forests direct commercial and larger forest-product collection through permits.",
      sourceLabel: "GW-Jefferson forest products permits",
      sourceUrl: ACCESS_RULE_SOURCES.usfs
    };
  }

  if (isVirginiaWma(text)) {
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

  if (isVirginiaStateForest(text)) {
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

  if (isVirginiaStateParkOrDcrLand(text)) {
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

function getBestPublicLandAccessRule(features, species) {
  if (!features.length) return null;
  const candidates = features.map((feature) => ({
    rule: getPublicLandAccessRule(feature.properties || {}, species),
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
  return text.includes("national park service")
    || text.includes("national park")
    || text.includes("national battlefield")
    || text.includes("national historical park")
    || text.includes("national military park")
    || text.includes("national memorial parkway");
}

function isUsfsLand(text) {
  return text.includes("u.s. forest service")
    || text.includes("us forest service")
    || text.includes("national forest")
    || text.includes("george washington")
    || text.includes("jefferson national forest");
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

function isRecordPubliclyAccessible(record) {
  if (record.publicLand && record.accessClass !== "private") return true;
  return Boolean(getContainingPublicLand(record));
}

function getContainingPublicLand(record) {
  return getContainingPublicLands(record)[0] || null;
}

function getContainingPublicLands(record) {
  if (!state.publicLandFeatures.length) return [];
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  return state.publicLandFeatures.filter((feature) => pointInFeature([lng, lat], feature));
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
  initMapLayers();
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
