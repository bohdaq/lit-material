import { expect, fixture, html } from "@open-wc/testing";
import "./carousel.js";
import "./carousel-item.js";
import type { LitMaterialCarousel } from "./carousel.js";

async function carouselFixture() {
  // No gap/padding, and a host wider than one item but narrower than two —
  // this keeps the first item's intersection ratio unambiguously near 1.0
  // (not shaved down by inset padding) and the last item's unambiguously
  // near 0, avoiding a borderline case right at the disabled-state threshold.
  const el = await fixture<LitMaterialCarousel>(html`
    <lit-material-carousel item-width="300px" style="width: 400px; --lit-material-carousel-gap: 0px;">
      <lit-material-carousel-item>One</lit-material-carousel-item>
      <lit-material-carousel-item>Two</lit-material-carousel-item>
      <lit-material-carousel-item>Three</lit-material-carousel-item>
    </lit-material-carousel>
  `);
  const items = Array.from(el.querySelectorAll("lit-material-carousel-item"));
  return { el, items };
}

function waitFor(condition: () => boolean, timeoutMs = 2000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (condition()) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error("waitFor timed out"));
      requestAnimationFrame(check);
    };
    check();
  });
}

describe("lit-material-carousel", () => {
  it("renders with role=region and aria-roledescription=carousel", async () => {
    const { el } = await carouselFixture();
    expect(el.getAttribute("role")).to.equal("region");
    expect(el.getAttribute("aria-roledescription")).to.equal("carousel");
  });

  it("sets the --lit-material-carousel-item-width custom property from item-width", async () => {
    const { el } = await carouselFixture();
    expect(el.style.getPropertyValue("--lit-material-carousel-item-width")).to.equal("300px");
  });

  it("labels each item with its position once connected", async () => {
    const { items } = await carouselFixture();
    expect(items[0]!.getAttribute("aria-label")).to.equal("1 of 3");
    expect(items[1]!.getAttribute("aria-label")).to.equal("2 of 3");
    expect(items[2]!.getAttribute("aria-label")).to.equal("3 of 3");
  });

  it("renders prev/next buttons by default, and can hide them", async () => {
    const { el } = await carouselFixture();
    expect(el.shadowRoot!.querySelector(".nav-button.prev")).to.exist;
    expect(el.shadowRoot!.querySelector(".nav-button.next")).to.exist;

    el.showNavButtons = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".nav-button.prev")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".nav-button.next")).to.not.exist;
  });

  it("scrollToIndex() scrolls the clamped item into view", async () => {
    const { el, items } = await carouselFixture();

    let calledOn: Element | undefined;
    const spyOn = (item: Element): void => {
      item.scrollIntoView = () => (calledOn = item);
    };
    spyOn(items[1]!);
    spyOn(items[2]!);

    el.scrollToIndex(1);
    expect(calledOn).to.equal(items[1]);

    // Out-of-range indices clamp to the nearest real item instead of no-oping.
    el.scrollToIndex(99);
    expect(calledOn).to.equal(items[2]);
  });

  it("the prev button is disabled at the start; the next button is enabled since more items are off-screen", async () => {
    const { el } = await carouselFixture();
    // Both buttons start out `disabled` (canScrollPrev/canScrollNext default
    // to false) until the IntersectionObserver's first callback runs — wait
    // for the one that's expected to *change* away from that default,
    // rather than the one that's expected to stay `true` throughout (which
    // would make "it hasn't updated yet" indistinguishable from "it updated
    // to the correct value").
    const nextButton = el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button.next")!;
    await waitFor(() => nextButton.disabled === false);
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button.prev")!.disabled).to.be.true;
  });

  it("moves forward/back with ArrowRight/ArrowLeft on the track, updating canScrollPrev/canScrollNext", async () => {
    const { el } = await carouselFixture();
    const track = el.shadowRoot!.querySelector<HTMLElement>(".track")!;
    await waitFor(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button.next")!.disabled === false);

    track.focus();
    track.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await waitFor(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button.prev")!.disabled === false);

    track.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await waitFor(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button.prev")!.disabled === true);
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await carouselFixture();
    await expect(el).to.be.accessible();
  });
});
