import { expect, fixture, html } from "@open-wc/testing";
import "./simple-list-item.js";
import type { LitMaterialSimpleListItem } from "./simple-list-item.js";

describe("lit-material-simple-list-item", () => {
  it("sets role=listitem on itself", async () => {
    const el = await fixture<LitMaterialSimpleListItem>(html`<lit-material-simple-list-item>Home</lit-material-simple-list-item>`);
    expect(el.getAttribute("role")).to.equal("listitem");
  });

  it("renders a real link when href is set", async () => {
    const el = await fixture<LitMaterialSimpleListItem>(html`<lit-material-simple-list-item href="/a">A</lit-material-simple-list-item>`);
    const link = el.shadowRoot!.querySelector("a") as HTMLAnchorElement;
    expect(link).to.exist;
    expect(link.getAttribute("href")).to.equal("/a");
  });

  it("renders a button when no href", async () => {
    const el = await fixture<LitMaterialSimpleListItem>(html`<lit-material-simple-list-item>A</lit-material-simple-list-item>`);
    expect(el.shadowRoot!.querySelector("a")).to.not.exist;
    expect(el.shadowRoot!.querySelector("button")).to.exist;
  });

  it("sets aria-current=true on the interactive element when current", async () => {
    const el = await fixture<LitMaterialSimpleListItem>(
      html`<lit-material-simple-list-item href="/a" current>A</lit-material-simple-list-item>`,
    );
    const link = el.shadowRoot!.querySelector("a")!;
    expect(link.getAttribute("aria-current")).to.equal("true");
  });

  it("disables the button and ignores href when disabled", async () => {
    const el = await fixture<LitMaterialSimpleListItem>(
      html`<lit-material-simple-list-item href="/a" disabled>A</lit-material-simple-list-item>`,
    );
    expect(el.shadowRoot!.querySelector("a")).to.not.exist;
    const button = el.shadowRoot!.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).to.be.true;
  });

  it("passes axe accessibility checks (wrapped in a ul — listitem needs a list ancestor)", async () => {
    const wrapper = await fixture<HTMLUListElement>(html`
      <ul>
        <lit-material-simple-list-item href="/a">A</lit-material-simple-list-item>
        <lit-material-simple-list-item href="/b" current>B</lit-material-simple-list-item>
      </ul>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
