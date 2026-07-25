/**
 * PT-004 / PT-005 — Prompt context for LLM chat.
 *
 * Carries interpretive Runtime context into AI without vendor coupling.
 * Assembled only by PromptBuilder — never by Providers.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage } from "./ChatRequest";
import type { DecisionMemory } from "../prompt/models/DecisionMemory";
import type { KnowledgeContext } from "../prompt/models/KnowledgeContext";

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
  readonly memory: DecisionMemory;
  readonly knowledge: KnowledgeContext;
};
