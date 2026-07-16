// One-time migration + reusable splitter: move the per-chunk access-filter data
// (accessCounts, and accessCentroids where present) OUT of manifest.json into a
// sibling manifest-access.json keyed by chunk id. The default overview never
// reads access data (only when a permission filter is active), so this takes
// ~1 MB gz off every default boot with zero change to the values — the access
// file carries the SAME numbers, merged back onto the chunks on demand.
//
// Idempotent: re-running on an already-split manifest just rewrites the same
// two files. `build_access_status.mjs` calls writeSplitManifest() so a future
// re-bake keeps the split; this script is the standalone entry to migrate what
// is already baked without a full (cache-dependent) re-bake.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const ACCESS_KEYS = ["accessCounts", "accessCentroids"];

// Given a manifest object whose chunks still carry the access keys, return
// { manifest (slimmed, mutated in place), access ({[id]: {accessCounts,...}}) }.
export function splitManifest(manifest) {
  const access = {};
  for (const chunk of manifest.chunks || []) {
    const entry = {};
    let any = false;
    for (const key of ACCESS_KEYS) {
      if (chunk[key] !== undefined) { entry[key] = chunk[key]; delete chunk[key]; any = true; }
    }
    if (any) access[chunk.id] = entry;
  }
  return { manifest, access };
}

// Writes both files for a tree dir (…/us): manifest.json (slimmed) and
// manifest-access.json. `manifest` is expected to still carry the access keys.
export async function writeSplitManifest(rootDir, manifest) {
  const { manifest: slim, access } = splitManifest(manifest);
  await writeFile(path.join(rootDir, "manifest.json"), `${JSON.stringify(slim)}\n`);
  await writeFile(path.join(rootDir, "manifest-access.json"), `${JSON.stringify(access)}\n`);
  return { chunks: (slim.chunks || []).length, accessEntries: Object.keys(access).length };
}

// CLI: migrate the two committed trees in place.
if (import.meta.url === `file://${process.argv[1]}`) {
  const ROOT = process.cwd();
  for (const dir of ["falling-fruit/us", "inaturalist/us"]) {
    const rootDir = path.join(ROOT, "data", dir);
    const manifest = JSON.parse(await readFile(path.join(rootDir, "manifest.json"), "utf8"));
    const carriesAccess = (manifest.chunks || []).some((c) => ACCESS_KEYS.some((k) => c[k] !== undefined));
    if (!carriesAccess) {
      console.log(`${dir}: already split (no access keys inline) — rewriting access file from nothing would clobber it; skipping.`);
      continue;
    }
    const res = await writeSplitManifest(rootDir, manifest);
    console.log(`${dir}: wrote manifest.json (${res.chunks} chunks) + manifest-access.json (${res.accessEntries} entries)`);
  }
}
