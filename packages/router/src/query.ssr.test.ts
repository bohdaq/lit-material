import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatQuery, parseQuery, queryParam } from "./query.js";

const schema = {
  q: queryParam.string(),
  page: queryParam.number(1),
  open: queryParam.boolean(),
  sort: queryParam.oneOf(["name", "date"] as const),
  tag: queryParam.list(),
};

describe("parseQuery / formatQuery (no browser)", () => {
  it("reads typed values", () => {
    const values = parseQuery(schema, "?q=hi&page=3&open&sort=date&tag=a&tag=b");
    assert.deepEqual(values, { q: "hi", page: 3, open: true, sort: "date", tag: ["a", "b"] });
  });

  it("falls back to defaults for missing or malformed values", () => {
    const values = parseQuery(schema, new URLSearchParams("page=abc&sort=size&open=maybe"));
    assert.deepEqual(values, { q: "", page: 1, open: false, sort: "name", tag: [] });
  });

  it("accepts a URL and an undefined default", () => {
    const { limit } = parseQuery({ limit: queryParam.number(undefined) }, new URL("http://x/?limit=5"));
    assert.equal(limit, 5);
    assert.equal(parseQuery({ limit: queryParam.number(undefined) }, "").limit, undefined);
  });

  it("writes values, leaving out defaults", () => {
    assert.equal(formatQuery(schema, { q: "a b", page: 1, sort: "date", tag: ["x", "y"] }), "?q=a+b&sort=date&tag=x&tag=y");
    assert.equal(formatQuery(schema, { page: 1, open: false }), "");
  });

  it("round-trips", () => {
    const values = { q: "z", page: 4, open: true, sort: "date" as const, tag: ["t"] };
    assert.deepEqual(parseQuery(schema, formatQuery(schema, values)), values);
  });
});
