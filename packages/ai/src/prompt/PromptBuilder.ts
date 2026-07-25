/**
 * PT-005 — PromptBuilder.
 *
 * Sole translator: Decision Runtime data → PromptPackage → LLM transport.
 * LLM never reads Runtime or UI components directly.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage, ChatRequest } from "../models/ChatRequest";
import type { PromptContext } from "../models/PromptContext";
import { createSystemPrompt } from "../models/SystemPrompt";
import {
  buildConversationContext,
  DEFAULT_CONVERSATION_WINDOW,
} from "./builders/ConversationContextBuilder";
import { buildMemoryContext } from "./builders/MemoryContextBuilder";
import {
  buildObjectContext,
  type ObjectContextInput,
} from "./builders/ObjectContextBuilder";
import {
  emptyDecisionMemory,
  type DecisionMemory,
} from "./models/DecisionMemory";
import { emptyKnowledgeContext } from "./models/KnowledgeContext";
import type { PromptPackage } from "./models/PromptPackage";
import { assemblePromptPackage } from "./PromptAssembler";
import { createSystemPromptFactory } from "./SystemPromptFactory";
import {
  emptyRecommendationContext,
  type RecommendationContext,
} from "../recommendation/models/RecommendationContext";

export const DEFAULT_PARTNER_IDENTITY =
  "Partner: EMBED / Conis Decision Experience.";

export type PromptBuilderInput = {
  readonly sessionId: string;
  readonly decision: DecisionContext;
  readonly object?: ObjectContextInput;
  /** Decision Memory to include in PromptPackage (PT-008). */
  readonly memory?: DecisionMemory;
  /**
   * PT-013 — precomputed RecommendationContext (engine output).
   * PromptBuilder only serializes — never scores.
   */
  readonly recommendation?: RecommendationContext;
  /** Prior conversation turns (excluding the current user message). */
  readonly conversationMessages?: readonly ChatMessage[];
  readonly currentUserMessage: string;
  readonly partnerIdentity?: string;
  readonly maxConversationMessages?: number;
  readonly systemPromptLines?: readonly string[];
};

export type PromptBuilderOptions = {
  readonly partnerIdentity?: string;
  readonly maxConversationMessages?: number;
};

export class PromptBuilder {
  private readonly partnerIdentity: string;
  private readonly maxConversationMessages: number;

  constructor(options: PromptBuilderOptions = {}) {
    this.partnerIdentity =
      options.partnerIdentity ?? DEFAULT_PARTNER_IDENTITY;
    this.maxConversationMessages =
      options.maxConversationMessages ?? DEFAULT_CONVERSATION_WINDOW;
  }

  build(input: PromptBuilderInput): PromptPackage {
    const history = input.conversationMessages ?? [];
    const max =
      input.maxConversationMessages ?? this.maxConversationMessages;

    const object = buildObjectContext(input.object);
    const conversation = buildConversationContext({
      sessionId: input.sessionId,
      messages: history,
      maxMessages: max,
    });
    const memory = buildMemoryContext(input.memory ?? emptyDecisionMemory());
    const recommendation =
      input.recommendation ?? emptyRecommendationContext();
    const knowledge = emptyKnowledgeContext();

    const context: PromptContext = Object.freeze({
      decision: input.decision,
      object,
      conversation,
      memory,
      recommendation,
      knowledge,
    });

    const systemPrompt = createSystemPromptFactory({
      lines: input.systemPromptLines,
    });

    return assemblePromptPackage({
      systemPrompt,
      partnerIdentity: input.partnerIdentity ?? this.partnerIdentity,
      context,
      currentUserMessage: input.currentUserMessage,
      historyMessages: conversation.recentMessages,
    });
  }
}

export function createPromptBuilder(
  options?: PromptBuilderOptions,
): PromptBuilder {
  return new PromptBuilder(options);
}

/** Convert PromptPackage → ChatRequest for LLMProvider transport. */
export function promptPackageToChatRequest(
  sessionId: string,
  promptPackage: PromptPackage,
): ChatRequest {
  // Provider is pure transport: fold assembled sections into system content.
  // Conversation turns stay in messages; user-message section is duplicated there.
  const systemContent = promptPackage.sections
    .filter((section) => section.id !== "user-message")
    .map((section) => section.content)
    .join("\n\n");

  return Object.freeze({
    sessionId,
    systemPrompt: createSystemPrompt(systemContent),
    context: promptPackage.context,
    messages: promptPackage.messages,
  });
}
