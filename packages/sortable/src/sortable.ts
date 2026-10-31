import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;

  /** Lists with the same group accept each other's items. Empty: this list only. */
  @property({ reflect: true }) group = "";

  /** Names the list in announcements, e.g. "Requests". */
  @property() label = "";

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Where a dragged item would land (index among the other items), or `null`. */
  @state() private dropIndex: number | null = null;

  @state() private announcement = "";

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
  private grabbed?: { item: HTMLElement; origin: number; index: number; refocusing?: boolean };

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
      if (!handle.hasAttribute("aria-description")) {
        handle.setAttribute("aria-description", "Press Space to reorder");
      }
      if (handle.tabIndex < 0 && !handle.hasAttribute("tabindex")) handle.tabIndex = 0;
    }
  };

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
    return item.dataset.sortLabel || item.textContent?.trim().replace(/\s+/g, " ") || "Item";
  }

  private announce(message: string): void {
    // Re-announce identical text by clearing first.
    this.announcement = "";
    requestAnimationFrame(() => (this.announcement = message));
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
    if (target) target.dropIndex = target.indexAt(event.clientY, drag.item);
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
    this.announce(`${this.nameOf(drag.item)} moved to position ${to + 1}${target === this ? "" : ` in ${target.label || "the other list"}`}`);
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

  /** Index among the items other than `dragged` before which `y` falls. */
  indexAt(y: number, dragged: HTMLElement): number {
    const others = this.items.filter((item) => item !== dragged);
    const index = others.findIndex((item) => {
      const box = item.getBoundingClientRect();
      return y < box.top + box.height / 2;
    });
    return index === -1 ? others.length : index;
  }

  private indicatorTop(): number | null {
    if (this.dropIndex === null) return null;
    const dragged = this.drag?.item ?? document.querySelector<HTMLElement>("[data-sort-dragging]");
    const others = this.items.filter((item) => item !== dragged);
    const host = this.getBoundingClientRect();
    if (others.length === 0) return 0;
    const next = others[this.dropIndex];
    if (next) return next.getBoundingClientRect().top - host.top;
    return others[others.length - 1]!.getBoundingClientRect().bottom - host.top;
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
        this.announce(`${this.nameOf(item)} picked up, position ${index + 1} of ${count}. ↑ and ↓ to move, Space to drop, Escape to cancel.`);
      } else {
        this.drop(`${this.nameOf(item)} dropped at position ${grabbed.index + 1} of ${count}.`);
      }
      return;
    }
    if (!grabbed) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (grabbed.index !== grabbed.origin) this.moveGrabbed(grabbed.origin);
      this.drop(`${this.nameOf(item)} back at position ${grabbed.origin + 1} of ${count}.`);
      return;
    }
    const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const jump = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : undefined;
    if (step === undefined && jump === undefined) return;
    event.preventDefault();
    const to = jump ?? Math.min(count - 1, Math.max(0, grabbed.index + step!));
    if (to === grabbed.index) return;
    this.moveGrabbed(to);
    this.announce(`${this.nameOf(item)} moved to position ${to + 1} of ${count}.`);
  };

  private moveGrabbed(to: number): void {
    const grabbed = this.grabbed!;
    const { item } = grabbed;
    const from = grabbed.index;
    grabbed.index = to;
    grabbed.refocusing = true;
    this.emit(item, from, to, this);
    // The app re-renders the list; moving a focused node drops focus, so put it back.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const current = (item.isConnected && this.contains(item) ? item : undefined) ??
          this.items.find((el) => item.dataset.sortId && el.dataset.sortId === item.dataset.sortId);
        if (this.grabbed) this.grabbed.refocusing = false;
        if (!current || !this.grabbed) return;
        if (current !== this.grabbed.item) {
          this.grabbed.item.removeAttribute("data-sort-grabbed");
          this.grabbed.item = current;
          current.setAttribute("data-sort-grabbed", "");
        }
        this.handleOf(current).focus();
      }),
    );
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
        this.drop(`${this.nameOf(grabbed.item)} dropped at position ${grabbed.index + 1}.`);
      }),
    );
  };

  override render() {
    const top = this.indicatorTop();
    return html`<slot @slotchange=${this.onSlotChange}></slot>${top === null
        ? ""
        : html`<div class="indicator" style="top: ${top}px"></div>`}<div class="sr" role="status" aria-live="assertive">${this.announcement}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-sortable": LitMaterialSortable;
  }
}
