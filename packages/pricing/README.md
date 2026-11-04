# @lit-material/pricing

Plan cards and a plan picker: prices, what each plan includes, the plan the reader is on, the one to suggest, and monthly or yearly billing. For a pricing page or an account's plan page. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/pricing @lit-material/tokens
```

## Usage

```html
<lit-material-plan-picker period-note="Yearly: 2 months free"></lit-material-plan-picker>

<script type="module">
  import "@lit-material/pricing";
  const picker = document.querySelector("lit-material-plan-picker");
  picker.plans = [
    { id: "free", name: "Free", price: { amount: "$0" }, features: ["3 workspaces"], current: true },
    {
      id: "team",
      name: "Team",
      price: {
        monthly: { amount: "$8", period: "per seat / month" },
        yearly: { amount: "$80", period: "per seat / year", note: "2 months free" },
      },
      features: ["Unlimited workspaces", "Roles and invites"],
      recommended: true,
      action: "Upgrade",
    },
  ];
  picker.addEventListener("lit-material-plan-select", ({ detail }) => {
    openCheckout(detail.plan.id, detail.period);
  });
</script>
```

Prices are strings you format (currency, "Free", "Custom"): the picker doesn't do money. A plan with both a monthly and a yearly price brings up the Monthly / Yearly switch. The current plan's button reads "Current plan" and is off; `disabled` and `hint` turn another plan's button off and say why (say, fewer seats than are in use).

`lit-material-plan-card` works alone too, with your own button in the `action` slot:

```html
<lit-material-plan-card name="Enterprise" price="Custom" features='["Self-hosted","Support agreement"]'>
  <a slot="action" href="mailto:sales@example.com">Contact sales</a>
</lit-material-plan-card>
```

## API

### `lit-material-plan-picker`

`plans: Plan[]` (`{ id, name, description?, price?, features?, current?, recommended?, action?, disabled?, hint? }`, `price` either `{ amount, period?, note? }` or `{ monthly?, yearly? }` of those), `period` (`"monthly"` / `"yearly"`), `period-note`, `heading-level` (default 3). Fires `lit-material-plan-select` (`{ plan, period }`) and `lit-material-period-change` (`{ period }`). CSS: `--lit-material-plan-picker-min-card-width` (default `240px`), parts `switch`, `plans`.

### `lit-material-plan-card`

`name`, `description`, `price`, `period`, `price-note`, `features` (array, JSON as an attribute), `current`, `recommended`, `heading-level`. Slots: default (extra content), `action`. CSS: `--lit-material-plan-card-shape`, parts `card`, `badge`, `price`, `features`. "Current plan" and "Recommended" are words on the card, not only a colour.

## License

MIT
