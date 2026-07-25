/**
 * PT-005 — PromptAssembler.
 * Joins sections in mandatory order. Deterministic.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage } from "../models/ChatRequest";
import type { PromptContext } from "../models/PromptContext";
import type { SystemPrompt } from "../models/SystemPrompt";
import { formatConversationContextSection } from "./builders/ConversationContextBuilder";
import { formatMemoryContextSection } from "./builders/MemoryContextBuilder";
import { formatObjectContextSection } from "./builders/ObjectContextBuilder";
import { formatRecommendationContextSection } from "./builders/RecommendationContextBuilder";
import type { DecisionMemory } from "./models/DecisionMemory";
import type { ResolvedMemory } from "../memory/models/ResolvedMemory";
import type { RecommendationContext } from "../recommendation/models/RecommendationContext";
import {
  PROMPT_SECTION_ORDER,
  type PromptPackage,
  type PromptSection,
} from "./models/PromptPackage";

export type PromptAssemblerInput = {
  readonly systemPrompt: SystemPrompt;
  readonly partnerIdentity: string;
  readonly context: PromptContext;
  readonly currentUserMessage: string;
  /** Prior turns only (current user message is appended separately). */
  readonly historyMessages: readonly ChatMessage[];
};

export function formatDecisionContextSection(decision: DecisionContext): string {
  const lines = [
    "Decision Context",
    `headline: ${decision.headline}`,
    `summary: ${decision.summary}`,
    `focusPriority: ${decision.focusPriority ?? "null"}`,
    `secondaryPriority: ${decision.secondaryPriority ?? "null"}`,
    `selectedPriorities: ${
      decision.selectedPriorities.length === 0
        ? "(none)"
        : decision.selectedPriorities.join(", ")
    }`,
    `recommendations: ${
      decision.recommendations.length === 0
        ? "(none)"
        : decision.recommendations.join(" | ")
    }`,
  ];
  return lines.join("\n");
}

export function formatDecisionMemorySection(
  memory: DecisionMemory | ResolvedMemory,
): string {
  return formatMemoryContextSection(memory);
}

export function formatPartnerIdentitySection(partnerIdentity: string): string {
  return ["Partner Identity", partnerIdentity].join("\n");
}

export function formatRecommendationSection(
  recommendation: RecommendationContext,
): string {
  return formatRecommendationContextSection(recommendation);
}

/**
 * Assemble PromptPackage. Section order is fixed by PROMPT_SECTION_ORDER.
 */
export function assemblePromptPackage(
  input: PromptAssemblerInput,
): PromptPackage {
  const sections: PromptSection[] = [
    {
      id: "system",
      content: input.systemPrompt.content,
    },
    {
      id: "partner-identity",
      content: formatPartnerIdentitySection(input.partnerIdentity),
    },
    {
      id: "object-context",
      content: formatObjectContextSection(input.context.object),
    },
    {
      id: "decision-context",
      content: formatDecisionContextSection(input.context.decision),
    },
    {
      id: "decision-memory",
      content: formatDecisionMemorySection(input.context.memory),
    },
    {
      id: "recommendation-context",
      content: formatRecommendationSection(input.context.recommendation),
    },
    {
      id: "conversation-context",
      content: formatConversationContextSection(input.context.conversation),
    },
    {
      id: "user-message",
      content: input.currentUserMessage,
    },
  ];

  assertSectionOrder(sections);

  const messages: ChatMessage[] = [
    ...input.historyMessages.map((message) =>
      Object.freeze({ role: message.role, content: message.content }),
    ),
    Object.freeze({
      role: "user" as const,
      content: input.currentUserMessage,
    }),
  ];

  return Object.freeze({
    systemPrompt: input.systemPrompt,
    context: input.context,
    messages: Object.freeze(messages),
    sections: Object.freeze(sections),
  });
}

function assertSectionOrder(sections: readonly PromptSection[]): void {
  if (sections.length !== PROMPT_SECTION_ORDER.length) {
    throw new Error("PromptAssembler: unexpected section count.");
  }
  for (let i = 0; i < PROMPT_SECTION_ORDER.length; i += 1) {
    if (sections[i]?.id !== PROMPT_SECTION_ORDER[i]) {
      throw new Error(
        `PromptAssembler: section order violation at ${i}: expected ${PROMPT_SECTION_ORDER[i]}, got ${sections[i]?.id}`,
      );
    }
  }
}
