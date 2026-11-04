import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getRegistry, type DevtoolsRegistry, type StoreHistoryEntry, type StoreRecord } from "./registry.js";
import { ROUTE_CHANGE_EVENT } from "./connect-router.js";
import { toLoggedAction } from "./connect-store.js";
import { styles } from "./devtools-panel-styles.js";

type View = "store" | "router";

/** The parts of `<lit-material-router-outlet>` the panel reads; duck-typed so the router needn't load. */
interface OutletLike extends Element {
  current?: { path?: string; params?: Record<string, string>; query?: URLSearchParams; title?: string };
  pending?: boolean;
}

/** Children shown per object/array before "… N more". */
const MAX_CHILDREN = 200;

let nextId = 0;

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

function formatTime(time: number): string {
  const d = new Date(time);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function isExpandable(value: unknown): value is object {
  return value !== null && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp);
}

function entriesOf(value: object): [string, unknown][] {
  if (value instanceof Map) return [...value.entries()].map(([k, v]) => [String(k), v]);
  if (value instanceof Set) return [...value.values()].map((v, i) => [String(i), v]);
  if (value instanceof URLSearchParams) return [...value.entries()];
  return Object.entries(value);
}

function summaryOf(value: object, count: number): string {
  if (Array.isArray(value)) return `Array(${count})`;
  if (value instanceof Map) return `Map(${count})`;
  if (value instanceof Set) return `Set(${count})`;
  const name = Object.getPrototypeOf(value)?.constructor?.name as string | undefined;
  const prefix = name && name !== "Object" ? `${name} ` : "";
  return `${prefix}{${count}}`;
}

function renderPrimitive(value: unknown): TemplateResult {
  switch (typeof value) {
    case "string":
      return html`<span class="string">${JSON.stringify(value)}</span>`;
    case "number":
      return html`<span class="number">${String(value)}</span>`;
    case "bigint":
      return html`<span class="bigint">${String(value)}n</span>`;
    case "boolean":
      return html`<span class="boolean">${String(value)}</span>`;
    case "undefined":
      return html`<span class="undefined">undefined</span>`;
    case "function":
      return html`<span class="summary">ƒ ${value.name || "anonymous"}()</span>`;
    case "symbol":
      return html`<span class="summary">${value.toString()}</span>`;
  }
  if (value === null) return html`<span class="null">null</span>`;
  if (value instanceof Date) return html`<span class="summary">Date ${isNaN(value.getTime()) ? "Invalid" : value.toISOString()}</span>`;
  return html`<span class="summary">${String(value)}</span>`;
}

/**
 * A floating "Devtools" button (bottom-end corner) that opens an inspector for the stores connected with
 * `connectStore()` — state as a collapsible tree, the action log, time travel — and for the router: each
 * `<lit-material-router-outlet>`'s current route and the navigation log from `connectRouter()`.
 *
 * Development only: import `@lit-material/devtools/panel.js` behind a dev check. Escape closes the panel.
 */
@customElement("lit-material-devtools")
export class LitMaterialDevtools extends LitElement {
  static override styles = [styles];

  /** Whether the panel is showing. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Which view is showing: `"store"` or `"router"`. */
  @property()
  view: View = "store";

  @state() private storeName: string | undefined;
  @state() private selected: StoreHistoryEntry | null = null;

  private readonly uid = `lit-material-devtools-${nextId++}`;
  /** Expanded/collapsed overrides per tree path; the default is only the root open. */
  private readonly expanded = new Map<string, boolean>();
  private registry: DevtoolsRegistry | undefined;
  private unsubscribe: (() => void) | undefined;
  private observer: MutationObserver | undefined;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.registry = getRegistry();
    this.unsubscribe = this.registry?.subscribe(this.handleRegistryChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, this.handleNavigation);
    window.addEventListener("popstate", this.handleNavigation);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    window.removeEventListener(ROUTE_CHANGE_EVENT, this.handleNavigation);
    window.removeEventListener("popstate", this.handleNavigation);
    this.observer?.disconnect();
    this.observer = undefined;
    clearTimeout(this.refreshTimer);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has("open")) return;
    // Watch outlets' `pending` attribute only while the panel can show it.
    if (this.open && !this.observer) {
      this.observer = new MutationObserver(() => this.requestUpdate());
      this.observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["pending"] });
    } else if (!this.open) {
      this.observer?.disconnect();
      this.observer = undefined;
    }
    if (this.open && changed.get("open") === false) {
      this.renderRoot.querySelector<HTMLElement>("h2")?.focus();
    }
  }

  /** Opens the panel. */
  show(): void {
    this.open = true;
  }

  /** Closes the panel and puts focus back on the button that opens it. */
  close(): void {
    if (!this.open) return;
    const hadFocus = this.matches(":focus-within");
    this.open = false;
    if (hadFocus) void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(".launcher")?.focus());
  }

  private readonly handleRegistryChange = (): void => {
    this.requestUpdate();
  };

  /** Outlets re-render after they handle the event: read their route once they have. */
  private readonly handleNavigation = (): void => {
    if (!this.open) return;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      const outlets = this.outlets();
      void Promise.all(outlets.map((o) => (o as unknown as LitElement).updateComplete)).then(() => this.requestUpdate());
    });
  };

  private outlets(): OutletLike[] {
    return [...document.querySelectorAll<OutletLike>("lit-material-router-outlet")];
  }

  private currentRecord(): StoreRecord | undefined {
    const stores = this.registry?.stores;
    if (!stores || stores.size === 0) return undefined;
    return (this.storeName !== undefined ? stores.get(this.storeName) : undefined) ?? stores.values().next().value;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.stopPropagation();
      this.close();
    }
  };

  private readonly handleTabKeydown = (event: KeyboardEvent): void => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next: View =
      event.key === "Home" ? "store" : event.key === "End" ? "router" : this.view === "store" ? "router" : "store";
    this.view = next;
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`#${this.uid}-tab-${next}`)?.focus());
  };

  private toggleNode(path: string, open: boolean): void {
    this.expanded.set(path, !open);
    this.requestUpdate();
  }

  private renderTree(label: string, value: unknown, prefix: string): TemplateResult {
    return html`<ul class="tree">
      ${this.renderNode(label, value, prefix, 0, new Set())}
    </ul>`;
  }

  private renderNode(key: string, value: unknown, path: string, depth: number, ancestors: Set<object>): TemplateResult {
    if (!isExpandable(value)) {
      return html`<li class="leaf"><span class="key">${key}</span>: ${renderPrimitive(value)}</li>`;
    }
    if (ancestors.has(value)) {
      return html`<li class="leaf"><span class="key">${key}</span>: <span class="summary">[Circular]</span></li>`;
    }
    const entries = entriesOf(value);
    const open = this.expanded.get(path) ?? depth === 0;
    let children: TemplateResult | typeof nothing = nothing;
    if (open) {
      ancestors.add(value);
      const shown = entries.slice(0, MAX_CHILDREN);
      children = html`<ul role="group">
        ${shown.map(([k, v]) => this.renderNode(k, v, `${path}/${JSON.stringify(k)}`, depth + 1, ancestors))}
        ${entries.length > shown.length
          ? html`<li class="leaf more">… ${entries.length - shown.length} more</li>`
          : nothing}
        ${entries.length === 0 ? html`<li class="leaf more">empty</li>` : nothing}
      </ul>`;
      ancestors.delete(value);
    }
    return html`<li>
      <button type="button" class="node" aria-expanded=${open ? "true" : "false"} @click=${() => this.toggleNode(path, open)}>
        <span class="key">${key}</span><span class="summary">${summaryOf(value, entries.length)}</span>
      </button>
      ${children}
    </li>`;
  }

  private renderStoreView(): TemplateResult {
    const registry = this.registry;
    const record = this.currentRecord();
    if (!registry || !record) {
      return html`<div class="scroll">
        <p class="empty">No stores connected. Call <code>connectStore(store)</code> from <code>@lit-material/devtools</code>.</p>
      </div>`;
    }
    const history = record.history;
    const selectedIndex = this.selected ? history.indexOf(this.selected) : -1;
    const selected = selectedIndex >= 0 ? history[selectedIndex]! : null;
    const stores = [...registry.stores.keys()];

    return html`
      ${stores.length > 1
        ? html`<div class="toolbar">
            <label
              >Store
              <select
                @change=${(event: Event) => {
                  this.storeName = (event.target as HTMLSelectElement).value;
                  this.selected = null;
                }}
              >
                ${stores.map((name) => html`<option value=${name} ?selected=${name === record.name}>${name}</option>`)}
              </select>
            </label>
          </div>`
        : nothing}
      ${record.travelling
        ? html`<div class="travelling" role="status">
            <span
              >Showing a past state${record.cursor !== null ? html` (after #${record.cursor})` : nothing}. New actions
              resume from it.</span
            >
            <button type="button" class="filled-button" @click=${() => record.backToLive()}>Back to live</button>
          </div>`
        : nothing}
      <div class="columns">
        <section aria-labelledby="${this.uid}-log">
          <h3 id="${this.uid}-log">Actions (${history.length})</h3>
          <ol class="log" reversed>
            ${history
              .map((entry, index) => ({ entry, index }))
              .reverse()
              .map(
                ({ entry, index }) => html`<li>
                  <button
                    type="button"
                    class="entry"
                    aria-pressed=${entry === selected ? "true" : "false"}
                    @click=${() => {
                      this.selected = entry === selected ? null : entry;
                    }}
                  >
                    <span class="index">#${index}</span>
                    <span class="type">${toLoggedAction(entry.action).type}</span>
                    ${record.travelling && record.cursor === index ? html`<span class="marker">shown</span>` : nothing}
                    <span class="time">${formatTime(entry.time)}</span>
                  </button>
                </li>`,
              )}
          </ol>
        </section>
        <section aria-labelledby="${this.uid}-detail">
          ${selected
            ? html`<h3 id="${this.uid}-detail">Action #${selectedIndex}</h3>
                ${this.renderTree("action", selected.action, "action")}
                <h3>State after #${selectedIndex}</h3>
                ${this.renderTree("state", selected.state, "state")}
                <div class="actions">
                  <button
                    type="button"
                    class="filled-button"
                    ?disabled=${!record.canTravel}
                    title=${record.canTravel ? nothing : "This store has no replaceState(), so it can't time travel"}
                    @click=${() => record.jumpTo(selectedIndex)}
                  >
                    Jump here
                  </button>
                  ${record.travelling
                    ? html`<button type="button" class="text-button" @click=${() => record.backToLive()}>Back to live</button>`
                    : nothing}
                  <button
                    type="button"
                    class="text-button"
                    @click=${() => {
                      this.selected = null;
                    }}
                  >
                    Show current state
                  </button>
                </div>`
            : html`<h3 id="${this.uid}-detail">Current state</h3>
                ${this.renderTree("state", record.store.getState(), "state")}`}
        </section>
      </div>
    `;
  }

  private renderRouterView(): TemplateResult {
    const outlets = this.outlets();
    const log = this.registry?.router ?? [];
    return html`<div class="scroll">
      <h3>Outlets (${outlets.length})</h3>
      ${outlets.length === 0
        ? html`<p class="empty">No <code>&lt;lit-material-router-outlet&gt;</code> in the document.</p>`
        : outlets.map((outlet, i) => {
            const current = outlet.current;
            const params = Object.entries(current?.params ?? {});
            const query = current?.query ? [...current.query.entries()] : [];
            return html`<div class="outlet" role="group" aria-label="Outlet ${i + 1}">
              <dl>
                <dt>Path</dt>
                <dd><code>${current?.path || "(none)"}</code></dd>
                <dt>Params</dt>
                <dd>
                  ${params.length
                    ? params.map(([k, v], j) => html`${j ? ", " : ""}<code>${`${k}=${v}`}</code>`)
                    : html`<span class="empty">none</span>`}
                </dd>
                <dt>Query</dt>
                <dd>
                  ${query.length
                    ? query.map(([k, v], j) => html`${j ? ", " : ""}<code>${`${k}=${v}`}</code>`)
                    : html`<span class="empty">none</span>`}
                </dd>
                <dt>Title</dt>
                <dd>${current?.title ?? html`<span class="empty">none</span>`}</dd>
                <dt>Pending</dt>
                <dd>${outlet.pending || outlet.hasAttribute("pending") ? "yes" : "no"}</dd>
              </dl>
            </div>`;
          })}
      <h3>Navigations (${log.length})</h3>
      ${log.length === 0
        ? html`<p class="empty">None yet. Call <code>connectRouter()</code> from <code>@lit-material/devtools</code> to log them.</p>`
        : html`<ol class="log" reversed>
            ${[...log].reverse().map(
              (entry) => html`<li class="route-entry">
                <span class="kind">${entry.kind}</span>
                <span class="where">${entry.path}${entry.search}${entry.hash}</span>
                <span class="time">${formatTime(entry.time)}</span>
              </li>`,
            )}
          </ol>`}
    </div>`;
  }

  override render() {
    const panelId = `${this.uid}-panel`;
    return html`
      ${this.open
        ? html`<section id=${panelId} class="panel" role="region" aria-labelledby="${this.uid}-heading" @keydown=${this.handleKeydown}>
            <div class="header">
              <h2 id="${this.uid}-heading" tabindex="-1">Devtools</h2>
              <div class="tabs" role="tablist" aria-label="Devtools views" @keydown=${this.handleTabKeydown}>
                ${(["store", "router"] as const).map(
                  (view) => html`<button
                    type="button"
                    role="tab"
                    class="tab"
                    id="${this.uid}-tab-${view}"
                    aria-selected=${this.view === view ? "true" : "false"}
                    aria-controls="${this.uid}-view"
                    tabindex=${this.view === view ? "0" : "-1"}
                    @click=${() => {
                      this.view = view;
                    }}
                  >
                    ${view === "store" ? "Store" : "Router"}
                  </button>`,
                )}
              </div>
              <button type="button" class="close" aria-label="Close devtools" @click=${() => this.close()}>✕</button>
            </div>
            <div class="body" id="${this.uid}-view" role="tabpanel" aria-labelledby="${this.uid}-tab-${this.view}">
              ${this.view === "router" ? this.renderRouterView() : this.renderStoreView()}
            </div>
          </section>`
        : nothing}
      <button
        type="button"
        class="launcher"
        aria-expanded=${this.open ? "true" : "false"}
        aria-controls=${this.open ? panelId : nothing}
        @click=${() => (this.open ? this.close() : this.show())}
      >
        Devtools
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-devtools": LitMaterialDevtools;
  }
}
