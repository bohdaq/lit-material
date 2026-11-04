// Its own file, so its own page: embedded route data is read once per page.
import { expect, fixture, html, nextFrame } from "@open-wc/testing";
import "./router-outlet.js";
import type { LitMaterialRouterOutlet } from "./router-outlet.js";
import type { RouteConfig } from "./route-controller.js";
import { routeDataScript } from "./route-data.js";

it("ignores embedded data for another path and loads instead", async () => {
  const loads: string[] = [];
  const routes: RouteConfig<unknown>[] = [
    {
      path: "/users/:id",
      loader: async ({ params }) => (loads.push(params.id!), { name: `User ${params.id}` }),
      render: (_p, _o, { data }) => html`<p id="user">${(data as { name: string }).name}</p>`,
    },
  ];
  history.replaceState(null, "", "/users/3");
  document.body.insertAdjacentHTML("beforeend", routeDataScript({ path: "/users/9", data: [{ name: "Wrong" }] }));
  const el = await fixture<LitMaterialRouterOutlet>(html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`);
  for (let i = 0; i < 3; i++) {
    await el.updateComplete;
    await nextFrame();
  }
  expect(el.shadowRoot!.querySelector("#user")!.textContent).to.equal("User 3");
  expect(loads).to.deep.equal(["3"]);
  history.replaceState(null, "", "/");
});
