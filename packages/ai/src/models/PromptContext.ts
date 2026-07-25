/**
 * PT-004 / PT-005 / PT-010 — Prompt context for LLM chat.
 *
 * Carries interpretive Runtime context into AI without vendor coupling.
 * Assembled only by PromptBuilder — never by Providers.
 * memory is ResolvedMemory (active view), not DecisionMemory history.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage } from "./ChatRequest";
import type { ResolvedMemory } from "../memory/models/ResolvedMemory";
import type { KnowledgeContext } from "../prompt/models/KnowledgeContext";
import type { RecommendationContext } from "../recommendation/models/RecommendationContext";

/** Object slice available to prompts. */
export type ObjectContext = {
  readonly objectId: string | null;
  readonly reference: string | null;
  readonly title: string | null;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly knowledge: KnowledgeContext;
  readonly mediaReferences: readonly string[];
};

/** Conversation slice — recent window only. */
export type ConversationContext = {
  readonly sessionId: string;
  readonly turnCount: number;
  readonly recentMessages: readonly ChatMessage[];
};

export type PromptContext = {
  readonly decision: DecisionContext;
  readonly object: ObjectContext;
  readonly conversation: ConversationContext;
  readonly memory: ResolvedMemory;
  /** Deterministic recommendation guidance (PT-013) — LLM explains, does not invent. */
  readonly recommendation: RecommendationContext;
  readonly knowledge: KnowledgeContext;
};
