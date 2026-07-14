import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTooltip } from "./tooltip.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-tooltip (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTooltip());
  });

  it("renders a declarative shadow root with role=tooltip and popover=manual", async () => {
    const out = await renderToString(html`<lit-material-tooltip>More info</lit-material-tooltip>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-tooltip[^>]*role="tooltip"/);
    assert.match(out, /<lit-material-tooltip[^>]*popover="manual"/);
    assert.match(out, /<slot/);
  });

  it("auto-assigns an id when none is set", async () => {
    const out = await renderToString(html`<lit-material-tooltip>More info</lit-material-tooltip>`);
    assert.match(out, /<lit-material-tooltip[^>]*id="lit-material-tooltip-\d+"/);
  });

  it("keeps an explicitly-set id", async () => {
    const out = await renderToString(html`<lit-material-tooltip id="my-tooltip">More info</lit-material-tooltip>`);
    assert.match(out, /<lit-material-tooltip[^>]*id="my-tooltip"/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-tooltip open>More info</lit-material-tooltip>`);
    assert.match(out, /<lit-material-tooltip[^>]*\bopen\b/);
  });
});
