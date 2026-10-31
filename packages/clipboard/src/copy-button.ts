import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@lit-material/icon-button";
import { copyText } from "./copy-text.js";
import { checkIcon, copyIcon } from "./icons.js";

/** How long the check mark and "Copied" stay up. */
const FEEDBACK_MS = 2000;

/**
 * An icon button that copies text: `value`, or the value / text of the
 * element whose id is in `for`. Shows a check mark for two seconds and
 * announces "Copied" (or "Couldn't copy") to screen readers.
 *
 * @element lit-material-copy-button
 *
 * @fires copy - After a copy attempt; `detail` is `{ text, ok }`.
 */
@customElement("lit-material-copy-button")
export class LitMaterialCopyButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      position: relative;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
    .status {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;

  /** The text to copy. Takes precedence over `for`. */
  @property() value = "";

  /** Id of an element (same document or shadow root) to copy from: its `value` if it has one, else its text. */
  @property({ attribute: "for" }) htmlFor = "";

  /** Accessible name, e.g. "Copy URL". */
  @property() label = "Copy";

  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private result: "" | "ok" | "failed" = "";

  private timer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.timer);
  }

  private get text(): string {
    if (this.value) return this.value;
    if (!this.htmlFor) return "";
    const root = this.getRootNode() as Document | ShadowRoot;
    const source = root.getElementById?.(this.htmlFor) as (HTMLElement & { value?: unknown }) | null;
    if (!source) return "";
    return typeof source.value === "string" ? source.value : (source.textContent ?? "").trim();
  }

  /** Copies now; resolves whether it worked. */
  async copy(): Promise<boolean> {
    const text = this.text;
    const ok = await copyText(text);
    this.result = ok ? "ok" : "failed";
    clearTimeout(this.timer);
    this.timer = setTimeout(() => (this.result = ""), FEEDBACK_MS);
    this.dispatchEvent(new CustomEvent("copy", { bubbles: true, composed: true, detail: { text, ok } }));
    return ok;
  }

  override render() {
    return html`
      <lit-material-icon-button aria-label=${this.label} ?disabled=${this.disabled} @click=${() => void this.copy()}>
        <span slot="icon">${this.result === "ok" ? checkIcon : copyIcon}</span>
      </lit-material-icon-button>
      <span class="status" role="status">${this.result === "ok" ? "Copied" : this.result === "failed" ? "Couldn't copy" : ""}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-copy-button": LitMaterialCopyButton;
  }
}
