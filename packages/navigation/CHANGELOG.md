# @lit-material/navigation

## 0.1.0

### Minor Changes

- 7b4c5f2: `lit-material-adaptive-navigation`: one list of destinations shown as a navigation bar under 600px, a rail from 600px and a drawer (or rail, `expanded="rail"`) from 840px. All three are rendered and CSS picks one, so it works server-rendered; the selection is shared and `change` fires from whichever was used.
