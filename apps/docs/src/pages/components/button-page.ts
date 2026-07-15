import "@lit-material/button";
import { LitElement, html, nothing } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, state } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  {
    kind: "select",
    key: "variant",
    label: "Variant",
    options: ["filled", "tonal", "elevated", "outlined", "text"],
    default: "filled",
  },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
  { kind: "boolean", key: "icon", label: "With icon", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-button variant=${state.variant as string} ?disabled=${state.disabled as boolean}>
      ${state.icon ? html`<span slot="icon" aria-hidden="true">★</span>` : nothing} Button
    </lit-material-button>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`variant="${state.variant}"`, state.disabled ? "disabled" : null].filter(Boolean).join(" ");
  const icon = state.icon ? `\n  <span slot="icon" aria-hidden="true">★</span>` : "";
  return `<lit-material-button ${attrs}>${icon}\n  Button\n</lit-material-button>`;
}

@customElement("docs-button-page")
export class DocsButtonPage extends LitElement {
  static override styles = [pageStyles];

  @state()
  private submitLog = "";

  private readonly handleSubmit = (event: Event): void => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    this.submitLog = `submitted: ${JSON.stringify(Object.fromEntries(data))}`;
  };

  override render() {
    return html`
      <h1>Button</h1>
      <p>Filled, outlined, text, elevated, and tonal variants.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Variants</h2>
        <lit-material-button variant="filled">Filled</lit-material-button>
        <lit-material-button variant="tonal">Tonal</lit-material-button>
        <lit-material-button variant="elevated">Elevated</lit-material-button>
        <lit-material-button variant="outlined">Outlined</lit-material-button>
        <lit-material-button variant="text">Text</lit-material-button>
      </section>

      <section>
        <h2>Disabled</h2>
        <lit-material-button variant="filled" disabled>Filled</lit-material-button>
        <lit-material-button variant="tonal" disabled>Tonal</lit-material-button>
        <lit-material-button variant="elevated" disabled>Elevated</lit-material-button>
        <lit-material-button variant="outlined" disabled>Outlined</lit-material-button>
        <lit-material-button variant="text" disabled>Text</lit-material-button>
      </section>

      <section>
        <h2>Link button</h2>
        <lit-material-button variant="filled" href="https://lit.dev" target="_blank">Open lit.dev</lit-material-button>
      </section>

      <section>
        <h2>Form participation</h2>
        <form @submit=${this.handleSubmit}>
          <input name="example" value="hello" />
          <lit-material-button type="submit" variant="filled">Submit</lit-material-button>
          <lit-material-button type="reset" variant="text">Reset</lit-material-button>
        </form>
        <pre>${this.submitLog}</pre>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-button-page": DocsButtonPage;
  }
}
