import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { describe, it } from "node:test";
import { formatMessage, registerTranslation, type Message } from "@lit-material/core/localize.js";
import en from "./en.js";

const placeholders = (message: Message): Set<string> => {
  const texts = typeof message === "string" ? [message] : Object.values(message);
  return new Set(texts.flatMap((text) => [...(text ?? "").matchAll(/\{(\w+)\}/g)].map((m) => m[1]!)));
};
const keysOf = (catalog: object) => Object.keys(catalog).filter((k) => !k.startsWith("$")).sort();

const files = readdirSync(new URL(".", import.meta.url)).filter(
  (f) => /^[a-z]{2}(-[A-Z]{2})?\.ts$/.test(f) && f !== "en.ts" && (!process.env.CATALOG || f === `${process.env.CATALOG}.ts`),
);

describe("translation catalogs (no browser)", () => {
  it("has catalogs besides English", () => {
    assert.ok(files.length > 0);
  });

  for (const file of files) {
    it(`${file}: same keys and placeholders as English, valid plural forms`, async () => {
      const catalog = (await import(`./${file.replace(/\.ts$/, ".js")}`)).default as Record<string, Message>;
      assert.equal(catalog.$code, file.replace(/\.ts$/, ""));
      assert.deepEqual(keysOf(catalog), keysOf(en));
      const rules = new Intl.PluralRules(catalog.$code as string).resolvedOptions().pluralCategories;
      for (const key of keysOf(en)) {
        const message = catalog[key]!;
        const reference = (en as Record<string, Message>)[key]!;
        const missing = [...placeholders(reference)].filter((p) => p !== "count" && !placeholders(message).has(p));
        assert.deepEqual(missing, [], `${file} ${key}: missing placeholders`);
        const extra = [...placeholders(message)].filter((p) => !placeholders(reference).has(p));
        assert.deepEqual(extra, [], `${file} ${key}: unknown placeholders`);
        if (typeof reference !== "string") {
          assert.equal(typeof message, "object", `${file} ${key}: needs plural forms`);
          for (const rule of rules) assert.ok(rule in (message as object), `${file} ${key}: no "${rule}" form`);
        }
      }
      registerTranslation(catalog as never);
      assert.notEqual(formatMessage(catalog.$code as string, keysOf(en)[0]!, "\u0000"), "\u0000");
    });
  }
});
