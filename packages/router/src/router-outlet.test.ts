import { expect, fixture, html } from "@open-wc/testing";
import "./router-outlet.js";
import type { LitMaterialRouterOutlet } from "./router-outlet.js";
import type { RouteConfig } from "./route-controller.js";

const routes: RouteConfig<unknown>[] = [
  { path: "/", render: () => html`<p id="home">home</p>` },
  { path: "/about", render: () => html`<p id="about">about</p>` },
];

describe("lit-material-router-outlet", () => {
  afterEach(() => {
    history.replaceState(null, "", "/");
  });

  it("renders the route matching the initial location", async () => {
    history.replaceState(null, "", "/about");
    const el = await fixture<LitMaterialRouterOutlet>(
      html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`,
    );
    expect(el.shadowRoot!.querySelector("#about")).to.exist;
  });

  it("intercepts a same-origin link click and navigates without a full page load", async () => {
    history.replaceState(null, "", "/");
    const el = await fixture<LitMaterialRouterOutlet>(
      html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`,
    );
    expect(el.shadowRoot!.querySelector("#home")).to.exist;

    const link = document.createElement("a");
    link.href = "/about";
    link.textContent = "About";
    document.body.appendChild(link);
    link.click();
    await el.updateComplete;

    expect(window.location.pathname).to.equal("/about");
    expect(el.shadowRoot!.querySelector("#about")).to.exist;

    link.remove();
  });

  it("leaves a target=_blank link alone", async () => {
    history.replaceState(null, "", "/");
    await fixture<LitMaterialRouterOutlet>(
      html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`,
    );

    const link = document.createElement("a");
    link.href = "/about";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();

    expect(window.location.pathname).to.equal("/");
    link.remove();
  });

  it("leaves a cross-origin link alone", async () => {
    history.replaceState(null, "", "/");
    await fixture<LitMaterialRouterOutlet>(
      html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`,
    );

    const link = document.createElement("a");
    link.href = "https://example.com/about";
    document.body.appendChild(link);

    // A capturing listener runs before the outlet's own (bubble-phase, added
    // in connectedCallback) listener and before the browser's default
    // action, so this stops the test from actually navigating the page
    // away to a real cross-origin URL — independent of what the outlet
    // itself decides to do with the click.
    const preventNavigation = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("click", preventNavigation, { capture: true });
    const historyLengthBefore = history.length;

    link.click();

    // If the outlet had called navigate() for this cross-origin link, it
    // would have pushed a history entry — confirming it didn't is what
    // actually proves the outlet left the link alone.
    expect(history.length).to.equal(historyLengthBefore);
    expect(window.location.pathname).to.equal("/");

    document.removeEventListener("click", preventNavigation, { capture: true });
    link.remove();
  });
});
