import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialStepper } from "./stepper.js";
import { LitMaterialStep } from "./step.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-stepper (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialStepper());
  });

  it("renders a declarative shadow root wrapping slotted steps", async () => {
    const out = await renderToString(html`
      <lit-material-stepper>
        <lit-material-step active><span slot="label">Account</span></lit-material-step>
        <lit-material-step><span slot="label">Shipping</span></lit-material-step>
      </lit-material-stepper>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-step[^>]*\bactive\b/);
  });
});

describe("lit-material-step (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialStep());
  });

  it("renders a declarative shadow root with the step number in the circle", async () => {
    const out = await renderToString(html`<lit-material-step step-number="3"></lit-material-step>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="circle"[^>]*>\s*<!--lit-part-->3<!--\/lit-part-->/);
  });

  it("reflects active as aria-current=step", async () => {
    const out = await renderToString(html`<lit-material-step active></lit-material-step>`);
    assert.match(out, /<lit-material-step[^>]*\bactive\b/);
    assert.match(out, /aria-current="step"/);
  });

  it("reflects the disabled attribute onto the step button", async () => {
    const out = await renderToString(html`<lit-material-step disabled></lit-material-step>`);
    assert.match(out, /<lit-material-step[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
