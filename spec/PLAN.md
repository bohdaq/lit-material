# lit-material — Project Plan

A Material Design 3 web component collection built with [Lit](https://lit.dev/), published as independently
installable, framework-agnostic packages.

## 0. Status (as of 2026-07-14)

**All 12 Phase 1 components, plus Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail, Progress
Indicators, and FAB pulled forward from the Phase 2 backlog, are implemented, tested, screenshot-documented,
and merged to `main`** — Button, Icon Button, Text Field, Checkbox, Radio, Switch, Chip, Card, List/List Item,
Dialog, Menu, Snackbar, Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail, Progress Indicators, FAB —
plus the `core` (ripple/focus-ring controllers) and `tokens` (MD3 CSS custom properties) packages they depend
on. Every component has unit + SSR tests and at least one axe-core accessibility test; the docs app
(`apps/docs`) demos every variant/state of every component and is the source of each package's README
screenshot. **All 18 packages are published to npm with correctly resolved dependencies** (no `workspace:*`
protocol strings leaking into published manifests). See section 2 for per-component detail and section
"Deviations from the original plan" below for where the actual build diverged from what this document
originally proposed.

**In progress:** `@lit-material/badge` — package scaffolding and `src/badge.ts` / `src/badge-styles.ts` exist,
uncommitted; still missing tests, README, screenshot, and a build (no `dist/`), so it isn't ready to publish.

**Not yet done, in priority order:**
1. **Tooling gaps**: no CI (`.github/workflows` doesn't exist), no ESLint config, no Changesets, no
   custom-elements-manifest generation. The plan called for all four; none exist yet, so releases and
   contributions are still fully manual.
2. **Unverified quality-bar items**: RTL (`dir="rtl"`) has not been explicitly tested on any component;
   `prefers-reduced-motion` is handled per-component (each has a media query) but not tested; dark mode relies
   entirely on the token layer's `prefers-color-scheme` values and hasn't been visually verified end-to-end.
3. **Docs site is a single static catalog page**, not the "live playground + theme builder" section 3.1/
   milestone 6 envisioned — no per-component pages, no interactive prop editing, no seed-color theme
   generator.
4. **Finish Badge**, then pick off the remaining Phase 2 backlog: Divider, Tooltip, Data Table, Date Picker.

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

In progress:

| Component | Notes | Status | npm |
|---|---|---|---|
| Badge | small dot or large numeric/text badge | 🚧 In progress — `src/` exists, uncommitted; no tests/README/screenshot/build yet | not yet published |

Remaining backlog, in likely build order (simplest/lowest-risk first):

| Component | Notes | Complexity |
|---|---|---|
| Divider | Full-bleed + inset variants, horizontal (and vertical for use inside Navigation Rail/List). Mostly styling — a single element with `role="separator"` when semantically dividing content, no interactive/keyboard behavior, no form association. Smallest remaining component; a natural next pick after Badge. | Low |
| Tooltip | Plain + rich (multi-line, with optional action) variants, per WAI-ARIA tooltip pattern. Likely built on the native Popover API (`manual` mode, like Snackbar) for anchor positioning, shown on hover-with-delay and keyboard focus, dismissed on blur/Escape. Needs the same viewport-flip positioning math Menu/Select already have — can probably factor that out of Menu into a shared helper here rather than re-deriving it. | Medium |
| Data Table | Sortable column headers, row selection (single/multi-select checkboxes), dense/comfortable density. No single native element maps to MD3's visual/interaction spec, so this is closer to a small compound component (table + header-cell + row) than the others. Largest scope of the four; worth a short design pass (column API shape, sorting/selection event contract) before starting implementation, unlike the others which can follow the established single-file pattern directly. | High |
| Date Picker | Calendar-grid dialog (docked or modal) plus text-field entry, per MD3 spec. Native `<input type="date">` doesn't match MD3's calendar UI or keyboard grid navigation, so this is built from scratch on top of Dialog (for the modal variant) — arrow-key grid navigation, month/year selection, single-date scope only (no range selection, cut for v1). Most complex remaining component; do last so the patterns from Data Table's compound-component work and Tooltip's positioning helper are both available to reuse. | High |

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
│  ├─ badge/                  # in progress, not yet published
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
7. ~~**v0.1.0 public release (package publishing)**~~ — done as far as publishing goes: all 18 built packages
   are live on npm with correctly resolved dependencies (no `workspace:*` leaking into published manifests).
   No formal `v0.1.0` git tag/announcement has been made across the set yet.
8. **Phase 2 planning** — overtaken by events: Select, Slider, Tabs, Top App Bar, Navigation Drawer/Rail,
   Progress Indicators, and FAB already shipped (see section 2), chosen by direct request rather than a
   prioritization exercise. Badge is in progress. Remaining backlog (Divider, Tooltip, Data Table, Date
   Picker) now has per-item notes and a suggested build order (see section 2), but hasn't been scoped into
   milestones of its own.

### Immediate next steps (concrete, in order)

1. Finish and publish `@lit-material/badge` (tests, README + docs-app demo, screenshot, build) — the one
   component currently mid-implementation.
2. Add the still-missing tooling section 3.2 calls for: CI (GitHub Actions running `turbo run lint typecheck
   test build`), Changesets (for coordinated per-package versioning), and an ESLint config. Turborepo itself
   is already in place.
3. Pick one component and verify the unverified quality-bar items (RTL, `prefers-reduced-motion`, dark mode)
   end-to-end, to find out whether they already work by virtue of using system tokens/logical CSS properties,
   or need real fixes — then decide whether to roll that fix/verification pass across all 18 components.
4. Continue picking off the remaining Phase 2 backlog in the order noted in section 2 (Divider, then Tooltip,
   then Data Table, then Date Picker) unless the user requests a different order.

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
