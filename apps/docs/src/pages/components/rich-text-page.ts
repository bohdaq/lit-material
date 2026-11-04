import "@lit-material/rich-text";
import type { LitMaterialRichTextEditor } from "@lit-material/rich-text";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";

const SAMPLE =
  "<h2>Release 2.4</h2><p>Fixes <strong>login</strong> on Safari and adds <a href=\"https://example.com/changelog\">a changelog</a>.</p>" +
  "<ul><li>Faster search<ul><li>Indexes are cached</li></ul></li><li>Dark mode for charts</li></ul><blockquote><p>Upgrade before 1 March.</p></blockquote>";

@customElement("docs-rich-text-page")
export class DocsRichTextPage extends LitElement {
  static override styles = [pageStyles];

  @state() private html = SAMPLE;
  @state() private markdown = "";

  private readonly onInput = (event: Event): void => {
    const editor = event.currentTarget as LitMaterialRichTextEditor;
    this.html = editor.value;
    this.markdown = editor.getMarkdown();
  };

  override render() {
    return html`
      <h1>Rich Text Editor</h1>
      <p>
        A formatting toolbar over an editable surface held to a small schema: paragraphs, two heading levels,
        lists, quotes, code blocks, bold, italic, underline, strikethrough, inline code and links. Pasted HTML is
        sanitized to that schema; the value is HTML and submits with a form.
      </p>

      <section>
        <h2>Editor</h2>
        <p>Try Ctrl/⌘+B, Ctrl/⌘+K for a link, Tab in a list, or type <code>## </code> or <code>- </code> at the start of a line.</p>
        <lit-material-rich-text-editor
          label="Release notes"
          supporting-text="Markdown shortcuts work at the start of a line"
          maxlength="2000"
          .value=${SAMPLE}
          @input=${this.onInput}
        ></lit-material-rich-text-editor>
      </section>

      <section>
        <h2>Value</h2>
        <pre>${this.html}</pre>
        ${this.markdown ? html`<h3>getMarkdown()</h3><pre>${this.markdown}</pre>` : ""}
      </section>

      <section>
        <h2>Filled, required, empty</h2>
        <lit-material-rich-text-editor variant="filled" label="Comment" placeholder="Write a comment…" required></lit-material-rich-text-editor>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-rich-text-page": DocsRichTextPage;
  }
}
