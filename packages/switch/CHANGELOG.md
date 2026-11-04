# @lit-material/switch

## 0.2.0

### Minor Changes

- 8507493: Framework bindings, generated from the custom elements manifest. `@lit-material/<pkg>/react` has a React wrapper per element, built on `@lit/react` (optional peer dependencies `@lit/react` and `react`): properties are set as properties and events map to `onChange`-style props. `@lit-material/<pkg>/jsx` types the elements in React 19 JSX and `@lit-material/<pkg>/vue` in Vue templates (load either with `import type {} from ...`). `dist/web-types.json` (JetBrains, found through the `web-types` field) and `dist/vscode.html-custom-data.json` give editor completion and docs in any template, Angular's included.

### Patch Changes

- Updated dependencies [db33e54]
  - @lit-material/core@0.3.0

## 0.1.0

### Minor Changes

- d400036: Switch, checkbox and radio take a visible `label` (clicking it toggles the control) and `supporting-text` (its description), so they no longer need a wrapping `<label>` and a repeated `aria-label`. Both render on the server. Core exports the shared `controlLabel` template and `controlLabelStyles`.

### Patch Changes

- Updated dependencies [d400036]
  - @lit-material/core@0.2.0

## 0.0.4

### Patch Changes

- 50e5698: `aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).
- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/tokens@0.1.0

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/tokens@0.0.2
