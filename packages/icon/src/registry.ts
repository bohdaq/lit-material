/**
 * A process-wide registry of SVG icons by name, so an app registers its
 * icon set once and writes `<lit-material-icon name="trash">` everywhere.
 *
 * Icons are SVG source strings, e.g. Vite's `?raw` imports of an icon
 * package's files. They are rendered as markup: register only SVG you ship,
 * never text from users or the network.
 */

const icons = new Map<string, string>();
const changes = new EventTarget();
const warned = new Set<string>();

/** Fired on `iconRegistry` after icons are registered; `<lit-material-icon>` re-renders. */
export const ICONS_CHANGED = "icons-changed";

/** Subscribe to registrations: `iconRegistry.addEventListener(ICONS_CHANGED, …)`. */
export const iconRegistry: Pick<EventTarget, "addEventListener" | "removeEventListener"> = changes;

/**
 * Prepares an SVG for use as an icon: drops a fixed `width`/`height` (the
 * icon element sizes it), fills with `currentColor` unless the root says
 * otherwise (stroke sets such as Lucide set `fill="none"`), and hides it
 * from assistive technology — `<lit-material-icon label>` names the icon.
 */
export function normalizeSvg(source: string): string {
  const svg = source.replace(/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*/, "").trim();
  const open = /^<svg\b[^>]*>/i.exec(svg);
  if (!open) return "";
  let tag = open[0]
    .replace(/\s(width|height|aria-hidden|focusable)\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s*\/?>$/, "");
  if (!/\sfill\s*=/i.test(tag)) tag += ' fill="currentColor"';
  tag += ' aria-hidden="true" focusable="false">';
  return tag + svg.slice(open[0].length);
}

/**
 * Registers icons by name. `prefix` namespaces a set (`{ prefix: "ph" }`
 * makes `trash` available as `ph:trash`). Registering a name again
 * replaces it. Strings that aren't an `<svg>` are skipped with a warning.
 */
export function registerIcons(set: Record<string, string>, options: { prefix?: string } = {}): void {
  for (const [name, source] of Object.entries(set)) {
    const key = options.prefix ? `${options.prefix}:${name}` : name;
    const svg = normalizeSvg(source);
    if (!svg) {
      console.warn(`lit-material-icon: "${key}" is not an <svg>; skipped.`);
      continue;
    }
    icons.set(key, svg);
    warned.delete(key);
  }
  changes.dispatchEvent(new Event(ICONS_CHANGED));
}

/** The normalized SVG registered as `name`, or `undefined`. */
export function getIcon(name: string): string | undefined {
  return icons.get(name);
}

/** Every registered name, e.g. for an icon picker or a test that all names used exist. */
export function iconNames(): string[] {
  return [...icons.keys()];
}

/** Warns once per name that is asked for but not registered. */
export function warnMissing(name: string): void {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(`lit-material-icon: no icon registered as "${name}".`);
}
