# Versioning and support policy

This policy covers every package published from this repository: all `@lit-material/*` packages and
`create-lit-material-app`.

## One version for everything

All packages are released with the **same version number** (Changesets
[`fixed`](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md)). When any package changes,
every package is published at the new version. So:

- Install any set of lit-material packages **at the same version** and they work together. There's no
  compatibility matrix.
- A version number tells you nothing about which package changed. Read the changelogs: each package's
  `CHANGELOG.md` lists its own changes, and a package with none says it only took its dependencies' bump.
- Pin or range them together, e.g. `"@lit-material/button": "^1.2.0"` and `"@lit-material/dialog": "^1.2.0"`.

## Semantic versioning

Versions follow [Semantic Versioning 2.0](https://semver.org/).

| Release | May contain |
| --- | --- |
| **Patch** `1.0.x` | Bug fixes, accessibility fixes, translation fixes, performance work, docs. No API change. |
| **Minor** `1.x.0` | New components, properties, events, slots, CSS parts or custom properties, and messages. Deprecations. |
| **Major** `x.0.0` | Removals and other breaking changes, each listed under "Major Changes" with a migration note. |

**The public API** of a package is:

- what its `exports` map exposes, and the TypeScript types for it;
- each element's tag name, and the properties, attributes, events, slots, CSS parts and CSS custom
  properties in its `custom-elements.json` and README;
- the `--md-sys-*` token names;
- the message keys in `@lit-material/translations`;
- each element's keyboard behaviour and ARIA roles.

These are **not** public API and may change in any release:

- internal shadow DOM structure, class names and anything not exposed as a part;
- the exact rendered pixels, within Material Design 3;
- the wording of English default messages;
- anything named with a leading underscore, or documented as experimental.

An accessibility fix that changes ARIA or keyboard behaviour to meet WAI-ARIA or WCAG ships in a patch, and is
called out in the changelog.

## Deprecations

1. An API is deprecated in a **minor** release, never removed in one. The deprecation is marked
   `@deprecated` in the types and in `custom-elements.json`, listed in the changelog, and, where it can be
   detected at runtime, logged once with `console.warn`.
2. It keeps working for at least **6 months**, and until the next major.
3. It's removed in a **major** release, with a migration note. Where it can be automated, the change is
   added to [`@lit-material/codemod`](packages/codemod).

## Support windows

| Line | Gets |
| --- | --- |
| **Current major** | Every fix and feature. |
| **Previous major** | Security fixes and critical bug fixes for **12 months** after the next major is released. |
| Older majors | Nothing. Upgrade. |

There is no paid long-term-support line at present.

## Platforms

- **Browsers:** the latest two versions of Chrome, Edge, Firefox and Safari (desktop and mobile). CI runs every
  component's tests in Chromium, Firefox and WebKit.
- **Node** (server rendering, `@lit-material/vite`, the CLI tools): the active and maintenance LTS
  releases. Today that means Node 22.13 or later.
- **Lit:** the `lit` major in each package's `dependencies` (Lit 3 today). Moving to a new Lit major is a
  lit-material major.

Dropping a browser or Node version that has gone out of the range above is not a breaking change.
It's announced in the changelog of the minor that drops it.

## Security

Report vulnerabilities privately; see [SECURITY.md](SECURITY.md).
