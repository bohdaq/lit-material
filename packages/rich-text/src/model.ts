/**
 * The editor's document model and everything that converts to and from it. Isomorphic: nothing here
 * touches a live document except `fromDom` (reads nodes) and `treeToDom` (creates nodes with
 * `createElement`/`createTextNode`), so the same parser and serializer run on the server.
 *
 * The model is a flat list of text blocks, each holding a list of inline segments:
 *
 * - block types `p`, `h2`, `h3`, `blockquote` (a quoted paragraph), `pre` (a code block: plain text,
 *   newlines kept) and `li` (a list item, with `list` = `ul`/`ol` and an `indent` level);
 * - segments carry text plus marks (`strong`, `em`, `u`, `s`, `code`) and an optional link `href`;
 *   `"\n"` in a non-code block is a line break (`<br>`).
 *
 * Nested lists and blockquotes are rebuilt from that flat list when the model is rendered, so the
 * output is always within the schema: p, h2, h3, strong, em, u, s, code, pre, blockquote, ul, ol, li,
 * a[href], br.
 */

export type Mark = "strong" | "em" | "u" | "s" | "code";
/** Marks in the order they nest in the output (outermost first, after the link). */
export const MARKS: readonly Mark[] = ["strong", "em", "u", "s", "code"];
export type BlockType = "p" | "h2" | "h3" | "blockquote" | "pre" | "li";
export type ListKind = "ul" | "ol";

export interface Segment {
  text: string;
  marks: Mark[];
  href?: string;
}

export interface Block {
  type: BlockType;
  /** List kind, for `li` blocks. */
  list?: ListKind;
  /** Nesting level of an `li` block, from 0. */
  indent?: number;
  segs: Segment[];
}

export type Doc = Block[];

/** A position: block index and character offset in that block's text. */
export interface Pos {
  b: number;
  o: number;
}

export interface Sel {
  anchor: Pos;
  focus: Pos;
}

// ---------------------------------------------------------------------------------------------------
// URLs

const SAFE_SCHEMES = new Set(["http", "https", "mailto"]);

/**
 * The link target if it's allowed — `http:`, `https:`, `mailto:` or a relative URL — else `null`.
 * Control characters and whitespace are ignored when reading the scheme, so `java\tscript:` and
 * ` javascript:` are caught too.
 */
export function safeHref(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const url = raw.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!url) return null;
  const compact = url.replace(/[\u0000-\u0020\u007f-\u009f]/g, "");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
  if (scheme) return SAFE_SCHEMES.has(scheme[1]!.toLowerCase()) ? url : null;
  return url;
}

// ---------------------------------------------------------------------------------------------------
// HTML tokenizer: string → raw tree, without the browser's HTML parser (so no Trusted Types sink).

export type RawNode =
  | { t: "text"; v: string }
  | { t: "el"; tag: string; attrs: Record<string, string>; kids: RawNode[] }
  | { t: "point"; id: number };

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RAW_TEXT = new Set(["script", "style", "textarea", "title", "xmp", "iframe", "noembed", "noframes", "noscript", "template"]);
const CLOSES_P = new Set([
  "address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figcaption", "figure", "footer",
  "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "main", "nav", "ol", "p", "pre", "section",
  "table", "ul", "li",
]);

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", copy: "©", reg: "®", trade: "™",
  hellip: "…", mdash: "—", ndash: "–", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", bull: "•",
  middot: "·", laquo: "«", raquo: "»", euro: "€", times: "×", divide: "÷", deg: "°", shy: "\u00ad",
  zwj: "\u200d", zwnj: "\u200c", ensp: "\u2002", emsp: "\u2003", thinsp: "\u2009", tab: "\t", newline: "\n",
};

function decodeEntities(text: string): string {
  if (!text.includes("&")) return text;
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);?/gi, (match, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!code || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return "\ufffd";
      return String.fromCodePoint(code);
    }
    const named = ENTITIES[body.toLowerCase()];
    return named ?? match;
  });
}

/** Parses an HTML string into a raw tree. Tolerant like a browser for the cases pasted HTML hits. */
export function parseHtml(source: string): RawNode[] {
  const root: RawNode[] = [];
  const stack: Array<{ tag: string; kids: RawNode[] }> = [];
  const kids = (): RawNode[] => stack[stack.length - 1]?.kids ?? root;
  const text = (v: string): void => {
    if (!v) return;
    const list = kids();
    const last = list[list.length - 1];
    if (last?.t === "text") last.v += v;
    else list.push({ t: "text", v });
  };
  const popTo = (index: number): void => {
    stack.length = index;
  };
  const len = source.length;
  let i = 0;
  while (i < len) {
    const lt = source.indexOf("<", i);
    if (lt === -1) {
      text(decodeEntities(source.slice(i)));
      break;
    }
    if (lt > i) text(decodeEntities(source.slice(i, lt)));
    i = lt;
    if (source.startsWith("<!--", i)) {
      const end = source.indexOf("-->", i + 4);
      i = end === -1 ? len : end + 3;
      continue;
    }
    if (source[i + 1] === "!" || source[i + 1] === "?") {
      const end = source.indexOf(">", i);
      i = end === -1 ? len : end + 1;
      continue;
    }
    if (source[i + 1] === "/") {
      const m = /^<\/([a-zA-Z][^\s/>]*)[^>]*>?/.exec(source.slice(i));
      if (!m) {
        text("</");
        i += 2;
        continue;
      }
      const tag = m[1]!.toLowerCase();
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s]!.tag === tag) {
          popTo(s);
          break;
        }
      }
      i += m[0].length;
      continue;
    }
    const nameMatch = /^<([a-zA-Z][^\s/>]*)/.exec(source.slice(i, i + 64));
    if (!nameMatch) {
      text("<");
      i += 1;
      continue;
    }
    const tag = nameMatch[1]!.toLowerCase();
    i += nameMatch[0].length;
    const attrs: Record<string, string> = {};
    let selfClosing = false;
    while (i < len) {
      while (i < len && /\s/.test(source[i]!)) i++;
      if (source[i] === ">") {
        i++;
        break;
      }
      if (source.startsWith("/>", i)) {
        selfClosing = true;
        i += 2;
        break;
      }
      if (source[i] === "/") {
        i++;
        continue;
      }
      const attr = /^[^\s=/>]+/.exec(source.slice(i, i + 256));
      if (!attr) {
        i++;
        continue;
      }
      const name = attr[0].toLowerCase();
      i += attr[0].length;
      while (i < len && /\s/.test(source[i]!)) i++;
      let value = "";
      if (source[i] === "=") {
        i++;
        while (i < len && /\s/.test(source[i]!)) i++;
        const quote = source[i];
        if (quote === '"' || quote === "'") {
          const end = source.indexOf(quote, i + 1);
          value = source.slice(i + 1, end === -1 ? len : end);
          i = end === -1 ? len : end + 1;
        } else {
          const m = /^[^\s>]*/.exec(source.slice(i))!;
          value = m[0];
          i += m[0].length;
        }
      }
      if (!(name in attrs)) attrs[name] = decodeEntities(value);
    }
    // Implicit end tags: a block closes an open <p>; an <li> closes the previous item of its list.
    if (CLOSES_P.has(tag)) {
      const top = stack[stack.length - 1];
      if (top?.tag === "p") popTo(stack.length - 1);
    }
    if (tag === "li") {
      for (let s = stack.length - 1; s >= 0; s--) {
        const t = stack[s]!.tag;
        if (t === "ul" || t === "ol") break;
        if (t === "li") {
          popTo(s);
          break;
        }
      }
    }
    const node: RawNode = { t: "el", tag, attrs, kids: [] };
    kids().push(node);
    if (VOID.has(tag) || selfClosing) continue;
    if (RAW_TEXT.has(tag)) {
      const close = new RegExp(`</${tag}[\\s>/]`, "i").exec(source.slice(i));
      const end = close ? i + close.index : len;
      node.kids.push({ t: "text", v: source.slice(i, end) });
      const gt = source.indexOf(">", end);
      i = close ? (gt === -1 ? len : gt + 1) : len;
      continue;
    }
    stack.push({ tag, kids: node.kids });
  }
  return root;
}

/** A live DOM point to locate in the model: `node` and `offset` as in a `Range`. */
export interface DomPoint {
  node: Node;
  offset: number;
}

/**
 * Reads the children of a live node into a raw tree, with `point` markers where the given DOM points
 * are (marker `id` = index in `points`). Comments and other non-element nodes are skipped.
 */
export function fromDom(container: Node, points: readonly DomPoint[] = []): RawNode[] {
  const out: RawNode[] = [];
  const marks = (node: Node, offset: number, into: RawNode[]): void => {
    points.forEach((p, id) => {
      if (p.node === node && p.offset === offset) into.push({ t: "point", id });
    });
  };
  const children = (node: Node, into: RawNode[]): void => {
    const list = node.childNodes;
    for (let i = 0; i < list.length; i++) {
      marks(node, i, into);
      const child = list[i]!;
      if (child.nodeType === 3) {
        const value = (child as Text).data;
        const inside = points.map((p, id) => ({ ...p, id })).filter((p) => p.node === child).sort((a, b) => a.offset - b.offset);
        let last = 0;
        for (const p of inside) {
          const at = Math.min(p.offset, value.length);
          if (at > last) into.push({ t: "text", v: value.slice(last, at) });
          into.push({ t: "point", id: p.id });
          last = at;
        }
        if (value.length > last) into.push({ t: "text", v: value.slice(last) });
      } else if (child.nodeType === 1) {
        const el = child as Element;
        const attrs: Record<string, string> = {};
        for (const a of Array.from(el.attributes)) attrs[a.name.toLowerCase()] = a.value;
        const node: RawNode = { t: "el", tag: el.localName.toLowerCase(), attrs, kids: [] };
        into.push(node);
        children(el, node.kids);
      }
    }
    marks(node, list.length, into);
  };
  children(container, out);
  return out;
}

// ---------------------------------------------------------------------------------------------------
// Raw tree → model (this is the sanitizer: anything outside the schema is dropped or unwrapped).

const DROP = new Set([
  "script", "style", "template", "iframe", "object", "embed", "noscript", "svg", "math", "head", "title", "textarea",
  "select", "option", "optgroup", "datalist", "input", "img", "picture", "video", "audio", "canvas", "meta", "link",
  "base", "frame", "frameset", "applet", "map", "area", "source", "track", "param", "noembed", "noframes", "xmp",
  "button", "dialog", "slot", "portal",
]);
const BLOCKS = new Set([
  "p", "div", "section", "article", "header", "footer", "main", "aside", "nav", "figure", "figcaption", "address",
  "details", "summary", "dd", "dt", "dl", "center", "table", "tbody", "thead", "tfoot", "tr", "td", "th", "caption",
  "fieldset", "legend", "form", "hgroup", "body", "html", "search", "menu",
]);
const MARK_OF: Record<string, Mark> = {
  strong: "strong", b: "strong", em: "em", i: "em", u: "u", ins: "u", s: "s", strike: "s", del: "s",
  code: "code", kbd: "code", samp: "code", tt: "code",
};

interface Ctx {
  marks: Mark[];
  href?: string;
  blockType: BlockType;
  pre: boolean;
  /** Inside an `<li>`: block boundaries become line breaks. */
  li: boolean;
  /** Inside an element that holds text (not at the top level or straight inside a list). */
  inBlock: boolean;
  list?: ListKind;
  indent: number;
}

interface OpenBlock extends Block {
  trailingBr?: boolean;
}

export interface ParseOptions {
  /** Keep whitespace as is (the live editor, which is `white-space: pre-wrap`), instead of HTML collapsing. */
  preserveWhitespace?: boolean;
}

export interface ParseResult {
  doc: Doc;
  points: Array<Pos | undefined>;
}

function styleMarks(style: string | undefined, marks: Mark[]): Mark[] {
  if (!style) return marks;
  const out = new Set(marks);
  const decl = (name: string): string | undefined => new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`, "i").exec(style)?.[1]?.trim().toLowerCase();
  const weight = decl("font-weight");
  if (weight) {
    if (weight === "bold" || weight === "bolder" || (/^\d+$/.test(weight) && Number(weight) >= 600)) out.add("strong");
    else if (weight === "normal" || weight === "lighter" || (/^\d+$/.test(weight) && Number(weight) < 600)) out.delete("strong");
  }
  const fontStyle = decl("font-style");
  if (fontStyle === "italic" || fontStyle === "oblique") out.add("em");
  else if (fontStyle === "normal") out.delete("em");
  const decoration = `${decl("text-decoration") ?? ""} ${decl("text-decoration-line") ?? ""}`;
  if (decoration.includes("underline")) out.add("u");
  if (decoration.includes("line-through")) out.add("s");
  return MARKS.filter((m) => out.has(m));
}

const blockLength = (b: Block): number => b.segs.reduce((n, s) => n + s.text.length, 0);

/** Converts a raw tree to a normalized document (and locates any `point` markers in it). */
export function rawToDoc(nodes: RawNode[], options: ParseOptions = {}, pointCount = 0): ParseResult {
  const preserve = options.preserveWhitespace === true;
  const doc: OpenBlock[] = [];
  const points: Array<Pos | undefined> = new Array(pointCount).fill(undefined);
  let pending: number[] = [];
  let cur: OpenBlock | null = null;

  const ensure = (ctx: Ctx): OpenBlock => {
    if (!cur) {
      cur = ctx.pre
        ? { type: "pre", segs: [] }
        : ctx.list
          ? { type: "li", list: ctx.list, indent: ctx.indent, segs: [] }
          : { type: ctx.blockType, segs: [] };
      doc.push(cur);
      for (const id of pending) points[id] = { b: doc.length - 1, o: 0 };
      pending = [];
    }
    return cur;
  };
  const close = (): void => {
    if (cur?.trailingBr) {
      // A trailing <br> is the browser's placeholder for an empty last line: it adds nothing.
      const last = cur.segs[cur.segs.length - 1];
      if (last && last.text.endsWith("\n")) last.text = last.text.slice(0, -1);
    }
    cur = null;
  };
  const append = (text: string, ctx: Ctx, br = false): void => {
    const block = ensure(ctx);
    const plain = block.type === "pre";
    block.segs.push(plain ? { text, marks: [] } : { text, marks: ctx.marks, ...(ctx.href ? { href: ctx.href } : {}) });
    block.trailingBr = br;
  };
  /** A block boundary inside an `<li>` or `<pre>`: a line break, unless at the start. */
  const separator = (): void => {
    const block = cur as OpenBlock | null;
    if (block && blockLength(block) > 0) {
      const text = block.segs.map((s) => s.text).join("");
      if (!text.endsWith("\n") || block.trailingBr) {
        block.segs.push({ text: "\n", marks: [] });
        block.trailingBr = false;
      }
    }
  };

  const walk = (list: RawNode[], ctx: Ctx): void => {
    for (const node of list) {
      if (node.t === "point") {
        if (cur) points[node.id] = { b: doc.length - 1, o: blockLength(cur) };
        else pending.push(node.id);
      } else if (node.t === "text") {
        let v = node.v.replace(/\r\n?/g, "\n");
        if (!ctx.pre && !preserve) v = v.replace(/[\t\n\f ]+/g, " ");
        // Whitespace between blocks is formatting, not content (in the live editor only outside blocks).
        if (!cur && (ctx.pre ? v === "" : v.trim() === "" && (!preserve || !ctx.inBlock))) continue;
        if (ctx.list && !ctx.li && !ctx.pre) {
          // Text straight inside a <ul>: an item of its own.
          walk([{ t: "el", tag: "li", attrs: {}, kids: [node] }], ctx);
          continue;
        }
        append(v, ctx);
      } else {
        element(node, ctx);
      }
    }
  };

  const blockElement = (kids: RawNode[], ctx: Ctx): void => {
    if (ctx.pre || ctx.li) {
      separator();
      walk(kids, { ...ctx, inBlock: true });
      return;
    }
    close();
    const before = doc.length;
    walk(kids, { ...ctx, inBlock: true });
    if (doc.length === before) ensure(ctx);
    close();
  };

  const element = (node: Extract<RawNode, { t: "el" }>, ctx: Ctx): void => {
    const { tag, attrs, kids } = node;
    if (DROP.has(tag)) return;
    if (tag === "br") {
      if (ctx.list && !ctx.li && !ctx.pre) return;
      append("\n", ctx, true);
      return;
    }
    if (tag === "hr") {
      if (ctx.pre || ctx.li) separator();
      else close();
      return;
    }
    if (tag === "ul" || tag === "ol") {
      if (ctx.pre) return blockElement(kids, ctx);
      close();
      const indent = ctx.list === undefined ? 0 : ctx.indent + 1;
      walk(kids, { ...ctx, list: tag, indent, li: false, inBlock: false, blockType: "li" });
      close();
      return;
    }
    if (tag === "li") {
      if (ctx.pre) return blockElement(kids, ctx);
      const list = ctx.list ?? "ul";
      close();
      const before = doc.length;
      const itemCtx: Ctx = { ...ctx, list, li: true, inBlock: true, blockType: "li" };
      walk(kids, itemCtx);
      if (doc.length === before) ensure(itemCtx);
      close();
      return;
    }
    if (ctx.list && !ctx.li && !ctx.pre) {
      // Anything else straight inside a list is treated as an item's content.
      walk([{ t: "el", tag: "li", attrs: {}, kids: [node] }], ctx);
      return;
    }
    if (tag === "pre") {
      if (ctx.pre || ctx.li) return blockElement(kids, { ...ctx, pre: ctx.pre });
      const first = kids[0];
      const trimmed: RawNode[] = !preserve && first?.t === "text" && first.v.startsWith("\n") ? [{ t: "text", v: first.v.slice(1) }, ...kids.slice(1)] : kids;
      return blockElement(trimmed, { ...ctx, pre: true, marks: [], href: undefined });
    }
    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
      return blockElement(kids, { ...ctx, blockType: tag === "h1" || tag === "h2" ? "h2" : "h3" });
    }
    if (tag === "blockquote") return blockElement(kids, { ...ctx, blockType: "blockquote" });
    if (BLOCKS.has(tag)) return blockElement(kids, ctx);
    // Inline: marks, links, and everything unknown is unwrapped.
    if (ctx.pre) return walk(kids, ctx);
    let marks = ctx.marks;
    let href = ctx.href;
    const mark = MARK_OF[tag];
    const googleDocsWrapper = tag === "b" && (attrs.id ?? "").startsWith("docs-internal-guid");
    if (mark && !googleDocsWrapper && !marks.includes(mark)) marks = MARKS.filter((m) => m === mark || marks.includes(m));
    if (tag === "span" || tag === "font" || tag === "b" || tag === "p") marks = styleMarks(attrs.style, marks);
    if (tag === "a") href = safeHref(attrs.href) ?? undefined;
    walk(kids, { ...ctx, marks, href });
  };

  walk(nodes, { marks: [], blockType: "p", pre: false, li: false, inBlock: false, indent: 0 });
  close();
  if (pending.length) {
    if (!doc.length) doc.push({ type: "p", segs: [] });
    const b = doc.length - 1;
    for (const id of pending) points[id] = { b, o: blockLength(doc[b]!) };
  }
  const result: Doc = doc.map((b) => {
    const block: Block = { type: b.type, segs: b.segs };
    if (b.type === "li") {
      block.list = b.list;
      block.indent = b.indent;
    }
    return block;
  });
  if (!preserve) for (const block of result) if (block.type !== "pre") collapseWhitespace(block);
  normalize(result);
  for (const p of points) if (p) p.o = Math.min(p.o, blockLength(result[p.b] ?? { type: "p", segs: [] }));
  return { doc: result, points };
}

/** HTML whitespace collapsing across a block's segments: runs → one space, trimmed at line edges. */
function collapseWhitespace(block: Block): void {
  let prevSpace = true; // at the start of a line
  const out: Segment[] = [];
  for (const seg of block.segs) {
    let text = "";
    for (const ch of seg.text) {
      if (ch === " ") {
        if (prevSpace) continue;
        prevSpace = true;
        text += ch;
      } else if (ch === "\n") {
        // drop a space just before the break
        if (text.endsWith(" ")) text = text.slice(0, -1);
        else if (!text && out.length) {
          const last = out[out.length - 1]!;
          if (last.text.endsWith(" ")) last.text = last.text.slice(0, -1);
        }
        text += ch;
        prevSpace = true;
      } else {
        prevSpace = false;
        text += ch;
      }
    }
    out.push({ ...seg, text });
  }
  // trailing space at the end of the block
  for (let i = out.length - 1; i >= 0; i--) {
    const seg = out[i]!;
    if (!seg.text) continue;
    if (seg.text.endsWith(" ")) seg.text = seg.text.slice(0, -1);
    break;
  }
  block.segs = out;
}

const sameStyle = (a: Segment, b: Segment): boolean => a.href === b.href && a.marks.length === b.marks.length && a.marks.every((m, i) => b.marks[i] === m);

/** In place: merges segments, drops empty ones, clamps list indents, keeps at least one block. */
export function normalize(doc: Doc): Doc {
  let prev: Block | undefined;
  for (const block of doc) {
    const segs: Segment[] = [];
    for (const seg of block.segs) {
      if (!seg.text) continue;
      const clean: Segment = block.type === "pre" ? { text: seg.text, marks: [] } : { text: seg.text, marks: MARKS.filter((m) => seg.marks.includes(m)), ...(seg.href ? { href: seg.href } : {}) };
      const last = segs[segs.length - 1];
      if (last && sameStyle(last, clean)) last.text += clean.text;
      else segs.push(clean);
    }
    block.segs = segs;
    if (block.type === "li") {
      block.list ??= "ul";
      const max = prev?.type === "li" ? (prev.indent ?? 0) + 1 : 0;
      block.indent = Math.max(0, Math.min(block.indent ?? 0, max));
    } else {
      delete block.list;
      delete block.indent;
    }
    prev = block;
  }
  if (!doc.length) doc.push({ type: "p", segs: [] });
  return doc;
}

/** Parses and sanitizes an HTML string into a document. */
export function htmlToDoc(source: string): Doc {
  return rawToDoc(parseHtml(source)).doc;
}

/** Plain text into paragraphs (one per line), or into one code block. */
export function textToDoc(text: string, pre = false): Doc {
  const clean = text.replace(/\r\n?/g, "\n");
  if (pre) return normalize([{ type: "pre", segs: [{ text: clean, marks: [] }] }]);
  return normalize(clean.split("\n").map((line) => ({ type: "p" as const, segs: [{ text: line, marks: [] }] })));
}

// ---------------------------------------------------------------------------------------------------
// Model → render tree → HTML string / DOM nodes

export type TreeNode = string | { tag: string; href?: string; kids: TreeNode[] };

export interface TreeOptions {
  /** Add the `<br>` an empty (last) line needs to be visible and caret-able in an editable element. */
  placeholders?: boolean;
  /** Replace spaces that HTML would collapse with no-break spaces (for the `value` string). */
  protectSpaces?: boolean;
}

function protect(text: string): string {
  // Runs of spaces alternate with U+00A0; spaces at line edges become U+00A0 (1:1, lengths unchanged).
  let out = "";
  for (let i = 0; i < text.length; ) {
    if (text[i] !== " ") {
      out += text[i];
      i++;
      continue;
    }
    let j = i;
    while (text[j] === " ") j++;
    const atStart = i === 0 || text[i - 1] === "\n";
    const atEnd = j === text.length || text[j] === "\n";
    for (let k = i; k < j; k++) {
      const edge = (k === i && atStart) || (k === j - 1 && atEnd);
      out += edge || (k - i) % 2 === 1 ? "\u00a0" : " ";
    }
    i = j;
  }
  return out;
}

function inlineTree(block: Block, options: TreeOptions): TreeNode[] {
  const kids: TreeNode[] = [];
  const full = block.segs.map((s) => s.text).join("");
  if (block.type === "pre") {
    if (full) kids.push(full);
  } else {
    const text = options.protectSpaces ? protect(full) : full;
    let at = 0;
    const stack: Array<{ key: string; node: Extract<TreeNode, object> }> = [];
    for (const seg of block.segs) {
      const segText = text.slice(at, at + seg.text.length);
      at += seg.text.length;
      const wanted = [...(seg.href ? [`a:${seg.href}`] : []), ...seg.marks];
      let k = 0;
      while (k < stack.length && k < wanted.length && stack[k]!.key === wanted[k]) k++;
      stack.length = k;
      for (const key of wanted.slice(k)) {
        const node = key.startsWith("a:") ? { tag: "a", href: key.slice(2), kids: [] } : { tag: key, kids: [] };
        (stack[stack.length - 1]?.node.kids ?? kids).push(node);
        stack.push({ key, node });
      }
      const target = stack[stack.length - 1]?.node.kids ?? kids;
      segText.split("\n").forEach((piece, i) => {
        if (i > 0) target.push({ tag: "br", kids: [] });
        if (piece) target.push(piece);
      });
    }
  }
  if (options.placeholders && (full === "" || full.endsWith("\n"))) kids.push({ tag: "br", kids: [] });
  return kids;
}

/** The document as a tree of schema elements. */
export function docToTree(doc: Doc, options: TreeOptions = {}): TreeNode[] {
  const out: TreeNode[] = [];
  let quote: Extract<TreeNode, object> | null = null;
  const lists: Array<{ kind: ListKind; node: Extract<TreeNode, object> }> = [];
  for (const block of doc) {
    if (block.type !== "blockquote") quote = null;
    if (block.type !== "li") lists.length = 0;
    if (block.type === "blockquote") {
      if (!quote) {
        quote = { tag: "blockquote", kids: [] };
        out.push(quote);
      }
      quote.kids.push({ tag: "p", kids: inlineTree(block, options) });
    } else if (block.type === "li") {
      const depth = block.indent ?? 0;
      const kind = block.list ?? "ul";
      while (lists.length > depth + 1) lists.pop();
      if (lists.length === depth + 1 && lists[depth]!.kind !== kind) lists.pop();
      while (lists.length < depth + 1) {
        const node = { tag: kind, kids: [] as TreeNode[] };
        const parent = lists[lists.length - 1];
        if (parent) {
          let item = parent.node.kids[parent.node.kids.length - 1] as Extract<TreeNode, object> | undefined;
          if (!item) {
            item = { tag: "li", kids: [] };
            parent.node.kids.push(item);
          }
          item.kids.push(node);
        } else out.push(node);
        lists.push({ kind, node });
      }
      lists[depth]!.node.kids.push({ tag: "li", kids: inlineTree(block, options) });
    } else {
      out.push({ tag: block.type, kids: inlineTree(block, options) });
    }
  }
  return out;
}

const escapeText = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00a0/g, "&nbsp;");
const escapeAttr = (s: string): string => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function treeToHtml(nodes: TreeNode[]): string {
  return nodes
    .map((n) => {
      if (typeof n === "string") return escapeText(n);
      if (n.tag === "br") return "<br>";
      const attrs = n.href !== undefined ? ` href="${escapeAttr(n.href)}"` : "";
      return `<${n.tag}${attrs}>${treeToHtml(n.kids)}</${n.tag}>`;
    })
    .join("");
}

/** Whether the document is a single empty paragraph. */
export function isEmptyDoc(doc: Doc): boolean {
  return doc.length === 1 && doc[0]!.type === "p" && doc[0]!.segs.every((s) => !s.text);
}

/** The normalized HTML value: `""` for an empty document. */
export function docToHtml(doc: Doc): string {
  return isEmptyDoc(doc) ? "" : treeToHtml(docToTree(doc, { protectSpaces: true }));
}

/** Builds DOM nodes for a tree (with `createElement`, never an HTML string). */
export function treeToDom(nodes: TreeNode[], document: Document): Node[] {
  return nodes.map((n) => {
    if (typeof n === "string") return document.createTextNode(n);
    const el = document.createElement(n.tag);
    if (n.href !== undefined) el.setAttribute("href", n.href);
    el.append(...treeToDom(n.kids, document));
    return el;
  });
}

/** A canonical string for a raw tree (live DOM read with `fromDom`), comparable with `treeToHtml`. */
export function rawToCanonical(nodes: RawNode[]): string {
  let out = "";
  for (const n of nodes) {
    if (n.t === "text") out += escapeText(n.v);
    else if (n.t === "el") {
      const names = Object.keys(n.attrs).sort();
      const attrs = names.map((k) => ` ${k}="${escapeAttr(n.attrs[k]!)}"`).join("");
      out += n.tag === "br" ? `<br${attrs}>` : `<${n.tag}${attrs}>${rawToCanonical(n.kids)}</${n.tag}>`;
    }
  }
  // Adjacent text nodes serialize the same as one, as in treeToHtml.
  return out;
}

// ---------------------------------------------------------------------------------------------------
// Text and Markdown

export const blockText = (b: Block): string => b.segs.map((s) => s.text).join("");
export { blockLength };

/** Plain text: blocks separated by newlines, no-break spaces as spaces. */
export function docToText(doc: Doc): string {
  return doc.map((b) => blockText(b).replace(/\u00a0/g, " ")).join("\n");
}

const mdEscape = (s: string): string => s.replace(/([\\`*_[\]<>~])/g, "\\$1");

/** CommonMark (plus `~~strike~~`); underline has no Markdown form and is written as `<u>…</u>`. */
export function docToMarkdown(doc: Doc): string {
  const lines: string[] = [];
  const counters: number[] = [];
  const kinds: Array<ListKind | undefined> = [];
  let prevType: BlockType | null = null;
  const inline = (b: Block): string =>
    b.segs
      .map((s) => {
        const parts = s.text.split("\n");
        let t = parts
          .map((p) => (s.marks.includes("code") ? p : mdEscape(p.replace(/\u00a0/g, " "))))
          .join(s.marks.includes("code") ? " " : "  \n");
        if (!t) return "";
        if (s.marks.includes("code")) t = t.includes("`") ? `\`\` ${t} \`\`` : `\`${t}\``;
        if (s.marks.includes("s")) t = `~~${t}~~`;
        if (s.marks.includes("u")) t = `<u>${t}</u>`;
        if (s.marks.includes("em")) t = `*${t}*`;
        if (s.marks.includes("strong")) t = `**${t}**`;
        if (s.href) t = `[${t}](${s.href.replace(/[()\s]/g, (c) => encodeURIComponent(c))})`;
        return t;
      })
      .join("");
  for (const b of doc) {
    const blank = prevType !== null && !(prevType === "li" && b.type === "li") && !(prevType === "blockquote" && b.type === "blockquote");
    if (blank) lines.push("");
    if (b.type !== "li") counters.length = kinds.length = 0;
    switch (b.type) {
      case "h2":
        lines.push(`## ${inline(b)}`);
        break;
      case "h3":
        lines.push(`### ${inline(b)}`);
        break;
      case "blockquote":
        if (prevType === "blockquote") lines.push(">");
        lines.push(...inline(b).split("\n").map((l) => `> ${l}`));
        break;
      case "pre": {
        const text = blockText(b);
        const fence = text.includes("```") ? "~~~~" : "```";
        lines.push(fence, ...text.split("\n"), fence);
        break;
      }
      case "li": {
        const depth = b.indent ?? 0;
        counters.length = depth + 1;
        kinds.length = depth + 1;
        if (kinds[depth] !== b.list) counters[depth] = 0;
        kinds[depth] = b.list;
        counters[depth] = (counters[depth] ?? 0) + 1;
        const marker = b.list === "ol" ? `${counters[depth]}.` : "-";
        const pad = "   ".repeat(depth);
        const [first = "", ...rest] = inline(b).split("\n");
        lines.push(`${pad}${marker} ${first}`, ...rest.map((l) => `${pad}   ${l}`));
        break;
      }
      default:
        lines.push(inline(b).replace(/^(#{1,6} |[-+*] |\d+[.)] |>)/, "\\$1"));
    }
    prevType = b.type;
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------------------------------
// Editing operations (mutate the document in place; positions are returned)

export const cloneDoc = (doc: Doc): Doc => doc.map((b) => ({ ...b, segs: b.segs.map((s) => ({ ...s, marks: [...s.marks] })) }));
export const comparePos = (a: Pos, b: Pos): number => a.b - b.b || a.o - b.o;
export const ordered = (sel: Sel): [Pos, Pos] => (comparePos(sel.anchor, sel.focus) <= 0 ? [sel.anchor, sel.focus] : [sel.focus, sel.anchor]);
export const isCollapsed = (sel: Sel): boolean => comparePos(sel.anchor, sel.focus) === 0;
export const caret = (pos: Pos): Sel => ({ anchor: { ...pos }, focus: { ...pos } });

/** Splits segments so one starts at `offset`; returns that segment's index. */
function splitAt(block: Block, offset: number): number {
  let at = 0;
  for (let i = 0; i < block.segs.length; i++) {
    const seg = block.segs[i]!;
    if (offset === at) return i;
    if (offset < at + seg.text.length) {
      const cut = offset - at;
      block.segs.splice(i, 1, { ...seg, marks: [...seg.marks], text: seg.text.slice(0, cut) }, { ...seg, marks: [...seg.marks], text: seg.text.slice(cut) });
      return i + 1;
    }
    at += seg.text.length;
  }
  return block.segs.length;
}

/** The segments between two offsets of a block (copies). */
export function sliceSegs(block: Block, from: number, to: number): Segment[] {
  const out: Segment[] = [];
  let at = 0;
  for (const seg of block.segs) {
    const start = Math.max(from, at);
    const end = Math.min(to, at + seg.text.length);
    if (end > start) out.push({ ...seg, marks: [...seg.marks], text: seg.text.slice(start - at, end - at) });
    at += seg.text.length;
  }
  return out;
}

/** Calls `fn` for each segment (split to fit) inside the range, in non-code blocks. */
function eachSegIn(doc: Doc, from: Pos, to: Pos, fn: (seg: Segment) => void): void {
  for (let b = from.b; b <= to.b; b++) {
    const block = doc[b]!;
    if (block.type === "pre") continue;
    const start = b === from.b ? from.o : 0;
    const end = b === to.b ? to.o : blockLength(block);
    if (end <= start) continue;
    const startIndex = splitAt(block, start);
    const endIndex = splitAt(block, end);
    for (let i = startIndex; i < endIndex; i++) fn(block.segs[i]!);
  }
}

/** Marks and link at a collapsed position: those of the character before it (or after, at a block start). */
export function marksAt(doc: Doc, pos: Pos): { marks: Mark[]; href?: string } {
  const block = doc[pos.b];
  if (!block || block.type === "pre") return { marks: [] };
  let at = 0;
  let found: Segment | undefined;
  for (const seg of block.segs) {
    if (pos.o > at && pos.o <= at + seg.text.length) {
      found = seg;
      break;
    }
    at += seg.text.length;
  }
  found ??= pos.o === 0 ? block.segs[0] : undefined;
  return found ? { marks: [...found.marks], ...(found.href ? { href: found.href } : {}) } : { marks: [] };
}

/** Marks every character in the range has (code blocks and line breaks don't count). */
export function marksIn(doc: Doc, from: Pos, to: Pos): Set<Mark> {
  let result: Set<Mark> | null = null;
  const copy = cloneDoc(doc);
  eachSegIn(copy, from, to, (seg) => {
    if (seg.text.replace(/\n/g, "") === "") return;
    const here = new Set(seg.marks);
    result = result ? new Set([...result].filter((m) => here.has(m))) : here;
  });
  return result ?? new Set();
}

export function setMark(doc: Doc, from: Pos, to: Pos, mark: Mark, on: boolean): void {
  eachSegIn(doc, from, to, (seg) => {
    seg.marks = on ? MARKS.filter((m) => m === mark || seg.marks.includes(m)) : seg.marks.filter((m) => m !== mark);
  });
  normalize(doc);
}

export function setHref(doc: Doc, from: Pos, to: Pos, href: string | undefined): void {
  eachSegIn(doc, from, to, (seg) => {
    if (href) seg.href = href;
    else delete seg.href;
  });
  normalize(doc);
}

export function clearInline(doc: Doc, from: Pos, to: Pos): void {
  eachSegIn(doc, from, to, (seg) => {
    seg.marks = [];
    delete seg.href;
  });
  normalize(doc);
}

/** The extent of the link at (or around) a position, if there is one. */
export function linkAt(doc: Doc, from: Pos, to: Pos): { from: Pos; to: Pos; href: string } | null {
  const block = doc[from.b];
  if (!block) return null;
  // The character before a caret, or the first character of a range.
  const probe = comparePos(from, to) === 0 ? from.o : from.o + 1;
  let at = 0;
  const segs = block.segs;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i]!;
    const end = at + seg.text.length;
    if (probe > at && probe <= end && seg.href) {
      let start = at;
      let stop = end;
      for (let j = i - 1, a = at; j >= 0 && segs[j]!.href === seg.href; j--) start = a -= segs[j]!.text.length;
      for (let j = i + 1; j < segs.length && segs[j]!.href === seg.href; j++) stop += segs[j]!.text.length;
      return { from: { b: from.b, o: start }, to: { b: from.b, o: stop }, href: seg.href };
    }
    at = end;
  }
  return null;
}

/** Deletes the range; returns the collapsed position. Blocks in between are removed, the ends join. */
export function deleteRange(doc: Doc, from: Pos, to: Pos): Pos {
  if (comparePos(from, to) >= 0) return { ...from };
  const first = doc[from.b]!;
  const last = doc[to.b]!;
  const tail = sliceSegs(last, to.o, blockLength(last));
  first.segs = [...sliceSegs(first, 0, from.o), ...(first.type === "pre" ? tail.map((s) => ({ text: s.text, marks: [] })) : tail)];
  doc.splice(from.b + 1, to.b - from.b);
  normalize(doc);
  return { ...from };
}

/** Inserts segments at a position; returns the position after them. */
export function insertSegs(doc: Doc, pos: Pos, segs: Segment[]): Pos {
  const block = doc[pos.b]!;
  const index = splitAt(block, pos.o);
  const clean = block.type === "pre" ? segs.map((s) => ({ text: s.text, marks: [] as Mark[] })) : segs;
  block.segs.splice(index, 0, ...clean.map((s) => ({ ...s, marks: [...s.marks] })));
  const added = clean.reduce((n, s) => n + s.text.length, 0);
  normalize(doc);
  return { b: pos.b, o: pos.o + added };
}

/** Splits the block at a position; returns the start of the new block. */
export function splitBlock(doc: Doc, pos: Pos): Pos {
  const block = doc[pos.b]!;
  const len = blockLength(block);
  const tail = sliceSegs(block, pos.o, len);
  block.segs = sliceSegs(block, 0, pos.o);
  const next: Block = { type: block.type, segs: tail };
  if (block.type === "li") {
    next.list = block.list;
    next.indent = block.indent;
  }
  if ((block.type === "h2" || block.type === "h3") && tail.length === 0) next.type = "p";
  doc.splice(pos.b + 1, 0, next);
  normalize(doc);
  return { b: pos.b + 1, o: 0 };
}

/** Joins block `b` onto the end of the block before it; returns the join point. */
export function joinBackward(doc: Doc, b: number): Pos {
  const prev = doc[b - 1]!;
  const block = doc[b]!;
  const at = blockLength(prev);
  prev.segs = [...prev.segs, ...(prev.type === "pre" ? block.segs.map((s) => ({ text: s.text, marks: [] })) : block.type === "pre" ? block.segs.map((s) => ({ text: s.text, marks: [] })) : block.segs)];
  doc.splice(b, 1);
  normalize(doc);
  return { b: b - 1, o: at };
}

/** Converts blocks `[from, to]` to a type; code blocks merge into one and split back into lines. */
export function setBlockType(doc: Doc, fromB: number, toB: number, type: Exclude<BlockType, "li">): [number, number] {
  // Split code blocks in range into lines first.
  const blocks: Block[] = [];
  for (let b = fromB; b <= toB; b++) {
    const block = doc[b]!;
    if (block.type === "pre" && type !== "pre") {
      for (const line of blockText(block).split("\n")) blocks.push({ type, segs: [{ text: line, marks: [] }] });
    } else {
      blocks.push({ ...block, type });
    }
  }
  if (type === "pre") {
    const text = blocks.map((b) => blockText(b)).join("\n");
    doc.splice(fromB, toB - fromB + 1, { type: "pre", segs: [{ text, marks: [] }] });
    normalize(doc);
    return [fromB, fromB];
  }
  doc.splice(fromB, toB - fromB + 1, ...blocks);
  normalize(doc);
  return [fromB, fromB + blocks.length - 1];
}

/** Turns blocks into list items of a kind (or back into paragraphs with `kind` = null). */
export function setList(doc: Doc, fromB: number, toB: number, kind: ListKind | null): [number, number] {
  const range = doc.slice(fromB, toB + 1);
  // Items keep their level when switching between bulleted and numbered (code blocks split into lines).
  const indents = range.some((b) => b.type === "pre") ? [] : range.map((b) => (b.type === "li" ? (b.indent ?? 0) : 0));
  const [a, z] = setBlockType(doc, fromB, toB, "p");
  for (let b = a; b <= z; b++) {
    const block = doc[b]!;
    if (kind) {
      block.type = "li";
      block.list = kind;
      block.indent = indents[b - a] ?? 0;
    }
  }
  normalize(doc);
  return [a, z];
}

/** Changes the indent of the list items in range; `-1` at level 0 turns an item into a paragraph. */
export function indentItems(doc: Doc, fromB: number, toB: number, delta: 1 | -1): boolean {
  let changed = false;
  for (let b = fromB; b <= toB; b++) {
    const block = doc[b]!;
    if (block.type !== "li") continue;
    const indent = block.indent ?? 0;
    if (delta > 0) {
      const prev = doc[b - 1];
      if (prev?.type === "li" && (prev.indent ?? 0) >= indent) {
        block.indent = indent + 1;
        changed = true;
      }
    } else if (indent > 0) {
      block.indent = indent - 1;
      changed = true;
    } else {
      block.type = "p";
      changed = true;
    }
  }
  normalize(doc);
  return changed;
}

/** Clamps a position into the document. */
export function clampPos(doc: Doc, pos: Pos): Pos {
  const b = Math.max(0, Math.min(pos.b, doc.length - 1));
  return { b, o: Math.max(0, Math.min(pos.o, blockLength(doc[b]!))) };
}

export const docEnd = (doc: Doc): Pos => ({ b: doc.length - 1, o: blockLength(doc[doc.length - 1]!) });
