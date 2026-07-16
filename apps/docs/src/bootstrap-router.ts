import { setBasePath } from "@lit-material/router";

// Must run before app-shell.js (and the RouteController inside it) ever reads location.pathname — static
// imports execute in the order listed in main.ts, so this only works because that file lists this import
// first.
setBasePath(import.meta.env.BASE_URL);

// GitHub Pages has no server-side rewrites for a SPA's client-side routes — loading or refreshing any route
// other than the site root would 404 without this. public/404.html redirects here with the real path encoded
// in `?redirect=`; restore it via replaceState before anything reads location.pathname, so this looks like the
// original request rather than a `?redirect=` URL that never actually renders.
const redirect = new URLSearchParams(location.search).get("redirect");
if (redirect) {
  history.replaceState(null, "", import.meta.env.BASE_URL.replace(/\/$/, "") + redirect);
}
