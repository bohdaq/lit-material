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
        <p>The router outlet renders empty on the server (there is no location there) and fills in after hydration. Everything that measures the page, such as chart widths or the jump links' current section, settles once the browser has laid it out.</p>`],
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
  frameworks: {
    title: "React, Vue and Angular",
    lead: "lit-material components are custom elements, so they work in any framework without a wrapper package. Here is what each one needs.",
    sections: [
      ["react", "React", html`
        <p>React 19 sets properties on custom elements and listens to their events, so you can pass arrays and objects directly. On React 18, set object properties and add event listeners through a ref.</p>
        <pre tabindex="0"><code>import "@lit-material/table";

export function People({ rows }) {
  return &lt;lit-material-table caption="People" columns={columns} rows={rows} /&gt;;
}</code></pre>`],
      ["vue", "Vue", html`
        <p>Tell the compiler which tags are custom elements, then bind properties with <code>.prop</code> and listen with <code>@</code>.</p>
        <pre tabindex="0"><code>// vite.config.js
vue({ template: { compilerOptions: { isCustomElement: (tag) =&gt; tag.startsWith("lit-material-") } } })</code></pre>
        <pre tabindex="0"><code>&lt;lit-material-table caption="People" :columns.prop="columns" :rows.prop="rows" /&gt;
&lt;lit-material-switch :checked="on" @change="on = $event.target.checked" /&gt;</code></pre>`],
      ["angular", "Angular", html`
        <p>Add <code>CUSTOM_ELEMENTS_SCHEMA</code> to the component, then bind properties with <code>[ ]</code> and events with <code>( )</code>.</p>
        <pre tabindex="0"><code>@Component({
  selector: "app-people",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`&lt;lit-material-table caption="People" [columns]="columns" [rows]="rows"&gt;&lt;/lit-material-table&gt;\`,
})
export class PeopleComponent {}</code></pre>`],
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
