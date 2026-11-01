import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./dual-list-selector.js";

describe("lit-material-dual-list-selector (SSR)", () => {
  it("renders both listboxes", async () => {
    const items = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
    const out = await collectResult(render(html`<lit-material-dual-list-selector .items=${items} .selected=${["b"]}></lit-material-dual-list-selector>`));
    assert.equal(out.match(/role="listbox"/g)?.length, 2);
    assert.match(out, /Alpha/);
    assert.match(out, /Beta/);
  });

  it("renders items given as JSON attributes", async () => {
    const items = JSON.stringify([{ value: "a", label: "Apples" }, { value: "b", label: "Bananas" }]);
    const out = await collectResult(render(html`<lit-material-dual-list-selector items=${items} selected=${JSON.stringify(["b"])}></lit-material-dual-list-selector>`));
    assert.match(out, /Apples/);
    assert.match(out, /Bananas/);
  });
});
