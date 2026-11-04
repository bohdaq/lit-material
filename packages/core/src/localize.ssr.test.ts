import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMessage, registerTranslation } from "./localize.js";

describe("formatMessage (no browser)", () => {
  it("falls back to the component's English text", () => {
    assert.equal(formatMessage("en", "test.none", "Dismiss"), "Dismiss");
  });

  it("fills placeholders, formatting numbers for the locale", () => {
    assert.equal(formatMessage("en", "test.range", "{from}–{to} of {total}", { from: 1, to: 10, total: 12000 }), "1–10 of 12,000");
    assert.equal(formatMessage("de", "test.range", "{from}–{to} of {total}", { from: 1, to: 10, total: 12000 }), "1–10 of 12.000");
    assert.equal(formatMessage("en", "test.missing", "Hi {name}"), "Hi {name}");
  });

  it("chooses plural forms by count", () => {
    const files = { one: "{count} file", other: "{count} files" };
    assert.equal(formatMessage("en", "test.files", files, { count: 1 }), "1 file");
    assert.equal(formatMessage("en", "test.files", files, { count: 3 }), "3 files");
  });

  it("uses a registered translation, then its base language, with the locale's plural rules", () => {
    registerTranslation({
      $code: "pl",
      "test.files": { one: "{count} plik", few: "{count} pliki", many: "{count} plików", other: "{count} pliku" },
      "test.dismiss": "Zamknij",
    });
    assert.equal(formatMessage("pl", "test.dismiss", "Dismiss"), "Zamknij");
    assert.equal(formatMessage("pl-PL", "test.dismiss", "Dismiss"), "Zamknij");
    const files = { one: "{count} file", other: "{count} files" };
    assert.equal(formatMessage("pl", "test.files", files, { count: 1 }), "1 plik");
    assert.equal(formatMessage("pl", "test.files", files, { count: 3 }), "3 pliki");
    assert.equal(formatMessage("pl", "test.files", files, { count: 5 }), "5 plików");
  });

  it("merges a second registration for the same language", () => {
    registerTranslation({ $code: "fr", "test.a": "A" });
    registerTranslation({ $code: "FR", "test.b": "B" });
    assert.equal(formatMessage("fr", "test.a", "x"), "A");
    assert.equal(formatMessage("fr", "test.b", "x"), "B");
  });

  it("survives an invalid language tag", () => {
    assert.equal(formatMessage("not a tag!", "test.n", "{n}", { n: 1000 }), "1,000");
  });
});
