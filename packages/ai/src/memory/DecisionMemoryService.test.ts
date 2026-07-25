import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { emptyAnalysisResult } from "../analyzer/models/AnalysisResult";
import { emptyDecisionMemory } from "../prompt/models/DecisionMemory";
import {
  createDecisionMemoryService,
  DecisionMemoryService,
} from "./DecisionMemoryService";

const here = dirname(fileURLToPath(import.meta.url));
const packageSrc = join(here, "..");

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (name === "memory") {
        continue;
      }
      out.push(...listTsFiles(path));
      continue;
    }
    if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
      out.push(path);
    }
  }
  return out;
}

describe("PT-009 Decision Memory Service", () => {
  it("duplicate budget key yields added=0 duplicated=1", () => {
    const service = createDecisionMemoryService({
      initial: {
        ...emptyDecisionMemory(),
        constraints: [{ key: "budget", value: 6_500_000 }],
      },
    });

    const result = service.update({
      analysis: {
        ...emptyAnalysisResult(0.8),
        constraints: [{ key: "budget", value: 7_000_000 }],
      },
    });

    assert.equal(result.added, 0);
    assert.equal(result.duplicated, 1);
    assert.equal(result.skipped, 0);
    assert.equal(service.getMemory().constraints[0]?.value, 6_500_000);
  });

  it("new heat-pump rejection yields added=1", () => {
    const service = createDecisionMemoryService({
      initial: {
        ...emptyDecisionMemory(),
        constraints: [{ key: "budget", value: 6_500_000 }],
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
    assert.equal(service.getMemory().constraints.length, 1);
  });

  it("invalid entries are skipped; append-only preserves order of existing keys", () => {
    const service = new DecisionMemoryService({
      initial: {
        ...emptyDecisionMemory(),
        facts: [{ key: "familySize", value: 4 }],
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

describe("PT-009 Architecture Validation", () => {
  it("DecisionMemoryService is the only writer of Memory", () => {
    const files = listTsFiles(packageSrc);
    assert.ok(files.length > 0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.equal(
        source.includes("mergeDecisionMemory"),
        false,
        `${file} must not call removed mergeDecisionMemory`,
      );

      if (file.includes(`${join("prompt", "PromptBuilder")}`)) {
        assert.equal(
          source.includes(".update("),
          false,
          "PromptBuilder must not write Memory",
        );
        assert.equal(source.includes("DecisionMemoryService"), false);
      }

      if (file.includes(`${join("analyzer", "")}`)) {
        assert.equal(
          source.includes("DecisionMemoryService"),
          false,
          `${file}: Analyzer must not write Memory`,
        );
        assert.equal(source.includes("MemoryUpdateRequest"), false);
      }

      if (file.includes(`${join("providers", "")}`)) {
        assert.equal(source.includes("DecisionMemoryService"), false);
        assert.equal(source.includes("MemoryUpdateRequest"), false);
      }
    }
  });

  it("PromptBuilder source still only reads memory input", () => {
    const source = readFileSync(
      join(packageSrc, "prompt", "PromptBuilder.ts"),
      "utf8",
    );
    assert.match(source, /buildMemoryContext/);
    assert.equal(source.includes("createDecisionMemoryService"), false);
    assert.equal(source.includes("service.update"), false);
  });
});
