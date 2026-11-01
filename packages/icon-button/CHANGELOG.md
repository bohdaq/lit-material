# @lit-material/icon-button

## 0.0.5

### Patch Changes

- 50e5698: `aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).
- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/tokens@0.1.0

## 0.0.4

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/tokens@0.0.2

## 0.0.3

### Patch Changes

- 5c61d5f: Fix the off-state icon silently not rendering when using the documented `slot="icon"` contract on a toggle button. `render()` used an unnamed default slot for the off state instead of a named `icon` slot, so any consumer following the README/JSDoc's own documented usage (`<span slot="icon">…</span>`) had that content never distributed at all — only the `selected-icon` half of a toggle ever showed up. Both forms now work: `slot="icon"` (needed to distinguish it from `selected-icon` on a toggle) and no slot attribute at all (the simpler non-toggle case) can coexist.
