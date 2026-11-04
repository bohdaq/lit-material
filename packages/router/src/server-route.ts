/** The route a server render is for: what an outlet without a `path` attribute renders on the server. */
export interface ServerRoute {
  /** Path with optional `?query`. */
  path: string;
  /** `resolveRoute()`'s loader data for it. */
  data?: unknown[];
}

// On globalThis under a registered symbol, not in a module variable: in dev, Vite may load the router twice
// (once for the server, once in the app's module graph), and both copies must see the same provider.
const KEY = Symbol.for("lit-material.router.serverRouteProvider");
type Provider = (() => ServerRoute | undefined) | undefined;
const store = globalThis as unknown as Record<symbol, Provider>;

/**
 * Lets server rendering tell every `<lit-material-router-outlet>` on the page which route it's rendering,
 * however deep in an app shell's shadow roots the outlet sits. `@lit-material/vite` sets this to read from an
 * `AsyncLocalStorage`, so concurrent requests don't see each other's route. An outlet's own `path`/`data`
 * still win.
 */
export function setServerRouteProvider(get: (() => ServerRoute | undefined) | undefined): void {
  store[KEY] = get;
}

/** The route the current server render is for, if a provider is set. */
export function serverRoute(): ServerRoute | undefined {
  return store[KEY]?.();
}
