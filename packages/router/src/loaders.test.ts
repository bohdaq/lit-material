import { expect, fixture, html, nextFrame, oneEvent } from "@open-wc/testing";
import "./router-outlet.js";
import type { LitMaterialRouterOutlet } from "./router-outlet.js";
import type { RouteConfig } from "./route-controller.js";
import { navigate } from "./navigate.js";
import { ROUTE_DATA_ID, routeDataScript } from "./route-data.js";

const settle = async (el: LitMaterialRouterOutlet) => {
  for (let i = 0; i < 3; i++) {
    await el.updateComplete;
    await nextFrame();
  }
};

let loads: string[] = [];
let release: (() => void) | undefined;
let lastSignal: AbortSignal | undefined;

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<p id="home">home</p>` },
  {
    path: "/users/:id",
    loader: async ({ params, signal }) => {
      loads.push(params.id!);
      lastSignal = signal;
      if (params.id === "slow") await new Promise<void>((resolve) => (release = resolve));
      return { name: `User ${params.id}` };
    },
    title: ({ data }) => (data as { name: string }).name,
    render: (_p, _o, { data }) => html`<p id="user">${(data as { name: string }).name}</p>`,
  },
  {
    path: "/broken",
    loader: async () => Promise.reject(new Error("api down")),
    render: () => html`<p id="broken"></p>`,
  },
];

describe("route loaders in the browser", () => {
  let title = "";
  before(() => (title = document.title));
  beforeEach(() => {
    loads = [];
  });
  afterEach(() => {
    history.replaceState(null, "", "/");
    document.getElementById(ROUTE_DATA_ID)?.remove();
    document.title = title;
  });

  it("runs the loader before showing the route, keeping the old page up meanwhile", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<LitMaterialRouterOutlet>(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);
    navigate("/users/slow");
    await settle(el);
    expect(el.pending).to.be.true;
    expect(el.shadowRoot!.querySelector("#home")).to.exist;
    release!();
    await settle(el);
    expect(el.shadowRoot!.querySelector("#user")!.textContent).to.equal("User slow");
    expect(el.current.data).to.deep.equal({ name: "User slow" });
    expect(document.title).to.equal("User slow");
  });

  it("aborts a loader when a newer navigation starts", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<LitMaterialRouterOutlet>(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);
    navigate("/users/slow");
    await settle(el);
    const slowSignal = lastSignal!;
    navigate("/users/2");
    await settle(el);
    expect(slowSignal.aborted).to.be.true;
    release!();
    await settle(el);
    expect(el.shadowRoot!.querySelector("#user")!.textContent).to.equal("User 2");
  });

  it("reports a failing loader and keeps the previous page", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<LitMaterialRouterOutlet>(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);
    const failed = oneEvent(el, "lit-material-route-error");
    navigate("/broken");
    expect(((await failed).detail as { error: Error }).error.message).to.equal("api down");
    await settle(el);
    expect(el.shadowRoot!.querySelector("#home")).to.exist;
  });

  it("uses the data the server embedded for the first render, then loads on navigation", async () => {
    history.replaceState(null, "", "/users/7");
    document.body.insertAdjacentHTML("beforeend", routeDataScript({ path: "/users/7", data: [{ name: "From server" }] }));
    const el = await fixture<LitMaterialRouterOutlet>(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);
    expect(el.shadowRoot!.querySelector("#user")!.textContent).to.equal("From server");
    expect(loads).to.deep.equal([]);
    navigate("/users/8");
    await settle(el);
    expect(loads).to.deep.equal(["8"]);
    navigate("/users/7");
    await settle(el);
    expect(loads).to.deep.equal(["8", "7"]); // embedded data is for the first render only
  });
});
