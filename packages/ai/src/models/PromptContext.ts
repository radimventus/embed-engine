/**
 * PT-004 — Prompt context for LLM chat.
 *
 * Carries interpretive Runtime context into AI without vendor coupling.
 * Expand later (FAQ, memory) — do not add provider-specific fields.
 */

import type { DecisionContext } from "@embed-engine/runtime";

/** Object slice available to prompts (MVP). */
export type ObjectContext = {
  readonly objectId: string | null;
  readonly reference: string | null;
  readonly title: string | null;
};

/** Conversation slice available to prompts (MVP). */
export type ConversationContext = {
  readonly sessionId: string;
  readonly turnCount: number;
};

export type PromptContext = {
  readonly decision: DecisionContext;
  readonly object: ObjectContext;
  readonly conversation: ConversationContext;
};
