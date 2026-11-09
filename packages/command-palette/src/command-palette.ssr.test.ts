import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCommandPalette } from "./command-palette.js";

describe("lit-material-command-palette (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCommandPalette());
  });

  it("renders a closed dialog with the combobox", async () => {
    const out = await collectResult(render(html`<lit-material-command-palette items='[{"id":"a","label":"Run"}]'></lit-material-command-palette>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<dialog[^>]*aria-label="Command palette"/);
    assert.doesNotMatch(out, /<dialog[^>]* open/);
    assert.match(out, /role="combobox"/);
    assert.match(out, /placeholder="Search or run a command…"/);
  });
});
