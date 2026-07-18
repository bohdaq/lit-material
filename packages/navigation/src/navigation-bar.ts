import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LitMaterialNavigationBarItem } from "./navigation-bar-item.js";
import { styles } from "./navigation-bar-styles.js";

/**
 * Material Design 3 navigation bar — a row of primary destinations
 * (`lit-material-navigation-bar-item` elements) sharing a bar's width
 * equally, typically docked to the bottom of the screen for compact window
 * sizes.
 *
 * Selection is index-based and managed here (like `lit-material-tabs` and
 * `lit-material-navigation-rail`): set `selected` to reflect your current
 * route/section, and each item's own `selected` is kept in sync
 * automatically. Clicking an item updates `selected` and fires `change` —
 * items themselves don't manage selection.
 *
 * Unlike `lit-material-navigation-rail`, there's no `alignment` property or
 * `fab` slot — a bottom bar is a single row of equally-shared destinations,
 * not a strip with room to position things along its length.
 *
 * @element lit-material-navigation-bar
 *
 * @slot - `lit-material-navigation-bar-item` elements.
 *
 * @csspart bar - The bar (background, height, padding).
 *
 * @fires change - Fires when `selected` changes via an item click.
 */
@customElement("lit-material-navigation-bar")
export class LitMaterialNavigationBar extends LitElement {
  static override styles = styles;

  /** Index of the selected item. `-1` means no selection. */
  @property({ type: Number }) selected = -1;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncSelected();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("selected")) this.syncSelected();
  }

  private get items(): LitMaterialNavigationBarItem[] {
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-navigation-bar-item"));
  }

  private syncSelected(): void {
    this.items.forEach((item, index) => {
      item.selected = index === this.selected;
    });
  }

  private readonly handleSlotChange = (): void => this.syncSelected();

  private readonly handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const items = this.items;
    const item = items.find((candidate) => path.includes(candidate));
    if (!item || item.disabled) return;
    const index = items.indexOf(item);
    const isChange = index !== this.selected;
    this.selected = index;
    if (isChange) this.dispatchEvent(new Event("change", { bubbles: true }));
  };

  override render() {
    return html`
      <div class="bar" part="bar">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-navigation-bar": LitMaterialNavigationBar;
  }
}
