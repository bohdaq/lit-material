import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSwitch } from "./switch.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-switch (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialSwitch());
    assert.equal(LitMaterialSwitch.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native switch input", async () => {
    const out = await renderToString(html`<lit-material-switch aria-label="Wi-Fi"></lit-material-switch>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input[^>]*type="checkbox"/);
    assert.match(out, /role="switch"/);
  });

  it("reflects the disabled attribute onto the inner input", async () => {
    const out = await renderToString(
      html`<lit-material-switch aria-label="Wi-Fi" disabled></lit-material-switch>`,
    );
    assert.match(out, /<lit-material-switch[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });

  it("emits aria-invalid on the inner input when error is set", async () => {
    const out = await renderToString(html`<lit-material-switch aria-label="Wi-Fi" error></lit-material-switch>`);
    assert.match(out, /<lit-material-switch[^>]*\berror\b/);
    assert.match(out, /aria-invalid="true"/);
  });
});
