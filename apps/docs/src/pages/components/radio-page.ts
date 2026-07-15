import "@lit-material/radio";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
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
    <lit-material-radio
      name="playground-radio"
      ?checked=${state.checked as boolean}
      ?error=${state.error as boolean}
      ?disabled=${state.disabled as boolean}
      aria-label="Demo radio"
    ></lit-material-radio>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [state.checked ? "checked" : null, state.error ? "error" : null, state.disabled ? "disabled" : null]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-radio name="group" ${attrs} aria-label="Demo radio"></lit-material-radio>`;
}

@customElement("docs-radio-page")
export class DocsRadioPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Radio</h1>
      <p>Mutual exclusion + roving tabindex within a group sharing a <code>name</code>.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Group (click or arrow keys to change selection)</h2>
        <lit-material-radio name="size-demo" value="s" aria-label="Small"></lit-material-radio>
        <lit-material-radio name="size-demo" value="m" aria-label="Medium" checked></lit-material-radio>
        <lit-material-radio name="size-demo" value="l" aria-label="Large"></lit-material-radio>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-radio-page": DocsRadioPage;
  }
}
