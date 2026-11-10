# @lit-material/sheet

## 1.7.0

### Patch Changes

- @lit-material/tokens@1.7.0

## 1.6.0

### Minor Changes

- 18a475c: App-shell pieces for dense tools. New `@lit-material/status-bar`: a thin bar along the bottom of an app window with text, button and link items at the start and the end, wrapping on phones. `@lit-material/diff`: `lit-material-conflict-resolver`, yours and theirs side by side with each side's own lines marked, a radio group to keep yours, theirs or both, and an editable result that `resolve` returns (`keepBoth` and `resolveText` exported). `@lit-material/navigation`: `compact` on the rail (icon-only, 56px, labels as tooltips) and on `lit-material-adaptive-navigation`, whose destinations take a `badge` (dot or count) and `badgeLabel`. `@lit-material/chart`: `lit-material-status-strip`, one bar per run (passed, failed, warned, none) named with the counts and the latest result. `@lit-material/data-table`: `density="compact"` and the `--lit-material-data-table-cell-padding-block` / `-inline` properties. `@lit-material/sheet`: `--lit-material-side-sheet-width`. Translations for the new labels in every catalog.

### Patch Changes

- @lit-material/tokens@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies [e055e69]
  - @lit-material/tokens@1.5.0

## 1.4.0

### Patch Changes

- @lit-material/tokens@1.4.0

## 1.3.0

### Patch Changes

- @lit-material/tokens@1.3.0

## 1.2.1

### Patch Changes

- @lit-material/tokens@1.2.1

## 1.2.0

### Patch Changes

- @lit-material/tokens@1.2.0

## 1.1.0

### Patch Changes

- @lit-material/tokens@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [8646c7b]
- Updated dependencies [65ac716]
  - @lit-material/tokens@1.0.0

## 0.2.0

### Minor Changes

- 8507493: Framework bindings, generated from the custom elements manifest. `@lit-material/<pkg>/react` has a React wrapper per element, built on `@lit/react` (optional peer dependencies `@lit/react` and `react`): properties are set as properties and events map to `onChange`-style props. `@lit-material/<pkg>/jsx` types the elements in React 19 JSX and `@lit-material/<pkg>/vue` in Vue templates (load either with `import type {} from ...`). `dist/web-types.json` (JetBrains, found through the `web-types` field) and `dist/vscode.html-custom-data.json` give editor completion and docs in any template, Angular's included.

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
