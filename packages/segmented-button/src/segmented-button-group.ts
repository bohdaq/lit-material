import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LitMaterialSegmentedButton } from "./segmented-button.js";
import { styles } from "./segmented-button-group-styles.js";

/**
 * Material Design 3 segmented buttons — a connected row of
 * `lit-material-segmented-button` elements, in either single-select
 * (`multiselect` false, the default — exactly one segment selected at a
 * time, like a radio group) or multi-select (`multiselect` true — any number
 * of segments selected independently, like a group of checkboxes) mode.
 *
 * Selection is entirely driven by this group, the same way
 * `lit-material-tabs` drives its tabs' `selected`: a child's own click
 * handler never runs — the group listens for the bubbling click (via
 * `event.composedPath()`) and mutates the target segment's `selected`
 * (and, in single-select mode, clears the others) from there.
 *
 * Keyboard support follows the WAI-ARIA toolbar pattern rather than tabs'
 * automatic-activation model: `ArrowLeft`/`ArrowRight`/`Home`/`End` move a
 * roving tabindex between enabled segments without selecting them — these
 * are real `<button>`s, so Enter/Space already activates whichever one has
 * focus natively.
 *
 * @element lit-material-segmented-button-group
 *
 * @slot - `lit-material-segmented-button` elements.
 *
 * @fires change - Fires when a segment's selected state changes via user interaction.
 */
@customElement("lit-material-segmented-button-group")
export class LitMaterialSegmentedButtonGroup extends LitElement {
  static override styles = styles;

  /** When true, any number of segments may be selected at once (checkbox-like). Defaults to false (radio-like: exactly one at a time). */
  @property({ type: Boolean }) multiselect = false;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  // Not the constructor: a custom element constructor must not gain attributes per the spec's conformance
  // requirements. `willUpdate` (not `connectedCallback`) keeps this consistent with every other component here
  // that sets a role — see e.g. lit-material-linear-progress for the SSR-timing reason why.
  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncRoving();
  }

  protected override firstUpdated(): void {
    this.syncRoving();
  }

  private get buttons(): LitMaterialSegmentedButton[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during connectedCallback — degrade to no buttons rather than
    // throwing (there's no roving tabindex to compute server-side anyway).
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-segmented-button"));
  }

  private get enabledButtons(): LitMaterialSegmentedButton[] {
    return this.buttons.filter((button) => !button.disabled);
  }

  /** Marks exactly one enabled button as `active` (tabindex 0): the currently-selected one if any, else the first enabled one. */
  private syncRoving(): void {
    const buttons = this.buttons;
    if (buttons.length === 0) return;
    const target = buttons.find((button) => button.selected && !button.disabled) ?? this.enabledButtons[0];
    buttons.forEach((button) => {
      button.active = button === target;
    });
  }

  private setActive(target: LitMaterialSegmentedButton): void {
    this.buttons.forEach((button) => {
      button.active = button === target;
    });
  }

  private readonly handleSlotChange = (): void => {
    this.syncRoving();
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const button = this.buttons.find((candidate) => path.includes(candidate));
    if (!button || button.disabled) return;

    if (!this.multiselect) {
      if (button.selected) {
        this.setActive(button);
        return;
      }
      for (const candidate of this.buttons) {
        candidate.selected = candidate === button;
      }
    } else {
      button.selected = !button.selected;
    }
    this.setActive(button);
    this.dispatchEvent(new Event("change", { bubbles: true }));
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const buttons = this.enabledButtons;
    if (buttons.length === 0) return;
    const current = document.activeElement as LitMaterialSegmentedButton | null;
    const index = current ? buttons.indexOf(current) : -1;

    let target: LitMaterialSegmentedButton | undefined;
    switch (event.key) {
      case "ArrowRight":
        target = buttons[index === -1 ? 0 : (index + 1) % buttons.length];
        break;
      case "ArrowLeft":
        target = buttons[index === -1 ? buttons.length - 1 : (index - 1 + buttons.length) % buttons.length];
        break;
      case "Home":
        target = buttons[0];
        break;
      case "End":
        target = buttons[buttons.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setActive(target!);
    target!.focus();
  };

  override render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-segmented-button-group": LitMaterialSegmentedButtonGroup;
  }
}
