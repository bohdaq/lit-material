import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialWorldMap } from "./world-map.js";
import { COUNTRIES } from "./countries.js";

describe("world-map (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialWorldMap());
  });

  it("renders every country, the shading and the table on the server", async () => {
    const out = await collectResult(render(html`<lit-material-world-map label="Visitors" .data=${{ US: 4, FR: 1 }}></lit-material-world-map>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.equal(out.match(/<path/g)?.length, Object.keys(COUNTRIES).length);
    assert.match(out, /--level: 90%/);
    assert.match(out, /--level: 54%/);
    assert.match(out, /aria-label="Visitors. Highest: United States: 4; France: 1"/);
    assert.match(out, /<th scope="row">(<!--[^>]*-->)*France(<!--[^>]*-->)*<\/th>/);
  });

  it("renders data given as a JSON attribute", async () => {
    const out = await collectResult(render(html`<lit-material-world-map data=${JSON.stringify({ MT: 3 })}></lit-material-world-map>`));
    assert.match(out, /Malta: 3/);
  });

  it("renders with no data", async () => {
    const out = await collectResult(render(html`<lit-material-world-map></lit-material-world-map>`));
    assert.match(out, /aria-label="World map: no data"/);
  });
});
