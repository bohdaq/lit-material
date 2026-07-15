import { ALL_TOKENS, type ColorScheme } from "./color-scheme.js";

/** Formats a generated scheme as a drop-in `:root{...}` override block, matching
 * `@lit-material/tokens`' exact `--md-sys-color-*` property names. */
export function copyCss(scheme: ColorScheme): string {
  const lines = ALL_TOKENS.map((token) => {
    const { light, dark } = scheme[token];
    return `  --md-sys-color-${token}: light-dark(${light}, ${dark});`;
  });
  return `:root {\n${lines.join("\n")}\n}`;
}
