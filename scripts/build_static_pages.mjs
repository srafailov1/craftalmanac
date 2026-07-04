#!/usr/bin/env node
// Static per-species and per-recipe HTML page generator (Phase 5.4).
//
// The app itself stays no-build and JS-rendered, so search engines and link
// previews see none of its authored knowledge. This script emits crawlable,
// JS-free HTML for every material profile and project recipe, plus sitemap.xml
// and robots.txt — the same committed-artifact pattern as the other
// scripts/build_*.mjs generators. The sitemap is the single source of truth
// for the site's static URLs and also lists the QR field-card sheets emitted
// by scripts/build_field_cards.mjs (which imports CARD_PAGES + the shared
// extraction/formatting helpers from this module). Pages carry @media print
// rules so a material or project page prints as a clean one-pager (Phase 5.6).
//
// Sources (all read-only):
//   - app.js  : the four species catalogs + SAFETY_TAGS_BY_SPECIES +
//               HARVEST_ETHIC_BY_SPECIES (vm-extracted, same as
//               scripts/test_safety_tags.mjs — app.js is never modified)
//   - data/project-recipes.json : the 131 recipes
//
// Usage:
//   node scripts/build_static_pages.mjs           regenerate committed pages
//   node scripts/build_static_pages.mjs --verify  fail (exit 1) if committed
//                                                  pages differ from a fresh
//                                                  regeneration (CI staleness
//                                                  gate — wired into check.sh)
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_PATH = path.join(ROOT, "app.js");
const RECIPES_PATH = path.join(ROOT, "data", "project-recipes.json");
const PROFILES_PATH = path.join(ROOT, "data", "material-profiles.json");

export const SITE = "https://craftalmanac.com";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------------------------------------------------------------------------
// app.js const extraction — mirrors scripts/test_safety_tags.mjs exactly so a
// bracket inside a string/template/comment never unbalances the scan.
// ---------------------------------------------------------------------------
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

export async function loadAppConstants() {
  const appSource = await readFile(APP_PATH, "utf8");
  const names = [
    "foodSpeciesCatalog",
    "inkSpeciesCatalog",
    "medicineSpeciesCatalog",
    "mineralSpeciesCatalog",
    "SAFETY_TAGS_BY_SPECIES",
    "HARVEST_ETHIC_BY_SPECIES",
    "MINERAL_WORKABILITY",
    "FOOD_CATEGORY_COLORS",
    "INK_CATEGORY_COLORS",
    "MEDICINE_CATEGORY_COLORS",
    "MINERAL_CATEGORY_COLORS"
  ];
  const context = { MONTHS: [] };
  vm.createContext(context);
  for (const name of names) {
    vm.runInContext(`var ${name} = ${extractConstExpression(appSource, name)};`, context, { filename: APP_PATH });
  }
  return context;
}

// ---------------------------------------------------------------------------
// Static maps (mode metadata + category labels), transcribed read-only from
// MAP_MODE_CONFIG in app.js. Kept in sync by the safety-tag / phenology gates
// that already assert every catalog species has a considered decision.
// ---------------------------------------------------------------------------
export const MODES = [
  { key: "food", catalog: "foodSpeciesCatalog", label: "Food" },
  { key: "ink", catalog: "inkSpeciesCatalog", label: "Ink & Dye" },
  { key: "medicine", catalog: "medicineSpeciesCatalog", label: "Herbalism" },
  { key: "minerals", catalog: "mineralSpeciesCatalog", label: "Minerals" }
];

// QR field-card sheets (scripts/build_field_cards.mjs). Declared here so the
// sitemap — whose single source of truth is this generator — and the card
// generator agree on the exact page set; build_field_cards.mjs imports this.
export const CARD_PAGES = ["cards/index.html", ...MODES.map((m) => `cards/${m.key}.html`)];

// Public URL for a card page ("cards/index.html" -> "<SITE>/cards/").
function cardPageUrl(rel) {
  return `${SITE}/${rel.replace(/index\.html$/, "")}`;
}

const CATEGORY_LABELS = {
  food: { berry: "Berries", fruit: "Fruit", mushroom: "Mushrooms", nut: "Nuts" },
  ink: {
    black: "Black / gray", blue: "Blue / green", brown: "Brown",
    purple: "Purple", red: "Red / pink", yellow: "Yellow / gold"
  },
  medicine: { digestive: "Digestive", immune: "Immune", lymphatic: "Lymphatic", topical: "Topical" },
  minerals: {
    clay: "Clay (pottery)", alabaster: "Alabaster (gypsum)", pipestone: "Pipestone (catlinite)",
    soapstone: "Soapstone (steatite)", serpentine: "Serpentine", limestone: "Limestone (carving)",
    marble: "Marble (carving)", slate: "Slate (engraving)", obsidian: "Obsidian (knapping)",
    silica: "Silica (chert / flint)", novaculite: "Novaculite whetstone", quartz: "Quartz crystal",
    agate: "Agate / jasper", "petrified-wood": "Petrified wood", gemstone: "Gemstone / diamond"
  }
};

// Recipe .map -> friendly map label (recipes exist for food/ink/minerals only).
const RECIPE_MAP_LABEL = { food: "Food", ink: "Ink & Dye", minerals: "Minerals" };

// Section heading for the researched craftUse paragraph, per map.
const CRAFT_USE_HEADING = {
  food: "In the kitchen",
  ink: "As ink & dye",
  medicine: "Traditional &amp; historical use",
  minerals: "In the workshop"
};

function categoryLabel(mode, category) {
  return (CATEGORY_LABELS[mode] && CATEGORY_LABELS[mode][category]) || titleCase(category);
}

export function titleCase(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Shared text helpers.
// ---------------------------------------------------------------------------
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Recipe prose carries [[recipe-id|label]] link tokens. Resolve them to links
// when the target recipe page exists, otherwise render the plain label — never
// leave raw [[...]] visible. Everything outside a token is HTML-escaped.
const TOKEN_RE = /\[\[([^\]|]+)\|([^\]]*)\]\]/g;
function renderProse(text, recipeIds, linkPrefix) {
  const source = String(text ?? "");
  let out = "";
  let last = 0;
  const re = new RegExp(TOKEN_RE.source, "g");
  let match;
  while ((match = re.exec(source)) !== null) {
    out += escapeHtml(source.slice(last, match.index));
    const id = match[1].trim();
    const label = match[2] || id;
    if (recipeIds.has(id)) {
      out += `<a href="${linkPrefix}${escapeHtml(id)}.html">${escapeHtml(label)}</a>`;
    } else {
      out += escapeHtml(label);
    }
    last = match.index + match[0].length;
  }
  out += escapeHtml(source.slice(last));
  return out;
}

// Strip tokens to plain text (for <meta> descriptions / <title>).
function stripTokens(text) {
  return String(text ?? "").replace(TOKEN_RE, (_m, _id, label) => label || _id);
}

function metaDescription(text, fallback = "") {
  const clean = stripTokens(text || fallback).replace(/\s+/g, " ").trim();
  if (clean.length <= 155) return clean;
  const cut = clean.slice(0, 155);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : 155).trim()}…`;
}

// Contiguous month-run formatting, reimplemented from getMonthRangeText.
export function monthRangeText(months) {
  const sorted = [...new Set(months || [])].filter((m) => m >= 1 && m <= 12).sort((a, b) => a - b);
  if (!sorted.length) return "Unknown";
  if (sorted.length === 12) return "Year-round";
  const runs = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === prev + 1) { prev = sorted[i]; continue; }
    runs.push([start, prev]);
    start = prev = sorted[i];
  }
  runs.push([start, prev]);
  if (runs.length > 1 && runs[0][0] === 1 && runs[runs.length - 1][1] === 12) {
    const head = runs.shift();
    runs[runs.length - 1] = [runs[runs.length - 1][0], head[1]];
  }
  return runs.map(([a, b]) => (a === b ? MONTHS[a - 1] : `${MONTHS[a - 1]}-${MONTHS[b - 1]}`)).join(", ");
}

// ---------------------------------------------------------------------------
// Page shell + shared inline CSS. Matches the live app's "register" day theme:
// self-hosted Fraunces Display / Public Sans / IBM Plex Mono (absolute /fonts
// paths so pages in subdirs resolve them), the --reg-* day palette, category
// color spines, and the panel/card visual language of the app's point cards.
// No external requests, no JS required to read the page. The @media print rules
// keep the teaching-pack one-pager (Phase 5.6) — safety content never hides.
// ---------------------------------------------------------------------------
const SHARED_CSS = `
    @font-face { font-family:"Fraunces Display"; font-style:normal; font-weight:600; font-display:swap; src:url("/fonts/fraunces/Fraunces-Display.woff2") format("woff2"); }
    @font-face { font-family:"Fraunces Display"; font-style:italic; font-weight:600; font-display:swap; src:url("/fonts/fraunces/Fraunces-Display-Italic.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:400; font-display:swap; src:url("/fonts/public-sans/PublicSans-Regular.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:500; font-display:swap; src:url("/fonts/public-sans/PublicSans-Medium.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:600; font-display:swap; src:url("/fonts/public-sans/PublicSans-SemiBold.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:700; font-display:swap; src:url("/fonts/public-sans/PublicSans-Bold.woff2") format("woff2"); }
    @font-face { font-family:"IBM Plex Mono"; font-style:normal; font-weight:400; font-display:swap; src:url("/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2") format("woff2"); }
    @font-face { font-family:"IBM Plex Mono"; font-style:normal; font-weight:500; font-display:swap; src:url("/fonts/ibm-plex-mono/IBMPlexMono-Medium.woff2") format("woff2"); }
    :root {
      --ground:#f1f5ec; --panel:#ffffff; --ink:#1f2421; --sub:#5a615b; --hair:#d5dad2;
      --accent:#6b7f2e; --accent-dark:#55671f; --warn:#a8730a;
      --st-allowed:#2f8f46; --st-prohibited:#c74437;
      --glow:0 6px 24px rgba(31,36,33,0.10); --spine:#8b8f86;
      --font-display:"Fraunces Display", Georgia, "Times New Roman", serif;
      --font-ui:"Public Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
      --font-mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: var(--ground); color: var(--ink);
      font-family: var(--font-ui); font-size: 16px; line-height: 1.62;
      -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
    }
    a { color: var(--accent-dark); }
    .topbar {
      max-width: 792px; margin: 0 auto; padding: 22px 20px 0;
      display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
    }
    .wordmark { font-family: var(--font-display); font-weight: 600; font-size: 20px; color: var(--ink); text-decoration: none; }
    .back-link {
      font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--sub); text-decoration: none; white-space: nowrap;
    }
    .back-link:hover { color: var(--accent-dark); }
    .wrap { max-width: 792px; margin: 0 auto; padding: 16px 20px 8px; }
    main.sheet {
      position: relative; background: var(--panel); border: 1px solid var(--hair);
      border-radius: 14px; box-shadow: var(--glow);
      padding: 34px 34px 34px 38px; overflow: hidden;
    }
    main.sheet::before {
      content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: var(--spine);
    }
    .kicker {
      font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.13em; color: var(--sub); margin: 0 0 12px;
      display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center;
    }
    .kicker .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--spine); }
    .kicker .sep { color: var(--hair); }
    h1 { font-family: var(--font-display); font-weight: 600; font-size: 2.5rem; line-height: 1.06; letter-spacing: -0.01em; margin: 0 0 0.12em; }
    .sci { font-family: var(--font-mono); font-style: italic; font-size: 0.95rem; letter-spacing: 0.02em; color: var(--sub); margin: 0 0 1.1em; }
    .lead { font-size: 1.2rem; line-height: 1.5; color: #313a30; margin: 0.2em 0 0.4em; }
    .teaser { font-size: 1.18rem; line-height: 1.5; color: #313a30; margin: 0.2em 0 1.1em; }
    h2 {
      font-family: var(--font-mono); font-weight: 500; font-size: 0.74rem;
      text-transform: uppercase; letter-spacing: 0.14em; color: var(--sub);
      margin: 2.1em 0 0.55em; padding-bottom: 0.5em; border-bottom: 1px solid var(--hair);
    }
    p { margin: 0.7em 0; }
    .meta { list-style: none; padding: 0; margin: 1.4em 0 0.2em; border-top: 1px solid var(--hair); }
    .meta li { display: flex; gap: 16px; align-items: baseline; padding: 9px 0; border-bottom: 1px solid var(--hair); }
    .meta .label { flex: none; width: 116px; font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sub); }
    .meta .val { font-size: 0.98rem; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 1.3em; padding: 0; list-style: none; }
    .chip {
      font-family: var(--font-mono); font-size: 0.67rem; text-transform: uppercase; letter-spacing: 0.08em;
      border: 1px solid var(--hair); border-radius: 999px; padding: 4px 11px; color: var(--sub);
      background: var(--ground); display: inline-flex; align-items: center; gap: 6px;
    }
    .swatch { display: inline-block; width: 0.8em; height: 0.8em; border-radius: 50%; border: 1px solid rgba(0,0,0,0.22); }
    .safety { border: 1px solid var(--st-prohibited); border-left-width: 4px; background: #fbf0ee; border-radius: 9px; padding: 15px 18px; margin: 1.5em 0; }
    .safety .k { font-family: var(--font-mono); font-size: 0.67rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--st-prohibited); margin: 0 0 0.5em; }
    .safety ul { margin: 0.4em 0 0; padding-left: 1.15em; }
    .safety p { margin: 0.5em 0 0; }
    .safety.mild { border-color: var(--warn); background: #f9f2e4; }
    .safety.mild .k { color: var(--warn); }
    ol, ul { padding-left: 1.25em; }
    ol li, ul li { margin: 0.4em 0; }
    .ingredients { list-style: none; padding: 0; }
    .ingredients li { margin: 0.45em 0; padding-left: 1em; text-indent: -1em; }
    .opt { color: var(--sub); font-size: 0.85em; }
    .note { color: var(--sub); }
    .xlinks { list-style: none; padding: 0; margin: 0.6em 0 0; display: grid; gap: 9px; }
    .xlink { display: block; border: 1px solid var(--hair); border-radius: 10px; padding: 12px 15px; text-decoration: none; color: var(--ink); background: var(--ground); transition: border-color .15s, background .15s; }
    .xlink:hover { border-color: var(--accent); background: #fff; }
    .xlink .t { font-weight: 600; }
    .xlink .d { display: block; font-size: 0.85rem; color: var(--sub); margin-top: 2px; }
    .cta {
      display: inline-flex; align-items: center; gap: 8px; margin: 1.7em 0 0.3em;
      padding: 13px 22px; background: var(--accent); color: #fff; border-radius: 10px;
      text-decoration: none; font-weight: 600; font-size: 0.98rem;
    }
    .cta:hover { background: var(--accent-dark); }
    .cta-note { font-size: 0.9rem; color: var(--sub); margin: 0.5em 0 0; }
    .tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 7px; margin: 0.5em 0; }
    .tags li {
      font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.06em;
      border: 1px solid var(--hair); border-radius: 5px; padding: 3px 9px; background: var(--ground); color: var(--sub); margin: 0;
    }
    .sources { list-style: none; padding: 0; margin: 0.5em 0 0; }
    .sources li { margin: 0.45em 0; padding-left: 1.1em; text-indent: -1.1em; font-size: 0.95rem; }
    .sources a { word-break: break-word; }
    .index-group { margin-bottom: 2em; }
    .k-sub { font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.11em; color: var(--sub); margin: 1.1em 0 0.2em; }
    .card-list { list-style: none; padding: 0; margin: 0.5em 0; }
    .card-list li { margin: 0.4em 0; }
    .card-list a { font-weight: 600; text-decoration: none; }
    .card-list a:hover { text-decoration: underline; }
    .card-list .card-sci { font-family: var(--font-mono); font-style: italic; color: var(--sub); font-size: 0.85em; letter-spacing: 0.01em; }
    footer { margin: 26px 0 0; padding-bottom: 56px; }
    footer .fbox { border-top: 2px solid var(--hair); padding-top: 1.3em; font-size: 0.85rem; color: var(--sub); }
    footer p { margin: 0.6em 0; line-height: 1.55; }
    @media (max-width: 480px) {
      .topbar, .wrap { padding-left: 14px; padding-right: 14px; }
      main.sheet { padding: 24px 20px 24px 22px; border-radius: 12px; }
      h1 { font-size: 2rem; }
      .lead, .teaser { font-size: 1.08rem; }
      .meta .label { width: 92px; }
    }
    /* Print: a clean black-on-white one-pager (Phase 5.6 teaching pack).
       Navigation and the license paragraph drop out; safety content ALWAYS
       prints — nothing below may ever hide a .safety block. */
    @page { margin: 14mm; }
    @media print {
      :root { --ground:#fff; --panel:#fff; --ink:#000; --sub:#333; --accent-dark:#000; --hair:#999; }
      body { background: #fff; color: #000; line-height: 1.45; font-size: 12pt; }
      .topbar { padding: 0; }
      .wrap { max-width: none; padding: 0; }
      .wordmark { color: #000; }
      main.sheet { border: none; border-radius: 0; box-shadow: none; padding: 0 0 0 10px; }
      main.sheet::before { background: #000; width: 3px; }
      .back-link, .cta, .cta-note, footer .license { display: none; }
      a { color: #000; text-decoration: none; }
      .sci, .teaser, .lead, .note, .opt, .card-list .card-sci { color: #222; }
      .chip, .tags li, .safety, .safety.mild, .xlink { background: #fff; }
      .safety, .safety.mild { border-color: #000; }
      .safety .k, .safety.mild .k { color: #000; }
      .safety, .ingredients, .meta, ol li, .ingredients li, .xlink { break-inside: avoid; page-break-inside: avoid; }
      h1, h2 { break-after: avoid; page-break-after: avoid; }
      h2, .meta, .meta li { border-color: #000; }
      footer .fbox { border-top-color: #000; color: #000; }
      /* Print the URL of each cited source — only in the Sources list. */
      .sources a[href]::after { content: " (" attr(href) ")"; font-size: 0.85em; color: #333; word-break: break-all; }
    }`;

function pageShell({ title, description, canonicalPath, ogType, body, backHref, backLabel }) {
  const canonical = `${SITE}${canonicalPath}`;
  const descAttr = escapeHtml(description);
  const titleAttr = escapeHtml(title);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} · Craft Almanac</title>
    <meta name="description" content="${descAttr}">
    <link rel="canonical" href="${canonical}">
    <meta name="theme-color" content="#f1f5ec">
    <meta property="og:type" content="${ogType}">
    <meta property="og:title" content="${titleAttr} · Craft Almanac">
    <meta property="og:description" content="${descAttr}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Craft Almanac">
    <link rel="preload" as="font" type="font/woff2" href="/fonts/fraunces/Fraunces-Display.woff2" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="/fonts/public-sans/PublicSans-Regular.woff2" crossorigin>
    <style>${SHARED_CSS}
    </style>
  </head>
  <body>
    <div class="topbar">
      <a class="wordmark" href="/">Craft Almanac</a>
      <a class="back-link" href="${backHref}">&larr; ${escapeHtml(backLabel)}</a>
    </div>
    <div class="wrap">
${body}
    </div>
  </body>
</html>
`;
}

// Shared footer. `flags` toggles the extra safety/disclaimer lines.
function footerHtml({ educationalOnly = false, mineralMaterial = false } = {}) {
  const lines = [
    `<p><strong>Occurrence is never permission</strong> — every point in the app carries the rule for the land it sits on. Confirm identification, local rules, and land-manager permission before collecting.</p>`
  ];
  if (educationalOnly) {
    lines.push(`<p><strong>Herbalism content is educational reference only</strong> — historical and traditional use, not medical advice, and not a harvest recommendation.</p>`);
  }
  if (mineralMaterial) {
    lines.push(`<p>Many recorded mineral localities are old, inactive, or abandoned workings. Never enter shafts, adits, or pits — collect only surface float, and confirm the ground is neither posted nor hazardous.</p>`);
  }
  lines.push(`<p class="license">Original content is licensed <a href="/LICENSE-CONTENT.md">CC BY-NC-SA 4.0</a>; the application code is licensed PolyForm Noncommercial 1.0.0. Inbound data sources keep their own licenses — see <a href="/attribution.html">attribution notes</a>.</p>`);
  return `    <footer>\n      <div class="fbox">\n${lines.map((l) => `        ${l}`).join("\n")}\n      </div>\n    </footer>`;
}

// ---------------------------------------------------------------------------
// Species (material) page.
// ---------------------------------------------------------------------------
export function speciesSafetyTags(species, safetyMap) {
  if (Array.isArray(species.safetyTags)) return species.safetyTags;
  if (Object.prototype.hasOwnProperty.call(safetyMap, species.id)) return safetyMap[species.id];
  return [];
}

function renderSpeciesPage(species, mode, ctx) {
  const { safetyMap, ethicMap, profileMap, recipesByPlant, categoryColorsByMode } = ctx;
  const name = species.commonName || species.id;
  const sci = species.scientificName || "";
  const category = categoryLabel(mode.key, species.category);
  const season = monthRangeText(species.months);
  const tags = speciesSafetyTags(species, safetyMap);
  const ethic = ethicMap[species.id];
  const profile = profileMap.get(species.id) || null;
  const colors = categoryColorsByMode[mode.key] || {};
  const spine = colors[species.category] || "#8b8f86";
  const deepLink = `${SITE}/#map=${encodeURIComponent(mode.key)}&sp=${encodeURIComponent(species.id)}`;
  const description = metaDescription(
    profile && profile.summary ? profile.summary : species.notes,
    `${name} (${sci}) — ${category} on the ${mode.label} map of Craft Almanac.`
  );

  const parts = [];
  parts.push(`      <main class="sheet" style="--spine:${escapeHtml(spine)}">`);
  parts.push(`        <p class="kicker"><span class="dot"></span>${escapeHtml(mode.label)} map <span class="sep">/</span> ${escapeHtml(category)}</p>`);
  parts.push(`        <h1>${escapeHtml(name)}</h1>`);
  if (sci) parts.push(`        <p class="sci">${escapeHtml(sci)}</p>`);
  if (profile && profile.summary) parts.push(`        <p class="lead">${escapeHtml(profile.summary)}</p>`);

  parts.push(`        <ul class="meta">`);
  parts.push(`          <li><span class="label">In season</span><span class="val">${escapeHtml(season)}</span></li>`);
  if (species.usedParts) {
    parts.push(`          <li><span class="label">Used parts</span><span class="val">${escapeHtml(species.usedParts)}</span></li>`);
  }
  if (ethic) {
    parts.push(`          <li><span class="label">Harvest ethic</span><span class="val">${escapeHtml(titleCase(ethic))}</span></li>`);
  }
  if (species.parkLimit) {
    parts.push(`          <li><span class="label">Park limit</span><span class="val">${escapeHtml(species.parkLimit)}</span></li>`);
  }
  parts.push(`        </ul>`);

  // Researched profile sections. Identification carries the toxic-lookalike
  // warnings, so it leads; habitat and craft use follow.
  if (profile && profile.identification) {
    parts.push(`        <h2>Identification &amp; lookalikes</h2>`);
    parts.push(`        <p>${escapeHtml(profile.identification)}</p>`);
  }
  if (profile && profile.habitat) {
    parts.push(`        <h2>Habitat &amp; range</h2>`);
    parts.push(`        <p>${escapeHtml(profile.habitat)}</p>`);
  }
  if (profile && profile.craftUse) {
    parts.push(`        <h2>${CRAFT_USE_HEADING[mode.key] || "Craft use"}</h2>`);
    parts.push(`        <p>${escapeHtml(profile.craftUse)}</p>`);
  }
  // Catalog note — the map's own one-line field caption, kept when present.
  if (species.notes) {
    parts.push(`        <h2>Field note</h2>`);
    parts.push(`        <p>${escapeHtml(species.notes)}</p>`);
  }

  // Safety: the profile's single most-important point leads, then the encoded
  // safety tags. Never hidden (also survives @media print).
  const safetyNote = profile && profile.safetyNote ? profile.safetyNote.trim() : "";
  if (safetyNote || tags.length) {
    parts.push(`        <div class="safety">`);
    parts.push(`          <div class="k">Safety</div>`);
    if (safetyNote) parts.push(`          <p>${escapeHtml(safetyNote)}</p>`);
    if (tags.length) {
      parts.push(`          <ul>`);
      for (const tag of tags) parts.push(`            <li>${escapeHtml(tag)}</li>`);
      parts.push(`          </ul>`);
    }
    parts.push(`        </div>`);
  }

  // Cross-link into the projects that use this material.
  const recipes = recipesByPlant.get(species.id) || [];
  if (recipes.length) {
    parts.push(`        <h2>Make with it</h2>`);
    parts.push(`        <ul class="xlinks">`);
    for (const r of recipes) {
      const rname = r.name || r.id;
      const rdesc = metaDescription(r.teaser || r.hook, "");
      parts.push(`          <li><a class="xlink" href="/projects/${escapeHtml(r.id)}.html"><span class="t">${escapeHtml(rname)} &rarr;</span>${rdesc ? `<span class="d">${escapeHtml(rdesc)}</span>` : ""}</a></li>`);
    }
    parts.push(`        </ul>`);
  }

  // Sources from the researched profile.
  const sources = profile && Array.isArray(profile.sources) ? profile.sources.filter((s) => s && s.url) : [];
  if (sources.length) {
    parts.push(`        <h2>Sources</h2>`);
    parts.push(`        <ul class="sources">`);
    for (const src of sources) {
      parts.push(`          <li><a href="${escapeHtml(src.url)}" rel="noreferrer">${escapeHtml(src.title || src.url)}</a></li>`);
    }
    parts.push(`        </ul>`);
  }

  parts.push(`        <a class="cta" href="${escapeHtml(deepLink)}">Open ${escapeHtml(name)} on the map &rarr;</a>`);
  parts.push(`        <p class="cta-note">Opens the ${escapeHtml(mode.label)} map focused on this material, with the land-status rules for wherever you look.</p>`);
  parts.push(`      </main>`);
  parts.push(footerHtml({
    educationalOnly: mode.key === "medicine",
    mineralMaterial: mode.key === "minerals"
  }));

  return pageShell({
    title: name,
    description,
    canonicalPath: `/materials/${species.id}.html`,
    ogType: "article",
    body: parts.join("\n"),
    backHref: "./",
    backLabel: "All materials"
  });
}

// ---------------------------------------------------------------------------
// Recipe (project) page.
// ---------------------------------------------------------------------------
function renderRecipePage(recipe, ctx) {
  const { recipeIds, speciesIndex, categoryColorsByMode } = ctx;
  const prose = (t) => renderProse(t, recipeIds, "");
  const name = recipe.name || recipe.id;
  const mapLabel = RECIPE_MAP_LABEL[recipe.map] || titleCase(recipe.map);
  const description = metaDescription(recipe.teaser || recipe.hook, `${name} — a ${mapLabel} project recipe on Craft Almanac.`);

  // Spine color: the recipe's own swatch, else its material's category color,
  // else the olive accent — so every project card carries a meaningful spine.
  const material = recipe.plantId ? speciesIndex.get(recipe.plantId) : null;
  let spine = "#6b7f2e";
  if (/^#[0-9a-fA-F]{3,8}$/.test(recipe.swatch || "")) spine = recipe.swatch;
  else if (material) {
    const colors = categoryColorsByMode[material.mode.key] || {};
    spine = colors[material.species.category] || spine;
  }

  const parts = [];
  parts.push(`    <main class="sheet" style="--spine:${escapeHtml(spine)}">`);
  parts.push(`      <p class="kicker"><span class="dot"></span>${escapeHtml(mapLabel)} map${recipe.kind ? ` <span class="sep">/</span> ${escapeHtml(titleCase(recipe.kind))}` : ""}</p>`);
  parts.push(`      <h1>${escapeHtml(name)}</h1>`);
  if (recipe.teaser) parts.push(`      <p class="teaser">${prose(recipe.teaser)}</p>`);

  // Chips: map, kind, difficulty, color swatch.
  const chips = [];
  chips.push(`<li class="chip">${escapeHtml(mapLabel)} map</li>`);
  if (recipe.kind) chips.push(`<li class="chip">${escapeHtml(titleCase(recipe.kind))}</li>`);
  if (recipe.difficulty) chips.push(`<li class="chip">${escapeHtml(recipe.difficulty)}</li>`);
  if (recipe.color) {
    const sw = recipe.swatch ? `<span class="swatch" style="background:${escapeHtml(recipe.swatch)}"></span>` : "";
    chips.push(`<li class="chip">${sw}${escapeHtml(recipe.color)}</li>`);
  }
  if (recipe.toxic) chips.push(`<li class="chip" style="border-color:var(--st-prohibited);color:var(--st-prohibited)">Toxic — read safety</li>`);
  parts.push(`      <ul class="chips">${chips.join("")}</ul>`);

  // Safety FIRST when toxic (prominent); still shown for non-toxic recipes.
  const safety = Array.isArray(recipe.safety) ? recipe.safety.filter(Boolean) : [];
  if (safety.length) {
    parts.push(`      <div class="safety${recipe.toxic ? "" : " mild"}">`);
    parts.push(`        <div class="k">${recipe.toxic ? "Safety — read before you start" : "Safety"}</div>`);
    parts.push(`        <ul>`);
    for (const s of safety) parts.push(`          <li>${prose(s)}</li>`);
    parts.push(`        </ul>`);
    parts.push(`      </div>`);
  }

  // Cross-link back to the foraged material this project uses (after the safety
  // block so a toxic recipe still leads with its warning).
  if (material) {
    const mname = material.species.commonName || material.species.id;
    const msci = material.species.scientificName ? ` — ${material.species.scientificName}` : "";
    parts.push(`      <h2>Foraged from</h2>`);
    parts.push(`      <ul class="xlinks">`);
    parts.push(`        <li><a class="xlink" href="/materials/${escapeHtml(recipe.plantId)}.html"><span class="t">${escapeHtml(mname)} &rarr;</span><span class="d">${escapeHtml(material.mode.label)} map${escapeHtml(msci)}</span></a></li>`);
    parts.push(`      </ul>`);
  }

  if (recipe.hook) {
    parts.push(`      <h2>About</h2>`);
    parts.push(`      <p>${prose(recipe.hook)}</p>`);
  }

  // Ingredients.
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) {
    parts.push(`      <h2>Ingredients</h2>`);
    parts.push(`      <ul class="ingredients">`);
    for (const ing of recipe.ingredients) {
      const item = prose(ing.item);
      const amount = ing.amount ? ` — ${prose(ing.amount)}` : "";
      const optional = ing.required === false ? ` <span class="opt">(optional)</span>` : "";
      const note = ing.note ? ` <span class="note">· ${prose(ing.note)}</span>` : "";
      parts.push(`        <li>${item}${amount}${optional}${note}</li>`);
    }
    parts.push(`      </ul>`);
  }

  // Tools.
  const toolsReq = Array.isArray(recipe.toolsRequired) ? recipe.toolsRequired.filter(Boolean) : [];
  const toolsOpt = Array.isArray(recipe.toolsOptional) ? recipe.toolsOptional.filter(Boolean) : [];
  if (toolsReq.length || toolsOpt.length) {
    parts.push(`      <h2>Tools</h2>`);
    if (toolsReq.length) {
      parts.push(`      <p><strong>Required:</strong> ${toolsReq.map((t) => prose(t)).join(", ")}</p>`);
    }
    if (toolsOpt.length) {
      parts.push(`      <p><strong>Optional:</strong> ${toolsOpt.map((t) => prose(t)).join(", ")}</p>`);
    }
  }

  // Steps.
  if (Array.isArray(recipe.steps) && recipe.steps.length) {
    parts.push(`      <h2>Steps</h2>`);
    parts.push(`      <ol>`);
    for (const step of recipe.steps) parts.push(`        <li>${prose(step)}</li>`);
    parts.push(`      </ol>`);
  }

  // Optional prose sections.
  const proseSections = [
    ["modifiers", "Variations & modifiers"],
    ["preservation", "Preservation & storage"],
    ["yield", "Yield"],
    ["beyondInk", recipe.map === "ink" ? "Beyond the ink" : "Beyond the recipe"]
  ];
  for (const [field, heading] of proseSections) {
    if (recipe[field]) {
      parts.push(`      <h2>${escapeHtml(heading)}</h2>`);
      parts.push(`      <p>${prose(recipe[field])}</p>`);
    }
  }

  // Sources.
  const sources = Array.isArray(recipe.sources) ? recipe.sources.filter((s) => s && s.url) : [];
  if (sources.length) {
    parts.push(`      <h2>Sources</h2>`);
    parts.push(`      <ul class="sources">`);
    for (const src of sources) {
      parts.push(`        <li><a href="${escapeHtml(src.url)}" rel="noreferrer">${escapeHtml(src.title || src.url)}</a></li>`);
    }
    parts.push(`      </ul>`);
  }

  parts.push(`      <a class="cta" href="${SITE}/">Open Craft Almanac &rarr;</a>`);
  parts.push(`      <p class="cta-note">This recipe lives in the Projects sheet of the ${escapeHtml(mapLabel)} map.</p>`);
  parts.push(`    </main>`);
  parts.push(footerHtml({ educationalOnly: recipe.educationalOnly === true }));

  return pageShell({
    title: name,
    description,
    canonicalPath: `/projects/${recipe.id}.html`,
    ogType: "article",
    body: parts.join("\n"),
    backHref: "./",
    backLabel: "All projects"
  });
}

// ---------------------------------------------------------------------------
// Index pages.
// ---------------------------------------------------------------------------
function renderMaterialsIndex(catalogsByMode) {
  const parts = [];
  parts.push(`    <main class="sheet" style="--spine:var(--accent)">`);
  parts.push(`      <p class="kicker"><span class="dot"></span>Craft Almanac <span class="sep">/</span> Reference</p>`);
  parts.push(`      <h1>Materials</h1>`);
  parts.push(`      <p class="teaser">Every material profile across the Craft Almanac maps — grouped by map. Each links into the live map, where every point carries the rule for the land it sits on.</p>`);
  for (const mode of MODES) {
    const list = catalogsByMode[mode.key];
    if (!list || !list.length) continue;
    parts.push(`      <div class="index-group">`);
    parts.push(`        <h2>${escapeHtml(mode.label)}</h2>`);
    parts.push(`        <ul class="card-list">`);
    for (const sp of list) {
      const name = sp.commonName || sp.id;
      const sci = sp.scientificName ? ` <span class="card-sci">${escapeHtml(sp.scientificName)}</span>` : "";
      parts.push(`          <li><a href="./${escapeHtml(sp.id)}.html">${escapeHtml(name)}</a>${sci}</li>`);
    }
    parts.push(`        </ul>`);
    parts.push(`      </div>`);
  }
  parts.push(`    </main>`);
  parts.push(footerHtml());
  return pageShell({
    title: "Materials",
    description: "Every material profile across the Craft Almanac maps — food, ink and dye, herbalism, and minerals — grouped by map.",
    canonicalPath: "/materials/",
    ogType: "website",
    body: parts.join("\n"),
    backHref: "/",
    backLabel: "Back to the map"
  });
}

function renderProjectsIndex(recipes) {
  const byMap = new Map();
  for (const r of recipes) {
    if (!byMap.has(r.map)) byMap.set(r.map, new Map());
    const byKind = byMap.get(r.map);
    if (!byKind.has(r.kind)) byKind.set(r.kind, []);
    byKind.get(r.kind).push(r);
  }
  const mapOrder = ["food", "ink", "minerals"];
  const parts = [];
  parts.push(`    <main class="sheet" style="--spine:var(--accent)">`);
  parts.push(`      <p class="kicker"><span class="dot"></span>Craft Almanac <span class="sep">/</span> Reference</p>`);
  parts.push(`      <h1>Projects</h1>`);
  parts.push(`      <p class="teaser">Every project recipe on Craft Almanac — grouped by map and kind. Each lives in the Projects sheet of its map.</p>`);
  const seenMaps = [...mapOrder.filter((m) => byMap.has(m)), ...[...byMap.keys()].filter((m) => !mapOrder.includes(m))];
  for (const mapKey of seenMaps) {
    const byKind = byMap.get(mapKey);
    parts.push(`      <div class="index-group">`);
    parts.push(`        <h2>${escapeHtml(RECIPE_MAP_LABEL[mapKey] || titleCase(mapKey))} map</h2>`);
    for (const [kind, list] of byKind) {
      parts.push(`        <div class="k-sub">${escapeHtml(titleCase(kind))}</div>`);
      parts.push(`        <ul class="card-list">`);
      for (const r of list) {
        parts.push(`          <li><a href="./${escapeHtml(r.id)}.html">${escapeHtml(r.name || r.id)}</a></li>`);
      }
      parts.push(`        </ul>`);
    }
    parts.push(`      </div>`);
  }
  parts.push(`    </main>`);
  parts.push(footerHtml());
  return pageShell({
    title: "Projects",
    description: "Every project recipe on Craft Almanac — inks, dyes, pigments, foods, and mineral crafts — grouped by map and kind.",
    canonicalPath: "/projects/",
    ogType: "website",
    body: parts.join("\n"),
    backHref: "/",
    backLabel: "Back to the map"
  });
}

// ---------------------------------------------------------------------------
// sitemap.xml + robots.txt.
// ---------------------------------------------------------------------------
function renderSitemap(speciesUrls, recipeUrls) {
  const urls = [
    `${SITE}/`,
    `${SITE}/attribution.html`,
    `${SITE}/materials/`,
    ...speciesUrls,
    `${SITE}/projects/`,
    ...recipeUrls,
    ...CARD_PAGES.map(cardPageUrl)
  ];
  const body = urls.map((u) => `  <url><loc>${escapeHtml(u)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
}

// ---------------------------------------------------------------------------
// Generate everything into an in-memory map { relPath -> content }.
// ---------------------------------------------------------------------------
async function generateAll() {
  const app = await loadAppConstants();
  const recipesRaw = JSON.parse(await readFile(RECIPES_PATH, "utf8"));
  const recipes = Array.isArray(recipesRaw) ? recipesRaw : (recipesRaw.recipes || recipesRaw.projects || []);
  const recipeIds = new Set(recipes.map((r) => r.id));

  // Researched descriptive profiles (data/material-profiles.json), keyed by id.
  const profilesRaw = JSON.parse(await readFile(PROFILES_PATH, "utf8"));
  const profileList = Array.isArray(profilesRaw) ? profilesRaw : (profilesRaw.profiles || []);
  const profileMap = new Map(profileList.map((p) => [p.id, p]));

  // material id -> the recipes that forage it (recipe.plantId), for cross-links.
  const recipesByPlant = new Map();
  for (const r of recipes) {
    if (!r.plantId) continue;
    if (!recipesByPlant.has(r.plantId)) recipesByPlant.set(r.plantId, []);
    recipesByPlant.get(r.plantId).push(r);
  }

  const categoryColorsByMode = {
    food: app.FOOD_CATEGORY_COLORS,
    ink: app.INK_CATEGORY_COLORS,
    medicine: app.MEDICINE_CATEGORY_COLORS,
    minerals: app.MINERAL_CATEGORY_COLORS
  };

  // material id -> { species, mode }, so a recipe can link back to its material.
  const speciesIndex = new Map();
  const catalogsByMode = {};
  for (const mode of MODES) {
    const catalog = app[mode.catalog];
    if (!Array.isArray(catalog)) throw new Error(`Catalog ${mode.catalog} did not parse to an array`);
    catalogsByMode[mode.key] = catalog;
    for (const species of catalog) speciesIndex.set(species.id, { species, mode });
  }

  const ctx = {
    safetyMap: app.SAFETY_TAGS_BY_SPECIES,
    ethicMap: app.HARVEST_ETHIC_BY_SPECIES,
    recipeIds,
    profileMap,
    recipesByPlant,
    categoryColorsByMode,
    speciesIndex
  };

  const files = new Map();
  const speciesUrls = [];

  for (const mode of MODES) {
    for (const species of catalogsByMode[mode.key]) {
      files.set(`materials/${species.id}.html`, renderSpeciesPage(species, mode, ctx));
      speciesUrls.push(`${SITE}/materials/${species.id}.html`);
    }
  }
  files.set("materials/index.html", renderMaterialsIndex(catalogsByMode));

  const recipeUrls = [];
  for (const recipe of recipes) {
    files.set(`projects/${recipe.id}.html`, renderRecipePage(recipe, ctx));
    recipeUrls.push(`${SITE}/projects/${recipe.id}.html`);
  }
  files.set("projects/index.html", renderProjectsIndex(recipes));

  files.set("sitemap.xml", renderSitemap(speciesUrls, recipeUrls));
  files.set("robots.txt", renderRobots());

  const speciesCount = MODES.reduce((n, m) => n + (app[m.catalog] ? app[m.catalog].length : 0), 0);
  return { files, speciesCount, recipeCount: recipes.length };
}

async function writeAll(files) {
  await mkdir(path.join(ROOT, "materials"), { recursive: true });
  await mkdir(path.join(ROOT, "projects"), { recursive: true });
  for (const [rel, content] of files) {
    await writeFile(path.join(ROOT, rel), content, "utf8");
  }
}

// Detect .html pages committed under materials/ or projects/ that a fresh
// generation no longer produces (stale files left behind by a removed entry).
async function findStaleHtml(files) {
  const stale = [];
  for (const dir of ["materials", "projects"]) {
    let entries = [];
    try { entries = await readdir(path.join(ROOT, dir)); } catch { continue; }
    for (const name of entries) {
      if (!name.endsWith(".html")) continue;
      const rel = `${dir}/${name}`;
      if (!files.has(rel)) stale.push(rel);
    }
  }
  return stale;
}

async function verify(files) {
  // Regenerate to a temp dir (honours the "temp dir" contract), then compare
  // both content and the committed file set against the fresh generation.
  const tmp = path.join(ROOT, "scripts", ".static-pages-verify-tmp");
  await rm(tmp, { recursive: true, force: true });
  await mkdir(path.join(tmp, "materials"), { recursive: true });
  await mkdir(path.join(tmp, "projects"), { recursive: true });
  try {
    const diffs = [];
    for (const [rel, content] of files) {
      await writeFile(path.join(tmp, rel), content, "utf8");
      let committed = null;
      try { committed = await readFile(path.join(ROOT, rel), "utf8"); } catch { committed = null; }
      if (committed === null) diffs.push(`missing: ${rel}`);
      else if (committed !== content) diffs.push(`differs: ${rel}`);
    }
    for (const rel of await findStaleHtml(files)) diffs.push(`stale: ${rel}`);
    return diffs;
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

async function main() {
  const isVerify = process.argv.includes("--verify");
  const { files, speciesCount, recipeCount } = await generateAll();

  if (isVerify) {
    const diffs = await verify(files);
    if (diffs.length) {
      console.error(`FAIL: ${diffs.length} static page(s) are stale. Run: node scripts/build_static_pages.mjs`);
      for (const d of diffs.slice(0, 40)) console.error(`  - ${d}`);
      process.exit(1);
    }
    console.log(`PASS: ${files.size} static files up to date (${speciesCount} materials, ${recipeCount} projects).`);
    return;
  }

  await writeAll(files);
  console.log(`Wrote ${files.size} files: ${speciesCount} material pages + index, ${recipeCount} project pages + index, sitemap.xml, robots.txt.`);
}

// Run only when invoked directly — scripts/build_field_cards.mjs imports the
// shared extraction/formatting helpers from this module without side effects.
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
