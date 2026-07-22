import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "./simple-list-styles.js";

/**
 * Groups `lit-material-simple-list-item` elements into a native `<ul>` — a
 * plain, lightweight list of links or buttons (an in-page table of
 * contents, a settings nav), with none of `lit-material-list`'s ripple,
 * focus-ring, or leading/trailing-icon richness. Real interactive elements
 * (`<a>`/`<button>`) mean Tab and Enter already work natively, so — like
 * `lit-material-breadcrumb-item` — there's no roving-tabindex or
 * arrow-key-navigation logic here at all: reach for `lit-material-list` or
 * `lit-material-tree` instead if you need that composite-widget behavior.
 *
 * @element lit-material-simple-list
 *
 * @slot - `lit-material-simple-list-item` elements.
 *
 * @csspart list - The `<ul>`.
 */
@customElement("lit-material-simple-list")
export class LitMaterialSimpleList extends LitElement {
  static override styles = styles;

  override render() {
    return html`<ul class="list" part="list"><slot></slot></ul>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-simple-list": LitMaterialSimpleList;
  }
}
