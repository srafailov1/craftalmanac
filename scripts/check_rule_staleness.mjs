#!/usr/bin/env node
// Rule staleness monitor — REPORT ONLY, always exits 0.
//
// Prints every rule in data/rules/*.json whose checked.date is older than 12
// months (month-granularity: stale when now-month minus checked-month > 12),
// plus a summary count. Wired into scripts/check.sh as a non-fatal
// informational step so the age of the corpus is visible in every CI log; the
// 3am/4am scheduled loops own acting on it (re-checking sources and bumping
// checked.date). Rules change; compendiums are reissued — an old checked.date
// is a research queue item, not a build failure.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const RULES_DIR = path.join(ROOT, "data", "rules");
const STALE_AFTER_MONTHS = 12;

const FILES = [
  { file: "nps-gathering-rules.json", shape: "nps" },
  { file: "site-access-rules.json", shape: "site" },
  { file: "mineral-access-rules.json", shape: "mineral" }
];

function flattenRules(shape, rules) {
  if (shape === "nps") return rules.map((rule) => [`"${rule.match}"`, rule]);
  if (shape === "site") {
    const out = [];
    for (const site of rules) {
      for (const [mode, rule] of Object.entries(site.rules)) out.push([`"${site.name}" / ${mode}`, rule]);
    }
    return out;
  }
  return Object.entries(rules).map(([key, rule]) => [`"${key}"`, rule]);
}

function monthIndex(date) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(date || ""));
  if (!match) return null;
  return Number(match[1]) * 12 + (Number(match[2]) - 1);
}

async function main() {
  const now = new Date();
  const nowIndex = now.getUTCFullYear() * 12 + now.getUTCMonth();
  let total = 0;
  let stale = 0;
  let unparseable = 0;

  for (const { file, shape } of FILES) {
    let payload;
    try {
      payload = JSON.parse(await readFile(path.join(RULES_DIR, file), "utf8"));
    } catch (error) {
      console.log(`staleness: could not read ${file} (${error.message}) — skipping`);
      continue;
    }
    for (const [label, rule] of flattenRules(shape, payload.rules || (shape === "mineral" ? {} : []))) {
      total += 1;
      const index = monthIndex(rule.checked?.date);
      if (index === null) {
        unparseable += 1;
        console.log(`STALE? ${file} ${label}: checked.date missing/unparseable (${rule.checked?.date ?? "none"})`);
        continue;
      }
      const age = nowIndex - index;
      if (age > STALE_AFTER_MONTHS) {
        stale += 1;
        console.log(`STALE  ${file} ${label}: checked ${rule.checked.date} (${age} months ago, by ${rule.checked.by})`);
      }
    }
  }

  console.log(
    `Rule staleness: ${stale} of ${total} rules checked more than ${STALE_AFTER_MONTHS} months ago`
    + (unparseable ? `; ${unparseable} with unparseable checked.date` : "")
    + ". (Report only — never fails the build.)"
  );
  process.exit(0);
}

main().catch((error) => {
  // Report-only: even an unexpected error must not fail the check suite.
  console.log(`staleness: monitor error (${error.message}) — report skipped`);
  process.exit(0);
});
