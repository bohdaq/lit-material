import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styles } from "./color-picker-styles.js";

/** A small general-purpose default palette; override via the `presets` property. */
export const DEFAULT_PRESETS: readonly string[] = [
  "#6750a4",
  "#625b71",
  "#7d5260",
  "#b3261e",
  "#006874",
  "#386a20",
  "#0061a4",
  "#984061",
  "#7c5800",
  "#1a1c18",
];

let instanceCount = 0;

function normalizeHex(value: string): string | undefined {
  const trimmed = value.trim();
  return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed.toLowerCase() : undefined;
}

/**
 * Material Design 3-styled color picker — a swatch trigger that opens a
 * popover (Popover API, the same `popover="auto"` foundation `select`/
 * `date-picker`/`search` use for their own popup surfaces) holding a preset
 * color grid plus a native `<input type="color">` for arbitrary values —
 * leaning on the platform's own color picker rather than reimplementing a
 * hue/saturation canvas from scratch.
 *
 * @element lit-material-color-picker
 *
 * @csspart trigger - The button that shows the current color and opens the panel.
 * @csspart swatch - The color swatch inside the trigger.
 * @csspart label - The label text next to the trigger swatch.
 * @csspart panel - The popover panel surface.
 * @csspart preset - Each preset swatch button.
 * @csspart custom-input - The native `<input type="color">`.
 * @csspart hex-input - The text input mirroring the hex value.
 *
 * @fires change - Fires when the committed color value changes via user interaction.
 */
@customElement("lit-material-color-picker")
export class LitMaterialColorPicker extends LitElement {
  static override styles = styles;

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property() value = "";
  @property() label = "";
  @property() name = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) form?: string;
  @property({ type: Array }) presets: readonly string[] = DEFAULT_PRESETS;

  @query(".trigger") private readonly triggerElement?: HTMLButtonElement;
  @query(".panel") private readonly panelElement?: HTMLDivElement;

  @state() private hexDraft = "";

  private readonly internals: ElementInternals;
  private readonly panelId = `lit-material-color-picker-panel-${++instanceCount}`;
  private readonly labelId = `lit-material-color-picker-label-${instanceCount}`;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncInternals();
  }

  protected override firstUpdated(): void {
    this.panelElement?.addEventListener("toggle", this.handlePanelToggle as EventListener);
    this.syncInternals();
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    // Set in willUpdate (not updated): a plain property write here is
    // reflected in the same render pass instead of scheduling another one.
    if (changed.has("value")) {
      this.hexDraft = this.value;
    }
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("value") || changed.has("required")) {
      this.syncInternals();
    }
    if (changed.has("open")) {
      if (this.open) {
        if (!this.panelElement?.matches(":popover-open")) {
          this.panelElement?.showPopover();
          this.updatePosition();
          this.moveHighlight(this.activePresetIndex);
        }
      } else if (this.panelElement?.matches(":popover-open")) {
        this.panelElement.hidePopover();
      }
    }
  }

  private get activePresetIndex(): number {
    const index = this.presets.indexOf(this.value);
    return index === -1 ? 0 : index;
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.value || null);
    if (!this.triggerElement) return;
    if (this.required && !this.value) {
      this.internals.setValidity({ valueMissing: true }, "Please choose a color.", this.triggerElement);
    } else {
      this.internals.setValidity({});
    }
  }

  private updatePosition(): void {
    if (!this.triggerElement || !this.panelElement) return;
    const anchorRect = this.triggerElement.getBoundingClientRect();
    const panelRect = this.panelElement.getBoundingClientRect();
    const gap = 4;

    let top = anchorRect.bottom + gap;
    if (top + panelRect.height > window.innerHeight) {
      const above = anchorRect.top - gap - panelRect.height;
      top = above >= 0 ? above : Math.max(0, window.innerHeight - panelRect.height);
    }

    let left = anchorRect.left;
    if (left + panelRect.width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - panelRect.width);
    }

    this.panelElement.style.top = `${top}px`;
    this.panelElement.style.left = `${left}px`;
  }

  private get presetButtons(): HTMLButtonElement[] {
    return Array.from(this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".preset") ?? []);
  }

  /** Gives exactly one preset a real, roving `tabindex`/focus — same technique as `lit-material-select`. */
  private moveHighlight(index: number): void {
    const buttons = this.presetButtons;
    buttons.forEach((button, i) => {
      button.tabIndex = i === index ? 0 : -1;
    });
    buttons[index]?.focus();
  }

  private commitValue(newValue: string, closeAndRefocus = false): void {
    const normalized = normalizeHex(newValue) ?? newValue;
    if (this.value !== normalized) {
      this.value = normalized;
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (closeAndRefocus) {
      this.open = false;
      this.triggerElement?.focus();
    }
  }

  override render() {
    const hasValue = this.value !== "";

    return html`
      <div class="color-picker" part="color-picker">
        <button
          class="trigger"
          part="trigger"
          type="button"
          aria-haspopup="dialog"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls=${this.panelId}
          aria-labelledby=${this.label ? this.labelId : nothing}
          ?disabled=${this.disabled}
          @click=${this.handleTriggerClick}
        >
          <span
            class="swatch ${hasValue ? "" : "empty"}"
            part="swatch"
            style=${hasValue ? `background-color: ${this.value}` : ""}
          ></span>
          ${this.label ? html`<span class="label" part="label" id=${this.labelId}>${this.label}</span>` : nothing}
        </button>
        <div
          class="panel"
          part="panel"
          id=${this.panelId}
          role="dialog"
          aria-label=${this.label || "Color picker"}
          popover="auto"
          @keydown=${this.handlePanelKeydown}
        >
          <div class="presets" role="listbox" aria-label="Presets">
            ${this.presets.map(
              (preset, index) => html`
                <button
                  class="preset ${this.value === preset ? "selected" : ""}"
                  part="preset"
                  type="button"
                  role="option"
                  tabindex=${index === this.activePresetIndex ? "0" : "-1"}
                  aria-selected=${this.value === preset ? "true" : "false"}
                  aria-label=${preset}
                  style="background-color: ${preset}"
                  @click=${() => this.commitValue(preset, true)}
                >
                  ${this.value === preset
                    ? html`
                        <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
                          <path d="M4 9.5 L7.2 12.7 L14 5.5"></path>
                        </svg>
                      `
                    : nothing}
                </button>
              `,
            )}
          </div>
          <div class="custom-row">
            <input
              class="custom-input"
              part="custom-input"
              type="color"
              .value=${this.value || "#000000"}
              ?disabled=${this.disabled}
              aria-label="Custom color"
              @input=${this.handleCustomInput}
              @change=${this.handleCustomChange}
            />
            <input
              class="hex-input"
              part="hex-input"
              type="text"
              spellcheck="false"
              maxlength="7"
              placeholder="#rrggbb"
              .value=${this.hexDraft}
              ?disabled=${this.disabled}
              aria-label="Hex value"
              @input=${this.handleHexInput}
              @change=${this.handleHexChange}
              @keydown=${this.handleHexKeydown}
              @blur=${this.handleHexBlur}
            />
          </div>
        </div>
      </div>
    `;
  }

  private readonly handleTriggerClick = (): void => {
    if (this.disabled) return;
    this.open = !this.open;
  };

  private readonly handlePanelKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.open = false;
      this.triggerElement?.focus();
      return;
    }

    const current = this.shadowRoot?.activeElement;
    const buttons = this.presetButtons;
    const index = buttons.indexOf(current as HTMLButtonElement);
    if (index === -1) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault();
        this.moveHighlight(Math.min(index + 1, buttons.length - 1));
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault();
        this.moveHighlight(Math.max(index - 1, 0));
        break;
      }
      case "Home": {
        event.preventDefault();
        this.moveHighlight(0);
        break;
      }
      case "End": {
        event.preventDefault();
        this.moveHighlight(buttons.length - 1);
        break;
      }
      default:
        break;
    }
  };

  private readonly handleCustomInput = (event: Event): void => {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.hexDraft = next;
  };

  private readonly handleCustomChange = (event: Event): void => {
    this.commitValue((event.target as HTMLInputElement).value);
  };

  private readonly handleHexInput = (event: Event): void => {
    this.hexDraft = (event.target as HTMLInputElement).value;
  };

  private readonly handleHexChange = (): void => {
    const normalized = normalizeHex(this.hexDraft);
    if (normalized) this.commitValue(normalized);
  };

  private readonly handleHexKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
  };

  private readonly handleHexBlur = (): void => {
    // Invalid, abandoned text reverts to the last committed value rather than lingering.
    if (!normalizeHex(this.hexDraft)) this.hexDraft = this.value;
    this.syncInternals();
  };

  private readonly handlePanelToggle = (event: ToggleEvent): void => {
    const isOpen = event.newState === "open";
    if (this.open !== isOpen) this.open = isOpen;
  };

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-color-picker": LitMaterialColorPicker;
  }
}
