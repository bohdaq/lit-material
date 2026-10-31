import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialColorSchemeToggle } from "./color-scheme-toggle.js";
import { colorSchemeBootScript, getColorScheme } from "./color-scheme.js";

describe("color-scheme (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialColorSchemeToggle());
  });

  it("renders the toggle", async () => {
    const out = await collectResult(render(html`<lit-material-color-scheme-toggle></lit-material-color-scheme-toggle>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /lit-material-icon-button/);
  });

  it("gives a boot script that names the key safely", () => {
    assert.match(colorSchemeBootScript('a"b'), /getItem\("a\\"b"\)/);
    assert.doesNotMatch(colorSchemeBootScript("</script>"), /<\/script>/);
    assert.equal(typeof getColorScheme(), "string");
  });
});
