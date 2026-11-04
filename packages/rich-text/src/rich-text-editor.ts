import { html, isServer, LitElement, noChange, nothing, svg, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isRtl, LocalizeController } from "@lit-material/core/localize.js";
import * as M from "./model.js";
import { styles } from "./rich-text-editor-styles.js";

/** Everything the toolbar and keyboard shortcuts do, also callable with `editor.command(name)`. */
export type RichTextCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "paragraph"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "quote"
  | "codeBlock"
  | "link"
  | "unlink"
  | "clearFormatting"
  | "indent"
  | "outdent"
  | "undo"
  | "redo";

export type RichTextVariant = "outlined" | "filled";

interface Snapshot {
  doc: M.Doc;
  sel: M.Sel;
}

interface ActiveState {
  marks: Set<M.Mark>;
  block: "p" | "h2" | "h3" | "";
  list: M.ListKind | null;
  quote: boolean;
  pre: boolean;
  link: boolean;
}

interface DomSelection {
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
}

const HISTORY_LIMIT = 100;
const TYPING_PAUSE = 1000;
const MARK_COMMAND: Partial<Record<RichTextCommand, M.Mark>> = { bold: "strong", italic: "em", underline: "u", strikethrough: "s", code: "code" };

const icon = (d: string, mirror = false): TemplateResult =>
  html`<svg class=${mirror ? "icon mirror" : "icon"} viewBox="0 0 24 24" aria-hidden="true" focusable="false">${svg`<path d=${d}></path>`}</svg>`;
const ICONS = {
  bold: "M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",
  italic: "M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z",
  underline: "M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z",
  strikethrough: "M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z",
  code: "M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  bulletList:
    "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  numberedList: "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",
  quote: "M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z",
  codeBlock:
    "M4 7v2c0 .55-.45 1-1 1H2v4h1c.55 0 1 .45 1 1v2c0 1.65 1.35 3 3 3h3v-2H7c-.55 0-1-.45-1-1v-2c0-1.3-.84-2.42-2-2.83v-.34C5.16 11.42 6 10.3 6 9V7c0-.55.45-1 1-1h3V4H7C5.35 4 4 5.35 4 7zm17 3c-.55 0-1-.45-1-1V7c0-1.65-1.35-3-3-3h-3v2h3c.55 0 1 .45 1 1v2c0 1.3.84 2.42 2 2.83v.34c-1.16.41-2 1.52-2 2.83v2c0 .55-.45 1-1 1h-3v2h3c1.65 0 3-1.35 3-3v-2c0-.55.45-1 1-1h1v-4h-1z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  clear: "M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z",
  undo: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z",
  redo: "M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z",
};

/** Renders the schema tree as Lit templates: the server-rendered (and first client-rendered) content. */
function treeTemplate(nodes: M.TreeNode[]): unknown[] {
  return nodes.map((n) => {
    if (typeof n === "string") return n;
    const k = treeTemplate(n.kids);
    switch (n.tag) {
      case "p":
        return html`<p>${k}</p>`;
      case "h2":
        return html`<h2>${k}</h2>`;
      case "h3":
        return html`<h3>${k}</h3>`;
      case "blockquote":
        return html`<blockquote>${k}</blockquote>`;
      case "pre":
        return html`<pre>${k}</pre>`;
      case "ul":
        return html`<ul>${k}</ul>`;
      case "ol":
        return html`<ol>${k}</ol>`;
      case "li":
        return html`<li>${k}</li>`;
      case "strong":
        return html`<strong>${k}</strong>`;
      case "em":
        return html`<em>${k}</em>`;
      case "u":
        return html`<u>${k}</u>`;
      case "s":
        return html`<s>${k}</s>`;
      case "code":
        return html`<code>${k}</code>`;
      case "a":
        return html`<a href=${n.href ?? ""}>${k}</a>`;
      case "br":
        return html`<br />`;
      default:
        return k;
    }
  });
}

/** What a person types into the link field, made into a URL: `example.com` → `https://example.com`. */
function userUrl(raw: string): string {
  const url = raw.trim();
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || /^[/?#.]/.test(url)) return url;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(url)) return `mailto:${url}`;
  if (/^[^\s/?#]+\.[a-z]{2,}([/?#:]|$)/i.test(url)) return `https://${url}`;
  return url;
}

let instanceCount = 0;

/**
 * Material Design 3 rich-text editor: a formatting toolbar over a `contenteditable` surface whose content
 * is held to a small schema — paragraphs, two heading levels, bulleted and numbered lists (nested),
 * quotes, code blocks, bold, italic, underline, strikethrough, inline code and links. Every edit goes
 * through the editor's own document model (not `document.execCommand`): commands, Enter, Backspace across
 * blocks, paste and undo/redo are model operations, and anything the browser changes natively (typing,
 * spellcheck) is read back and normalized. Pasted HTML and the `value` are parsed with a built-in
 * tokenizer and sanitized to the schema — no HTML string is ever assigned to the DOM, so the editor needs
 * no Trusted Types policy.
 *
 * Form-associated: the `value` (normalized HTML) is submitted under `name`.
 *
 * @element lit-material-rich-text-editor
 *
 * @csspart container - The outlined/filled box around toolbar and content.
 * @csspart toolbar - The formatting toolbar (`role="toolbar"`).
 * @csspart content - The editable surface (`role="textbox"`).
 * @csspart label - The label above the box.
 * @csspart supporting - The supporting-text / character-counter row.
 * @csspart link-panel - The link editing panel.
 *
 * @cssprop --lit-material-rich-text-min-height - Smallest height of the editable surface (default `8rem`).
 * @cssprop --lit-material-rich-text-max-height - Height after which the surface scrolls (default `none`).
 *
 * @fires input - Bubbles (composed) after every change to the content.
 * @fires change - Bubbles when focus leaves the editor after the content changed.
 */
@customElement("lit-material-rich-text-editor")
export class LitMaterialRichTextEditor extends LitElement {
  static override styles = styles;

  /** Form-associated custom element: participates in an ancestor `<form>` and its validation. */
  static formAssociated = true;

  @property({ reflect: true }) variant: RichTextVariant = "outlined";
  @property() label = "";
  @property() placeholder = "";
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ attribute: "error-text" }) errorText = "";
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean }) required = false;
  /** Shows a character counter and makes the field invalid (`tooLong`) past this many characters of text. */
  @property({ type: Number }) maxlength: number | undefined;
  @property() name = "";

  /**
   * The content as HTML. Whatever is set is sanitized to the schema; reading it back always gives the
   * normalized form (`""` when empty). Setting it resets the undo history.
   */
  @property()
  get value(): string {
    return this.html;
  }
  set value(next: string) {
    const doc = M.htmlToDoc(next == null ? "" : String(next));
    const html = M.docToHtml(doc);
    if (html === this.html && this.hasUpdated) return;
    this.doc = doc;
    this.html = html;
    this.pendingLoad = true;
    this.undoStack = [];
    this.redoStack = [];
    this.sel = null;
  }

  @state() private active: ActiveState = { marks: new Set(), block: "p", list: null, quote: false, pre: false, link: false };
  @state() private focusIndex = 0;
  @state() private announcement = "";
  @state() private linkOpen = false;
  @state() private linkValue = "";
  @state() private linkError = "";
  @state() private touched = false;
  @state() private formDisabled = false;
  /** Set once the content is the editor's (after the first update); not reactive on purpose. */
  private contentOwned = false;

  private html = "";
  private doc: M.Doc = M.normalize([]);
  private pendingLoad = false;
  private marker: ChildNode | null = null;
  private sel: M.Sel | null = null;
  private storedMarks: M.Mark[] | null = null;
  private storedAt: M.Pos | null = null;
  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  private typing: { kind: string; time: number } | null = null;
  private composing = false;
  private pointerFocus = false;
  private tabEscape = false;
  private valueAtFocus: string | null = null;
  private linkSel: M.Sel | null = null;
  private linkExisting = false;

  private readonly internals: ElementInternals;
  private readonly localize = new LocalizeController(this);
  private readonly ids = ++instanceCount;
  private readonly labelId = `lit-material-rich-text-label-${this.ids}`;
  private readonly supportingId = `lit-material-rich-text-supporting-${this.ids}`;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!isServer) document.addEventListener("selectionchange", this.onSelectionChange);
    this.syncInternals();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!isServer) document.removeEventListener("selectionchange", this.onSelectionChange);
  }

  // ---------------------------------------------------------------------------------------------------
  // Public API

  /** The content as plain text (blocks on their own lines). */
  getText(): string {
    return M.docToText(this.doc);
  }

  /** The content as Markdown (CommonMark plus `~~strikethrough~~`; underline as `<u>`). */
  getMarkdown(): string {
    return M.docToMarkdown(this.doc);
  }

  /**
   * Runs an editing command on the current selection (or the last one, when focus is elsewhere).
   * `link` takes the URL (an invalid scheme is refused); without one it opens the link panel.
   * Returns whether anything changed.
   */
  command(name: RichTextCommand, value?: string): boolean {
    return this.run(name, { value, announce: false });
  }

  /** Whether `undo` would do anything. */
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Whether `redo` would do anything. */
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  override focus(options?: FocusOptions): void {
    const content = this.contentEl;
    if (content && !this.isDisabled) content.focus(options);
    else super.focus(options);
  }

  /** Form-associated: validity of the value (`required`, `maxlength`). */
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  formResetCallback(): void {
    this.value = this.getAttribute("value") ?? "";
    this.touched = false;
    this.syncInternals();
  }

  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? "";
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  // ---------------------------------------------------------------------------------------------------
  // Lifecycle

  private get contentEl(): HTMLElement | null {
    return (this.renderRoot as ShadowRoot | undefined)?.querySelector?.<HTMLElement>(".content") ?? null;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get editable(): boolean {
    return !this.isDisabled && !this.readonly;
  }

  private get textLength(): number {
    return [...M.docToText(this.doc)].length;
  }

  private get isError(): boolean {
    if (this.error) return true;
    return this.touched && !isServer && !this.internals.validity.valid;
  }

  protected override firstUpdated(): void {
    // From here on the editable content is the editor's, not Lit's: replace the (server- or first-)
    // rendered nodes with plain ones and never render into it again (the template passes `noChange`).
    // Lit's start marker for that part stays as the first child, so the part keeps its parent.
    this.marker = Array.from(this.contentEl?.childNodes ?? []).find((n) => n.nodeType === 8) ?? null;
    this.renderContent();
    this.pendingLoad = false;
    this.contentOwned = true;
    this.syncEditable();
    this.syncInternals();
  }

  protected override willUpdate(): void {
    if (this.pendingLoad && this.contentOwned) {
      // A new value set from outside: rebuild the content before this render.
      this.pendingLoad = false;
      this.renderContent();
      this.refreshActive();
    } else if (!this.hasUpdated) {
      this.refreshActive();
    }
  }

  /** `contenteditable` is set here, not in the template: the server (and hydration) render it off. */
  private syncEditable(): void {
    this.contentEl?.setAttribute("contenteditable", this.editable ? "true" : "false");
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (this.contentOwned) this.syncEditable();
    if (changed.has("value") || changed.has("required") || changed.has("maxlength") || changed.has("errorText")) this.syncInternals();
  }

  private renderContent(): void {
    const content = this.contentEl;
    if (!content) return;
    const nodes = M.treeToDom(M.docToTree(this.doc, { placeholders: true }), content.ownerDocument);
    content.replaceChildren(...(this.marker ? [this.marker] : []), ...nodes);
  }

  /** Puts Lit's marker back if native editing removed it. */
  private keepMarker(): void {
    const content = this.contentEl;
    if (content && this.marker && this.marker.parentNode !== content) content.prepend(this.marker);
  }

  private syncInternals(): void {
    if (isServer || !this.internals?.setFormValue) return;
    this.internals.setFormValue(this.html);
    const empty = M.isEmptyDoc(this.doc);
    const valueMissing = this.required && empty;
    const tooLong = this.maxlength != null && this.textLength > this.maxlength;
    if (valueMissing || tooLong) {
      const message = valueMissing
        ? this.localize.term("richText.required", "Fill out this field")
        : this.localize.term("richText.tooLong", { one: "Use no more than {count} character", other: "Use no more than {count} characters" }, { count: this.maxlength ?? 0 });
      this.internals.setValidity({ valueMissing, tooLong }, this.errorText || message, this.contentEl ?? undefined);
    } else {
      this.internals.setValidity({});
    }
  }

  // ---------------------------------------------------------------------------------------------------
  // Selection

  private domSelection(): DomSelection | null {
    const content = this.contentEl;
    if (!content || isServer) return null;
    const root = this.renderRoot as ShadowRoot & { getSelection?: () => Selection | null };
    const sel = (typeof root.getSelection === "function" ? root.getSelection() : null) ?? document.getSelection();
    if (!sel || !sel.rangeCount) return null;
    if (sel.anchorNode && sel.focusNode && content.contains(sel.anchorNode) && content.contains(sel.focusNode)) {
      return { anchorNode: sel.anchorNode, anchorOffset: sel.anchorOffset, focusNode: sel.focusNode, focusOffset: sel.focusOffset };
    }
    // Safari retargets the document selection to the host; getComposedRanges sees into the shadow root.
    const composed = (sel as Selection & { getComposedRanges?: (...args: unknown[]) => StaticRange[] }).getComposedRanges;
    if (typeof composed === "function") {
      let ranges: StaticRange[] = [];
      try {
        ranges = composed.call(sel, { shadowRoots: [root] });
      } catch {
        try {
          ranges = composed.call(sel, root);
        } catch {
          ranges = [];
        }
      }
      const r = ranges[0];
      if (r && content.contains(r.startContainer) && content.contains(r.endContainer)) {
        const backward = (sel as Selection & { direction?: string }).direction === "backward";
        const start = { node: r.startContainer, offset: r.startOffset };
        const end = { node: r.endContainer, offset: r.endOffset };
        const [a, f] = backward ? [end, start] : [start, end];
        return { anchorNode: a.node, anchorOffset: a.offset, focusNode: f.node, focusOffset: f.offset };
      }
    }
    return null;
  }

  /** The live selection in model positions, if it's inside the content. */
  private liveSelection(): M.Sel | null {
    const content = this.contentEl;
    const dom = this.domSelection();
    if (!content || !dom) return null;
    const raw = M.fromDom(content, [
      { node: dom.anchorNode, offset: dom.anchorOffset },
      { node: dom.focusNode, offset: dom.focusOffset },
    ]);
    const { points } = M.rawToDoc(raw, { preserveWhitespace: true }, 2);
    const [anchor, focus] = points;
    if (!anchor || !focus) return null;
    return { anchor: M.clampPos(this.doc, anchor), focus: M.clampPos(this.doc, focus) };
  }

  private get contentFocused(): boolean {
    const content = this.contentEl;
    return !!content && (this.renderRoot as ShadowRoot).activeElement === content;
  }

  /** The selection commands act on: live when the content has focus, else the last one. */
  private selection(): M.Sel {
    const live = this.contentFocused ? this.liveSelection() : null;
    const sel = live ?? this.sel ?? M.caret(M.docEnd(this.doc));
    return { anchor: M.clampPos(this.doc, sel.anchor), focus: M.clampPos(this.doc, sel.focus) };
  }

  private domPoint(pos: M.Pos): { node: Node; offset: number } {
    const content = this.contentEl!;
    const blocks = content.querySelectorAll("p, h2, h3, pre, li");
    const el = blocks[pos.b] ?? blocks[blocks.length - 1];
    if (!el) return { node: content, offset: 0 };
    let remaining = pos.o;
    let result: { node: Node; offset: number } | null = null;
    const walk = (node: Node): boolean => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          const len = (child as Text).data.length;
          if (remaining <= len) {
            result = { node: child, offset: remaining };
            return true;
          }
          remaining -= len;
        } else if (child.nodeType === 1) {
          const tag = (child as Element).localName;
          if (tag === "ul" || tag === "ol") continue;
          if (tag === "br") {
            if (remaining === 0) {
              result = { node, offset: Array.prototype.indexOf.call(node.childNodes, child) };
              return true;
            }
            remaining -= 1;
          } else if (walk(child)) return true;
        }
      }
      return false;
    };
    walk(el);
    if (result) return result;
    const nested = Array.from(el.childNodes).findIndex((n) => n.nodeType === 1 && /^(ul|ol)$/.test((n as Element).localName));
    return { node: el, offset: nested === -1 ? el.childNodes.length : nested };
  }

  private setDomSelection(sel: M.Sel): void {
    const content = this.contentEl;
    if (!content) return;
    const a = this.domPoint(M.clampPos(this.doc, sel.anchor));
    const f = this.domPoint(M.clampPos(this.doc, sel.focus));
    const root = this.renderRoot as ShadowRoot & { getSelection?: () => Selection | null };
    const s = (typeof root.getSelection === "function" ? root.getSelection() : null) ?? document.getSelection();
    try {
      s?.setBaseAndExtent(a.node, a.offset, f.node, f.offset);
    } catch {
      // A detached node (content re-rendered meanwhile): leave the selection as it is.
    }
  }

  /** Remembers a selection and shows it, when the content has focus (otherwise on the next focus). */
  private applySelection(sel: M.Sel): void {
    this.sel = { anchor: M.clampPos(this.doc, sel.anchor), focus: M.clampPos(this.doc, sel.focus) };
    if (this.contentFocused) this.setDomSelection(this.sel);
  }

  private readonly onSelectionChange = (): void => {
    if (!this.contentFocused) return;
    const live = this.liveSelection();
    if (!live) return;
    this.sel = live;
    if (this.storedMarks && this.storedAt && (!M.isCollapsed(live) || M.comparePos(live.anchor, this.storedAt) !== 0)) {
      this.storedMarks = null;
      this.storedAt = null;
    }
    this.refreshActive();
  };

  private refreshActive(): void {
    const sel = this.sel ?? M.caret({ b: 0, o: 0 });
    const [from, to] = M.ordered(sel);
    const doc = this.doc;
    const marks = M.isCollapsed(sel) ? new Set(this.storedMarks ?? M.marksAt(doc, from).marks) : M.marksIn(doc, from, to);
    const blocks = doc.slice(from.b, to.b + 1);
    const first = blocks[0]?.type ?? "p";
    const same = blocks.every((b) => b.type === first);
    const block = same && (first === "p" || first === "h2" || first === "h3") ? first : "";
    const firstList = blocks[0]?.list ?? null;
    const list = blocks.every((b) => b.type === "li" && b.list === firstList) ? firstList : null;
    this.active = {
      marks,
      block,
      list,
      quote: blocks.every((b) => b.type === "blockquote"),
      pre: blocks.every((b) => b.type === "pre"),
      link: !!M.linkAt(doc, from, to),
    };
  }

  // ---------------------------------------------------------------------------------------------------
  // Editing

  private snapshot(sel: M.Sel): Snapshot {
    return { doc: M.cloneDoc(this.doc), sel };
  }

  private pushUndo(snap: Snapshot): void {
    this.undoStack.push(snap);
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this.redoStack = [];
  }

  /**
   * Applies a model change as one undoable step, re-renders the content and restores the selection the
   * change returns. Returns false (and records nothing) when the document didn't change.
   */
  private edit(change: (doc: M.Doc) => M.Sel | void, sel: M.Sel = this.selection()): boolean {
    const before = this.snapshot(sel);
    const beforeHtml = M.docToHtml(this.doc);
    const beforeShape = this.doc.map((b) => b.type).join();
    const next = change(this.doc) ?? sel;
    M.normalize(this.doc);
    const changed = M.docToHtml(this.doc) !== beforeHtml || this.doc.map((b) => b.type).join() !== beforeShape;
    if (changed) {
      this.pushUndo(before);
      this.typing = null;
    }
    this.renderContent();
    this.applySelection(next);
    this.commit();
    return changed;
  }

  /** After any change: value, events, toolbar state, validity. */
  private commit(): void {
    const html = M.docToHtml(this.doc);
    if (html !== this.html) {
      const old = this.html;
      this.html = html;
      this.requestUpdate("value", old);
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
    this.refreshActive();
    this.syncInternals();
    this.requestUpdate();
  }

  /** Reads natively edited content back into the model; re-renders it when it left the schema. */
  private syncFromDom(): void {
    const content = this.contentEl;
    if (!content) return;
    const dom = this.domSelection();
    const points: M.DomPoint[] = dom
      ? [
          { node: dom.anchorNode, offset: dom.anchorOffset },
          { node: dom.focusNode, offset: dom.focusOffset },
        ]
      : [];
    this.keepMarker();
    const raw = M.fromDom(content, points);
    const { doc, points: found } = M.rawToDoc(raw, { preserveWhitespace: true }, points.length);
    this.doc = doc;
    const canonical = M.treeToHtml(M.docToTree(doc, { placeholders: true }));
    if (canonical !== M.rawToCanonical(raw)) {
      this.renderContent();
      if (found[0] && found[1]) this.applySelection({ anchor: found[0], focus: found[1] });
    } else if (found[0] && found[1]) {
      this.sel = { anchor: found[0], focus: found[1] };
    }
    this.commit();
  }

  /** Native typing: one undo step per burst of the same kind of input. */
  private beginTyping(kind: string, sel: M.Sel): void {
    const now = Date.now();
    if (!this.typing || this.typing.kind !== kind || now - this.typing.time > TYPING_PAUSE) {
      this.pushUndo(this.snapshot(sel));
    }
    this.typing = { kind, time: now };
  }

  private insertText(text: string, sel: M.Sel): void {
    const [from, to] = M.ordered(sel);
    const style = this.storedMarks
      ? { marks: this.storedMarks, ...(M.marksAt(this.doc, from).href ? { href: M.marksAt(this.doc, from).href } : {}) }
      : M.marksAt(this.doc, M.isCollapsed(sel) ? from : { b: from.b, o: from.o + 1 });
    this.storedMarks = null;
    this.storedAt = null;
    this.edit((doc) => {
      const pos = M.deleteRange(doc, from, to);
      return M.caret(M.insertSegs(doc, pos, [{ text, marks: style.marks, ...(style.href ? { href: style.href } : {}) }]));
    }, sel);
  }

  private enter(sel: M.Sel): void {
    const [from, to] = M.ordered(sel);
    let carry: M.Mark[] = [];
    this.edit((doc) => {
      const pos = M.deleteRange(doc, from, to);
      const block = doc[pos.b]!;
      const len = M.blockLength(block);
      if (block.type === "pre") {
        if (pos.o === len && M.blockText(block).endsWith("\n")) {
          // Enter on an empty last line leaves the code block.
          block.segs = M.sliceSegs(block, 0, len - 1);
          doc.splice(pos.b + 1, 0, { type: "p", segs: [] });
          return M.caret({ b: pos.b + 1, o: 0 });
        }
        return M.caret(M.insertSegs(doc, pos, [{ text: "\n", marks: [] }]));
      }
      if (len === 0 && block.type === "li") {
        M.indentItems(doc, pos.b, pos.b, -1);
        return M.caret(pos);
      }
      if (len === 0 && block.type === "blockquote") {
        block.type = "p";
        return M.caret(pos);
      }
      carry = pos.o === len ? M.marksAt(doc, pos).marks : [];
      return M.caret(M.splitBlock(doc, pos));
    }, sel);
    if (carry.length) {
      // Bold (etc.) carries on into the new, empty line.
      this.storedMarks = carry;
      this.storedAt = this.sel ? { ...this.sel.focus } : null;
      this.refreshActive();
    }
  }

  private backspaceAtStart(pos: M.Pos, sel: M.Sel): void {
    this.edit((doc) => {
      const block = doc[pos.b]!;
      if (block.type === "li") {
        M.indentItems(doc, pos.b, pos.b, -1);
        return M.caret(pos);
      }
      if (block.type === "blockquote" || block.type === "pre") {
        M.setBlockType(doc, pos.b, pos.b, "p");
        return M.caret(pos);
      }
      if (pos.b > 0) return M.caret(M.joinBackward(doc, pos.b));
      if (block.type !== "p") block.type = "p";
      return M.caret(pos);
    }, sel);
  }

  /** Markdown-style shortcuts typed at the start of a paragraph, completed by a space. */
  private inputRule(sel: M.Sel): boolean {
    const pos = sel.focus;
    const block = this.doc[pos.b];
    if (!block || block.type !== "p") return false;
    const before = M.blockText(block).slice(0, pos.o);
    const rules: Array<[RegExp, (doc: M.Doc) => void]> = [
      [/^##$/, (doc) => M.setBlockType(doc, pos.b, pos.b, "h2")],
      [/^###$/, (doc) => M.setBlockType(doc, pos.b, pos.b, "h3")],
      [/^[-*+]$/, (doc) => M.setList(doc, pos.b, pos.b, "ul")],
      [/^\d{1,3}[.)]$/, (doc) => M.setList(doc, pos.b, pos.b, "ol")],
      [/^>$/, (doc) => M.setBlockType(doc, pos.b, pos.b, "blockquote")],
      [/^```$/, (doc) => M.setBlockType(doc, pos.b, pos.b, "pre")],
    ];
    const rule = rules.find(([re]) => re.test(before));
    if (!rule) return false;
    this.edit((doc) => {
      const target = doc[pos.b]!;
      target.segs = M.sliceSegs(target, pos.o, M.blockLength(target));
      rule[1](doc);
      return M.caret({ b: pos.b, o: 0 });
    }, sel);
    return true;
  }

  /** Inserts a pasted document at the selection. */
  private insertDoc(pasted: M.Doc, plain: string, sel: M.Sel): void {
    const [from, to] = M.ordered(sel);
    this.edit((doc) => {
      const pos = M.deleteRange(doc, from, to);
      const block = doc[pos.b]!;
      if (block.type === "pre") return M.caret(M.insertSegs(doc, pos, [{ text: plain || M.docToText(pasted), marks: [] }]));
      if (M.isEmptyDoc(pasted)) return M.caret(pos);
      const [first, ...rest] = pasted;
      if (!rest.length && first!.type !== "pre") return M.caret(M.insertSegs(doc, pos, first!.segs));
      const len = M.blockLength(block);
      const tail = M.sliceSegs(block, pos.o, len);
      const head = M.sliceSegs(block, 0, pos.o);
      const blocks: M.Block[] = [];
      if (pos.o === 0) blocks.push(first!);
      else blocks.push({ ...block, segs: [...head, ...(first!.type === "pre" ? [{ text: M.blockText(first!), marks: [] }] : first!.segs)] });
      blocks.push(...rest);
      const last = blocks[blocks.length - 1]!;
      const end = { b: pos.b + blocks.length - 1, o: M.blockLength(last) };
      last.segs = [...last.segs, ...(last.type === "pre" ? tail.map((s) => ({ text: s.text, marks: [] as M.Mark[] })) : tail)];
      doc.splice(pos.b, 1, ...blocks);
      return M.caret(end);
    }, sel);
  }

  private undo(): boolean {
    const snap = this.undoStack.pop();
    if (!snap) return false;
    this.redoStack.push(this.snapshot(this.selection()));
    this.restore(snap);
    return true;
  }

  private redo(): boolean {
    const snap = this.redoStack.pop();
    if (!snap) return false;
    this.undoStack.push(this.snapshot(this.selection()));
    this.restore(snap);
    return true;
  }

  private restore(snap: Snapshot): void {
    this.doc = M.cloneDoc(snap.doc);
    this.typing = null;
    this.storedMarks = null;
    this.renderContent();
    this.applySelection(snap.sel);
    this.commit();
  }

  private labels() {
    return {
      bold: this.localize.term("richText.bold", "Bold"),
      italic: this.localize.term("richText.italic", "Italic"),
      underline: this.localize.term("richText.underline", "Underline"),
      strikethrough: this.localize.term("richText.strikethrough", "Strikethrough"),
      code: this.localize.term("richText.code", "Inline code"),
      paragraph: this.localize.term("richText.paragraph", "Paragraph"),
      heading2: this.localize.term("richText.heading2", "Heading 2"),
      heading3: this.localize.term("richText.heading3", "Heading 3"),
      bulletList: this.localize.term("richText.bulletList", "Bulleted list"),
      numberedList: this.localize.term("richText.numberedList", "Numbered list"),
      quote: this.localize.term("richText.quote", "Quote"),
      codeBlock: this.localize.term("richText.codeBlock", "Code block"),
      link: this.localize.term("richText.link", "Link"),
      clearFormatting: this.localize.term("richText.clearFormatting", "Clear formatting"),
      undo: this.localize.term("richText.undo", "Undo"),
      redo: this.localize.term("richText.redo", "Redo"),
    };
  }

  private announce(message: string): void {
    // Alternate a trailing no-break space so the same message twice is still a change to announce.
    this.announcement = this.announcement === message ? `${message}\u00a0` : message;
  }

  private run(name: RichTextCommand, options: { value?: string; announce: boolean }): boolean {
    if (!this.editable) return false;
    const labels = this.labels();
    const on = (label: string): string => this.localize.term("richText.formatOn", "{format} on", { format: label });
    const off = (label: string): string => this.localize.term("richText.formatOff", "{format} off", { format: label });
    const say = (message: string): void => {
      if (options.announce) this.announce(message);
    };
    const sel = this.selection();
    const [from, to] = M.ordered(sel);
    const mark = MARK_COMMAND[name];
    if (mark) {
      const label = labels[name as keyof typeof labels];
      if (M.isCollapsed(sel)) {
        const base = this.storedMarks ?? M.marksAt(this.doc, from).marks;
        const turnOn = !base.includes(mark);
        this.storedMarks = turnOn ? M.MARKS.filter((m) => m === mark || base.includes(m)) : base.filter((m) => m !== mark);
        this.storedAt = { ...from };
        this.sel = sel;
        this.refreshActive();
        say(turnOn ? on(label) : off(label));
        return true;
      }
      const turnOn = !M.marksIn(this.doc, from, to).has(mark);
      const changed = this.edit((doc) => M.setMark(doc, from, to, mark, turnOn), sel);
      if (changed) say(turnOn ? on(label) : off(label));
      return changed;
    }
    switch (name) {
      case "undo": {
        const done = this.undo();
        if (done) say(this.localize.term("richText.undone", "Undone"));
        return done;
      }
      case "redo": {
        const done = this.redo();
        if (done) say(this.localize.term("richText.redone", "Redone"));
        return done;
      }
      case "paragraph":
      case "heading2":
      case "heading3":
      case "quote":
      case "codeBlock": {
        const type = ({ paragraph: "p", heading2: "h2", heading3: "h3", quote: "blockquote", codeBlock: "pre" } as const)[name];
        const blocks = this.doc.slice(from.b, to.b + 1);
        const toggleOff = (type === "blockquote" || type === "pre") && blocks.every((b) => b.type === type);
        const target = toggleOff ? "p" : type;
        const changed = this.blockChange(sel, (doc) => M.setBlockType(doc, from.b, to.b, target));
        if (changed) say(toggleOff ? off(labels[name]) : labels[name]);
        return changed;
      }
      case "bulletList":
      case "numberedList": {
        const kind: M.ListKind = name === "bulletList" ? "ul" : "ol";
        const blocks = this.doc.slice(from.b, to.b + 1);
        const toggleOff = blocks.every((b) => b.type === "li" && b.list === kind);
        const changed = this.blockChange(sel, (doc) => M.setList(doc, from.b, to.b, toggleOff ? null : kind));
        if (changed) say(toggleOff ? off(labels[name]) : on(labels[name]));
        return changed;
      }
      case "indent":
      case "outdent": {
        const changed = this.edit((doc) => {
          M.indentItems(doc, from.b, to.b, name === "indent" ? 1 : -1);
        }, sel);
        if (changed) {
          const block = this.doc[from.b];
          say(block?.type === "li" ? this.localize.term("richText.listLevel", "List level {level}", { level: (block.indent ?? 0) + 1 }) : off(block ? labels.bulletList : ""));
        }
        return changed;
      }
      case "clearFormatting": {
        const changed = this.edit((doc) => M.clearInline(doc, from, to), sel);
        this.storedMarks = M.isCollapsed(sel) ? [] : null;
        this.refreshActive();
        if (changed || M.isCollapsed(sel)) say(this.localize.term("richText.formattingCleared", "Formatting cleared"));
        return changed;
      }
      case "link":
        if (options.value === undefined) {
          void this.openLink(sel);
          return false;
        }
        return this.setLink(options.value, sel, options.announce);
      case "unlink":
        return this.setLink(null, sel, options.announce);
    }
    return false;
  }

  /** A block-level change: keeps the selection when the block count is unchanged, else selects the result. */
  private blockChange(sel: M.Sel, change: (doc: M.Doc) => [number, number]): boolean {
    const count = this.doc.length;
    return this.edit((doc) => {
      const [a, z] = change(doc);
      if (doc.length === count) return sel;
      return { anchor: { b: a, o: 0 }, focus: { b: z, o: M.blockLength(doc[z]!) } };
    }, sel);
  }

  /** Sets (or with `null`, removes) the link on the selection, or on the whole link the caret is in. */
  private setLink(href: string | null, sel: M.Sel, announce: boolean): boolean {
    let [from, to] = M.ordered(sel);
    const existing = M.linkAt(this.doc, from, to);
    if (existing && (M.isCollapsed(sel) || href === null)) [from, to] = [existing.from, existing.to];
    if (href === null) {
      const changed = this.edit((doc) => {
        M.setHref(doc, from, to, undefined);
        return M.caret(to);
      }, sel);
      if (changed && announce) this.announce(this.localize.term("richText.linkRemoved", "Link removed"));
      return changed;
    }
    const safe = M.safeHref(userUrl(href));
    if (!safe) return false;
    const changed = this.edit((doc) => {
      if (M.comparePos(from, to) === 0) {
        const marks = M.marksAt(doc, from).marks.filter((m) => m !== "code");
        return M.caret(M.insertSegs(doc, from, [{ text: safe, marks, href: safe }]));
      }
      M.setHref(doc, from, to, safe);
      return M.caret(to);
    }, sel);
    if (changed && announce) this.announce(this.localize.term("richText.linkAdded", "Link added"));
    return changed;
  }

  // ---------------------------------------------------------------------------------------------------
  // Link panel

  private async openLink(sel: M.Sel): Promise<void> {
    const [from, to] = M.ordered(sel);
    const existing = M.linkAt(this.doc, from, to);
    this.linkSel = existing && (M.isCollapsed(sel) || from.b === to.b) ? { anchor: existing.from, focus: existing.to } : sel;
    this.linkExisting = !!existing;
    this.linkValue = existing?.href ?? "";
    this.linkError = "";
    this.linkOpen = true;
    this.sel = sel;
    await this.updateComplete;
    const input = this.renderRoot.querySelector<HTMLInputElement>(".link-input");
    input?.focus();
    input?.select();
  }

  private closeLink(refocus: boolean): void {
    this.linkOpen = false;
    this.linkError = "";
    if (refocus) this.focusContent();
  }

  private focusContent(): void {
    const content = this.contentEl;
    if (!content) return;
    this.pointerFocus = false;
    content.focus({ preventScroll: true });
    if (this.sel) this.setDomSelection(this.sel);
  }

  private applyLink(): void {
    const input = this.renderRoot.querySelector<HTMLInputElement>(".link-input");
    const raw = input?.value ?? this.linkValue;
    const sel = this.linkSel ?? this.selection();
    if (!raw.trim()) {
      if (this.linkExisting) this.removeLink();
      else this.closeLink(true);
      return;
    }
    if (!M.safeHref(userUrl(raw))) {
      this.linkError = this.localize.term("richText.invalidUrl", "Use a web address (http or https), an email address or a relative path");
      input?.focus();
      return;
    }
    this.closeLink(false);
    this.setLink(raw, sel, true);
    this.focusContent();
  }

  private removeLink(): void {
    const sel = this.linkSel ?? this.selection();
    this.closeLink(false);
    this.setLink(null, sel, true);
    this.focusContent();
  }

  private onLinkKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.closeLink(true);
    } else if (event.key === "Enter" && (event.target as HTMLElement).localName === "input") {
      event.preventDefault();
      this.applyLink();
    }
  }

  // ---------------------------------------------------------------------------------------------------
  // Event handlers

  private onBeforeInput(event: InputEvent): void {
    if (!this.editable) {
      event.preventDefault();
      return;
    }
    if (event.isComposing || this.composing) return;
    const type = event.inputType;
    const sel = this.liveSelection() ?? this.selection();
    const [from, to] = M.ordered(sel);
    const collapsed = M.isCollapsed(sel);
    const handled = (): void => event.preventDefault();
    switch (type) {
      case "historyUndo":
        handled();
        this.run("undo", { announce: false });
        return;
      case "historyRedo":
        handled();
        this.run("redo", { announce: false });
        return;
      case "formatBold":
      case "formatItalic":
      case "formatUnderline":
      case "formatStrikeThrough": {
        handled();
        const map = { formatBold: "bold", formatItalic: "italic", formatUnderline: "underline", formatStrikeThrough: "strikethrough" } as const;
        this.run(map[type], { announce: true });
        return;
      }
      case "insertParagraph":
        handled();
        this.enter(sel);
        return;
      case "insertLineBreak":
        handled();
        this.insertText("\n", sel);
        return;
      case "insertFromDrop":
      case "deleteByDrag":
      case "insertFromPaste":
      case "insertFromPasteAsQuotation":
      case "insertFromYank":
        // Paste goes through the paste handler (sanitized); drag and drop isn't supported.
        handled();
        return;
    }
    if (type.startsWith("format")) {
      handled();
      return;
    }
    if (type === "insertText" || type === "insertReplacementText") {
      const data = event.data ?? event.dataTransfer?.getData("text/plain") ?? null;
      if (data === null) return;
      if (type === "insertText" && data === " " && collapsed && this.inputRule(sel)) {
        handled();
        return;
      }
      if (!collapsed || this.storedMarks || data.includes("\n")) {
        handled();
        if (data.includes("\n") && this.doc[from.b]?.type !== "pre") this.insertDoc(M.textToDoc(data), data, sel);
        else this.insertText(data, sel);
        return;
      }
      this.beginTyping("insert", sel);
      return;
    }
    if (type.startsWith("delete")) {
      if (!collapsed) {
        handled();
        this.edit((doc) => M.caret(M.deleteRange(doc, from, to)), sel);
        return;
      }
      const backward = /Backward$/.test(type);
      const forward = /Forward$/.test(type);
      if (backward && from.o === 0) {
        handled();
        this.backspaceAtStart(from, sel);
        return;
      }
      if (forward && from.o === M.blockLength(this.doc[from.b]!)) {
        handled();
        if (from.b < this.doc.length - 1) this.edit((doc) => M.caret(M.joinBackward(doc, from.b + 1)), sel);
        return;
      }
      this.beginTyping("delete", sel);
      return;
    }
    // Anything else (rare input types) happens natively and is normalized on input.
    this.beginTyping(type, sel);
  }

  private onInput(event: Event): void {
    // Re-dispatched from commit() with the new value, once per change.
    event.stopPropagation();
    if (this.composing) return;
    this.syncFromDom();
  }

  private onCompositionStart(): void {
    this.composing = true;
    const sel = this.liveSelection() ?? this.selection();
    this.beginTyping("compose", sel);
  }

  private onCompositionEnd(): void {
    this.composing = false;
    this.syncFromDom();
  }

  private onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (!this.editable) return;
    const data = event.clipboardData;
    const htmlData = data?.getData("text/html") ?? "";
    const text = data?.getData("text/plain") ?? "";
    const sel = this.liveSelection() ?? this.selection();
    this.insertDoc(htmlData ? M.htmlToDoc(htmlData) : M.textToDoc(text), text, sel);
  }

  private onDrop(event: DragEvent): void {
    event.preventDefault();
  }

  private onContentKeydown(event: KeyboardEvent): void {
    if (!this.editable || event.isComposing) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const escaping = this.tabEscape;
    this.tabEscape = key === "escape";
    let command: RichTextCommand | null = null;
    if (mod && !event.altKey) {
      if (event.shiftKey) {
        if (key === "z") command = "redo";
        else if (key === "x") command = "strikethrough";
        else if (event.code === "Digit7") command = "numberedList";
        else if (event.code === "Digit8") command = "bulletList";
      } else {
        command = ({ b: "bold", i: "italic", u: "underline", e: "code", k: "link", z: "undo", y: "redo" } as Record<string, RichTextCommand>)[key] ?? null;
      }
    } else if (mod && event.altKey) {
      command = ({ Digit0: "paragraph", Digit2: "heading2", Digit3: "heading3" } as Record<string, RichTextCommand>)[event.code] ?? null;
    }
    if (command) {
      event.preventDefault();
      this.run(command, { announce: true });
      return;
    }
    if (key === "tab" && !mod && !event.altKey && escaping) {
      this.tabOut();
      return;
    }
    if (key === "tab" && !mod && !event.altKey && !escaping) {
      const sel = this.selection();
      const [from, to] = M.ordered(sel);
      if (this.doc.slice(from.b, to.b + 1).some((b) => b.type === "li")) {
        event.preventDefault();
        this.run(event.shiftKey ? "outdent" : "indent", { announce: true });
      }
    }
  }

  /**
   * Escape then Tab leaves the editor. Firefox's own editing indents a list item on an uncanceled Tab, so for
   * this one key press the content is focusable but not editable, and Tab is plain focus navigation everywhere.
   */
  private tabOut(): void {
    const content = this.contentEl;
    if (!content || !this.editable) return;
    const hadTabIndex = content.hasAttribute("tabindex");
    if (!hadTabIndex) content.tabIndex = 0;
    content.setAttribute("contenteditable", "false");
    setTimeout(() => {
      if (!hadTabIndex) content.removeAttribute("tabindex");
      this.syncEditable();
    });
  }

  private onContentFocus(): void {
    if (this.valueAtFocus === null) this.valueAtFocus = this.html;
    if (!this.pointerFocus && this.sel) this.setDomSelection(this.sel);
    this.pointerFocus = false;
  }

  private onPointerDown(): void {
    if (!this.contentFocused) this.pointerFocus = true;
  }

  private onFocusIn(): void {
    if (this.valueAtFocus === null) this.valueAtFocus = this.html;
  }

  private onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (this.renderRoot.contains(next) || next === this)) return;
    this.touched = true;
    this.typing = null;
    this.syncInternals();
    if (this.valueAtFocus !== null && this.valueAtFocus !== this.html) {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    this.valueAtFocus = null;
  }

  private onToolbarKeydown(event: KeyboardEvent): void {
    const items = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(".tool"));
    const index = items.indexOf(event.target as HTMLElement);
    if (index === -1) return;
    const rtl = isRtl(this);
    let next = -1;
    if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = (index + 1) % items.length;
    else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    if (next === -1) return;
    event.preventDefault();
    this.focusIndex = next;
    items[next]!.focus();
  }

  private onToolbarFocusIn(event: FocusEvent): void {
    const items = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(".tool"));
    const index = items.indexOf(event.target as HTMLElement);
    if (index !== -1) this.focusIndex = index;
  }

  private onBlockSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const command = ({ p: "paragraph", h2: "heading2", h3: "heading3" } as Record<string, RichTextCommand>)[value];
    if (command) this.run(command, { announce: false });
  }

  // ---------------------------------------------------------------------------------------------------
  // Rendering

  private renderTool(index: number, command: RichTextCommand, label: string, path: string, opts: { pressed?: boolean; keys?: string; mirror?: boolean; unavailable?: boolean; popup?: boolean } = {}) {
    return html`<button
      type="button"
      class="tool"
      data-command=${command}
      tabindex=${index === this.focusIndex ? 0 : -1}
      aria-label=${label}
      title=${label}
      aria-pressed=${opts.pressed === undefined ? nothing : String(opts.pressed)}
      aria-keyshortcuts=${opts.keys ?? nothing}
      aria-disabled=${opts.unavailable ? "true" : nothing}
      aria-haspopup=${opts.popup ? "dialog" : nothing}
      aria-expanded=${opts.popup ? String(this.linkOpen) : nothing}
      ?disabled=${!this.editable}
      @mousedown=${(e: Event) => e.preventDefault()}
      @click=${() => this.run(command, { announce: false })}
    >
      ${icon(path, opts.mirror)}
    </button>`;
  }

  private renderToolbar() {
    const l = this.labels();
    const a = this.active;
    let i = 1;
    return html`<div
      class="toolbar"
      part="toolbar"
      role="toolbar"
      aria-label=${this.localize.term("richText.toolbar", "Formatting")}
      aria-controls="content"
      @keydown=${this.onToolbarKeydown}
      @focusin=${this.onToolbarFocusIn}
    >
      <select
        class="tool block-select"
        tabindex=${this.focusIndex === 0 ? 0 : -1}
        aria-label=${this.localize.term("richText.textStyle", "Text style")}
        aria-keyshortcuts="Control+Alt+0 Control+Alt+2 Control+Alt+3"
        .value=${a.block}
        ?disabled=${!this.editable}
        @change=${this.onBlockSelect}
      >
        <option value="p" ?selected=${a.block === "p"}>${l.paragraph}</option>
        <option value="h2" ?selected=${a.block === "h2"}>${l.heading2}</option>
        <option value="h3" ?selected=${a.block === "h3"}>${l.heading3}</option>
        <option value="" hidden disabled ?selected=${a.block === ""}></option>
      </select>
      <span class="divider" aria-hidden="true"></span>
      ${this.renderTool(i++, "bold", l.bold, ICONS.bold, { pressed: a.marks.has("strong"), keys: "Control+B Meta+B" })}
      ${this.renderTool(i++, "italic", l.italic, ICONS.italic, { pressed: a.marks.has("em"), keys: "Control+I Meta+I" })}
      ${this.renderTool(i++, "underline", l.underline, ICONS.underline, { pressed: a.marks.has("u"), keys: "Control+U Meta+U" })}
      ${this.renderTool(i++, "strikethrough", l.strikethrough, ICONS.strikethrough, { pressed: a.marks.has("s"), keys: "Control+Shift+X Meta+Shift+X" })}
      ${this.renderTool(i++, "code", l.code, ICONS.code, { pressed: a.marks.has("code"), keys: "Control+E Meta+E" })}
      <span class="divider" aria-hidden="true"></span>
      ${this.renderTool(i++, "bulletList", l.bulletList, ICONS.bulletList, { pressed: a.list === "ul", keys: "Control+Shift+8 Meta+Shift+8", mirror: true })}
      ${this.renderTool(i++, "numberedList", l.numberedList, ICONS.numberedList, { pressed: a.list === "ol", keys: "Control+Shift+7 Meta+Shift+7" })}
      ${this.renderTool(i++, "quote", l.quote, ICONS.quote, { pressed: a.quote })}
      ${this.renderTool(i++, "codeBlock", l.codeBlock, ICONS.codeBlock, { pressed: a.pre })}
      <span class="divider" aria-hidden="true"></span>
      ${this.renderTool(i++, "link", l.link, ICONS.link, { keys: "Control+K Meta+K", popup: true })}
      ${this.renderTool(i++, "clearFormatting", l.clearFormatting, ICONS.clear)}
      <span class="divider" aria-hidden="true"></span>
      ${this.renderTool(i++, "undo", l.undo, ICONS.undo, { keys: "Control+Z Meta+Z", mirror: true, unavailable: !this.canUndo })}
      ${this.renderTool(i++, "redo", l.redo, ICONS.redo, { keys: "Control+Shift+Z Meta+Shift+Z Control+Y", mirror: true, unavailable: !this.canRedo })}
    </div>`;
  }

  private renderLinkPanel() {
    if (!this.linkOpen) return nothing;
    const errorId = `lit-material-rich-text-link-error-${this.ids}`;
    return html`<div class="link-panel" part="link-panel" role="dialog" aria-label=${this.localize.term("richText.link", "Link")} @keydown=${this.onLinkKeydown}>
      <label class="link-field">
        <span class="link-label">${this.localize.term("richText.linkUrl", "Link address")}</span>
        <input
          class="link-input"
          type="url"
          inputmode="url"
          autocomplete="url"
          placeholder="https://"
          .value=${this.linkValue}
          aria-invalid=${this.linkError ? "true" : nothing}
          aria-describedby=${this.linkError ? errorId : nothing}
          @input=${(e: Event) => {
            this.linkValue = (e.target as HTMLInputElement).value;
            this.linkError = "";
          }}
        />
      </label>
      ${this.linkError ? html`<div class="link-error" id=${errorId} role="alert">${this.linkError}</div>` : nothing}
      <div class="link-actions">
        ${this.linkExisting
          ? html`<button type="button" class="text-button" @click=${this.removeLink}>${this.localize.term("richText.removeLink", "Remove link")}</button>`
          : nothing}
        <button type="button" class="text-button" @click=${() => this.closeLink(true)}>${this.localize.term("richText.cancel", "Cancel")}</button>
        <button type="button" class="text-button primary" @click=${this.applyLink}>${this.localize.term("richText.applyLink", "Apply")}</button>
      </div>
    </div>`;
  }

  override render() {
    const isError = this.isError;
    const message = isError ? this.errorText || (isServer ? "" : this.internals.validationMessage) : this.supportingText;
    const empty = M.isEmptyDoc(this.doc);
    const counter = this.maxlength != null;
    return html`
      <div class="field" @focusin=${this.onFocusIn} @focusout=${this.onFocusOut}>
        ${this.label ? html`<span class="label" part="label" id=${this.labelId} @click=${() => this.focus()}>${this.label}</span>` : nothing}
        <div class="container ${isError ? "invalid" : ""}" part="container">
          ${this.renderToolbar()} ${this.renderLinkPanel()}
          <div
            id="content"
            class="content ${empty && this.placeholder ? "empty" : ""}"
            part="content"
            role="textbox"
            aria-multiline="true"
            contenteditable="false"
            tabindex=${this.readonly && !this.isDisabled ? "0" : nothing}
            spellcheck="true"
            aria-labelledby=${this.label ? this.labelId : nothing}
            aria-describedby=${message ? this.supportingId : nothing}
            aria-required=${this.required ? "true" : nothing}
            aria-invalid=${isError ? "true" : nothing}
            aria-disabled=${this.isDisabled ? "true" : nothing}
            aria-readonly=${this.readonly ? "true" : nothing}
            aria-placeholder=${this.placeholder || nothing}
            data-placeholder=${this.placeholder || nothing}
            @beforeinput=${this.onBeforeInput}
            @input=${this.onInput}
            @keydown=${this.onContentKeydown}
            @paste=${this.onPaste}
            @drop=${this.onDrop}
            @focus=${this.onContentFocus}
            @pointerdown=${this.onPointerDown}
            @compositionstart=${this.onCompositionStart}
            @compositionend=${this.onCompositionEnd}
          >${this.contentOwned ? noChange : treeTemplate(M.docToTree(this.doc, { placeholders: true }))}</div>
        </div>
        ${message || counter
          ? html`<div class="supporting" part="supporting">
              <span class="supporting-text" id=${this.supportingId}>${message}</span>
              ${counter
                ? html`<span class="counter">${this.localize.term("richText.characterCount", "{count} / {max}", { count: this.textLength, max: this.maxlength ?? 0 })}</span>`
                : nothing}
            </div>`
          : nothing}
        <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">${this.announcement}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-rich-text-editor": LitMaterialRichTextEditor;
  }
}
