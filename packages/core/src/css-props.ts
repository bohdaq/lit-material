import { noChange, type AttributePart } from "lit";
import { directive, Directive, PartType, type PartInfo } from "lit/directive.js";

/** Inline styles: camelCase or kebab-case properties, `--custom` properties; `null`/`undefined`/`""` leave one out. */
export type CssProps = Record<string, string | number | null | undefined>;

const cssName = (name: string): string => (name.startsWith("--") ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
const present = (value: unknown): value is string | number => value !== null && value !== undefined && value !== "";

class CssPropsDirective extends Directive {
  private previous = new Set<string>();

  constructor(info: PartInfo) {
    super(info);
    if (info.type !== PartType.ATTRIBUTE || info.name !== "style" || (info.strings?.length ?? 0) > 2) {
      throw new Error("cssProps() must be the whole value of a style attribute: style=${cssProps({...})}");
    }
  }

  /** On the server: the same styles as an attribute string. */
  render(props: CssProps): string {
    return Object.entries(props)
      .filter(([, value]) => present(value))
      .map(([name, value]) => `${cssName(name)}: ${value}`)
      .join("; ");
  }

  /** In the browser: always through `element.style`, never the attribute. */
  override update(part: AttributePart, [props]: [CssProps]): typeof noChange {
    const { style } = part.element as HTMLElement;
    const next = new Set<string>();
    for (const [name, value] of Object.entries(props)) {
      if (!present(value)) continue;
      const property = cssName(name);
      next.add(property);
      style.setProperty(property, String(value));
    }
    for (const property of this.previous) if (!next.has(property)) style.removeProperty(property);
    this.previous = next;
    return noChange;
  }
}

/**
 * Sets inline styles through the CSSOM (`element.style.setProperty`), so they work under a
 * Content-Security-Policy without `'unsafe-inline'` for styles. Lit's own `styleMap` writes a `style`
 * attribute on the first render, which such a policy blocks. On the server it renders the attribute, as
 * server-rendered markup has to.
 *
 * ```ts
 * html`<div style=${cssProps({ width: `${percent}%`, "--indent": "12px" })}></div>`
 * ```
 */
export const cssProps = directive(CssPropsDirective);
