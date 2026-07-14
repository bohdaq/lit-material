import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialNavigationRail } from "./navigation-rail.js";
import "./navigation-rail-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-navigation-rail (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialNavigationRail());
  });

  it("renders a declarative shadow root with a fab slot and an items container", async () => {
    const out = await renderToString(html`
      <lit-material-navigation-rail>
        <lit-material-navigation-rail-item>Music</lit-material-navigation-rail-item>
      </lit-material-navigation-rail>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot name="fab">/);
    assert.match(out, /class="items top"/);
  });
});
