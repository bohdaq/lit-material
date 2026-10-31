import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./chip-input.js";

describe("lit-material-chip-input (SSR)", () => {
  it("renders chips and the input", async () => {
    const out = await collectResult(render(html`<lit-material-chip-input label="Tags" .values=${["a", "b"]}></lit-material-chip-input>`));
    assert.equal(out.match(/<lit-material-chip[\s>]/g)?.length, 2);
    assert.match(out, /<input/);
  });
});
