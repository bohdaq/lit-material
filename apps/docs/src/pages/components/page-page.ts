import "@lit-material/page";
import "@lit-material/top-app-bar";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement } from "lit/decorators.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [];

function preview(_state: PlaygroundState) {
  return html`
    <lit-material-page style="height: 320px; border-radius: 8px; overflow: hidden;">
      <lit-material-top-app-bar slot="header">My App</lit-material-top-app-bar>
      <nav
        slot="sidebar"
        style="width: 10rem; padding: 12px; box-sizing: border-box; background: var(--md-sys-color-surface-container, #f3edf7);"
      >
        Nav
      </nav>
      <p style="padding: 16px;">Main content goes here. Try resizing — it scrolls independently of the sidebar and header.</p>
    </lit-material-page>
  `;
}

function markup(_state: PlaygroundState): string {
  return `<lit-material-page style="height: 100vh;">\n  <lit-material-top-app-bar slot="header">My App</lit-material-top-app-bar>\n  <lit-material-navigation-drawer slot="sidebar">\n    <!-- nav items -->\n  </lit-material-navigation-drawer>\n  <p>Main content goes here.</p>\n</lit-material-page>`;
}

@customElement("docs-page-page")
export class DocsPagePage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Page</h1>
      <p>The outermost app-shell grid: a header row spanning the full width, and a sidebar/main-content row below it.</p>

      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-page-page": DocsPagePage;
  }
}
