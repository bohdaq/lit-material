import { html, LitElement, nothing, svg } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./radio-styles.js";

/**
 * Material Design 3 radio button.
 *
 * Radios sharing the same `name` (and the same form owner, or none) form a
 * mutually-exclusive group: selecting one deselects the others, and the
 * group supports roving-tabindex arrow key navigation, matching native
 * `<input type="radio">` behavior. This coordination is implemented in JS
 * rather than relying on the browser's native radio grouping, because each
 * instance's real `<input>` lives in its own shadow root — browsers don't
 * group same-named radios across separate shadow trees.
 *
 * @element lit-material-radio
 *
 * @csspart radio - The container the state layer, focus ring, and ring/dot are rendered in.
 * @csspart icon - The svg containing the outer ring and, when checked, the inner dot.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 *
 * @fires change - Bubbles when this radio becomes checked via user interaction.
 */
@customElement("lit-material-radio")
export class LitMaterialRadio extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean }) required = false;
  @property() name = "";
  @property() value = "on";
  @property({ reflect: true }) form?: string;

  /** Forwarded to the inner control; radios have no visible label so this is often required. */
  @property({ attribute: "aria-label" }) ariaLabel: string | null = null;
  @property({ attribute: "aria-labelledby" }) ariaLabelledBy: string | null = null;

  @query(".native-control") private readonly inputElement?: HTMLInputElement;

  private readonly internals: ElementInternals;
  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncInternals();
  }

  protected override firstUpdated(): void {
    if (this.inputElement) {
      this.ripple.attach(this.inputElement);
    }
    this.syncInternals();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("checked") || changed.has("required") || changed.has("error")) {
      this.syncInternals();
    }
  }

  /** All radios sharing this radio's `name` and form owner, including itself, in document order. */
  private groupMembers(): LitMaterialRadio[] {
    if (!this.name) return [this];
    const root = this.getRootNode() as ParentNode;
    return Array.from(root.querySelectorAll<LitMaterialRadio>("lit-material-radio")).filter(
      (el) => el.name === this.name && el.internals.form === this.internals.form,
    );
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.checked ? this.value : null);
    if (!this.inputElement) return;
    const groupHasSelection = this.groupMembers().some((el) => el.checked);
    if (this.error) {
      this.internals.setValidity({ customError: true }, "Invalid", this.inputElement);
    } else if (this.required && !groupHasSelection) {
      this.internals.setValidity(
        { valueMissing: true },
        "Please select one of these options.",
        this.inputElement,
      );
    } else {
      this.internals.setValidity({});
    }
  }

  /** Marks this radio checked and deselects the rest of its group. No-op if already checked. */
  private select(): void {
    if (this.checked) return;
    this.checked = true;
    for (const other of this.groupMembers()) {
      if (other === this) continue;
      if (other.checked) other.checked = false;
      other.syncInternals();
    }
    this.syncInternals();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  override render() {
    const group = this.groupMembers();
    const checkedMember = group.find((el) => el.checked);
    const tabbable = checkedMember ? checkedMember === this : group[0] === this;

    return html`
      <div class="radio ${this.checked ? "checked" : ""}" part="radio">
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <div class="state-layer" part="ripple"></div>
        <svg class="icon" part="icon" viewBox="0 0 18 18" aria-hidden="true">
          <circle class="ring" cx="9" cy="9" r="8"></circle>
          ${this.checked ? svg`<circle class="dot" cx="9" cy="9" r="4.5"></circle>` : nothing}
        </svg>
        <input
          class="native-control"
          part="input"
          type="radio"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          tabindex=${tabbable ? 0 : -1}
          name=${this.name || nothing}
          value=${this.value || nothing}
          aria-required=${this.required ? "true" : nothing}
          aria-invalid=${this.error ? "true" : nothing}
          aria-label=${this.ariaLabel || nothing}
          aria-labelledby=${this.ariaLabelledBy || nothing}
          @change=${this.handleChange}
          @keydown=${this.handleKeydown}
        />
      </div>
    `;
  }

  private handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    event.stopPropagation();
    if (input.checked) this.select();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
    if (!forward && !backward) return;
    event.preventDefault();

    const group = this.groupMembers().filter((el) => !el.disabled);
    if (group.length < 2) return;
    const index = group.indexOf(this);
    const nextIndex = forward ? (index + 1) % group.length : (index - 1 + group.length) % group.length;
    const next = group[nextIndex];
    if (!next) return;
    next.select();
    next.focus();
  }

  /** Form-associated: restore the default checked state when the form is reset. */
  formResetCallback(): void {
    this.checked = this.hasAttribute("checked");
    this.syncInternals();
  }

  /** Form-associated: restore state after browser back/forward. */
  formStateRestoreCallback(state: string | null): void {
    this.checked = state !== null;
  }

  /** Delegates to the underlying ElementInternals validity (group-aware for `required`). */
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-radio": LitMaterialRadio;
  }
}
