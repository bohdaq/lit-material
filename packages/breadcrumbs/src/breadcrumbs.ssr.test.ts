import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialBreadcrumbs } from "./breadcrumbs.js";
import { LitMaterialBreadcrumbItem } from "./breadcrumb-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-breadcrumbs (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialBreadcrumbs());
  });

  it("renders a declarative shadow root with a labeled nav wrapping an ol", async () => {
    const out = await renderToString(html`
      <lit-material-breadcrumbs>
        <lit-material-breadcrumb-item href="/">Home</lit-material-breadcrumb-item>
      </lit-material-breadcrumbs>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<nav[^>]*aria-label="Breadcrumb"/);
    assert.match(out, /<ol/);
  });
});

describe("lit-material-breadcrumb-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialBreadcrumbItem());
  });

  it("renders a link when href is set", async () => {
    const out = await renderToString(html`<lit-material-breadcrumb-item href="/home">Home</lit-material-breadcrumb-item>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="listitem"/);
    assert.match(out, /<a[^>]*href="\/home"/);
  });

  it("renders plain text with aria-current=page when current", async () => {
    const out = await renderToString(html`<lit-material-breadcrumb-item current>Settings</lit-material-breadcrumb-item>`);
    assert.doesNotMatch(out, /<a[^>]*class="crumb"/);
    assert.match(out, /aria-current="page"/);
  });
});
