import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./tab-styles.js";

/**
 * A single tab within `lit-material-tabs`. Purely presentational — it has no
 * click handler of its own; the parent listens for the bubbling click (via
 * `event.composedPath()`, the same delegation pattern `lit-material-select`
 * and `lit-material-menu` use) and drives `selected`/roving `tabindex` from
 * there, the same way `lit-material-select-option`'s `selected` is entirely
 * managed by its parent.
 *
 * @element lit-material-tab
 *
 * @slot - The tab's label.
 * @slot icon - An optional icon shown above the label.
 *
 * @csspart tab - The button (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-tab")
export class LitMaterialTab extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: "aria-controls" }) ariaControls: string | null = null;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  protected override firstUpdated(): void {
    const stateLayer = this.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    if (stateLayer) this.ripple.attach(stateLayer);
  }

  override render() {
    return html`
      <button
        class="tab"
        part="tab"
        type="button"
        role="tab"
        aria-selected=${this.selected ? "true" : "false"}
        aria-controls=${this.ariaControls || nothing}
        tabindex=${this.selected ? "0" : "-1"}
        ?disabled=${this.disabled}
      >
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <slot name="icon" class="icon"></slot>
        <span class="label"><slot></slot></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tab": LitMaterialTab;
  }
}
