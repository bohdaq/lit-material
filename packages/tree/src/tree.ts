import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
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
 * @fires change - Fires when the selection changes via user interaction.
 */
@customElement("lit-material-tree")
export class LitMaterialTree extends LitElement {
  static override styles = styles;

  /** Allows more than one node to be selected at once (each click toggles that node). Default: single-select. */
  @property({ type: Boolean }) multiple = false;

  constructor() {
    super();
    this.addEventListener("tree-item-select", this.handleSelectRequest as EventListener);
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

    switch (event.key) {
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
