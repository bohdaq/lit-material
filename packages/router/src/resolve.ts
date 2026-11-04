import type { RouteConfig, RouteContext } from "./route-controller.js";
import { matchRouteChain, renderRouteChain, type MatchedRouteEntry } from "./route-tree.js";

/**
 * What a `guard` returns: `true` (or nothing) lets the navigation through, `false` cancels it, and a string
 * redirects to that path instead.
 */
export type GuardResult = boolean | string | void;

export type Resolution<T> =
  | { kind: "match"; chain: MatchedRouteEntry<T>[] }
  | { kind: "redirect"; to: string }
  | { kind: "blocked" }
  | { kind: "not-found" };

/** A value, or a promise of one: resolution stays synchronous unless a guard or loader is actually async. */
type MaybePromise<V> = V | Promise<V>;

const isPromise = <V>(value: MaybePromise<V>): value is Promise<V> =>
  typeof (value as Promise<V> | undefined)?.then === "function";

/** Fills `:name` tokens in a redirect target from the matched params (`/users/:id` → `/users/42`). */
function fillParams(target: string, params: Record<string, string>): string {
  return target.replace(/:([A-Za-z_$][\w$]*)/g, (token, name: string) =>
    name in params ? encodeURIComponent(params[name]!) : token,
  );
}

function contextFor<T>(entry: MatchedRouteEntry<T>, base: RouteContext): RouteContext {
  return { ...base, params: entry.params };
}

/**
 * Runs the chain's redirects and guards, outermost first, stopping at the first one that redirects or
 * cancels. Synchronous when every guard is.
 */
export function runGuards<T>(
  chain: MatchedRouteEntry<T>[],
  base: RouteContext,
  from = 0,
): MaybePromise<Resolution<T>> {
  for (let i = from; i < chain.length; i++) {
    const entry = chain[i]!;
    const ctx = contextFor(entry, base);
    const { redirect, guard } = entry.route;
    if (redirect !== undefined) {
      return { kind: "redirect", to: typeof redirect === "function" ? redirect(ctx) : fillParams(redirect, entry.params) };
    }
    if (!guard) continue;
    const result = guard(ctx);
    if (isPromise(result)) {
      return result.then((settled) => outcome(settled) ?? runGuards(chain, base, i + 1));
    }
    const stop = outcome(result);
    if (stop) return stop;
  }
  return { kind: "match", chain };
}

function outcome(result: GuardResult): { kind: "redirect"; to: string } | { kind: "blocked" } | null {
  if (typeof result === "string") return { kind: "redirect", to: result };
  if (result === false) return { kind: "blocked" };
  return null;
}

const loaded = new WeakMap<object, Promise<unknown> | true>();

/**
 * Starts every `load()` in the chain (once per route, cached) and returns a promise that settles when they
 * all have, or `undefined` when everything is already loaded.
 */
export function loadChain<T>(chain: MatchedRouteEntry<T>[]): Promise<void> | undefined {
  const pending: Promise<unknown>[] = [];
  for (const { route } of chain) {
    if (!route.load) continue;
    const state = loaded.get(route);
    if (state === true) continue;
    if (state) {
      pending.push(state);
      continue;
    }
    const promise = route.load().then(
      () => loaded.set(route, true),
      (error: unknown) => {
        loaded.delete(route); // retry on the next navigation
        throw error;
      },
    );
    loaded.set(route, promise);
    pending.push(promise);
  }
  return pending.length > 0 ? Promise.all(pending).then(() => undefined) : undefined;
}

/** The innermost `title` in the chain, if any route declares one. */
export function titleOf<T>(chain: MatchedRouteEntry<T>[], base: RouteContext): string | undefined {
  for (let i = chain.length - 1; i >= 0; i--) {
    const entry = chain[i]!;
    const { title } = entry.route;
    if (title !== undefined) return typeof title === "function" ? title(contextFor(entry, base)) : title;
  }
  return undefined;
}

export interface ResolvedRoute<T> {
  /**
   * HTTP status to answer with: `200`, the innermost route's `status` (for a catch-all "not found" route, say
   * `404`), `404` when nothing matches, `403` when a guard cancels, or `302` for a redirect.
   */
  status: number;
  /** The final path, after following redirects (base-path free). */
  path: string;
  /** Set when `status` is `302`: where to send the client. */
  redirect?: string;
  params: Record<string, string>;
  title?: string;
  /** The rendered content, as the outlet will render it for the same path. `null` unless `status` is a match. */
  content: T | null;
}

const MAX_REDIRECTS = 10;

/**
 * Resolves a URL against `routes` the way `<lit-material-router-outlet>` does in the browser — redirects,
 * guards, lazy `load()`s — without needing `location` or `history`. For prerendering and server rendering:
 * await this, answer with its `status` (or a redirect), put its `title` in the head, then render
 * `<lit-material-router-outlet path=${result.path}>` with the same routes; every lazy route on the path is
 * loaded by then, so its elements render on the server too.
 *
 * Redirects are followed (up to 10) and reported once, as the final `redirect` with `status: 302`, so the
 * client's address bar ends up right.
 */
export async function resolveRoute<T>(routes: RouteConfig<T>[], url: string | URL): Promise<ResolvedRoute<T>> {
  let target = new URL(url, "http://localhost");
  let redirected = false;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const path = target.pathname;
    const base: RouteContext = { path, params: {}, query: target.searchParams };
    const chain = matchRouteChain(routes, path);
    const resolution: Resolution<T> = chain ? await runGuards(chain, base) : { kind: "not-found" };
    if (resolution.kind === "redirect") {
      target = new URL(resolution.to, target);
      redirected = true;
      continue;
    }
    // Wherever a redirect lands, the client has to be sent there first; it gets the final status itself.
    if (redirected) {
      const to = target.pathname + target.search + target.hash;
      return { status: 302, path, redirect: to, params: {}, content: null };
    }
    if (resolution.kind === "not-found" || !chain) return { status: 404, path, params: {}, content: null };
    if (resolution.kind === "blocked") return { status: 403, path, params: {}, content: null };
    await loadChain(chain);
    const params = chain[chain.length - 1]!.params;
    const ctx = { ...base, params };
    return {
      status: chain[chain.length - 1]!.route.status ?? 200,
      path,
      params,
      title: titleOf(chain, ctx),
      content: renderRouteChain(chain, ctx),
    };
  }
  throw new Error(`@lit-material/router: more than ${MAX_REDIRECTS} redirects resolving ${String(url)}`);
}
