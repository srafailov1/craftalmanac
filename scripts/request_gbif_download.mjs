#!/usr/bin/env node
// Request, poll, and download a GBIF occurrence download in Darwin Core Archive
// (DWCA) format for the national iNaturalist chunk bake (step 2 of the pipeline,
// see docs/TODO-inaturalist-chunk-bake.md section 3). DWCA (not SIMPLE_CSV) is
// required because SIMPLE_CSV omits informationWithheld, the field that
// distinguishes observer-obscured from taxon-obscured records.
//
// Scope: iNaturalist Research-grade dataset, US, with coordinates, restricted to
// the app's anchor taxonKeys (from data/inaturalist/taxon-keys.json). GBIF mirrors
// only CC0/CC-BY/CC-BY-NC records, so the compilation stays license-clean.
//
// Requires a free GBIF.org account. Provide credentials via environment:
//   GBIF_USER, GBIF_PASSWORD, GBIF_EMAIL
//
// Usage:
//   GBIF_USER=... GBIF_PASSWORD=... GBIF_EMAIL=... \
//     node scripts/request_gbif_download.mjs [--out=<dir>] [--key=<existingKey>]
//
// --key resumes polling/downloading an already-requested download instead of
// creating a new one (each new request mints a fresh citable DOI).

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const TAXON_KEYS_PATH = path.join(ROOT, "data", "inaturalist", "taxon-keys.json");

const DATASET_KEY = "50c9509d-22c7-4a22-a47d-8c48425ef4a7";
const API = "https://api.gbif.org/v1/occurrence/download";
const POLL_MS = 30000;

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) args.set(m[1], m[2] ?? "true");
}
const OUT_DIR = args.get("out")
  || path.join(process.env.HOME || ".", "Documents", "CraftAlmanac-archives", "inaturalist");
const USER = process.env.GBIF_USER;
const PASSWORD = process.env.GBIF_PASSWORD;
const EMAIL = process.env.GBIF_EMAIL;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Only the request POST needs auth; status polling and the zip download are
// public, so the poll/download half runs with no credentials (pass --key).
const authHeaders = () => (USER && PASSWORD
  ? { Authorization: `Basic ${Buffer.from(`${USER}:${PASSWORD}`).toString("base64")}` }
  : {});

async function buildPredicate() {
  const artifact = JSON.parse(await readFile(TAXON_KEYS_PATH, "utf8"));
  const taxonKeys = [...new Set(artifact.taxa.map((t) => t.gbifUsageKey).filter(Boolean))];
  return {
    format: "DWCA",
    creator: USER,
    notificationAddresses: EMAIL ? [EMAIL] : [],
    sendNotification: Boolean(EMAIL),
    predicate: {
      type: "and",
      predicates: [
        { type: "equals", key: "DATASET_KEY", value: DATASET_KEY },
        { type: "equals", key: "COUNTRY", value: "US" },
        { type: "equals", key: "HAS_COORDINATE", value: "true" },
        { type: "in", key: "TAXON_KEY", values: taxonKeys.map(String) }
      ]
    }
  };
}

async function requestDownload() {
  const body = await buildPredicate();
  const res = await fetch(`${API}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`request failed HTTP ${res.status}: ${await res.text()}`);
  const key = (await res.text()).trim();
  console.log(`Requested download key: ${key}`);
  console.log(`  taxonKeys: ${body.predicate.predicates[3].values.length}`);
  return key;
}

async function pollUntilReady(key) {
  for (;;) {
    const res = await fetch(`${API}/${key}`, { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`status poll HTTP ${res.status}`);
    const meta = await res.json();
    console.log(`  status=${meta.status} records=${meta.totalRecords ?? "?"} size=${meta.size ?? "?"}`);
    if (meta.status === "SUCCEEDED") return meta;
    if (["KILLED", "FAILED", "CANCELLED"].includes(meta.status)) throw new Error(`download ${meta.status}`);
    await sleep(POLL_MS);
  }
}

async function downloadZip(meta, key) {
  await mkdir(OUT_DIR, { recursive: true });
  const zipPath = path.join(OUT_DIR, `${key}.zip`);
  const res = await fetch(meta.downloadLink || `${API}/request/${key}.zip`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`zip download HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(zipPath));
  await writeFile(path.join(OUT_DIR, `${key}.meta.json`), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`\nDownloaded ${zipPath}`);
  console.log(`DOI: ${meta.doi || "(pending)"}  — record it in ATTRIBUTION.md.`);
  console.log(`Records: ${meta.totalRecords}`);
  console.log(`\nNext: unzip and build with`);
  console.log(`  node scripts/build_inaturalist_subset.mjs --source=dwca --input=<unzipped-dir>`);
  return zipPath;
}

async function main() {
  const existingKey = args.get("key");
  // Creating a request needs the owner's GBIF account; resuming (--key) only
  // polls + downloads, both of which are public.
  if (!existingKey && (!USER || !PASSWORD)) {
    throw new Error("Set GBIF_USER and GBIF_PASSWORD (and optionally GBIF_EMAIL) to create a request, or pass --key=<key> to resume a request someone else created.");
  }
  const key = existingKey || await requestDownload();
  const meta = await pollUntilReady(key);
  await downloadZip(meta, key);
}

main().catch((err) => { console.error(err); process.exit(1); });
