import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function readRepo(path: string): string {
  return readFileSync(
    resolve(import.meta.dirname, "../../../../../../", path),
    "utf8",
  );
}

test("VR4 SPACE keeps mobile context reduced and hamburger persistent", () => {
  const nav = read("ClientStudioMobileNav.tsx");

  assert.match(nav, /data-studio-shell="mobile-nav"/);
  assert.match(nav, /aria-label="Otevřít navigaci"/);
  assert.match(nav, /☰/);
  assert.match(nav, /desktop:hidden/);

  assert.doesNotMatch(
    nav,
    />\s*Company\s*</,
  );
});

test("VR4 TOUR is full 16:9 with three thumbnails and compact mobile chrome", () => {
  const media = read("sections/MediaExplorer/MediaExplorer.tsx");
  const rail = read("sections/MediaExplorer/ThumbnailRail.tsx");

  assert.match(media, /mobile:aspect-video/);
  assert.match(rail, /MOBILE_VISIBLE_SLOTS\s*=\s*3/);

  const match = rail.match(/CHEVRON_COLUMN_PX\s*=\s*(\d+)/);
  assert.ok(match);
  assert.ok(Number(match[1]) <= 36);
});

test("VR4 WelcomeBridge keeps mobile copy horizontal", () => {
  const bridge = readRepo("packages/ui/src/welcome-bridge/WelcomeBridge.tsx");

  assert.match(bridge, /welcome-bridge-copy/);
  assert.match(bridge, /@media \(max-width: 767px\)/);
  assert.match(bridge, /flex-direction:\s*row/);
  assert.match(bridge, /data-testid="welcome-bridge-cta"/);
});

test("VR4 Priority exposes unclipped canonical mobile intensity control", () => {
  const card = read("sections/PriorityEngine/DecisionCard.tsx");
  const slider = read("sections/PriorityEngine/DecisionSlider.tsx");

  assert.match(card, /data-mobile-priority-intensity/);
  assert.match(card, /<DecisionSlider/);
  assert.match(slider, /data-testid="priority-intensity-slider"/);

  assert.doesNotMatch(
    card,
    /max-h-11 translate-y-0 pt-2 opacity-100/,
  );
});

test("VR4 Audit preserves mobile workflow semantics", () => {
  const workflow = read(
    "sections/AuditLeadCapture/AssessmentWorkflow.tsx",
  );

  const start = workflow.indexOf("data-mobile-audit-workflow");
  const end = workflow.indexOf('className="relative mt-10"', start);

  assert.ok(start >= 0);
  assert.ok(end > start);

  const mobile = workflow.slice(start, end);

  assert.match(mobile, /stations\.map/);
  assert.match(mobile, /station\.title/);
  assert.match(mobile, /station\.lines/);
  assert.match(mobile, /StationMotifIcon/);
});

test("VR4 Priority conversation keeps desktop optical shifts off mobile", () => {
  const panel = read(
    "sections/PriorityEngine/PriorityConversationPanel.tsx",
  );

  assert.doesNotMatch(
    panel,
    /style=\{\{[\s\S]*?marginLeft:\s*shift\.x/,
  );

  assert.match(
    panel,
    /--priority-switch-shift-x/,
  );

  assert.match(
    panel,
    /mobile:!\[margin-left:0px\]/,
  );

  assert.match(
    panel,
    /mobile:w-full/,
  );
});

test("VR4 locked RACIO remains stacked", () => {
  const layout = read("sections/AIAdvisor/ai-advisor-layout.ts");
  assert.match(layout, /tabletMin:grid-cols-1/);
});
