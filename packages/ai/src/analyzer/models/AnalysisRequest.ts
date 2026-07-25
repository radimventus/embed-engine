/**
 * PT-007 — Analysis request / result contracts.
 * Structured decision extraction only — never user-facing prose.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage } from "../../models/ChatRequest";
import type { MemoryItem } from "../../prompt/models/DecisionMemory";

export type AnalysisRequest = {
  /** Latest user message to interpret. */
  readonly message: string;
  /** Short conversation window (not long-term history). */
  readonly recentMessages?: readonly ChatMessage[];
  /** Decision Context only — Analyzer never reads Runtime. */
  readonly decision: DecisionContext;
};

export type AnalysisResult = {
  readonly facts: readonly MemoryItem[];
  readonly preferences: readonly MemoryItem[];
  readonly constraints: readonly MemoryItem[];
  readonly goals: readonly MemoryItem[];
  readonly concerns: readonly MemoryItem[];
  readonly rejectedOptions: readonly MemoryItem[];
  readonly acceptedOptions: readonly MemoryItem[];
  /** 0..1 confidence in the extraction. */
  readonly confidence: number;
};

export function emptyAnalysisResult(confidence = 0): AnalysisResult {
  return Object.freeze({
    facts: Object.freeze([] as MemoryItem[]),
    preferences: Object.freeze([] as MemoryItem[]),
    constraints: Object.freeze([] as MemoryItem[]),
    goals: Object.freeze([] as MemoryItem[]),
    concerns: Object.freeze([] as MemoryItem[]),
    rejectedOptions: Object.freeze([] as MemoryItem[]),
    acceptedOptions: Object.freeze([] as MemoryItem[]),
    confidence,
  });
}
