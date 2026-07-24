import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTimestamp } from "./timestamp.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-timestamp (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTimestamp());
  });

  it("renders a declarative shadow root with a time element and datetime attribute", async () => {
    const out = await renderToString(
      html`<lit-material-timestamp date="2024-01-15T10:30:00.000Z" locale="en-US"></lit-material-timestamp>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<time[^>]*datetime="2024-01-15T10:30:00\.000Z"/);
  });

  it("renders relative text and a title tooltip when relative is set", async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const out = await renderToString(
      html`<lit-material-timestamp date="${twoHoursAgo}" relative locale="en-US"></lit-material-timestamp>`,
    );
    assert.match(out, /2 hours ago/);
    assert.match(out, /title="/);
  });
});
