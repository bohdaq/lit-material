import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSelectOption } from "./select-option.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-select-option (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSelectOption());
  });

  it("renders a declarative shadow root with the slotted label", async () => {
    const out = await renderToString(html`<lit-material-select-option value="s">Small</lit-material-select-option>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="label"/);
  });

  it("renders a checkmark when selected", async () => {
    const out = await renderToString(
      html`<lit-material-select-option value="s" selected>Small</lit-material-select-option>`,
    );
    assert.match(out, /class="checkmark"/);
  });
});
