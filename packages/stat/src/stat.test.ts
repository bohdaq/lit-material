import { expect, fixture, html } from "@open-wc/testing";
import "./stat.js";
import type { LitMaterialStat } from "./stat.js";

describe("lit-material-stat", () => {
  it("renders label, value and caption as one labelled group", async () => {
    const el = await fixture<LitMaterialStat>(
      html`<lit-material-stat label="Requests" value="1,284" caption="last 5 minutes"></lit-material-stat>`,
    );
    const root = el.shadowRoot!;
    expect(root.querySelector(".label")!.textContent!.trim()).to.equal("Requests");
    expect(root.querySelector(".value")!.textContent).to.equal("1,284");
    expect(root.querySelector(".caption")!.textContent).to.contain("last 5 minutes");
    const group = root.querySelector('[role="group"]')!;
    expect(group.getAttribute("aria-label")).to.equal("Requests");
  });

  it("uses tabular figures for the value", async () => {
    const el = await fixture<LitMaterialStat>(html`<lit-material-stat value="42"></lit-material-stat>`);
    expect(getComputedStyle(el.shadowRoot!.querySelector(".value")!).fontVariantNumeric).to.contain("tabular-nums");
  });

  it("shows a trend as an arrow plus words, coloured by sentiment", async () => {
    const el = await fixture<LitMaterialStat>(
      html`<lit-material-stat value="9" trend="down" trend-label="-3 since yesterday" trend-sentiment="positive"></lit-material-stat>`,
    );
    const trend = el.shadowRoot!.querySelector(".trend")!;
    expect(trend.textContent).to.contain("↓");
    expect(trend.textContent).to.contain("-3 since yesterday");
    expect(trend.classList.contains("positive")).to.be.true;
    expect(trend.querySelector('[aria-hidden="true"]')!.textContent).to.equal("↓");
  });

  it("hides a trend without words", async () => {
    const el = await fixture<LitMaterialStat>(html`<lit-material-stat value="9" trend="up"></lit-material-stat>`);
    expect(el.shadowRoot!.querySelector(".trend")).to.be.null;
  });

  it("reflects the variant", async () => {
    const el = await fixture<LitMaterialStat>(html`<lit-material-stat variant="filled" value="1"></lit-material-stat>`);
    expect(el.shadowRoot!.querySelector(".stat")!.classList.contains("filled")).to.be.true;
    expect(el.getAttribute("variant")).to.equal("filled");
  });
});
