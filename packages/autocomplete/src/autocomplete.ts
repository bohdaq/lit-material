import { html, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styles } from "./autocomplete-styles.js";

export type AutocompleteVariant = "filled" | "outlined";

export interface AutocompleteOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let instanceCount = 0;

/**
 * Material Design 3-styled autocomplete — a text field that filters a
 * data-driven `options` list as the user types, following the WAI-ARIA
 * "Editable Combobox With List Autocomplete" pattern
 * (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/).
 *
 * Unlike `lit-material-select` (whose options are slotted elements, each in
 * their own shadow root, navigated via real roving focus because
 * `aria-activedescendant` ID references don't cross shadow boundaries), this
 * component keeps the input and its rendered option rows in the *same*
 * shadow root. That makes `aria-activedescendant` actually work — necessary
 * here since focus must stay on the `<input>` the whole time so typing
 * keeps working, unlike Select's button trigger which has nothing to type
 * into.
 *
 * @element lit-material-autocomplete
 *
 * @csspart container - The field container (background/border).
 * @csspart label - The floating label element.
 * @csspart input - The native `<input>` element.
 * @csspart popover - The popover surface wrapping the listbox.
 * @csspart listbox - The listbox of filtered options.
 * @csspart option - A single option row.
 * @csspart supporting - The supporting-text row.
 *
 * @fires change - Fires when the committed value changes (option picked, or
 *   free text committed when `free-text` is set).
 */
@customElement("lit-material-autocomplete")
export class LitMaterialAutocomplete extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property({ type: Array }) options: AutocompleteOption[] = [];
  @property() variant: AutocompleteVariant = "filled";
  @property() label = "";
  @property() value = "";
  @property() placeholder = "";
  @property() name = "";
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ attribute: "error-text" }) errorText = "";
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ type: Boolean, reflect: true }) open = false;
  /** When set, typed text with no matching option is committed as-is instead of being reverted. */
  @property({ attribute: "free-text", type: Boolean }) freeText = false;
  @property({ reflect: true }) form?: string;

  @query(".input") private readonly inputElement?: HTMLInputElement;
  @query(".container") private readonly containerElement?: HTMLDivElement;
  @query(".popover") private readonly popoverElement?: HTMLDivElement;

  @state() private inputText = "";
  @state() private query = "";
  @state() private activeValue?: string;
  @state() private focused = false;
  @state() private touched = false;

  private readonly internals: ElementInternals;
  private readonly labelId = `lit-material-autocomplete-label-${++instanceCount}`;
  private readonly listboxId = `lit-material-autocomplete-listbox-${instanceCount}`;
  private readonly supportingId = `lit-material-autocomplete-supporting-${instanceCount}`;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncInternals();
  }

  protected override firstUpdated(): void {
    this.popoverElement?.addEventListener("toggle", this.handleToggle as EventListener);
    this.syncInternals();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("value") || changed.has("options")) {
      this.syncInputTextFromValue();
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("open")) {
      if (this.open) {
        if (!this.popoverElement?.matches(":popover-open")) {
          this.popoverElement?.showPopover();
          this.updatePosition();
        }
      } else if (this.popoverElement?.matches(":popover-open")) {
        this.popoverElement.hidePopover();
      }
    }
    if (changed.has("value") || changed.has("required") || changed.has("error")) {
      this.syncInternals();
    }
  }

  /** All options whose label contains the in-progress search query (case-insensitive). */
  private get filteredOptions(): AutocompleteOption[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter((option) => option.label.toLowerCase().includes(q));
  }

  /** Filtered options minus disabled ones — what keyboard navigation moves across. */
  private get navigableOptions(): AutocompleteOption[] {
    return this.filteredOptions.filter((option) => !option.disabled);
  }

  private get selectedOption(): AutocompleteOption | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  private get floated(): boolean {
    return this.focused || this.inputText !== "" || this.placeholder !== "";
  }

  private get isError(): boolean {
    if (this.error) return true;
    return this.touched && this.required && this.value === "";
  }

  private get supportingMessage(): string {
    if (this.isError) return this.errorText || this.supportingText;
    return this.supportingText;
  }

  private syncInputTextFromValue(): void {
    const match = this.options.find((option) => option.value === this.value);
    if (match) {
      this.inputText = match.label;
    } else if (this.value === "") {
      this.inputText = "";
    } else if (this.freeText) {
      this.inputText = this.value;
    }
    // Otherwise `value` was set externally to something with no matching
    // option and free text isn't allowed — leave inputText as-is rather than
    // silently blanking whatever the user (or markup) put there.
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.value || null);
    if (!this.inputElement) return;
    if (this.required && this.value === "") {
      this.internals.setValidity({ valueMissing: true }, "Please choose an option.", this.inputElement);
    } else {
      this.internals.setValidity({});
    }
  }

  private updatePosition(): void {
    if (!this.containerElement || !this.popoverElement) return;
    const anchorRect = this.containerElement.getBoundingClientRect();
    const popoverRect = this.popoverElement.getBoundingClientRect();
    const gap = 4;

    let top = anchorRect.bottom + gap;
    if (top + popoverRect.height > window.innerHeight) {
      const above = anchorRect.top - gap - popoverRect.height;
      top = above >= 0 ? above : Math.max(0, window.innerHeight - popoverRect.height);
    }

    let left = anchorRect.left;
    if (left + popoverRect.width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - popoverRect.width);
    }

    this.popoverElement.style.top = `${top}px`;
    this.popoverElement.style.left = `${left}px`;
    this.popoverElement.style.width = `${Math.max(anchorRect.width, popoverRect.width)}px`;
  }

  private commitOption(option: AutocompleteOption): void {
    if (option.disabled) return;
    const changed = option.value !== this.value;
    this.value = option.value;
    this.inputText = option.label;
    this.query = "";
    this.activeValue = undefined;
    this.open = false;
    if (changed) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  /** Resolves the currently typed text on Enter/blur: exact match, free text, or revert. */
  private commitFromInputText(): void {
    const typed = this.inputText.trim();
    if (typed === "") {
      if (this.value !== "") {
        this.value = "";
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      }
      this.inputText = "";
      return;
    }
    const exact = this.options.find(
      (option) => !option.disabled && option.label.toLowerCase() === typed.toLowerCase(),
    );
    if (exact) {
      this.commitOption(exact);
      return;
    }
    if (this.freeText) {
      const changed = typed !== this.value;
      this.value = typed;
      this.inputText = typed;
      if (changed) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      return;
    }
    this.inputText = this.selectedOption?.label ?? "";
  }

  override render() {
    const isError = this.isError;
    const message = this.supportingMessage;
    const options = this.filteredOptions;
    const activeDomIndex = this.open ? options.findIndex((option) => option.value === this.activeValue) : -1;
    const activeId = activeDomIndex >= 0 ? `${this.listboxId}-option-${activeDomIndex}` : undefined;

    return html`
      <div class="autocomplete" part="autocomplete">
        <div class="container ${this.floated ? "floated" : ""} ${this.focused ? "focused" : ""}" part="container">
          ${this.label
            ? html`<label class="label" part="label" id=${this.labelId} for="input">${this.label}</label>`
            : nothing}
          <input
            class="input"
            part="input"
            id="input"
            role="combobox"
            autocomplete="off"
            .value=${this.inputText}
            placeholder=${this.placeholder || nothing}
            ?disabled=${this.disabled}
            aria-expanded=${this.open ? "true" : "false"}
            aria-controls=${this.listboxId}
            aria-autocomplete="list"
            aria-labelledby=${this.label ? this.labelId : nothing}
            aria-invalid=${isError ? "true" : nothing}
            aria-describedby=${message ? this.supportingId : nothing}
            aria-activedescendant=${activeId ?? nothing}
            name=${this.name || nothing}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
            @click=${this.handleClick}
          />
          <svg class="arrow ${this.open ? "open" : ""}" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5"></path>
          </svg>
        </div>
        <div class="popover" part="popover" popover="auto" id="${this.listboxId}-surface">
          <div class="listbox" part="listbox" role="listbox" id=${this.listboxId} aria-label=${this.label || "Options"}>
            ${options.map((option, index) => this.renderOption(option, index))}
          </div>
          ${options.length === 0 ? html`<div class="empty" part="empty">No results</div>` : nothing}
        </div>
        ${message ? html`<div class="supporting" part="supporting" id=${this.supportingId}>${message}</div>` : nothing}
      </div>
    `;
  }

  private renderOption(option: AutocompleteOption, index: number) {
    const selected = option.value === this.value;
    const active = option.value === this.activeValue;
    return html`
      <div
        class="option ${active ? "active" : ""} ${selected ? "selected" : ""} ${option.disabled ? "disabled" : ""}"
        part="option"
        role="option"
        id="${this.listboxId}-option-${index}"
        aria-selected=${selected ? "true" : "false"}
        aria-disabled=${option.disabled ? "true" : nothing}
        @mousedown=${(event: Event) => event.preventDefault()}
        @click=${() => this.commitOption(option)}
      >
        ${option.label}
      </div>
    `;
  }

  private readonly handleInput = (event: InputEvent): void => {
    const text = (event.target as HTMLInputElement).value;
    this.inputText = text;
    this.query = text;
    this.activeValue = undefined;
    if (!this.disabled) this.open = true;
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!this.open) {
          this.query = "";
          this.open = true;
          this.activeValue = this.navigableOptions[0]?.value;
          return;
        }
        const options = this.navigableOptions;
        const index = options.findIndex((option) => option.value === this.activeValue);
        const next = options[Math.min(index + 1, options.length - 1)];
        if (next) this.activeValue = next.value;
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!this.open) {
          this.query = "";
          this.open = true;
          const options = this.navigableOptions;
          this.activeValue = options[options.length - 1]?.value;
          return;
        }
        const options = this.navigableOptions;
        const index = options.findIndex((option) => option.value === this.activeValue);
        const prev = options[Math.max(index - 1, 0)];
        if (prev) this.activeValue = prev.value;
        break;
      }
      case "Enter": {
        if (!this.open) return;
        event.preventDefault();
        const active = this.navigableOptions.find((option) => option.value === this.activeValue);
        if (active) this.commitOption(active);
        else this.commitFromInputText();
        this.open = false;
        break;
      }
      case "Escape": {
        if (!this.open) return;
        event.preventDefault();
        event.stopPropagation();
        this.open = false;
        break;
      }
      default:
        break;
    }
  };

  private readonly handleFocus = (): void => {
    this.focused = true;
    if (this.disabled || this.open) return;
    this.query = "";
    this.open = true;
  };

  /**
   * A native `focus` event only fires on an actual focus change, so clicking
   * an already-focused-but-closed field (e.g. right after picking an option)
   * wouldn't reopen the dropdown through `handleFocus` alone.
   */
  private readonly handleClick = (): void => {
    if (this.disabled || this.open) return;
    this.query = "";
    this.open = true;
  };

  private readonly handleBlur = (): void => {
    this.focused = false;
    this.touched = true;
    this.commitFromInputText();
    this.open = false;
    this.syncInternals();
  };

  private readonly handleToggle = (event: ToggleEvent): void => {
    const isOpen = event.newState === "open";
    if (this.open !== isOpen) this.open = isOpen;
  };

  /** Form-associated: restore the default value when the form is reset. */
  formResetCallback(): void {
    this.value = this.getAttribute("value") ?? "";
    this.touched = false;
    this.syncInternals();
  }

  /** Form-associated: restore state after browser back/forward. */
  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? "";
  }

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-autocomplete": LitMaterialAutocomplete;
  }
}
