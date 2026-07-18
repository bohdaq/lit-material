import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSegmentedButtonGroup } from "./segmented-button-group.js";
import "./segmented-button.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-segmented-button-group (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSegmentedButtonGroup());
  });

  it("renders a declarative shadow root with a slot", async () => {
    const out = await renderToString(html`
      <lit-material-segmented-button-group>
        <lit-material-segmented-button selected>Day</lit-material-segmented-button>
        <lit-material-segmented-button>Week</lit-material-segmented-button>
      </lit-material-segmented-button-group>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot/);
  });
});
