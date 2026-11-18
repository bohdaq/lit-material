import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialUpdateBanner } from "./update-banner.js";

describe("lit-material-update-banner (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialUpdateBanner());
  });

  it("renders a status with the message and buttons", async () => {
    const out = await collectResult(render(html`<lit-material-update-banner version="1.3.0"></lit-material-update-banner>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-update-banner[^>]*role="status"/);
    assert.match(out, /Version 1\.3\.0 is available/);
    assert.match(out, /Restart to update/);
  });

  it("renders download progress", async () => {
    const out = await collectResult(render(html`<lit-material-update-banner version="1.3.0" state="downloading" progress="0.5"></lit-material-update-banner>`));
    assert.match(out, /<progress[^>]*value="0.5"/);
    assert.doesNotMatch(out, /Restart to update/);
  });
});
