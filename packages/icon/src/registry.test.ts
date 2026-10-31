import { expect, fixture, html } from "@open-wc/testing";
import { render } from "lit";
import "./icon.js";
import { icon } from "./icon-template.js";
import type { LitMaterialIcon } from "./icon.js";
import { getIcon, iconNames, normalizeSvg, registerIcons } from "./registry.js";

const PHOSPHOR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M0 0h256v256H0z"/></svg>';
const MATERIAL = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
const LUCIDE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16"/></svg>';

describe("icon registry", () => {
  it("normalizes SVG for use as an icon", () => {
    const material = normalizeSvg(MATERIAL);
    expect(material).to.match(/^<svg /);
    expect(material).to.not.match(/width=|height=/);
    expect(material).to.include('fill="currentColor"');
    expect(material).to.include('aria-hidden="true"');
    expect(normalizeSvg(LUCIDE)).to.include('fill="none"');
    expect(normalizeSvg(LUCIDE)).to.not.include('fill="currentColor"');
    expect(normalizeSvg("<div>not an icon</div>")).to.equal("");
  });

  it("registers names, with an optional prefix", () => {
    registerIcons({ trash: PHOSPHOR }, { prefix: "ph" });
    registerIcons({ home: MATERIAL });
    expect(getIcon("ph:trash")).to.include("viewBox=\"0 0 256 256\"");
    expect(iconNames()).to.include.members(["ph:trash", "home"]);
    expect(getIcon("trash")).to.be.undefined;
  });

  it("renders a registered icon by name, sized by the host", async () => {
    registerIcons({ gauge: PHOSPHOR });
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon name="gauge" size="small"></lit-material-icon>`);
    const svg = el.shadowRoot!.querySelector("svg")!;
    expect(svg).to.exist;
    expect(svg.getBoundingClientRect().width).to.equal(18);
    expect(el.getAttribute("aria-hidden")).to.equal("true");
  });

  it("shows an icon registered after it rendered", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon name="late"></lit-material-icon>`);
    expect(el.shadowRoot!.querySelector("svg")).to.be.null;
    registerIcons({ late: PHOSPHOR });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("svg")).to.exist;
  });

  it("icon() renders the element with a label", async () => {
    registerIcons({ check: PHOSPHOR });
    const host = document.createElement("div");
    render(icon("check", { label: "Healthy", slot: "icon" }), host);
    const el = host.querySelector("lit-material-icon") as LitMaterialIcon;
    document.body.append(host);
    await el.updateComplete;
    expect(el.getAttribute("name")).to.equal("check");
    expect(el.getAttribute("role")).to.equal("img");
    expect(el.getAttribute("aria-label")).to.equal("Healthy");
    expect(el.slot).to.equal("icon");
    host.remove();
  });
});
