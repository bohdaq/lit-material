# @lit-material/sign-in

A sign-in screen: email and password, a code sent by mail, creating an account and resetting a forgotten password, with room for "Continue with Google" style buttons. It only collects input; your handler calls the server. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/sign-in @lit-material/tokens
```

## Usage

```html
<lit-material-sign-in methods="password code sign-up forgot">
  <lit-material-button slot="providers" variant="outlined">Continue with Google</lit-material-button>
  <small slot="footer">By signing in you accept the terms.</small>
</lit-material-sign-in>

<script type="module">
  import "@lit-material/sign-in";
  const signIn = document.querySelector("lit-material-sign-in");

  signIn.addEventListener("lit-material-sign-in", async ({ detail }) => {
    signIn.busy = true;
    signIn.error = "";
    try {
      const needsCode = detail.mode !== "sign-in" || detail.method === "code";
      if (needsCode && !detail.code) {
        await api.mailCode(detail); // first step: the address
        signIn.awaitingCode = true; // now ask for the code
      } else {
        await api.finish(detail);
      }
    } catch (error) {
      signIn.error = error.message;
    } finally {
      signIn.busy = false;
    }
  });
</script>
```

## Views

| `mode` | First submit | After `awaiting-code` |
| --- | --- | --- |
| `sign-in`, `method="password"` | `{ email, password }` | — |
| `sign-in`, `method="code"` | `{ email }` | `{ email, code }` |
| `sign-up` | `{ email, password }` | `{ email, code }` |
| `forgot` | `{ email }` | `{ email, code, password }` (the new one) |

Every `detail` also carries `mode` and `method`. `methods` lists what your server offers (`password`, `code`, `sign-up`, `forgot`): only those get a link. The element switches views itself and fires `lit-material-sign-in-view-change`; set `mode`/`method` to open another view yourself, e.g. after a reset. A code pasted or suggested by the phone submits at once.

Fields use `autocomplete="username"`, `current-password` and `new-password`, so password managers fill and save them, and the code field asks for `one-time-code`.

## API

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `mode` | `mode` | `"sign-in" \| "sign-up" \| "forgot"` | `"sign-in"` |
| `method` | `method` | `"password" \| "code"` | `"password"` |
| `methods` | `methods` | `string` | `"password"` |
| `email` | `email` | `string` | `""` |
| `awaitingCode` | `awaiting-code` | `boolean` | `false` |
| `busy` | `busy` | `boolean` | `false` |
| `error` | `error` | `string` | `""` |
| `notice` | `notice` | `string` | `""` |
| `heading` | `heading` | `string` | per view |
| `codeLength` | `code-length` | `number` | `6` |
| `passwordMinlength` | `password-minlength` | `number` | `8` |

Slots: `logo`, `providers` (shown with an "or" divider on the sign-in view), `footer`. Events: `lit-material-sign-in` (`SignInDetail`), `lit-material-sign-in-view-change` (`{ mode, method }`). CSS: `--lit-material-sign-in-width` (default `400px`), parts `card`, `form`.

## License

MIT
