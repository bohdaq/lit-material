import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

/** Returns an error message for `text`, or `""` when it's fine. */
export type CodeValidator = (text: string) => string;

/** `JSON.parse` as a validator, with the line of the error when the engine reports a position. */
export function validateJson(text: string): string {
  if (!text.trim()) return "";
  try {
    JSON.parse(text);
    return "";
  } catch (error) {
    const message = (error as Error).message;
    // Firefox and newer V8 name the line; older V8 gives a position; otherwise find it.
    const line = /line (\d+)/i.exec(message)?.[1];
    if (line) {
      const plain = message.replace(/\s*\(?(at )?line \d+ column \d+( of the JSON data)?\)?/i, "");
      return `Line ${line}: ${plain.replace(/ at position \d+$/, "")}`;
    }
    const position = Number(/position (\d+)/.exec(message)?.[1] ?? errorOffset(text));
    return `Line ${text.slice(0, position).split("\n").length}: ${message}`;
  }
}

const END_OF_INPUT = /end of (JSON )?(input|data)|EOF/i;

/**
 * Where parsing fails, to the line: the first line whose end leaves the text
 * broken rather than just unfinished. JSON tokens never span lines, so
 * "unfinished" holds for every line before that one and a binary search works.
 */
function errorOffset(text: string): number {
  const ends: number[] = [];
  for (let i = text.indexOf("\n"); i !== -1; i = text.indexOf("\n", i + 1)) ends.push(i);
  ends.push(text.length);
  const unfinished = (end: number) => {
    try {
      JSON.parse(text.slice(0, end));
      return true;
    } catch (error) {
      // "Unexpected end of input", or an error reported at the very end of the prefix.
      const message = (error as Error).message;
      const at = /position (\d+)/.exec(message)?.[1];
      return END_OF_INPUT.test(message) || (at !== undefined && Number(at) >= end);
    }
  };
  let low = 0;
  let high = ends.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (unfinished(ends[mid]!)) low = mid + 1;
    else high = mid;
  }
  return ends[low]!;
}

/**
 * A plain-text editor for code and config — YAML, JSON, a script, a
 * Dockerfile: monospace, no wrapping or spell-check, with line numbers.
 *
 * Tab indents (the selected lines, or at the caret) and Shift+Tab outdents;
 * Enter keeps the current line's indentation. So that Tab never traps the
 * keyboard, Escape hands it back: the next Tab moves focus as usual.
 *
 * `language="json"` checks the text as you type and shows the error with
 * its line; for anything else pass a `validator` (say, a YAML parser's).
 * No syntax highlighting — use a full editor (CodeMirror, Monaco) for that.
 *
 * @element lit-material-code-field
 *
 * @fires input - On every edit (from the inner textarea).
 * @fires change - When an edit is committed (blur).
 *
 * @cssprop --lit-material-code-field-font - Font family (default `--md-sys-typescale-code-font`, then monospace).
 * @cssprop --lit-material-code-field-font-size - Font size (default `0.875rem`).
 * @cssprop --lit-material-code-field-min-height - Smallest height (default `8lh`).
 * @cssprop --lit-material-code-field-max-height - Height before it scrolls (default `24lh`).
 *
 * @csspart field - The bordered box.
 * @csspart gutter - The line numbers.
 * @csspart textarea - The textarea.
 * @csspart error - The error text.
 */
@customElement("lit-material-code-field")
export class LitMaterialCodeField extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    }
    :host([hidden]) {
      display: none;
    }
    .label {
      display: block;
      margin-block-end: 4px;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    }
    .field {
      display: flex;
      box-sizing: border-box;
      border: 1px solid var(--md-sys-color-outline, light-dark(#79747e, #938f99));
      border-radius: var(--md-sys-shape-corner-extra-small, 4px);
      background: var(--md-sys-color-surface-container-lowest, light-dark(#ffffff, #0f0d13));
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
      font-family: var(
        --lit-material-code-field-font,
        var(--md-sys-typescale-code-font, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)
      );
      font-size: var(--lit-material-code-field-font-size, 0.875rem);
      line-height: 1.5;
      overflow: hidden;
    }
    .field:focus-within {
      border-color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      box-shadow: inset 0 0 0 1px var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    :host([invalid]) .field {
      border-color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    }
    :host([invalid]) .field:focus-within {
      box-shadow: inset 0 0 0 1px var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    }
    :host([disabled]) .field {
      opacity: 0.38;
    }
    .gutter {
      flex: none;
      box-sizing: border-box;
      min-width: 3ch;
      padding: 8px 8px 8px 12px;
      overflow: hidden;
      border-inline-end: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      text-align: end;
      white-space: pre;
      user-select: none;
      font-variant-numeric: tabular-nums;
    }
    textarea {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      min-height: var(--lit-material-code-field-min-height, 8lh);
      max-height: var(--lit-material-code-field-max-height, 24lh);
      field-sizing: content;
      margin: 0;
      padding: 8px 12px;
      border: 0;
      outline: none;
      background: transparent;
      color: inherit;
      font: inherit;
      white-space: pre;
      overflow: auto;
      resize: vertical;
      tab-size: 2;
    }
    .error {
      margin-block-start: 4px;
      color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    }
  `;

  /** The text. */
  @property() value = "";

  /** Visible label above the field. */
  @property() label = "";

  /** `"json"` validates as JSON; anything else is only a hint. */
  @property() language = "";

  /** Custom check; wins over `language`. */
  @property({ attribute: false }) validator?: CodeValidator;

  /** Spaces per indent level. */
  @property({ type: Number, attribute: "indent-size" }) indentSize = 2;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean }) readonly = false;

  /** Set while the text fails validation; reflected for styling. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  /** The current validation message, `""` when valid. */
  @state() validationMessage = "";

  @query("textarea") private readonly textarea!: HTMLTextAreaElement;

  /** After Escape, Tab moves focus instead of indenting, until the next edit. */
  private tabReleased = false;

  override focus(options?: FocusOptions): void {
    this.textarea?.focus(options);
  }

  /** Runs the validator now; `true` when valid. */
  checkValidity(): boolean {
    this.validate();
    return !this.invalid;
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("value") || changed.has("language") || changed.has("validator")) this.validate();
  }

  private validate(): void {
    const check = this.validator ?? (this.language === "json" ? validateJson : undefined);
    this.validationMessage = check ? check(this.value) : "";
    this.invalid = Boolean(this.validationMessage);
  }

  private onInput(): void {
    this.tabReleased = false;
    this.value = this.textarea.value;
  }

  private replace(start: number, end: number, text: string, selectStart: number, selectEnd: number): void {
    const area = this.textarea;
    area.setRangeText(text, start, end);
    area.setSelectionRange(selectStart, selectEnd);
    // setRangeText fires no input event; send one so listeners see the edit.
    area.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (this.readonly || this.disabled) return;
    if (event.key === "Escape") {
      this.tabReleased = true;
      return;
    }
    if (event.key === "Tab" && !this.tabReleased && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.indent(event.shiftKey);
    } else if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const { value, selectionStart: start, selectionEnd: end } = this.textarea;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, start))?.[0] ?? "";
      const caret = start + 1 + indent.length;
      this.replace(start, end, `\n${indent}`, caret, caret);
    }
  }

  private indent(outdent: boolean): void {
    const area = this.textarea;
    const { value, selectionStart: start, selectionEnd: end } = area;
    const unit = " ".repeat(this.indentSize);
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    if (!outdent && start === end) {
      this.replace(start, end, unit, start + unit.length, start + unit.length);
      return;
    }
    // Whole lines from the one holding the selection start to the one holding its end
    // (a selection ending at a line's start leaves that line alone).
    const blockEnd = end > start && value[end - 1] === "\n" ? end - 1 : end;
    const lineEnd = value.indexOf("\n", blockEnd) === -1 ? value.length : value.indexOf("\n", blockEnd);
    const lines = value.slice(lineStart, lineEnd).split("\n");
    const pattern = new RegExp(`^ {1,${this.indentSize}}|^\\t`);
    const changed = lines.map((line) => (outdent ? line.replace(pattern, "") : line ? unit + line : line));
    const firstDelta = changed[0]!.length - lines[0]!.length;
    const text = changed.join("\n");
    const newStart = Math.max(lineStart, start + firstDelta);
    const newEnd = start === end ? newStart : end + (text.length - (lineEnd - lineStart));
    this.replace(lineStart, lineEnd, text, newStart, newEnd);
  }

  private onScroll(): void {
    const gutter = this.renderRoot.querySelector<HTMLElement>(".gutter");
    if (gutter) gutter.scrollTop = this.textarea.scrollTop;
  }

  override render() {
    const lines = this.value.split("\n").length;
    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
    return html`
      ${this.label ? html`<label class="label" for="textarea">${this.label}</label>` : nothing}
      <div part="field" class="field">
        <div part="gutter" class="gutter" aria-hidden="true">${numbers}</div>
        <textarea
          part="textarea"
          id="textarea"
          .value=${this.value}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          aria-invalid=${this.invalid ? "true" : "false"}
          aria-describedby=${this.invalid ? "error" : nothing}
          aria-label=${!this.label && this.getAttribute("aria-label") ? this.getAttribute("aria-label")! : nothing}
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
          wrap="off"
          @input=${this.onInput}
          @keydown=${this.onKeyDown}
          @scroll=${this.onScroll}
          @change=${() => this.dispatchEvent(new Event("change", { bubbles: true, composed: true }))}
        ></textarea>
      </div>
      ${this.invalid ? html`<div part="error" class="error" id="error">${this.validationMessage}</div>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-code-field": LitMaterialCodeField;
  }
}
