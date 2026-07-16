/**
 * Prefixes an app-internal path with Vite's configured `base` (see `vite.config.ts`) — `/lit-material/foo` in
 * the production build, plain `/foo` in local dev. `@lit-material/router`'s own `setBasePath()` (called once
 * in `bootstrap-router.ts`) already makes routing itself base-aware; this is only for the `href` *text* on an
 * `<a>` tag, which a browser also uses for "open in new tab"/hover previews/copy-link — those need the real
 * prefix written in literally, not just handled by the router's click interception.
 */
export function withBase(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "") + path;
}
