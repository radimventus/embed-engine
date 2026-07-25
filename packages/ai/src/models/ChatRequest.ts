/**
 * PT-004 — Chat request / message contracts.
 * Provider-neutral. No vendor-specific fields.
 */

import type { PromptContext } from "./PromptContext";
import type { SystemPrompt } from "./SystemPrompt";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  readonly role: ChatRole;
  readonly content: string;
};

export type ChatRequest = {
  readonly sessionId: string;
  readonly systemPrompt: SystemPrompt;
  readonly context: PromptContext;
  readonly messages: readonly ChatMessage[];
};
