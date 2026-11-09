import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialKbd, parseShortcut } from "./kbd.js";

describe("lit-material-kbd (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialKbd());
  });

  it("renders the non-Apple form on the server", async () => {
    const out = await collectResult(render(html`<lit-material-kbd keys="Mod+K"></lit-material-kbd>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, />Ctrl</);
    assert.match(out, />K</);
    assert.match(out, /Control K/);
  });

  it("pins the Apple form when asked", async () => {
    const out = await collectResult(render(html`<lit-material-kbd keys="Mod+Shift+P" platform="apple"></lit-material-kbd>`));
    assert.match(out, />⌘</);
    assert.match(out, />⇧</);
    assert.match(out, /Command Shift P/);
  });

  it("parses chords and sequences", () => {
    assert.deepEqual(
      parseShortcut("G I", false).map((c) => c.map((k) => k.glyph)),
      [["G"], ["I"]],
    );
    assert.deepEqual(
      parseShortcut("Ctrl++", false).map((c) => c.map((k) => k.glyph)),
      [["Ctrl", "+"]],
    );
    assert.deepEqual(
      parseShortcut("Alt+Shift+ArrowLeft", true).map((c) => c.map((k) => k.glyph)),
      [["⌥", "⇧", "←"]],
    );
  });
});
