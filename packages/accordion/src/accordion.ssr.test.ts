import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialAccordion } from "./accordion.js";
import { LitMaterialAccordionPanel } from "./accordion-panel.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-accordion (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialAccordion());
  });

  it("renders a declarative shadow root wrapping slotted panels", async () => {
    const out = await renderToString(html`
      <lit-material-accordion>
        <lit-material-accordion-panel><span slot="header">A</span>Panel A</lit-material-accordion-panel>
      </lit-material-accordion>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-accordion-panel>/);
  });
});

describe("lit-material-accordion-panel (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialAccordionPanel());
  });

  it("renders a declarative shadow root with a disclosure header and content region", async () => {
    const out = await renderToString(
      html`<lit-material-accordion-panel><span slot="header">Shipping</span>Ships fast.</lit-material-accordion-panel>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-expanded="false"/);
    assert.match(out, /role="region"/);
  });

  it("reflects the expanded attribute and aria-expanded", async () => {
    const out = await renderToString(html`<lit-material-accordion-panel expanded></lit-material-accordion-panel>`);
    assert.match(out, /<lit-material-accordion-panel[^>]*\bexpanded\b/);
    assert.match(out, /aria-expanded="true"/);
  });

  it("reflects the disabled attribute onto the header button", async () => {
    const out = await renderToString(html`<lit-material-accordion-panel disabled></lit-material-accordion-panel>`);
    assert.match(out, /<lit-material-accordion-panel[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
