# @lit-material/dialog

## 0.2.1

### Patch Changes

- @lit-material/button@0.3.1

## 0.2.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

### Patch Changes

- Updated dependencies [13debbc]
  - @lit-material/button@0.3.0

## 0.1.1

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/button@0.2.1
  - @lit-material/tokens@0.1.0

## 0.1.0

### Minor Changes

- 7fd75e0: `lit-material-about-dialog`: product name and logo, version details and legal lines with a Close button. The dialog package now depends on `@lit-material/button`.

### Patch Changes

- Updated dependencies [7fd75e0]
  - @lit-material/button@0.2.0

## 0.0.4

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2

## 0.0.3

### Patch Changes

- a95654f: Outlined text fields take `--lit-material-text-field-notch-color` for the patch behind their floating label; dialogs set it to their surface, so the label no longer shows a white box inside a dialog.
