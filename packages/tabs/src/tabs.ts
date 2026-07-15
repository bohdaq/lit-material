import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { LitMaterialTab } from "./tab.js";
import { styles } from "./tabs-styles.js";

/**
 * Material Design 3 tabs — a horizontal row of `lit-material-tab` elements
 * with a sliding active indicator, following the WAI-ARIA tabs pattern with
 * automatic activation (moving focus with the arrow keys immediately
 * switches the selected tab, matching real Material Design tab behavior —
 * the same roving-tabindex, wrap-on-arrow-keys, activate-immediately model
 * `lit-material-radio` already uses for its group).
 *
 * Tab *panels* are deliberately out of scope: what "showing a tab's content"
 * means varies too much across real apps (a plain `<div>`, a routed view,
 * lazy-loaded content...) to bake in one scheme. Listen for `change` and
 * show/hide your own content — set `aria-controls` on each `lit-material-tab`
 * if you want full ARIA tab/tabpanel wiring to your own panel elements.
 *
 * @element lit-material-tabs
 *
 * @slot - `lit-material-tab` elements.
 *
 * @csspart tablist - The container (the tabs' row plus the divider beneath it).
 * @csspart indicator - The sliding active-tab indicator.
 *
 * @fires change - Fires when the selected tab changes via user interaction.
 */
@customElement("lit-material-tabs")
export class LitMaterialTabs extends LitElement {
  static override styles = styles;

  /** Index of the selected tab. */
  @property({ type: Number }) selected = 0;

  @query(".indicator") private readonly indicatorElement?: HTMLElement;

  private resizeObserver?: ResizeObserver;

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
      this.setAttribute("role", "tablist");
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncSelected();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    this.syncSelected();
    this.updateIndicator();
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
      this.resizeObserver.observe(this);
    }
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("selected")) {
      this.syncSelected();
      this.updateIndicator();
    }
  }

  private get tabs(): LitMaterialTab[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during connectedCallback — degrade to no tabs rather than
    // throwing (there's no layout/indicator positioning to do server-side
    // anyway).
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-tab"));
  }

  private get enabledTabs(): LitMaterialTab[] {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  private syncSelected(): void {
    this.tabs.forEach((tab, index) => {
      tab.selected = index === this.selected;
    });
  }

  private updateIndicator(): void {
    const target = this.tabs[this.selected];
    if (!target || !this.indicatorElement) return;
    const hostRect = this.getBoundingClientRect();
    const tabRect = target.getBoundingClientRect();
    this.indicatorElement.style.left = `${tabRect.left - hostRect.left}px`;
    this.indicatorElement.style.width = `${tabRect.width}px`;
  }

  private select(tab: LitMaterialTab): void {
    const index = this.tabs.indexOf(tab);
    if (index === -1 || tab.disabled) return;
    const isChange = index !== this.selected;
    this.selected = index;
    tab.focus();
    if (isChange) this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  override render() {
    return html`
      <div class="tablist" part="tablist">
        <slot @slotchange=${this.handleSlotChange}></slot>
        <div class="indicator" part="indicator"></div>
      </div>
    `;
  }

  private readonly handleSlotChange = (): void => {
    this.syncSelected();
    this.updateIndicator();
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const tab = this.tabs.find((candidate) => path.includes(candidate));
    if (tab) this.select(tab);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const tabs = this.enabledTabs;
    if (tabs.length === 0) return;
    const current = document.activeElement as LitMaterialTab | null;
    const index = current ? tabs.indexOf(current) : -1;

    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        this.select(tabs[index === -1 ? 0 : (index + 1) % tabs.length]!);
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        this.select(tabs[index === -1 ? tabs.length - 1 : (index - 1 + tabs.length) % tabs.length]!);
        break;
      }
      case "Home": {
        event.preventDefault();
        this.select(tabs[0]!);
        break;
      }
      case "End": {
        event.preventDefault();
        this.select(tabs[tabs.length - 1]!);
        break;
      }
      default:
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tabs": LitMaterialTabs;
  }
}
