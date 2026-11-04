# Roadmap

What's planned, roughly in order. Nothing here is a promise of a date. Big items get an [RFC](rfcs/README.md)
before work starts. The detailed working list is [TODO.md](TODO.md).

## Now: 1.0

- **One version for every package, and 1.0.** Semver, deprecation and support windows are in
  [VERSIONING.md](VERSIONING.md).
- **Governance.** [SECURITY.md](SECURITY.md), [CONTRIBUTING.md](CONTRIBUTING.md), the
  [code of conduct](CODE_OF_CONDUCT.md), this roadmap and the [RFC process](rfcs/README.md).

## Next

- **A second maintainer** ([MAINTAINERS.md](MAINTAINERS.md)).
- **Accessibility conformance report:** a WCAG 2.2 AA report in VPAT format for each component. It will be
  backed by manual NVDA, JAWS and VoiceOver passes on top of the automated axe checks.
- **Design hand-off:** a Figma kit matching the components and tokens, starting with the design tokens as
  Figma variables.
- **Translations reviewed by native speakers** (ar, de, es, fr, ja, pl, uk).

## Later

- Case studies of production apps built with lit-material.
- A support offering for teams that need response-time commitments.
- Widgets left out of their first versions (each package README's "Scope" section lists them):
  - data grid: virtualization, filtering, multi-sort;
  - calendar: time zones, recurrence;
  - rich-text editor: images, tables, collaborative editing.

## Done recently

- Router v2 (guards, redirects, lazy routes, loaders, server matching), `@lit-material/vite` server
  rendering, and app templates.
- React, Vue and Angular typings and wrappers generated from `custom-elements.json`.
- i18n: message catalogs in 8 languages, plurals, right-to-left everywhere.
- Strict CSP and Trusted Types in CI, and an SBOM for every package.
- Data grid, calendar and rich-text editor.
- `@lit-material/testing` and `@lit-material/devtools`.
- Migration guides and a codemod from `@material/web` and Angular Material.
