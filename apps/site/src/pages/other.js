// The components index, showcase, changelog, privacy page and 404.
import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GROUPS } from "../catalog.js";
import { docsLayout, footer, header, REPO } from "../shell.js";
import { icon } from "../icons.js";
import { formatBytes, labelOf, packageDirOf, packageInfo, REPO_ROOT } from "../packages.js";
import { mark } from "../brand/mark.js";

export const componentsIndex = {
  meta: {
    path: "/components/",
    title: "Components · lit-material",
    description: "Every lit-material component, grouped the way Material 3 groups them, plus data and console components for admin UIs.",
  },
  render: () =>
    docsLayout({
      path: "/components/",
      toc: GROUPS.map((g) => ({ id: g.id, text: g.label })),
      content: html`
        <article class="docs-article" data-pagefind-body>
          <h1>Components</h1>
          <p class="docs-lead">lit-material has ${GROUPS.reduce((n, g) => n + g.items.length, 0)} components, grouped by what they're for: ${GROUPS.map((g) => g.label.toLowerCase()).join(", ")}. Each is a package you install on its own, and every page shows a live example, the install line and the full API.</p>
          ${GROUPS.map(
            (g) => html`
              <section class="component-group" aria-labelledby=${g.id}>
                <h2 id=${g.id}>${g.label}</h2>
                <p>${g.about}</p>
                <ul class="component-grid">
                  ${g.items.map((slug) => {
                    const info = packageInfo(packageDirOf(slug));
                    return html`<li><a href=${`/components/${slug}/`}><b>${labelOf(slug)}</b>${info?.size ? html`<span>${formatBytes(info.size)}</span>` : nothing}</a></li>`;
                  })}
                </ul>
              </section>`,
          )}
        </article>`,
    }),
};

const SHOWCASE = [
  {
    name: "The rws admin UI",
    image: "/brand/showcase-admin.png",
    alt: "The rws admin UI overview: uptime, request counters, a low disk warning and a requests per second chart.",
    text: "The admin console built into the rws web server: live traffic, upstreams, certificates, controls and the access log. Navigation, stats, charts, tables, switches and the log viewer are lit-material.",
    href: "https://rws8.tech/docs/features/admin/",
    link: "About the admin UI",
  },
  {
    name: "HITOP web app",
    image: "/brand/showcase-hitop.png",
    alt: "The HITOP web app: a sidebar of request collections and a request editor with its response.",
    text: "An HTTP client in the browser: collections, environments, auth and tests. Dialogs, tabs, menus, key value editors, sortable lists and the theme toggle are lit-material.",
    href: "https://hitop.rws8.tech/app/",
    link: "Open HITOP",
  },
  {
    name: "rws8.tech",
    image: "/brand/showcase-rws.png",
    alt: "An rws8.tech docs page with its sidebar, version switch and an On this page list.",
    text: "The rws website and its versioned docs, rendered on the server with Lit SSR. Tabs, code blocks, alerts, jump links and the back to top button are lit-material.",
    href: "https://rws8.tech/",
    link: "Visit rws8.tech",
  },
];

export const showcase = {
  meta: { path: "/showcase/", title: "Showcase · lit-material", description: "Products built with lit-material: the rws admin UI, the HITOP web app and the rws8.tech website." },
  render: () => html`
    ${header("/showcase/")}
    <main id="main" class="container page-text showcase">
      <h1>Built with lit-material</h1>
      <p class="lead">Three products that run on these components today.</p>
      ${SHOWCASE.map(
        (s) => html`
          <section class="showcase-item reveal" aria-labelledby=${s.name.replace(/\W+/g, "-").toLowerCase()}>
            <img src=${s.image} alt=${s.alt} width="1280" height="800" loading="lazy" />
            <div>
              <h2 id=${s.name.replace(/\W+/g, "-").toLowerCase()}>${s.name}</h2>
              <p>${s.text}</p>
              <a class="text-link" href=${s.href}>${s.link} ${unsafeHTML(icon("arrow-right"))}</a>
            </div>
          </section>`,
      )}
    </main>
    ${footer()}`,
};

/** Releases from every package's CHANGELOG.md, newest version per package first. */
function releases() {
  const out = [];
  for (const dir of readdirSync(join(REPO_ROOT, "packages")).sort()) {
    const file = join(REPO_ROOT, "packages", dir, "CHANGELOG.md");
    const pkg = join(REPO_ROOT, "packages", dir, "package.json");
    if (!existsSync(file) || !existsSync(pkg)) continue;
    const { name, private: priv } = JSON.parse(readFileSync(pkg, "utf8"));
    if (priv) continue;
    const text = readFileSync(file, "utf8");
    const parts = text.split(/^## /m).slice(1, 4);
    for (const part of parts) {
      const [version, ...rest] = part.split("\n");
      const notes = rest
        .filter((l) => /^- /.test(l) && !/Updated dependencies/.test(l))
        .map((l) => l.replace(/^- ([0-9a-f]{7}: )?/, "").trim());
      if (notes.length) out.push({ name, version: version.trim(), notes });
    }
  }
  return out;
}

export const changelog = {
  meta: { path: "/changelog/", title: "Changelog · lit-material", description: "What changed in each lit-material package: the last three releases of every package." },
  render: () => {
    const items = releases();
    const byName = new Map();
    for (const r of items) byName.set(r.name, [...(byName.get(r.name) ?? []), r]);
    return html`
      ${header("/changelog/")}
      <main id="main" class="container page-text changelog">
        <h1>Changelog</h1>
        <p class="lead">The last three releases of every package with notes. The full history is in each package's CHANGELOG.md on <a href=${REPO}>GitHub</a>.</p>
        ${[...byName].map(
          ([name, rs]) => html`
            <section aria-label=${name}>
              <h2>${name}</h2>
              ${rs.map((r) => html`<h3>${r.version}</h3><ul>${r.notes.map((n) => html`<li>${unsafeHTML(n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/`([^`]+)`/g, "<code>$1</code>"))}</li>`)}</ul>`)}
            </section>`,
        )}
      </main>
      ${footer()}`;
  },
};

export const privacy = {
  meta: { path: "/privacy/", title: "Privacy · lit-material", description: "lit.rws8.tech sets no cookies and runs no analytics." },
  render: () => html`
    ${header("/privacy/")}
    <main id="main" class="container page-text">
      <h1>Privacy</h1>
      <p class="lead">This site sets no cookies and runs no analytics, trackers or third party scripts.</p>
      <h2>What the server keeps</h2>
      <p>The web server writes an access log (address, time, page, status and browser) to find faults and stop abuse. Logs are kept on the server and rotated; they are not shared.</p>
      <h2>What your browser keeps</h2>
      <p>If you pick light or dark mode, your browser keeps that choice in local storage under <code>lit-theme</code>. Search runs in your browser against an index downloaded from this site.</p>
      <h2>Contact</h2>
      <p>Questions go to <a href="mailto:bohdaq@gmail.com">bohdaq@gmail.com</a>.</p>
    </main>
    ${footer()}`,
};

export const notFound = {
  meta: { path: "/404.html", canonical: "/", title: "Page not found · lit-material", description: "This page doesn't exist.", noindex: true },
  render: () => html`
    ${header("/404.html")}
    <main id="main" class="container not-found">
      <div class="not-found-mark" aria-hidden="true">${unsafeHTML(mark({ title: "lit-material" }))}</div>
      <h1>This page isn't here</h1>
      <p class="lead">It may have moved when the docs moved to lit.rws8.tech. Try the components or search from any docs page.</p>
      <div class="install">
        <a class="button-filled" href="/components/">${unsafeHTML(icon("squares-four"))} Browse the components</a>
        <a class="text-link" href="/">Home ${unsafeHTML(icon("arrow-right"))}</a>
      </div>
    </main>
    ${footer()}`,
};
