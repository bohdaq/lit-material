import "@lit-material/icon";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "size", label: "Size", options: ["small", "medium", "large"], default: "medium" },
  {
    kind: "select",
    key: "color",
    label: "Color",
    options: ["inherit", "info", "success", "warning", "error"],
    default: "inherit",
  },
];

function preview(state: PlaygroundState) {
  return html`<lit-material-icon size=${state.size as string} color=${state.color as string}>★</lit-material-icon>`;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-icon size="${state.size}" color="${state.color}">★</lit-material-icon>`;
}

@customElement("docs-icon-page")
export class DocsIconPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Icon</h1>
      <p>A consistent sizing/color wrapper for icon content — ships no icon set of its own.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: flex; gap: 16px; align-items: center;">
        <h2 style="width: 100%;">Sizes</h2>
        <lit-material-icon size="small">★</lit-material-icon>
        <lit-material-icon size="medium">★</lit-material-icon>
        <lit-material-icon size="large">★</lit-material-icon>
      </section>

      <section style="display: flex; gap: 16px; align-items: center; margin-top: 1rem;">
        <h2 style="width: 100%;">Colors</h2>
        <lit-material-icon color="info">●</lit-material-icon>
        <lit-material-icon color="success">●</lit-material-icon>
        <lit-material-icon color="warning">●</lit-material-icon>
        <lit-material-icon color="error">●</lit-material-icon>
      </section>

      <section style="margin-top: 1rem;">
        <h2>Labeled (meaningful, not decorative)</h2>
        <lit-material-icon label="Verified" color="success" size="large">✓</lit-material-icon>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-icon-page": DocsIconPage;
  }
}
