import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, "../../../..");

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), "utf8");
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("Application Foundation (CSCB-01 / SR-001)", () => {
  it("mounts through a single main entry and AppShell", () => {
    const main = readSource("src/main.tsx");
    const mount = readSource("src/embed/mountClientStudio.tsx");
    const app = readSource("src/features/client-studio/ClientStudioApp.tsx");

    assert.match(main, /Embed\.mount/);
    assert.match(main, /registerClientStudioCss/);
    assert.doesNotMatch(main, /mountClientHostWorkspaceNavigation/);
    assert.match(mount, /ErrorBoundary/);
    assert.match(mount, /ClientStudioApp/);
    assert.match(mount, /createRoot/);
    assert.match(app, /AppShell/);
    assert.match(app, /ClientStudioHeader/);
    assert.match(app, /ClientStudioSidebar/);
    assert.match(app, /ClientStudioMobileNav/);
    assert.match(app, /ClientStudioPage/);
  });

  it("bootstraps Decision Session Runtime only via the Provider", () => {
    const provider = readSource(
      "src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx",
    );
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const app = stripComments(
      readSource("src/features/client-studio/ClientStudioApp.tsx"),
    );

    assert.match(provider, /createDecisionSessionRuntime/);
    assert.match(page, /DecisionSessionRuntimeProvider/);
    assert.match(page, /RuntimeBootstrapGate/);
    assert.equal(app.includes("createDecisionSessionRuntime"), false);
  });

  it("keeps shell navigation wired to journey section ids", () => {
    const vocabulary = readSource(
      "src/features/client-studio/pilot/pilotVocabulary.ts",
    );
    const sidebar = readSource(
      "src/features/client-studio/ClientStudioSidebar.tsx",
    );
    const header = readSource(
      "src/features/client-studio/ClientStudioHeader.tsx",
    );
    const contactMenu = readSource(
      "src/features/client-studio/header/HeaderContactMenu.tsx",
    );
    const saveMenu = readSource(
      "src/features/client-studio/header/HeaderSaveMenu.tsx",
    );
    const contact = readSource(
      "src/features/client-studio/header/experienceContact.ts",
    );

    assert.match(vocabulary, /PILOT_SECTION_NAV/);
    assert.match(vocabulary, /hero:/);
    assert.match(vocabulary, /aiAdvisor:/);
    assert.match(sidebar, /PILOT_SECTION_NAV/);
    assert.match(sidebar, /useActiveSection/);
    assert.match(sidebar, /navigateToJourneySection/);
    assert.match(sidebar, /desktop:flex/);
    assert.match(header, /HeaderContactMenu/);
    assert.match(header, /HeaderSaveMenu/);
    assert.match(header, /formatExperienceHeaderTitle/);
    assert.match(header, /desktop:w-canvas/);
    assert.match(contactMenu, /mailto:/);
    assert.match(contactMenu, /tel:/);
    assert.match(saveMenu, /Uložit tuto stránku jako PDF/);
    assert.match(saveMenu, /window\.print/);
    assert.match(contact, /kontakt@astav\.cz/);
    assert.match(contact, /\+420 987 654 321/);
  });

  it("keeps guided journey scene shells without changing onepage architecture", () => {
    const page = readSource("src/features/client-studio/ClientStudioPage.tsx");
    const journey = readSource(
      "src/features/client-studio/foundation/decisionJourney.ts",
    );
    const sceneFrame = readSource(
      "src/features/client-studio/foundation/JourneySceneFrame.tsx",
    );
    const root = readSource(
      "src/features/client-studio/foundation/GuidedJourneyRoot.tsx",
    );
    const css = readSource("src/index.css");

    assert.match(page, /GuidedJourneyRoot/);
    assert.match(page, /JourneySceneFrame/);
    assert.match(page, /data-current-scene/);
    assert.match(page, /setSnapEnabled\(true\)/);
    assert.match(
      page,
      /<Hero \/>[\s\S]*<ChapterSpacer \/>[\s\S]*<SpatialTerminal \/>/,
    );
    assert.match(page, /<PriorityEngine[\s\S]*onContinueToRacio/);
    assert.match(page, /sceneId=\{scenes\[2\]!\.id\}[\s\S]*<AIAdvisor \/>/);
    assert.match(page, /<AuditLeadCapture[\s\S]*onBack/);
    assert.match(journey, /Orientace/);
    assert.match(journey, /Priority/);
    assert.match(journey, /Racio/);
    assert.match(journey, /Rozhodnutí/);
    assert.match(sceneFrame, /Pokračovat/);
    assert.match(sceneFrame, /Zpět/);
    assert.match(sceneFrame, /40px/);
    assert.match(sceneFrame, /CAP UX3 09/);
    assert.match(root, /snapEnabled/);
    assert.match(css, /scroll-snap-type: y proximity/);
    assert.equal(page.includes("DecisionJourneyIndicator"), false);
    assert.equal(page.includes("createBrowserRouter"), false);
    assert.equal(page.includes("Route"), false);
  });

  it("does not change Runtime package APIs from the app shell", () => {
    const provider = stripComments(
      readSource(
        "src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx",
      ),
    );

    assert.match(provider, /createSystemClock/);
    assert.match(provider, /createDecisionSessionRuntime/);
    assert.equal(provider.includes("composeDecision"), false);
    assert.equal(provider.includes("interpretDecisionSession"), false);
  });
});
