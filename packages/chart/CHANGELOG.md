# @lit-material/chart

## 0.2.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.
- 9ce5b18: Array data renders on the server: bar chart `data`, line chart `series`, sparkline `values`, chip input `values`, pagination `page-size-options`, dual list `items` and `selected`, and table `columns` and `rows` take a JSON attribute, so server-rendered markup carries the data and hydrates to the same output (a property set on the server never reaches the markup). `lit-material-router-outlet` renders empty on the server instead of throwing for want of `location`, which failed the whole page's render.

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

- 2c97439: Add `lit-material-bar-chart`: horizontal bars on a shared zero-based scale, one optional highlighted item with the only direct label, hover/keyboard readout and a screen-reader table.
