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
- **Spinner**, ~~**Empty state**~~ (done: [`@lit-material/empty-state`](packages/empty-state))
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
- **Application launcher**, **Jump links**, **Action list**
- ~~**Overflow menu**~~ Done: [`@lit-material/overflow-menu`](packages/overflow-menu).
- **Title**/**Content** (typography primitives), **Truncate**, **Back to top**, **About modal**
- ~~standalone **Icon**~~ Done: [`@lit-material/icon`](packages/icon).
- ~~**Timestamp**~~ Done: [`@lit-material/timestamp`](packages/timestamp).
- ~~**Code block**~~ Done: [`@lit-material/code-block`](packages/code-block).

## Found building the rws admin UI

Gaps hit while building an admin dashboard on lit-material (rust-web-server's
`admin-ui/`, 2026-10-30). The first three are fixes to existing packages; the
rest are components the app had to write by hand.

- ~~**Text field: Enter doesn't submit the form.** The `<input>` is in the shadow
  root, so implicit submission of an enclosing `<form>` never fires; the app
  added `@keydown` Enter handlers to every field. Fix it in `text-field`
  (form-associated `requestSubmit()` on Enter, single-line only), likely the
  same for `lit-material-button type="submit"`.~~ Done (unreleased changeset); the button
  already submitted.
- ~~**Responsive navigation.** Switching drawer ↔ rail ↔ bottom bar by width
  needs two components and a media query today (the `navigation` README's
  scope cut). A `lit-material-navigation` wrapper (or `responsive` attribute)
  that picks by breakpoint and keeps one `selected`.~~ Done: `lit-material-adaptive-navigation` in
  [`@lit-material/navigation`](packages/navigation).
- ~~**Snackbar `show(message)`.** Reusing one instance means setting
  `textContent` then calling `show()`; an optional message argument.~~ Done (unreleased changeset).
- ~~**Line chart / sparkline.** One series, 2px line, recessive grid,
  crosshair + tooltip on hover and focus, a text summary for screen readers.
  Needed by the rws8.tech benchmarks and the admin overview.~~ Done: [`@lit-material/chart`](packages/chart).
- ~~**Status indicator.** Icon + label coloured by state (ok / warning / error /
  neutral), never colour alone: health, breaker state, expiry.~~ Done: [`@lit-material/status`](packages/status).
- ~~**Stat tile.** Label, large tabular-number value, optional caption/trend.~~ Done: [`@lit-material/stat`](packages/stat).
- ~~**Log viewer.** Monospace stream of lines, sticks to the bottom only while
  scrolled there, pause/resume, optional per-line highlighting, a line cap.~~ Done: [`@lit-material/log-viewer`](packages/log-viewer).
- ~~**Simple table.** Styling for a semantic `<table>` (header row, numeric
  columns, scroll container) next to the div-based `data-table`, for
  read-only tables.~~ Done: [`@lit-material/table`](packages/table).
- ~~**Empty state** (listed above under PatternFly) was needed six times.~~ Done: [`@lit-material/empty-state`](packages/empty-state).

## Found reviewing rws + kube-dc usage

Second pass (2026-10-31) over what rust-web-server's `site/`, `admin-ui/` and
`starters/fullstack/` still hand-roll, plus what a kube-dc style console
(deploy, rollout status, quotas) needs next. Ordered by how much existing
consumer code each one replaces.

- ~~**Tab panels.** `lit-material-tabs` leaves panels to the page; the rws site
  wrote `tab-panels.js` to show one by index on `change`. A
  `lit-material-tab-panel` (or tabs that own their panels) with
  `aria-controls`/`aria-labelledby` wired up.~~ Done: `lit-material-tab-panel` in
  [`@lit-material/tabs`](packages/tabs).
- ~~**Bar chart.** `@lit-material/chart` has line + sparkline only; the rws
  benchmarks page hand-wrote horizontal bars with one highlighted entity, a
  shared pointer/focus tooltip and focusable rows (`site/src/charts/bars.js`,
  `chart-tooltip.js`).~~ Done: `lit-material-bar-chart` in [`@lit-material/chart`](packages/chart).
- **Colour-scheme switch.** Light / dark / system toggle plus a no-flash head
  snippet; the rws site wrote `theme-toggle.js` and an inline script.
- **Confirm dialog.** Destructive actions (rws admin "Purge", kube-dc deletes)
  need a one-call confirm, including a type-the-name-to-confirm variant.
- **Clipboard copy** (also under PatternFly above) — install commands, URLs,
  tokens, kubeconfigs.
- **Component tokens instead of `::part` overrides.** The rws theme reaches
  into button (press motion), code-block (radius, surface, mono font) and
  alert (radius) through `::part`; expose these as custom properties.
- **Icon set helper.** Every app hand-wires inline Phosphor SVGs in an
  `icons.js`; a small helper/registry for SVG sets.
- **Pagination** (also above) — server-side paging for `data-table`/`table`.
- **Usage meter** — quota bar with warning/critical thresholds, value and limit
  in text; `progress` doesn't cover thresholds.
- **Key/value editor** — labels, env vars, annotations.
- **Editable code field** — YAML/JSON editing; `code-block` is read-only.
- **Number input**, **Input group** (also above).
- **rws `starters/fullstack` frontend** (lives in rust-web-server) uses raw
  `<input>`/`<ul>` and only `button`; agents copy it when deploying to kube-dc,
  so it should show text-field, list, empty-state, snackbar.
