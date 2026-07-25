/**
 * PT-011 / PT-012 — Bootstrap AIService for Embed Experience (Client Studio).
 *
 * Creates transport once per page load. Session lives in AIService memory only.
 * Chat UI uses getEmbedAIService() — never constructs Provider in the chat component.
 * Diagnostics / Recorder are passive and disableable via env flags.
 */

import {
  createAIDiagnostics,
  createAIService,
  createConversationRecorder,
  OpenAIProvider,
  type AIService,
  type ChatRequest,
  type ChatResponse,
  type LLMProvider,
} from '@embed-engine/ai';

let embedAIService: AIService | null = null;

/**
 * Single in-memory pilot session for the current page load.
 * Reload → new conversation (no persistence).
 */
export function getEmbedAIService(): AIService {
  if (embedAIService !== null) {
    return embedAIService;
  }

  const diagnosticsEnabled = readViteEnv('VITE_AI_DIAGNOSTICS') !== '0';
  const recorderEnabled = readViteEnv('VITE_AI_RECORDER') !== '0';

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `embed-${crypto.randomUUID()}`
      : `embed-${Date.now().toString(36)}`;

  embedAIService = createAIService(createEmbedProvider(), {
    sessionId,
    diagnostics: createAIDiagnostics({
      enabled: diagnosticsEnabled,
      console: diagnosticsEnabled,
    }),
    recorder: createConversationRecorder({
      sessionId,
      conversationId: sessionId,
      enabled: recorderEnabled,
    }),
  });
  return embedAIService;
}

/** Export current conversation audit JSON (empty when recorder disabled). */
export function exportEmbedConversationJSON(pretty = true): string {
  return getEmbedAIService().exportConversationJSON(pretty);
}

/** Test escape hatch — replace singleton. */
export function setEmbedAIServiceForTests(service: AIService | null): void {
  embedAIService = service;
}

function createEmbedProvider(): LLMProvider {
  const apiKey = readViteEnv('VITE_OPENAI_API_KEY');
  if (apiKey === undefined) {
    return {
      async chat(_request: ChatRequest): Promise<ChatResponse> {
        throw new Error(
          'OpenAIProvider: missing API key. Set OPENAI_API_KEY or pass apiKey.',
        );
      },
    };
  }

  const model = readViteEnv('VITE_OPENAI_MODEL');
  return new OpenAIProvider({
    apiKey,
    ...(model !== undefined ? { model } : {}),
  });
}

function readViteEnv(
  name:
    | 'VITE_OPENAI_API_KEY'
    | 'VITE_OPENAI_MODEL'
    | 'VITE_AI_DIAGNOSTICS'
    | 'VITE_AI_RECORDER',
): string | undefined {
  const value = import.meta.env[name];
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}
