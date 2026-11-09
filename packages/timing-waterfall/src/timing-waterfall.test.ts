import { expect, fixture, html } from "@open-wc/testing";
import "./timing-waterfall.js";
import type { LitMaterialTimingWaterfall, RequestTimings } from "./timing-waterfall.js";

const timings: RequestTimings = { dnsMs: 4, connectMs: 30, waitMs: 96, downloadMs: 12, totalMs: 142, reused: false };

describe("lit-material-timing-waterfall", () => {
  it("draws a segment per phase, in proportion, and names them all for screen readers", async () => {
    const el = await fixture<LitMaterialTimingWaterfall>(html`<lit-material-timing-waterfall .timings=${timings}></lit-material-timing-waterfall>`);
    const root = el.shadowRoot!;
    const bar = root.querySelector<HTMLElement>('[role="img"]')!;
    expect(bar.getAttribute("aria-label")).to.equal("DNS: 4 ms, Connect: 30 ms, Waiting: 96 ms, Download: 12 ms, Total: 142 ms");
    const widths = [...root.querySelectorAll<HTMLElement>(".segment")].map((s) => s.getBoundingClientRect().width);
    expect(widths).to.have.length(4);
    expect(widths[2]).to.be.greaterThan(widths[1]!);
    expect(widths[1]).to.be.greaterThan(widths[3]!);
  });

  it("keeps a tiny phase visible", async () => {
    const el = await fixture<LitMaterialTimingWaterfall>(
      html`<lit-material-timing-waterfall style="width: 400px" .timings=${{ dnsMs: 1, connectMs: 0, waitMs: 2000, downloadMs: 0 }}></lit-material-timing-waterfall>`,
    );
    const segs = el.shadowRoot!.querySelectorAll<HTMLElement>(".segment");
    expect(segs).to.have.length(2, "zero phases draw no segment");
    expect(segs[0]!.getBoundingClientRect().width).to.be.at.least(2);
  });

  it("lists each phase with its time, the total, and a reused connection", async () => {
    const el = await fixture<LitMaterialTimingWaterfall>(
      html`<lit-material-timing-waterfall .timings=${{ dnsMs: 0, connectMs: 0, waitMs: 20, downloadMs: 1, totalMs: 21, reused: true }}></lit-material-timing-waterfall>`,
    );
    const text = el.shadowRoot!.querySelector(".legend")!.textContent!.replace(/\s+/g, " ");
    expect(text).to.contain("Waiting 20 ms");
    expect(text).to.contain("Total 21 ms");
    expect(text).to.contain("Reused connection");
    expect(getComputedStyle(el.shadowRoot!.querySelector(".time")!).fontVariantNumeric).to.contain("tabular-nums");
  });

  it("takes custom phases with their colours", async () => {
    const el = await fixture<LitMaterialTimingWaterfall>(
      html`<lit-material-timing-waterfall .phases=${[{ label: "Queue", ms: 5, color: "rgb(1, 2, 3)" }, { label: "Run", ms: 15 }]}></lit-material-timing-waterfall>`,
    );
    const seg = el.shadowRoot!.querySelector<HTMLElement>(".segment")!;
    expect(getComputedStyle(seg).backgroundColor).to.equal("rgb(1, 2, 3)");
    expect(el.shadowRoot!.querySelector('[role="img"]')!.getAttribute("aria-label")).to.equal("Queue: 5 ms, Run: 15 ms, Total: 20 ms");
  });

  it("hides the legend on request and draws nothing without data", async () => {
    const el = await fixture<LitMaterialTimingWaterfall>(html`<lit-material-timing-waterfall hide-legend .timings=${timings}></lit-material-timing-waterfall>`);
    expect(el.shadowRoot!.querySelector(".legend")).to.equal(null);
    const empty = await fixture<LitMaterialTimingWaterfall>(html`<lit-material-timing-waterfall></lit-material-timing-waterfall>`);
    expect(empty.shadowRoot!.querySelectorAll(".segment")).to.have.length(0);
  });
});
