import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { styles } from "./kbd-styles.js";

export type KbdSize = "small" | "medium";
export type KbdPlatform = "auto" | "apple" | "other";

/** One key as shown and as read out. */
export interface KbdKey {
  /** What's drawn: `⌘`, `Ctrl`, `K`, `↵`. */
  glyph: string;
  /** The message key for its spoken name, or null to read the glyph itself (letters, digits). */
  term: string | null;
  /** The English spoken name (the fallback for `term`). */
  name: string;
}

interface KeyInfo {
  apple: string;
  other: string;
  term: string;
  name: string;
  appleTerm?: string;
  appleName?: string;
}

// Aliases are matched case-insensitively.
const KEYS: Record<string, KeyInfo> = {
  mod: { apple: "⌘", other: "Ctrl", term: "kbd.control", name: "Control", appleTerm: "kbd.command", appleName: "Command" },
  cmd: { apple: "⌘", other: "Win", term: "kbd.meta", name: "Windows", appleTerm: "kbd.command", appleName: "Command" },
  meta: { apple: "⌘", other: "Win", term: "kbd.meta", name: "Windows", appleTerm: "kbd.command", appleName: "Command" },
  ctrl: { apple: "⌃", other: "Ctrl", term: "kbd.control", name: "Control" },
  control: { apple: "⌃", other: "Ctrl", term: "kbd.control", name: "Control" },
  alt: { apple: "⌥", other: "Alt", term: "kbd.alt", name: "Alt", appleTerm: "kbd.option", appleName: "Option" },
  option: { apple: "⌥", other: "Alt", term: "kbd.alt", name: "Alt", appleTerm: "kbd.option", appleName: "Option" },
  shift: { apple: "⇧", other: "Shift", term: "kbd.shift", name: "Shift" },
  enter: { apple: "↵", other: "Enter", term: "kbd.enter", name: "Enter" },
  return: { apple: "↵", other: "Enter", term: "kbd.enter", name: "Enter" },
  escape: { apple: "esc", other: "Esc", term: "kbd.escape", name: "Escape" },
  esc: { apple: "esc", other: "Esc", term: "kbd.escape", name: "Escape" },
  tab: { apple: "⇥", other: "Tab", term: "kbd.tab", name: "Tab" },
  backspace: { apple: "⌫", other: "Backspace", term: "kbd.backspace", name: "Backspace" },
  delete: { apple: "⌦", other: "Del", term: "kbd.delete", name: "Delete" },
  space: { apple: "Space", other: "Space", term: "kbd.space", name: "Space" },
  arrowup: { apple: "↑", other: "↑", term: "kbd.up", name: "Up" },
  up: { apple: "↑", other: "↑", term: "kbd.up", name: "Up" },
  arrowdown: { apple: "↓", other: "↓", term: "kbd.down", name: "Down" },
  down: { apple: "↓", other: "↓", term: "kbd.down", name: "Down" },
  arrowleft: { apple: "←", other: "←", term: "kbd.left", name: "Left" },
  left: { apple: "←", other: "←", term: "kbd.left", name: "Left" },
  arrowright: { apple: "→", other: "→", term: "kbd.right", name: "Right" },
  right: { apple: "→", other: "→", term: "kbd.right", name: "Right" },
  pageup: { apple: "PgUp", other: "PgUp", term: "kbd.pageUp", name: "Page Up" },
  pagedown: { apple: "PgDn", other: "PgDn", term: "kbd.pageDown", name: "Page Down" },
  home: { apple: "Home", other: "Home", term: "kbd.home", name: "Home" },
  end: { apple: "End", other: "End", term: "kbd.end", name: "End" },
};

/**
 * Parses a shortcut: keys joined by `+` make a chord (`Mod+Shift+P`), chords
 * separated by spaces are pressed one after another (`G I`). `Mod` is ⌘ on
 * Apple platforms and Ctrl elsewhere. A lone `+` is the plus key.
 */
export function parseShortcut(shortcut: string, apple: boolean): KbdKey[][] {
  return shortcut
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((chord) =>
      chord
        .split(/\+(?!$)/)
        .filter((k) => k !== "")
        .map((key): KbdKey => {
          const info = KEYS[key.toLowerCase()];
          if (!info) {
            const glyph = key.length === 1 ? key.toUpperCase() : key;
            return { glyph, term: null, name: glyph };
          }
          return {
            glyph: apple ? info.apple : info.other,
            term: (apple && info.appleTerm) || info.term,
            name: (apple && info.appleName) || info.name,
          };
        }),
    );
}

/** Whether this browser runs on macOS, iOS or iPadOS (false on the server). */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * A keyboard shortcut, drawn as keys: `Mod+K` is ⌘K on Apple platforms and
 * Ctrl+K elsewhere. Screen readers hear the keys' names ("Command K"), not
 * the symbols.
 *
 * The server renders the non-Apple form; the platform is detected after the
 * element starts in the browser, so hydration never mismatches. Set
 * `platform` to pin one.
 *
 * @element lit-material-kbd
 *
 * @cssprop --lit-material-kbd-font - The keys' font (default: the system monospace).
 * @cssprop --lit-material-kbd-background - The key caps' background.
 * @cssprop --lit-material-kbd-color - The key caps' text colour.
 * @cssprop --lit-material-kbd-border - The key caps' border colour.
 *
 * @csspart keys - The drawn keys (hidden from assistive technology).
 * @csspart key - Each key cap.
 * @csspart label - The spoken text (visually hidden).
 */
@customElement("lit-material-kbd")
export class LitMaterialKbd extends LitElement {
  static override styles = styles;

  /** The shortcut, e.g. `Mod+K`, `Mod+Shift+P`, `Alt+Shift+ArrowLeft`, `G I` (a sequence). */
  @property() keys = "";

  /** `auto` (default) detects it in the browser; `apple` or `other` pins it. */
  @property() platform: KbdPlatform = "auto";

  /** `small` (default, for menus and hints) or `medium`. */
  @property({ reflect: true }) size: KbdSize = "small";

  /** Detected after the first render, so it matches the server's. */
  @state() private detectedApple = false;

  private readonly localize = new LocalizeController(this);

  protected override firstUpdated(): void {
    this.detectedApple = isApplePlatform();
  }

  private get apple(): boolean {
    return this.platform === "apple" || (this.platform === "auto" && this.detectedApple);
  }

  /** A key's spoken name in the page's language (literal calls, so the message catalog finds them). */
  private keyName(k: KbdKey): string {
    const t = this.localize;
    switch (k.term) {
      case "kbd.command": return t.term("kbd.command", "Command");
      case "kbd.control": return t.term("kbd.control", "Control");
      case "kbd.meta": return t.term("kbd.meta", "Windows");
      case "kbd.option": return t.term("kbd.option", "Option");
      case "kbd.alt": return t.term("kbd.alt", "Alt");
      case "kbd.shift": return t.term("kbd.shift", "Shift");
      case "kbd.enter": return t.term("kbd.enter", "Enter");
      case "kbd.escape": return t.term("kbd.escape", "Escape");
      case "kbd.tab": return t.term("kbd.tab", "Tab");
      case "kbd.backspace": return t.term("kbd.backspace", "Backspace");
      case "kbd.delete": return t.term("kbd.delete", "Delete");
      case "kbd.space": return t.term("kbd.space", "Space");
      case "kbd.up": return t.term("kbd.up", "Up");
      case "kbd.down": return t.term("kbd.down", "Down");
      case "kbd.left": return t.term("kbd.left", "Left");
      case "kbd.right": return t.term("kbd.right", "Right");
      case "kbd.pageUp": return t.term("kbd.pageUp", "Page Up");
      case "kbd.pageDown": return t.term("kbd.pageDown", "Page Down");
      case "kbd.home": return t.term("kbd.home", "Home");
      case "kbd.end": return t.term("kbd.end", "End");
      default: return k.name;
    }
  }

  /** The text read out, e.g. "Command Shift P" or "G, then I". */
  get spokenText(): string {
    const chords = parseShortcut(this.keys, this.apple).map((chord) => chord.map((k) => this.keyName(k)).join(" "));
    return chords.join(this.localize.term("kbd.then", ", then "));
  }

  override render() {
    const apple = this.apple;
    const chords = parseShortcut(this.keys, apple);
    return html`<span class="keys" part="keys" aria-hidden="true"
        >${chords.map(
          (chord, i) =>
            html`${i > 0 ? html`<span class="then"> </span>` : nothing}${chord.map(
              (k, j) => html`${j > 0 && !apple ? html`<span class="plus">+</span>` : nothing}<kbd class="key" part="key">${k.glyph}</kbd>`,
            )}`,
        )}</span
      ><span class="label" part="label">${this.spokenText}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-kbd": LitMaterialKbd;
  }
}
