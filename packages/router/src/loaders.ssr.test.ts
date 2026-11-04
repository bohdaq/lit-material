import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html, type TemplateResult } from "lit";
import { resolveRoute } from "./resolve.js";
import { routeDataScript } from "./route-data.js";
import type { RouteConfig } from "./route-controller.js";
import "./router-outlet.js";

let calls = 0;
const routes: RouteConfig<TemplateResult>[] = [
  {
    path: "/teams/:team",
    loader: async ({ params }) => ({ team: params.team!.toUpperCase() }),
    render: (_p, outlet, { data }) => html`<section>${(data as { team: string }).team}: ${outlet()}</section>`,
    children: [
      {
        path: "users/:id",
        loader: async ({ params, query, signal }) => {
          calls++;
          assert.ok(signal instanceof AbortSignal);
          return { name: `user ${params.id}`, tab: query.get("tab") };
        },
        title: ({ data }) => (data as { name: string }).name,
        render: (_p, _o, { data }) => html`<p>${(data as { name: string }).name} (${(data as { tab: string }).tab})</p>`,
      },
    ],
  },
  { path: "/plain", render: () => html`<p>plain</p>` },
];

describe("route loaders on the server (no browser)", () => {
  it("resolveRoute runs every loader in the chain and renders with their data", async () => {
    calls = 0;
    const result = await resolveRoute(routes, "/teams/red/users/7?tab=keys");
    assert.equal(calls, 1);
    assert.equal(result.title, "user 7");
    assert.deepEqual(result.data, [{ team: "RED" }, { name: "user 7", tab: "keys" }]);
    assert.equal(result.search, "?tab=keys");
    const out = await collectResult(render(result.content!));
    assert.match(out, /RED/);
    assert.match(out, /user <!--lit-part-->7|user 7/);
  });

  it("the outlet renders a loader route on the server only when given its data", async () => {
    const result = await resolveRoute(routes, "/teams/red/users/7");
    const withData = await collectResult(
      render(html`<lit-material-router-outlet .routes=${routes} path=${result.path} .data=${result.data}></lit-material-router-outlet>`),
    );
    assert.match(withData, /user 7/);
    const without = await collectResult(
      render(html`<lit-material-router-outlet .routes=${routes} path=${result.path}></lit-material-router-outlet>`),
    );
    assert.doesNotMatch(without, /user 7/);
  });

  it("routes without loaders resolve with empty data", async () => {
    const result = await resolveRoute(routes, "/plain");
    assert.deepEqual(result.data, []);
  });

  it("routeDataScript embeds JSON that can't close its script element", () => {
    const tag = routeDataScript({ path: "/x", search: "", data: [{ html: "</script><script>alert(1)</script>" }] });
    assert.equal(tag.match(/<\/script>/g)?.length, 1);
    const json = tag.slice(tag.indexOf(">") + 1, tag.lastIndexOf("</script>"));
    assert.deepEqual(JSON.parse(json).data, [{ html: "</script><script>alert(1)</script>" }]);
  });
});
