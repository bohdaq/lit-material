import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDescriptionList } from "./description-list.js";
import { LitMaterialDescriptionListGroup } from "./description-list-group.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-description-list (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDescriptionList());
  });

  it("renders a declarative shadow root with role=list", async () => {
    const out = await renderToString(html`
      <lit-material-description-list>
        <lit-material-description-list-group>
          <span slot="term">Status</span>
          Active
        </lit-material-description-list-group>
      </lit-material-description-list>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="list"/);
  });
});

describe("lit-material-description-list-group (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDescriptionListGroup());
  });

  it("renders role=listitem and term/definition roles", async () => {
    const out = await renderToString(html`
      <lit-material-description-list-group>
        <span slot="term">Status</span>
        Active
      </lit-material-description-list-group>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="listitem"/);
    assert.match(out, /role="term"/);
    assert.match(out, /role="definition"/);
  });
});
