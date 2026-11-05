# @lit-material/calendar

## 1.2.1

### Patch Changes

- @lit-material/core@1.2.1
- @lit-material/segmented-button@1.2.1
- @lit-material/tokens@1.2.1

## 1.2.0

### Patch Changes

- @lit-material/core@1.2.0
- @lit-material/segmented-button@1.2.0
- @lit-material/tokens@1.2.0

## 1.1.0

### Patch Changes

- @lit-material/core@1.1.0
- @lit-material/segmented-button@1.1.0
- @lit-material/tokens@1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- Updated dependencies [8646c7b]
- Updated dependencies [65ac716]
  - @lit-material/tokens@1.0.0
  - @lit-material/core@1.0.0
  - @lit-material/segmented-button@1.0.0

## 0.1.0

### Minor Changes

- 8ce2907: New package: `lit-material-calendar`, a calendar and scheduler with month, week, day and agenda views. Events (`{ id, title, start, end?, allDay?, color?, ...data }`, a property or JSON attribute) show as chips in the month grid with "+N more", and by start and end in the week and day time grids, side by side where they overlap. Clicking or pressing Enter fires `event-click` and `slot-click`; dragging out time, dragging or resizing an event, or Alt+arrow keys fire a cancelable `event-change` for the app to apply (events stay controlled). Keyboard: arrows (mirrored in right-to-left layouts), PageUp/PageDown, Home/End, T for today. Titles, weekdays and times are formatted in the element's language and the week starts on its first day. Positions are set through `cssProps`, so it runs under a strict CSP, and it renders on the server.
