import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./one-time-code.js";

describe("lit-material-one-time-code (SSR)", () => {
  it("renders the boxes, the value and the input", async () => {
    const out = await collectResult(
      render(html`<lit-material-one-time-code label="Code" value="12" length="4" group-size="2"></lit-material-one-time-code>`),
    );
    assert.equal(out.match(/part="cell"/g)?.length, 4);
    assert.match(out, />(<!--[^>]*-->)?1(<!--[^>]*-->)?<\/span/);
    assert.equal(out.match(/ gap"/g)?.length, 1);
    assert.match(out, /autocomplete="one-time-code"/);
  });
});
