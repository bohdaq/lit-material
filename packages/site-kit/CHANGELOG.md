# @lit-material/site-kit

## 0.1.1

### Patch Changes

- be5093c: Strict Content-Security-Policy and Trusted Types. Components now work under `script-src 'self'; style-src 'self'; require-trusted-types-for 'script'; trusted-types lit-html` with no `'unsafe-inline'`: inline styles that change at runtime (bar widths, tooltip positions, slider thumbs, tree indents, …) are set through the CSSOM with the new `cssProps` directive in `@lit-material/core` instead of `style` attributes, which such a policy blocks. Site-kit's search box assigns its results through a Trusted Types policy named `lit-material-site-kit`. Every package now ships a CycloneDX SBOM of its runtime dependencies at `dist/sbom.cdx.json`.

## 0.1.0

### Minor Changes

- e599adb: New package for prerendered sites: FAQ on native `<details>`, numbered steps, a terminal mockup, keys and shortcut lists and a search dialog, as plain HTML templates that work before JavaScript, with one layered stylesheet. Scripts add the theme toggle (with an inline boot script), mobile menu, Pagefind search (`/` and Ctrl/Cmd+K), terminal replay and scroll reveals.
