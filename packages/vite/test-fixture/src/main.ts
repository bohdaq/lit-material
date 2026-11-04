import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
import "./app-shell.js";

(window as unknown as { hydrated: boolean }).hydrated = true;
