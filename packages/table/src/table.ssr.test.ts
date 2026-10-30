import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTable } from "./table.js";

describe("lit-material-table (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTable());
  });

  it("renders the whole table on the server", async () => {
    const out = await collectResult(
      render(html`<lit-material-table caption="Flags" .columns=${[{ key: "name", label: "Flag" }]} .rows=${[{ name: "beta" }]}></lit-material-table>`),
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<caption[^>]*>(<!--[^>]*-->)?Flags/);
    assert.match(out, /scope="col"/);
    assert.match(out, /beta/);
  });
});
