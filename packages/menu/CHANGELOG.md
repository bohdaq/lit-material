# @lit-material/menu

## 0.3.0

### Minor Changes

- d400036: `showForEvent(event)` opens a menu for a `contextmenu` event: at the pointer for a right click, under the element for the context menu key. Where the event fires with the right button still down (Linux, macOS), it opens after the release, which light dismiss would otherwise treat as a click outside and close the menu at once.

## 0.2.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

## 0.1.0

### Minor Changes

- 4d0b41a: `lit-material-app-launcher`: a grid button that opens a menu of apps, with an optional search filter. `lit-material-menu` now finds items passed through nested slots and skips hidden ones.

### Patch Changes

- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2
