#!/usr/bin/env node

// Rule-test consolidation.
//
// Extracts the permission-rule functions from app.js (using the same regex
// extraction pattern as scripts/build_access_status.mjs) and asserts that they
// return the statuses the encoded app.js logic is supposed to produce. The
// expected statuses below are read straight out of getStateSystemRule,
// getNpsCompendiumRule, and getPublicLandAccessRule in app.js — this test does
// not invent any new permission semantics.
//
// Two things matter for these assertions to be meaningful, both of which the
// earlier draft of this file got wrong:
//   1. getPublicLandAccessRule reads record.lat / record.lng (via
//      isRecordInNycArea), so every call must pass a real record object, never
//      null.
//   2. The predicates read PAD-US text built ONLY from Unit_Nm, MngNm_Desc,
//      MngTp_Desc, and DesTp_Desc (see getPublicLandText). Synthetic land
//      properties must put the trigger words ("state forest", "city land",
//      "great smoky", ...) into those four fields, and NPS mushroom tests must
//      pass a species with category: "mushroom".

import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const STATE_BOUNDARY_PATH = path.join(ROOT, "data", "contiguous-us-states.json");

function findMatchingDelimiter(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let templateExpressionDepth = 0;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (quote === "`" && char === "$" && next === "{") {
        templateExpressionDepth += 1;
        index += 1;
        continue;
      }
      if (templateExpressionDepth) {
        if (char === "{") templateExpressionDepth += 1;
        else if (char === "}") templateExpressionDepth -= 1;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "/" && next === "/") {
      index = source.indexOf("\n", index);
      if (index < 0) return -1;
      continue;
    }
    if (char === "/" && next === "*") {
      index = source.indexOf("*/", index + 2);
      if (index < 0) return -1;
      index += 1;
      continue;
    }
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function extractConstExpression(source, name) {
  const start = source.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`Could not find const ${name}`);
  const equals = source.indexOf("=", start);
  let expressionStart = equals + 1;
  while (/\s/.test(source[expressionStart])) expressionStart += 1;
  const openChar = source[expressionStart];
  const closeChar = openChar === "[" ? "]" : openChar === "{" ? "}" : "";
  if (!closeChar) throw new Error(`Const ${name} does not start with an object or array literal`);
  const end = findMatchingDelimiter(source, expressionStart, openChar, closeChar);
  if (end < 0) throw new Error(`Could not parse const ${name}`);
  return source.slice(expressionStart, end + 1);
}

function extractFunctionSource(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Could not find function ${name}`);
  const bodyStart = source.indexOf("{", start);
  const end = findMatchingDelimiter(source, bodyStart, "{", "}");
  if (end < 0) throw new Error(`Could not parse function ${name}`);
  return source.slice(start, end + 1);
}

async function buildRuleContext() {
  const appSource = await readFile(APP_PATH, "utf8");
  const stateBoundaries = JSON.parse(await readFile(STATE_BOUNDARY_PATH, "utf8")).states || [];
  if (!stateBoundaries.length) {
    throw new Error("state boundary data is empty; getRecordStateCode would return blanks");
  }
  const context = {
    console,
    Map,
    state: {
      activeMap: "food",
      stateBoundaries
    }
  };
  vm.createContext(context);

  // Constants the rule functions close over.
  ["ACCESS_RULE_SOURCES", "NPS_GATHERING_RULES"].forEach((name) => {
    const expression = extractConstExpression(appSource, name);
    vm.runInContext(`var ${name} = ${expression};`, context, { filename: APP_PATH });
  });

  // Rule functions plus every helper they call, transitively. Mirrors the
  // extraction list in build_access_status.mjs (minus the aggregate-only
  // helpers) so the test exercises the real app.js logic, not a partial copy.
  [
    "getRecordStateCode",
    "getPublicLandAccessRule",
    "getNpsCompendiumRule",
    "getStateSystemRule",
    "getPublicLandText",
    "getPublicLandName",
    "isNationalParkServiceLand",
    "isNycLocalPark",
    "isRecordInNycArea",
    "isUsfsLand",
    "isBlmLand",
    "isWildlifeRefugeLand",
    "isArmyCorpsLand",
    "isVirginiaWma",
    "isVirginiaStateForest",
    "isVirginiaStateParkOrDcrLand",
    "getShenandoahLimit",
    "getBlueRidgeLimit",
    "getPrinceWilliamLimit",
    "getManassasLimit",
    "pointInFeature",
    "pointInPolygon",
    "pointInRing"
  ].forEach((name) => {
    vm.runInContext(extractFunctionSource(appSource, name), context, { filename: APP_PATH });
  });

  return context;
}

// Synthetic species. getStateSystemRule ignores species entirely; the NPS
// compendium path keys off species.category.
const FOOD_SPECIES = { id: "blackberry", commonName: "Blackberries", category: "berry", shenandoahAllowed: true };
const MUSHROOM_SPECIES = { id: "morel", commonName: "Morels", category: "mushroom", shenandoahAllowed: true };

// Build PAD-US-like properties. getPublicLandText only reads these four fields.
function landProps({ unit, mng, mngTp, desTp, pubAccess }) {
  const properties = {};
  if (unit) properties.Unit_Nm = unit;
  if (mng) properties.MngNm_Desc = mng;
  if (mngTp) properties.MngTp_Desc = mngTp;
  if (desTp) properties.DesTp_Desc = desTp;
  if (pubAccess) properties.Pub_Access = pubAccess;
  return properties;
}

function reportSection(title) {
  console.log(`\n${title}`);
}

function logResult(pass, label, detail) {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

function testStateCodeLookups(context) {
  reportSection("State-code lookups for known cities:");
  const cases = [
    { city: "New York City", lat: 40.7128, lng: -74.006, expected: "NY" },
    { city: "Philadelphia", lat: 39.9526, lng: -75.1652, expected: "PA" },
    { city: "Seattle", lat: 47.6062, lng: -122.332, expected: "WA" },
    { city: "Los Angeles", lat: 34.0522, lng: -118.2437, expected: "CA" },
    { city: "Phoenix", lat: 33.4484, lng: -112.074, expected: "AZ" }
  ];
  let passed = true;
  for (const c of cases) {
    let actual;
    try {
      actual = context.getRecordStateCode({ lat: c.lat, lng: c.lng });
    } catch (error) {
      logResult(false, c.city, `error: ${error.message}`);
      passed = false;
      continue;
    }
    const ok = actual === c.expected;
    logResult(ok, c.city, `expected ${c.expected}, got ${actual || "(none)"}`);
    if (!ok) passed = false;
  }
  return passed;
}

function runLandCase(context, c) {
  context.state.activeMap = c.mode || "food";
  const properties = landProps(c.props);
  const species = c.species || FOOD_SPECIES;
  const record = c.record;
  const rule = context.getPublicLandAccessRule(properties, species, c.stateCode, record);
  return rule.status;
}

function testStateSystemRules(context) {
  reportSection("State-system harvest rules (mode = food unless noted):");
  // Records sit inside the named state but outside the NYC trigger box, except
  // the NYC case which must be inside it. Coordinates only matter for the NYC
  // local-park predicate; stateCode is passed explicitly.
  const cases = [
    { label: "NY State Forest", stateCode: "NY", record: { lat: 43.0, lng: -75.5 },
      props: { unit: "Brasher State Forest", mngTp: "State", desTp: "State Forest" }, expected: "allowed" },
    { label: "NY State Park", stateCode: "NY", record: { lat: 43.0, lng: -75.5 },
      props: { unit: "Letchworth State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "PA State Forest", stateCode: "PA", record: { lat: 41.0, lng: -77.5 },
      props: { unit: "Bald Eagle State Forest", mngTp: "State", desTp: "State Forest" }, expected: "allowed" },
    { label: "WA State Park", stateCode: "WA", record: { lat: 47.5, lng: -120.5 },
      props: { unit: "Deception Pass State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "CA State Park", stateCode: "CA", record: { lat: 37.0, lng: -120.0 },
      props: { unit: "Henry Cowell State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "CO State Park", stateCode: "CO", record: { lat: 39.0, lng: -105.5 },
      props: { unit: "Cherry Creek State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "OR State Park (food)", stateCode: "OR", mode: "food", record: { lat: 44.0, lng: -123.0 },
      props: { unit: "Silver Falls State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "OR State Park (ink, non-food)", stateCode: "OR", mode: "ink", record: { lat: 44.0, lng: -123.0 },
      props: { unit: "Silver Falls State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "MD State Park", stateCode: "MD", record: { lat: 39.4, lng: -77.0 },
      props: { unit: "Patapsco State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "MD State Forest", stateCode: "MD", record: { lat: 39.4, lng: -79.0 },
      props: { unit: "Savage River State Forest", mngTp: "State", desTp: "State Forest" }, expected: "permit-required" },
    { label: "NC State Park", stateCode: "NC", record: { lat: 35.8, lng: -79.0 },
      props: { unit: "Eno River State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "MI State Forest", stateCode: "MI", record: { lat: 44.8, lng: -84.5 },
      props: { unit: "Pigeon River Country State Forest", mngTp: "State", desTp: "State Forest" }, expected: "allowed" },
    { label: "MN State Park", stateCode: "MN", record: { lat: 46.0, lng: -94.0 },
      props: { unit: "Itasca State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "IL State Park (food)", stateCode: "IL", mode: "food", record: { lat: 41.32, lng: -88.99 },
      props: { unit: "Starved Rock State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "IL State Park (medicine, non-food)", stateCode: "IL", mode: "medicine", record: { lat: 41.32, lng: -88.99 },
      props: { unit: "Starved Rock State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "IL State Fish & Wildlife Area (food)", stateCode: "IL", mode: "food", record: { lat: 40.4, lng: -91.0 },
      props: { unit: "Mississippi River State Fish and Wildlife Area", mngTp: "State", desTp: "State Fish and Wildlife Area" }, expected: "allowed" },
    { label: "IL dedicated Nature Preserve (food)", stateCode: "IL", mode: "food", record: { lat: 42.42, lng: -87.81 },
      props: { unit: "Illinois Beach Nature Preserve", mngTp: "State", desTp: "Nature Preserve" }, expected: "prohibited" },
    // NYC local park: needs "city land" + "local government" + "local park" in
    // the text AND a record inside the NYC bounding box (isRecordInNycArea).
    { label: "NYC local park", stateCode: "NY", record: { lat: 40.785, lng: -73.968 },
      props: { unit: "Central Park", mng: "City Land", mngTp: "Local Government", desTp: "Local Park" },
      expected: "prohibited" },
    // 2026-06-16 state-park completion pass (38 new states; incl. species splits)
    { label: "AK State Park food", stateCode: "AK", record: { lat: 61.1, lng: -149.5 },
      props: { unit: "Chugach State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "IN State Park food", stateCode: "IN", record: { lat: 39.2, lng: -86.2 },
      props: { unit: "Brown County State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "OH State Park food", stateCode: "OH", record: { lat: 39.5, lng: -82.5 },
      props: { unit: "Hocking Hills State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "WI State Park food", stateCode: "WI", record: { lat: 43.4, lng: -89.7 },
      props: { unit: "Devil's Lake State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "AL State Park (prohibited)", stateCode: "AL", record: { lat: 33.3, lng: -86.7 },
      props: { unit: "Oak Mountain State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "FL State Park (prohibited)", stateCode: "FL", record: { lat: 27.2, lng: -82.3 },
      props: { unit: "Myakka River State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "TX State Park (prohibited)", stateCode: "TX", record: { lat: 29.6, lng: -99.7 },
      props: { unit: "Garner State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "MO State Park food (fruit allowed)", stateCode: "MO", record: { lat: 38.0, lng: -92.8 },
      props: { unit: "Ha Ha Tonka State Park", mngTp: "State", desTp: "State Park" }, expected: "allowed" },
    { label: "MO State Park mushrooms (not covered)", stateCode: "MO", record: { lat: 38.0, lng: -92.8 },
      props: { unit: "Ha Ha Tonka State Park", mngTp: "State", desTp: "State Park" }, species: MUSHROOM_SPECIES, expected: "prohibited" },
    { label: "CT State Park food (prohibited)", stateCode: "CT", record: { lat: 41.4, lng: -72.9 },
      props: { unit: "Sleeping Giant State Park", mngTp: "State", desTp: "State Park" }, expected: "prohibited" },
    { label: "CT State Park mushrooms (allowed)", stateCode: "CT", record: { lat: 41.4, lng: -72.9 },
      props: { unit: "Sleeping Giant State Park", mngTp: "State", desTp: "State Park" }, species: MUSHROOM_SPECIES, expected: "allowed" },
    { label: "HI State Park mushrooms (not named)", stateCode: "HI", record: { lat: 22.2, lng: -159.6 },
      props: { unit: "Na Pali Coast State Park", mngTp: "State", desTp: "State Park" }, species: MUSHROOM_SPECIES, expected: "prohibited" }
  ];

  let passed = true;
  for (const c of cases) {
    let actual;
    try {
      actual = runLandCase(context, c);
    } catch (error) {
      logResult(false, c.label, `error: ${error.message}`);
      passed = false;
      continue;
    }
    const ok = actual === c.expected;
    logResult(ok, c.label, `expected ${c.expected}, got ${actual}`);
    if (!ok) passed = false;
  }
  return passed;
}

function testNpsMushroomRules(context) {
  reportSection("NPS compendium mushroom rules (mode = food, species = mushroom):");
  const cases = [
    { label: "Great Smoky mushrooms", stateCode: "TN", record: { lat: 35.68, lng: -83.53 },
      props: { unit: "Great Smoky Mountains National Park", mng: "National Park Service", desTp: "National Park" },
      expected: "allowed" },
    { label: "Rocky Mountain mushrooms", stateCode: "CO", record: { lat: 40.34, lng: -105.68 },
      props: { unit: "Rocky Mountain National Park", mng: "National Park Service", desTp: "National Park" },
      expected: "prohibited" },
    { label: "Acadia mushrooms", stateCode: "ME", record: { lat: 44.35, lng: -68.21 },
      props: { unit: "Acadia National Park", mng: "National Park Service", desTp: "National Park" },
      expected: "prohibited" }
  ];

  let passed = true;
  for (const c of cases) {
    let actual;
    try {
      actual = runLandCase(context, { ...c, species: MUSHROOM_SPECIES });
    } catch (error) {
      logResult(false, c.label, `error: ${error.message}`);
      passed = false;
      continue;
    }
    const ok = actual === c.expected;
    logResult(ok, c.label, `expected ${c.expected}, got ${actual}`);
    if (!ok) passed = false;
  }
  return passed;
}

// Parks added in the 2026-06-11 third pass. Food species should be allowed;
// mushrooms follow each park's compendium; and a national-FOREST unit named
// "Sequoia" must NOT pick up the national-PARK gathering allowance.
function testNewNpsParks(context) {
  reportSection("New NPS parks (2026-06-11 pass):");
  const foodCases = [
    { label: "Indiana Dunes food", stateCode: "IN", record: { lat: 41.65, lng: -87.05 },
      props: { unit: "Indiana Dunes National Park", mng: "National Park Service", desTp: "National Park" },
      species: FOOD_SPECIES, expected: "allowed" },
    { label: "Indiana Dunes mushrooms", stateCode: "IN", record: { lat: 41.65, lng: -87.05 },
      props: { unit: "Indiana Dunes National Park", mng: "National Park Service", desTp: "National Park" },
      species: MUSHROOM_SPECIES, expected: "prohibited" },
    { label: "Sequoia food", stateCode: "CA", record: { lat: 36.49, lng: -118.57 },
      props: { unit: "Sequoia National Park", mng: "National Park Service", desTp: "National Park" },
      species: FOOD_SPECIES, expected: "allowed" },
    { label: "Sequoia mushrooms", stateCode: "CA", record: { lat: 36.49, lng: -118.57 },
      props: { unit: "Sequoia National Park", mng: "National Park Service", desTp: "National Park" },
      species: MUSHROOM_SPECIES, expected: "allowed" },
    { label: "Kings Canyon mushrooms", stateCode: "CA", record: { lat: 36.89, lng: -118.55 },
      props: { unit: "Kings Canyon National Park", mng: "National Park Service", desTp: "National Park" },
      species: MUSHROOM_SPECIES, expected: "allowed" },
    // Guard: Sequoia National Forest is USFS land, not the national park; it must
    // fall through to the USFS allowance, not the NPS "sequoia national park" entry.
    { label: "Sequoia National Forest (USFS, not NPS park)", stateCode: "CA", record: { lat: 36.0, lng: -118.6 },
      props: { unit: "Sequoia National Forest", mng: "Forest Service", desTp: "National Forest" },
      species: MUSHROOM_SPECIES, expected: "allowed" },
    // 2026-06-15 national-park completion pass (34 parks added).
    { label: "Zion food", stateCode: "UT", record: { lat: 37.3, lng: -113.0 },
      props: { unit: "Zion National Park", mng: "National Park Service", desTp: "National Park" },
      species: FOOD_SPECIES, expected: "allowed" },
    { label: "Zion mushrooms (not designated)", stateCode: "UT", record: { lat: 37.3, lng: -113.0 },
      props: { unit: "Zion National Park", mng: "National Park Service", desTp: "National Park" },
      species: MUSHROOM_SPECIES, expected: "prohibited" },
    { label: "Mammoth Cave food", stateCode: "KY", record: { lat: 37.18, lng: -86.1 },
      props: { unit: "Mammoth Cave National Park", mng: "National Park Service", desTp: "National Park" },
      species: FOOD_SPECIES, expected: "allowed" },
    { label: "Mammoth Cave mushrooms (designated)", stateCode: "KY", record: { lat: 37.18, lng: -86.1 },
      props: { unit: "Mammoth Cave National Park", mng: "National Park Service", desTp: "National Park" },
      species: MUSHROOM_SPECIES, expected: "allowed" },
    { label: "Pinnacles mushrooms (designated)", stateCode: "CA", record: { lat: 36.49, lng: -121.18 },
      props: { unit: "Pinnacles National Park", mng: "National Park Service", desTp: "National Park" },
      species: MUSHROOM_SPECIES, expected: "allowed" },
    { label: "Big Bend food", stateCode: "TX", record: { lat: 29.25, lng: -103.25 },
      props: { unit: "Big Bend National Park", mng: "National Park Service", desTp: "National Park" },
      species: FOOD_SPECIES, expected: "allowed" },
    { label: "Arches food (no entry -> NPS default prohibited)", stateCode: "UT", record: { lat: 38.73, lng: -109.59 },
      props: { unit: "Arches National Park", mng: "National Park Service", desTp: "National Park" },
      species: FOOD_SPECIES, expected: "prohibited" }
  ];

  let passed = true;
  for (const c of foodCases) {
    let actual;
    let sourceLabel;
    try {
      context.state.activeMap = c.mode || "food";
      const rule = context.getPublicLandAccessRule(landProps(c.props), c.species, c.stateCode, c.record);
      actual = rule.status;
      sourceLabel = rule.sourceLabel;
    } catch (error) {
      logResult(false, c.label, `error: ${error.message}`);
      passed = false;
      continue;
    }
    let ok = actual === c.expected;
    // The guard case must additionally NOT be served by the SEKI national-park rule.
    if (c.label.startsWith("Sequoia National Forest") && /Sequoia & Kings Canyon/.test(sourceLabel || "")) {
      ok = false;
    }
    logResult(ok, c.label, `expected ${c.expected}, got ${actual} (${sourceLabel})`);
    if (!ok) passed = false;
  }
  return passed;
}

async function main() {
  const context = await buildRuleContext();

  const results = [
    testStateCodeLookups(context),
    testStateSystemRules(context),
    testNpsMushroomRules(context),
    testNewNpsParks(context)
  ];

  const allPassed = results.every(Boolean);
  if (allPassed) {
    console.log("\nAll permission rule tests passed.");
    process.exit(0);
  }
  console.log("\nSome permission rule tests FAILED.");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
