import "@lit-material/autocomplete";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const fruitOptions = [
  { label: "Apple", value: "apple" },
  { label: "Apricot", value: "apricot" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry", disabled: true },
  { label: "Cherry", value: "cherry" },
  { label: "Cranberry", value: "cranberry" },
  { label: "Date", value: "date" },
  { label: "Grape", value: "grape" },
];

const controls: PlaygroundControl[] = [
  { kind: "select", key: "variant", label: "Variant", options: ["filled", "outlined"], default: "filled" },
  { kind: "text", key: "label", label: "Label", default: "Fruit" },
  { kind: "boolean", key: "required", label: "Required", default: false },
  { kind: "boolean", key: "freeText", label: "Free text", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-autocomplete
      variant=${state.variant as string}
      label=${state.label as string}
      .options=${fruitOptions}
      ?required=${state.required as boolean}
      ?free-text=${state.freeText as boolean}
      ?disabled=${state.disabled as boolean}
      style="max-width: 280px;"
    ></lit-material-autocomplete>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    `variant="${state.variant}"`,
    `label="${state.label}"`,
    state.required ? "required" : null,
    state.freeText ? "free-text" : null,
    state.disabled ? "disabled" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-autocomplete ${attrs}></lit-material-autocomplete>\n<script type="module">\n  el.options = [{ label: "Apple", value: "apple" }, ...];\n</script>`;
}

@customElement("docs-autocomplete-page")
export class DocsAutocompletePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Autocomplete</h1>
      <p>A text field that filters a data-driven option list as you type.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Error, disabled option</h2>
        <lit-material-autocomplete
          label="Fruit"
          required
          error
          error-text="Please choose a fruit"
          .options=${fruitOptions}
          style="max-width: 280px;"
        ></lit-material-autocomplete>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-autocomplete-page": DocsAutocompletePage;
  }
}
