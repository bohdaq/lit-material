// /components/<slug>/ — one page per component: what it is, how to install it,
// a live demo (the docs demo element, server rendered and hydrated), and its
// API from the package's custom-elements.json.
import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { unsafeStatic, html as staticHtml } from "lit/static-html.js";
import { GROUPS } from "../catalog.js";
import { docsLayout, REPO, articleLd } from "../shell.js";
import { icon } from "../icons.js";
import { elementsForPage, formatBytes, functionsOf, labelOf, packageDirOf, packageInfo } from "../packages.js";

const escapeHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Manifest text is Markdown-ish: escape it, then keep `code` spans. */
const md = (s) => unsafeHTML(escapeHtml(s).replace(/`([^`]+)`/g, "<code>$1</code>"));

function table(caption, columns, rows) {
  if (!rows.length) return nothing;
  return html`
    <h4>${caption}</h4>
    <div class="table-wrap">
      <table class="api-table">
        <thead><tr>${columns.map((c) => html`<th scope="col">${c}</th>`)}</tr></thead>
        <tbody>${rows.map((r) => html`<tr>${r.map((cell) => html`<td>${cell}</td>`)}</tr>`)}</tbody>
      </table>
    </div>`;
}

const code = (s) => (s ? html`<code>${s}</code>` : html`<span class="muted">none</span>`);

function elementApi(decl) {
  const props = (decl.members ?? []).filter((m) => m.kind === "field" && !m.static && m.privacy !== "private" && m.privacy !== "protected" && !m.name.startsWith("_"));
  const attrs = new Map((decl.attributes ?? []).map((a) => [a.fieldName ?? a.name, a.name]));
  return html`
    <section class="api-element" aria-labelledby=${`api-${decl.tagName}`}>
      <h3 id=${`api-${decl.tagName}`}><code>&lt;${decl.tagName}&gt;</code></h3>
      ${decl.description ? html`<p>${md(decl.description.split("\n\n")[0])}</p>` : nothing}
      ${table(
        "Properties",
        ["Property", "Attribute", "Type", "Default", "Description"],
        props.map((p) => [code(p.name), attrs.has(p.name) ? code(attrs.get(p.name)) : html`<span class="muted">property only</span>`, code(p.type?.text), code(p.default), md(p.description)]),
      )}
      ${table("Events", ["Event", "Description"], (decl.events ?? []).filter((e) => e.name).map((e) => [code(e.name), md(e.description)]))}
      ${table("Slots", ["Slot", "Description"], (decl.slots ?? []).map((s) => [s.name ? code(s.name) : html`default`, md(s.description)]))}
      ${table("CSS parts", ["Part", "Description"], (decl.cssParts ?? []).map((p) => [code(p.name), md(p.description)]))}
      ${table("CSS custom properties", ["Property", "Description"], (decl.cssProperties ?? []).map((p) => [code(p.name), md(p.description)]))}
    </section>`;
}

function functionApi(fns) {
  return table(
    "Functions",
    ["Function", "Description"],
    fns.map((f) => [code(`${f.name}(${(f.parameters ?? []).map((p) => p.name).join(", ")})`), md(f.description)]),
  );
}

/** The docs demo element for a route, as a tag name: `<docs-button-page>` → "docs-button-page". */
function demoTag(entry) {
  const result = entry.render({});
  const match = /<(docs-[a-z0-9-]+)/.exec(result.strings.join(""));
  return match?.[1] ?? null;
}

export function componentPage(slug, entry) {
  const group = GROUPS.find((g) => g.items.includes(slug));
  const label = labelOf(slug);
  const dir = packageDirOf(slug);
  const info = packageInfo(dir);
  const elements = elementsForPage(slug, info);
  const fns = elements.length ? [] : functionsOf(info?.manifest);
  const tag = demoTag(entry);
  const entryPoint = elements.length && elementsForPage(dir, info).length > 1 && elements.length === 1 ? `${info.name}/${elements[0].tagName.replace("lit-material-", "")}.js` : null;
  const index = group.items.indexOf(slug);
  const prev = group.items[index - 1];
  const next = group.items[index + 1];
  const description = `${info?.description || label}`.replace(/\s+/g, " ").trim();
  const meta = {
    path: `/components/${slug}/`,
    title: `${label}: a Material 3 web component · lit-material`,
    description: description.length > 150 ? `${description.slice(0, 147).replace(/\s\S*$/, "")}…` : description,
    // For the sitemap's lastmod: the package's last commit (prerender.mjs).
    sourceDir: `packages/${dir}`,
  };
  meta.jsonLd = articleLd({
    title: label,
    description: meta.description,
    path: meta.path,
    crumbs: [{ name: "Components", item: `https://lit.rws8.tech/components/` }, { name: group.label, item: `https://lit.rws8.tech/components/#${group.id}` }],
  });
  const toc = [
    { id: "example", text: "Example" },
    { id: "install", text: "Install" },
    { id: "api", text: "API" },
    ...elements.map((d) => ({ id: `api-${d.tagName}`, text: `<${d.tagName}>`, depth: 3 })),
  ];
  return {
    meta,
    render: () =>
      docsLayout({
        path: meta.path,
        toc,
        content: html`
          <article class="docs-article component-page" data-pagefind-body>
            <p class="breadcrumb"><a href="/components/">Components</a> <span aria-hidden="true">/</span> <a href=${`/components/#${group.id}`}>${group.label}</a></p>
            <h1>${label}</h1>
            <p class="docs-lead">${md(info?.description)}</p>
            <ul class="facts" data-pagefind-ignore>
              ${info?.size ? html`<li>${unsafeHTML(icon("feather"))}<span><b>${formatBytes(info.size)}</b> gzipped</span></li>` : nothing}
              <li>${unsafeHTML(icon("package"))}<span><b>${info?.name}</b> ${info?.version}</span></li>
              <li>${unsafeHTML(icon("hard-drives"))}<span>Renders on the server</span></li>
            </ul>

            <h2 id="example">Example</h2>
            <div class="demo">${tag ? staticHtml`<${unsafeStatic(tag)} embedded></${unsafeStatic(tag)}>` : entry.render({})}</div>

            <h2 id="install">Install</h2>
            <pre class="snippet"><code>npm install ${info?.name} @lit-material/tokens</code></pre>
            <pre class="snippet"><code>import "${entryPoint ?? info?.name}";</code></pre>
            <p>Link <code>@lit-material/tokens/css/index.css</code> once per page for the colour, type and shape tokens. <a href="/guides/install/">Install guide</a></p>

            <h2 id="api">API</h2>
            ${elements.length ? elements.map(elementApi) : functionApi(fns)}
            <p class="docs-edit">
              <a href=${`${REPO}/tree/main/packages/${dir}`}>${unsafeHTML(icon("github-logo"))} Source on GitHub</a>
              <a href=${`https://www.npmjs.com/package/${info?.name}`}>${unsafeHTML(icon("arrow-square-out"))} npm</a>
            </p>
          </article>
          <nav class="docs-pager" aria-label="Previous and next component">
            ${prev ? html`<a class="prev" href=${`/components/${prev}/`}><small>Previous</small><span>${labelOf(prev)}</span></a>` : html`<span></span>`}
            ${next ? html`<a class="next" href=${`/components/${next}/`}><small>Next</small><span>${labelOf(next)}</span></a>` : nothing}
          </nav>`,
      }),
  };
}
