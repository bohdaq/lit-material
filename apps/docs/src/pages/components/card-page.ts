import "@lit-material/card";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  {
    kind: "select",
    key: "variant",
    label: "Variant",
    options: ["elevated", "filled", "outlined"],
    default: "elevated",
  },
  { kind: "boolean", key: "interactive", label: "Interactive", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-card
      variant=${state.variant as string}
      ?interactive=${state.interactive as boolean}
      ?disabled=${state.disabled as boolean}
      style="width: 220px;"
    >
      <strong>Card</strong>
      <p>Holds its own content and buttons.</p>
    </lit-material-card>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`variant="${state.variant}"`, state.interactive ? "interactive" : null, state.disabled ? "disabled" : null]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-card ${attrs}>\n  <strong>Card</strong>\n  <p>Holds its own content and buttons.</p>\n</lit-material-card>`;
}

@customElement("docs-card-page")
export class DocsCardPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Card</h1>
      <p>Elevated, filled, outlined; optionally interactive (renders as a button/link).</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Link / disabled</h2>
        <lit-material-card href="https://lit.dev" target="_blank" variant="outlined" style="width: 200px;">
          <strong>Open lit.dev</strong>
          <p>Renders as a link.</p>
        </lit-material-card>
        <lit-material-card interactive disabled variant="elevated" style="width: 200px;">
          <strong>Disabled</strong>
          <p>Not clickable.</p>
        </lit-material-card>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-card-page": DocsCardPage;
  }
}
