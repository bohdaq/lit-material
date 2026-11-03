// Terminal replay: types each command in `[data-terminal]`, prints its
// output, pauses and loops while on screen. The prerendered <pre> already
// shows the finished session, so without JS or with reduced motion nothing
// changes.

export interface TerminalLine {
  /** A command, typed after the prompt. */
  cmd?: string;
  /** An output line. */
  out?: string;
  /** Highlights an output line. */
  accent?: boolean;
}

export interface TerminalOptions {
  prompt?: string;
  /** Pause after the session before it starts again, in ms. */
  pause?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function initTerminal({ prompt = "$ ", pause = 4500 }: TerminalOptions = {}): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const pre of document.querySelectorAll<HTMLElement>("[data-terminal]")) play(pre, prompt, pause);
}

function play(pre: HTMLElement, promptText: string, pause: number): void {
  let lines: TerminalLine[];
  try {
    lines = JSON.parse(pre.dataset.terminal ?? "[]");
  } catch {
    return;
  }
  const line = (cls: string, text: string) => {
    const el = document.createElement("span");
    el.className = `t-line ${cls}`.trim();
    el.textContent = text;
    pre.append(el);
    return el;
  };
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e!.isIntersecting)).observe(pre);

  void (async () => {
    for (;;) {
      pre.replaceChildren();
      for (const l of lines) {
        while (!visible) await sleep(500);
        if (l.cmd !== undefined) {
          const el = line("t-typing", "");
          const prompt = document.createElement("span");
          prompt.className = "t-prompt";
          prompt.textContent = promptText;
          const text = document.createTextNode("");
          el.append(prompt, text);
          for (const ch of l.cmd) {
            text.data += ch;
            await sleep(45 + Math.random() * 40);
          }
          el.classList.remove("t-typing");
          await sleep(350);
        } else {
          line(l.accent ? "t-accent" : "t-out", l.out ?? "");
          await sleep(140);
        }
      }
      await sleep(pause);
    }
  })();
}
