import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { emptyAnalysisResult } from "../analyzer/models/AnalysisResult";
import { emptyDecisionMemory } from "../prompt/models/DecisionMemory";
import { createDecisionMemoryService } from "./DecisionMemoryService";

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
        assert.equal(source.includes("DecisionMemoryService"), false);
      }

      if (file.includes(`${join("analyzer", "")}`)) {
        assert.equal(source.includes("DecisionMemoryService"), false);
        assert.equal(source.includes("MemoryUpdateRequest"), false);
      }

      if (file.includes(`${join("providers", "")}`)) {
        assert.equal(source.includes("DecisionMemoryService"), false);
        assert.equal(source.includes("MemoryUpdateRequest"), false);
      }
    }
  });
});

describe("PT-009 Decision Memory Service smoke", () => {
  it("writes through service", () => {
    const service = createDecisionMemoryService({
      initial: emptyDecisionMemory(),
    });
    service.update({
      analysis: {
        ...emptyAnalysisResult(1),
        facts: [{ key: "familySize", value: 4 }],
      },
    });
    assert.equal(service.getMemory().facts[0]?.key, "familySize");
    assert.ok((service.getMemory().facts[0]?.at ?? 0) > 0);
  });
});
