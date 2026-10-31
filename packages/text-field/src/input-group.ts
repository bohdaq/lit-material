import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * Joins fields and buttons into one control: a protocol select in front of
 * a URL, a field with a "Generate" button after it, a value and its unit.
 * Inner corners are squared and the pieces sit edge to edge.
 *
 * Works with `lit-material-text-field`, `lit-material-select` and
 * `lit-material-button` through their `--…-shape-start`/`-end` custom
 * properties; buttons grow to the 56px field height. Use outlined fields:
 * a filled one has no side borders to join.
 *
 * The host is a `role="group"`; give it an `aria-label` naming the whole,
 * e.g. "Endpoint".
 *
 * @element lit-material-input-group
 *
 * @slot - The fields and buttons, in order.
 */
@customElement("lit-material-input-group")
export class LitMaterialInputGroup extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: flex-start;
    }
    :host([hidden]) {
      display: none;
    }
    ::slotted(*) {
      position: relative;
      /* Buttons take the fields' height and corners. */
      --lit-material-button-height: 56px;
      --lit-material-button-shape: var(--md-sys-shape-corner-extra-small, 4px);
      --lit-material-select-min-width: 0;
    }
    ::slotted(lit-material-text-field) {
      flex: 1;
      min-width: 0;
      --lit-material-text-field-min-width: 0;
    }
    ::slotted(:not(:first-child)) {
      margin-inline-start: -1px;
      --lit-material-text-field-shape-start: 0;
      --lit-material-select-shape-start: 0;
      --lit-material-button-shape-start: 0;
    }
    ::slotted(:not(:last-child)) {
      --lit-material-text-field-shape-end: 0;
      --lit-material-select-shape-end: 0;
      --lit-material-button-shape-end: 0;
    }
    /* The focused piece's thicker outline goes over its neighbour's edge. */
    ::slotted(:focus-within) {
      z-index: 1;
    }
  `;

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-input-group": LitMaterialInputGroup;
  }
}
