import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isRtl } from "@lit-material/core/localize.js";
import type { LitMaterialTreeItem } from "./tree-item.js";
import { styles } from "./tree-styles.js";

/**
 * Groups `lit-material-tree-item` elements into a hierarchical tree, per the
 * WAI-ARIA [Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
 * pattern — arrow-key navigation across every *visible* node (skipping the
 * contents of collapsed branches), and single- or multi-select coordination.
 *
 * Expand/collapse is each `lit-material-tree-item`'s own concern; this only
 * owns `selected`, since single-select mode has to be able to deselect a
 * node anywhere else in the tree, not just among immediate siblings.
 *
 * @element lit-material-tree
 *
 * @slot - Top-level `lit-material-tree-item` elements.
 *
 * @csspart tree - The container.
 *
 * `reorderable` lets people drag a node among its siblings, or move the
 * focused node with Alt+Shift+ArrowUp/ArrowDown. The tree fires a cancelable
 * `reorder` event with `detail.item`, `detail.parent` (the parent tree item,
 * or null at the top level), `detail.from` and `detail.to` (indexes among the
 * siblings) and moves nothing itself: the app reorders its data and renders
 * again, keeping focus on the moved node.
 *
 * @fires change - Fires when the selection changes via user interaction.
 * @fires reorder - A node was dragged or moved by keyboard; `detail: {item, parent, from, to}`, cancelable.
 */
@customElement("lit-material-tree")
export class LitMaterialTree extends LitElement {
  static override styles = styles;

  /** Allows more than one node to be selected at once (each click toggles that node). Default: single-select. */
  @property({ type: Boolean }) multiple = false;
  /** Nodes can be dragged among their siblings, or moved with Alt+Shift+ArrowUp/Down; fires `reorder`. */
  @property({ type: Boolean, reflect: true }) reorderable = false;

  private drag?: { item: LitMaterialTreeItem; y: number; started: boolean; id: number };

  /** The siblings of `item` (its parent's direct child nodes, or the top-level ones). */
  private siblingsOf(item: LitMaterialTreeItem): LitMaterialTreeItem[] {
    const parent = item.parentElement;
    if (!parent) return [];
    return Array.from(parent.querySelectorAll(":scope > lit-material-tree-item")) as LitMaterialTreeItem[];
  }

  /** Fires `reorder` for moving `item` to index `to` among its siblings; false when cancelled or out of range. */
  requestReorder(item: LitMaterialTreeItem, to: number): boolean {
    const siblings = this.siblingsOf(item);
    const from = siblings.indexOf(item);
    if (from === -1 || to === from || to < 0 || to >= siblings.length) return false;
    return this.dispatchEvent(
      new CustomEvent("reorder", { bubbles: true, composed: true, cancelable: true, detail: { item, parent: item.parentTreeItem, from, to } }),
    );
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.reorderable || event.button !== 0) return;
    const item = event.composedPath().find((n) => (n as Element).localName === "lit-material-tree-item") as LitMaterialTreeItem | undefined;
    if (!item || item.disabled) return;
    this.drag = { item, y: event.clientY, started: false, id: event.pointerId };
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.endDrag);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.started && Math.abs(event.clientY - drag.y) < 6) return;
    drag.started = true;
    drag.item.toggleAttribute("dragging", true);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    const started = drag.started;
    this.endDrag();
    if (!started) return;
    // The drop index among the other siblings: the first whose row middle is below the pointer.
    const others = this.siblingsOf(drag.item).filter((s) => s !== drag.item);
    let to = others.findIndex((s) => {
      const row = s.shadowRoot?.querySelector(".row") ?? s;
      const r = row.getBoundingClientRect();
      return event.clientY < r.top + r.height / 2;
    });
    if (to === -1) to = others.length;
    this.requestReorder(drag.item, to);
  };

  private readonly endDrag = (): void => {
    this.drag?.item.removeAttribute("dragging");
    this.drag = undefined;
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.endDrag);
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.endDrag();
  }

  constructor() {
    super();
    this.addEventListener("tree-item-select", this.handleSelectRequest as EventListener);
    this.addEventListener("pointerdown", this.handlePointerDown);
    this.addEventListener("keydown", this.handleKeydown);
  }

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tree");
    }
    if (this.multiple) {
      this.setAttribute("aria-multiselectable", "true");
    } else {
      this.removeAttribute("aria-multiselectable");
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncTabIndex();
  }

  /** Every node in the tree, regardless of an ancestor's collapsed state. */
  private get allItems(): LitMaterialTreeItem[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during the render phase — degrade to no items rather than
    // throwing, since there's no keyboard/selection coordination to do
    // server-side anyway.
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-tree-item"));
  }

  /** Nodes actually visible right now — descends into a node's children only if it's expanded. */
  private get visibleItems(): LitMaterialTreeItem[] {
    const result: LitMaterialTreeItem[] = [];
    const walk = (container: Element): void => {
      const children = Array.from(container.querySelectorAll(":scope > lit-material-tree-item")) as LitMaterialTreeItem[];
      for (const child of children) {
        result.push(child);
        if (child.expanded) walk(child);
      }
    };
    walk(this);
    return result;
  }

  private get enabledVisibleItems(): LitMaterialTreeItem[] {
    return this.visibleItems.filter((item) => !item.disabled);
  }

  override render() {
    return html`<div class="tree" part="tree"><slot @slotchange=${this.handleSlotChange}></slot></div>`;
  }

  /** Exactly one node is `tabindex="0"` at a time (roving tabindex) — everything else is -1. */
  private syncTabIndex(target?: LitMaterialTreeItem): void {
    const items = this.allItems;
    if (items.length === 0) return;
    const tabbable = target ?? items.find((item) => item.selected) ?? this.enabledVisibleItems[0] ?? items[0]!;
    for (const item of items) {
      item.tabIndex = item === tabbable ? 0 : -1;
    }
  }

  private moveFocus(item: LitMaterialTreeItem): void {
    this.syncTabIndex(item);
    item.focus();
  }

  private readonly handleSlotChange = (): void => {
    this.syncTabIndex();
  };

  private setExpanded(item: LitMaterialTreeItem, expanded: boolean): void {
    if (item.expanded === expanded) return;
    item.expanded = expanded;
    item.dispatchEvent(new CustomEvent("toggle", { bubbles: true, composed: true, detail: { expanded } }));
  }

  private selectItem(item: LitMaterialTreeItem): void {
    if (item.disabled) return;
    let changed = false;
    if (this.multiple) {
      item.selected = !item.selected;
      changed = true;
    } else if (!item.selected) {
      for (const candidate of this.allItems) candidate.selected = candidate === item;
      changed = true;
    }
    this.moveFocus(item);
    if (changed) this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  private readonly handleSelectRequest = (event: CustomEvent): void => {
    const item = event.target as LitMaterialTreeItem;
    this.selectItem(item);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const items = this.enabledVisibleItems;
    if (items.length === 0) return;
    // Not `document.activeElement`: nodes are this element's own light-DOM
    // descendants, but `document.activeElement` retargets to the outermost
    // shadow host whenever this tree is itself used inside another
    // component's shadow root (the normal case) rather than reporting the
    // actually-focused node. `getRootNode()` — the tree this element and its
    // nodes both actually live in — resolves correctly regardless of how
    // deeply that tree itself is nested.
    const current = (this.getRootNode() as Document | ShadowRoot).activeElement as LitMaterialTreeItem | null;
    const index = current ? items.indexOf(current) : -1;
    // Right to left, the tree is indented from the right: ArrowLeft expands (inwards) and ArrowRight collapses.
    const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
    const key = horizontal && isRtl(this) ? (event.key === "ArrowLeft" ? "ArrowRight" : "ArrowLeft") : event.key;

    if (this.reorderable && current && event.altKey && event.shiftKey && (key === "ArrowUp" || key === "ArrowDown")) {
      event.preventDefault();
      const from = this.siblingsOf(current).indexOf(current);
      this.requestReorder(current, key === "ArrowUp" ? from - 1 : from + 1);
      return;
    }

    switch (key) {
      case "ArrowDown": {
        event.preventDefault();
        // Per the APG pattern, Up/Down don't wrap (unlike lit-material-tabs'
        // roving tabindex, which does).
        this.moveFocus(items[Math.min(index === -1 ? 0 : index + 1, items.length - 1)]!);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        this.moveFocus(items[Math.max(index === -1 ? items.length - 1 : index - 1, 0)]!);
        break;
      }
      case "ArrowRight": {
        if (!current || current.disabled) return;
        event.preventDefault();
        if (!current.hasChildren) return;
        if (!current.expanded) {
          this.setExpanded(current, true);
        } else {
          const first = Array.from(current.querySelectorAll(":scope > lit-material-tree-item"))[0] as
            | LitMaterialTreeItem
            | undefined;
          if (first && !first.disabled) this.moveFocus(first);
        }
        break;
      }
      case "ArrowLeft": {
        if (!current || current.disabled) return;
        event.preventDefault();
        if (current.hasChildren && current.expanded) {
          this.setExpanded(current, false);
        } else if (current.parentTreeItem) {
          this.moveFocus(current.parentTreeItem);
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        this.moveFocus(items[0]!);
        break;
      }
      case "End": {
        event.preventDefault();
        this.moveFocus(items[items.length - 1]!);
        break;
      }
      case "Enter":
      case " ": {
        if (!current || current.disabled) return;
        event.preventDefault();
        this.selectItem(current);
        break;
      }
      default:
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tree": LitMaterialTree;
  }
}
