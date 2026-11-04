import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./plan-picker.js";
import type { LitMaterialPlanPicker, Plan } from "./plan-picker.js";
import type { LitMaterialPlanCard } from "./plan-card.js";

const plans: Plan[] = [
  { id: "free", name: "Free", price: { amount: "$0" }, features: ["1 workspace"], current: true },
  {
    id: "team",
    name: "Team",
    description: "For small teams",
    price: { monthly: { amount: "$8", period: "per seat / month" }, yearly: { amount: "$80", period: "per seat / year", note: "2 months free" } },
    features: ["Unlimited workspaces", "Run history"],
    recommended: true,
    action: "Upgrade",
  },
  { id: "business", name: "Business", price: { amount: "Custom" }, action: "Contact us", disabled: true, hint: "Talk to us first" },
];

const picker = () => fixture<LitMaterialPlanPicker>(html`<lit-material-plan-picker .plans=${plans} period-note="Yearly: 2 months free"></lit-material-plan-picker>`);
const card = (el: LitMaterialPlanPicker, id: string) => el.shadowRoot!.querySelector<LitMaterialPlanCard>(`[data-plan="${id}"]`)!;
const cardText = async (el: LitMaterialPlanPicker, id: string) => {
  await card(el, id).updateComplete;
  return card(el, id).shadowRoot!.textContent!.replace(/\s+/g, " ");
};
const button = (el: LitMaterialPlanPicker, id: string) => card(el, id).querySelector<HTMLElement & { disabled: boolean }>("lit-material-button")!;

describe("lit-material-plan-picker", () => {
  it("renders a card per plan with names, prices and features, as a list", async () => {
    const el = await picker();
    expect(el.shadowRoot!.querySelectorAll("ul.plans > li")).to.have.length(3);
    expect(await cardText(el, "team")).to.contain("Team").and.contain("$8").and.contain("per seat / month").and.contain("Run history");
  });

  it("marks the current plan in words and turns its button off", async () => {
    const el = await picker();
    expect(await cardText(el, "free")).to.contain("Current plan");
    expect(button(el, "free").disabled).to.be.true;
    expect(button(el, "free").textContent).to.equal("Current plan");
    expect(await cardText(el, "team")).to.contain("Recommended");
  });

  it("switches prices between monthly and yearly and tells the page", async () => {
    const el = await picker();
    const yearly = el.shadowRoot!.querySelector<HTMLElement>('[data-period="yearly"]')!;
    const changed = oneEvent(el, "lit-material-period-change");
    yearly.click();
    expect((await changed).detail.period).to.equal("yearly");
    await el.updateComplete;
    expect(await cardText(el, "team")).to.contain("$80").and.contain("2 months free");
    expect(el.period).to.equal("yearly");
  });

  it("has no switch when no plan has both prices", async () => {
    const el = await fixture<LitMaterialPlanPicker>(html`<lit-material-plan-picker .plans=${[plans[0], plans[2]]}></lit-material-plan-picker>`);
    expect(el.shadowRoot!.querySelector(".switch")).to.not.exist;
  });

  it("reports the chosen plan and period, never the current or a disabled one", async () => {
    const el = await picker();
    let fired = 0;
    el.addEventListener("lit-material-plan-select", () => fired++);
    const chosen = oneEvent(el, "lit-material-plan-select");
    button(el, "team").click();
    const { detail } = await chosen;
    expect(detail.plan.id).to.equal("team");
    expect(detail.period).to.equal("monthly");
    button(el, "business").click();
    expect(fired).to.equal(1);
    expect(card(el, "business").textContent).to.contain("Talk to us first");
  });

  it("is accessible", async () => {
    const el = await picker();
    await card(el, "team").updateComplete;
    await expect(el).to.be.accessible();
  });
});
