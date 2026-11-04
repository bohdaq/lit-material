---
"@lit-material/core": minor
"@lit-material/chart": patch
"@lit-material/color-picker": patch
"@lit-material/data-table": patch
"@lit-material/jump-links": patch
"@lit-material/progress": patch
"@lit-material/rating": patch
"@lit-material/skeleton": patch
"@lit-material/slider": patch
"@lit-material/sortable": patch
"@lit-material/split-panel": patch
"@lit-material/text-field": patch
"@lit-material/time-picker": patch
"@lit-material/tree": patch
"@lit-material/site-kit": patch
---

Strict Content-Security-Policy and Trusted Types. Components now work under `script-src 'self'; style-src 'self'; require-trusted-types-for 'script'; trusted-types lit-html` with no `'unsafe-inline'`: inline styles that change at runtime (bar widths, tooltip positions, slider thumbs, tree indents, …) are set through the CSSOM with the new `cssProps` directive in `@lit-material/core` instead of `style` attributes, which such a policy blocks. Site-kit's search box assigns its results through a Trusted Types policy named `lit-material-site-kit`. Every package now ships a CycloneDX SBOM of its runtime dependencies at `dist/sbom.cdx.json`.
