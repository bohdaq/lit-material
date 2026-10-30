import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialAdaptiveNavigation } from "./adaptive-navigation.js";

describe("lit-material-adaptive-navigation (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialAdaptiveNavigation());
  });

  it("renders all three forms on the server, chosen by CSS", async () => {
    const out = await collectResult(
      render(html`<lit-material-adaptive-navigation .destinations=${[{ label: "Home" }]} .selected=${0}></lit-material-adaptive-navigation>`),
    );
    for (const tag of ["drawer", "rail", "bar"]) assert.match(out, new RegExp(`<lit-material-navigation-${tag}`));
    assert.match(out, /@media \(min-width: 840px\)/);
  });
});
