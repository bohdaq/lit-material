import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./description-list-styles.js";

/**
 * Groups `lit-material-description-list-group` elements — metadata display
 * (a set of term/description pairs), distinct from `lit-material-list`'s
 * interactive, single-column item list and `lit-material-data-table`'s
 * columnar tabular data.
 *
 * Renders `role="list"` on a plain `<div>` rather than a native `<dl>`:
 * axe's `dl`-content-model rule checks direct-child *tag names* only (not
 * whether a custom element's own shadow root renders a conforming `<dt>`),
 * so a real `<dl>` here would fail automated a11y checks no matter what
 * `lit-material-description-list-group` renders internally — the same
 * tension `role="listitem"` already sidesteps for
 * `lit-material-breadcrumb-item` by not requiring a native `<li>`. ARIA's
 * `list`/`listitem`/`term`/`definition` roles (used across this component
 * and `lit-material-description-list-group`) are the standard fallback for
 * exactly this "can't use the native element" case.
 *
 * `horizontal` lays every group's term and description side by side in a
 * two-column grid instead of stacking description below term.
 *
 * @element lit-material-description-list
 *
 * @slot - `lit-material-description-list-group` elements.
 *
 * @csspart list - The container.
 */
@customElement("lit-material-description-list")
export class LitMaterialDescriptionList extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) horizontal = false;

  override render() {
    return html`<div class="list" part="list" role="list"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-description-list": LitMaterialDescriptionList;
  }
}
