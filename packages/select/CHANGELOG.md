# @lit-material/select

## 1.7.0

### Patch Changes

- @lit-material/core@1.7.0
- @lit-material/tokens@1.7.0

## 1.6.0

### Patch Changes

- @lit-material/core@1.6.0
- @lit-material/tokens@1.6.0

## 1.5.0

### Minor Changes

- e055e69: Compact density: `density="compact"` on any ancestor shrinks buttons, icon buttons, tabs, list and tree rows, text fields and selects (tokens `--md-sys-density-*`, read by those components). Graphite: an opt-in dark palette, `@lit-material/tokens/css/presets/graphite.css` (on :root and under `theme="graphite"`). Tabs: `reorderable` (drag, or Alt+Shift+Arrow / Ctrl+Shift+PageUp/PageDown; cancelable `reorder` `{from, to}`), edge fades in a scrollable row. Tree items: `trailing` and `actions` slots (actions show on hover or focus and don't select); tree `reorderable` (drag among siblings, or Alt+Shift+ArrowUp/Down; cancelable `reorder` `{item, parent, from, to}`). New `@lit-material/kbd`: keyboard shortcuts as key caps, ⌘ on Apple platforms, Ctrl elsewhere, read out by name.

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

## 0.2.2

### Patch Changes

- 91b6e6c: `lit-material-data-grid` (`@lit-material/data-table/data-grid.js`, also exported from the index): a data-driven grid built from `columns` and `rows` (properties or JSON attributes, so it server-renders), rendered with the data table's row and cell elements. It sorts (the table's sort headers), selects rows with checkboxes, groups by one or more columns into collapsible group rows with sum/avg/min/max/count or custom aggregates (an ARIA treegrid with `aria-level`/`aria-expanded`/`aria-setsize`/`aria-posinset`), edits cells in place with `lit-material-text-field`, `-number-field` or `-select` (Enter/F2/double-click to edit, Enter/Tab to commit, Escape to cancel; a cancelable `cell-edit` event for validation, then `edit-commit`), moves between cells with the arrow keys (roving tabindex, mirrored in right-to-left layouts), pages with the pagination footer, and exports RFC 4180 CSV with `toCSV()`/`downloadCSV()` (formula injection neutralised with a leading `'`). `lit-material-data-table-cell` keeps an explicit `role`, and gains `sort-tabindex` and `editing`. The CSV helpers are exported from `@lit-material/data-table/csv.js`.

  `lit-material-select`: keyboard navigation and Enter/Tab acceptance in the open listbox now work when the select is inside another element's shadow root (it read `document.activeElement`, which is the shadow host there).

  Translations: the data grid's messages (`dataTable.*`) in every catalog.

## 0.2.1

### Patch Changes

- Updated dependencies [be5093c]
  - @lit-material/core@0.4.0

## 0.2.0

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

## 0.1.1

### Patch Changes

- Updated dependencies [d400036]
  - @lit-material/core@0.2.0

## 0.1.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

## 0.0.5

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/tokens@0.1.0

## 0.0.4

### Patch Changes

- 70757bb: `lit-material-input-group` joins outlined fields, selects and buttons into one control. Text field, select and button gain `--…-shape`, `-shape-start` and `-shape-end` corner properties; select gains `--lit-material-select-min-width`.

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/tokens@0.0.2
