import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./index.js";

describe("lit-material-diff (SSR)", () => {
  it("renders the changed lines from attributes", async () => {
    const out = await collectResult(render(html`<lit-material-diff original="a\nb" modified="a\nc"></lit-material-diff>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<tr class="removed">/);
    assert.match(out, /Removed: (<!--[^>]*-->)*<\/span>(<!--[^>]*-->)*b/);
    assert.match(out, /Added: (<!--[^>]*-->)*<\/span>(<!--[^>]*-->)*c/);
  });

  it("renders a change list and a merge view from JSON attributes", async () => {
    const changes = JSON.stringify([{ path: "$.name", kind: "changed", before: "a", after: "b" }]);
    const sides = JSON.stringify([{ label: "Mine", text: "x" }, { label: "Base", text: "y" }]);
    const out = await collectResult(
      render(html`<lit-material-change-list changes=${changes}></lit-material-change-list><lit-material-merge-view base="1" sides=${sides}></lit-material-merge-view>`),
    );
    assert.match(out, /\$\.name/);
    assert.match(out, /<del>(<!--[^>]*-->)*a/);
    assert.match(out, /Mine/);
    assert.match(out, /1 new or changed, 1 dropped/);
  });
});
