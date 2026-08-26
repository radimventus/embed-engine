import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd(), "src/features/client-studio");

const read = (p: string) =>
  fs.readFileSync(path.join(root, p), "utf8");

test("mobile navigation exposes hamburger instead of permanent section strip", () => {
  const s = read("ClientStudioMobileNav.tsx");
  assert.match(s, /☰/);
  assert.match(s, /aria-expanded/);
  assert.match(s, /setIsOpen/);
});

test("Journey navigation actions remain on one mobile row", () => {
  const s = read("foundation/JourneySceneFrame.tsx");
  assert.match(s, /mobile:flex-row/);
  assert.match(s, /mobile:justify-between/);
  assert.doesNotMatch(
    s,
    /JOURNEY_CTA_SECONDARY_CLASS[^\\n]*mobile:w-full/,
  );
});

test("TOUR bridge replaces mobile forward CTA", () => {
  const s = read("foundation/JourneySceneFrame.tsx");
  assert.match(s, /isFooterLeadingVisible/);
  assert.match(
    s,
    /isFooterLeadingVisible \? "mobile:hidden" : ""/,
  );
});

test("Priority banner replaces mobile forward CTA", () => {
  const s = read("sections/PriorityEngine/PriorityEngine.tsx");
  assert.match(s, /shouldShowDelayedRacioBridge \? "mobile:hidden"/);
  assert.match(s, /mobile:grid-cols-\[auto_minmax\(0,1fr\)_auto\]/);
});

test("TOUR switches are compact and responsive to floor count", () => {
  const s = read("sections/HouseNavigator/RoomIndex.tsx");
  assert.match(s, /hasMultipleFloors/);
  assert.ok((s.match(/w-\[36%\]/g) ?? []).length >= 3)
  assert.doesNotMatch(s, /scale-50/);
  assert.match(s, /w-\[36%\] justify-start/);
  assert.match(s, /w-\[36%\] justify-end/);
  assert.match(s, /w-full justify-center/);
});

test("RACIO layout remains locked", () => {
  const s = read("sections/AIAdvisor/ai-advisor-layout.ts");
  assert.match(s, /tabletMin:grid-cols-1/);
});
