import "@lit-material/skeleton";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "variant", label: "Variant", options: ["text", "circular", "rectangular", "rounded"], default: "text" },
  { kind: "select", key: "animation", label: "Animation", options: ["pulse", "wave", "none"], default: "pulse" },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-skeleton
      variant=${state.variant as string}
      animation=${state.animation as string}
      style="width: 240px;"
    ></lit-material-skeleton>
  `;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-skeleton variant="${state.variant}" animation="${state.animation}"></lit-material-skeleton>`;
}

@customElement("docs-skeleton-page")
export class DocsSkeletonPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Skeleton</h1>
      <p>A loading placeholder — text, circular, rectangular, or rounded, pulsing, waving, or static.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>A typical card placeholder</h2>
        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px;">
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <lit-material-skeleton variant="circular"></lit-material-skeleton>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0;">
              <lit-material-skeleton variant="text" width="60%"></lit-material-skeleton>
              <lit-material-skeleton variant="text" width="40%"></lit-material-skeleton>
            </div>
          </div>
          <lit-material-skeleton variant="rounded" height="160px" style="width: 100%;"></lit-material-skeleton>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-skeleton-page": DocsSkeletonPage;
  }
}
