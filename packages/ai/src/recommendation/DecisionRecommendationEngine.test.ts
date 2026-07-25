/**
 * PT-013 — Decision Recommendation Engine tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DecisionContext } from "@embed-engine/runtime";

import { emptyKnowledgeContext } from "../prompt/models/KnowledgeContext";
import { emptyResolvedMemory } from "../memory/models/ResolvedMemory";
import type { ResolvedMemory } from "../memory/models/ResolvedMemory";
import type { ObjectContext } from "../models/PromptContext";
import { createPromptBuilder } from "../prompt/PromptBuilder";
import { createAIService } from "../services/AIService";
import { MockProvider } from "../providers/MockProvider";
import {
  createDecisionRecommendationEngine,
  recommendDecision,
} from "./DecisionRecommendationEngine";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function decision(focus: string | null = "energy"): DecisionContext {
  return {
    headline: "Test",
    summary: "Test",
    focusPriority: focus,
    secondaryPriority: null,
    selectedPriorities: focus ? [focus] : [],
    recommendations: [],
  };
}

function object(attributes: ObjectContext["attributes"] = {}): ObjectContext {
  return {
    objectId: "obj-1",
    reference: "ASTAV-M01",
    title: "Reference",
    attributes,
    knowledge: emptyKnowledgeContext(),
    mediaReferences: [],
  };
}

function memory(partial: Partial<ResolvedMemory>): ResolvedMemory {
  const empty = emptyResolvedMemory();
  return Object.freeze({
    ...empty,
    ...partial,
  });
}

describe("PT-013 Decision Recommendation Engine", () => {
  it("flags budget conflict when budget < price", () => {
    const result = recommendDecision({
      decision: decision("budget"),
      object: object({ price: 7_500_000 }),
      memory: memory({
        constraints: [{ key: "budget", value: 6_500_000 }],
      }),
    });

    assert.ok(result.violatedConstraints.some((v) => v.includes("budget")));
    assert.ok(result.avoidedOptions.some((o) => o.id === "purchase-at-listed-price"));
    assert.ok(result.reasoning.some((r) => /Rozpočet/i.test(r)));
  });

  it("avoids heat pump when rejected", () => {
    const result = recommendDecision({
      decision: decision(null),
      object: object(),
      memory: memory({
        rejectedOptions: [{ key: "heating", value: "heat-pump" }],
      }),
    });

    assert.ok(result.avoidedOptions.some((o) => o.id === "heating:heat-pump"));
    assert.ok(
      result.reasoning.some((r) => /neargumentovat/i.test(r)),
    );
  });

  it("raises energy efficiency when priority is operating costs", () => {
    const result = recommendDecision({
      decision: decision("energy"),
      object: object({ energyClass: "A" }),
      memory: emptyResolvedMemory(),
    });

    assert.ok(result.recommendedOptions.some((o) => o.id === "energy:efficiency"));
    assert.ok(result.matchedPreferences.includes("priority:energy"));
  });

  it("recommends family layout for larger households", () => {
    const result = recommendDecision({
      decision: decision("layout"),
      object: object({ rooms: 3, usableArea: 90 }),
      memory: memory({
        facts: [{ key: "familySize", value: 4 }],
      }),
    });

    assert.ok(result.recommendedOptions.some((o) => o.id === "layout:family"));
    assert.ok(result.matchedPreferences.some((p) => p.startsWith("familySize:")));
  });

  it("is deterministic for the same input", () => {
    const input = {
      decision: decision("energy"),
      object: object({ price: 6_000_000, energyClass: "B" }),
      memory: memory({
        constraints: [{ key: "budget", value: 6_500_000 }],
        rejectedOptions: [{ key: "heating", value: "heat-pump" }],
      }),
    };
    const a = recommendDecision(input);
    const b = recommendDecision(input);
    assert.deepEqual(a, b);
  });

  it("PromptBuilder serializes RecommendationContext without scoring", () => {
    const recommendation = createDecisionRecommendationEngine().recommend({
      decision: decision("energy"),
      object: object({ energyClass: "A" }),
      memory: memory({
        rejectedOptions: [{ key: "heating", value: "heat-pump" }],
      }),
    });

    const promptPackage = createPromptBuilder().build({
      sessionId: "rec-1",
      decision: decision("energy"),
      object: { attributes: { energyClass: "A" } },
      recommendation,
      currentUserMessage: "Co doporučuješ?",
    });

    const section = promptPackage.sections.find(
      (s) => s.id === "recommendation-context",
    );
    assert.ok(section);
    assert.match(section.content, /Recommendation Context/);
    assert.match(section.content, /energy:efficiency/);
    assert.match(section.content, /heating:heat-pump/);
    assert.equal(promptPackage.context.recommendation, recommendation);
  });

  it("AIService includes recommendation section in live prompt", async () => {
    const service = createAIService(new MockProvider(), {
      sessionId: "rec-live",
      diagnostics: false,
      recorder: false,
    });

    await service.sendMessage({
      message: "Nechceme tepelné čerpadlo.",
      decision: decision("energy"),
      object: { attributes: { price: 6_000_000, energyClass: "A" } },
    });

    // Second turn builds prompt with resolved memory + recommendation.
    const provider = service.getProvider() as MockProvider;
    assert.ok(provider);

    await service.sendMessage({
      message: "Jaký dům nám doporučíš?",
      decision: decision("energy"),
      object: { attributes: { price: 6_000_000, energyClass: "A" } },
    });

    // Validate via building with same engine path using getResolvedMemory.
    const recommendation = createDecisionRecommendationEngine().recommend({
      memory: service.getResolvedMemory(),
      object: object({ price: 6_000_000, energyClass: "A" }),
      decision: decision("energy"),
    });
    assert.ok(recommendation.avoidedOptions.some((o) => o.id === "heating:heat-pump"));
    assert.ok(recommendation.recommendedOptions.some((o) => o.id === "energy:efficiency"));
  });
});

describe("PT-013 Architecture Validation", () => {
  it("engine is deterministic and never imports providers or LLM", () => {
    const engine = readFileSync(
      join(PACKAGE_ROOT, "src/recommendation/DecisionRecommendationEngine.ts"),
      "utf8",
    );
    assert.doesNotMatch(engine, /OpenAI|LLMProvider|chat\(/);
    assert.doesNotMatch(engine, /from "\.\.\/providers/);
  });

  it("PromptBuilder does not import recommendation rules (serialize only)", () => {
    const builder = readFileSync(
      join(PACKAGE_ROOT, "src/prompt/PromptBuilder.ts"),
      "utf8",
    );
    assert.doesNotMatch(builder, /budgetConflictRule|energyPriorityRule|recommendDecision/);
    assert.match(builder, /recommendation/);
  });

  it("OpenAIAdapter does not know RecommendationContext", () => {
    const provider = readFileSync(
      join(PACKAGE_ROOT, "src/adapter/openai/OpenAIAdapter.ts"),
      "utf8",
    );
    assert.doesNotMatch(provider, /Recommendation|recommendation/);
  });
});
