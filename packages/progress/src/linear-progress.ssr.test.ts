import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialLinearProgress } from "./linear-progress.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-linear-progress (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialLinearProgress());
  });

  it("renders role=progressbar with aria-value* reflecting the default determinate state", async () => {
    const out = await renderToString(html`<lit-material-linear-progress aria-label="Loading"></lit-material-linear-progress>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-linear-progress[^>]*role="progressbar"/);
    assert.match(out, /aria-valuenow="0"/);
    assert.match(out, /aria-valuemin="0"/);
    assert.match(out, /aria-valuemax="1"/);
  });

  it("reflects value onto aria-valuenow and the indicator's width", async () => {
    const out = await renderToString(
      html`<lit-material-linear-progress aria-label="Loading" value="0.5"></lit-material-linear-progress>`,
    );
    assert.match(out, /aria-valuenow="0.5"/);
    assert.match(out, /width: 50%/);
  });

  it("omits aria-valuenow when indeterminate, and renders two sliding bars", async () => {
    const out = await renderToString(
      html`<lit-material-linear-progress aria-label="Loading" indeterminate></lit-material-linear-progress>`,
    );
    assert.doesNotMatch(out, /aria-valuenow/);
    assert.match(out, /indeterminate1/);
    assert.match(out, /indeterminate2/);
  });
});
