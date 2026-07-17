---
"@lit-material/icon-button": patch
---

Fix the off-state icon silently not rendering when using the documented `slot="icon"` contract on a toggle button. `render()` used an unnamed default slot for the off state instead of a named `icon` slot, so any consumer following the README/JSDoc's own documented usage (`<span slot="icon">…</span>`) had that content never distributed at all — only the `selected-icon` half of a toggle ever showed up. Both forms now work: `slot="icon"` (needed to distinguish it from `selected-icon` on a toggle) and no slot attribute at all (the simpler non-toggle case) can coexist.
