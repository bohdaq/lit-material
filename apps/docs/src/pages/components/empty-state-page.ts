import "@lit-material/empty-state";
import "@lit-material/button";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "text", key: "headline", label: "Headline", default: "No upstreams yet" },
  { kind: "text", key: "body", label: "Guidance", default: "Add an [[upstream]] section to rws.config.toml, then reload." },
  { kind: "select", key: "size", label: "Size", options: ["standard", "compact"], default: "standard" },
  { kind: "boolean", key: "action", label: "Action", default: true },
];

const preview = (s: PlaygroundState) => html`<lit-material-empty-state headline=${s.headline as string} size=${s.size as string}>
  ${s.body}
  ${s.action ? html`<lit-material-button slot="actions">Reload</lit-material-button>` : ""}
</lit-material-empty-state>`;

const markup = (s: PlaygroundState) =>
  `<lit-material-empty-state headline="${s.headline}" size="${s.size}">\n  ${s.body}${s.action ? `\n  <lit-material-button slot="actions">Reload</lit-material-button>` : ""}\n</lit-material-empty-state>`;

@customElement("docs-empty-state-page")
export class DocsEmptyStatePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Empty state</h1>
      <p>What a view would show and how to get there, in place of a blank panel.</p>
      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-empty-state-page": DocsEmptyStatePage;
  }
}
