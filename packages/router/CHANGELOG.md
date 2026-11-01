# @lit-material/router

## 0.0.5

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.

## 0.0.4

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
