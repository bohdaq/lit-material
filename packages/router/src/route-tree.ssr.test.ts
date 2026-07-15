import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchRoutePrefix } from "./match.js";
import { matchRouteTree } from "./route-tree.js";
import type { RouteConfig } from "./route-controller.js";

describe("matchRoutePrefix (no browser)", () => {
  it("leaves the remainder when the pattern only matches a prefix", () => {
    const matched = matchRoutePrefix("/dashboard", "/dashboard/settings");
    assert.deepEqual(matched, { params: {}, remaining: "/settings" });
  });

  it("has no remainder on an exact match", () => {
    assert.deepEqual(matchRoutePrefix("/dashboard", "/dashboard"), { params: {}, remaining: "" });
  });

  it("a root/empty pattern matches everything as remaining (layout-route case)", () => {
    assert.deepEqual(matchRoutePrefix("/", "/settings/profile"), { params: {}, remaining: "/settings/profile" });
  });

  it("combines named params with a remainder", () => {
    const matched = matchRoutePrefix("/users/:id", "/users/42/edit");
    assert.deepEqual(matched, { params: { id: "42" }, remaining: "/edit" });
  });

  it("a wildcard always leaves no remainder", () => {
    const matched = matchRoutePrefix("/files/*", "/files/a/b/c.txt");
    assert.deepEqual(matched, { params: { wildcard: "a/b/c.txt" }, remaining: "" });
  });

  it("returns null when a static segment doesn't match", () => {
    assert.equal(matchRoutePrefix("/dashboard", "/profile"), null);
  });

  it("returns null when the pattern is longer than the path", () => {
    assert.equal(matchRoutePrefix("/dashboard/settings", "/dashboard"), null);
  });
});

describe("matchRouteTree (no browser)", () => {
  it("composes a two-level match: parent renders a shell, outlet() renders the matched child", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/dashboard",
        render: (_params, outlet) => `shell(${outlet()})`,
        children: [{ path: "settings", render: () => "settings" }],
      },
    ];
    const matched = matchRouteTree(routes, "/dashboard/settings");
    assert.equal(matched?.content, "shell(settings)");
  });

  it("matches an index child (path: \"\") when the parent path is hit exactly", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/dashboard",
        render: (_params, outlet) => `shell(${outlet()})`,
        children: [
          { path: "", render: () => "index" },
          { path: "settings", render: () => "settings" },
        ],
      },
    ];
    const matched = matchRouteTree(routes, "/dashboard");
    assert.equal(matched?.content, "shell(index)");
  });

  it("renders the parent alone with a null outlet when no index child is declared", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/dashboard",
        render: (_params, outlet) => `shell(${outlet() ?? "empty"})`,
        children: [{ path: "settings", render: () => "settings" }],
      },
    ];
    const matched = matchRouteTree(routes, "/dashboard");
    assert.equal(matched?.content, "shell(empty)");
  });

  it("does not match a parent branch at all when path remains and no child matches — falls through to the next sibling", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/dashboard",
        render: (_params, outlet) => `shell(${outlet()})`,
        children: [{ path: "settings", render: () => "settings" }],
      },
      { path: "*", render: () => "not-found" },
    ];
    const matched = matchRouteTree(routes, "/dashboard/nope");
    assert.equal(matched?.content, "not-found");
  });

  it("merges params from every level", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/orgs/:orgId",
        render: (params, outlet) => `org(${params.orgId})>${outlet()}`,
        children: [{ path: "users/:userId", render: (params) => `user(${params.orgId},${params.userId})` }],
      },
    ];
    const matched = matchRouteTree(routes, "/orgs/acme/users/42");
    assert.equal(matched?.content, "org(acme)>user(acme,42)");
    assert.deepEqual(matched?.params, { orgId: "acme", userId: "42" });
  });

  it("supports three levels of nesting", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/a",
        render: (_p, outlet) => `a(${outlet()})`,
        children: [
          {
            path: "b",
            render: (_p, outlet) => `b(${outlet()})`,
            children: [{ path: "c", render: () => "c" }],
          },
        ],
      },
    ];
    const matched = matchRouteTree(routes, "/a/b/c");
    assert.equal(matched?.content, "a(b(c))");
  });

  it("a wildcard child catches everything left over under a parent", () => {
    const routes: RouteConfig<string>[] = [
      {
        path: "/docs",
        render: (_p, outlet) => `docs(${outlet()})`,
        children: [{ path: "*", render: (params) => `page:${params.wildcard}` }],
      },
    ];
    const matched = matchRouteTree(routes, "/docs/guide/intro");
    assert.equal(matched?.content, "docs(page:guide/intro)");
  });

  it("returns null when nothing matches at all", () => {
    const routes: RouteConfig<string>[] = [{ path: "/dashboard", render: () => "dashboard" }];
    assert.equal(matchRouteTree(routes, "/elsewhere"), null);
  });

  it("a leaf route (no children) still works exactly like the flat case", () => {
    const routes: RouteConfig<string>[] = [
      { path: "/", render: () => "home" },
      { path: "/about", render: () => "about" },
    ];
    assert.equal(matchRouteTree(routes, "/about")?.content, "about");
  });
});
