import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import type { LLMProvider } from "../providers/LLMProvider";
import {
  emptyDecisionMemory,
  mergeDecisionMemory,
} from "../prompt/models/DecisionMemory";
import { createAnalysisService } from "./AnalysisService";
import { createConversationAnalyzer } from "./ConversationAnalyzer";
import { deterministicAnalyze } from "./deterministicFallback";
import { createAnalyzerProvider } from "./providers/AnalyzerProvider";

const here = dirname(fileURLToPath(import.meta.url));

const SAMPLE_MESSAGE =
  "Máme dvě děti a nechceme tepelné čerpadlo. Rozpočet je maximálně 6,5 milionu.";

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

class JsonLlmProvider implements LLMProvider {
  constructor(private readonly content: string) {}

  async chat(_request: ChatRequest): Promise<ChatResponse> {
    return {
      content: this.content,
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      finishReason: "stop",
    };
  }
}

describe("PT-007 Conversation Analyzer", () => {
  it("deterministic fallback extracts facts, constraints, rejected options", () => {
    const result = deterministicAnalyze(SAMPLE_MESSAGE);

    assert.deepEqual(result.facts, [{ key: "familySize", value: 4 }]);
    assert.deepEqual(result.constraints, [{ key: "budget", value: 6_500_000 }]);
    assert.deepEqual(result.rejectedOptions, [
      { key: "heating", value: "heat-pump" },
    ]);
    assert.ok(result.confidence > 0);
    assert.equal(result.preferences.length, 0);
  });

  it("AnalysisService merges AnalysisResult into DecisionMemory without overwrite", async () => {
    const analyzer = createConversationAnalyzer(
      createAnalyzerProvider({
        llm: new JsonLlmProvider("not-json"),
        deterministicOnly: true,
      }),
    );
    const service = createAnalysisService(analyzer);

    const first = await service.analyzeAndMerge(
      { message: SAMPLE_MESSAGE, decision: sampleDecision() },
      emptyDecisionMemory(),
    );

    assert.deepEqual(first.result.facts, [{ key: "familySize", value: 4 }]);
    assert.equal(first.memory.facts.length, 1);
    assert.equal(first.memory.constraints[0]?.value, 6_500_000);
    assert.equal(first.memory.rejectedOptions[0]?.value, "heat-pump");

    const second = await service.analyzeAndMerge(
      {
        message: "Rozpočet je maximálně 7 milionů.",
        decision: sampleDecision(),
      },
      first.memory,
    );

    // Existing budget key is preserved (merge does not overwrite).
    assert.equal(second.memory.constraints[0]?.value, 6_500_000);
    assert.equal(second.memory.facts[0]?.value, 4);
  });

  it("LLM JSON path is normalized into AnalysisResult", async () => {
    const llmPayload = JSON.stringify({
      facts: [{ key: "familySize", value: 4 }],
      preferences: [],
      constraints: [{ key: "budget", value: 6500000 }],
      goals: [],
      concerns: [],
      rejectedOptions: [{ key: "heating", value: "heat-pump" }],
      acceptedOptions: [],
      confidence: 0.91,
    });

    const service = createAnalysisService(
      createConversationAnalyzer(
        createAnalyzerProvider({ llm: new JsonLlmProvider(llmPayload) }),
      ),
    );

    const result = await service.analyze({
      message: SAMPLE_MESSAGE,
      decision: sampleDecision(),
    });

    assert.equal(result.confidence, 0.91);
    assert.deepEqual(result.facts, [{ key: "familySize", value: 4 }]);
    assert.deepEqual(result.constraints, [{ key: "budget", value: 6500000 }]);
  });

  it("mergeDecisionMemory only appends new keys", () => {
    const base = mergeDecisionMemory(emptyDecisionMemory(), {
      facts: [{ key: "familySize", value: 4 }],
    });
    const merged = mergeDecisionMemory(base, {
      facts: [{ key: "familySize", value: 5 }],
      preferences: [{ key: "style", value: "modern" }],
    });
    assert.deepEqual(merged.facts, [{ key: "familySize", value: 4 }]);
    assert.deepEqual(merged.preferences, [{ key: "style", value: "modern" }]);
  });
});

describe("PT-007 Architecture Validation", () => {
  it("analyzer sources do not answer users or mutate Runtime", () => {
    const files = readdirSync(here).flatMap((name) => {
      const path = join(here, name);
      if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
        return [path];
      }
      if (name === "providers" || name === "models") {
        return readdirSync(path)
          .filter((child) => child.endsWith(".ts") && !child.endsWith(".test.ts"))
          .map((child) => join(path, child));
      }
      return [];
    });

    assert.ok(files.length > 0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.equal(
        source.includes("@embed-engine/runtime"),
        file.endsWith("AnalysisRequest.ts"),
        `${file}: only AnalysisRequest may import DecisionContext type from runtime`,
      );
      assert.equal(source.includes("dispatch("), false, `${file} mutates Runtime`);
      assert.equal(
        source.includes("createDecisionSession"),
        false,
        `${file} creates Runtime session`,
      );
      assert.equal(
        /odpověz uživateli|reply to the user|chatbot/i.test(source),
        false,
        `${file} must not instruct user-facing replies`,
      );
    }
  });

  it("AnalysisResult is structured only (no free-text reply field)", () => {
    const source = readFileSync(
      join(here, "models", "AnalysisRequest.ts"),
      "utf8",
    );
    assert.match(source, /facts/);
    assert.match(source, /confidence/);
    assert.equal(source.includes("reply:"), false);
    assert.equal(source.includes("answer:"), false);
    assert.equal(source.includes("content:"), false);
  });
});
