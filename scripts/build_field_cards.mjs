#!/usr/bin/env node
// QR field-card sheet generator (Phase 5.6 teaching pack).
//
// Emits cards/<mode>.html — one printable sheet per map mode (food, ink,
// medicine, minerals) laid out as cut-out field cards (2 columns × 4 rows per
// printed page, ~85×54 mm each, dashed cut borders) — plus cards/index.html
// with print instructions. Each card carries the species' season (or mineral
// workability class), safety tags, harvest-ethic label, and a QR code linking
// to its /materials/<id>.html profile. Committed-artifact pattern: outputs are
// checked in, and --verify is the CI staleness gate (wired into check.sh).
//
// Sources (all read-only):
//   - app.js catalogs + SAFETY_TAGS_BY_SPECIES + HARVEST_ETHIC_BY_SPECIES +
//     MINERAL_WORKABILITY, via the vm extraction shared with
//     scripts/build_static_pages.mjs (imported — never duplicated)
//   - scripts/vendor/qrcodegen.mjs : Project Nayuki's QR encoder (MIT),
//     rendered as inline SVG at medium error correction
//
// Usage:
//   node scripts/build_field_cards.mjs           regenerate committed sheets
//   node scripts/build_field_cards.mjs --verify  fail (exit 1) if committed
//                                                 sheets differ from a fresh
//                                                 regeneration
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import qrcodegen from "./vendor/qrcodegen.mjs";
import {
  CARD_PAGES,
  MODES,
  SITE,
  loadAppConstants,
  escapeHtml,
  monthRangeText,
  titleCase,
  speciesSafetyTags
} from "./build_static_pages.mjs";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

// Workability band labels, transcribed from mineralWorkBand() in app.js —
// the <28 / <56 thresholds MUST match it.
function workabilityLabel(value) {
  if (typeof value !== "number") return "Unclassified";
  if (value < 28) return "Soft — carving & pottery";
  if (value < 56) return "Medium — carving & engraving";
  return "Hard — sharpening, knapping & lapidary";
}

// Per-card standing notes required by the project's safety values.
const MODE_CARD_NOTE = {
  medicine: "Educational reference only — not medical advice",
  minerals: "Surface float only — never enter old mine workings"
};
const CARD_FOOT = "Occurrence ≠ permission — check the rule in the app";

// ---------------------------------------------------------------------------
// QR rendering: inline SVG (one path of dark modules), medium error
// correction, 3-module quiet zone. Deterministic for a given URL, so the
// committed sheets are stable under --verify.
// ---------------------------------------------------------------------------
function qrSvg(url, label) {
  const qr = qrcodegen.QrCode.encodeText(url, qrcodegen.QrCode.Ecc.MEDIUM);
  const border = 3;
  const size = qr.size + border * 2;
  const cells = [];
  for (let y = 0; y < qr.size; y += 1) {
    for (let x = 0; x < qr.size; x += 1) {
      if (qr.getModule(x, y)) cells.push(`M${x + border},${y + border}h1v1h-1z`);
    }
  }
  return `<svg class="qr" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="QR code: ${escapeHtml(label)}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${cells.join("")}" fill="#000"/></svg>`;
}

// ---------------------------------------------------------------------------
// Sheet CSS. Physical units (mm/pt) keep the cut grid true at 100% print
// scale: 2 × 85mm columns + 3mm gutters = 173mm, inside letter/A4 printable
// width at 14mm margins; 4 × 54mm rows per page ≈ 8 cards a sheet.
// ---------------------------------------------------------------------------
const CARDS_CSS = `
    @font-face { font-family:"Fraunces Display"; font-style:normal; font-weight:600; font-display:swap; src:url("/fonts/fraunces/Fraunces-Display.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:400; font-display:swap; src:url("/fonts/public-sans/PublicSans-Regular.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:600; font-display:swap; src:url("/fonts/public-sans/PublicSans-SemiBold.woff2") format("woff2"); }
    @font-face { font-family:"Public Sans"; font-style:normal; font-weight:700; font-display:swap; src:url("/fonts/public-sans/PublicSans-Bold.woff2") format("woff2"); }
    @font-face { font-family:"IBM Plex Mono"; font-style:normal; font-weight:400; font-display:swap; src:url("/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2") format("woff2"); }
    @font-face { font-family:"IBM Plex Mono"; font-style:normal; font-weight:500; font-display:swap; src:url("/fonts/ibm-plex-mono/IBMPlexMono-Medium.woff2") format("woff2"); }
    :root {
      --ink:#1f2421; --ground:#f1f5ec; --sub:#5a615b; --hair:#d5dad2; --accent-dark:#55671f;
      --font-display:"Fraunces Display", Georgia, serif;
      --font-ui:"Public Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
      --font-mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px 14px 56px; background: var(--ground); color: var(--ink); font-family: var(--font-ui); -webkit-font-smoothing: antialiased; }
    a { color: var(--accent-dark); }
    .intro { max-width: 720px; margin: 0 auto 22px; line-height: 1.55; }
    .intro h1 { font-family: var(--font-display); font-weight: 600; font-size: 2rem; letter-spacing: -0.01em; margin: 0.15em 0 0.3em; color: var(--ink); }
    .intro p { margin: 0.5em 0; font-size: 0.97rem; }
    .intro .k { font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--sub); }
    .sheet-list { list-style: none; padding: 0; margin: 1em 0; }
    .sheet-list li { margin: 0.55em 0; }
    .sheet-list a { font-weight: 600; text-decoration: none; }
    .sheet-list a:hover { text-decoration: underline; }
    .sheet-list .count { color: var(--sub); font-size: 0.85em; }
    .sheet { display: grid; grid-template-columns: repeat(2, 85mm); grid-auto-rows: minmax(54mm, auto); gap: 3mm; justify-content: center; }
    .card { display: flex; flex-direction: column; border: 1px dashed #8b8b8b; background: #fff; padding: 3.2mm 3.5mm 2.4mm; break-inside: avoid; page-break-inside: avoid; }
    .card-top { display: flex; gap: 2.5mm; flex: 1; }
    .card-main { flex: 1; min-width: 0; }
    .card-side { width: 19mm; flex: none; display: flex; flex-direction: column; align-items: center; gap: 0.6mm; }
    .qr { width: 19mm; height: 19mm; display: block; }
    .qr-cap { font-family: var(--font-mono); font-size: 4.6pt; color: #555; letter-spacing: 0.02em; }
    .name { font-family: var(--font-display); font-size: 11pt; line-height: 1.08; margin: 0; font-weight: 600; color: #000; }
    .sci { font-family: var(--font-mono); font-size: 6.9pt; font-style: italic; color: #333; margin: 0.5mm 0 1.3mm; letter-spacing: 0.01em; }
    .row { font-size: 6.8pt; line-height: 1.35; margin: 0.7mm 0; color: #111; }
    .row b { font-family: var(--font-mono); font-size: 5.6pt; text-transform: uppercase; letter-spacing: 0.06em; color: #444; font-weight: 500; }
    .row.safety b { color: #a12817; }
    .mode-note { font-family: var(--font-mono); font-size: 5.6pt; text-transform: uppercase; letter-spacing: 0.05em; margin: 1mm 0 0; color: #000; }
    .foot { margin-top: 1.4mm; padding-top: 1mm; border-top: 0.3mm solid #b9b9b9; font-family: var(--font-mono); font-size: 5.4pt; text-transform: uppercase; letter-spacing: 0.04em; color: #333; }
    footer.page-foot { max-width: 720px; margin: 34px auto 0; border-top: 2px solid var(--hair); padding-top: 1em; font-size: 0.85rem; color: var(--sub); line-height: 1.55; }
    @page { margin: 14mm; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none; }
    }`;

function cardsPageShell({ title, description, canonicalPath, body }) {
  const canonical = `${SITE}${canonicalPath}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} · Craft Almanac</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonical}">
    <meta name="theme-color" content="#f1f5ec">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)} · Craft Almanac">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Craft Almanac">
    <style>${CARDS_CSS}
    </style>
  </head>
  <body>
${body}
  </body>
</html>
`;
}

// ---------------------------------------------------------------------------
// One card per species.
// ---------------------------------------------------------------------------
function renderCard(species, mode, ctx) {
  const name = species.commonName || species.id;
  const sci = species.scientificName || "";
  const tags = speciesSafetyTags(species, ctx.safetyMap);
  const ethic = ctx.ethicMap[species.id];
  const url = `${SITE}/materials/${species.id}.html`;

  const rows = [];
  if (mode.key === "minerals") {
    rows.push(`<p class="row"><b>Workability</b> ${escapeHtml(workabilityLabel(ctx.workability[species.category]))}</p>`);
  } else {
    rows.push(`<p class="row"><b>Season</b> ${escapeHtml(monthRangeText(species.months))}</p>`);
  }
  if (tags.length) {
    rows.push(`<p class="row safety"><b>Safety:</b> ${escapeHtml(tags.join(", "))}</p>`);
  }
  if (ethic) {
    rows.push(`<p class="row"><b>Ethic</b> ${escapeHtml(titleCase(ethic))}</p>`);
  }

  const parts = [];
  parts.push(`      <article class="card">`);
  parts.push(`        <div class="card-top">`);
  parts.push(`          <div class="card-main">`);
  parts.push(`            <h3 class="name">${escapeHtml(name)}</h3>`);
  if (sci) parts.push(`            <p class="sci">${escapeHtml(sci)}</p>`);
  for (const row of rows) parts.push(`            ${row}`);
  const note = MODE_CARD_NOTE[mode.key];
  if (note) parts.push(`            <p class="mode-note">${escapeHtml(note)}</p>`);
  parts.push(`          </div>`);
  parts.push(`          <div class="card-side">`);
  parts.push(`            ${qrSvg(url, `${name} on craftalmanac.com`)}`);
  parts.push(`            <span class="qr-cap">craftalmanac.com</span>`);
  parts.push(`          </div>`);
  parts.push(`        </div>`);
  parts.push(`        <p class="foot">${escapeHtml(CARD_FOOT)}</p>`);
  parts.push(`      </article>`);
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// One sheet per mode.
// ---------------------------------------------------------------------------
function renderSheet(mode, catalog, ctx) {
  const parts = [];
  parts.push(`    <header class="intro no-print">`);
  parts.push(`      <div class="k">Craft Almanac · field cards</div>`);
  parts.push(`      <h1>${escapeHtml(mode.label)} field cards</h1>`);
  parts.push(`      <p>${catalog.length} cut-out cards, eight per printed page. Print at 100% scale (no “fit to page”), portrait, letter or A4, then cut on the dashed lines. Each QR code opens the material's profile; the app carries the land-status rule wherever you look — occurrence is never permission.</p>`);
  parts.push(`      <p><a href="./">All card sheets</a> · <a href="/materials/">Material profiles</a></p>`);
  parts.push(`    </header>`);
  parts.push(`    <section class="sheet">`);
  for (const species of catalog) parts.push(renderCard(species, mode, ctx));
  parts.push(`    </section>`);
  return cardsPageShell({
    title: `${mode.label} field cards`,
    description: `Printable cut-out field cards for every material on the Craft Almanac ${mode.label} map — season, safety tags, harvest ethic, and a QR link to each profile.`,
    canonicalPath: `/cards/${mode.key}.html`,
    body: parts.join("\n")
  });
}

// ---------------------------------------------------------------------------
// cards/index.html.
// ---------------------------------------------------------------------------
function renderCardsIndex(countsByMode) {
  const parts = [];
  parts.push(`    <main class="intro">`);
  parts.push(`      <div class="k">Craft Almanac · teaching pack</div>`);
  parts.push(`      <h1>Field cards</h1>`);
  parts.push(`      <p>Printable sheets of cut-out field cards — one card per material, with its season (or workability, for minerals), safety tags, harvest-ethic label, and a QR code that opens the material's profile page. Print at 100% scale (no “fit to page”) on letter or A4 paper, portrait, then cut along the dashed borders; each printed page holds eight cards.</p>`);
  parts.push(`      <ul class="sheet-list">`);
  for (const mode of MODES) {
    const count = countsByMode[mode.key] || 0;
    parts.push(`        <li><a href="./${mode.key}.html">${escapeHtml(mode.label)} field cards</a> <span class="count">— ${count} cards</span></li>`);
  }
  parts.push(`      </ul>`);
  parts.push(`    </main>`);
  parts.push(`    <footer class="page-foot">`);
  parts.push(`      <p><strong>Occurrence is never permission</strong> — the cards are identification and ethics aids, not harvest rights. Every point in the app carries the rule for the land it sits on; check it before collecting. Herbalism cards are educational reference only, not medical advice.</p>`);
  parts.push(`    </footer>`);
  return cardsPageShell({
    title: "Field cards",
    description: "Printable QR field cards for the Craft Almanac maps — food, ink and dye, herbalism, and minerals. Cut-out cards with seasons, safety tags, and profile links.",
    canonicalPath: "/cards/",
    body: parts.join("\n")
  });
}

// ---------------------------------------------------------------------------
// Generate, write, verify — the committed-artifact contract.
// ---------------------------------------------------------------------------
async function generateAll() {
  const app = await loadAppConstants();
  const ctx = {
    safetyMap: app.SAFETY_TAGS_BY_SPECIES,
    ethicMap: app.HARVEST_ETHIC_BY_SPECIES,
    workability: app.MINERAL_WORKABILITY
  };

  const files = new Map();
  const countsByMode = {};
  for (const mode of MODES) {
    const catalog = app[mode.catalog];
    if (!Array.isArray(catalog)) throw new Error(`Catalog ${mode.catalog} did not parse to an array`);
    countsByMode[mode.key] = catalog.length;
    files.set(`cards/${mode.key}.html`, renderSheet(mode, catalog, ctx));
  }
  files.set("cards/index.html", renderCardsIndex(countsByMode));

  // Keep the emitted page set locked to CARD_PAGES (the sitemap's source of
  // truth in build_static_pages.mjs) so the two generators can never drift.
  const expected = new Set(CARD_PAGES);
  if (files.size !== expected.size || ![...files.keys()].every((rel) => expected.has(rel))) {
    throw new Error(`Card page set drifted from CARD_PAGES in build_static_pages.mjs: [${[...files.keys()]}] vs [${CARD_PAGES}]`);
  }
  return { files, countsByMode };
}

async function writeAll(files) {
  await mkdir(path.join(ROOT, "cards"), { recursive: true });
  for (const [rel, content] of files) {
    await writeFile(path.join(ROOT, rel), content, "utf8");
  }
}

async function verify(files) {
  const diffs = [];
  for (const [rel, content] of files) {
    let committed = null;
    try { committed = await readFile(path.join(ROOT, rel), "utf8"); } catch { committed = null; }
    if (committed === null) diffs.push(`missing: ${rel}`);
    else if (committed !== content) diffs.push(`differs: ${rel}`);
  }
  let entries = [];
  try { entries = await readdir(path.join(ROOT, "cards")); } catch { entries = []; }
  for (const name of entries) {
    if (!name.endsWith(".html")) continue;
    if (!files.has(`cards/${name}`)) diffs.push(`stale: cards/${name}`);
  }
  return diffs;
}

async function main() {
  const isVerify = process.argv.includes("--verify");
  const { files, countsByMode } = await generateAll();
  const total = Object.values(countsByMode).reduce((a, b) => a + b, 0);
  const summary = MODES.map((m) => `${m.key} ${countsByMode[m.key]}`).join(", ");

  if (isVerify) {
    const diffs = await verify(files);
    if (diffs.length) {
      console.error(`FAIL: ${diffs.length} field-card sheet(s) are stale. Run: node scripts/build_field_cards.mjs`);
      for (const d of diffs) console.error(`  - ${d}`);
      process.exit(1);
    }
    console.log(`PASS: ${files.size} card pages up to date (${total} cards: ${summary}).`);
    return;
  }

  await writeAll(files);
  console.log(`Wrote ${files.size} card pages: ${total} cards (${summary}) + index.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
