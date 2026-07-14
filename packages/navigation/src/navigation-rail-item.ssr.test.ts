import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialNavigationRailItem } from "./navigation-rail-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-navigation-rail-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialNavigationRailItem());
  });

  it("renders a declarative shadow root containing a button and an icon container", async () => {
    const out = await renderToString(html`<lit-material-navigation-rail-item>Music</lit-material-navigation-rail-item>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<button/);
    assert.match(out, /class="icon-container"/);
  });

  it("sets aria-current=page when selected", async () => {
    const out = await renderToString(
      html`<lit-material-navigation-rail-item selected>Music</lit-material-navigation-rail-item>`,
    );
    assert.match(out, /aria-current="page"/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(
      html`<lit-material-navigation-rail-item disabled>Music</lit-material-navigation-rail-item>`,
    );
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
