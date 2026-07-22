import { css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * A flexible spacer for `lit-material-toolbar`: place one between two groups
 * of items to push everything after it to the far end of the toolbar. Has no
 * content of its own — it's purely a `flex: 1 1 auto` sizing hint.
 *
 * @element lit-material-toolbar-spacer
 */
@customElement("lit-material-toolbar-spacer")
export class LitMaterialToolbarSpacer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      flex: 1 1 auto;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-toolbar-spacer": LitMaterialToolbarSpacer;
  }
}
