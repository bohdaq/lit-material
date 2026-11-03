import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import * as kit from "./index.js";

const out = (t: unknown) => collectResult(render(t));

describe("site-kit (SSR)", () => {
  it("imports without touching the DOM", () => {
    assert.equal(typeof kit.initSearch, "function");
    assert.match(kit.themeBootScript("x-theme"), /localStorage\.getItem\("x-theme"\)/);
  });

  it("renders FAQ, steps, keys and shortcuts as plain HTML", async () => {
    const html = await out(kit.faq([{ question: "Why?", answer: "Because.", open: true }], { exclusive: "q" }));
    assert.match(html, /<details name="q" open/);
    assert.match(html, /<summary>(<!--[^>]*-->)*Why\?/);
    assert.match(await out(kit.steps([{ title: "Install" }])), /<ol class="lm-steps"/);
    assert.match(await out(kit.kbd("Ctrl", "K")), /<kbd class="lm-keys">.*<kbd class="lm-kbd">(<!--[^>]*-->)*Ctrl/s);
    assert.match(await out(kit.shortcuts([{ action: "Search", keys: [["/"]] }])), /<dl class="lm-shortcuts"/);
  });

  it("renders the finished terminal session with its replay data", async () => {
    const html = await out(kit.terminal([{ cmd: "rws" }, { out: "listening", accent: true }], { label: "Starting rws" }));
    assert.match(html, /role="img" aria-label="Starting rws"/);
    assert.match(html, /data-terminal="\[\{&quot;cmd&quot;:&quot;rws&quot;\}/);
    assert.match(html, /class="t-line t-accent">(<!--[^>]*-->)*listening/);
  });
});
