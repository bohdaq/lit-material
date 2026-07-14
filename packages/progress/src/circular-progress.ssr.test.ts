import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCircularProgress } from "./circular-progress.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-circular-progress (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCircularProgress());
  });

  it("renders role=progressbar and an svg with track/indicator circles", async () => {
    const out = await renderToString(
      html`<lit-material-circular-progress aria-label="Loading"></lit-material-circular-progress>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-circular-progress[^>]*role="progressbar"/);
    assert.match(out, /<svg/);
    assert.match(out, /class="track"/);
    assert.match(out, /class="indicator determinate"/);
  });

  it("reflects value onto aria-valuenow", async () => {
    const out = await renderToString(
      html`<lit-material-circular-progress aria-label="Loading" value="0.5"></lit-material-circular-progress>`,
    );
    assert.match(out, /aria-valuenow="0.5"/);
  });

  it("omits aria-valuenow when indeterminate and applies the spin class", async () => {
    const out = await renderToString(
      html`<lit-material-circular-progress aria-label="Loading" indeterminate></lit-material-circular-progress>`,
    );
    assert.doesNotMatch(out, /aria-valuenow/);
    assert.match(out, /class="spin"/);
  });
});
