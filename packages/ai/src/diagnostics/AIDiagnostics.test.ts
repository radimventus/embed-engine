/**
 * PT-012 — AI diagnostics observability tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import type { LLMProvider } from "../providers/LLMProvider";
import { MockProvider } from "../providers/MockProvider";
import { createAIService } from "../services/AIService";
import { ConversationError } from "../services/ConversationError";
import {
  createAIDiagnostics,
  createDisabledDiagnostics,
  type DiagnosticEvent,
} from "./index";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function sampleDecision(): DecisionContext {
  return {
    headline: "Nejvyšší prioritu má bydlení s dětmi.",
    summary: "Rodina a rozpočet.",
    focusPriority: "family",
    secondaryPriority: "budget",
    selectedPriorities: ["family", "budget"],
    recommendations: ["Dispozice pro rodinu"],
  };
}

describe("PT-012 AI Diagnostics", () => {
  it("records a full turn trace with latencies, tokens, and memory counts", async () => {
    const events: DiagnosticEvent[] = [];
    const diagnostics = createAIDiagnostics({
      enabled: true,
      listener: (event) => {
        events.push(event);
      },
    });

    const service = createAIService(new MockProvider(), {
      sessionId: "diag-sess-1",
      diagnostics,
    });

    const result = await service.sendMessage({
      message: "Máme dvě děti. Rozpočet je 6,5 milionu.",
      decision: sampleDecision(),
    });

    assert.ok(result.messageId);
    assert.equal(diagnostics.getTraces().length, 1);

    const trace = diagnostics.getLastTrace();
    assert.ok(trace);
    assert.equal(trace.conversation.sessionId, "diag-sess-1");
    assert.equal(trace.conversation.messageId, result.messageId);
    assert.equal(trace.ok, true);
    assert.equal(trace.errorCode, null);

    assert.ok(trace.latency.totalMs >= 0);
    assert.ok(trace.latency.analyzerMs >= 0);
    assert.ok(trace.latency.memoryMs >= 0);
    assert.ok(trace.latency.resolutionMs >= 0);
    assert.ok(trace.latency.promptBuilderMs >= 0);
    assert.ok(trace.latency.providerMs >= 0);

    assert.ok(trace.prompt);
    assert.ok(trace.prompt.sectionCount > 0);
    assert.ok(trace.prompt.packageChars > 0);
    assert.ok(trace.prompt.memoryContextChars > 0);

    assert.ok(trace.tokens);
    assert.ok(trace.tokens.totalTokens > 0);

    assert.ok(trace.memory);
    assert.ok(trace.memory.facts >= 1);
    assert.ok(trace.memory.constraints >= 1);
    assert.ok(trace.memory.activeItems >= 1);

    assert.ok(trace.provider);
    assert.equal(trace.provider.providerId, "mock");
    assert.equal(trace.provider.errorCode, null);

    assert.ok(events.some((e) => e.kind === "phase" && e.phase === "analyzer"));
    assert.ok(events.some((e) => e.kind === "phase" && e.phase === "provider"));
    assert.ok(events.some((e) => e.kind === "turn"));
  });

  it("can be completely disabled with zero events", async () => {
    const events: DiagnosticEvent[] = [];
    const diagnostics = createDisabledDiagnostics();
    // Listener on disabled instance must never fire — wrap via enabled false.
    const wrapped = createAIDiagnostics({
      enabled: false,
      listener: (event) => {
        events.push(event);
      },
    });

    const service = createAIService(new MockProvider(), {
      diagnostics: wrapped,
    });

    await service.sendMessage({
      message: "Ahoj",
      decision: sampleDecision(),
    });

    assert.equal(events.length, 0);
    assert.equal(wrapped.getTraces().length, 0);
    assert.equal(diagnostics.isEnabled(), false);
  });

  it("records provider error diagnostics without changing throw behavior", async () => {
    const provider: LLMProvider = {
      async chat(_request: ChatRequest): Promise<ChatResponse> {
        throw new Error("HTTP 500 upstream failure");
      },
    };

    const diagnostics = createAIDiagnostics({ enabled: true });
    const service = createAIService(provider, {
      diagnostics,
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
        return true;
      },
    );

    const trace = diagnostics.getLastTrace();
    assert.ok(trace);
    assert.equal(trace.ok, false);
    assert.ok(trace.errorCode === "http_error" || trace.errorCode === "provider_error");
    assert.ok(trace.provider?.errorCode);
  });

  it("does not mutate DecisionMemory relative to disabled path", async () => {
    const withDiag = createAIService(new MockProvider(), {
      sessionId: "mem-a",
      diagnostics: createAIDiagnostics({ enabled: true }),
    });
    const withoutDiag = createAIService(new MockProvider(), {
      sessionId: "mem-b",
      diagnostics: false,
    });

    const message = "Nechceme tepelné čerpadlo.";
    await withDiag.sendMessage({ message, decision: sampleDecision() });
    await withoutDiag.sendMessage({ message, decision: sampleDecision() });

    const a = withDiag.getMemory();
    const b = withoutDiag.getMemory();
    assert.equal(a.rejectedOptions.length, b.rejectedOptions.length);
    assert.equal(a.rejectedOptions[0]?.key, b.rejectedOptions[0]?.key);
    assert.equal(a.rejectedOptions[0]?.value, b.rejectedOptions[0]?.value);
  });
});

describe("PT-012 Architecture Validation", () => {
  it("PromptBuilder and OpenAIProvider do not import diagnostics", () => {
    const promptBuilder = readFileSync(
      join(PACKAGE_ROOT, "src/prompt/PromptBuilder.ts"),
      "utf8",
    );
    const provider = readFileSync(
      join(PACKAGE_ROOT, "src/providers/OpenAIProvider.ts"),
      "utf8",
    );
    const memory = readFileSync(
      join(PACKAGE_ROOT, "src/memory/DecisionMemoryService.ts"),
      "utf8",
    );

    assert.doesNotMatch(promptBuilder, /diagnostics/);
    assert.doesNotMatch(provider, /diagnostics/);
    assert.doesNotMatch(memory, /diagnostics/);
  });

  it("AIService owns optional diagnostics wiring", () => {
    const source = readFileSync(
      join(PACKAGE_ROOT, "src/services/AIService.ts"),
      "utf8",
    );
    assert.match(source, /diagnostics/);
    assert.match(source, /emitPhase|emitTurn/);
    assert.match(source, /createDisabledDiagnostics|diagnostics === false/);
  });
});
