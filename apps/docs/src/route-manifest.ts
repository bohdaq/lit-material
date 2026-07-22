import { html } from "lit";
import "./pages/home-page.js";
import "./pages/building-apps-page.js";
import "./pages/theme-page.js";
import "./pages/packages/router-page.js";
import "./pages/packages/store-page.js";
import "./pages/packages/core-page.js";
import "./pages/packages/task-page.js";
import "./pages/packages/form-page.js";
import "./pages/packages/cli-page.js";
import "./pages/components/accordion-page.js";
import "./pages/components/autocomplete-page.js";
import "./pages/components/stepper-page.js";
import "./pages/components/tree-page.js";
import "./pages/components/avatar-page.js";
import "./pages/components/skeleton-page.js";
import "./pages/components/button-page.js";
import "./pages/components/icon-button-page.js";
import "./pages/components/text-field-page.js";
import "./pages/components/checkbox-page.js";
import "./pages/components/radio-page.js";
import "./pages/components/switch-page.js";
import "./pages/components/chip-page.js";
import "./pages/components/card-page.js";
import "./pages/components/carousel-page.js";
import "./pages/components/list-page.js";
import "./pages/components/badge-page.js";
import "./pages/components/fab-page.js";
import "./pages/components/divider-page.js";
import "./pages/components/select-page.js";
import "./pages/components/slider-page.js";
import "./pages/components/segmented-button-page.js";
import "./pages/components/tabs-page.js";
import "./pages/components/tooltip-page.js";
import "./pages/components/dialog-page.js";
import "./pages/components/sheet-page.js";
import "./pages/components/menu-page.js";
import "./pages/components/search-page.js";
import "./pages/components/snackbar-page.js";
import "./pages/components/top-app-bar-page.js";
import "./pages/components/navigation-page.js";
import "./pages/components/progress-page.js";
import "./pages/components/date-picker-page.js";
import "./pages/components/date-range-picker-page.js";
import "./pages/components/time-picker-page.js";
import "./pages/components/data-table-page.js";

export type NavGroup = "guide" | "theme" | "packages" | "components";

export interface NavEntry {
  path: string;
  label: string;
  group: NavGroup;
  render: () => unknown;
}

export const groupLabels: Record<NavGroup, string> = {
  guide: "Guide",
  theme: "Theme",
  packages: "App shell",
  components: "Components",
};

/**
 * Single source of truth for both the router's route table and the sidebar
 * nav — app-shell.ts derives both from this one array so they can't drift
 * apart. Component entries are appended here as each page is migrated.
 */
export const navEntries: NavEntry[] = [
  { path: "/", label: "Install guide", group: "guide", render: () => html`<docs-home-page></docs-home-page>` },
  {
    path: "/guide/building-apps",
    label: "Building apps",
    group: "guide",
    render: () => html`<docs-building-apps-page></docs-building-apps-page>`,
  },
  { path: "/theme", label: "Theme builder", group: "theme", render: () => html`<docs-theme-page></docs-theme-page>` },
  {
    path: "/packages/router",
    label: "Router",
    group: "packages",
    render: () => html`<docs-router-page></docs-router-page>`,
  },
  {
    path: "/packages/store",
    label: "Store",
    group: "packages",
    render: () => html`<docs-store-page></docs-store-page>`,
  },
  {
    path: "/packages/core",
    label: "Core",
    group: "packages",
    render: () => html`<docs-core-page></docs-core-page>`,
  },
  {
    path: "/packages/task",
    label: "Task",
    group: "packages",
    render: () => html`<docs-task-page></docs-task-page>`,
  },
  {
    path: "/packages/form",
    label: "Form",
    group: "packages",
    render: () => html`<docs-form-page></docs-form-page>`,
  },
  {
    path: "/packages/cli",
    label: "CLI starter",
    group: "packages",
    render: () => html`<docs-cli-page></docs-cli-page>`,
  },
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
    path: "/components/carousel",
    label: "Carousel",
    group: "components",
    render: () => html`<docs-carousel-page></docs-carousel-page>`,
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
    path: "/components/segmented-button",
    label: "Segmented Button",
    group: "components",
    render: () => html`<docs-segmented-button-page></docs-segmented-button-page>`,
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
    path: "/components/sheet",
    label: "Sheet",
    group: "components",
    render: () => html`<docs-sheet-page></docs-sheet-page>`,
  },
  {
    path: "/components/menu",
    label: "Menu",
    group: "components",
    render: () => html`<docs-menu-page></docs-menu-page>`,
  },
  {
    path: "/components/search",
    label: "Search",
    group: "components",
    render: () => html`<docs-search-page></docs-search-page>`,
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
    path: "/components/date-range-picker",
    label: "Date Range Picker",
    group: "components",
    render: () => html`<docs-date-range-picker-page></docs-date-range-picker-page>`,
  },
  {
    path: "/components/time-picker",
    label: "Time Picker",
    group: "components",
    render: () => html`<docs-time-picker-page></docs-time-picker-page>`,
  },
  {
    path: "/components/data-table",
    label: "Data Table",
    group: "components",
    render: () => html`<docs-data-table-page></docs-data-table-page>`,
  },
  {
    path: "/components/autocomplete",
    label: "Autocomplete",
    group: "components",
    render: () => html`<docs-autocomplete-page></docs-autocomplete-page>`,
  },
  {
    path: "/components/accordion",
    label: "Accordion",
    group: "components",
    render: () => html`<docs-accordion-page></docs-accordion-page>`,
  },
  {
    path: "/components/stepper",
    label: "Stepper",
    group: "components",
    render: () => html`<docs-stepper-page></docs-stepper-page>`,
  },
  {
    path: "/components/tree",
    label: "Tree",
    group: "components",
    render: () => html`<docs-tree-page></docs-tree-page>`,
  },
  {
    path: "/components/avatar",
    label: "Avatar",
    group: "components",
    render: () => html`<docs-avatar-page></docs-avatar-page>`,
  },
  {
    path: "/components/skeleton",
    label: "Skeleton",
    group: "components",
    render: () => html`<docs-skeleton-page></docs-skeleton-page>`,
  },
];
