/** A form's values as {@link parseFormValues} builds them. */
export type FormValues = Record<string, unknown>;

// Names that would reach Object.prototype instead of the values object.
const UNSAFE = new Set(["__proto__", "constructor", "prototype"]);

/** Splits a field name into path segments: `items[0].name` and `items.0.name` both → `["items", "0", "name"]`. */
export function toPath(name: string): string[] {
  return name.replace(/\[([^\]]*)\]/g, ".$1").split(".").filter(Boolean);
}

/** The canonical (dotted) form of a field name: `items[0].name` → `items.0.name`. */
export function normalizeName(name: string): string {
  return toPath(name).join(".");
}

/** Reads the value at a dotted field name, or `undefined` if any segment is missing. */
export function getPath(values: unknown, name: string): unknown {
  let node = values;
  for (const key of toPath(name)) {
    if (node == null || typeof node !== "object" || !Object.hasOwn(node, key)) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/**
 * Builds a values object from `FormData` (or any `[name, value]` entries):
 * dotted/bracketed names nest (`address.city`, `items.0.name`, `items[0].name`),
 * integer segments create arrays, and repeated names collect into an array.
 * Values stay exactly as `FormData` gives them (strings and `File`s; a checked
 * checkbox is `"on"` unless it has a `value`, an unchecked one is absent).
 */
export function parseFormValues(data: Iterable<[string, FormDataEntryValue]>): FormValues {
  const root: FormValues = {};
  for (const [name, value] of data) {
    const path = toPath(name);
    if (!path.length || path.some((key) => UNSAFE.has(key))) continue;
    let node: Record<string, unknown> = root;
    path.forEach((key, i) => {
      const next = path[i + 1];
      if (next === undefined) {
        const prev = node[key];
        node[key] = !Object.hasOwn(node, key) ? value : Array.isArray(prev) ? [...prev, value] : [prev, value];
      } else {
        if (!Object.hasOwn(node, key) || node[key] == null || typeof node[key] !== "object") {
          node[key] = /^\d+$/.test(next) ? [] : {};
        }
        node = node[key] as Record<string, unknown>;
      }
    });
  }
  return root;
}
