# @lit-material/navigation

## 0.2.1

### Patch Changes

- Updated dependencies [d400036]
  - @lit-material/core@0.2.0

## 0.2.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

## 0.1.3

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/tokens@0.1.0

## 0.1.2

### Patch Changes

- 03c3708: Navigation bar items shrink below the 64px indicator pill, so a bar with more than five destinations (the adaptive navigation's phone layout) fits a narrow screen instead of overflowing it.

## 0.1.1

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/tokens@0.0.2

## 0.1.0

### Minor Changes

- 7b4c5f2: `lit-material-adaptive-navigation`: one list of destinations shown as a navigation bar under 600px, a rail from 600px and a drawer (or rail, `expanded="rail"`) from 840px. All three are rendered and CSS picks one, so it works server-rendered; the selection is shared and `change` fires from whichever was used.
