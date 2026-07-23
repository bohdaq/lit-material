import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./code-block-styles.js";

/**
 * A monospace container for a block of source code — a filename/language
 * label, a copy-to-clipboard button, and optional truncation for long
 * snippets. Deliberately doesn't syntax-highlight: that's a real, separate
 * feature (tokenizing a specific language, shipping a grammar/theme) that
 * belongs to a dedicated highlighting library, not this component — slot in
 * pre-highlighted markup yourself if you need it, the same way a `<pre>`
 * element itself doesn't care what's inside it.
 *
 * @element lit-material-code-block
 *
 * @slot - The code content (plain text, or pre-highlighted markup from your own highlighter).
 *
 * @csspart code-block - The outer container.
 * @csspart header - The label/copy-button row. Only rendered when `label` or `copyable`.
 * @csspart label - The label text.
 * @csspart copy - The copy button.
 * @csspart pre - The `<pre>` element.
 * @csspart code - The `<code>` element.
 * @csspart expand-toggle - The "Show more"/"Show less" button. Only rendered when `expandable`.
 *
 * @fires copy - Fires after `copy()` writes the code's text to the clipboard.
 */
@customElement("lit-material-code-block")
export class LitMaterialCodeBlock extends LitElement {
  static override styles = styles;

  /** A filename or language label shown in the header (e.g. "index.ts"). */
  @property() label = "";
  @property({ type: Boolean }) copyable = true;
  @property({ type: Boolean, reflect: true }) expandable = false;

  /** Whether an `expandable` block shows its full content. Ignored otherwise. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  @state() private copied = false;

  private copiedTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.copiedTimer);
  }

  /** Writes the code's text content to the clipboard and fires `copy`. */
  async copy(): Promise<void> {
    const text = this.textContent ?? "";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    this.copied = true;
    this.dispatchEvent(new Event("copy", { bubbles: true }));
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied = false;
    }, 2000);
  }

  private readonly handleCopyClick = (): void => {
    void this.copy();
  };

  private readonly toggleExpanded = (): void => {
    this.expanded = !this.expanded;
  };

  override render() {
    const showHeader = this.label !== "" || this.copyable;

    return html`
      <div class="code-block" part="code-block">
        ${showHeader
          ? html`
              <div class="header" part="header">
                ${this.label ? html`<span class="label" part="label">${this.label}</span>` : nothing}
                ${this.copyable
                  ? html`
                      <button class="copy" part="copy" type="button" @click=${this.handleCopyClick}>
                        ${this.copied ? "Copied" : "Copy"}
                      </button>
                    `
                  : nothing}
              </div>
            `
          : nothing}
        <pre class="pre" part="pre"><code class="code" part="code"><slot></slot></code></pre>
        ${this.expandable
          ? html`
              <button class="expand-toggle" part="expand-toggle" type="button" @click=${this.toggleExpanded}>
                ${this.expanded ? "Show less" : "Show more"}
              </button>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-code-block": LitMaterialCodeBlock;
  }
}
