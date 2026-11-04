import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFormValues } from "./values.js";

function formData(entries: [string, string][]): FormData {
  const data = new FormData();
  for (const [name, value] of entries) data.append(name, value);
  return data;
}

describe("parseFormValues", () => {
  it("reads flat names", () => {
    assert.deepEqual(parseFormValues(formData([["email", "a@b.c"], ["agree", "on"]])), { email: "a@b.c", agree: "on" });
  });

  it("nests dotted names into objects", () => {
    assert.deepEqual(parseFormValues(formData([["address.city", "Kyiv"], ["address.zip", "01001"]])), {
      address: { city: "Kyiv", zip: "01001" },
    });
  });

  it("turns integer segments into arrays, dotted or bracketed", () => {
    assert.deepEqual(
      parseFormValues(formData([["items.0.name", "a"], ["items[1].name", "b"], ["items[1].qty", "2"]])),
      { items: [{ name: "a" }, { name: "b", qty: "2" }] },
    );
    assert.deepEqual(parseFormValues(formData([["matrix.0.0", "x"], ["matrix.0.1", "y"]])), { matrix: [["x", "y"]] });
  });

  it("collects repeated names into arrays", () => {
    assert.deepEqual(parseFormValues(formData([["tag", "a"], ["tag", "b"], ["tag", "c"], ["one", "x"]])), {
      tag: ["a", "b", "c"],
      one: "x",
    });
    assert.deepEqual(parseFormValues(formData([["tags[]", "a"], ["tags[]", "b"]])), { tags: ["a", "b"] });
  });

  it("keeps File values as they are and accepts plain entries", () => {
    const file = new File(["x"], "x.txt");
    const data = new FormData();
    data.append("upload", file);
    assert.equal(parseFormValues(data).upload instanceof File, true);
    assert.deepEqual(parseFormValues([["a.b", "c"]]), { a: { b: "c" } });
  });

  it("ignores names that would reach Object.prototype, and own-property names like toString", () => {
    const values = parseFormValues(formData([["__proto__.polluted", "yes"], ["constructor.prototype.x", "y"], ["toString", "t"]]));
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
    assert.deepEqual(values, { toString: "t" });
  });

  it("returns an empty object for empty data", () => {
    assert.deepEqual(parseFormValues(new FormData()), {});
  });
});
