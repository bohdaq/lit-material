import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./sidebar-styles.js";

export type SidebarPosition = "start" | "end";

/**
 * A two-pane layout — a fixed-width side panel next to flexible main
 * content — for things like a filter panel beside a list, distinct from
 * `lit-material-navigation`'s drawer/rail (which are app-level navigation
 * chrome, not a general content layout). Stacks to a single column via a
 * `@container` query on its own size rather than a `@media` viewport query,
 * so it collapses correctly regardless of where it's nested — a sidebar
 * embedded in a narrow column of an otherwise-wide page still stacks.
 *
 * `panelWidth` only takes effect above the stacking breakpoint; below it,
 * both panes take the full available width.
 *
 * @element lit-material-sidebar
 *
 * @slot panel - The narrower side content.
 * @slot - The main content.
 *
 * @csspart panel - The side panel's container.
 * @csspart content - The main content's container.
 */
@customElement("lit-material-sidebar")
export class LitMaterialSidebar extends LitElement {
  static override styles = styles;

  /** Which side the panel sits on (before stacking). */
  @property({ reflect: true }) position: SidebarPosition = "start";

  /** The panel's width above the stacking breakpoint. Any valid CSS length. */
  @property({ attribute: "panel-width" }) panelWidth = "20rem";

  protected override updated(changed: Map<string, unknown>): void {
    // Not willUpdate(): that runs during SSR too, where `this.style` doesn't
    // exist (see lit-material-carousel for the fuller explanation). This
    // also covers the initial value, since Lit's changed-properties map
    // includes every @property on the first update pass.
    if (changed.has("panelWidth")) {
      this.style.setProperty("--lit-material-sidebar-panel-width", this.panelWidth);
    }
  }

  override render() {
    return html`
      <div class="layout">
        <div class="panel" part="panel"><slot name="panel"></slot></div>
        <div class="content" part="content"><slot></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-sidebar": LitMaterialSidebar;
  }
}
