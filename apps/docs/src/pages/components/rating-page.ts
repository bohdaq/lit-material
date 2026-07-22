import "@lit-material/rating";
import type { LitMaterialRating } from "@lit-material/rating";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, query, state } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "precision", label: "Precision", options: ["1", "0.5"], default: "1" },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-rating
      label="Rate this product"
      value="3"
      precision=${state.precision as string}
      ?disabled=${state.disabled as boolean}
    ></lit-material-rating>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`precision="${state.precision}"`, state.disabled ? "disabled" : null].filter(Boolean).join(" ");
  return `<lit-material-rating label="Rate this product" ${attrs}></lit-material-rating>`;
}

@customElement("docs-rating-page")
export class DocsRatingPage extends LitElement {
  static override styles = [pageStyles];

  @query("#demo-rating") private demoRating?: LitMaterialRating;

  @state() private valueLog = "";

  private readonly handleChange = (): void => {
    this.valueLog = `Selected: ${this.demoRating?.value}`;
  };

  override render() {
    return html`
      <h1>Rating</h1>
      <p>A row of icons for reading or picking a value — built on a native range input, with a hover preview.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Half-star precision, with change tracking</h2>
        <lit-material-rating
          id="demo-rating"
          label="Rate this product"
          precision="0.5"
          value="3.5"
          @change=${this.handleChange}
        ></lit-material-rating>
        <span style="margin-inline-start: 12px;">${this.valueLog}</span>
      </section>

      <section>
        <h2>Readonly display</h2>
        <lit-material-rating value="4.2" precision="0.5" readonly label="Average rating"></lit-material-rating>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-rating-page": DocsRatingPage;
  }
}
