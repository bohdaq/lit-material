---
"@lit-material/sortable": patch
---

The live region that announces pick-up, moves and drops is one element shared by every sortable, appended to `<body>`, instead of a child of each list: inside a `role="list"` sortable it was a non-listitem child (axe `aria-required-children`).
