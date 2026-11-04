export { matchRoute, matchRoutePrefix, type MatchedRoute, type RoutePrefixMatch } from "./match.js";
export {
  matchRouteTree,
  matchRouteChain,
  renderRouteChain,
  type MatchedTree,
  type MatchedRouteEntry,
} from "./route-tree.js";
export { navigate, ROUTE_CHANGE_EVENT, type NavigateOptions, type RouteChangeDetail } from "./navigate.js";
export {
  RouteController,
  type RouteConfig,
  type RouteContext,
  type CurrentRoute,
  type NavigationType,
  type RouteControllerOptions,
} from "./route-controller.js";
export { resolveRoute, type ResolvedRoute, type GuardResult } from "./resolve.js";
export { routeDataScript, ROUTE_DATA_ID } from "./route-data.js";
export { setServerRouteProvider, serverRoute, type ServerRoute } from "./server-route.js";
export { queryParam, parseQuery, formatQuery, type QueryParam, type QuerySchema, type QueryValues } from "./query.js";
export { LitMaterialRouterOutlet } from "./router-outlet.js";
export { setBasePath, getBasePath } from "./base-path.js";
