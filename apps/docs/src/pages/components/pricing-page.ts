import "@lit-material/pricing";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Plan, PlanSelectDetail } from "@lit-material/pricing";
import { pageStyles } from "../../styles/page-styles.js";

const plans: Plan[] = [
  { id: "free", name: "Free", description: "For one person", price: { amount: "$0" }, features: ["3 workspaces", "7 days of run history"], current: true },
  {
    id: "team",
    name: "Team",
    description: "For teams sharing collections",
    price: {
      monthly: { amount: "$8", period: "per seat / month" },
      yearly: { amount: "$80", period: "per seat / year", note: "2 months free" },
    },
    features: ["Unlimited workspaces", "90 days of run history", "Roles and invites"],
    recommended: true,
    action: "Upgrade",
  },
  {
    id: "business",
    name: "Business",
    description: "For organizations",
    price: { monthly: { amount: "$16", period: "per seat / month" }, yearly: { amount: "$160", period: "per seat / year" } },
    features: ["Everything in Team", "Single sign-on and SCIM", "Signed audit export"],
    action: "Upgrade",
  },
];

@customElement("docs-pricing-page")
export class DocsPricingPage extends LitElement {
  static override styles = [pageStyles];

  @state() private chosen = "";

  override render() {
    return html`
      <h1>Pricing</h1>
      <p>Plans side by side from data: a Monthly / Yearly switch when plans have both prices, the plan the reader is on and the suggested one marked in words, and a button per plan. The picker only reports the choice; open the checkout in your handler.</p>
      <section>
        <lit-material-plan-picker
          .plans=${plans}
          period-note="Yearly: 2 months free"
          @lit-material-plan-select=${(e: CustomEvent<PlanSelectDetail>) => (this.chosen = `${e.detail.plan.name}, billed ${e.detail.period}`)}
        ></lit-material-plan-picker>
        <p role="status">${this.chosen ? `Chosen: ${this.chosen}.` : ""}</p>
      </section>
      <section>
        <h2>One card</h2>
        <p><code>lit-material-plan-card</code> on its own, with your own button in the <code>action</code> slot.</p>
        <lit-material-plan-card name="Enterprise" description="Your own server, our support" price="Custom" .features=${["Self-hosted", "Support agreement"]} style="max-width: 320px">
          <a slot="action" href="mailto:sales@example.com">Contact sales</a>
        </lit-material-plan-card>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-pricing-page": DocsPricingPage;
  }
}
