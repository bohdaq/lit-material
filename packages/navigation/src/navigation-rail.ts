import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LitMaterialNavigationRailItem } from "./navigation-rail-item.js";
import { styles } from "./navigation-rail-styles.js";

export type NavigationRailAlignment = "top" | "center" | "bottom";

/**
 * Material Design 3 navigation rail — a narrow, always-visible vertical bar
 * of primary destinations (`lit-material-navigation-rail-item` elements),
 * typically docked to one edge for medium/large window sizes.
 *
 * Selection is index-based and managed here (like `lit-material-tabs`): set
 * `selected` to reflect your current route/section, and each item's own
 * `selected` is kept in sync automatically. Clicking an item updates
 * `selected` and fires `change` — items themselves don't manage selection.
 *
 * @element lit-material-navigation-rail
 *
 * @slot - `lit-material-navigation-rail-item` elements.
 * @slot fab - An optional FAB shown above the items.
 *
 * @csspart rail - The bar (background, width, padding).
 * @csspart fab - The fab slot's container.
 * @csspart items - The items slot's container.
 *
 * @fires change - Fires when `selected` changes via an item click.
 */
@customElement("lit-material-navigation-rail")
export class LitMaterialNavigationRail extends LitElement {
  static override styles = styles;

  /** Where the item group sits within the rail's height. */
  @property() alignment: NavigationRailAlignment = "top";

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

  private get items(): LitMaterialNavigationRailItem[] {
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-navigation-rail-item"));
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
      <div class="rail" part="rail">
        <div class="fab" part="fab"><slot name="fab"></slot></div>
        <div class="items ${this.alignment}" part="items">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-navigation-rail": LitMaterialNavigationRail;
  }
}
