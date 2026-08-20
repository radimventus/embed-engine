import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  isDecisionSection,
  isOrientationSection,
  isPrioritySection,
  isRacioSection,
} from "./journeyNavigation";

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, "../../../..");

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), "utf8");
}

describe("Responsive Decision Journey (RCS-05)", () => {
  it("maps shell section ids to journey reveal bands", () => {
    assert.equal(isOrientationSection("hero"), true);
    assert.equal(isOrientationSection("walkthrough"), true);
    assert.equal(isPrioritySection("priority-experience"), true);
    assert.equal(isRacioSection("ai-advisor"), true);
    assert.equal(isDecisionSection("audit-lead-capture"), true);
    assert.equal(isDecisionSection("hero"), false);
  });

  it("keeps Priority and Racio as separate canonical scenes", () => {
    const journey = readSource(
      "src/features/client-studio/foundation/decisionJourney.ts",
    );
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const bridge = readSource(
      "src/features/client-studio/sections/PriorityEngine/PriorityChapterBridge.tsx",
    );

    assert.match(journey, /journey-scene-priority/);
    assert.match(journey, /journey-scene-racio/);
    assert.match(page, /revealedSceneCount >= 3/);
    assert.match(page, /<PriorityEngine[\s\S]*onContinueToRacio/);
    assert.match(page, /<AIAdvisor \/>/);
    assert.doesNotMatch(bridge, /priority-continue-to-racio/);
  });

  it("reveals Racio only from the completed Priority bridge", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const engine = readSource(
      "src/features/client-studio/sections/PriorityEngine/PriorityEngine.tsx",
    );
    const interSceneBridge = readSource(
      "src/features/client-studio/sections/PriorityEngine/PriorityRacioBridge.tsx",
    );

    assert.match(
      page,
      /if \(isRacioSection\(sectionId\) && revealedSceneCount >= 3\)/,
    );
    assert.match(page, /enterScene\(scenes\[2\]!\.id\)/);
    assert.match(engine, /onContinueToRacio/);
    assert.match(engine, /phase === "complete"/);
    assert.match(engine, /priority-racio-controls/);
    assert.match(page, /showRacioBridge=\{revealedSceneCount < 3\}/);
    assert.match(engine, /RACIO_BRIDGE_DELAY_MS = 10_000/);
    assert.match(engine, /showRacioBridge && isRacioBridgeDelayElapsed/);
    assert.match(engine, /window\.clearTimeout\(timerId\)/);
    assert.match(interSceneBridge, /priority-racio-bridge-continue/);
    assert.match(interSceneBridge, /onClick=\{onContinue\}/);
    assert.match(
      interSceneBridge,
      /Teď přejdeme k častým otázkám a možnosti chat diskuse\./,
    );
    assert.doesNotMatch(
      interSceneBridge,
      /Teď se podíváme také na racionální stránku domu a jeho kompromisy\./,
    );
  });

  it("keeps scene controls at content boundaries and targets Social Proof from Priority", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const audit = readSource(
      "src/features/client-studio/sections/AuditLeadCapture/AuditLeadCapture.tsx",
    );

    assert.match(page, /PILOT_SECTION_IDS\.socialProof/);
    assert.match(page, /PILOT_SECTION_IDS\.socialProof,\s*20,\s*\)/);
    assert.match(page, /pinFooterToBottom=\{false\}/);
    assert.match(page, /previousSceneId=\{scenes\[1\]\?\.id\}/);
    assert.match(page, /<AuditLeadCapture[\s\S]*onBack/);
    assert.match(audit, /data-testid="audit-back"/);
    assert.match(audit, /pt-5/);
  });

  it("settles a fresh Journey on the mounted Social Proof anchor", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");

    assert.match(
      page,
      /useState<string \| null>\(\s*PILOT_SECTION_IDS\.socialProof,\s*\)/,
    );
    assert.match(page, /isSectionScrollReady\(sceneId\)/);
    assert.match(page, /scrollToSection\(sceneId, "smooth"\)/);
  });

  it("cancels a superseded deferred scroll before consuming its replacement", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");

    assert.match(page, /const sceneId = pendingSceneId;/);
    assert.match(page, /let cancelled = false;/);
    assert.match(page, /window\.cancelAnimationFrame\(frameId\)/);
    assert.match(
      page,
      /setPendingSceneId\(\(current\) => \(current === sceneId \? null : current\)\)/,
    );
    assert.doesNotMatch(page, /scrollDelayTimerRef/);
    assert.doesNotMatch(page, /pendingSceneIdRef/);
  });

  it("unifies mobile navigation reveal, CTA chrome, and scene rhythm", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const mobileNav = readSource(
      "src/features/client-studio/ClientStudioMobileNav.tsx",
    );
    const scene = readSource(
      "src/features/client-studio/foundation/JourneySceneFrame.tsx",
    );
    const cta = readSource(
      "src/features/client-studio/foundation/journeyCta.ts",
    );
    const faq = readSource(
      "src/features/client-studio/sections/AIAdvisor/SuggestedQuestions.tsx",
    );
    const canvas = readSource("src/features/client-studio/DesktopCanvas.tsx");
    const active = readSource(
      "src/features/client-studio/foundation/useActiveSection.ts",
    );

    assert.match(page, /registerJourneySectionNavigator/);
    assert.match(page, /isPrioritySection/);
    assert.match(page, /isRacioSection/);
    assert.match(page, /isDecisionSection/);
    assert.match(mobileNav, /navigateToJourneySection/);
    assert.match(scene, /JOURNEY_CTA_PRIMARY_CLASS/);
    assert.match(scene, /guided-journey-bottom-nav-offset/);
    assert.match(cta, /min-h-11/);
    assert.match(cta, /desktop:min-h-\[38px\]/);
    assert.match(faq, /JOURNEY_CTA_PRIMARY_CLASS/);
    assert.match(canvas, /overflow-x-hidden/);
    assert.match(active, /desktopMinPx/);
  });

  it("makes ClientStudioPage the single owner of reveal and deferred scroll", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const navigation = readSource(
      "src/features/client-studio/foundation/journeyNavigation.ts",
    );
    const ambientSocialProof = readSource(
      "src/features/client-studio/sections/Hero/AmbientSocialProof.tsx",
    );

    assert.match(page, /const \[requestedSceneId, setRequestedSceneId\]/);
    assert.match(page, /document\.getElementById\(sceneId\) === null/);
    assert.match(page, /isSectionScrollReady\(sceneId\)/);
    assert.match(page, /current === sceneId \? null : current/);
    assert.match(page, /transitionTimerRef\.current = window\.setTimeout/);
    assert.match(
      navigation,
      /if \(sectionNavigator !== null\) \{\s*sectionNavigator\(sectionId\);\s*return;/,
    );
    assert.doesNotMatch(ambientSocialProof, /IntersectionObserver/);
  });

  it("keeps scene CTA space in flow while the next scene is unrevealed", () => {
    const scene = readSource(
      "src/features/client-studio/foundation/JourneySceneFrame.tsx",
    );

    assert.match(scene, /const SCENE_CTA_GAP = "20px"/);
    assert.match(scene, /const UNREVEALED_SCENE_SPACE/);
    assert.match(scene, /gap-5 px-section/);
    assert.equal(scene.includes("absolute top-0 right-0"), false);
  });
});
