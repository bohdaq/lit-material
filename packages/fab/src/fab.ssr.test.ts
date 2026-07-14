import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialFab } from "./fab.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-fab (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialFab());
  });

  it("renders a declarative shadow root containing a native button", async () => {
    const out = await renderToString(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<button/);
    assert.match(out, /aria-label="Compose"/);
  });

  it("renders an anchor when href is set", async () => {
    const out = await renderToString(
      html`<lit-material-fab aria-label="Compose" href="/compose"></lit-material-fab>`,
    );
    assert.match(out, /<a[^>]*href="\/compose"/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(html`<lit-material-fab aria-label="Compose" disabled></lit-material-fab>`);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });

  it("reflects size onto the host attribute", async () => {
    const out = await renderToString(html`<lit-material-fab aria-label="Compose" size="large"></lit-material-fab>`);
    assert.match(out, /<lit-material-fab[^>]*size="large"/);
  });
});
