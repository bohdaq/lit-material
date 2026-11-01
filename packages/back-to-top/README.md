# @lit-material/back-to-top

A "Back to top" button for long pages: it appears once the page has scrolled down, and takes the reader back up and moves focus there. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install


```sh
npm install @lit-material/back-to-top @lit-material/tokens
```


## Usage


```html
<main id="main">
  <h1>Release notes</h1>
  …
</main>
<lit-material-back-to-top target="main"></lit-material-back-to-top>
```


## API

| Property    | Attribute   | Type      | Default         |
| ----------- | ----------- | --------- | --------------- |
| `threshold` | `threshold` | `number` (px scrolled before it shows) | `400` |
| `target`    | `target`    | `string` (id of the element at the top) | `""` |
| `label`     | `label`     | `string`  | `"Back to top"` |
| `visible`   | `visible` (reflected, read it) | `boolean` | `false` |

Part: `button`. `--lit-material-back-to-top-inset` (default `16px`) is the distance from the viewport's bottom and end edges.

## Behavior

- Fixed to the viewport's bottom end corner; it fades in past `threshold` and out above it. While hidden it's out of the tab order and hidden from assistive technology.
- With `target`, it's a link to `#target`: a click scrolls there and focuses it (adding `tabindex="-1"` if the element isn't focusable), so keyboard and screen-reader users continue from the top. Without one it scrolls the window to 0. Modified clicks (Ctrl, Cmd, Shift, middle button) behave like a link's.
- Smooth scrolling, except with `prefers-reduced-motion: reduce`.

## License

MIT
