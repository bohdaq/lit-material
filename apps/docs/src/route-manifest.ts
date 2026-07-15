import { html } from "lit";
import "./pages/home-page.js";
import "./pages/theme-page.js";
import "./pages/components/button-page.js";
import "./pages/components/icon-button-page.js";
import "./pages/components/text-field-page.js";
import "./pages/components/checkbox-page.js";
import "./pages/components/radio-page.js";
import "./pages/components/switch-page.js";
import "./pages/components/chip-page.js";
import "./pages/components/card-page.js";
import "./pages/components/list-page.js";
import "./pages/components/badge-page.js";
import "./pages/components/fab-page.js";
import "./pages/components/divider-page.js";
import "./pages/components/select-page.js";
import "./pages/components/slider-page.js";
import "./pages/components/tabs-page.js";
import "./pages/components/tooltip-page.js";
import "./pages/components/dialog-page.js";
import "./pages/components/menu-page.js";
import "./pages/components/snackbar-page.js";
import "./pages/components/top-app-bar-page.js";
import "./pages/components/navigation-page.js";
import "./pages/components/progress-page.js";
import "./pages/components/date-picker-page.js";
import "./pages/components/data-table-page.js";

export type NavGroup = "guide" | "theme" | "components";

export interface NavEntry {
  path: string;
  label: string;
  group: NavGroup;
  render: () => unknown;
}

export const groupLabels: Record<NavGroup, string> = {
  guide: "Guide",
  theme: "Theme",
  components: "Components",
};

/**
 * Single source of truth for both the router's route table and the sidebar
 * nav — app-shell.ts derives both from this one array so they can't drift
 * apart. Component entries are appended here as each page is migrated.
 */
export const navEntries: NavEntry[] = [
  { path: "/", label: "Install guide", group: "guide", render: () => html`<docs-home-page></docs-home-page>` },
  { path: "/theme", label: "Theme builder", group: "theme", render: () => html`<docs-theme-page></docs-theme-page>` },
  {
    path: "/components/button",
    label: "Button",
    group: "components",
    render: () => html`<docs-button-page></docs-button-page>`,
  },
  {
    path: "/components/icon-button",
    label: "Icon Button",
    group: "components",
    render: () => html`<docs-icon-button-page></docs-icon-button-page>`,
  },
  {
    path: "/components/text-field",
    label: "Text Field",
    group: "components",
    render: () => html`<docs-text-field-page></docs-text-field-page>`,
  },
  {
    path: "/components/checkbox",
    label: "Checkbox",
    group: "components",
    render: () => html`<docs-checkbox-page></docs-checkbox-page>`,
  },
  {
    path: "/components/radio",
    label: "Radio",
    group: "components",
    render: () => html`<docs-radio-page></docs-radio-page>`,
  },
  {
    path: "/components/switch",
    label: "Switch",
    group: "components",
    render: () => html`<docs-switch-page></docs-switch-page>`,
  },
  {
    path: "/components/chip",
    label: "Chip",
    group: "components",
    render: () => html`<docs-chip-page></docs-chip-page>`,
  },
  {
    path: "/components/card",
    label: "Card",
    group: "components",
    render: () => html`<docs-card-page></docs-card-page>`,
  },
  {
    path: "/components/list",
    label: "List",
    group: "components",
    render: () => html`<docs-list-page></docs-list-page>`,
  },
  {
    path: "/components/badge",
    label: "Badge",
    group: "components",
    render: () => html`<docs-badge-page></docs-badge-page>`,
  },
  {
    path: "/components/fab",
    label: "FAB",
    group: "components",
    render: () => html`<docs-fab-page></docs-fab-page>`,
  },
  {
    path: "/components/divider",
    label: "Divider",
    group: "components",
    render: () => html`<docs-divider-page></docs-divider-page>`,
  },
  {
    path: "/components/select",
    label: "Select",
    group: "components",
    render: () => html`<docs-select-page></docs-select-page>`,
  },
  {
    path: "/components/slider",
    label: "Slider",
    group: "components",
    render: () => html`<docs-slider-page></docs-slider-page>`,
  },
  {
    path: "/components/tabs",
    label: "Tabs",
    group: "components",
    render: () => html`<docs-tabs-page></docs-tabs-page>`,
  },
  {
    path: "/components/tooltip",
    label: "Tooltip",
    group: "components",
    render: () => html`<docs-tooltip-page></docs-tooltip-page>`,
  },
  {
    path: "/components/dialog",
    label: "Dialog",
    group: "components",
    render: () => html`<docs-dialog-page></docs-dialog-page>`,
  },
  {
    path: "/components/menu",
    label: "Menu",
    group: "components",
    render: () => html`<docs-menu-page></docs-menu-page>`,
  },
  {
    path: "/components/snackbar",
    label: "Snackbar",
    group: "components",
    render: () => html`<docs-snackbar-page></docs-snackbar-page>`,
  },
  {
    path: "/components/top-app-bar",
    label: "Top App Bar",
    group: "components",
    render: () => html`<docs-top-app-bar-page></docs-top-app-bar-page>`,
  },
  {
    path: "/components/navigation",
    label: "Navigation",
    group: "components",
    render: () => html`<docs-navigation-page></docs-navigation-page>`,
  },
  {
    path: "/components/progress",
    label: "Progress",
    group: "components",
    render: () => html`<docs-progress-page></docs-progress-page>`,
  },
  {
    path: "/components/date-picker",
    label: "Date Picker",
    group: "components",
    render: () => html`<docs-date-picker-page></docs-date-picker-page>`,
  },
  {
    path: "/components/data-table",
    label: "Data Table",
    group: "components",
    render: () => html`<docs-data-table-page></docs-data-table-page>`,
  },
];
