import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { LitMaterialSelectOption } from "./select-option.js";
import { styles } from "./select-styles.js";

export type SelectVariant = "filled" | "outlined";

let instanceCount = 0;

/**
 * Material Design 3 select — a button that opens a popup listbox of
 * `lit-material-select-option` elements, following the WAI-ARIA "select-only
 * combobox" pattern (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/).
 *
 * The APG example tracks the highlighted option via `aria-activedescendant`
 * (an ID reference). That doesn't work here: the trigger lives in this
 * element's shadow root and each option is its own separate shadow root, and
 * ARIA ID references generally don't cross shadow-DOM boundaries. This uses
 * the APG's sanctioned alternative instead — real roving `tabindex`/
 * `focus()` among options, the same technique already used by
 * `lit-material-radio` and `lit-material-menu`.
 *
 * @element lit-material-select
 *
 * @slot - `lit-material-select-option` elements.
 *
 * @csspart trigger - The button that shows the current value and opens the listbox.
 * @csspart label - The floating label element.
 * @csspart listbox - The popup listbox surface.
 * @csspart supporting - The supporting-text row.
 *
 * @fires change - Fires when the selected value changes via user interaction.
 */
@customElement("lit-material-select")
export class LitMaterialSelect extends LitElement {
  static override styles = styles;

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property() variant: SelectVariant = "filled";
  @property() label = "";
  @property() value = "";
  @property() name = "";
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ attribute: "error-text" }) errorText = "";
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) form?: string;

  @query(".trigger") private readonly triggerElement?: HTMLButtonElement;
  @query(".listbox") private readonly listboxElement?: HTMLDivElement;

  @state() private touched = false;

  private readonly internals: ElementInternals;
  private readonly labelId = `lit-material-select-label-${++instanceCount}`;
  private readonly listboxId = `lit-material-select-listbox-${instanceCount}`;
  private readonly supportingId = `lit-material-select-supporting-${instanceCount}`;
  private pendingHighlightFromEnd = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.addEventListener("keydown", this.handleListboxKeydown);
    this.addEventListener("click", this.handleOptionClick);
    this.addEventListener("focusout", this.handleFocusOut);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncSelection();
    this.syncInternals();
  }

  protected override firstUpdated(): void {
    this.listboxElement?.addEventListener("toggle", this.handleListboxToggle as EventListener);
    this.syncSelection();
    this.syncInternals();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("open")) {
      if (this.open) {
        if (!this.listboxElement?.matches(":popover-open")) {
          this.listboxElement?.showPopover();
          this.updatePosition();
          const options = this.navigableOptions;
          const target = this.pendingHighlightFromEnd
            ? options[options.length - 1]
            : this.selectedOption && !this.selectedOption.disabled
              ? this.selectedOption
              : options[0];
          if (target) this.moveHighlight(target);
        }
      } else if (this.listboxElement?.matches(":popover-open")) {
        this.listboxElement.hidePopover();
      }
    }
    if (changed.has("value") || changed.has("required") || changed.has("error")) {
      this.syncSelection();
      this.syncInternals();
    }
  }

  private get options(): LitMaterialSelectOption[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during the render phase — degrade to no options rather than
    // throwing, since the initial value text is a minor SSR/hydration
    // nicety, not something SSR can fully support here anyway.
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-select-option"));
  }

  private get navigableOptions(): LitMaterialSelectOption[] {
    return this.options.filter((option) => !option.disabled);
  }

  private get selectedOption(): LitMaterialSelectOption | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  private get floated(): boolean {
    return this.open || this.value !== "";
  }

  private get isError(): boolean {
    if (this.error) return true;
    return this.touched && this.required && this.value === "";
  }

  private get supportingMessage(): string {
    if (this.isError) return this.errorText || this.supportingText;
    return this.supportingText;
  }

  private syncSelection(): void {
    for (const option of this.options) {
      option.selected = this.value !== "" && option.value === this.value;
    }
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.value || null);
    if (!this.triggerElement) return;
    if (this.required && this.value === "") {
      this.internals.setValidity({ valueMissing: true }, "Please select an option.", this.triggerElement);
    } else {
      this.internals.setValidity({});
    }
  }

  private updatePosition(): void {
    if (!this.triggerElement || !this.listboxElement) return;
    const anchorRect = this.triggerElement.getBoundingClientRect();
    const listboxRect = this.listboxElement.getBoundingClientRect();
    const gap = 4;

    let top = anchorRect.bottom + gap;
    if (top + listboxRect.height > window.innerHeight) {
      const above = anchorRect.top - gap - listboxRect.height;
      top = above >= 0 ? above : Math.max(0, window.innerHeight - listboxRect.height);
    }

    let left = anchorRect.left;
    if (left + listboxRect.width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - listboxRect.width);
    }

    this.listboxElement.style.top = `${top}px`;
    this.listboxElement.style.left = `${left}px`;
    this.listboxElement.style.width = `${Math.max(anchorRect.width, listboxRect.width)}px`;
  }

  /** Gives exactly one option a real, roving `tabindex`/focus — see class doc for why. */
  private moveHighlight(target: LitMaterialSelectOption): void {
    for (const option of this.options) {
      option.tabIndex = option === target ? 0 : -1;
    }
    target.focus();
  }

  private openAndHighlightSelection(fromEnd = false): void {
    // `this.open = true` only schedules the update that calls showPopover()
    // (Lit property setters are async) — focusing an option now, before the
    // listbox is actually visible, would silently no-op. So just remember
    // which end to highlight from and do the actual moveHighlight() once
    // `updated()` has made the listbox visible.
    this.pendingHighlightFromEnd = fromEnd;
    this.open = true;
  }

  private acceptActive(refocusTrigger: boolean): void {
    const active = this.options.find((option) => option === document.activeElement);
    if (active && !active.disabled && active.value !== this.value) {
      this.value = active.value;
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
    this.open = false;
    if (refocusTrigger) this.triggerElement?.focus();
  }

  override render() {
    const isError = this.isError;
    const message = this.supportingMessage;

    return html`
      <div class="select" part="select">
        <button
          class="trigger container ${this.floated ? "floated" : ""} ${this.open ? "focused" : ""}"
          part="trigger"
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls=${this.listboxId}
          aria-labelledby=${this.label ? this.labelId : nothing}
          aria-invalid=${isError ? "true" : nothing}
          aria-describedby=${message ? this.supportingId : nothing}
          ?disabled=${this.disabled}
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeydown}
        >
          ${this.label ? html`<span class="label" part="label" id=${this.labelId}>${this.label}</span>` : nothing}
          <span class="value">${this.selectedOption?.textContent?.trim() ?? ""}</span>
          <svg class="arrow ${this.open ? "open" : ""}" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5"></path>
          </svg>
        </button>
        <div
          class="listbox"
          part="listbox"
          role="listbox"
          id=${this.listboxId}
          popover="auto"
          aria-labelledby=${this.label ? this.labelId : nothing}
        >
          <slot @slotchange=${this.syncSelection}></slot>
        </div>
        ${message
          ? html`<div class="supporting" part="supporting" id=${this.supportingId}>${message}</div>`
          : nothing}
      </div>
    `;
  }

  private readonly handleTriggerClick = (): void => {
    if (this.disabled) return;
    if (this.open) {
      this.open = false;
      return;
    }
    this.openAndHighlightSelection();
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || this.open) return;
    const opensFromEnd = event.key === "ArrowUp" || event.key === "End";
    const opensForward = event.key === "ArrowDown" || event.key === "Enter" || event.key === " " || event.key === "Home";
    if (!opensFromEnd && !opensForward) return;
    event.preventDefault();
    // Stop this key from also reaching handleListboxKeydown (bound on the
    // host, an ancestor of this button in the bubble path): by the time it
    // would get there, `this.open` is already true (property writes apply
    // synchronously even though the render doesn't), so without this it
    // gets treated as "navigate an already-open listbox" and immediately
    // moves past the option this same keypress just highlighted.
    event.stopPropagation();
    this.openAndHighlightSelection(opensFromEnd);
  };

  private readonly handleListboxKeydown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    const options = this.navigableOptions;
    const current = document.activeElement as LitMaterialSelectOption | null;
    const index = current ? options.indexOf(current) : -1;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = options[Math.min(index + 1, options.length - 1)];
        if (next) this.moveHighlight(next);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = options[Math.max(index - 1, 0)];
        if (prev) this.moveHighlight(prev);
        break;
      }
      case "Home": {
        event.preventDefault();
        if (options[0]) this.moveHighlight(options[0]);
        break;
      }
      case "End": {
        event.preventDefault();
        if (options.length > 0) this.moveHighlight(options[options.length - 1]!);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        this.acceptActive(true);
        break;
      }
      case "Escape": {
        event.preventDefault();
        this.open = false;
        this.triggerElement?.focus();
        break;
      }
      case "Tab": {
        // Deliberately no preventDefault: Tab accepts the active option and
        // moves focus onward, per the APG pattern, rather than returning it
        // to the trigger.
        this.acceptActive(false);
        break;
      }
      default:
        break;
    }
  };

  private readonly handleOptionClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const option = this.options.find((candidate) => path.includes(candidate));
    if (option && !option.disabled) {
      this.value = option.value;
      this.dispatchEvent(new Event("change", { bubbles: true }));
      this.open = false;
      this.triggerElement?.focus();
    }
  };

  private readonly handleListboxToggle = (event: ToggleEvent): void => {
    const isOpen = event.newState === "open";
    if (this.open !== isOpen) this.open = isOpen;
  };

  private readonly handleFocusOut = (event: FocusEvent): void => {
    const related = event.relatedTarget as Node | null;
    if (related && (this.contains(related) || this.shadowRoot?.contains(related))) return;
    this.touched = true;
    this.syncInternals();
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
    "lit-material-select": LitMaterialSelect;
  }
}
