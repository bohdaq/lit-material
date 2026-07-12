import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./card.js";
import type { LitMaterialCard } from "./card.js";

describe("lit-material-card", () => {
  it("renders a plain div by default (non-interactive)", async () => {
    const el = await fixture<LitMaterialCard>(html`<lit-material-card>Content</lit-material-card>`);
    expect(el.shadowRoot!.querySelector("div.card")).to.exist;
    expect(el.shadowRoot!.querySelector("button")).to.not.exist;
    expect(el.shadowRoot!.querySelector("a")).to.not.exist;
  });

  it("defaults to the elevated variant", async () => {
    const el = await fixture<LitMaterialCard>(html`<lit-material-card>Content</lit-material-card>`);
    expect(el.variant).to.equal("elevated");
  });

  it("is not focusable when non-interactive", async () => {
    const el = await fixture<LitMaterialCard>(html`<lit-material-card>Content</lit-material-card>`);
    el.focus();
    expect(el.shadowRoot!.activeElement).to.not.exist;
  });

  it("renders a native button when interactive and dispatches click", async () => {
    const el = await fixture<LitMaterialCard>(
      html`<lit-material-card interactive>Content</lit-material-card>`,
    );
    const button = el.shadowRoot!.querySelector("button.card")!;
    expect(button).to.exist;
    setTimeout(() => button.click());
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("is reachable and activatable via keyboard when interactive (Tab + Enter)", async () => {
    const el = await fixture<LitMaterialCard>(
      html`<lit-material-card interactive>Content</lit-material-card>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("button"));
    setTimeout(() => sendKeys({ press: "Enter" }));
    const event = await oneEvent(el, "click");
    expect(event).to.exist;
  });

  it("does not dispatch a click event when interactive and disabled", async () => {
    const el = await fixture<LitMaterialCard>(
      html`<lit-material-card interactive disabled>Content</lit-material-card>`,
    );
    const button = el.shadowRoot!.querySelector("button.card")!;
    let clicked = false;
    el.addEventListener("click", () => (clicked = true));
    button.click();
    expect(clicked).to.be.false;
  });

  it("renders an anchor when href is set, without needing interactive", async () => {
    const el = await fixture<LitMaterialCard>(
      html`<lit-material-card href="https://lit.dev">Content</lit-material-card>`,
    );
    const anchor = el.shadowRoot!.querySelector("a.card")!;
    expect(anchor).to.exist;
    expect(anchor.getAttribute("href")).to.equal("https://lit.dev");
  });

  it("adds rel=noopener when target=_blank", async () => {
    const el = await fixture<LitMaterialCard>(
      html`<lit-material-card href="https://lit.dev" target="_blank">Content</lit-material-card>`,
    );
    const anchor = el.shadowRoot!.querySelector("a.card")!;
    expect(anchor.getAttribute("rel")).to.equal("noopener noreferrer");
  });

  it("submits an ancestor form when type=submit", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-card interactive type="submit">Choose plan</lit-material-card>
      </form>
    `);
    let submitted = false;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitted = true;
    });
    const card = form.querySelector("lit-material-card")! as LitMaterialCard;
    card.shadowRoot!.querySelector("button")!.click();
    expect(submitted).to.be.true;
  });

  it("becomes interactive (and attaches the ripple) if `interactive` is toggled on after first render", async () => {
    const el = await fixture<LitMaterialCard>(html`<lit-material-card>Content</lit-material-card>`);
    expect(el.shadowRoot!.querySelector("button")).to.not.exist;

    el.interactive = true;
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector("button.card")! as HTMLButtonElement;
    expect(button).to.exist;

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

  it("passes axe accessibility checks when non-interactive", async () => {
    const el = await fixture<LitMaterialCard>(html`<lit-material-card>Content</lit-material-card>`);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks when interactive", async () => {
    const el = await fixture<LitMaterialCard>(
      html`<lit-material-card interactive>Content</lit-material-card>`,
    );
    await expect(el).to.be.accessible();
  });
});
