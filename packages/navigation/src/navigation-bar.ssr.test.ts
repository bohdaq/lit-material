import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialNavigationBar } from "./navigation-bar.js";
import "./navigation-bar-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-navigation-bar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialNavigationBar());
  });

  it("renders a declarative shadow root with a bar container and a slot", async () => {
    const out = await renderToString(html`
      <lit-material-navigation-bar>
        <lit-material-navigation-bar-item>Music</lit-material-navigation-bar-item>
      </lit-material-navigation-bar>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="bar"/);
    assert.match(out, /<slot/);
  });
});
