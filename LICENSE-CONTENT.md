# Craft Almanac — Content & Data Licensing

Craft Almanac has three layers with different legal characters. This file
states what applies to each. (See `LICENSE.md` for the code license and
`ATTRIBUTION.md` for every inbound data source and its license.)

## 1. Code

The application code (`app.js`, `styles.css`, `index.html`, `scripts/`) is
licensed under the **PolyForm Noncommercial License 1.0.0** — see
`LICENSE.md`.

Required Notice: Copyright © 2026 Sasson Rafailov.

## 2. Original content

All original written and creative content — the project recipes
(`data/project-recipes.json`), species profiles and notes, safety writing,
About/interface copy, and the research documents under `docs/` — is
copyright © 2026 Sasson Rafailov and licensed under
**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
(CC BY-NC-SA 4.0)**: <https://creativecommons.org/licenses/by-nc-sa/4.0/>

This matches the license of the project's largest inbound data sources
(iNaturalist, Falling Fruit), so the site's original content carries the same
share-alike, noncommercial spirit as the data it builds on. Attribute
"Craft Almanac / Sasson Rafailov" with a link back.

## 3. Rules datasets (harvesting / collecting rules)

The access-rule tables (NPS gathering rules, site access rules, and mineral
collecting rules in `data/rules/`; state-system rules in `app.js`; USFS forest
rules in `data/usfs-forest-rules.json`; local jurisdictions in
`data/local-jurisdictions.json` — schema documented in
`docs/rules-schema.md`) are built from
**public legal facts**: federal regulations (36 CFR), state codes,
superintendent's compendiums, and agency policy pages. Facts and U.S.
government works are not subject to copyright, and nothing here claims
otherwise — anyone may state what the law says.

What IS original here — the prose rule summaries, the verification notes, and
the selection and arrangement of the compiled dataset — is licensed
**CC BY-NC-SA 4.0**, the same as the content above.

### No warranty — educational use

The rules are a good-faith reading of primary sources, verified on the dates
noted, and offered **without warranty of any kind**. Rules change; compendiums
are reissued; boundaries shift. Occurrence is never permission. Always confirm
the current rule with the land manager before collecting. Nothing in this
project is legal advice, and the author accepts no liability for collecting
decisions made in reliance on it.

## 4. Inbound data

Third-party data remain under their own licenses and terms — iNaturalist
(CC BY-NC), Falling Fruit (CC BY-NC-SA 4.0), USGS/NPS/USFS/Census (public
domain U.S. government works), and the rest — enumerated with source links in
`ATTRIBUTION.md`. Those licenses are why this project as a whole is
noncommercial: the NC terms of the inbound occurrence data bind any use of
the combined work.
