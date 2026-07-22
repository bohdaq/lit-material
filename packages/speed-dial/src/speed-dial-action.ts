import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./speed-dial-action-styles.js";

/**
 * A single action within a `lit-material-speed-dial` — a small (mini-FAB
 * sized) icon button with an optional visible label. Purely presentational:
 * it has no click handler of its own (a native `disabled` button already
 * never fires `click` at all) — the parent speed dial listens for the
 * bubbling click (the same `event.composedPath()` delegation
 * `lit-material-select` and `lit-material-menu` use) to close itself, the
 * same way `lit-material-menu` closes on an item click without that item
 * needing to know it's inside a menu at all.
 *
 * `label` doubles as the visible pill's fallback text and the button's
 * accessible name; the pill itself is always `aria-hidden` so the two don't
 * get announced separately. Set `label` even if you slot custom rich content
 * into `label` — otherwise the button has no accessible name at all.
 *
 * @element lit-material-speed-dial-action
 *
 * @slot icon - The action's icon.
 * @slot label - Optional visible label, shown as a pill beside the icon.
 *
 * @csspart action - The icon button.
 * @csspart label - The label pill.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-speed-dial-action")
export class LitMaterialSpeedDialAction extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ type: Boolean, reflect: true }) disabled = false;
  /** The visible pill's fallback text and the button's accessible name — see the class doc. */
  @property() label = "";

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  protected override firstUpdated(): void {
    if (this.stateLayerElement) this.ripple.attach(this.stateLayerElement);
  }

  override render() {
    return html`
      <span class="label" part="label" aria-hidden="true"><slot name="label">${this.label}</slot></span>
      <button class="action" part="action" type="button" ?disabled=${this.disabled} aria-label=${this.label || nothing}>
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <slot name="icon" class="icon"></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-speed-dial-action": LitMaterialSpeedDialAction;
  }
}
