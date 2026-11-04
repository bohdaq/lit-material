// @material/web (v2) → lit-material: one row per md-* element. The codemod reads this table, the migration
// guide renders it, and src/mappings.ssr.test.ts checks every lit-material tag, attribute, slot and event
// named here against the components' custom-elements.json (via src/generated.ts).
//
// Rules: anything without a confident, behavior-preserving mapping is a `warn` (the codemod leaves it and
// reports file:line), never a silent change.

/** What happens to one attribute (or the property bound in its place) of an md-* element. */
export type AttributeRule =
  /** Same meaning under another name; `values` maps static values (unlisted values are warnings). */
  | { kind: "rename"; to: string; values?: Record<string, string> }
  /** Not needed in lit-material (it works it out itself): removed. */
  | { kind: "remove"; why: string }
  /** No equivalent, or different behavior: left in place and reported. */
  | { kind: "warn"; why: string }
  /** One attribute becomes several (a boolean `inset` → `inset-start inset-end`). */
  | { kind: "expand"; to: string[] }
  /** The value becomes the element's text content (md-web's `label` → slotted label text). */
  | { kind: "content"; alsoSet?: string }
  /** Each static value becomes another attribute (`""` removes it); other values are warnings. */
  | { kind: "byValue"; cases: Record<string, string> };

/** A child's `slot="…"` inside this element: renamed, `null` for the default slot, or a warning. */
export type SlotRule = string | null | { warn: string };

export type EventRule = { kind: "rename"; to: string } | { kind: "warn"; why: string };

export interface ElementMapping {
  /** The @material/web tag. */
  md: string;
  /** Its @material/web module, without `.js`: `import "@material/web/<module>.js"`. */
  module: string;
  /** The lit-material tag, or null when there is none. */
  to: string | null;
  /** The package that registers `to`. */
  package: string | null;
  /** Attributes added to every converted element (`true` for a boolean attribute). */
  set?: Record<string, string | true>;
  /** Attributes added when the element doesn't end up with them, where the defaults differ. */
  defaults?: Record<string, string | true>;
  /** Only the attributes that differ; anything not listed is kept as written. */
  attributes?: Record<string, AttributeRule>;
  events?: Record<string, EventRule>;
  /** Slot names of this element's children that differ. */
  childSlots?: Record<string, SlotRule>;
  /** Unslotted `<md-icon>` children get this slot (lit-material's element has no default icon slot). */
  iconSlot?: string;
  /** A static attribute value that selects another lit-material element (`type="textarea"`). */
  alternate?: { attribute: string; value: string; to: string };
  /** Manual work: reported once per file that uses the element. */
  notes?: string[];
  /** Why there's no lit-material element, for `to: null`. */
  why?: string;
}

const rename = (to: string, values?: Record<string, string>): AttributeRule => (values ? { kind: "rename", to, values } : { kind: "rename", to });
const remove = (why: string): AttributeRule => ({ kind: "remove", why });
const warn = (why: string): AttributeRule => ({ kind: "warn", why });

const softDisabled = warn("lit-material has no soft-disabled (focusable while disabled); use `disabled`, or `aria-disabled` and ignore the click yourself");
const touchTarget = warn("lit-material controls size their own touch target; `touch-target` has no equivalent");
const inputEvent = (to: string): EventRule => ({ kind: "warn", why: `${to} fires \`change\` only, not \`input\`` });

const unsupportedEvent: EventRule = { kind: "warn", why: "lit-material has no such event: use the `open` property and the `close` event" };

const button = (md: string, module: string, variant: string): ElementMapping => ({
  md,
  module: `button/${module}`,
  to: "lit-material-button",
  package: "@lit-material/button",
  set: { variant },
  attributes: {
    "has-icon": remove("lit-material-button lays out a slotted icon by itself"),
    "trailing-icon": warn("lit-material-button's `icon` slot is leading only; put a trailing icon in the label"),
    "soft-disabled": softDisabled,
    download: warn("lit-material-button has no `download`; use an <a download> styled as you need"),
  },
});

const iconButton = (md: string, module: string, variant: string): ElementMapping => ({
  md,
  module: `iconbutton/${module}`,
  to: "lit-material-icon-button",
  package: "@lit-material/icon-button",
  set: variant === "standard" ? {} : { variant },
  attributes: {
    "soft-disabled": softDisabled,
    "flip-icon-in-rtl": warn("lit-material-icon-button doesn't mirror its icon in RTL; mirror the icon yourself (`:dir(rtl) svg { transform: scaleX(-1) }`)"),
    "aria-label-selected": warn("lit-material-icon-button has one `aria-label` and exposes `aria-pressed` for the selected state"),
  },
  childSlots: { selected: "selected-icon" },
  iconSlot: "icon",
});

const textField = (md: string, module: string, variant: string): ElementMapping => ({
  md,
  module: `textfield/${module}`,
  to: "lit-material-text-field",
  package: "@lit-material/text-field",
  set: { variant },
  alternate: { attribute: "type", value: "textarea", to: "lit-material-textarea" },
  attributes: {
    "prefix-text": rename("prefix"),
    "suffix-text": rename("suffix"),
    "input-mode": rename("inputmode"),
    "has-leading-icon": remove("lit-material-text-field shows its `leading-icon` slot when it has content"),
    "has-trailing-icon": remove("lit-material-text-field shows its `trailing-icon` slot when it has content"),
    "no-spinner": warn("lit-material-text-field has no `no-spinner`; for numbers consider lit-material-number-field"),
    "text-direction": warn("set `dir` on the element instead"),
    cols: warn("lit-material-textarea has `rows` only; size it with CSS"),
    multiple: warn("lit-material-text-field has no `multiple`"),
  },
  events: { select: { kind: "warn", why: "the inner input's `select` event doesn't leave lit-material-text-field's shadow root" } },
});

const select = (md: string, module: string, variant: string): ElementMapping => ({
  md,
  module: `select/${module}`,
  to: "lit-material-select",
  package: "@lit-material/select",
  set: { variant },
  attributes: {
    "selected-index": warn("lit-material-select has no `selectedIndex`; set `value`, or `selected` on an option"),
    "display-text": warn("lit-material-select shows the selected option's text"),
    "has-leading-icon": warn("lit-material-select has no leading-icon slot"),
    quick: remove("lit-material-select has no opening animation to skip"),
    "menu-positioning": warn("lit-material-select positions its listbox itself"),
    "clamp-menu-width": warn("lit-material-select sizes its listbox itself"),
    "menu-align": warn("lit-material-select aligns its listbox to the trigger's start edge"),
    "typeahead-delay": warn("lit-material-select has no type-ahead delay setting"),
  },
  events: { input: inputEvent("lit-material-select"), opening: unsupportedEvent, opened: unsupportedEvent, closing: unsupportedEvent, closed: unsupportedEvent },
  childSlots: { "leading-icon": { warn: "lit-material-select has no leading-icon slot" } },
});

const chip = (md: string, module: string, variant: string, extra: Partial<ElementMapping> = {}): ElementMapping => ({
  md,
  module: `chips/${module}`,
  to: "lit-material-chip",
  package: "@lit-material/chip",
  set: { variant },
  ...extra,
  attributes: {
    label: { kind: "content" },
    "always-focusable": warn("lit-material-chip has no `always-focusable`"),
    ...extra.attributes,
  },
  childSlots: { icon: "leading-icon", ...extra.childSlots },
});

const NO_ELEMENT_BUILT_IN = "lit-material components draw their own ripple, focus ring and elevation (style them with ::part(ripple), ::part(focus-ring) or the component's tokens); remove this element";

export const ELEMENTS: readonly ElementMapping[] = [
  button("md-filled-button", "filled-button", "filled"),
  button("md-outlined-button", "outlined-button", "outlined"),
  button("md-text-button", "text-button", "text"),
  button("md-elevated-button", "elevated-button", "elevated"),
  button("md-filled-tonal-button", "filled-tonal-button", "tonal"),

  iconButton("md-icon-button", "icon-button", "standard"),
  iconButton("md-filled-icon-button", "filled-icon-button", "filled"),
  iconButton("md-filled-tonal-icon-button", "filled-tonal-icon-button", "tonal"),
  iconButton("md-outlined-icon-button", "outlined-icon-button", "outlined"),

  {
    md: "md-fab",
    module: "fab/fab",
    to: "lit-material-fab",
    package: "@lit-material/fab",
    defaults: { color: "surface" },
    attributes: {
      variant: rename("color", { surface: "surface", primary: "primary", secondary: "secondary", tertiary: "tertiary" }),
      size: rename("size", { small: "small", medium: "regular", large: "large" }),
      label: { kind: "content", alsoSet: "extended" },
      lowered: warn("lit-material-fab has no lowered elevation"),
    },
  },
  {
    md: "md-branded-fab",
    module: "fab/branded-fab",
    to: "lit-material-fab",
    package: "@lit-material/fab",
    defaults: { color: "surface" },
    attributes: {
      size: rename("size", { small: "small", medium: "regular", large: "large" }),
      label: { kind: "content", alsoSet: "extended" },
      lowered: warn("lit-material-fab has no lowered elevation"),
    },
    notes: ["md-branded-fab → lit-material-fab color=\"surface\": slot your multi-colour brand icon into `icon`; there is no branded variant"],
  },

  {
    md: "md-checkbox",
    module: "checkbox/checkbox",
    to: "lit-material-checkbox",
    package: "@lit-material/checkbox",
    attributes: { "touch-target": touchTarget },
    events: { input: inputEvent("lit-material-checkbox") },
  },
  {
    md: "md-radio",
    module: "radio/radio",
    to: "lit-material-radio",
    package: "@lit-material/radio",
    attributes: { "touch-target": touchTarget },
    events: { input: inputEvent("lit-material-radio") },
  },
  {
    md: "md-switch",
    module: "switch/switch",
    to: "lit-material-switch",
    package: "@lit-material/switch",
    attributes: {
      selected: rename("checked"),
      icons: warn("lit-material-switch shows icons you slot into `icon` / `selected-icon`; there's no built-in pair"),
      "show-only-selected-icon": warn("slot only a `selected-icon` instead"),
    },
    events: { input: inputEvent("lit-material-switch") },
    notes: ["md-switch's `selected` is lit-material-switch's `checked`: update script that reads or sets `.selected`"],
  },
  {
    md: "md-slider",
    module: "slider/slider",
    to: "lit-material-slider",
    package: "@lit-material/slider",
    attributes: {
      range: warn("lit-material-slider is single-value; a two-thumb range is not supported"),
      "value-start": warn("lit-material-slider is single-value"),
      "value-end": warn("lit-material-slider is single-value"),
      "name-start": warn("lit-material-slider is single-value"),
      "name-end": warn("lit-material-slider is single-value"),
      "aria-label-start": warn("lit-material-slider is single-value"),
      "aria-label-end": warn("lit-material-slider is single-value"),
      "value-label": warn("lit-material-slider's value label shows the value; it has no custom label text"),
      "value-label-start": warn("lit-material-slider is single-value"),
      "value-label-end": warn("lit-material-slider is single-value"),
      labeled: warn("check lit-material-slider's value label (::part(value-label)) matches what you want"),
      ticks: warn("lit-material-slider has no tick marks"),
    },
  },

  textField("md-filled-text-field", "filled-text-field", "filled"),
  textField("md-outlined-text-field", "outlined-text-field", "outlined"),

  select("md-filled-select", "filled-select", "filled"),
  select("md-outlined-select", "outlined-select", "outlined"),
  {
    md: "md-select-option",
    module: "select/select-option",
    to: "lit-material-select-option",
    package: "@lit-material/select",
    attributes: { "display-text": warn("lit-material-select shows the option's text content") },
    childSlots: {
      headline: null,
      start: "leading",
      end: { warn: "lit-material-select-option has no trailing slot" },
      "supporting-text": { warn: "lit-material-select-option has no supporting-text slot" },
      "trailing-supporting-text": { warn: "lit-material-select-option has no trailing slot" },
      overline: { warn: "lit-material-select-option has no overline slot" },
    },
  },

  {
    md: "md-chip-set",
    module: "chips/chip-set",
    to: null,
    package: null,
    why: "lit-material has no chip set: put the chips in a plain container (a flex row with a gap); arrow-key movement between chips isn't provided",
  },
  chip("md-assist-chip", "assist-chip", "assist"),
  chip("md-filter-chip", "filter-chip", "filter", {
    attributes: { "has-selected-icon": warn("a selected filter chip always shows a checkmark in lit-material") },
  }),
  chip("md-input-chip", "input-chip", "input", {
    defaults: { removable: true },
    attributes: {
      avatar: warn("lit-material-chip has no avatar style; slot an avatar into `leading-icon`"),
      "remove-only": warn("lit-material-chip has no remove-only mode"),
    },
  }),
  chip("md-suggestion-chip", "suggestion-chip", "suggestion"),

  {
    md: "md-dialog",
    module: "dialog/dialog",
    to: "lit-material-dialog",
    package: "@lit-material/dialog",
    attributes: {
      quick: remove("lit-material-dialog has no opening animation to skip"),
      "no-focus-trap": warn("lit-material-dialog is a native modal <dialog>: focus always stays inside"),
      type: warn("lit-material-dialog has no `type=\"alert\"`; for confirmations see lit-material-confirm-dialog"),
      "return-value": warn("read `returnValue` from a <form method=\"dialog\"> submit, or pass it to `close(returnValue)`"),
    },
    events: {
      closed: { kind: "rename", to: "close" },
      open: { kind: "warn", why: "lit-material-dialog has no event before opening" },
      opened: { kind: "warn", why: "lit-material-dialog has no event after opening" },
    },
    childSlots: { content: null },
    notes: ["md-dialog → lit-material-dialog: `close` fires after it has closed (md-web's `closed`); check forms with method=\"dialog\" still close it"],
  },

  {
    md: "md-menu",
    module: "menu/menu",
    to: "lit-material-menu",
    package: "@lit-material/menu",
    attributes: {
      positioning: warn("lit-material-menu is a popover in the top layer; it has no positioning modes"),
      quick: remove("lit-material-menu has no opening animation to skip"),
      "has-overflow": warn("lit-material-menu has no has-overflow"),
      "x-offset": warn("lit-material-menu has no offsets"),
      "y-offset": warn("lit-material-menu has no offsets"),
      "anchor-corner": warn("lit-material-menu opens below its anchor, start-aligned"),
      "menu-corner": warn("lit-material-menu opens below its anchor, start-aligned"),
      "typeahead-delay": warn("lit-material-menu has no type-ahead"),
      "stay-open-on-outside-click": warn("lit-material-menu closes on outside click (popover light dismiss)"),
      "stay-open-on-focusout": warn("lit-material-menu has no stay-open-on-focusout"),
      "skip-restore-focus": warn("lit-material-menu returns focus to its anchor"),
      "default-focus": warn("lit-material-menu focuses itself on open; arrow keys reach the first or last item"),
      "is-submenu": warn("lit-material-menu has no submenus"),
    },
    events: {
      closed: { kind: "rename", to: "close" },
      opening: unsupportedEvent,
      opened: unsupportedEvent,
      closing: unsupportedEvent,
      "close-menu": { kind: "warn", why: "lit-material-menu fires `close`; listen for the item's `click` to know which was chosen" },
    },
  },
  {
    md: "md-menu-item",
    module: "menu/menu-item",
    to: "lit-material-list-item",
    package: "@lit-material/list",
    set: { interactive: true },
    attributes: {
      type: remove("lit-material-list-item is a button, or a link when it has `href`"),
      "keep-open": warn("call event.stopPropagation() in the item's click handler to keep the menu open"),
    },
    childSlots: { headline: null, start: "leading", end: "trailing", "trailing-supporting-text": "trailing" },
  },
  {
    md: "md-sub-menu",
    module: "menu/sub-menu",
    to: null,
    package: null,
    why: "lit-material-menu has no submenus: flatten the menu, or open a second lit-material-menu anchored to the item",
  },

  { md: "md-list", module: "list/list", to: "lit-material-list", package: "@lit-material/list" },
  {
    md: "md-list-item",
    module: "list/list-item",
    to: "lit-material-list-item",
    package: "@lit-material/list",
    attributes: { type: { kind: "byValue", cases: { text: "", link: "", button: "interactive" } } },
    childSlots: { headline: null, start: "leading", end: "trailing", "trailing-supporting-text": "trailing" },
  },

  {
    md: "md-tabs",
    module: "tabs/tabs",
    to: "lit-material-tabs",
    package: "@lit-material/tabs",
    attributes: {
      "active-tab-index": rename("selected"),
      "auto-activate": remove("lit-material-tabs selects a tab as arrow keys reach it"),
    },
    notes: ["md-tabs → lit-material-tabs: `activeTabIndex` is `selected`, `activeTab` has no equivalent (use `selected`); update script that reads them"],
  },
  {
    md: "md-primary-tab",
    module: "tabs/primary-tab",
    to: "lit-material-tab",
    package: "@lit-material/tabs",
    attributes: {
      active: warn("lit-material-tabs sets each tab's `selected`; set `selected=\"<index>\"` on lit-material-tabs instead"),
      "has-icon": remove("lit-material-tab shows its `icon` slot when it has content"),
      "icon-only": warn("lit-material-tab has no icon-only layout; give it an aria-label and no text"),
      "inline-icon": warn("lit-material-tab places its icon above the label"),
    },
  },
  {
    md: "md-secondary-tab",
    module: "tabs/secondary-tab",
    to: "lit-material-tab",
    package: "@lit-material/tabs",
    attributes: {
      active: warn("lit-material-tabs sets each tab's `selected`; set `selected=\"<index>\"` on lit-material-tabs instead"),
      "has-icon": remove("lit-material-tab shows its `icon` slot when it has content"),
      "icon-only": warn("lit-material-tab has no icon-only layout; give it an aria-label and no text"),
    },
    notes: ["md-secondary-tab → lit-material-tab: lit-material has one tab style (primary); there is no secondary style"],
  },

  {
    md: "md-linear-progress",
    module: "progress/linear-progress",
    to: "lit-material-linear-progress",
    package: "@lit-material/progress",
    attributes: {
      buffer: warn("lit-material-linear-progress has no buffer track"),
      "four-color": warn("lit-material-linear-progress has no four-colour mode"),
    },
  },
  {
    md: "md-circular-progress",
    module: "progress/circular-progress",
    to: "lit-material-circular-progress",
    package: "@lit-material/progress",
    attributes: { "four-color": warn("lit-material-circular-progress has no four-colour mode") },
  },

  {
    md: "md-divider",
    module: "divider/divider",
    to: "lit-material-divider",
    package: "@lit-material/divider",
    attributes: { inset: { kind: "expand", to: ["inset-start", "inset-end"] } },
  },
  {
    md: "md-icon",
    module: "icon/icon",
    to: "lit-material-icon",
    package: "@lit-material/icon",
    notes: [
      "md-icon draws Material Symbols ligatures (`<md-icon>settings</md-icon>`) with an icon font; lit-material-icon loads no font: slot an <svg>, or register SVG icons with registerIcons() and use `name`",
    ],
  },

  { md: "md-ripple", module: "ripple/ripple", to: null, package: null, why: NO_ELEMENT_BUILT_IN },
  { md: "md-focus-ring", module: "focus/md-focus-ring", to: null, package: null, why: NO_ELEMENT_BUILT_IN },
  { md: "md-elevation", module: "elevation/elevation", to: null, package: null, why: NO_ELEMENT_BUILT_IN },
];

/** @material/web modules that register no element. */
export const OTHER_MODULES: Record<string, string> = {
  all: "imports every @material/web component; import the lit-material packages you use instead",
  "typography/md-typescale-styles":
    "lit-material's typescale classes (.md-typescale-<role>-<size>, the same names) are in @lit-material/tokens/css/typography.css; inside a shadow root include it with unsafeCSS",
};

/**
 * @material/web component token prefixes (`--md-<prefix>-…`) and the lit-material element whose tokens and
 * parts to use instead. Longest prefix wins.
 */
export const TOKEN_PREFIXES: Record<string, string | null> = {
  "filled-button": "lit-material-button",
  "outlined-button": "lit-material-button",
  "text-button": "lit-material-button",
  "elevated-button": "lit-material-button",
  "filled-tonal-button": "lit-material-button",
  "icon-button": "lit-material-icon-button",
  "filled-icon-button": "lit-material-icon-button",
  "filled-tonal-icon-button": "lit-material-icon-button",
  "outlined-icon-button": "lit-material-icon-button",
  fab: "lit-material-fab",
  "branded-fab": "lit-material-fab",
  checkbox: "lit-material-checkbox",
  radio: "lit-material-radio",
  switch: "lit-material-switch",
  slider: "lit-material-slider",
  "filled-field": "lit-material-text-field",
  "outlined-field": "lit-material-text-field",
  "filled-text-field": "lit-material-text-field",
  "outlined-text-field": "lit-material-text-field",
  "filled-select": "lit-material-select",
  "outlined-select": "lit-material-select",
  "assist-chip": "lit-material-chip",
  "filter-chip": "lit-material-chip",
  "input-chip": "lit-material-chip",
  "suggestion-chip": "lit-material-chip",
  dialog: "lit-material-dialog",
  menu: "lit-material-menu",
  "menu-item": "lit-material-list-item",
  "sub-menu": null,
  list: "lit-material-list",
  "list-item": "lit-material-list-item",
  tabs: "lit-material-tabs",
  "primary-tab": "lit-material-tab",
  "secondary-tab": "lit-material-tab",
  "linear-progress": "lit-material-linear-progress",
  "circular-progress": "lit-material-circular-progress",
  divider: "lit-material-divider",
  icon: "lit-material-icon",
  ripple: null,
  "focus-ring": null,
  elevation: null,
};

export const BY_TAG: ReadonlyMap<string, ElementMapping> = new Map(ELEMENTS.map((m) => [m.md, m]));
export const BY_MODULE: ReadonlyMap<string, ElementMapping> = new Map(ELEMENTS.map((m) => [m.module, m]));

/** The start tag the codemod writes for an element, for docs: `lit-material-button variant="filled"`. */
export function targetLabel(m: ElementMapping): string {
  if (!m.to) return "";
  const attrs = Object.entries(m.set ?? {}).map(([k, v]) => (v === true ? k : `${k}="${v}"`));
  return [m.to, ...attrs].join(" ");
}
