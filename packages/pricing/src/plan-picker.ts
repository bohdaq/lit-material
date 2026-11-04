import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import "@lit-material/button/button.js";
import "@lit-material/segmented-button/segmented-button-group.js";
import "@lit-material/segmented-button/segmented-button.js";
import "./plan-card.js";

export type BillingPeriod = "monthly" | "yearly";

/** A price as it should read, formatted by the app, with what follows it. */
export interface PlanPrice {
  /** `"$12"`, `"Free"`, `"Custom"`. */
  amount: string;
  /** `"per seat / month"`. */
  period?: string;
  /** `"billed yearly"`, `"2 months free"`. */
  note?: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  /** One price, or one per billing period: the picker then shows a Monthly / Yearly switch. */
  price?: PlanPrice | Partial<Record<BillingPeriod, PlanPrice>>;
  features?: string[];
  /** The plan the reader is on: its button reads "Current plan" and is off. */
  current?: boolean;
  recommended?: boolean;
  /** The button's text (default "Choose"). Empty string for no button. */
  action?: string;
  /** Turns the button off, e.g. while a checkout is opening or for a plan below the seats in use. */
  disabled?: boolean;
  /** Under the button: why it's off, or what happens next. */
  hint?: string;
}

/** `detail` of `lit-material-plan-select`. */
export interface PlanSelectDetail {
  plan: Plan;
  period: BillingPeriod;
}

const isPerPeriod = (price: Plan["price"]): price is Partial<Record<BillingPeriod, PlanPrice>> =>
  price !== undefined && !("amount" in price);

/**
 * Plans side by side from data, for a pricing page or an account's plan page:
 * a Monthly / Yearly switch when any plan has both prices, one
 * `lit-material-plan-card` per plan, and a button per plan. The picker only
 * reports the choice: open the checkout, confirm or change the plan in the
 * `lit-material-plan-select` handler.
 *
 * @element lit-material-plan-picker
 *
 * @csspart switch - The Monthly / Yearly switch.
 * @csspart plans - The grid of cards.
 *
 * @cssprop --lit-material-plan-picker-min-card-width - Narrowest card before the grid wraps (default `240px`).
 *
 * @fires lit-material-plan-select - A plan's button was pressed; `detail` is `{ plan, period }`.
 * @fires lit-material-period-change - The billing period switched; `detail` is `{ period }`.
 */
@customElement("lit-material-plan-picker")
export class LitMaterialPlanPicker extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      gap: 24px;
      /* Full width in a flex row too, so the cards can sit side by side. */
      inline-size: 100%;
      box-sizing: border-box;
    }
    :host([hidden]) {
      display: none;
    }
    .switch {
      justify-self: center;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .switch-note {
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--lit-material-plan-picker-min-card-width, 240px)), 1fr));
      gap: 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .hint {
      margin: 0;
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    lit-material-button {
      align-self: flex-start;
    }
  `;

  @property({ type: Array }) plans: Plan[] = [];

  /** The billing period shown. */
  @property({ reflect: true }) period: BillingPeriod = "monthly";

  /** Next to the switch, e.g. "Yearly: 2 months free". */
  @property({ attribute: "period-note" }) periodNote = "";

  /** Level of each plan name's heading. */
  @property({ type: Number, attribute: "heading-level" }) headingLevel = 3;

  private readonly localize = new LocalizeController(this);

  private get hasPeriods(): boolean {
    return this.plans.some((plan) => isPerPeriod(plan.price) && plan.price.monthly && plan.price.yearly);
  }

  private priceOf(plan: Plan): PlanPrice | undefined {
    if (!isPerPeriod(plan.price)) return plan.price;
    return plan.price[this.period] ?? plan.price.monthly ?? plan.price.yearly;
  }

  override render() {
    const monthly = this.localize.term("planPicker.monthly", "Monthly");
    const yearly = this.localize.term("planPicker.yearly", "Yearly");
    return html`
      ${this.hasPeriods
        ? html`<div class="switch" part="switch">
            <lit-material-segmented-button-group
              aria-label=${this.localize.term("planPicker.billingPeriod", "Billing period")}
              @change=${this.handlePeriod}
            >
              <lit-material-segmented-button data-period="monthly" ?selected=${this.period === "monthly"}>${monthly}</lit-material-segmented-button>
              <lit-material-segmented-button data-period="yearly" ?selected=${this.period === "yearly"}>${yearly}</lit-material-segmented-button>
            </lit-material-segmented-button-group>
            ${this.periodNote ? html`<span class="switch-note">${this.periodNote}</span>` : nothing}
          </div>`
        : nothing}
      <ul class="plans" part="plans">
        ${this.plans.map((plan) => this.renderPlan(plan))}
      </ul>
    `;
  }

  private renderPlan(plan: Plan) {
    const price = this.priceOf(plan);
    const label = plan.current ? this.localize.term("planCard.current", "Current plan") : (plan.action ?? this.localize.term("planPicker.choose", "Choose"));
    return html`<li>
      <lit-material-plan-card
        data-plan=${plan.id}
        name=${plan.name}
        description=${plan.description ?? ""}
        price=${price?.amount ?? ""}
        period=${price?.period ?? ""}
        price-note=${price?.note ?? ""}
        .features=${plan.features ?? []}
        ?current=${Boolean(plan.current)}
        ?recommended=${Boolean(plan.recommended)}
        heading-level=${this.headingLevel}
      >
        ${label
          ? html`<lit-material-button
              slot="action"
              variant=${plan.recommended && !plan.current ? "filled" : "outlined"}
              ?disabled=${Boolean(plan.current || plan.disabled)}
              aria-label=${plan.current ? `${plan.name}: ${label}` : `${label}: ${plan.name}`}
              @click=${() => this.select(plan)}
              >${label}</lit-material-button
            >`
          : nothing}
        ${plan.hint ? html`<p slot="action" class="hint">${plan.hint}</p>` : nothing}
      </lit-material-plan-card>
    </li>`;
  }

  private handlePeriod(event: Event): void {
    event.stopPropagation();
    const group = event.currentTarget as HTMLElement;
    const selected = [...group.querySelectorAll<HTMLElement & { selected: boolean }>("lit-material-segmented-button")].find((b) => b.selected);
    const period = (selected?.dataset.period as BillingPeriod | undefined) ?? this.period;
    if (period === this.period) return;
    this.period = period;
    this.dispatchEvent(new CustomEvent("lit-material-period-change", { detail: { period }, bubbles: true, composed: true }));
  }

  private select(plan: Plan): void {
    if (plan.current || plan.disabled) return;
    this.dispatchEvent(
      new CustomEvent<PlanSelectDetail>("lit-material-plan-select", { detail: { plan, period: this.period }, bubbles: true, composed: true }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-plan-picker": LitMaterialPlanPicker;
  }
}
