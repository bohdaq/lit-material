# @lit-material/site-kit

Pieces of a prerendered site that work before any script runs: plain HTML templates (no custom elements, no shadow DOM), one stylesheet, and small scripts that add behaviour. Built with [Lit](https://lit.dev/). Part of [lit-material](https://github.com/bohdaq/lit-material); [lit.rws8.tech](https://lit.rws8.tech/guides/site-kit/) and rws8.tech are built with it.

## Install

```sh
npm install @lit-material/site-kit
```

## Usage

On the server (Lit SSR or a prerender step):

```js
import { faq, steps, terminal, kbd, shortcuts, searchDialog, searchButton, themeToggle, menuToggle, installToggle, installPanel } from "@lit-material/site-kit/templates.js";
import { themeBootScript } from "@lit-material/site-kit/client/theme.js";

const head = `<script>${themeBootScript("my-theme")}</script>`;
html`${faq([{ question: "Is it free?", answer: "Yes, MIT." }], { exclusive: "faq" })}
  ${steps([{ title: "Install", body: "npm install" }, { title: "Run" }])}
  ${terminal([{ cmd: "rws" }, { out: "Listening on :7878", accent: true }], { label: "Running rws starts a server on port 7878." })}
  <p>Press ${kbd("Ctrl", "K")} to search.</p>
  ${searchDialog({ placeholder: "Search the docs" })}`;
```

In the browser:

```js
import "@lit-material/site-kit/css/site-kit.css";
import { initThemeToggle, initMenu, initSearch, initTerminal, initReveal, initInstall } from "@lit-material/site-kit";

initThemeToggle({ key: "my-theme" });
initMenu();
initSearch({ emptyHint: "Try a setting name." });
initTerminal();
initReveal();
initInstall();
```

Each script is also its own entry point (`@lit-material/site-kit/client/menu.js` and so on), with no Lit, so it loads small and early. Importing any module has no side effects: nothing touches the DOM until you call an `init` function.

## Pieces

| Template | Script | Markup contract |
| --- | --- | --- |
| `faq(items, { exclusive })` | none | `<details name>` / `<summary>` |
| `steps(items, { label })` | none | `<ol class="lm-steps">` numbered by CSS counters |
| `terminal(lines, { label, title, prompt, animate })` | `initTerminal({ prompt, pause })` | `[data-terminal]` holds the lines as JSON |
| `kbd(...keys)`, `shortcuts(items)` | none | `<kbd>` inside `<kbd>`; `<dl class="lm-shortcuts">` |
| `searchDialog()`, `searchButton()` | `initSearch({ load, options, emptyHint, limit, delay })` | `dialog.search-dialog` with an `input` and `.search-results`; `[data-search-open]`; `/` and Ctrl/Cmd+K open it |
| `themeToggle({ light, dark })` | `initThemeToggle({ key })`, `themeBootScript(key)` | `[data-theme-toggle]`; sets `data-theme` on `<html>` |
| `menuToggle({ controls })` | `initMenu({ breakpoint })` | `[data-menu-toggle][aria-controls]`; panel gets `.open`, `<html>` gets `.menu-open` |
| none | `initReveal({ selector, rootMargin })` | `.reveal` gets `.in`; hide only under `html.js` |
| `installToggle({ controls, label, icon })`, `installPanel(id, content)` | `initInstall({ os })`, `guessOs()` | `[data-install-toggle][aria-controls]`; panel gets `.open`; `lit-material-tab[data-os="windows\|mac\|linux"]` starts on the visitor's OS |

`initSearch` loads Pagefind from `/pagefind/pagefind.js` on first use. Pass `load` to use another index with the same `search(query) → { results: [{ data() }] }` shape.

## Styling

`css/site-kit.css` keeps every rule in the `lit-material-site-kit` cascade layer, so any unlayered CSS on your site wins. It reads `@lit-material/tokens` colours with fallbacks. Set `--lm-site-accent` for step numbers, the terminal and markers.

## License

MIT
