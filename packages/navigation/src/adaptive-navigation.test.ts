import { expect, fixture, html, oneEvent } from "@open-wc/testing";
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
});
