# @lit-material/method-tag

An HTTP or API method as a short uppercase label in monospace, coloured by method. Built with
[Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/method-tag @lit-material/tokens
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@lit-material/tokens/css/index.css" />
<script type="module">
  import "@lit-material/method-tag";
</script>

<lit-material-method-tag method="GET"></lit-material-method-tag> /v2/orders
<lit-material-method-tag method="delete" size="medium"></lit-material-method-tag>
<lit-material-method-tag method="WS"></lit-material-method-tag>
```

GET is green, POST amber, PUT blue, PATCH violet, DELETE red; every other method (HEAD, OPTIONS, WS, GQL,
SSE, gRPC…) takes the primary colour. The label is the method itself, so the meaning never rests on colour.
Defaults use `light-dark()` and pass 4.5:1 on the token surfaces.

`methodKind("Patch")` returns the colour family (`"patch"`, or `"other"`).

## API

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `method` | `method` | `string` | `""` |
| `size` | `size` | `"small" \| "medium"` | `"small"` |

CSS custom properties: `--lit-material-method-tag-get`, `-post`, `-put`, `-patch`, `-delete`, `-other`, and
`--lit-material-method-tag-font`. Part: `tag`.
