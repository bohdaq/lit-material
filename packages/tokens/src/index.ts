/**
 * `@lit-material/tokens` ships its tokens as plain CSS custom properties
 * (see `./css/index.css`), meant to be linked once at the document root.
 * This module exists for tooling that wants typed references to token names
 * rather than importing the CSS directly.
 */

export const colorTokens = [
  "--md-sys-color-primary",
  "--md-sys-color-on-primary",
  "--md-sys-color-primary-container",
  "--md-sys-color-on-primary-container",
  "--md-sys-color-secondary",
  "--md-sys-color-on-secondary",
  "--md-sys-color-secondary-container",
  "--md-sys-color-on-secondary-container",
  "--md-sys-color-tertiary",
  "--md-sys-color-on-tertiary",
  "--md-sys-color-tertiary-container",
  "--md-sys-color-on-tertiary-container",
  "--md-sys-color-error",
  "--md-sys-color-on-error",
  "--md-sys-color-error-container",
  "--md-sys-color-on-error-container",
  "--md-sys-color-background",
  "--md-sys-color-on-background",
  "--md-sys-color-surface",
  "--md-sys-color-on-surface",
  "--md-sys-color-surface-variant",
  "--md-sys-color-on-surface-variant",
  "--md-sys-color-surface-container-lowest",
  "--md-sys-color-surface-container-low",
  "--md-sys-color-surface-container",
  "--md-sys-color-surface-container-high",
  "--md-sys-color-surface-container-highest",
  "--md-sys-color-outline",
  "--md-sys-color-outline-variant",
  "--md-sys-color-shadow",
  "--md-sys-color-scrim",
  "--md-sys-color-inverse-surface",
  "--md-sys-color-inverse-on-surface",
  "--md-sys-color-inverse-primary",
] as const;

export const shapeTokens = [
  "--md-sys-shape-corner-none",
  "--md-sys-shape-corner-extra-small",
  "--md-sys-shape-corner-small",
  "--md-sys-shape-corner-medium",
  "--md-sys-shape-corner-large",
  "--md-sys-shape-corner-extra-large",
  "--md-sys-shape-corner-full",
] as const;

export const stateTokens = [
  "--md-sys-state-hover-state-layer-opacity",
  "--md-sys-state-focus-state-layer-opacity",
  "--md-sys-state-pressed-state-layer-opacity",
  "--md-sys-state-dragged-state-layer-opacity",
  "--md-sys-state-disabled-container-opacity",
  "--md-sys-state-disabled-content-opacity",
] as const;

/** Control sizes (`src/css/density.css`); `density="compact"` on an ancestor shrinks them. */
export const densityTokens = [
  "--md-sys-density-button-height",
  "--md-sys-density-icon-button-size",
  "--md-sys-density-icon-button-padding",
  "--md-sys-density-field-height",
  "--md-sys-density-field-label-top",
  "--md-sys-density-field-value-inset",
  "--md-sys-density-tab-height",
  "--md-sys-density-tab-padding",
  "--md-sys-density-list-item-min-height",
  "--md-sys-density-list-item-padding-block",
  "--md-sys-density-tree-item-min-height",
] as const;

export type DensityToken = (typeof densityTokens)[number];
export type ColorToken = (typeof colorTokens)[number];
export type ShapeToken = (typeof shapeTokens)[number];
export type StateToken = (typeof stateTokens)[number];
