import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { decisionTopicChatPrompt } from "./decisionTopicChatBridge";

const advisor = readFileSync(
  new URL("./AIAdvisor.tsx", import.meta.url),
  "utf8",
);
const relationships = readFileSync(
  new URL("../PriorityEngine/PriorityRelationships.tsx", import.meta.url),
  "utf8",
);

test("Decision Topic CTA transfers a client-visible topic prompt to the existing chat", () => {
  assert.equal(
    decisionTopicChatPrompt("  Propojení domu se zahradou  "),
    "Co bych měl vědět k tématu „Propojení domu se zahradou“?",
  );
  assert.match(relationships, /Zeptat se CONIS/);
  assert.match(
    relationships,
    /const detail = \{ houseId: bundle\.houseId, topicTitle: topicEntry\?\.answer \?\? bundle\.title \}/,
  );
  assert.ok(
    relationships.indexOf('navigateToJourneySection(PILOT_SECTION_IDS.aiAdvisor)') <
      relationships.indexOf('openDecisionTopicInChat(detail)'),
  );
  assert.match(
    advisor,
    /setInputValue\(decisionTopicChatPrompt\(detail\.topicTitle\)\)/,
  );
});

test("topic handoff is house-scoped while chat retrieval remains full canonical truth", () => {
  assert.match(
    advisor,
    /detail\.houseId !== chatHouseKnowledge\?\.canonicalHouseId/,
  );
  assert.match(advisor, /canonicalHouseKnowledgeEntries\(chatHouseKnowledge,/);
  assert.doesNotMatch(
    advisor,
    /canonicalHouseKnowledgeEntries\([^)]*topicTitle/,
  );
  assert.match(relationships, /item\.houseId === active\.houseId/);
});
