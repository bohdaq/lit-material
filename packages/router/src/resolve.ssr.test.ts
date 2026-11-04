import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html, type TemplateResult } from "lit";
import { resolveRoute } from "./resolve.js";
import type { RouteConfig } from "./route-controller.js";
import "./router-outlet.js";

let signedIn = false;
let loads = 0;

const routes: RouteConfig<TemplateResult>[] = [
  { path: "/", title: "Home", render: () => html`<p>Home</p>` },
  { path: "/u/:id", redirect: "/users/:id" },
  { path: "/old", redirect: "/u/7" },
  {
    path: "/users/:id",
    title: ({ params }) => `User ${params.id}`,
    load: async () => {
      loads++;
    },
    render: (params, _outlet, { query }) => html`<p>User ${params.id} tab ${query.get("tab") ?? "none"}</p>`,
  },
  {
    path: "/admin",
    guard: async () => (signedIn ? true : "/login"),
    children: [{ path: "", title: "Admin", render: () => html`<p>Admin</p>` }],
  },
  { path: "/locked", guard: () => false, render: () => html`<p>Locked</p>` },
  { path: "/login", render: () => html`<p>Login</p>` },
  { path: "/*", status: 404, title: "Not found", render: () => html`<p>Not found</p>` },
];

describe("resolveRoute (no browser)", () => {
  it("resolves a plain route with its title", async () => {
    const result = await resolveRoute(routes, "/");
    assert.equal(result.status, 200);
    assert.equal(result.title, "Home");
  });

  it("runs load() once and passes params and query to render and title", async () => {
    loads = 0;
    const result = await resolveRoute(routes, "/users/42?tab=keys");
    await resolveRoute(routes, "/users/43");
    assert.equal(loads, 1);
    assert.equal(result.title, "User 42");
    assert.deepEqual(result.params, { id: "42" });
    const out = await collectResult(render(result.content!));
    assert.match(out, /User <!--lit-part-->42<!--\/lit-part--> tab <!--lit-part-->keys/);
  });

  it("follows redirects (filling :params) and reports the final one as a 302", async () => {
    assert.deepEqual(await resolveRoute(routes, "/u/9"), {
      status: 302,
      path: "/users/9",
      redirect: "/users/9",
      params: {},
      content: null,
    });
    const chained = await resolveRoute(routes, "/old");
    assert.equal(chained.redirect, "/users/7");
  });

  it("an async guard redirects, or lets a pathless child through", async () => {
    signedIn = false;
    assert.equal((await resolveRoute(routes, "/admin")).redirect, "/login");
    signedIn = true;
    const result = await resolveRoute(routes, "/admin");
    assert.equal(result.status, 200);
    assert.equal(result.title, "Admin");
  });

  it("403 when a guard cancels, the route's status on a catch-all, 404 when nothing matches", async () => {
    assert.equal((await resolveRoute(routes, "/locked")).status, 403);
    assert.equal((await resolveRoute(routes, "/nope")).status, 404);
    assert.equal((await resolveRoute([{ path: "/", render: () => html`` }], "/nope")).status, 404);
  });

  it("stops a redirect loop", async () => {
    const loop: RouteConfig<unknown>[] = [
      { path: "/a", redirect: "/b" },
      { path: "/b", redirect: "/a" },
    ];
    await assert.rejects(resolveRoute(loop, "/a"), /redirects/);
  });
});

describe("lit-material-router-outlet path (SSR)", () => {
  it("renders the route for its path attribute on the server", async () => {
    const out = await collectResult(
      render(html`<lit-material-router-outlet .routes=${routes} path="/users/5?tab=x"></lit-material-router-outlet>`),
    );
    assert.match(out, /User <!--lit-part-->5<!--\/lit-part--> tab <!--lit-part-->x/);
  });
});
