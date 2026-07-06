// Report-only sweep: which class selectors in styles.css have no token match
// anywhere in the surfaces that can produce markup (app.js, index.html,
// attribution.html)? A RAW-SOURCE token search deliberately over-matches —
// classList.toggle("season-open"), template strings, and composed names all
// count as "used" — so anything reported here is dead with high confidence,
// but deletions still deserve a human eye (this script never fails the build).
//
// Known dynamic patterns that would false-negative a naive innerHTML scan are
// safe here because their tokens appear literally in app.js. Classes composed
// character-by-character (none known) would need an allowlist entry below.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(ROOT, "styles.css"), "utf8");
// project-recipes JSON is innerHTML'd into the Projects sheet, so class
// tokens can live there too.
import { readdirSync } from "node:fs";
const recipeFiles = readdirSync(join(ROOT, "data"))
  .filter((file) => file.startsWith("project-recipes") && file.endsWith(".json"))
  .map((file) => join("data", file));
const surfaces = ["app.js", "index.html", "attribution.html", ...recipeFiles]
  .map((file) => readFileSync(join(ROOT, file), "utf8"))
  .join("\n");

// Mapbox GL injects its own DOM; sr-only and print classes may be referenced
// from generated markup later. Keep these out of the report.
const ALLOW_PREFIXES = ["mapboxgl-"];

// Classes COMPOSED at runtime, invisible to a literal token search. Each entry
// documents its composition site — verify before removing.
const ALLOW_TOKENS = new Set([
  // `lf-${recipe.lightfastness.rating}` (app.js getRecipeChipsHTML); ratings
  // "good"/"moderate"/"fugitive" live in data/project-recipes.json.
  "lf-good",
  "lf-moderate",
  "lf-fugitive",
]);

// Strip comments, then collect every .class token used in selector positions
// with a brace-aware pass: accumulate text, harvest tokens when a "{" opens a
// rule, clear (without harvesting) on "}" — a split-on-"}" approach would
// silently drop the FIRST selector inside every @media block. @media preludes
// harvest nothing (no .class tokens in them).
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const classTokens = new Set();
let buffer = "";
for (const ch of cssNoComments) {
  if (ch === "{") {
    for (const match of buffer.matchAll(/\.([a-zA-Z][\w-]*)/g)) classTokens.add(match[1]);
    buffer = "";
  } else if (ch === "}") {
    buffer = "";
  } else {
    buffer += ch;
  }
}

const dead = [];
for (const token of [...classTokens].sort()) {
  if (ALLOW_PREFIXES.some((prefix) => token.startsWith(prefix))) continue;
  if (ALLOW_TOKENS.has(token)) continue;
  // Token search over raw source: word-boundary match so "lede" doesn't
  // claim credit for "sheet-lede".
  const pattern = new RegExp(`(?<![\\w-])${token}(?![\\w-])`);
  if (!pattern.test(surfaces)) dead.push(token);
}

if (dead.length) {
  console.log(`Dead CSS class candidates (${dead.length}) — no token match in app.js/index.html/attribution.html:`);
  dead.forEach((token) => console.log(`  .${token}`));
} else {
  console.log("No dead CSS class candidates.");
}
