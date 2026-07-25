/**
 * PT-004 — AI Service orchestrator.
 *
 * Single entry point for Experience / future FAQ / Report AI modules.
 * Communicates only through LLMProvider — never through a vendor SDK.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
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
}

export function createAIService(provider: LLMProvider): AIService {
  return new AIService({ provider });
}
