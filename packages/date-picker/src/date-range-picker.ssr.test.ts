import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDateRangePicker } from "./date-range-picker.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-date-range-picker (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDateRangePicker());
  });

  it("renders a declarative shadow root containing the dialog, calendar grid, and actions", async () => {
    const out = await renderToString(html`<lit-material-date-range-picker></lit-material-date-range-picker>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<dialog/);
    assert.match(out, /role="grid"/);
    assert.match(out, /Cancel/);
    assert.match(out, />\s*OK\s*</);
  });

  it("shows a placeholder headline and a disabled OK button with no range", async () => {
    const out = await renderToString(html`<lit-material-date-range-picker></lit-material-date-range-picker>`);
    assert.match(out, /Select dates/);
    assert.match(out, /part="ok-button"[^>]*\bdisabled\b/);
  });

  it("syncs the headline, view month, and range highlight from start/end on first render", async () => {
    const out = await renderToString(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    assert.match(out, /June 2026/);
    assert.match(out, /class="day[^"]*range-start[^"]*"[^>]*data-iso="2026-06-10"/);
    assert.match(out, /class="day[^"]*range-end[^"]*"[^>]*data-iso="2026-06-20"/);
    assert.match(out, /class="day-cell in-range"/);
  });

  it("disables day cells outside min/max", async () => {
    const out = await renderToString(html`
      <lit-material-date-range-picker start="2026-06-15" min="2026-06-10" max="2026-06-20"></lit-material-date-range-picker>
    `);
    assert.match(out, /data-iso="2026-06-09"[^>]*\bdisabled\b/);
    assert.match(out, /data-iso="2026-06-21"[^>]*\bdisabled\b/);
    assert.doesNotMatch(out, /data-iso="2026-06-15"[^>]*\bdisabled\b/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-date-range-picker open></lit-material-date-range-picker>`);
    assert.match(out, /<lit-material-date-range-picker[^>]*\bopen\b/);
  });

  it("docked variant renders the range with no <dialog>", async () => {
    const out = await renderToString(
      html`<lit-material-date-range-picker
        variant="docked"
        start="2026-06-10"
        end="2026-06-20"
      ></lit-material-date-range-picker>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.doesNotMatch(out, /<dialog/);
    assert.match(out, /class="day[^"]*range-start[^"]*"[^>]*data-iso="2026-06-10"/);
  });
});
