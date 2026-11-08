// The document around every prerendered page: head, header, footer, and the
// docs layout (sidebar, article, "On this page") shared by components and guides.
import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { mark } from "./brand/mark.js";
import { icon } from "./icons.js";
import { GROUPS, GUIDE_GROUPS } from "./catalog.js";
import { labelOf } from "./packages.js";
import { themeBootScript } from "@lit-material/site-kit/client/theme.js";

export const ORIGIN = "https://lit.rws8.tech";
export const REPO = "https://github.com/bohdaq/lit-material";

/** Structured data for a docs page (a component or a guide): the article and its breadcrumb trail. */
export function articleLd({ title, description, path, crumbs }) {
  const url = `${ORIGIN}${path}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: title,
      description,
      url,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: "lit-material", url: `${ORIGIN}/` },
      author: { "@type": "Organization", name: "lit-material", url: `${ORIGIN}/` },
      publisher: { "@type": "Organization", name: "lit-material", url: `${ORIGIN}/` },
      about: { "@type": "SoftwareSourceCode", name: "lit-material", codeRepository: REPO },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ name: "lit-material", item: `${ORIGIN}/` }, ...crumbs, { name: title, item: url }].map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        ...(c.item ? { item: c.item } : {}),
      })),
    },
  ];
}

const NAV = [
  ["/components/", "Components"],
  ["/guides/install/", "Guides", "/guides/"],
  ["/showcase/", "Showcase"],
];

function links(path) {
  return html`${NAV.map(
    ([href, label, section = href]) => html`<a href=${href} aria-current=${path.startsWith(section) ? "page" : "false"}>${label}</a>`,
  )}<a href=${REPO}>GitHub</a>`;
}

export function header(path) {
  return html`
    <header class="site-header">
      <nav aria-label="Main">
        <a class="lockup" href="/" aria-label="lit-material home">
          ${unsafeHTML(mark({ title: "lit-material" }))}
          <span class="word"><b>lit-material</b><small>Web components</small></span>
        </a>
        <span class="nav-links">${links(path)}</span>
        <button class="icon-button" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch theme">
          <span class="sun">${unsafeHTML(icon("sun"))}</span>
          <span class="moon">${unsafeHTML(icon("moon"))}</span>
        </button>
        <button class="icon-button menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
          <span class="menu-icon" aria-hidden="true"><span></span><span></span></span>
        </button>
      </nav>
      <div id="mobile-menu" class="mobile-menu" hidden>
        <nav aria-label="Main">${links(path)}</nav>
      </div>
    </header>`;
}

export function footer() {
  return html`
    <footer class="site-footer">
      <div class="container">
        <ul>
          <li><a href="/components/">Components</a></li>
          <li><a href="/guides/install/">Install</a></li>
          <li><a href=${REPO}>GitHub</a></li>
          <li><a href="https://www.npmjs.com/org/lit-material">npm</a></li>
          <li><a href="/changelog/">Changelog</a></li>
          <li><a href="/llms.txt">llms.txt</a></li>
          <li><a href="/privacy/">Privacy</a></li>
          <li><a href=${`${REPO}/blob/main/LICENSE`}>MIT license</a></li>
        </ul>
        <p class="footer-family">Part of the <a href="https://rws8.tech/">rws8.tech</a> family, with <a href="https://hitop.rws8.tech/">HITOP</a>. Built by <a href="https://bohdantsap.com/" rel="author">Bohdan Tsap</a>.</p>
      </div>
    </footer>`;
}

function sidebarNav(path, label = "Documentation") {
  const group = (label, items, open) => html`
    <details class="docs-group" ?open=${open}>
      <summary>${label}</summary>
      <ul>
        ${items.map(([href, text]) => html`<li><a href=${href} aria-current=${href === path ? "page" : "false"}>${text}</a></li>`)}
      </ul>
    </details>`;
  return html`
    <nav class="docs-nav" aria-label=${label}>
      <button class="docs-search-button" type="button" data-search-open>
        ${unsafeHTML(icon("magnifying-glass"))}<span>Search</span><kbd>/</kbd>
      </button>
      ${GUIDE_GROUPS.map((g) => {
        const items = g.items.map((i) => [`/guides/${i.slug}/`, i.label]);
        return group(g.label, items, items.some(([h]) => h === path) || g.label === "Start");
      })}
      ${GROUPS.map((g) => {
        const items = g.items.map((slug) => [`/components/${slug}/`, labelOf(slug)]);
        return group(g.label, items, items.some(([h]) => h === path));
      })}
    </nav>`;
}

/** The docs frame: sidebar, the page's article, and an optional "On this page" list. */
export function docsLayout({ path, content, toc = [] }) {
  return html`
    ${header(path)}
    <div class="docs-layout">
      <aside class="docs-sidebar" aria-label="Site sections">
        <details class="docs-nav-mobile">
          <summary>${unsafeHTML(icon("list"))} Menu</summary>
          ${sidebarNav(path, "Documentation menu")}
        </details>
        <div class="docs-nav-desktop">${sidebarNav(path)}</div>
      </aside>
      <main id="main" class="docs-main">${content}</main>
      <aside class="docs-aside" aria-label="On this page">
        ${toc.length >= 2
          ? html`<lit-material-jump-links class="docs-toc" offset="96" links=${JSON.stringify(toc)}></lit-material-jump-links>`
          : nothing}
      </aside>
    </div>
    <dialog class="search-dialog" aria-label="Search the site">
      <form method="dialog" class="search-form" role="search">
        ${unsafeHTML(icon("magnifying-glass"))}
        <input type="search" name="q" placeholder="Search components and guides" autocomplete="off" aria-label="Search components and guides" />
        <button class="icon-button" value="close" aria-label="Close search">${unsafeHTML(icon("x"))}</button>
      </form>
      <div class="search-results" aria-live="polite"></div>
    </dialog>
    <lit-material-back-to-top target="main" threshold="800"></lit-material-back-to-top>
    ${footer()}`;
}

// Applies a saved theme before first paint, so a dark-mode visitor never sees
// a cream flash. Storage can throw (private windows), hence the try.
const THEME_BOOT = themeBootScript("lit-theme");

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function documentHtml({ title, description, path, body, assets, noindex = false, canonical = path, jsonLd = [] }) {
  const css = assets.css.map((href) => `<link rel="stylesheet" href="${href}">`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${ORIGIN}${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<meta property="og:type" content="website">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${ORIGIN}${canonical}">
<meta property="og:site_name" content="lit-material">
<meta property="og:image" content="${ORIGIN}/brand/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#16120F">
<script>${THEME_BOOT}</script>
${jsonLd.map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`).join("")}
${css}
<script type="module" src="${assets.js}"></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${body}
</body>
</html>
`;
}
