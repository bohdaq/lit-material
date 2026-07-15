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

| Property        | Attribute          | Type                                     | Default       |
| ---------------- | ------------------ | ----------------------------------------- | -------------- |
| `sortKey`        | `sort-key`          | `string \| undefined`                     | `undefined`    |
| `sortDirection`  | `sort-direction`    | `"none" \| "ascending" \| "descending"`   | `"ascending"`  |
| `items`          | —                   | `readonly unknown[]`                      | `[]`           |
| `rowRenderer`    | —                   | `(item, index) => unknown` \| `undefined` | `undefined`    |
| `rowKey`         | —                   | `(item, index) => string \| number` \| `undefined` | `undefined` |
| `rowHeight`      | `row-height`        | `number`                                  | `44`           |
| `viewportHeight` | `viewport-height`   | `number`                                  | `400`          |
| `overscan`       | `overscan`          | `number`                                  | `4`            |

Slot: default (`lit-material-data-table-row` elements — in virtualized mode, the header row only).

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

#### Row virtualization

Set `.items` (your full dataset) and `.rowRenderer` (a function returning one body row per item)
to switch on fixed-height virtualization — only the rows within (or near) the visible scroll window
are ever mounted, however large `items` is:

```ts
table.items = people; // e.g. 50,000 rows
table.rowRenderer = (person, index) => html`
  <lit-material-data-table-row flex data-row-id=${person.id}>
    <lit-material-data-table-cell flex width="200px">${person.name}</lit-material-data-table-cell>
    <lit-material-data-table-cell flex width="80px" numeric>${person.age}</lit-material-data-table-cell>
  </lit-material-data-table-row>
`;
```

This is the one thing here that isn't purely headless — true virtualization requires knowing the
full item count up front, which "you slot real rows" (the table's normal mode) can't provide.
Notes:

- **Slot only the header row.** Body rows come from `rowRenderer`; anything else slotted alongside
  it is ignored by the virtualized viewport (though still slotted, so don't put extra body rows
  there).
- **Both the header row and every `rowRenderer` row need `flex`** (see
  `lit-material-data-table-row`'s own docs) — virtualized rows are positioned with `transform`,
  which the table's normal `display: table` column-alignment trick can't do, so virtualized mode
  uses explicit flexbox widths (`lit-material-data-table-cell`'s `width` property) instead. Keep
  the header's cell widths and the body rows' cell widths in sync yourself.
- **Row height is fixed** — set `row-height` to whatever your actual row content needs; there's no
  per-row measurement.
- Sorting and row-selection delegation both keep working on virtualized rows exactly as they do on
  slotted ones.

### `lit-material-data-table-row`

| Property   | Attribute  | Type      | Default |
| ---------- | ---------- | --------- | ------- |
| `header`   | `header`   | `boolean` | `false` |
| `selected` | `selected` | `boolean` | `false` |
| `flex`     | `flex`     | `boolean` | `false` |

Slot: default (`lit-material-data-table-cell` elements). Set `header` on the row made up of
header cells (typically the first). `selected` is normally managed by the parent table from a
`data-row-select` checkbox's checked state, not set directly. Set `flex` to switch the row from
`display: table-row` to `display: flex` — only needed for virtualized rows (see above).

### `lit-material-data-table-cell`

| Property        | Attribute         | Type                                    | Default |
| ---------------- | ------------------ | ----------------------------------------- | ------- |
| `header`         | `header`            | `boolean`                                  | `false` |
| `numeric`        | `numeric`           | `boolean`                                  | `false` |
| `sortKey`        | `sort-key`          | `string \| undefined`                     | `undefined` |
| `sortDirection`  | `sort-direction`    | `"none" \| "ascending" \| "descending"`   | `"none"` |
| `resizable`      | `resizable`         | `boolean`                                  | `false` |
| `minWidth`       | `min-width`         | `number`                                   | `60`    |
| `flex`           | `flex`              | `boolean`                                  | `false` |
| `width`          | `width`             | `string \| undefined`                     | `undefined` |

Slot: default (the cell's content). `numeric` right-aligns content (and applies tabular figures)
— use it for numeric columns per the MD3 spec. Set `sort-key` on a `header` cell to make it
sortable: that wraps its content in a real `<button>` (the ARIA APG pattern for sortable column
headers is an interactive element *inside* the columnheader cell, not the cell itself carrying the
interaction). `sortDirection` is kept in sync by the parent table, not set directly.

Set `resizable` on a `header` cell to add a drag handle at its trailing edge; dragging it fires
`column-resize` (`detail: { width }`, pixels) on the cell, which `lit-material-data-table` listens
for and applies to every cell in that column (not just the header one — see the table's own docs
for why). `min-width` floors how narrow a drag can make it. `flex`/`width` are for virtualized mode
— see the table's docs above.

Fires `column-resize` (`detail: { width: number }`) while dragging a `resizable` cell's handle.

## Accessibility

Built entirely on ARIA `table`/`row`/`columnheader`/`cell` roles (set automatically — the
underlying elements aren't real `<table>`/`<tr>`/`<th>`/`<td>`, see above for why) rather than
requiring you to wire them up. Row-select and select-all checkboxes need their own `aria-label` (a
bare checkbox has no accessible name of its own) — see the usage example above.

## Pagination

`lit-material-data-table-pagination` is a standalone footer control, not something the table
renders itself — pagination is exactly as data-shaped a concern as sorting/selection, and the
table never owns your data (see above). Feed it a total row count and it works out page count,
range, and button disabled-state itself:

```html
<lit-material-data-table-pagination id="pager" total="97" page-size="10"></lit-material-data-table-pagination>
<script type="module">
  document.querySelector("#pager").addEventListener("page-change", (e) => {
    console.log(e.detail); // { page, pageSize } — re-slice or re-fetch your rows in response
  });
</script>
```

| Property          | Attribute    | Type                  | Default        |
| ------------------ | ------------ | ----------------------- | -------------- |
| `page`             | `page`       | `number`                | `0` (0-based)  |
| `pageSize`         | `page-size`  | `number`                | `10`           |
| `total`            | `total`      | `number`                | `0`            |
| `pageSizeOptions`  | —            | `readonly number[]`     | `[10, 25, 50]` |

Fires `page-change` (`detail: { page, pageSize }`) when a nav button is clicked or the page-size
select changes (which also resets `page` back to `0`).

## Scope

Deliberately out of scope: column reordering and multi-column sort. Both reasonable follow-ups,
not silently missing pieces.

## License

MIT
