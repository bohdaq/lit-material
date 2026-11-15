import { setBasePath } from "@lit-material/router";

// Must run before app-shell.js (and the RouteController inside it) ever reads location.pathname — static
// imports execute in the order listed in main.ts, so this only works because that file lists this import
// first.
setBasePath(import.meta.env.BASE_URL);
