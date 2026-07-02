#!/usr/bin/env python3
"""Build data/minerals-us.json for the site's Minerals map mode (contiguous US).

Emits point records (the same flat shape as data/nps-historic-orchards.json) that
app.js loads via loadMinerals() and maps with mapMineralRecord(). Covers the
contiguous United States, filtered to craft-relevant stone/mineral commodities.

Sources (all U.S. public domain - keep ATTRIBUTION.md in sync):
  - Locality points: USGS Mineral Resources Data System (MRDS), 2022 release.
    https://mrdata.usgs.gov/mrds/  (17 U.S.C. 105). Craft stone is recovered by
    commodity + free-text vetting; treat positions/categories as a curated seed.
  - Land-manager "perm" from point-in-polygon against NPS unit boundaries (NPS Land
    Resources Division) and USDA Forest Service administrative boundaries, plus a few
    hardcoded factual special cases (Crater of Diamonds SP; pipestone/catlinite =
    culturally restricted / tribal). Default is "Private / other" (verify) wherever no
    boundary matches. NOTE: national BLM Surface-Management-Agency polygons are too
    large to fetch here, so BLM public land (where casual rockhounding is generally
    allowed) currently defaults to "Private / other" (conservative); adding BLM SMA is
    the next refinement. Occurrence is never collecting permission.

Re-run:  python3 scripts/build_minerals_data.py
"""
import csv, json, os, sys, tempfile, urllib.request, urllib.parse, zipfile
from collections import Counter, defaultdict

CONUS = (-125.0, 24.4, -66.9, 49.5)
CONTIGUOUS = {
    "Alabama", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "District of Columbia", "Florida", "Georgia", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
    "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
    "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
}
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "data", "minerals-us.json")
CACHE = os.path.join(tempfile.gettempdir(), "mineral_us_cache")
os.makedirs(CACHE, exist_ok=True)
UA = "CraftAlmanac/1.0 (+https://craftalmanac)"

GRID = 0.05           # dedup grid (deg) per category to thin dense districts (~5 km)
PER_CAT_CAP = 500     # cap per material so widespread clays/etc. don't flood the map

# MRDS material category -> catalog species id in app.js mineralSpeciesCatalog
SPECIES = {
    "Pipestone (catlinite)": "mineral-pipestone",
    "Alabaster (gypsum)": "mineral-alabaster",
    "Serpentine": "mineral-serpentine",
    "Soapstone (carving)": "mineral-soapstone",
    "Marble (carving)": "mineral-marble",
    "Limestone (carving)": "mineral-limestone",
    "Slate / dimension": "mineral-slate",
    "Obsidian (knapping)": "mineral-obsidian",
    "Silica (other)": "mineral-silica",
    "Novaculite / whetstone": "mineral-novaculite",
    "Quartz crystal": "mineral-quartz",
    "Agate / jasper": "mineral-agate",
    "Petrified wood": "mineral-petrified-wood",
    "Gemstone / diamond": "mineral-gemstone",
    "Clay (pottery)": "mineral-clay",
}
METALS = ("vanadium", "titanium", "manganese", "lead", "zinc", "iron",
          "mercury", "aluminum", "copper", "gold", "barium", "strontium",
          "silver", "tungsten", "molybdenum", "nickel", "cobalt", "uranium")
# Crater of Diamonds State Park / Prairie Creek kimberlite, Murfreesboro AR.
COD = (-93.6716, 34.0335)
# Novaculite Uplift + Hot Springs counties: regional "Silica" here is novaculite.
UPLIFT_COUNTIES = {"Garland", "Hot Spring", "Montgomery", "Polk", "Pike", "Saline"}
# Named commercial pay-to-dig operators (esp. Mount Ida quartz district).
FEE_DIG = ("wegner", "coleman", "starfire", "fiddler", "crystal mountain",
           "crystal pyramid", "sweet surrender", "board camp", "twin creek", "avant")
DIMENSION_HINTS = ("dimension", "building stone", "ornamental", "freestone",
                   "carv", "statuary", "monument")


def fetch(url, dest, binary=False):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    print(f"  fetching {url[:80]}...")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r:
        data = r.read()
    with open(dest, "wb" if binary else "w") as fh:
        fh.write(data if binary else data.decode("utf-8", "replace"))
    return dest


def mrds_csv_path():
    for cand in (os.path.join(CACHE, "mrds.csv"),
                 os.path.join(tempfile.gettempdir(), "mineral_mockup_cache", "mrds.csv")):
        if os.path.exists(cand):
            return cand
    zp = os.path.join(CACHE, "mrds-csv.zip")
    fetch("https://mrdata.usgs.gov/mrds/mrds-csv.zip", zp, binary=True)
    with zipfile.ZipFile(zp) as z:
        z.extractall(CACHE)
    return os.path.join(CACHE, "mrds.csv")


def categorize(r):
    coms = " ".join(filter(None, [r["commod1"], r["commod2"], r["commod3"]])).lower()
    free = " ".join(filter(None, [r["site_name"], r["names"], r["dep_type"],
                                  r["ore"], r["gangue"], r["other_matl"]])).lower()
    both = coms + " " + free
    if "wavellite" in both:
        return None  # collector/display mineral, no craft use
    is_metal = any(m in coms for m in METALS)
    # pipestone / catlinite first (a clay, but culturally distinct)
    if "pipestone" in both or "catlinite" in both:
        return "Pipestone (catlinite)"
    # carving stones
    if "gypsum" in coms or "alabaster" in both or "anhydrite" in coms:
        return "Alabaster (gypsum)"
    if "serpentin" in both:
        return "Serpentine"
    if ("talc" in coms or "soapstone" in both or "steatite" in both
            or "pyrophyllite" in coms):
        return "Soapstone (carving)"
    if "marble" in both:
        return "Marble (carving)"
    # whetstone / knapping toolstone
    if (not is_metal) and any(t in both for t in [
            "novaculite", "whetstone", "oilstone", " hone", "honestone",
            "arkansas stone", "washita"]):
        return "Novaculite / whetstone"
    if "obsidian" in both or "volcanic glass" in both:
        return "Obsidian (knapping)"
    if "chert" in both or "flint" in both:
        return "Silica (other)"
    # lapidary
    if "petrified" in both or ("silicified" in both and "wood" in both):
        return "Petrified wood"
    if "agate" in both or "chalcedony" in both or "jasper" in both:
        return "Agate / jasper"
    if "diamond" in coms or "gemstone" in coms:
        return "Gemstone / diamond"
    if "quartz" in coms and not is_metal:
        return "Quartz crystal"
    # clay, slate, dimension limestone
    if "kaolin" in coms or "ball clay" in both or "clay" in coms:
        return "Clay (pottery)"
    if "slate" in coms:
        return "Slate / dimension"
    if "limestone" in coms and any(t in both for t in DIMENSION_HINTS):
        return "Limestone (carving)"
    if "silica" in coms:
        if (not is_metal) and r["county"] in UPLIFT_COUNTIES:
            return "Novaculite / whetstone"
        return "Silica (other)"
    return None


# ---- boundary layers (point-in-polygon land-manager assignment) ----

def _rings_of(geom):
    """Return a list of polygons, each a list of rings (ring = list of [x,y])."""
    if not geom:
        return []
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return list(geom["coordinates"])
    return []


def _bbox_of(polys):
    xs, ys = [], []
    for poly in polys:
        for x, y in poly[0]:
            xs.append(x); ys.append(y)
    return (min(xs), min(ys), max(xs), max(ys)) if xs else (0, 0, 0, 0)


def fetch_layer(name, url):
    dest = os.path.join(CACHE, name + ".geojson")
    fetch(url, dest)
    gj = json.load(open(dest))
    feats = []
    for f in gj.get("features", []):
        polys = _rings_of(f.get("geometry"))
        if polys:
            feats.append((_bbox_of(polys), polys))
    print(f"  {name}: {len(feats)} polygons")
    return feats


def _ring_contains(x, y, ring):
    inside, n, j = False, len(ring), len(ring) - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi:
            inside = not inside
        j = i
    return inside


def in_layer(pt, feats):
    x, y = pt
    for (minx, miny, maxx, maxy), polys in feats:
        if x < minx or x > maxx or y < miny or y > maxy:
            continue
        for poly in polys:
            if _ring_contains(x, y, poly[0]):
                hole = any(_ring_contains(x, y, r) for r in poly[1:])
                if not hole:
                    return True
    return False


def main():
    print("Fetching land-manager boundaries...")
    nps = fetch_layer("nps_boundary",  # layer 2 = boundary polygons (layer 0 is centroids)
        "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/"
        "NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?"
        + urllib.parse.urlencode({"where": "1=1", "outFields": "UNIT_NAME", "f": "geojson",
                                  "outSR": 4326, "geometryPrecision": 4, "resultRecordCount": 2000}))
    usfs = fetch_layer("usfs_forests",
        "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?"
        + urllib.parse.urlencode({"where": "1=1", "outFields": "FORESTNAME", "f": "geojson",
                                  "outSR": 4326, "geometryPrecision": 4, "resultRecordCount": 2000}))

    print("Loading MRDS (contiguous US)...")
    by_cat = defaultdict(list)
    seen = set()
    with open(mrds_csv_path(), encoding="latin-1") as fh:
        for r in csv.DictReader(fh):
            if r.get("state") not in CONTIGUOUS:
                continue
            try:
                lon, lat = float(r["longitude"]), float(r["latitude"])
            except (ValueError, TypeError):
                continue
            if not (CONUS[0] <= lon <= CONUS[2] and CONUS[1] <= lat <= CONUS[3]):
                continue
            c = categorize(r)
            if not c:
                continue
            key = (round(lon / GRID), round(lat / GRID), c)
            if key in seen:
                continue
            seen.add(key)
            by_cat[c].append((lon, lat, r))

    # cap per category, keeping a geographically even spread (grid-deduped already)
    recs = []
    for c, rows in by_cat.items():
        if len(rows) > PER_CAT_CAP:
            step = len(rows) / PER_CAT_CAP
            rows = [rows[int(i * step)] for i in range(PER_CAT_CAP)]
        for lon, lat, r in rows:
            # perm precedence: NPS ban > pipestone (tribal) > Crater > USFS > private
            if in_layer((lon, lat), nps):
                perm = "NPS"
            elif c == "Pipestone (catlinite)":
                perm = "Tribal"
            elif (c == "Gemstone / diamond"
                  and abs(lon - COD[0]) < 0.03 and abs(lat - COD[1]) < 0.023):
                perm = "State park"
            elif in_layer((lon, lat), usfs):
                perm = "USFS"
                name_text = ((r["site_name"] or "") + " " + (r["names"] or "")).lower()
                if any(op in name_text for op in FEE_DIG):
                    perm = "Claimed / fee-dig"
            else:
                perm = "Private / other"
            recs.append({
                "id": f"mrds-{r['dep_id']}",
                "speciesId": SPECIES[c],
                "lat": round(lat, 5),
                "lng": round(lon, 5),
                "name": r["site_name"] or "Unnamed occurrence",
                "county": r["county"] or "",
                "state": r["state"] or "",
                "url": r["url"],
                "perm": perm,
            })

    recs.sort(key=lambda x: x["id"])
    with open(OUT, "w") as fh:
        json.dump(recs, fh, indent=0)
    print(f"Wrote {OUT} ({os.path.getsize(OUT)//1024} KB, {len(recs)} records)")
    print("  by material:", dict(Counter(r["speciesId"].replace("mineral-", "") for r in recs)))
    print("  by perm:    ", dict(Counter(r["perm"] for r in recs)))
    print("  by state:   ", len(set(r["state"] for r in recs)), "states")


if __name__ == "__main__":
    sys.exit(main())
