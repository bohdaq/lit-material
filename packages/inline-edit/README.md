# @lit-material/inline-edit

A value you edit where it stands — a name, a label, a description: text with an edit button that swaps in a field with save and cancel. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/inline-edit @lit-material/tokens
```

## Usage

```html
<lit-material-inline-edit id="name" label="Project name" value="web"></lit-material-inline-edit>
<script type="module">
  import "@lit-material/inline-edit";
  const name = document.querySelector("#name");
  name.validator = (v) => (/^[a-z0-9-]+$/.test(v) ? "" : "Lowercase letters, digits and -");
  name.save = async (value) => {
    const res = await fetch("/api/projects/web", { method: "PATCH", body: JSON.stringify({ name: value }) });
    if (!res.ok) return (await res.json()).error; // shown under the field
  };
  name.addEventListener("change", (e) => console.log(e.detail)); // { value, previous }
</script>
```

## API

| Property      | Attribute     | Type                                                 | Default |
| ------------- | ------------- | ---------------------------------------------------- | ------- |
| `value`       | `value`       | `string`                                             | `""`    |
| `label`       | `label`       | `string` (names the field and buttons)               | `""`    |
| `placeholder` | `placeholder` | `string` (shown when empty)                          | `""`    |
| `save`        | —             | `(value) => void \| string \| Promise<void \| string>` | —       |
| `validator`   | —             | `(value) => string`                                  | —       |
| `disabled`    | `disabled` (reflected) | `boolean`                                   | `false` |
| `editing`     | `editing` (reflected) | `boolean`                                    | `false` |
| `busy`        | `busy` (reflected, read it) | `boolean`                              | `false` |

Methods: `edit()`, `commit()` (resolves whether it saved), `cancel()`. Events: `change`
(`detail: { value, previous }`), `cancel`. Part: `value`. `--lit-material-inline-edit-min-width`
sets the field's smallest width (default `12ch`).

## Behavior

- The edit button (or a double-click on the text) opens the field with the text selected. Enter or
  the check button saves; Escape or the close button cancels. Focus returns to the edit button.
- `save` may return a promise: the field is busy until it settles. A returned message or a thrown
  error keeps the field open with that error; otherwise the value updates and `change` fires.
  Without `save` the value is taken at once.
- An unchanged value just closes the field, without calling `save`.

## License

MIT
