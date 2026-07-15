import "@lit-material/badge";
import "@lit-material/icon-button";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "text", key: "value", label: "Value (blank = small dot)", default: "" },
  { kind: "text", key: "label", label: "Accessible label", default: "" },
];

function preview(state: PlaygroundState) {
  return html`
    <span style="position: relative; display: inline-flex;">
      <lit-material-icon-button aria-label="Notifications">🔔</lit-material-icon-button>
      <lit-material-badge
        value=${state.value as string}
        label=${state.label as string}
        style="position: absolute; top: -2px; right: -2px;"
      ></lit-material-badge>
    </span>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    state.value ? `value="${state.value}"` : null,
    state.label ? `label="${state.label}"` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-badge ${attrs}></lit-material-badge>`;
}

@customElement("docs-badge-page")
export class DocsBadgePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Badge</h1>
      <p>Small dot or large numeric/text badge, typically overlaid on a corner of another element.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Clamped value</h2>
        <lit-material-badge value="150" max="99"></lit-material-badge>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-badge-page": DocsBadgePage;
  }
}
