import "@lit-material/segmented-button";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "boolean", key: "selected", label: "Selected", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-segmented-button-group>
      <lit-material-segmented-button ?selected=${state.selected as boolean} ?disabled=${state.disabled as boolean}>
        Segment
      </lit-material-segmented-button>
      <lit-material-segmented-button>Other</lit-material-segmented-button>
    </lit-material-segmented-button-group>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [state.selected ? "selected" : null, state.disabled ? "disabled" : null].filter(Boolean).join(" ");
  return `<lit-material-segmented-button-group>\n  <lit-material-segmented-button ${attrs}>Segment</lit-material-segmented-button>\n  <lit-material-segmented-button>Other</lit-material-segmented-button>\n</lit-material-segmented-button-group>`;
}

@customElement("docs-segmented-button-page")
export class DocsSegmentedButtonPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Segmented Button</h1>
      <p>
        A connected row of toggleable segments — single-select (radio-like) by default, or
        <code>multiselect</code> (checkbox-like). Arrow keys move a roving tabindex; Enter/Space
        activates.
      </p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Single-select (default)</h2>
        <lit-material-segmented-button-group>
          <lit-material-segmented-button selected>Day</lit-material-segmented-button>
          <lit-material-segmented-button>Week</lit-material-segmented-button>
          <lit-material-segmented-button>Month</lit-material-segmented-button>
          <lit-material-segmented-button>Year</lit-material-segmented-button>
        </lit-material-segmented-button-group>
      </section>

      <section>
        <h2>Multi-select</h2>
        <lit-material-segmented-button-group multiselect>
          <lit-material-segmented-button selected>Bold</lit-material-segmented-button>
          <lit-material-segmented-button>Italic</lit-material-segmented-button>
          <lit-material-segmented-button selected>Underline</lit-material-segmented-button>
        </lit-material-segmented-button-group>
      </section>

      <section>
        <h2>Disabled segment</h2>
        <lit-material-segmented-button-group>
          <lit-material-segmented-button selected>List</lit-material-segmented-button>
          <lit-material-segmented-button disabled>Grid (disabled)</lit-material-segmented-button>
        </lit-material-segmented-button-group>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-segmented-button-page": DocsSegmentedButtonPage;
  }
}
