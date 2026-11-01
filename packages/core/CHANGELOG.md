# @lit-material/core

## 0.1.0

### Minor Changes

- 50e5698: `aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
