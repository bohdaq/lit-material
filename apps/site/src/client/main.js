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
// Every docs demo page, so the ones on this page hydrate.
import "../../../docs/src/route-manifest.ts";
import { initThemeToggle } from "./theme-toggle.js";
import { initMenu } from "./menu.js";
import { initSearch } from "./search.js";
import { initReveal } from "./reveal.js";

initThemeToggle();
initMenu();
initSearch();
initReveal();
