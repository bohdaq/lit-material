import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
import { setViewport } from "@web/test-runner-commands";
import "./adaptive-navigation.js";
import type { LitMaterialAdaptiveNavigation, NavigationDestination } from "./adaptive-navigation.js";

const destinations: NavigationDestination[] = [
  { label: "Overview", icon: "◎" },
  { label: "Upstreams", icon: "⇄" },
  { label: "Logs", icon: "≡", disabled: true },
];

async function nav() {
  return fixture<LitMaterialAdaptiveNavigation>(
    html`<lit-material-adaptive-navigation label="Sections" .destinations=${destinations} .selected=${0}></lit-material-adaptive-navigation>`,
  );
}

const shown = (el: LitMaterialAdaptiveNavigation) =>
  ["drawer", "rail", "bar"].filter((k) => getComputedStyle(el.shadowRoot!.querySelector(`.${k}`)!).display !== "none");

describe("lit-material-adaptive-navigation", () => {
  after(() => setViewport({ width: 800, height: 600 }));

  it("shows a bar on compact, a rail on medium and a drawer on expanded windows", async () => {
    const el = await nav();
    await setViewport({ width: 400, height: 800 });
    expect(shown(el)).to.deep.equal(["bar"]);
    await setViewport({ width: 700, height: 800 });
    expect(shown(el)).to.deep.equal(["rail"]);
    await setViewport({ width: 1200, height: 800 });
    expect(shown(el)).to.deep.equal(["drawer"]);
    el.expanded = "rail";
    await el.updateComplete;
    expect(shown(el)).to.deep.equal(["rail"]);
  });

  it("renders every destination in each form, in a labelled landmark", async () => {
    const el = await nav();
    const root = el.shadowRoot!;
    expect(root.querySelector("nav")!.getAttribute("aria-label")).to.equal("Sections");
    for (const tag of ["drawer", "rail", "bar"]) {
      const items = root.querySelectorAll(`lit-material-navigation-${tag}-item`);
      expect(items.length).to.equal(3);
      expect((items[0] as HTMLElement & { selected: boolean }).selected).to.be.true;
      expect((items[2] as HTMLElement & { disabled: boolean }).disabled).to.be.true;
    }
  });

  it("shares the selection and fires change from whichever form is used", async () => {
    await setViewport({ width: 400, height: 800 });
    const el = await nav();
    const barItem = el.shadowRoot!.querySelectorAll<HTMLElement>("lit-material-navigation-bar-item")[1];
    setTimeout(() => barItem.click());
    await oneEvent(el, "change");
    expect(el.selected).to.equal(1);
    await el.updateComplete;
    const drawerItems = el.shadowRoot!.querySelectorAll<HTMLElement & { selected: boolean }>("lit-material-navigation-drawer-item");
    expect(drawerItems[1].selected).to.be.true;
  });

  it("translates the default landmark name", async () => {
    registerTranslation({ $code: "x-adaptive-nav", "navigation.main": "Principal" });
    const wrapper = await fixture<HTMLDivElement>(
      html`<div lang="x-adaptive-nav"><lit-material-adaptive-navigation .destinations=${destinations}></lit-material-adaptive-navigation></div>`,
    );
    const el = wrapper.querySelector<LitMaterialAdaptiveNavigation>("lit-material-adaptive-navigation")!;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("nav")!.getAttribute("aria-label")).to.equal("Principal");
  });

  it("compact rail with badges: a dot or a count, named for screen readers", async () => {
    await setViewport({ width: 1200, height: 800 });
    const ds: NavigationDestination[] = [
      { label: "Collections", icon: "▤" },
      { label: "Conflicts", icon: "⇆", badge: true, badgeLabel: "2 conflicts" },
      { label: "Runs", icon: "▶", badge: 3 },
    ];
    const el = await fixture<LitMaterialAdaptiveNavigation>(
      html`<lit-material-adaptive-navigation compact expanded="rail" .destinations=${ds}></lit-material-adaptive-navigation>`,
    );
    expect(shown(el)).to.deep.equal(["rail"]);
    const rail = el.shadowRoot!.querySelector<HTMLElement & { compact: boolean }>("lit-material-navigation-rail")!;
    expect(rail.compact).to.be.true;
    const items = [...el.shadowRoot!.querySelectorAll("lit-material-navigation-rail-item")];
    expect(items[1].querySelector(".badge")!.classList.contains("count")).to.be.false;
    expect(items[2].querySelector(".badge")!.textContent).to.equal("3");
    // The icon and badge are aria-hidden; the accessible text is the label and the badge's meaning.
    expect(items[1].querySelector(".visually-hidden")!.textContent).to.equal(", 2 conflicts");
    expect(items[1].querySelector(".badge")!.getAttribute("aria-hidden")).to.equal("true");
    await setViewport({ width: 400, height: 800 });
    expect(shown(el)).to.deep.equal(["bar"]);
  });
});
