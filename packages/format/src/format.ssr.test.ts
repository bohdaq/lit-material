import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cases } from "./cases.js";

describe("format (Node)", () => {
  for (const [name, run, want] of cases) it(name, () => assert.deepEqual(run(), want));
});
