import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialBinaryViewer } from "./binary-viewer.js";
import { hexDump } from "./binary.js";

describe("lit-material-binary-viewer (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialBinaryViewer());
  });

  it("renders what the content is, without touching Blob or URL", async () => {
    const out = await collectResult(
      render(html`<lit-material-binary-viewer content-type="application/pdf" filename="report.pdf" .data=${new Uint8Array([37, 80, 68, 70])}></lit-material-binary-viewer>`),
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /PDF/);
    assert.match(out, /application\/pdf/);
    assert.doesNotMatch(out, /blob:/);
    assert.doesNotMatch(out, /<object/);
  });

  it("dumps bytes in Node", () => {
    assert.equal(hexDump(new Uint8Array([72, 105])), "00000000  48 69                                             |Hi|");
  });
});
