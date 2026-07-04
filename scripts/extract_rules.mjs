#!/usr/bin/env node
// Extract the three hand-encoded access-rule tables from app.js into
// versioned JSON under data/rules/ (critique-remediation plan 5.2 /
// TODO-content-extraction Phase B, rules tables only):
//
//   NPS_GATHERING_RULES  -> data/rules/nps-gathering-rules.json
//   SITE_ACCESS_RULES    -> data/rules/site-access-rules.json
//   MINERAL_ACCESS_RULES -> data/rules/mineral-access-rules.json
//
// Two transformations ONLY (everything else must be byte-identical; the
// equivalence gate scripts/test_rules_extraction.mjs enforces this):
//   1. Every rule record gains a machine-readable provenance field
//      `checked: { by: "agent", date: "YYYY-MM" }`. The date is parsed from
//      the rule's note text (last "Month YYYY" occurrence, e.g. "Verified
//      against the current compendium, June 2026" -> "2026-06"); rules whose
//      note carries no parseable date default to "2026-06" (the June 2026
//      research pass). `by` is always "agent": these rules were encoded and
//      checked by scheduled agent runs, not hand-verified by the owner.
//      `by: "owner"` is reserved and set rule-by-rule later as the owner
//      personally re-verifies.
//   2. The user-facing word "Verified" is reserved for `by: "owner"`, so
//      notes are mechanically reworded "Verified ..." -> "Checked ..."
//      (a plain \bVerified\b word replacement; nothing else changes).
//
// Idempotent: if the consts are already gone from app.js, the script
// re-normalizes the existing JSON files instead (re-applies the transforms,
// preserves the recorded version, rewrites with stable formatting). Rules
// with checked.by === "owner" are never reworded on re-normalization.
//
// Schema documentation: docs/rules-schema.md.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const RULES_DIR = path.join(ROOT, "data", "rules");

const SCHEMA_ID = "craft-almanac-rules/1";
const DEFAULT_CHECKED_DATE = "2026-06";
const LICENSE_NOTE =
  "Underlying legal facts (36 CFR, state codes, compendiums) are public and unrestricted; "
  + "the prose summaries, notes, and compilation are CC BY-NC-SA 4.0, offered without warranty. "
  + "See LICENSE-CONTENT.md and docs/rules-schema.md.";

const TABLES = [
  { constName: "NPS_GATHERING_RULES", table: "nps-gathering-rules", file: "nps-gathering-rules.json", shape: "nps" },
  { constName: "SITE_ACCESS_RULES", table: "site-access-rules", file: "site-access-rules.json", shape: "site" },
  { constName: "MINERAL_ACCESS_RULES", table: "mineral-access-rules", file: "mineral-access-rules.json", shape: "mineral" }
];

// --- vm extraction (mirrors scripts/test_safety_tags.mjs) -------------------
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

// --- provenance transforms ---------------------------------------------------
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const MONTH_YEAR_RE = new RegExp(`\\b(${MONTHS.join("|")})\\s+(\\d{4})\\b`, "g");

// Last "Month YYYY" in the note is the check date by convention ("Verified
// against the April 2025 compendium, June 2026." -> 2026-06); earlier matches
// are compendium/publication dates, never the check date.
function parseCheckedDate(note) {
  let last = null;
  for (const m of String(note || "").matchAll(MONTH_YEAR_RE)) last = m;
  if (!last) return null;
  const month = MONTHS.indexOf(last[1]) + 1;
  return `${last[2]}-${String(month).padStart(2, "0")}`;
}

function rewordNote(note) {
  return String(note).replace(/\bVerified\b/g, "Checked");
}

const stats = { rules: 0, reworded: 0, defaultedDates: 0 };

// Transform one rule record: add `checked`, reword the note. Idempotent —
// an already-transformed record passes through unchanged, and owner-checked
// records are never touched.
function transformRule(rule) {
  stats.rules += 1;
  if (rule.checked && rule.checked.by === "owner") return rule;
  const out = { ...rule };
  if (typeof out.note === "string" && /\bVerified\b/.test(out.note)) {
    out.note = rewordNote(out.note);
    stats.reworded += 1;
  }
  if (!out.checked) {
    const date = parseCheckedDate(out.note);
    if (!date) stats.defaultedDates += 1;
    out.checked = { by: "agent", date: date || DEFAULT_CHECKED_DATE };
  }
  return out;
}

function transformTable(shape, data) {
  if (shape === "nps") return data.map(transformRule);
  if (shape === "site") {
    return data.map((site) => ({
      ...site,
      rules: Object.fromEntries(
        Object.entries(site.rules).map(([mode, rule]) => [mode, transformRule(rule)])
      )
    }));
  }
  // mineral: object keyed by land manager
  return Object.fromEntries(
    Object.entries(data).map(([manager, rule]) => [manager, transformRule(rule)])
  );
}

function countRules(shape, rules) {
  if (shape === "nps") return rules.length;
  if (shape === "site") return rules.reduce((n, site) => n + Object.keys(site.rules).length, 0);
  return Object.keys(rules).length;
}

// --- main --------------------------------------------------------------------
async function main() {
  const appSource = await readFile(APP_PATH, "utf8");
  await mkdir(RULES_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);

  for (const spec of TABLES) {
    const outPath = path.join(RULES_DIR, spec.file);
    const expression = extractConstExpression(appSource, spec.constName);
    let raw;
    let version = today;
    let mode;
    if (expression) {
      // Fresh extraction from app.js. SITE_ACCESS_RULES references
      // ACCESS_RULE_SOURCES.<key> for some sourceUrl values, so evaluate with
      // that const in scope — URLs land in the JSON as resolved literals.
      const context = {};
      vm.createContext(context);
      const sources = extractConstExpression(appSource, "ACCESS_RULE_SOURCES");
      if (sources) vm.runInContext(`var ACCESS_RULE_SOURCES = ${sources};`, context, { filename: APP_PATH });
      vm.runInContext(`var __table = ${expression};`, context, { filename: APP_PATH });
      raw = context.__table;
      mode = "extracted from app.js";
    } else {
      // Consts already removed: re-normalize the existing JSON file.
      const existing = JSON.parse(await readFile(outPath, "utf8"));
      raw = existing.rules;
      version = existing.version || today;
      mode = "re-normalized existing JSON";
    }

    const before = { rules: stats.rules, reworded: stats.reworded };
    const rules = transformTable(spec.shape, raw);
    const payload = {
      schema: SCHEMA_ID,
      table: spec.table,
      version,
      generatedBy: "scripts/extract_rules.mjs",
      license: LICENSE_NOTE,
      rules
    };
    await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n");
    console.log(
      `${spec.file}: ${countRules(spec.shape, rules)} rules `
      + `(${stats.rules - before.rules} records, ${stats.reworded - before.reworded} notes reworded) — ${mode}`
    );
  }

  console.log(
    `Total: ${stats.rules} rule records, ${stats.reworded} notes reworded, `
    + `${stats.defaultedDates} checked.date defaulted to ${DEFAULT_CHECKED_DATE}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
