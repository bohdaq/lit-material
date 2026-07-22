import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import type { LitMaterialSpeedDialAction } from "./speed-dial-action.js";
import { styles } from "./speed-dial-styles.js";

export type SpeedDialDirection = "up" | "down";

let instanceCount = 0;

/**
 * A FAB that expands into a column of `lit-material-speed-dial-action`
 * items — built on the native Popover API for the actions list (top-layer
 * rendering, light dismiss on outside click/Escape all come from the
 * browser), the same foundation `lit-material-menu` uses.
 *
 * The trigger's slotted icon rotates 45° while open — the classic "+"
 * becoming "×" — a purely visual CSS transform, so it only reads well if
 * your icon actually looks like a "+".
 *
 * Only vertical fanning (`direction="up"`/`"down"`) is supported — the
 * overwhelmingly common placement (corner-anchored FAB, actions fanning
 * toward the free vertical space) — not the four-directional fan some older
 * Material speed-dial implementations offered.
 *
 * @element lit-material-speed-dial
 *
 * @slot icon - The trigger's icon (rotates 45° while open).
 * @slot - `lit-material-speed-dial-action` elements, closest-to-the-trigger first.
 *
 * @csspart speed-dial - The container.
 * @csspart trigger - The main FAB button.
 * @csspart actions - The popover surface holding the actions.
 * @csspart ripple - The trigger's state-layer element.
 * @csspart focus-ring - The trigger's focus indicator element.
 *
 * @fires close - Fires after the speed dial closes, for any reason (an action's
 *   activation, `close()`, Escape, or an outside click).
 */
@customElement("lit-material-speed-dial")
export class LitMaterialSpeedDial extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) direction: SpeedDialDirection = "up";
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** The trigger's accessible name — required, since it's an icon-only button. */
  @property() label = "Actions";

  @query(".trigger") private readonly triggerElement?: HTMLButtonElement;
  @query(".actions") private readonly actionsElement?: HTMLDivElement;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);
  private readonly actionsId = `lit-material-speed-dial-actions-${++instanceCount}`;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  protected override firstUpdated(): void {
    const stateLayer = this.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    if (stateLayer) this.ripple.attach(stateLayer);
    this.actionsElement?.addEventListener("toggle", this.handleToggle as EventListener);
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) return;
    if (this.open) {
      if (!this.actionsElement?.matches(":popover-open")) {
        this.actionsElement?.showPopover();
        this.updatePosition();
      }
    } else if (this.actionsElement?.matches(":popover-open")) {
      this.actionsElement.hidePopover();
    }
  }

  /** Opens the speed dial. */
  show(): void {
    if (!this.disabled) this.open = true;
  }

  /** Closes the speed dial. */
  close(): void {
    this.open = false;
  }

  private get actions(): LitMaterialSpeedDialAction[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during the render phase — degrade to no actions rather than
    // throwing, since there's no keyboard coordination to do server-side.
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-speed-dial-action"));
  }

  private get enabledActions(): LitMaterialSpeedDialAction[] {
    return this.actions.filter((action) => !action.disabled);
  }

  private updatePosition(): void {
    if (!this.triggerElement || !this.actionsElement) return;
    const triggerRect = this.triggerElement.getBoundingClientRect();
    const actionsRect = this.actionsElement.getBoundingClientRect();
    const gap = 16;
    const isRtl = getComputedStyle(this).direction === "rtl";

    if (this.direction === "up") {
      this.actionsElement.style.top = `${triggerRect.top - actionsRect.height - gap}px`;
    } else {
      this.actionsElement.style.top = `${triggerRect.bottom + gap}px`;
    }

    // Align the actions column's inline-end edge with the trigger's inline-end
    // edge (physically: right edge in LTR, left edge in RTL) so mini-FABs
    // stack directly above/below the trigger regardless of writing direction.
    if (isRtl) {
      this.actionsElement.style.left = `${triggerRect.left}px`;
      this.actionsElement.style.removeProperty("right");
    } else {
      this.actionsElement.style.right = `${window.innerWidth - triggerRect.right}px`;
      this.actionsElement.style.removeProperty("left");
    }
  }

  override render() {
    return html`
      <div class="speed-dial" part="speed-dial">
        <div class="actions" part="actions" popover="auto" id=${this.actionsId}>
          <slot></slot>
        </div>
        <button
          class="trigger"
          part="trigger"
          type="button"
          aria-haspopup="true"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls=${this.actionsId}
          aria-label=${this.label}
          ?disabled=${this.disabled}
          @click=${this.handleTriggerClick}
        >
          <div class="state-layer" part="ripple"></div>
          <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
          <slot name="icon" class="icon"></slot>
        </button>
      </div>
    `;
  }

  private readonly handleTriggerClick = (): void => {
    if (this.disabled) return;
    this.open = !this.open;
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    if (this.actions.some((action) => path.includes(action))) {
      this.close();
    }
  };

  private readonly handleToggle = (event: ToggleEvent): void => {
    const isOpen = event.newState === "open";
    this.open = isOpen;
    if (!isOpen) {
      this.triggerElement?.focus();
      this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    const actions = this.enabledActions;
    // Not `document.activeElement`: this can be nested inside another
    // component's shadow root (the normal case), where it retargets to the
    // outermost shadow host instead of reporting the actually-focused
    // action. `getRootNode()` resolves correctly regardless of depth — each
    // action is a separate custom element (a normal light-DOM child of this
    // one), so it resolves directly to the action itself. The trigger button
    // isn't a separate element, though — it's internal to *this* element's
    // own shadow root, so when it's focused, this resolves to `this` instead
    // (not found in `actions`), giving `index = -1` — exactly the value that
    // "not on any action yet" needs below, regardless of which of the two
    // is actually true.
    const current = (this.getRootNode() as Document | ShadowRoot).activeElement;
    const index = actions.indexOf(current as LitMaterialSpeedDialAction);

    // "Forward" = from the trigger, into the list, toward its far end — matches
    // the fan direction (Up when fanning up, Down when fanning down).
    const forwardKey = this.direction === "up" ? "ArrowUp" : "ArrowDown";
    const backwardKey = this.direction === "up" ? "ArrowDown" : "ArrowUp";

    switch (event.key) {
      case forwardKey: {
        if (actions.length === 0) return;
        event.preventDefault();
        actions[index + 1]?.focus();
        break;
      }
      case backwardKey: {
        event.preventDefault();
        if (index <= 0) this.triggerElement?.focus();
        else actions[index - 1]?.focus();
        break;
      }
      case "Home": {
        if (actions.length === 0) return;
        event.preventDefault();
        actions[0]?.focus();
        break;
      }
      case "End": {
        if (actions.length === 0) return;
        event.preventDefault();
        actions[actions.length - 1]?.focus();
        break;
      }
      case "Escape": {
        event.preventDefault();
        this.close();
        this.triggerElement?.focus();
        break;
      }
      default:
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-speed-dial": LitMaterialSpeedDial;
  }
}
