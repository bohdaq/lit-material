import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "@lit-material/list";
import "./app-launcher.js";
import type { LitMaterialAppLauncher } from "./app-launcher.js";

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

async function launcher(searchable = false) {
  const el = await fixture<LitMaterialAppLauncher>(html`<lit-material-app-launcher ?searchable=${searchable}>
    <lit-material-list-item href="#grafana">Grafana</lit-material-list-item>
    <lit-material-list-item href="#billing">Billing portal</lit-material-list-item>
    <lit-material-list-item href="#docs">Docs</lit-material-list-item>
  </lit-material-app-launcher>`);
  const button = el.shadowRoot!.querySelector("button")!;
  const menu = el.shadowRoot!.querySelector("lit-material-menu")!;
  return { el, button, menu };
}

describe("lit-material-app-launcher", () => {
  it("is a named button that opens a menu of the apps", async () => {
    const { el, button, menu } = await launcher();
    expect(button.getAttribute("aria-label")).to.equal("Applications");
    expect(button.getAttribute("aria-expanded")).to.equal("false");
    button.click();
    await el.updateComplete;
    await frames();
    expect(menu.matches(":popover-open")).to.be.true;
    expect(button.getAttribute("aria-expanded")).to.equal("true");
  });

  it("moves through the apps with the arrow keys", async () => {
    const { el } = await launcher();
    el.show();
    await frames();
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement?.textContent?.trim()).to.equal("Grafana");
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement?.textContent?.trim()).to.equal("Billing portal");
  });

  it("filters the apps as you type and skips hidden ones", async () => {
    const { el } = await launcher(true);
    el.show();
    await frames();
    await frames();
    const search = el.shadowRoot!.querySelector("input")!;
    expect(el.shadowRoot!.activeElement).to.equal(search);
    await sendKeys({ type: "doc" });
    await el.updateComplete;
    const shown = Array.from(el.querySelectorAll("lit-material-list-item")).filter((i) => !i.hidden);
    expect(shown.map((i) => i.textContent?.trim())).to.deep.equal(["Docs"]);
    expect(getComputedStyle(el.querySelector("lit-material-list-item")!).display).to.equal("none");
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement?.textContent?.trim()).to.equal("Docs");
  });

  it("says when nothing matches and resets on close", async () => {
    const { el } = await launcher(true);
    el.show();
    await frames();
    await frames();
    await sendKeys({ type: "zzz" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".empty")!.textContent).to.equal("No applications match");
    const closed = oneEvent(el, "close");
    el.close();
    await closed;
    await el.updateComplete;
    expect(Array.from(el.querySelectorAll("lit-material-list-item")).every((i) => !i.hidden)).to.be.true;
    expect(el.open).to.be.false;
  });

  it("closes from its button instead of reopening", async () => {
    const { el, button, menu } = await launcher();
    el.show();
    await frames();
    const rect = button.getBoundingClientRect();
    const { sendMouse } = await import("@web/test-runner-commands");
    await sendMouse({ type: "click", position: [Math.round(rect.x + rect.width / 2), Math.round(rect.y + rect.height / 2)] });
    await frames();
    expect(menu.matches(":popover-open")).to.be.false;
    expect(el.open).to.be.false;
  });
});
