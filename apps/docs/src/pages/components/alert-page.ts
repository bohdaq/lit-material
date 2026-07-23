import "@lit-material/alert";
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
    options: ["info", "success", "warning", "error"],
    default: "info",
  },
  { kind: "boolean", key: "dismissible", label: "Dismissible", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-alert variant=${state.variant as string} ?dismissible=${state.dismissible as boolean} style="width: 360px;">
      <span slot="title">Heads up</span>
      Something worth your attention just happened.
    </lit-material-alert>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`variant="${state.variant}"`, state.dismissible ? "dismissible" : null].filter(Boolean).join(" ");
  return `<lit-material-alert ${attrs}>\n  <span slot="title">Heads up</span>\n  Something worth your attention just happened.\n</lit-material-alert>`;
}

@customElement("docs-alert-page")
export class DocsAlertPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Alert</h1>
      <p>A persistent inline/page-level banner — distinct from the snackbar toast.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2>Variants</h2>
        <lit-material-alert variant="info" style="width: 360px;">A new version is available.</lit-material-alert>
        <lit-material-alert variant="success" style="width: 360px;">Your changes have been saved.</lit-material-alert>
        <lit-material-alert variant="warning" dismissible style="width: 360px;">
          <span slot="title">Storage almost full</span>
          You're using 92% of your storage.
        </lit-material-alert>
        <lit-material-alert variant="error" dismissible style="width: 360px;">
          <span slot="title">Upload failed</span>
          The file exceeds the 10 MB limit.
          <button slot="action">Try again</button>
        </lit-material-alert>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-alert-page": DocsAlertPage;
  }
}
