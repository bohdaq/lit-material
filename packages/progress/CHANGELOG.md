# @lit-material/progress

## 0.1.2

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.1.1

### Patch Changes

- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2

## 0.1.0

### Minor Changes

- 71ae55f: `lit-material-usage-meter`: a labelled "used of limit" bar for quotas, with warning and critical thresholds stated in words as well as colour.
