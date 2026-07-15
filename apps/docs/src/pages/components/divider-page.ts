import "@lit-material/divider";
import "@lit-material/button";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "orientation", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  { kind: "boolean", key: "insetStart", label: "Inset start", default: false },
  { kind: "boolean", key: "insetEnd", label: "Inset end", default: false },
];

function preview(state: PlaygroundState) {
  const vertical = state.orientation === "vertical";
  return html`
    <div style=${vertical ? "height: 48px;" : "width: 240px;"}>
      <lit-material-divider
        orientation=${state.orientation as string}
        ?inset-start=${state.insetStart as boolean}
        ?inset-end=${state.insetEnd as boolean}
      ></lit-material-divider>
    </div>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    state.orientation === "vertical" ? `orientation="vertical"` : null,
    state.insetStart ? "inset-start" : null,
    state.insetEnd ? "inset-end" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-divider ${attrs}></lit-material-divider>`;
}

@customElement("docs-divider-page")
export class DocsDividerPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2rem;
      height: 32px;
    }
    h2 {
      width: 100%;
    }
  `;

  override render() {
    return html`
      <h1>Divider</h1>
      <p>Full-bleed or inset, horizontal or vertical. <code>role="separator"</code>, purely visual.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Vertical, between buttons</h2>
        <lit-material-button variant="text">Cut</lit-material-button>
        <lit-material-divider orientation="vertical"></lit-material-divider>
        <lit-material-button variant="text">Copy</lit-material-button>
        <lit-material-divider orientation="vertical"></lit-material-divider>
        <lit-material-button variant="text">Paste</lit-material-button>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-divider-page": DocsDividerPage;
  }
}
