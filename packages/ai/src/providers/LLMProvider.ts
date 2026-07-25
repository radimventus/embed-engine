/**
 * PT-004 — LLM Provider interface.
 *
 * Sole bridge from Conis AI to any language model.
 * Implementations are swappable — Runtime and AIService must not know which.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";

export interface LLMProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
}
