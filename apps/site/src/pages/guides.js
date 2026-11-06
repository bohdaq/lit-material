// /guides/<slug>/ — the three guides written for this site (install, server
// rendering, frameworks) and the existing docs guides, embedded.
import { html } from "lit";
import { unsafeStatic, html as staticHtml } from "lit/static-html.js";
import { allGuides } from "../catalog.js";
import { docsLayout, articleLd } from "../shell.js";
import { faq, kbd, shortcuts, steps, terminal } from "@lit-material/site-kit/templates.js";
import { ELEMENTS, targetLabel } from "@lit-material/codemod/mappings";

const cells = (columns, rows) => html`
  <div class="table-wrap">
    <table class="api-table">
      <thead><tr>${columns.map((c) => html`<th scope="col">${c}</th>`)}</tr></thead>
      <tbody>${rows.map((r) => html`<tr>${r.map((cell) => html`<td>${cell}</td>`)}</tr>`)}</tbody>
    </table>
  </div>`;

const codeList = (items) => (items.length ? items.map((t, i) => html`${i ? ", " : ""}<code>${t}</code>`) : html`<span class="muted">none</span>`);

/** One row of the @material/web table, read from the codemod's own mapping table. */
function mdWebRow(m) {
  if (!m.to) return [html`<code>${m.md}</code>`, html`<span class="muted">none</span>`, "", m.why];
  const rewritten = [];
  if (m.alternate) rewritten.push(`${m.alternate.attribute}="${m.alternate.value}" → ${m.alternate.to}`);
  for (const [name, r] of Object.entries(m.attributes ?? {})) {
    if (r.kind === "rename") {
      const values = Object.entries(r.values ?? {}).filter(([a, b]) => a !== b).map(([a, b]) => `${a} → ${b}`);
      rewritten.push(r.to === name ? `${name}: ${values.join(", ")}` : `${name} → ${r.to}${values.length ? ` (${values.join(", ")})` : ""}`);
    } else if (r.kind === "content") rewritten.push(`${name} → text${r.alsoSet ? ` + ${r.alsoSet}` : ""}`);
    else if (r.kind === "expand") rewritten.push(`${name} → ${r.to.join(" ")}`);
    else if (r.kind === "byValue") rewritten.push(Object.entries(r.cases).map(([a, b]) => `${name}="${a}" → ${b || "removed"}`).join(", "));
    else if (r.kind === "remove") rewritten.push(`${name} removed`);
  }
  for (const [k, v] of Object.entries(m.defaults ?? {})) rewritten.push(`adds ${v === true ? k : `${k}="${v}"`}`);
  for (const [name, r] of Object.entries(m.events ?? {})) if (r.kind === "rename") rewritten.push(`${name} event → ${r.to}`);
  for (const [name, r] of Object.entries(m.childSlots ?? {})) if (r === null || typeof r === "string") rewritten.push(`slot="${name}" → ${r === null ? "default slot" : `slot="${r}"`}`);
  if (m.iconSlot) rewritten.push(`unslotted md-icon → slot="${m.iconSlot}"`);
  const reported = [
    ...Object.entries(m.attributes ?? {}).filter(([, r]) => r.kind === "warn").map(([n]) => n),
    ...Object.entries(m.events ?? {}).filter(([, r]) => r.kind === "warn").map(([n]) => `${n} event`),
    ...Object.entries(m.childSlots ?? {}).filter(([, r]) => r && typeof r === "object").map(([n]) => `slot="${n}"`),
  ];
  return [html`<code>${m.md}</code>`, html`<code>${targetLabel(m)}</code>`, html`<code>${m.package}</code>`, html`${codeList(rewritten)}${reported.length ? html`<br />Reported, left as is: ${codeList(reported)}` : ""}`];
}

/** Angular Material → lit-material: [Angular Material, lit-material elements, package, notes]. Tags checked against each package's custom-elements.json. */
const ANGULAR_MATERIAL = [
  ["mat-button, mat-flat-button, mat-stroked-button, mat-raised-button (matButton)", "lit-material-button", "button", html`<code>variant</code>: <code>text</code>, <code>filled</code>, <code>outlined</code>, <code>elevated</code>, <code>tonal</code>. <code>href</code> renders a link.`],
  ["mat-icon-button", "lit-material-icon-button", "icon-button", html`Icon in <code>slot="icon"</code>; <code>toggle</code> + <code>selected</code> for a toggle button. Always give it an <code>aria-label</code>.`],
  ["mat-fab, mat-mini-fab, extended fab", "lit-material-fab", "fab", html`<code>size="small"</code> for mini, <code>extended</code> with label text; <code>color</code> picks the container colour.`],
  ["mat-form-field + matInput", "lit-material-text-field, lit-material-textarea", "text-field", html`<code>mat-label</code> → <code>label</code>, <code>mat-hint</code> → <code>supporting-text</code>, <code>mat-error</code> → <code>error-text</code> + <code>error</code>, <code>appearance="outline"</code> → <code>variant="outlined"</code>, text prefix/suffix → <code>prefix</code>/<code>suffix</code>, icon prefix/suffix → <code>leading-icon</code>/<code>trailing-icon</code> slots. Numbers: <code>lit-material-number-field</code>.`],
  ["mat-select + mat-option", "lit-material-select, lit-material-select-option", "select", html`Single selection only: <strong>gap</strong> for <code>multiple</code> (consider <code>lit-material-dual-list-selector</code> or filter chips). No option groups.`],
  ["mat-autocomplete", "lit-material-autocomplete", "autocomplete", html`Options are data: <code>[options]="[{ value, label }]"</code>; <code>free-text</code> accepts values outside the list.`],
  ["mat-checkbox", "lit-material-checkbox", "checkbox", html`Label text goes in the <code>label</code> attribute; <code>indeterminate</code> as in Angular Material.`],
  ["mat-slide-toggle", "lit-material-switch", "switch", html`<code>checked</code>, <code>change</code>; thumb icons in the <code>icon</code>/<code>selected-icon</code> slots.`],
  ["mat-radio-group + mat-radio-button", "lit-material-radio", "radio", html`No group element (<strong>gap</strong>): radios with the same <code>name</code> form a group, with arrow-key movement; put them in a <code>fieldset</code> or <code>role="radiogroup"</code> for the group's label.`],
  ["mat-slider", "lit-material-slider", "slider", html`One thumb only: <strong>gap</strong> for a range slider (<code>matSliderStartThumb</code>/<code>matSliderEndThumb</code>).`],
  ["mat-chip, mat-chip-listbox, mat-chip-grid", "lit-material-chip, lit-material-chip-input", "chip", html`<code>variant</code>: <code>assist</code>, <code>filter</code>, <code>input</code>, <code>suggestion</code>. A chip grid with an input is <code>lit-material-chip-input</code> (<code>values</code>, <code>change</code>). No listbox element around chips.`],
  ["mat-button-toggle-group", "lit-material-segmented-button-group, lit-material-segmented-button", "segmented-button", html`<code>multiselect</code> on the group.`],
  ["MatDialog (service), mat-dialog-*", "lit-material-dialog, lit-material-confirm-dialog", "dialog, confirm", html`An element in your template, not a service: see below. <code>confirm()</code> returns a promise like <code>afterClosed()</code>.`],
  ["mat-menu + matMenuTriggerFor", "lit-material-menu, lit-material-list-item", "menu, list", html`<code>anchor</code> (an id) or <code>show(trigger)</code>; items are <code>lit-material-list-item interactive</code>. Nested menus: <strong>gap</strong>.`],
  ["mat-tab-group, mat-tab", "lit-material-tabs, lit-material-tab, lit-material-tab-panel", "tabs", html`<code>selectedIndex</code> → <code>selected</code>; panels follow the tabs. Tab nav bar for routing: tabs with your router's links.`],
  ["mat-table (+ MatSort)", "lit-material-data-table (rows and cells), lit-material-table (data-driven)", "data-table, table", html`The data table sorts and selects by <em>event</em> (<code>sort-change</code>, <code>selection-change</code>): you reorder the rows, as with a server-side <code>MatTableDataSource</code>. No data source class.`],
  ["mat-paginator", "lit-material-data-table-pagination", "data-table", html`<code>page</code>, <code>page-size</code>, <code>total</code>, <code>page-size-options</code>; <code>page-change</code> event.`],
  ["mat-progress-bar", "lit-material-linear-progress", "progress", html`<code>value</code>/<code>max</code> or <code>indeterminate</code>; no buffer mode (<strong>gap</strong>).`],
  ["mat-progress-spinner, mat-spinner", "lit-material-circular-progress", "progress", html`<code>indeterminate</code> for <code>mat-spinner</code>.`],
  ["MatSnackBar (service)", "lit-material-snackbar", "snackbar", html`One element, <code>show(message)</code>: see below.`],
  ["matTooltip (directive)", "lit-material-tooltip", "tooltip", html`An element with <code>anchor</code> set to the trigger's id.`],
  ["mat-sidenav, mat-drawer", "lit-material-navigation-drawer, lit-material-drawer", "navigation, drawer", html`Navigation drawer: <code>variant="standard"</code> (side) or <code>"modal"</code> (over); <code>lit-material-adaptive-navigation</code> switches drawer, rail and bar by width.`],
  ["mat-toolbar", "lit-material-top-app-bar, lit-material-toolbar", "top-app-bar, toolbar", html`App bar: <code>variant</code> <code>small</code>, <code>center-aligned</code>, <code>medium</code>, <code>large</code>. A toolbar of actions: <code>lit-material-toolbar</code>.`],
  ["mat-expansion-panel, mat-accordion", "lit-material-accordion, lit-material-accordion-panel", "accordion", html`<code>expanded</code>, <code>toggle</code> event; <code>multi</code> on the accordion.`],
  ["mat-stepper, mat-step", "lit-material-stepper, lit-material-step", "stepper", html`<code>selected</code>, <code>linear</code>, <code>orientation</code>; step <code>completed</code>/<code>error</code>.`],
  ["mat-datepicker (+ date range)", "lit-material-date-picker, lit-material-date-range-picker", "date-picker", html`A picker element (<code>modal</code> or <code>docked</code>) with ISO <code>value</code> strings; it isn't attached to an input: open it from a button or a field's trailing icon. No <code>DateAdapter</code>.`],
  ["mat-tree", "lit-material-tree, lit-material-tree-item", "tree", html`Nested items in markup, <code>expanded</code>/<code>selected</code>, <code>multiple</code>. No tree control or flattener.`],
  ["matBadge (directive)", "lit-material-badge", "badge", html`An element you position over the host yourself (<code>value</code>, <code>max</code>).`],
  ["mat-icon", "lit-material-icon", "icon", html`No icon font or ligatures: register SVG icons with <code>registerIcons()</code> and use <code>name</code>, or slot an <code>&lt;svg&gt;</code>.`],
  ["mat-card", "lit-material-card", "card", html`<code>variant</code>: <code>elevated</code>, <code>filled</code>, <code>outlined</code>; <code>interactive</code> or <code>href</code> for a clickable card.`],
  ["mat-list, mat-nav-list", "lit-material-list, lit-material-list-item", "list", html`Slots <code>leading</code>, <code>trailing</code>, <code>overline</code>, <code>supporting-text</code>; <code>href</code> for nav lists. Selection list: <strong>gap</strong> (checkboxes in <code>trailing</code>).`],
  ["mat-divider", "lit-material-divider", "divider", html`<code>inset-start</code>/<code>inset-end</code>; <code>orientation="vertical"</code>.`],
];

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
      ["vite", "A whole app with Vite", html`
        <p><code>@lit-material/vite</code> server-renders every page of an app in dev and production: the content, the <code>&lt;title&gt;</code>, the HTTP status (redirects, 404s) and the routes' loader data, from the same routes the browser uses. Add the plugin, put <code>&lt;!--app-head--&gt;</code> and <code>&lt;!--app-html--&gt;</code> in <code>index.html</code>, and export your routes and shell from <code>src/entry-server.ts</code>:</p>
        <pre tabindex="0"><code>// vite.config.ts
import { litMaterial } from "@lit-material/vite";
export default { plugins: [litMaterial({ prerender: ["/", "/about"] })] };

// src/entry-server.ts
import { html } from "lit";
import "./app-shell.js";
export { routes } from "./routes.js";
export const render = () =&gt; html\`&lt;app-shell&gt;&lt;/app-shell&gt;\`;

// src/main.ts
import "@lit-material/vite/client"; // hydration support, first
import "./app-shell.js";</code></pre>
        <p><code>vite build</code> also builds the server and prerenders the listed paths; <code>createRequestHandler()</code> from <code>@lit-material/vite/server</code> serves the rest from any Node or Fetch server.</p>`],
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
  versions: {
    title: "Versions and support",
    lead: "Every lit-material package is released at the same version and follows semantic versioning; the previous major gets security fixes for a year.",
    sections: [
      ["one-version", "One version for everything", html`
        <p>All <code>@lit-material/*</code> packages and <code>create-lit-material-app</code> are published together at one version number. Install any set of them at the same version and they work together: there's no compatibility matrix to check.</p>
        <pre tabindex="0"><code>npm install @lit-material/button@1.2.0 @lit-material/dialog@1.2.0</code></pre>
        <p>A new version doesn't mean every package changed: each package's <code>CHANGELOG.md</code> lists its own changes.</p>`],
      ["semver", "What a version number promises", html`
        <p>Patches fix bugs (accessibility fixes included). Minors add components, properties, events, slots, parts, custom properties and messages, and can deprecate. Only a major removes or breaks anything, with a migration note. The public API is each package's <code>exports</code> and types, each element's tag, properties, attributes, events, slots, CSS parts and custom properties, the <code>--md-sys-*</code> tokens, the translation keys, and keyboard and ARIA behaviour. Internal shadow DOM and class names aren't.</p>`],
      ["deprecations", "Deprecations", html`
        <p>An API is deprecated in a minor (marked <code>@deprecated</code> in the types and <code>custom-elements.json</code>, and in the changelog), keeps working for at least six months, and is removed in the next major. Where the change can be automated, <code>@lit-material/codemod</code> does it.</p>`],
      ["support", "Support windows and platforms", html`
        <p>The current major gets every fix. The previous major gets security and critical fixes for 12 months after the next major ships. Supported: the latest two versions of Chrome, Edge, Firefox and Safari (CI runs Chromium, Firefox and WebKit), and Node's active and maintenance LTS releases for server rendering and the CLIs.</p>
        <p>Report vulnerabilities privately through <a href="https://github.com/bohdaq/lit-material/security/advisories/new">GitHub</a>. The full policy is <a href="https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md">VERSIONING.md</a>.</p>`],
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
  testing: {
    title: "Testing and devtools",
    lead: "Test your app the way a user meets it, by role and label through every shadow root, and watch its store and routes while you build it.",
    sections: [
      ["tests", "Tests", html`
        <p><code>@lit-material/testing</code> renders with <code>fixture()</code>, which waits until every nested element has rendered, and finds controls by role, label or text through shadow roots: <code>getByLabel("Email")</code> is the <code>&lt;input&gt;</code> inside the text field, the one the user types into.</p>
        <pre tabindex="0"><code>import { cleanup, fixture, getByLabel, getByRole, user } from "@lit-material/testing";

afterEach(() =&gt; cleanup());

it("signs up", async () =&gt; {
  await fixture(html\`&lt;signup-form&gt;&lt;/signup-form&gt;\`);
  await user.type(getByLabel("Email"), "ada@example.com");
  await user.click(getByRole("button", { name: "Sign up" }));
  expect(getByRole("status").textContent).to.contain("Check your inbox");
});</code></pre>
        <p>It works in any browser test runner. When a query finds nothing, the error lists the roles and names it did find.</p>`],
      ["devtools", "Devtools", html`
        <p><code>@lit-material/devtools</code> records a store's actions and states, and the router's navigations. With the Redux DevTools browser extension installed, stores show up there, time travel included; without it, the <code>&lt;lit-material-devtools&gt;</code> panel shows the same on the page.</p>
        <pre tabindex="0"><code>if (import.meta.env.DEV) {
  const { connectStore, connectRouter } = await import("@lit-material/devtools");
  await import("@lit-material/devtools/panel.js");
  connectStore(store, { name: "app" });
  connectRouter();
  document.body.append(document.createElement("lit-material-devtools"));
}</code></pre>
        <p>Loaded behind a development check like this, it adds nothing to a production build.</p>`],
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

WRITTEN["migrate-material-web"] = {
  title: "Migrate from @material/web",
  lead: "lit-material reads the same Material 3 system tokens as @material/web, so a theme carries over as it is. A codemod rewrites elements, attributes, slots and imports, and lists by file and line what it left for you.",
  sections: [
    ["differences", "What stays and what changes", html`
      <ul>
        <li><strong>The same tokens.</strong> Components read the <code>--md-sys-*</code> custom properties (colour roles, typescale, shape, elevation, state), the names a Material Theme Builder export sets. Keep your theme and link <code>@lit-material/tokens/css/index.css</code> once for the baseline. The <code>.md-typescale-*</code> classes are in <code>@lit-material/tokens/css/typography.css</code> under the same names.</li>
        <li><strong>One package per component.</strong> <code>import "@material/web/button/filled-button.js"</code> becomes <code>import "@lit-material/button"</code>, which registers every button variant.</li>
        <li><strong>Variants are attributes.</strong> One element per component: <code>&lt;md-outlined-text-field&gt;</code> is <code>&lt;lit-material-text-field variant="outlined"&gt;</code>, <code>&lt;md-filled-tonal-button&gt;</code> is <code>&lt;lit-material-button variant="tonal"&gt;</code>. Labels that were attributes (<code>label</code> on chips and FABs) are text content.</li>
        <li><strong>Component tokens differ.</strong> Per-component tokens such as <code>--md-filled-button-container-color</code> have no counterparts. Each lit-material element lists its own <code>--lit-material-*</code> properties and CSS parts on its page; colours and shapes come from the system tokens.</li>
        <li><strong>Forms.</strong> Text fields, selects, checkboxes, radios, switches, sliders and buttons are form-associated through <code>ElementInternals</code>: <code>FormData</code>, constraint validation and reset work as with native controls.</li>
        <li><strong>Server rendering.</strong> Every component is tested against <code>@lit-labs/ssr</code>, and <code>@lit-material/vite</code> renders whole apps on the server. See <a href="/guides/server-rendering/">Server rendering</a>.</li>
        <li><strong>More components.</strong> Data table, date and time pickers, navigation drawer, rail and bar, snackbar, tooltip, stepper and the rest of the <a href="/components/">catalogue</a>, which @material/web doesn't have.</li>
      </ul>`],
    ["codemod", "Run the codemod", html`
      <p>Commit first: the codemod rewrites files in place. A dry run prints every change and warning and writes nothing:</p>
      <pre tabindex="0"><code>npx @lit-material/codemod md-web src --dry-run
npx @lit-material/codemod md-web src</code></pre>
      <p>It reads HTML (with parse5, a spec-compliant parser), Lit templates in <code>.ts</code>/<code>.js</code>, JSX and TSX, and CSS, and edits the text in place, so formatting, comments and expressions stay as they were. Binding syntax is kept: <code>.prefixText=\${p}</code> becomes <code>.prefix=\${p}</code>, Angular's <code>[selected]</code> becomes <code>[checked]</code>. It ends with the packages to install:</p>
      <pre tabindex="0"><code>  changed  src/app.ts:12: &lt;md-outlined-text-field&gt; → &lt;lit-material-text-field variant="outlined"&gt;
  changed  src/app.ts:12: &lt;md-outlined-text-field&gt; prefix-text → prefix
  warning  src/app.ts:31: &lt;md-slider&gt; range: lit-material-slider is single-value; a two-thumb range is not supported

Install what the rewritten files use:  npm install @lit-material/tokens @lit-material/button @lit-material/text-field …</code></pre>
      <p>Anything without a confident mapping is a warning with its file and line, never a silent change: unknown <code>md-*</code> elements, attributes with no counterpart, bound values that would need mapping, class imports (<code>import { MdDialog }</code>), <code>md-*</code> names in selectors and strings, and component tokens. Running it twice changes nothing the second time. The same rewrite is a function, for your own tooling: <code>import { transform } from "@lit-material/codemod"</code>.</p>`],
    ["mapping", "Element by element", html`
      <p>This table is the codemod's own mapping, so it is what the codemod does. Attributes not listed carry over unchanged.</p>
      ${cells(["@material/web", "lit-material", "Package", "Rewritten"], ELEMENTS.map(mdWebRow))}
      <p>Imports follow the elements: <code>@material/web/&lt;folder&gt;/&lt;file&gt;.js</code> becomes the element's package, once per file. <code>@material/web/all.js</code> is reported with the imports to use instead, and left for you to replace.</p>`],
    ["manual", "What needs a person", html`
      <ul>
        <li><strong>Icons.</strong> <code>&lt;md-icon&gt;settings&lt;/md-icon&gt;</code> draws a Material Symbols ligature from an icon font. <code>lit-material-icon</code> loads no font, so the word shows as text: register the SVGs with <code>registerIcons()</code> and use <code>name</code>, or slot an <code>&lt;svg&gt;</code>. The codemod reports each ligature.</li>
        <li><strong>Script code.</strong> The codemod changes markup and imports. Code that reads <code>switch.selected</code> (now <code>checked</code>), <code>tabs.activeTabIndex</code> (now <code>selected</code>), queries <code>md-*</code> selectors, or imports md-web classes is reported, not rewritten.</li>
        <li><strong>Labels.</strong> A <code>&lt;label for&gt;</code> pointing at <code>lit-material-checkbox</code>, <code>-radio</code> or <code>-switch</code> doesn't toggle it (checked in Chromium); wrapping the control in the <code>&lt;label&gt;</code> does. Prefer the element's <code>label</code> attribute, which also names it for assistive technology.</li>
        <li><strong>Component tokens.</strong> Each <code>--md-&lt;component&gt;-*</code> token is reported with the lit-material element's own properties and parts to use instead.</li>
        <li><strong>Missing pieces.</strong> No chip set, submenus, two-thumb slider, linear progress buffer, secondary tab style, or standalone ripple, focus ring and elevation elements (components draw their own). The table lists every attribute and event left in place.</li>
      </ul>`],
  ],
};

WRITTEN["migrate-angular-material"] = {
  title: "Migrate from Angular Material",
  lead: "Angular Material's components are Angular directives and services; lit-material's are custom elements, which Angular templates use with the schema for them. Here is each component's counterpart, the binding and forms patterns, and what replaces the services.",
  sections: [
    ["setup", "Set up an Angular app", html`
      <p>Install the tokens and the components you use, and load the tokens stylesheet once, from <code>angular.json</code>'s <code>styles</code> or your global stylesheet:</p>
      <pre tabindex="0"><code>npm install @lit-material/tokens @lit-material/button @lit-material/text-field</code></pre>
      <pre tabindex="0"><code>/* src/styles.css */
@import "@lit-material/tokens/css/index.css";</code></pre>
      <p>Import each package for its side effect (it registers the elements) and add <code>CUSTOM_ELEMENTS_SCHEMA</code> to every component whose template uses them:</p>
      <pre tabindex="0"><code>import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@lit-material/button";
import "@lit-material/text-field";

@Component({
  selector: "app-profile",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`
    &lt;lit-material-text-field label="Name" [value]="name" (input)="name = $any($event.target).value"&gt;&lt;/lit-material-text-field&gt;
    &lt;lit-material-button variant="filled" [disabled]="!name" (click)="save()"&gt;Save&lt;/lit-material-button&gt;
  \`,
})
export class ProfileComponent {
  name = "";
  save() {}
}</code></pre>
      <p>Angular Material's Sass theme doesn't carry over. Set the <code>--md-sys-color-*</code> tokens, or make a palette with the <a href="/guides/theming/">theme builder</a>.</p>`],
    ["bindings", "Properties, attributes and events", html`
      <p><code>[value]</code> sets a property, which is how arrays and objects go in (<code>[rows]="rows"</code>, <code>[options]="options"</code>); <code>[attr.aria-label]</code> sets an attribute; <code>(change)</code> listens to an event, hyphenated names included: <code>(page-change)="onPage($any($event).detail)"</code>. Under <code>CUSTOM_ELEMENTS_SCHEMA</code> Angular doesn't type-check these bindings, and <code>$event.target</code> is a plain <code>EventTarget</code>, hence <code>$any()</code>. Each package's <code>dist/web-types.json</code> and VS Code custom data give completion in templates; see <a href="/guides/frameworks/">React, Vue and Angular</a>.</p>`],
    ["forms", "Forms", html`
      <p>lit-material ships no <code>ControlValueAccessor</code>, so <code>formControlName</code> and <code>ngModel</code> don't work on its elements by themselves. What the elements do, checked in Chromium on the elements themselves (not inside an Angular app):</p>
      <ul>
        <li><strong>Text field, textarea, slider:</strong> fire <code>input</code> on the element with <code>value</code> already updated, and <code>blur</code> reaches the element; setting <code>value</code> updates the field. That is what Angular's <code>DefaultValueAccessor</code> uses (it writes <code>value</code> and listens for <code>input</code> and <code>blur</code>), so <code>ngDefaultControl</code> selects it: <code>&lt;lit-material-text-field label="Email" formControlName="email" ngDefaultControl&gt;</code>. A slider's value is a number.</li>
        <li><strong>Select:</strong> fires only <code>change</code>, so <code>ngDefaultControl</code> would never update the control. Bind <code>[value]</code> and <code>(change)</code>, or use an accessor like the one below with <code>value</code>.</li>
        <li><strong>Checkbox, switch, radio:</strong> the state is <code>checked</code> and the event is <code>change</code>: <code>[checked]="on" (change)="on = $any($event.target).checked"</code>, or an accessor.</li>
      </ul>
      <p>An accessor for the checked-state elements is a few lines in your app (it isn't part of lit-material):</p>
      <pre tabindex="0"><code>import { Directive, ElementRef, HostListener, forwardRef, inject } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Directive({
  selector: "lit-material-checkbox[formControlName], lit-material-checkbox[formControl], lit-material-checkbox[ngModel], lit-material-switch[formControlName], lit-material-switch[formControl], lit-material-switch[ngModel]",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() =&gt; CheckedAccessor), multi: true }],
})
export class CheckedAccessor implements ControlValueAccessor {
  private readonly el = inject&lt;ElementRef&lt;HTMLElement &amp; { checked: boolean; disabled: boolean }&gt;&gt;(ElementRef).nativeElement;
  private onChange = (_: boolean) =&gt; {};
  private onTouched = () =&gt; {};

  @HostListener("change") changed() { this.onChange(this.el.checked); }
  @HostListener("blur") blurred() { this.onTouched(); }

  writeValue(value: boolean) { this.el.checked = !!value; }
  registerOnChange(fn: (value: boolean) =&gt; void) { this.onChange = fn; }
  registerOnTouched(fn: () =&gt; void) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) { this.el.disabled = disabled; }
}</code></pre>
      <p>The fields validate themselves (<code>required</code>, <code>minlength</code>, <code>pattern</code>, <code>min</code>/<code>max</code>) and show the browser's message once touched; Angular's validators run separately. To show an Angular error on a field, bind <code>[error]</code> and <code>[errorText]</code>. Every form field takes part in a native <code>&lt;form&gt;</code>'s <code>FormData</code>.</p>`],
    ["components", "Component by component", html`
      ${cells(["Angular Material", "lit-material", "Package", "Notes"], ANGULAR_MATERIAL.map(([mat, lit, pkg, notes]) => [html`<code>${mat}</code>`, codeList(lit.split(", ").filter((t) => t.startsWith("lit-material-")).map((t) => t.split(" ")[0])), codeList(pkg.split(", ").map((p) => `@lit-material/${p}`)), notes]))}`],
    ["services", "Services become elements", html`
      <p><strong>Dialogs.</strong> Put <code>lit-material-dialog</code> in the template and drive it with <code>open</code>; <code>close</code> fires however it closes (button, Escape, backdrop). For a yes/no question, <code>confirm()</code> from <code>@lit-material/confirm</code> creates a dialog, awaits the answer and removes it, much like <code>MatDialog.open(…).afterClosed()</code>:</p>
      <pre tabindex="0"><code>&lt;lit-material-dialog [open]="editing" (close)="editing = false"&gt;
  &lt;div slot="headline"&gt;Edit profile&lt;/div&gt;
  &lt;lit-material-text-field label="Name" formControlName="name" ngDefaultControl&gt;&lt;/lit-material-text-field&gt;
  &lt;div slot="actions"&gt;&lt;lit-material-button variant="text" (click)="editing = false"&gt;Cancel&lt;/lit-material-button&gt;&lt;/div&gt;
&lt;/lit-material-dialog&gt;</code></pre>
      <pre tabindex="0"><code>import { confirm } from "@lit-material/confirm";

if (await confirm({ headline: "Delete project?", confirmLabel: "Delete", destructive: true })) this.delete();</code></pre>
      <p><strong>Snack bars.</strong> Keep one <code>lit-material-snackbar</code> in the app shell and a small service that calls its <code>show(message)</code>:</p>
      <pre tabindex="0"><code>@Injectable({ providedIn: "root" })
export class Snackbar {
  private element?: HTMLElement &amp; { show(message?: string): void };
  attach(element: HTMLElement) { this.element = element as Snackbar["element"]; }
  open(message: string) { this.element?.show(message); }
}

// In the app component, whose template has &lt;lit-material-snackbar #snack&gt;&lt;/lit-material-snackbar&gt;
private readonly snackbar = inject(Snackbar);
@ViewChild("snack") set snack(ref: ElementRef&lt;HTMLElement&gt;) { this.snackbar.attach(ref.nativeElement); }</code></pre>
      <p><strong>Menus and tooltips.</strong> They're elements next to their trigger instead of directives on it: <code>&lt;lit-material-menu anchor="more"&gt;</code> opened with <code>(click)="$any(menu).show()"</code> on a template reference <code>#menu</code>, and <code>&lt;lit-material-tooltip anchor="save"&gt;Save changes&lt;/lit-material-tooltip&gt;</code> after <code>id="save"</code> on the button.</p>`],
    ["gaps", "Gaps", html`
      <ul>
        <li>No <code>ControlValueAccessor</code>s and no Angular package: the patterns above, in your app.</li>
        <li>No codemod: Angular Material templates use directives and services that don't map one to one; use the table.</li>
        <li>No multiple select, range slider, nested menus, selection list, chip listbox element or radio group element.</li>
        <li>No CDK equivalents (overlay, portal, a11y, drag and drop, virtual scroll); the data table virtualizes its own rows, and <code>@lit-material/sortable</code> reorders lists.</li>
        <li>Tables don't own data: no <code>MatTableDataSource</code>, sort or paginator wiring; you sort and slice rows in response to events.</li>
        <li>Not run inside an Angular app in this repository: the forms behaviour above was checked on the elements in Chromium, against how Angular's <code>DefaultValueAccessor</code> works.</li>
      </ul>`],
  ],
};

export function guidePage(slug, entry) {
  const guide = allGuides().find((g) => g.slug === slug);
  const written = WRITTEN[slug];
  const path = `/guides/${slug}/`;
  if (written) {
    const meta = { path, title: `${written.title} · lit-material`, description: written.lead };
    meta.jsonLd = articleLd({ title: written.title, description: written.lead, path, crumbs: [{ name: "Guides", item: "https://lit.rws8.tech/guides/install/" }] });
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
  meta.jsonLd = articleLd({ title: guide.label, description: meta.description, path, crumbs: [{ name: "Guides", item: "https://lit.rws8.tech/guides/install/" }] });
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
