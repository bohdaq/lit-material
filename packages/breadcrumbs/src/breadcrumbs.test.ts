import { expect, fixture, html } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./breadcrumbs.js";
import "./breadcrumb-item.js";
import type { LitMaterialBreadcrumbs } from "./breadcrumbs.js";

async function breadcrumbsFixture() {
  const el = await fixture<LitMaterialBreadcrumbs>(html`
    <lit-material-breadcrumbs>
      <lit-material-breadcrumb-item href="/">Home</lit-material-breadcrumb-item>
      <lit-material-breadcrumb-item href="/components">Components</lit-material-breadcrumb-item>
      <lit-material-breadcrumb-item current>Breadcrumbs</lit-material-breadcrumb-item>
    </lit-material-breadcrumbs>
  `);
  return { el };
}

describe("lit-material-breadcrumbs", () => {
  it("renders a nav landmark labeled 'Breadcrumb' by default", async () => {
    const { el } = await breadcrumbsFixture();
    const nav = el.shadowRoot!.querySelector("nav")!;
    expect(nav.getAttribute("aria-label")).to.equal("Breadcrumb");
  });

  it("supports a custom label", async () => {
    const el = await fixture<LitMaterialBreadcrumbs>(
      html`<lit-material-breadcrumbs label="You are here"></lit-material-breadcrumbs>`,
    );
    expect(el.shadowRoot!.querySelector("nav")!.getAttribute("aria-label")).to.equal("You are here");
  });

  it("wraps slotted items in an ol", async () => {
    const { el } = await breadcrumbsFixture();
    const list = el.shadowRoot!.querySelector("ol.list")!;
    expect(list).to.exist;
    expect(el.querySelectorAll("lit-material-breadcrumb-item").length).to.equal(3);
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await breadcrumbsFixture();
    await expect(el).to.be.accessible();
  });

  it("translates its default label for the element's language", async () => {
    registerTranslation({ $code: "x-breadcrumbs", "breadcrumbs.label": "Fil d'Ariane" });
    const wrapper = await fixture<HTMLDivElement>(html`
      <div lang="x-breadcrumbs"><lit-material-breadcrumbs></lit-material-breadcrumbs></div>
    `);
    const el = wrapper.querySelector<LitMaterialBreadcrumbs>("lit-material-breadcrumbs")!;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("nav")!.getAttribute("aria-label")).to.equal("Fil d'Ariane");
  });
});
