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
    // NYC local park: needs "city land" + "local government" + "local park" in
    // the text AND a record inside the NYC bounding box (isRecordInNycArea).
    { label: "NYC local park", stateCode: "NY", record: { lat: 40.785, lng: -73.968 },
      props: { unit: "Central Park", mng: "City Land", mngTp: "Local Government", desTp: "Local Park" },
      expected: "prohibited" }
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

async function main() {
  const context = await buildRuleContext();

  const results = [
    testStateCodeLookups(context),
    testStateSystemRules(context),
    testNpsMushroomRules(context)
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
