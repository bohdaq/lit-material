# @lit-material/tabs

## 0.3.0

### Minor Changes

- e76e963: Tabs for open documents: `scrollable` on the tabs (tabs keep their width, the row scrolls, the selected tab is kept in view; an `end` slot for a New tab button), `closable` on a tab (a × that fires a cancelable `close`, also from Delete and a middle click) and `dirty` (a dot and "Unsaved changes" in its description). The indicator now follows its tab while the row scrolls.

### Patch Changes

- Updated dependencies [d400036]
  - @lit-material/core@0.2.0

## 0.2.0

### Minor Changes

- 13debbc: One entry point per element in packages that hold several (`@lit-material/text-field/text-field.js`, `@lit-material/chart/line-chart.js`, …), so an app can import only the elements it uses: an element registers itself on import, so a bundler can't drop the unused ones. Confirm, dual list, inline edit and key-value now import only the text field and button they use — 25–35% smaller gzipped.

## 0.1.2

### Patch Changes

- 50e5698: `aria-labelledby` on checkbox, FAB, icon button, radio, slider and switch, and a tab's `aria-controls`, now reach the elements they name. They used to be copied as ids onto the control inside the shadow root, where an id from the page resolves to nothing; they're now linked through ARIA element reflection (`setAriaElements`, new in `@lit-material/core`).
- 4d0b41a: `hidden` hides the element. Components that set a `display` on their host overrode the browser's own `[hidden]` rule, so `hidden` did nothing on them; each now has `:host([hidden]) { display: none }`.
- Updated dependencies [50e5698]
- Updated dependencies [4d0b41a]
  - @lit-material/core@0.1.0
  - @lit-material/tokens@0.1.0

## 0.1.1

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
- Updated dependencies [998f020]
  - @lit-material/core@0.0.3
  - @lit-material/tokens@0.0.2

## 0.1.0

### Minor Changes

- 6818704: Add `lit-material-tab-panel`: panels placed after `lit-material-tabs` are paired by index, shown for the selected tab, and wired with `aria-controls`/`aria-labelledby`.

## 0.0.3

### Patch Changes

- 64593c1: Server-rendered tabs now report the selected tab correctly after hydration. `lit-material-tabs` set each tab's `selected` in `connectedCallback`, before the tabs were upgraded; they hydrated with that value and kept the server's `aria-selected="false"` and `tabindex="-1"` on the selected tab. The selection is now synced once the tabs are defined and hydrated.

## 0.0.3

### Patch Changes

- 64593c1: Server-rendered tabs now report the selected tab correctly after hydration. `lit-material-tabs` set each tab's `selected` in `connectedCallback`, before the tabs were upgraded; they hydrated with that value and kept the server's `aria-selected="false"` and `tabindex="-1"` on the selected tab. The selection is now synced once the tabs are defined and hydrated.
