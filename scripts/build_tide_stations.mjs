#!/usr/bin/env node
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const OUTPUT_PATH = path.join(ROOT, "data", "tide-stations.json");

const STATIONS_URL = "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions";
const STATION_URL = (id) => `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${id}.json`;
const PROVIDENCE_ID = "8454000";
const US_TIDE_STATION_STATES = new Set([
  "AL", "AK", "AS", "CA", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "LA",
  "MA", "MD", "ME", "MP", "MS", "NC", "NH", "NJ", "NY", "OR", "PA", "PR",
  "RI", "SC", "TX", "VA", "VI", "WA"
]);
const SPOT_CHECK_IDS = [
  PROVIDENCE_ID,
  "9414290",
  "8724580",
  "1612340",
  "9455920"
];

const args = new Set(process.argv.slice(2));

function isUsTideStation(station) {
  return US_TIDE_STATION_STATES.has(String(station?.state || "").trim().toUpperCase());
}

function normalizeStation(station) {
  const id = String(station?.id || "").trim();
  const name = String(station?.name || "").trim();
  const lat = Number(station?.lat);
  const lng = Number(station?.lng);
  if (!id || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id,
    name,
    lat: Number(lat.toFixed(5)),
    lng: Number(lng.toFixed(5))
  };
}

function assertStationIndex(stations) {
  if (!Array.isArray(stations) || !stations.length) {
    throw new Error("tide station index is empty");
  }
  const ids = new Set();
  stations.forEach((station, index) => {
    if (!station.id || !station.name) {
      throw new Error(`station ${index} is missing id or name`);
    }
    if (ids.has(station.id)) throw new Error(`duplicate station id ${station.id}`);
    ids.add(station.id);
    if (!Number.isFinite(station.lat) || station.lat < -90 || station.lat > 90) {
      throw new Error(`station ${station.id} has invalid lat ${station.lat}`);
    }
    if (!Number.isFinite(station.lng) || station.lng < -180 || station.lng > 180) {
      throw new Error(`station ${station.id} has invalid lng ${station.lng}`);
    }
  });
  if (!ids.has(PROVIDENCE_ID)) {
    throw new Error(`Providence station ${PROVIDENCE_ID} is missing`);
  }
}

function namesAreCompatible(first, second) {
  const normalize = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  const a = normalize(first);
  const b = normalize(second);
  return a === b || a.includes(b) || b.includes(a);
}

function coordsAreCompatible(first, second) {
  return Math.abs(first - second) <= 0.0001;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(`${url} returned API error: ${data.error.message || data.error.code || "unknown"}`);
  return data;
}

async function buildIndex() {
  const data = await fetchJson(STATIONS_URL);
  const stations = (data.stations || [])
    .filter(isUsTideStation)
    .map(normalizeStation)
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  assertStationIndex(stations);
  const tempPath = `${OUTPUT_PATH}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(stations)}\n`);
  await rename(tempPath, OUTPUT_PATH);
  return stations;
}

async function verifyIndex() {
  const stations = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
  assertStationIndex(stations);
  const byId = new Map(stations.map((station) => [station.id, station]));
  const checked = [];
  for (const id of SPOT_CHECK_IDS) {
    const generated = byId.get(id);
    if (!generated) throw new Error(`spot-check station ${id} is missing from generated index`);
    const data = await fetchJson(STATION_URL(id));
    const station = normalizeStation(data.stations?.[0] || data.station || data);
    if (!station) throw new Error(`spot-check station ${id} metadata did not include id/name/coords`);
    if (
      !namesAreCompatible(generated.name, station.name)
      || !coordsAreCompatible(generated.lat, station.lat)
      || !coordsAreCompatible(generated.lng, station.lng)
    ) {
      throw new Error(`spot-check mismatch for ${id}: generated ${JSON.stringify(generated)} vs NOAA ${JSON.stringify(station)}`);
    }
    checked.push(`${id} ${station.name}`);
  }
  console.log(`Verified ${stations.length} tide-prediction stations; spot checks: ${checked.join("; ")}`);
}

if (args.has("--verify")) {
  await verifyIndex();
} else {
  const stations = await buildIndex();
  console.log(`Wrote ${stations.length} US tide-prediction stations to ${path.relative(ROOT, OUTPUT_PATH)}`);
}
