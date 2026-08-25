import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./AmbientSocialProof.tsx", import.meta.url),
  "utf8",
);

test("ambient social proof follows the canonical desktop canvas geometry", () => {
  assert.match(source, /desktop:left-sidebar/);
  assert.match(source, /mx-auto/);
  assert.match(source, /px-section/);
  assert.match(source, /desktop:w-canvas/);
  assert.match(source, /desktop:min-w-canvas/);
  assert.match(source, /desktop:max-w-canvas/);
  assert.doesNotMatch(source, /desktop:ml-sidebar/);
});

test("ambient social proof preserves accepted timing", () => {
  assert.match(source, /INITIAL_DELAY_MS = 10000/);
  assert.match(source, /DWELL_MS = 6000/);
  assert.match(source, /NEXT_DELAY_MS = 12000/);
});
