import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialAvatar } from "./avatar.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-avatar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialAvatar());
  });

  it("renders a declarative shadow root with an image when src is set", async () => {
    const out = await renderToString(
      html`<lit-material-avatar src="https://example.com/avatar.png" alt="Jane Doe"></lit-material-avatar>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<img[^>]*src="https:\/\/example\.com\/avatar\.png"/);
    assert.match(out, /role="img"/);
    assert.match(out, /aria-label="Jane Doe"/);
  });

  it("renders initials text when there is no src", async () => {
    const out = await renderToString(html`<lit-material-avatar initials="JD"></lit-material-avatar>`);
    assert.doesNotMatch(out, /<img/);
    assert.match(out, /class="initials"[^>]*>\s*<!--lit-part-->JD<!--\/lit-part-->/);
  });

  it("renders the default icon fallback when neither src nor initials is set", async () => {
    const out = await renderToString(html`<lit-material-avatar></lit-material-avatar>`);
    assert.doesNotMatch(out, /<img/);
    assert.doesNotMatch(out, /class="initials"/);
    assert.match(out, /class="icon"/);
  });

  it("reflects size and shape", async () => {
    const out = await renderToString(html`<lit-material-avatar size="large" shape="square"></lit-material-avatar>`);
    assert.match(out, /<lit-material-avatar[^>]*size="large"/);
    assert.match(out, /<lit-material-avatar[^>]*shape="square"/);
  });
});
