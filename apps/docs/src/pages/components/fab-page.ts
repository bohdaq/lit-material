import "@lit-material/fab";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "size", label: "Size", options: ["small", "regular", "large"], default: "regular" },
  {
    kind: "select",
    key: "color",
    label: "Color",
    options: ["primary", "secondary", "tertiary", "surface"],
    default: "primary",
  },
  { kind: "boolean", key: "extended", label: "Extended", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-fab
      size=${state.size as string}
      color=${state.color as string}
      ?extended=${state.extended as boolean}
      ?disabled=${state.disabled as boolean}
      aria-label="Compose"
    >
      <span slot="icon">✏️</span>${state.extended ? "Compose" : ""}
    </lit-material-fab>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    `size="${state.size}"`,
    `color="${state.color}"`,
    state.extended ? "extended" : null,
    state.disabled ? "disabled" : null,
  ]
    .filter(Boolean)
    .join(" ");
  const label = state.extended ? "Compose" : "";
  return `<lit-material-fab ${attrs} aria-label="Compose">\n  <span slot="icon">✏️</span>${label}\n</lit-material-fab>`;
}

@customElement("docs-fab-page")
export class DocsFabPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    h2 {
      width: 100%;
    }
  `;

  override render() {
    return html`
      <h1>FAB</h1>
      <p>Floating action button — small/regular/large sizes, four color variants, extended label.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-fab-page": DocsFabPage;
  }
}
