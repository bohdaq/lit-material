import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./toolbar-styles.js";

/**
 * A row of grouped controls — search fields, filter chips, buttons — above a
 * piece of content (a data table, a list). Lays out its slotted children
 * directly as flex items (wrapping by default) rather than wrapping them in
 * its own shadow DOM structure, so any element works as a child without a
 * `lit-material-toolbar-item` wrapper being required. Pair with
 * `lit-material-toolbar-spacer` to push trailing items to the far end.
 *
 * Positioning (sticky, elevation) is left to the consumer, the same way
 * `lit-material-top-app-bar` leaves it — a toolbar shows up in enough
 * different contexts (page header, inside a card, inside a dialog) that
 * assuming one would be wrong more often than it'd help.
 *
 * @element lit-material-toolbar
 *
 * @slot - Toolbar content: buttons, chips, text fields, `lit-material-toolbar-spacer`, in order.
 */
@customElement("lit-material-toolbar")
export class LitMaterialToolbar extends LitElement {
  static override styles = styles;

  /** Tighter gap/padding, for toolbars nested inside already-dense contexts. */
  @property({ type: Boolean, reflect: true }) dense = false;

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "toolbar");
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-toolbar": LitMaterialToolbar;
  }
}
