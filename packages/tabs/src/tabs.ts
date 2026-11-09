import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { isRtl } from "@lit-material/core/localize.js";
import type { LitMaterialTab } from "./tab.js";
import type { LitMaterialTabPanel } from "./tab-panel.js";
import { styles } from "./tabs-styles.js";

let nextId = 0;

/**
 * Material Design 3 tabs — a horizontal row of `lit-material-tab` elements
 * with a sliding active indicator, following the WAI-ARIA tabs pattern with
 * automatic activation (moving focus with the arrow keys immediately
 * switches the selected tab, matching real Material Design tab behavior —
 * the same roving-tabindex, wrap-on-arrow-keys, activate-immediately model
 * `lit-material-radio` already uses for its group).
 *
 * Panels are opt-in: put `lit-material-tab-panel` elements after the tabs
 * (same parent) and they're paired by index, shown/hidden, and wired with
 * `aria-controls`/`aria-labelledby`. For anything else (a routed view,
 * lazy-loaded content...) leave them out, listen for `change` and show your
 * own content.
 *
 * @element lit-material-tabs
 *
 * @slot - `lit-material-tab` elements.
 *
 * `scrollable` keeps every tab at its own width and scrolls the row when they
 * don't fit (thin scrollbar), bringing the selected tab into view whenever
 * the selection changes, for a strip of open documents. The `end` slot holds
 * controls after the row, outside the scroll (a New tab button).
 *
 * @slot end - Controls after the tabs, e.g. a New tab button.
 *
 * In a scrollable row the edges fade where more tabs are hidden.
 *
 * `reorderable` lets people drag a tab to a new place, or move the focused tab
 * with Alt+Shift+ArrowLeft/ArrowRight (Ctrl+Shift+PageUp/PageDown too). The
 * element fires a cancelable `reorder` event with `detail.from` and
 * `detail.to` (indexes) and moves nothing itself: the app reorders its data
 * and renders the tabs again (as with `close`).
 *
 * @fires reorder - A tab was dragged or moved by keyboard; `detail: {from, to}`, cancelable.
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
  /** Tabs keep their width and the row scrolls; the selected tab is kept in view. */
  @property({ type: Boolean, reflect: true }) scrollable = false;
  /** Tabs can be dragged, or moved with Alt+Shift+Arrow keys; fires `reorder`. */
  @property({ type: Boolean, reflect: true }) reorderable = false;

  private drag?: { tab: LitMaterialTab; from: number; x: number; started: boolean; id: number };

  private tabsReady = false;

  @query(".indicator") private readonly indicatorElement?: HTMLElement;
  @query(".scroller") private readonly scroller?: HTMLElement;

  private resizeObserver?: ResizeObserver;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("pointerdown", this.handlePointerDown);
  }

  /** Fires `reorder` for moving the tab at `from` to `to`; false when cancelled or out of range. */
  requestReorder(from: number, to: number): boolean {
    const count = this.tabs.length;
    if (from === to || from < 0 || to < 0 || from >= count || to >= count) return false;
    return this.dispatchEvent(new CustomEvent("reorder", { bubbles: true, composed: true, cancelable: true, detail: { from, to } }));
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.reorderable || event.button !== 0) return;
    const path = event.composedPath();
    const tab = this.tabs.find((candidate) => path.includes(candidate));
    if (!tab || tab.disabled) return;
    this.drag = { tab, from: this.tabs.indexOf(tab), x: event.clientX, started: false, id: event.pointerId };
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.endDrag);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.started && Math.abs(event.clientX - drag.x) < 6) return;
    drag.started = true;
    drag.tab.toggleAttribute("dragging", true);
    drag.tab.style.transform = `translateX(${event.clientX - drag.x}px)`;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    const started = drag.started;
    this.endDrag();
    if (!started) return;
    // The drop index: the tab whose middle is past the pointer, among the others.
    const others = this.tabs.filter((t) => t !== drag.tab);
    const rtl = isRtl(this);
    let to = others.findIndex((t) => {
      const r = t.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      return rtl ? event.clientX > mid : event.clientX < mid;
    });
    if (to === -1) to = others.length;
    this.requestReorder(drag.from, to);
  };

  private readonly endDrag = (): void => {
    if (this.drag) {
      this.drag.tab.removeAttribute("dragging");
      this.drag.tab.style.transform = "";
    }
    this.drag = undefined;
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.endDrag);
  };

  private updateFades(): void {
    const row = this.scroller;
    if (!row || !this.scrollable) return;
    const max = row.scrollWidth - row.clientWidth;
    const at = Math.abs(row.scrollLeft);
    // The start/end edges in reading order (scrollLeft is negative in RTL).
    row.classList.toggle("fade-start", max > 1 && at > 1);
    row.classList.toggle("fade-end", max > 1 && at < max - 1);
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
    // On first connect the tabs aren't upgraded yet: firstUpdated syncs.
    if (this.tabsReady) this.syncSelected();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.endDrag();
  }

  protected override async firstUpdated(): Promise<void> {
    // Server-rendered tabs hydrate after this element does. Setting their
    // `selected` before that lands in hydration, which keeps the DOM the
    // server sent (aria-selected="false", tabindex="-1" on every tab), so
    // wait for them, then sync.
    // `updated()` and `slotchange` run before that too, so both wait for
    // `tabsReady`.
    // They may not even be upgraded yet (then `updateComplete` is undefined
    // and a `selected` set now becomes an own property they adopt, and
    // hydrate with, when they upgrade).
    await customElements.whenDefined("lit-material-tab");
    await Promise.all(this.tabs.map((tab) => tab.updateComplete));
    this.tabsReady = true;
    this.syncSelected();
    this.updateIndicator();
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
      this.resizeObserver.observe(this);
    }
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (this.tabsReady && changed.has("selected")) {
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

  /**
   * `lit-material-tab-panel` siblings after this element, paired with tabs
   * by index. Panels are opt-in: with none, showing content stays the
   * page's job (listen for `change`).
   */
  private get panels(): LitMaterialTabPanel[] {
    // parentNode, not parentElement: at the top of a shadow root the parent is the root itself.
    const parent = this.parentNode as ParentNode | null;
    if (!parent) return [];
    const panels: LitMaterialTabPanel[] = [];
    let seen = false;
    for (const child of Array.from(parent.children)) {
      if (child === this) seen = true;
      else if (seen && child.localName === "lit-material-tab-panel") panels.push(child as LitMaterialTabPanel);
      // A second tabs element in the same parent owns the panels after it.
      else if (seen && child.localName === "lit-material-tabs") break;
    }
    return panels;
  }

  private syncSelected(): void {
    const panels = this.panels;
    this.tabs.forEach((tab, index) => {
      tab.selected = index === this.selected;
      const panel = panels[index];
      if (!panel) return;
      panel.selected = index === this.selected;
      if (!tab.id) tab.id = `lit-material-tab-${++nextId}`;
      if (!panel.id) panel.id = `${tab.id}-panel`;
      if (!panel.hasAttribute("aria-labelledby")) panel.setAttribute("aria-labelledby", tab.id);
      if (!tab.ariaControls) tab.ariaControls = panel.id;
    });
  }

  private updateIndicator(): void {
    const target = this.tabs[this.selected];
    if (!target || !this.indicatorElement || !this.scroller) return;
    // Relative to the scrolled row, so the indicator scrolls with its tab. Physical `left` on purpose: it's
    // measured from rendered rects, which already mirror right to left, and `scrollLeft` is 0 at the start
    // edge and negative leftwards in RTL, so the same sum places it in both directions.
    const rowRect = this.scroller.getBoundingClientRect();
    const tabRect = target.getBoundingClientRect();
    this.indicatorElement.style.left = `${tabRect.left - rowRect.left + this.scroller.scrollLeft}px`;
    this.indicatorElement.style.width = `${tabRect.width}px`;
    if (this.scrollable) this.revealSelected(target);
    this.updateFades();
  }

  /** Scrolls the row just enough to show the selected tab. */
  private revealSelected(tab: HTMLElement): void {
    const row = this.scroller!;
    const rowRect = row.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    if (tabRect.left < rowRect.left) row.scrollLeft -= rowRect.left - tabRect.left;
    else if (tabRect.right > rowRect.right) row.scrollLeft += tabRect.right - rowRect.right;
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
        <div class="scroller" @scroll=${() => this.updateFades()}>
          <slot @slotchange=${this.handleSlotChange}></slot>
          <div class="indicator" part="indicator"></div>
        </div>
        <slot name="end" class="end"></slot>
      </div>
    `;
  }

  private readonly handleSlotChange = (): void => {
    if (!this.tabsReady) return;
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
    // Arrows follow reading order: right to left, ArrowLeft is "next".
    const rtl = (event.key === "ArrowLeft" || event.key === "ArrowRight") && isRtl(this);
    const key = rtl ? (event.key === "ArrowLeft" ? "ArrowRight" : "ArrowLeft") : event.key;

    if (this.reorderable && current && index !== -1) {
      const all = this.tabs;
      const at = all.indexOf(current);
      let to = -1;
      if (event.altKey && event.shiftKey && key === "ArrowRight") to = at + 1;
      else if (event.altKey && event.shiftKey && key === "ArrowLeft") to = at - 1;
      else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "PageDown") to = at + 1;
      else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "PageUp") to = at - 1;
      if (to !== -1 || (event.altKey && event.shiftKey && (key === "ArrowLeft" || key === "ArrowRight"))) {
        event.preventDefault();
        this.requestReorder(at, to);
        return;
      }
    }

    switch (key) {
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
