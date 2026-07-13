import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { RippleController } from "@lit-material/core";
import { styles } from "./select-option-styles.js";

/**
 * A single option within a `lit-material-select`. Not meaningful outside
 * that context.
 *
 * The WAI-ARIA "select-only combobox" pattern this is modeled on typically
 * uses `aria-activedescendant` (an ID reference) rather than real focus to
 * track the highlighted option — but ARIA ID references generally don't
 * cross shadow-DOM boundaries, and the trigger (in the select's shadow
 * root) and each option (in its own separate shadow root) are exactly that.
 * So instead this uses the APG's sanctioned alternative: real roving
 * `tabindex`/`focus()`, managed by the parent select — the "highlighted"
 * state is just genuine keyboard focus, styled via `:focus-visible`, not a
 * separate tracked property.
 *
 * @element lit-material-select-option
 *
 * @slot - The option's label.
 * @slot leading - An optional leading icon, replaced by a checkmark when `selected`.
 *
 * @csspart option - The row (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 */
@customElement("lit-material-select-option")
export class LitMaterialSelectOption extends LitElement {
  static override styles = styles;

  @property() value = "";
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  private readonly ripple = new RippleController(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "option");
    this.tabIndex = -1;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("selected")) {
      this.setAttribute("aria-selected", this.selected ? "true" : "false");
    }
    if (changed.has("disabled")) {
      if (this.disabled) this.setAttribute("aria-disabled", "true");
      else this.removeAttribute("aria-disabled");
    }
  }

  protected override firstUpdated(): void {
    const stateLayer = this.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    if (stateLayer) this.ripple.attach(stateLayer);
  }

  override render() {
    return html`
      <div class="option" part="option">
        <div class="state-layer" part="ripple"></div>
        ${this.selected
          ? html`
              <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M4 9.5 L7.2 12.7 L14 5.5"></path>
              </svg>
            `
          : html`<slot name="leading" class="leading"></slot>`}
        <span class="label"><slot></slot></span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-select-option": LitMaterialSelectOption;
  }
}
