import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import { guidePageStyles } from "../../styles/guide-page-styles.js";

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
      <div class="eyebrow">App shell · create-lit-material-app</div>
      <h1>CLI starter</h1>
      <p class="lede">
        Scaffolds a new app with lit-material, <a href="/packages/router">the router</a>,
        <a href="/packages/store">the store</a>, and <a href="/packages/core">core</a>'s theme context already
        wired together — a runnable starting point, not just a components library.
      </p>

      <section class="doc-section">
        <h2>Usage</h2>
        <pre><code>npm create lit-material-app my-app
cd my-app
npm install
npm run dev</code></pre>
        <p>(Omit <code>my-app</code> to scaffold into <code>./my-lit-material-app</code>.)</p>
      </section>

      <section class="doc-section">
        <h2>What you get</h2>
        <pre><code>${scaffoldTree}</code></pre>
        <p>
          A real, buildable Vite project depending on the actual published <code>@lit-material/*</code>
          packages (not <code>workspace:*</code> — this isn't part of the lit-material monorepo, it's a
          standalone app). Add more routes to <code>app-shell.ts</code>'s <code>routes</code> array, more
          reducer cases to <code>store.ts</code>, and more components with
          <code>npm install @lit-material/&lt;component&gt;</code> as you grow it. See the
          <a href="/guide/building-apps">Building apps guide</a> for <code>@lit-material/task</code> (data
          fetching) and <code>@lit-material/form</code> (validation) wired into the same shape once you need
          them.
        </p>
      </section>

      <section class="doc-section">
        <h2>Why hand-rolled instead of a scaffolding framework?</h2>
        <p>
          The same reasoning the router gives for hand-rolling its own path matching instead of depending on
          <code>@lit-labs/router</code>: the actual need here — copy a template directory, substitute one
          placeholder, print next steps — doesn't need <code>commander</code>/<code>inquirer</code>/a
          templating engine. The CLI is Node built-ins only (<code>fs</code>/<code>path</code>/<code>url</code>).
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
