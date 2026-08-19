import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PRIORITY_CORPUS_V1_ENTRIES } from "./priorityCorpusV1.generated";
import {
  PRIORITY_CORPUS_SIMILARITY_THRESHOLD,
  PRIORITY_CORPUS_V1_COVERAGE,
  classifyPriorityCorpusSliderState,
  resolvePriorityCorpusV1,
} from "./priorityCorpusV1";
import {
  CUSTOMER_FACING_FORBIDDEN_HOUSE_IDENTITY_TOKENS,
  realizeCustomerFacingHouseIdentityText,
} from "./houseIdentity";

const PRIORITY_ID_BY_LABEL: Readonly<Record<string, string>> = Object.freeze({
  Pozemek: "plot",
  Dispozice: "layout",
  Soukromí: "privacy",
  Design: "design",
  Energie: "energy",
  "Provozní náklady": "operating-costs",
  Kvalita: "quality",
  Údržba: "maintenance",
});

const corpusSourcePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../docs/product/content/priority/TASK-40-PRODUCTION-CORPUS.md",
);

function parseAuthoritativeCorpus(): readonly {
  readonly dmpId: string;
  readonly priorityA: string;
  readonly priorityB: string;
  readonly priorityC: string;
  readonly sliderState: string;
  readonly text: string;
}[] {
  const source = readFileSync(corpusSourcePath, "utf8");
  const entries = [];
  const segments = source
    .split(/^={50}\s*$/m)
    .filter((segment) => segment.includes("### DMP ID:"));

  for (const segment of segments) {
    const header = segment.match(
      /^### DMP ID: (\d+)\nPRIORITIES:\nA: (.+)\nB: (.+)\nC: (.+)\n/m,
    );
    if (header === null) {
      throw new Error("Invalid authoritative Priority Corpus v1 header.");
    }
    const [, dmpId, priorityA, priorityB, priorityC] = header;
    for (const [, sliderState, text] of segment.matchAll(
      /^\*\*([A-Z_]+):\*\*\n([^\n]+)$/gm,
    )) {
      entries.push({ dmpId, priorityA, priorityB, priorityC, sliderState, text });
    }
  }

  return entries;
}

function valuesForState(state: string): readonly number[] {
  switch (state) {
    case "A_DOMINANT":
      return [0.92, 0.4, 0.35];
    case "B_DOMINANT":
      return [0.35, 0.92, 0.4];
    case "C_DOMINANT":
      return [0.4, 0.35, 0.92];
    case "AB_COALITION":
      return [0.9, 0.88, 0.2];
    case "AC_COALITION":
      return [0.91, 0.2, 0.86];
    case "BC_COALITION":
      return [0.25, 0.87, 0.91];
    case "BALANCED":
      return [0.85, 0.85, 0.85];
    default:
      throw new Error(`Unsupported frozen slider state: ${state}`);
  }
}

describe("Frozen Priority Corpus v1", () => {
  it("preserves every generated realization exactly from the authoritative source", () => {
    assert.deepEqual(PRIORITY_CORPUS_V1_ENTRIES, parseAuthoritativeCorpus());
  });

  it("has the complete, unique 56 × 7 coverage matrix", () => {
    assert.equal(PRIORITY_CORPUS_SIMILARITY_THRESHOLD, 0.1);
    assert.deepEqual(PRIORITY_CORPUS_V1_COVERAGE, {
      dmpCount: 56,
      combinationCount: 56,
      sliderStateCount: 7,
      realizationCount: 392,
      duplicateKeys: 0,
      missingKeys: 0,
    });
    assert.equal(PRIORITY_CORPUS_V1_ENTRIES.length, 392);
    assert.ok(
      PRIORITY_CORPUS_V1_ENTRIES.every((entry) => entry.text.trim().length > 0),
    );
  });

  it("implements the frozen balanced, coalition, dominance, and boundary rules", () => {
    const cases = [
      [[0.85, 0.85, 0.85], "BALANCED"],
      [[0.8, 0.75, 0.7], "BALANCED"],
      [[0.9, 0.85, 0.8], "BALANCED"],
      [[0.9, 0.88, 0.2], "AB_COALITION"],
      [[0.91, 0.2, 0.86], "AC_COALITION"],
      [[0.25, 0.87, 0.91], "BC_COALITION"],
      [[0.92, 0.4, 0.35], "A_DOMINANT"],
      [[0.35, 0.92, 0.4], "B_DOMINANT"],
      [[0.4, 0.35, 0.92], "C_DOMINANT"],
      [[0.8, 0.7, 0.7], "BALANCED"],
      [[0.81, 0.8, 0.7], "A_DOMINANT"],
      [[0.81, 0.8, 0.69], "AB_COALITION"],
      [[0.8, 0.8, 0.8], "BALANCED"],
      [[0.8, 0.8, 0.6], "AB_COALITION"],
    ] as const;

    for (const [[a, b, c], expected] of cases) {
      assert.equal(
        classifyPriorityCorpusSliderState({
          priorityAImportance: a,
          priorityBImportance: b,
          priorityCImportance: c,
        }),
        expected,
      );
    }
  });

  it("returns unresolved state for invalid slider inputs", () => {
    for (const [a, b, c] of [
      [Number.NaN, 0.5, 0.5],
      [-0.1, 0.5, 0.5],
      [1.1, 0.5, 0.5],
    ]) {
      assert.equal(
        classifyPriorityCorpusSliderState({
          priorityAImportance: a,
          priorityBImportance: b,
          priorityCImportance: c,
        }),
        null,
      );
    }
  });

  it("round-trips every frozen entry through canonical lookup exactly once", () => {
    for (const entry of PRIORITY_CORPUS_V1_ENTRIES) {
      const [a, b, c] = valuesForState(entry.sliderState);
      const resolution = resolvePriorityCorpusV1([
        {
          priorityId: PRIORITY_ID_BY_LABEL[entry.priorityA]!,
          importance: a,
        },
        {
          priorityId: PRIORITY_ID_BY_LABEL[entry.priorityB]!,
          importance: b,
        },
        {
          priorityId: PRIORITY_ID_BY_LABEL[entry.priorityC]!,
          importance: c,
        },
      ]);

      assert.ok(resolution, `${entry.dmpId}:${entry.sliderState} resolves`);
      assert.equal(resolution.key.dmpId, entry.dmpId);
      assert.equal(resolution.key.sliderState, entry.sliderState);
      assert.equal(
        resolution.text,
        realizeCustomerFacingHouseIdentityText(entry.text),
      );
    }
  });

  it("keeps the frozen source immutable while removing legacy identity from output", () => {
    const sourceEntriesWithLegacyIdentity = PRIORITY_CORPUS_V1_ENTRIES.filter(
      (entry) => entry.text.includes("MODERN 4KK"),
    );
    assert.equal(sourceEntriesWithLegacyIdentity.length, 147);

    for (const entry of PRIORITY_CORPUS_V1_ENTRIES) {
      const [a, b, c] = valuesForState(entry.sliderState);
      const resolution = resolvePriorityCorpusV1([
        { priorityId: PRIORITY_ID_BY_LABEL[entry.priorityA]!, importance: a },
        { priorityId: PRIORITY_ID_BY_LABEL[entry.priorityB]!, importance: b },
        { priorityId: PRIORITY_ID_BY_LABEL[entry.priorityC]!, importance: c },
      ]);
      assert.ok(resolution);
      for (const token of CUSTOMER_FACING_FORBIDDEN_HOUSE_IDENTITY_TOKENS) {
        assert.equal(resolution.text.includes(token), false);
      }
    }
  });

  it("selects the top three by importance and canonical order before lookup", () => {
    const resolution = resolvePriorityCorpusV1([
      { priorityId: "maintenance", importance: 0.4 },
      { priorityId: "quality", importance: 0.9 },
      { priorityId: "plot", importance: 0.9 },
      { priorityId: "layout", importance: 0.9 },
    ]);

    assert.ok(resolution);
    assert.deepEqual(
      [resolution.priorityA, resolution.priorityB, resolution.priorityC],
      ["plot", "layout", "quality"],
    );
    assert.equal(resolution.key.dmpId, "05");
    assert.equal(resolution.key.sliderState, "BALANCED");
  });

  it("never falls back for incomplete, unknown, or duplicate input", () => {
    assert.equal(
      resolvePriorityCorpusV1([
        { priorityId: "plot", importance: 0.8 },
        { priorityId: "layout", importance: 0.8 },
      ]),
      null,
    );
    assert.equal(
      resolvePriorityCorpusV1([
        { priorityId: "plot", importance: 0.8 },
        { priorityId: "layout", importance: 0.8 },
        { priorityId: "internal-id", importance: 0.8 },
      ]),
      null,
    );
    assert.equal(
      resolvePriorityCorpusV1([
        { priorityId: "plot", importance: 0.8 },
        { priorityId: "layout", importance: 0.8 },
        { priorityId: "layout", importance: 0.7 },
      ]),
      null,
    );
  });
});
