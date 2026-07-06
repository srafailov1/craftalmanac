# Product

## Register

product

## Users

1. **Makers & foragers** — general public practicing crafts with gathered materials (ink-making, dyeing, carving, cooking, herbal study). They arrive with a place or a season in mind and want to know *what grows here, when, and whether I'm allowed to take it*. Often outdoors, on a phone, sometimes offline.
2. **Students / teachers** — the owner uses the site in courses; it must be credible and legible in a classroom, projected or on laptops.
3. **Researchers and land stewards** — secondary; they care about sourcing, licenses, and the rules corpus.

The core job: turn "occurrence data" into an ethical, legal, seasonal harvesting decision — without ever confusing occurrence with permission.

## Product Purpose

A map-based guide to craft and forage materials across the contiguous US — food, ink/dye, herbalism, and craft minerals — organized by season, habitat, and (uniquely) the actual harvesting rule for the land under each point. The parcel-level rules layer, encoded from primary law, is the differentiator no competitor (Falling Fruit, iNaturalist, rockhounding maps) has. Success = users trust the map enough to plan a real, responsible harvest, and teachers trust it enough to put in front of students.

## Brand Personality

**Contemporary craft naturalism.** Between knowledgeable friend and lyrical almanac: warm, direct, practical guidance with an occasional seasonal, literary note in the margins. Safety information is always said plainly; lyric never obscures rule or risk. The identity scales from a map popup to a recipe-like project page to a printed-feeling almanac spread. Typography: expressive display (Fraunces) for identity moments + quiet text/UI faces (Public Sans, IBM Plex Mono). Data-as-art: cartography, seasonal histograms, and specimen-label micro-typography are first-class visual material. No photography dependency.

## Anti-references

- Twee / cottagecore, rustic kitsch, antique pastiche — folk registers may inspire, but the result must be contemporary.
- Institutional / municipal GIS-portal blandness.
- Sterile contemporary-minimal (minimal is allowed; sterility is not).
- Generic SaaS dashboard chrome — this is a field tool and an almanac, not analytics software.

## Design Principles

1. **Occurrence is never permission.** The rule layer and its caveats keep prominent placement in every surface — popups, legends, docs. Never let styling soften a safety or legality statement.
2. **Safety said plainly.** Mushroom whitelists, lookalike warnings, and the herbalism disclaimer are non-negotiable UI; lyric voice never obscures them.
3. **The data is the decoration.** Seasonal histograms, phenology curves, specimen labels, and the map itself carry the visual identity; avoid ornament that isn't information.
4. **Seasonal living palette.** A stable ink+paper core with register/season-driven accents (day/dawn/dusk/night `--reg-*` tokens); the site may read subtly different in October than April, but permission-status colors stay unmistakable in every register.
5. **Field-tool pragmatism.** Static site, no build step, CSS variables + SVG + fonts only; must work offline (PWA), on phones, in sun, and on classroom projectors.

## Accessibility & Inclusion

- Contrast-safe palettes in every seasonal register — `scripts/check.sh` runs a contrast gate that must pass before commit.
- Permission-status colors (allowed / permit / prohibited / private / unknown) carry safety meaning: they must remain colorblind-distinguishable and never be the only channel (pair with text/pattern).
- Keyboard and screen-reader paths for the primary flows (search, mode switch, popups, offline panel); live regions for async status.
- Works offline and on slow rural connections; the field context is part of accessibility.
