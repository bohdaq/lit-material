# @lit-material/core

## 0.2.0

### Minor Changes

- d400036: Switch, checkbox and radio take a visible `label` (clicking it toggles the control) and `supporting-text` (its description), so they no longer need a wrapping `<label>` and a repeated `aria-label`. Both render on the server. Core exports the shared `controlLabel` template and `controlLabelStyles`.

## 0.1.0

### Minor Changes

- 50e5698: `aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
