# @lit-material/tokens

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

### Patch Changes

- 8646c7b: Figma hand-off: `figma/tokens.light.json` and `figma/tokens.dark.json` (also exported as `@lit-material/tokens/figma/*`) hold every `--md-sys-*` token in W3C Design Tokens (DTCG) format, one file per color mode, for Figma's Variables import and Tokens Studio. Colors are split from `light-dark()`, rem lengths converted to px, and each type scale role also gets a `typography` style token. See the README's Figma section.

## 0.1.0

### Minor Changes

- 4d0b41a: Opt-in `css/typography.css`: `.md-typescale-<role>-<size>` classes for every M3 text style, and `.lit-material-content` for styling plain HTML prose.

## 0.0.2

### Patch Changes

- 998f020: Republished from CI with npm provenance; no code changes.
