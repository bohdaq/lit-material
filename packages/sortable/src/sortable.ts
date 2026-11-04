import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isRtl, LocalizeController } from "@lit-material/core/localize.js";
import { cssProps } from "@lit-material/core/css-props.js";

/**
 * One live region for every sortable, in <body>: inside the list it would be
 * a status child of role="list", which only allows listitems.
 */
let shared: { say(message: string): void } | null = null;
function announcer(): { say(message: string): void } | null {
  if (shared) return shared;
  if (typeof document === "undefined" || !document.body) return null;
  const region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "assertive");
  region.dataset.litMaterialSortableAnnouncer = "";
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

export type SortLayout = "list" | "grid";

export interface SortDetail {
  /** The moved element. */
  item: HTMLElement;
  /** Its `data-sort-id`, or `""`. */
  id: string;
  /** Index in `fromList` before the move. */
  from: number;
  /** Index in `toList` after the move. */
  to: number;
  fromList: LitMaterialSortable;
  toList: LitMaterialSortable;
}

/** Pixels the pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 4;

/**
 * Lets people reorder a list: by dragging a handle with a mouse, pen or
 * finger, or from the keyboard — focus a handle, Space (or Enter) picks the
 * item up, ↑/↓ move it, Space drops it and Escape puts it back. Each step is
 * announced to screen readers.
 *
 * Every element child is an item. An item's handle is its
 * `[data-sort-handle]` descendant (a button, ideally), or the item itself.
 * Give items a `data-sort-id` and, when their text isn't a good name, a
 * `data-sort-label` for the announcements.
 *
 * It never moves elements itself: it shows where the item would land and
 * fires `sort` with `{ from, to }`, and your code reorders its data and
 * re-renders — so it works with Lit, React or plain DOM, which each own
 * their own nodes. Lists that share a `group` accept each other's items by
 * pointer; `sort` then fires on the list the item left, with `toList` set.
 *
 * `layout="grid"` is for items laid out in rows — a card grid, chips that
 * wrap, a single horizontal row (style the list as the grid or flex
 * container): the drop slot follows reading order, the drop line stands
 * between items, ←/→ move one place and ↑/↓ a row.
 *
 * @element lit-material-sortable
 *
 * @slot - The items.
 *
 * @fires sort - When an item is dropped somewhere new; `detail` is `SortDetail`.
 *
 * @cssprop --lit-material-sortable-indicator-color - The drop line (default `--md-sys-color-primary`).
 */
@customElement("lit-material-sortable")
export class LitMaterialSortable extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
    }
    :host([hidden]) {
      display: none;
    }
    ::slotted([data-sort-dragging]) {
      opacity: 0.4;
    }
    ::slotted([data-sort-grabbed]) {
      outline: 2px solid var(--lit-material-sortable-indicator-color, var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff)));
      outline-offset: -2px;
    }
    .indicator {
      position: absolute;
      inset-inline: 0;
      height: 2px;
      margin-top: -1px;
      border-radius: 1px;
      background: var(--lit-material-sortable-indicator-color, var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff)));
      pointer-events: none;
    }
    .indicator.between {
      width: 2px;
      margin-top: 0;
      margin-inline-start: -1px;
      inset-inline: auto;
    }
  `;

  /** Lists with the same group accept each other's items. Empty: this list only. */
  @property({ reflect: true }) group = "";

  /** Names the list in announcements, e.g. "Requests". */
  @property() label = "";

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** `list`: one item per row. `grid`: items in rows (a card grid, wrapping chips, one horizontal row). */
  @property({ reflect: true }) layout: SortLayout = "list";

  /** Where a dragged item would land (index among the other items), or `null`. */
  @state() private dropIndex: number | null = null;

  /** The pointer's y over this list while dragging: picks the row for a grid drop line. */
  private dropY = 0;

  /** The last announcement, also read by tests. */
  announcement = "";

  private readonly localize = new LocalizeController(this);

  /** Handles whose `aria-description` this list set (and so keeps in the current language). */
  private readonly describedHandles = new WeakSet<HTMLElement>();

  private drag?: {
    item: HTMLElement;
    from: number;
    pointerId: number;
    startX: number;
    startY: number;
    active: boolean;
    target: LitMaterialSortable | null;
  };

  /** Keyboard pick-up: the item, where it started, where it is now. */
  private grabbed?: { item: HTMLElement; origin: number; index: number; refocusing?: number };

  /** The items, in order. */
  get items(): HTMLElement[] {
    return Array.from(this.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.onPointerDown);
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("focusout", this.onFocusOut);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("pointerdown", this.onPointerDown);
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("focusout", this.onFocusOut);
    this.endPointerDrag();
  }

  private readonly onSlotChange = (): void => {
    for (const item of this.items) {
      const handle = this.handleOf(item);
      handle.style.touchAction = "none";
      if (!handle.hasAttribute("aria-description")) this.describedHandles.add(handle);
      if (handle.tabIndex < 0 && !handle.hasAttribute("tabindex")) handle.tabIndex = 0;
    }
    this.describeHandles();
  };

  /** Sets the reorder hint on the handles that had none, in the list's current language. */
  private describeHandles(): void {
    const hint = this.localize.term("sortable.instructions", "Press Space to reorder");
    for (const item of this.items) {
      const handle = this.handleOf(item);
      if (this.describedHandles.has(handle) && handle.getAttribute("aria-description") !== hint) {
        handle.setAttribute("aria-description", hint);
      }
    }
  }

  protected override updated(): void {
    this.describeHandles(); // a language change re-renders the list
  }

  private handleOf(item: HTMLElement): HTMLElement {
    return item.querySelector<HTMLElement>("[data-sort-handle]") ?? item;
  }

  /** The item that `node` is the handle of (or inside), if any. */
  private itemFromHandle(path: EventTarget[]): HTMLElement | undefined {
    for (const item of this.items) {
      const handle = this.handleOf(item);
      if (path.includes(handle)) return item;
    }
    return undefined;
  }

  private nameOf(item: HTMLElement): string {
    return item.dataset.sortLabel || item.textContent?.trim().replace(/\s+/g, " ") || this.localize.term("sortable.item", "Item");
  }

  private announce(message: string): void {
    this.announcement = message;
    announcer()?.say(message);
  }

  private emit(item: HTMLElement, from: number, to: number, toList: LitMaterialSortable): void {
    this.dispatchEvent(
      new CustomEvent<SortDetail>("sort", {
        bubbles: true,
        composed: true,
        detail: { item, id: item.dataset.sortId ?? "", from, to, fromList: this, toList },
      }),
    );
  }

  // ---- Pointer ----

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0 || this.grabbed) return;
    const item = this.itemFromHandle(event.composedPath());
    if (!item) return;
    this.drag = {
      item,
      from: this.items.indexOf(item),
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      target: null,
    };
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointercancel", this.onPointerCancel);
    document.addEventListener("keydown", this.onDragKeyDown, true);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.active) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD) return;
      drag.active = true;
      drag.item.setAttribute("data-sort-dragging", "");
      document.documentElement.style.setProperty("user-select", "none");
    }
    event.preventDefault();
    const target = this.listAt(event.clientX, event.clientY);
    if (drag.target && drag.target !== target) drag.target.dropIndex = null;
    drag.target = target;
    if (target) {
      target.dropY = event.clientY;
      target.dropIndex = target.indexAt(event.clientY, drag.item, event.clientX);
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const target = drag.target;
    const to = target?.dropIndex ?? null;
    this.endPointerDrag();
    if (!drag.active || !target || to === null) return;
    if (target === this && to === drag.from) return;
    this.emit(drag.item, drag.from, to, target);
    const name = this.nameOf(drag.item);
    const position = to + 1;
    this.announce(
      target === this
        ? this.localize.term("sortable.movedTo", "{name} moved to position {position}", { name, position })
        : target.label
          ? this.localize.term("sortable.movedToList", "{name} moved to position {position} in {list}", {
              name,
              position,
              list: target.label,
            })
          : this.localize.term("sortable.movedToOtherList", "{name} moved to position {position} in the other list", {
              name,
              position,
            }),
    );
  };

  private readonly onPointerCancel = (): void => this.endPointerDrag();

  private readonly onDragKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.drag?.active) {
      event.preventDefault();
      event.stopPropagation();
      this.endPointerDrag();
    }
  };

  private endPointerDrag(): void {
    const drag = this.drag;
    if (!drag) return;
    drag.item.removeAttribute("data-sort-dragging");
    if (drag.target) drag.target.dropIndex = null;
    this.drag = undefined;
    document.documentElement.style.removeProperty("user-select");
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerCancel);
    document.removeEventListener("keydown", this.onDragKeyDown, true);
  }

  /** The sortable under a point that accepts this list's items. */
  private listAt(x: number, y: number): LitMaterialSortable | null {
    // A list inside a shadow root isn't in the document's hit list, only its host is.
    const root = this.getRootNode() as Document | ShadowRoot;
    const hits = root === document ? document.elementsFromPoint(x, y) : [...root.elementsFromPoint(x, y), ...document.elementsFromPoint(x, y)];
    for (const el of hits) {
      const list = el instanceof LitMaterialSortable ? el : el.closest("lit-material-sortable");
      if (!list || list.disabled) continue;
      if (list === this || (this.group && list.group === this.group)) return list;
    }
    return null;
  }

  private get rtl(): boolean {
    return isRtl(this);
  }

  /**
   * Index among the items other than `dragged` before which the point falls:
   * by `y` in a list; in a grid, the first item in a row below the point or
   * in its row past it.
   */
  indexAt(y: number, dragged: HTMLElement, x = 0): number {
    const others = this.items.filter((item) => item !== dragged);
    const grid = this.layout === "grid";
    const rtl = grid && this.rtl;
    const index = others.findIndex((item) => {
      const box = item.getBoundingClientRect();
      if (!grid) return y < box.top + box.height / 2;
      if (y < box.top) return true;
      if (y > box.bottom) return false;
      const middle = box.left + box.width / 2;
      return rtl ? x > middle : x < middle;
    });
    return index === -1 ? others.length : index;
  }

  /** The drop line, relative to the list: a horizontal line in a list, an upright one between items in a grid. */
  private indicator(): { top: number; left?: number; height?: number } | null {
    if (this.dropIndex === null) return null;
    const dragged = this.drag?.item ?? document.querySelector<HTMLElement>("[data-sort-dragging]");
    const others = this.items.filter((item) => item !== dragged);
    const host = this.getBoundingClientRect();
    if (others.length === 0) return { top: 0 };
    const next = others[this.dropIndex];
    const prev = others[this.dropIndex - 1];
    if (this.layout !== "grid") {
      if (next) return { top: next.getBoundingClientRect().top - host.top };
      return { top: others[others.length - 1]!.getBoundingClientRect().bottom - host.top };
    }
    const rtl = this.rtl;
    const lead = (box: DOMRect) => (rtl ? box.right : box.left);
    const trail = (box: DOMRect) => (rtl ? box.left : box.right);
    const n = next?.getBoundingClientRect();
    const p = prev?.getBoundingClientRect();
    // Between two items of one row: halfway across the gap. Where the slot
    // spans two rows (end of one, start of the next): on the pointer's row.
    const atRowEnd = p && (!n || (Math.abs(n.top - p.top) >= 1 && this.dropY <= p.bottom));
    const box = atRowEnd ? p! : (n ?? p!);
    let x = atRowEnd ? trail(p!) : lead(n!);
    if (n && p && Math.abs(n.top - p.top) < 1) x = (trail(p) + lead(n)) / 2;
    // `left` is applied as inset-inline-start, so measure from the start edge.
    const left = rtl ? host.right - x : x - host.left;
    return { top: box.top - host.top, left, height: box.height };
  }

  /** Items per row in a grid (those level with the first). */
  private get columns(): number {
    const items = this.items;
    if (this.layout !== "grid" || items.length === 0) return 1;
    const top = items[0]!.getBoundingClientRect().top;
    const count = items.filter((item) => Math.abs(item.getBoundingClientRect().top - top) < 1).length;
    return Math.max(1, count);
  }

  // ---- Keyboard ----

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled || event.defaultPrevented) return;
    const item = this.itemFromHandle(event.composedPath());
    if (!item || event.composedPath()[0] !== this.handleOf(item)) return;
    const grabbed = this.grabbed;
    const count = this.items.length;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (!grabbed) {
        const index = this.items.indexOf(item);
        this.grabbed = { item, origin: index, index };
        item.setAttribute("data-sort-grabbed", "");
        this.announce(
          this.localize.term(
            "sortable.pickedUp",
            "{name} picked up, position {position} of {total}. ↑ and ↓ to move, Space to drop, Escape to cancel.",
            { name: this.nameOf(item), position: index + 1, total: count },
          ),
        );
      } else {
        this.drop(
          this.localize.term("sortable.droppedAt", "{name} dropped at position {position} of {total}.", {
            name: this.nameOf(item),
            position: grabbed.index + 1,
            total: count,
          }),
        );
      }
      return;
    }
    if (!grabbed) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (grabbed.index !== grabbed.origin) this.moveGrabbed(grabbed.origin);
      this.drop(
        this.localize.term("sortable.cancelled", "{name} back at position {position} of {total}.", {
          name: this.nameOf(item),
          position: grabbed.origin + 1,
          total: count,
        }),
      );
      return;
    }
    const row = this.columns;
    const side = this.layout === "grid" && this.rtl ? -1 : 1;
    const step = { ArrowUp: -row, ArrowDown: row, ArrowLeft: -side, ArrowRight: side }[event.key];
    const jump = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : undefined;
    if (step === undefined && jump === undefined) return;
    event.preventDefault();
    const to = jump ?? Math.min(count - 1, Math.max(0, grabbed.index + step!));
    if (to === grabbed.index) return;
    this.moveGrabbed(to);
    this.announce(
      this.localize.term("sortable.movedToOf", "{name} moved to position {position} of {total}.", {
        name: this.nameOf(item),
        position: to + 1,
        total: count,
      }),
    );
  };

  private moveGrabbed(to: number): void {
    const grabbed = this.grabbed!;
    const { item } = grabbed;
    const from = grabbed.index;
    grabbed.index = to;
    grabbed.refocusing = (grabbed.refocusing ?? 0) + 1;
    this.emit(item, from, to, this);
    // The app re-renders the list; moving a focused node drops focus, so put it
    // back: right after the re-render (Lit and synchronous renderers finish in
    // a microtask), so a key pressed at once still lands, and again two frames
    // later for renderers that wait for a frame.
    queueMicrotask(() => this.refocus(item));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (this.grabbed) this.grabbed.refocusing = (this.grabbed.refocusing ?? 1) - 1;
        this.refocus(item);
      }),
    );
  }

  private refocus(item: HTMLElement): void {
    const grabbed = this.grabbed;
    if (!grabbed) return;
    const current = (item.isConnected && this.contains(item) ? item : undefined) ??
      this.items.find((el) => item.dataset.sortId && el.dataset.sortId === item.dataset.sortId);
    if (!current) return;
    if (current !== grabbed.item) {
      grabbed.item.removeAttribute("data-sort-grabbed");
      grabbed.item = current;
      current.setAttribute("data-sort-grabbed", "");
    }
    this.handleOf(current).focus();
  }

  private drop(message: string): void {
    this.grabbed?.item.removeAttribute("data-sort-grabbed");
    this.grabbed = undefined;
    this.announce(message);
  }

  private readonly onFocusOut = (event: FocusEvent): void => {
    const grabbed = this.grabbed;
    // A re-render moving the item blurs it for a moment (refocused after the move).
    if (!grabbed || grabbed.refocusing) return;
    // Only a real move elsewhere drops it.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (this.grabbed !== grabbed) return;
        const active = document.activeElement;
        if (active && this.contains(active)) return;
        if (event.relatedTarget && this.contains(event.relatedTarget as Node)) return;
        this.drop(
          this.localize.term("sortable.droppedAtPosition", "{name} dropped at position {position}.", {
            name: this.nameOf(grabbed.item),
            position: grabbed.index + 1,
          }),
        );
      }),
    );
  };

  override render() {
    const line = this.indicator();
    const style =
      line &&
      (line.left === undefined
        ? { top: `${line.top}px` }
        : { top: `${line.top}px`, insetInlineStart: `${line.left}px`, height: `${line.height}px` });
    return html`<slot @slotchange=${this.onSlotChange}></slot>${line === null
        ? ""
        : html`<div class=${line.left === undefined ? "indicator" : "indicator between"} style=${cssProps(style || {})}></div>`}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-sortable": LitMaterialSortable;
  }
}
