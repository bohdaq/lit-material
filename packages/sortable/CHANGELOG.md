# @lit-material/sortable

## 0.3.0

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

## 0.2.3

### Patch Changes

- 135ae0a: The live region that announces pick-up, moves and drops is one element shared by every sortable, appended to `<body>`, instead of a child of each list: inside a `role="list"` sortable it was a non-listitem child (axe `aria-required-children`).

## 0.2.2

### Patch Changes

- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.2.1

### Patch Changes

- b845bdf: Grid layout: dropping past the last item of a row draws the line after that item, on the pointer's row, instead of before the next row's first item.

## 0.2.0

### Minor Changes

- d65e91e: `layout="grid"` sorts items laid out in rows (card grids, wrapping chips, a horizontal row): reading-order drop slots, RTL included, an upright drop line between items, and ↑/↓ moving a row from the keyboard.

## 0.1.1

### Patch Changes

- 571cf0b: A key pressed right after a keyboard move (Space to drop, another arrow) is no longer lost while the list re-renders: focus returns to the handle as soon as the re-render finishes.

## 0.1.0

### Minor Changes

- d3bba34: New package: `lit-material-sortable`: reorder items by pointer, touch or keyboard, within or between lists, with screen reader announcements.
