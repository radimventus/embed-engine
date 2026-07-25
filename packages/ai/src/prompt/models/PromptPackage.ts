/**
 * PT-005 — PromptPackage: sole assembled input for LLM transport.
 *
 * Providers must not compose prompts — they only receive this package
 * (via ChatRequest derived from it).
 */

import type { ChatMessage } from "../../models/ChatRequest";
import type { PromptContext } from "../../models/PromptContext";
import type { SystemPrompt } from "../../models/SystemPrompt";

/** Mandatory assembly order (PT-005). */
export const PROMPT_SECTION_ORDER = [
  "system",
  "partner-identity",
  "object-context",
  "decision-context",
  "decision-memory",
  "recommendation-context",
  "conversation-context",
  "user-message",
] as const;

export type PromptSectionId = (typeof PROMPT_SECTION_ORDER)[number];

export type PromptSection = {
  readonly id: PromptSectionId;
  readonly content: string;
};

export type PromptPackage = {
  readonly systemPrompt: SystemPrompt;
  readonly context: PromptContext;
  readonly messages: readonly ChatMessage[];
  /** Ordered sections — same input ⇒ same sections (determinism). */
  readonly sections: readonly PromptSection[];
};
