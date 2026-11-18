import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isRtl, LocalizeController } from "@lit-material/core/localize.js";
import { cssProps } from "@lit-material/core/css-props.js";
import type { LitMaterialTreeItem } from "./tree-item.js";
import { styles } from "./tree-styles.js";

/** Where a moved node goes relative to `target`: just before it, just after it, or inside it (as its last child). */
export type TreeDropPlace = "before" | "after" | "inside";

/** `detail` of the `move` event. */
export interface TreeMoveDetail {
  /** The node being moved. */
  item: LitMaterialTreeItem;
  /** The node it goes before, after or into. */
  target: LitMaterialTreeItem;
  place: TreeDropPlace;
}

/** Pixels the pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 5;
/** How long a collapsed droppable node must be held over before it opens. */
const HOLD_TO_OPEN_MS = 600;
/** Distance from a scrolling container's edge where dragging scrolls it. */
const EDGE_PX = 32;
/** Same as the tree item's indentation, so the drop line starts where the label does. */
const INDENT_PX = 20;
const BASE_PADDING_PX = 12;
const CHEVRON_PX = 28;

/**
 * One live region for every tree, in <body>: inside the tree it would be a
 * status child of role="tree", which only allows treeitems and groups.
 */
let shared: { say(message: string): void } | null = null;
function announcer(): { say(message: string): void } | null {
  if (shared) return shared;
  if (typeof document === "undefined" || !document.body) return null;
  const region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.dataset.litMaterialTreeAnnouncer = "";
  region.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
  document.body.append(region);
  shared = {
    say(message: string) {
      if (!region.isConnected) document.body.append(region);
      // Clear first so the same text is announced again.
      region.textContent = "";
      requestAnimationFrame(() => (region.textContent = message));
    },
  };
  return shared;
}

/** The nearest ancestor (across shadow roots) that scrolls vertically, or the document's scroller. */
function scrollParent(from: Element): Element | null {
  let el: Element | null = from;
  while (el) {
    const overflow = getComputedStyle(el).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement ?? ((el.getRootNode() as ShadowRoot).host as Element | undefined) ?? null;
  }
  return document.scrollingElement;
}

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
 * @csspart drop-line - The line showing where a dragged node lands.
 * @csspart drag-ghost - The label that follows the pointer while dragging.
 *
 * `reorderable` turns on drag and drop: drag a node (after the pointer moves
 * 5 px) before or after any other node, or into a node marked `droppable`;
 * a line or a highlighted row shows where it lands, the nearest scrolling
 * container scrolls at its edges, a collapsed droppable node held over opens,
 * and Escape cancels. From the keyboard, Alt+ArrowUp/ArrowDown move the
 * focused node past its neighbour, Alt+ArrowLeft moves it out of its parent
 * (after it) and Alt+ArrowRight into the droppable node above it (horizontal
 * keys flip right to left). Each move is announced.
 *
 * The tree fires a cancelable `move` event with `detail.item`,
 * `detail.target` and `detail.place` (`"before"`, `"after"` or `"inside"`,
 * meaning the last child of `target`) and moves nothing itself: the app moves
 * its data and renders again (keep nodes keyed, e.g. with `repeat`); focus
 * stays on the moved node. When the node stays among its siblings and `move`
 * isn't cancelled, the older `reorder` event follows (`detail: {item, parent,
 * from, to}`); handle one of the two. Alt+Shift+ArrowUp/ArrowDown still fire
 * only `reorder`.
 *
 * @fires change - Fires when the selection changes via user interaction.
 * @fires move - A node was dropped or moved by keyboard; `detail: {item, target, place}` (`TreeMoveDetail`), cancelable.
 * @fires reorder - A node moved among its siblings; `detail: {item, parent, from, to}`, cancelable. Follows an uncancelled same-parent `move`.
 */
@customElement("lit-material-tree")
export class LitMaterialTree extends LitElement {
  static override styles = styles;

  /** Allows more than one node to be selected at once (each click toggles that node). Default: single-select. */
  @property({ type: Boolean }) multiple = false;
  /** Nodes can be dragged and dropped, or moved with Alt+Arrow keys; fires `move` (and `reorder`). */
  @property({ type: Boolean, reflect: true }) reorderable = false;

  /** The last move announced to screen readers (read by tests). */
  announcement = "";

  @state() private line: { top: number; start: number } | null = null;
  @state() private ghost: { x: number; y: number; label: string } | null = null;

  private readonly localize = new LocalizeController(this);

  private drag?: {
    item: LitMaterialTreeItem;
    x: number;
    y: number;
    started: boolean;
    id: number;
    target: { target: LitMaterialTreeItem; place: TreeDropPlace } | null;
    lastX: number;
    lastY: number;
    scroller: Element | null;
  };
  private holdTimer?: ReturnType<typeof setTimeout>;
  private scrollFrame = 0;

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

  /** Whether `item` can go `place` relative to `target`: not onto or into itself, `inside` only a droppable node. */
  canMove(item: LitMaterialTreeItem, target: LitMaterialTreeItem, place: TreeDropPlace): boolean {
    if (item === target || item.contains(target)) return false;
    if (place === "inside") return target.droppable && !target.disabled;
    // Already there: right before its next sibling, or right after its previous one.
    const siblings = this.siblingsOf(target);
    if (target.parentElement === item.parentElement) {
      const at = siblings.indexOf(target);
      const from = siblings.indexOf(item);
      if ((place === "before" && at === from + 1) || (place === "after" && at === from - 1)) return false;
    }
    return true;
  }

  /**
   * Asks to move `item` `place` relative to `target`: fires `move`, then `reorder` when it stays among its
   * siblings. Returns false when the move isn't possible or a listener cancelled it.
   */
  requestMove(item: LitMaterialTreeItem, target: LitMaterialTreeItem, place: TreeDropPlace): boolean {
    if (!this.canMove(item, target, place)) return false;
    const detail: TreeMoveDetail = { item, target, place };
    const hadFocus = (this.getRootNode() as Document | ShadowRoot).activeElement === item;
    if (!this.dispatchEvent(new CustomEvent("move", { bubbles: true, composed: true, cancelable: true, detail }))) return false;
    if (place !== "inside" && target.parentElement === item.parentElement) {
      const others = this.siblingsOf(item).filter((s) => s !== item);
      const at = others.indexOf(target);
      this.requestReorder(item, place === "before" ? at : at + 1);
    }
    const label = (n: LitMaterialTreeItem) => this.labelOf(n);
    const args = { item: label(item), target: label(target) };
    this.announce(
      place === "before"
        ? this.localize.term("tree.movedBefore", "{item} moved before {target}", args)
        : place === "after"
          ? this.localize.term("tree.movedAfter", "{item} moved after {target}", args)
          : this.localize.term("tree.movedInside", "{item} moved into {target}", args),
    );
    this.afterMove(item, hadFocus);
    return true;
  }

  private announce(message: string): void {
    this.announcement = message;
    announcer()?.say(message);
  }

  /**
   * The app moves the node on `move`; moving a focused element out of the DOM drops its focus. Once the app
   * has rendered, keep focus (and the roving tabindex) on it, and refresh every node's position facts.
   */
  private afterMove(item: LitMaterialTreeItem, hadFocus: boolean): void {
    requestAnimationFrame(() => {
      for (const node of this.allItems) node.syncPosition?.();
      if (hadFocus && item.isConnected && this.contains(item)) this.moveFocus(item);
    });
  }

  private labelOf(item: LitMaterialTreeItem): string {
    return (item.querySelector(':scope > [slot="label"]')?.textContent ?? "").trim();
  }

  // ---- Pointer drag ----

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.reorderable || event.button !== 0 || this.drag) return;
    const path = event.composedPath();
    const item = path.find((n) => (n as Element).localName === "lit-material-tree-item") as LitMaterialTreeItem | undefined;
    if (!item || item.disabled) return;
    // Hover actions and the chevron are buttons, not handles.
    if (path.some((n) => (n as Element).localName === "button" || (n as Element).localName === "input")) return;
    this.drag = {
      item,
      x: event.clientX,
      y: event.clientY,
      started: false,
      id: event.pointerId,
      target: null,
      lastX: event.clientX,
      lastY: event.clientY,
      scroller: null,
    };
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.endDrag);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.started) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < DRAG_THRESHOLD) return;
      drag.started = true;
      drag.item.toggleAttribute("dragging", true);
      drag.scroller = scrollParent(this);
      window.addEventListener("keydown", this.handleDragKeydown, true);
    }
    event.preventDefault();
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    this.ghost = { x: event.clientX, y: event.clientY, label: this.labelOf(drag.item) };
    this.aim();
    this.autoScroll();
  };

  /** The drop place at `y` (viewport) for `item`, or null. */
  dropPlaceAt(item: LitMaterialTreeItem | null, y: number): { target: LitMaterialTreeItem; place: TreeDropPlace } | null {
    const rows = this.visibleItems;
    if (rows.length === 0) return null;
    const rowOf = (n: LitMaterialTreeItem) => (n.shadowRoot?.querySelector(".row") ?? n).getBoundingClientRect();
    let target: LitMaterialTreeItem | undefined;
    let place: TreeDropPlace;
    const first = rowOf(rows[0]!);
    const hit = rows.find((n) => {
      const r = rowOf(n);
      return y >= r.top && y < r.bottom;
    });
    if (hit) {
      target = hit;
      const r = rowOf(hit);
      const f = (y - r.top) / Math.max(r.height, 1);
      if (hit.droppable) {
        const open = hit.expanded && hit.hasChildren;
        place = f < 0.25 ? "before" : f > 0.75 && !open ? "after" : "inside";
      } else {
        place = f < 0.5 ? "before" : "after";
      }
    } else if (y < first.top) {
      target = rows[0]!;
      place = "before";
    } else {
      // Below every row: the end of the top level.
      const top = this.siblingsOf(rows[0]!);
      target = top[top.length - 1]!;
      place = "after";
    }
    if (item && !this.canMove(item, target, place)) return null;
    return { target, place };
  }

  /** Shows where something dropped now would land (`null` hides it); for apps accepting a drag from elsewhere. */
  showDropIndicator(drop: { target: LitMaterialTreeItem; place: TreeDropPlace } | null): void {
    for (const n of this.allItems) if (n.hasAttribute("drop-target")) n.removeAttribute("drop-target");
    if (!drop) {
      this.line = null;
      return;
    }
    if (drop.place === "inside") {
      drop.target.toggleAttribute("drop-target", true);
      this.line = null;
      return;
    }
    const row = (drop.target.shadowRoot?.querySelector(".row") ?? drop.target).getBoundingClientRect();
    const host = this.getBoundingClientRect();
    const top = (drop.place === "before" ? row.top : row.bottom) - host.top;
    this.line = { top, start: BASE_PADDING_PX + drop.target.depth * INDENT_PX + CHEVRON_PX };
  }

  private aim(): void {
    const drag = this.drag;
    if (!drag) return;
    const drop = this.dropPlaceAt(drag.item, drag.lastY);
    const changed = drop?.target !== drag.target?.target || drop?.place !== drag.target?.place;
    drag.target = drop;
    this.showDropIndicator(drop);
    if (!changed) return;
    clearTimeout(this.holdTimer);
    const held = drop?.place === "inside" && !drop.target.expanded && drop.target.hasChildren ? drop.target : null;
    if (held) {
      this.holdTimer = setTimeout(() => {
        if (this.drag?.target?.target === held && this.drag.target.place === "inside") this.setExpanded(held, true);
      }, HOLD_TO_OPEN_MS);
    }
  }

  private autoScroll(): void {
    if (this.scrollFrame) return;
    const step = () => {
      this.scrollFrame = 0;
      const drag = this.drag;
      if (!drag?.started || !drag.scroller) return;
      const el = drag.scroller;
      const page = el === document.scrollingElement;
      const r = page ? { top: 0, bottom: window.innerHeight } : el.getBoundingClientRect();
      let dy = 0;
      if (drag.lastY < r.top + EDGE_PX) dy = -Math.ceil((r.top + EDGE_PX - drag.lastY) / 4);
      else if (drag.lastY > r.bottom - EDGE_PX) dy = Math.ceil((drag.lastY - (r.bottom - EDGE_PX)) / 4);
      if (dy === 0) return;
      const before = el.scrollTop;
      el.scrollTop = before + dy;
      if (el.scrollTop === before) return;
      this.aim();
      this.scrollFrame = requestAnimationFrame(step);
    };
    this.scrollFrame = requestAnimationFrame(step);
  }

  private readonly handleDragKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.drag?.started) return;
    event.preventDefault();
    event.stopPropagation();
    this.endDrag();
    this.announce(this.localize.term("tree.moveCancelled", "Move cancelled"));
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    const started = drag.started;
    if (started) {
      drag.lastY = event.clientY;
      this.aim();
    }
    const drop = drag.target;
    this.endDrag();
    if (!started) return;
    // The click that ends a drag selects nothing.
    const swallow = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallow, true), 0);
    if (drop) this.requestMove(drag.item, drop.target, drop.place);
  };

  /** Stops a pointer drag without dropping (also what Escape does). */
  readonly endDrag = (): void => {
    this.drag?.item.removeAttribute("dragging");
    this.drag = undefined;
    clearTimeout(this.holdTimer);
    if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = 0;
    if (this.line || this.ghost) {
      this.ghost = null;
      this.showDropIndicator(null);
    }
    if (typeof window === "undefined") return;
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.endDrag);
    window.removeEventListener("keydown", this.handleDragKeydown, true);
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
    // Tells keyboard users how to move nodes (unless the page describes the tree itself).
    const hint = this.localize.term("tree.moveHint", "Alt+arrow keys move the focused item");
    const described = this.getAttribute("aria-description");
    if (this.reorderable && (described === null || described === this.hintShown)) {
      this.setAttribute("aria-description", hint);
      this.hintShown = hint;
    } else if (!this.reorderable && this.hintShown !== undefined && described === this.hintShown) {
      this.removeAttribute("aria-description");
      this.hintShown = undefined;
    }
  }

  private hintShown?: string;

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
        if (child.hidden) continue;
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
    const rtl = this.line || this.ghost ? isRtl(this) : false;
    return html`<div class="tree" part="tree"><slot @slotchange=${this.handleSlotChange}></slot></div>
      <div
        class="drop-line"
        part="drop-line"
        aria-hidden="true"
        ?hidden=${!this.line}
        style=${cssProps({ top: this.line ? `${this.line.top - 1}px` : null, insetInlineStart: this.line ? `${this.line.start}px` : null })}
      ></div>
      <div
        class="ghost ${rtl ? "rtl" : ""}"
        part="drag-ghost"
        aria-hidden="true"
        ?hidden=${!this.ghost}
        style=${cssProps({ left: this.ghost ? `${this.ghost.x + (rtl ? -12 : 12)}px` : null, top: this.ghost ? `${this.ghost.y + 8}px` : null })}
      >${this.ghost?.label ?? ""}</div>`;
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
    // Positions shift when top-level nodes come and go (nested ones re-sync in their own update).
    for (const item of this.allItems) item.syncPosition?.();
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

  /** Alt+Arrow keys: past a neighbour, out of the parent, or into the droppable node above. */
  private moveByKey(current: LitMaterialTreeItem, key: string): void {
    const siblings = this.siblingsOf(current).filter((s) => !s.hidden);
    const at = siblings.indexOf(current);
    let done = false;
    if (key === "ArrowUp" && at > 0) done = this.requestMove(current, siblings[at - 1]!, "before");
    else if (key === "ArrowDown" && at !== -1 && at < siblings.length - 1) done = this.requestMove(current, siblings[at + 1]!, "after");
    else if (key === "ArrowLeft" && current.parentTreeItem) done = this.requestMove(current, current.parentTreeItem, "after");
    else if (key === "ArrowRight" && at > 0 && siblings[at - 1]!.droppable) {
      const into = siblings[at - 1]!;
      done = this.requestMove(current, into, "inside");
      // Keep the moved node visible.
      if (done) this.setExpanded(into, true);
    }
    if (!done) this.announce(this.localize.term("tree.cannotMove", "{item} can't move that way", { item: this.labelOf(current) }));
  }

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
    const arrow = key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";

    if (this.reorderable && current && event.altKey && event.shiftKey && (key === "ArrowUp" || key === "ArrowDown")) {
      event.preventDefault();
      const from = this.siblingsOf(current).indexOf(current);
      this.requestReorder(current, key === "ArrowUp" ? from - 1 : from + 1);
      return;
    }
    if (this.reorderable && current && index !== -1 && event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey && arrow) {
      // Alt+ArrowLeft/Right are also the browser's Back/Forward.
      event.preventDefault();
      this.moveByKey(current, key);
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
        if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.typeahead(event, items, index);
        }
        break;
    }
  };

  private typed = "";
  private typedAt = 0;

  /** Typing moves to the next visible node whose label starts with what was typed (APG tree typeahead). */
  private typeahead(event: KeyboardEvent, items: LitMaterialTreeItem[], index: number): void {
    event.preventDefault();
    const now = Date.now();
    this.typed = now - this.typedAt > 500 ? event.key.toLowerCase() : this.typed + event.key.toLowerCase();
    this.typedAt = now;
    const repeat = [...this.typed].every((c) => c === this.typed[0]);
    const query = repeat ? this.typed[0]! : this.typed;
    const from = repeat ? index + 1 : Math.max(index, 0);
    const labelOf = (item: LitMaterialTreeItem) =>
      (item.querySelector(':scope > [slot="label"]')?.textContent ?? "").trim().toLowerCase();
    for (let i = 0; i < items.length; i++) {
      const item = items[(from + i) % items.length]!;
      if (labelOf(item).startsWith(query)) {
        this.moveFocus(item);
        return;
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-tree": LitMaterialTree;
  }
}
