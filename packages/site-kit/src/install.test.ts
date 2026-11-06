import { expect, fixture, html } from "@open-wc/testing";
import { render } from "lit";
import { guessOs, initInstall } from "./client/install.js";
import { installPanel, installToggle } from "./templates.js";

const frame = () => new Promise((r) => requestAnimationFrame(r));

// site-kit doesn't depend on @lit-material/tabs: a stand-in with the same `selected` property.
class StubTabs extends HTMLElement {
  selected = 0;
}
if (!customElements.get("lit-material-tabs")) customElements.define("lit-material-tabs", StubTabs);

describe("site-kit install", () => {
  it("guesses the OS from the platform", () => {
    expect(guessOs({ userAgentData: { platform: "Windows" } } as never)).to.equal("windows");
    expect(guessOs({ platform: "MacIntel" } as never)).to.equal("mac");
    expect(guessOs({ platform: "Linux x86_64" } as never)).to.equal("linux");
    expect(guessOs({ platform: "iPhone" } as never)).to.equal("");
  });

  it("opens and closes the panel the toggle controls", async () => {
    const host = await fixture<HTMLDivElement>(html`<div></div>`);
    render(html`${installToggle({ controls: "install-test", label: "Install" })}${installPanel("install-test", "curl … | sh")}`, host);
    initInstall({ os: "" });
    const button = host.querySelector<HTMLButtonElement>("[data-install-toggle]")!;
    const panel = host.querySelector<HTMLElement>("#install-test")!;
    expect(panel.hidden).to.be.true;
    expect(panel.className).to.equal("lm-install-panel");
    button.click();
    await frame();
    expect(button.getAttribute("aria-expanded")).to.equal("true");
    expect(panel.hidden).to.be.false;
    expect(panel.classList.contains("open")).to.be.true;
    button.click();
    expect(button.getAttribute("aria-expanded")).to.equal("false");
    expect(panel.hidden).to.be.true;
    expect(panel.classList.contains("open")).to.be.false;
  });

  it("starts install tabs on the visitor's OS", async () => {
    const host = await fixture<HTMLDivElement>(html`<div>
      <lit-material-tabs id="os-tabs">
        <lit-material-tab data-os="linux">Linux</lit-material-tab>
        <lit-material-tab data-os="mac">macOS</lit-material-tab>
        <lit-material-tab data-os="windows">Windows</lit-material-tab>
      </lit-material-tabs>
      <lit-material-tabs id="other-tabs"><lit-material-tab>A</lit-material-tab><lit-material-tab>B</lit-material-tab></lit-material-tabs>
    </div>`);
    initInstall({ os: "windows" });
    await customElements.whenDefined("lit-material-tabs");
    await Promise.resolve();
    expect((host.querySelector("#os-tabs") as StubTabs).selected).to.equal(2);
    expect((host.querySelector("#other-tabs") as StubTabs).selected).to.equal(0, "tabs without data-os are left alone");
  });
});
