---
"@lit-material/router": minor
---

Route data. A route's `loader(context)` runs after its guards pass, alongside the chain's other loaders and lazy `load()`s, with an `AbortSignal` a newer navigation aborts; its result is `context.data` in `render` and `title`, and `RouteController.current.data`. The previous page stays up (`pending`) until the data is in, a failing loader fires `lit-material-route-error`, and a route with a loader never renders without its data. On the server `resolveRoute()` runs the loaders and returns `data` and `search`; give the outlet `.data=${result.data}` and embed `routeDataScript(result)` in the page, and the browser's first render reuses that data instead of loading again.
