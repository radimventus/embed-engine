/**
 * PT-005 — Prompt module public surface.
 */

export {
  createPromptBuilder,
  promptPackageToChatRequest,
  PromptBuilder,
  DEFAULT_PARTNER_IDENTITY,
  type PromptBuilderInput,
  type PromptBuilderOptions,
} from "./PromptBuilder";

export {
  assemblePromptPackage,
  formatDecisionContextSection,
  formatDecisionMemorySection,
  formatPartnerIdentitySection,
  type PromptAssemblerInput,
} from "./PromptAssembler";

export {
  createSystemPromptFactory,
  DEFAULT_SYSTEM_PROMPT_LINES,
  type SystemPromptFactoryOptions,
} from "./SystemPromptFactory";

export {
  buildObjectContext,
  formatObjectContextSection,
  type ObjectContextInput,
} from "./builders/ObjectContextBuilder";

export {
  buildConversationContext,
  formatConversationContextSection,
  DEFAULT_CONVERSATION_WINDOW,
  type ConversationContextInput,
} from "./builders/ConversationContextBuilder";

export type {
  PromptPackage,
  PromptSection,
  PromptSectionId,
} from "./models/PromptPackage";
export { PROMPT_SECTION_ORDER } from "./models/PromptPackage";

export type { DecisionMemory } from "./models/DecisionMemory";
export { emptyDecisionMemory } from "./models/DecisionMemory";

export type {
  KnowledgeContext,
  KnowledgeEntry,
} from "./models/KnowledgeContext";
export { emptyKnowledgeContext } from "./models/KnowledgeContext";
