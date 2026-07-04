#!/usr/bin/env node
// Equivalence gate for the extracted access-rule tables (data/rules/*.json).
//
// Proves the app.js -> JSON extraction changed nothing semantically. Two
// modes, selected automatically:
//
//   1. Deep-compare mode (only while app.js still contains the original
//      consts, i.e. during/just after the extraction commit): every JSON rule
//      must be identical to the vm-extracted app.js rule EXCEPT (a) the added
//      `checked` provenance field and (b) the mechanical "Verified"->"Checked"
//      note rewording. Any other diff — status, limit, area, source, bounds —
//      fails.
//
//   2. Invariant mode (steady state, consts removed from app.js): asserts the
//      envelope, baked record counts, known status sets, required fields,
//      checked.by/date shape, the reserved-word rule (no "verified" claim in
//      any rule string unless checked.by === "owner"), and semantic anchors
//      that pin the crown-jewel defaults (NPS prohibition, mineral
//      conservative fallbacks, Crater of Diamonds exception).
//
// Wired into scripts/check.sh.
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const RULES_DIR = path.join(ROOT, "data", "rules");

const SCHEMA_ID = "craft-almanac-rules/1";
const KNOWN_STATUSES = new Set(["allowed", "permit-required", "prohibited", "private", "private-unsourced", "unknown"]);
const CHECKED_BY = new Set(["agent", "owner"]);
const CHECKED_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Baked at extraction time (2026-07): record counts per table. Update these
// deliberately when rules are added/removed — that is the versioning event.
const EXPECTED = {
  "nps-gathering-rules": { file: "nps-gathering-rules.json", constName: "NPS_GATHERING_RULES", shape: "nps", count: 52 },
  "site-access-rules": { file: "site-access-rules.json", constName: "SITE_ACCESS_RULES", shape: "site", count: 128, sites: 62 },
  "mineral-access-rules": { file: "mineral-access-rules.json", constName: "MINERAL_ACCESS_RULES", shape: "mineral", count: 9 }
};

const failures = [];
function fail(message) { failures.push(message); }
function assert(condition, message) { if (!condition) fail(message); }

// --- vm extraction (mirrors scripts/test_safety_tags.mjs) --------------------
function findMatchingDelimiter(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let templateExpressionDepth = 0;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
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
    if (char === "\"" || char === "'" || char === "`") { quote = char; continue; }
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
  if (start < 0) return null;
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

// --- shared helpers -----------------------------------------------------------
function flattenRules(shape, rules) {
  // -> [ [ruleKeyLabel, ruleObject], ... ]
  if (shape === "nps") return rules.map((rule, i) => [`nps[${i}] "${rule.match}"`, rule]);
  if (shape === "site") {
    const out = [];
    for (const site of rules) {
      for (const [mode, rule] of Object.entries(site.rules)) {
        out.push([`site "${site.name}" / ${mode}`, rule]);
      }
    }
    return out;
  }
  return Object.entries(rules).map(([key, rule]) => [`mineral "${key}"`, rule]);
}

function rewordNote(note) {
  return String(note).replace(/\bVerified\b/g, "Checked");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// --- deep-compare mode --------------------------------------------------------
function deepCompareTable(tableName, spec, originalRaw, json) {
  const originals = flattenRules(spec.shape, originalRaw);
  const extracted = flattenRules(spec.shape, json.rules);
  assert(originals.length === extracted.length,
    `${tableName}: rule count drifted (app.js ${originals.length} vs JSON ${extracted.length})`);
  const n = Math.min(originals.length, extracted.length);
  for (let i = 0; i < n; i += 1) {
    const [label, original] = originals[i];
    const [jsonLabel, rule] = extracted[i];
    assert(label === jsonLabel, `${tableName}: rule order/key drifted at ${label} vs ${jsonLabel}`);
    const { checked, ...rest } = rule;
    assert(!!checked, `${tableName}: ${label} is missing the checked provenance field`);
    const expected = { ...original };
    if (typeof expected.note === "string") expected.note = rewordNote(expected.note);
    assert(stableStringify(rest) === stableStringify(expected),
      `${tableName}: ${label} differs beyond the two permitted transforms`);
  }
  // Site-shaped tables: also compare the non-rule site fields (name, bounds).
  if (spec.shape === "site") {
    for (let i = 0; i < Math.min(originalRaw.length, json.rules.length); i += 1) {
      const { rules: _a, ...origSite } = originalRaw[i];
      const { rules: _b, ...jsonSite } = json.rules[i];
      assert(stableStringify(origSite) === stableStringify(jsonSite),
        `${tableName}: site "${originalRaw[i].name}" name/bounds differ from app.js`);
    }
  }
}

// --- invariant mode -----------------------------------------------------------
function checkInvariants(tableName, spec, json) {
  const flat = flattenRules(spec.shape, json.rules);
  assert(flat.length === spec.count,
    `${tableName}: expected ${spec.count} rules, found ${flat.length} (update EXPECTED deliberately if rules were added/removed)`);
  if (spec.sites) {
    assert(json.rules.length === spec.sites, `${tableName}: expected ${spec.sites} sites, found ${json.rules.length}`);
  }
  for (const [label, rule] of flat) {
    assert(KNOWN_STATUSES.has(rule.status) || spec.shape === "nps",
      `${tableName}: ${label} has unknown status "${rule.status}"`);
    if (spec.shape === "nps") {
      assert(typeof rule.match === "string" && rule.match, `${tableName}: ${label} missing match`);
      assert(typeof rule.mushroomsAllowed === "boolean", `${tableName}: ${label} missing boolean mushroomsAllowed`);
    }
    for (const field of ["limit", "note", "sourceLabel"]) {
      assert(typeof rule[field] === "string" && rule[field], `${tableName}: ${label} missing ${field}`);
    }
    assert(typeof rule.sourceUrl === "string", `${tableName}: ${label} missing sourceUrl (empty string is allowed)`);
    if (spec.shape !== "nps") {
      assert(typeof rule.area === "string" && rule.area, `${tableName}: ${label} missing area`);
    }
    const checked = rule.checked;
    assert(checked && CHECKED_BY.has(checked.by), `${tableName}: ${label} has invalid checked.by`);
    assert(checked && CHECKED_DATE_RE.test(checked.date || ""), `${tableName}: ${label} has invalid checked.date (want YYYY-MM)`);
    // Reserved word: "verified" claims render a green owner chip in the UI, so
    // no agent-checked rule may carry the word in any user-facing string.
    if (!checked || checked.by !== "owner") {
      for (const [field, value] of Object.entries(rule)) {
        if (typeof value === "string" && /\bverified\b/i.test(value)) {
          fail(`${tableName}: ${label}.${field} says "verified" but checked.by is not "owner"`);
        }
      }
    }
  }
  if (spec.shape === "site") {
    for (const site of json.rules) {
      const b = site.bounds || {};
      assert(typeof site.name === "string" && site.name, `${tableName}: site missing name`);
      assert([b.south, b.west, b.north, b.east].every(Number.isFinite)
        && b.south < b.north && b.west < b.east,
        `${tableName}: site "${site.name}" has malformed bounds`);
    }
  }
}

// Crown-jewel semantic anchors: conservative defaults that must never flip.
function checkAnchors(tables) {
  const nps = tables["nps-gathering-rules"].rules;
  const bySmoky = nps.find((r) => r.match === "great smoky");
  const acadia = nps.find((r) => r.match === "acadia");
  assert(bySmoky && bySmoky.mushroomsAllowed === true, "anchor: Great Smoky mushroomsAllowed must be true");
  assert(acadia && acadia.mushroomsAllowed === false, "anchor: Acadia mushroomsAllowed must be false");

  const site = tables["site-access-rules"].rules;
  const foodway = site.find((s) => s.name === "Bronx River Foodway");
  assert(foodway && foodway.rules.food?.status === "allowed", "anchor: Bronx River Foodway food must be allowed");

  const mineral = tables["mineral-access-rules"].rules;
  assert(mineral.NPS?.status === "prohibited", "anchor: mineral NPS must be prohibited (36 CFR 2.1)");
  assert(mineral["Private / other"]?.status === "private", "anchor: mineral 'Private / other' fallback must be private");
  assert(mineral["State park"]?.status === "allowed", "anchor: Crater of Diamonds 'State park' exception must be allowed");
  assert(mineral["State park (protected)"]?.status === "prohibited", "anchor: generic state-park mineral rule must be prohibited");
  assert(mineral.Tribal?.status === "prohibited", "anchor: tribal mineral rule must be prohibited");
}

// --- main ----------------------------------------------------------------------
async function main() {
  const appSource = await readFile(APP_PATH, "utf8");
  const tables = {};

  for (const [tableName, spec] of Object.entries(EXPECTED)) {
    const json = JSON.parse(await readFile(path.join(RULES_DIR, spec.file), "utf8"));
    tables[tableName] = json;
    assert(json.schema === SCHEMA_ID, `${tableName}: schema must be ${SCHEMA_ID}`);
    assert(json.table === tableName, `${tableName}: table field mismatch`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(json.version || ""), `${tableName}: version must be YYYY-MM-DD`);
    assert(typeof json.license === "string" && json.license.includes("CC BY-NC-SA"), `${tableName}: license note missing`);

    const expression = extractConstExpression(appSource, spec.constName);
    if (expression) {
      // Extraction-window deep compare against the still-present app.js const.
      const context = {};
      vm.createContext(context);
      const sources = extractConstExpression(appSource, "ACCESS_RULE_SOURCES");
      if (sources) vm.runInContext(`var ACCESS_RULE_SOURCES = ${sources};`, context, { filename: APP_PATH });
      vm.runInContext(`var __table = ${expression};`, context, { filename: APP_PATH });
      deepCompareTable(tableName, spec, context.__table, json);
      console.log(`${tableName}: deep-compare vs app.js const PASSED (${spec.count} rules)`);
    } else {
      // Steady state: the table must live ONLY in JSON, loaded into a let.
      assert(appSource.includes(`let ${spec.constName} =`),
        `${tableName}: app.js must declare 'let ${spec.constName} =' (boot-loaded from JSON)`);
    }
    checkInvariants(tableName, spec, json);
  }
  checkAnchors(tables);

  if (failures.length) {
    console.error(`FAIL: ${failures.length} rule-extraction equivalence failure(s):`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exit(1);
  }
  const total = Object.values(EXPECTED).reduce((n, spec) => n + spec.count, 0);
  console.log(`PASS: ${total} extracted rules across 3 tables — envelope, provenance, reserved-word, and anchor checks all green.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
