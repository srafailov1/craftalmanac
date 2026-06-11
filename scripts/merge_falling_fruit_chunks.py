#!/usr/bin/env python3
"""Merge Falling Fruit viewport chunks into a coarser grid.

The original export used 0.05-degree chunks, so a metro viewport at zoom 8
could intersect several hundred files - more than the app's request cap -
and dense areas dropped all Falling Fruit records at mid zoom. This script
re-chunks the existing files into a coarser grid without needing the source
CSV archives. build_falling_fruit_subset.py now emits the coarser grid
directly, so this script is only needed to migrate data generated before
that change.

Usage:
    python3 scripts/merge_falling_fruit_chunks.py
"""

import json
from collections import defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "data" / "falling-fruit" / "us"
CHUNKS_DIR = OUTPUT_DIR / "chunks"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"

TARGET_CHUNK_SIZE_DEGREES = 0.15
CHUNK_AXIS_SCALE = 100
# Integer-scaled cell size (0.15 deg * 100) so cell assignment is exact.
CELL_SIZE_SCALED = round(TARGET_CHUNK_SIZE_DEGREES * CHUNK_AXIS_SCALE)


def axis_label(scaled_value, negative_prefix, positive_prefix):
    # Pick the hemisphere prefix from the sign (matches
    # build_falling_fruit_subset.format_axis) instead of assuming w/n.
    prefix = negative_prefix if scaled_value < 0 else positive_prefix
    return f"{prefix}{abs(scaled_value):05d}"


def cell_for_chunk(chunk):
    west_scaled = round(chunk["bbox"][0] * CHUNK_AXIS_SCALE)
    south_scaled = round(chunk["bbox"][1] * CHUNK_AXIS_SCALE)
    cell_west = (west_scaled // CELL_SIZE_SCALED) * CELL_SIZE_SCALED
    cell_south = (south_scaled // CELL_SIZE_SCALED) * CELL_SIZE_SCALED
    return cell_west, cell_south


def merged_chunk_entry(cell, source_chunks):
    cell_west, cell_south = cell
    west = cell_west / CHUNK_AXIS_SCALE
    south = cell_south / CHUNK_AXIS_SCALE
    chunk_id = f"{axis_label(cell_west, 'w', 'e')}_{axis_label(cell_south, 's', 'n')}"

    counts = defaultdict(int)
    weighted = defaultdict(lambda: [0.0, 0.0, 0])
    record_count = 0
    for chunk in source_chunks:
        record_count += chunk["recordCount"]
        for species_id, count in chunk.get("countsBySpeciesId", {}).items():
            counts[species_id] += count
        for species_id, centroid in chunk.get("centroidsBySpeciesId", {}).items():
            lng, lat, n = centroid
            entry = weighted[species_id]
            entry[0] += lng * n
            entry[1] += lat * n
            entry[2] += n

    centroids = {
        species_id: [
            round(entry[0] / entry[2], 5),
            round(entry[1] / entry[2], 5),
            entry[2],
        ]
        for species_id, entry in weighted.items()
        if entry[2]
    }

    return {
        "id": chunk_id,
        "bbox": [
            round(west, 5),
            round(south, 5),
            round(west + TARGET_CHUNK_SIZE_DEGREES, 5),
            round(south + TARGET_CHUNK_SIZE_DEGREES, 5),
        ],
        "recordCount": record_count,
        "countsBySpeciesId": dict(sorted(counts.items())),
        "centroidsBySpeciesId": dict(sorted(centroids.items())),
        "path": f"./data/falling-fruit/us/chunks/{chunk_id}.json",
    }


def main():
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest["chunkSizeDegrees"] >= TARGET_CHUNK_SIZE_DEGREES:
        raise SystemExit(
            f"Manifest chunk size {manifest['chunkSizeDegrees']} is already >= "
            f"{TARGET_CHUNK_SIZE_DEGREES}; nothing to merge."
        )

    cells = defaultdict(list)
    for chunk in manifest["chunks"]:
        cells[cell_for_chunk(chunk)].append(chunk)

    print(f"Merging {len(manifest['chunks'])} chunks into {len(cells)} cells...")

    merged_entries = []
    written_files = set()
    for cell in sorted(cells):
        source_chunks = cells[cell]
        rows = []
        for chunk in source_chunks:
            source_path = BASE_DIR / Path(chunk["path"]).relative_to(".")
            rows.extend(json.loads(source_path.read_text(encoding="utf-8")))
        entry = merged_chunk_entry(cell, source_chunks)
        if len(rows) != entry["recordCount"]:
            raise SystemExit(
                f"Row count mismatch in {entry['id']}: "
                f"{len(rows)} rows vs {entry['recordCount']} expected"
            )
        (CHUNKS_DIR / f"{entry['id']}.json").write_text(
            json.dumps(rows, separators=(",", ":")), encoding="utf-8"
        )
        written_files.add(f"{entry['id']}.json")
        merged_entries.append(entry)

    for stale_path in CHUNKS_DIR.glob("*.json"):
        if stale_path.name not in written_files:
            stale_path.unlink()

    old_total = sum(chunk["recordCount"] for chunk in manifest["chunks"])
    new_total = sum(entry["recordCount"] for entry in merged_entries)
    if old_total != new_total:
        raise SystemExit(f"Record total changed: {old_total} -> {new_total}")

    manifest["chunkSizeDegrees"] = TARGET_CHUNK_SIZE_DEGREES
    manifest["chunks"] = merged_entries
    MANIFEST_PATH.write_text(
        json.dumps(manifest, separators=(",", ":")), encoding="utf-8"
    )
    print(
        f"Done: {len(merged_entries)} chunks, {new_total} records preserved "
        f"(chunk size {TARGET_CHUNK_SIZE_DEGREES} deg)."
    )


if __name__ == "__main__":
    main()
