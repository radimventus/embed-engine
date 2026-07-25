import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import { createAIService } from "../services/AIService";
import { createPromptBuilder } from "../prompt/PromptBuilder";
import { MockProvider } from "./MockProvider";
import { OpenAIProvider } from "./OpenAIProvider";

const here = dirname(fileURLToPath(import.meta.url));

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

function createFakeOpenAIFetch(content: string): typeof fetch {
  return (async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      messages?: { role: string; content: string }[];
    };
    assert.ok(Array.isArray(body.messages));
    assert.equal(body.messages?.[0]?.role, "system");
    assert.ok(
      body.messages?.some(
        (message) =>
          message.role === "user" &&
          message.content.includes("provozní náklady"),
      ),
    );

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: { content },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 8,
          total_tokens: 20,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;
}

describe("PT-006 OpenAI Provider", () => {
  it("maps ChatRequest to OpenAI and returns ChatResponse", async () => {
    const provider = new OpenAIProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
      fetch: createFakeOpenAIFetch("OpenAI mock completion"),
    });

    const promptPackage = createPromptBuilder().build({
      sessionId: "sess-openai",
      decision: sampleDecision(),
      object: { reference: "ASTAV-M01" },
      currentUserMessage: "Jaké jsou provozní náklady?",
    });

    const service = createAIService(provider);
    const response = await service.chatWithPackage(
      "sess-openai",
      promptPackage,
    );

    assert.equal(response.content, "OpenAI mock completion");
    assert.equal(response.finishReason, "stop");
    assert.equal(response.usage.totalTokens, 20);
  });

  it("Provider Swap Test: MockProvider → OpenAIProvider without other changes", async () => {
    const question = "Jaké jsou provozní náklady?";
    const promptPackage = createPromptBuilder().build({
      sessionId: "sess-swap",
      decision: sampleDecision(),
      currentUserMessage: question,
    });

    const service = createAIService(new MockProvider());
    const mockResponse = await service.chatWithPackage(
      "sess-swap",
      promptPackage,
    );
    assert.match(mockResponse.content, /\[Mock Response\]/);

    service.setProvider(
      new OpenAIProvider({
        apiKey: "test-key",
        fetch: createFakeOpenAIFetch("Swapped OpenAI reply"),
      }),
    );

    const openAiResponse = await service.chatWithPackage(
      "sess-swap",
      promptPackage,
    );
    assert.equal(openAiResponse.content, "Swapped OpenAI reply");
    assert.equal(openAiResponse.finishReason, "stop");
  });
});

describe("PT-006 Boundary Validation", () => {
  it("OpenAIProvider does not import Runtime, DecisionContext, or PromptBuilder", () => {
    const source = readFileSync(join(here, "OpenAIProvider.ts"), "utf8");
    assert.equal(source.includes("@embed-engine/runtime"), false);
    assert.equal(/from\s+["'].*PromptBuilder/.test(source), false);
    assert.equal(/import\s+.*DecisionContext/.test(source), false);
    assert.equal(/import\s+.*DecisionStory/.test(source), false);
    assert.equal(source.includes("assemblePrompt"), false);
    assert.equal(source.includes("request.context"), false);
  });

  it("PromptBuilder and AIService do not contain OpenAI logic", () => {
    const promptBuilder = readFileSync(
      join(here, "..", "prompt", "PromptBuilder.ts"),
      "utf8",
    );
    const assembler = readFileSync(
      join(here, "..", "prompt", "PromptAssembler.ts"),
      "utf8",
    );
    const aiService = readFileSync(
      join(here, "..", "services", "AIService.ts"),
      "utf8",
    );

    for (const [name, source] of [
      ["PromptBuilder", promptBuilder],
      ["PromptAssembler", assembler],
      ["AIService", aiService],
    ] as const) {
      assert.equal(source.includes("OpenAI"), false, `${name} knows OpenAI`);
      assert.equal(
        source.includes("api.openai.com"),
        false,
        `${name} calls OpenAI API`,
      );
      assert.equal(
        source.includes("OPENAI_API_KEY"),
        false,
        `${name} reads OpenAI key`,
      );
    }
  });
});
