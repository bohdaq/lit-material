import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FocusRingController, RippleController, setAriaElements } from "@lit-material/core";
import { styles } from "./tab-styles.js";

/**
 * A single tab within `lit-material-tabs`. Purely presentational — it has no
 * click handler of its own; the parent listens for the bubbling click (via
 * `event.composedPath()`, the same delegation pattern `lit-material-select`
 * and `lit-material-menu` use) and drives `selected`/roving `tabindex` from
 * there, the same way `lit-material-select-option`'s `selected` is entirely
 * managed by its parent.
 *
 * @element lit-material-tab
 *
 * @slot - The tab's label.
 * @slot icon - An optional icon shown above the label.
 *
 * `closable` adds a close button and lets Delete or a middle click close the
 * tab: the tab fires a cancelable `close` event and the app removes it (the
 * tab never removes itself). The button is for the pointer only and hidden
 * from assistive technology, since a button inside a tab isn't allowed;
 * keyboard users press Delete, which `aria-description` mentions.
 * `dirty` marks unsaved changes with a dot (and in the description).
 *
 * @fires close - The close button, Delete or a middle click; cancelable.
 *
 * @csspart tab - The button (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 * @csspart close - The close button.
 */
@customElement("lit-material-tab")
export class LitMaterialTab extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Adds a close button; Delete and a middle click close too. */
  @property({ type: Boolean, reflect: true }) closable = false;
  /** Marks unsaved changes. */
  @property({ type: Boolean, reflect: true }) dirty = false;
  /**
   * Id of the panel this tab shows. The button lives in this element's shadow
   * root, where an id can't reach the page, so the panel is linked through
   * ARIA element reflection (`ariaControlsElements`) where the browser has it.
   */
  @property({ attribute: "aria-controls" }) ariaControls: string | null = null;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  protected override firstUpdated(): void {
    const stateLayer = this.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    if (stateLayer) this.ripple.attach(stateLayer);
  }

  constructor() {
    super();
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("auxclick", this.handleAuxClick);
    // A middle click would otherwise start autoscroll on some systems.
    this.addEventListener("mousedown", (e) => {
      if (e.button === 1 && this.closable) e.preventDefault();
    });
  }

  /** Asks to close the tab: fires `close`; returns false when a listener cancelled it. */
  requestClose(): boolean {
    if (!this.closable || this.disabled) return false;
    return this.dispatchEvent(new Event("close", { bubbles: true, composed: true, cancelable: true }));
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Delete" && this.closable) {
      event.preventDefault();
      this.requestClose();
    }
  };

  private readonly handleAuxClick = (event: MouseEvent): void => {
    if (event.button === 1 && this.closable) {
      event.preventDefault();
      this.requestClose();
    }
  };

  private readonly handleCloseClick = (event: MouseEvent): void => {
    // Closing isn't selecting: the tabs element listens for clicks.
    event.stopPropagation();
    this.requestClose();
  };

  private description(): string {
    const parts = [];
    if (this.dirty) parts.push("Unsaved changes");
    if (this.closable) parts.push("Press Delete to close");
    return parts.join(". ");
  }

  protected override updated(): void {
    setAriaElements(this.shadowRoot!.querySelector("button"), "ariaControlsElements", this.ariaControls, this);
  }

  override render() {
    return html`
      <button
        class="tab"
        part="tab"
        type="button"
        role="tab"
        aria-selected=${this.selected ? "true" : "false"}
        tabindex=${this.selected ? "0" : "-1"}
        aria-description=${this.description() || nothing}
        ?disabled=${this.disabled}
      >
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <slot name="icon" class="icon"></slot>
        <span class="label"><slot></slot></span>
        ${this.dirty ? html`<span class="dirty" part="dirty" aria-hidden="true"></span>` : nothing}
        ${this.closable
          ? html`<span class="close" part="close" aria-hidden="true" @click=${this.handleCloseClick} @pointerdown=${(e: Event) => e.stopPropagation()}
              ><svg viewBox="0 0 24 24"><path d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6z" /></svg
            ></span>`
          : nothing}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tab": LitMaterialTab;
  }
}
