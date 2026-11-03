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
import "@lit-material/site-kit/css/site-kit.css";
import { initThemeToggle } from "@lit-material/site-kit/client/theme.js";
import { initMenu } from "@lit-material/site-kit/client/menu.js";
import { initSearch } from "@lit-material/site-kit/client/search.js";
import { initReveal } from "@lit-material/site-kit/client/reveal.js";
import { initTagline } from "./reveal.js";

initThemeToggle({ key: "lit-theme" });
initMenu();
initSearch({ emptyHint: "Try a component name like <code>table</code> or <code>dialog</code>." });
initReveal();
initTagline();
