# @lit-material/navigation

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
