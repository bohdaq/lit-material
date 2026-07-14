import { expect, fixture, html } from "@open-wc/testing";
import { LitElement } from "lit";
import { createStore } from "./store.js";
import { StoreController } from "./store-controller.js";

interface CounterState {
  count: number;
}

type CounterAction = { type: "increment" } | { type: "reset" };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "reset":
      return { count: 0 };
  }
}

const testStore = createStore(counterReducer, { count: 0 });

class StoreControllerTestHost extends LitElement {
  readonly controller = new StoreController(this, testStore, (state) => state.count);

  override render() {
    return html`<span id="count">${this.controller.value}</span>`;
  }
}
customElements.define("lit-material-store-test-counter-host", StoreControllerTestHost);

describe("StoreController + LitElement", () => {
  afterEach(() => {
    testStore.dispatch({ type: "reset" });
  });

  it("renders the initially selected state and re-renders when the store changes", async () => {
    const el = await fixture<StoreControllerTestHost>(
      html`<lit-material-store-test-counter-host></lit-material-store-test-counter-host>`,
    );
    expect(el.shadowRoot!.getElementById("count")!.textContent).to.equal("0");

    testStore.dispatch({ type: "increment" });
    await el.updateComplete;
    expect(el.shadowRoot!.getElementById("count")!.textContent).to.equal("1");
  });

  it("stops re-rendering once the host disconnects", async () => {
    const el = await fixture<StoreControllerTestHost>(
      html`<lit-material-store-test-counter-host></lit-material-store-test-counter-host>`,
    );
    el.remove();

    // Should not throw even though the host is disconnected and no longer
    // subscribed.
    expect(() => testStore.dispatch({ type: "increment" })).to.not.throw();
    expect(testStore.getState().count).to.equal(1);
  });
});
