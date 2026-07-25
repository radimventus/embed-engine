/**
 * PT-012 — Pure measurement helpers (no I/O, no mutation).
 */

import type { LLMProvider } from "../providers/LLMProvider";
import type { DecisionMemory } from "../prompt/models/DecisionMemory";
import type { PromptPackage } from "../prompt/models/PromptPackage";
import type { ResolvedMemory } from "../memory/models/ResolvedMemory";
import type { PromptTrace } from "./models/DiagnosticEvent";

export function measurePromptPackage(promptPackage: PromptPackage): PromptTrace {
  let packageChars = 0;
  let memoryContextChars = 0;

  for (const section of promptPackage.sections) {
    packageChars += section.content.length;
    if (section.id === "decision-memory") {
      memoryContextChars = section.content.length;
    }
  }

  return Object.freeze({
    packageChars,
    sectionCount: promptPackage.sections.length,
    memoryContextChars,
  });
}

export function countMemoryBuckets(memory: DecisionMemory): {
  readonly facts: number;
  readonly preferences: number;
  readonly constraints: number;
  readonly goals: number;
  readonly concerns: number;
  readonly acceptedOptions: number;
  readonly rejectedOptions: number;
} {
  return Object.freeze({
    facts: memory.facts.length,
    preferences: memory.preferences.length,
    constraints: memory.constraints.length,
    goals: memory.goals.length,
    concerns: memory.concerns.length,
    acceptedOptions: memory.acceptedOptions.length,
    rejectedOptions: memory.rejectedOptions.length,
  });
}

export function countActiveResolved(resolved: ResolvedMemory): number {
  return (
    resolved.facts.length +
    resolved.preferences.length +
    resolved.constraints.length +
    resolved.goals.length +
    resolved.concerns.length +
    resolved.acceptedOptions.length +
    resolved.rejectedOptions.length
  );
}

/**
 * Duck-type provider metadata — Providers may expose id/model; diagnostics never imports vendors.
 */
export function readProviderMeta(provider: LLMProvider): {
  readonly providerId: string;
  readonly model: string | null;
} {
  const meta = provider as LLMProvider & {
    readonly id?: unknown;
    readonly model?: unknown;
  };
  return {
    providerId: typeof meta.id === "string" ? meta.id : "unknown",
    model: typeof meta.model === "string" ? meta.model : null,
  };
}
