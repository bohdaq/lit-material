import "@lit-material/list";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "boolean", key: "interactive", label: "Interactive", default: true },
  { kind: "boolean", key: "selected", label: "Selected", default: false },
  { kind: "boolean", key: "disabled", label: "Disabled", default: false },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-list style="width: 320px; box-shadow: var(--md-sys-elevation-level1);">
      <lit-material-list-item
        ?interactive=${state.interactive as boolean}
        ?selected=${state.selected as boolean}
        ?disabled=${state.disabled as boolean}
      >
        <span slot="leading" aria-hidden="true">🏠</span>
        List item
      </lit-material-list-item>
    </lit-material-list>
  `;
}

function markup(state: PlaygroundState): string {
  const attrs = [
    state.interactive ? "interactive" : null,
    state.selected ? "selected" : null,
    state.disabled ? "disabled" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `<lit-material-list>\n  <lit-material-list-item ${attrs}>List item</lit-material-list-item>\n</lit-material-list>`;
}

@customElement("docs-list-page")
export class DocsListPage extends LitElement {
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
      <h1>List</h1>
      <p>One / two / three-line items, with leading/trailing slots.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>

      <section>
        <h2>One / two / three-line items with dividers</h2>
        <lit-material-list style="width: 360px; box-shadow: var(--md-sys-elevation-level1);">
          <lit-material-list-item divider>Headline only</lit-material-list-item>
          <lit-material-list-item divider>
            <span slot="leading" aria-hidden="true">📁</span>
            Two-line item
            <span slot="supporting-text">With supporting text</span>
          </lit-material-list-item>
          <lit-material-list-item>
            <span slot="overline">OVERLINE</span>
            <span slot="leading" aria-hidden="true">⭐</span>
            Three-line item
            <span slot="supporting-text">Supporting text that can wrap onto a second line</span>
            <span slot="trailing">3:45pm</span>
          </lit-material-list-item>
        </lit-material-list>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-list-page": DocsListPage;
  }
}
