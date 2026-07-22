import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialRating } from "./rating.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-rating (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialRating());
    assert.equal(LitMaterialRating.formAssociated, true);
  });

  it("renders a declarative shadow root with a native range input by default", async () => {
    const out = await renderToString(html`<lit-material-rating label="Rate this"></lit-material-rating>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /type="range"/);
    assert.match(out, /aria-label="Rate this"/);
  });

  it("renders no input and role=img in readonly mode", async () => {
    const out = await renderToString(
      html`<lit-material-rating value="3.5" readonly label="Average rating"></lit-material-rating>`,
    );
    assert.doesNotMatch(out, /type="range"/);
    assert.match(out, /role="img"/);
    assert.match(out, /aria-label="Average rating: 3.5 out of 5"/);
  });

  it("reflects the disabled attribute onto the input", async () => {
    const out = await renderToString(html`<lit-material-rating disabled></lit-material-rating>`);
    assert.match(out, /<lit-material-rating[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });
});
