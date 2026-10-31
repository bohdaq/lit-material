# @lit-material/sortable

Lets people reorder a list by dragging a handle (mouse, pen or touch) or from the keyboard, within a list or between lists, with each step announced to screen readers. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/sortable @lit-material/tokens
```

## Usage

```js
import "@lit-material/sortable";

html`<lit-material-sortable label="Requests" @sort=${(e) => {
  const { from, to } = e.detail;
  const [moved] = requests.splice(from, 1);
  requests.splice(to, 0, moved);
  this.requestUpdate();
}}>
  ${repeat(requests, (r) => r.id, (r) => html`
    <div data-sort-id=${r.id}>
      <button data-sort-handle aria-label=${`Reorder ${r.name}`}>⋮⋮</button>${r.name}
    </div>`)}
</lit-material-sortable>`;
```

It never moves elements itself: it shows a drop line and fires `sort`; your code reorders its data
and re-renders. That keeps it safe with Lit, React or any renderer that owns its DOM. Key repeated
items (`repeat`, React `key`) so the moved element keeps keyboard focus.

## API

| Property   | Attribute  | Type      | Default |
| ---------- | ---------- | --------- | ------- |
| `group`    | `group`    | `string`  | `""` (this list only) |
| `label`    | `label`    | `string`  | `""` (names the list in announcements) |
| `disabled` | `disabled` (reflected) | `boolean` | `false` |

Event `sort`: `detail: { item, id, from, to, fromList, toList }` — `to` is the item's index in
`toList` after the move. Between lists it fires on the list the item left; check
`toList !== fromList`. Item attributes: `data-sort-id`, `data-sort-label` (announcement name,
default the text), `data-sort-handle` on the handle (default: the item). While dragged an item has
`data-sort-dragging`, while picked up from the keyboard `data-sort-grabbed`.
`--lit-material-sortable-indicator-color` colours the drop line.

## Behavior

- Pointer: press a handle and move 4px to start; the drop line follows; release drops, Escape
  cancels. Handles get `touch-action: none` so touch drags don't scroll.
- Keyboard: focus a handle, Space or Enter picks the item up, ↑/↓ (or Home/End) move it — each move
  fires `sort` — Space drops, Escape puts it back where it started. Moving focus away drops it.
- Handles get `aria-description="Press Space to reorder"` unless they have one; pick-up, moves and
  drops are announced from a live region.
- Lists that share a `group` accept each other's items by pointer.

## License

MIT
