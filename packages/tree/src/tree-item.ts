import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./tree-item-styles.js";

const INDENT_PX = 20;
const BASE_PADDING_PX = 12;

/**
 * A single node in a `lit-material-tree` — a row (chevron if it has
 * children, optional leading icon, label) plus a `role="group"` container
 * for nested `lit-material-tree-item` children, following the WAI-ARIA
 * [Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) pattern.
 *
 * The host element itself is the focusable `role="treeitem"` (like
 * `lit-material-select-option`, not `delegatesFocus` — the parent tree needs
 * to move a real, single roving `tabindex` across arbitrarily deep nodes,
 * which is simplest done directly on each node's own host element). The
 * chevron button inside is `tabindex="-1"`: mouse/pointer-only, since
 * ArrowRight/Left on the row itself already expand/collapse from the
 * keyboard.
 *
 * Expand/collapse is self-contained (clicking the chevron toggles `expanded`
 * directly, like `lit-material-accordion-panel`) — but *selection* is owned
 * by the parent `lit-material-tree`, since single-select mode has to be able
 * to deselect a node anywhere else in the tree, not just immediate siblings.
 * Clicking the row (not the chevron) dispatches a bubbling `tree-item-select`
 * request the tree listens for; it never sets `selected` on itself.
 *
 * `depth` (and so indentation) is derived purely from DOM ancestry — how
 * many `lit-material-tree-item` ancestors this node has — not a property the
 * tree needs to sync down.
 *
 * Unlike `lit-material-accordion-panel`, this isn't meant to be used
 * standalone: `role="treeitem"` requires a `tree` or `group` role ancestor
 * per ARIA, which only a wrapping `lit-material-tree` (or another
 * `lit-material-tree-item`, whose nested-children container carries
 * `role="group"`) provides.
 *
 * @element lit-material-tree-item
 *
 * @slot label - The node's label.
 * @slot leading - An optional icon before the label.
 * @slot - Nested `lit-material-tree-item` children.
 *
 * @csspart row - The node's own row (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 * @csspart chevron - The expand/collapse button.
 * @csspart group - The container for nested children.
 *
 * @fires toggle - Fires when `expanded` changes via user interaction, with `detail: { expanded }`.
 */
@customElement("lit-material-tree-item")
export class LitMaterialTreeItem extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) expanded = false;
  /** Managed by the parent tree — never set by this element on itself. */
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly focusRing = new FocusRingController(this);
  private readonly ripple = new RippleController(this);

  // Not the constructor: a custom element constructor must not gain
  // attributes per the spec's conformance requirements, and this also needs
  // to be visible in SSR output — willUpdate runs in the same synchronous
  // pass as SSR's render, connectedCallback doesn't reliably fire there.
  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "treeitem");
    }
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "-1");
    }
    this.setAttribute("aria-selected", this.selected ? "true" : "false");
    if (this.disabled) this.setAttribute("aria-disabled", "true");
    else this.removeAttribute("aria-disabled");
    if (this.hasChildren) this.setAttribute("aria-expanded", this.expanded ? "true" : "false");
    else this.removeAttribute("aria-expanded");
  }

  protected override firstUpdated(): void {
    if (this.stateLayerElement) this.ripple.attach(this.stateLayerElement);
  }

  /** How many `lit-material-tree-item` ancestors this node has — 0 for a top-level node. */
  get depth(): number {
    let depth = 0;
    let el = this.parentElement;
    while (el && el.tagName === "LIT-MATERIAL-TREE-ITEM") {
      depth += 1;
      el = el.parentElement;
    }
    return depth;
  }

  /** Whether this node has at least one direct `lit-material-tree-item` child. */
  get hasChildren(): boolean {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelector on the
    // host during the render phase — degrade to "no children" (no chevron)
    // rather than throwing; the client-side hydration render corrects it.
    if (typeof this.querySelector !== "function") return false;
    return this.querySelector(":scope > lit-material-tree-item") !== null;
  }

  /** This node's parent node, if any — used by the tree for ArrowLeft "move to parent". */
  get parentTreeItem(): LitMaterialTreeItem | null {
    return this.parentElement?.tagName === "LIT-MATERIAL-TREE-ITEM" ? (this.parentElement as LitMaterialTreeItem) : null;
  }

  override render() {
    const hasChildren = this.hasChildren;
    return html`
      <div
        class="row ${this.selected ? "selected" : ""}"
        part="row"
        style="padding-inline-start: ${BASE_PADDING_PX + this.depth * INDENT_PX}px"
        @click=${this.handleRowClick}
      >
        <div class="state-layer" part="ripple"></div>
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        ${hasChildren
          ? html`
              <button
                class="chevron"
                part="chevron"
                type="button"
                tabindex="-1"
                aria-label=${this.expanded ? "Collapse" : "Expand"}
                @click=${this.handleChevronClick}
              >
                <svg class="chevron-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 6l6 6-6 6"></path>
                </svg>
              </button>
            `
          : html`<span class="chevron spacer"></span>`}
        <slot name="leading" class="leading"></slot>
        <span class="label" part="label"><slot name="label"></slot></span>
      </div>
      <div class="group" part="group" role="group" ?hidden=${!this.expanded}>
        <slot></slot>
      </div>
    `;
  }

  private readonly handleChevronClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (this.disabled || !this.hasChildren) return;
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent("toggle", { bubbles: true, composed: true, detail: { expanded: this.expanded } }),
    );
  };

  private readonly handleRowClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent("tree-item-select", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tree-item": LitMaterialTreeItem;
  }
}
