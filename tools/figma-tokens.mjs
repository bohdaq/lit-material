#!/usr/bin/env node
// The design tokens as W3C Design Tokens Community Group (DTCG) JSON, for Figma: every `--md-sys-*` custom
// property declared in packages/tokens/src/css/*.css, one file per color mode (Figma's Variables importer makes
// one mode per file; Tokens Studio loads each file as a token set). Colors written `light-dark(a, b)` are split
// between the two files; every other token is identical in both.
//   node tools/figma-tokens.mjs          write packages/tokens/figma/tokens.{light,dark}.json
//   node tools/figma-tokens.mjs --check  fail when the committed JSON is out of date
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const cssDir = join(root, "packages", "tokens", "src", "css");
export const outDir = join(root, "packages", "tokens", "figma");
export const modes = ["light", "dark"];
/** Root font size the rem values are converted at: Figma has no rem, its variables are px. */
const REM_PX = 16;
/** Where extra, non-DTCG facts about a token go (the CSS value when $value had to be converted). */
const EXT = "dev.lit-material";

/** `--name: value;` declarations, comments stripped, in source order. Throws on a duplicate. */
export function parseDeclarations(css, file = "css") {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Map();
  for (const [, name, value] of text.matchAll(/(?<=^|[{;\s])(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+?)\s*;/g)) {
    if (out.has(name)) throw new Error(`${file}: ${name} is declared twice`);
    out.set(name, value.replace(/\s+/g, " "));
  }
  return out;
}

/** Every `--md-sys-*` declaration in the tokens package's CSS files, sorted by file name. */
export function readTokenCss(dir = cssDir) {
  const all = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".css")).sort()) {
    for (const [name, value] of parseDeclarations(readFileSync(join(dir, file), "utf8"), file)) {
      if (!name.startsWith("--md-sys-")) continue;
      if (all.has(name)) throw new Error(`${file}: ${name} is also declared in another file`);
      all.set(name, value);
    }
  }
  return all;
}

/** `--md-sys-typescale-label-large-line-height` → ["md", "sys", "typescale", "label-large", "line-height"]. */
export function tokenPath(name) {
  const m = /^--md-sys-([a-z]+)-(.+)$/.exec(name);
  if (!m) throw new Error(`${name}: not an --md-sys-<category>-<name> token`);
  const [, category, rest] = m;
  let tail = [rest];
  if (category === "typescale") {
    const t = /^([a-z]+-[a-z]+)-(font|weight|size|line-height|tracking)$/.exec(rest);
    if (!t) throw new Error(`${name}: expected --md-sys-typescale-<role>-<size>-<property>`);
    tail = [t[1], t[2]];
  } else if (category === "motion") {
    const t = /^(easing|duration)-(.+)$/.exec(rest);
    if (!t) throw new Error(`${name}: expected --md-sys-motion-easing-* or --md-sys-motion-duration-*`);
    tail = [t[1], t[2]];
  } else if (category === "shape") {
    const t = /^corner-(.+)$/.exec(rest);
    if (!t) throw new Error(`${name}: expected --md-sys-shape-corner-*`);
    tail = ["corner", t[1]];
  }
  return ["md", "sys", category, ...tail];
}

/** The DTCG $type a token gets, from its category (and, for type scale, its property). */
export function tokenType(name) {
  const path = tokenPath(name);
  const [, , category] = path;
  const leaf = path.at(-1);
  switch (category) {
    case "color":
      return "color";
    case "shape":
      return "dimension";
    case "elevation":
      return "shadow";
    case "state":
      return "number";
    case "motion":
      return path[3] === "easing" ? "cubicBezier" : "duration";
    case "typescale":
      return { font: "fontFamily", weight: "fontWeight" }[leaf] ?? "dimension";
    default:
      throw new Error(`${name}: no $type mapping for the "${category}" category — add one to tools/figma-tokens.mjs`);
  }
}

/** Splits on commas outside parentheses. */
function splitTop(value) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") depth--;
    else if (value[i] === "," && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts;
}

const round = (n) => Math.round(n * 10000) / 10000;
const hex2 = (n) => Math.round(n).toString(16).padStart(2, "0");

/** #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() → lowercase #rrggbb or #rrggbbaa. */
export function color(value, name) {
  let m = /^#([0-9a-f]{3})$/i.exec(value);
  if (m) return `#${[...m[1]].map((c) => c + c).join("")}`.toLowerCase();
  if (/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) return value.toLowerCase();
  m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (m) {
    const alpha = m[4] === undefined ? 1 : Number(m[4]);
    return `#${hex2(+m[1])}${hex2(+m[2])}${hex2(+m[3])}${alpha === 1 ? "" : hex2(alpha * 255)}`;
  }
  throw new Error(`${name}: "${value}" isn't a color this exporter reads (hex, rgb(), rgba())`);
}

/** 0, 12px, 1.25rem → "12px" (rem at 16px). */
export function dimension(value, name) {
  const m = /^(-?[\d.]+)(px|rem)?$/.exec(value);
  if (!m || (m[2] === undefined && Number(m[1]) !== 0)) throw new Error(`${name}: "${value}" isn't a px or rem length`);
  const n = Number(m[1]) * (m[2] === "rem" ? REM_PX : 1);
  return `${round(n)}px`;
}

function shadow(value, name) {
  if (value === "none") return [];
  return splitTop(value).map((layer) => {
    const m = /^(.*?)\s*(rgba?\([^)]*\)|#[0-9a-f]+)$/i.exec(layer);
    if (!m) throw new Error(`${name}: shadow layer "${layer}" needs lengths followed by a color`);
    const lengths = m[1].split(/\s+/);
    if (lengths.length < 2 || lengths.length > 4 || lengths.includes("inset")) {
      throw new Error(`${name}: shadow layer "${layer}" isn't <x> <y> [blur] [spread] <color>`);
    }
    const [offsetX, offsetY, blur = "0", spread = "0"] = lengths.map((l) => dimension(l, name));
    return { color: color(m[2], name), offsetX, offsetY, blur, spread };
  });
}

/** One token's DTCG $value for one mode. `aliasOf` maps a CSS name to its DTCG `{a.b.c}` reference. */
export function tokenValue(name, css, mode, aliasOf) {
  const ref = /^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,.*)?\)$/.exec(css);
  if (ref) return aliasOf(ref[1], name);
  const type = tokenType(name);
  if (type === "color") {
    const ld = /^light-dark\((.*)\)$/.exec(css);
    if (ld) {
      const parts = splitTop(ld[1]);
      if (parts.length !== 2) throw new Error(`${name}: light-dark() needs exactly two colors`);
      return tokenValue(name, parts[mode === "dark" ? 1 : 0], mode, aliasOf);
    }
    return color(css, name);
  }
  switch (type) {
    case "dimension":
      return dimension(css, name);
    case "number": {
      if (!/^-?[\d.]+$/.test(css)) throw new Error(`${name}: "${css}" isn't a number`);
      return Number(css);
    }
    case "fontWeight": {
      if (!/^\d+$/.test(css)) throw new Error(`${name}: "${css}" isn't a numeric font weight`);
      return Number(css);
    }
    case "fontFamily":
      // Figma has no font stack: the first family is the one a design uses. The full stack is kept in $extensions.
      return splitTop(css)[0].replace(/^["']|["']$/g, "");
    case "duration": {
      const m = /^([\d.]+)(ms|s)$/.exec(css);
      if (!m) throw new Error(`${name}: "${css}" isn't a duration`);
      return `${round(Number(m[1]) * (m[2] === "s" ? 1000 : 1))}ms`;
    }
    case "cubicBezier": {
      const m = /^cubic-bezier\((.*)\)$/.exec(css);
      const points = m ? splitTop(m[1]).map(Number) : [];
      if (points.length !== 4 || points.some(Number.isNaN)) throw new Error(`${name}: "${css}" isn't cubic-bezier(x1, y1, x2, y2)`);
      return points;
    }
    case "shadow":
      return shadow(css, name);
  }
  throw new Error(`${name}: unhandled $type ${type}`);
}

function setPath(tree, path, token) {
  let node = tree;
  for (const key of path.slice(0, -1)) {
    node[key] ??= {};
    if ("$value" in node[key]) throw new Error(`${path.join(".")}: ${key} is both a token and a group`);
    node = node[key];
  }
  const leaf = path.at(-1);
  if (leaf in node) throw new Error(`${path.join(".")}: already defined`);
  node[leaf] = token;
}

/**
 * The DTCG tree for one mode, from a Map of CSS name → CSS value. Type scale roles also get a `style` token
 * (DTCG typography, its fields aliased to the role's five tokens), so Tokens Studio can make text styles.
 */
export function buildTokens(declarations, mode) {
  if (!modes.includes(mode)) throw new Error(`mode must be one of ${modes.join(", ")}`);
  const aliasOf = (target, from) => {
    if (!declarations.has(target)) throw new Error(`${from}: refers to ${target}, which isn't declared`);
    return `{${tokenPath(target).join(".")}}`;
  };
  const tree = {};
  const roles = new Map();
  for (const [name, css] of declarations) {
    const path = tokenPath(name);
    const $type = tokenType(name);
    const $value = tokenValue(name, css, mode, aliasOf);
    const token = { $type, $value };
    // A rem length converted to px, or a font stack cut to its first family: keep what the CSS says.
    const alias = typeof $value === "string" && $value.startsWith("{");
    if (!alias && ["dimension", "duration", "fontFamily"].includes($type) && $value !== css) {
      token.$extensions = { [EXT]: { css } };
    }
    setPath(tree, path, token);
    if (path[2] === "typescale") {
      const role = roles.get(path[3]) ?? {};
      role[path[4]] = `{${path.join(".")}}`;
      roles.set(path[3], role);
    }
  }
  const fields = { font: "fontFamily", size: "fontSize", weight: "fontWeight", "line-height": "lineHeight", tracking: "letterSpacing" };
  for (const [role, parts] of roles) {
    const missing = Object.keys(fields).filter((p) => !parts[p]);
    if (missing.length) throw new Error(`--md-sys-typescale-${role}-*: missing ${missing.join(", ")}`);
    const $value = Object.fromEntries(Object.entries(fields).map(([p, field]) => [field, parts[p]]));
    setPath(tree, ["md", "sys", "typescale", role, "style"], {
      $type: "typography",
      $value,
      $description: `The ${role} text style: the five --md-sys-typescale-${role}-* tokens together (no CSS property of its own).`,
    });
  }
  return tree;
}

/** The JSON text of each mode's file, as committed. */
export function generate(dir = cssDir) {
  const declarations = readTokenCss(dir);
  return Object.fromEntries(modes.map((mode) => [mode, `${JSON.stringify(buildTokens(declarations, mode), null, 2)}\n`]));
}

function main() {
  const check = process.argv.includes("--check");
  const files = generate();
  const stale = [];
  for (const mode of modes) {
    const target = join(outDir, `tokens.${mode}.json`);
    const current = existsSync(target) ? readFileSync(target, "utf8") : "";
    if (current === files[mode]) continue;
    stale.push(`packages/tokens/figma/tokens.${mode}.json`);
    if (!check) {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(target, files[mode]);
    }
  }
  if (check && stale.length) {
    console.error(`${stale.join(" and ")} out of date — run node tools/figma-tokens.mjs and commit.`);
    process.exit(1);
  }
  const count = readTokenCss().size;
  console.log(`${check ? "Checked" : stale.length ? "Wrote" : "Up to date:"} ${modes.length} files, ${count} tokens each.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
