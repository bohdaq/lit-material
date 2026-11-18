import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FocusRingController, RippleController, setAriaElements } from "@lit-material/core";
import { LocalizeController } from "@lit-material/core/localize.js";
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
 * `pinned` keeps a tab at the start of the row (it shows before every
 * unpinned tab, and a drag keeps pinned and unpinned tabs apart), with a pin
 * mark, a compact width and no close button; Delete and a middle click don't
 * close it. Keep pinned tabs first in your data too, so `selected` and the
 * `reorder` indexes match what people see.
 *
 * @fires close - The close button, Delete or a middle click; cancelable.
 *
 * @csspart tab - The button (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 * @csspart close - The close button.
 * @csspart pin - The pin mark of a pinned tab.
 *
 * @cssprop --lit-material-tab-pinned-label-max-width - The widest a pinned tab's label gets before it's cut (default `8rem`).
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
  /** Keeps the tab first, compact, with a pin mark and no close button. */
  @property({ type: Boolean, reflect: true }) pinned = false;
  /**
   * Id of the panel this tab shows. The button lives in this element's shadow
   * root, where an id can't reach the page, so the panel is linked through
   * ARIA element reflection (`ariaControlsElements`) where the browser has it.
   */
  @property({ attribute: "aria-controls" }) ariaControls: string | null = null;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);
  private readonly localize = new LocalizeController(this);

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
    if (!this.closable || this.disabled || this.pinned) return false;
    return this.dispatchEvent(new Event("close", { bubbles: true, composed: true, cancelable: true }));
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Delete" && this.closable && !this.pinned) {
      event.preventDefault();
      this.requestClose();
    }
  };

  private readonly handleAuxClick = (event: MouseEvent): void => {
    if (event.button === 1 && this.closable && !this.pinned) {
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
    if (this.pinned && this.dirty) return this.localize.term("tabs.pinnedUnsavedChanges", "Pinned. Unsaved changes");
    if (this.pinned) return this.localize.term("tabs.pinned", "Pinned");
    if (this.dirty && this.closable) return this.localize.term("tabs.unsavedChangesPressDeleteToClose", "Unsaved changes. Press Delete to close");
    if (this.dirty) return this.localize.term("tabs.unsavedChanges", "Unsaved changes");
    if (this.closable) return this.localize.term("tabs.pressDeleteToClose", "Press Delete to close");
    return "";
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
        ${this.pinned
          ? html`<svg class="pin" part="pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 9V4h1V2H7v2h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3" /></svg>`
          : nothing}
        <slot name="icon" class="icon"></slot>
        <span class="label"><slot></slot></span>
        ${this.dirty ? html`<span class="dirty" part="dirty" aria-hidden="true"></span>` : nothing}
        ${this.closable && !this.pinned
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
