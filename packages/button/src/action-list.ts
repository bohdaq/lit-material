import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export type ActionListAlign = "start" | "end" | "between";

/**
 * A row of actions with consistent spacing: a form's Cancel and Save, a
 * toolbar's buttons, a card's links. Items wrap onto a new line when the
 * row runs out of room.
 *
 * Nest lists to group actions: a list holding lists spaces the groups wider
 * apart than the actions inside them. `label` names the row for assistive
 * technology (it becomes a `group`).
 *
 * @element lit-material-action-list
 *
 * @slot - The actions (buttons, icon buttons, links) or nested action lists.
 *
 * @cssprop --lit-material-action-list-gap - Space between actions (default `8px`, `16px` between groups, `4px` when `compact`).
 */
@customElement("lit-material-action-list")
export class LitMaterialActionList extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--lit-material-action-list-gap, 8px);
    }
    :host([hidden]) {
      display: none;
    }
    :host([grouped]) {
      gap: var(--lit-material-action-list-gap, 16px);
    }
    :host([compact]) {
      gap: var(--lit-material-action-list-gap, 4px);
    }
    /* Aligning needs the room to align in: the full width, also as an item
       of a column flexbox, or the rest of a row flexbox's line. */
    :host([align="end"]),
    :host([align="between"]) {
      flex-grow: 1;
      align-self: stretch;
    }
    :host([align="end"]) {
      justify-content: flex-end;
    }
    :host([align="between"]) {
      justify-content: space-between;
    }
  `;

  /** Where the actions sit in the row: `start`, `end` (dialogs, forms) or `between` (spread out). */
  @property({ reflect: true }) align: ActionListAlign = "start";

  /** Tighter spacing, for icon buttons. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Names the row; it then has `role="group"`. */
  @property() label = "";

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("label")) return;
    if (this.label) {
      this.setAttribute("role", "group");
      this.setAttribute("aria-label", this.label);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    }
  }

  private onSlotChange(): void {
    this.toggleAttribute("grouped", Array.from(this.children).some((el) => el instanceof LitMaterialActionList));
  }

  override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-action-list": LitMaterialActionList;
  }
}
