---
"@lit-material/data-table": minor
"@lit-material/select": patch
"@lit-material/translations": minor
---

`lit-material-data-grid` (`@lit-material/data-table/data-grid.js`, also exported from the index): a data-driven grid built from `columns` and `rows` (properties or JSON attributes, so it server-renders), rendered with the data table's row and cell elements. It sorts (the table's sort headers), selects rows with checkboxes, groups by one or more columns into collapsible group rows with sum/avg/min/max/count or custom aggregates (an ARIA treegrid with `aria-level`/`aria-expanded`/`aria-setsize`/`aria-posinset`), edits cells in place with `lit-material-text-field`, `-number-field` or `-select` (Enter/F2/double-click to edit, Enter/Tab to commit, Escape to cancel; a cancelable `cell-edit` event for validation, then `edit-commit`), moves between cells with the arrow keys (roving tabindex, mirrored in right-to-left layouts), pages with the pagination footer, and exports RFC 4180 CSV with `toCSV()`/`downloadCSV()` (formula injection neutralised with a leading `'`). `lit-material-data-table-cell` keeps an explicit `role`, and gains `sort-tabindex` and `editing`. The CSV helpers are exported from `@lit-material/data-table/csv.js`.

`lit-material-select`: keyboard navigation and Enter/Tab acceptance in the open listbox now work when the select is inside another element's shadow root (it read `document.activeElement`, which is the shadow host there).

Translations: the data grid's messages (`dataTable.*`) in every catalog.
