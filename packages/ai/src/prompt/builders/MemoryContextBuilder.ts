/**
 * PT-008 — MemoryContextBuilder.
 *
 * Prepares DecisionMemory for PromptPackage (not a Memory Resolution Engine).
 * Deduplicates by key (last value wins), sorts keys for deterministic order.
 * Does not know vendors. Does not edit Memory.
 */

import type {
  DecisionMemory,
  MemoryItem,
} from "../models/DecisionMemory";

/** Fixed section order inside the Memory prompt block (PT-008). */
export const MEMORY_SECTION_ORDER = [
  "facts",
  "preferences",
  "constraints",
  "goals",
  "concerns",
  "acceptedOptions",
  "rejectedOptions",
] as const;

export type MemorySectionId = (typeof MEMORY_SECTION_ORDER)[number];

const MEMORY_SECTION_LABELS: Readonly<Record<MemorySectionId, string>> = {
  facts: "Facts",
  preferences: "Preferences",
  constraints: "Constraints",
  goals: "Goals",
  concerns: "Concerns",
  acceptedOptions: "Accepted Options",
  rejectedOptions: "Rejected Options",
};

/**
 * Build Memory Context for prompts from DecisionMemory.
 * - remove duplicate keys (keep last value)
 * - stable key order within each bucket
 * - fixed bucket order
 */
export function buildMemoryContext(memory: DecisionMemory): DecisionMemory {
  return Object.freeze({
    facts: prepareBucket(memory.facts),
    preferences: prepareBucket(memory.preferences),
    constraints: prepareBucket(memory.constraints),
    goals: prepareBucket(memory.goals),
    concerns: prepareBucket(memory.concerns),
    acceptedOptions: prepareBucket(memory.acceptedOptions),
    rejectedOptions: prepareBucket(memory.rejectedOptions),
  });
}

/**
 * Serialize prepared Memory Context for the PromptPackage memory section.
 */
export function formatMemoryContextSection(memory: DecisionMemory): string {
  const prepared = buildMemoryContext(memory);
  const lines = ["Decision Memory"];

  for (const sectionId of MEMORY_SECTION_ORDER) {
    const label = MEMORY_SECTION_LABELS[sectionId];
    const items = prepared[sectionId];
    if (items.length === 0) {
      lines.push(`${label}: (none)`);
    } else {
      lines.push(`${label}:`);
      for (const item of items) {
        lines.push(`  ${item.key}: ${formatValue(item.value)}`);
      }
    }
  }

  return lines.join("\n");
}

function prepareBucket(
  items: readonly MemoryItem[],
): readonly MemoryItem[] {
  const byKey = new Map<string, MemoryItem>();
  for (const item of items) {
    byKey.set(
      item.key,
      Object.freeze({ key: item.key, value: item.value }),
    );
  }

  const keys = [...byKey.keys()].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );

  return Object.freeze(
    keys.map((key) => {
      const item = byKey.get(key)!;
      return Object.freeze({ key: item.key, value: item.value });
    }),
  );
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  return String(value);
}
