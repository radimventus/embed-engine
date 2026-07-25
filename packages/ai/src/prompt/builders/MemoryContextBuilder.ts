/**
 * PT-008 / PT-010 — MemoryContextBuilder.
 *
 * Serializes ResolvedMemory into PromptPackage memory section.
 * Conflict resolution is owned by MemoryResolutionEngine — not here.
 */

import type { DecisionMemory } from "../models/DecisionMemory";
import {
  resolveMemory,
} from "../../memory/MemoryResolutionEngine";
import type { ResolvedMemory } from "../../memory/models/ResolvedMemory";

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
 * Resolve history → ResolvedMemory for PromptPackage context.
 * PromptBuilder passes history; this is the only place history becomes active view.
 */
export function buildMemoryContext(history: DecisionMemory): ResolvedMemory {
  return resolveMemory(history);
}

/**
 * Serialize ResolvedMemory (or resolve history first) for the prompt section.
 */
export function formatMemoryContextSection(
  memory: DecisionMemory | ResolvedMemory,
): string {
  const resolved = isResolvedMemory(memory)
    ? memory
    : buildMemoryContext(memory);

  const lines = ["Decision Memory"];

  for (const sectionId of MEMORY_SECTION_ORDER) {
    const label = MEMORY_SECTION_LABELS[sectionId];
    const items = resolved[sectionId];
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

function isResolvedMemory(
  memory: DecisionMemory | ResolvedMemory,
): memory is ResolvedMemory {
  const sample =
    memory.facts[0] ??
    memory.preferences[0] ??
    memory.constraints[0] ??
    memory.goals[0] ??
    memory.concerns[0] ??
    memory.acceptedOptions[0] ??
    memory.rejectedOptions[0];
  if (sample === undefined) {
    return true;
  }
  return !("at" in sample);
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  return String(value);
}
