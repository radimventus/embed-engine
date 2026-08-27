import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(
  process.cwd(),
  "src/features/client-studio",
);

const read = (name: string) =>
  fs.readFileSync(path.join(root, name), "utf8");

test("VR3 Tour preserved", () => {
  const rail =
    read("sections/MediaExplorer/ThumbnailRail.tsx");
  const room =
    read("sections/HouseNavigator/RoomIndex.tsx");
  const select =
    read("sections/HouseNavigator/RoomSelect.tsx");

  assert.match(rail, /MOBILE_VISIBLE_SLOTS = 3/);
  assert.match(room, /w-\[36%\]/);
  assert.match(select, /border-2/);
});

test("VR3 Hero and Social Proof", () => {
  const hero =
    read("sections/Hero/HeroContent.tsx");
  const social =
    read("sections/Hero/SocialProof.tsx");

  assert.match(hero, /mobile:grid-cols-3/);
  assert.match(social, /mobileSocialProofIndex/);
  assert.match(social, /renderedEntries/);
  assert.match(
    social,
    /renderedEntries\.slice\(0, 1\)\.map/,
  );
  assert.doesNotMatch(
    social,
    /entries\.slice\(0, FEED_VISIBLE_ITEM_COUNT\)\.map/,
  );
  assert.match(social, /8000/);
});

test("VR3 Priority", () => {
  const card =
    read("sections/PriorityEngine/DecisionCard.tsx");
  const panel =
    read("sections/PriorityEngine/PriorityConversationPanel.tsx");

  assert.match(card, /data-mobile-priority-intensity/);
  assert.match(card, /DecisionSlider/);
  assert.match(panel, /mobile:w-full/);
  assert.match(panel, /mobile:max-w-none/);
});

test("VR3 Audit", () => {
  const workflow =
    read("sections/AuditLeadCapture/AssessmentWorkflow.tsx");
  const transition =
    read("sections/AuditLeadCapture/AuditTransition.tsx");

  assert.match(
    workflow,
    /data-mobile-audit-workflow/,
  );

  assert.match(
    workflow,
    /mobile:grid-cols-\[44px_minmax\(0,1fr\)\]/,
  );

  assert.doesNotMatch(
    workflow,
    /grid-cols-4 gap-4 mobile:grid-cols-2/,
  );

  assert.match(
    transition,
    /mobile:text-\[2\.4rem\]/,
  );
});
