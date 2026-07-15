import { expect, fixture, html } from "@open-wc/testing";
import type { TemplateResult } from "lit";
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

const nestedRoutes: RouteConfig<TemplateResult>[] = [
  {
    path: "/dashboard",
    render: (_params, outlet) => html`<div class="shell">shell:${outlet()}</div>`,
    children: [
      { path: "", render: () => html`<span class="index">index</span>` },
      { path: "settings", render: () => html`<span class="settings">settings</span>` },
    ],
  },
];

class NestedRouteTestHost extends LitElement {
  readonly route = new RouteController(this, () => nestedRoutes);

  override render() {
    return this.route.current.content;
  }
}
customElements.define("lit-material-nested-route-test-host", NestedRouteTestHost);

describe("RouteController nested routes", () => {
  afterEach(() => {
    history.replaceState(null, "", "/");
  });

  it("renders the parent shell wrapping the matched child, via outlet()", async () => {
    history.replaceState(null, "", "/dashboard/settings");
    const el = await fixture<NestedRouteTestHost>(
      html`<lit-material-nested-route-test-host></lit-material-nested-route-test-host>`,
    );
    expect(el.shadowRoot!.querySelector(".shell")).to.exist;
    expect(el.shadowRoot!.querySelector(".settings")).to.exist;
    expect(el.shadowRoot!.textContent).to.include("shell:");
  });

  it("renders the index child when the parent path matches exactly", async () => {
    history.replaceState(null, "", "/dashboard");
    const el = await fixture<NestedRouteTestHost>(
      html`<lit-material-nested-route-test-host></lit-material-nested-route-test-host>`,
    );
    expect(el.shadowRoot!.querySelector(".index")).to.exist;
    expect(el.shadowRoot!.querySelector(".settings")).to.not.exist;
  });

  it("re-renders just the nested child on navigate(), keeping the shell mounted", async () => {
    history.replaceState(null, "", "/dashboard");
    const el = await fixture<NestedRouteTestHost>(
      html`<lit-material-nested-route-test-host></lit-material-nested-route-test-host>`,
    );
    expect(el.shadowRoot!.querySelector(".index")).to.exist;

    navigate("/dashboard/settings");
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector(".shell")).to.exist;
    expect(el.shadowRoot!.querySelector(".settings")).to.exist;
    expect(el.shadowRoot!.querySelector(".index")).to.not.exist;
  });

  it("falls through to a sibling route when no child matches the nested path", async () => {
    const withFallback: RouteConfig<TemplateResult>[] = [
      ...nestedRoutes,
      { path: "*", render: () => html`<span class="not-found">not found</span>` },
    ];

    class HostWithFallback extends LitElement {
      readonly route = new RouteController(this, () => withFallback);
      override render() {
        return this.route.current.content;
      }
    }
    customElements.define("lit-material-nested-route-fallback-host", HostWithFallback);

    history.replaceState(null, "", "/dashboard/nope");
    const el = await fixture<HostWithFallback>(
      html`<lit-material-nested-route-fallback-host></lit-material-nested-route-fallback-host>`,
    );
    expect(el.shadowRoot!.querySelector(".not-found")).to.exist;
    expect(el.shadowRoot!.querySelector(".shell")).to.not.exist;
  });
});
