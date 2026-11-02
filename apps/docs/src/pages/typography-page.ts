import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import typography from "@lit-material/tokens/css/typography.css?inline";
import { pageStyles } from "../styles/page-styles.js";

const ROLES = ["display", "headline", "title", "body", "label"];
const SIZES = ["large", "medium", "small"];

@customElement("docs-typography-page")
export class DocsTypographyPage extends LitElement {
  // Page-level classes don't reach into a shadow root: include the sheet.
  static override styles = [pageStyles, unsafeCSS(typography)];

  override render() {
    return html`
      <h1>Typography</h1>
      <section>
        <h2>Text styles</h2>
        <p>
          <code>@lit-material/tokens/css/typography.css</code> (optional) has one class per M3 text style, so a heading's level and
          its size are separate: <code>&lt;h2 class="md-typescale-title-large"&gt;</code>.
        </p>
        <div style="display: grid; gap: 8px; width: 100%;">
          ${ROLES.flatMap((role) =>
            SIZES.map((size) => html`<div class=${`md-typescale-${role}-${size}`}>${role} ${size}</div>`),
          )}
        </div>
      </section>
      <section>
        <h2>Content</h2>
        <div class="lit-material-content" style="max-width: 62ch;">
          <h3>Plain HTML, styled</h3>
          <p>Wrap Markdown output or a CMS's HTML in <code>.lit-material-content</code>: headings, lists, quotes, code and links get M3 styles and spacing.</p>
          <ul>
            <li>Install the tokens once</li>
            <li>Import <a href="#">only what you use</a></li>
          </ul>
          <blockquote>Prose stays readable in light and dark.</blockquote>
          <pre tabindex="0"><code>npm install @lit-material/tokens</code></pre>
          <dl>
            <dt>Version</dt>
            <dd>0.0.2</dd>
          </dl>
          <p><small>Small print uses <code>body-small</code>.</small></p>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-typography-page": DocsTypographyPage;
  }
}
