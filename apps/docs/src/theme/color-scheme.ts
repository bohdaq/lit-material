import { argbFromHex, hexFromArgb, Scheme, CorePalette } from "@material/material-color-utilities";

export interface TokenColors {
  light: string;
  dark: string;
}

/**
 * Mirrors the exact 34 `--md-sys-color-*` property names in
 * packages/tokens/src/css/color.css.
 */
export interface ColorScheme {
  primary: TokenColors;
  "on-primary": TokenColors;
  "primary-container": TokenColors;
  "on-primary-container": TokenColors;
  secondary: TokenColors;
  "on-secondary": TokenColors;
  "secondary-container": TokenColors;
  "on-secondary-container": TokenColors;
  tertiary: TokenColors;
  "on-tertiary": TokenColors;
  "tertiary-container": TokenColors;
  "on-tertiary-container": TokenColors;
  error: TokenColors;
  "on-error": TokenColors;
  "error-container": TokenColors;
  "on-error-container": TokenColors;
  background: TokenColors;
  "on-background": TokenColors;
  surface: TokenColors;
  "on-surface": TokenColors;
  "surface-variant": TokenColors;
  "on-surface-variant": TokenColors;
  "surface-container-lowest": TokenColors;
  "surface-container-low": TokenColors;
  "surface-container": TokenColors;
  "surface-container-high": TokenColors;
  "surface-container-highest": TokenColors;
  outline: TokenColors;
  "outline-variant": TokenColors;
  shadow: TokenColors;
  scrim: TokenColors;
  "inverse-surface": TokenColors;
  "inverse-on-surface": TokenColors;
  "inverse-primary": TokenColors;
}

export const ALL_TOKENS: (keyof ColorScheme)[] = [
  "primary",
  "on-primary",
  "primary-container",
  "on-primary-container",
  "secondary",
  "on-secondary",
  "secondary-container",
  "on-secondary-container",
  "tertiary",
  "on-tertiary",
  "tertiary-container",
  "on-tertiary-container",
  "error",
  "on-error",
  "error-container",
  "on-error-container",
  "background",
  "on-background",
  "surface",
  "on-surface",
  "surface-variant",
  "on-surface-variant",
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
  "outline",
  "outline-variant",
  "shadow",
  "scrim",
  "inverse-surface",
  "inverse-on-surface",
  "inverse-primary",
];

/**
 * Generates a full MD3 color scheme from a single seed color, via
 * `@material/material-color-utilities` (Google's own HCT/tonal-palette
 * library — not hand-rolled color math). `Scheme.light`/`Scheme.dark` cover
 * 29 of the 34 tokens directly by name; the 5 `surface-container-*` tiers
 * (added to MD3 after the `Scheme` class, which is deprecated but still
 * functional) are sampled from the neutral tonal palette at the standard M3
 * tone values — best-effort against the published tone-role table, scoped to
 * this preview only, not applied globally.
 */
export function colorSchemeFromSeed(seedHex: string): ColorScheme {
  const seedArgb = argbFromHex(seedHex);
  const light = Scheme.light(seedArgb);
  const dark = Scheme.dark(seedArgb);
  const neutral = CorePalette.of(seedArgb).n1;

  const pair = (lightArgb: number, darkArgb: number): TokenColors => ({
    light: hexFromArgb(lightArgb),
    dark: hexFromArgb(darkArgb),
  });
  const neutralPair = (lightTone: number, darkTone: number): TokenColors =>
    pair(neutral.tone(lightTone), neutral.tone(darkTone));

  return {
    primary: pair(light.primary, dark.primary),
    "on-primary": pair(light.onPrimary, dark.onPrimary),
    "primary-container": pair(light.primaryContainer, dark.primaryContainer),
    "on-primary-container": pair(light.onPrimaryContainer, dark.onPrimaryContainer),
    secondary: pair(light.secondary, dark.secondary),
    "on-secondary": pair(light.onSecondary, dark.onSecondary),
    "secondary-container": pair(light.secondaryContainer, dark.secondaryContainer),
    "on-secondary-container": pair(light.onSecondaryContainer, dark.onSecondaryContainer),
    tertiary: pair(light.tertiary, dark.tertiary),
    "on-tertiary": pair(light.onTertiary, dark.onTertiary),
    "tertiary-container": pair(light.tertiaryContainer, dark.tertiaryContainer),
    "on-tertiary-container": pair(light.onTertiaryContainer, dark.onTertiaryContainer),
    error: pair(light.error, dark.error),
    "on-error": pair(light.onError, dark.onError),
    "error-container": pair(light.errorContainer, dark.errorContainer),
    "on-error-container": pair(light.onErrorContainer, dark.onErrorContainer),
    background: pair(light.background, dark.background),
    "on-background": pair(light.onBackground, dark.onBackground),
    surface: pair(light.surface, dark.surface),
    "on-surface": pair(light.onSurface, dark.onSurface),
    "surface-variant": pair(light.surfaceVariant, dark.surfaceVariant),
    "on-surface-variant": pair(light.onSurfaceVariant, dark.onSurfaceVariant),
    "surface-container-lowest": neutralPair(100, 4),
    "surface-container-low": neutralPair(96, 10),
    "surface-container": neutralPair(94, 12),
    "surface-container-high": neutralPair(92, 17),
    "surface-container-highest": neutralPair(90, 22),
    outline: pair(light.outline, dark.outline),
    "outline-variant": pair(light.outlineVariant, dark.outlineVariant),
    shadow: pair(light.shadow, dark.shadow),
    scrim: pair(light.scrim, dark.scrim),
    "inverse-surface": pair(light.inverseSurface, dark.inverseSurface),
    "inverse-on-surface": pair(light.inverseOnSurface, dark.inverseOnSurface),
    "inverse-primary": pair(light.inversePrimary, dark.inversePrimary),
  };
}
