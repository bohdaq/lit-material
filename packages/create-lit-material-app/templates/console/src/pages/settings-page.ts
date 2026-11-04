import "@lit-material/tabs";
import "@lit-material/text-field";
import "@lit-material/switch";
import "@lit-material/button";
import "@lit-material/pricing";
import { confirm } from "@lit-material/confirm";
import type { Plan } from "@lit-material/pricing";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { notify } from "../notify.js";
import { pageStyles } from "./page-styles.js";

const plans: Plan[] = [
  { id: "free", name: "Free", price: { amount: "$0" }, features: ["3 members", "Email support"], current: true },
  {
    id: "team",
    name: "Team",
    price: { monthly: { amount: "$12", period: "per seat / month" }, yearly: { amount: "$10", period: "per seat / month", note: "billed yearly" } },
    features: ["Unlimited members", "Roles", "Priority support"],
    recommended: true,
    action: "Upgrade",
  },
];

/**
 * Settings as tabs. Each form section saves on its own, with its button off until something changed;
 * irreversible actions sit apart in a danger zone and ask for the name first.
 */
@customElement("settings-page")
export class SettingsPage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      lit-material-tabs {
        margin-bottom: 24px;
      }
      .card {
        display: grid;
        gap: 16px;
        max-width: 560px;
        padding: 24px;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 16px;
      }
      .card.danger {
        border-color: var(--md-sys-color-error);
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .save {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ];

  @state() private name = "Acme";
  @state() private draftName = "Acme";

  override render() {
    const dirty = this.draftName.trim() !== this.name;
    return html`
      <div class="title-row"><h1>Settings</h1></div>
      <lit-material-tabs aria-label="Settings sections">
        <lit-material-tab>General</lit-material-tab>
        <lit-material-tab>Plan</lit-material-tab>
        <lit-material-tab>Danger zone</lit-material-tab>
      </lit-material-tabs>
      <lit-material-tab-panel selected>
        <section class="card">
          <h2>Organization</h2>
          <lit-material-text-field
            label="Name"
            .value=${this.draftName}
            @input=${(e: Event) => (this.draftName = (e.target as HTMLInputElement).value)}
          ></lit-material-text-field>
          <div class="row">
            <span>Email me when someone joins</span>
            <lit-material-switch aria-label="Email me when someone joins" checked></lit-material-switch>
          </div>
          <div class="save">
            <lit-material-button variant="text" ?disabled=${!dirty} @click=${() => (this.draftName = this.name)}>Discard</lit-material-button>
            <lit-material-button ?disabled=${!dirty} @click=${this.save}>Save</lit-material-button>
          </div>
        </section>
      </lit-material-tab-panel>
      <lit-material-tab-panel>
        <lit-material-plan-picker
          .plans=${plans}
          period="yearly"
          period-note="Yearly: 2 months free"
          @lit-material-plan-select=${() => notify("This is where your checkout opens")}
        ></lit-material-plan-picker>
      </lit-material-tab-panel>
      <lit-material-tab-panel>
        <section class="card danger">
          <h2>Delete this organization</h2>
          <p class="hint">Deletes every project and removes every member. This can't be undone.</p>
          <div class="save"><lit-material-button @click=${this.deleteOrg}>Delete organization</lit-material-button></div>
        </section>
      </lit-material-tab-panel>
    `;
  }

  private save(): void {
    this.name = this.draftName.trim();
    notify("Saved");
  }

  private async deleteOrg(): Promise<void> {
    const ok = await confirm({
      headline: `Delete ${this.name}?`,
      message: "Every project and member goes with it. Type the organization's name to confirm.",
      confirmLabel: "Delete",
      destructive: true,
      requireText: this.name,
    });
    if (ok) notify(`${this.name} deleted (not really: this is the starter)`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-page": SettingsPage;
  }
}
