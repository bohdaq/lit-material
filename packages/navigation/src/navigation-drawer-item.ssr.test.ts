import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialNavigationDrawerItem } from "./navigation-drawer-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-navigation-drawer-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialNavigationDrawerItem());
  });

  it("renders a declarative shadow root containing a button by default", async () => {
    const out = await renderToString(html`<lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<button/);
  });

  it("renders an anchor when href is set", async () => {
    const out = await renderToString(
      html`<lit-material-navigation-drawer-item href="/inbox">Inbox</lit-material-navigation-drawer-item>`,
    );
    assert.match(out, /<a[^>]*href="\/inbox"/);
  });

  it("sets aria-current=page when selected", async () => {
    const out = await renderToString(
      html`<lit-material-navigation-drawer-item selected>Inbox</lit-material-navigation-drawer-item>`,
    );
    assert.match(out, /aria-current="page"/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(
      html`<lit-material-navigation-drawer-item disabled>Inbox</lit-material-navigation-drawer-item>`,
    );
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
