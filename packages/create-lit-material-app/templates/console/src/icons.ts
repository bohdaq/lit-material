import { svg } from "lit";

// Simple line-art icons; swap in your own set (see @lit-material/icon's registerIcons()).
const icon = (d: string) => svg`<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d=${d} /></svg>`;

export const homeIcon = icon("M3 11 12 4l9 7v9h-6v-6H9v6H3z");
export const peopleIcon = icon(
  "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9v-1c0-3 3-5 7-5s7 2 7 5v1zm14-9a3 3 0 1 0 0-6zm1 3c3 .5 5 2 5 4.5V20h-3v-1c0-1.8-.7-3.3-2-4.5z",
);
export const settingsIcon = icon("M3 6h10v2H3zm14 0h4v2h-4zm-2-2h2v6h-2zM3 16h4v2H3zm8 0h10v2H11zm-2-2h2v6H9z");
export const expandIcon = icon("M12 15.4 6 9.4 7.4 8l4.6 4.6L16.6 8 18 9.4z");
export const removeIcon = icon("M7 21q-.8 0-1.4-.6T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .8-.6 1.4T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2z");
