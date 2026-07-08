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

## License

MIT
