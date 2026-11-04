import { isServer } from "lit";

/** The `id` of the `<script type="application/json">` that carries server-loaded route data to the browser. */
export const ROUTE_DATA_ID = "lit-material-route-data";

interface Embedded {
  path: string;
  search: string;
  data: unknown[];
}

/**
 * The `<script type="application/json">` tag carrying a resolved route's loader data to the browser. Put it
 * in the page next to the server-rendered outlet; the outlet's first render in the browser reads it instead
 * of running the loaders again, so the page hydrates as it was rendered. `<` is escaped, so the data can't
 * end the script early. Allowed by a Content-Security-Policy as is: it's data, not a script.
 */
export function routeDataScript(route: { path: string; search?: string; data: unknown[] }): string {
  const json = JSON.stringify({ path: route.path, search: route.search ?? "", data: route.data } satisfies Embedded)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `<script type="application/json" id="${ROUTE_DATA_ID}">${json}</script>`;
}

let embedded: Embedded | undefined;
let consumed = false;

/**
 * The data the server embedded for this exact path and query, if any. `consume` marks it used: it's for the
 * first render only, so later navigations run their loaders.
 */
export function embeddedRouteData(path: string, search: string, consume = false): unknown[] | undefined {
  if (isServer || typeof document === "undefined" || consumed) return undefined;
  if (!embedded) {
    const el = document.getElementById(ROUTE_DATA_ID);
    if (!el) return undefined;
    try {
      embedded = JSON.parse(el.textContent ?? "") as Embedded;
    } catch {
      return undefined;
    }
  }
  const match = embedded.path === path && embedded.search === search ? embedded.data : undefined;
  if (consume) consumed = true;
  return match;
}
