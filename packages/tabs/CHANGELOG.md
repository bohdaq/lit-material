# @lit-material/tabs

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
