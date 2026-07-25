import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import type { LLMProvider } from "../providers/LLMProvider";
import { createAnalysisService } from "./AnalysisService";
import { createConversationAnalyzer } from "./ConversationAnalyzer";
import { deterministicAnalyze } from "./deterministicFallback";
import { createAnalyzerProvider } from "./providers/AnalyzerProvider";

const here = dirname(fileURLToPath(import.meta.url));

/** PT-007A validation scenario. */
const SAMPLE_MESSAGE =
  "Máme dvě děti. Rozpočet je 6,5 milionu. Nechceme tepelné čerpadlo.";

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

describe("PT-007A Conversation Extraction", () => {
  it("extracts fact, constraint, and rejected option from one message", async () => {
    const analyzer = createConversationAnalyzer(
      createAnalyzerProvider({
        llm: new JsonLlmProvider("not-json"),
        deterministicOnly: true,
      }),
    );

    const result = await analyzer.analyze({ message: SAMPLE_MESSAGE });

    assert.ok(result.facts.some((f) => f.key === "familySize"));
    assert.ok(
      result.constraints.some(
        (c) => c.key === "budget" && c.value === 6_500_000,
      ),
    );
    assert.ok(
      result.rejectedOptions.some(
        (o) => o.key === "heating" && o.value === "heat-pump",
      ),
    );
    assert.equal("reply" in result, false);
    assert.equal("answer" in result, false);
    assert.ok(result.confidence > 0);
  });

  it("AnalysisService returns AnalysisResult only (no Memory write)", async () => {
    const service = createAnalysisService(
      createConversationAnalyzer(
        createAnalyzerProvider({
          llm: new JsonLlmProvider("x"),
          deterministicOnly: true,
        }),
      ),
    );

    const result = await service.analyze({ message: SAMPLE_MESSAGE });
    assert.deepEqual(result.facts, [{ key: "familySize", value: 4 }]);
    assert.equal(
      Object.prototype.hasOwnProperty.call(result, "memory"),
      false,
    );
  });

  it("LLM JSON path normalizes into typed AnalysisResult", async () => {
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

    const result = await createConversationAnalyzer(
      createAnalyzerProvider({ llm: new JsonLlmProvider(llmPayload) }),
    ).analyze({ message: SAMPLE_MESSAGE });

    assert.equal(result.confidence, 0.91);
    assert.deepEqual(result.facts, [{ key: "familySize", value: 4 }]);
    assert.deepEqual(result.constraints, [{ key: "budget", value: 6500000 }]);
  });

  it("deterministicAnalyze matches validation scenario", () => {
    const result = deterministicAnalyze(SAMPLE_MESSAGE);
    assert.deepEqual(result.facts, [{ key: "familySize", value: 4 }]);
    assert.deepEqual(result.constraints, [{ key: "budget", value: 6_500_000 }]);
    assert.deepEqual(result.rejectedOptions, [
      { key: "heating", value: "heat-pump" },
    ]);
  });
});

describe("PT-007A Architecture Validation", () => {
  it("analyzer never imports Runtime or Experience", () => {
    const files = readdirSync(here).flatMap((name) => {
      const path = join(here, name);
      if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
        return [path];
      }
      if (name === "providers" || name === "models") {
        return readdirSync(path)
          .filter(
            (child) => child.endsWith(".ts") && !child.endsWith(".test.ts"),
          )
          .map((child) => join(path, child));
      }
      return [];
    });

    assert.ok(files.length > 0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.equal(
        source.includes("@embed-engine/runtime"),
        false,
        `${file} must not know Runtime`,
      );
      assert.equal(
        /@embed-engine\/(ui|client-studio)|from ['"].*Experience/.test(source),
        false,
        `${file} must not know Experience modules`,
      );
      assert.equal(source.includes("ClientStudio"), false);
      assert.equal(source.includes("dispatch("), false);
      assert.equal(source.includes("mergeDecisionMemory"), false);
      assert.equal(
        /odpověz uživateli|reply to the user|chatbot/i.test(source),
        false,
      );
    }
  });

  it("AnalysisResult is purely structured", () => {
    const source = readFileSync(
      join(here, "models", "AnalysisResult.ts"),
      "utf8",
    );
    assert.match(source, /export type Fact/);
    assert.match(source, /export type Constraint/);
    assert.match(source, /export type RejectedOption/);
    assert.match(source, /confidence/);
    assert.equal(/\breply\b/.test(source), false);
    assert.equal(/\banswer\b/.test(source), false);
    assert.equal(/\bparagraph\b/.test(source), false);
  });
});
