#!/usr/bin/env python3
import json
import re
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "nps-historic-orchards.json"
SUMMARY_PATH = ROOT / "data" / "nps-historic-orchards-summary.json"
LOCAL_CACHE = Path("/private/tmp/nps_orchards.geojson")
SOURCE_URL = (
    "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/"
    "contrib_orchard_pt/FeatureServer/4/query"
    "?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson"
)

BOUNDS = {
    "south": 37.45,
    "north": 39.15,
    "west": -79.65,
    "east": -77.45,
}

RULES = [
    ("apple", r"\bapple\b|\bMalus\b"),
    ("pear", r"\bpear\b|\bPyrus\b"),
    ("peach", r"\bpeach\b|Prunus persica"),
    ("prunus", r"\b(cherr(y|ies)|plum|prune|nectarine)\b|\bPrunus\b"),
]


def load_source():
    if LOCAL_CACHE.exists():
        return json.loads(LOCAL_CACHE.read_text(encoding="utf-8"))
    with urllib.request.urlopen(SOURCE_URL, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def in_bounds(lat, lng):
    return (
        BOUNDS["south"] <= lat <= BOUNDS["north"]
        and BOUNDS["west"] <= lng <= BOUNDS["east"]
    )


def matched_species(text):
    matches = []
    for species_id, pattern in RULES:
        if re.search(pattern, text, re.I):
            matches.append(species_id)
    return matches


def clean_text(value, fallback=""):
    text = re.sub(r"\s+", " ", value or "").strip()
    return text or fallback


def build_subset():
    data = load_source()
    records = []
    seen = set()

    for feature in data.get("features", []):
        geometry = feature.get("geometry") or {}
        coordinates = geometry.get("coordinates") or []
        if len(coordinates) < 2:
            continue
        lng, lat = coordinates[:2]
        if not in_bounds(lat, lng):
            continue

        props = feature.get("properties") or {}
        species_text = " ".join([
            props.get("SPECIES") or "",
            props.get("Orchard__1") or "",
            props.get("Short_Name") or "",
        ])
        species_ids = matched_species(species_text)
        if not species_ids:
            continue

        park_name = clean_text(props.get("Park_Name"), "National Park Service site")
        short_name = clean_text(props.get("Short_Name"), props.get("Orchard__1") or "Historic orchard")
        history = clean_text(props.get("History"))
        if len(history) > 420:
            history = f"{history[:417].rstrip()}..."

        for species_id in species_ids:
            key = (props.get("OID"), species_id, round(lat, 6), round(lng, 6))
            if key in seen:
                continue
            seen.add(key)
            records.append({
                "id": f"{props.get('OID')}-{species_id}",
                "speciesId": species_id,
                "name": f"{short_name}, {park_name}",
                "observedName": clean_text(props.get("SPECIES"), "Historic orchard"),
                "observedScientificName": "",
                "lat": lat,
                "lng": lng,
                "source": "nps-orchard",
                "note": history or "Historic orchard or fruit tree documented by the National Park Service.",
                "confidence": "cultural landscape record",
                "sourceUrl": props.get("NPS_gov_co") or "https://www.nps.gov/subjects/culturallandscapes/historic-orchards-in-national-parks.htm",
                "access": "National Park Service",
                "accessClass": "restricted",
                "publicLand": True,
                "accessNote": "NPS cultural landscape record. Do not take fruit or cuttings without park permission.",
                "harvestStatus": "Permission required",
                "parkCode": props.get("Park_Code") or "",
                "parkName": park_name,
            })

    records.sort(key=lambda item: (item["speciesId"], item["parkName"], item["lat"], item["lng"]))
    summary = {
        "sourceUrl": SOURCE_URL,
        "bounds": BOUNDS,
        "recordCount": len(records),
        "countsBySpeciesId": dict(sorted(Counter(record["speciesId"] for record in records).items())),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


if __name__ == "__main__":
    print(json.dumps(build_subset(), indent=2))
