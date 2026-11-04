# lit-material

A [Material Design 3](https://m3.material.io/) web component collection built with [Lit](https://lit.dev/) —
one package per component, no shared mega-bundle, no required adapter layer. Framework-agnostic, SSR-ready,
and small enough to actually read the source of.

- **64 components**, each its own npm package — install only what you use.
- **Zero runtime dependencies beyond Lit.** No icon font, no CSS-in-JS runtime, no framework required.
- **SSR-ready.** Every component is tested against [`@lit-labs/ssr`](https://www.npmjs.com/package/@lit-labs/ssr)
  as well as in a real browser.
- **App-shell primitives** (router, a Redux-shaped store, theme/locale context, data-fetching and
  form-validation controllers, a starter CLI) for when you're building a whole app, not just using one
  component.

## Why Lit? Why lit-material?

**Lit** builds on real Custom Elements and Shadow DOM instead of a framework-specific component model — a
`<lit-material-button>` is a normal DOM element that works in React, Vue, Angular, plain HTML, or nothing at
all, with no wrapper package required. Its runtime is a few KB, templates are plain tagged template literals
(no build-time JSX transform required, though you can use one), and updates are fine-grained property/attribute
diffs rather than a virtual DOM — closer to what the browser is already doing than most component models get.

**lit-material**, specifically:

- **One package per component.** Install `@lit-material/button`, not a components library that happens to
  contain a button. No shared mega-bundle, no tree-shaking required to avoid shipping code you don't use.
  A package with several elements (text field, textarea and number field; the chart types; the navigation
  variants) also has one entry point per element — `import "@lit-material/text-field/text-field.js"` — since
  an element registers itself when imported and a bundler can't drop it. CI holds every package to a size
  budget (`pnpm size`, `tools/size-limits.json`).
- **No required adapter layer.** Because these are just Custom Elements, there's no React/Vue/Angular wrapper
  package standing between you and the component — use it directly from any of them. When you want one, every
  component package also ships generated bindings: React wrappers (`@lit-material/<pkg>/react`, on
  `@lit/react`), React 19 JSX typings (`/jsx`), Vue `GlobalComponents` typings (`/vue`), and JetBrains
  `web-types.json` / VS Code custom data for editor completion in any template, Angular's included. See
  [React, Vue and Angular](https://lit.rws8.tech/guides/frameworks/).
- **Any language, either direction.** Components take their language from the nearest `lang` attribute:
  their own text (button names, announcements, counts with real plural rules) comes from message catalogs
  ([`@lit-material/translations`](packages/translations)), dates and numbers from `Intl`, and every layout,
  arrow key and directional icon mirrors under `dir="rtl"`. See
  [Languages and right to left](https://lit.rws8.tech/guides/i18n/).
- **SSR-tested, not just browser-tested.** Every component has a real test asserting its
  [`@lit-labs/ssr`](https://www.npmjs.com/package/@lit-labs/ssr) output, not just its client-side behavior.
- **Built on native browser APIs wherever one exists** — the Popover API (Menu, Snackbar, Tooltip), the native
  `<dialog>` element (Dialog), `ElementInternals` for form participation (Text Field, Checkbox, Radio, Switch,
  Slider) — instead of reimplementing overlay positioning, focus trapping, or form-value plumbing from scratch.
- **Headless controllers, not a required framework.** `@lit-material/task`/`form`/`store` notify you of state
  changes via events/reactive properties; they never own your rendering or your data shape.
- **Actively developed**, at a point where [`@material/web`](https://github.com/material-components/material-web)
  (Google's own Material Design 3 web components) is in maintenance mode.

## Install

```sh
npm install @lit-material/tokens @lit-material/button
```

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/button";
</script>

<lit-material-button variant="filled">Save</lit-material-button>
```

`@lit-material/tokens` is the one thing every other package expects to be on the page — it's the CSS custom
properties (color, type, shape, elevation, motion) every component reads from. Link it once, use as many
components as you like.

## Components

| Package | |
| --- | --- |
| [`@lit-material/button`](packages/button) | Filled, outlined, text, elevated, tonal; action list for rows of actions. |
| [`@lit-material/icon-button`](packages/icon-button) | Standard + toggle variants. |
| [`@lit-material/fab`](packages/fab) | Floating action button. |
| [`@lit-material/text-field`](packages/text-field) | Single-line + `lit-material-textarea` multi-line, filled + outlined, validation states; number field with −/+ steppers; input group. |
| [`@lit-material/checkbox`](packages/checkbox) | Checked, indeterminate, error, form participation. |
| [`@lit-material/radio`](packages/radio) | Grouped selection, error, form participation. |
| [`@lit-material/switch`](packages/switch) | On/off toggle, optional thumb icons, form participation. |
| [`@lit-material/slider`](packages/slider) | Single value, native `<input type="range">`-based. |
| [`@lit-material/select`](packages/select) | `lit-material-select` + `lit-material-select-option`. |
| [`@lit-material/chip`](packages/chip) | Assist, filter, input, suggestion variants.; chip input for tags and labels. |
| [`@lit-material/segmented-button`](packages/segmented-button) | Single-select or multi-select connected button row. |
| [`@lit-material/card`](packages/card) | Elevated, filled, outlined; optionally interactive. |
| [`@lit-material/carousel`](packages/carousel) | Scroll-snap based, with overlaid nav buttons. |
| [`@lit-material/list`](packages/list) | `lit-material-list` + `lit-material-list-item`. |
| [`@lit-material/data-table`](packages/data-table) | Sortable, selectable, paginated, resizable, virtualized. |
| [`@lit-material/badge`](packages/badge) | Small dot or large numeric/text badge. |
| [`@lit-material/divider`](packages/divider) | Horizontal or vertical, optionally inset. |
| [`@lit-material/tooltip`](packages/tooltip) | Plain tooltip, built on the native Popover API. |
| [`@lit-material/dialog`](packages/dialog) | Built on the native `<dialog>` element; about dialog for name, version and legal lines. |
| [`@lit-material/sheet`](packages/sheet) | Side sheet and bottom sheet; same native `<dialog>` foundation. |
| [`@lit-material/menu`](packages/menu) | Built on the native Popover API; app launcher for a top bar. |
| [`@lit-material/search`](packages/search) | Search bar and docked search view; view built on the native Popover API. |
| [`@lit-material/snackbar`](packages/snackbar) | Built on the native Popover API. |
| [`@lit-material/tabs`](packages/tabs) | `lit-material-tabs` + `lit-material-tab`. |
| [`@lit-material/top-app-bar`](packages/top-app-bar) | Center-aligned, small, medium, large. |
| [`@lit-material/navigation`](packages/navigation) | Navigation drawer, rail, and bottom bar — and adaptive navigation that picks one by window width. |
| [`@lit-material/progress`](packages/progress) | Linear and circular progress indicators, usage meter for quotas. |
| [`@lit-material/date-picker`](packages/date-picker) | Modal or docked date picker and date range picker. |
| [`@lit-material/time-picker`](packages/time-picker) | Clock-dial dialog, 12- or 24-hour. |
| [`@lit-material/autocomplete`](packages/autocomplete) | Text field with a filtered, data-driven option list. |
| [`@lit-material/accordion`](packages/accordion) | Expansion panels, single- or multi-expand. |
| [`@lit-material/stepper`](packages/stepper) | Wizard-progress indicator, horizontal or vertical, linear or free. |
| [`@lit-material/tree`](packages/tree) | Hierarchical expand-collapse list, single- or multi-select. |
| [`@lit-material/avatar`](packages/avatar) | Image, initials, or icon fallback. |
| [`@lit-material/skeleton`](packages/skeleton) | Loading placeholder — text, circular, rectangular, rounded. |
| [`@lit-material/rating`](packages/rating) | Star rating, native range input foundation, hover preview. |
| [`@lit-material/speed-dial`](packages/speed-dial) | Expandable FAB menu, built on the Popover API. |
| [`@lit-material/breadcrumbs`](packages/breadcrumbs) | Nav landmark showing the current page's place in a hierarchy. |
| [`@lit-material/toolbar`](packages/toolbar) | Grouped controls above a piece of content, with a trailing spacer. |
| [`@lit-material/panel`](packages/panel) | Generic content container with optional header/footer bands. |
| [`@lit-material/sidebar`](packages/sidebar) | Two-pane layout — fixed-width side panel next to flexible content. |
| [`@lit-material/page`](packages/page) | App-shell grid: header row plus a sidebar/main-content row. |
| [`@lit-material/drawer`](packages/drawer) | Non-modal, persistent overlay panel — e.g. a notification drawer. |
| [`@lit-material/description-list`](packages/description-list) | Metadata display — a set of term/description pairs. |
| [`@lit-material/data-list`](packages/data-list) | Flexible, multi-cell rows, optionally expandable. |
| [`@lit-material/simple-list`](packages/simple-list) | Plain, lightweight list of links or buttons. |
| [`@lit-material/alert`](packages/alert) | Persistent inline/page-level banner — distinct from the snackbar toast. |
| [`@lit-material/code-block`](packages/code-block) | Monospace code container with a copy button and optional truncation; editable code field with JSON check. |
| [`@lit-material/file-upload`](packages/file-upload) | Drag-and-drop or click-to-browse file picking, single or multiple. |
| [`@lit-material/timestamp`](packages/timestamp) | Absolute or live-updating relative date/time display. |
| [`@lit-material/popover`](packages/popover) | Richer, click-triggered overlay content — distinct from the tooltip. |
| [`@lit-material/icon`](packages/icon) | Sizing/colour wrapper for any icon; register an SVG set once and use icons by name. |
| [`@lit-material/overflow-menu`](packages/overflow-menu) | Responsive action row that collapses overflow into a kebab menu. |
| [`@lit-material/color-scheme`](packages/color-scheme) | Light/dark/system toggle, persisted, with a no-flash `<head>` snippet. |
| [`@lit-material/clipboard`](packages/clipboard) | `copyText()` with a plain-http fallback, copy button, read-only value with copy (optionally masked). |
| [`@lit-material/confirm`](packages/confirm) | `await confirm({...})`: destructive style, optional type-the-name-to-confirm. |
| [`@lit-material/truncate`](packages/truncate) | End or middle ellipsis for long IDs, hashes and paths; full text kept for copy and screen readers. |
| [`@lit-material/site-kit`](packages/site-kit) | Prerendered-site pieces that work before JS: FAQ on `<details>`, steps, terminal, keys, search dialog; theme, menu, search and reveal scripts. |
| [`@lit-material/back-to-top`](packages/back-to-top) | Appears after scrolling; returns to the top and moves focus there. |
| [`@lit-material/inline-edit`](packages/inline-edit) | Click-to-edit value: Enter saves, Escape cancels, async save with errors. |
| [`@lit-material/dual-list`](packages/dual-list) | Move items between available and chosen lists, with filters and full keyboard support. |
| [`@lit-material/sortable`](packages/sortable) | Reorder by pointer, touch or keyboard, within or between lists; announced to screen readers. |
| [`@lit-material/jump-links`](packages/jump-links) | "On this page" anchors that highlight the section in view; work without JS. |
| [`@lit-material/split-panel`](packages/split-panel) | Two panes with a draggable, keyboard-operable divider (WAI-ARIA window splitter). |
| [`@lit-material/format`](packages/format) | `formatBytes`, `formatNumber`, `formatDuration`, `formatCpu`, `parseQuantity` (Kubernetes) — locale-aware, no dependencies. |
| [`@lit-material/key-value`](packages/key-value) | Key/value rows for labels and env vars: duplicate/pattern checks, `KEY=value` paste. |
| [`@lit-material/status`](packages/status) | Icon + label coloured by state (ok, warning, error, info, neutral) — never colour alone. |
| [`@lit-material/stat`](packages/stat) | Dashboard tile: label, large tabular value, caption or trend. |
| [`@lit-material/empty-state`](packages/empty-state) | Headline, guidance and actions in place of a blank view. |
| [`@lit-material/diff`](packages/diff) | Line diff (unified or side by side) with folded context, changes by path, and a three-way merge view. |
| [`@lit-material/log-viewer`](packages/log-viewer) | Monospace line stream that follows the newest line, with pause, highlighting and a line cap. |
| [`@lit-material/table`](packages/table) | Data-driven semantic `<table>`: caption, headers, numeric and monospace columns. |
| [`@lit-material/chart`](packages/chart) | Line chart, bar chart and sparkline: crosshair tooltip, keyboard access, screen-reader table. |
| [`@lit-material/tokens`](packages/tokens) | Color, type, shape, elevation, and motion design tokens; opt-in typography classes for plain HTML. |

## Building a whole app

| Package | |
| --- | --- |
| [`@lit-material/router`](packages/router) | Path matching, an SPA route outlet, and a route-reading controller. |
| [`@lit-material/store`](packages/store) | A dependency-free, Redux-shaped state store. |
| [`@lit-material/core`](packages/core) | Ripple/focus-ring controllers, `LocalizeController` (messages, plurals, `isRtl`), plus `themeContext`/`localeContext`. |
| [`@lit-material/translations`](packages/translations) | Catalogs for the components' own text: Arabic, German, Spanish, French, Japanese, Polish, Ukrainian (English is built in). |
| [`@lit-material/task`](packages/task) | A reactive controller for async work (data fetching). |
| [`@lit-material/form`](packages/form) | A reactive controller tracking a `<form>`'s aggregate validity. |
| [`create-lit-material-app`](packages/create-lit-material-app) | `npm create lit-material-app` — a scaffolded starting point with all of the above wired together. |

The docs app's "Building apps" guide (`apps/docs`, `/guide/building-apps` — see below) walks through all six
wired together in one example, including data fetching, form validation, and i18n.

## Docs site

**[lit.rws8.tech](https://lit.rws8.tech/)**: every component's live demo, install line, gzipped size and
API tables, the theme builder and the guides. The site is [`apps/site`](apps/site), prerendered with Lit SSR
and served by rws; [`apps/site/deploy`](apps/site/deploy) has the deploy script. Old
`bohdaq.github.io/lit-material/*` links redirect there. Run it locally:

```sh
pnpm install && pnpm build && pnpm analyze
pnpm --filter @lit-material/site run build:site && pnpm --filter @lit-material/site preview
```

## Development

This is a pnpm + Turborepo monorepo (`packages/*` for published packages, `apps/*` for the docs site and a
private app-shell demo).

```sh
pnpm install
pnpm build        # turbo run build
pnpm test         # turbo run test — unit + SSR tests per package
pnpm lint         # eslint . — one root-level flat config across every package
pnpm typecheck    # turbo run typecheck
pnpm analyze      # turbo run analyze — regenerates each component's custom-elements.json
pnpm dev          # turbo run dev --parallel
```

Releases go through [Changesets](https://github.com/changesets/changesets) and GitHub Actions: add a
changeset with `pnpm changeset` and push. The [Release workflow](.github/workflows/release.yml) opens a
"Version packages" pull request; merging it publishes the bumped packages to npm with
[trusted publishing](https://docs.npmjs.com/trusted-publishers) (no npm token in the repo, provenance
attached) and pushes the tags.

The workflow skips a package that isn't on npm yet and names it in a warning. Run
`tools/first-publish.sh <dir>` (logged in to npm): it publishes a `0.0.0-init` placeholder, trusts the
workflow for it and re-runs the workflow, which publishes the real version. That CI publish matters: npm
expires a trust that no publish has used within 48 h. Check with
`npx npm@12.2.1 trust list <package>`: it should show `file: release.yml`.

If the workflow fails with `E404 … PUT https://registry.npmjs.org/@lit-material%2f<name>`, that package has no
trusted publisher: run the script for it and re-run the workflow (`gh workflow run release.yml`). A failed run
pushes no tags for the packages that did publish; tag those at the "Version packages" commit by hand
(`git tag @lit-material/<name>@<version> <sha> && git push origin <tag>`).

## Using this repo with AI

This repo ships an [`llms.txt`](llms.txt) at its root — the emerging convention
([llmstxt.org](https://llmstxt.org/)) for giving AI assistants and coding agents a curated, structured map of a
project (every package, one line each, with links) instead of making them crawl the whole tree to figure out
what exists. Point an AI tool at this repo's `llms.txt` — or just paste its contents in — for a fast, accurate
orientation before asking it to add a component, wire up an app-shell primitive, or explain how something here
works.

## License

[MIT](LICENSE)
