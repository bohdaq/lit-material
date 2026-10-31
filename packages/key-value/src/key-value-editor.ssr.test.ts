import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./key-value-editor.js";

describe("lit-material-key-value-editor (SSR)", () => {
  it("renders a row per entry and the add button", async () => {
    const out = await collectResult(
      render(html`<lit-material-key-value-editor .entries=${[{ key: "app", value: "web" }]}></lit-material-key-value-editor>`),
    );
    assert.match(out, /data-row=/);
    assert.match(out, /Remove app/);
    assert.match(out, /lit-material-button[^>]*class="add"/);
  });
});
