// The Figma token export (tools/figma-tokens.mjs): DTCG JSON built from src/css, and the committed files in figma/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error -- a plain .mjs tool, no type declarations
import { buildTokens, generate, parseDeclarations, readTokenCss, tokenPath } from "../../../tools/figma-tokens.mjs";

type Tree = { [key: string]: Tree } & { $type?: string; $value?: unknown; $extensions?: Record<string, unknown> };

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssDir = join(pkg, "src", "css");
const committed = (mode: string): Tree => JSON.parse(readFileSync(join(pkg, "figma", `tokens.${mode}.json`), "utf8"));
const light = committed("light");
const dark = committed("dark");
const at = (tree: Tree, path: string): Tree => path.split(".").reduce((node, key) => node?.[key], tree);

test("the committed JSON is what the CSS generates", () => {
  const files = generate(cssDir);
  assert.equal(readFileSync(join(pkg, "figma", "tokens.light.json"), "utf8"), files.light);
  assert.equal(readFileSync(join(pkg, "figma", "tokens.dark.json"), "utf8"), files.dark);
});

test("light-dark() colors are split between the two files", () => {
  assert.deepEqual(at(light, "md.sys.color.primary"), { $type: "color", $value: "#6750a4" });
  assert.deepEqual(at(dark, "md.sys.color.primary"), { $type: "color", $value: "#d0bcff" });
  assert.equal(at(light, "md.sys.color.on-primary-container").$value, "#21005d");
  assert.equal(at(dark, "md.sys.color.on-primary-container").$value, "#eaddff");
  // A plain color (no light-dark()) is the same in both.
  assert.equal(at(light, "md.sys.color.scrim").$value, "#000000");
  assert.equal(at(dark, "md.sys.color.scrim").$value, "#000000");
});

test("everything but color is identical in both files", () => {
  const { color: _l, ...lightRest } = light.md.sys;
  const { color: _d, ...darkRest } = dark.md.sys;
  assert.deepEqual(lightRest, darkRest);
  assert.ok(Object.keys(lightRest).length >= 5);
});

test("var() references become DTCG aliases, in both modes and inside light-dark()", () => {
  const css = parseDeclarations(`:root {
    --md-sys-color-primary: light-dark(#6750a4, #d0bcff);
    --md-sys-color-surface: #fff;
    --md-sys-color-brand: var(--md-sys-color-primary);
    --md-sys-color-link: light-dark(var(--md-sys-color-primary), var(--md-sys-color-surface));
    --md-sys-shape-corner-small: 8px;
    --md-sys-shape-corner-button: var(--md-sys-shape-corner-small, 4px);
  }`);
  const l = buildTokens(css, "light");
  const d = buildTokens(css, "dark");
  assert.deepEqual(at(l, "md.sys.color.brand"), { $type: "color", $value: "{md.sys.color.primary}" });
  assert.deepEqual(at(d, "md.sys.color.brand"), { $type: "color", $value: "{md.sys.color.primary}" });
  assert.equal(at(l, "md.sys.color.link").$value, "{md.sys.color.primary}");
  assert.equal(at(d, "md.sys.color.link").$value, "{md.sys.color.surface}");
  assert.equal(at(l, "md.sys.color.surface").$value, "#ffffff");
  assert.deepEqual(at(l, "md.sys.shape.corner.button"), { $type: "dimension", $value: "{md.sys.shape.corner.small}" });
  assert.throws(() => buildTokens(parseDeclarations(":root { --md-sys-color-x: var(--md-sys-color-nope); }"), "light"), /isn't declared/);
});

test("a type scale role: typed parts in px, and a typography style aliasing them", () => {
  const role = at(light, "md.sys.typescale.label-large");
  assert.deepEqual(role.font, {
    $type: "fontFamily",
    $value: "Roboto",
    $extensions: { "dev.lit-material": { css: "Roboto, system-ui, sans-serif" } },
  });
  assert.deepEqual(role.weight, { $type: "fontWeight", $value: 500 });
  assert.deepEqual(role.size, { $type: "dimension", $value: "14px", $extensions: { "dev.lit-material": { css: "0.875rem" } } });
  assert.equal(role["line-height"].$value, "20px");
  assert.equal(role.tracking.$value, "0.1px");
  assert.deepEqual(role.style.$value, {
    fontFamily: "{md.sys.typescale.label-large.font}",
    fontSize: "{md.sys.typescale.label-large.size}",
    fontWeight: "{md.sys.typescale.label-large.weight}",
    lineHeight: "{md.sys.typescale.label-large.line-height}",
    letterSpacing: "{md.sys.typescale.label-large.tracking}",
  });
  assert.equal(role.style.$type, "typography");
});

test("shape, state, motion and elevation get their DTCG types", () => {
  assert.deepEqual(at(light, "md.sys.shape.corner.medium"), { $type: "dimension", $value: "12px" });
  assert.deepEqual(at(light, "md.sys.state.hover-state-layer-opacity"), { $type: "number", $value: 0.08 });
  assert.deepEqual(at(light, "md.sys.motion.easing.standard"), { $type: "cubicBezier", $value: [0.2, 0, 0, 1] });
  assert.deepEqual(at(light, "md.sys.motion.duration.short2"), { $type: "duration", $value: "100ms" });
  assert.deepEqual(at(light, "md.sys.elevation.level0"), { $type: "shadow", $value: [] });
  assert.deepEqual(at(light, "md.sys.elevation.level1").$value, [
    { color: "#0000004d", offsetX: "0px", offsetY: "1px", blur: "2px", spread: "0px" },
    { color: "#00000026", offsetX: "0px", offsetY: "1px", blur: "3px", spread: "1px" },
  ]);
});

test("every --md-sys-* declared in src/css is in both files", () => {
  // Found with a separate, plainer scan than the exporter's own parser.
  const declared = new Set<string>();
  for (const file of readdirSync(cssDir).filter((f) => f.endsWith(".css"))) {
    const css = readFileSync(join(cssDir, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, name] of css.matchAll(/(--md-sys-[\w-]+)\s*:/g)) declared.add(name);
  }
  assert.ok(declared.size >= 80, `found only ${declared.size} declarations`);
  assert.deepEqual([...readTokenCss(cssDir).keys()].sort(), [...declared].sort());
  for (const name of declared) {
    const path = (tokenPath(name) as string[]).join(".");
    for (const [mode, tree] of [["light", light], ["dark", dark]] as const) {
      const token = at(tree, path);
      assert.ok(token && "$value" in token && typeof token.$type === "string", `${name} (${path}) missing from tokens.${mode}.json`);
    }
  }
});

test("the token lists in index.ts name tokens the CSS declares", async () => {
  const { colorTokens, shapeTokens, stateTokens, densityTokens } = await import("./index.js");
  const declared = readTokenCss(cssDir);
  for (const name of [...colorTokens, ...shapeTokens, ...stateTokens, ...densityTokens]) assert.ok(declared.has(name), name);
});

test("presets only override tokens the base CSS declares", () => {
  const declared = readTokenCss(cssDir);
  for (const file of readdirSync(join(cssDir, "presets")).filter((f) => f.endsWith(".css"))) {
    const css = readFileSync(join(cssDir, "presets", file), "utf8");
    const names = [...css.matchAll(/(--md-sys-[a-z0-9-]+)\s*:/g)].map((m) => m[1]!);
    assert.ok(names.length > 0, file);
    for (const name of names) assert.ok(declared.has(name), `${file}: ${name}`);
  }
  const compact = readFileSync(join(cssDir, "presets", "density-compact.css"), "utf8");
  assert.match(compact, /--md-sys-density-tree-item-min-height: 28px/);
  const graphite = readFileSync(join(cssDir, "presets", "graphite.css"), "utf8");
  assert.match(graphite, /--md-sys-color-surface: light-dark\(#fffbfe, #0a0a0c\)/);
});
