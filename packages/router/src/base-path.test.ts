import { expect, fixture, html } from "@open-wc/testing";
import { LitElement } from "lit";
import { setBasePath, getBasePath } from "./base-path.js";
import { navigate } from "./navigate.js";
import { RouteController, type RouteConfig } from "./route-controller.js";

describe("setBasePath/getBasePath", () => {
  afterEach(() => {
    setBasePath("");
    history.replaceState(null, "", "/");
  });

  it("defaults to no base path", () => {
    expect(getBasePath()).to.equal("");
  });

  it("normalizes a trailing slash away", () => {
    setBasePath("/lit-material/");
    expect(getBasePath()).to.equal("/lit-material");
  });

  it("adds a leading slash if missing", () => {
    setBasePath("lit-material");
    expect(getBasePath()).to.equal("/lit-material");
  });

  it("treats \"/\" the same as no base path", () => {
    setBasePath("/");
    expect(getBasePath()).to.equal("");
  });

  it("treats \"\" as no base path", () => {
    setBasePath("");
    expect(getBasePath()).to.equal("");
  });
});

describe("navigate() with a configured base path", () => {
  afterEach(() => {
    setBasePath("");
    history.replaceState(null, "", "/");
  });

  it("prepends the base path to history.pushState", () => {
    setBasePath("/lit-material");
    navigate("/components/button");
    expect(location.pathname).to.equal("/lit-material/components/button");
  });

  it("prepends the base path to history.replaceState too", () => {
    setBasePath("/lit-material");
    navigate("/theme", { replace: true });
    expect(location.pathname).to.equal("/lit-material/theme");
  });
});

const routes: RouteConfig<string>[] = [
  { path: "/", render: () => "home" },
  { path: "/components/button", render: () => "button" },
];

class BasePathTestHost extends LitElement {
  readonly route = new RouteController(this, () => routes);
  override render() {
    return this.route.current.content;
  }
}
customElements.define("lit-material-base-path-test-host", BasePathTestHost);

describe("RouteController with a configured base path", () => {
  afterEach(() => {
    setBasePath("");
    history.replaceState(null, "", "/");
  });

  it("strips the base path from location.pathname before matching", async () => {
    setBasePath("/lit-material");
    history.replaceState(null, "", "/lit-material/components/button");
    const el = await fixture<BasePathTestHost>(html`<lit-material-base-path-test-host></lit-material-base-path-test-host>`);
    expect(el.route.current.path).to.equal("/components/button");
    expect(el.route.current.content).to.equal("button");
  });

  it("resolves the base path's own root to \"/\"", async () => {
    setBasePath("/lit-material");
    history.replaceState(null, "", "/lit-material");
    const el = await fixture<BasePathTestHost>(html`<lit-material-base-path-test-host></lit-material-base-path-test-host>`);
    expect(el.route.current.path).to.equal("/");
    expect(el.route.current.content).to.equal("home");
  });

  it("keeps working unmodified when no base path is configured", async () => {
    history.replaceState(null, "", "/components/button");
    const el = await fixture<BasePathTestHost>(html`<lit-material-base-path-test-host></lit-material-base-path-test-host>`);
    expect(el.route.current.path).to.equal("/components/button");
    expect(el.route.current.content).to.equal("button");
  });
});
