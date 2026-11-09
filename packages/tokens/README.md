# @lit-material/tokens

Material Design 3 design tokens (color, shape, type scale, elevation, state-layer
opacity, motion) as plain CSS custom properties, for
[lit-material](https://github.com/bohdaq/lit-material) components.

## Install

```sh
npm install @lit-material/tokens
```

## Usage

Link the stylesheet once at the document root — CSS custom properties inherit through
shadow DOM boundaries, so every `lit-material` component picks it up automatically:

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
```

Dark mode follows `prefers-color-scheme` automatically (via CSS `light-dark()`). To force
a scheme regardless of OS preference, set `color-scheme="light"` or `color-scheme="dark"`
on `<html>` or any ancestor element.

## Density

Every control reads its height from `--md-sys-density-*` tokens (`css/density.css`). Put
`density="compact"` on `<html>` or any container for dense tools: buttons and icon buttons 32 px,
tabs and list rows 36 px, tree rows 28 px, text fields and selects 40 px. Override a single token
to tune one control.

```html
<html density="compact">
```

## Graphite (opt-in dark palette)

A near-black palette with one violet accent for developer tools. Import it after `index.css`; the
light scheme stays the baseline's. It also applies under any element with `theme="graphite"`.

```css
@import "@lit-material/tokens/css/index.css";
@import "@lit-material/tokens/css/presets/graphite.css";
```

## Typography (opt-in)

`css/typography.css` styles plain HTML on the M3 type scale. It's not part of `index.css`.

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/typography.css" />

<h2 class="md-typescale-title-large">A level-2 heading at title size</h2>
<article class="lit-material-content">…Markdown output…</article>
```

- `.md-typescale-<role>-<size>`: one M3 text style (`display`, `headline`, `title`, `body`,
  `label` × `large`, `medium`, `small`), so a heading's level and its size are separate.
- `.lit-material-content`: headings, paragraphs, lists, definition lists, quotes, code, rules and
  links inside it get M3 styles and spacing.

Values come from the `--md-sys-typescale-*` tokens, with M3's baseline for roles the tokens don't
define. Classes don't reach into a shadow root: in a Lit component, add the sheet to its styles
(`import typography from "@lit-material/tokens/css/typography.css?inline"` with Vite, then
`unsafeCSS(typography)`).

## Figma

`figma/tokens.light.json` and `figma/tokens.dark.json` hold the same tokens as the CSS, in the
[W3C Design Tokens Community Group](https://www.designtokens.org/) (DTCG) format: nested groups
(`md.sys.color.primary` for `--md-sys-color-primary`) of `$type` / `$value` tokens. They're generated
from `src/css` by `node tools/figma-tokens.mjs` (CI fails when they're stale), and published with the
package (`@lit-material/tokens/figma/tokens.light.json`), or download them from the repository.

**One file per mode.** The colors written `light-dark(light, dark)` in CSS are split: the light value
goes in `tokens.light.json`, the dark one in `tokens.dark.json`. Every other token is identical in both.
This is the shape both importers want: Figma's Variables import creates one mode per file it's given
(and only for tokens present, with the same type, in every file), and Tokens Studio treats each file as
a token set you can switch between with a theme. A single file with per-mode `$extensions` would need
a plugin-specific convention neither reads.

### Figma Variables (native import)

1. In a Figma Design file, open the **Local variables** panel and choose **Import**.
2. Select both files. Figma creates a collection with a **light** and a **dark** mode (rename them if
   the names come from the files), one variable per token, grouped `md/sys/color/…`, `md/sys/shape/…`.
3. To update later, right-click a mode and choose **Import mode** with the matching file.

Variables hold colors, numbers, strings and lengths. The composite tokens (shadows, easing curves,
typography styles) have no variable type, so Figma's importer leaves them out: use Tokens Studio for
those, or build the effect and text styles from the variables by hand.

### Tokens Studio for Figma

1. Open the plugin, choose a sync provider (**Local document**, or a Git provider pointed at this
   package's `figma/` folder) and set the token format to **W3C DTCG** in the settings.
2. Create two sets, `light` and `dark`, and paste or load each file into its set.
3. Under **Themes**, make a `Light` theme with the `light` set enabled and a `Dark` theme with `dark`.
4. **Export to Figma** → **Variables** (both themes become modes of one collection) and **Styles**:
   elevation levels become effect styles and each `md.sys.typescale.<role>.style` a text style.
   (Themes are a Tokens Studio Pro feature; on the free plan, apply one set at a time.)

### What's included

| Group | `$type` | Notes |
| --- | --- | --- |
| `md.sys.color.*` | `color` | M3 baseline scheme, hex (`#rrggbb`). |
| `md.sys.shape.corner.*` | `dimension` | px. |
| `md.sys.typescale.<role>.*` | `fontFamily`, `fontWeight`, `dimension` | `font`, `weight`, `size`, `line-height`, `tracking`. rem values are converted to px at 16px; the CSS value is kept in `$extensions["dev.lit-material"].css`, as is the full font stack (`$value` is its first family). |
| `md.sys.typescale.<role>.style` | `typography` | Aliases to the five tokens above; no CSS property of its own. |
| `md.sys.elevation.level0`–`5` | `shadow` | Layers with `#rrggbbaa` colors; `level0` (`none`) is an empty list. |
| `md.sys.state.*` | `number` | State-layer and disabled opacities. |
| `md.sys.motion.easing.*`, `.duration.*` | `cubicBezier`, `duration` | |

A token whose CSS value is `var(--md-sys-…)` becomes a DTCG alias (`{md.sys.…}`). Only the tokens the
CSS declares are exported: the type scale is the subset the components use (the other roles exist only as
fallbacks in `typography.css`). These are tokens only: there are no component symbols or a Figma kit yet.

## License

MIT
