import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";

const usageCode = [
  'import "@lit-material/router";',
  'import type { RouteConfig } from "@lit-material/router";',
  'import { html } from "lit";',
  "",
  "const routes: RouteConfig<unknown>[] = [",
  '  { path: "/", render: () => html`<home-page></home-page>` },',
  '  { path: "/users/:id", render: (params) => html`<user-page .userId=${params.id}></user-page>` },',
  '  { path: "/*", render: (params) => html`<not-found-page path=${params.wildcard}></not-found-page>` },',
  "];",
].join("\n");

const navigateCode = [
  'import { navigate } from "@lit-material/router";',
  "",
  'navigate("/users/42");',
  'navigate("/login", { replace: true }); // replaces the current history entry instead of pushing',
].join("\n");

const nestedCode = [
  "const routes: RouteConfig<unknown>[] = [",
  "  {",
  '    path: "/dashboard",',
  "    render: (params, outlet) => html`",
  "      <dashboard-shell>",
  '        <nav slot="nav">...</nav>',
  "        ${outlet()}",
  "      </dashboard-shell>",
  "    `,",
  "    children: [",
  '      { path: "", render: () => html`<dashboard-overview></dashboard-overview>` }, // index route',
  '      { path: "settings", render: () => html`<dashboard-settings></dashboard-settings>` },',
  '      { path: "users/:id", render: (params) => html`<dashboard-user .userId=${params.id}></dashboard-user>` },',
  "    ],",
  "  },",
  "];",
].join("\n");

const routeControllerCode = [
  'import { RouteController } from "@lit-material/router";',
  'import { LitElement, html } from "lit";',
  "",
  "class SideNav extends LitElement {",
  "  private readonly route = new RouteController(this, () => routes);",
  "",
  "  override render() {",
  '    return html`<a href="/users/42" ?active=${this.route.current.path === "/users/42"}>Profile</a>`;',
  "  }",
  "}",
].join("\n");

const guardsCode = [
  "const routes: RouteConfig<unknown>[] = [",
  '  { path: "/u/:id", redirect: "/users/:id" }, // :params carry over',
  "  {",
  '    path: "/admin",',
  '    guard: async () => ((await session.user()) ? true : "/login"), // true, false, or a path',
  "    children: [",
  '      { path: "", render: () => html`<admin-home></admin-home>` },',
  '      { path: "users", render: () => html`<admin-users></admin-users>` },',
  "    ],",
  "  },",
  "];",
].join("\n");

const lazyCode = [
  "{",
  '  path: "/reports",',
  '  load: () => import("./reports-page.js"),',
  '  render: () => html`<reports-page></reports-page>`,',
  "}",
].join("\n");

const queryCode = [
  'import { formatQuery, navigate, parseQuery, queryParam } from "@lit-material/router";',
  "",
  "const usersQuery = {",
  '  page: queryParam.number(1),',
  '  sort: queryParam.oneOf(["name", "created"]),',
  "  tag: queryParam.list(),",
  "};",
  "",
  "// In a route: render: (params, outlet, { query }) => ...",
  "const { page, sort, tag } = parseQuery(usersQuery, query); // number, \"name\" | \"created\", string[]",
  "",
  'navigate(`/users${formatQuery(usersQuery, { page: page + 1, sort, tag })}`);',
].join("\n");

const titleCode = [
  "const routes: RouteConfig<unknown>[] = [",
  '  { path: "/users/:id", title: ({ params }) => `User ${params.id}`, render: ... },',
  '  { path: "/*", title: "Not found", status: 404, render: ... },',
  "];",
  "",
  '<lit-material-router-outlet .routes=${routes} title-template="%s · Admin"></lit-material-router-outlet>',
].join("\n");

const serverCode = [
  'import { resolveRoute } from "@lit-material/router";',
  "",
  "const result = await resolveRoute(routes, request.url);",
  "if (result.redirect) return Response.redirect(result.redirect, 302);",
  "",
  "const body = await collectResult(render(html`",
  "  <title>${result.title}</title>",
  "  <lit-material-router-outlet .routes=${routes} path=${result.path}></lit-material-router-outlet>",
  "`));",
  "return new Response(body, { status: result.status });",
].join("\n");

@customElement("docs-router-page")
export class DocsRouterPage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · <code>@lit-material/router</code></div>
      <h1>Router</h1>
      <p class="lede">
        A tiny router that runs in the browser, for building whole applications with <code>lit-material</code>,
        not just individual components. Path matching in the <code>/users/:id</code> style (no regex or
        <code>URLPattern</code> dependency), a route outlet that turns <code>&lt;a&gt;</code> clicks on the same
        origin into page changes without a reload, and a reactive controller for reading the current route
        without owning an outlet.
      </p>
      <p>
        Routes can redirect, guard, lazy-load, read a typed query and set the page title; the outlet restores
        scroll position on back and forward. On the server, give the outlet a <code>path</code> and it renders
        that route, so routed pages can be prerendered (see <a href="#server">Server rendering</a>).
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre tabindex="0"><code>npm install @lit-material/router</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre tabindex="0"><code>${usageCode}</code></pre>
        <pre tabindex="0"><code>&lt;lit-material-router-outlet .routes=\${routes}&gt;&lt;/lit-material-router-outlet&gt;</code></pre>
        <p>
          Any <code>&lt;a href="/users/42"&gt;</code> on the same origin, anywhere on the page (including inside
          another component's shadow root), changes the page without a reload by itself; plain links need no
          code. Use <code>navigate()</code> to navigate from code (redirects, routing after a form submit):
        </p>
        <pre tabindex="0"><code>${navigateCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>Nested routes</h2>
        <p>
          A <code>RouteConfig</code> can declare <code>children</code>: nested routes matched against
          whatever's left of the path once the parent's own <code>path</code> is consumed. The parent's
          <code>render</code> gets a second argument, <code>outlet</code>, a function that returns the matched
          child's content (or <code>null</code> if none matched); call it wherever the nested content should
          appear in the parent's own template:
        </p>
        <pre tabindex="0"><code>${nestedCode}</code></pre>
        <ul>
          <li><code>/dashboard/settings</code> renders the shell with the settings child in place of <code>outlet()</code>.</li>
          <li>
            <code>/dashboard</code> hit exactly matches the <code>path: ""</code> index child first, if one is
            declared. With no index child, the parent still renders, with <code>outlet()</code> returning
            <code>null</code>.
          </li>
          <li>
            <code>/dashboard/nope</code> (nothing under <code>children</code> matches) means the whole
            branch doesn't match at all, and matching moves on to the next sibling route. A parent never renders
            with path segments left over.
          </li>
          <li>Params merge down the tree: a parent's <code>:param</code> is still in every descendant's <code>params</code>.</li>
          <li><code>render</code> functions that take zero or one argument keep working unchanged.</li>
        </ul>
      </section>

      <section class="doc-section">
        <h2>Redirects and guards</h2>
        <p>
          <code>redirect</code> sends a path elsewhere, replacing the history entry. <code>guard</code> runs before a
          route (and everything nested in it) is shown, outermost first: return <code>true</code> to go ahead,
          <code>false</code> to cancel (the address bar goes back to the page still showing) or a path to redirect
          to. Guards may be async; the old page stays up meanwhile, with the outlet's <code>pending</code>
          attribute set. A route without <code>render</code> just wraps its children.
        </p>
        <pre tabindex="0"><code>${guardsCode}</code></pre>
        <p>Guards in the browser are for the user's sake; the server still has to check every request.</p>
      </section>

      <section class="doc-section">
        <h2>Lazy routes</h2>
        <p>
          <code>load</code> is called the first time a route matches, so its code isn't in the first bundle. The
          outlet keeps the previous page up until it settles. If it throws, the outlet fires
          <code>lit-material-route-error</code> and stays where it was; the next visit tries again.
        </p>
        <pre tabindex="0"><code>${lazyCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>Query parameters</h2>
        <p>
          <code>render</code> gets a third argument with the <code>query</code> (<code>URLSearchParams</code>), as does
          <code>RouteController.current</code>. <code>parseQuery</code> reads it typed, with a fallback for missing
          or malformed values, and <code>formatQuery</code> writes it back, leaving defaults out of the URL.
        </p>
        <pre tabindex="0"><code>${queryCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>Titles and scrolling</h2>
        <p>
          The innermost matched <code>title</code> goes in <code>document.title</code>, through
          <code>title-template</code>. After each navigation the outlet scrolls to the top, or to the
          <code>#hash</code> target, and on back or forward to where the reader was. Set
          <code>scroll-restoration="none"</code> to handle scrolling yourself.
        </p>
        <pre tabindex="0"><code>${titleCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2 id="server">Server rendering</h2>
        <p>
          <code>resolveRoute(routes, url)</code> does what the outlet does in the browser, without
          <code>location</code>: follows redirects, runs guards and waits for every <code>load</code> on the path.
          It returns the <code>status</code> (<code>200</code>, the route's own <code>status</code>, <code>404</code>,
          <code>403</code> for a cancelling guard, or <code>302</code> with <code>redirect</code>), the
          <code>title</code> and the <code>path</code>. Render the outlet with that <code>path</code>; it hydrates
          to the same content in the browser.
        </p>
        <pre tabindex="0"><code>${serverCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>Reading the route without an outlet</h2>
        <p>
          For a component that needs to react to navigation (e.g. highlighting the active item in a
          <code>NavigationRail</code>) but doesn't render the routed content itself, use
          <code>RouteController</code> directly:
        </p>
        <pre tabindex="0"><code>${routeControllerCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        <table>
          <thead>
            <tr>
              <th>Export</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>&lt;lit-material-router-outlet&gt;</code></td>
              <td>Custom element. <code>.routes: RouteConfig[]</code> property; renders the matched route's content, handles link clicks on the same origin. Attributes <code>path</code> (server only), <code>title-template</code>, <code>scroll-restoration</code>, <code>pending</code>.</td>
            </tr>
            <tr>
              <td><code>RouteConfig&lt;T&gt;</code></td>
              <td><code>{ path, render?(params, outlet, context), children?, redirect?, guard?, load?, title?, status? }</code>.</td>
            </tr>
            <tr>
              <td><code>matchRoute(pattern, pathname)</code></td>
              <td>Path matcher with no dependencies. Returns <code>{ params }</code> or <code>null</code> if <code>pattern</code> doesn't match the whole <code>pathname</code>.</td>
            </tr>
            <tr>
              <td><code>matchRoutePrefix(pattern, pathname)</code></td>
              <td>Like <code>matchRoute</code>, but only has to match a prefix. Returns <code>{ params, remaining }</code>.</td>
            </tr>
            <tr>
              <td><code>matchRouteTree(routes, pathname, parentParams?)</code></td>
              <td>Recursively matches a nested route tree, composing each level's <code>render</code> into the next.</td>
            </tr>
            <tr>
              <td><code>navigate(path, options?)</code></td>
              <td>Pushes (or with <code>{ replace: true }</code>, replaces) a history entry and notifies mounted outlets/controllers.</td>
            </tr>
            <tr>
              <td><code>RouteController</code></td>
              <td>Reactive controller for reading <code>.current</code> route/params/query without an outlet.</td>
            </tr>
            <tr>
              <td><code>resolveRoute(routes, url)</code></td>
              <td>Redirects, guards and lazy loads without a browser; returns <code>{ status, path, redirect?, title?, params, content }</code>.</td>
            </tr>
            <tr>
              <td><code>parseQuery(schema, query)</code> / <code>formatQuery(schema, values)</code></td>
              <td>Typed query parameters; build the schema with <code>queryParam.string/number/boolean/oneOf/list</code>.</td>
            </tr>
          </tbody>
        </table>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-router-page": DocsRouterPage;
  }
}
