#!/usr/bin/env python3
import bz2
import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TYPES_PATH = Path("/Users/sasson/Downloads/types.csv.bz2")
LOCATIONS_PATH = Path("/Users/sasson/Downloads/locations.csv.bz2")
OUTPUT_PATH = ROOT / "data" / "falling-fruit-charlottesville.json"
SUMMARY_PATH = ROOT / "data" / "falling-fruit-charlottesville-summary.json"

# Covers Charlottesville, nearby Albemarle, and the Shenandoah-facing area
# without carrying the full Virginia archive into the browser.
BOUNDS = {
    "south": 37.45,
    "north": 39.15,
    "west": -79.65,
    "east": -77.45,
}

RULES = [
    ("morel", r"\b(Morchella|morel)\b"),
    ("blueberry", r"\bblueberr(y|ies)\b|Vaccinium corymbosum|Vaccinium pallidum"),
    ("bramble", r"\b(blackberry|raspberry|wineberry|dewberry|boysenberry|loganberry)\b|Rubus (allegheniensis|occidentalis|phoenicolasius|idaeus|armeniacus|laciniatus|fruticosus)"),
    ("grape", r"\bgrape\b|\bVitis\b"),
    ("elderberry", r"\belderberr(y|ies)\b|\belderflower\b|\bSambucus\b"),
    ("ribes", r"\b(currant|gooseberry|redcurrant|blackcurrant|whitecurrant|jostaberry)\b|\bRibes\b"),
    ("huckleberry", r"\bhuckleberr(y|ies)\b|\bGaylussacia\b"),
    ("prunus", r"\b(cherr(y|ies)|plum|prune)\b|\bPrunus\b"),
    ("serviceberry", r"\b(serviceberry|juneberry)\b|\bAmelanchier\b"),
    ("persimmon", r"\bpersimmon\b|\bDiospyros\b"),
    ("black-walnut", r"\bblack walnut\b|Juglans nigra"),
    ("hickory", r"\bhickory\b|\bCarya\b"),
    ("hazelnut", r"\b(hazel|hazelnut|filbert)\b|\bCorylus\b"),
    ("apple", r"\bapple\b|\bMalus\b"),
    ("pear", r"\bpear\b|\bPyrus\b"),
    ("peach", r"\bpeach\b|Prunus persica"),
]

EXCLUDE = re.compile(
    r"dumpster|pineapple|rose apple|wax apple|wood apple|custard apple|"
    r"sugar-apple|star apple|mayapple|pineappleweed|pineapple weed|"
    r"prickly pear|pearlbush|sea grape|oregon-grape|peach-palm|"
    r"peachleaf willow|ornamental|flowering|yew plum|plum-pine|mombin|"
    r"hog plum|gooseberry gourd|barbados gooseberry|star gooseberry",
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
    return " ".join(pieces)[:500]


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
    records = []
    seen = set()
    skipped_hidden = 0
    scanned = 0

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

            for type_id in type_ids:
                species_id = type_to_species[type_id]
                key = (row["id"], species_id, type_id)
                if key in seen:
                    continue
                seen.add(key)
                info = type_info[type_id]
                record_name = row.get("address") or info["name"] or "Falling Fruit record"
                access = classify_access(row.get("access"))
                records.append({
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
                    **access,
                })

    records.sort(key=lambda item: (item["speciesId"], item["lat"], item["lng"], item["id"]))
    counts = Counter(record["speciesId"] for record in records)
    summary = {
        "sourceFiles": {
            "locations": str(LOCATIONS_PATH),
            "types": str(TYPES_PATH),
        },
        "bounds": BOUNDS,
        "scannedLocations": scanned,
        "skippedHiddenLocations": skipped_hidden,
        "recordCount": len(records),
        "countsBySpeciesId": dict(sorted(counts.items())),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


if __name__ == "__main__":
    print(json.dumps(build_subset(), indent=2))
