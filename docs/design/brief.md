# Craft Almanac — Brand Identity Brief

Discovery completed 2026-06-12 (owner Q&A). This brief governs all design
rounds. Changes to it are owner decisions; log them in `decisions.md`.

## What this identity is for

Not a map skin. The map is the front door to a larger platform: pages for
each material on the map, project guides that bring materials together with
instructions, and other content that empowers people to make things with
their local environments. The identity must scale from a map popup to a
recipe-like project page to a printed-feeling almanac spread.

## Audience (priority order)

1. **Makers & foragers** — general public practicing crafts with gathered
   materials. The identity should feel like an invitation and earn trust.
2. **Students / teaching** — used in courses; credible and legible in a
   classroom.
3. Researchers and land stewards matter but follow.

## Positioning territory

**Contemporary craft naturalism.** The naturalist's field journal and folk
registers both attract, but the result must be contemporary and compelling —
never an antique pastiche. Push the design; this is an open reinvention with
no obligation to the current paper-and-green look.

**Avoid:** twee/cottagecore, institutional/municipal, rustic kitsch.
(Contemporary minimal is not banned — sterility is.)

## Decided foundations

- **Typography:** expressive display + quiet text. A distinctive display
  face for identity moments (masthead, mode names, species headings);
  restrained, highly readable text/UI faces everywhere else.
- **Imagery:** two engines, both owned —
  1. an original SVG illustration system (botanical/specimen line work or
     contemporary woodcut energy) that can grow with item pages;
  2. the data as art — cartography, seasonal histograms, specimen-label
     micro-typography treated as first-class visual material.
  No photography dependency.
- **Color:** a seasonal living palette — a stable ink+paper core with accent
  palettes that rotate by season, so the site reads subtly different in
  October than in April. Deeply almanac; must stay implementable in CSS
  variables (the site already runs entirely on them).
- **Voice:** between knowledgeable friend and lyrical almanac — warm,
  direct, practical guidance with an occasional seasonal, literary note in
  the margins. Safety information is always said plainly; lyric never
  obscures rule or risk.

## Name

"Craft Almanac" stays for now (good fit, owned URL), but directions may
propose refinements or alternatives as the identity develops.

## Constraints

- Static site, vanilla JS/CSS, no build step — the final system must compile
  to CSS variables, SVG assets, and font files. Mapbox basemap restyling is
  in scope (Studio style or style JSON).
- Accessibility: contrast-safe palettes in every season; the permission
  status colors (allowed/prohibited/etc.) must remain unmistakable and
  colorblind-distinguishable — they carry safety meaning.
- Ethics language (occurrence is not permission; medicine disclaimer) keeps
  prominent placement in any redesign.

## Process (owner-selected)

Studio decks first: push the design abstractly in visual decks, converge on
a direction, then test with live prototypes on a design branch. Round 1 =
three distinct directions presented as a deck. Design work stays off `main`
until the relaunch.
