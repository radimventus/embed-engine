import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG,
  PRIORITY_MOTIVATION_BANNER_COPY,
  PRIORITY_MOTIVATION_BANNER_HEADLINE,
} from "../../welcome-bridge/clientStudioWelcomeBridgeConfig";
import {
  PRIORITY_CONVERSATION_COMPLETE_PANEL_LINES,
  PRIORITY_CONVERSATION_GATE_LINES,
  PRIORITY_CONVERSATION_GATE_PROMPT,
  PRIORITY_CONVERSATION_INTRO_LINES,
  PRIORITY_CONVERSATION_MINIMUM,
  PRIORITY_CONVERSATION_START_HEADING,
  PRIORITY_CONVERSATION_START_LINES,
} from "./priorityConversation.constants";

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, "../../../../..");
const repoRoot = join(clientStudioRoot, "../..");

function readFromHere(name: string): string {
  return readFileSync(join(here, name), "utf8");
}

function readRepo(relative: string): string {
  return readFileSync(join(repoRoot, relative), "utf8");
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("TASK 64 Priority copy contract", () => {
  it("keeps the banner headline, supporting sentence, and no CONIS intro", () => {
    assert.equal(
      PRIORITY_MOTIVATION_BANNER_HEADLINE,
      "Pojďme spolu objevit, co je pro Vás skutečně podstatné.",
    );
    assert.equal(
      PRIORITY_MOTIVATION_BANNER_COPY,
      "Nastavte si priority, které pak zohledním v dalším obsahu a v PDF ke stažení.",
    );
    assert.equal(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.headline,
      PRIORITY_MOTIVATION_BANNER_HEADLINE,
    );
    assert.equal(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.description,
      PRIORITY_MOTIVATION_BANNER_COPY,
    );
    assert.equal(CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.title, "");
    const renderedBannerParts = [
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.title,
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.headline,
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.description,
    ].filter((part) => part.trim() !== "");
    assert.deepEqual(renderedBannerParts, [
      PRIORITY_MOTIVATION_BANNER_HEADLINE,
      PRIORITY_MOTIVATION_BANNER_COPY,
    ]);

    const banner = readRepo(
      "apps/client-studio/src/features/client-studio/welcome-bridge/clientStudioWelcomeBridgeConfig.ts",
    );
    const bridge = readRepo("packages/ui/src/welcome-bridge/WelcomeBridge.tsx");
    assert.equal(banner.includes("Jmenuji se CONIS"), false);
    assert.equal(banner.includes("Ptejte se, na co uznáte za vhodné"), false);
    assert.equal(banner.includes("Vaše odpovědi ovlivní další témata"), false);
    assert.equal(
      banner.includes(
        "Nastavte si priority, které zohledníme v dalším obsahu a přípravě PDF ke stažení.",
      ),
      false,
    );
    assert.match(bridge, /id="welcome-bridge-headline"/);
    assert.match(bridge, /fontWeight: 700/);
    assert.match(bridge, /id="welcome-bridge-description"/);
  });

  it("keeps the initial right-hand dialog wording and Začněme hierarchy", () => {
    assert.deepEqual([...PRIORITY_CONVERSATION_INTRO_LINES], [
      "Teď se zaměříme na vaše priority.",
    ]);
    assert.equal(PRIORITY_CONVERSATION_START_HEADING, "Začněme");
    assert.deepEqual([...PRIORITY_CONVERSATION_START_LINES], [
      "Označte alespoň tři karty a nastavte jejich intenzitu",
      "(míru důležitosti pro vás).",
      "Ukážu vám pak, co stojí za pozornost právě z tohoto pohledu.",
    ]);
    assert.equal(
      PRIORITY_CONVERSATION_START_LINES[0].endsWith("intenzitu"),
      true,
    );
    assert.equal(PRIORITY_CONVERSATION_START_LINES[0].includes("("), false);
    assert.equal(
      PRIORITY_CONVERSATION_START_LINES[1],
      "(míru důležitosti pro vás).",
    );

    const constants = readFromHere("priorityConversation.constants.ts");
    assert.equal(
      constants.includes("Teď se zaměříme na to, co je pro vás podstatné"),
      false,
    );
    assert.equal(constants.includes("Označte alespoň tři témata"), false);
    assert.equal(
      constants.includes("Ukážu vám, co stojí za pozornost právě z jejich pohledu"),
      false,
    );

    const panel = stripComments(readFromHere("PriorityConversationPanel.tsx"));
    assert.match(panel, /PRIORITY_CONVERSATION_INTRO_LINES\.map/);
    assert.equal(panel.includes("PRIORITY_CONVERSATION_INTRO_LINES[1]"), false);
    assert.match(
      panel,
      /priority-conversation-start-block[\s\S]*PRIORITY_CONVERSATION_START_HEADING/,
    );
    assert.match(
      panel,
      /font-semibold tracking-wide text-embed-brand-gold/,
    );
    assert.match(panel, /isCloser \? '' : '!font-bold'/);
    assert.match(panel, /PRIORITY_CONVERSATION_START_LINES\.map\(\(line, index\)/);
    assert.equal(panel.includes("PRIORITY_CONVERSATION_START_LINES.join"), false);
    assert.equal(panel.includes("<br"), false);
  });

  it("preserves dynamic selected-count copy with the refined second sentence", () => {
    assert.deepEqual([...PRIORITY_CONVERSATION_GATE_LINES], [
      "Už mám první představu o tom, jak přemýšlíte.",
    ]);
    assert.equal(PRIORITY_CONVERSATION_MINIMUM, 3);
    assert.equal(
      PRIORITY_CONVERSATION_GATE_PROMPT(3),
      "Máte 3 zvolené priority. Stačí to takto, nebo chcete ještě něco upravit?",
    );
    assert.equal(
      PRIORITY_CONVERSATION_GATE_PROMPT(4),
      "Máte 4 zvolené priority. Stačí to takto, nebo chcete ještě něco upravit?",
    );
    assert.match(PRIORITY_CONVERSATION_GATE_PROMPT(5), /zvolených priorit/);
    assert.match(PRIORITY_CONVERSATION_GATE_PROMPT(1), /zvolenou prioritu/);
    assert.equal(
      PRIORITY_CONVERSATION_GATE_PROMPT(3).includes("chcete ještě něco upravit?"),
      true,
    );

    const constants = readFromHere("priorityConversation.constants.ts");
    assert.equal(constants.includes("chcete ještě něco doplnit?"), false);
    assert.equal(constants.includes("Stačí nám to takto"), false);
    assert.match(constants, /PRIORITY_CONVERSATION_GATE_PROMPT = \(count: number\)/);

    const panel = stripComments(readFromHere("PriorityConversationPanel.tsx"));
    assert.match(panel, /PRIORITY_CONVERSATION_GATE_PROMPT\(selectedCount\)/);
  });

  it("removes the later sentence without bypassing the complete-state continue path", () => {
    assert.deepEqual([...PRIORITY_CONVERSATION_COMPLETE_PANEL_LINES], [
      "Teď už vím, na co se u tohoto domu společně podívat.",
    ]);
    assert.equal(
      PRIORITY_CONVERSATION_COMPLETE_PANEL_LINES.includes(
        "Teď vám ukážu, co pro vás může znamenat.",
      ),
      false,
    );

    const constants = readFromHere("priorityConversation.constants.ts");
    assert.equal(
      constants.includes("Teď vám ukážu, co pro vás může znamenat."),
      false,
    );

    const panel = stripComments(readFromHere("PriorityConversationPanel.tsx"));
    assert.match(panel, /phase === 'complete'/);
    assert.match(panel, /PRIORITY_CONVERSATION_COMPLETE_PANEL_LINES\.map/);
    assert.match(panel, /priority-conversation-revisit-continue/);
    assert.match(panel, /onClick=\{continueToSummary\}/);

    const hook = stripComments(readFromHere("usePriorityConversation.ts"));
    assert.match(hook, /return 'complete'/);
    assert.match(hook, /const continueToSummary/);
    assert.match(hook, /phase !== 'complete' \|\| isAdvancing/);
    assert.match(hook, /PRIORITY_BRIDGE_ANCHOR_ID/);
  });

  it("feeds Embed and Workspace from the same Client Studio Priority copy", () => {
    const page = readRepo(
      "apps/client-studio/src/features/client-studio/ClientStudioPage.tsx",
    );
    const launch = readRepo("packages/embed/src/delivery/launchExperience.ts");
    const workspace = readRepo(
      "apps/client-studio/src/features/client-studio/foundation/workspaceHostEntry.test.ts",
    );
    assert.match(page, /CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG/);
    assert.match(page, /<PriorityEngine/);
    assert.match(launch, /mountClientStudio/);
    assert.match(workspace, /CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG/);
    assert.equal(launch.includes("Jmenuji se CONIS"), false);
    assert.equal(launch.includes("Označte alespoň tři témata"), false);
  });

  it("updates Priority→Racio transition copy without changing navigation", () => {
    const racioBridge = readFromHere("PriorityRacioBridge.tsx");
    const engine = stripComments(readFromHere("PriorityEngine.tsx"));
    const page = readRepo(
      "apps/client-studio/src/features/client-studio/ClientStudioPage.tsx",
    );

    assert.match(
      racioBridge,
      /Teď přejdeme k častým otázkám a možnosti chat diskuse\./,
    );
    assert.equal(
      racioBridge.includes(
        "Teď se podíváme také na racionální stránku domu a jeho kompromisy.",
      ),
      false,
    );
    assert.match(racioBridge, /data-testid="priority-racio-bridge-continue"/);
    assert.match(racioBridge, /onClick=\{onContinue\}/);
    assert.match(racioBridge, /Pokračovat →/);
    assert.match(engine, /onContinueToRacio/);
    assert.match(engine, /<PriorityRacioBridge onContinue=\{onContinueToRacio\} \/>/);
    assert.match(page, /onContinueToRacio=\{\(\) => \{/);
    assert.match(page, /enterScene\(scenes\[2\]!\.id\)/);
    assert.match(page, /<AIAdvisor \/>/);
  });
});
