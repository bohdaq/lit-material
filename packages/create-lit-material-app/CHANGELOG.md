# create-lit-material-app

## 1.6.0

## 1.5.0

## 1.4.0

## 1.3.0

## 1.2.1

## 1.2.0

### Minor Changes

- 1fb7794: `create-lit-material-app --template console`: a SaaS console starter with an organization switcher, adaptive navigation, sign-in, members, settings tabs and a getting-started checklist. New `lit-material-checklist` in `@lit-material/stepper`. A stretched `lit-material-button` is now clickable across its whole area, and `lit-material-tabs` finds its panels at the top level of a shadow root.

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.1.0

### Minor Changes

- ffc9b11: Two templates: `spa` (the default, as before) and `ssr`, a server-rendered app on `@lit-material/vite` with route loaders, a redirect, a 404, prerendered pages and a Node server (`--template ssr`, `--help` lists them). Scaffolded apps now depend on the `@lit-material/*` versions released with the CLI (the template pinned `^0.0.x` ranges that never matched current releases), and get their `.gitignore` (npm drops a file of that name from the published package, so the template carries it as `gitignore`).

## 0.0.2

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
