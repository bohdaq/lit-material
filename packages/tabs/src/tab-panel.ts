import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Content for one tab. Place `lit-material-tab-panel` elements as siblings
 * after a `lit-material-tabs` (same parent): the tabs pair them with their
 * tabs by index, show the selected one, and wire `aria-labelledby` /
 * `aria-controls` between them.
 *
 * Only a `selected` panel is shown, so put `selected` on the panel that
 * matches the initial tab: server-rendered and pre-hydration markup then
 * shows the right content with no flash.
 *
 * @element lit-material-tab-panel
 *
 * @slot - The panel's content.
 */
@customElement("lit-material-tab-panel")
export class LitMaterialTabPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    :host(:not([selected])) {
      display: none;
    }

    :host(:focus-visible) {
      outline: 2px solid var(--md-sys-color-secondary, #625b71);
      outline-offset: 2px;
    }
  `;

  /** Whether this panel is shown. Managed by the preceding `lit-material-tabs`. */
  @property({ type: Boolean, reflect: true }) selected = false;

  // Same SSR-timing reason as lit-material-tabs: attributes are set in
  // willUpdate, not the constructor.
  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "tabpanel");
    // A panel is a tab stop of its own (APG tabs pattern) unless the
    // author already gave it one.
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tab-panel": LitMaterialTabPanel;
  }
}
