import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./jump-links.js";

describe("lit-material-jump-links (SSR)", () => {
  it("renders anchor links on the server", async () => {
    const links = [{ id: "install", text: "Install", depth: 2 }, { id: "docker", text: "Docker", depth: 3 }];
    const out = await collectResult(render(html`<lit-material-jump-links .links=${links}></lit-material-jump-links>`));
    assert.match(out, /href="#install"/);
    assert.match(out, /href="#docker"/);
    assert.match(out, /aria-label="On this page"/);
  });

  it("takes links as a JSON attribute", async () => {
    const links = JSON.stringify([{ id: "install", text: "Install" }]);
    const out = await collectResult(render(html`<lit-material-jump-links links=${links}></lit-material-jump-links>`));
    assert.match(out, /href="#install"/);
    assert.match(out, /links="\[\{&quot;id&quot;/);
  });
});
