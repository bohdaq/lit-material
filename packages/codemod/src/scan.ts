// Finding elements in source text, with exact offsets so the codemod can edit the text in place and leave
// everything else (formatting, comments, expressions) byte for byte as it was.
//
// HTML files are parsed with parse5 (a spec-compliant HTML parser). Lit templates and JSX live inside
// JavaScript, which parse5 can't read, so for those a small scanner looks for start tags whose name has a
// hyphen (custom elements) and reads their attributes, skipping `${…}` and `{…}` expressions with brace,
// string, template-literal and comment awareness. Plain tags (div, span, svg, TypeScript generics such as
// Array<string>) are only recorded when they carry a `slot` attribute, so `a < b` or `Map<K, V>` can't be
// mistaken for markup.
import { parse, parseFragment } from "parse5";

export type Syntax = "html" | "lit" | "jsx";

export interface Attr {
  /** The name as written: `label`, `.value`, `?disabled`, `@change`, `[value]`, `(change)`, `:value`. */
  raw: string;
  start: number;
  end: number;
  nameEnd: number;
  /** The value without quotes, or null for a bare attribute. */
  value: string | null;
  valueStart: number;
  valueEnd: number;
}

export interface Tag {
  name: string;
  /** Offset of `<`. */
  start: number;
  nameStart: number;
  nameEnd: number;
  attrs: Attr[];
  /** Offset of the `>` (or `/>`) that ends the start tag, and the offset just after it. */
  closeStart: number;
  startEnd: number;
  selfClosing: boolean;
  /** The end tag's name, when there is one. */
  endNameStart?: number;
  endNameEnd?: number;
  /** Offset of the end tag's `<`, which is where the content ends. */
  endStart?: number;
  parent: Tag | null;
  /** Inline <script type="module"> content in an HTML file, scanned as JavaScript. */
  script?: { start: number; end: number };
}

const NAME = /[a-zA-Z][\w.-]*/y;
const WS = /\s/;

/** From `{` at `open`, the offset just after its matching `}`. */
export function skipBraces(src: string, open: number): number {
  let depth = 0;
  let i = open;
  while (i < src.length) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i + 1;
    } else if (c === '"' || c === "'") i = skipString(src, i);
    else if (c === "`") i = skipTemplate(src, i);
    else if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl;
    } else if (c === "/" && src[i + 1] === "*") {
      const endComment = src.indexOf("*/", i + 2);
      i = endComment === -1 ? src.length : endComment + 1;
    }
    i++;
  }
  return src.length;
}

/** From a quote at `i`, the offset of the closing quote. */
function skipString(src: string, i: number): number {
  const q = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") j++;
    else if (src[j] === q || src[j] === "\n") return j;
  }
  return src.length;
}

/** From a backtick at `i`, the offset of the closing backtick. */
function skipTemplate(src: string, i: number): number {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") j++;
    else if (src[j] === "`") return j;
    else if (src[j] === "$" && src[j + 1] === "{") j = skipBraces(src, j + 1) - 1;
  }
  return src.length;
}

/**
 * Reads a start tag at `lt` (the `<`). Returns null when it isn't one (no name, or no `>` before the next
 * `<`), which is how TypeScript generics and comparisons fall out.
 */
export function scanStartTag(src: string, lt: number, syntax: Syntax): Omit<Tag, "parent"> | null {
  NAME.lastIndex = lt + 1;
  const m = NAME.exec(src);
  if (!m) return null;
  const name = m[0];
  const nameStart = lt + 1;
  const nameEnd = nameStart + name.length;
  const after = src[nameEnd];
  if (after !== undefined && !WS.test(after) && after !== ">" && after !== "/") return null;
  const attrs: Attr[] = [];
  let i = nameEnd;
  while (i < src.length) {
    while (i < src.length && WS.test(src[i]!)) i++;
    const c = src[i];
    if (c === undefined || c === "<") return null;
    if (c === ">") return { name, start: lt, nameStart, nameEnd, attrs, closeStart: i, startEnd: i + 1, selfClosing: false };
    if (c === "/" && src[i + 1] === ">") return { name, start: lt, nameStart, nameEnd, attrs, closeStart: i, startEnd: i + 2, selfClosing: true };
    if (syntax === "lit" && c === "$" && src[i + 1] === "{") {
      i = skipBraces(src, i + 1);
      continue;
    }
    if (syntax === "jsx" && c === "{") {
      i = skipBraces(src, i);
      continue;
    }
    const start = i;
    while (i < src.length && !WS.test(src[i]!) && src[i] !== "=" && src[i] !== ">" && src[i] !== "<" && !(src[i] === "/" && src[i + 1] === ">")) i++;
    if (i === start) {
      i++;
      continue;
    }
    const nameEndAttr = i;
    let j = i;
    while (j < src.length && WS.test(src[j]!)) j++;
    if (src[j] !== "=") {
      attrs.push({ raw: src.slice(start, nameEndAttr), start, end: nameEndAttr, nameEnd: nameEndAttr, value: null, valueStart: nameEndAttr, valueEnd: nameEndAttr });
      continue;
    }
    j++;
    while (j < src.length && WS.test(src[j]!)) j++;
    const q = src[j];
    let valueStart: number;
    let valueEnd: number;
    let end: number;
    if (q === '"' || q === "'") {
      valueStart = j + 1;
      let k = valueStart;
      while (k < src.length && src[k] !== q) {
        if (syntax === "lit" && src[k] === "$" && src[k + 1] === "{") k = skipBraces(src, k + 1);
        else k++;
      }
      valueEnd = k;
      end = k + 1;
    } else if (syntax === "jsx" && q === "{") {
      valueStart = j;
      valueEnd = skipBraces(src, j);
      end = valueEnd;
    } else {
      valueStart = j;
      let k = j;
      while (k < src.length && !WS.test(src[k]!) && src[k] !== ">" && !(src[k] === "/" && src[k + 1] === ">")) {
        if (syntax === "lit" && src[k] === "$" && src[k + 1] === "{") k = skipBraces(src, k + 1);
        else k++;
      }
      valueEnd = k;
      end = k;
    }
    attrs.push({ raw: src.slice(start, nameEndAttr), start, end, nameEnd: nameEndAttr, value: src.slice(valueStart, valueEnd), valueStart, valueEnd });
    i = end;
  }
  return null;
}

/** Elements in JavaScript or TypeScript source (Lit templates, JSX, HTML strings). */
export function scanScript(src: string, syntax: "lit" | "jsx", offset = 0): Tag[] {
  const tags: Tag[] = [];
  const stack: Tag[] = [];
  let i = 0;
  while ((i = src.indexOf("<", i)) !== -1) {
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      i = end === -1 ? src.length : end + 3;
      continue;
    }
    if (src[i + 1] === "/") {
      const close = /<\/([a-zA-Z][\w.-]*)\s*>/y;
      close.lastIndex = i;
      const m = close.exec(src);
      if (m && m[1]!.includes("-")) {
        const at = stack.map((t) => t.name).lastIndexOf(m[1]!);
        if (at !== -1) {
          const tag = stack[at]!;
          stack.length = at;
          tag.endStart = i + offset;
          tag.endNameStart = i + 2 + offset;
          tag.endNameEnd = i + 2 + m[1]!.length + offset;
        }
        i = close.lastIndex;
        continue;
      }
      i++;
      continue;
    }
    const scanned = scanStartTag(src, i, syntax);
    if (!scanned) {
      i++;
      continue;
    }
    const custom = scanned.name.includes("-");
    if (custom || scanned.attrs.some((a) => a.raw === "slot")) {
      const tag = shift({ ...scanned, parent: stack.at(-1) ?? null }, offset);
      tags.push(tag);
      if (custom && !tag.selfClosing) stack.push(tag);
      i = scanned.startEnd;
    } else i++;
  }
  return tags;
}

function shift(tag: Tag, offset: number): Tag {
  if (!offset) return tag;
  tag.start += offset;
  tag.nameStart += offset;
  tag.nameEnd += offset;
  tag.closeStart += offset;
  tag.startEnd += offset;
  for (const a of tag.attrs) {
    a.start += offset;
    a.end += offset;
    a.nameEnd += offset;
    a.valueStart += offset;
    a.valueEnd += offset;
  }
  return tag;
}

interface P5Location {
  startOffset: number;
  endOffset: number;
}
interface P5Node {
  nodeName: string;
  tagName?: string;
  childNodes?: P5Node[];
  content?: P5Node;
  attrs?: { name: string; value: string }[];
  sourceCodeLocation?: P5Location & { startTag?: P5Location; endTag?: P5Location };
}

/** Elements in an HTML file, from parse5's tree; inline module scripts come back with their content range. */
export function scanHtml(src: string): Tag[] {
  const fullDocument = /^\s*(<!--[\s\S]*?-->\s*)*(<!doctype|<html)/i.test(src);
  const root = (fullDocument ? parse(src, { sourceCodeLocationInfo: true }) : parseFragment(src, { sourceCodeLocationInfo: true })) as unknown as P5Node;
  const tags: Tag[] = [];
  const visit = (node: P5Node, parent: Tag | null) => {
    let self = parent;
    const loc = node.sourceCodeLocation;
    if (node.tagName && loc?.startTag) {
      const scanned = scanStartTag(src, loc.startTag.startOffset, "html");
      if (scanned) {
        const tag: Tag = { ...scanned, parent };
        if (loc.endTag) {
          tag.endStart = loc.endTag.startOffset;
          tag.endNameStart = loc.endTag.startOffset + 2;
          tag.endNameEnd = tag.endNameStart + node.tagName.length;
        }
        if (node.tagName === "script") {
          const type = node.attrs?.find((a) => a.name === "type")?.value;
          const text = node.childNodes?.[0]?.sourceCodeLocation;
          if ((type === "module" || !type) && text) tag.script = { start: text.startOffset, end: text.endOffset };
        }
        tags.push(tag);
        self = tag;
      }
    }
    for (const child of node.childNodes ?? []) visit(child, self);
    if (node.content) for (const child of node.content.childNodes ?? []) visit(child, self);
  };
  visit(root, null);
  return tags;
}
