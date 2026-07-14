import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./slider-styles.js";

/**
 * Material Design 3 slider — a single value between `min` and `max`, built
 * on a real native `<input type="range">` for keyboard (arrows/Home/End/
 * PageUp/PageDown), pointer dragging, value clamping/stepping, and ARIA
 * slider semantics, styled invisibly on top of custom-drawn track/thumb
 * visuals — the same pattern `lit-material-checkbox`/`radio`/`switch` use.
 *
 * Single-value only; a two-thumb range slider is a deliberate scope cut for
 * this first pass (a real, distinct enough feature to be its own follow-up
 * rather than added speculatively here).
 *
 * @element lit-material-slider
 *
 * @csspart track - The full-width background track.
 * @csspart track-active - The filled portion of the track, from the start to the thumb.
 * @csspart thumb - The draggable circular thumb.
 * @csspart value-label - The value bubble shown above the thumb while focused/dragging.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 *
 * @fires input - Bubbles live as the value changes while dragging/pressing a key (matches native `<input>`).
 * @fires change - Bubbles once the value change is committed (matches native `<input>`).
 */
@customElement("lit-material-slider")
export class LitMaterialSlider extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>`. */
  static formAssociated = true;

  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ type: Number }) value = 0;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() name = "";
  @property({ reflect: true }) form?: string;

  /** Forwarded to the inner control; sliders have no visible label so this is often required. */
  @property({ attribute: "aria-label" }) ariaLabel: string | null = null;
  @property({ attribute: "aria-labelledby" }) ariaLabelledBy: string | null = null;

  @query(".native-control") private readonly inputElement?: HTMLInputElement;

  @state() private interacting = false;

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
    const stateLayer = this.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    if (stateLayer) this.ripple.attach(stateLayer);
    this.syncInternals();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("value") || changed.has("min") || changed.has("max")) {
      this.syncInternals();
    }
  }

  private get percent(): number {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    return Math.min(100, Math.max(0, ((this.value - this.min) / range) * 100));
  }

  private syncInternals(): void {
    this.internals.setFormValue(String(this.value));
  }

  override render() {
    const percent = this.percent;
    return html`
      <div class="slider ${this.interacting ? "interacting" : ""}" part="slider">
        <div class="track" part="track"></div>
        <div class="track-active" part="track-active" style="width: ${percent}%"></div>
        <div class="thumb-wrap" style="left: ${percent}%">
          <div class="value-label" part="value-label">${this.value}</div>
          <div class="state-layer" part="ripple"></div>
          <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
          <div class="thumb" part="thumb"></div>
        </div>
        <input
          class="native-control"
          part="input"
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          ?disabled=${this.disabled}
          name=${this.name || nothing}
          aria-label=${this.ariaLabel || nothing}
          aria-labelledby=${this.ariaLabelledBy || nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @pointerdown=${this.handleInteractStart}
          @pointerup=${this.handleInteractEnd}
          @pointercancel=${this.handleInteractEnd}
          @focus=${this.handleInteractStart}
          @blur=${this.handleInteractEnd}
        />
      </div>
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

  private readonly handleInteractStart = (): void => {
    this.interacting = true;
  };

  private readonly handleInteractEnd = (): void => {
    this.interacting = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-slider": LitMaterialSlider;
  }
}
