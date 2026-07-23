import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialAlert } from "./alert.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-alert (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialAlert());
  });

  it("renders a declarative shadow root with role=status by default", async () => {
    const out = await renderToString(html`<lit-material-alert>Something happened.</lit-material-alert>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="status"/);
    assert.match(out, /<svg/);
  });

  it("renders role=alert for the error variant", async () => {
    const out = await renderToString(html`<lit-material-alert variant="error">Failed.</lit-material-alert>`);
    assert.match(out, /role="alert"/);
  });

  it("renders a close button when dismissible", async () => {
    const out = await renderToString(html`<lit-material-alert dismissible>Something happened.</lit-material-alert>`);
    assert.match(out, /class="close"/);
  });

  it("does not render a close button by default", async () => {
    const out = await renderToString(html`<lit-material-alert>Something happened.</lit-material-alert>`);
    assert.doesNotMatch(out, /class="close"/);
  });
});
