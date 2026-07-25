import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createAIServiceFromDelivery, createEmbedAIDelivery } from "@embed-engine/ai";
import type { DecisionContext } from "@embed-engine/runtime";

import { startAiDeliveryEdge } from "./server";

function sampleDecision(): DecisionContext {
  return {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary: "Energetická efektivita.",
    focusPriority: "energy",
    secondaryPriority: "layout",
    selectedPriorities: ["energy", "layout", "privacy"],
    recommendations: ["Energetický standard"],
  };
}

describe("CAP-AI-PUBLISH-01 published end-to-end", () => {
  it("Published Delivery path: Experience-free bootstrap → edge → reply", async () => {
    const edge = await startAiDeliveryEdge({
      port: 0,
      chat: async () =>
        Object.freeze({
          content: "published-edge-reply",
          usage: Object.freeze({
            promptTokens: 3,
            completionTokens: 2,
            totalTokens: 5,
          }),
          finishReason: "stop" as const,
        }),
    });

    try {
      const delivery = createEmbedAIDelivery({
        mode: "published",
        deliveryUrl: edge.url,
      });
      const service = createAIServiceFromDelivery(delivery, {
        sessionId: "publish-e2e",
        diagnostics: false,
        recorder: false,
      });

      const result = await service.sendMessage({
        message: "Jaké jsou provozní náklady?",
        decision: sampleDecision(),
      });

      assert.equal(result.content, "published-edge-reply");
    } finally {
      await edge.close();
    }
  });
});
