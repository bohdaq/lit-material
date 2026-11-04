// The md-web codemod: rewrites @material/web usage in one file's text to lit-material, editing the text in
// place (formatting, comments and expressions are left as they were) and reporting everything it changed
// and everything it couldn't change with confidence.
import { LIT_ELEMENTS, SYS_TOKENS } from "./generated.js";
import { BY_MODULE, BY_TAG, ELEMENTS, OTHER_MODULES, TOKEN_PREFIXES, type AttributeRule, type ElementMapping } from "./mappings.js";
import { scanHtml, scanScript, type Attr, type Syntax, type Tag } from "./scan.js";

export interface TransformResult {
  /** The rewritten source (the input, unchanged, when there was nothing to do). */
  code: string;
  /** What was changed, as `file:line: description`. */
  changes: string[];
  /** What needs a person, as `file:line: description`; nothing here was changed. */
  warnings: string[];
  /** The lit-material packages the rewritten file now uses. */
  packages: string[];
}

export type FileKind = Syntax | "css";

/** The kind of source a file name implies, or null for files the codemod doesn't read. */
export function kindOf(file: string): FileKind | null {
  const ext = /\.([a-z]+)$/i.exec(file)?.[1]?.toLowerCase();
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "tsx" || ext === "jsx") return "jsx";
  if (ext && ["ts", "mts", "cts", "js", "mjs", "cjs"].includes(ext)) return "lit";
  if (ext && ["css", "scss", "sass", "less"].includes(ext)) return "css";
  return null;
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

interface Binding {
  kind: "attr" | "prop" | "event";
  /** Lower-case kebab name used to look rules up (`supporting-text`), or the event name. */
  key: string;
  prefix: string;
  suffix: string;
  /** The value is code, not a literal. */
  expression: boolean;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

class Context {
  readonly edits: Edit[] = [];
  private readonly changeList: { at: number; text: string }[] = [];
  private readonly warningList: { at: number; text: string }[] = [];
  readonly packages = new Set<string>();
  /** Offsets of tag names the codemod has dealt with, so the leftover-reference check skips them. */
  readonly handled = new Set<number>();
  /** Lines already reported for @material/web references. */
  readonly reportedLines = new Set<number>();
  private readonly notesSeen = new Set<string>();
  private readonly lineStarts: number[] = [0];

  constructor(
    readonly src: string,
    readonly file: string,
  ) {
    for (let i = 0; i < src.length; i++) if (src[i] === "\n") this.lineStarts.push(i + 1);
  }

  line(at: number): number {
    let lo = 0;
    let hi = this.lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.lineStarts[mid]! <= at) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }

  change(at: number, text: string) {
    this.changeList.push({ at, text });
  }

  warn(at: number, text: string) {
    this.warningList.push({ at, text });
  }

  note(at: number, key: string, text: string) {
    if (this.notesSeen.has(key)) return;
    this.notesSeen.add(key);
    this.warn(at, text);
  }

  replace(start: number, end: number, text: string) {
    this.edits.push({ start, end, text });
  }

  /** Removes an attribute and the whitespace before it. */
  removeAttr(attr: Attr) {
    let start = attr.start;
    while (start > 0 && /\s/.test(this.src[start - 1]!)) start--;
    this.replace(start, attr.end, "");
  }

  result(): TransformResult {
    const sorted = this.edits
      .map((e, i) => ({ ...e, i }))
      .sort((a, b) => a.start - b.start || (a.end === a.start ? 0 : 1) - (b.end === b.start ? 0 : 1) || a.i - b.i);
    let code = "";
    let cursor = 0;
    for (const e of sorted) {
      if (e.start < cursor) {
        this.warn(e.start, "the codemod skipped an edit here that overlapped another one; check this line by hand");
        continue;
      }
      code += this.src.slice(cursor, e.start) + e.text;
      cursor = e.end;
    }
    code += this.src.slice(cursor);
    const format = (list: { at: number; text: string }[]) =>
      list
        .map((x, i) => ({ ...x, i }))
        .sort((a, b) => a.at - b.at || a.i - b.i)
        .map((x) => `${this.file}:${this.line(x.at)}: ${x.text}`);
    return { code, changes: format(this.changeList), warnings: format(this.warningList), packages: [...this.packages].sort() };
  }
}

/** Rewrites @material/web usage in one file. `file` picks the syntax (by extension) and labels the reports. */
export function transform(source: string, file: string): TransformResult {
  const ctx = new Context(source, file);
  const kind = kindOf(file);
  if (kind === "html") {
    const tags = scanHtml(source);
    elements(ctx, tags, "html");
    for (const tag of tags) if (tag.script) script(ctx, tag.script.start, tag.script.end, "lit");
  } else if (kind === "lit" || kind === "jsx") {
    script(ctx, 0, source.length, kind);
  } else if (kind === null) {
    return { code: source, changes: [], warnings: [`${file}: not a file type the codemod reads (HTML, JS/TS, JSX/TSX, CSS)`], packages: [] };
  }
  tokens(ctx);
  leftovers(ctx);
  return ctx.result();
}

function script(ctx: Context, start: number, end: number, syntax: "lit" | "jsx") {
  const text = ctx.src.slice(start, end);
  const tags = scanScript(text, syntax, start);
  elements(ctx, tags, syntax);
  imports(ctx, text, start, tags);
}

// ---------------------------------------------------------------------------------------------- elements

function parseBinding(raw: string, syntax: Syntax, value: string | null, src: string, attr: Attr): Binding | null {
  let prefix = "";
  let name = raw;
  let suffix = "";
  let kind: Binding["kind"] = "attr";
  let bound = false;
  if (raw.startsWith("[(") || raw.startsWith("[class.") || raw.startsWith("[style.") || raw.startsWith("*") || raw.startsWith("#")) return null;
  if (raw.startsWith("[attr.") && raw.endsWith("]")) [prefix, name, suffix, bound] = ["[attr.", raw.slice(6, -1), "]", true];
  else if (raw.startsWith("[") && raw.endsWith("]")) [prefix, name, suffix, kind, bound] = ["[", raw.slice(1, -1), "]", "prop", true];
  else if (raw.startsWith("(") && raw.endsWith(")")) [prefix, name, suffix, kind] = ["(", raw.slice(1, -1), ")", "event"];
  else if (raw.startsWith("v-on:")) [prefix, name, kind] = ["v-on:", raw.slice(5), "event"];
  else if (raw.startsWith("v-bind:")) [prefix, name, bound] = ["v-bind:", raw.slice(7), true];
  else if (raw.startsWith(":")) [prefix, name, bound] = [":", raw.slice(1), true];
  else if (raw.startsWith("@")) [prefix, name, kind] = ["@", raw.slice(1), "event"];
  else if (raw.startsWith(".")) [prefix, name, kind, bound] = [".", raw.slice(1), "prop", true];
  else if (raw.startsWith("?")) [prefix, name, bound] = ["?", raw.slice(1), true];
  else if (syntax === "jsx" && /^on[a-z-]+$/.test(raw)) [prefix, name, kind] = ["on", raw.slice(2), "event"];
  if (prefix === ":" || prefix === "v-bind:" || prefix === "@" || prefix === "v-on:") {
    // Vue modifiers: `:checked.prop`, `@click.stop`.
    const dot = name.indexOf(".");
    if (dot > 0) [name, suffix] = [name.slice(0, dot), name.slice(dot)];
  }
  if (!name) return null;
  if (kind === "attr" && /[A-Z]/.test(name)) kind = "prop";
  const key = kind === "event" ? name : kind === "prop" ? kebab(name) : name.toLowerCase();
  const quoted = attr.valueStart > attr.start && /["']/.test(src[attr.valueStart - 1]!);
  const expression = bound || (value !== null && (value.includes("${") || value.includes("{{") || (syntax === "jsx" && !quoted && value.startsWith("{"))));
  return { kind, key, prefix, suffix, expression };
}

function formatName(b: Binding, key: string): string {
  return b.prefix + (b.kind === "prop" ? camel(key) : key) + b.suffix;
}

function elements(ctx: Context, tags: Tag[], syntax: Syntax) {
  const converted = new Map<Tag, ElementMapping>();
  for (const tag of tags) {
    if (!tag.name.toLowerCase().startsWith("md-")) continue;
    const mapping = BY_TAG.get(tag.name.toLowerCase());
    ctx.handled.add(tag.nameStart);
    if (tag.endNameStart !== undefined) ctx.handled.add(tag.endNameStart);
    if (!mapping) {
      ctx.warn(tag.start, `<${tag.name}> isn't an @material/web element the codemod knows (labs or your own?); left as it is`);
      continue;
    }
    if (!mapping.to) {
      ctx.warn(tag.start, `<${tag.name}> has no lit-material equivalent: ${mapping.why}`);
      continue;
    }
    converted.set(tag, mapping);
    element(ctx, tag, mapping, syntax);
  }
  for (const tag of tags) children(ctx, tag, tags, converted);
}

function element(ctx: Context, tag: Tag, mapping: ElementMapping, syntax: Syntax) {
  const { src } = ctx;
  let to = mapping.to!;
  const finalKeys = new Set<string>();
  const inserts: string[] = [];
  const contentParts: string[] = [];

  if (mapping.alternate) {
    const alt = mapping.alternate;
    for (const attr of tag.attrs) {
      const b = parseBinding(attr.raw, syntax, attr.value, src, attr);
      if (!b || b.kind === "event" || b.key !== alt.attribute) continue;
      if (b.expression) ctx.warn(attr.start, `<${tag.name}> ${attr.raw} is bound: if it can be "${alt.value}", use <${alt.to}> for that case`);
      else if (attr.value === alt.value) {
        to = alt.to;
        ctx.removeAttr(attr);
        attr.raw = "";
      }
    }
  }

  ctx.packages.add(mapping.package!);
  for (const [k, v] of Object.entries(mapping.set ?? {})) {
    inserts.push(v === true ? k : `${k}="${v}"`);
    finalKeys.add(k);
  }
  ctx.replace(tag.nameStart, tag.nameEnd, to);
  if (tag.endNameStart !== undefined) ctx.replace(tag.endNameStart, tag.endNameEnd!, to);
  ctx.change(tag.start, `<${tag.name}> → <${[to, ...inserts].join(" ")}>`);

  for (const attr of tag.attrs) {
    if (!attr.raw) continue;
    const b = parseBinding(attr.raw, syntax, attr.value, src, attr);
    if (!b) continue;
    if (b.kind === "event") {
      const rule = mapping.events?.[b.key];
      if (rule?.kind === "rename") {
        ctx.replace(attr.start, attr.nameEnd, formatName(b, rule.to));
        ctx.change(attr.start, `<${tag.name}> event ${b.key} → ${rule.to}`);
      } else if (rule) ctx.warn(attr.start, `<${tag.name}> event "${b.key}": ${rule.why}`);
      continue;
    }
    const rule = mapping.attributes?.[b.key];
    if (!rule) {
      finalKeys.add(b.key);
      continue;
    }
    attribute(ctx, tag, attr, b, rule, finalKeys, inserts, contentParts, syntax);
  }

  for (const [k, v] of Object.entries(mapping.defaults ?? {})) {
    if (finalKeys.has(k)) continue;
    const text = v === true ? k : `${k}="${v}"`;
    inserts.push(text);
    ctx.change(tag.start, `<${tag.name}> → added ${text} (@material/web's default differs from lit-material's)`);
  }
  if (inserts.length) ctx.replace(tag.nameEnd, tag.nameEnd, ` ${inserts.join(" ")}`);

  if (contentParts.length) {
    const content = contentParts.join(" ");
    if (tag.selfClosing) {
      let j = tag.closeStart;
      while (j > tag.nameEnd && /\s/.test(src[j - 1]!)) j--;
      ctx.replace(j, tag.startEnd, `>${content}</${to}>`);
    } else ctx.replace(tag.startEnd, tag.startEnd, content);
  }

  for (const note of mapping.notes ?? []) ctx.note(tag.start, `${mapping.md}:${note}`, note);
  if (mapping.md === "md-icon" && tag.endStart !== undefined) {
    const text = src.slice(tag.startEnd, tag.endStart).trim();
    if (/^[a-z][a-z0-9_]*$/.test(text)) {
      ctx.warn(tag.start, `<md-icon>${text}</md-icon> is a Material Symbols ligature, which lit-material-icon shows as plain text: register the SVG (registerIcons({ ${text}: svg })) and use name="${text}", or slot the <svg>`);
    }
  }
}

function attribute(
  ctx: Context,
  tag: Tag,
  attr: Attr,
  b: Binding,
  rule: AttributeRule,
  finalKeys: Set<string>,
  inserts: string[],
  contentParts: string[],
  syntax: Syntax,
) {
  const where = `<${tag.name}> ${attr.raw}`;
  switch (rule.kind) {
    case "rename": {
      finalKeys.add(rule.to);
      if (rule.to !== b.key) {
        ctx.replace(attr.start, attr.nameEnd, formatName(b, rule.to));
        ctx.change(attr.start, `${where} → ${formatName(b, rule.to)}`);
      }
      if (!rule.values || attr.value === null) return;
      const differs = Object.entries(rule.values).filter(([k, v]) => k !== v);
      if (b.expression) {
        if (differs.length) ctx.warn(attr.start, `${where} is bound: its values differ in lit-material (${differs.map(([k, v]) => `${k} → ${v}`).join(", ")}); map them in your code`);
        return;
      }
      const next = rule.values[attr.value];
      if (next === undefined) ctx.warn(attr.start, `${where}="${attr.value}" has no lit-material value (${Object.values(rule.values).join(", ")})`);
      else if (next !== attr.value) {
        ctx.replace(attr.valueStart, attr.valueEnd, next);
        ctx.change(attr.start, `${where}="${attr.value}" → "${next}"`);
      }
      return;
    }
    case "remove":
      ctx.removeAttr(attr);
      ctx.change(attr.start, `${where} removed: ${rule.why}`);
      return;
    case "warn":
      finalKeys.add(b.key);
      ctx.warn(attr.start, `${where}: ${rule.why}`);
      return;
    case "expand": {
      const rest = ctx.src.slice(attr.nameEnd, attr.end);
      const text = rule.to.map((k) => formatName(b, k) + rest).join(" ");
      rule.to.forEach((k) => finalKeys.add(k));
      ctx.replace(attr.start, attr.end, text);
      ctx.change(attr.start, `${where} → ${rule.to.join(" ")}`);
      return;
    }
    case "byValue": {
      if (b.expression || attr.value === null || rule.cases[attr.value] === undefined) {
        finalKeys.add(b.key);
        ctx.warn(attr.start, `${where}${attr.value === null ? "" : `="${attr.value}"`} has no direct equivalent: ${Object.entries(rule.cases).map(([k, v]) => `"${k}" → ${v || "nothing"}`).join(", ")}`);
        return;
      }
      const next = rule.cases[attr.value]!;
      if (next) {
        ctx.replace(attr.start, attr.end, next);
        finalKeys.add(next);
      } else ctx.removeAttr(attr);
      ctx.change(attr.start, `${where}="${attr.value}" → ${next || "removed"}`);
      return;
    }
    case "content": {
      if (attr.value === null || attr.value === "") {
        ctx.removeAttr(attr);
        ctx.change(attr.start, `${where} (empty) removed`);
        return;
      }
      let content: string;
      if (!b.expression) content = syntax === "jsx" && /[{}<>]/.test(attr.value) ? `{${JSON.stringify(attr.value)}}` : attr.value;
      else if (syntax === "lit" || syntax === "jsx" || attr.value.includes("{{")) content = attr.value;
      else content = `{{ ${attr.value} }}`;
      contentParts.push(content);
      ctx.removeAttr(attr);
      ctx.change(attr.start, `${where} → text content`);
      if (rule.alsoSet && !finalKeys.has(rule.alsoSet)) {
        finalKeys.add(rule.alsoSet);
        inserts.push(rule.alsoSet);
        ctx.change(attr.start, `${where} → added ${rule.alsoSet}`);
        if (b.expression) ctx.warn(attr.start, `${where} is bound and ${rule.alsoSet} is now always set; bind ${rule.alsoSet} to whether the label is empty if it can be`);
      }
      return;
    }
  }
}

function children(ctx: Context, tag: Tag, tags: Tag[], converted: Map<Tag, ElementMapping>) {
  const parent = tag.parent;
  const parentMapping = parent ? converted.get(parent) : undefined;
  const slot = tag.attrs.find((a) => a.raw === "slot");
  if (parentMapping && slot) {
    const rule = slot.value === null ? undefined : parentMapping.childSlots?.[slot.value];
    if (rule === null) {
      ctx.removeAttr(slot);
      ctx.change(slot.start, `slot="${slot.value}" removed: the default slot of ${parentMapping.to}`);
    } else if (typeof rule === "string") {
      ctx.replace(slot.valueStart, slot.valueEnd, rule);
      ctx.change(slot.start, `slot="${slot.value}" → slot="${rule}" (in ${parentMapping.to})`);
    } else if (rule) ctx.warn(slot.start, `slot="${slot.value}" in <${parent!.name}>: ${rule.warn}`);
  }
  if (parentMapping?.iconSlot && !slot && tag.name.toLowerCase() === "md-icon") {
    ctx.replace(tag.nameEnd, tag.nameEnd, ` slot="${parentMapping.iconSlot}"`);
    ctx.change(tag.start, `<md-icon> in <${parent!.name}> → slot="${parentMapping.iconSlot}"`);
  }
  const mapping = converted.get(tag);
  if (mapping?.iconSlot && tag.endStart !== undefined && ctx.src.slice(tag.startEnd, tag.endStart).trim()) {
    const kids = tags.filter((t) => t.parent === tag);
    const slotted = kids.some((t) => t.name.toLowerCase() === "md-icon" || t.attrs.some((a) => a.raw === "slot"));
    if (!slotted) ctx.warn(tag.start, `<${tag.name}>'s content goes in ${mapping.to}'s "${mapping.iconSlot}" slot (it has no default slot): add slot="${mapping.iconSlot}" to the icon`);
  }
}

// ----------------------------------------------------------------------------------------------- imports

const IMPORT = /^([ \t]*)import\s+(?:([^'";]*?)\s+from\s+)?(['"])@material\/web\/([^'"]+?)\3([ \t]*;)?[ \t]*(\r?\n|$)/gm;
const EXISTING = /\bimport\s*(?:[^'";]*?\s+from\s+)?['"](@lit-material\/[\w-]+)['"]/g;

function imports(ctx: Context, text: string, offset: number, tags: Tag[]) {
  const have = new Set([...text.matchAll(EXISTING)].map((m) => m[1]!));
  for (const m of text.matchAll(IMPORT)) {
    const [whole, indent, bindings, quote, path, semi, newline] = m;
    const start = m.index + offset;
    const end = start + whole.length;
    const module = path!.replace(/\.js$/, "");
    const spec = `@material/web/${path}`;
    ctx.reportedLines.add(ctx.line(start));
    const mapping = BY_MODULE.get(module);
    if (bindings) {
      const lit = mapping?.to ? LIT_ELEMENTS[mapping.to] : undefined;
      ctx.warn(start, `import ${bindings.trim()} from "${spec}": ${lit ? `lit-material's class is ${lit.className} from "${lit.package}"; update the import and its uses by hand` : "no lit-material equivalent; remove its uses"}`);
      continue;
    }
    if (mapping?.package) {
      if (have.has(mapping.package)) {
        ctx.replace(start, end, "");
        ctx.change(start, `import "${spec}" removed: "${mapping.package}" is already imported`);
      } else {
        have.add(mapping.package);
        ctx.replace(start, end, `${indent}import ${quote}${mapping.package}${quote}${semi ? ";" : ""}${newline}`);
        ctx.change(start, `import "${spec}" → import "${mapping.package}"`);
      }
      ctx.packages.add(mapping.package);
    } else if (mapping) ctx.warn(start, `import "${spec}": <${mapping.md}> has no lit-material equivalent (${mapping.why}); remove the import`);
    else if (module === "all") {
      const used = [...new Set(tags.map((t) => BY_TAG.get(t.name.toLowerCase())?.package).filter((p): p is string => !!p))].sort();
      const list = used.length ? used : [...new Set(ELEMENTS.map((e) => e.package).filter((p): p is string => !!p))].sort();
      ctx.warn(start, `import "${spec}": ${OTHER_MODULES.all}${used.length ? " (this file uses: " : " (the components @material/web has: "}${list.map((p) => `import "${p}";`).join(" ")})`);
    } else if (OTHER_MODULES[module]) ctx.warn(start, `import "${spec}": ${OTHER_MODULES[module]}`);
    else ctx.warn(start, `import "${spec}": not a module the codemod knows (labs?); no lit-material mapping`);
  }
}

// -------------------------------------------------------------------------------------------- CSS tokens

const TOKEN = /--md-([a-z0-9]+(?:-[a-z0-9]+)*)/g;
const PREFIXES = Object.keys(TOKEN_PREFIXES).sort((a, b) => b.length - a.length);
const KNOWN_SYS = new Set(SYS_TOKENS);

function tokens(ctx: Context) {
  const unread = new Map<string, number>();
  const seen = new Set<string>();
  for (const m of ctx.src.matchAll(TOKEN)) {
    const name = m[1]!;
    const token = `--md-${name}`;
    const once = `${token}@${ctx.line(m.index)}`;
    if (seen.has(once)) continue;
    seen.add(once);
    if (name.startsWith("sys-")) {
      if (!KNOWN_SYS.has(token) && !unread.has(token)) unread.set(token, m.index);
      continue;
    }
    if (name.startsWith("ref-typeface-")) {
      ctx.warn(m.index, `${token}: lit-material doesn't read --md-ref-* tokens; set the --md-sys-typescale-<role>-<size>-font tokens (in @lit-material/tokens/css/typescale.css) instead`);
      continue;
    }
    const prefix = PREFIXES.find((p) => name === p || name.startsWith(`${p}-`));
    if (prefix === undefined) {
      ctx.warn(m.index, `${token}: an @material/web token the codemod doesn't know; lit-material has no equivalent of that name`);
      continue;
    }
    const target = TOKEN_PREFIXES[prefix];
    const facts = target ? LIT_ELEMENTS[target] : undefined;
    if (!target || !facts) {
      ctx.warn(m.index, `${token}: lit-material has no md-${prefix} element; components draw their own (style ::part(ripple) and ::part(focus-ring) where a component has them)`);
      continue;
    }
    const props = facts.cssProperties.length ? `custom properties ${facts.cssProperties.join(", ")}` : "no custom properties of its own";
    const parts = facts.cssParts.length ? `parts ${facts.cssParts.map((p) => `::part(${p})`).join(", ")}` : "no CSS parts";
    ctx.warn(m.index, `${token}: @material/web component tokens have no lit-material equivalent. ${target} has ${props}; ${parts}; colours, shapes and type come from the --md-sys-* tokens`);
  }
  if (unread.size) {
    const [first] = [...unread.values()];
    ctx.warn(first!, `${unread.size} --md-sys-* token${unread.size === 1 ? " isn't" : "s aren't"} read by any lit-material component (kept; they just have no effect): ${[...unread.keys()].join(", ")}`);
  }
}

// ------------------------------------------------------------------------------------------- leftovers

function leftovers(ctx: Context) {
  for (const m of ctx.src.matchAll(/@material\/web\b/g)) {
    const line = ctx.line(m.index);
    if (ctx.reportedLines.has(line)) continue;
    ctx.reportedLines.add(line);
    ctx.warn(m.index, "a reference to @material/web the codemod doesn't rewrite (a dynamic import, re-export, script src or package name); update it by hand");
  }
  for (const m of ctx.src.matchAll(/(?<![\w-])md-[a-z][a-z0-9]*(?:-[a-z0-9]+)*/g)) {
    if (ctx.handled.has(m.index) || ctx.reportedLines.has(ctx.line(m.index))) continue;
    const mapping = BY_TAG.get(m[0]);
    if (!mapping) continue;
    ctx.warn(m.index, `"${m[0]}" outside markup (a selector, a string or a comment): ${mapping.to ? `the element is now ${mapping.to}${mapping.set && Object.keys(mapping.set).length ? ` with ${Object.entries(mapping.set).map(([k, v]) => (v === true ? k : `${k}="${v}"`)).join(" ")}` : ""}` : "it has no lit-material equivalent"}`);
  }
}
