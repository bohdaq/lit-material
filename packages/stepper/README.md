# @lit-material/stepper

Material Design 3-styled stepper / wizard-progress web components built with [Lit](https://lit.dev/).
Part of [lit-material](https://github.com/bohdaq/lit-material).

Two elements: `lit-material-step` (a numbered/checkmark/error indicator + connector + label) and
`lit-material-stepper` (groups steps, adding `selected`-index navigation, optional linear gating,
and roving-focus keyboard support), marked up with `aria-current="step"` — the ARIA token defined
specifically for step-by-step processes.

![lit-material stepper, horizontal, three steps: Account completed, Shipping active, Payment upcoming](./screenshot.png)

## Install

```sh
npm install @lit-material/stepper @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/stepper";
</script>

<lit-material-stepper id="wizard">
  <lit-material-step completed>
    <span slot="label">Account</span>
  </lit-material-step>
  <lit-material-step>
    <span slot="label">Shipping</span>
    <span slot="description">Choose a delivery method</span>
  </lit-material-step>
  <lit-material-step>
    <span slot="label">Payment</span>
  </lit-material-step>
</lit-material-stepper>
<script type="module">
  document.getElementById("wizard").addEventListener("change", (event) => {
    // event.target.selected is the new step index — show your own panel for it.
  });
</script>
```

## `lit-material-stepper` API

| Property      | Attribute     | Type                          | Default        |
| ------------- | ------------- | ------------------------------ | -------------- |
| `selected`    | —             | `number`                       | `0`             |
| `orientation` | `orientation` | `"horizontal" \| "vertical"`    | `"horizontal"` |
| `linear`      | `linear`      | `boolean`                      | `false`        |

Slot: default (`lit-material-step` elements). Fires `change` when `selected` changes via user
interaction (click, or Enter/Space on a focused step). Step *content* is out of scope, the same way
`lit-material-tabs` leaves panels to the consumer — listen for `change` and show your own content.

`linear` gates forward navigation: a step is only reachable once every *enabled* step before it is
`completed` — going back to an earlier step is always allowed regardless. A `disabled` step can
never be completed, so it's skipped rather than permanently blocking everything after it.

## `lit-material-step` API

| Property     | Attribute     | Type                          | Default        |
| ------------ | ------------- | ------------------------------ | -------------- |
| `active`     | `active`      | `boolean`                      | `false`        |
| `completed`  | `completed`   | `boolean`                      | `false`        |
| `error`      | `error`       | `boolean`                      | `false`        |
| `disabled`   | `disabled`    | `boolean`                      | `false`        |
| `stepNumber` | `step-number` | `number`                       | `1`             |
| `orientation`| `orientation` | `"horizontal" \| "vertical"`    | `"horizontal"` |

Slots: `label`, `description` (optional supporting text). `active`, `stepNumber`, and `orientation`
are normally managed by the parent `lit-material-stepper` — set directly only when using a step
standalone. `completed` and `error` are always yours to set, based on whatever "done" or "invalid"
means for that step (form validity, a submitted request, ...) — never inferred from position
relative to the active step, since a real wizard's notion of "complete" doesn't always match
"before the current step."

## Behavior

The step is a real `<button>`, so Enter/Space activate it for free. Clicking or activating a step
delegates through the parent stepper, which applies the `linear`/`disabled` reachability check
before updating `selected` and dispatching `change` — an unreachable or disabled step just does
nothing.

## Keyboard interaction

Within `lit-material-stepper`, Left/Right (horizontal) or Up/Down (vertical) move focus between
enabled steps (wrapping), Home/End jump to the first/last enabled step — matching the arrow-key
direction to the visual orientation, per ARIA authoring practice. Moving focus never activates a
step by itself (unlike `lit-material-tabs`' automatic-activation model) — arrow keys let you browse
every step's label, even ones `linear` mode won't let you jump to yet; Enter/Space on a focused step
is what actually attempts to select it, and is where the reachability check applies.

## Scope

No built-in step content/panels — see `change` above. No "optional step" skip affordance beyond
what `disabled` already gives you (an unreachable step that's excluded from the `linear` gate).

## License

MIT
