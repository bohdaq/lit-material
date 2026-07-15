import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDivider } from "./divider.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-divider (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDivider());
  });

  it("renders a declarative shadow root with role=separator, no aria-orientation by default", async () => {
    const out = await renderToString(html`<lit-material-divider></lit-material-divider>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-divider[^>]*role="separator"/);
    assert.doesNotMatch(out, /aria-orientation/);
  });

  it("sets aria-orientation=vertical when orientation is vertical", async () => {
    const out = await renderToString(html`<lit-material-divider orientation="vertical"></lit-material-divider>`);
    assert.match(out, /aria-orientation="vertical"/);
  });

  it("reflects inset-start/inset-end attributes", async () => {
    const out = await renderToString(html`<lit-material-divider inset-start inset-end></lit-material-divider>`);
    assert.match(out, /<lit-material-divider[^>]*inset-start/);
    assert.match(out, /<lit-material-divider[^>]*inset-end/);
  });
});
