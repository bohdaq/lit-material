import { expect, fixture, html } from "@open-wc/testing";
import { LitElement } from "lit";
import { RouteController, type RouteConfig } from "./route-controller.js";
import { navigate } from "./navigate.js";

const routes: RouteConfig<string>[] = [
  { path: "/", render: () => "home" },
  { path: "/users/:id", render: (params) => `user-${params.id}` },
];

class RouteControllerTestHost extends LitElement {
  readonly route = new RouteController(this, () => routes);

  override render() {
    return this.route.current.content;
  }
}
customElements.define("lit-material-route-controller-test-host", RouteControllerTestHost);

describe("RouteController", () => {
  afterEach(() => {
    history.replaceState(null, "", "/");
  });

  it("matches the path already current when the host connects", async () => {
    history.replaceState(null, "", "/users/42");
    const el = await fixture<RouteControllerTestHost>(
      html`<lit-material-route-controller-test-host></lit-material-route-controller-test-host>`,
    );
    expect(el.route.current.params).to.deep.equal({ id: "42" });
    expect(el.shadowRoot!.textContent).to.equal("user-42");
  });

  it("re-renders when navigate() changes the route", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<RouteControllerTestHost>(
      html`<lit-material-route-controller-test-host></lit-material-route-controller-test-host>`,
    );
    expect(el.route.current.content).to.equal("home");

    navigate("/users/7");
    await el.updateComplete;
    expect(el.route.current.content).to.equal("user-7");
    expect(el.shadowRoot!.textContent).to.equal("user-7");
  });

  it("reacts to popstate (browser back/forward)", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<RouteControllerTestHost>(
      html`<lit-material-route-controller-test-host></lit-material-route-controller-test-host>`,
    );

    history.pushState(null, "", "/users/9");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await el.updateComplete;

    expect(el.route.current.content).to.equal("user-9");
  });

  it("content is null when no route matches", async () => {
    history.replaceState(null, "", "/does-not-exist");
    const el = await fixture<RouteControllerTestHost>(
      html`<lit-material-route-controller-test-host></lit-material-route-controller-test-host>`,
    );
    expect(el.route.current.content).to.be.null;
  });

  it("stops reacting to navigation once the host disconnects", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<RouteControllerTestHost>(
      html`<lit-material-route-controller-test-host></lit-material-route-controller-test-host>`,
    );
    el.remove();

    expect(() => navigate("/users/1")).to.not.throw();
  });
});
