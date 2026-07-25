/**
 * PT-005 — PromptAssembler.
 * Joins sections in mandatory order. Deterministic.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage } from "../models/ChatRequest";
import type { PromptContext } from "../models/PromptContext";
import type { SystemPrompt } from "../models/SystemPrompt";
import { formatConversationContextSection } from "./builders/ConversationContextBuilder";
import { formatObjectContextSection } from "./builders/ObjectContextBuilder";
import type { DecisionMemory } from "./models/DecisionMemory";
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

export function formatDecisionMemorySection(memory: DecisionMemory): string {
  return [
    "Decision Memory",
    formatMemoryBucket("facts", memory.facts),
    formatMemoryBucket("preferences", memory.preferences),
    formatMemoryBucket("constraints", memory.constraints),
    formatMemoryBucket("goals", memory.goals),
    formatMemoryBucket("concerns", memory.concerns),
    formatMemoryBucket("acceptedOptions", memory.acceptedOptions),
    formatMemoryBucket("rejectedOptions", memory.rejectedOptions),
  ].join("\n");
}

function formatMemoryBucket(
  label: string,
  items: readonly { readonly key: string; readonly value: string | number | boolean }[],
): string {
  if (items.length === 0) {
    return `${label}: (none)`;
  }
  return `${label}: ${items.map((item) => `${item.key}=${String(item.value)}`).join(" | ")}`;
}

export function formatPartnerIdentitySection(partnerIdentity: string): string {
  return ["Partner Identity", partnerIdentity].join("\n");
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
