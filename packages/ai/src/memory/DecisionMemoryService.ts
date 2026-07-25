/**
 * PT-009 / PT-010 — Decision Memory Service.
 *
 * Sole writer of DecisionMemory lifecycle (append-only history).
 * Same key may appear multiple times — ResolutionEngine interprets currency.
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
  private seq: number;

  constructor(options: DecisionMemoryServiceOptions = {}) {
    this.memory = options.initial ?? emptyDecisionMemory();
    this.seq = maxAt(this.memory);
  }

  /** Read-only historical snapshot. */
  getMemory(): DecisionMemory {
    return this.memory;
  }

  /**
   * Append AnalysisResult into history.
   * Never deletes. Never overwrites prior rows. Same key may reappear.
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

      for (const entry of analysis[bucket]) {
        const validated = validateEntry(entry, () => {
          this.seq += 1;
          return this.seq;
        });
        if (validated === null) {
          skipped += 1;
          continue;
        }

        if (existingKeys.has(validated.key)) {
          duplicated += 1;
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

function maxAt(memory: DecisionMemory): number {
  let max = 0;
  for (const bucket of BUCKETS) {
    for (const item of memory[bucket]) {
      if (item.at > max) {
        max = item.at;
      }
    }
  }
  return max;
}

function validateEntry(
  entry: {
    readonly key: string;
    readonly value: AnalysisResult["facts"][number]["value"];
  },
  nextAt: () => number,
): MemoryItem | null {
  if (typeof entry.key !== "string" || entry.key.trim().length === 0) {
    return null;
  }
  if (!isMemoryValue(entry.value)) {
    return null;
  }
  return Object.freeze({
    key: entry.key.trim(),
    value: entry.value,
    at: nextAt(),
  });
}

function isMemoryValue(value: unknown): value is MemoryValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
