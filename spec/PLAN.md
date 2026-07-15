# lit-material — Project Plan

A Material Design 3 web component collection built with [Lit](https://lit.dev/), published as independently
installable, framework-agnostic packages.

## 0. Status (as of 2026-07-15)

**App-shell primitives added**: `@lit-material/store` (a dependency-free, Redux-shaped state store plus a
`StoreController` reactive controller) and `@lit-material/router` (dependency-free path matching, an SPA
`<lit-material-router-outlet>` that intercepts same-origin link clicks, and a `RouteController` for reading
the current route without owning an outlet) are new packages, both published to npm at `0.0.1`.
`@lit-material/core` gained a `themeContext` (built on the standard `@lit/context` protocol) rather than a new
`@lit-material/context` package — see section 3.5 for why, and `spec/BUILDING_APPS.md` for all three wired
together in one example, plus `apps/app-shell-demo` (private, unpublished) for a runnable version. This closes
the gap between "a component library" and "something you can build a whole app with" — the `lit-material`
equivalents of the router/context/Redux trio a React app typically reaches for.
**`@lit-material/core`'s local version (`0.0.2`, with the new `themeContext`) has not been published yet** —
npm still serves `0.0.1` without it; see "Not yet done" #3 below.

**Docs site v1 done**: `apps/docs` is now a real multi-page site on `@lit-material/router` instead of one
static HTML page — a persistent sidebar (`apps/docs/src/app-shell.ts`, `route-manifest.ts`), an install guide
at `/`, one routed page per component at `/components/:slug` (all 24, migrated from the old single page with
no loss of demo coverage), a live playground (`<docs-playground>`, editable props + generated-markup preview)
on the 16 attribute/variant-driven pages, and a theme builder at `/theme` (seed color → full MD3 scheme via
`@material/material-color-utilities`, live component preview, "Copy CSS"). This closes milestone 6 and the
"Not yet done" docs-site gap this document tracked for a while — see milestone 6 below for detail.

**Every component originally scoped for Phase 1 and Phase 2 is implemented, tested, merged to `main`, and
published to npm** — the 12 Phase 1 components, Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail,
Progress Indicators, FAB, Badge, Tooltip, Data Table, Date Picker, and Divider (Divider was the last of these;
committed and published to npm `0.0.1` since the last pass over this document). All have unit + SSR tests and
at least one axe-core accessibility test; the docs app (`apps/docs`) demos every variant/state and is the
source of each package's README screenshot. Of the 28 packages in `packages/`, all are published to npm with
correctly resolved dependencies (no `workspace:*` protocol strings leaking into published manifests) — two are
stale: local `@lit-material/core` is `0.0.2` (adds `themeContext`) and local `@lit-material/button` is `0.0.2`,
but npm still serves `0.0.1` for both (see "Not yet done" #3). See section 2 for per-component detail and
section "Deviations from the original plan" below for where the actual build diverged from what this document
originally proposed.

**Not yet done, in priority order:**
1. **Tooling gaps**: no CI (`.github/workflows` doesn't exist), no ESLint config, no Changesets, no
   custom-elements-manifest generation. The plan called for all four; none exist yet, so releases and
   contributions are still fully manual.
2. **Unverified quality-bar items**: RTL (`dir="rtl"`) has not been explicitly tested on any component;
   `prefers-reduced-motion` is handled per-component (each has a media query) but not tested; dark mode relies
   entirely on the token layer's `prefers-color-scheme` values and hasn't been visually verified end-to-end.
3. **Publish outstanding versions**: `@lit-material/core` (`0.0.2`, adds `themeContext` — currently invisible
   to anyone installing from npm) and `@lit-material/button` (`0.0.2`, version bumped but never republished,
   pre-dating this session's work) both need a republish.
4. **App-shell follow-ups** (deliberately out of scope for the router/store/context work in 3.5): a
   data-fetching/async-task controller, forms/validation helpers beyond individual form-associated components,
   `@lit/localize` i18n integration, and a `create-lit-material-app` CLI/starter.

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
- **Select, Slider, and Tabs were pulled forward from the Phase 2 backlog** ahead of finishing the Phase 1
  cleanup items (npm republish, CI/tooling, RTL/reduced-motion/dark-mode verification) — built in the order
  the user actually requested them, rather than strictly Phase 1 before Phase 2. Select is a listbox-pattern
  combobox built on the native Popover API (same foundation as Menu); Slider wraps a real
  `<input type="range">` rather than reimplementing drag/keyboard handling; Tabs follows the WAI-ARIA tabs
  pattern with automatic activation and deliberately has no tabpanel management — it only tracks selection
  and fires `change`, leaving panel rendering to the consumer.

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
| Button | filled, outlined, text, elevated, tonal variants | ✅ Done | 0.0.1 published |
| Icon Button | toggle + standard | ✅ Done | 0.0.2 published |
| Text Field | filled + outlined, validation states | ✅ Done | 0.0.2 published |
| Checkbox | indeterminate state | ✅ Done | 0.0.2 published |
| Radio | radio group behavior (mutual exclusion + roving tabindex implemented in JS; native radios don't group across shadow roots) | ✅ Done | 0.0.2 published |
| Switch | | ✅ Done | 0.0.2 published |
| Chip | assist, filter, input, suggestion; not form-associated | ✅ Done | 0.0.2 published |
| Card | elevated, filled, outlined; optionally interactive (button/link) | ✅ Done | 0.0.2 published |
| List / List Item | one package; leading/trailing slots, optionally interactive | ✅ Done | 0.0.2 published |
| Dialog | native `<dialog>`-based, modal, focus trap via the browser | ✅ Done | 0.0.2 published |
| Menu | native Popover API (`auto`) + hand-rolled positioning; items are List Item, reused | ✅ Done | 0.0.2 published |
| Snackbar | native Popover API (`manual`); auto-dismiss, hover/focus pause, queueing left to the caller (reuse one instance) | ✅ Done | 0.0.2 published |

Pulled forward from Phase 2 backlog:

| Component | Notes | Status | npm |
|---|---|---|---|
| Select | listbox-pattern combobox (select-only), native Popover API, same foundation as Menu | ✅ Done | 0.0.2 published |
| Slider | wraps a native `<input type="range">`, custom track/thumb visuals, value bubble | ✅ Done | 0.0.2 published |
| Tabs | WAI-ARIA tabs pattern, automatic activation, sliding indicator; no tabpanel management (scope cut) | ✅ Done | 0.0.2 published |
| Top App Bar | center-aligned, small, medium, large variants | ✅ Done | 0.0.2 published |
| Navigation Drawer / Rail | one package (`@lit-material/navigation`), matching the List/List Item precedent | ✅ Done | 0.0.1 published |
| Progress Indicators | linear + circular, one package (`@lit-material/progress`) | ✅ Done | 0.0.1 published |
| FAB | floating action button | ✅ Done | 0.0.1 published |

Also done, picked off the Phase 2 backlog in the order this document originally suggested:

| Component | Notes | Status | npm |
|---|---|---|---|
| Badge | small dot or large numeric/text badge | ✅ Done | 0.0.1 published |
| Tooltip | plain, hover/focus-driven, native Popover API (`manual` mode) | ✅ Done | 0.0.1 published |
| Data Table | sortable columns, single/multi-select rows, dense/comfortable density | ✅ Done | 0.0.1 published |
| Date Picker | calendar-grid dialog (modal), single-date scope | ✅ Done | 0.0.1 published |
| Divider | Full-bleed + inset variants, horizontal (and vertical for use inside Navigation Rail/List). Styling only — `role="separator"`, no interactive/keyboard behavior, no form association. | ✅ Done | 0.0.1 published |

No remaining backlog — every component originally scoped for Phase 1 and Phase 2 is now built.

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
│  ├─ select/
│  ├─ slider/
│  ├─ tabs/
│  ├─ top-app-bar/
│  ├─ navigation/            # drawer + rail, one package
│  ├─ progress/               # linear + circular, one package
│  ├─ fab/
│  ├─ badge/
│  ├─ tooltip/
│  ├─ data-table/
│  ├─ date-picker/
│  ├─ divider/
│  ├─ core/                  # @lit-material/core — shared base classes, mixins, a11y helpers, ripple, focus-ring, theme context
│  ├─ tokens/                 # @lit-material/tokens — design tokens (style-dictionary source + generated CSS/JS)
│  ├─ store/                  # @lit-material/store — Redux-shaped state store + StoreController
│  └─ router/                 # @lit-material/router — path matching, route outlet, RouteController
├─ apps/
│  ├─ docs/                   # documentation site — router, per-component pages, playground, theme builder
│  └─ app-shell-demo/         # private, unpublished — router+store+theme context wired together, runnable
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

### 3.5 App-shell primitives (router / store / context)

Added so `lit-material` can be used to build whole applications, not just individual components — the
`lit-material` equivalents of the router/context/Redux trio a React app typically reaches for. Three
decisions, recorded here so they aren't re-litigated:

- **Separate packages (`@lit-material/router`, `@lit-material/store`), not one bundled `@lit-material/app`.**
  Matches the "one package per concern, no required adapter layer" precedent this repo already follows for
  components (section 1).
- **No `@lit-material/context` package.** `@lit/context` (the Lit team's own, stable, non-`labs`
  implementation of the W3C Community Context Protocol) is already the right dependency-free choice — wrapping
  it in a `@lit-material/context` package that just re-exports `createContext`/`ContextProvider`/`consume`
  would be exactly the "required adapter layer" this repo avoids, for no added value. Instead
  `@lit-material/core` depends on `@lit/context` directly and ships one real, opinionated context —
  `themeContext` (dark/light + seed color) — since that's the one cross-cutting value nearly every MD3 app
  needs threaded through a tree. Anything app-specific: install `@lit/context` yourself and call
  `createContext` directly, same as you would in any other Lit app.
- **`@lit-material/router` is hand-rolled, not `@lit-labs/router`.** `@lit-labs/router` is genuinely `labs`
  (unstable API) and needs a `urlpattern-polyfill` dependency for full `URLPattern` matching. Same reasoning
  that dropped Floating UI once the Popover API alone proved sufficient (see "Deviations" above): a router
  only needs simple `/users/:id`-style segment matching, not full `URLPattern` semantics, so
  `@lit-material/router`'s `matchRoute` is ~50 lines of dependency-free string-segment matching instead.
  `@lit-material/router` is also the one package that isn't SSR-safe (routing needs `window.history`/
  `location`) — don't import it from an SSR entry point.
- **`@lit-material/store`'s `createStore` mirrors Redux's exact shape** (`getState`/`dispatch`/`subscribe`,
  driven by a pure reducer) without depending on `redux` itself — ~30 lines without it. `StoreController`
  follows the same reactive-controller pattern as `RippleController`/`FocusRingController` (constructor takes
  `host`, `hostConnected`/`hostDisconnected` manage the subscription, `requestUpdate()` only when the
  *selected* slice of state changes).

See `spec/BUILDING_APPS.md` for all three wired together in one example, and each package's own README for
full API detail.

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
6. ~~**Docs site v1**~~ — done: `apps/docs` is a real multi-page site (`@lit-material/router`, one page per
   component at `/components/:slug`, all 24 migrated from the old single-page catalog with no coverage lost),
   a live playground (`<docs-playground>`) on the 16 attribute/variant-driven pages, a theme builder at
   `/theme` (`@material/material-color-utilities` seed-color → full MD3 scheme, live preview, "Copy CSS"), and
   an install guide at `/`. Each package's README `screenshot.png` is still sourced from the docs app, just
   from that component's own focused page now instead of a shared page's section.
7. ~~**v0.1.0 public release (package publishing)**~~ — done: all 28 packages (all components plus
   `core`/`tokens`, plus the two new `router`/`store` app-shell packages) are live on npm with correctly
   resolved dependencies (no `workspace:*` leaking into published manifests). `core` and `button` are
   published but each have a local version ahead of what's published (see "Not yet done" #3 in section 0). No
   formal `v0.1.0` git tag/announcement has been made across the set yet.
8. ~~**Phase 2 planning**~~ — done: Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail, Progress
   Indicators, FAB, Badge, Tooltip, Data Table, Date Picker, and Divider all built (see section 2), chosen by
   direct request rather than a prioritization exercise — every component from the original Phase 1/2 scope
   now exists.
9. ~~**App-shell primitives**~~ — done: `@lit-material/router` and `@lit-material/store`, plus a `themeContext`
   addition to `@lit-material/core` (see section 3.5 and `spec/BUILDING_APPS.md`).

### Immediate next steps (concrete, in order)

1. Publish `@lit-material/core@0.0.2` (adds `themeContext`) and `@lit-material/button@0.0.2` — both have a
   local version ahead of npm.
2. Add the still-missing tooling section 3.2 calls for: CI (GitHub Actions running `turbo run lint typecheck
   test build`), Changesets (for coordinated per-package versioning), and an ESLint config. Turborepo itself
   is already in place.
3. Pick one component and verify the unverified quality-bar items (RTL, `prefers-reduced-motion`, dark mode)
   end-to-end, to find out whether they already work by virtue of using system tokens/logical CSS properties,
   or need real fixes — then decide whether to roll that fix/verification pass across all components.
4. Pick off an app-shell follow-up (section 0 item 4): a data-fetching/async-task controller, forms/
   validation helpers, `@lit/localize` i18n integration, or a `create-lit-material-app` CLI/starter.

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
