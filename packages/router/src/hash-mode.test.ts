import { expect, fixture, html, waitUntil } from "@open-wc/testing";
import "./router-outlet.js";
import type { LitMaterialRouterOutlet } from "./router-outlet.js";
import type { RouteConfig } from "./route-controller.js";
import { getRouterMode, routeHref, setBasePath, setRouterMode } from "./base-path.js";
import { navigate } from "./navigate.js";

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<p id="home">home</p>` },
  { path: "/orgs/:id", render: (params, _outlet, context) => html`<p id="org">${params.id} ${context.query.get("tab") ?? ""}</p>` },
];

const outlet = () =>
  fixture<LitMaterialRouterOutlet>(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);

const text = (el: LitMaterialRouterOutlet, id: string) => el.shadowRoot!.querySelector(`#${id}`)?.textContent?.trim();

describe("router hash mode", () => {
  beforeEach(() => {
    history.replaceState(null, "", "/app/");
    setRouterMode("hash");
  });

  afterEach(() => {
    setRouterMode("history");
    setBasePath("");
    history.replaceState(null, "", "/");
  });

  it("defaults to history mode", () => {
    setRouterMode("history");
    expect(getRouterMode()).to.equal("history");
  });

  it("matches the path and query after the #", async () => {
    history.replaceState(null, "", "/app/#/orgs/acme?tab=plan");
    const el = await outlet();
    expect(text(el, "org")).to.equal("acme plan");
  });

  it("matches \"/\" with no hash at all", async () => {
    const el = await outlet();
    expect(text(el, "home")).to.equal("home");
  });

  it("navigate() writes the route after the # and keeps the page's own path", async () => {
    setBasePath("/ignored");
    const el = await outlet();
    navigate("/orgs/acme");
    await el.updateComplete;
    expect(location.pathname).to.equal("/app/");
    expect(location.hash).to.equal("#/orgs/acme");
    expect(text(el, "org")).to.equal("acme");
  });

  it("turns a click on a #/ link into an in-app navigation", async () => {
    const el = await outlet();
    const link = document.createElement("a");
    link.href = routeHref("/orgs/b2");
    document.body.appendChild(link);
    link.click();
    await el.updateComplete;
    expect(location.hash).to.equal("#/orgs/b2");
    expect(text(el, "org")).to.equal("b2");
    link.remove();
  });

  it("leaves a plain #id link and links to other pages alone", async () => {
    const el = await outlet();
    const anchor = document.createElement("a");
    anchor.href = "#top";
    const other = document.createElement("a");
    other.href = "/elsewhere";
    let prevented = 0;
    const count = (event: Event) => {
      if (event.defaultPrevented) prevented++;
      event.preventDefault(); // keep the test page loaded
    };
    document.addEventListener("click", count);
    document.body.append(anchor, other);
    anchor.click();
    other.click();
    document.removeEventListener("click", count);
    anchor.remove();
    other.remove();
    expect(prevented).to.equal(0);
    expect(text(el, "home")).to.equal("home");
  });

  it("follows a hash the reader types or a script sets", async () => {
    const el = await outlet();
    location.hash = "#/orgs/typed";
    await waitUntil(() => text(el, "org") === "typed", "the outlet didn't follow the hash change");
  });

  it("routeHref() gives #/path in hash mode and base + path otherwise", () => {
    expect(routeHref("/orgs/a")).to.equal("#/orgs/a");
    setRouterMode("history");
    setBasePath("/app");
    expect(routeHref("/orgs/a")).to.equal("/app/orgs/a");
  });
});
