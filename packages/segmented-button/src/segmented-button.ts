import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./segmented-button-styles.js";

/**
 * A single segment within `lit-material-segmented-button-group`. Purely
 * presentational — like `lit-material-tab`, it has no click handler of its
 * own; the parent group listens for the bubbling click (via
 * `event.composedPath()`, the same delegation pattern `lit-material-tabs`
 * uses) and drives `selected` and the roving tabindex (`active`) from there.
 *
 * @element lit-material-segmented-button
 *
 * @slot - The segment's label.
 * @slot icon - An optional icon shown before the label. Ignored on a
 *   selected segment, which shows a checkmark in its place — the same
 *   leading-icon/checkmark swap `lit-material-chip`'s `filter` variant makes.
 *
 * @csspart button - The button (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-segmented-button")
export class LitMaterialSegmentedButton extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether this segment currently holds the group's roving tabindex.
   * Entirely managed by the parent group — don't set it directly.
   */
  @property({ type: Boolean, attribute: false }) active = false;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  protected override firstUpdated(): void {
    const stateLayer = this.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    if (stateLayer) this.ripple.attach(stateLayer);
  }

  override render() {
    const icon = this.selected
      ? html`
          <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M4 9.5 L7.2 12.7 L14 5.5"></path>
          </svg>
        `
      : html`<slot name="icon" class="icon"></slot>`;

    return html`
      <button
        class="button"
        part="button"
        type="button"
        aria-pressed=${this.selected ? "true" : "false"}
        tabindex=${this.active ? "0" : "-1"}
        ?disabled=${this.disabled}
      >
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        ${icon}
        <span class="label"><slot></slot></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-segmented-button": LitMaterialSegmentedButton;
  }
}
