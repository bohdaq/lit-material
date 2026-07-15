import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./task-test-host.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("TaskController (SSR)", () => {
  it("constructs and renders without a browser, without throwing", async () => {
    const out = await renderToString(html`<lit-material-task-test-host></lit-material-task-test-host>`);
    assert.match(out, /shadowrootmode="open"/);
    // `@lit-labs/ssr` drives willUpdate()/update()/render() directly but
    // never invokes reactive controllers' hostUpdate() — the hook autoRun
    // relies on to kick a task off before the host's first render. So a
    // TaskController never starts a task during SSR at all: the
    // server-rendered output is always "initial", and the real run only
    // starts once the client hydrates and a real update cycle runs. There's
    // no way around this by waiting longer — Lit SSR is a single
    // synchronous pass, it can't await an in-flight promise either way.
    assert.match(out, /initial/);
  });
});
