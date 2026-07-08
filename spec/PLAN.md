# lit-material — Project Plan

A Material Design 3 web component collection built with [Lit](https://lit.dev/), published as independently
installable, framework-agnostic packages.

## 1. Positioning

Google's own Lit-based MD3 implementation, `@material/web`, is effectively stalled: per the maintainers'
[own announcement](https://github.com/material-components/material-web/discussions/5642), the team was
reassigned to Google's internal Wiz framework, no new components/features are planned, and external PRs are
largely not being accepted pending new maintainers. It isn't deleted or archived, but it is not a moving
target — which is an opening rather than a blocker. `lit-material` picks up where it left off, rather than
trying to out-feature a library at full velocity. Proposed differentiators:

- **Actively maintained MD3 surface**: track Material Design spec updates, browser platform changes
  (Popover API, `:has()`, CSS anchor positioning, `ElementInternals`), and Lit releases that `@material/web`
  is unlikely to adopt while in maintenance mode.
- **Radical tree-shakeability**: one package per component, no shared mega-bundle, no required "adapter" layer.
- **Token-first theming**: every visual property flows through CSS custom properties generated from a single
  design-token source (style-dictionary), so theming doesn't require subclassing or `::part` overrides for the
  common case.
- **Small, opinionated core set** done well (accessibility, keyboard nav, RTL, dark mode) rather than chasing
  100% MD3 spec coverage from day one.
- **First-class SSR/hydration story** (Lit SSR) — a gap in a lot of community web-component libraries.
- **Own the docs site as a dogfood project**: the documentation site is itself built with `lit-material`
  components, styled as a live catalog + playground (like Storybook, but zero React dependency).
- **Open to contributions by design**: clear CONTRIBUTING.md, good-first-issue labeling, and a review SLA —
  explicitly the thing `@material/web` currently can't offer.

## 2. Scope — Phase 1 core set

Ship these components first, to production quality (a11y, RTL, dark mode, keyboard nav, tests, docs) before
expanding:

| Component | Notes |
|---|---|
| Button | filled, outlined, text, elevated, tonal variants |
| Icon Button | toggle + standard |
| Text Field | filled + outlined, validation states |
| Checkbox | indeterminate state |
| Radio | radio group behavior |
| Switch | |
| Chip | assist, filter, input, suggestion |
| Card | elevated, filled, outlined |
| List / List Item | single/multi-select, leading/trailing slots |
| Dialog | modal, focus trap |
| Menu | positioning via Floating UI or Popover API |
| Snackbar | queueing, auto-dismiss |

Later phases (not detailed yet, tracked as backlog): Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail,
Progress Indicators, FAB, Badge, Divider, Tooltip, Data Table, Date Picker.

## 3. Architecture

### 3.1 Repo structure — monorepo, per-component packages

```
lit-material/
├─ packages/
│  ├─ button/                # @lit-material/button
│  ├─ icon-button/
│  ├─ text-field/
│  ├─ checkbox/
│  ├─ radio/
│  ├─ switch/
│  ├─ chip/
│  ├─ card/
│  ├─ list/
│  ├─ dialog/
│  ├─ menu/
│  ├─ snackbar/
│  ├─ core/                  # @lit-material/core — shared base classes, mixins, a11y helpers, ripple, focus-ring
│  └─ tokens/                 # @lit-material/tokens — design tokens (style-dictionary source + generated CSS/JS)
├─ apps/
│  └─ docs/                   # documentation + live playground site (Vite + lit-material itself)
├─ tools/
│  └─ eslint-config, tsconfig-base, cem-config (custom-elements-manifest)
├─ .changeset/
├─ pnpm-workspace.yaml
└─ turbo.json                 # or nx.json — task orchestration/caching across packages
```

Each component package:
- Depends on `@lit-material/core` and `@lit-material/tokens`.
- Exports a single custom element (or a small tightly-related family, e.g. radio + radio-group).
- Ships pre-built ESM (and a `dev` build with dev-mode warnings, matching Lit's own convention).

### 3.2 Tech stack

| Concern | Choice | Why |
|---|---|---|
| Component base | Lit 3.x + TypeScript (strict) | The whole point of the project |
| Package manager / workspaces | pnpm | Fast, disk-efficient, strong workspace protocol support |
| Task runner / caching | Turborepo | Simple config, good enough for this repo's size; revisit Nx if graph complexity grows |
| Design tokens | Style Dictionary → CSS custom properties + TS constants | Single source of truth, matches MD3's own token model |
| Positioning (menu/tooltip/select) | Floating UI | Battle-tested, framework-agnostic |
| Testing | @open-wc/testing + Web Test Runner (unit/a11y), Playwright (visual regression, cross-browser) | Standard for web-component ecosystem |
| Linting/formatting | ESLint (lit plugin) + Prettier | |
| Docs metadata | custom-elements-manifest + `@custom-elements-manifest/analyzer` | Powers docs site + IDE autocomplete for consumers |
| Docs site | Vite + lit-material components | Dogfooding, no framework lock-in |
| Versioning/release | Changesets | Independent semver per package, good monorepo changelog story |
| CI | GitHub Actions | Lint, typecheck, test, build, size-limit check, publish on merge to main via Changesets bot |

### 3.3 Theming model

- Base layer: MD3 reference tokens (`--md-sys-color-primary`, `--md-sys-typescale-*`, etc.) generated from
  `packages/tokens`, matching Material's own naming so consumers can port existing MD3 theme JSON.
  Include a build step or CLI to generate a theme from a single seed color (Material You dynamic color
  algorithm), producing a CSS file consumers drop in.
- Component layer: each component maps its internal styles to system tokens with a thin, component-scoped
  custom-property layer (e.g. `--lit-material-button-container-color`) so overriding one button doesn't
  require touching global tokens.
- Dark mode: `prefers-color-scheme` by default, override via a `color-scheme` attribute/class on a root
  element.

### 3.4 Shared core (`@lit-material/core`)

- Base class/mixin providing: focus-ring behavior, ripple effect, form-association (`ElementInternals` /
  `formAssociated`), RTL-aware directionality helpers.
- Shared a11y utilities: roving tabindex controller, aria-activedescendant helpers, id generation.
- Reactive controllers over inheritance where it composes better (Lit's recommended pattern).

## 4. Quality bar (applies to every component before it ships)

- Keyboard interaction matches the [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) pattern for that widget.
- Works with `dir="rtl"`.
- Respects `prefers-color-scheme` and `prefers-reduced-motion`.
- Form-associated where applicable (works inside native `<form>`, participates in validation/`FormData`).
- Unit tests (behavior) + at least one axe-core a11y test + one Playwright visual snapshot.
- Documented on the docs site with live playground + API table (auto-generated from CEM).

## 5. Milestones

1. **Bootstrap** — pnpm/turborepo scaffold, tsconfig/eslint/prettier shared configs, empty `core` and `tokens`
   packages, CI skeleton (install/lint/typecheck), Changesets configured, repo published to GitHub.
2. **Tokens v0** — MD3 color/type/shape/elevation/motion tokens generated via Style Dictionary; dark mode +
   seed-color theme generator CLI.
3. **Core primitives** — ripple, focus-ring, roving-tabindex controller, form-association mixin, RTL helpers,
   with their own unit tests.
4. **First vertical slice: Button** — full quality bar end-to-end (implementation, tests, docs entry) to prove
   out the whole pipeline before parallelizing across components.
5. **Remaining Phase 1 components** — Icon Button, Checkbox, Radio, Switch, Text Field, Chip, Card, List,
   Dialog, Menu, Snackbar (can parallelize once the Button slice validates the pattern).
6. **Docs site v1** — component catalog, live playground, theme builder page, installation guide.
7. **v0.1.0 public release** — publish all Phase 1 packages to npm under `@lit-material/*`, announce.
8. **Phase 2 planning** — revisit backlog (Select, Slider, Tabs, Navigation, Data Table, Date Picker, etc.)
   based on adoption feedback.

## 6. Open questions (revisit as the project matures)

- npm scope availability: confirm `@lit-material` is free, or pick an alternate scope.
- Nx vs Turborepo: Turborepo chosen for simplicity; revisit if cross-package codegen needs grow.
- Whether to offer React/Vue/Angular wrapper packages (common ask for web-component libraries) — defer until
  after v0.1.0 based on demand.
- License: MIT recommended for an OSS component library (matches Lit's own license); confirm with user.
- Migration path from `@material/web`: since it's in maintenance mode but still widely installed, consider a
  docs page mapping its components/attributes to `lit-material` equivalents to ease adoption for teams
  looking to switch.
- Watch `material-components/material-web` discussion #5642 for a change in maintainer status — if Google
  resumes active development, re-evaluate whether to position as complementary vs. competing.
