import "@lit-material/tabs";
import { LitElement, html } from "lit";
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
    { name: "GET /v1/invoices", dirty: false },
    { name: "POST /v1/payments", dirty: true },
    { name: "GET /v1/customers/42", dirty: false },
    { name: "DELETE /v1/sessions", dirty: false },
    { name: "PATCH /v1/accounts/7", dirty: true },
    { name: "GET /v1/plans", dirty: false },
  ];
  @state() private current = 1;
  private added = 0;

  private closeDoc(index: number): void {
    this.docs = this.docs.filter((_, i) => i !== index);
    this.current = Math.min(this.current > index ? this.current - 1 : this.current, this.docs.length - 1);
  }

  private addDoc(): void {
    this.docs = [...this.docs, { name: `New request ${++this.added}`, dirty: false }];
    this.current = this.docs.length - 1;
  }

  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Tabs</h1>
      <p>WAI-ARIA tabs pattern, automatic activation, sliding indicator. Optional <code>lit-material-tab-panel</code> siblings are paired by index and shown for the selected tab.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: block;">
        <h2>Open documents</h2>
        <p><code>scrollable</code> keeps tabs at their width and keeps the selected one in view; <code>closable</code> tabs close from the ×, Delete or a middle click; <code>dirty</code> marks unsaved changes.</p>
        <lit-material-tabs scrollable .selected=${this.current}
          @change=${(e: Event) => (this.current = (e.target as HTMLElement & { selected: number }).selected)}
          @close=${(e: Event) => this.closeDoc(Array.from((e.currentTarget as HTMLElement).querySelectorAll("lit-material-tab")).indexOf(e.target as never))}>
          ${this.docs.map((d) => html`<lit-material-tab closable ?dirty=${d.dirty}>${d.name}</lit-material-tab>`)}
          <button slot="end" class="add" aria-label="New tab" @click=${() => this.addDoc()}>+</button>
        </lit-material-tabs>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tabs-page": DocsTabsPage;
  }
}
