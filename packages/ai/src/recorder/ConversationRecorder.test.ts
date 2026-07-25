/**
 * PT-012 — Conversation Recorder tests.
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
  createConversationRecorder,
  createDisabledConversationRecorder,
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

describe("PT-012 Conversation Recorder", () => {
  it("records full audit snapshots and exports JSON", async () => {
    const recorder = createConversationRecorder({
      sessionId: "rec-sess-1",
      conversationId: "rec-sess-1",
    });
    const service = createAIService(new MockProvider(), {
      sessionId: "rec-sess-1",
      diagnostics: false,
      recorder,
    });

    await service.sendMessage({
      message: "Máme dvě děti.",
      decision: sampleDecision(),
    });
    await service.sendMessage({
      message: "Rozpočet je 6,5 milionu.",
      decision: sampleDecision(),
    });

    assert.equal(recorder.getRecords().length, 2);
    const last = recorder.getLastRecord();
    assert.ok(last);
    assert.equal(last.sessionId, "rec-sess-1");
    assert.ok(last.messageId.length > 0);
    assert.equal(last.userMessage, "Rozpočet je 6,5 milionu.");
    assert.ok(last.analysis);
    assert.ok(last.resolvedMemory);
    assert.ok(last.promptPackage);
    assert.equal(last.provider, "mock");
    assert.ok(typeof last.promptTokens === "number");
    assert.ok(typeof last.completionTokens === "number");
    assert.ok(last.latency >= 0);
    assert.ok(last.response && last.response.length > 0);
    assert.equal(last.error, null);

    const json = service.exportConversationJSON();
    const parsed = JSON.parse(json) as {
      sessionId: string;
      messageCount: number;
      records: { userMessage: string; promptPackage: unknown }[];
    };
    assert.equal(parsed.sessionId, "rec-sess-1");
    assert.equal(parsed.messageCount, 2);
    assert.equal(parsed.records[0]?.userMessage, "Máme dvě děti.");
    assert.ok(parsed.records[1]?.promptPackage);
  });

  it("can be completely disabled", async () => {
    const recorder = createDisabledConversationRecorder({
      sessionId: "off",
    });
    const service = createAIService(new MockProvider(), {
      diagnostics: false,
      recorder,
    });

    await service.sendMessage({
      message: "Ahoj",
      decision: sampleDecision(),
    });

    assert.equal(recorder.getRecords().length, 0);
    const exported = JSON.parse(service.exportConversationJSON()) as {
      messageCount: number;
    };
    assert.equal(exported.messageCount, 0);
  });

  it("records provider errors with partial snapshots", async () => {
    const provider: LLMProvider = {
      async chat(_request: ChatRequest): Promise<ChatResponse> {
        throw new Error("HTTP 503 unavailable");
      },
    };
    const recorder = createConversationRecorder({ sessionId: "err-sess" });
    const service = createAIService(provider, {
      sessionId: "err-sess",
      diagnostics: false,
      recorder,
      analyzer: {
        analyze: async () => ({
          facts: [{ key: "familySize", value: 4 }],
          preferences: [],
          constraints: [],
          goals: [],
          concerns: [],
          rejectedOptions: [],
          acceptedOptions: [],
          confidence: 0.8,
        }),
      },
    });

    await assert.rejects(
      () =>
        service.sendMessage({
          message: "Máme dvě děti.",
          decision: sampleDecision(),
        }),
      (error: unknown) => error instanceof ConversationError,
    );

    const record = recorder.getLastRecord();
    assert.ok(record);
    assert.equal(record.userMessage, "Máme dvě děti.");
    assert.ok(record.analysis);
    assert.ok(record.resolvedMemory);
    assert.ok(record.promptPackage);
    assert.equal(record.response, null);
    assert.ok(record.error);
  });

  it("does not change Memory relative to recorder-off path", async () => {
    const withRec = createAIService(new MockProvider(), {
      sessionId: "a",
      diagnostics: false,
      recorder: createConversationRecorder({ sessionId: "a" }),
    });
    const withoutRec = createAIService(new MockProvider(), {
      sessionId: "b",
      diagnostics: false,
      recorder: false,
    });

    const message = "Nechceme tepelné čerpadlo.";
    await withRec.sendMessage({ message, decision: sampleDecision() });
    await withoutRec.sendMessage({ message, decision: sampleDecision() });

    assert.equal(
      withRec.getMemory().rejectedOptions[0]?.value,
      withoutRec.getMemory().rejectedOptions[0]?.value,
    );
  });
});

describe("PT-012 Recorder Architecture Validation", () => {
  it("PromptBuilder, Provider, and Memory do not import recorder", () => {
    for (const relative of [
      "src/prompt/PromptBuilder.ts",
      "src/providers/OpenAIProvider.ts",
      "src/memory/DecisionMemoryService.ts",
    ]) {
      const source = readFileSync(join(PACKAGE_ROOT, relative), "utf8");
      assert.doesNotMatch(source, /recorder/i);
    }
  });

  it("AIService owns optional recorder wiring", () => {
    const source = readFileSync(
      join(PACKAGE_ROOT, "src/services/AIService.ts"),
      "utf8",
    );
    assert.match(source, /ConversationRecorder|recorder/);
    assert.match(source, /recorder === false|createDisabledConversationRecorder/);
  });
});
