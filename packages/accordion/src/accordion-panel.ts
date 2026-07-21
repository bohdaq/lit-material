import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./accordion-panel-styles.js";

let instanceCount = 0;

/**
 * A single collapsible panel — a disclosure widget (header button + content
 * region) following the WAI-ARIA
 * [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) pattern.
 * Works standalone (no wrapping `lit-material-accordion` required); grouped
 * inside one, the accordion adds single-vs-multi-expand policy and Up/Down/
 * Home/End roving focus across panel headers.
 *
 * The expand/collapse animation uses the CSS grid `0fr`/`1fr` track-size
 * trick rather than measuring `scrollHeight` in JS — it animates to the
 * content's natural height with no JS involved and no `height: auto`
 * transition (which browsers don't support animating).
 *
 * @element lit-material-accordion-panel
 *
 * @slot header - The header's label content.
 * @slot leading - An optional icon before the header label.
 * @slot - The panel's body content.
 *
 * @csspart header - The header button (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 * @csspart chevron - The expand/collapse indicator icon.
 * @csspart content - The content region.
 *
 * @fires toggle - Fires when `expanded` changes via user interaction (clicking
 *   or activating the header), with `detail: { expanded: boolean }`.
 */
@customElement("lit-material-accordion-panel")
export class LitMaterialAccordionPanel extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ type: Boolean, reflect: true }) expanded = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Renders a hairline divider below the panel — handy for a flush-stacked group without a wrapping accordion. */
  @property({ type: Boolean, reflect: true }) divider = false;

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);
  private readonly headerId = `lit-material-accordion-panel-header-${++instanceCount}`;
  private readonly contentId = `lit-material-accordion-panel-content-${instanceCount}`;

  protected override firstUpdated(): void {
    if (this.stateLayerElement) this.ripple.attach(this.stateLayerElement);
  }

  override render() {
    return html`
      <button
        class="header"
        part="header"
        type="button"
        id=${this.headerId}
        aria-expanded=${this.expanded ? "true" : "false"}
        aria-controls=${this.contentId}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <slot name="leading" class="leading"></slot>
        <span class="label"><slot name="header"></slot></span>
        <svg class="chevron" part="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5"></path>
        </svg>
      </button>
      <div class="region">
        <div class="content" part="content" id=${this.contentId} role="region" aria-labelledby=${this.headerId}>
          <div class="content-inner" ?inert=${!this.expanded}>
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  private readonly handleClick = (): void => {
    if (this.disabled) return;
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent("toggle", { bubbles: true, composed: true, detail: { expanded: this.expanded } }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-accordion-panel": LitMaterialAccordionPanel;
  }
}
