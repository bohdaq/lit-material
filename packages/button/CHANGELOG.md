# @lit-material/button

## 0.4.0

### Minor Changes

- 8507493: Framework bindings, generated from the custom elements manifest. `@lit-material/<pkg>/react` has a React wrapper per element, built on `@lit/react` (optional peer dependencies `@lit/react` and `react`): properties are set as properties and events map to `onChange`-style props. `@lit-material/<pkg>/jsx` types the elements in React 19 JSX and `@lit-material/<pkg>/vue` in Vue templates (load either with `import type {} from ...`). `dist/web-types.json` (JetBrains, found through the `web-types` field) and `dist/vscode.html-custom-data.json` give editor completion and docs in any template, Angular's included.

### Patch Changes

- Updated dependencies [db33e54]
  - @lit-material/core@0.3.0

## 0.3.1

### Patch Changes

- Updated dependencies [d400036]
  - @lit-material/core@0.2.0

## 0.3.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

## 0.2.1

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/tokens@0.1.0

## 0.2.0

### Minor Changes

- 7fd75e0: `lit-material-action-list`: a row of actions with consistent spacing, alignment (`start`, `end`, `between`), nested groups and an optional group label.

## 0.1.3

### Patch Changes

- 70757bb: `lit-material-input-group` joins outlined fields, selects and buttons into one control. Text field, select and button gain `--…-shape`, `-shape-start` and `-shape-end` corner properties; select gains `--lit-material-select-min-width`.

## 0.1.2

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/tokens@0.0.2

## 0.1.1

### Patch Changes

- 0102a65: Component custom properties for values themes reached through `::part`: button shape and pressed scale, code-block shape, container colour, fonts and line height, alert shape, stat value font.

## 0.1.0

### Minor Changes

- 64593c1: New custom properties `--lit-material-button-height` (default `40px`), `--lit-material-button-padding-inline` (`24px`) and `--lit-material-button-text-padding-inline` (`12px`, for `variant="text"`) for sizing the button without `::part`.

## 0.1.0

### Minor Changes

- 64593c1: New custom properties `--lit-material-button-height` (default `40px`), `--lit-material-button-padding-inline` (`24px`) and `--lit-material-button-text-padding-inline` (`12px`, for `variant="text"`) for sizing the button without `::part`.
