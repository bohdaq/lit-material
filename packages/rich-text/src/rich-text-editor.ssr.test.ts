import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { registerTranslation } from "@lit-material/core/localize.js";
import { LitMaterialRichTextEditor } from "./rich-text-editor.js";

const ssr = (template: ReturnType<typeof html>): Promise<string> => collectResult(render(template));
/** Server output without Lit's hydration comments, for readable assertions. */
const plain = (out: string): string => out.replace(/<!--[^>]*-->/g, "");

describe("lit-material-rich-text-editor (SSR)", () => {
  it("constructs without a browser and is form-associated", () => {
    assert.doesNotThrow(() => new LitMaterialRichTextEditor());
    assert.equal(LitMaterialRichTextEditor.formAssociated, true);
  });

  it("renders a declarative shadow root with a labelled toolbar and textbox", async () => {
    const out = plain(await ssr(html`<lit-material-rich-text-editor label="Notes"></lit-material-rich-text-editor>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="toolbar"[^>]*aria-label="Formatting"/s);
    assert.match(out, /role="textbox"/);
    assert.match(out, /aria-multiline="true"/);
    assert.match(out, /aria-labelledby="lit-material-rich-text-label-\d+"/);
    assert.match(out, /<span class="label" part="label" id="lit-material-rich-text-label-\d+"\s*>Notes<\/span>/);
    assert.match(out, /aria-label="Bold"[^>]*aria-pressed="false"/s);
  });

  it("server-renders the sanitized value inside the (not yet editable) surface", async () => {
    const value = '<h2>Hi</h2><p onclick="x()">a <b>bold</b> <a href="javascript:alert(1)">bad</a> <a href="https://ok.test">ok</a></p><script>alert(1)</script><ul><li>one</li></ul>';
    const out = plain(await ssr(html`<lit-material-rich-text-editor label="Notes" value=${value}></lit-material-rich-text-editor>`));
    const content = /<div[^>]*role="textbox"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/.exec(out)?.[1] ?? "";
    assert.match(out, /contenteditable="false"/);
    assert.equal(
      content,
      '<h2>Hi</h2><p>a <strong>bold</strong> bad <a href="https://ok.test">ok</a></p><ul><li>one</li></ul>',
    );
    // (The host keeps the value attribute as authored; the rendered content is clean.)
    assert.doesNotMatch(content, /alert|onclick|javascript/);
  });

  it("reflects state into ARIA: required, disabled, readonly, error", async () => {
    const out = plain(
      await ssr(html`<lit-material-rich-text-editor label="Notes" required disabled readonly error error-text="Too short"></lit-material-rich-text-editor>`),
    );
    assert.match(out, /aria-required="true"/);
    assert.match(out, /aria-disabled="true"/);
    assert.match(out, /aria-readonly="true"/);
    assert.match(out, /aria-invalid="true"/);
    assert.match(out, /Too short/);
  });

  it("shows supporting text and a character counter", async () => {
    const out = plain(await ssr(html`<lit-material-rich-text-editor supporting-text="Markdown shortcuts work" maxlength="20" value=${"<p>hello</p>"}></lit-material-rich-text-editor>`));
    assert.match(out, /Markdown shortcuts work/);
    assert.match(out, /5 \/ 20/);
  });

  it("renders toolbar labels in the element's language", async () => {
    registerTranslation({ $code: "x-test", "richText.bold": "Fett (test)", "richText.toolbar": "Werkzeuge (test)" });
    const out = plain(await ssr(html`<lit-material-rich-text-editor lang="x-test"></lit-material-rich-text-editor>`));
    assert.match(out, /aria-label="Fett \(test\)"/);
    assert.match(out, /aria-label="Werkzeuge \(test\)"/);
  });
});
