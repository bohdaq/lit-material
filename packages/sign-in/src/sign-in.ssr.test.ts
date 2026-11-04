import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./sign-in.js";

describe("lit-material-sign-in (SSR)", () => {
  it("renders the sign-in form with its fields and links", async () => {
    const out = await collectResult(render(html`<lit-material-sign-in methods="password forgot"></lit-material-sign-in>`));
    assert.match(out, /<h1>.*Sign in/s);
    assert.match(out, /name="email"/);
    assert.match(out, /autocomplete="current-password"/);
    assert.match(out, /Forgot password\?/);
  });

  it("renders the code step", async () => {
    const out = await collectResult(render(html`<lit-material-sign-in mode="sign-up" awaiting-code email="a@b.c"></lit-material-sign-in>`));
    assert.match(out, /lit-material-one-time-code/);
    assert.match(out, /a@b\.c/);
  });
});
