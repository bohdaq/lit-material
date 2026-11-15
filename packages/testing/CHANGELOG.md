# @lit-material/testing

## 1.8.0

### Minor Changes

- d1334a2: Keyboard, accessibility, RTL and layout fixes from the November UX review.

  - **Arrow keys inside shadow roots:** menu, tabs, segmented button and sortable find the focused item through shadow roots (new `focusedItem`, `containsFocus` and `deepActiveElement` in `@lit-material/core/active-element.js`; `shadowFixture` in `@lit-material/testing`).
  - **Menu:** `role="menu"` with `menuitem` items (`menu-item` on `lit-material-list-item`), `aria-haspopup`/`aria-expanded` on the anchor, typeahead, and Tab closes it.
  - **Snackbar:** shows at the bottom (`--lit-material-snackbar-offset`), one at a time; a snackbar with no timeout always has a close button.
  - **Slider:** the filled track is a 4px line; the inactive track has 3:1 contrast (`--lit-material-slider-inactive-track-color`).
  - **Server rendering:** stepper numbers and the select's chosen text are right after hydration (`afterHydration` in `@lit-material/core/hydration.js`).
  - **RTL:** select, popover, tooltip, overflow menu, color picker and search view open at their anchor; the tabs indicator follows direction, font and size changes.
  - **Focus ring:** one ring everywhere, set by `--lit-material-focus-ring-width` and `--lit-material-focus-ring-color`.
  - **Time picker:** hour and minute are spinbuttons (arrows, Page keys, Home/End, typed digits, A/P); the dial is out of the tab order.
  - **Tooltip, popover, drawer:** the tooltip stays open while hovered and closes on Escape; the popover is named by its anchor; the drawer takes focus, closes on Escape, has `label` and fires `close`.
  - **Data table and date pickers:** `aria-sort` on sorted headers, a full-size sort button, a keyboard column resizer; Home/End go to the week's ends, PageUp/PageDown change month, with Shift the year.
  - **Modals** (dialog, sheet, navigation drawer, command palette, pickers) lock page scrolling (`@lit-material/core/scroll-lock.js`).
  - **Forms:** select typeahead and `focus()`; number field is a spinbutton (`inputAria` on text field); new `lit-material-radio-group`; file upload announces added and removed files; tree items carry level, set size and position, and the tree has typeahead; stepper has `label`.
  - **Autocomplete no longer opens on focus.** Set `open-on-focus` for the old behaviour.
  - **Long text:** button, chip, select, tabs, segmented button, list item, text field and alert stay inside a narrow container.
  - **Touch:** 44px targets on coarse pointers for checkbox, radio, switch, button, icon button, date cells, segmented button and tab close.
  - **Disabled text** is easier to read (`--lit-material-disabled-text-mix`).
  - **site-kit search** is a combobox: arrows move through results, Enter opens the active one, and `aliases` adds other names for a page.
  - **Console template:** the delete button in the danger zone is red; "an owner".

## 1.7.0

## 1.6.0

## 1.5.0

## 1.4.0

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.1.0

### Minor Changes

- d84d8b9: Developer tooling.

  - New `@lit-material/testing`: `fixture()` renders a template and waits until every nested Lit element has updated; `getByRole`/`getByLabel`/`getByText` (and `queryBy*`, `getAllBy*`, `findBy*`) find elements by role, accessible name and text through shadow roots and slots, with `checked`/`selected`/`expanded`/`pressed`/`level` filters and errors that list what was found; `waitForUpdate`, `waitFor`, `queryDeep`; `user.click/type/clear/commit/press`. Works in any browser test runner.
  - New `@lit-material/devtools` (for development builds): `connectStore(store)` records actions and states and connects to the Redux DevTools extension, time travel included; `connectRouter()` logs navigations; `<lit-material-devtools>` (from `@lit-material/devtools/panel.js`) is an in-page panel with the store's state tree, action log, jump-to-state, and each router outlet's current route.
  - `@lit-material/store`: `replaceState(state)` sets the state without the reducer and notifies subscribers (for time travel and tests); `createStore`'s return type includes it.
