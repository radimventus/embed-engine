import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatRequest } from "./models/ChatRequest";
import type { ChatResponse } from "./models/ChatResponse";
import { createSystemPrompt } from "./models/SystemPrompt";
import { emptyKnowledgeContext } from "./prompt/models/KnowledgeContext";
import { emptyResolvedMemory } from "./memory/models/ResolvedMemory";
import type { LLMProvider } from "./providers/LLMProvider";
import { MockProvider } from "./providers/MockProvider";
import { createAIService } from "./services/AIService";

function sampleRequest(): ChatRequest {
  const decision: DecisionContext = {
    headline: "Nejvyšší prioritu má design.",
    summary: "Forma a materiály.",
    focusPriority: "design",
    secondaryPriority: null,
    selectedPriorities: ["design"],
    recommendations: ["Materiály a povrchy"],
  };

  return {
    sessionId: "session-ai-1",
    systemPrompt: createSystemPrompt("System"),
    context: {
      decision,
      object: {
        objectId: null,
        reference: null,
        title: null,
        attributes: {},
        knowledge: emptyKnowledgeContext(),
        mediaReferences: [],
      },
      conversation: {
        sessionId: "session-ai-1",
        turnCount: 0,
        recentMessages: [],
      },
      memory: emptyResolvedMemory(),
      knowledge: emptyKnowledgeContext(),
    },
    messages: [{ role: "user", content: "Jaké jsou provozní náklady?" }],
  };
}

/** Alternate provider — proves AIService is provider-agnostic. */
class StubProvider implements LLMProvider {
  readonly calls: ChatRequest[] = [];

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.calls.push(request);
    return {
      content: "stub-reply",
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      finishReason: "stop",
    };
  }
}

describe("PT-004 AIService", () => {
  it("chat delegates to registered MockProvider", async () => {
    const mock = new MockProvider();
    const service = createAIService(mock);
    const response = await service.chat(sampleRequest());

    assert.match(response.content, /\[Mock Response\]/);
    assert.equal(response.finishReason, "mock");
    assert.equal(service.getProvider(), mock);
  });

  it("swapping provider does not require AIService changes", async () => {
    const service = createAIService(new MockProvider());
    const stub = new StubProvider();
    service.setProvider(stub);

    const response = await service.chat(sampleRequest());
    assert.equal(response.content, "stub-reply");
    assert.equal(response.finishReason, "stop");
    assert.equal(stub.calls.length, 1);
    assert.equal(stub.calls[0]?.sessionId, "session-ai-1");
  });
});
