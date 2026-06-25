#!/usr/bin/env python3
"""Build data/minerals-arkansas.json for the site's Minerals map mode.

Emits an array of point records (the same flat shape as data/nps-historic-orchards.json)
that app.js loads via loadMinerals() and maps with mapMineralRecord(). Geographically
limited to the Ouachita / Hot Springs craft-stone belt of Arkansas for now.

Sources (all U.S. public domain - keep ATTRIBUTION.md in sync):
  - Locality points: USGS Mineral Resources Data System (MRDS), 2022 release.
    https://mrdata.usgs.gov/mrds/  (17 U.S.C. 105). No commodity code exists for
    novaculite/chert, so craft stone is recovered by commodity + free-text vetting:
    treat positions/categories as a curated seed, not authoritative.
  - "perm" land-manager classification derived from the USDA Forest Service
    Ouachita National Forest administrative boundary (public domain) plus a
    factual Crater of Diamonds State Park (Prairie Creek) assignment. No National
    Park Service points occur in this window. No ODbL/OSM geometry is used or shipped.

Re-run:  python3 scripts/build_minerals_data.py
"""
import csv, json, os, sys, tempfile, urllib.request, urllib.parse, zipfile

BBOX = (-94.6, 33.9, -92.3, 35.1)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "data", "minerals-arkansas.json")
CACHE = os.path.join(tempfile.gettempdir(), "mineral_mockup_cache")
os.makedirs(CACHE, exist_ok=True)
UA = "CraftAlmanac/1.0 (+https://craftalmanac)"

# MRDS material category -> catalog species id in app.js mineralSpeciesCatalog
SPECIES = {
    "Novaculite / whetstone": "mineral-novaculite",
    "Gemstone / diamond": "mineral-gemstone",
    "Quartz crystal": "mineral-quartz",
    "Soapstone (carving)": "mineral-soapstone",
    "Clay (pottery)": "mineral-clay",
    "Slate / dimension": "mineral-slate",
    "Silica (other)": "mineral-silica",
}
METALS = ("vanadium", "titanium", "manganese", "lead", "zinc", "iron",
          "mercury", "aluminum", "copper", "gold", "barium", "strontium")
# Crater of Diamonds State Park / Prairie Creek kimberlite, Murfreesboro AR (a
# documented public locality). Points within ~2.5 km are the state-park diatreme.
COD = (-93.6716, 34.0335)


def fetch(url, dest, binary=False):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    print(f"  fetching {url[:70]}...")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=240) as r:
        data = r.read()
    with open(dest, "wb" if binary else "w") as fh:
        fh.write(data if binary else data.decode("utf-8", "replace"))
    return dest


def mrds_csv_path():
    for cand in (os.path.join(CACHE, "mrds.csv"),
                 os.path.join(tempfile.gettempdir(), "mrds_csv", "mrds.csv")):
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
    is_metal = any(m in coms for m in METALS)
    if (not is_metal) and any(t in (coms + " " + free)
                              for t in ["novaculite", "whetstone", "oilstone", " hone", "abrasive"]):
        return "Novaculite / whetstone"
    if "diamond" in coms or "gemstone" in coms: return "Gemstone / diamond"
    if "quartz" in coms:                        return "Quartz crystal"
    if "soapstone" in coms or "steatite" in coms: return "Soapstone (carving)"
    if "clay" in coms:                          return "Clay (pottery)"
    if "slate" in coms:                         return "Slate / dimension"
    if "silica" in coms:                        return "Silica (other)"
    return None


def usfs_rings():
    dest = os.path.join(CACHE, "ouachita.geojson")
    fetch("https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?" +
          urllib.parse.urlencode({"where": "FORESTNAME='Ouachita National Forest'", "outFields": "FORESTNAME",
                                  "f": "geojson", "geometryPrecision": 4, "outSR": 4326}), dest)
    g = json.load(open(dest))["features"][0]["geometry"]
    return g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]


def in_poly(pt, polys):
    x, y = pt
    for poly in polys:
        outer, inside, n = poly[0], False, len(poly[0])
        j = n - 1
        for i in range(n):
            xi, yi = outer[i][0], outer[i][1]
            xj, yj = outer[j][0], outer[j][1]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi:
                inside = not inside
            j = i
        if inside:
            return True
    return False


def main():
    print("Loading MRDS...")
    usfs = usfs_rings()
    recs, seen = [], set()
    with open(mrds_csv_path(), encoding="latin-1") as fh:
        for r in csv.DictReader(fh):
            if r.get("state") != "Arkansas":
                continue
            try:
                lon, lat = float(r["longitude"]), float(r["latitude"])
            except ValueError:
                continue
            if not (BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3]):
                continue
            c = categorize(r)
            if not c:
                continue
            key = (round(lon, 4), round(lat, 4), c)
            if key in seen:
                continue
            seen.add(key)
            # land-manager classification (public-domain boundaries / factual locality)
            if abs(lon - COD[0]) < 0.03 and abs(lat - COD[1]) < 0.023:
                perm = "State park"
            elif in_poly((lon, lat), usfs):
                perm = "USFS"
            else:
                perm = "Private / other"
            recs.append({
                "id": f"mrds-{r['dep_id']}",
                "speciesId": SPECIES[c],
                "lat": round(lat, 5),
                "lng": round(lon, 5),
                "name": r["site_name"] or "Unnamed occurrence",
                "county": r["county"] or "",
                "url": r["url"],
                "perm": perm,
            })
    with open(OUT, "w") as fh:
        json.dump(recs, fh, indent=0)
    from collections import Counter
    print(f"Wrote {OUT} ({os.path.getsize(OUT)//1024} KB, {len(recs)} records)")
    print("  by material:", dict(Counter(r["speciesId"].replace("mineral-", "") for r in recs)))
    print("  by perm:    ", dict(Counter(r["perm"] for r in recs)))


if __name__ == "__main__":
    sys.exit(main())
