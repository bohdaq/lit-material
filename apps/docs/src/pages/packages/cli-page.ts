import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";
import { withBase } from "../../with-base.js";

const scaffoldTree = [
  "my-app/",
  "├─ index.html",
  "├─ package.json",
  "├─ tsconfig.json",
  "└─ src/",
  "   ├─ main.ts          # imports tokens CSS + the app shell",
  "   ├─ app-shell.ts      # provides the theme context, defines routes, hosts the router outlet",
  "   ├─ store.ts           # one module-level store instance (a counter, to start)",
  "   ├─ home-page.ts       # a route reading both the store and the theme context",
  "   └─ about-page.ts      # a second route, to show the router actually routing",
].join("\n");

@customElement("docs-cli-page")
export class DocsCliPage extends LitElement {
  static override styles = [pageStyles, guidePageStyles];

  override render() {
    return html`
      <div class="eyebrow">App shell · <code>create-lit-material-app</code></div>
      <h1>CLI starter</h1>
      <p class="lede">
        Scaffolds a new app with <code>lit-material</code>, <a href=${withBase("/packages/router")}>the router</a>,
        <a href=${withBase("/packages/store")}>the store</a>, and <a href=${withBase("/packages/core")}>core</a>'s
        theme context already wired together: a starting point that runs, not just a components library.
      </p>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre tabindex="0"><code>npm create lit-material-app my-app                    # the spa template
npm create lit-material-app my-blog -- --template ssr  # the ssr template
cd my-app
npm install
npm run dev</code></pre>
        <p>(Omit <code>my-app</code> to scaffold into <code>./my-lit-material-app</code>; <code>--help</code> lists the templates.)</p>
        <p>
          <strong><code>spa</code></strong> (the default) is a client-rendered app with the router, store and theme
          context wired together. <strong><code>ssr</code></strong> is a server-rendered app on
          <code>@lit-material/vite</code>: routes with loaders, a redirect and a 404, prerendered pages on
          <code>npm run build</code>, and a Node server for <code>npm start</code>.
        </p>
      </section>

      <section class="doc-section">
        <h2>What the spa template gives you</h2>
        <pre tabindex="0"><code>${scaffoldTree}</code></pre>
        <p>
          A real, buildable Vite project depending on the actual published <code>@lit-material/*</code>
          packages (not <code>workspace:*</code>: this isn't part of the <code>lit-material</code> monorepo, it's a
          standalone app). Add more routes to <code>app-shell.ts</code>'s <code>routes</code> array, more
          reducer cases to <code>store.ts</code>, and more components with
          <code>npm install @lit-material/&lt;component&gt;</code> as you grow it. See the
          <a href=${withBase("/guide/building-apps")}>Building apps guide</a> for <code>@lit-material/task</code> (data
          fetching) and <code>@lit-material/form</code> (validation) wired into the same shape once you need
          them.
        </p>
      </section>

      <section class="doc-section">
        <h2>Why written by hand instead of a scaffolding framework?</h2>
        <p>
          The same reasoning the router gives for writing its own path matching instead of depending on
          <code>@lit-labs/router</code>. The actual need here (copy a template directory, substitute a few
          placeholders, print next steps) doesn't need <code>commander</code>/<code>inquirer</code>/a
          templating engine. The CLI uses only modules built into Node (<code>fs</code>/<code>path</code>/<code>url</code>).
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-cli-page": DocsCliPage;
  }
}
