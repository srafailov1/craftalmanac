#!/usr/bin/env python3
"""Build the data file for prototype/mineral-map-mockup.html.

A scoping mockup for a future "Objects / 3D materials" map: real stone & mineral
craft-material localities for the Ouachita / Hot Springs region of Arkansas,
layered with a land-manager permission overlay.

Data sources (all redistributable):
  - Locality points: USGS Mineral Resources Data System (MRDS), 2022 release.
    U.S. public domain (17 U.S.C. 105). https://mrdata.usgs.gov/mrds/
    NOTE: MRDS is an economic-mining inventory with no commodity code for
    novaculite/chert; craft stone is recovered by commodity + free-text vetting,
    so positions and categories are a *curated seed*, not authoritative.
  - Ouachita National Forest boundary: USDA Forest Service EDW (public domain).
  - Hot Springs NP & Crater of Diamonds SP boundaries: (c) OpenStreetMap
    contributors, ODbL, via the Nominatim search API.

Output: prototype/mineral-map-data.js  ->  window.MINERAL_DATA = {meta, points, boundaries}

Re-run:  python3 scripts/build_mineral_mockup.py
The 25 MB MRDS archive is cached under the system temp dir between runs.
"""
import csv, json, os, sys, time, tempfile, urllib.request, urllib.parse, zipfile

BBOX = (-94.6, 33.9, -92.3, 35.1)        # west-central AR craft-stone belt
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT  = os.path.join(ROOT, "prototype", "mineral-map-data.js")
CACHE = os.path.join(tempfile.gettempdir(), "mineral_mockup_cache")
os.makedirs(CACHE, exist_ok=True)
UA = "CraftAlmanac-mockup/1.0 (research; contact sasson.rafailov@gmail.com)"

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
    # reuse an existing extract if present, else download + unzip
    for cand in (os.path.join(CACHE, "mrds.csv"),
                 os.path.join(tempfile.gettempdir(), "mrds_csv", "mrds.csv")):
        if os.path.exists(cand):
            return cand
    zp = os.path.join(CACHE, "mrds-csv.zip")
    fetch("https://mrdata.usgs.gov/mrds/mrds-csv.zip", zp, binary=True)
    with zipfile.ZipFile(zp) as z:
        z.extractall(CACHE)
    return os.path.join(CACHE, "mrds.csv")

METALS = ("vanadium", "titanium", "manganese", "lead", "zinc", "iron",
          "mercury", "aluminum", "copper", "gold", "barium", "strontium")

def categorize(r):
    coms = " ".join(filter(None, [r["commod1"], r["commod2"], r["commod3"]])).lower()
    free = " ".join(filter(None, [r["site_name"], r["names"], r["dep_type"],
                                  r["ore"], r["gangue"], r["other_matl"]])).lower()
    is_metal = any(m in coms for m in METALS)
    # Genuine craft whetstone/abrasive PRODUCT (not a metal prospect that merely
    # sits in the novaculite formation) -> the only honest "novaculite" tag MRDS
    # supports. Most real novaculite is still hidden in the "Silica" bucket below.
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

def load_points(csv_path):
    feats, seen = [], set()
    with open(csv_path, encoding="latin-1") as fh:
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
            feats.append({"type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(lon, 5), round(lat, 5)]},
                "properties": {
                    "name": r["site_name"] or "Unnamed occurrence", "cat": c,
                    "commod": "; ".join(filter(None, [r["commod1"], r["commod2"], r["commod3"]])) or "-",
                    "status": r["dev_stat"] or "-", "optype": r["oper_type"] or "-",
                    "county": r["county"] or "-",
                    "host": (r["hrock_unit"] or r["hrock_type"] or "-")[:80], "url": r["url"]}})
    return feats

def boundary(name, url, props):
    dest = os.path.join(CACHE, name + ".geojson")
    fetch(url, dest)
    fc = json.load(open(dest))
    geom = fc["features"][0]["geometry"] if "features" in fc else fc.get("geojson", fc.get("geometry"))
    return {"type": "Feature", "properties": props, "geometry": geom}

def nominatim(name, query, props):
    dest = os.path.join(CACHE, name + "_nom.json")
    if not os.path.exists(dest):
        time.sleep(1.2)  # be polite to Nominatim
        fetch("https://nominatim.openstreetmap.org/search?" +
              urllib.parse.urlencode({"q": query, "format": "json", "polygon_geojson": 1, "limit": 1}), dest)
    d = json.load(open(dest))
    return {"type": "Feature", "properties": props, "geometry": d[0]["geojson"]}

def rings(geom):
    if geom["type"] == "Polygon":      return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon": return geom["coordinates"]
    return []

def point_in(pt, polys):
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

RULES = {
    "NPS": "Collecting PROHIBITED in all units (36 CFR 2.1). The food-gathering exception does NOT cover rocks/minerals.",
    "State park": "Generally prohibited in state parks - EXCEPT here: Crater of Diamonds lets you dig & keep gems (finders-keepers). Always park-specific.",
    "USFS": "Rockhounding (quartz, novaculite, etc.) generally allowed for personal/noncommercial use under free use; not in wilderness/special areas; no claims conflict.",
    "Private / other": "No public collecting right. Most points sit on private, leased, or claimed ground - written landowner permission required.",
}

def main():
    print("Loading MRDS...")
    pts = load_points(mrds_csv_path())
    print(f"  {len(pts)} craft-stone points in bbox")
    print("Fetching permission boundaries...")
    usfs = boundary("ouachita",
        "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?" +
        urllib.parse.urlencode({"where": "FORESTNAME='Ouachita National Forest'", "outFields": "FORESTNAME",
                                "f": "geojson", "geometryPrecision": 4, "outSR": 4326}),
        {"name": "Ouachita National Forest", "mgr": "USFS"})
    nps = nominatim("hosp", "Hot Springs National Park, Arkansas",
                    {"name": "Hot Springs National Park", "mgr": "NPS"})
    state = nominatim("cod", "Crater of Diamonds State Park",
                      {"name": "Crater of Diamonds State Park", "mgr": "State park"})
    managers = [("NPS", rings(nps["geometry"])),
                ("State park", rings(state["geometry"])),
                ("USFS", rings(usfs["geometry"]))]
    units = {"NPS": nps["properties"]["name"], "State park": state["properties"]["name"],
             "USFS": usfs["properties"]["name"]}
    from collections import Counter
    pc = Counter()
    for f in pts:
        c = f["geometry"]["coordinates"]
        mgr = "Private / other"
        for code, polys in managers:
            if point_in(c, polys):
                mgr = code
                break
        f["properties"].update(perm=mgr, permUnit=units.get(mgr, ""), permRule=RULES[mgr])
        pc[mgr] += 1

    meta = {
        "title": "Stone & Mineral materials - Ouachita / Hot Springs, Arkansas (mockup)",
        "sources": [
            "Locality points: USGS Mineral Resources Data System (MRDS), 2022 release - U.S. public domain. Filtered to craft-relevant commodities; positional accuracy varies.",
            "Permission boundaries: Ouachita NF - USDA Forest Service (public domain); Hot Springs NP & Crater of Diamonds SP - (c) OpenStreetMap contributors (ODbL), via Nominatim.",
        ],
        "caveats": [
            "OCCURRENCE IS NOT PERMISSION. A point only means a material was recorded there - not that collecting is legal. Verify the land manager and local rules first.",
            "Novaculite (the Arkansas whetstone) has NO MRDS commodity code - it is mostly lumped under \"Silica\"; only sites whose records explicitly name hones/whetstones surface here.",
            "ARPA: toolstone outcrops are often archaeological sites. Never collect at artifact/quarry sites; this mockup maps geologic occurrences only.",
            "Mining claims & mineral withdrawals (not shown) can remove collecting rights even on USFS/BLM land - the mandatory \"subtract\" layer in production.",
        ],
    }
    out = {"meta": meta, "points": {"type": "FeatureCollection", "features": pts},
           "boundaries": {"NPS": nps, "State park": state, "USFS": usfs}}
    with open(OUT, "w") as fh:
        fh.write("window.MINERAL_DATA = " + json.dumps(out) + ";\n")
    print(f"Wrote {OUT} ({os.path.getsize(OUT)//1024} KB, {len(pts)} points)")
    for k, v in pc.most_common():
        print(f"  {v:3d}  {k}")

if __name__ == "__main__":
    sys.exit(main())
