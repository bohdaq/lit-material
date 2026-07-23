import "@lit-material/file-upload";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "boolean", key: "multiple", label: "Multiple", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-file-upload
      ?multiple=${state.multiple as boolean}
      ?disabled=${state.disabled as boolean}
      style="width: 360px;"
    ></lit-material-file-upload>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [state.multiple ? "multiple" : null, state.disabled ? "disabled" : null].filter(Boolean).join(" ");
  return `<lit-material-file-upload${attrs ? " " + attrs : ""}></lit-material-file-upload>`;
}

@customElement("docs-file-upload-page")
export class DocsFileUploadPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>File Upload</h1>
      <p>Drag-and-drop or click-to-browse file picking — a single file, or several with <code>multiple</code>.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Custom label + accept filter</h2>
        <lit-material-file-upload
          label="Drop a résumé here, or click to browse (PDF only)"
          accept="application/pdf"
          style="width: 360px;"
        ></lit-material-file-upload>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-file-upload-page": DocsFileUploadPage;
  }
}
