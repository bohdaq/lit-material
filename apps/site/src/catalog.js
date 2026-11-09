// What the site lists and where: component groups (Material 3's own
// categories, plus two for what M3 doesn't cover) and the guides. The sidebar,
// the index pages and the sitemap all read this.

export const GROUPS = [
  {
    id: "actions",
    label: "Actions",
    about: "Buttons and the controls that run a command.",
    items: ["button", "action-list", "icon-button", "fab", "speed-dial", "segmented-button", "overflow-menu", "clipboard"],
  },
  {
    id: "communication",
    label: "Communication",
    about: "Status, progress and messages: what happened, and what to do next.",
    items: ["alert", "snackbar", "confirm", "badge", "status", "progress", "skeleton", "empty-state", "tooltip", "avatar"],
  },
  {
    id: "containment",
    label: "Containment",
    about: "Surfaces that hold and group content.",
    items: ["card", "dialog", "about-dialog", "sheet", "accordion", "panel", "popover", "split-panel", "list", "simple-list", "carousel", "divider"],
  },
  {
    id: "navigation",
    label: "Navigation",
    about: "Moving between views, sections and steps.",
    items: ["navigation", "adaptive-navigation", "top-app-bar", "tabs", "breadcrumbs", "drawer", "sidebar", "search", "command-palette", "kbd", "stepper", "jump-links", "back-to-top", "app-launcher"],
  },
  {
    id: "selection",
    label: "Selection",
    about: "Choosing values: on and off, one of many, dates, times and schedules.",
    items: ["checkbox", "radio", "switch", "chip", "select", "autocomplete", "menu", "slider", "rating", "date-picker", "date-range-picker", "time-picker", "calendar", "dual-list"],
  },
  {
    id: "text-inputs",
    label: "Text inputs",
    about: "Typing values in, editing them in place, and uploading files.",
    items: ["text-field", "rich-text", "inline-edit", "file-upload"],
  },
  {
    id: "data",
    label: "Data and consoles",
    about: "What admin UIs show all day: tables, logs, metrics, settings and code.",
    items: ["data-table", "table", "data-list", "description-list", "tree", "log-viewer", "diff", "stat", "chart", "timing-waterfall", "method-tag", "world-map", "key-value", "code-block", "timestamp", "truncate", "format", "sortable"],
  },
  {
    id: "accounts",
    label: "Accounts and billing",
    about: "Signing in, codes from mail or an app, keys shown once, plans and getting started.",
    items: ["sign-in", "one-time-code", "new-secret", "pricing", "checklist"],
  },
  {
    id: "layout",
    label: "Layout and theming",
    about: "The page frame, toolbars, icons and light and dark mode.",
    items: ["page", "toolbar", "icon", "color-scheme"],
  },
];

/** Docs routes whose element lives in another package. */
export const PACKAGE_OF = {
  "action-list": "button",
  "about-dialog": "dialog",
  "app-launcher": "menu",
  "adaptive-navigation": "navigation",
  "date-range-picker": "date-picker",
  "checklist": "stepper",
  "new-secret": "clipboard",
  "one-time-code": "text-field",
};

/** Guides: the old docs route each one shows, or null for pages written for this site. */
export const GUIDE_GROUPS = [
  {
    label: "Start",
    items: [
      { slug: "install", label: "Install", from: null },
      { slug: "server-rendering", label: "Server rendering", from: null },
      { slug: "frameworks", label: "React, Vue and Angular", from: null },
      { slug: "i18n", label: "Languages and RTL", from: null },
      { slug: "security", label: "Security and CSP", from: null },
      { slug: "versions", label: "Versions and support", from: null },
      { slug: "compare", label: "Compared with others", from: null },
      { slug: "migrate-material-web", label: "From @material/web", from: null },
      { slug: "migrate-angular-material", label: "From Angular Material", from: null },
      { slug: "site-kit", label: "Static sites", from: null },
    ],
  },
  {
    label: "Theming",
    items: [
      { slug: "theming", label: "Theme builder", from: "/theme" },
      { slug: "typography", label: "Typography", from: "/theme/typography" },
    ],
  },
  {
    label: "Build an app",
    items: [
      { slug: "building-apps", label: "Building apps", from: "/guide/building-apps" },
      { slug: "router", label: "Router", from: "/packages/router" },
      { slug: "store", label: "Store", from: "/packages/store" },
      { slug: "task", label: "Task", from: "/packages/task" },
      { slug: "form", label: "Form", from: "/packages/form" },
      { slug: "data", label: "Data and forms", from: null },
      { slug: "testing", label: "Testing and devtools", from: null },
      { slug: "core", label: "Core", from: "/packages/core" },
      { slug: "create-app", label: "Create an app", from: "/packages/cli" },
    ],
  },
];

export const allComponents = () => GROUPS.flatMap((g) => g.items);
export const allGuides = () => GUIDE_GROUPS.flatMap((g) => g.items);
