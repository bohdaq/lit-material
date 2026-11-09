# @lit-material/text-field

## 1.4.0

### Patch Changes

- @lit-material/core@1.4.0
- @lit-material/icon-button@1.4.0
- @lit-material/tokens@1.4.0

## 1.3.0

### Patch Changes

- @lit-material/core@1.3.0
- @lit-material/icon-button@1.3.0
- @lit-material/tokens@1.3.0

## 1.2.1

### Patch Changes

- @lit-material/core@1.2.1
- @lit-material/icon-button@1.2.1
- @lit-material/tokens@1.2.1

## 1.2.0

### Patch Changes

- @lit-material/core@1.2.0
- @lit-material/icon-button@1.2.0
- @lit-material/tokens@1.2.0

## 1.1.0

### Minor Changes

- a956860: New `@lit-material/sign-in` (a sign-in screen: password, a code by mail, sign up, password reset, single sign-on buttons) and `@lit-material/pricing` (plan cards and a plan picker with monthly and yearly prices). `lit-material-one-time-code` in `@lit-material/text-field` for codes from mail or an authenticator app, `lit-material-new-secret` in `@lit-material/clipboard` for a token or key shown once, and their messages in every catalog.

### Patch Changes

- @lit-material/core@1.1.0
- @lit-material/icon-button@1.1.0
- @lit-material/tokens@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [8646c7b]
- Updated dependencies [65ac716]
  - @lit-material/tokens@1.0.0
  - @lit-material/core@1.0.0
  - @lit-material/icon-button@1.0.0

## 0.5.1

### Patch Changes

- be5093c: Strict Content-Security-Policy and Trusted Types. Components now work under `script-src 'self'; style-src 'self'; require-trusted-types-for 'script'; trusted-types lit-html` with no `'unsafe-inline'`: inline styles that change at runtime (bar widths, tooltip positions, slider thumbs, tree indents, …) are set through the CSSOM with the new `cssProps` directive in `@lit-material/core` instead of `style` attributes, which such a policy blocks. Site-kit's search box assigns its results through a Trusted Types policy named `lit-material-site-kit`. Every package now ships a CycloneDX SBOM of its runtime dependencies at `dist/sbom.cdx.json`.
- Updated dependencies [be5093c]
  - @lit-material/core@0.4.0
  - @lit-material/icon-button@0.1.1

## 0.5.0

### Minor Changes

- 8507493: Framework bindings, generated from the custom elements manifest. `@lit-material/<pkg>/react` has a React wrapper per element, built on `@lit/react` (optional peer dependencies `@lit/react` and `react`): properties are set as properties and events map to `onChange`-style props. `@lit-material/<pkg>/jsx` types the elements in React 19 JSX and `@lit-material/<pkg>/vue` in Vue templates (load either with `import type {} from ...`). `dist/web-types.json` (JetBrains, found through the `web-types` field) and `dist/vscode.html-custom-data.json` give editor completion and docs in any template, Angular's included.
- db33e54: Languages and right to left. Components take their language from the nearest `lang` attribute (through shadow roots, else `<html lang>`) and re-render when `<html lang>`/`<html dir>` changes.

  - `@lit-material/core/localize.js`: `LocalizeController` (`term(key, english, args)` with `{name}` placeholders and plural forms through `Intl.PluralRules`, `number`, `date`, `lang`), `registerTranslation`, `setFallbackLocale`, `isRtl`.
  - The 201 pieces of English the components render or announce themselves (button names, aria-labels, live-region announcements, validation messages, counts) go through it. New `@lit-material/translations` has catalogs for Arabic, German, Spanish, French, Japanese, Polish and Ukrainian; English stays built in.
  - Label properties that defaulted to English (`label = "Copy"` and the like) are now unset by default and fall back to the translated text; an explicit value, including `""`, still wins.
  - Dates and numbers inside components (date and time pickers, timestamp, pagination, usage meter, charts, file sizes) are formatted in the element's language. The date pickers' first day of the week now follows the language where the browser exposes week info (Monday for `lang="de"`); set `first-day-of-week` to keep a fixed one. Chart `format`/`formatX`/`formatY` default to `undefined` (a language-aware formatter) instead of `formatNumber`.
  - Right to left everywhere: logical CSS, horizontal arrow keys flip in tabs, radio groups, segmented buttons, steppers, date grids, trees, carousels and the color picker; menus, popovers, selects, the overflow menu, autocomplete and the color picker open from the start edge; directional icons mirror; the slider thumb, tabs indicator, skeleton wave, log marks and bar chart follow reading direction. Code, clock dials and a line chart's time axis stay left to right.
  - Fixes found on the way: `prefers-reduced-motion` now stops the skeleton animation.

### Patch Changes

- Updated dependencies [8507493]
- Updated dependencies [db33e54]
  - @lit-material/icon-button@0.1.0
  - @lit-material/core@0.3.0

## 0.4.1

### Patch Changes

- Updated dependencies [d400036]
  - @lit-material/core@0.2.0
  - @lit-material/icon-button@0.0.6

## 0.4.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

## 0.3.1

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/icon-button@0.0.5
  - @lit-material/tokens@0.1.0

## 0.3.0

### Minor Changes

- 70757bb: `lit-material-input-group` joins outlined fields, selects and buttons into one control. Text field, select and button gain `--…-shape`, `-shape-start` and `-shape-end` corner properties; select gains `--lit-material-select-min-width`.

## 0.2.1

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/icon-button@0.0.4
  - @lit-material/tokens@0.0.2

## 0.2.0

### Minor Changes

- d7e23d1: `lit-material-number-field`: a number with −/+ buttons, arrow-key stepping, min/max/step without float drift, a unit suffix and range errors in words.

### Patch Changes

- dc110c6: `--lit-material-text-field-min-width` (default `210px`) so a grid or flex cell can make a field narrower.

## 0.1.2

### Patch Changes

- a95654f: Outlined text fields take `--lit-material-text-field-notch-color` for the patch behind their floating label; dialogs set it to their surface, so the label no longer shows a white box inside a dialog.

## 0.1.1

### Patch Changes

- f9ec833: Pressing Enter in a text field now submits its form, as with a native input. The input lives in the shadow root, so the browser never did this by itself.

## 0.1.0

### Minor Changes

- Add `lit-material-textarea`, a multi-line sibling to `lit-material-text-field` sharing its floating-label/filled/outlined/error-state/character-counter design and form participation. No leading/trailing icon slots or prefix/suffix — a multi-line body-text field has no natural place for those the way a single-line one does. Adds `rows` and `resize` properties, and a resting label that sits near the top of the box instead of vertically centering.
