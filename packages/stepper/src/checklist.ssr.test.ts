import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./checklist.js";

describe("lit-material-checklist (SSR)", () => {
  it("renders the heading, the bar and the items", async () => {
    const out = await collectResult(
      render(html`<lit-material-checklist heading="Get started"><lit-material-checklist-item label="Install" done></lit-material-checklist-item></lit-material-checklist>`),
    );
    assert.match(out, /Get started/);
    assert.match(out, /role="progressbar"/);
    assert.match(out, /Install/);
  });
});
