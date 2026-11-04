import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./log-viewer.js";
import type { LitMaterialLogViewer } from "./log-viewer.js";

const lines = (el: LitMaterialLogViewer) => [...el.shadowRoot!.querySelectorAll(".line")].map((l) => l.textContent);

describe("lit-material-log-viewer", () => {
  it("appends lines (splitting on newlines) in a log region", async () => {
    const el = await fixture<LitMaterialLogViewer>(html`<lit-material-log-viewer label="Access log"></lit-material-log-viewer>`);
    el.appendLines("one");
    el.appendLines(["two", "three\nfour"]);
    await el.updateComplete;
    expect(lines(el)).to.deep.equal(["one", "two", "three", "four"]);
    const region = el.shadowRoot!.querySelector('[role="log"]')!;
    expect(region.getAttribute("aria-label")).to.equal("Access log");
    expect(region.getAttribute("aria-live")).to.equal("off");
  });

  it("drops the oldest past max-lines and says how many", async () => {
    const el = await fixture<LitMaterialLogViewer>(html`<lit-material-log-viewer max-lines="3"></lit-material-log-viewer>`);
    el.appendLines(["a", "b", "c"]);
    setTimeout(() => el.appendLines(["d", "e"]));
    const event = await oneEvent(el, "lines-dropped");
    expect(event.detail.count).to.equal(2);
    await el.updateComplete;
    expect(el.lines).to.deep.equal(["c", "d", "e"]);
  });

  it("holds lines while paused and adds them on resume", async () => {
    const el = await fixture<LitMaterialLogViewer>(html`<lit-material-log-viewer paused></lit-material-log-viewer>`);
    el.appendLines(["x", "y"]);
    await el.updateComplete;
    expect(lines(el)).to.deep.equal([]);
    expect(el.shadowRoot!.querySelector(".held")!.textContent).to.contain("2 lines waiting");
    el.paused = false;
    await el.updateComplete;
    expect(lines(el)).to.deep.equal(["x", "y"]);
  });

  it("follows the newest line at the bottom, and stops when scrolled up", async () => {
    const el = await fixture<LitMaterialLogViewer>(
      html`<lit-material-log-viewer style="--lit-material-log-viewer-height: 100px"></lit-material-log-viewer>`,
    );
    el.lines = Array.from({ length: 50 }, (_, i) => `line ${i}`);
    await el.updateComplete;
    const viewport = el.shadowRoot!.querySelector<HTMLElement>(".viewport")!;
    expect(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight).to.be.lessThan(2);

    viewport.scrollTop = 0;
    viewport.dispatchEvent(new Event("scroll"));
    el.appendLines(["new 1", "new 2"]);
    await el.updateComplete;
    expect(viewport.scrollTop).to.equal(0, "stays where the reader is");
    const jump = el.shadowRoot!.querySelector<HTMLButtonElement>(".jump")!;
    expect(jump.textContent).to.contain("2 new lines");
    jump.click();
    await el.updateComplete;
    expect(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight).to.be.lessThan(2);
    expect(el.shadowRoot!.querySelector(".jump")).to.be.null;
  });

  it("highlights lines with a level class and a labelled marker", async () => {
    const el = await fixture<LitMaterialLogViewer>(html`<lit-material-log-viewer></lit-material-log-viewer>`);
    el.highlight = (line) => (line.includes(" 500 ") ? "error" : line.includes(" 404 ") ? "warning" : null);
    el.appendLines(["GET / 200 ", "GET /x 404 ", "GET /y 500 "]);
    await el.updateComplete;
    const rendered = [...el.shadowRoot!.querySelectorAll(".line")];
    expect(rendered[0].className.trim()).to.equal("line");
    expect(rendered[1].classList.contains("warning")).to.be.true;
    expect(rendered[2].querySelector(".mark")!.getAttribute("aria-label")).to.equal("error");
    expect(rendered[2].querySelector(".mark")!.getAttribute("role")).to.equal("img");
  });

  it("clear() empties it", async () => {
    const el = await fixture<LitMaterialLogViewer>(html`<lit-material-log-viewer></lit-material-log-viewer>`);
    el.appendLines("a");
    el.clear();
    await el.updateComplete;
    expect(el.lines).to.deep.equal([]);
  });

  it("translates its label, level names and status text", async () => {
    registerTranslation({
      $code: "x-log-viewer",
      "logViewer.log": "Protokoll",
      "logViewer.error": "Fehler",
      "logViewer.paused": { one: "Pausiert: {count} Zeile wartet", other: "Pausiert: {count} Zeilen warten" },
    });
    const wrapper = await fixture<HTMLDivElement>(html`<div lang="x-log-viewer"><lit-material-log-viewer></lit-material-log-viewer></div>`);
    const el = wrapper.querySelector<LitMaterialLogViewer>("lit-material-log-viewer")!;
    el.highlight = (line) => (line.includes("500") ? "error" : null);
    el.appendLines("GET / 500");
    el.paused = true;
    await el.updateComplete;
    el.appendLines(["a", "b"]);
    await el.updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector(".viewport")!.getAttribute("aria-label")).to.equal("Protokoll");
    expect(root.querySelector(".mark")!.getAttribute("aria-label")).to.equal("Fehler");
    expect(root.querySelector(".held")!.textContent!.trim()).to.equal("Pausiert: 2 Zeilen warten");
  });

  it("puts the level marker at the start edge in right-to-left layouts", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`<div dir="rtl"><lit-material-log-viewer></lit-material-log-viewer></div>`);
    const el = wrapper.querySelector<LitMaterialLogViewer>("lit-material-log-viewer")!;
    el.highlight = () => "error";
    el.appendLines("x");
    await el.updateComplete;
    const line = el.shadowRoot!.querySelector<HTMLElement>(".line")!.getBoundingClientRect();
    const mark = el.shadowRoot!.querySelector<HTMLElement>(".mark")!.getBoundingClientRect();
    expect(line.right - mark.right).to.be.closeTo(8, 1);
  });
});
