import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./router-outlet.js";

describe("lit-material-router-outlet (SSR)", () => {
  it("renders empty on the server instead of failing the page", async () => {
    const routes = [{ path: "/", render: () => html`<p>Home</p>` }];
    const out = await collectResult(render(html`<main><lit-material-router-outlet .routes=${routes}></lit-material-router-outlet></main>`));
    assert.match(out, /<lit-material-router-outlet/);
    assert.doesNotMatch(out, /Home/);
  });
});
