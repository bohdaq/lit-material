import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./list-item.js";
import type { LitMaterialListItem } from "./list-item.js";

describe("lit-material-list-item", () => {
  it("renders a plain div by default (non-interactive)", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item>Headline</lit-material-list-item>`,
    );
    expect(el.shadowRoot!.querySelector("div.item")).to.exist;
    expect(el.shadowRoot!.querySelector("button")).to.not.exist;
    expect(el.shadowRoot!.querySelector('[role="listitem"]')).to.exist;
  });

  it("renders overline, headline, and supporting text in order", async () => {
    const el = await fixture<LitMaterialListItem>(html`
      <lit-material-list-item>
        <span slot="overline">OVERLINE</span>
        Headline
        <span slot="supporting-text">Supporting</span>
      </lit-material-list-item>
    `);
    expect(el.shadowRoot!.querySelector('slot[name="overline"]')).to.exist;
    expect(el.shadowRoot!.querySelector('slot[name="supporting-text"]')).to.exist;
    expect(el.shadowRoot!.querySelector("slot:not([name])")).to.exist;
  });

  it("is not focusable when non-interactive", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item>Headline</lit-material-list-item>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.not.exist;
  });

  it("renders a native button when interactive and dispatches click", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item interactive>Headline</lit-material-list-item>`,
    );
    const button = el.shadowRoot!.querySelector("button.item")!;
    expect(button).to.exist;
    setTimeout(() => button.click());
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("is reachable and activatable via keyboard when interactive (Tab + Enter)", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item interactive>Headline</lit-material-list-item>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("button"));
    setTimeout(() => sendKeys({ press: "Enter" }));
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("does not dispatch a click event when interactive and disabled", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item interactive disabled>Headline</lit-material-list-item>`,
    );
    const button = el.shadowRoot!.querySelector("button.item")!;
    let clicked = false;
    el.addEventListener("click", () => (clicked = true));
    button.click();
    expect(clicked).to.be.false;
  });

  it("renders an anchor when href is set, without needing interactive", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item href="https://lit.dev">Headline</lit-material-list-item>`,
    );
    const anchor = el.shadowRoot!.querySelector("a.item")!;
    expect(anchor).to.exist;
    expect(anchor.getAttribute("href")).to.equal("https://lit.dev");
  });

  it("adds rel=noopener when target=_blank", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item href="https://lit.dev" target="_blank">Headline</lit-material-list-item>`,
    );
    const anchor = el.shadowRoot!.querySelector("a.item")!;
    expect(anchor.getAttribute("rel")).to.equal("noopener noreferrer");
  });

  it("submits an ancestor form when type=submit", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-list-item interactive type="submit">Choose</lit-material-list-item>
      </form>
    `);
    let submitted = false;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitted = true;
    });
    const item = form.querySelector("lit-material-list-item")! as LitMaterialListItem;
    item.shadowRoot!.querySelector("button")!.click();
    expect(submitted).to.be.true;
  });

  it("reflects selected and divider to attributes", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item selected divider>Headline</lit-material-list-item>`,
    );
    expect(el.hasAttribute("selected")).to.be.true;
    expect(el.hasAttribute("divider")).to.be.true;
    expect(el.shadowRoot!.querySelector(".item")!.classList.contains("selected")).to.be.true;
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialListItem>(
      html`<lit-material-list-item interactive>Headline</lit-material-list-item>`,
    );
    const button = el.shadowRoot!.querySelector("button.item")! as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    const stateLayer = el.shadowRoot!.querySelector(".state-layer")!;
    expect(stateLayer.hasAttribute("data-pressed")).to.be.true;
  });

  it("passes axe accessibility checks when non-interactive (within a role=list ancestor)", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div role="list"><lit-material-list-item>Headline</lit-material-list-item></div>
    `);
    await expect(wrapper).to.be.accessible();
  });

  it("passes axe accessibility checks when interactive (within a role=list ancestor)", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div role="list"><lit-material-list-item interactive>Headline</lit-material-list-item></div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
