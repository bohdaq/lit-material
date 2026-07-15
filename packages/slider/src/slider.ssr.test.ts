import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSlider } from "./slider.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-slider (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialSlider());
    assert.equal(LitMaterialSlider.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native range input", async () => {
    const out = await renderToString(html`<lit-material-slider value="30"></lit-material-slider>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input[^>]*type="range"/);
  });

  it("reflects the disabled attribute onto the inner input", async () => {
    const out = await renderToString(html`<lit-material-slider disabled></lit-material-slider>`);
    assert.match(out, /<lit-material-slider[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });

  it("positions the thumb according to value/min/max", async () => {
    const out = await renderToString(
      html`<lit-material-slider min="0" max="200" value="50"></lit-material-slider>`,
    );
    assert.match(out, /inset-inline-start: 25%/);
  });
});
