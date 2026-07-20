import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styles } from "./search-bar-styles.js";

/**
 * Material Design 3 search bar — a pill-shaped text field meant to pair with
 * `lit-material-search-view`: focusing or clicking this bar is what the view
 * binds to (via its `anchor`/`anchorElement`) to open itself, the same way
 * `lit-material-tooltip` binds to whatever anchor it's given, rather than
 * this component knowing anything about the view itself.
 *
 * Unlike `lit-material-text-field`, there's no floating label or committed
 * "value changed" `change` event — a search bar is a single always-active
 * input. `value` updates (and `input` fires) on every keystroke or when the
 * clear button is clicked; pressing Enter fires `search`. That's handled
 * directly (not by re-dispatching the input's own native `search` event):
 * `<input type="search">` only fires that natively on Enter in some browsers
 * (Chromium; not Firefox or WebKit as of this writing).
 *
 * @element lit-material-search-bar
 *
 * @slot leading-icon - Overrides the default magnifying-glass icon (e.g. with a back arrow or a menu icon).
 * @slot trailing - Optional trailing content (an avatar, extra icon buttons…), shown after the clear button.
 *
 * @csspart search-bar - The pill container (background, shape, padding).
 * @csspart input - The native `<input>`.
 * @csspart clear-button - The clear button, only rendered while `value` is non-empty.
 *
 * @fires input - Fires whenever `value` changes, via typing or the clear button.
 * @fires search - Fires when Enter is pressed in the input.
 */
@customElement("lit-material-search-bar")
export class LitMaterialSearchBar extends LitElement {
  static override styles = styles;

  // Without this, focusing the inner <input> never fires a `focus` event on
  // this host element (plain shadow DOM doesn't forward descendant focus
  // that way) — and lit-material-search-view's auto-open behavior binds
  // exactly that event to whatever anchor it's given.
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property() value = "";
  @property() placeholder = "Search";
  /** Accessible name for the input, when `placeholder` alone isn't descriptive enough. Falls back to `placeholder`. */
  @property() label = "";
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query(".input") private readonly inputElement?: HTMLInputElement;

  /** Focuses the underlying `<input>`. */
  override focus(options?: FocusOptions): void {
    this.inputElement?.focus(options);
  }

  override render() {
    return html`
      <div class="search-bar" part="search-bar">
        <slot name="leading-icon" class="leading-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </slot>
        <input
          class="input"
          part="input"
          type="search"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.label || this.placeholder}
          @input=${this.handleInput}
          @keydown=${this.handleKeydown}
        />
        ${this.value
          ? html`
              <button
                class="clear"
                part="clear-button"
                type="button"
                aria-label="Clear search"
                @click=${this.handleClearClick}
              >
                <svg class="clear-icon" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M5 5 L13 13 M13 5 L5 13"></path>
                </svg>
              </button>
            `
          : nothing}
        <slot name="trailing" class="trailing"></slot>
      </div>
    `;
  }

  private readonly handleInput = (event: Event): void => {
    this.value = (event.target as HTMLInputElement).value;
    // The native `input` event already bubbles and is composed, so it's
    // observable from outside this shadow root without re-dispatching —
    // same as lit-material-text-field.
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // Not the input's native `search` event: `<input type="search">` only
    // fires it on Enter in some browsers (Chromium; not Firefox or WebKit
    // as of this writing), so Enter is handled directly here instead for
    // consistent cross-browser behavior.
    if (event.key === "Enter") {
      this.dispatchEvent(new Event("search", { bubbles: true, composed: true }));
    }
  };

  private readonly handleClearClick = (): void => {
    this.value = "";
    this.inputElement?.focus();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-search-bar": LitMaterialSearchBar;
  }
}
