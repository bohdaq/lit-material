// The mapping table is checked against lit-material's real API: every tag, attribute, value, slot and
// event it writes must exist on the lit-material element (from custom-elements.json, via src/generated.ts).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { LIT_ELEMENTS } from "./generated.js";
import { ELEMENTS, TOKEN_PREFIXES } from "./mappings.js";

const here = dirname(fileURLToPath(import.meta.url));

/** The literal values an attribute type allows (`"filled" | "outlined"`), or null for an open type. */
function values(type: string): string[] | null {
  const literals = [...type.matchAll(/"([^"]*)"/g)].map((m) => m[1]!);
  return literals.length ? literals : null;
}

function assertAttribute(tag: string, name: string, value: string | true, where: string) {
  const facts = LIT_ELEMENTS[tag]!;
  const type = facts.attributes[name];
  assert.ok(type !== undefined, `${where}: <${tag}> has no attribute "${name}"`);
  if (value === true) assert.match(type, /boolean/, `${where}: <${tag}> ${name} isn't boolean`);
  else {
    const allowed = values(type);
    if (allowed) assert.ok(allowed.includes(value), `${where}: <${tag}> ${name}="${value}" isn't one of ${allowed.join(", ")}`);
  }
}

describe("mappings", () => {
  it("lists each @material/web tag and module once", () => {
    assert.equal(new Set(ELEMENTS.map((m) => m.md)).size, ELEMENTS.length);
    assert.equal(new Set(ELEMENTS.map((m) => m.module)).size, ELEMENTS.length);
  });

  it("covers the @material/web v2 components", () => {
    const tags = new Set(ELEMENTS.map((m) => m.md));
    for (const md of [
      "md-filled-button", "md-outlined-button", "md-text-button", "md-elevated-button", "md-filled-tonal-button",
      "md-icon-button", "md-filled-icon-button", "md-filled-tonal-icon-button", "md-outlined-icon-button",
      "md-fab", "md-branded-fab", "md-checkbox", "md-radio", "md-switch", "md-slider",
      "md-filled-text-field", "md-outlined-text-field", "md-filled-select", "md-outlined-select", "md-select-option",
      "md-chip-set", "md-assist-chip", "md-filter-chip", "md-input-chip", "md-suggestion-chip",
      "md-dialog", "md-menu", "md-menu-item", "md-sub-menu", "md-list", "md-list-item",
      "md-tabs", "md-primary-tab", "md-secondary-tab", "md-linear-progress", "md-circular-progress",
      "md-divider", "md-icon", "md-ripple", "md-focus-ring", "md-elevation",
    ]) assert.ok(tags.has(md), md);
  });

  for (const m of ELEMENTS) {
    it(`${m.md} → ${m.to ?? "(none)"} uses only real lit-material API`, () => {
      if (!m.to) {
        assert.equal(m.package, null);
        assert.ok(m.why, `${m.md}: say why there's no equivalent`);
        return;
      }
      const facts = LIT_ELEMENTS[m.to];
      assert.ok(facts, `${m.to} isn't a lit-material element`);
      assert.equal(facts.package, m.package, `${m.to} is registered by ${facts.package}`);
      const targets = [m.to, ...(m.alternate ? [m.alternate.to] : [])];
      for (const tag of targets) {
        assert.equal(LIT_ELEMENTS[tag]?.package, m.package, `${tag} is registered by ${m.package}`);
        for (const [k, v] of Object.entries(m.set ?? {})) assertAttribute(tag, k, v, `${m.md} set`);
        for (const [k, v] of Object.entries(m.defaults ?? {})) assertAttribute(tag, k, v, `${m.md} defaults`);
      }
      for (const [name, rule] of Object.entries(m.attributes ?? {})) {
        const where = `${m.md} ${name}`;
        if (rule.kind === "rename") {
          // On the alternate element (lit-material-textarea) a missing attribute is reported by the codemod.
          if (rule.values) for (const v of Object.values(rule.values)) assertAttribute(m.to, rule.to, v, where);
          else assert.ok(rule.to in facts.attributes, `${where}: <${m.to}> has no attribute "${rule.to}"`);
        } else if (rule.kind === "expand") for (const k of rule.to) assertAttribute(m.to, k, true, where);
        else if (rule.kind === "byValue") for (const k of Object.values(rule.cases)) if (k) assertAttribute(m.to, k, true, where);
        else if (rule.kind === "content") {
          assert.ok(facts.slots.includes(""), `${where}: <${m.to}> has no default slot for the text`);
          if (rule.alsoSet) assertAttribute(m.to, rule.alsoSet, true, where);
        } else if (rule.kind === "remove" || rule.kind === "warn") {
          assert.ok(!(name in facts.attributes), `${where}: <${m.to}> has "${name}" after all; map it instead`);
        }
      }
      for (const [name, rule] of Object.entries(m.events ?? {})) {
        if (rule.kind === "rename") assert.ok(facts.events.includes(rule.to), `${m.md} event ${name}: <${m.to}> doesn't fire "${rule.to}"`);
      }
      for (const [name, rule] of Object.entries(m.childSlots ?? {})) {
        if (rule === null) assert.ok(facts.slots.includes(""), `${m.md} slot ${name}: <${m.to}> has no default slot`);
        else if (typeof rule === "string") assert.ok(facts.slots.includes(rule), `${m.md} slot ${name}: <${m.to}> has no slot "${rule}"`);
        else assert.ok(!facts.slots.includes(name), `${m.md} slot ${name}: <${m.to}> has that slot after all`);
      }
      if (m.iconSlot) assert.ok(facts.slots.includes(m.iconSlot), `${m.md}: <${m.to}> has no slot "${m.iconSlot}"`);
    });
  }

  it("points component tokens at real lit-material elements", () => {
    for (const [prefix, tag] of Object.entries(TOKEN_PREFIXES)) if (tag) assert.ok(LIT_ELEMENTS[tag], `--md-${prefix}-*: ${tag}`);
  });

  it("src/generated.ts matches the components' custom-elements.json", { skip: !existsSync(join(here, "..", "..", "button", "custom-elements.json")) && "no custom-elements.json: run pnpm analyze" }, async () => {
    // @ts-expect-error: a plain .mjs script without types
    const { generate } = await import("../scripts/generate.mjs");
    assert.equal(readFileSync(join(here, "generated.ts"), "utf8"), generate(), "run node scripts/generate.mjs");
  });
});
