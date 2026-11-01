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

## License

MIT
