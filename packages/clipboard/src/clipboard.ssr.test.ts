import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCopyButton } from "./copy-button.js";
import { LitMaterialClipboardCopy } from "./clipboard-copy.js";

describe("clipboard (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCopyButton());
    assert.doesNotThrow(() => new LitMaterialClipboardCopy());
  });

  it("renders a masked value as a password field", async () => {
    const out = await collectResult(render(html`<lit-material-clipboard-copy label="Token" value="x" masked></lit-material-clipboard-copy>`));
    assert.match(out, /type="password"/);
    assert.match(out, /lit-material-copy-button/);
  });
});
