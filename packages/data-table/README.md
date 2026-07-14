# @lit-material/data-table

Material Design 3 data table web components built with [Lit](https://lit.dev/). Part of
[lit-material](https://github.com/bohdaq/lit-material).

![lit-material data table: sortable Name/Age columns, a selected row, and an indeterminate select-all state](./screenshot.png)

## Install

```sh
npm install @lit-material/data-table @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/data-table";
</script>

<lit-material-data-table id="table">
  <lit-material-data-table-row header>
    <lit-material-data-table-cell header>
      <input type="checkbox" data-select-all aria-label="Select all rows" />
    </lit-material-data-table-cell>
    <lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>
    <lit-material-data-table-cell header sort-key="age" numeric>Age</lit-material-data-table-cell>
  </lit-material-data-table-row>

  <lit-material-data-table-row data-row-id="1">
    <lit-material-data-table-cell>
      <input type="checkbox" data-row-select aria-label="Select row: Ada" />
    </lit-material-data-table-cell>
    <lit-material-data-table-cell>Ada</lit-material-data-table-cell>
    <lit-material-data-table-cell numeric>32</lit-material-data-table-cell>
  </lit-material-data-table-row>
</lit-material-data-table>

<script type="module">
  const table = document.querySelector("#table");
  table.addEventListener("sort-change", (e) => console.log(e.detail)); // { sortKey, sortDirection }
  table.addEventListener("selection-change", (e) => console.log(e.detail)); // { selected: string[] }
</script>
```

## Why not a real `<table>`?

An earlier version of this component wrapped a real `<table>`/`<thead>`/`<tbody>`, with sorting
and selection styled from the outer component's own shadow root. That doesn't work: CSS
`::slotted()` can only style a *directly* slotted node, never its descendants — so with
`<thead>`/`<tbody>` as the slotted content, individual `<th>`/`<td>` cells are unreachable from
the table's stylesheet entirely (the same wall
[`@lit-material/badge`](https://github.com/bohdaq/lit-material/tree/main/packages/badge)'s README
describes hitting from a different angle). Splitting the table into
`lit-material-data-table-row`/`-cell` sub-components — the same shape as
[`@lit-material/list`](https://github.com/bohdaq/lit-material/tree/main/packages/list)'s
list/list-item split — gives every visual unit its own shadow root to style, at the cost of using
`display: table` / `table-row` / `table-cell` instead of the real elements to still get native
column alignment.

## API

### `lit-material-data-table`

| Property        | Attribute         | Type                                    | Default        |
| ---------------- | ------------------ | ----------------------------------------- | -------------- |
| `sortKey`        | `sort-key`          | `string \| undefined`                     | `undefined`     |
| `sortDirection`  | `sort-direction`    | `"none" \| "ascending" \| "descending"`   | `"ascending"`   |

Slot: default (`lit-material-data-table-row` elements).

This component owns UI *state* (which column is sorted which way, which rows are checked) and
*notifies* you of it via events — it never reorders rows or owns your data. Activating a sortable
header updates `sortKey`/`sortDirection`, syncs the indicator onto the right cell, and fires
`sort-change`; you re-render rows in the new order (or re-fetch a sorted page) in response. The
same headless-behavior split
[`@lit-material/tabs`](https://github.com/bohdaq/lit-material/tree/main/packages/tabs) makes for
tab panels.

Row selection works by event delegation rather than a hard dependency on any specific checkbox
implementation: put a real `<input type="checkbox">` (or
[`@lit-material/checkbox`](https://github.com/bohdaq/lit-material/tree/main/packages/checkbox), or
anything that fires a bubbling `change` event) with a `data-row-select` attribute in a row's cell,
and one with `data-select-all` in the header row's. Give each selectable row a `data-row-id`
attribute — `selection-change`'s `detail.selected` is the list of checked rows' `data-row-id`
values.

Fires `sort-change` (`detail: { sortKey, sortDirection }`) and `selection-change`
(`detail: { selected: string[] }`).

### `lit-material-data-table-row`

| Property   | Attribute  | Type      | Default |
| ---------- | ---------- | --------- | ------- |
| `header`   | `header`   | `boolean` | `false` |
| `selected` | `selected` | `boolean` | `false` |

Slot: default (`lit-material-data-table-cell` elements). Set `header` on the row made up of
header cells (typically the first). `selected` is normally managed by the parent table from a
`data-row-select` checkbox's checked state, not set directly.

### `lit-material-data-table-cell`

| Property        | Attribute         | Type                                    | Default |
| ---------------- | ------------------ | ----------------------------------------- | ------- |
| `header`         | `header`            | `boolean`                                  | `false` |
| `numeric`        | `numeric`           | `boolean`                                  | `false` |
| `sortKey`        | `sort-key`          | `string \| undefined`                     | `undefined` |
| `sortDirection`  | `sort-direction`    | `"none" \| "ascending" \| "descending"`   | `"none"` |

Slot: default (the cell's content). `numeric` right-aligns content (and applies tabular figures)
— use it for numeric columns per the MD3 spec. Set `sort-key` on a `header` cell to make it
sortable: that wraps its content in a real `<button>` (the ARIA APG pattern for sortable column
headers is an interactive element *inside* the columnheader cell, not the cell itself carrying the
interaction). `sortDirection` is kept in sync by the parent table, not set directly.

## Accessibility

Built entirely on ARIA `table`/`row`/`columnheader`/`cell` roles (set automatically — the
underlying elements aren't real `<table>`/`<tr>`/`<th>`/`<td>`, see above for why) rather than
requiring you to wire them up. Row-select and select-all checkboxes need their own `aria-label` (a
bare checkbox has no accessible name of its own) — see the usage example above.

## Scope

Deliberately out of scope for this first pass: pagination, column resizing, column reordering, row
virtualization for very large datasets, and multi-column sort. All reasonable follow-ups, not
silently missing pieces.

## License

MIT
