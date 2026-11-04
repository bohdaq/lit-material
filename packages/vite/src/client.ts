// Import first in the app's browser entry, before any element is defined: Lit then takes over the
// server-rendered markup (hydrates) instead of rendering every element again.
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
