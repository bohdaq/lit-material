---
"@lit-material/accordion": minor
"@lit-material/alert": minor
"@lit-material/autocomplete": minor
"@lit-material/badge": minor
"@lit-material/breadcrumbs": minor
"@lit-material/button": minor
"@lit-material/card": minor
"@lit-material/carousel": minor
"@lit-material/chart": minor
"@lit-material/checkbox": minor
"@lit-material/chip": minor
"@lit-material/code-block": minor
"@lit-material/color-picker": minor
"@lit-material/command-palette": minor
"@lit-material/core": minor
"@lit-material/data-table": minor
"@lit-material/date-picker": minor
"@lit-material/devtools": minor
"@lit-material/dialog": minor
"@lit-material/diff": minor
"@lit-material/drawer": minor
"@lit-material/fab": minor
"@lit-material/file-upload": minor
"@lit-material/icon-button": minor
"@lit-material/list": minor
"@lit-material/log-viewer": minor
"@lit-material/menu": minor
"@lit-material/navigation": minor
"@lit-material/overflow-menu": minor
"@lit-material/popover": minor
"@lit-material/radio": minor
"@lit-material/rating": minor
"@lit-material/rich-text": minor
"@lit-material/search": minor
"@lit-material/segmented-button": minor
"@lit-material/select": minor
"@lit-material/sheet": minor
"@lit-material/simple-list": minor
"@lit-material/site-kit": minor
"@lit-material/slider": minor
"@lit-material/snackbar": minor
"@lit-material/sortable": minor
"@lit-material/speed-dial": minor
"@lit-material/stepper": minor
"@lit-material/switch": minor
"@lit-material/table": minor
"@lit-material/tabs": minor
"@lit-material/testing": minor
"@lit-material/text-field": minor
"@lit-material/time-picker": minor
"@lit-material/tokens": minor
"@lit-material/tooltip": minor
"@lit-material/translations": minor
"@lit-material/tree": minor
"create-lit-material-app": minor
---

Keyboard, accessibility, RTL and layout fixes from the November UX review.

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
