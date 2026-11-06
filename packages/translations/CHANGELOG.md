# @lit-material/translations

## 1.3.0

### Minor Changes

- 029f811: New `@lit-material/world-map`: countries shaded by a value per country (choropleth) on a square-root scale, with a legend, keyboard reading highest first, optional selection (`change`), countries too small to draw listed under the map, and a screen-reader table. Shapes from Natural Earth 1:110m (public domain), about 12 kB gzipped.

### Patch Changes

- @lit-material/core@1.3.0

## 1.2.1

### Patch Changes

- @lit-material/core@1.2.1

## 1.2.0

### Minor Changes

- 1fb7794: `create-lit-material-app --template console`: a SaaS console starter with an organization switcher, adaptive navigation, sign-in, members, settings tabs and a getting-started checklist. New `lit-material-checklist` in `@lit-material/stepper`. A stretched `lit-material-button` is now clickable across its whole area, and `lit-material-tabs` finds its panels at the top level of a shadow root.

### Patch Changes

- @lit-material/core@1.2.0

## 1.1.0

### Minor Changes

- a956860: New `@lit-material/sign-in` (a sign-in screen: password, a code by mail, sign up, password reset, single sign-on buttons) and `@lit-material/pricing` (plan cards and a plan picker with monthly and yearly prices). `lit-material-one-time-code` in `@lit-material/text-field` for codes from mail or an authenticator app, `lit-material-new-secret` in `@lit-material/clipboard` for a token or key shown once, and their messages in every catalog.

### Patch Changes

- @lit-material/core@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [65ac716]
  - @lit-material/core@1.0.0

## 0.3.0

### Minor Changes

- 16e62c3: New package `@lit-material/rich-text`: `lit-material-rich-text-editor`, a Material toolbar (WAI-ARIA toolbar, roving focus, `aria-pressed` following the selection) over a `contenteditable` textbox held to a small schema (p, h2, h3, strong, em, u, s, code, pre, blockquote, ul, ol, li, a[href], br). Commands, Enter/Backspace across blocks, Tab/Shift+Tab list indenting, paste and undo/redo are operations on the editor's own document model rather than `document.execCommand`; native typing is read back and normalized. Pasted HTML and the `value` are sanitized by a built-in tokenizer (scripts, event handlers, styles, unknown elements and `javascript:`-style URLs removed; links limited to http(s), mailto and relative), and the DOM is built with `createElement` only, so no Trusted Types policy is needed. Form-associated (`name`, `required`, `maxlength`, `disabled`, `readonly`), label/supporting/error text like the text field, link panel, Ctrl/Cmd shortcuts, Markdown-style block shortcuts, `getText()` and `getMarkdown()`, server rendering with hydration. Translations: the editor's 34 messages in all catalogs.

## 0.2.0

### Minor Changes

- 91b6e6c: `lit-material-data-grid` (`@lit-material/data-table/data-grid.js`, also exported from the index): a data-driven grid built from `columns` and `rows` (properties or JSON attributes, so it server-renders), rendered with the data table's row and cell elements. It sorts (the table's sort headers), selects rows with checkboxes, groups by one or more columns into collapsible group rows with sum/avg/min/max/count or custom aggregates (an ARIA treegrid with `aria-level`/`aria-expanded`/`aria-setsize`/`aria-posinset`), edits cells in place with `lit-material-text-field`, `-number-field` or `-select` (Enter/F2/double-click to edit, Enter/Tab to commit, Escape to cancel; a cancelable `cell-edit` event for validation, then `edit-commit`), moves between cells with the arrow keys (roving tabindex, mirrored in right-to-left layouts), pages with the pagination footer, and exports RFC 4180 CSV with `toCSV()`/`downloadCSV()` (formula injection neutralised with a leading `'`). `lit-material-data-table-cell` keeps an explicit `role`, and gains `sort-tabindex` and `editing`. The CSV helpers are exported from `@lit-material/data-table/csv.js`.

  `lit-material-select`: keyboard navigation and Enter/Tab acceptance in the open listbox now work when the select is inside another element's shadow root (it read `document.activeElement`, which is the shadow host there).

  Translations: the data grid's messages (`dataTable.*`) in every catalog.

## 0.1.1

### Patch Changes

- Updated dependencies [be5093c]
  - @lit-material/core@0.4.0

## 0.1.0

### Minor Changes

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
