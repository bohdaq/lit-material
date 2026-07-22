import "@lit-material/sidebar";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "position", label: "Position", options: ["start", "end"], default: "start" },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-sidebar position=${state.position as string} panel-width="10rem" style="width: 100%;">
      <nav
        slot="panel"
        style="background: var(--md-sys-color-surface-container, #f3edf7); padding: 12px; border-radius: 8px;"
      >
        Filters
      </nav>
      <div style="background: var(--md-sys-color-surface-container-low, #f7f2fa); padding: 12px; border-radius: 8px;">
        Results
      </div>
    </lit-material-sidebar>
  `;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-sidebar position="${state.position}" panel-width="10rem">\n  <nav slot="panel">Filters</nav>\n  <div>Results</div>\n</lit-material-sidebar>`;
}

@customElement("docs-sidebar-page")
export class DocsSidebarPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Sidebar</h1>
      <p>A two-pane layout — a fixed-width side panel next to flexible main content — that stacks responsively.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-sidebar-page": DocsSidebarPage;
  }
}
