# Fonts needed for self-hosting (Phase 0)

Owner-approved set (decisions, item 1): **Fraunces** (display, one fixed
instance — not the variable font), **Public Sans** (UI), **IBM Plex Mono**
(labels). All three are OFL-licensed; self-host as static `woff2` files under
`fonts/`, with each family's `OFL.txt` alongside.

Phase 0 could not download these from the sandbox — outbound requests to
`fonts.google.com`, `fonts.gstatic.com`, `github.com`, `raw.githubusercontent.com`,
and `cdn.jsdelivr.net` all returned `403 blocked-by-allowlist`. The commented
`@font-face` scaffold in `styles.css` (top of file) is wired up for the layout
below and is inert until the files exist — adding them is a drop-in, zero-CSS-
change operation.

## Directory layout expected by the `@font-face` scaffold

```
fonts/
  fraunces/
    Fraunces-Display.woff2       (one static instance — see weight choice below)
    Fraunces-Display-Italic.woff2
    OFL.txt
  public-sans/
    PublicSans-Regular.woff2
    PublicSans-Medium.woff2
    PublicSans-SemiBold.woff2
    PublicSans-Bold.woff2
    OFL.txt
  ibm-plex-mono/
    IBMPlexMono-Regular.woff2
    IBMPlexMono-Medium.woff2
    OFL.txt
```

## Fraunces — fixed instance choice

Fraunces ships as a variable font (weight, optical size "opsz", `SOFT`,
`WONK` axes). "Fixed instance" means picking one static cut rather than
shipping the variable font. Recommended instance for display headings:

- Weight **600 (SemiBold)**, optical size **144 (the "Display"/72pt cut)**,
  `SOFT=0`, `WONK=0` — i.e. the standard high-contrast display Fraunces, not
  the soft/wonky variants.
- Italic counterpart at the same settings for emphasis in headings/pull
  quotes.

Source for static instances: the `Fraunces` family on Google Fonts (or the
upstream repo at `github.com/githubnext/monaspace`... no — correct upstream
is `github.com/undercasetype/Fraunces`), which publishes pre-built static
weights including the 144pt-optical-size "Display" cut. Convert to `woff2`
if only `.ttf`/`.otf` static files are available.

## Public Sans

Static weights 400/500/600/700, regular only (no italic needed for UI per
current mockups). Upstream: U.S. Web Design System / `github.com/uswds/public-sans`,
OFL-1.1 licensed.

## IBM Plex Mono

Static weights 400/500, regular only. Upstream: IBM Plex,
`github.com/IBM/plex`, OFL-1.1 licensed.

## Next steps

Next interactive session: fetch the six `woff2` files + three `OFL.txt`
files above (browser or a network path with access to Google Fonts/GitHub),
drop them into the `fonts/` layout, and the existing `@font-face` block in
`styles.css` should work without further edits. No CSS rule references these
families yet, so nothing renders differently until Phase 1+ opts elements
into `--font-display` / `--font-ui` / `--font-mono`.
