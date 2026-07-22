import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSpeedDial } from "./speed-dial.js";
import { LitMaterialSpeedDialAction } from "./speed-dial-action.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-speed-dial (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSpeedDial());
  });

  it("renders a declarative shadow root with a labeled trigger and a slotted action", async () => {
    const out = await renderToString(html`
      <lit-material-speed-dial label="Actions">
        <svg slot="icon" viewBox="0 0 24 24"></svg>
        <lit-material-speed-dial-action label="Share"></lit-material-speed-dial-action>
      </lit-material-speed-dial>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-label="Actions"/);
    assert.match(out, /aria-expanded="false"/);
    assert.match(out, /<lit-material-speed-dial-action/);
  });

  it("reflects the open and disabled attributes", async () => {
    const out = await renderToString(html`<lit-material-speed-dial label="Actions" open disabled></lit-material-speed-dial>`);
    assert.match(out, /<lit-material-speed-dial[^>]*\bopen\b/);
    assert.match(out, /<lit-material-speed-dial[^>]*\bdisabled\b/);
    assert.match(out, /aria-expanded="true"/);
  });
});

describe("lit-material-speed-dial-action (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSpeedDialAction());
  });

  it("renders a declarative shadow root with an aria-labeled button", async () => {
    const out = await renderToString(html`<lit-material-speed-dial-action label="Share"></lit-material-speed-dial-action>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-label="Share"/);
  });

  it("reflects the disabled attribute onto the button", async () => {
    const out = await renderToString(html`<lit-material-speed-dial-action disabled></lit-material-speed-dial-action>`);
    assert.match(out, /<lit-material-speed-dial-action[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
