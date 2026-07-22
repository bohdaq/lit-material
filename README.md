# lit-material

A [Material Design 3](https://m3.material.io/) web component collection built with [Lit](https://lit.dev/) —
one package per component, no shared mega-bundle, no required adapter layer. Framework-agnostic, SSR-ready,
and small enough to actually read the source of.

- **37 components**, each its own npm package — install only what you use.
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
- **No required adapter layer.** Because these are just Custom Elements, there's no React/Vue/Angular wrapper
  package standing between you and the component — use it directly from any of them.
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
| [`@lit-material/button`](packages/button) | Filled, outlined, text, elevated, tonal. |
| [`@lit-material/icon-button`](packages/icon-button) | Standard + toggle variants. |
| [`@lit-material/fab`](packages/fab) | Floating action button. |
| [`@lit-material/text-field`](packages/text-field) | Filled + outlined, validation states. |
| [`@lit-material/checkbox`](packages/checkbox) | Checked, indeterminate, error, form participation. |
| [`@lit-material/radio`](packages/radio) | Grouped selection, error, form participation. |
| [`@lit-material/switch`](packages/switch) | On/off toggle, optional thumb icons, form participation. |
| [`@lit-material/slider`](packages/slider) | Single value, native `<input type="range">`-based. |
| [`@lit-material/select`](packages/select) | `lit-material-select` + `lit-material-select-option`. |
| [`@lit-material/chip`](packages/chip) | Assist, filter, input, suggestion variants. |
| [`@lit-material/segmented-button`](packages/segmented-button) | Single-select or multi-select connected button row. |
| [`@lit-material/card`](packages/card) | Elevated, filled, outlined; optionally interactive. |
| [`@lit-material/carousel`](packages/carousel) | Scroll-snap based, with overlaid nav buttons. |
| [`@lit-material/list`](packages/list) | `lit-material-list` + `lit-material-list-item`. |
| [`@lit-material/data-table`](packages/data-table) | Sortable, selectable, paginated, resizable, virtualized. |
| [`@lit-material/badge`](packages/badge) | Small dot or large numeric/text badge. |
| [`@lit-material/divider`](packages/divider) | Horizontal or vertical, optionally inset. |
| [`@lit-material/tooltip`](packages/tooltip) | Plain tooltip, built on the native Popover API. |
| [`@lit-material/dialog`](packages/dialog) | Built on the native `<dialog>` element. |
| [`@lit-material/sheet`](packages/sheet) | Side sheet and bottom sheet; same native `<dialog>` foundation. |
| [`@lit-material/menu`](packages/menu) | Built on the native Popover API. |
| [`@lit-material/search`](packages/search) | Search bar and docked search view; view built on the native Popover API. |
| [`@lit-material/snackbar`](packages/snackbar) | Built on the native Popover API. |
| [`@lit-material/tabs`](packages/tabs) | `lit-material-tabs` + `lit-material-tab`. |
| [`@lit-material/top-app-bar`](packages/top-app-bar) | Center-aligned, small, medium, large. |
| [`@lit-material/navigation`](packages/navigation) | Navigation drawer, rail, and bottom bar. |
| [`@lit-material/progress`](packages/progress) | Linear and circular progress indicators. |
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
| [`@lit-material/tokens`](packages/tokens) | Color, type, shape, elevation, and motion design tokens. |

## Building a whole app

| Package | |
| --- | --- |
| [`@lit-material/router`](packages/router) | Path matching, an SPA route outlet, and a route-reading controller. |
| [`@lit-material/store`](packages/store) | A dependency-free, Redux-shaped state store. |
| [`@lit-material/core`](packages/core) | Ripple/focus-ring controllers, plus `themeContext`/`localeContext`. |
| [`@lit-material/task`](packages/task) | A reactive controller for async work (data fetching). |
| [`@lit-material/form`](packages/form) | A reactive controller tracking a `<form>`'s aggregate validity. |
| [`create-lit-material-app`](packages/create-lit-material-app) | `npm create lit-material-app` — a scaffolded starting point with all of the above wired together. |

The docs app's "Building apps" guide (`apps/docs`, `/guide/building-apps` — see below) walks through all six
wired together in one example, including data fetching, form validation, and i18n.

## Docs site

**[bohdaq.github.io/lit-material](https://bohdaq.github.io/lit-material/)** — every component's live playground
and API table, the theme builder, and the guides above. Deployed on push to `main` via
[`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml). Or run it locally:

```sh
pnpm install
pnpm --filter @lit-material/docs dev
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

Releases go through [Changesets](https://github.com/changesets/changesets): `pnpm changeset` to describe a
change, `pnpm version` to apply it, `pnpm release` to build, regenerate manifests, and publish.

## Using this repo with AI

This repo ships an [`llms.txt`](llms.txt) at its root — the emerging convention
([llmstxt.org](https://llmstxt.org/)) for giving AI assistants and coding agents a curated, structured map of a
project (every package, one line each, with links) instead of making them crawl the whole tree to figure out
what exists. Point an AI tool at this repo's `llms.txt` — or just paste its contents in — for a fast, accurate
orientation before asking it to add a component, wire up an app-shell primitive, or explain how something here
works.

## License

[MIT](LICENSE)
