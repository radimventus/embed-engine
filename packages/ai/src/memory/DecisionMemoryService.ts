/**
 * PT-009 — Decision Memory Service.
 *
 * Sole writer of DecisionMemory lifecycle.
 * Analyzer / PromptBuilder / Runtime / Providers must never mutate Memory.
 *
 * Strategy: append-only, no delete, no overwrite, dedupe by key.
 */

import type { AnalysisResult } from "../analyzer/models/AnalysisResult";
import {
  emptyDecisionMemory,
  type DecisionMemory,
  type MemoryItem,
  type MemoryValue,
} from "../prompt/models/DecisionMemory";
import type {
  MemoryUpdateRequest,
  MemoryUpdateResult,
} from "./models/MemoryUpdateRequest";

export type DecisionMemoryServiceOptions = {
  readonly initial?: DecisionMemory;
};

type BucketId =
  | "facts"
  | "preferences"
  | "constraints"
  | "goals"
  | "concerns"
  | "acceptedOptions"
  | "rejectedOptions";

const BUCKETS: readonly BucketId[] = [
  "facts",
  "preferences",
  "constraints",
  "goals",
  "concerns",
  "acceptedOptions",
  "rejectedOptions",
] as const;

export class DecisionMemoryService {
  private memory: DecisionMemory;

  constructor(options: DecisionMemoryServiceOptions = {}) {
    this.memory = options.initial ?? emptyDecisionMemory();
  }

  /** Read-only snapshot for PromptBuilder / consumers. */
  getMemory(): DecisionMemory {
    return this.memory;
  }

  /**
   * Apply AnalysisResult into Memory.
   * Append-only: existing keys are never overwritten or deleted.
   */
  update(request: MemoryUpdateRequest): MemoryUpdateResult {
    const analysis = request.analysis;
    let added = 0;
    let skipped = 0;
    let duplicated = 0;

    const nextBuckets: Record<BucketId, MemoryItem[]> = {
      facts: [...this.memory.facts],
      preferences: [...this.memory.preferences],
      constraints: [...this.memory.constraints],
      goals: [...this.memory.goals],
      concerns: [...this.memory.concerns],
      acceptedOptions: [...this.memory.acceptedOptions],
      rejectedOptions: [...this.memory.rejectedOptions],
    };

    for (const bucket of BUCKETS) {
      const existingKeys = new Set(
        nextBuckets[bucket].map((item) => item.key),
      );
      const incoming = analysis[bucket];

      for (const entry of incoming) {
        const validated = validateEntry(entry);
        if (validated === null) {
          skipped += 1;
          continue;
        }

        if (existingKeys.has(validated.key)) {
          duplicated += 1;
          continue;
        }

        nextBuckets[bucket].push(validated);
        existingKeys.add(validated.key);
        added += 1;
      }
    }

    this.memory = Object.freeze({
      facts: Object.freeze(nextBuckets.facts),
      preferences: Object.freeze(nextBuckets.preferences),
      constraints: Object.freeze(nextBuckets.constraints),
      goals: Object.freeze(nextBuckets.goals),
      concerns: Object.freeze(nextBuckets.concerns),
      acceptedOptions: Object.freeze(nextBuckets.acceptedOptions),
      rejectedOptions: Object.freeze(nextBuckets.rejectedOptions),
    });

    return Object.freeze({ added, skipped, duplicated });
  }
}

export function createDecisionMemoryService(
  options?: DecisionMemoryServiceOptions,
): DecisionMemoryService {
  return new DecisionMemoryService(options);
}

function validateEntry(entry: {
  readonly key: string;
  readonly value: AnalysisResult["facts"][number]["value"];
}): MemoryItem | null {
  if (typeof entry.key !== "string" || entry.key.trim().length === 0) {
    return null;
  }
  if (!isMemoryValue(entry.value)) {
    return null;
  }
  return Object.freeze({
    key: entry.key.trim(),
    value: entry.value,
  });
}

function isMemoryValue(value: unknown): value is MemoryValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
