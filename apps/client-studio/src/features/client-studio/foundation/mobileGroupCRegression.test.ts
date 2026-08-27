import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");

test("41 active mobile Priority card derives height from its slider content", () => {
  const card = read("../sections/PriorityEngine/DecisionCard.tsx");
  const slider = read("../sections/PriorityEngine/DecisionSlider.tsx");

  assert.match(card, /<DecisionSlider/);
  assert.match(card, /mobile:aspect-auto/);
  assert.match(card, /mobile:relative mobile:inset-auto/);

  assert.match(slider, /relative h-11 w-full/);
});

test("41 inactive and desktop card authority remains canonical", () => {
  const layout = read(
    "../sections/PriorityEngine/decision-cards-layout.ts",
  );

  assert.match(layout, /relative w-full aspect-square/);
  assert.match(layout, /desktop:h-\[155px\]/);
  assert.match(layout, /desktop:w-\[155px\]/);
});

test("42 conversation panel uses the cards mobile content band", () => {
  const layout = read(
    "../sections/PriorityEngine/priority-engine-layout.ts",
  );

  assert.match(
    layout,
    /mobile:ml-0 mobile:w-full mobile:max-w-none mobile:px-0/,
  );
});

test("43 sticky finish switch does not re-inset the mobile content band", () => {
  const layout = read(
    "../sections/PriorityEngine/priority-engine-layout.ts",
  );

  const panel = read(
    "../sections/PriorityEngine/PriorityConversationPanel.tsx",
  );

  assert.match(layout, /mobile:mx-0/);
  assert.match(layout, /mobile:px-0 mobile:py-3/);

  assert.doesNotMatch(layout, /mobile:-mx-section/);

  assert.match(panel, /mobile:w-full mobile:max-w-none/);
  assert.match(panel, /desktop:w-1\/2/);
});
