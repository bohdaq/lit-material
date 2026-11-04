import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@lit-material/button/button.js";
import "./dialog.js";
import { LocalizeController } from "@lit-material/core/localize.js";

/**
 * An "About" dialog: the product's name and logo, its version and build
 * details, and the legal lines — what a Help → About menu item opens.
 *
 * Put the details in the default slot (a `<dl>` of Version, Build, Server
 * and so on, or a `lit-material-description-list`), the logo in `logo` and
 * copyright and trademark text in `legal`. A Close button closes it, as do
 * Escape and a click outside.
 *
 * @element lit-material-about-dialog
 *
 * @slot logo - The product's logo, shown above its name.
 * @slot - Version and build details.
 * @slot legal - Copyright, trademark and license lines, in small print.
 *
 * @fires close - After the dialog has closed.
 */
@customElement("lit-material-about-dialog")
export class LitMaterialAboutDialog extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none;
    }
    .logo::slotted(*) {
      display: block;
      max-width: 100%;
      max-height: 64px;
      margin-block-end: 8px;
    }
    .name {
      text-align: start;
    }
    .details {
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    .legal {
      display: block;
      margin-block-start: 16px;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
    }
  `;

  /** The product's name: the dialog's heading. */
  @property({ attribute: "product-name" }) productName = "";

  @property({ type: Boolean, reflect: true }) open = false;

  /** The close button's text. Default: "Close", translated. */
  @property({ attribute: "close-label" }) closeLabel?: string;

  private readonly localize = new LocalizeController(this);

  /** Opens the dialog. */
  show(): void {
    this.open = true;
  }

  /** Closes the dialog. */
  close(): void {
    this.open = false;
  }

  override render() {
    // The inner dialog's `close` is composed, so it already reaches listeners
    // on this element; only the state needs following.
    return html`<lit-material-dialog .open=${this.open} @close=${() => (this.open = false)}>
      <span slot="headline" class="name"><slot name="logo" class="logo"></slot>${this.productName}</span>
      <div class="details"><slot></slot></div>
      <slot name="legal" class="legal"></slot>
      <lit-material-button slot="actions" variant="text" @click=${() => this.close()}>
        ${this.closeLabel ?? this.localize.term("dialog.close", "Close")}
      </lit-material-button>
    </lit-material-dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-about-dialog": LitMaterialAboutDialog;
  }
}
