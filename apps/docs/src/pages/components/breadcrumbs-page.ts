import "@lit-material/breadcrumbs";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "select", key: "separator", label: "Separator", options: ["/", "›", "•"], default: "/" },
];

function preview(state: PlaygroundState) {
  return html`
    <lit-material-breadcrumbs style="--lit-material-breadcrumb-separator: '${state.separator}';">
      <lit-material-breadcrumb-item href="/">Home</lit-material-breadcrumb-item>
      <lit-material-breadcrumb-item href="/components">Components</lit-material-breadcrumb-item>
      <lit-material-breadcrumb-item current>Breadcrumbs</lit-material-breadcrumb-item>
    </lit-material-breadcrumbs>
  `;
}

function markup(state: PlaygroundState): string {
  return `<lit-material-breadcrumbs style="--lit-material-breadcrumb-separator: '${state.separator}';">\n  <lit-material-breadcrumb-item href="/">Home</lit-material-breadcrumb-item>\n  <lit-material-breadcrumb-item href="/components">Components</lit-material-breadcrumb-item>\n  <lit-material-breadcrumb-item current>Breadcrumbs</lit-material-breadcrumb-item>\n</lit-material-breadcrumbs>`;
}

@customElement("docs-breadcrumbs-page")
export class DocsBreadcrumbsPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Breadcrumbs</h1>
      <p>A nav landmark showing the current page's place in a hierarchy.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-breadcrumbs-page": DocsBreadcrumbsPage;
  }
}
