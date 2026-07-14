import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchRoute } from "./match.js";

describe("matchRoute (no browser)", () => {
  it("matches a static path", () => {
    assert.deepEqual(matchRoute("/about", "/about"), { params: {} });
  });

  it("matches the root path", () => {
    assert.deepEqual(matchRoute("/", "/"), { params: {} });
  });

  it("captures named params", () => {
    assert.deepEqual(matchRoute("/users/:id", "/users/42"), { params: { id: "42" } });
  });

  it("decodes percent-encoded param values", () => {
    assert.deepEqual(matchRoute("/search/:term", "/search/hello%20world"), {
      params: { term: "hello world" },
    });
  });

  it("captures a trailing wildcard", () => {
    assert.deepEqual(matchRoute("/files/*", "/files/a/b/c.txt"), {
      params: { wildcard: "a/b/c.txt" },
    });
  });

  it("returns null when the segment count differs", () => {
    assert.equal(matchRoute("/users/:id", "/users"), null);
    assert.equal(matchRoute("/users/:id", "/users/1/edit"), null);
  });

  it("returns null when a static segment doesn't match", () => {
    assert.equal(matchRoute("/about", "/contact"), null);
  });

  it("ignores a trailing slash", () => {
    assert.deepEqual(matchRoute("/about", "/about/"), { params: {} });
  });
});
