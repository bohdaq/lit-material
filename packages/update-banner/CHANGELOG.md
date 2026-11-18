# @lit-material/update-banner

## 1.9.0

### Minor Changes

- c506ec2: Tree drag and drop: with `reorderable`, nodes drag before, after or into `droppable` nodes (drop line, ghost, edge auto-scroll, hold to open, Escape cancels) and move with Alt+Arrow keys; the tree fires a cancelable `move` (`{item, target, place}`), announces each move, and keeps focus on the moved node (`reorder` still follows same-parent moves). Tabs: `pinned` tabs stay first, compact and unclosable; a drag scrolls a scrollable row at its ends, and a tab dragged out of the strip fires `tabdragout` and then `tabdrop` on the element it's released over. New `@lit-material/error-card` (headline, next step, actions, raw details with copy), `@lit-material/binary-viewer` (image, PDF in the browser's viewer, hex dump with Download) and `@lit-material/update-banner` (available / downloading / ready / error, `update` and `later`), with messages in every catalog.

### Patch Changes

- @lit-material/button@1.9.0
- @lit-material/core@1.9.0
- @lit-material/tokens@1.9.0
