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
8. ~~**Time Picker** — new package, last — the clock-dial UI is the most novel interaction to build
   from scratch.~~ Done: [`@lit-material/time-picker`](packages/time-picker).

## Beyond spec

Not part of the official M3 spec, but present in mature Material libraries (Angular Material, MUI)
that go beyond it. Lower priority than the M3 gaps above — this project's stated scope is M3
specifically.

- ~~**Autocomplete** — text field + filtered option list.~~ Done: [`@lit-material/autocomplete`](packages/autocomplete).
- ~~**Accordion / Expansion Panel** — expandable content sections.~~ Done: [`@lit-material/accordion`](packages/accordion).
- ~~**Stepper** — multi-step wizard flow.~~ Done: [`@lit-material/stepper`](packages/stepper).
- ~~**Tree** — hierarchical/nested list with expand-collapse.~~ Done: [`@lit-material/tree`](packages/tree).
- ~~**Avatar**~~ Done: [`@lit-material/avatar`](packages/avatar).
- ~~**Skeleton** (loading placeholder)~~ Done: [`@lit-material/skeleton`](packages/skeleton).
- ~~**Rating**~~ Done: [`@lit-material/rating`](packages/rating).
- ~~**Speed Dial** (expandable FAB menu)~~ Done: [`@lit-material/speed-dial`](packages/speed-dial).
- ~~**Breadcrumbs**~~ Done: [`@lit-material/breadcrumbs`](packages/breadcrumbs).

## PatternFly comparison

Gaps against [PatternFly](https://www.patternfly.org/components/all-components), for reference —
not M3 components, so lower priority than both sections above unless product need pulls one forward.
Overlaps with items already listed above (Avatar, Skeleton, Breadcrumbs, Stepper/Wizard, Tree/Tree
view, Accordion/Expandable section) aren't repeated here.

- ~~**Alert** — persistent inline/page-level banner; distinct from the `snackbar` toast.~~ Done:
  [`@lit-material/alert`](packages/alert).
- **Spinner**, **Empty state**
- ~~**Textarea** — currently only single-line via `text-field`.~~ Done: `lit-material-textarea` in
  [`@lit-material/text-field`](packages/text-field).
- ~~**File upload** (simple + multiple) — no package covers this at all.~~ Done:
  [`@lit-material/file-upload`](packages/file-upload).
- ~~**Popover** — richer, non-hover overlay content; distinct from `tooltip`.~~ Done:
  [`@lit-material/popover`](packages/popover).
- **Pagination**
- ~~**Toolbar**, **Page**/**Panel**/**Sidebar** — layout shell primitives.~~ Done:
  [`@lit-material/toolbar`](packages/toolbar), [`@lit-material/page`](packages/page),
  [`@lit-material/panel`](packages/panel), [`@lit-material/sidebar`](packages/sidebar).
- ~~**Description list**, **Data list**, **Simple list** — `list`/`data-table` don't cover these
  variants.~~ Done: [`@lit-material/description-list`](packages/description-list),
  [`@lit-material/data-list`](packages/data-list), [`@lit-material/simple-list`](packages/simple-list).
- **Number input**, **Input group**, **Inline edit**, **Dual list selector**, **Clipboard copy**
- ~~**Drawer** / **Notification drawer** — persistent panel, distinct from `sheet`.~~ Done:
  [`@lit-material/drawer`](packages/drawer).
- **Overflow menu**, **Application launcher**, **Jump links**, **Action list**
- **Title**/**Content** (typography primitives), standalone **Icon**, **Truncate**, **Back to top**,
  **About modal**
- ~~**Timestamp**~~ Done: [`@lit-material/timestamp`](packages/timestamp).
- ~~**Code block**~~ Done: [`@lit-material/code-block`](packages/code-block).
