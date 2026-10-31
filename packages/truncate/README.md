# @lit-material/truncate

One line of text that ends in an ellipsis when it doesn't fit, or keeps its end with `position="middle"` so long IDs, hashes, paths and URLs stay recognisable at both ends. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/truncate @lit-material/tokens
```

## Usage

```html
<lit-material-truncate value="Production database (eu-central, primary)"></lit-material-truncate>
<lit-material-truncate position="middle" value="sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"></lit-material-truncate>
```

It fills the width its container gives it (in a flex row, give the container `min-width: 0`).

## API

| Property     | Attribute     | Type                 | Default |
| ------------ | ------------- | -------------------- | ------- |
| `value`      | `value`       | `string`             | `""`    |
| `position`   | `position`    | `"end" \| "middle"`  | `"end"` |
| `tailLength` | `tail-length` | `number`             | `8`     |
| `truncated`  | `truncated` (reflected, read it) | `boolean` | `false` |

Parts: `start`, `tail`.

## Behavior

- Only the display is shortened: the full text stays in the DOM, so screen readers read it,
  find-in-page finds it and copying copies all of it.
- While the text is cut, the host has `truncated` and a `title` with the full text for pointer
  hover. A `title` you set yourself is left alone.
- CSS has no middle ellipsis, so `middle` splits the text: the start shrinks with an ellipsis, the
  last `tail-length` characters always show.

## License

MIT
