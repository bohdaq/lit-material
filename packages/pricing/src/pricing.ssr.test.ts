import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./plan-picker.js";

describe("pricing (SSR)", () => {
  it("renders a plan card with its badge, price and features", async () => {
    const out = await collectResult(
      render(html`<lit-material-plan-card name="Team" price="$8" period="per seat / month" current .features=${["Run history"]}></lit-material-plan-card>`),
    );
    assert.match(out, /Current plan/);
    assert.match(out, /\$8/);
    assert.match(out, /Run history/);
    assert.match(out, /aria-level="3"/);
  });

  it("renders the picker's switch and cards", async () => {
    const plans = [{ id: "t", name: "Team", price: { monthly: { amount: "$8" }, yearly: { amount: "$80" } } }];
    const out = await collectResult(render(html`<lit-material-plan-picker .plans=${plans}></lit-material-plan-picker>`));
    assert.match(out, /Monthly/);
    assert.match(out, /lit-material-plan-card/);
  });
});
