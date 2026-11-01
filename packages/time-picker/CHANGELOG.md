# @lit-material/time-picker

## 0.0.4

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [4d0b41a]
  - @lit-material/tokens@0.1.0

## 0.0.3

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/tokens@0.0.2

## 0.0.2

### Patch Changes

- Fix the dial's selection line pointing 180° off from the selected hour/minute. The line's unrotated baseline extended downward from the dial center while the rotation angle (and the selection dot's position) assumed 0° points up, so the line and the dot/field disagreed on every selection except the two that happen to land on that shared axis.
