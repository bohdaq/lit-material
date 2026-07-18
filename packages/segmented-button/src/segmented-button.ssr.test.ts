import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSegmentedButton } from "./segmented-button.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-segmented-button (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSegmentedButton());
  });

  it("renders a declarative shadow root containing an aria-pressed button", async () => {
    const out = await renderToString(html`<lit-material-segmented-button>Day</lit-material-segmented-button>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-pressed="false"/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(html`<lit-material-segmented-button disabled>Day</lit-material-segmented-button>`);
    assert.match(out, /<lit-material-segmented-button[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
