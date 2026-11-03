# @lit-material/dual-list

## 0.2.1

### Patch Changes

- @lit-material/button@0.3.1
- @lit-material/icon-button@0.0.6
- @lit-material/text-field@0.4.1

## 0.2.0

### Minor Changes

- 9ce5b18: Array data renders on the server: bar chart `data`, line chart `series`, sparkline `values`, chip input `values`, pagination `page-size-options`, dual list `items` and `selected`, and table `columns` and `rows` take a JSON attribute, so server-rendered markup carries the data and hydrates to the same output (a property set on the server never reaches the markup). `lit-material-router-outlet` renders empty on the server instead of throwing for want of `location`, which failed the whole page's render.

### Patch Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.
- Updated dependencies [13debbc]
  - @lit-material/text-field@0.4.0
  - @lit-material/button@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
- Updated dependencies [4d0b41a]
  - @lit-material/icon-button@0.0.5
  - @lit-material/button@0.2.1
  - @lit-material/text-field@0.3.1
  - @lit-material/tokens@0.1.0

## 0.1.1

### Patch Changes

- Updated dependencies [7fd75e0]
  - @lit-material/button@0.2.0

## 0.1.0

### Minor Changes

- ee7db09: New package: `lit-material-dual-list-selector`: move items between available and chosen lists, with filters and listbox keyboard support.
