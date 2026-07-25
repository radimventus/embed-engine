import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DecisionContext } from "@embed-engine/runtime";

import { createAIService } from "../services/AIService";
import { MockProvider } from "../providers/MockProvider";
import {
  createPromptBuilder,
  promptPackageToChatRequest,
} from "./PromptBuilder";
import { PROMPT_SECTION_ORDER } from "./models/PromptPackage";
import { DEFAULT_SYSTEM_PROMPT_LINES } from "./SystemPromptFactory";

function sampleDecision(): DecisionContext {
  return {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary:
      "Během celé Experience budeme zvýrazňovat informace související s energetickou efektivitou.",
    focusPriority: "energy",
    secondaryPriority: "layout",
    selectedPriorities: ["energy", "layout", "privacy"],
    recommendations: [
      "Energetický standard",
      "Technologie vytápění",
      "Roční provozní náklady",
    ],
  };
}

describe("PT-005 Prompt Builder", () => {
  it("builds PromptPackage with mandatory section order", () => {
    const builder = createPromptBuilder();
    const promptPackage = builder.build({
      sessionId: "sess-1",
      decision: sampleDecision(),
      object: {
        objectId: "obj-1",
        reference: "ASTAV-M01",
        title: "Reference house",
        attributes: { energyClass: "A", usableArea: 142 },
        mediaReferences: ["media/hero.webp"],
      },
      conversationMessages: [
        { role: "user", content: "Ahoj" },
        { role: "assistant", content: "Dobrý den" },
      ],
      currentUserMessage: "Jaké jsou provozní náklady?",
    });

    assert.deepEqual(
      promptPackage.sections.map((section) => section.id),
      [...PROMPT_SECTION_ORDER],
    );
    assert.equal(
      promptPackage.systemPrompt.content,
      DEFAULT_SYSTEM_PROMPT_LINES.join("\n"),
    );
    assert.match(promptPackage.sections[0]!.content, /AI poradce partnera/);
    assert.match(promptPackage.sections[1]!.content, /Partner Identity/);
    assert.match(promptPackage.sections[2]!.content, /Object Context/);
    assert.match(promptPackage.sections[2]!.content, /ASTAV-M01/);
    assert.match(promptPackage.sections[3]!.content, /Decision Context/);
    assert.match(promptPackage.sections[3]!.content, /energy/);
    assert.match(promptPackage.sections[4]!.content, /Decision Memory/);
    assert.match(promptPackage.sections[4]!.content, /\(none\)/);
    assert.match(promptPackage.sections[5]!.content, /Recommendation Context/);
    assert.match(promptPackage.sections[6]!.content, /Conversation Context/);
    assert.equal(
      promptPackage.sections[7]!.content,
      "Jaké jsou provozní náklady?",
    );
    assert.equal(promptPackage.context.memory.facts.length, 0);
    assert.equal(
      promptPackage.messages[promptPackage.messages.length - 1]?.content,
      "Jaké jsou provozní náklady?",
    );
  });

  it("is deterministic for the same input", () => {
    const builder = createPromptBuilder();
    const input = {
      sessionId: "sess-det",
      decision: sampleDecision(),
      object: {
        attributes: { b: 2, a: 1 },
        reference: "REF",
      },
      conversationMessages: [{ role: "user" as const, content: "one" }],
      currentUserMessage: "two",
    };

    const a = builder.build(input);
    const b = builder.build(input);
    assert.deepEqual(a, b);
    assert.match(a.sections[2]!.content, /a: 1/);
    assert.match(a.sections[2]!.content, /b: 2/);
  });

  it("passes PromptPackage to MockProvider without provider-side assembly", async () => {
    const builder = createPromptBuilder();
    const promptPackage = builder.build({
      sessionId: "sess-mock",
      decision: sampleDecision(),
      object: { reference: "ASTAV-M01" },
      currentUserMessage: "Jaké jsou provozní náklady?",
    });

    const request = promptPackageToChatRequest("sess-mock", promptPackage);
    assert.match(request.systemPrompt.content, /Decision Memory/);
    assert.match(request.systemPrompt.content, /Decision Context/);
    assert.match(request.systemPrompt.content, /ASTAV-M01/);
    assert.equal(request.context, promptPackage.context);
    assert.equal(request.messages, promptPackage.messages);

    const service = createAIService(new MockProvider());
    const response = await service.chatWithPackage("sess-mock", promptPackage);
    assert.match(response.content, /\[Mock Response\]/);
    assert.match(response.content, /provozní náklady/);
    assert.equal(response.finishReason, "mock");
  });
});
