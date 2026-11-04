import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { createStore } from "@lit-material/store";
import { navigate, type RouteConfig } from "@lit-material/router";
import "@lit-material/router";
import { connectRouter, connectStore, getRegistry } from "./index.js";
import "./panel.js";
import type { LitMaterialDevtools } from "./devtools-panel.js";

interface CounterState {
  count: number;
  user: { name: string };
}
type CounterAction = { type: "increment" } | { type: "rename"; name: string };

const reducer = (state: CounterState, action: CounterAction): CounterState =>
  action.type === "increment" ? { ...state, count: state.count + 1 } : { ...state, user: { name: action.name } };

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<p>home</p>` },
  { path: "/users/:id", title: "User", render: (params) => html`<p>user ${params.id}</p>` },
];

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const settle = async (el: LitMaterialDevtools) => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextFrame();
  await el.updateComplete;
};

function buttonByText(root: ParentNode, text: string): HTMLButtonElement {
  const button = [...root.querySelectorAll("button")].find((b) => b.textContent!.trim() === text);
  if (!button) throw new Error(`no button "${text}"`);
  return button;
}

describe("connectRouter", () => {
  let disconnect: () => void;

  beforeEach(() => {
    history.replaceState(null, "", "/");
    getRegistry()!.router.length = 0;
    disconnect = connectRouter();
  });

  afterEach(() => {
    disconnect();
    history.replaceState(null, "", "/");
  });

  it("logs navigate() as push, { replace: true } as replace, and back as pop", async () => {
    navigate("/users/1?tab=info#top");
    navigate("/users/2", { replace: true });
    const popped = oneEvent(window, "popstate");
    history.back();
    await popped;

    const log = getRegistry()!.router;
    expect(log.map((e) => e.kind)).to.deep.equal(["push", "replace", "pop"]);
    expect(log[0]).to.include({ path: "/users/1", search: "?tab=info", hash: "#top" });
    expect(log[1]).to.include({ path: "/users/2", search: "", hash: "" });
    expect(log[2]!.path).to.equal("/");
    expect(log[0]!.time).to.be.a("number");
  });

  it("stops logging once disconnected", () => {
    disconnect();
    navigate("/users/3");
    expect(getRegistry()!.router).to.have.length(0);
  });
});

describe("lit-material-devtools", () => {
  const cleanups: (() => void)[] = [];

  afterEach(() => {
    while (cleanups.length) cleanups.pop()!();
    history.replaceState(null, "", "/");
  });

  async function setup() {
    const store = createStore(reducer, { count: 0, user: { name: "Ada" } });
    cleanups.push(connectStore(store, { name: "app" }));
    const el = await fixture<LitMaterialDevtools>(html`<lit-material-devtools></lit-material-devtools>`);
    return { store, el, root: el.shadowRoot! };
  }

  it("starts closed, with a launcher button that opens a labelled region", async () => {
    const { el, root } = await setup();
    const launcher = root.querySelector<HTMLButtonElement>(".launcher")!;
    expect(launcher.getAttribute("aria-expanded")).to.equal("false");
    expect(root.querySelector("[role=region]")).to.not.exist;

    launcher.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(launcher.getAttribute("aria-expanded")).to.equal("true");
    const region = root.querySelector("[role=region]")!;
    const heading = root.getElementById(region.getAttribute("aria-labelledby")!)!;
    expect(heading.textContent).to.equal("Devtools");
    expect(root.activeElement).to.equal(heading);
  });

  it("shows the current state as a collapsible tree", async () => {
    const { store, el, root } = await setup();
    el.open = true;
    await el.updateComplete;

    const rootNode = root.querySelector<HTMLButtonElement>(".tree .node")!;
    expect(rootNode.getAttribute("aria-expanded")).to.equal("true");
    expect(root.querySelector(".tree")!.textContent).to.contain("count").and.contain("0");

    const user = [...root.querySelectorAll<HTMLButtonElement>(".tree .node")].find((b) => b.textContent!.includes("user"))!;
    expect(user.getAttribute("aria-expanded")).to.equal("false");
    expect(root.querySelector(".tree")!.textContent).to.not.contain('"Ada"');
    user.click();
    await el.updateComplete;
    expect(user.getAttribute("aria-expanded")).to.equal("true");
    expect(root.querySelector(".tree")!.textContent).to.contain('"Ada"');

    store.dispatch({ type: "increment" });
    await el.updateComplete;
    expect(root.querySelector(".tree")!.textContent).to.contain("count: 1");
  });

  it("lists actions newest first; Jump here time travels and Back to live returns", async () => {
    const { store, el, root } = await setup();
    store.dispatch({ type: "increment" });
    store.dispatch({ type: "rename", name: "Grace" });
    store.dispatch({ type: "increment" });
    el.open = true;
    await el.updateComplete;

    const entries = [...root.querySelectorAll<HTMLButtonElement>(".entry")];
    expect(entries.map((b) => b.querySelector(".type")!.textContent)).to.deep.equal([
      "increment",
      "rename",
      "increment",
      "@@INIT",
    ]);

    entries[1]!.click(); // the rename, #2
    await el.updateComplete;
    expect(entries[1]!.getAttribute("aria-pressed")).to.equal("true");
    const detail = root.querySelectorAll("section")[2]!;
    expect(detail.textContent).to.contain("Action #2").and.contain("State after #2");

    buttonByText(root, "Jump here").click();
    await el.updateComplete;
    expect(store.getState()).to.deep.equal({ count: 1, user: { name: "Grace" } });
    expect(root.querySelector(".travelling")).to.exist;

    buttonByText(root.querySelector(".travelling")!, "Back to live").click();
    await el.updateComplete;
    expect(store.getState()).to.deep.equal({ count: 2, user: { name: "Grace" } });
    expect(root.querySelector(".travelling")).to.not.exist;
  });

  it("offers a picker when several stores are connected", async () => {
    const { el, root } = await setup();
    const other = createStore((s: { flag: boolean }) => s, { flag: true });
    cleanups.push(connectStore(other, { name: "settings" }));
    el.open = true;
    await el.updateComplete;

    const select = root.querySelector("select")!;
    expect([...select.options].map((o) => o.value)).to.deep.equal(["app", "settings"]);
    select.value = "settings";
    select.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(root.querySelector(".tree")!.textContent).to.contain("flag");
  });

  it("closes on Escape and returns focus to the launcher", async () => {
    const { el, root } = await setup();
    root.querySelector<HTMLButtonElement>(".launcher")!.click();
    await el.updateComplete;
    root.querySelector(".tab")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await el.updateComplete;
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(root.activeElement).to.equal(root.querySelector(".launcher"));
  });

  it("switches views with the tabs, including arrow keys", async () => {
    const { el, root } = await setup();
    el.open = true;
    await el.updateComplete;
    const [storeTab] = root.querySelectorAll<HTMLButtonElement>("[role=tab]");
    storeTab!.focus();
    storeTab!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await el.updateComplete;
    expect(el.view).to.equal("router");
    expect(root.querySelector("[role=tab][aria-selected=true]")!.textContent!.trim()).to.equal("Router");
  });

  it("shows each outlet's current route and the navigation log", async () => {
    history.replaceState(null, "", "/");
    cleanups.push(connectRouter());
    getRegistry()!.router.length = 0;
    const outletHost = await fixture(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);
    cleanups.push(() => outletHost.remove());
    const { el, root } = await setup();
    el.open = true;
    el.view = "router";
    await el.updateComplete;

    navigate("/users/42?tab=posts");
    await settle(el);

    const outlet = root.querySelector(".outlet")!;
    expect(outlet.textContent).to.contain("/users/42").and.contain("id=42").and.contain("tab=posts").and.contain("User");
    expect(outlet.textContent).to.match(/Pending\s*no/);

    const log = [...root.querySelectorAll(".route-entry")].map((li) => li.textContent!.replace(/\s+/g, " ").trim());
    expect(log[0]).to.match(/^push \/users\/42\?tab=posts/);
  });
});
