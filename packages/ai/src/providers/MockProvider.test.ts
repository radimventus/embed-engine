import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatRequest } from "../models/ChatRequest";
import { createSystemPrompt } from "../models/SystemPrompt";
import { emptyKnowledgeContext } from "../prompt/models/KnowledgeContext";
import { emptyResolvedMemory } from "../memory/models/ResolvedMemory";
import {
  MOCK_RESPONSE_CONTENT,
  MockProvider,
} from "./MockProvider";

function sampleRequest(userText: string): ChatRequest {
  const decision: DecisionContext = {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary: "Energetická efektivita.",
    focusPriority: "energy",
    secondaryPriority: "layout",
    selectedPriorities: ["energy", "layout", "privacy"],
    recommendations: ["Energetický standard"],
  };

  return {
    sessionId: "session-mock-1",
    systemPrompt: createSystemPrompt("You are a decision assistant."),
    context: {
      decision,
      object: {
        objectId: "obj-1",
        reference: "ASTAV-M01",
        title: "Reference house",
        attributes: {},
        knowledge: emptyKnowledgeContext(),
        mediaReferences: [],
      },
      conversation: {
        sessionId: "session-mock-1",
        turnCount: 1,
        recentMessages: [],
      },
      memory: emptyResolvedMemory(),
      knowledge: emptyKnowledgeContext(),
    },
    messages: [{ role: "user", content: userText }],
  };
}

describe("PT-004 MockProvider", () => {
  it("returns a valid ChatResponse without network", async () => {
    const provider = new MockProvider();
    const response = await provider.chat(
      sampleRequest("Jaké jsou provozní náklady?"),
    );

    assert.match(response.content, /\[Mock Response\]/);
    assert.match(response.content, /AI Provider is not connected/);
    assert.match(response.content, /provozní náklady/);
    assert.equal(response.finishReason, "mock");
    assert.ok(response.usage.totalTokens > 0);
    assert.equal(
      response.usage.totalTokens,
      response.usage.promptTokens + response.usage.completionTokens,
    );
  });

  it("allows custom mock content", async () => {
    const provider = new MockProvider({ content: "custom-mock" });
    const response = await provider.chat(sampleRequest("hello"));
    assert.match(response.content, /custom-mock/);
    assert.equal(MOCK_RESPONSE_CONTENT.includes("[Mock Response]"), true);
  });
});
