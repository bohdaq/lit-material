// Must load before Lit, so server-rendered shadow roots are hydrated, not re-rendered.
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";

import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@lit-material/tokens/css/index.css";
import "../theme.css";
import "../site.css";
import "../landing.css";
import "../lit.css";

import "../components.js";

// Each docs demo page is its own chunk, loaded only on the page that shows it (one bundle with all of them
// was 1.25 MB on every page). The element's tag is the file name: pages/components/button-page.ts defines
// <docs-button-page>. Loading it defines the element, which hydrates its server-rendered shadow root.
const demoPages = import.meta.glob("../../../docs/src/pages/**/*-page.ts");
const demoByTag = new Map(Object.entries(demoPages).map(([path, load]) => [`docs-${path.split("/").pop().replace(/\.ts$/, "")}`, load]));
const used = new Set();
for (const el of document.querySelectorAll("*")) if (demoByTag.has(el.localName)) used.add(el.localName);
for (const tag of used) demoByTag.get(tag)();
import "@lit-material/site-kit/css/site-kit.css";
import { initThemeToggle } from "@lit-material/site-kit/client/theme.js";
import { initMenu } from "@lit-material/site-kit/client/menu.js";
import { initSearch } from "@lit-material/site-kit/client/search.js";
import { initReveal } from "@lit-material/site-kit/client/reveal.js";
import { initTagline } from "./reveal.js";

initThemeToggle({ key: "lit-theme" });
initMenu();
initSearch({
  emptyHint: "Try a component name like <code>table</code> or <code>dialog</code>.",
  // What people call these elsewhere.
  aliases: {
    toast: "snackbar",
    notification: "snackbar",
    dropdown: "select",
    combobox: "autocomplete",
    typeahead: "autocomplete",
    modal: "dialog",
    toggle: "switch",
    "color picker": "color-picker",
    colour: "color-picker",
    datepicker: "date-picker",
    "date picker": "date-picker",
    "time picker": "time-picker",
    spinner: "progress",
    loader: "progress",
    tag: "chip",
    pill: "chip",
    input: "text-field",
    textarea: "text-field",
    grid: "data-table",
    popup: "popover",
    "bottom sheet": "sheet",
    range: "slider",
    wizard: "stepper",
    collapse: "accordion",
    banner: "alert",
  },
});
initReveal();
initTagline();
