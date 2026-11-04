import { expect, fixture, html, nextFrame, oneEvent } from "@open-wc/testing";
import "./router-outlet.js";
import type { LitMaterialRouterOutlet } from "./router-outlet.js";
import type { RouteConfig } from "./route-controller.js";
import { navigate } from "./navigate.js";

const settle = async (el: LitMaterialRouterOutlet) => {
  for (let i = 0; i < 3; i++) {
    await el.updateComplete;
    await nextFrame();
  }
};

let signedIn = false;
let releaseLoad: () => void = () => {};
let loadCalls = 0;
let releaseSlow: () => void = () => {};

const routes: RouteConfig<unknown>[] = [
  { path: "/", title: "Home", render: () => html`<p id="home">home</p>` },
  { path: "/u/:id", redirect: "/users/:id" },
  {
    path: "/users/:id",
    title: ({ params }) => `User ${params.id}`,
    render: (params, _outlet, { query }) => html`<p id="user">${params.id}:${query.get("tab") ?? ""}</p>`,
  },
  {
    path: "/admin",
    guard: async () => (signedIn ? true : "/login"),
    render: () => html`<p id="admin">admin</p>`,
  },
  { path: "/locked", guard: () => false, render: () => html`<p id="locked">locked</p>` },
  { path: "/login", render: () => html`<p id="login">login</p>` },
  {
    path: "/lazy",
    load: () => {
      loadCalls++;
      return new Promise<void>((resolve) => (releaseLoad = resolve));
    },
    render: () => html`<p id="lazy">lazy</p>`,
  },
  { path: "/slow", load: () => new Promise<void>((resolve) => (releaseSlow = resolve)), render: () => html`<p id="slow"></p>` },
  { path: "/broken", load: () => Promise.reject(new Error("chunk failed")), render: () => html`<p id="broken"></p>` },
  { path: "/long", render: () => html`<div id="long" style="height: 5000px">long</div>` },
  {
    path: "/anchors",
    render: () => html`<div style="height: 3000px"></div><h2 id="deep">deep</h2><div style="height: 3000px"></div>`,
  },
];

const mount = (template = html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`) =>
  fixture<LitMaterialRouterOutlet>(template);

describe("lit-material-router-outlet v2", () => {
  let title = "";
  before(() => {
    title = document.title;
  });
  afterEach(() => {
    signedIn = false;
    history.replaceState(null, "", "/");
    document.title = title;
    window.scrollTo(0, 0);
  });

  it("follows a redirect with params, replacing the history entry", async () => {
    history.replaceState(null, "", "/");
    const el = await mount();
    const length = history.length;
    navigate("/u/5");
    await settle(el);
    expect(location.pathname).to.equal("/users/5");
    expect(history.length).to.equal(length + 1);
    expect(el.shadowRoot!.querySelector("#user")!.textContent).to.equal("5:");
  });

  it("passes the query to render", async () => {
    history.replaceState(null, "", "/users/3?tab=keys");
    const el = await mount();
    expect(el.shadowRoot!.querySelector("#user")!.textContent).to.equal("3:keys");
    expect(el.current.query.get("tab")).to.equal("keys");
  });

  it("an async guard redirects, keeping the old page up and pending meanwhile", async () => {
    history.replaceState(null, "", "/");
    const el = await mount();
    navigate("/admin");
    await el.updateComplete;
    expect(el.pending).to.be.true;
    expect(el.hasAttribute("pending")).to.be.true;
    expect(el.shadowRoot!.querySelector("#home")).to.exist;
    await settle(el);
    expect(location.pathname).to.equal("/login");
    expect(el.shadowRoot!.querySelector("#login")).to.exist;
    expect(el.pending).to.be.false;
  });

  it("an async guard lets the route through", async () => {
    signedIn = true;
    history.replaceState(null, "", "/");
    const el = await mount();
    navigate("/admin");
    await settle(el);
    expect(el.shadowRoot!.querySelector("#admin")).to.exist;
  });

  it("a cancelling guard keeps the page and restores the address bar", async () => {
    history.replaceState(null, "", "/users/1");
    const el = await mount();
    navigate("/locked");
    await settle(el);
    expect(location.pathname).to.equal("/users/1");
    expect(el.shadowRoot!.querySelector("#user")).to.exist;
    expect(el.shadowRoot!.querySelector("#locked")).to.not.exist;
  });

  it("waits for a lazy route's load() before showing it, and loads it once", async () => {
    history.replaceState(null, "", "/");
    loadCalls = 0;
    const el = await mount();
    navigate("/lazy");
    await settle(el);
    expect(el.pending).to.be.true;
    expect(el.shadowRoot!.querySelector("#home")).to.exist;
    releaseLoad();
    await settle(el);
    expect(el.shadowRoot!.querySelector("#lazy")).to.exist;
    expect(el.pending).to.be.false;

    navigate("/");
    await settle(el);
    navigate("/lazy");
    await settle(el);
    expect(el.shadowRoot!.querySelector("#lazy")).to.exist;
    expect(loadCalls).to.equal(1);
  });

  it("a newer navigation wins over a slow one", async () => {
    history.replaceState(null, "", "/");
    const el = await mount();
    navigate("/slow");
    await settle(el);
    expect(el.pending).to.be.true;
    navigate("/users/2");
    await settle(el);
    releaseSlow();
    await settle(el);
    expect(el.shadowRoot!.querySelector("#user")).to.exist;
    expect(el.shadowRoot!.querySelector("#slow")).to.not.exist;
  });

  it("reports a failed load() and keeps the previous page", async () => {
    history.replaceState(null, "", "/");
    const el = await mount();
    const event = oneEvent(el, "lit-material-route-error");
    navigate("/broken");
    const { detail } = await event;
    expect((detail as { error: Error }).error.message).to.equal("chunk failed");
    await settle(el);
    expect(el.shadowRoot!.querySelector("#home")).to.exist;
    expect(el.pending).to.be.false;
  });

  it("sets document.title through the title template, and restores the default without one", async () => {
    history.replaceState(null, "", "/users/8");
    const el = await mount(
      html`<lit-material-router-outlet .routes=${routes} title-template="%s · App"></lit-material-router-outlet>`,
    );
    await settle(el);
    expect(document.title).to.equal("User 8 · App");
    navigate("/login");
    await settle(el);
    expect(document.title).to.equal(title);
  });

  it("leaves document.title alone for an app that never uses title", async () => {
    history.replaceState(null, "", "/login");
    const el = await mount();
    document.title = "Set by the app";
    navigate("/long");
    await settle(el);
    expect(document.title).to.equal("Set by the app");
  });

  it("scrolls to the top on a new navigation and back to the saved position on back", async () => {
    history.replaceState(null, "", "/long");
    const el = await mount();
    await settle(el);
    window.scrollTo(0, 1200);
    await settle(el);

    navigate("/anchors");
    await settle(el);
    expect(window.scrollY).to.equal(0);

    history.back();
    await oneEvent(window, "popstate");
    await settle(el);
    expect(location.pathname).to.equal("/long");
    expect(window.scrollY).to.equal(1200);
  });

  it("scrolls to the #hash target inside the routed content", async () => {
    history.replaceState(null, "", "/");
    const el = await mount();
    navigate("/anchors#deep");
    await settle(el);
    const top = el.shadowRoot!.querySelector("#deep")!.getBoundingClientRect().top;
    expect(Math.abs(top)).to.be.lessThan(2);
  });

  it("leaves scrolling alone with scroll-restoration=none", async () => {
    history.replaceState(null, "", "/long");
    const el = await mount(
      html`<lit-material-router-outlet .routes=${routes} scroll-restoration="none"></lit-material-router-outlet>`,
    );
    window.scrollTo(0, 800);
    navigate("/long?again");
    await settle(el);
    expect(window.scrollY).to.equal(800);
  });

  it("re-matches when its routes change", async () => {
    history.replaceState(null, "", "/");
    const el = await mount();
    el.routes = [{ path: "/", render: () => html`<p id="other">other</p>` }];
    await settle(el);
    expect(el.shadowRoot!.querySelector("#other")).to.exist;
  });
});
