import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSkeleton } from "./skeleton.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-skeleton (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSkeleton());
  });

  it("renders a declarative shadow root with an aria-hidden placeholder block", async () => {
    const out = await renderToString(html`<lit-material-skeleton></lit-material-skeleton>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-hidden="true"/);
  });

  it("reflects variant and animation", async () => {
    const out = await renderToString(
      html`<lit-material-skeleton variant="rectangular" animation="none"></lit-material-skeleton>`,
    );
    assert.match(out, /<lit-material-skeleton[^>]*variant="rectangular"/);
    assert.match(out, /<lit-material-skeleton[^>]*animation="none"/);
  });

  it("renders width/height as inline style when set", async () => {
    const out = await renderToString(html`<lit-material-skeleton width="200px" height="20px"></lit-material-skeleton>`);
    assert.match(out, /style="width: 200px;height: 20px;"/);
  });
});
