import "@lit-material/switch";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "boolean", key: "checked", label: "Checked", default: false },
  { kind: "boolean", key: "error", label: "Error", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-switch
      ?checked=${state.checked as boolean}
      ?error=${state.error as boolean}
      ?disabled=${state.disabled as boolean}
      aria-label="Demo switch"
    ></lit-material-switch>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [state.checked ? "checked" : null, state.error ? "error" : null, state.disabled ? "disabled" : null]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-switch ${attrs} aria-label="Demo switch"></lit-material-switch>`;
}

@customElement("docs-switch-page")
export class DocsSwitchPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    h2 {
      width: 100%;
    }
  `;

  override render() {
    return html`
      <h1>Switch</h1>
      <p>A native <code>&lt;input type="checkbox" role="switch"&gt;</code> under the hood.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>With thumb icons</h2>
        <lit-material-switch aria-label="Notifications off">
          <span slot="icon" aria-hidden="true">✕</span>
        </lit-material-switch>
        <lit-material-switch aria-label="Notifications on" checked>
          <span slot="icon" aria-hidden="true">✕</span>
          <span slot="selected-icon" aria-hidden="true">✓</span>
        </lit-material-switch>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-switch-page": DocsSwitchPage;
  }
}
