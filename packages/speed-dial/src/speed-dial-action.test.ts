import { expect, fixture, html } from "@open-wc/testing";
import "./speed-dial-action.js";
import type { LitMaterialSpeedDialAction } from "./speed-dial-action.js";

async function actionFixture() {
  const el = await fixture<LitMaterialSpeedDialAction>(html`
    <lit-material-speed-dial-action label="Share">
      <svg slot="icon" viewBox="0 0 24 24"></svg>
    </lit-material-speed-dial-action>
  `);
  const button = el.shadowRoot!.querySelector("button") as HTMLButtonElement;
  return { el, button };
}

describe("lit-material-speed-dial-action", () => {
  it("renders a button and a decorative (aria-hidden) label pill", async () => {
    const { el, button } = await actionFixture();
    expect(button).to.exist;
    const label = el.shadowRoot!.querySelector(".label")!;
    expect(label.getAttribute("aria-hidden")).to.equal("true");
    expect(label.textContent!.trim()).to.equal("Share");
  });

  it("uses label as the button's accessible name", async () => {
    const { button } = await actionFixture();
    expect(button.getAttribute("aria-label")).to.equal("Share");
  });

  it("reflects disabled onto the button", async () => {
    const el = await fixture<LitMaterialSpeedDialAction>(
      html`<lit-material-speed-dial-action label="Share" disabled></lit-material-speed-dial-action>`,
    );
    const button = el.shadowRoot!.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await actionFixture();
    await expect(el).to.be.accessible();
  });
});
