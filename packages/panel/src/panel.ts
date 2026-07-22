import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./panel-styles.js";

export type PanelVariant = "default" | "bordered" | "raised";

/**
 * A generic content container with optional header and footer bands — for
 * grouping related content (a filter form, a summary card, a settings
 * section) distinctly from the page background, without the interactive
 * affordances (hover/press states, `href`) that `lit-material-card` implies.
 *
 * The header/footer slots are `display: contents` — invisible wrappers with
 * no box of their own — and the visible band (padding, border) is drawn on
 * the slotted element itself via `::slotted(*)`. So leaving either slot out
 * never leaves a stray empty band: there's nothing to hide, since nothing
 * was there to draw a box around in the first place.
 *
 * `scrollable` makes the body scroll internally instead of the whole panel
 * growing — but only does anything once the panel's own height is
 * constrained by its container (e.g. a CSS grid/flex cell), since a panel
 * has no opinion of its own about how tall it should be.
 *
 * @element lit-material-panel
 *
 * @slot header - Optional heading content.
 * @slot - The panel's main content.
 * @slot footer - Optional footer content (actions, metadata).
 *
 * @csspart header - The header band.
 * @csspart body - The main content band.
 * @csspart footer - The footer band.
 */
@customElement("lit-material-panel")
export class LitMaterialPanel extends LitElement {
  static override styles = styles;

  @property({ reflect: true }) variant: PanelVariant = "default";

  /** Scrolls the body internally instead of growing, once the panel's own height is constrained. */
  @property({ type: Boolean, reflect: true }) scrollable = false;

  override render() {
    return html`
      <slot name="header" class="header" part="header"></slot>
      <div class="body" part="body"><slot></slot></div>
      <slot name="footer" class="footer" part="footer"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-panel": LitMaterialPanel;
  }
}
