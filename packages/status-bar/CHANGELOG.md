# @lit-material/status-bar

## 1.6.0

### Minor Changes

- 18a475c: App-shell pieces for dense tools. New `@lit-material/status-bar`: a thin bar along the bottom of an app window with text, button and link items at the start and the end, wrapping on phones. `@lit-material/diff`: `lit-material-conflict-resolver`, yours and theirs side by side with each side's own lines marked, a radio group to keep yours, theirs or both, and an editable result that `resolve` returns (`keepBoth` and `resolveText` exported). `@lit-material/navigation`: `compact` on the rail (icon-only, 56px, labels as tooltips) and on `lit-material-adaptive-navigation`, whose destinations take a `badge` (dot or count) and `badgeLabel`. `@lit-material/chart`: `lit-material-status-strip`, one bar per run (passed, failed, warned, none) named with the counts and the latest result. `@lit-material/data-table`: `density="compact"` and the `--lit-material-data-table-cell-padding-block` / `-inline` properties. `@lit-material/sheet`: `--lit-material-side-sheet-width`. Translations for the new labels in every catalog.

### Patch Changes

- @lit-material/core@1.6.0
- @lit-material/tokens@1.6.0
