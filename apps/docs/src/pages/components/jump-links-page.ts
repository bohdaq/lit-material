import "@lit-material/jump-links";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

@customElement("docs-jump-links-page")
export class DocsJumpLinksPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Jump links</h1>
      <section>
        <p>An "On this page" list: plain anchors, with the section in view highlighted as you scroll the page.</p>
        <lit-material-jump-links .links=${[
          { id: "jl-install", text: "Install", depth: 2 },
          { id: "jl-docker", text: "Docker", depth: 3 },
          { id: "jl-config", text: "Configuration", depth: 2 },
        ]}></lit-material-jump-links>
      </section>
      ${["Install", "Docker", "Configuration"].map((t, i) => html`<section><h2 id=${["jl-install", "jl-docker", "jl-config"][i]}>${t}</h2><p style="min-height: 60vh;">Section text.</p></section>`)}
      <section>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-jump-links-page": DocsJumpLinksPage;
  }
}
