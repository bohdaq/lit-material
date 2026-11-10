# @lit-material/timestamp

## 1.7.0

### Patch Changes

- @lit-material/core@1.7.0
- @lit-material/tokens@1.7.0

## 1.6.0

### Patch Changes

- @lit-material/core@1.6.0
- @lit-material/tokens@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies [e055e69]
  - @lit-material/tokens@1.5.0
  - @lit-material/core@1.5.0

## 1.4.0

### Patch Changes

- @lit-material/core@1.4.0
- @lit-material/tokens@1.4.0

## 1.3.0

### Patch Changes

- @lit-material/core@1.3.0
- @lit-material/tokens@1.3.0

## 1.2.1

### Patch Changes

- @lit-material/core@1.2.1
- @lit-material/tokens@1.2.1

## 1.2.0

### Patch Changes

- @lit-material/core@1.2.0
- @lit-material/tokens@1.2.0

## 1.1.0

### Patch Changes

- @lit-material/core@1.1.0
- @lit-material/tokens@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [8646c7b]
- Updated dependencies [65ac716]
  - @lit-material/tokens@1.0.0
  - @lit-material/core@1.0.0

## 0.1.1

### Patch Changes

- Updated dependencies [be5093c]
  - @lit-material/core@0.4.0

## 0.1.0

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

- Updated dependencies [db33e54]
  - @lit-material/core@0.3.0

## 0.0.3

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.0.2

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2
