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

@customElement("docs-router-page")
export class DocsRouterPage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · @lit-material/router</div>
      <h1>Router</h1>
      <p class="lede">
        A tiny client-side router for building whole applications with lit-material — not just individual
        components. Path matching (<code>/users/:id</code>-style, no regex/<code>URLPattern</code>
        dependency), an SPA route outlet that intercepts same-origin <code>&lt;a&gt;</code> clicks, and a
        reactive controller for reading the current route without owning an outlet.
      </p>
      <p>
        <strong>Client-side only.</strong> Routing depends on <code>window.history</code>/<code>location</code>,
        so — unlike every other <code>@lit-material/*</code> package — this one isn't safe to import from an
        SSR entry point.
      </p>

      <section class="doc-section">
        <h2>Install</h2>
        <pre><code>npm install @lit-material/router</code></pre>
      </section>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre><code>${usageCode}</code></pre>
        <pre><code>&lt;lit-material-router-outlet .routes=\${routes}&gt;&lt;/lit-material-router-outlet&gt;</code></pre>
        <p>
          Any same-origin <code>&lt;a href="/users/42"&gt;</code> anywhere on the page — including inside
          another component's shadow root — becomes an SPA navigation automatically; no need to call anything
          yourself for plain links. Use <code>navigate()</code> for programmatic navigation (redirects,
          post-submit routing):
        </p>
        <pre><code>${navigateCode}</code></pre>
      </section>

      <section class="doc-section">
        <h2>Nested routes</h2>
        <p>
          A <code>RouteConfig</code> can declare <code>children</code> — nested routes matched against
          whatever's left of the path once the parent's own <code>path</code> is consumed. The parent's
          <code>render</code> gets a second argument, <code>outlet</code>, a function that returns the matched
          child's content (or <code>null</code> if none matched); call it wherever the nested content should
          appear in the parent's own template:
        </p>
        <pre><code>${nestedCode}</code></pre>
        <ul>
          <li><code>/dashboard/settings</code> renders the shell with the settings child in place of <code>outlet()</code>.</li>
          <li>
            <code>/dashboard</code> hit exactly matches the <code>path: ""</code> index child first, if one is
            declared. With no index child, the parent still renders, with <code>outlet()</code> returning
            <code>null</code>.
          </li>
          <li>
            <code>/dashboard/nope</code> (nothing under <code>children</code> matches) means the whole
            branch doesn't match at all — falls through to the next sibling route. A parent never renders with
            unaccounted-for path segments.
          </li>
          <li>Params merge down the tree: a parent's <code>:param</code> is still in every descendant's <code>params</code>.</li>
          <li>Existing zero/one-argument <code>render</code> functions keep working unchanged.</li>
        </ul>
      </section>

      <section class="doc-section">
        <h2>Reading the route without an outlet</h2>
        <p>
          For a component that needs to react to navigation (e.g. highlighting the active item in a
          <code>NavigationRail</code>) but doesn't render the routed content itself, use
          <code>RouteController</code> directly:
        </p>
        <pre><code>${routeControllerCode}</code></pre>
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
              <td>Custom element. <code>.routes: RouteConfig[]</code> property; renders the matched route's content, intercepts same-origin link clicks.</td>
            </tr>
            <tr>
              <td><code>RouteConfig&lt;T&gt;</code></td>
              <td><code>{ path, render(params, outlet), children? }</code> — a route, optionally with nested routes.</td>
            </tr>
            <tr>
              <td><code>matchRoute(pattern, pathname)</code></td>
              <td>Dependency-free path matcher. Returns <code>{ params }</code> or <code>null</code> if <code>pattern</code> doesn't match the whole <code>pathname</code>.</td>
            </tr>
            <tr>
              <td><code>matchRoutePrefix(pattern, pathname)</code></td>
              <td>Like <code>matchRoute</code>, but only has to match a prefix — returns <code>{ params, remaining }</code>.</td>
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
              <td>Reactive controller for reading <code>.current</code> route/params without an outlet.</td>
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
