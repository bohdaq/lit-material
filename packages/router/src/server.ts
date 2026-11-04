// The router's server-side pieces, without the outlet element: for server tooling (like @lit-material/vite)
// that resolves routes but must not define elements itself (the app's own bundle does that).
export { resolveRoute, type ResolvedRoute, type GuardResult } from "./resolve.js";
export { routeDataScript, ROUTE_DATA_ID } from "./route-data.js";
export { setServerRouteProvider, serverRoute, type ServerRoute } from "./server-route.js";
export type { RouteConfig, RouteContext } from "./route-controller.js";
