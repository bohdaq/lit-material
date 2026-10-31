import { expect } from "@open-wc/testing";
import { cases } from "./cases.js";

describe("format", () => {
  for (const [name, run, want] of cases) it(name, () => expect(run()).to.deep.equal(want));
});
