# lit-material — Project Plan

A Material Design 3 web component collection built with [Lit](https://lit.dev/), published as independently
installable, framework-agnostic packages.

## 0. Status (as of 2026-07-13)

**All 12 Phase 1 components are implemented, tested, screenshot-documented, and merged to `main`** —
Button, Icon Button, Text Field, Checkbox, Radio, Switch, Chip, Card, List/List Item, Dialog, Menu, Snackbar
— plus the `core` (ripple/focus-ring controllers) and `tokens` (MD3 CSS custom properties) packages they
depend on. Every component has unit + SSR tests and at least one axe-core accessibility test; the docs app
(`apps/docs`) demos every variant/state of every component and is the source of each package's README
screenshot. See section 2 for per-component detail and section "Deviations from the original plan" below for
where the actual build diverged from what this document originally proposed.

**Not yet done, in priority order:**
1. **Publish the pending versions.** `button`, `icon-button`, `checkbox`, `radio`, `switch`, `chip` have an
   unpublished `0.0.2` on `main` (fixes a ripple press-feedback bug — see their CHANGELOG-equivalent commit
   `219814d`) but npm still serves `0.0.1` for all six. `snackbar` has never been published at all. `card`,
   `list`, `dialog`, `menu` are published and current.
2. **Tooling gaps**: no CI (`.github/workflows` doesn't exist), no ESLint config, no Changesets, no
   custom-elements-manifest generation. The plan called for all four; none exist yet, so releases and
   contributions are still fully manual.
3. **Unverified quality-bar items**: RTL (`dir="rtl"`) has not been explicitly tested on any component;
   `prefers-reduced-motion` is handled per-component (each has a media query) but not tested; dark mode relies
   entirely on the token layer's `prefers-color-scheme` values and hasn't been visually verified end-to-end.
4. **Docs site is a single static catalog page**, not the "live playground + theme builder" section 3.1/
   milestone 6 envisioned — no per-component pages, no interactive prop editing, no seed-color theme
   generator.
5. **Phase 2 backlog untouched**: Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail, Progress
   Indicators, FAB, Badge, Divider, Tooltip, Data Table, Date Picker.

### Deviations from the original plan

- **Menu positioning uses the native Popover API + hand-rolled viewport-flip math, not Floating UI** (section
  3.2 named Floating UI as the choice). Popover API alone was sufficient for anchor positioning once
  `showPopover()`/`:popover-open` were verified to work correctly on a custom-element host with a shadow root;
  pulling in Floating UI as a dependency was never actually necessary. Dialog and Snackbar also build on the
  Popover API (`auto` and `manual` modes respectively) rather than custom overlay logic.
- **Not every component is form-associated.** Chip, Card, List Item, Menu, and Snackbar deliberately have no
  `ElementInternals`/`formAssociated` — they're auxiliary UI (filters, action triggers, floating overlays,
  notifications), not form values, matching how Material Design itself treats them. Button, Icon Button, Text
  Field, Checkbox, Radio, and Switch are form-associated. Card and List Item's *interactive* mode still
  participates in ancestor forms via `type="submit"/"reset"`, reusing Button's exact ElementInternals pattern.
- **List and List Item ship as one package** (`@lit-material/list`), not two, since a list item is meaningless
  outside a list and vice versa — matching how `@material/web` itself bundles its list module.

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

| Component | Notes | Status | npm |
|---|---|---|---|
| Button | filled, outlined, text, elevated, tonal variants | ✅ Done | 0.0.1 published; 0.0.2 (ripple fix) pending |
| Icon Button | toggle + standard | ✅ Done | 0.0.1 published; 0.0.2 (ripple fix) pending |
| Text Field | filled + outlined, validation states | ✅ Done | 0.0.1 published |
| Checkbox | indeterminate state | ✅ Done | 0.0.1 published; 0.0.2 (ripple fix) pending |
| Radio | radio group behavior (mutual exclusion + roving tabindex implemented in JS; native radios don't group across shadow roots) | ✅ Done | 0.0.1 published; 0.0.2 (ripple fix) pending |
| Switch | | ✅ Done | 0.0.1 published; 0.0.2 (ripple fix) pending |
| Chip | assist, filter, input, suggestion; not form-associated | ✅ Done | 0.0.1 published; 0.0.2 (ripple fix) pending |
| Card | elevated, filled, outlined; optionally interactive (button/link) | ✅ Done | 0.0.1 published |
| List / List Item | one package; leading/trailing slots, optionally interactive | ✅ Done | 0.0.1 published |
| Dialog | native `<dialog>`-based, modal, focus trap via the browser | ✅ Done | 0.0.1 published |
| Menu | native Popover API (`auto`) + hand-rolled positioning; items are List Item, reused | ✅ Done | 0.0.1 published |
| Snackbar | native Popover API (`manual`); auto-dismiss, hover/focus pause, queueing left to the caller (reuse one instance) | ✅ Done | not yet published |

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

**As built**, `core` only ships `RippleController` and `FocusRingController` as reactive controllers (the
inheritance-vs-controllers call was made in favor of controllers, per the plan). Form-association
(`attachInternals()`/`formAssociated`) is *not* centralized — each form-associated component implements it
directly, since the actual `setFormValue`/validity logic differs enough per component (a single input's
validity vs. Radio's group-aware `required`) that a shared base class didn't pull its weight. Likewise, no
shared roving-tabindex controller exists yet: Radio's group navigation and Menu's item navigation each
implement their own (similar but not identical) version. If a fourth component needs the same pattern,
extracting a shared controller at that point would be the right call — revisit rather than doing it
speculatively.

## 4. Quality bar (applies to every component before it ships)

- Keyboard interaction matches the [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) pattern for that widget.
- Works with `dir="rtl"`.
- Respects `prefers-color-scheme` and `prefers-reduced-motion`.
- Form-associated where applicable (works inside native `<form>`, participates in validation/`FormData`).
- Unit tests (behavior) + at least one axe-core a11y test + one Playwright visual snapshot.
- Documented on the docs site with live playground + API table (auto-generated from CEM).

## 5. Milestones

1. ~~**Bootstrap**~~ — done: pnpm workspace, shared tsconfig, Turborepo (`turbo.json`, wired to `build`/`test`/
   `typecheck`) all in place. Missing: Changesets, CI (no `.github/workflows`), ESLint config.
2. ~~**Tokens v0**~~ — done for color/type/shape/elevation/motion CSS custom properties. No Style Dictionary
   build step and no seed-color theme generator CLI — tokens are hand-authored CSS, not generated.
3. **Core primitives** — done for ripple + focus-ring (see 3.4 for why form-association and roving-tabindex
   weren't centralized as originally scoped).
4. ~~**First vertical slice: Button**~~ — done, and the pattern it validated (variant prop, ripple/focus-ring
   via core, `ElementInternals` for submit/reset, README screenshot from a live docs demo) held up across all
   11 components that followed it.
5. ~~**Remaining Phase 1 components**~~ — done. All 12 components listed in section 2 are implemented, tested,
   and documented.
6. **Docs site v1** — partially done. The catalog exists (every component, every variant/state, on one page)
   and *is* the screenshot source for each README, but there's no live playground (editable props), no theme
   builder, and no installation guide beyond each package's own README.
7. **v0.1.0 public release** — not done. 11 of 12 packages are on npm, but at inconsistent versions relative to
   `main` (see section 0) and there's been no formal `v0.1.0` tag/announcement across the set.
8. **Phase 2 planning** — not started.

### Immediate next steps (concrete, in order)

1. Publish `@lit-material/snackbar` (never published) and republish `button`, `icon-button`, `checkbox`,
   `radio`, `switch`, `chip` at their already-bumped `0.0.2` (ripple fix on `main`, not yet on npm).
2. Add the still-missing tooling section 3.2 calls for: CI (GitHub Actions running `turbo run lint typecheck
   test build`), Changesets (for coordinated per-package versioning — would have caught the six-package
   version drift in item 1 automatically), and an ESLint config. Turborepo itself is already in place.
3. Pick one component and verify the unverified quality-bar items (RTL, `prefers-reduced-motion`, dark mode)
   end-to-end, to find out whether they already work by virtue of using system tokens/logical CSS properties,
   or need real fixes — then decide whether to roll that fix/verification pass across all 12 components.
4. Only after 1–3: start Phase 2 component selection.

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
