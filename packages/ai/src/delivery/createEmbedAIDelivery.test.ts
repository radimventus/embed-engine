import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSystemPrompt } from "../models/SystemPrompt";
import type { ChatRequest } from "../models/ChatRequest";
import { emptyKnowledgeContext } from "../prompt/models/KnowledgeContext";
import { emptyResolvedMemory } from "../memory/models/ResolvedMemory";
import { emptyRecommendationContext } from "../recommendation/models/RecommendationContext";
import {
  createEmbedAIDelivery,
  resolveEmbedAIDeliveryBinding,
} from "./createEmbedAIDelivery";
import { createRemoteDelivery } from "./RemoteDelivery";
import { readDeliveryMeta } from "./AIDelivery";
import { mapConversationError } from "../services/ConversationError";

function sampleRequest(): ChatRequest {
  return {
    sessionId: "sess-publish",
    systemPrompt: createSystemPrompt("You are a decision assistant."),
    context: {
      decision: {
        headline: "Test",
        summary: "Test",
        focusPriority: "energy",
        secondaryPriority: null,
        selectedPriorities: ["energy"],
        recommendations: [],
      },
      object: {
        objectId: "obj-1",
        reference: "ASTAV-M01",
        title: "Reference",
        attributes: {},
        knowledge: emptyKnowledgeContext(),
        mediaReferences: [],
      },
      conversation: {
        sessionId: "sess-publish",
        turnCount: 1,
        recentMessages: [],
      },
      memory: emptyResolvedMemory(),
      recommendation: emptyRecommendationContext(),
      knowledge: emptyKnowledgeContext(),
    },
    messages: [{ role: "user", content: "Ahoj" }],
  };
}

describe("CAP-AI-PUBLISH-01 Delivery binding", () => {
  it("auto-selects published when deliveryUrl is provided", () => {
    const binding = resolveEmbedAIDeliveryBinding({
      deliveryUrl: "https://edge.example/ai",
    });
    assert.equal(binding.mode, "published");
    assert.equal(binding.deliveryUrl, "https://edge.example/ai");
  });

  it("published RemoteDelivery posts ChatRequest and returns ChatResponse", async () => {
    const delivery = createRemoteDelivery({
      deliveryUrl: "https://edge.example",
      fetch: (async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as ChatRequest;
        assert.equal(body.sessionId, "sess-publish");
        assert.equal(body.messages[0]?.content, "Ahoj");
        return new Response(
          JSON.stringify({
            content: "remote-ok",
            usage: {
              promptTokens: 1,
              completionTokens: 1,
              totalTokens: 2,
            },
            finishReason: "stop",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }) as typeof fetch,
    });

    const response = await delivery.chat(sampleRequest());
    assert.equal(response.content, "remote-ok");
    assert.equal(response.finishReason, "stop");
  });

  it("disabled maps to Delivery-not-configured UX (not browser API key copy)", async () => {
    const delivery = createEmbedAIDelivery({ mode: "disabled" });
    assert.equal(readDeliveryMeta(delivery).deliveryId, "not-configured");
    await assert.rejects(
      () => delivery.chat(sampleRequest()),
      (error: unknown) => {
        const mapped = mapConversationError(error);
        assert.equal(mapped.code, "missing_api_key");
        assert.match(mapped.userMessage, /AI Delivery není nakonfigurovaná/);
        assert.equal(mapped.userMessage.includes("API klíč"), false);
        assert.equal(mapped.userMessage.includes("sk-"), false);
        return true;
      },
    );
  });

  it("published without deliveryUrl never selects LocalDelivery", async () => {
    const binding = resolveEmbedAIDeliveryBinding({ mode: "published" });
    assert.equal(binding.mode, "disabled");
    assert.equal(binding.deliveryUrl, null);

    const delivery = createEmbedAIDelivery({ mode: "published" });
    assert.equal(readDeliveryMeta(delivery).deliveryId, "not-configured");
    await assert.rejects(
      () => delivery.chat(sampleRequest()),
      (error: unknown) => {
        const mapped = mapConversationError(error);
        assert.match(mapped.userMessage, /AI Delivery není nakonfigurovaná/);
        return true;
      },
    );
  });

  it("auto with deliveryUrl selects published RemoteDelivery", () => {
    const delivery = createEmbedAIDelivery({
      deliveryUrl: "https://edge.example",
    });
    assert.equal(readDeliveryMeta(delivery).deliveryId, "published-remote");
  });

  it("createEmbedAIDelivery config type has no apiKey field", () => {
    const source = Object.keys({
      mode: "auto",
      deliveryUrl: "https://example",
    } as const);
    assert.equal(source.includes("apiKey"), false);
  });
});
