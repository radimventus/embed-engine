import assert from "node:assert/strict";
import { describe, it } from "node:test";

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

function sampleHistory(): DecisionMemory {
  return {
    ...emptyDecisionMemory(),
    preferences: [{ key: "design", value: "high", at: 1 }],
    constraints: [
      { key: "budget", value: 5_000_000, at: 2 },
      { key: "budget", value: 6_500_000, at: 3 },
    ],
    rejectedOptions: [{ key: "heating", value: "heat-pump", at: 4 }],
  };
}

describe("PT-008/010 MemoryContextBuilder", () => {
  it("buildMemoryContext returns ResolvedMemory (latest budget only)", () => {
    const resolved = buildMemoryContext(sampleHistory());
    assert.deepEqual(resolved.constraints, [
      { key: "budget", value: 6_500_000 },
    ]);
    assert.deepEqual(resolved.preferences, [{ key: "design", value: "high" }]);
    assert.equal(sampleHistory().constraints.length, 2);
  });

  it("serializes ResolvedMemory buckets in fixed order", () => {
    const text = formatMemoryContextSection(sampleHistory());
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
      assert.ok(positions[i]! > positions[i - 1]!);
    }
    assert.match(text, /budget: 6500000/);
    assert.equal(text.includes("5000000"), false);
  });
});

describe("PT-008 PromptBuilder Memory integration", () => {
  it("PromptPackage memory section uses resolved active values", () => {
    const promptPackage = createPromptBuilder().build({
      sessionId: "sess-memory",
      decision: sampleDecision(),
      memory: sampleHistory(),
      currentUserMessage: "Jaký dům mi doporučíš?",
    });

    const memorySections = promptPackage.sections.filter(
      (section) => section.id === "decision-memory",
    );
    assert.equal(memorySections.length, 1);
    assert.match(memorySections[0]!.content, /design: high/);
    assert.match(memorySections[0]!.content, /budget: 6500000/);
    assert.equal(memorySections[0]!.content.includes("5000000"), false);
    assert.deepEqual(promptPackage.context.memory.constraints, [
      { key: "budget", value: 6_500_000 },
    ]);
    assert.deepEqual(
      promptPackage.sections.map((s) => s.id),
      [...PROMPT_SECTION_ORDER],
    );
  });
});
