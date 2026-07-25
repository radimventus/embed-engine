/**
 * PT-005 — ConversationContextBuilder.
 * Only the last N messages — no long-term history.
 */

import type { ChatMessage } from "../../models/ChatRequest";
import type { ConversationContext } from "../../models/PromptContext";

export const DEFAULT_CONVERSATION_WINDOW = 10;

export type ConversationContextInput = {
  readonly sessionId: string;
  readonly messages: readonly ChatMessage[];
  readonly maxMessages?: number;
};

export function buildConversationContext(
  input: ConversationContextInput,
): ConversationContext {
  const max = input.maxMessages ?? DEFAULT_CONVERSATION_WINDOW;
  const window =
    max <= 0 ? [] : input.messages.slice(Math.max(0, input.messages.length - max));

  return Object.freeze({
    sessionId: input.sessionId,
    turnCount: input.messages.length,
    recentMessages: Object.freeze(
      window.map((message) =>
        Object.freeze({
          role: message.role,
          content: message.content,
        }),
      ),
    ),
  });
}

export function formatConversationContextSection(
  conversation: ConversationContext,
): string {
  const lines = [
    "Conversation Context",
    `sessionId: ${conversation.sessionId}`,
    `turnCount: ${conversation.turnCount}`,
  ];

  if (conversation.recentMessages.length === 0) {
    lines.push("recentMessages: (none)");
  } else {
    lines.push("recentMessages:");
    for (const message of conversation.recentMessages) {
      lines.push(`  - ${message.role}: ${message.content}`);
    }
  }

  return lines.join("\n");
}
