# @lit-material/testing

Test helpers for apps built with [lit-material](https://github.com/bohdaq/lit-material): a `fixture()` that
waits until every nested Lit element has rendered, and queries by role, label and text that reach through
shadow roots, in the style of Testing Library. Works in any browser test runner — Web Test Runner, Vitest
browser mode, Playwright component tests — with any assertion library.

## Install

```sh
npm install --save-dev @lit-material/testing
```

## Usage

```ts
import { cleanup, fixture, getByLabel, getByRole, user } from "@lit-material/testing";
import { html } from "lit";
import "./signup-form.js";

afterEach(() => cleanup());

it("signs up", async () => {
  await fixture(html`<signup-form></signup-form>`);

  await user.type(getByLabel("Email"), "ada@example.com");
  await user.click(getByRole("checkbox", { name: "I agree" }));
  await user.click(getByRole("button", { name: "Sign up" }));

  expect(getByRole("status").textContent).to.contain("Check your inbox");
});
```

The queries find the native control inside each component: `getByRole("button", { name: "Sign up" })` returns
the `<button>` inside `<lit-material-button>`'s shadow root, `getByLabel("Email")` the `<input>` inside
`<lit-material-text-field label="Email">`. That's what a user (and a screen reader) interacts with, so clicks
and typing behave as they do for real.

## Why not the usual tools?

`document.querySelector` and Testing Library's DOM queries stop at shadow roots, and a component that renders
other components finishes its update a microtask or more after `await el.updateComplete` on the outer one.
`fixture()` and `waitForUpdate()` wait for every Lit element in the tree, including the ones each update
renders; the queries walk open shadow roots and slots.

## API

### Rendering

| | |
| --- | --- |
| `fixture(template \| html, { container? })` | Renders a Lit template (or an HTML string) into a new `<div>` on the page, waits for every update, returns the first element. |
| `cleanup()` | Removes what `fixture()` added. Call it in `afterEach`. |
| `waitForUpdate(root?)` | Waits until every Lit element under `root` (default: the document), and anything they render, has finished updating. |
| `waitFor(check, { timeout?, interval? })` | Retries `check` until it doesn't throw (or return `false`/`null`), then resolves with its value. Default timeout 1 s. |
| `nextFrame()` | Resolves on the next animation frame. |

### Queries

All take `{ root }` to search inside an element, and skip elements hidden from assistive technology unless
given `{ hidden: true }`. `getBy*` throws when there isn't exactly one match (listing the roles and names it
did find); `queryBy*` returns `null`; `getAllBy*`/`queryAllBy*` return arrays; `findBy*` waits for one.

| | |
| --- | --- |
| `getByRole(role, { name?, level?, checked?, selected?, expanded?, pressed? })` | By ARIA role (explicit, or implicit for native elements) and accessible name (string or RegExp). |
| `getByLabel(name)` | The form control — textbox, combobox, checkbox, radio, switch, slider, spinbutton, listbox — with that accessible name. |
| `getByText(text, { selector? })` | The element whose own text matches. |
| `queryDeep(selector)`, `queryAllDeep(selector)` | `querySelector` through shadow roots. |
| `roleOf(el)`, `accessibleName(el)`, `isHidden(el)` | What the queries use. The name follows the main steps of the accessible-name algorithm (`aria-labelledby` across slots, `aria-label`, `<label>`s, content, `alt`, `title`), not every edge of the spec. |

### Interaction

`user.click(el)`, `user.type(el, text)`, `user.clear(el)`, `user.commit(el)` (fires `change`) and
`user.press(key, el?)` dispatch the events a browser would, then `waitForUpdate()`. `type` accepts a
component and types into the first input inside it. These are synthetic events: for real keyboard and
focus behaviour (Tab order, text selection), use your runner's own input commands, like
`@web/test-runner-commands`' `sendKeys` or Playwright's `page.keyboard`.

## License

MIT
