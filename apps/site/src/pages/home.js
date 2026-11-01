// / — the landing page (landing-page-design skill, layout A: the hero shows a
// live console built from the components themselves).
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { footer, header, ORIGIN, REPO } from "../shell.js";
import { icon } from "../icons.js";
import { siteStats } from "../packages.js";

export const meta = {
  path: "/",
  title: "lit-material: Material 3 web components for consoles and admin UIs",
  description:
    "Lit web components for admin UIs and dashboards: tables, logs, forms and charts, each its own package. Server rendered, themed with tokens, usable from any framework. MIT licensed.",
};

const TAGLINE = ["Install one component, not a framework.", "Each element is a small package of its own."];

const TILES = [
  ["feather", "Ship only what you use", "Every component is its own package, and packages with several elements have one entry point per element. A size budget in CI keeps each one small.", "/guides/install/"],
  ["hard-drives", "Rendered on the server", "Every element renders with Lit SSR and hydrates without changing what it shows. CI checks it on each change.", "/guides/server-rendering/"],
  ["table", "Built for consoles", "Tables with paging, a live log viewer, usage meters, key value editors, code fields and charts, next to the usual buttons and fields.", "/components/#data"],
  ["person-arms-spread", "Accessible from the start", "Keyboard paths, labels that reach across shadow roots, and an axe check in the tests of every component.", "/components/"],
  ["palette", "Themed with tokens", "Material 3 colour, type and shape tokens as CSS custom properties, light and dark mode, and a theme builder for your brand colour.", "/guides/theming/"],
];

const STEPS = [
  ["Link the tokens", html`One stylesheet, <code>@lit-material/tokens/css/index.css</code>, gives every component its colours, type and shapes.`],
  ["Install a component", html`<code>npm install @lit-material/button</code>. Only that button and Lit come with it.`],
  ["Write the tag", html`<code>&lt;lit-material-button&gt;Save&lt;/lit-material-button&gt;</code> in HTML, React, Vue or Angular.`],
];

const USED_BY = [
  ["The rws admin UI", "Live traffic, upstreams, certificates and logs for the rws web server.", "https://rws8.tech/docs/features/admin/"],
  ["HITOP", "A web app for sending HTTP requests, keeping collections and running tests.", "https://hitop.rws8.tech/app/"],
  ["rws8.tech", "The rws website and its 2,000 docs pages, rendered on the server.", "https://rws8.tech/"],
];

export const FAQ = [
  ["Do I need a build step or to know Lit?", "No. The packages are standard ES modules that load in the browser as they are, and you use them as HTML elements. Lit comes along as their shared dependency; you only write Lit if you want to."],
  ["Does it work with React, Vue or Angular?", "Yes. They are custom elements, so there is no wrapper package. The frameworks guide shows the one setting each framework needs."],
  ["Can I render it on the server?", "Yes, with Lit SSR. Every element is rendered and hydrated in CI on each change, and this site is rendered the same way."],
  ["How big is it?", "Most packages are 2 to 5 KB gzipped on their own, plus Lit, which they share. Each package has a size limit that CI enforces."],
  ["Which browsers does it support?", "Current Chrome, Edge, Firefox and Safari. Every test runs in Chromium, Firefox and WebKit."],
  ["Does it ship icons?", "No icon set is bundled. Register the SVGs you already use (Phosphor, Material Symbols, Lucide or your own) once, then refer to them by name."],
  ["How do I match my brand?", "Set the Material 3 tokens, or pick a seed colour in the theme builder and copy the CSS it generates. Light and dark mode follow the system or a toggle."],
  ["Is it ready for production?", "It runs the rws admin UI, the HITOP web app and this site. Versions are below 1.0, so a minor release can change an API; every change is in the changelog."],
  ["What does it cost?", "Nothing. lit-material is MIT licensed."],
];

// The hero: a working console made of the components on this site.
const ROUTES = [
  { route: "GET /v1/invoices", p95: "41 ms", errors: "0.01%" },
  { route: "POST /v1/payments", p95: "128 ms", errors: "0.07%" },
  { route: "GET /v1/customers", p95: "36 ms", errors: "0.00%" },
];
const COLUMNS = [
  { key: "route", label: "Route" },
  { key: "p95", label: "p95", numeric: true },
  { key: "errors", label: "Errors", numeric: true },
];

function console_() {
  return html`
    <div class="console" role="group" aria-label="Example: a service console made of lit-material components">
      <div class="console-head">
        <span class="console-title">Billing API</span>
        <lit-material-status status="ok">Healthy</lit-material-status>
      </div>
      <div class="console-stats">
        <lit-material-stat label="Requests today" value="1,284,906" trend="up" trend-label="4.2% on yesterday" trend-sentiment="positive"></lit-material-stat>
        <lit-material-stat label="Error rate" value="0.03%" caption="Last 24 hours"></lit-material-stat>
      </div>
      <lit-material-usage-meter label="Memory" value="6.3" max="8" unit="GiB"></lit-material-usage-meter>
      <lit-material-table caption="Slowest routes" density="compact" columns=${JSON.stringify(COLUMNS)} rows=${JSON.stringify(ROUTES)}></lit-material-table>
      <label class="console-switch"><lit-material-switch aria-label="Maintenance mode"></lit-material-switch><span>Maintenance mode</span></label>
    </div>`;
}

const cta = (id) => html`
  <div class="install">
    <a class="button-filled" href="/guides/install/" id=${id}>${unsafeHTML(icon("download-simple"))} Install lit-material</a>
    <a class="text-link" href="/components/">Browse the components ${unsafeHTML(icon("arrow-right"))}</a>
  </div>`;

export function render() {
  const stats = siteStats();
  const STATS = [
    [String(stats.elements), "", `Elements in ${stats.packages} packages, from buttons to log viewers.`],
    [stats.medianKb, "KB", "Median package size, gzipped and bundled on its own without Lit."],
    ["3", "", "Browsers every test runs in: Chromium, Firefox and WebKit."],
  ];
  return html`
    ${header(meta.path)}
    <main id="main">
      <section class="hero container">
        <div class="hero-text">
          <h1 class="hero-heading">Material 3 components <br />for the consoles you ship</h1>
          <p class="lead">Lit web components for admin UIs and dashboards: tables, logs, forms and charts, each a package of its own. Render them on the server and use them from any framework.</p>
          ${cta("install-hero")}
          <p class="proof-line">${stats.packages} packages · tested in Chromium, Firefox and WebKit · MIT licensed</p>
        </div>
        ${console_()}
      </section>

      <section class="tagline container" aria-label="What lit-material is">
        <p class="tagline-text">${TAGLINE.map(
          (line) => html`<span class="tagline-line">${line.split(" ").map((w) => html`<span class="word">${w}</span> `)}</span>`,
        )}</p>
      </section>

      <section class="section container reveal" aria-labelledby="why-title">
        <h2 id="why-title" class="section-title">What you get</h2>
        <div class="tiles">
          ${TILES.map(
            ([name, title, body, href]) => html`
              <a class="tile" href=${href}>
                <span class="tile-icon">${unsafeHTML(icon(name))}</span>
                <h3>${title}</h3>
                <p>${body}</p>
              </a>`,
          )}
        </div>
      </section>

      <section class="section container reveal" aria-labelledby="how-title">
        <h2 id="how-title" class="section-title">How it works</h2>
        <ol class="steps">
          ${STEPS.map(([title, body], i) => html`<li><span class="step-number">${i + 1}</span><h3>${title}</h3><p>${body}</p></li>`)}
        </ol>
      </section>

      <section class="section container reveal" aria-labelledby="size-title">
        <h2 id="size-title" class="section-title">Small, and checked to stay that way</h2>
        <p class="section-lead">Measured on every build: each package bundled alone, minified and gzipped, and held to a limit in CI.</p>
        <div class="stats">
          ${STATS.map(([n, unit, caption]) => html`<div class="stat"><p class="stat-number">${n}<span>${unit}</span></p><p class="stat-caption">${caption}</p></div>`)}
        </div>
      </section>

      <section class="section container reveal" aria-labelledby="used-title">
        <h2 id="used-title" class="section-title">In use today</h2>
        <ul class="proof-list">
          ${USED_BY.map(([name, text, href]) => html`<li>${unsafeHTML(icon("check-circle"))}<span><a href=${href}>${name}</a>: ${text}</span></li>`)}
        </ul>
        <a class="text-link" href="/showcase/">See them in the showcase ${unsafeHTML(icon("arrow-right"))}</a>
      </section>

      <section class="section container reveal" aria-labelledby="faq-title">
        <h2 id="faq-title" class="section-title">Questions</h2>
        <div class="faq">
          ${FAQ.map(([q, a]) => html`<details><summary>${q}${unsafeHTML(icon("plus"))}</summary><p>${a}</p></details>`)}
        </div>
      </section>

      <section class="final-cta container reveal" aria-labelledby="final-title">
        <h2 id="final-title" class="section-title">Add your first component in a minute</h2>
        ${cta("install-final")}
        <p class="proof-line">MIT licensed. No account, no build step required.</p>
      </section>
    </main>
    ${footer()}`;
}

export function structuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: "lit-material",
      description: meta.description,
      codeRepository: REPO,
      programmingLanguage: "TypeScript",
      license: "https://opensource.org/licenses/MIT",
      url: `${ORIGIN}/`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
}
