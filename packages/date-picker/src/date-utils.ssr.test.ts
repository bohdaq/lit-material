import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { localeFirstDayOfWeek, regionFirstDayOfWeek } from "./date-utils.js";

// Codes CLDR no longer uses (Burma, South Yemen, ...) get a region-neutral default.
const RETIRED = "BU JT MI NT PU PZ RH WK YD".split(" ");

describe("date-utils (no browser)", () => {
  it("reads the first weekday from Intl.Locale week info, Sunday for an invalid tag", () => {
    assert.equal(localeFirstDayOfWeek("de"), 1);
    assert.equal(localeFirstDayOfWeek("en-US"), 0);
    assert.equal(localeFirstDayOfWeek("not a locale!"), 0);
  });

  it("falls back to CLDR's region table where Intl.Locale has no week info (Firefox), agreeing with it where it does", () => {
    assert.deepEqual(["US", "DE", "EG", "MV", "GB", "JP"].map(regionFirstDayOfWeek), [0, 1, 6, 5, 1, 0]);
    for (let a = 65; a < 91; a++) {
      for (let b = 65; b < 91; b++) {
        const region = String.fromCharCode(a, b);
        let locale: Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
        try {
          locale = new Intl.Locale(`und-${region}`);
        } catch {
          continue;
        }
        const info = locale.getWeekInfo?.() ?? locale.weekInfo;
        if (!info || RETIRED.includes(region)) continue;
        assert.equal(regionFirstDayOfWeek(region), info.firstDay % 7, region);
      }
    }
  });
});
