# Vendored third-party code

- `qrcodegen.mjs` — Project Nayuki's QR Code generator library (MIT, header intact in-file), compiled from the canonical TypeScript source (`typescript-javascript/qrcodegen.ts` at https://github.com/nayuki/QR-Code-generator) with TypeScript 5.5.4 and converted to an ES module by appending a single `export` statement. Used only by `scripts/build_field_cards.mjs` to render QR codes as inline SVG; never shipped to the browser.
