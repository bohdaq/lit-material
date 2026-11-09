import "@lit-material/kbd";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

const shortcuts = ["Mod+K", "Mod+Shift+P", "Mod+Enter", "Alt+Shift+ArrowLeft", "Escape", "G I"];

@customElement("docs-kbd-page")
export class DocsKbdPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Kbd</h1>
      <p>A keyboard shortcut drawn as key caps. <code>Mod</code> is ⌘ on Apple platforms and Ctrl elsewhere; screen readers hear the keys' names.</p>
      <section>
        <h2>This platform</h2>
        <p>${shortcuts.map((k) => html`<lit-material-kbd keys=${k}></lit-material-kbd>&nbsp;&nbsp;`)}</p>
      </section>
      <section>
        <h2>Pinned</h2>
        <p>Apple: <lit-material-kbd keys="Mod+Shift+P" platform="apple"></lit-material-kbd> · Others: <lit-material-kbd keys="Mod+Shift+P" platform="other"></lit-material-kbd></p>
      </section>
      <section>
        <h2>Medium</h2>
        <p>Send the request with <lit-material-kbd keys="Mod+Enter" size="medium"></lit-material-kbd>.</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-kbd-page": DocsKbdPage;
  }
}
