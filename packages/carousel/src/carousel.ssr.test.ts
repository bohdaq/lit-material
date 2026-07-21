import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCarousel } from "./carousel.js";
import "./carousel-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-carousel (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCarousel());
  });

  it("renders a declarative shadow root with a scrollable track and a slot", async () => {
    const out = await renderToString(html`
      <lit-material-carousel>
        <lit-material-carousel-item>One</lit-material-carousel-item>
      </lit-material-carousel>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="track"/);
    assert.match(out, /<slot/);
  });

  it("reflects role=region and aria-roledescription=carousel onto the host tag", async () => {
    const out = await renderToString(html`<lit-material-carousel></lit-material-carousel>`);
    assert.match(out, /<lit-material-carousel[^>]*role="region"/);
    assert.match(out, /<lit-material-carousel[^>]*aria-roledescription="carousel"/);
  });

  it("renders prev/next buttons by default", async () => {
    const out = await renderToString(html`<lit-material-carousel></lit-material-carousel>`);
    assert.match(out, /class="nav-button prev"/);
    assert.match(out, /class="nav-button next"/);
  });

  it("omits the nav buttons when showNavButtons is false", async () => {
    const out = await renderToString(html`<lit-material-carousel .showNavButtons=${false}></lit-material-carousel>`);
    // Matching against a rendered element (`class="nav-button ...`), not
    // just the substring "nav-button" — that also appears, unconditionally,
    // in the component's own static <style> block.
    assert.doesNotMatch(out, /class="nav-button/);
  });
});
