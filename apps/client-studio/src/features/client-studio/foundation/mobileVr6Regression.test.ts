import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");

test("VR6 SPACE mobile chrome contract", () => {
  const nav = read("../ClientStudioMobileNav.tsx");
  const frame = read("./JourneySceneFrame.tsx");

  assert.match(nav, /data-mobile-hamburger/);
  assert.match(nav, /data-mobile-scrolled/);

  assert.match(frame, /mobile:flex-nowrap/);
});

test("VR6 FAQ stays normal-case and compact", () => {
  const s = read("../sections/AIAdvisor/SuggestedQuestions.tsx");

  assert.match(s, /mobile:normal-case/);
  assert.match(s, /mobile:min-h-0/);
  assert.match(s, /mobile:py-2/);
});

test("VR6 loading copy is canonical Czech", () => {
  const provider = read("../runtime/DecisionSessionRuntimeProvider.tsx");

  assert.doesNotMatch(provider, /Připravuji (?:Decision|decision) [Ss]ession/);
});

test("VR6 hard locks remain intact", () => {
  const provider = read("../runtime/DecisionSessionRuntimeProvider.tsx");

  assert.match(provider, /crypto\.randomUUID\(\)/);
  assert.doesNotMatch(provider, /restorePublicDecisionSession/);
});
