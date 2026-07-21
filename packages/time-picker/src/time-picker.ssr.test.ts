import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTimePicker } from "./time-picker.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-time-picker (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTimePicker());
  });

  it("renders a declarative shadow root containing the dialog, dial, and actions", async () => {
    const out = await renderToString(html`<lit-material-time-picker></lit-material-time-picker>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<dialog/);
    assert.match(out, /class="dial"/);
    assert.match(out, /Cancel/);
    assert.match(out, />\s*OK\s*</);
  });

  it("syncs the hour/minute fields from value on first render, without calling show()", async () => {
    // Dynamically interpolated text (${...} bindings, unlike literal
    // template text such as "Cancel"/"OK") renders wrapped in Lit SSR's
    // <!--lit-part-->...<!--/lit-part--> markers, so the regex has to
    // tolerate those between the tag's `>` and the actual text.
    const out = await renderToString(html`<lit-material-time-picker value="14:05"></lit-material-time-picker>`);
    assert.match(out, /class="field hour[^"]*"[^>]*>\s*<!--lit-part-->2<!--\/lit-part-->/);
    assert.match(out, /class="field minute[^"]*"[^>]*>\s*<!--lit-part-->05<!--\/lit-part-->/);
  });

  it("renders the AM/PM toggle by default (hourCycle=12), omits it for hourCycle=24", async () => {
    const withPeriod = await renderToString(html`<lit-material-time-picker></lit-material-time-picker>`);
    assert.match(withPeriod, /class="period-toggle"/);

    const without = await renderToString(html`<lit-material-time-picker hour-cycle="24"></lit-material-time-picker>`);
    assert.doesNotMatch(without, /class="period-toggle"/);
  });

  it("renders a 24-value inner+outer ring for hourCycle=24, a 12-value ring otherwise", async () => {
    const twelveHour = await renderToString(html`<lit-material-time-picker value="09:00"></lit-material-time-picker>`);
    assert.match(twelveHour, /class="dial-number[^"]*"[^>]*>\s*<!--lit-part-->9<!--\/lit-part-->/);
    assert.doesNotMatch(twelveHour, /class="dial-number[^"]*"[^>]*>\s*<!--lit-part-->18<!--\/lit-part-->/);

    const twentyFourHour = await renderToString(
      html`<lit-material-time-picker value="09:00" hour-cycle="24"></lit-material-time-picker>`,
    );
    assert.match(twentyFourHour, /class="dial-number[^"]*"[^>]*>\s*<!--lit-part-->9<!--\/lit-part-->/);
    assert.match(twentyFourHour, /class="dial-number[^"]*"[^>]*>\s*<!--lit-part-->18<!--\/lit-part-->/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-time-picker open></lit-material-time-picker>`);
    assert.match(out, /<lit-material-time-picker[^>]*\bopen\b/);
  });
});
