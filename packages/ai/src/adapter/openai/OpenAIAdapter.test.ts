import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatRequest } from "../../models/ChatRequest";
import { createAIService } from "../../services/AIService";
import {
  createPromptBuilder,
  promptPackageToChatRequest,
} from "../../prompt/PromptBuilder";
import { mapConversationError } from "../../services/ConversationError";
import { MockAdapter } from "../mock/MockAdapter";
import { OpenAIAdapter, OpenAIProvider } from "./OpenAIAdapter";

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

function sampleChatRequest(userContent = "hi"): ChatRequest {
  const promptPackage = createPromptBuilder().build({
    sessionId: "sess-diag",
    decision: sampleDecision(),
    currentUserMessage: userContent,
  });
  return promptPackageToChatRequest("sess-diag", promptPackage);
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

describe("CAP-AI-ADAPTER-01 OpenAI Adapter", () => {
  it("maps ChatRequest to OpenAI and returns ChatResponse", async () => {
    const provider = new OpenAIAdapter({
      apiKey: "test-key",
      model: "gpt-4o-mini",
      fetch: createFakeOpenAIFetch("OpenAI mock completion"),
    });

    const response = await provider.chat(
      sampleChatRequest("provozní náklady"),
    );
    assert.equal(response.content, "OpenAI mock completion");
    assert.equal(response.finishReason, "stop");
    assert.equal(response.usage.promptTokens, 12);
    assert.equal(response.usage.completionTokens, 8);
    assert.equal(response.usage.totalTokens, 20);
  });

  it("Provider Swap Test: MockAdapter → OpenAIAdapter without other changes", async () => {
    const request = sampleChatRequest("provozní náklady");

    const service = createAIService(new MockAdapter());
    const mockReply = await service.chat(request);
    assert.match(mockReply.content, /Mock Response/);

    const openaiService = createAIService(
      new OpenAIAdapter({
        apiKey: "test-key",
        fetch: createFakeOpenAIFetch("swapped"),
      }),
    );
    const openaiReply = await openaiService.chat(request);
    assert.equal(openaiReply.content, "swapped");
  });

  it("OpenAIProvider alias remains constructible", () => {
    const provider = new OpenAIProvider({
      apiKey: "test-key",
      fetch: createFakeOpenAIFetch("alias"),
    });
    assert.equal(provider.id, "openai");
  });

  it("surfaces HTTP failures with mapped diagnostics", async () => {
    const cases: {
      status: number;
      body: unknown;
      expected: RegExp;
    }[] = [
      {
        status: 401,
        body: { error: { message: "Incorrect API key" } },
        expected: /401 unauthorized/,
      },
      {
        status: 403,
        body: { error: { message: "Forbidden" } },
        expected: /403 forbidden/,
      },
      {
        status: 404,
        body: { error: { message: "The model does not exist" } },
        expected: /404/,
      },
      {
        status: 429,
        body: {
          error: {
            message: "You exceeded your current quota",
            code: "insufficient_quota",
            type: "insufficient_quota",
          },
        },
        expected: /insufficient_quota/,
      },
      {
        status: 429,
        body: {
          error: {
            message: "Rate limit reached",
            code: "rate_limit_exceeded",
            type: "requests",
          },
        },
        expected: /429 rate_limit/,
      },
      {
        status: 503,
        body: { error: { message: "Service unavailable" } },
        expected: /503/,
      },
    ];

    for (const testCase of cases) {
      const logs: unknown[] = [];
      const originalError = console.error;
      console.error = (...args: unknown[]) => {
        logs.push(args);
      };

      try {
        const provider = new OpenAIAdapter({
          apiKey: "test-key",
          model: "gpt-4o-mini",
          fetch: (async () =>
            new Response(JSON.stringify(testCase.body), {
              status: testCase.status,
              headers: { "content-type": "application/json" },
            })) as typeof fetch,
        });

        await assert.rejects(
          () => provider.chat(sampleChatRequest()),
          (error: unknown) => {
            assert.ok(error instanceof Error);
            assert.match(error.message, testCase.expected);
            assert.equal(/Provider error/i.test(error.message), false);
            const mapped = mapConversationError(error);
            assert.match(mapped.userMessage, testCase.expected);
            assert.equal(mapped.userMessage.includes("Provider error"), false);
            return true;
          },
        );

        assert.ok(
          logs.some(
            (entry) =>
              Array.isArray(entry) &&
              entry[0] === "OpenAIProvider: error response JSON",
          ),
          `expected JSON log for status ${testCase.status}`,
        );
      } finally {
        console.error = originalError;
      }
    }
  });

  it("maps network and timeout transport failures", async () => {
    const network = new OpenAIAdapter({
      apiKey: "test-key",
      fetch: (async () => {
        throw new TypeError("Failed to fetch");
      }) as typeof fetch,
    });
    await assert.rejects(
      () => network.chat(sampleChatRequest()),
      /network error/,
    );

    const timeout = new OpenAIAdapter({
      apiKey: "test-key",
      fetch: (async () => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        throw error;
      }) as typeof fetch,
    });
    await assert.rejects(
      () => timeout.chat(sampleChatRequest()),
      /timeout/,
    );
  });

  it("does not alter successful 200 mapping", async () => {
    const provider = new OpenAIAdapter({
      apiKey: "test-key",
      fetch: createFakeOpenAIFetch("OK reply"),
    });
    const response = await provider.chat(
      sampleChatRequest("provozní náklady"),
    );
    assert.equal(response.content, "OK reply");
    assert.equal(response.finishReason, "stop");
  });
});

describe("CAP-AI-ADAPTER-01 Boundary Validation", () => {
  it("OpenAIAdapter does not import Runtime, DecisionContext, or PromptBuilder", () => {
    const source = readFileSync(join(here, "OpenAIAdapter.ts"), "utf8");
    assert.equal(source.includes("@embed-engine/runtime"), false);
    assert.equal(/from\s+["'].*PromptBuilder/.test(source), false);
    assert.equal(/import\s+.*DecisionContext/.test(source), false);
    assert.equal(/import\s+.*DecisionStory/.test(source), false);
    assert.equal(source.includes("assemblePrompt"), false);
    assert.equal(source.includes("request.context"), false);
  });

  it("PromptBuilder, AIService, and Delivery do not contain OpenAI logic", () => {
    const srcRoot = join(here, "..", "..");
    const promptBuilder = readFileSync(
      join(srcRoot, "prompt", "PromptBuilder.ts"),
      "utf8",
    );
    const assembler = readFileSync(
      join(srcRoot, "prompt", "PromptAssembler.ts"),
      "utf8",
    );
    const aiService = readFileSync(
      join(srcRoot, "services", "AIService.ts"),
      "utf8",
    );
    const deliveryIndex = readFileSync(
      join(srcRoot, "delivery", "index.ts"),
      "utf8",
    );
    const directDelivery = readFileSync(
      join(srcRoot, "delivery", "DirectAdapterDelivery.ts"),
      "utf8",
    );

    for (const [name, source] of [
      ["PromptBuilder", promptBuilder],
      ["PromptAssembler", assembler],
      ["AIService", aiService],
      ["delivery/index", deliveryIndex],
      ["DirectAdapterDelivery", directDelivery],
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
