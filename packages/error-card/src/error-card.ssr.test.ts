import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialErrorCard } from "./error-card.js";

describe("lit-material-error-card (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialErrorCard());
  });

  it("renders the headline and the closed details into a declarative shadow root", async () => {
    const out = await collectResult(
      render(html`<lit-material-error-card headline="Host not found" details="dns error: no such host">Check the host name.</lit-material-error-card>`),
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /Host not found/);
    assert.match(out, /aria-expanded="false"/);
    assert.match(out, /class="details"[^>]*hidden/);
    assert.match(out, /dns error: no such host/);
  });

  it("renders role=alert when asked, and the open details with a copy button", async () => {
    const out = await collectResult(render(html`<lit-material-error-card alert open variant="warning" headline="x" details="raw"></lit-material-error-card>`));
    assert.match(out, /<lit-material-error-card[^>]*role="alert"/);
    assert.match(out, /aria-expanded="true"/);
    assert.match(out, /class="copy"/);
  });
});
