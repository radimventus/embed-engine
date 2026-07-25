/**
 * PT-004 / PT-005 — AI Service orchestrator.
 *
 * Single entry point for Experience / future FAQ / Report AI modules.
 * Communicates only through LLMProvider — never through a vendor SDK.
 * Prompt composition happens only via PromptBuilder → PromptPackage.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import type { PromptPackage } from "../prompt/models/PromptPackage";
import { promptPackageToChatRequest } from "../prompt/PromptBuilder";
import type { LLMProvider } from "../providers/LLMProvider";

export type AIServiceOptions = {
  readonly provider: LLMProvider;
};

export class AIService {
  private provider: LLMProvider;

  constructor(options: AIServiceOptions) {
    this.provider = options.provider;
  }

  /** Current provider (for tests / diagnostics — not vendor-specific). */
  getProvider(): LLMProvider {
    return this.provider;
  }

  /** Swap provider without changing callers (PT-004 validation). */
  setProvider(provider: LLMProvider): void {
    this.provider = provider;
  }

  chat(request: ChatRequest): Promise<ChatResponse> {
    return this.provider.chat(request);
  }

  /**
   * Transport a PromptPackage assembled by PromptBuilder.
   * Provider never composes prompts — only receives the package as ChatRequest.
   */
  chatWithPackage(
    sessionId: string,
    promptPackage: PromptPackage,
  ): Promise<ChatResponse> {
    return this.chat(promptPackageToChatRequest(sessionId, promptPackage));
  }
}

export function createAIService(provider: LLMProvider): AIService {
  return new AIService({ provider });
}
