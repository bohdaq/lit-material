import "@lit-material/slider";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "text", key: "value", label: "Value", default: "30" },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-slider
      aria-label="Demo slider"
      value=${state.value as string}
      ?disabled=${state.disabled as boolean}
    ></lit-material-slider>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [`value="${state.value}"`, state.disabled ? "disabled" : null].filter(Boolean).join(" ");
  return `<lit-material-slider aria-label="Demo slider" ${attrs}></lit-material-slider>`;
}

@customElement("docs-slider-page")
export class DocsSliderPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    h2 {
      width: 100%;
    }
  `;

  override render() {
    return html`
      <h1>Slider</h1>
      <p>Wraps a native <code>&lt;input type="range"&gt;</code> with custom track/thumb visuals.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>Custom min/max/step</h2>
        <lit-material-slider aria-label="Brightness" min="0" max="10" step="1" value="7"></lit-material-slider>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-slider-page": DocsSliderPage;
  }
}
