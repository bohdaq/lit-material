# Contributing to lit-material

Thanks for helping. This guide covers how to set up, what CI checks, and how changes get decided.

- **Bugs:** open an [issue](https://github.com/bohdaq/lit-material/issues) with the package, version, browser
  and the smallest reproduction you can make.
- **Security problems:** don't open an issue. Follow [SECURITY.md](SECURITY.md).
- **Small changes** (a bug fix, a missing property, docs): open a pull request directly.
- **Big changes** (a new package, a breaking change, a new cross-cutting convention): write an
  [RFC](rfcs/README.md) first.

Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).

## Set up

You need Node 22.13+ and pnpm (`corepack enable`).

```sh
pnpm install
pnpm build
pnpm test        # every package: browser tests (web-test-runner) and SSR tests (node:test)
```

Work in one package with `pnpm --filter @lit-material/<name> test`. The browser tests need Playwright's
browsers (`npx playwright install chromium firefox webkit` once). CI runs Chromium, Firefox and WebKit.

## What CI checks

Run these before you push; CI runs all of them:

| Command | Checks |
| --- | --- |
| `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` | The usual. |
| `node tools/size-check.mjs` | Each package's gzipped size against `tools/size-limits.json`. Raise a limit on purpose and say why in the commit. |
| `pnpm analyze && node tools/framework-bindings.mjs --check` | `custom-elements.json` and the generated React/Vue/JSX bindings are current. |
| `node packages/codemod/scripts/generate.mjs` | Regenerate the codemod's snapshot when a component's API changes (its test fails otherwise). |
| `node tools/messages.mjs --check` | `packages/translations/src/en.ts` matches the `localize.term()` calls. |
| `node tools/csp-check.mjs` | Every element renders under a strict CSP with Trusted Types enforced. |
| `node tools/hydration-check.mjs` | Every element server-renders and hydrates without a mismatch. |

## Conventions

Every component follows these; review checks them.

- **Text** the component renders or announces goes through `this.localize.term("<pkg>.<key>", "English", args?)`.
  After adding messages, run `node tools/messages.mjs` and add the keys to every catalog in
  `packages/translations/src`, with every plural form the language has.
- **Right-to-left:** logical CSS only. Horizontal arrow keys flip under `isRtl(this)`, and directional icons
  mirror.
- **CSP:** no `style=` attribute bindings and no `styleMap`. Set runtime styles with `cssProps` from
  `@lit-material/core/css-props.js`. No `innerHTML`.
- **SSR:** no DOM access in the constructor or `render()` on the server. Elements hydrate to the same markup.
- **Accessibility:** the right WAI-ARIA pattern, full keyboard support, a name on every control, and a live
  region where state changes silently.
- **Tests:** keyboard, RTL, a test translation, and SSR output.
- **Docs:** the package README (usage, keyboard, API table, scope and limits).

## Changesets

Every pull request that changes a published package needs a changeset: `pnpm changeset`, pick the packages,
pick patch/minor/major per [VERSIONING.md](VERSIONING.md), and write one or two sentences for the changelog.
All packages share one version, so the bump you pick for one package is the bump everyone gets.

## Pull requests

- Keep each pull request to one change. Say what it does and how you checked it.
- CI must be green. Don't skip or disable a test to get there.
- A maintainer reviews it. Expect a first response within a week.

## Decisions

Most decisions are made in the pull request or RFC by **lazy consensus**: if no maintainer objects within a
week of a change being ready, it goes ahead. When maintainers disagree, the lead maintainer
([MAINTAINERS.md](MAINTAINERS.md)) decides and writes down why.

## License

By contributing, you agree that your contribution is licensed under the [MIT license](LICENSE).
