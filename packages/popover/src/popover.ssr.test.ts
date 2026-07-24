import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialPopover } from "./popover.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-popover (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialPopover());
  });

  it("renders a declarative shadow root with header/content/footer containers", async () => {
    const out = await renderToString(html`
      <lit-material-popover>
        <span slot="header">Details</span>
        Some content.
      </lit-material-popover>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="header"/);
    assert.match(out, /class="content"/);
  });

  it("renders a close button when dismissible (the default)", async () => {
    const out = await renderToString(html`<lit-material-popover>Content</lit-material-popover>`);
    assert.match(out, /class="close"/);
  });
});
