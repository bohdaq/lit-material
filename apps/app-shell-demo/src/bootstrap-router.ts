import { setBasePath } from "@lit-material/router";

// Served nested at /lit-material/app-shell-demo/ in production (see vite.config.ts) — must run before
// app-shell.js (and the RouteController inside it) ever reads location.pathname. Static imports execute in
// the order listed in main.ts, so this only works because that file lists this import first (mirrors
// apps/docs/src/bootstrap-router.ts). Local dev serves at `/`, where BASE_URL is "/" and this is a no-op.
setBasePath(import.meta.env.BASE_URL);
