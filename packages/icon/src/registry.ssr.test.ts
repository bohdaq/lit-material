import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./icon.js";
import { registerIcons } from "./registry.js";

describe("lit-material-icon name (SSR)", () => {
  it("renders the registered SVG on the server", async () => {
    registerIcons({ dot: '<svg viewBox="0 0 2 2"><circle cx="1" cy="1" r="1"/></svg>' });
    const out = await collectResult(render(html`<lit-material-icon name="dot"></lit-material-icon>`));
    assert.match(out, /<svg viewBox="0 0 2 2" fill="currentColor" aria-hidden="true" focusable="false">/);
  });
});
