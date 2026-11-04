# @lit-material/split-panel

Two panes with a divider you drag or move from the keyboard: request and response, editor and preview, list and detail. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/split-panel @lit-material/tokens
```

## Usage

```html
<lit-material-split-panel label="Request" position="40" style="height: 480px">
  <section slot="start">…request…</section>
  <section slot="end">…response…</section>
</lit-material-split-panel>
```

Give it a height (or put it in a flex/grid cell that has one). Persist the split yourself:
`panel.addEventListener("change", (e) => localStorage.split = e.detail.position)`.

## API

| Property      | Attribute     | Type                          | Default          |
| ------------- | ------------- | ----------------------------- | ---------------- |
| `position`    | `position` (reflected) | `number` (start pane, %) | `50`        |
| `min`, `max`  | `min`, `max`  | `number` (%)                  | `10`, `90`       |
| `orientation` | `orientation` (reflected) | `"horizontal" \| "vertical"` | `"horizontal"` |
| `label`       | `label`       | `string` (divider's name)     | `"Resize panes"`, translated |
| `disabled`    | `disabled` (reflected) | `boolean`            | `false`          |

Slots `start`, `end`; event `change` (`detail: { position }`, after a drag or key press); part
`divider`; `--lit-material-split-panel-divider-size` (default `8px`, the visible line is 1px).

## Behavior

The divider is a WAI-ARIA window splitter (`role="separator"` with `aria-valuenow`): arrow keys move
it 1% (Shift: 10%), Home/End go to `min`/`max`, Enter collapses the start pane to `min` and restores
it. Pointer drags work with touch too. Right-to-left layouts reverse the horizontal keys.

## License

MIT
