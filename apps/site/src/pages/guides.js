// /guides/<slug>/ — the three guides written for this site (install, server
// rendering, frameworks) and the existing docs guides, embedded.
import { html } from "lit";
import { unsafeStatic, html as staticHtml } from "lit/static-html.js";
import { allGuides } from "../catalog.js";
import { docsLayout } from "../shell.js";
import { faq, kbd, shortcuts, steps, terminal } from "@lit-material/site-kit/templates.js";

const WRITTEN = {
  install: {
    title: "Install lit-material",
    lead: "Link the design tokens once, install the components you use, and use them as HTML elements.",
    sections: [
      ["link-tokens", "Link the tokens once", html`
        <p>Every component reads its colours, type and shapes from CSS custom properties in <code>@lit-material/tokens</code>. Load the stylesheet once per page:</p>
        <pre tabindex="0"><code>npm install @lit-material/tokens</code></pre>
        <pre tabindex="0"><code>&lt;link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" /&gt;</code></pre>
        <p>With a bundler, import it from your entry file instead: <code>import "@lit-material/tokens/css/index.css";</code></p>`],
      ["install-components", "Install the components you use", html`
        <p>Each component is a package of its own, so you install a button without installing a component library:</p>
        <pre tabindex="0"><code>npm install @lit-material/button @lit-material/text-field</code></pre>
        <p>A package that holds several elements also has one entry point per element. <code>@lit-material/text-field</code> registers the text field, textarea, number field and input group; <code>@lit-material/text-field/text-field.js</code> registers only the text field.</p>`],
      ["use-them", "Use them as HTML", html`
        <pre tabindex="0"><code>import "@lit-material/button";
import "@lit-material/text-field/text-field.js";</code></pre>
        <pre tabindex="0"><code>&lt;lit-material-text-field label="Email" type="email" required&gt;&lt;/lit-material-text-field&gt;
&lt;lit-material-button variant="filled"&gt;Save&lt;/lit-material-button&gt;</code></pre>
        <p>Form fields take part in a surrounding <code>&lt;form&gt;</code> through <code>ElementInternals</code>, so <code>FormData</code>, validation and reset work as they do with native inputs.</p>`],
      ["dark-mode", "Light and dark mode", html`
        <p>The tokens follow the visitor's system setting. <a href="/components/color-scheme/">Color scheme</a> adds a toggle that remembers a choice, and the <a href="/guides/theming/">theme builder</a> makes a palette from one seed colour.</p>`],
      ["new-app", "Starting a whole app", html`
        <p><code>npm create lit-material-app my-app</code> scaffolds a Vite app with routing, a store and a few pages. See <a href="/guides/create-app/">Create an app</a>.</p>`],
    ],
  },
  "server-rendering": {
    title: "Server rendering",
    lead: "Every element renders on the server with Lit SSR and hydrates in the browser without changing what it shows. CI checks all of them on every change.",
    sections: [
      ["render", "Render on the server", html`
        <p>Render a Lit template with <code>@lit-labs/ssr</code>. Each element's shadow DOM is written as a declarative shadow root, so the page is styled and readable before any script loads.</p>
        <pre tabindex="0"><code>import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "@lit-material/button";

const markup = await collectResult(render(html\`&lt;lit-material-button&gt;Save&lt;/lit-material-button&gt;\`));</code></pre>`],
      ["hydrate", "Hydrate in the browser", html`
        <p>Load the hydration support before Lit itself, then the same components. They take over the server's markup instead of rendering again.</p>
        <pre tabindex="0"><code>import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
import "@lit-material/button";</code></pre>`],
      ["data", "Pass data as attributes", html`
        <p>A property set on the server never reaches the markup, so the browser would start without it and the first render would differ. Components that render arrays take them as JSON attributes too: chart <code>data</code>, <code>series</code> and <code>values</code>, table <code>columns</code> and <code>rows</code>, dual list <code>items</code>, chip input <code>values</code>, jump links <code>links</code>.</p>
        <pre tabindex="0"><code>html\`&lt;lit-material-table caption="People" columns=\${JSON.stringify(columns)} rows=\${JSON.stringify(rows)}&gt;&lt;/lit-material-table&gt;\`</code></pre>`],
      ["client-only", "What stays in the browser", html`
        <p>The router outlet renders nothing on the server unless you give it a <code>path</code>; <code>resolveRoute()</code> from <code>@lit-material/router</code> runs redirects, guards and lazy loads first and gives you the status and title (see the <a href="/guides/router/">Router guide</a>). Everything that measures the page, such as chart widths or the jump links' current section, settles once the browser has laid it out.</p>`],
      ["checked", "How it's checked", html`
        <p>CI renders every element on the server, loads the result in Chromium, hydrates it and fails if hydration throws or changes an element's text or structure: 121 cases today. This site is rendered the same way.</p>`],
    ],
  },
  "site-kit": {
    title: "Static sites",
    lead: "@lit-material/site-kit holds the pieces of a prerendered site that have to work before any script runs: plain HTML templates, one stylesheet, and small scripts that add behaviour. This site and rws8.tech are built with it.",
    sections: [
      ["install-kit", "Install", html`
        <pre tabindex="0"><code>npm install @lit-material/site-kit</code></pre>
        <p>Render the templates with Lit SSR (or any Lit render), load <code>@lit-material/site-kit/css/site-kit.css</code>, and call the <code>init</code> functions from your client entry. The styles sit in one cascade layer, so your own CSS overrides them without specificity fights.</p>`],
      ["faq", "FAQ", html`
        <p>Questions on native <code>&lt;details&gt;</code>: they open without JavaScript, find-in-page reaches closed answers, and <code>exclusive</code> keeps one open at a time.</p>
        ${faq([
          { question: "Does it need JavaScript?", answer: "No. Each question is a <details> element; the browser opens and closes it.", open: true },
          { question: "Can more than one be open?", answer: "Not with exclusive set: it becomes the name attribute, and opening one closes the others." },
          { question: "Is it searchable?", answer: "Yes. Ctrl+F finds text in closed answers and opens them." },
        ], { exclusive: "kit-faq" })}
        <pre tabindex="0"><code>faq([{ question: "Does it need JavaScript?", answer: "No." }], { exclusive: "faq" })</code></pre>`],
      ["steps", "Numbered steps", html`
        ${steps([
          { title: "Install the kit", body: html`<code>npm install @lit-material/site-kit</code>` },
          { title: "Render the templates", body: "On the server, in your prerender step." },
          { title: "Call the scripts", body: "In the client entry, once." },
        ], { label: "Using the kit" })}
        <p>An <code>&lt;ol&gt;</code> numbered by CSS counters, so screen readers count the steps.</p>`],
      ["terminal", "Terminal", html`
        ${terminal([{ cmd: "npm create lit-material-app my-app" }, { out: "Scaffolding my-app…" }, { cmd: "cd my-app && npm run dev" }, { out: "Local: http://localhost:5173/", accent: true }], { label: "A terminal: npm create lit-material-app scaffolds an app and npm run dev serves it on port 5173.", title: "my-app" })}
        <p>The prerendered block shows the finished session; <code>initTerminal()</code> replays it while it's on screen, unless the visitor prefers reduced motion. It is one image to assistive technology, described by <code>label</code>.</p>`],
      ["keys", "Keys and shortcuts", html`
        <p>Press ${kbd("/")} or ${kbd("Ctrl", "K")} to search this site.</p>
        ${shortcuts([{ action: "Search", keys: [["/"], ["Ctrl", "K"]] }, { action: "Close search", keys: [["Esc"]] }], { label: "Shortcuts on this site" })}`],
      ["scripts", "Scripts", html`
        <pre tabindex="0"><code>import { initThemeToggle } from "@lit-material/site-kit/client/theme.js";
import { initMenu } from "@lit-material/site-kit/client/menu.js";
import { initSearch } from "@lit-material/site-kit/client/search.js";
import { initTerminal } from "@lit-material/site-kit/client/terminal.js";
import { initReveal } from "@lit-material/site-kit/client/reveal.js";

initThemeToggle({ key: "my-theme" });
initMenu();
initSearch({ emptyHint: "Try a component name." });
initTerminal();
initReveal();</code></pre>
        <ul>
          <li><b>Theme:</b> <code>themeBootScript(key)</code> goes inline in <code>&lt;head&gt;</code>. It applies the stored choice before first paint and adds <code>js</code> to <code>&lt;html&gt;</code>. The <code>themeToggle</code> icon follows the theme in CSS, so it is right before scripts run.</li>
          <li><b>Menu:</b> <code>menuToggle()</code> opens the panel it controls. Escape closes it and returns focus; widening past the breakpoint closes it too.</li>
          <li><b>Search:</b> <code>searchDialog()</code> plus <code>searchButton()</code>. The Pagefind index loads on first use; pass <code>load</code> for another index.</li>
          <li><b>Reveal:</b> <code>.reveal</code> elements get <code>.in</code> on entering the viewport. Hide them only under <code>html.js</code>.</li>
        </ul>`],
    ],
  },
  i18n: {
    title: "Languages and right to left",
    lead: "Components speak the language of the page: the nearest lang attribute, or <html lang>. Their own text (button names, announcements, counts) comes from message catalogs, dates and numbers from Intl, and every layout mirrors under dir=\"rtl\".",
    sections: [
      ["language", "Set the language", html`
        <p>Components use the nearest <code>lang</code> attribute above them, through shadow roots, and re-render when <code>&lt;html lang&gt;</code> or <code>&lt;html dir&gt;</code> changes. Dates, numbers and the first day of the week follow it even before any catalog is loaded.</p>
        <pre tabindex="0"><code>&lt;html lang="de"&gt;
&lt;section lang="ar" dir="rtl"&gt;…&lt;/section&gt;</code></pre>`],
      ["catalogs", "Load translations", html`
        <p>English is built in. <code>@lit-material/translations</code> has Arabic, German, Spanish, French, Japanese, Polish and Ukrainian, one module each, so you ship only the ones you import.</p>
        <pre tabindex="0"><code>import { registerTranslation } from "@lit-material/core/localize.js";
import de from "@lit-material/translations/de.js";
import ar from "@lit-material/translations/ar.js";

registerTranslation(de, ar);</code></pre>
        <p>A missing language or message falls back to the base language (<code>de</code> for <code>de-AT</code>), then to English. Register the same <code>$code</code> again to change single messages: <code>registerTranslation({ $code: "en", "alert.dismiss": "Close" })</code>.</p>`],
      ["plural", "Counts and placeholders", html`
        <p>Messages are text with <code>{name}</code> placeholders; numbers in them are formatted for the language. Counts are plural objects chosen through <code>Intl.PluralRules</code>, so Polish gets its few and many forms and Arabic all six.</p>
        <pre tabindex="0"><code>"diff.unchangedLines": { one: "{count} unchanged line", other: "{count} unchanged lines" }</code></pre>
        <p>To add a language, start from the <code>en</code> catalog and type yours with <code>satisfies Catalog</code>: TypeScript then fails when a component adds a message you haven't translated.</p>`],
      ["rtl", "Right to left", html`
        <p>Set <code>dir="rtl"</code> on <code>&lt;html&gt;</code> or any container. Layout uses logical CSS properties; tabs, radio groups, segmented buttons, steppers, date grids, trees and carousels flip their arrow keys; menus, popovers and selects open from the start edge; chevrons and other directional icons mirror. Code, clock dials and a line chart's time axis stay left to right, as they read the same way in every language.</p>`],
      ["app-text", "Your app's own text", html`
        <p>The catalogs cover the components' text. For your own strings use <a href="https://lit.dev/docs/localization/overview/"><code>@lit/localize</code></a>, or register keys of your own and read them with a <code>LocalizeController</code>: <code>this.localize.term("app.greeting", "Hello")</code>.</p>`],
      ["server", "Server rendering", html`
        <p>On the server there's no page to read <code>&lt;html lang&gt;</code> from: put <code>lang</code> on the element or call <code>setFallbackLocale()</code> before rendering, so the server's text matches the browser's when it hydrates.</p>`],
    ],
  },
  data: {
    title: "Data and forms",
    lead: "Fetch with @lit-material/http, cache and refresh with TaskController, validate with FormController: three small pieces that fit together without a framework.",
    sections: [
      ["client", "An HTTP client", html`
        <p><code>createHttp</code> wraps <code>fetch</code>: a base URL, JSON in and out, query objects, timeouts, and an <code>HttpError</code> with the status and parsed body for anything outside 200–299. Interceptors add headers and can refresh a token and retry once on 401.</p>
        <pre tabindex="0"><code>import { createHttp } from "@lit-material/http";

export const api = createHttp({ baseUrl: "/api", headers: () => ({ Authorization: \`Bearer \${session.token}\` }) });

api.use({
  response: async (response, { retry, attempt }) =&gt;
    response.status === 401 &amp;&amp; attempt === 1 ? (await session.refresh(), retry()) : response,
});</code></pre>`],
      ["cache", "Cached data", html`
        <p>Give a task a <code>key</code> and its result is shared: every component asking for the same key shows it at once and shares one request, a stale value shows while a fresh one loads, and <code>retry</code> handles flaky networks.</p>
        <pre tabindex="0"><code>private readonly user = new TaskController(this, {
  task: ([id], signal) =&gt; api.get(\`/users/\${id}\`, { signal }),
  args: () =&gt; [this.userId] as const,
  key: ([id]) =&gt; ["user", id],
  staleTime: 30_000,
  retry: 2,
  refetchOnFocus: true,
});</code></pre>
        <p>After a change, <code>taskCache.invalidate(["user"])</code> re-fetches every user on screen, and <code>taskCache.set(key, value)</code> shows a value everywhere straight away.</p>`],
      ["forms", "Validated forms", html`
        <p><code>FormController</code> reads a form's values (dotted names nest: <code>items.0.name</code>), runs field validators, sync or async, and any Standard Schema (zod, valibot, arktype), and shows the messages on the fields themselves. <code>handleSubmit</code> runs everything and calls you only with valid values.</p>
        <pre tabindex="0"><code>private readonly form = new FormController(this, {
  form: () =&gt; this.formEl,
  schema: signupSchema,                       // a zod schema, say
  validators: {
    email: async (value, _values, signal) =&gt;
      (await api.get("/emails/taken", { query: { value }, signal })) ? "Already registered" : undefined,
  },
});

render() {
  return html\`&lt;form @submit=\${this.form.handleSubmit((values) =&gt; api.post("/signup", values))}&gt;…&lt;/form&gt;\`;
}</code></pre>
        <p>Repeating rows use a <code>FieldArrayController</code>: stable keys for <code>repeat()</code>, and <code>append</code>, <code>remove</code> and <code>move</code>.</p>`],
    ],
  },
  security: {
    title: "Security, CSP and SBOMs",
    lead: "lit-material runs under a strict Content-Security-Policy with Trusted Types enforced, and every published package carries an SBOM and npm provenance.",
    sections: [
      ["csp", "Content-Security-Policy", html`
        <p>A client-rendered app needs no <code>'unsafe-inline'</code> and no <code>'unsafe-eval'</code>. CI renders every element in Chromium under this policy and fails on any violation:</p>
        <pre tabindex="0"><code>Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  require-trusted-types-for 'script';
  trusted-types lit-html</code></pre>
        <p>Component styles are constructable stylesheets, which a <code>style-src</code> doesn't block. Inline styles that change at runtime (a progress bar's width, a tooltip's position) are set through the CSSOM with <code>cssProps</code> from <code>@lit-material/core</code>, never as a <code>style</code> attribute.</p>`],
      ["trusted-types", "Trusted Types", html`
        <p>Components never assign HTML strings to the DOM themselves; Lit's own <code>lit-html</code> policy covers its templates, including icons registered with <code>registerIcons</code> (whose SVG strings are yours, so register only markup you trust). Allow <code>lit-html</code> in <code>trusted-types</code>. Site-kit's search box uses a policy named <code>lit-material-site-kit</code>; list it too if you use it.</p>`],
      ["ssr", "Server-rendered pages", html`
        <p>Server rendering writes each element's styles as a <code>&lt;style&gt;</code> inside its declarative shadow root, and runtime inline styles as <code>style</code> attributes, so the first paint can show them before any script runs. A server-rendered page therefore needs inline styles allowed (<code>style-src 'self' 'unsafe-inline'</code>); scripts can stay strict. Inline styles can't run code. The color-scheme boot script is inline: allow it by hash (<code>script-src 'sha256-…'</code>, computed from <code>colorSchemeBootScript()</code>'s output) or serve it as a file.</p>`],
      ["sbom", "SBOMs and provenance", html`
        <p>Every package ships a CycloneDX SBOM of its runtime dependency tree at <code>dist/sbom.cdx.json</code> inside the npm tarball, generated from the lockfile when it's released; it includes the other lit-material packages it depends on. Packages are published from GitHub Actions with npm provenance, so <code>npm audit signatures</code> verifies each one was built from this repository's source.</p>
        <pre tabindex="0"><code>npm audit signatures
cat node_modules/@lit-material/button/dist/sbom.cdx.json</code></pre>`],
    ],
  },
  frameworks: {
    title: "React, Vue and Angular",
    lead: "lit-material components are custom elements, so they work in any framework as they are. Every component package also ships React wrappers, JSX and Vue typings, and editor metadata, generated from its custom elements manifest.",
    sections: [
      ["react", "React", html`
        <p>React 19 sets properties on custom elements and listens to their events, so the tags work directly. Load the package's JSX typings once to type them; an event prop is <code>on</code> plus the event name as written.</p>
        <pre tabindex="0"><code>import "@lit-material/table";
import type {} from "@lit-material/table/jsx";

export function People({ rows }) {
  return &lt;lit-material-table caption="People" columns={columns} rows={rows} /&gt;;
}</code></pre>
        <p>On React 18, or for camel-case event props, use the wrappers in each package's <code>/react</code> entry. They're built on <code>@lit/react</code> (install it with <code>react</code>): properties go in as properties, and events map to <code>onChange</code>, <code>onLitMaterialRouteError</code> and so on.</p>
        <pre tabindex="0"><code>npm install @lit/react</code></pre>
        <pre tabindex="0"><code>import { Checkbox } from "@lit-material/checkbox/react";

&lt;Checkbox label="Accept" checked={accepted} onChange={(e) =&gt; setAccepted(e.target.checked)} /&gt;</code></pre>`],
      ["vue", "Vue", html`
        <p>Tell the compiler which tags are custom elements, then bind properties with <code>.prop</code> and listen with <code>@</code>. Load the package's Vue typings once and Volar checks the props in templates.</p>
        <pre tabindex="0"><code>// vite.config.js
vue({ template: { compilerOptions: { isCustomElement: (tag) =&gt; tag.startsWith("lit-material-") } } })

// env.d.ts
import type {} from "@lit-material/table/vue";
import type {} from "@lit-material/switch/vue";</code></pre>
        <pre tabindex="0"><code>&lt;lit-material-table caption="People" :columns.prop="columns" :rows.prop="rows" /&gt;
&lt;lit-material-switch :checked="on" @change="on = $event.target.checked" /&gt;</code></pre>`],
      ["angular", "Angular", html`
        <p>Add <code>CUSTOM_ELEMENTS_SCHEMA</code> to the component, then bind properties with <code>[ ]</code> and events with <code>( )</code>. Angular doesn't type-check bindings on custom elements under that schema; the editor metadata below gives completion and docs in templates.</p>
        <pre tabindex="0"><code>@Component({
  selector: "app-people",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`&lt;lit-material-table caption="People" [columns]="columns" [rows]="rows"&gt;&lt;/lit-material-table&gt;\`,
})
export class PeopleComponent {}</code></pre>`],
      ["editors", "Editor completion", html`
        <p>Each package ships <code>dist/web-types.json</code>, which WebStorm and other JetBrains IDEs pick up from <code>node_modules</code> on their own, and <code>dist/vscode.html-custom-data.json</code> for VS Code:</p>
        <pre tabindex="0"><code>// .vscode/settings.json
{ "html.customData": ["./node_modules/@lit-material/button/dist/vscode.html-custom-data.json"] }</code></pre>`],
      ["plain", "Plain HTML", html`
        <p>Import the module and write the tag. Arrays and objects go in as properties from script, or as JSON attributes in markup.</p>`],
    ],
  },
};

export function guidePage(slug, entry) {
  const guide = allGuides().find((g) => g.slug === slug);
  const written = WRITTEN[slug];
  const path = `/guides/${slug}/`;
  if (written) {
    const meta = { path, title: `${written.title} · lit-material`, description: written.lead };
    return {
      meta,
      render: () =>
        docsLayout({
          path,
          toc: written.sections.map(([id, text]) => ({ id, text })),
          content: html`
            <article class="docs-article prose-page" data-pagefind-body>
              <p class="breadcrumb"><a href="/guides/install/">Guides</a></p>
              <h1>${written.title}</h1>
              <p class="docs-lead">${written.lead}</p>
              <div class="prose">${written.sections.map(([id, text, body]) => html`<h2 id=${id}>${text}</h2>${body}`)}</div>
            </article>`,
        }),
    };
  }
  const result = entry.render({});
  const tag = /<(docs-[a-z0-9-]+)/.exec(result.strings.join(""))?.[1];
  const meta = { path, title: `${guide.label} · lit-material`, description: `${guide.label}: a lit-material guide.` };
  return {
    meta,
    render: () =>
      docsLayout({
        path,
        content: html`
          <article class="docs-article" data-search-embed>
            <p class="breadcrumb"><a href="/guides/install/">Guides</a></p>
            <h1>${guide.label}</h1>
            <div class="demo guide-embed">${tag ? staticHtml`<${unsafeStatic(tag)} embedded></${unsafeStatic(tag)}>` : result}</div>
          </article>`,
      }),
  };
}
