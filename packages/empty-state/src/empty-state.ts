import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./empty-state-styles.js";

/**
 * An empty state: what a view would show and how to get there, in place of
 * a blank panel — "No upstreams yet. Add one to rws.config.toml" with the
 * action beside it.
 *
 * The headline is a real heading (`level`, default 2) so it sits in the
 * page outline; the guidance text is the default slot, and buttons or links
 * go in `actions`.
 *
 * @element lit-material-empty-state
 *
 * @slot - Guidance text.
 * @slot icon - An optional illustration or icon above the headline.
 * @slot actions - Buttons or links.
 *
 * @csspart empty-state - The container.
 * @csspart headline - The heading.
 */
@customElement("lit-material-empty-state")
export class LitMaterialEmptyState extends LitElement {
  static override styles = styles;

  @property() headline = "";

  /** The heading level, 1–6. */
  @property({ type: Number }) level = 2;

  /** `compact` for inline use inside a card or table; `standard` centres it in a page area. */
  @property({ reflect: true }) size: "standard" | "compact" = "standard";

  // Empty slot areas collapse once known (after hydration on the server
  // path, which can't see light DOM; until then they only cost a gap).
  @state() private emptyIcon = false;
  @state() private emptyActions = false;

  private onSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const empty = slot.assignedNodes({ flatten: true }).length === 0;
    if (slot.name === "icon") this.emptyIcon = empty;
    else this.emptyActions = empty;
  }

  protected override firstUpdated(): void {
    for (const slot of this.renderRoot.querySelectorAll<HTMLSlotElement>("slot[name]")) {
      slot.dispatchEvent(new Event("slotchange"));
    }
  }

  override render() {
    const level = Math.min(6, Math.max(1, Math.round(this.level || 2)));
    return html`
      <div class="empty-state ${this.size}" part="empty-state">
        <div class="icon ${this.emptyIcon ? "empty" : ""}"><slot name="icon" @slotchange=${this.onSlotChange}></slot></div>
        ${this.headline
          ? html`<div class="headline" part="headline" role="heading" aria-level=${level}>${this.headline}</div>`
          : nothing}
        <div class="body"><slot></slot></div>
        <div class="actions ${this.emptyActions ? "empty" : ""}"><slot name="actions" @slotchange=${this.onSlotChange}></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-empty-state": LitMaterialEmptyState;
  }
}
