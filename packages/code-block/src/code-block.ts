import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { copyText } from "@lit-material/clipboard/copy-text.js";
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
 * @cssprop --lit-material-code-block-shape - Corner radius (default `--md-sys-shape-corner-small`).
 * @cssprop --lit-material-code-block-container-color - Background (default `--md-sys-color-surface-container-high`).
 * @cssprop --lit-material-code-block-font - The code's font family (default `--md-sys-typescale-code-font`, then monospace).
 * @cssprop --lit-material-code-block-font-size - The code's font size (default `0.875rem`).
 * @cssprop --lit-material-code-block-line-height - The code's line height (default `1.5`).
 * @cssprop --lit-material-code-block-label-font - The label's font family, e.g. a monospace file name (default: the header's).
 *
 * @csspart code-block - The outer container.
 * @csspart header - The label/copy-button row. Only rendered when `label` or `copyable`.
 * @csspart label - The label text.
 * @csspart copy - The copy button.
 * @csspart pre - The `<pre>` element.
 * @csspart code - The `<code>` element.
 * @csspart expand-toggle - The "Show more"/"Show less" button. Only rendered when `expandable`.
 *
 * @fires copy - Fires after `copy()` writes the code's text to the clipboard (not when copying fails).
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

  @state() private copied: "" | "ok" | "failed" = "";

  private copiedTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.copiedTimer);
  }

  /**
   * Writes the code's text content to the clipboard (with a fallback where
   * the Clipboard API is missing, e.g. plain http), fires `copy`, and
   * resolves whether it worked.
   */
  async copy(): Promise<boolean> {
    const ok = await copyText(this.textContent ?? "");
    this.copied = ok ? "ok" : "failed";
    if (ok) this.dispatchEvent(new Event("copy", { bubbles: true }));
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied = "";
    }, 2000);
    return ok;
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
                        ${this.copied === "ok" ? "Copied" : this.copied === "failed" ? "Copy failed" : "Copy"}
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
