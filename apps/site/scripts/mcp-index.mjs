// The docs MCP server's data: dist/mcp/<major.minor>.json (every component
// and guide page as Markdown, split into sections) and dist/mcp/index.json
// (the version and the changelog by release), in the format rust-web-server's
// site/mcp reads (rws-docs-mcp, the server behind rws8.tech/mcp). The same
// binary serves lit.rws8.tech/mcp from /var/www/lit/mcp
// (deploy/lit-docs-mcp.service). Runs after prerender.mjs: pages come from
// the prerendered HTML, so the index says what the site says; component pages
// also get their package README's usage sections.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUPS, GUIDE_GROUPS, PACKAGE_OF } from "../src/catalog.js";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(site, "..", "..");
const dist = join(site, "dist");
const ORIGIN = "https://lit.rws8.tech";

// ---- HTML → Markdown, for the small tag set the site renders -------------

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["style", "script"]);

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–", rarr: "→", larr: "←", times: "×", middot: "·" }[e.toLowerCase()] ?? m;
  });
}

/** A tree of { tag, attrs, children } and strings; comments dropped. */
function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\?[^>]*>|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+|<)/gi;
  let m;
  while ((m = re.exec(html))) {
    const top = stack.at(-1);
    if (m[5] !== undefined) top.children.push(decode(m[5]));
    else if (m[1]) {
      const tag = m[1].toLowerCase();
      const i = stack.findLastIndex((n) => n.tag === tag);
      if (i > 0) stack.length = i;
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const attrs = {};
      for (const a of m[3].matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? "");
      const node = { tag, attrs, children: [] };
      top.children.push(node);
      if (RAW.has(tag)) {
        const end = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
        re.lastIndex = end < 0 ? html.length : html.indexOf(">", end) + 1;
      } else if (!VOID.has(tag) && !m[4]) stack.push(node);
    }
  }
  return root;
}

const classes = (n) => (n.attrs?.class ?? "").split(/\s+/);

/** Parts of a page that aren't its text: demos, icons, controls, page chrome. */
function skipped(n, parent) {
  if (RAW.has(n.tag) || n.tag === "svg" || n.tag === "img" || n.tag === "nav" || n.tag === "aside") return true;
  if ("data-pagefind-ignore" in n.attrs || "aria-hidden" in n.attrs) return true;
  if (["select", "option", "input", "textarea", "button", "label", "form"].includes(n.tag)) return true;
  const c = classes(n);
  if (c.includes("demo") && !c.includes("guide-embed")) return true;
  if (c.some((x) => ["breadcrumb", "docs-edit", "docs-pager", "facts", "controls", "control"].includes(x))) return true;
  // Live examples' own light DOM (labels inside example components).
  if (n.tag.startsWith("lit-material-")) return true;
  // Shadow roots: only an embedded guide page's own (docs-*-page) is text.
  if (n.tag === "template") return !(parent?.tag ?? "").startsWith("docs-");
  return false;
}

function inline(nodes, parent) {
  let out = "";
  for (const n of nodes) {
    if (typeof n === "string") out += n.replace(/\s+/g, " ");
    else if (skipped(n, parent)) continue;
    else if (n.tag === "br") out += "\n";
    else if (n.tag === "code" || n.tag === "kbd") {
      const t = text(n).replace(/\s+/g, " ");
      out += t ? (t.includes("`") ? `\`\` ${t} \`\`` : `\`${t}\``) : "";
    } else if (n.tag === "strong" || n.tag === "b") {
      const t = inline(n.children, n).trim();
      out += t ? `**${t}**` : "";
    } else if (n.tag === "em" || n.tag === "i") {
      const t = inline(n.children, n).trim();
      out += t ? `*${t}*` : "";
    } else if (n.tag === "a") {
      const t = inline(n.children, n).trim();
      let href = n.attrs.href ?? "";
      if (href.startsWith("/")) href = ORIGIN + href;
      out += t && href && !href.startsWith("#") ? `[${t}](${href})` : t;
    } else out += inline(n.children, n);
  }
  return out;
}

function text(n) {
  return typeof n === "string" ? n : n.children.map(text).join("");
}

function table(n) {
  const rows = [];
  const walk = (x) => {
    for (const c of x.children) {
      if (typeof c === "string") continue;
      if (c.tag === "tr") rows.push(c.children.filter((d) => typeof d !== "string" && (d.tag === "td" || d.tag === "th")).map((d) => inline(d.children, d).trim().replace(/\|/g, "\\|").replace(/\n/g, " ")));
      else walk(c);
    }
  };
  walk(n);
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const line = (r) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? "").join(" | ")} |`;
  return [line(rows[0]), `| ${Array(width).fill("---").join(" | ")} |`, ...rows.slice(1).map(line)].join("\n");
}

const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "main", "ul", "ol", "li", "pre", "table", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "dl", "dt", "dd", "figure", "figcaption", "details", "summary", "hr", "template"]);
const hasBlock = (n) => n.children.some((c) => typeof c !== "string" && (BLOCK.has(c.tag) || (!skipped(c, n) && hasBlock(c))));

/** Markdown blocks, and the headings' ids in order (for section anchors). */
function blocks(n, out, ids, depth = 0) {
  let run = [];
  const flush = () => {
    const t = inline(run, n).trim();
    if (t) out.push(t);
    run = [];
  };
  for (const c of n.children) {
    if (typeof c === "string" || (!BLOCK.has(c.tag) && !hasBlock(c))) {
      run.push(c);
      continue;
    }
    flush();
    if (skipped(c, n)) continue;
    const h = c.tag.match(/^h([1-6])$/);
    if (h) {
      const t = inline(c.children, c).trim();
      if (!t) continue;
      out.push(`${"#".repeat(Number(h[1]))} ${t}`);
      ids.push({ heading: t.replace(/`/g, ""), id: c.attrs.id ?? "" });
    } else if (c.tag === "pre") {
      const code = text(c).replace(/\n+$/, "");
      const fence = code.includes("```") ? "````" : "```";
      out.push(`${fence}\n${code}\n${fence}`);
    } else if (c.tag === "table") {
      const t = table(c);
      if (t) out.push(t);
    } else if (c.tag === "ul" || c.tag === "ol") {
      let i = 0;
      const items = [];
      for (const li of c.children) {
        if (typeof li === "string" || li.tag !== "li" || skipped(li, c)) continue;
        const inner = [];
        blocks(li, inner, ids, depth + 1);
        const marker = c.tag === "ol" ? `${++i}. ` : "- ";
        items.push(marker + inner.join("\n\n").replace(/\n/g, `\n${" ".repeat(marker.length)}`));
      }
      if (items.length) out.push(items.join("\n"));
    } else if (c.tag === "blockquote") {
      const inner = [];
      blocks(c, inner, ids, depth + 1);
      if (inner.length) out.push(inner.join("\n\n").replace(/^/gm, "> "));
    } else if (c.tag === "hr") {
      out.push("---");
    } else blocks(c, out, ids, depth + 1);
  }
  flush();
}

function findArticle(n) {
  if (typeof n === "string") return null;
  if (n.tag === "article" || n.tag === "main") {
    const inner = n.children.map(findArticle).find(Boolean);
    return n.tag === "article" ? n : (inner ?? n);
  }
  for (const c of n.children) {
    const f = findArticle(c);
    if (f) return f;
  }
  return null;
}

/** A prerendered page's article as Markdown (its h1 dropped: that's the title). */
function pageMarkdown(file) {
  const article = findArticle(parse(readFileSync(file, "utf8")));
  if (!article) throw new Error(`mcp-index: no <article> in ${file}`);
  const out = [];
  const ids = [];
  blocks(article, out, ids);
  const h1 = out.findIndex((b) => /^# /.test(b));
  const title = h1 >= 0 ? out[h1].slice(2).replace(/[*`]/g, "") : "";
  if (h1 >= 0) out.splice(h1, 1);
  // Embedded guides repeat the h1 inside the shadow root.
  const again = out.findIndex((b) => b === `# ${title}`);
  if (again >= 0) out.splice(again, 1);
  // A heading with nothing under it (the live "Example" of a component page).
  const kept = out.filter((b, i) => !(/^## /.test(b) && (i + 1 === out.length || /^## /.test(out[i + 1]))));
  return { title, markdown: kept.join("\n\n").replace(/^#{4,6} /gm, "### "), ids: ids.filter((x) => x.heading !== title) };
}

// ---- Sections, as rws's mcp-index.js splits them -------------------------

const slug = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");

function sections(body, ids) {
  const used = new Map();
  const out = [{ id: "", heading: "", depth: 1, lines: [] }];
  let fence = null;
  let next = 0;
  for (const line of body.split("\n")) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) fence = fence && f[1].startsWith(fence) ? null : (fence ?? f[1]);
    const h = !fence && line.match(/^(#{2,3})\s+(.*?)\s*#*\s*$/);
    if (h) {
      const heading = h[2].replace(/`/g, "").replace(/\*\*/g, "");
      let id = "";
      const k = ids.findIndex((x, i) => i >= next && x.heading.replace(/\*\*/g, "") === heading);
      if (k >= 0) {
        id = ids[k].id;
        next = k + 1;
      }
      if (!id) {
        const base = slug(heading);
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        id = n ? `${base}-${n}` : base;
      }
      out.push({ id, heading, depth: h[1].length, lines: [] });
    } else out.at(-1).lines.push(line);
  }
  return out.map(({ lines, ...s }) => ({ ...s, text: lines.join("\n").trim() })).filter((s) => s.text || s.heading);
}

// ---- README usage for component pages ------------------------------------

/** "## Heading" chunks of a README, without its title, badges and images. */
function readmeChunks(dir) {
  const file = join(repo, "packages", dir, "README.md");
  if (!existsSync(file)) return [];
  const chunks = [];
  let fence = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) fence = fence && f[1].startsWith(fence) ? null : (fence ?? f[1]);
    const h = !fence && line.match(/^##\s+(.*?)\s*$/);
    if (h) chunks.push({ heading: h[1].replace(/`/g, ""), lines: [] });
    else if (chunks.length && !(!fence && /^!\[/.test(line))) chunks.at(-1).lines.push(line);
  }
  return chunks.map((c) => ({ heading: c.heading, body: c.lines.join("\n").trim() }));
}

const SKIP_README = /^(install|api|license|contributing|development|scripts|testing|tests|browser support|bundle size|size)$/i;

function readmeUsage(pageSlug, label) {
  const dir = PACKAGE_OF[pageSlug] ?? pageSlug;
  const chunks = readmeChunks(dir);
  // A page about one element of another package: that element's section.
  const own = PACKAGE_OF[pageSlug]
    ? chunks.filter((c) => slug(c.heading) === slug(label) || c.heading.includes(`lit-material-${pageSlug}`))
    : chunks.filter((c) => !SKIP_README.test(c.heading) && !Object.keys(PACKAGE_OF).some((s) => PACKAGE_OF[s] === dir && (slug(c.heading) === s || slug(c.heading) === slug(s.replace(/-/g, " ")))));
  // Headings one level down, so the page's own ## sections stay the top level.
  // README "Usage" sits under the page's own "Usage" heading without one of its own.
  return own.filter((c) => c.body).map((c) => `${/^usage$/i.test(c.heading) ? "" : `### ${c.heading}\n\n`}${c.body.replace(/^(#{3,5}) /gm, "#$1 ").replace(/^#{5,} /gm, "#### ")}`).join("\n\n");
}

// ---- Pages ---------------------------------------------------------------

/** A prerendered page; `extra(title)` gives Markdown to add as its "Usage" section. */
function page(path, group, extra = () => "") {
  const file = join(dist, path, "index.html");
  if (!existsSync(file)) throw new Error(`mcp-index: ${file} missing; run prerender first`);
  const html = readFileSync(file, "utf8");
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const { title, markdown, ids } = pageMarkdown(file);
  const usage = extra(title);
  const body = usage ? `${markdown}\n\n## Usage\n\n${usage}` : markdown;
  return { path, group, title, description, url: `${ORIGIN}/${path}/`, markdown: body, sections: sections(body, ids) };
}

const pages = [page("components", "Components")];
for (const g of GROUPS) for (const s of g.items) pages.push(page(`components/${s}`, `Components: ${g.label}`, (title) => readmeUsage(s, title)));
for (const g of GUIDE_GROUPS) for (const item of g.items) pages.push(page(`guides/${item.slug}`, `Guides: ${g.label}`));

// ---- Version and changelog -----------------------------------------------

const tag = JSON.parse(readFileSync(join(repo, "packages", "core", "package.json"), "utf8")).version;
const version = tag.split(".").slice(0, 2).join(".");

// Changesets writes one CHANGELOG.md per package and repeats a note in every
// package it touched: merge them per release, each note once, with the
// packages it names.
const releases = new Map();
for (const dir of readdirSync(join(repo, "packages")).sort()) {
  const file = join(repo, "packages", dir, "CHANGELOG.md");
  const pkgFile = join(repo, "packages", dir, "package.json");
  if (!existsSync(file) || !existsSync(pkgFile)) continue;
  const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
  if (pkg.private) continue;
  for (const part of readFileSync(file, "utf8").split(/\n(?=## )/)) {
    const m = part.match(/^## (\d+\.\d+\.\d+)\s*\n([\s\S]*)$/);
    if (!m) continue;
    const rel = releases.get(m[1]) ?? new Map();
    releases.set(m[1], rel);
    for (const kind of m[2].split(/\n(?=### )/)) {
      const k = kind.match(/^### (.*)\n([\s\S]*)$/);
      if (!k) continue;
      const notes = rel.get(k[1].trim()) ?? new Map();
      rel.set(k[1].trim(), notes);
      for (const item of k[2].split(/\n(?=- )/)) {
        const note = item.replace(/^- /, "").replace(/^[0-9a-f]{7,}: /, "").trim();
        if (!note || /^Updated dependencies/.test(note) || /^@lit-material\/[\w-]+@[\d.]+$/.test(note)) continue;
        notes.set(note, [...(notes.get(note) ?? []), pkg.name]);
      }
    }
  }
}
const cmp = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
};
// Breaking-change wording the server looks for ("### Breaking…") goes first.
const KIND_ORDER = ["Major Changes", "Minor Changes", "Patch Changes"];
const changelog = [...releases.keys()].sort(cmp).flatMap((v) => {
  const kinds = [...releases.get(v)].filter(([, notes]) => notes.size).sort(([a], [b]) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b));
  if (!kinds.length) return [];
  const markdown = kinds
    .map(([kind, notes]) => `### ${kind === "Major Changes" ? "Breaking changes (major)" : kind}\n\n${[...notes].map(([note, pkgs]) => `- ${pkgs.length > 3 ? `${pkgs.length} packages` : pkgs.join(", ")}: ${note.replace(/\n/g, "\n  ")}`).join("\n")}`)
    .join("\n\n");
  return [{ version: v, title: "", markdown }];
});

mkdirSync(join(dist, "mcp"), { recursive: true });
writeFileSync(join(dist, "mcp", `${version}.json`), JSON.stringify({ version, tag, latest: true, pages, settings: [], api: [], examples: [], skill: "" }));
writeFileSync(join(dist, "mcp", "index.json"), JSON.stringify({ latest: version, versions: [{ version, tag }], changelog }));
const n = pages.reduce((s, p) => s + p.sections.length, 0);
console.log(`mcp index: ${pages.length} pages, ${n} sections, ${changelog.length} releases (docs ${version})`);
