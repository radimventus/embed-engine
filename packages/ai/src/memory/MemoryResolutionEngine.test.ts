import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { emptyAnalysisResult } from "../analyzer/models/AnalysisResult";
import { emptyDecisionMemory } from "../prompt/models/DecisionMemory";
import {
  createDecisionMemoryService,
  DecisionMemoryService,
} from "./DecisionMemoryService";
import { createMemoryResolutionEngine } from "./MemoryResolutionEngine";

const here = dirname(fileURLToPath(import.meta.url));

describe("PT-010 Memory Resolution Engine", () => {
  it("keeps history and resolves latest budget", () => {
    const service = createDecisionMemoryService();
    service.update({
      analysis: {
        ...emptyAnalysisResult(1),
        constraints: [{ key: "budget", value: 5_000_000 }],
      },
    });
    service.update({
      analysis: {
        ...emptyAnalysisResult(1),
        constraints: [{ key: "budget", value: 6_500_000 }],
      },
    });

    const history = service.getMemory();
    assert.equal(history.constraints.length, 2);
    assert.equal(history.constraints[0]?.value, 5_000_000);
    assert.equal(history.constraints[1]?.value, 6_500_000);

    const resolved = createMemoryResolutionEngine().resolve(history);
    assert.deepEqual(resolved.constraints, [
      { key: "budget", value: 6_500_000 },
    ]);
  });

  it("resolves heating rejected then accepted to accepted only", () => {
    const service = createDecisionMemoryService();
    service.update({
      analysis: {
        ...emptyAnalysisResult(1),
        rejectedOptions: [{ key: "heating", value: "heat-pump" }],
      },
    });
    service.update({
      analysis: {
        ...emptyAnalysisResult(1),
        acceptedOptions: [{ key: "heating", value: "heat-pump" }],
      },
    });

    const history = service.getMemory();
    assert.equal(history.rejectedOptions.length, 1);
    assert.equal(history.acceptedOptions.length, 1);

    const resolved = createMemoryResolutionEngine().resolve(history);
    assert.deepEqual(resolved.acceptedOptions, [
      { key: "heating", value: "heat-pump" },
    ]);
    assert.equal(resolved.rejectedOptions.length, 0);
  });

  it("never mutates DecisionMemory when resolving", () => {
    const history = {
      ...emptyDecisionMemory(),
      constraints: [
        { key: "budget", value: 1, at: 1 },
        { key: "budget", value: 2, at: 2 },
      ],
    };
    const before = JSON.stringify(history);
    createMemoryResolutionEngine().resolve(history);
    assert.equal(JSON.stringify(history), before);
  });
});

describe("PT-009/010 Decision Memory Service history", () => {
  it("appends same key into history (duplicated counted, still added)", () => {
    const service = createDecisionMemoryService({
      initial: {
        ...emptyDecisionMemory(),
        constraints: [{ key: "budget", value: 6_500_000, at: 1 }],
      },
    });

    const result = service.update({
      analysis: {
        ...emptyAnalysisResult(0.8),
        constraints: [{ key: "budget", value: 7_000_000 }],
      },
    });

    assert.equal(result.added, 1);
    assert.equal(result.duplicated, 1);
    assert.equal(service.getMemory().constraints.length, 2);
    assert.equal(service.getMemory().constraints[0]?.value, 6_500_000);
    assert.equal(service.getMemory().constraints[1]?.value, 7_000_000);
  });

  it("new heat-pump rejection yields added=1", () => {
    const service = createDecisionMemoryService({
      initial: {
        ...emptyDecisionMemory(),
        constraints: [{ key: "budget", value: 6_500_000, at: 1 }],
      },
    });

    const result = service.update({
      analysis: {
        ...emptyAnalysisResult(0.8),
        rejectedOptions: [{ key: "heating", value: "heat-pump" }],
      },
    });

    assert.equal(result.added, 1);
    assert.equal(result.duplicated, 0);
    assert.equal(service.getMemory().rejectedOptions[0]?.value, "heat-pump");
  });

  it("invalid entries are skipped", () => {
    const service = new DecisionMemoryService({
      initial: {
        ...emptyDecisionMemory(),
        facts: [{ key: "familySize", value: 4, at: 1 }],
      },
    });

    const result = service.update({
      analysis: {
        ...emptyAnalysisResult(),
        facts: [
          { key: "", value: "x" },
          { key: "pets", value: true },
        ],
      },
    });

    assert.equal(result.skipped, 1);
    assert.equal(result.added, 1);
    assert.deepEqual(
      service.getMemory().facts.map((f) => f.key),
      ["familySize", "pets"],
    );
  });
});

describe("PT-010 Architecture Validation", () => {
  it("Providers and PromptBuilder do not import ResolutionEngine", () => {
    const promptBuilder = readFileSync(
      join(here, "..", "prompt", "PromptBuilder.ts"),
      "utf8",
    );
    const openAi = readFileSync(
      join(here, "..", "providers", "OpenAIProvider.ts"),
      "utf8",
    );
    const mock = readFileSync(
      join(here, "..", "providers", "MockProvider.ts"),
      "utf8",
    );
    const contextBuilder = readFileSync(
      join(here, "..", "prompt", "builders", "MemoryContextBuilder.ts"),
      "utf8",
    );

    assert.equal(promptBuilder.includes("MemoryResolutionEngine"), false);
    assert.equal(promptBuilder.includes("resolveMemory"), false);
    assert.equal(openAi.includes("MemoryResolutionEngine"), false);
    assert.equal(mock.includes("MemoryResolutionEngine"), false);
    assert.match(contextBuilder, /resolveMemory|MemoryResolutionEngine/);
    assert.match(promptBuilder, /buildMemoryContext/);
  });
});
