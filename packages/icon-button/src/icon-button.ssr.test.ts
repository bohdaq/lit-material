import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialIconButton } from "./icon-button.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-icon-button (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialIconButton());
    assert.equal(LitMaterialIconButton.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native button", async () => {
    const out = await renderToString(
      html`<lit-material-icon-button aria-label="Search"></lit-material-icon-button>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<button/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(
      html`<lit-material-icon-button aria-label="Search" disabled></lit-material-icon-button>`,
    );
    assert.match(out, /<lit-material-icon-button[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });

  it("exposes aria-pressed on the inner button when toggle is set", async () => {
    const out = await renderToString(
      html`<lit-material-icon-button toggle aria-label="Mute"></lit-material-icon-button>`,
    );
    assert.match(out, /aria-pressed="false"/);
  });

  it("renders an anchor with rel=noopener when target=_blank", async () => {
    const out = await renderToString(
      html`<lit-material-icon-button aria-label="Docs" href="https://example.com" target="_blank"></lit-material-icon-button>`,
    );
    assert.match(out, /<a[^>]*href="https:\/\/example\.com"/);
    assert.match(out, /rel="noopener noreferrer"/);
  });
});
