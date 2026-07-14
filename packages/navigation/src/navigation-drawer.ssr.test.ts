import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialNavigationDrawer } from "./navigation-drawer.js";
import "./navigation-drawer-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-navigation-drawer (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialNavigationDrawer());
  });

  it("renders a standard drawer as a plain <nav>, no <dialog>", async () => {
    const out = await renderToString(html`
      <lit-material-navigation-drawer>
        <lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>
      </lit-material-navigation-drawer>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<nav/);
    // The component's own doc comment (inside the <style> block) mentions
    // "<dialog>" in prose, immediately closed with ">" — the real element
    // always carries attributes, so it's always followed by whitespace
    // instead, which is what distinguishes the two here.
    assert.doesNotMatch(out, /<dialog\s/);
  });

  it("renders a modal drawer wrapped in a native <dialog>", async () => {
    const out = await renderToString(html`
      <lit-material-navigation-drawer variant="modal">
        <lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>
      </lit-material-navigation-drawer>
    `);
    assert.match(out, /<dialog\s/);
    assert.match(out, /<nav/);
  });
});
