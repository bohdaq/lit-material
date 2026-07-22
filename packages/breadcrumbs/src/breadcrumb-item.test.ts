import { expect, fixture, html } from "@open-wc/testing";
import "./breadcrumb-item.js";
import type { LitMaterialBreadcrumbItem } from "./breadcrumb-item.js";

describe("lit-material-breadcrumb-item", () => {
  it("sets role=listitem on itself", async () => {
    const el = await fixture<LitMaterialBreadcrumbItem>(
      html`<lit-material-breadcrumb-item href="/home">Home</lit-material-breadcrumb-item>`,
    );
    expect(el.getAttribute("role")).to.equal("listitem");
  });

  it("renders a real link when href is set and not current", async () => {
    const el = await fixture<LitMaterialBreadcrumbItem>(
      html`<lit-material-breadcrumb-item href="/home">Home</lit-material-breadcrumb-item>`,
    );
    const link = el.shadowRoot!.querySelector("a.crumb") as HTMLAnchorElement;
    expect(link).to.exist;
    expect(link.getAttribute("href")).to.equal("/home");
    expect(el.shadowRoot!.querySelector("span.crumb")).to.not.exist;
  });

  it("renders plain text with no href", async () => {
    const el = await fixture<LitMaterialBreadcrumbItem>(html`<lit-material-breadcrumb-item>Settings</lit-material-breadcrumb-item>`);
    expect(el.shadowRoot!.querySelector("a.crumb")).to.not.exist;
    const span = el.shadowRoot!.querySelector("span.crumb");
    expect(span).to.exist;
    expect(span!.getAttribute("aria-current")).to.be.null;
  });

  it("renders plain text with aria-current=page when current, even if href is set", async () => {
    const el = await fixture<LitMaterialBreadcrumbItem>(
      html`<lit-material-breadcrumb-item href="/settings" current>Settings</lit-material-breadcrumb-item>`,
    );
    expect(el.shadowRoot!.querySelector("a.crumb")).to.not.exist;
    const span = el.shadowRoot!.querySelector("span.crumb");
    expect(span!.getAttribute("aria-current")).to.equal("page");
  });

  it("hides its own trailing separator only when it's the last of its type", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <lit-material-breadcrumb-item href="/a">A</lit-material-breadcrumb-item>
        <lit-material-breadcrumb-item current>B</lit-material-breadcrumb-item>
      </div>
    `);
    const [first, second] = Array.from(
      wrapper.querySelectorAll("lit-material-breadcrumb-item"),
    ) as LitMaterialBreadcrumbItem[];
    expect(getComputedStyle(first!, "::after").content).to.not.equal("none");
    expect(getComputedStyle(second!, "::after").content).to.equal("none");
  });

  it("passes axe accessibility checks (wrapped in an ol — role=listitem requires a role=list ancestor)", async () => {
    const wrapper = await fixture<HTMLOListElement>(html`
      <ol>
        <lit-material-breadcrumb-item href="/a">A</lit-material-breadcrumb-item>
        <lit-material-breadcrumb-item current>B</lit-material-breadcrumb-item>
      </ol>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
