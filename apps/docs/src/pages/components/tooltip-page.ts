import "@lit-material/tooltip";
import "@lit-material/icon-button";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";
import { pageStyles } from "../../styles/page-styles.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "showDelay", label: "Show delay (ms)", options: ["0", "500", "1000"], default: "500" },
  { kind: "select", key: "hideDelay", label: "Hide delay (ms)", options: ["0", "200", "500"], default: "200" },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-icon-button id="playground-tooltip-anchor" aria-label="Info">ℹ️</lit-material-icon-button>
    <lit-material-tooltip
      anchor="playground-tooltip-anchor"
      show-delay=${state.showDelay as string}
      hide-delay=${state.hideDelay as string}
    >
      Hover to see this tooltip
    </lit-material-tooltip>
  `;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-icon-button id="anchor" aria-label="Info">ℹ️</lit-material-icon-button>
<lit-material-tooltip anchor="anchor" show-delay="${state.showDelay}" hide-delay="${state.hideDelay}">
  Hover to see this tooltip
</lit-material-tooltip>`;
}

@customElement("docs-tooltip-page")
export class DocsTooltipPage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      docs-playground {
        margin-top: 1rem;
      }
    `,
  ];

  override render() {
    return html`
      <h1>Tooltip</h1>
      <p>Plain tooltip, hover/focus-driven, built on the native Popover API. Hover the icon below to see it.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-tooltip-page": DocsTooltipPage;
  }
}
