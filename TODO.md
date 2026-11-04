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
- ~~**Spinner**~~ (covered: indeterminate `lit-material-circular-progress` in [`@lit-material/progress`](packages/progress)), ~~**Empty state**~~ (done: [`@lit-material/empty-state`](packages/empty-state))
- ~~**Textarea** — currently only single-line via `text-field`.~~ Done: `lit-material-textarea` in
  [`@lit-material/text-field`](packages/text-field).
- ~~**File upload** (simple + multiple) — no package covers this at all.~~ Done:
  [`@lit-material/file-upload`](packages/file-upload).
- ~~**Popover** — richer, non-hover overlay content; distinct from `tooltip`.~~ Done:
  [`@lit-material/popover`](packages/popover).
- ~~**Pagination**~~ Done: `lit-material-data-table-pagination` in [`@lit-material/data-table`](packages/data-table).
- ~~**Toolbar**, **Page**/**Panel**/**Sidebar** — layout shell primitives.~~ Done:
  [`@lit-material/toolbar`](packages/toolbar), [`@lit-material/page`](packages/page),
  [`@lit-material/panel`](packages/panel), [`@lit-material/sidebar`](packages/sidebar).
- ~~**Description list**, **Data list**, **Simple list** — `list`/`data-table` don't cover these
  variants.~~ Done: [`@lit-material/description-list`](packages/description-list),
  [`@lit-material/data-list`](packages/data-list), [`@lit-material/simple-list`](packages/simple-list).
- ~~**Number input**~~, ~~**Input group**~~ (done: [`@lit-material/text-field`](packages/text-field)), ~~**Inline edit**~~, ~~**Dual list selector**~~ (done: [`@lit-material/inline-edit`](packages/inline-edit), [`@lit-material/dual-list`](packages/dual-list)), ~~**Clipboard copy**~~ (done: [`@lit-material/clipboard`](packages/clipboard))
- ~~**Drawer** / **Notification drawer** — persistent panel, distinct from `sheet`.~~ Done:
  [`@lit-material/drawer`](packages/drawer).
- ~~**Application launcher**~~ (done: `lit-material-app-launcher` in [`@lit-material/menu`](packages/menu)), ~~**Jump links**~~ (done: [`@lit-material/jump-links`](packages/jump-links)), ~~**Action list**~~ (done: `lit-material-action-list` in [`@lit-material/button`](packages/button))
- ~~**Overflow menu**~~ Done: [`@lit-material/overflow-menu`](packages/overflow-menu).
- ~~**Title**/**Content**~~ (done: opt-in `typography.css` in [`@lit-material/tokens`](packages/tokens)), ~~**Truncate**~~ (done: [`@lit-material/truncate`](packages/truncate)), ~~**Back to top**~~ (done: [`@lit-material/back-to-top`](packages/back-to-top)), ~~**About modal**~~ (done: `lit-material-about-dialog` in [`@lit-material/dialog`](packages/dialog))
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
- ~~**Colour-scheme switch.** Light / dark / system toggle plus a no-flash head
  snippet; the rws site wrote `theme-toggle.js` and an inline script.~~ Done:
  [`@lit-material/color-scheme`](packages/color-scheme).
- ~~**Confirm dialog.** Destructive actions (rws admin "Purge", kube-dc deletes)
  need a one-call confirm, including a type-the-name-to-confirm variant.~~ Done:
  [`@lit-material/confirm`](packages/confirm).
- ~~**Clipboard copy** (also under PatternFly above) — install commands, URLs,
  tokens, kubeconfigs.~~ Done: [`@lit-material/clipboard`](packages/clipboard); code-block
  copies through it (it used to report "Copied" on plain http, where nothing was copied).
- ~~**Component tokens instead of `::part` overrides.** The rws theme reaches
  into button (press motion), code-block (radius, surface, mono font) and
  alert (radius) through `::part`; expose these as custom properties.~~ Done:
  `--lit-material-button-shape`, `-button-pressed-scale`,
  `-code-block-{shape,container-color,font,font-size,line-height,label-font}`,
  `-alert-shape`, `-stat-value-font`. rws site switched in rust-web-server 4eb755c4 (one `::part(label)` left: label size has no token).
- ~~**Icon set helper.** Every app hand-wires inline Phosphor SVGs in an
  `icons.js`; a small helper/registry for SVG sets.~~ Done: `registerIcons()` + `name` / `icon()` in
  [`@lit-material/icon`](packages/icon).
- ~~**Pagination** (also above) — server-side paging for `data-table`/`table`.~~ Done:
  `lit-material-data-table-pagination` gained `unknown-total` + `has-more` (cursor / `continue`
  paging), `disabled` and SVG icons; README shows a Kubernetes example.
- ~~**Usage meter** — quota bar with warning/critical thresholds, value and limit
  in text; `progress` doesn't cover thresholds.~~ Done: `lit-material-usage-meter` in
  [`@lit-material/progress`](packages/progress).
- ~~**Key/value editor** — labels, env vars, annotations.~~ Done:
  [`@lit-material/key-value`](packages/key-value).
- ~~**Editable code field** — YAML/JSON editing; `code-block` is read-only.~~ Done:
  `lit-material-code-field` in [`@lit-material/code-block`](packages/code-block).
- ~~**Number input**~~ Done: `lit-material-number-field` in [`@lit-material/text-field`](packages/text-field).
  ~~**Input group**~~ Done: `lit-material-input-group` in [`@lit-material/text-field`](packages/text-field).
- ~~**rws `starters/fullstack` frontend** (lives in rust-web-server) uses raw
  `<input>`/`<ul>` and only `button`; agents copy it when deploying to kube-dc,
  so it should show text-field, list, empty-state, snackbar.~~ Done in rust-web-server 1d3f6067: text-field, list,
  empty-state, snackbar; it found the list fix in 0.0.3 (static rows' trailing
  controls weren't clickable).

## Found surveying consumers and other libraries (2026-10-31)

hitop's webapp, the rws site and admin UI, compared with Web Awesome, Carbon and PatternFly.

- ~~**Sortable list** — hitop reorders requests with native drag and drop; no keyboard way.~~ Done:
  [`@lit-material/sortable`](packages/sortable).
- ~~**Jump links** — the rws docs' "On this page" has no current-section highlight.~~ Done:
  [`@lit-material/jump-links`](packages/jump-links).
- ~~**Chip input** — labels, emails, allowed hosts.~~ Done: `lit-material-chip-input` in
  [`@lit-material/chip`](packages/chip).
- ~~**Split panel** — request/response, editor/preview.~~ Done: [`@lit-material/split-panel`](packages/split-panel).
- ~~**Formatting helpers** — bytes, counts, durations, Kubernetes quantities.~~ Done:
  [`@lit-material/format`](packages/format).
- ~~**Adopt in consumers**~~ (2026-10-31): hitop cb3a41f — `color-scheme` toggle (key
  `hitop-theme`), `registerIcons`, `sortable` sidebar requests (collection cards stay HTML5 drag:
  sortable is vertical-only, they're a grid); rws site a8809496 — `jump-links` for "On this page"
  (SSR via the JSON `links` attribute, added for this). Not done on purpose: `menu` for the version
  switcher and `search` for docs search — both are no-JS `<details>`/`<dialog>` today and would lose that.
- ~~**Sortable in a grid**~~: `layout="grid"` (sortable 0.2.0); hitop's collection cards use it (19753a3).

## Framework and enterprise readiness (2026-11-04)

What lit-material still lacks to be picked the way React, Angular or Angular Material are picked.
The goal is "the complete kit for building apps on Lit", not a new rendering framework: Lit is the
framework. Ordered by priority.

1. ~~**1.0 and a support policy.** Every package is 0.x. Ship 1.0 with a written semver, deprecation and
   long-term-support policy, and link versions (Changesets `linked`/`fixed`) or publish an
   all-components package so 81 independent versions don't need a compatibility matrix.~~ Done (unreleased
   changeset): all 89 published packages in one Changesets `fixed` group and a major changeset taking them
   to 1.0.0 together; [VERSIONING.md](VERSIONING.md) (public API, semver, deprecations a minor ahead and
   6 months, previous major supported 12 months, browsers/Node/Lit) and the "Versions and support" guide.
2. **Governance files.** ~~`SECURITY.md` (private reporting, supported versions), `CONTRIBUTING.md`,
   code of conduct, a public roadmap and a lightweight RFC process.~~ Done: [SECURITY.md](SECURITY.md)
   (GitHub private vulnerability reporting, response targets, scope), [CONTRIBUTING.md](CONTRIBUTING.md)
   (checks, conventions, decisions), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) (Contributor Covenant 2.1),
   [ROADMAP.md](ROADMAP.md), [rfcs/](rfcs/README.md), [MAINTAINERS.md](MAINTAINERS.md). One maintainer is a
   procurement flag; name a second. (Still open: MAINTAINERS.md asks for one.)
3. ~~**Router v2** (`router` 0.0.6 has nested routes and a base path only): guards and redirects,
   lazy-loaded routes (`import()`), typed query parameters, scroll restoration, page titles,
   server-side matching so routed pages can be prerendered.~~ Done (unreleased changeset):
   `redirect`/`guard`/`load`/`title`/`status` on routes, `parseQuery`/`formatQuery`, outlet scroll
   restoration and `path` on the server, `resolveRoute()` in [`@lit-material/router`](packages/router).
4. ~~**Framework typings and wrappers**, generated from each package's `custom-elements.json`: React 18
   wrappers via `@lit/react`, JSX `IntrinsicElements`, Vue `GlobalComponents` and Angular schema typings.~~
   Done (unreleased changeset): `tools/framework-bindings.mjs` writes `/react`, `/jsx`, `/vue` entries and
   `web-types.json` + VS Code custom data for all 73 component packages; `pnpm bindings:check` in CI. Angular
   gets editor completion only: it doesn't type-check bindings on custom elements under `CUSTOM_ELEMENTS_SCHEMA`.
5. **Accessibility conformance report.** axe runs in tests; publish a WCAG 2.2 AA report (VPAT format)
   per component, backed by manual NVDA/JAWS/VoiceOver passes.
6. ~~**i18n.** Message catalogs and plural forms on top of the locale context (or document `@lit/localize`),
   and right-to-left styling everywhere (7 components today).~~ Done (unreleased changeset):
   `LocalizeController` in `@lit-material/core/localize.js` (language from the nearest `lang`, plurals through
   `Intl.PluralRules`), 201 component messages extracted to [`@lit-material/translations`](packages/translations)
   with ar/de/es/fr/ja/pl/uk catalogs (not yet reviewed by native speakers), dates and numbers in the element's
   language, and an RTL pass over every component (logical CSS, arrow keys, popup alignment, mirrored icons).
7. ~~**Data and forms.**
   - `task`: request caching with background refresh, deduplication, retries.
   - A small fetch wrapper with interceptors (auth headers, 401 handling).
   - `form`: async and schema validators (zod-style) and field arrays.~~ Done (unreleased changesets):
   `TaskController` `key`/`staleTime`/`retry`/`refetch*` with a shared `TaskCache`; new
   [`@lit-material/http`](packages/http); `FormController` validators, Standard Schema, `handleSubmit` and
   `FieldArrayController` in [`@lit-material/form`](packages/form).
8. ~~**Full-stack layer.** A Vite plugin and preset: SSR of the whole app, per-route data loading,
   app-level hydration, more than one `create-lit-material-app` template.~~ Done (unreleased changesets):
   router `loader`s with server data reused on the first render, [`@lit-material/vite`](packages/vite)
   (whole-app SSR in dev and production, prerendering, hydration), and `create-lit-material-app --template
   spa|ssr` with versions filled from the release.
9. ~~**Developer tooling.**
   - Testing helpers for app authors (fixtures, `waitForUpdate`, role-based queries through shadow roots).
   - A devtools panel for the store and router.~~ Done (unreleased changeset):
   [`@lit-material/testing`](packages/testing) and [`@lit-material/devtools`](packages/devtools)
   (Redux DevTools extension with time travel, router log, in-page panel); `store.replaceState`.
10. **Design hand-off.** A Figma kit matching the components and tokens. Started (unreleased changeset):
    `@lit-material/tokens` ships `figma/tokens.light.json` and `figma/tokens.dark.json`, every `--md-sys-*`
    token in W3C DTCG format (one file per mode, for Figma Variables import and Tokens Studio), generated by
    `tools/figma-tokens.mjs` and kept current by `pnpm figma-tokens:check` in CI; the component kit is still to do.
11. ~~**Security and compliance.** Publish an SBOM per release; document Content-Security-Policy
    (no inline styles or scripts) and Trusted Types compatibility. Release provenance already exists.~~ Done
    (unreleased changeset): `pnpm csp` in CI renders every element under a strict CSP with Trusted Types
    enforced; inline styles moved to `cssProps` (CSSOM) in 13 packages; `dist/sbom.cdx.json` (CycloneDX) in
    every package at release; guide "Security, CSP and SBOMs".
12. **Enterprise widgets.**
    - ~~Data grid: grouping, inline editing, CSV export.~~ Done (unreleased changeset):
      `lit-material-data-grid` in `@lit-material/data-table` (`data-grid.js`), data-driven `columns`/`rows`
      (JSON attributes too) rendered with the table's row/cell elements: sorting, checkbox selection,
      nested `group-by` with sum/avg/min/max/count/function aggregates as a treegrid, inline editing with
      text/number/select editors and a cancelable `cell-edit`, roving-tabindex cell navigation, built-in
      pagination, and RFC 4180 `toCSV()`/`downloadCSV()` with formula-injection escaping. No
      virtualization, filtering or multi-sort (see its README's Scope).
    - ~~Rich-text editor.~~ Done (unreleased changeset): [`@lit-material/rich-text`](packages/rich-text)
      (`lit-material-rich-text-editor`): own document model and undo history instead of `execCommand`,
      schema-bound sanitizer for paste and `value` (no Trusted Types policy needed), ARIA toolbar, link
      panel with safe schemes, form-associated, SSR + hydration, `getText()`/`getMarkdown()`.
    - ~~Calendar / scheduler.~~ Done (unreleased changeset): [`@lit-material/calendar`](packages/calendar) —
      month grid with "+N more", week and day time grids with overlap columns and an all-day row, agenda; drag to
      create, drag and resize, Alt+arrow moves, all through a cancelable `event-change` on controlled `events`;
      ARIA grids with arrow/PageUp/PageDown/Home/End/T keys (mirrored in RTL); local time zone only (`time-zone`
      and recurrence scoped out).
13. **Adoption.**
    - ~~Migration guides and codemods from `@material/web` and Angular Material.~~ Done (unreleased
      changeset): [`@lit-material/codemod`](packages/codemod) (`npx @lit-material/codemod md-web src`)
      rewrites `@material/web` tags, attributes, slots, events and imports and reports the rest by file and
      line; guides "From @material/web" (with the codemod's mapping table) and "From Angular Material"
      (setup, bindings, forms, component table, service patterns). Angular Material has a guide, not a
      codemod: its directives and services don't map one to one.
    - Case studies (rws site and admin UI, hitop).
    - A support offering.

## Found reviewing the HITOP Cloud portal (2026-11-04)

The portal (`hitop/cloud/portal`, one Lit element in light DOM) uses only button and text-field. Most of what it
hand-rolls already exists here (data-table/table, select/checkbox/switch, confirm, alert, snackbar,
usage-meter, tabs, navigation, empty-state, clipboard, timestamp, skeleton, task, http); these four didn't.

- ~~**Hash routing.** The portal is static files routed on `#/…`; the router was history-only.~~ Done (unreleased
  changeset): `setRouterMode("hash")` and `routeHref()` in [`@lit-material/router`](packages/router).
- ~~**Sign-in screen.** ~140 lines of the portal: password, mailed code, sign up, forgot password, provider
  buttons.~~ Done (unreleased changeset): [`@lit-material/sign-in`](packages/sign-in), and
  `lit-material-one-time-code` in [`@lit-material/text-field`](packages/text-field).
- ~~**Plan cards.** The Plan page needs plans side by side with the current one marked.~~ Done (unreleased
  changeset): [`@lit-material/pricing`](packages/pricing).
- ~~**Secret shown once.** New access tokens and SCIM tokens.~~ Done (unreleased changeset):
  `lit-material-new-secret` in [`@lit-material/clipboard`](packages/clipboard).
- **Button hit area.** A `lit-material-button` stretched by its container (grid/flex `stretch`, `width: 100%`)
  keeps its pill size, and clicks on the rest of the host do nothing. sign-in and pricing avoid stretching it;
  fixing the button itself (inner button fills the host) changes how stretched buttons look for consumers.
