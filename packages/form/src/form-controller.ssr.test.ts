import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./form-test-host.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("FormController (SSR)", () => {
  it("constructs and renders without a browser, without throwing", async () => {
    const out = await renderToString(html`<lit-material-form-test-host></lit-material-form-test-host>`);
    assert.match(out, /shadowrootmode="open"/);
    // hostConnected() (where the controller attaches and does its first
    // checkValidity()) isn't part of @lit-labs/ssr's rendering pass any
    // more than hostUpdate() is (see @lit-material/task) — so the
    // server-rendered output always reflects the untouched default,
    // `valid = true`, regardless of the form's actual (unreachable,
    // server-side) required fields.
    assert.match(out, />valid</);
  });
});
