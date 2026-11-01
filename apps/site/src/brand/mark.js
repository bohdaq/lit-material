// The lit-material mark: four rounded tiles in a grid, one of them in the
// accent colour and nudged out of line, a component dropping into place.
// Colours default to CSS custom properties so an inline mark follows the theme;
// the prerender writes fixed-colour copies for the favicon and <img> use.

const INK = "#16120F";
const ACCENT = "#3B5BDB";

export function mark({ tile = `var(--lm-mark-tile, ${INK})`, accent = `var(--lm-mark-accent, ${ACCENT})`, title = "lit-material" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${title}"><title>${title}</title>`
    + `<rect x="4" y="4" width="26" height="26" rx="7" fill="${tile}"/>`
    + `<rect x="34" y="4" width="26" height="26" rx="7" fill="${tile}"/>`
    + `<rect x="4" y="34" width="26" height="26" rx="7" fill="${tile}"/>`
    + `<rect x="36" y="36" width="24" height="24" rx="6" fill="${accent}" transform="rotate(-8 48 48)"/>`
    + `</svg>`;
}

/** The favicon: the mark on a cream tile so it reads on dark tab bars too. */
export function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#F2EBE3"/>`
    + `<g transform="translate(6 6) scale(0.8125)">${mark({ tile: INK, accent: ACCENT }).replace(/^<svg[^>]*>|<\/svg>$/g, "").replace(/<title>.*?<\/title>/, "")}</g></svg>`;
}
