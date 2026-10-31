# @lit-material/jump-links

An "On this page" list: links to a page's sections that highlight the one being read. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/jump-links @lit-material/tokens
```

## Usage

```html
<lit-material-jump-links for="article"></lit-material-jump-links>
<article id="article">
  <h2 id="install">Install</h2> …
  <h3 id="docker">Docker</h3> …
</article>
```

Or pass the sections yourself (e.g. from a Markdown renderer's TOC):

```js
jumpLinks.links = [{ id: "install", text: "Install", depth: 2 }, { id: "docker", text: "Docker", depth: 3 }];
```

## API

| Property | Attribute | Type                          | Default          |
| -------- | --------- | ----------------------------- | ---------------- |
| `links`  | —         | `{ id, text, depth? }[]`      | `[]`             |
| `htmlFor`| `for`     | `string` (container id)       | `""`             |
| `label`  | `label`   | `string` (heading, nav name)  | `"On this page"` |
| `offset` | `offset`  | `number` (sticky header px)   | `0`              |

`current` holds the id of the section in view. Parts: `nav`, `title`, `link`.

## Behavior

- The links are plain `#id` anchors: they work before and without JavaScript and render on the
  server. Jumping is the browser's; give headings `scroll-margin-top` under a sticky header.
- The current section is the last one whose top has passed `offset` (the last one at the very
  bottom of the page), marked `aria-current="location"`.
- With `for`, it reads the container's `h2[id]`/`h3[id]` (a trailing `#` from heading anchors is
  dropped) and follows changes to them. Deeper levels indent.

## License

MIT
