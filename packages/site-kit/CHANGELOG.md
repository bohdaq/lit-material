# @lit-material/site-kit

## 1.9.0

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

### Minor Changes

- 5a9c802: `initInstall()` (`@lit-material/site-kit/client/install.js`) with `installToggle()` and `installPanel()` templates: an install button opens its panel, and install tabs marked `data-os` start on the visitor's OS. `guessOs()` is exported too.

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.1.1

### Patch Changes

- be5093c: Strict Content-Security-Policy and Trusted Types. Components now work under `script-src 'self'; style-src 'self'; require-trusted-types-for 'script'; trusted-types lit-html` with no `'unsafe-inline'`: inline styles that change at runtime (bar widths, tooltip positions, slider thumbs, tree indents, …) are set through the CSSOM with the new `cssProps` directive in `@lit-material/core` instead of `style` attributes, which such a policy blocks. Site-kit's search box assigns its results through a Trusted Types policy named `lit-material-site-kit`. Every package now ships a CycloneDX SBOM of its runtime dependencies at `dist/sbom.cdx.json`.

## 0.1.0

### Minor Changes

- e599adb: New package for prerendered sites: FAQ on native `<details>`, numbered steps, a terminal mockup, keys and shortcut lists and a search dialog, as plain HTML templates that work before JavaScript, with one layered stylesheet. Scripts add the theme toggle (with an inline boot script), mobile menu, Pagefind search (`/` and Ctrl/Cmd+K), terminal replay and scroll reveals.
