#!/usr/bin/env node
// Static per-species and per-recipe HTML page generator (Phase 5.4).
//
// The app itself stays no-build and JS-rendered, so search engines and link
// previews see none of its authored knowledge. This script emits crawlable,
// JS-free HTML for every material profile and project recipe, plus sitemap.xml
// and robots.txt — the same committed-artifact pattern as the other
// scripts/build_*.mjs generators.
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

const SITE = "https://craftalmanac.com";
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

async function loadAppConstants() {
  const appSource = await readFile(APP_PATH, "utf8");
  const names = [
    "foodSpeciesCatalog",
    "inkSpeciesCatalog",
    "medicineSpeciesCatalog",
    "mineralSpeciesCatalog",
    "SAFETY_TAGS_BY_SPECIES",
    "HARVEST_ETHIC_BY_SPECIES"
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
const MODES = [
  { key: "food", catalog: "foodSpeciesCatalog", label: "Food" },
  { key: "ink", catalog: "inkSpeciesCatalog", label: "Ink & Dye" },
  { key: "medicine", catalog: "medicineSpeciesCatalog", label: "Herbalism" },
  { key: "minerals", catalog: "mineralSpeciesCatalog", label: "Minerals" }
];

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

function categoryLabel(mode, category) {
  return (CATEGORY_LABELS[mode] && CATEGORY_LABELS[mode][category]) || titleCase(category);
}

function titleCase(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Shared text helpers.
// ---------------------------------------------------------------------------
function escapeHtml(value) {
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
function monthRangeText(months) {
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
// Page shell + shared inline CSS (matches attribution.html's paper look; no
// external requests, no JS required to read the page).
// ---------------------------------------------------------------------------
const SHARED_CSS = `
    :root { --ink:#23301f; --paper:#faf8f0; --green:#1f5c3d; --rule:#d8d2bf; --muted:#6b7256; }
    * { box-sizing: border-box; }
    body {
      margin: 0 auto; padding: 32px 20px 72px; max-width: 760px;
      font-family: Georgia, "Times New Roman", serif; color: var(--ink);
      background: var(--paper); line-height: 1.6;
    }
    a { color: var(--green); word-break: break-word; }
    .back-link { font-size: 0.85rem; display: inline-block; margin-bottom: 20px; }
    h1 { font-size: 1.75rem; margin: 0 0 0.12em; line-height: 1.2; }
    h2 { font-size: 1.15rem; margin: 1.9em 0 0.5em; border-bottom: 1px solid var(--rule); padding-bottom: 0.2em; }
    .sci { font-style: italic; color: #5a6152; margin: 0 0 0.5em; font-size: 1.05rem; }
    .teaser { font-size: 1.06rem; color: #3a4432; margin: 0.2em 0 1em; }
    .k, .label {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted);
    }
    .k { font-size: 0.72rem; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0.6em 0 1.1em; padding: 0; list-style: none; }
    .chip {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.74rem;
      border: 1px solid var(--rule); border-radius: 999px; padding: 3px 11px; background: #fff;
      display: inline-flex; align-items: center; gap: 5px;
    }
    .swatch { display: inline-block; width: 0.85em; height: 0.85em; border-radius: 50%; border: 1px solid rgba(0,0,0,0.25); }
    .meta-list { list-style: none; padding: 0; margin: 0.6em 0 1em; }
    .meta-list li { margin: 0.5em 0; }
    .meta-list .label { font-size: 0.7rem; display: block; margin-bottom: 0.1em; }
    .safety { border: 2px solid #a5321f; background: #fbeee9; border-radius: 8px; padding: 14px 16px; margin: 1.3em 0; }
    .safety .k { color: #a5321f; }
    .safety ul { margin: 0.5em 0 0; padding-left: 1.2em; }
    .safety.mild { border-color: #b98a2e; background: #f8f2e2; }
    .safety.mild .k { color: #916516; }
    ol, ul { padding-left: 1.3em; }
    ol li, ul li { margin: 0.35em 0; }
    .ingredients { list-style: none; padding: 0; }
    .ingredients li { margin: 0.4em 0; padding-left: 1em; text-indent: -1em; }
    .opt { color: var(--muted); font-size: 0.85em; }
    .note { color: #5a6152; }
    .cta {
      display: inline-block; margin: 1.1em 0 0.4em; padding: 11px 18px; background: var(--green);
      color: var(--paper); border-radius: 8px; text-decoration: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.82rem;
    }
    .cta:hover { background: #17482f; }
    .cta-note { font-size: 0.9rem; color: #5a6152; margin: 0.3em 0 0; }
    .tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 7px; margin: 0.4em 0; }
    .tags li {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.73rem;
      border: 1px solid var(--rule); border-radius: 4px; padding: 2px 8px; background: #fff; margin: 0;
    }
    p { margin: 0.6em 0; }
    footer { margin-top: 3em; border-top: 1px solid var(--rule); padding-top: 1.2em; font-size: 0.85rem; color: #5a6152; }
    footer p { margin: 0.55em 0; }
    .index-group { margin-bottom: 1.7em; }
    .card-list { list-style: none; padding: 0; margin: 0.4em 0; }
    .card-list li { margin: 0.35em 0; }
    .card-list .card-sci { font-style: italic; color: #6b7256; font-size: 0.9em; }`;

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
    <meta name="theme-color" content="#20241f">
    <meta property="og:type" content="${ogType}">
    <meta property="og:title" content="${titleAttr} · Craft Almanac">
    <meta property="og:description" content="${descAttr}">
    <meta property="og:url" content="${canonical}">
    <style>${SHARED_CSS}
    </style>
  </head>
  <body>
    <a class="back-link" href="${backHref}">&larr; ${escapeHtml(backLabel)}</a>
${body}
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
  lines.push(`<p>Original content is licensed <a href="/LICENSE-CONTENT.md">CC BY-NC-SA 4.0</a>; the application code is licensed PolyForm Noncommercial 1.0.0. Inbound data sources keep their own licenses — see <a href="/attribution.html">attribution notes</a>.</p>`);
  return `    <footer>\n${lines.map((l) => `      ${l}`).join("\n")}\n    </footer>`;
}

// ---------------------------------------------------------------------------
// Species (material) page.
// ---------------------------------------------------------------------------
function speciesSafetyTags(species, safetyMap) {
  if (Array.isArray(species.safetyTags)) return species.safetyTags;
  if (Object.prototype.hasOwnProperty.call(safetyMap, species.id)) return safetyMap[species.id];
  return [];
}

function renderSpeciesPage(species, mode, ctx) {
  const { safetyMap, ethicMap } = ctx;
  const name = species.commonName || species.id;
  const sci = species.scientificName || "";
  const category = categoryLabel(mode.key, species.category);
  const season = monthRangeText(species.months);
  const tags = speciesSafetyTags(species, safetyMap);
  const ethic = ethicMap[species.id];
  const deepLink = `${SITE}/#map=${encodeURIComponent(mode.key)}&sp=${encodeURIComponent(species.id)}`;
  const description = metaDescription(species.notes, `${name} (${sci}) — ${category} on the ${mode.label} map of Craft Almanac.`);

  const parts = [];
  parts.push(`    <main>`);
  parts.push(`      <h1>${escapeHtml(name)}</h1>`);
  if (sci) parts.push(`      <p class="sci">${escapeHtml(sci)}</p>`);
  parts.push(`      <ul class="chips">`);
  parts.push(`        <li class="chip">${escapeHtml(mode.label)} map</li>`);
  parts.push(`        <li class="chip">${escapeHtml(category)}</li>`);
  parts.push(`      </ul>`);

  parts.push(`      <ul class="meta-list">`);
  parts.push(`        <li><span class="label">In season</span>${escapeHtml(season)}</li>`);
  if (species.usedParts) {
    parts.push(`        <li><span class="label">Used parts</span>${escapeHtml(species.usedParts)}</li>`);
  }
  if (ethic) {
    parts.push(`        <li><span class="label">Harvest ethic</span>${escapeHtml(titleCase(ethic))}</li>`);
  }
  if (species.parkLimit) {
    parts.push(`        <li><span class="label">Park limit</span>${escapeHtml(species.parkLimit)}</li>`);
  }
  parts.push(`      </ul>`);

  if (species.notes) {
    parts.push(`      <h2>Notes</h2>`);
    parts.push(`      <p>${escapeHtml(species.notes)}</p>`);
  }

  if (tags.length) {
    const isMineral = mode.key === "minerals";
    parts.push(`      <div class="safety${isMineral ? "" : ""}">`);
    parts.push(`        <div class="k">Safety notes</div>`);
    parts.push(`        <ul>`);
    for (const tag of tags) parts.push(`          <li>${escapeHtml(tag)}</li>`);
    parts.push(`        </ul>`);
    parts.push(`      </div>`);
  }

  parts.push(`      <a class="cta" href="${escapeHtml(deepLink)}">Open ${escapeHtml(name)} on the map &rarr;</a>`);
  parts.push(`      <p class="cta-note">Opens the ${escapeHtml(mode.label)} map focused on this material, with the land-status rules for wherever you look.</p>`);
  parts.push(`    </main>`);
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
  const { recipeIds } = ctx;
  const prose = (t) => renderProse(t, recipeIds, "");
  const name = recipe.name || recipe.id;
  const mapLabel = RECIPE_MAP_LABEL[recipe.map] || titleCase(recipe.map);
  const description = metaDescription(recipe.teaser || recipe.hook, `${name} — a ${mapLabel} project recipe on Craft Almanac.`);

  const parts = [];
  parts.push(`    <main>`);
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
  if (recipe.toxic) chips.push(`<li class="chip" style="border-color:#a5321f;color:#a5321f">Toxic — read safety</li>`);
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
    parts.push(`      <ul>`);
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
  parts.push(`    <main>`);
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
  parts.push(`    <main>`);
  parts.push(`      <h1>Projects</h1>`);
  parts.push(`      <p class="teaser">Every project recipe on Craft Almanac — grouped by map and kind. Each lives in the Projects sheet of its map.</p>`);
  const seenMaps = [...mapOrder.filter((m) => byMap.has(m)), ...[...byMap.keys()].filter((m) => !mapOrder.includes(m))];
  for (const mapKey of seenMaps) {
    const byKind = byMap.get(mapKey);
    parts.push(`      <div class="index-group">`);
    parts.push(`        <h2>${escapeHtml(RECIPE_MAP_LABEL[mapKey] || titleCase(mapKey))} map</h2>`);
    for (const [kind, list] of byKind) {
      parts.push(`        <div class="k">${escapeHtml(titleCase(kind))}</div>`);
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
    ...recipeUrls
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

  const ctx = {
    safetyMap: app.SAFETY_TAGS_BY_SPECIES,
    ethicMap: app.HARVEST_ETHIC_BY_SPECIES,
    recipeIds
  };

  const files = new Map();
  const catalogsByMode = {};
  const speciesUrls = [];

  for (const mode of MODES) {
    const catalog = app[mode.catalog];
    if (!Array.isArray(catalog)) throw new Error(`Catalog ${mode.catalog} did not parse to an array`);
    catalogsByMode[mode.key] = catalog;
    for (const species of catalog) {
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
