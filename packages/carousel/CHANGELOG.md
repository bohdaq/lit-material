# @lit-material/carousel

## 1.9.0

### Patch Changes

- @lit-material/core@1.9.0
- @lit-material/tokens@1.9.0

## 1.8.0

### Minor Changes

- d1334a2: Keyboard, accessibility, RTL and layout fixes from the November UX review.

  - **Arrow keys inside shadow roots:** menu, tabs, segmented button and sortable find the focused item through shadow roots (new `focusedItem`, `containsFocus` and `deepActiveElement` in `@lit-material/core/active-element.js`; `shadowFixture` in `@lit-material/testing`).
  - **Menu:** `role="menu"` with `menuitem` items (`menu-item` on `lit-material-list-item`), `aria-haspopup`/`aria-expanded` on the anchor, typeahead, and Tab closes it.
  - **Snackbar:** shows at the bottom (`--lit-material-snackbar-offset`), one at a time; a snackbar with no timeout always has a close button.
  - **Slider:** the filled track is a 4px line; the inactive track has 3:1 contrast (`--lit-material-slider-inactive-track-color`).
  - **Server rendering:** stepper numbers and the select's chosen text are right after hydration (`afterHydration` in `@lit-material/core/hydration.js`).
  - **RTL:** select, popover, tooltip, overflow menu, color picker and search view open at their anchor; the tabs indicator follows direction, font and size changes.
  - **Focus ring:** one ring everywhere, set by `--lit-material-focus-ring-width` and `--lit-material-focus-ring-color`.
  - **Time picker:** hour and minute are spinbuttons (arrows, Page keys, Home/End, typed digits, A/P); the dial is out of the tab order.
  - **Tooltip, popover, drawer:** the tooltip stays open while hovered and closes on Escape; the popover is named by its anchor; the drawer takes focus, closes on Escape, has `label` and fires `close`.
  - **Data table and date pickers:** `aria-sort` on sorted headers, a full-size sort button, a keyboard column resizer; Home/End go to the week's ends, PageUp/PageDown change month, with Shift the year.
  - **Modals** (dialog, sheet, navigation drawer, command palette, pickers) lock page scrolling (`@lit-material/core/scroll-lock.js`).
  - **Forms:** select typeahead and `focus()`; number field is a spinbutton (`inputAria` on text field); new `lit-material-radio-group`; file upload announces added and removed files; tree items carry level, set size and position, and the tree has typeahead; stepper has `label`.
  - **Autocomplete no longer opens on focus.** Set `open-on-focus` for the old behaviour.
  - **Long text:** button, chip, select, tabs, segmented button, list item, text field and alert stay inside a narrow container.
  - **Touch:** 44px targets on coarse pointers for checkbox, radio, switch, button, icon button, date cells, segmented button and tab close.
  - **Disabled text** is easier to read (`--lit-material-disabled-text-mix`).
  - **site-kit search** is a combobox: arrows move through results, Enter opens the active one, and `aliases` adds other names for a page.
  - **Console template:** the delete button in the danger zone is red; "an owner".

### Patch Changes

- Updated dependencies [d1334a2]
  - @lit-material/core@1.8.0
  - @lit-material/tokens@1.8.0

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

- eb88ae2: Hydrate without a mismatch: a carousel item's label overlay and a tree item's chevron no longer depend on reading light DOM children during render (the server can't see them, so the first browser render differed and Lit threw).

## 0.1.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

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
