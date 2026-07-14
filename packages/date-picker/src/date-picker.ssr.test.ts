import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDatePicker } from "./date-picker.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-date-picker (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDatePicker());
  });

  it("renders a declarative shadow root containing the dialog, calendar grid, and actions", async () => {
    const out = await renderToString(html`<lit-material-date-picker></lit-material-date-picker>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<dialog/);
    assert.match(out, /role="grid"/);
    assert.match(out, /Cancel/);
    assert.match(out, />\s*OK\s*</);
  });

  it("shows a placeholder headline with no value", async () => {
    const out = await renderToString(html`<lit-material-date-picker></lit-material-date-picker>`);
    assert.match(out, /Enter date/);
  });

  it("syncs the headline and view month from `value` on first render, without calling show()", async () => {
    const out = await renderToString(html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`);
    assert.match(out, /June 2026/);
    // The 15th should be rendered as the selected day. Matched loosely
    // around the class list (rather than an exact string) since it could
    // also pick up a "today" class if this test happens to run on that
    // exact date.
    assert.match(out, /class="day[^"]*selected[^"]*"[^>]*data-iso="2026-06-15"/);
  });

  it("disables day cells outside min/max", async () => {
    const out = await renderToString(html`
      <lit-material-date-picker value="2026-06-15" min="2026-06-10" max="2026-06-20"></lit-material-date-picker>
    `);
    assert.match(out, /data-iso="2026-06-09"[^>]*\bdisabled\b/);
    assert.match(out, /data-iso="2026-06-21"[^>]*\bdisabled\b/);
    assert.doesNotMatch(out, /data-iso="2026-06-15"[^>]*\bdisabled\b/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-date-picker open></lit-material-date-picker>`);
    assert.match(out, /<lit-material-date-picker[^>]*\bopen\b/);
  });
});
