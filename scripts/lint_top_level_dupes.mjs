#!/usr/bin/env node
// Lint: catch duplicate top-level declarations in app.js.
//
// Motivation: a duplicate top-level `function getSelectedAccessStatuses` once
// shipped because `node --check` silently ACCEPTS a redeclared top-level
// `function` (and `var`) — the second definition wins, overriding the first.
// That caused the permission-filter outage logged in KNOWN_ISSUES.md item 1.
// Duplicate top-level `const`/`let` would throw at parse time (so node --check
// already catches those), but we report them too for completeness.
//
// "Top-level" here means a declaration starting in column 0 — app.js keeps all
// module-scope declarations un-indented, so this is a reliable heuristic without
// a full parser. Usage: node scripts/lint_top_level_dupes.mjs [file ...]

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const files = process.argv.slice(2);
if (files.length === 0) files.push(path.join(ROOT, "app.js"));

// Top-level declaration forms, anchored at column 0:
//   function NAME(           async function NAME(           function* NAME(
//   const NAME =   let NAME =   var NAME =   (also bare `let NAME;` / `var NAME;`)
const DECL_RE =
  /^(?:async\s+)?function\s*\*?\s+([A-Za-z_$][\w$]*)|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/;

let totalDupes = 0;

for (const file of files) {
  const source = await readFile(file, "utf8");
  const lines = source.split("\n");
  const seen = new Map(); // name -> first line number (1-based)
  const dupes = []; // { name, first, again }

  for (let i = 0; i < lines.length; i += 1) {
    const match = DECL_RE.exec(lines[i]);
    if (!match) continue;
    const name = match[1] || match[2];
    if (!name) continue;
    if (seen.has(name)) {
      dupes.push({ name, first: seen.get(name), again: i + 1 });
    } else {
      seen.set(name, i + 1);
    }
  }

  const rel = path.relative(ROOT, file) || file;
  if (dupes.length === 0) {
    console.log(`PASS  ${rel}: ${seen.size} distinct top-level names, no duplicates`);
  } else {
    totalDupes += dupes.length;
    console.error(`FAIL  ${rel}: ${dupes.length} duplicate top-level declaration(s):`);
    for (const d of dupes) {
      console.error(`        '${d.name}' first declared at line ${d.first}, again at line ${d.again}`);
    }
  }
}

if (totalDupes > 0) {
  console.error(
    "\nDuplicate top-level declarations found. A redeclared `function`/`var` is silently\n" +
      "accepted by `node --check` and the LATER definition wins — see KNOWN_ISSUES.md item 1."
  );
  process.exit(1);
}
