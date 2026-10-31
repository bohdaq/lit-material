import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export type TruncatePosition = "end" | "middle";

/**
 * One line of text that ends in an ellipsis when it doesn't fit — or, with
 * `position="middle"`, keeps its last characters so long IDs, hashes, paths
 * and URLs stay recognisable at both ends: `sha256:9f86d0…0f00a08`.
 *
 * Only the display is shortened: the full text stays in the DOM, so screen
 * readers read it, find-in-page finds it and copying copies all of it. When
 * the text is cut, the host gets `truncated` and a `title` with the full
 * text, for a pointer hover.
 *
 * The text comes from `value`; it fills the width its container gives it.
 *
 * @element lit-material-truncate
 *
 * @csspart start - The part that shrinks (all of the text with `position="end"`).
 * @csspart tail - The kept end with `position="middle"`.
 */
@customElement("lit-material-truncate")
export class LitMaterialTruncate extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      min-width: 0;
      max-width: 100%;
      vertical-align: bottom;
      white-space: pre;
    }
    :host([hidden]) {
      display: none;
    }
    .start {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tail {
      flex: none;
    }
  `;

  /** The full text. */
  @property() value = "";

  /** Where the ellipsis goes. */
  @property({ reflect: true }) position: TruncatePosition = "end";

  /** With `position="middle"`, how many characters to keep at the end. */
  @property({ type: Number, attribute: "tail-length" }) tailLength = 8;

  /** Set while the text doesn't fit; reflected. */
  @property({ type: Boolean, reflect: true }) truncated = false;

  private resizeObserver?: ResizeObserver;

  /** The title we set, so one the page set is never removed. */
  private ownTitle: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver === "undefined") return;
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override updated(): void {
    if (this.resizeObserver) this.measure();
  }

  private measure(): void {
    const start = this.renderRoot.querySelector<HTMLElement>(".start");
    const truncated = !!start && start.scrollWidth > start.clientWidth;
    if (truncated !== this.truncated) this.truncated = truncated;
    const current = this.getAttribute("title");
    if (current !== null && current !== this.ownTitle) return;
    if (truncated && current !== this.value) {
      this.setAttribute("title", this.value);
      this.ownTitle = this.value;
    } else if (!truncated && current !== null) {
      this.removeAttribute("title");
      this.ownTitle = null;
    }
  }

  override render() {
    const chars = [...this.value];
    // Keep the tail only when there's more text than the tail itself.
    const split = this.position === "middle" && chars.length > this.tailLength && this.tailLength > 0;
    const start = split ? chars.slice(0, -this.tailLength).join("") : this.value;
    const tail = split ? chars.slice(-this.tailLength).join("") : "";
    return html`<span part="start" class="start">${start}</span>${split
        ? html`<span part="tail" class="tail">${tail}</span>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-truncate": LitMaterialTruncate;
  }
}
