import { html, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { FocusRingController } from "@lit-material/core";
import { styles } from "./rating-styles.js";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/**
 * A row of icons for reading or picking a value — built on a real native
 * `<input type="range">` for keyboard (arrows/Home/End/PageUp/PageDown),
 * pointer dragging, value clamping/stepping, and ARIA slider semantics,
 * styled invisibly on top of the custom-drawn icon row — the same pattern
 * `lit-material-slider` uses.
 *
 * `readonly` skips the native input entirely and renders a plain, non-
 * interactive `role="img"` display instead: a native range input has no
 * concept of "readonly" (only `disabled`, which also mutes it for assistive
 * tech and removes it from the tab order) — not what a "show a fixed rating"
 * use case wants.
 *
 * The hover-preview (showing what clicking would set before you click) is
 * this component's own addition on top of that: a pointermove listener
 * computes a preview value from cursor position, purely for the visual
 * fill — the committed `value` only ever changes through the native input's
 * own `input`/`change` events.
 *
 * @element lit-material-rating
 *
 * @csspart rating - The container.
 * @csspart icons - The row of icon elements.
 * @csspart icon - A single icon's wrapper.
 * @csspart input - The native `<input type="range">` (interactive mode only).
 *
 * @fires input - Bubbles live as the value changes while dragging/pressing a key (matches native `<input>`).
 * @fires change - Bubbles once the value change is committed (matches native `<input>`).
 */
@customElement("lit-material-rating")
export class LitMaterialRating extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>`. */
  static formAssociated = true;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 5;
  /** The smallest step a user can pick: `1` (whole icons only) or `0.5` (half icons too). Doesn't constrain `value` itself — a readonly display can show any fraction. */
  @property({ type: Number }) precision: 1 | 0.5 = 1;
  /** Non-interactive display of `value` — distinct from `disabled`: still perceivable/labeled, just not a control. */
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() name = "";
  @property({ reflect: true }) form?: string;
  /** Accessible label — required in interactive mode (there's no visible text label), and prefixed onto the readonly `role="img"` announcement. */
  @property() label = "Rating";

  @query(".icons") private readonly iconsElement?: HTMLElement;

  @state() private hoverValue?: number;

  private readonly internals: ElementInternals;
  private readonly focusRing = new FocusRingController(this);

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncInternals();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("value") || changed.has("max")) {
      this.syncInternals();
    }
  }

  private syncInternals(): void {
    this.internals.setFormValue(String(this.value));
  }

  private get displayValue(): number {
    return this.hoverValue ?? this.value;
  }

  override render() {
    const displayValue = this.displayValue;
    const icons = Array.from({ length: this.max }, (_, i) => i + 1);

    return html`
      <div
        class="rating"
        part="rating"
        role=${this.readonly ? "img" : nothing}
        aria-label=${this.readonly ? `${this.label}: ${this.value} out of ${this.max}` : nothing}
        @pointermove=${this.handlePointerMove}
        @pointerleave=${this.handlePointerLeave}
      >
        <div class="icons" part="icons" aria-hidden="true">
          ${icons.map((i) => this.renderIcon(i, displayValue))}
        </div>
        ${this.readonly
          ? nothing
          : html`
              <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
              ${this.renderInput()}
            `}
      </div>
    `;
  }

  private renderIcon(index: number, displayValue: number) {
    const fillPercent = Math.max(0, Math.min(100, (displayValue - (index - 1)) * 100));
    return html`
      <span class="icon" part="icon">
        <svg class="icon-empty" viewBox="0 0 24 24" aria-hidden="true"><path d=${STAR_PATH}></path></svg>
        <span class="icon-fill" style="width: ${fillPercent}%">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${STAR_PATH}></path></svg>
        </span>
      </span>
    `;
  }

  private renderInput() {
    return html`
      <input
        class="native-control"
        part="input"
        type="range"
        min="0"
        max=${this.max}
        step=${this.precision}
        .value=${String(this.value)}
        ?disabled=${this.disabled}
        name=${this.name || nothing}
        aria-label=${this.label}
        aria-valuetext="${this.value} out of ${this.max}"
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
    `;
  }

  private handleInput(event: InputEvent): void {
    this.value = (event.target as HTMLInputElement).valueAsNumber;
    // Native `input` is composed and already bubbles out of the shadow root on its own.
  }

  private handleChange(event: Event): void {
    this.value = (event.target as HTMLInputElement).valueAsNumber;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    event.stopPropagation();
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.disabled || this.readonly || !this.iconsElement) return;
    const rect = this.iconsElement.getBoundingClientRect();
    if (rect.width === 0) return;
    const isRtl = getComputedStyle(this).direction === "rtl";
    const fromStart = isRtl ? rect.right - event.clientX : event.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, fromStart / rect.width));
    const snapped = Math.round((ratio * this.max) / this.precision) * this.precision;
    this.hoverValue = Math.max(0, Math.min(this.max, snapped));
  };

  private readonly handlePointerLeave = (): void => {
    this.hoverValue = undefined;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-rating": LitMaterialRating;
  }
}
