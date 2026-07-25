import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import {
  buildMemoryContext,
  formatMemoryContextSection,
  MEMORY_SECTION_ORDER,
} from "./MemoryContextBuilder";
import type { DecisionMemory } from "../models/DecisionMemory";
import { emptyDecisionMemory } from "../models/DecisionMemory";
import { createPromptBuilder } from "../PromptBuilder";
import { PROMPT_SECTION_ORDER } from "../models/PromptPackage";

const here = dirname(fileURLToPath(import.meta.url));

function sampleDecision(): DecisionContext {
  return {
    headline: "Focus",
    summary: "Summary",
    focusPriority: "design",
    secondaryPriority: null,
    selectedPriorities: ["design"],
    recommendations: [],
  };
}

function sampleMemory(): DecisionMemory {
  return {
    ...emptyDecisionMemory(),
    preferences: [
      { key: "design", value: "high" },
      { key: "design", value: "high" }, // duplicate — last wins
    ],
    constraints: [{ key: "budget", value: 6_500_000 }],
    rejectedOptions: [{ key: "heating", value: "heat-pump" }],
  };
}

describe("PT-008 MemoryContextBuilder", () => {
  it("deduplicates by key keeping last value and sorts keys", () => {
    const prepared = buildMemoryContext({
      ...emptyDecisionMemory(),
      facts: [
        { key: "zeta", value: 1 },
        { key: "alpha", value: 2 },
        { key: "zeta", value: 9 },
      ],
    });

    assert.deepEqual(prepared.facts, [
      { key: "alpha", value: 2 },
      { key: "zeta", value: 9 },
    ]);
  });

  it("serializes buckets in fixed MEMORY_SECTION_ORDER", () => {
    const text = formatMemoryContextSection(sampleMemory());
    const positions = MEMORY_SECTION_ORDER.map((id) => {
      const pretty =
        id === "facts"
          ? "Facts"
          : id === "preferences"
            ? "Preferences"
            : id === "constraints"
              ? "Constraints"
              : id === "goals"
                ? "Goals"
                : id === "concerns"
                  ? "Concerns"
                  : id === "acceptedOptions"
                    ? "Accepted Options"
                    : "Rejected Options";
      return text.indexOf(pretty);
    });

    for (let i = 1; i < positions.length; i += 1) {
      assert.ok(
        positions[i]! > positions[i - 1]!,
        `section order broken at ${MEMORY_SECTION_ORDER[i]}`,
      );
    }
    assert.match(text, /Preferences:[\s\S]*design: high/);
    assert.match(text, /Constraints:[\s\S]*budget: 6500000/);
    assert.match(text, /Rejected Options:[\s\S]*heating: heat-pump/);
  });

  it("is deterministic regardless of insertion order", () => {
    const a = buildMemoryContext({
      ...emptyDecisionMemory(),
      preferences: [
        { key: "b", value: 1 },
        { key: "a", value: 2 },
      ],
    });
    const b = buildMemoryContext({
      ...emptyDecisionMemory(),
      preferences: [
        { key: "a", value: 2 },
        { key: "b", value: 1 },
      ],
    });
    assert.deepEqual(a, b);
    assert.deepEqual(
      formatMemoryContextSection(a),
      formatMemoryContextSection(b),
    );
  });
});

describe("PT-008 PromptBuilder Memory integration", () => {
  it("includes DecisionMemory in PromptPackage for recommendation question", () => {
    const promptPackage = createPromptBuilder().build({
      sessionId: "sess-memory",
      decision: sampleDecision(),
      memory: sampleMemory(),
      currentUserMessage: "Jaký dům mi doporučíš?",
    });

    const memorySections = promptPackage.sections.filter(
      (section) => section.id === "decision-memory",
    );
    assert.equal(memorySections.length, 1);
    assert.match(memorySections[0]!.content, /design: high/);
    assert.match(memorySections[0]!.content, /budget: 6500000/);
    assert.match(memorySections[0]!.content, /heating: heat-pump/);
    assert.equal(promptPackage.context.memory.preferences[0]?.key, "design");
    assert.deepEqual(
      promptPackage.sections.map((s) => s.id),
      [...PROMPT_SECTION_ORDER],
    );
  });
});

describe("PT-008 Architecture Validation", () => {
  it("MemoryContextBuilder does not know OpenAI; providers do not read DecisionMemory", () => {
    const memoryBuilder = readFileSync(
      join(here, "MemoryContextBuilder.ts"),
      "utf8",
    );
    assert.equal(memoryBuilder.includes("OpenAI"), false);
    assert.equal(memoryBuilder.includes("api.openai.com"), false);

    const openAi = readFileSync(
      join(here, "..", "..", "providers", "OpenAIProvider.ts"),
      "utf8",
    );
    const mock = readFileSync(
      join(here, "..", "..", "providers", "MockProvider.ts"),
      "utf8",
    );
    assert.equal(openAi.includes("DecisionMemory"), false);
    assert.equal(mock.includes("DecisionMemory"), false);
    assert.equal(openAi.includes("buildMemoryContext"), false);
  });
});
