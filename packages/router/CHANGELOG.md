# @lit-material/router

## 0.0.6

### Patch Changes

- 9ce5b18: Array data renders on the server: bar chart `data`, line chart `series`, sparkline `values`, chip input `values`, pagination `page-size-options`, dual list `items` and `selected`, and table `columns` and `rows` take a JSON attribute, so server-rendered markup carries the data and hydrates to the same output (a property set on the server never reaches the markup). `lit-material-router-outlet` renders empty on the server instead of throwing for want of `location`, which failed the whole page's render.

## 0.0.5

### Patch Changes

- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.

## 0.0.4

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
