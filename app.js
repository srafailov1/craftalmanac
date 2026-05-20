const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const ACTIVE_YEAR = new Date().getFullYear();
const CATEGORIES = ["fruit", "berry", "nut", "mushroom"];
const MAPBOX_TOKEN = window.FORAGE_CONFIG?.mapboxToken || "";
const DATA_REFRESH_DELAY = 550;
const PUBLIC_LANDS_REFRESH_DELAY = 650;
const PUBLIC_LANDS_URL = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/PADUS_Public_Access/FeatureServer/0/query";

const speciesCatalog = [
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
    id: "bramble",
    commonName: "Blackberries and raspberries",
    scientificName: "Rubus",
    category: "berry",
    months: [6, 7, 8, 9],
    inatTaxonIds: [82110, 125489, 84227],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Cane fruits are common around edges and sunny disturbed ground."
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
    inatTaxonIds: [52872],
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
    inatTaxonIds: [49486],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Similar habitat to blueberries, often on dry acidic ridges."
  },
  {
    id: "prunus",
    commonName: "Cherries and plums",
    scientificName: "Prunus",
    category: "fruit",
    months: [6, 7, 8, 9],
    inatTaxonIds: [54834, 48629],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Fruit flesh can be used, but pits, leaves, and wilted foliage are hazardous."
  },
  {
    id: "serviceberry",
    commonName: "Serviceberries",
    scientificName: "Amelanchier",
    category: "berry",
    months: [5, 6, 7],
    inatTaxonIds: [49189],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Early summer fruit on small trees; also called juneberries."
  },
  {
    id: "persimmon",
    commonName: "American persimmons",
    scientificName: "Diospyros virginiana",
    category: "fruit",
    months: [9, 10, 11, 12],
    inatTaxonIds: [48501],
    parkLimit: "1 gallon per person per day in Shenandoah National Park",
    notes: "Best after softening; unripe fruit is sharply astringent."
  },
  {
    id: "black-walnut",
    commonName: "Black walnuts",
    scientificName: "Juglans nigra",
    category: "nut",
    months: [9, 10, 11],
    inatTaxonIds: [49158],
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
    commonName: "American hazelnut",
    scientificName: "Corylus americana",
    category: "nut",
    months: [8, 9, 10],
    inatTaxonIds: [53325],
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

const state = {
  selectedDay: getDayOfYear(new Date()),
  allSeasons: false,
  records: [],
  markers: [],
  loadTimer: null,
  publicLoadTimer: null,
  activeRequest: 0,
  activePublicRequest: 0,
  fallingFruitRecords: null,
  npsOrchardRecords: null,
  publicLandFeatures: [],
  publicLandLayer: null,
  publicLayerLoadedKey: "",
  publicLayerVisible: true,
  publicOnly: false,
  showOrchards: true
};

const map = L.map("map", {
  zoomControl: false,
  preferCanvas: false,
  updateWhenIdle: true,
  updateWhenZooming: false
}).setView([38.0356, -78.5034], 13);

L.control.zoom({ position: "bottomright" }).addTo(map);
const publicLandRenderer = L.svg({ pane: "overlayPane" });
publicLandRenderer.addTo(map);
const tileLayerOptions = {
  maxZoom: 19,
  minZoom: 3,
  keepBuffer: 4,
  crossOrigin: true
};

const mapboxUrl = "https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/512/{z}/{x}/{y}@2x?access_token={accessToken}";
const fallbackUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

L.tileLayer(MAPBOX_TOKEN ? mapboxUrl : fallbackUrl, {
  ...tileLayerOptions,
  tileSize: MAPBOX_TOKEN ? 512 : 256,
  zoomOffset: MAPBOX_TOKEN ? -1 : 0,
  accessToken: MAPBOX_TOKEN,
  attribution: MAPBOX_TOKEN
    ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

requestAnimationFrame(() => map.invalidateSize());
window.addEventListener("resize", () => map.invalidateSize());

const dataStatus = document.querySelector("#dataStatus");
const speciesCount = document.querySelector("#speciesCount");
const daySlider = document.querySelector("#daySlider");
const dateInput = document.querySelector("#dateInput");
const seasonDateLabel = document.querySelector("#seasonDateLabel");
const seasonName = document.querySelector("#seasonName");
const seasonHistogram = document.querySelector("#seasonHistogram");
const speciesList = document.querySelector("#speciesList");
const categoryInputs = [...document.querySelectorAll("input[name='category']")];
const todayButton = document.querySelector("#todayButton");
const allSeasonsButton = document.querySelector("#allSeasonsButton");
const publicLayerToggle = document.querySelector("#publicLayerToggle");
const publicOnlyToggle = document.querySelector("#publicOnlyToggle");
const orchardLayerToggle = document.querySelector("#orchardLayerToggle");

state.publicLandLayer = L.geoJSON(null, {
  renderer: publicLandRenderer,
  style: (feature) => {
    const access = feature.properties?.Pub_Access;
    return {
      color: access === "RA" ? "#2f786c" : "#4f8f32",
      weight: 1,
      opacity: 0.72,
      fillColor: access === "RA" ? "#3b8c7e" : "#75ad37",
      fillOpacity: access === "RA" ? 0.16 : 0.18
    };
  },
  onEachFeature: (feature, layer) => {
    const props = feature.properties || {};
    const access = props.Pub_Access === "RA" ? "Restricted public access" : "Open public access";
    layer.bindPopup(`
      <div class="public-land-popup">
        <strong>${escapeHTML(props.Unit_Nm || "Public access land")}</strong>
        <span>${escapeHTML(access)}</span>
        <span>${escapeHTML(props.MngNm_Desc || props.MngTp_Desc || "Manager unknown")}</span>
      </div>
    `);
  }
});

if (state.publicLayerVisible) {
  state.publicLandLayer.addTo(map);
}

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

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initControls() {
  daySlider.max = String(getDaysInYear(ACTIVE_YEAR));
  daySlider.value = String(state.selectedDay);
  dateInput.value = getDateInputValue(getSelectedDate());
  dateInput.min = `${ACTIVE_YEAR}-01-01`;
  dateInput.max = `${ACTIVE_YEAR}-12-31`;

  speciesList.innerHTML = speciesCatalog.map((species) => `
    <label data-category="${species.category}">
      <span class="species-name">
        <input type="checkbox" name="species" value="${species.id}" checked>
        ${species.commonName}
      </span>
      <span class="type-pill ${species.category}">${species.category}</span>
    </label>
  `).join("");

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

  document.querySelectorAll("input[name='species']").forEach((input) => {
    input.addEventListener("change", render);
  });

  categoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      setSpeciesByCategory(input.value, input.checked);
      syncCategoryCheckboxes();
      render();
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

  publicLayerToggle.addEventListener("change", () => {
    state.publicLayerVisible = publicLayerToggle.checked;
    if (state.publicLayerVisible) {
      state.publicLandLayer.addTo(map);
      schedulePublicLandLoad();
    } else {
      state.publicLandLayer.remove();
    }
  });

  publicOnlyToggle.addEventListener("change", () => {
    state.publicOnly = publicOnlyToggle.checked;
    if (state.publicOnly) schedulePublicLandLoad();
    render();
  });

  orchardLayerToggle.addEventListener("change", () => {
    state.showOrchards = orchardLayerToggle.checked;
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

  document.querySelector("#charlottesvilleButton").addEventListener("click", () => {
    map.setView([38.0356, -78.5034], 13);
  });

  document.querySelector("#shenandoahButton").addEventListener("click", () => {
    map.setView([38.533, -78.35], 10);
  });

  map.on("moveend", () => {
    scheduleDataLoad();
    schedulePublicLandLoad();
  });
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

function getTaxonIds(species) {
  return species.inatTaxonIds || [];
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

function syncCategoryCheckboxes() {
  categoryInputs.forEach((input) => {
    const speciesInCategory = speciesCatalog.filter((species) => species.category === input.value);
    const selectedCount = speciesInCategory.filter((species) => getSpeciesInput(species.id)?.checked).length;
    input.checked = selectedCount === speciesInCategory.length;
    input.indeterminate = selectedCount > 0 && selectedCount < speciesInCategory.length;
  });
}

function renderSpeciesState() {
  const selectedSpecies = getCheckedValues("species");
  speciesCount.textContent = selectedSpecies.length;
  document.querySelectorAll(".species-list label").forEach((label) => {
    const input = label.querySelector("input[name='species']");
    label.classList.toggle("is-selected", input?.checked);
  });
  syncCategoryCheckboxes();
}

function isSpeciesAvailableOnSelectedDate(species) {
  return state.allSeasons || species.months.includes(getSelectedMonth());
}

function getVisibleRecords() {
  const selectedSpecies = getCheckedValues("species");

  return state.records.filter((record) => {
    const species = getSpecies(record.speciesId);
    if (!species) return false;
    if (!state.showOrchards && record.source === "nps-orchard") return false;
    if (state.publicOnly && !isRecordPubliclyAccessible(record)) return false;
    return isSpeciesAvailableOnSelectedDate(species)
      && selectedSpecies.includes(record.speciesId);
  });
}

function render() {
  renderSeasonControls();
  renderSpeciesState();
  renderHistogram();
  renderMarkers();
  scheduleDataLoad();
  if (state.publicLayerVisible || state.publicOnly) schedulePublicLandLoad();
  requestAnimationFrame(() => map.invalidateSize());
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

function markerIcon(category, source) {
  return L.divIcon({
    className: "forage-marker",
    html: `<span class="marker-dot ${category} ${source === "nps-orchard" ? "nps-orchard" : ""}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8]
  });
}

function renderMarkers() {
  state.markers.forEach((marker) => marker.remove());
  state.markers = [];

  const visibleRecords = getVisibleRecords();

  visibleRecords.forEach((record) => {
    const species = getSpecies(record.speciesId);
    const sourceText = sourceLabel(record.source);
    const sourceMarkup = record.sourceUrl
      ? `<a class="popup-source" href="${escapeHTML(record.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHTML(sourceText)}</a>`
      : `<span class="popup-source">${escapeHTML(sourceText)}</span>`;
    const accessNote = getRecordAccessNote(record);
    const warning = record.harvestStatus
      ? `<p class="popup-warning">${escapeHTML(record.harvestStatus)}: ${escapeHTML(record.accessNote || "Confirm site rules before harvesting.")}</p>`
      : "";
    const popup = `
      <p class="popup-title">${escapeHTML(species.commonName)}</p>
      <p class="popup-meta">${escapeHTML(record.observedName || species.commonName)} · ${escapeHTML(record.observedScientificName || species.scientificName)}</p>
      <dl class="popup-grid">
        <dt>Place</dt><dd>${escapeHTML(record.name)}</dd>
        <dt>Source</dt><dd>${sourceMarkup}</dd>
        <dt>Access</dt><dd>${escapeHTML(accessNote)}</dd>
        <dt>Season</dt><dd>${escapeHTML(getMonthRangeText(species.months))}</dd>
        <dt>Status</dt><dd>${escapeHTML(record.confidence)}</dd>
      </dl>
      ${warning}
      <p class="popup-note">${escapeHTML(record.note)}</p>
      <p class="popup-note"><strong>Limit note:</strong> ${escapeHTML(species.parkLimit)}</p>
    `;
    const marker = L.marker([record.lat, record.lng], {
      icon: markerIcon(species.category, record.source),
      title: `${species.commonName} - ${sourceText}`,
      riseOnHover: true,
      bubblingMouseEvents: false
    })
      .bindPopup(popup)
      .bindTooltip(species.commonName, {
        direction: "top",
        offset: [0, -8],
        opacity: 1
      });
    marker.on("click", () => marker.openPopup());
    marker.addTo(map);
    state.markers.push(marker);
  });
}

function scheduleDataLoad() {
  window.clearTimeout(state.loadTimer);
  state.loadTimer = window.setTimeout(loadMapData, DATA_REFRESH_DELAY);
}

async function loadMapData() {
  const requestId = state.activeRequest + 1;
  state.activeRequest = requestId;
  setDataStatus("Loading current map data...");

  try {
    const [inatRecords, fallingFruitRecords, npsOrchardRecords] = await Promise.all([
      loadINaturalist(),
      loadFallingFruit(),
      loadNpsOrchards()
    ]);

    if (requestId !== state.activeRequest) return;
    state.records = [...inatRecords, ...fallingFruitRecords, ...npsOrchardRecords];
    renderMarkers();
    setDataStatus(`${state.records.length} current records loaded`);
  } catch (error) {
    if (requestId !== state.activeRequest) return;
    state.records = [];
    renderMarkers();
    setDataStatus(`Could not load current data: ${error.message}`);
  }
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
    per_page: "120",
    order: "desc",
    order_by: "observed_on"
  });

  const response = await fetch(`https://api.inaturalist.org/v1/observations?${params.toString()}`);
  if (!response.ok) throw new Error(`iNaturalist returned ${response.status}`);
  const data = await response.json();
  return data.results
    .map(mapINaturalistObservation)
    .filter(Boolean);
}

async function loadFallingFruit() {
  if (state.fallingFruitRecords) {
    return state.fallingFruitRecords;
  }

  try {
    const response = await fetch("./data/falling-fruit-charlottesville.json");
    if (!response.ok) return [];
    const data = await response.json();
    state.fallingFruitRecords = data
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
  if (!state.publicLayerVisible && !state.publicOnly) return;

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
    const response = await fetch(`${PUBLIC_LANDS_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`PAD-US returned ${response.status}`);
    const data = await response.json();
    if (requestId !== state.activePublicRequest) return;
    state.publicLandFeatures = data.features || [];
    state.publicLayerLoadedKey = boundsKey;
    state.publicLandLayer.clearLayers();
    state.publicLandLayer.addData(state.publicLandFeatures);
    renderMarkers();
  } catch (error) {
    if (requestId !== state.activePublicRequest) return;
    state.publicLandFeatures = [];
    state.publicLandLayer.clearLayers();
  }
}

function mapINaturalistObservation(observation) {
  const coordinates = observation.geojson?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;

  const species = speciesCatalog.find((item) => {
    const taxon = observation.taxon;
    const ancestry = taxon?.ancestry ? taxon.ancestry.split("/").map(Number) : [];
    return getTaxonIds(item).some((taxonId) => taxon?.id === taxonId || ancestry.includes(taxonId));
  });

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
    sourceUrl: observation.uri || `https://www.inaturalist.org/observations/${observation.id}`,
    accessClass: "unknown",
    publicLand: false,
    accessNote: "Land access unknown from iNaturalist. Use the public lands layer and local rules before harvesting."
  };
}

function mapFallingFruitRecord(record) {
  const species = speciesCatalog.find((item) => item.id === record.speciesId);
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
    access: record.access || "",
    accessClass: record.accessClass || "unknown",
    publicLand: Boolean(record.publicLand),
    accessNote: record.accessNote || "Access unknown in Falling Fruit."
  };
}

function mapNpsOrchardRecord(record) {
  const species = speciesCatalog.find((item) => item.id === record.speciesId);
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
    access: record.access || "National Park Service",
    accessClass: record.accessClass || "restricted",
    publicLand: true,
    accessNote: record.accessNote || "NPS cultural landscape record. Do not take fruit or cuttings without park permission.",
    harvestStatus: record.harvestStatus || "Permission required"
  };
}

function getRecordAccessNote(record) {
  const landMatch = getContainingPublicLand(record);
  if (landMatch) {
    const access = landMatch.properties?.Pub_Access === "RA" ? "restricted public access" : "open public access";
    return `${access}: ${landMatch.properties?.Unit_Nm || "PAD-US public land"}`;
  }
  return record.accessNote || "Access unknown. Confirm ownership and rules before harvesting.";
}

function isRecordPubliclyAccessible(record) {
  if (record.publicLand && record.accessClass !== "private") return true;
  return Boolean(getContainingPublicLand(record));
}

function getContainingPublicLand(record) {
  if (!state.publicLandFeatures.length) return null;
  return state.publicLandFeatures.find((feature) => pointInFeature([record.lng, record.lat], feature));
}

function pointInFeature(point, feature) {
  const geometry = feature.geometry;
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((multiPolygon) => (
      multiPolygon.some((polygon) => pointInPolygon(point, polygon))
    ));
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
loadMapData();
