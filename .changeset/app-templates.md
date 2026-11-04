---
"create-lit-material-app": minor
---

Two templates: `spa` (the default, as before) and `ssr`, a server-rendered app on `@lit-material/vite` with route loaders, a redirect, a 404, prerendered pages and a Node server (`--template ssr`, `--help` lists them). Scaffolded apps now depend on the `@lit-material/*` versions released with the CLI (the template pinned `^0.0.x` ranges that never matched current releases), and get their `.gitignore` (npm drops a file of that name from the published package, so the template carries it as `gitignore`).
