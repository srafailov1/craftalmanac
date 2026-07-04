# Rules corpus schema — `data/rules/`

Machine-readable harvesting/collecting rule tables, extracted from `app.js`
(critique-remediation plan 5.2; TODO-content-extraction Phase B, rules only).
These three files are the project's hand-encoded rules corpus and the basis
for the planned published dataset (plan 6.1):

| File | app.js binding | Shape |
| --- | --- | --- |
| `nps-gathering-rules.json` | `NPS_GATHERING_RULES` | array of park entries |
| `site-access-rules.json` | `SITE_ACCESS_RULES` | array of site entries |
| `mineral-access-rules.json` | `MINERAL_ACCESS_RULES` | object keyed by land manager |

Maintained by `scripts/extract_rules.mjs` (idempotent re-normalizer once the
app.js consts are gone), gated by `scripts/test_rules_extraction.mjs`, and
aged by `scripts/check_rule_staleness.mjs` (report-only). The app fetches all
three at boot in `loadAccessRuleTables()`; until they load, every resolver
falls back to conservative defaults (see "Conservative defaults" below).

## Envelope (all three files)

```json
{
  "schema": "craft-almanac-rules/1",
  "table": "nps-gathering-rules",
  "version": "2026-07-04",
  "generatedBy": "scripts/extract_rules.mjs",
  "license": "…",
  "rules": []
}
```

- `schema` — schema identifier; bump the `/1` suffix on breaking shape changes.
- `table` — must match the file name (sans `.json`).
- `version` — `YYYY-MM-DD` dataset snapshot date. Bump when rule content
  changes (adding/removing/editing rules), not for formatting.
- `license` — short statement of the licensing split (see "License" below).
- `rules` — the table payload (array or object per the shapes above).

## Provenance: the `checked` field

Every rule record carries:

```json
"checked": { "by": "agent", "date": "2026-06" }
```

- `checked.by` — `"agent"` or `"owner"`. **`"agent"`** means the rule was
  encoded and checked against its primary source by the scheduled agent
  research loops (see CLAUDE.md, 4am permissions research). **`"owner"`** is
  reserved for rules the owner has personally re-verified against the primary
  source; it is set rule-by-rule, by hand, never by scripts. No rule ships
  with `by: "owner"` until that happens.
- `checked.date` — `YYYY-MM`, the month the rule was last checked. Parsed at
  extraction time from the note's trailing "Month YYYY" (e.g. "Checked against
  the current compendium, June 2026" → `2026-06`); rules whose notes carried
  no date default to `2026-06`, the June 2026 research pass.

**Reserved wording:** the user-facing word **"Verified"** is reserved for
`by: "owner"`. The point-card chip renders "✓ VERIFIED \<Mon YYYY\>" (green)
only for owner-verified rules, "CHECKED \<Mon YYYY\>" (neutral) for
agent-checked rules, and no chip when a rule has no `checked` field (generic
defaults, live PAD-US fallbacks). Accordingly the extraction mechanically
reworded note text "Verified …" → "Checked …" — the only permitted note
change — and the equivalence gate fails any agent-checked rule whose strings
contain "verified".

## `nps-gathering-rules.json` — per-NPS-unit gathering designations

Park-specific 36 CFR 2.1(c) gathering designations, matched against PAD-US
unit text before the generic NPS prohibition. Food mode only; limits reflect
superintendent's compendiums current as of `checked.date`. Fields per entry:

- `match` (key) — lowercase substring matched against the PAD-US unit text
  (`Unit_Nm`/`MngNm_Desc`/`MngTp_Desc`/`DesTp_Desc`, lowercased) in
  `getNpsCompendiumRule`. Order matters: first match wins, so more specific
  strings must precede shorter prefixes.
- `sourceLabel` / `sourceUrl` — the park's compendium (or equivalent primary
  source) cited on the point card.
- `mushroomsAllowed` (boolean) — whether the compendium designates edible
  fungi. When `false`, mushroom-category species resolve **prohibited** even
  though the park designates fruits/berries.
- `mushroomNote` (optional) — the park's stated mushroom prohibition rationale;
  used as the limit text for the prohibited-mushroom card.
- `limit` — the designated species/quantity limits, quoted close to the
  compendium's terms.
- `note` — provenance prose ("Checked against the … compendium, June 2026")
  plus park-specific cautions. Rendered on the point card after the chip.
- `checked` — see above.

Status semantics: an entry match yields `allowed` (or `prohibited` for
mushrooms when `mushroomsAllowed` is false). **Conservative default:** an NPS
unit with *no* entry — or an empty table before boot load — resolves to the
generic 36 CFR 2.1 prohibition in `getPublicLandAccessRule`; unlisted fungi
are additionally gated by the edible-fungus whitelist.

## `site-access-rules.json` — curated per-site rules

Geocoded food forests, edible parks, campuses, and similar sites with an
explicit public-harvest (or explicit no-harvest) policy, matched by bounding
box in `getSiteAccessRule` **before** the public-land rules. Fields per site:

- `name` (key) — human-readable site name.
- `bounds` — `{ south, west, north, east }` decimal-degree bounding box;
  first containing site wins.
- `rules` — map of mode → rule. Modes: `food`, `medicine`, and `default`
  (applies to any mode without its own entry, e.g. ink/dye). Per-mode rule
  fields:
  - `status` — one of `allowed`, `prohibited`, `permit-required`, `private`,
    `private-unsourced`, `unknown`.
  - `label` — display label for the status.
  - `area` — the human-readable place description on the card.
  - `limit` — what may be taken and how much, per the site's policy.
  - `note` — provenance and caution prose (e.g. "Geocoded and
    policy-confirmed June 2026").
  - `sourceLabel` / `sourceUrl` — the site's policy page.
  - `checked` — see above.

**Conservative default:** a record outside every site box — or an empty table
before boot load — falls through to public-land resolution and ultimately to
"Private / unchecked" (`private-unsourced`) when nothing sources the land.

## `mineral-access-rules.json` — per-land-manager collecting rules

Rock/mineral collecting rules keyed by the land-manager string baked into
each MRDS record (`data/minerals-us.json`, `record.perm`). Stone collecting
is governed differently from foraging — the 36 CFR 2.1 food exception does
not cover it. Fields per manager key (`USFS`, `NPS`, `State park`,
`Claimed / fee-dig`, `BLM`, `State trust`, `State park (protected)`,
`Tribal`, `Private / other`):

- `status` / `area` / `limit` / `note` / `sourceLabel` / `sourceUrl` /
  `checked` — as in the site rules above (no `label`: the app derives it from
  `ACCESS_MARKER_STYLES`).

Status semantics and conservative defaults, preserved from the app logic in
`getMineralAccessRule`:

- `Private / other` (`private`) is the fallback for any unknown manager
  string, and the hard-coded in-app fallback while the table is empty during
  the boot-load window — never a permissive default.
- `State park` (`allowed`) encodes exactly one facility exception (Crater of
  Diamonds pay-to-dig); the app additionally downgrades any non-gemstone
  "State park" point to `Private / other` so nothing else inherits it.
  `State park (protected)` (`prohibited`) is the generic state-park rule.
- `NPS` is `prohibited` throughout the National Park System; `Tribal` is
  treated as closed without explicit tribal permission.

## License

The **underlying legal facts** these rules restate — federal regulations
(36 CFR), state codes, superintendent's compendiums, agency policy — are
**public and unrestricted**; facts and U.S. government works are not subject
to copyright, and nothing here claims otherwise. What is original — the
**prose rule summaries, notes, and the selection/arrangement of the compiled
dataset** — is licensed **CC BY-NC-SA 4.0** (see `LICENSE-CONTENT.md`).

The rules are a good-faith reading of primary sources as of each rule's
`checked.date`, offered **without warranty of any kind**. Rules change;
compendiums are reissued; boundaries shift. Occurrence data is never harvest
permission, and none of this is legal advice — always confirm the current
rule with the land manager before collecting.
