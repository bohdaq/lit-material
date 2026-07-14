import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTopAppBar } from "./top-app-bar.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-top-app-bar (SSR)", () => {
  it("constructs without a browser (no window to attach a scroll listener to)", () => {
    assert.doesNotThrow(() => new LitMaterialTopAppBar());
  });

  it("renders a declarative shadow root containing the header and slots", async () => {
    const out = await renderToString(html`<lit-material-top-app-bar>Title</lit-material-top-app-bar>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<header/);
    assert.match(out, /class="bar small"/);
    assert.match(out, /<slot name="leading">/);
    assert.match(out, /<slot name="trailing">/);
  });

  it("reflects the variant onto the bar's class", async () => {
    const out = await renderToString(
      html`<lit-material-top-app-bar variant="large">Title</lit-material-top-app-bar>`,
    );
    assert.match(out, /class="bar large"/);
  });

  it("reflects the elevated attribute when set", async () => {
    const out = await renderToString(html`<lit-material-top-app-bar elevated>Title</lit-material-top-app-bar>`);
    assert.match(out, /<lit-material-top-app-bar[^>]*\belevated\b/);
  });
});
