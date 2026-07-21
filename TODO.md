# TODO

Gaps against the [M3 component spec](https://m3.material.io/components), ordered smallest-lift to
largest — favoring items that extend an existing package/pattern before new packages with novel
interaction models.

1. ~~**Segmented Button** — standalone package. Selection model already exists in `chip`/`tabs`.~~
   Done: [`@lit-material/segmented-button`](packages/segmented-button).
2. ~~**Navigation Bar** (bottom nav) — extends `navigation`, reuses the `selected`-index pattern
   already shared by drawer/rail.~~ Done: `lit-material-navigation-bar` in
   [`@lit-material/navigation`](packages/navigation).
3. ~~**Docked date picker variant** — extends `date-picker`, reuses the existing calendar-grid
   rendering, swaps the `<dialog>` wrapper for inline.~~ Done: `variant="docked"` on
   [`@lit-material/date-picker`](packages/date-picker).
4. ~~**Date Range Picker** — extends `date-picker`, builds on the same calendar grid but needs
   range-selection state/keyboard handling.~~ Done: `lit-material-date-range-picker` in
   [`@lit-material/date-picker`](packages/date-picker).
5. ~~**Search** (bar + view) — new package, built on the Popover API like `menu`/`snackbar`/`tooltip`.~~
   Done: [`@lit-material/search`](packages/search).
6. ~~**Bottom Sheet / Side Sheet** — new package(s), same native-`<dialog>` foundation as
   `dialog`/modal `navigation-drawer`. Drag-to-dismiss gesture is a likely scope cut, same way
   `navigation` scope-cuts responsive breakpoint switching.~~ Done: [`@lit-material/sheet`](packages/sheet).
7. ~~**Carousel** — new package, scroll-snap based; no prior pattern in this repo to lean on.~~
   Done: [`@lit-material/carousel`](packages/carousel).
8. **Time Picker** — new package, last — the clock-dial UI is the most novel interaction to build
   from scratch.

## Beyond spec

Not part of the official M3 spec, but present in mature Material libraries (Angular Material, MUI)
that go beyond it. Lower priority than the M3 gaps above — this project's stated scope is M3
specifically.

- **Autocomplete** — text field + filtered option list.
- **Accordion / Expansion Panel** — expandable content sections.
- **Stepper** — multi-step wizard flow.
- **Tree** — hierarchical/nested list with expand-collapse.
- **Avatar**, **Skeleton** (loading placeholder), **Rating**, **Speed Dial** (expandable FAB menu),
  **Breadcrumbs** — smaller MUI-specific additions.
