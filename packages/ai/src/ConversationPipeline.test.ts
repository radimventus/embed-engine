/**
 * PT-011 — End-to-end conversation pipeline via AIService.sendMessage.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatRequest } from "./models/ChatRequest";
import type { ChatResponse } from "./models/ChatResponse";
import type { LLMProvider } from "./providers/LLMProvider";
import { MockProvider } from "./providers/MockProvider";
import { createAIService } from "./services/AIService";
import { ConversationError } from "./services/ConversationError";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function sampleDecision(): DecisionContext {
  return {
    headline: "Nejvyšší prioritu má bydlení s dětmi.",
    summary: "Rodina a rozpočet.",
    focusPriority: "family",
    secondaryPriority: "budget",
    selectedPriorities: ["family", "budget"],
    recommendations: ["Dispozice pro rodinu", "Celkové náklady"],
  };
}

/** Records prompt memory for assertions; replies with fixed content. */
class RecordingProvider implements LLMProvider {
  readonly requests: ChatRequest[] = [];
  reply = "Doporučuji dům vhodný pro rodinu s dětmi v daném rozpočtu.";

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.requests.push(request);
    return {
      content: this.reply,
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      finishReason: "stop",
    };
  }
}

describe("PT-011 AIService conversation pipeline", () => {
  it("runs Analyzer → Memory → ResolvedMemory → Prompt → reply", async () => {
    const provider = new RecordingProvider();
    const service = createAIService(provider, {
      sessionId: "pilot-sess-1",
      analyzer: undefined,
    });

    // Force deterministic extraction (Mock JSON fails → fallback).
    // RecordingProvider returns non-JSON → analyzer falls back deterministically.
    await service.sendMessage({
      message: "Máme dvě děti.",
      decision: sampleDecision(),
    });
    await service.sendMessage({
      message: "Rozpočet je 6,5 milionu.",
      decision: sampleDecision(),
    });
    await service.sendMessage({
      message: "Nechceme tepelné čerpadlo.",
      decision: sampleDecision(),
    });
    const last = await service.sendMessage({
      message: "Jaký dům nám doporučíš?",
      decision: sampleDecision(),
    });

    assert.equal(last.content, provider.reply);
    assert.ok(last.memory.facts.some((f) => f.key === "familySize"));
    assert.ok(last.memory.constraints.some((c) => c.key === "budget"));
    assert.ok(
      last.memory.rejectedOptions.some((r) => r.key === "heating"),
    );

    const resolved = last.resolvedMemory;
    assert.equal(
      resolved.constraints.find((c) => c.key === "budget")?.value,
      6_500_000,
    );
    assert.ok(resolved.rejectedOptions.some((r) => r.key === "heating"));
    assert.equal(resolved.acceptedOptions.length, 0);

    // Prompt for recommendation turn must carry resolved memory in system transport.
    const recommendRequest = provider.requests[provider.requests.length - 1]!;
    assert.match(recommendRequest.systemPrompt.content, /6500000|6.?500.?000|budget/i);
    assert.match(
      recommendRequest.systemPrompt.content,
      /heat-pump|heating|Rejected Options/i,
    );
    assert.match(recommendRequest.systemPrompt.content, /familySize|4/);
  });

  it("keeps history and flips ResolvedMemory on opinion change", async () => {
    const provider = new RecordingProvider();
    const service = createAIService(provider, { sessionId: "pilot-sess-2" });

    await service.sendMessage({
      message: "Nechceme tepelné čerpadlo.",
      decision: sampleDecision(),
    });

    const afterReject = service.getResolvedMemory();
    assert.ok(afterReject.rejectedOptions.some((r) => r.key === "heating"));
    assert.equal(afterReject.acceptedOptions.length, 0);

    await service.sendMessage({
      message: "Vlastně nám nevadí.",
      decision: sampleDecision(),
    });

    const history = service.getMemory();
    assert.ok(history.rejectedOptions.some((r) => r.key === "heating"));
    assert.ok(history.acceptedOptions.some((r) => r.key === "heating"));

    const resolved = service.getResolvedMemory();
    assert.ok(resolved.acceptedOptions.some((r) => r.key === "heating"));
    assert.equal(resolved.rejectedOptions.length, 0);
  });

  it("maps missing API key style errors without crashing", async () => {
    const provider: LLMProvider = {
      async chat() {
        throw new Error(
          "OpenAIProvider: missing API key. Set OPENAI_API_KEY or pass apiKey.",
        );
      },
    };
    const service = createAIService(provider, {
      analyzer: {
        analyze: async () => ({
          facts: [],
          preferences: [],
          constraints: [],
          goals: [],
          concerns: [],
          rejectedOptions: [],
          acceptedOptions: [],
          confidence: 0,
        }),
      },
    });

    await assert.rejects(
      () =>
        service.sendMessage({
          message: "Ahoj",
          decision: sampleDecision(),
        }),
      (error: unknown) => {
        assert.ok(error instanceof ConversationError);
        assert.equal(error.code, "missing_api_key");
        assert.ok(error.userMessage.length > 0);
        return true;
      },
    );
  });

  it("rejects empty invalid provider content", async () => {
    const provider: LLMProvider = {
      async chat() {
        return {
          content: "   ",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          finishReason: "stop",
        };
      },
    };
    const service = createAIService(provider, {
      analyzer: {
        analyze: async () => ({
          facts: [],
          preferences: [],
          constraints: [],
          goals: [],
          concerns: [],
          rejectedOptions: [],
          acceptedOptions: [],
          confidence: 0,
        }),
      },
    });

    await assert.rejects(
      () =>
        service.sendMessage({
          message: "Ahoj",
          decision: sampleDecision(),
        }),
      (error: unknown) => {
        assert.ok(error instanceof ConversationError);
        assert.equal(error.code, "invalid_response");
        return true;
      },
    );
  });
});

describe("PT-011 Architecture Validation", () => {
  it("Chat UI must not import Provider; AIService owns pipeline", () => {
    const advisor = readFileSync(
      join(
        ROOT,
        "../..",
        "apps/client-studio/src/features/client-studio/sections/AIAdvisor/AIAdvisor.tsx",
      ),
      "utf8",
    );
    const bootstrap = readFileSync(
      join(
        ROOT,
        "../..",
        "apps/client-studio/src/features/client-studio/sections/AIAdvisor/embedAIService.ts",
      ),
      "utf8",
    );

    assert.doesNotMatch(advisor, /OpenAIProvider/);
    assert.doesNotMatch(advisor, /createAnalyzerProvider|DecisionMemoryService|resolveMemory/);
    assert.match(advisor, /getEmbedAIService|AIService|sendMessage/);
    assert.match(bootstrap, /createAIServiceFromDelivery|createAIService/);
    assert.match(bootstrap, /createEmbedAIDelivery/);
    assert.doesNotMatch(bootstrap, /OpenAIProvider/);
  });

  it("AIService Runtime must not import OpenAI Adapter", () => {
    const source = readFileSync(
      join(ROOT, "src/services/AIService.ts"),
      "utf8",
    );
    assert.doesNotMatch(source, /OpenAIProvider|OpenAIAdapter/);
    assert.doesNotMatch(source, /from "\.\.\/providers\/OpenAI/);
    assert.doesNotMatch(source, /from "\.\.\/adapter\/openai/);
    assert.match(source, /AIDelivery|delivery\.chat/);
  });

  it("Delivery must not import OpenAI Adapter", () => {
    const deliveryIndex = readFileSync(
      join(ROOT, "src/delivery/index.ts"),
      "utf8",
    );
    const direct = readFileSync(
      join(ROOT, "src/delivery/DirectAdapterDelivery.ts"),
      "utf8",
    );
    const port = readFileSync(join(ROOT, "src/delivery/AIDelivery.ts"), "utf8");
    for (const source of [deliveryIndex, direct, port]) {
      assert.doesNotMatch(
        source,
        /from\s+["'][^"']*openai|OpenAIAdapter|OpenAIProvider|OPENAI_|api\.openai\.com/i,
      );
    }
  });

  it("AIService source wires Analyzer + Memory + PromptBuilder", () => {
    const source = readFileSync(
      join(ROOT, "src/services/AIService.ts"),
      "utf8",
    );
    assert.match(source, /analyzer\.analyze/);
    assert.match(source, /memoryService\.update/);
    assert.match(source, /promptBuilder\.build/);
    assert.match(source, /chatWithPackage/);
    assert.match(source, /resolveMemory/);
  });

  it("MockProvider path still works for transport-only chat", async () => {
    const service = createAIService(new MockProvider());
    const result = await service.sendMessage({
      message: "ping",
      decision: sampleDecision(),
    });
    assert.match(result.content, /Mock Response/);
  });
});
