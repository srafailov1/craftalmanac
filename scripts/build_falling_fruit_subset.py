#!/usr/bin/env python3
import argparse
import bz2
import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# The Falling Fruit CSV archives are the ONLY input this dataset can be rebuilt
# from — archive them somewhere durable (not ~/Downloads) and record the
# snapshot date in ATTRIBUTION.md whenever they are refreshed.
_parser = argparse.ArgumentParser(description="Rebuild Falling Fruit viewport chunks")
_parser.add_argument("--types", default="/Users/sasson/Downloads/types.csv.bz2",
                     help="Path to the Falling Fruit types.csv.bz2 archive")
_parser.add_argument("--locations", default="/Users/sasson/Downloads/locations.csv.bz2",
                     help="Path to the Falling Fruit locations.csv.bz2 archive")
_cli = _parser.parse_args()
TYPES_PATH = Path(_cli.types)
LOCATIONS_PATH = Path(_cli.locations)
OUTPUT_DIR = ROOT / "data" / "falling-fruit" / "us"
CHUNKS_DIR = OUTPUT_DIR / "chunks"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
SUMMARY_PATH = OUTPUT_DIR / "summary.json"
STATE_BOUNDARY_PATH = ROOT / "data" / "contiguous-us-states.json"
# 0.15 keeps worst-case metro viewports at zoom 8 under the app's chunk-request
# cap; the original 0.05 grid intersected 300+ files and dropped all records.
CHUNK_SIZE_DEGREES = 0.15
CHUNK_AXIS_SCALE = 100
RECORD_FIELDS = [
    "id",
    "speciesId",
    "name",
    "observedName",
    "observedScientificName",
    "lat",
    "lng",
    "note",
    "confidence",
    "sourceUrl",
    "idDate",
    "access",
    "accessClass",
    "publicLand",
    "accessNote",
]

# Contiguous U.S. browser subset. The state polygons are checked after this
# broad bounding-box screen so Alaska, Hawaii, and territories are excluded.
BOUNDS = {
    "south": 24.0,
    "north": 49.6,
    "west": -125.2,
    "east": -66.8,
}

RULES = [
    ("ink-oak", r"\b(oak|acorn|acorns)\b|\bQuercus\b"),
    ("ink-goldenrod", r"\bgoldenrod\b|\bSolidago\b"),
    ("ink-osage-orange", r"\b(osage orange|osage-orange|hedge apple)\b|\bMaclura pomifera\b"),
    ("ink-pokeweed", r"\b(pokeweed|pokeberry|inkberry)\b|\bPhytolacca americana\b"),
    ("ink-autumn-olive", r"\bautumn olive\b|\bElaeagnus umbellata\b"),
    ("ink-privet", r"\bprivet\b|\bLigustrum\b"),
    ("morel", r"\b(Morchella|morel)\b"),
    ("blueberry", r"\bblueberr(y|ies)\b|Vaccinium corymbosum|Vaccinium pallidum"),
    ("wineberry", r"\bwineberr(y|ies)\b|Rubus phoenicolasius"),
    ("blackberry", r"\b(blackberry|dewberry|boysenberry|loganberry)\b|Rubus (allegheniensis|argutus|armeniacus|laciniatus|fruticosus)"),
    ("raspberry", r"\b(black raspberry|red raspberry|raspberry)\b|Rubus (occidentalis|idaeus)"),
    ("grape", r"\bgrape\b|\bVitis\b"),
    ("elderberry", r"\belderberr(y|ies)\b|\belderflower\b|\bSambucus\b"),
    ("ribes", r"\b(currant|gooseberry|redcurrant|blackcurrant|whitecurrant|jostaberry)\b|\bRibes\b"),
    ("huckleberry", r"\bhuckleberr(y|ies)\b|\bGaylussacia\b"),
    ("cornelian-cherry", r"\bCornelian cherr(y|ies)\b|\bCornus mas\b"),
    ("sour-cherry", r"\bsour cherr(y|ies)\b|Prunus cerasus"),
    ("sweet-cherry", r"\b(sweet cherr(y|ies)|wild cherr(y|ies))\b|Prunus avium"),
    ("black-cherry", r"\bblack cherr(y|ies)\b|Prunus serotina"),
    ("plum", r"\b(plum|prune)\b|Prunus (americana|mexicana)"),
    ("serviceberry", r"\b(serviceberry|juneberry)\b|\bAmelanchier\b"),
    ("wild-strawberry", r"\bstrawberr(y|ies)\b|\bFragaria\b"),
    ("persimmon", r"\bpersimmon\b|\bDiospyros\b"),
    ("pawpaw", r"\bpawpaw\b|\bpaw paw\b|\bAsimina triloba\b"),
    ("sumac", r"\bsumac\b|\bRhus\b"),
    ("black-walnut", r"\bblack walnut\b|Juglans nigra"),
    ("hickory", r"\bhickory\b|\bCarya\b"),
    ("hazelnut", r"\b(hazel|hazelnut|filbert)\b|\bCorylus\b"),
    ("apple", r"\bapple\b|\bMalus\b"),
    ("pear", r"\bpear\b|\bPyrus\b"),
    ("peach", r"\bpeach\b|Prunus persica"),
    ("fig", r"\bfig(s)?\b|\bFicus carica\b"),
]

EXCLUDE = re.compile(
    r"dumpster|pineapple|rose apple|wax apple|wood apple|custard apple|"
    r"sugar-apple|star apple|mayapple|pineappleweed|pineapple weed|"
    r"prickly pear|pearlbush|sea grape|oregon-grape|peach-palm|"
    r"peachleaf willow|ornamental|flowering|yew plum|plum-pine|mombin|"
    r"hog plum|gooseberry gourd|barbados gooseberry|star gooseberry|"
    r"Aristotelia|New Zealand wineberry|witch-?hazel|Hamamelis|"
    r"cherry birch|Betula lenta|"
    r"mock strawberry|strawberry tree|Arbutus|poison sumac|"
    r"Toxicodendron vernix|African sumac|Rhus lancea|"
    r"indian fig|cactus fig|opuntia|ficus-indica",
    re.I,
)


def read_types():
    compiled_rules = [(species_id, re.compile(pattern, re.I)) for species_id, pattern in RULES]
    matched = {}
    parent_by_id = {}
    type_text_by_id = {}
    type_info_by_id = {}

    with bz2.open(TYPES_PATH, "rt", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            type_id = int(row["id"])
            parent_by_id[type_id] = int(row["parent_id"]) if row["parent_id"] else None
            text = " ".join(
                row.get(key, "") or ""
                for key in ["scientific_name", "taxonomic_rank", "en_name", "en_synonyms"]
            )
            type_text_by_id[type_id] = text
            type_info_by_id[type_id] = {
                "name": row.get("en_name") or row.get("scientific_name") or f"Type {type_id}",
                "scientificName": row.get("scientific_name") or "",
            }

            if EXCLUDE.search(text):
                continue

            for species_id, pattern in compiled_rules:
                if pattern.search(text):
                    matched[type_id] = species_id
                    break

    for type_id, text in type_text_by_id.items():
        if type_id in matched or EXCLUDE.search(text):
            continue
        parent_id = parent_by_id.get(type_id)
        while parent_id:
            if parent_id in matched:
                matched[type_id] = matched[parent_id]
                break
            parent_id = parent_by_id.get(parent_id)

    return matched, type_info_by_id


def in_bounds(lat, lng):
    return (
        BOUNDS["south"] <= lat <= BOUNDS["north"]
        and BOUNDS["west"] <= lng <= BOUNDS["east"]
    )


def read_state_boundaries():
    data = json.loads(STATE_BOUNDARY_PATH.read_text(encoding="utf-8"))
    states = []
    for state in data["states"]:
        polygons = state["geometry"]["coordinates"]
        states.append({
            "id": state["id"],
            "name": state["name"],
            "bbox": state["bbox"],
            "polygons": [
                {
                    "rings": polygon,
                    "bbox": get_ring_bbox(polygon[0]),
                }
                for polygon in polygons
                if polygon
            ],
        })
    return states


def get_point_state_id(lat, lng, states):
    point = (lng, lat)
    for state in states:
        if not point_in_bbox(point, state["bbox"]):
            continue
        if any(
            point_in_bbox(point, polygon["bbox"])
            and point_in_polygon(point, polygon["rings"])
            for polygon in state["polygons"]
        ):
            return state["id"]
    return None


def get_ring_bbox(ring):
    lngs = [point[0] for point in ring]
    lats = [point[1] for point in ring]
    return (min(lngs), min(lats), max(lngs), max(lats))


def point_in_bbox(point, bbox):
    lng, lat = point
    west, south, east, north = bbox
    return west <= lng <= east and south <= lat <= north


def point_in_polygon(point, polygon):
    if not polygon or not point_in_ring(point, polygon[0]):
        return False
    return not any(point_in_ring(point, hole) for hole in polygon[1:])


def point_in_ring(point, ring):
    x, y = point
    inside = False
    j = len(ring) - 1
    for i, (xi, yi) in enumerate(ring):
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and x < ((xj - xi) * (y - yi)) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def clean_note(row, type_name):
    pieces = []
    if row.get("description"):
        pieces.append(row["description"].strip())
    if row.get("access"):
        pieces.append(f"Access: {row['access'].strip()}.")
    if row.get("season_start") or row.get("season_stop"):
        start = row.get("season_start") or "unknown"
        stop = row.get("season_stop") or "unknown"
        pieces.append(f"Falling Fruit season: {start}-{stop}.")
    if not pieces:
        pieces.append(f"Falling Fruit record for {type_name}.")
    return " ".join(pieces)[:260]


def classify_access(access):
    text = (access or "").strip().lower()
    if not text:
        return {
            "access": "",
            "accessClass": "unknown",
            "publicLand": False,
            "accessNote": "Access unknown in Falling Fruit."
        }
    if "public" in text and "private" not in text:
        return {
            "access": access.strip(),
            "accessClass": "open",
            "publicLand": True,
            "accessNote": f"Falling Fruit access: {access.strip()}."
        }
    if "public" in text and "private" in text:
        return {
            "access": access.strip(),
            "accessClass": "restricted",
            "publicLand": True,
            "accessNote": f"Falling Fruit access: {access.strip()}."
        }
    if "private" in text or "permission" in text:
        return {
            "access": access.strip(),
            "accessClass": "private",
            "publicLand": False,
            "accessNote": f"Falling Fruit access: {access.strip()}."
        }
    return {
        "access": access.strip(),
        "accessClass": "unknown",
        "publicLand": False,
        "accessNote": f"Falling Fruit access: {access.strip()}."
    }


def build_subset():
    type_to_species, type_info = read_types()
    state_boundaries = read_state_boundaries()
    state_lookup = {state["id"]: state for state in state_boundaries}
    records_by_chunk = {}
    counts_by_chunk = {}
    counts_by_state = {state["id"]: Counter() for state in state_boundaries}
    centroid_sums_by_chunk = {}
    centroid_sums_by_state = {}
    seen = set()
    skipped_hidden = 0
    scanned = 0
    matched_locations = 0

    with bz2.open(LOCATIONS_PATH, "rt", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            scanned += 1
            if row.get("hidden") == "true":
                skipped_hidden += 1
                continue
            try:
                lat = float(row["lat"])
                lng = float(row["lng"])
            except (TypeError, ValueError):
                continue
            if not in_bounds(lat, lng):
                continue

            type_ids = [
                int(value)
                for value in re.split(r"[,; ]+", row.get("type_ids") or "")
                if value.isdigit() and int(value) in type_to_species
            ]
            if not type_ids:
                continue
            state_id = get_point_state_id(lat, lng, state_boundaries)
            if not state_id:
                continue
            matched_locations += 1
            chunk_id = get_chunk_id(lat, lng)

            for type_id in type_ids:
                species_id = type_to_species[type_id]
                key = (chunk_id, row["id"], species_id, type_id)
                if key in seen:
                    continue
                seen.add(key)
                info = type_info[type_id]
                record_name = row.get("address") or info["name"] or "Falling Fruit record"
                access = classify_access(row.get("access"))
                record = {
                    "id": f"{row['id']}-{type_id}",
                    "speciesId": species_id,
                    "name": record_name,
                    "observedName": info["name"],
                    "observedScientificName": info["scientificName"],
                    "lat": lat,
                    "lng": lng,
                    "note": clean_note(row, info["name"]),
                    "confidence": "community",
                    "sourceUrl": f"https://fallingfruit.org/locations/{row['id']}",
                    "idDate": row.get("updated_at") or row.get("created_at") or "",
                    **access,
                }
                records_by_chunk.setdefault(chunk_id, []).append([record.get(field, "") for field in RECORD_FIELDS])
                counts_by_chunk.setdefault(chunk_id, Counter())[species_id] += 1
                counts_by_state[state_id][species_id] += 1
                centroid_sums_by_chunk.setdefault(chunk_id, {}).setdefault(species_id, [0.0, 0.0, 0])
                centroid_sums_by_chunk[chunk_id][species_id][0] += lng
                centroid_sums_by_chunk[chunk_id][species_id][1] += lat
                centroid_sums_by_chunk[chunk_id][species_id][2] += 1
                centroid_sums_by_state.setdefault(state_id, {}).setdefault(species_id, [0.0, 0.0, 0])
                centroid_sums_by_state[state_id][species_id][0] += lng
                centroid_sums_by_state[state_id][species_id][1] += lat
                centroid_sums_by_state[state_id][species_id][2] += 1

    manifest_chunks = []
    manifest_states = []
    total_records = 0
    counts = Counter()

    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    for stale_path in CHUNKS_DIR.glob("*.json"):
        stale_path.unlink()

    for chunk_id, records in records_by_chunk.items():
        species_index = RECORD_FIELDS.index("speciesId")
        lat_index = RECORD_FIELDS.index("lat")
        lng_index = RECORD_FIELDS.index("lng")
        id_index = RECORD_FIELDS.index("id")
        records.sort(key=lambda item: (item[species_index], item[lat_index], item[lng_index], item[id_index]))
        (CHUNKS_DIR / f"{chunk_id}.json").write_text(json.dumps(records, separators=(",", ":")), encoding="utf-8")
        total_records += len(records)
        counts.update(record[species_index] for record in records)
        manifest_chunks.append({
            "id": chunk_id,
            "bbox": get_chunk_bbox(chunk_id),
            "recordCount": len(records),
            "countsBySpeciesId": dict(sorted(counts_by_chunk[chunk_id].items())),
            "centroidsBySpeciesId": get_centroids_by_species_id(centroid_sums_by_chunk.get(chunk_id, {})),
            "path": f"./data/falling-fruit/us/chunks/{chunk_id}.json",
        })

    for state_id, state_counts in counts_by_state.items():
        record_count = sum(state_counts.values())
        if not record_count:
            continue
        state = state_lookup[state_id]
        manifest_states.append({
            "id": state_id,
            "name": state["name"],
            "bbox": state["bbox"],
            "center": get_bbox_center(state["bbox"]),
            "recordCount": record_count,
            "countsBySpeciesId": dict(sorted(state_counts.items())),
            "centroidsBySpeciesId": get_centroids_by_species_id(centroid_sums_by_state.get(state_id, {})),
        })

    summary = {
        "sourceFiles": {
            "locations": str(LOCATIONS_PATH),
            "types": str(TYPES_PATH),
        },
        "bounds": BOUNDS,
        "scannedLocations": scanned,
        "skippedHiddenLocations": skipped_hidden,
        "matchedLocations": matched_locations,
        "recordCount": total_records,
        "chunkSizeDegrees": CHUNK_SIZE_DEGREES,
        "chunkCount": len(manifest_chunks),
        "countsBySpeciesId": dict(sorted(counts.items())),
    }
    manifest = {
        "source": "Falling Fruit",
        "scope": "contiguous-us",
        "chunkType": "degree-grid",
        "chunkSizeDegrees": CHUNK_SIZE_DEGREES,
        "recordFields": RECORD_FIELDS,
        "states": sorted(manifest_states, key=lambda item: item["id"]),
        "chunks": sorted(manifest_chunks, key=lambda item: item["id"]),
        "recordCount": total_records,
    }

    MANIFEST_PATH.write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def get_chunk_id(lat, lng):
    west = int(lng // CHUNK_SIZE_DEGREES) * CHUNK_SIZE_DEGREES
    south = int(lat // CHUNK_SIZE_DEGREES) * CHUNK_SIZE_DEGREES
    return f"{format_axis(west, 'w', 'e')}_{format_axis(south, 's', 'n')}"


def get_chunk_bbox(chunk_id):
    lng_part, lat_part = chunk_id.split("_")
    west = parse_axis(lng_part)
    south = parse_axis(lat_part)
    return [west, south, round(west + CHUNK_SIZE_DEGREES, 5), round(south + CHUNK_SIZE_DEGREES, 5)]


def get_bbox_center(bbox):
    west, south, east, north = bbox
    return [round((west + east) / 2, 5), round((south + north) / 2, 5)]


def get_centroids_by_species_id(centroid_sums):
    centroids = {}
    for species_id, (lng_sum, lat_sum, count) in sorted(centroid_sums.items()):
        if not count:
            continue
        centroids[species_id] = [
            round(lng_sum / count, 5),
            round(lat_sum / count, 5),
            count,
        ]
    return centroids


def format_axis(value, negative_prefix, positive_prefix):
    prefix = negative_prefix if value < 0 else positive_prefix
    scaled = int(round(abs(value) * CHUNK_AXIS_SCALE))
    return f"{prefix}{scaled:05d}"


def parse_axis(value):
    sign = -1 if value[0] in {"w", "s"} else 1
    return sign * int(value[1:]) / CHUNK_AXIS_SCALE


if __name__ == "__main__":
    print(json.dumps(build_subset(), indent=2))
