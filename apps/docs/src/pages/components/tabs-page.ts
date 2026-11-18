import "@lit-material/tabs";
import "@lit-material/tree";
import type { TabDragDetail } from "@lit-material/tabs";
import type { LitMaterialTree } from "@lit-material/tree";
import { LitElement, html, nothing } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, state } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "selected", label: "Selected tab", options: ["0", "1", "2"], default: "0" },
  { kind: "boolean", key: "photosDisabled", label: "Disable “Photos” tab", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-tabs selected=${state.selected as string}>
      <lit-material-tab>Music</lit-material-tab>
      <lit-material-tab>Videos</lit-material-tab>
      <lit-material-tab ?disabled=${state.photosDisabled as boolean}>Photos</lit-material-tab>
    </lit-material-tabs>
    ${["Music", "Videos", "Photos"].map(
      (name, i) => html`<lit-material-tab-panel ?selected=${String(i) === state.selected}><p>${name} panel</p></lit-material-tab-panel>`,
    )}
  `;
}

function markup(state: PlaygroundState): string {
  const disabled = state.photosDisabled ? " disabled" : "";
  return `<lit-material-tabs selected="${state.selected}">\n  <lit-material-tab>Music</lit-material-tab>\n  <lit-material-tab>Videos</lit-material-tab>\n  <lit-material-tab${disabled}>Photos</lit-material-tab>\n</lit-material-tabs>\n${["Music", "Videos", "Photos"]
    .map((name, i) => `<lit-material-tab-panel${String(i) === state.selected ? " selected" : ""}>${name} panel</lit-material-tab-panel>`)
    .join("\n")}`;
}

@customElement("docs-tabs-page")
export class DocsTabsPage extends LitElement {
  @state() private docs = [
    { name: "Overview", dirty: false, pinned: true },
    { name: "GET /v1/invoices", dirty: false },
    { name: "POST /v1/payments", dirty: true },
    { name: "GET /v1/customers/42", dirty: false },
    { name: "DELETE /v1/sessions", dirty: false },
    { name: "PATCH /v1/accounts/7", dirty: true },
    { name: "GET /v1/plans", dirty: false },
  ];
  @state() private current = 2;
  @state() private saved = ["health.yaml", "login.yaml"];
  @state() private savedNote = "";
  private added = 0;

  private moveDoc(from: number, to: number): void {
    const docs = [...this.docs];
    const [moved] = docs.splice(from, 1);
    docs.splice(to, 0, moved!);
    if (this.current === from) this.current = to;
    this.docs = docs;
  }

  private closeDoc(index: number): void {
    this.docs = this.docs.filter((_, i) => i !== index);
    this.current = Math.min(this.current > index ? this.current - 1 : this.current, this.docs.length - 1);
  }

  private addDoc(): void {
    this.docs = [...this.docs, { name: `New request ${++this.added}`, dirty: false, pinned: false }];
    this.current = this.docs.length - 1;
  }

  static override styles = [pageStyles];

  private get savedTree(): LitMaterialTree | null {
    return this.renderRoot.querySelector("#saved");
  }

  /** While a tab is dragged out of the strip, the tree shows where it would be saved. */
  private readonly trackTab = (e: PointerEvent): void => {
    const tree = this.savedTree;
    if (!tree) return;
    const r = tree.getBoundingClientRect();
    const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8;
    tree.showDropIndicator(over ? tree.dropPlaceAt(null, e.clientY) : null);
  };

  private readonly stopTracking = (): void => {
    window.removeEventListener("pointermove", this.trackTab);
    window.removeEventListener("pointerup", this.stopTracking, true);
    this.savedTree?.showDropIndicator(null);
  };

  private onTabOut(): void {
    window.addEventListener("pointermove", this.trackTab);
    window.addEventListener("pointerup", this.stopTracking, true);
  }

  private onTabDrop(e: CustomEvent<TabDragDetail>): void {
    e.preventDefault();
    const tree = e.currentTarget as LitMaterialTree;
    const name = this.docs[e.detail.index]?.name ?? "";
    const drop = tree.dropPlaceAt(null, e.detail.clientY);
    const saved = this.saved.filter((n) => n !== name);
    let at = saved.length;
    if (drop) {
      const target = saved.indexOf(drop.target.dataset.name ?? "");
      if (target !== -1) at = drop.place === "before" ? target : target + 1;
    }
    saved.splice(at, 0, name);
    this.saved = saved;
    this.savedNote = `Saved ${name}`;
  }

  override render() {
    return html`
      <h1>Tabs</h1>
      <p>WAI-ARIA tabs pattern, automatic activation, sliding indicator. Optional <code>lit-material-tab-panel</code> siblings are paired by index and shown for the selected tab.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: block;">
        <h2>Open documents</h2>
        <p><code>scrollable</code> keeps tabs at their width and keeps the selected one in view, fading the edges where tabs are hidden; <code>closable</code> tabs close from the ×, Delete or a middle click; <code>dirty</code> marks unsaved changes; <code>reorderable</code> tabs move by drag or Alt+Shift+Arrow keys.</p>
        <lit-material-tabs scrollable reorderable .selected=${this.current}
          @reorder=${(e: CustomEvent) => this.moveDoc(e.detail.from, e.detail.to)}
          @tabdragout=${() => this.onTabOut()}
          @change=${(e: Event) => (this.current = (e.target as HTMLElement & { selected: number }).selected)}
          @close=${(e: Event) => this.closeDoc(Array.from((e.currentTarget as HTMLElement).querySelectorAll("lit-material-tab")).indexOf(e.target as never))}>
          ${this.docs.map((d) => html`<lit-material-tab closable ?dirty=${d.dirty} ?pinned=${d.pinned}>${d.name}</lit-material-tab>`)}
          <button slot="end" class="add" aria-label="New tab" @click=${() => this.addDoc()}>+</button>
        </lit-material-tabs>
        <p>
          <code>pinned</code> keeps a tab first, compact and without a close button (Overview). Drag a tab near the row's ends to
          scroll it. Drag a tab out of the strip and it fires <code>tabdragout</code>; release it over the list below, which
          accepts it by calling <code>preventDefault()</code> on <code>tabdrop</code> and saves the request there (the tree's
          <code>dropPlaceAt()</code> and <code>showDropIndicator()</code> show where).
        </p>
        <div style="max-width: 320px; border: 1px dashed var(--md-sys-color-outline-variant); border-radius: 12px; padding: 4px 0;">
          <lit-material-tree id="saved" aria-label="Saved requests" @tabdrop=${(e: CustomEvent<TabDragDetail>) => this.onTabDrop(e)}>
            ${this.saved.map((n) => html`<lit-material-tree-item data-name=${n}><span slot="label">${n}</span></lit-material-tree-item>`)}
          </lit-material-tree>
        </div>
        <p><output>${this.savedNote || nothing}</output></p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tabs-page": DocsTabsPage;
  }
}
