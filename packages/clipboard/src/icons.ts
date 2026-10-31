import { html, svg } from "lit";

// Material icons content_copy, check, visibility, visibility_off (Apache 2.0).
const icon = (d: string) => html`<svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${d}></path>`}</svg>`;

export const copyIcon = icon(
  "M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z",
);
export const checkIcon = icon("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
export const showIcon = icon(
  "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
);
export const hideIcon = icon(
  "M12 7a5 5 0 0 1 4.64 6.83l2.92 2.92A11.82 11.82 0 0 0 23 12c-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16A4.85 4.85 0 0 1 12 7zM2 4.27l2.74 2.74A11.8 11.8 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55A3 3 0 0 0 12.65 14.92l1.55 1.55A5 5 0 0 1 7.53 9.8zm4.31-.78 3.15 3.15.02-.16a3 3 0 0 0-3-3l-.17.01z",
);
