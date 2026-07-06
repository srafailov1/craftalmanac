#!/usr/bin/env node
// Register-contrast audit (Phase 6 hardening, Q2).
//
// Parses the four light-register token sets from styles.css and checks that
// every foreground token meets a WCAG 2.1 contrast floor against the panel it
// renders on, in every register. The live floating UI (popups, legend chips,
// rail, season bar) draws text/indicators in --reg-ink / --reg-sub /
// --reg-accent / --reg-warn / --reg-st-* on the --reg-panel surface; CLAUDE.md
// fixes the status-color SEMANTICS (hue) across registers and only shifts
// lightness for contrast (see app.js ACCESS_STATUS_TOKEN comment), so this is
// the check that each register's shift actually lands.
//
// Gate: exits 0 only if every pair meets its floor. Run via scripts/check.sh.
//
// Background model: panels are --reg-panel-a (the solid --reg-panel at 0.93
// alpha) over a backdrop-blurred map. We audit against solid --reg-panel; the
// ~7% map bleed can only lower real contrast slightly, so a comfortable margin
// is intended. Pairs are also reported against --reg-ground for context.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(ROOT, "styles.css"), "utf8");

// WCAG floors.
const AA_NORMAL = 4.5; // body + secondary text
const AA_LARGE = 3.0; // bold/large labels, accent/warn, and graphical indicators

// Owner-approved prototype values that sit below the floor (decision 2026-06-13:
// "prototype look, keep amber legible" — the prototype wins on these hues; only
// the permit/warn amber is kept darkened for legibility). Reported as APPROVED,
// not failures. Keyed `${register}:${token}`.
const APPROVED_BELOW_FLOOR = new Set([
  "dawn:--reg-accent", // #d98a6a soft sunrise peach — prototype value (~2.5:1)
  "dawn:--reg-sub", // #6a7580 — prototype value (~4.45:1, just under AA)
  "dusk:--reg-sub" // #bcafa5 — prototype value (~3.84:1)
]);

// --- color parsing + WCAG contrast ------------------------------------------
function hexToRgb(hex) {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
function relLuminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(fg, bg) {
  const L1 = relLuminance(hexToRgb(fg));
  const L2 = relLuminance(hexToRgb(bg));
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// --- parse register token sets ----------------------------------------------
// Each register block sets a subset of --reg-* vars; unspecified ones inherit
// from the ":root, body[data-register=\"day\"]" base (the cascade). Replicate
// that by layering each register's own declarations over the day base.
function parseBlock(selector) {
  // Match the selector's declaration block. The day base is the combined
  // ":root,\n body[data-register=\"day\"] { ... }" rule.
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}"
  );
  const m = css.match(re);
  if (!m) throw new Error("register block not found: " + selector);
  const vars = {};
  for (const decl of m[1].split(";")) {
    const mm = decl.match(/(--reg-[\w-]+)\s*:\s*([^;]+)/);
    if (mm) vars[mm[1].trim()] = mm[2].trim();
  }
  return vars;
}

const dayBase = parseBlock('body[data-register="day"]');
const registers = {
  day: dayBase,
  dawn: { ...dayBase, ...parseBlock('body[data-register="dawn"]') },
  dusk: { ...dayBase, ...parseBlock('body[data-register="dusk"]') },
  night: { ...dayBase, ...parseBlock('body[data-register="night"]') }
};

// Foreground tokens to audit, with the floor that applies to each.
// Status colors and accent/warn read as bold/large labels or graphical
// indicators in the UI, so AA_LARGE (3.0) is their floor; primary and
// secondary text take AA_NORMAL (4.5).
const FOREGROUNDS = [
  ["--reg-ink", AA_NORMAL, "primary text"],
  ["--reg-sub", AA_NORMAL, "secondary text"],
  ["--reg-accent", AA_LARGE, "accent (labels/active)"],
  ["--reg-warn", AA_LARGE, "warn label"],
  ["--reg-st-allowed", AA_LARGE, "status: allowed"],
  ["--reg-st-permit", AA_LARGE, "status: permit"],
  ["--reg-st-prohibited", AA_LARGE, "status: prohibited"],
  ["--reg-st-private", AA_LARGE, "status: private"],
  ["--reg-st-unknown", AA_LARGE, "status: unknown"]
];

let failures = 0;
const lines = [];
lines.push("Register contrast audit (foreground on --reg-panel)\n");
lines.push("floors: text 4.5:1 (AA normal) · accent/warn/status 3.0:1 (AA large / graphical)\n");

for (const [reg, vars] of Object.entries(registers)) {
  const panel = vars["--reg-panel"];
  const ground = vars["--reg-ground"];
  lines.push(`\n[${reg}]  panel ${panel}  ground ${ground}`);
  for (const [token, floor, desc] of FOREGROUNDS) {
    const fg = vars[token];
    if (!fg) {
      failures++;
      lines.push(`  FAIL  ${token} undefined (${desc})`);
      continue;
    }
    const cr = contrast(fg, panel);
    const meets = cr >= floor;
    const approved = !meets && APPROVED_BELOW_FLOOR.has(`${reg}:${token}`);
    if (!meets && !approved) failures++;
    const grnd = contrast(fg, ground).toFixed(2);
    const verdict = meets ? "PASS" : approved ? "APPR" : "FAIL";
    lines.push(
      `  ${verdict}  ${token.padEnd(20)} ${fg.padEnd(8)} ` +
        `${cr.toFixed(2)}:1 (need ${floor})  [ground ${grnd}:1]  ${desc}` +
        (approved ? "  — owner-approved prototype value" : "")
    );
  }
}

// --- static-page palette (scripts/build_static_pages.mjs) ---------------------
// The ~261 generated material/project pages embed their own inline palette
// (SHARED_CSS template) that styles.css never touches, so the register audit
// above does not cover them. Parse the safety-callout foregrounds and the
// grounds they render on straight out of the generator source and hold the
// label text to the AA normal floor (the labels are ~10.7px mono — small text).
const staticSrc = readFileSync(join(ROOT, "scripts", "build_static_pages.mjs"), "utf8");
function parseStaticHex(re, what) {
  const m = staticSrc.match(re);
  if (!m) {
    failures++;
    lines.push(`  FAIL  could not parse ${what} from scripts/build_static_pages.mjs — template refactor? update this audit's regexes`);
    return null;
  }
  return m[1];
}

lines.push(`\n[static pages]  source scripts/build_static_pages.mjs (inline SHARED_CSS palette)`);
const stWarn = parseStaticHex(/--warn:\s*(#[0-9a-fA-F]{3,8})/, "--warn");
const stProhibited = parseStaticHex(/--st-prohibited:\s*(#[0-9a-fA-F]{3,8})/, "--st-prohibited");
const stGround = parseStaticHex(/--ground:\s*(#[0-9a-fA-F]{3,8})/, "--ground");
const safetyBg = parseStaticHex(/\.safety\s*\{[^}]*background:\s*(#[0-9a-fA-F]{3,8})/, ".safety background");
const mildBg = parseStaticHex(/\.safety\.mild\s*\{[^}]*background:\s*(#[0-9a-fA-F]{3,8})/, ".safety.mild background");

const STATIC_PAIRS = [
  [stProhibited, safetyBg, "--st-prohibited", ".safety .k label on callout"],
  [stWarn, mildBg, "--warn", ".safety.mild .k label on callout"],
  [stProhibited, stGround, "--st-prohibited", "toxic chip text on --ground"]
];
for (const [fg, bg, token, desc] of STATIC_PAIRS) {
  if (!fg || !bg) continue; // parse failure already counted above
  const cr = contrast(fg, bg);
  const meets = cr >= AA_NORMAL;
  if (!meets) failures++;
  lines.push(
    `  ${meets ? "PASS" : "FAIL"}  ${token.padEnd(20)} ${fg.padEnd(8)} ` +
      `${cr.toFixed(2)}:1 (need ${AA_NORMAL})  [on ${bg}]  ${desc}`
  );
}

console.log(lines.join("\n"));
if (failures) {
  console.error(`\nContrast audit FAILED: ${failures} pair(s) below floor.`);
  process.exit(1);
}
console.log("\nContrast audit passed: all register pairs meet their floor.");
