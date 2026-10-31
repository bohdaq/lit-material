import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./truncate.js";

describe("lit-material-truncate (SSR)", () => {
  it("renders the start and the tail", async () => {
    const out = await collectResult(render(html`<lit-material-truncate position="middle" value="/var/lib/rws/data/certs/example.com.pem"></lit-material-truncate>`));
    assert.match(out, /class="start"/);
    assert.match(out, /class="tail"[^>]*>(<!--[^>]*-->)*\.com\.pem</);
  });
});
