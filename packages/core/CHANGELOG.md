# @lit-material/core

## 0.4.0

### Minor Changes

- be5093c: Strict Content-Security-Policy and Trusted Types. Components now work under `script-src 'self'; style-src 'self'; require-trusted-types-for 'script'; trusted-types lit-html` with no `'unsafe-inline'`: inline styles that change at runtime (bar widths, tooltip positions, slider thumbs, tree indents, …) are set through the CSSOM with the new `cssProps` directive in `@lit-material/core` instead of `style` attributes, which such a policy blocks. Site-kit's search box assigns its results through a Trusted Types policy named `lit-material-site-kit`. Every package now ships a CycloneDX SBOM of its runtime dependencies at `dist/sbom.cdx.json`.

## 0.3.0

### Minor Changes

- db33e54: Languages and right to left. Components take their language from the nearest `lang` attribute (through shadow roots, else `<html lang>`) and re-render when `<html lang>`/`<html dir>` changes.

  - `@lit-material/core/localize.js`: `LocalizeController` (`term(key, english, args)` with `{name}` placeholders and plural forms through `Intl.PluralRules`, `number`, `date`, `lang`), `registerTranslation`, `setFallbackLocale`, `isRtl`.
  - The 201 pieces of English the components render or announce themselves (button names, aria-labels, live-region announcements, validation messages, counts) go through it. New `@lit-material/translations` has catalogs for Arabic, German, Spanish, French, Japanese, Polish and Ukrainian; English stays built in.
  - Label properties that defaulted to English (`label = "Copy"` and the like) are now unset by default and fall back to the translated text; an explicit value, including `""`, still wins.
  - Dates and numbers inside components (date and time pickers, timestamp, pagination, usage meter, charts, file sizes) are formatted in the element's language. The date pickers' first day of the week now follows the language where the browser exposes week info (Monday for `lang="de"`); set `first-day-of-week` to keep a fixed one. Chart `format`/`formatX`/`formatY` default to `undefined` (a language-aware formatter) instead of `formatNumber`.
  - Right to left everywhere: logical CSS, horizontal arrow keys flip in tabs, radio groups, segmented buttons, steppers, date grids, trees, carousels and the color picker; menus, popovers, selects, the overflow menu, autocomplete and the color picker open from the start edge; directional icons mirror; the slider thumb, tabs indicator, skeleton wave, log marks and bar chart follow reading direction. Code, clock dials and a line chart's time axis stay left to right.
  - Fixes found on the way: `prefers-reduced-motion` now stops the skeleton animation.

## 0.2.0

### Minor Changes

- d400036: Switch, checkbox and radio take a visible `label` (clicking it toggles the control) and `supporting-text` (its description), so they no longer need a wrapping `<label>` and a repeated `aria-label`. Both render on the server. Core exports the shared `controlLabel` template and `controlLabelStyles`.

## 0.1.0

### Minor Changes

- 50e5698: `aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
