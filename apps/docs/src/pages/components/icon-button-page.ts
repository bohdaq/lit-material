import "@lit-material/icon-button";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  {
    kind: "select",
    key: "variant",
    label: "Variant",
    options: ["standard", "filled", "tonal", "outlined"],
    default: "standard",
  },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-icon-button
      variant=${state.variant as string}
      ?disabled=${state.disabled as boolean}
      aria-label="Search"
    >
      🔍
    </lit-material-icon-button>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`variant="${state.variant}"`, state.disabled ? "disabled" : null].filter(Boolean).join(" ");
  return `<lit-material-icon-button ${attrs} aria-label="Search">🔍</lit-material-icon-button>`;
}

@customElement("docs-icon-button-page")
export class DocsIconButtonPage extends LitElement {
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
      <h1>Icon Button</h1>
      <p>Toggle + standard icon buttons.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Toggle (click to flip state)</h2>
        <lit-material-icon-button toggle aria-label="Mute">
          <span slot="icon">🔇</span>
          <span slot="selected-icon">🔊</span>
        </lit-material-icon-button>
        <lit-material-icon-button toggle variant="filled" aria-label="Favorite">
          <span slot="icon">♡</span>
          <span slot="selected-icon">♥</span>
        </lit-material-icon-button>
      </section>

      <section>
        <h2>Link</h2>
        <lit-material-icon-button aria-label="Open lit.dev" href="https://lit.dev" target="_blank">↗</lit-material-icon-button>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-icon-button-page": DocsIconButtonPage;
  }
}
