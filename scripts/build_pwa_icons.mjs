#!/usr/bin/env node
// Build the PWA icon files from the app's inline SVG favicon.
//
// This repo has NO build step and NO package manager, so we cannot pull in a
// rasterizer (sharp/canvas/resvg) to emit PNGs. Manifests DO accept SVG icons
// (`"type": "image/svg+xml"`), which keeps the whole thing build-free and
// crisp at every density. So this script emits two committed SVG files:
//
//   icons/icon.svg           — the leaf on a dark rounded square (purpose "any")
//   icons/icon-maskable.svg  — the same leaf, scaled into the maskable safe
//                              zone (center 80%) with the dark background
//                              bleeding full to the edges (purpose "maskable")
//
// Source of truth is the favicon path in index.html (green leaf on dark rounded
// square, viewBox 0 0 16 16). If the favicon ever changes, update SOURCE below
// and rerun `node scripts/build_pwa_icons.mjs` to regenerate the icon files.
//
// Usage:
//   node scripts/build_pwa_icons.mjs           # write the icon files
//   node scripts/build_pwa_icons.mjs --verify  # fail if committed files drift

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Favicon source (kept in sync with index.html's <link rel="icon"> data URI).
const BG = "#20241f"; // dark rounded square — matches theme_color / background_color
const LEAF = "#6b7f2e"; // green leaf
const LEAF_PATH = "M8 2.5c3.2 1.6 3.2 6.4 0 11C4.8 8.9 4.8 4.1 8 2.5z";

// "any"-purpose icon: full 16x16 artwork, rounded corners, edge-to-edge leaf.
// A 512-unit viewBox keeps the rounded-corner radius visually identical to the
// favicon (rx 3/16 of the side) while being resolution-independent.
const iconAny = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="512" height="512" role="img" aria-label="Craft Almanac">
  <rect width="16" height="16" rx="3" fill="${BG}"/>
  <path d="${LEAF_PATH}" fill="${LEAF}"/>
</svg>
`;

// Maskable icon: the platform may crop this to a circle/squircle, so keep all
// meaningful artwork inside the center 80% "safe zone" and let the background
// bleed to the edges (no rounded corners — the OS applies the mask shape).
// We translate+scale the 16x16 leaf into the central 80% region:
//   scale 0.8, then translate by (1 - 0.8)/2 * 16 = 1.6 units on each axis.
const iconMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="512" height="512" role="img" aria-label="Craft Almanac">
  <rect width="16" height="16" fill="${BG}"/>
  <g transform="translate(1.6 1.6) scale(0.8)">
    <path d="${LEAF_PATH}" fill="${LEAF}"/>
  </g>
</svg>
`;

const files = [
  { path: join(ROOT, "icons", "icon.svg"), content: iconAny },
  { path: join(ROOT, "icons", "icon-maskable.svg"), content: iconMaskable },
];

const verify = process.argv.includes("--verify");
let drift = false;

for (const { path, content } of files) {
  if (verify) {
    let existing = null;
    try {
      existing = readFileSync(path, "utf8");
    } catch {
      /* missing file counts as drift below */
    }
    if (existing !== content) {
      drift = true;
      console.error(`DRIFT: ${path} is out of date — run: node scripts/build_pwa_icons.mjs`);
    }
  } else {
    writeFileSync(path, content);
    console.log(`wrote ${path}`);
  }
}

if (verify && drift) process.exit(1);
if (verify) console.log("PWA icons up to date.");
