import "@lit-material/chip";
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
    options: ["assist", "filter", "input", "suggestion"],
    default: "assist",
  },
  { kind: "boolean", key: "selected", label: "Selected", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-chip variant=${state.variant as string} ?selected=${state.selected as boolean} ?disabled=${state.disabled as boolean}>
      Chip
    </lit-material-chip>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`variant="${state.variant}"`, state.selected ? "selected" : null, state.disabled ? "disabled" : null]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-chip ${attrs}>Chip</lit-material-chip>`;
}

@customElement("docs-chip-page")
export class DocsChipPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Chip</h1>
      <p>Assist, filter, input, and suggestion variants; not form-associated.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Elevated / link</h2>
        <lit-material-chip elevated>Elevated</lit-material-chip>
        <lit-material-chip href="https://lit.dev" target="_blank">Open lit.dev</lit-material-chip>
      </section>

      <section>
        <h2>Input (removable; click × to remove)</h2>
        <lit-material-chip variant="input" removable>Tag one</lit-material-chip>
        <lit-material-chip variant="input" removable>Tag two</lit-material-chip>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-chip-page": DocsChipPage;
  }
}
