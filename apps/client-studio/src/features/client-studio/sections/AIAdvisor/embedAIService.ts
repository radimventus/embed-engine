/**
 * PT-011 / CAP-AI-PUBLISH-01 — Bootstrap AIService for Embed Experience.
 *
 * Secret-free: Experience never reads API keys or constructs Adapters.
 * Delivery host binding chooses Local vs Published vs disabled.
 */

import {
  createAIDiagnostics,
  createAIServiceFromDelivery,
  createConversationRecorder,
  createEmbedAIDelivery,
  type AIService,
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

  const diagnosticsEnabled = readPublicFlag('VITE_AI_DIAGNOSTICS') !== '0';
  const recorderEnabled = readPublicFlag('VITE_AI_RECORDER') !== '0';

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `embed-${crypto.randomUUID()}`
      : `embed-${Date.now().toString(36)}`;

  embedAIService = createAIServiceFromDelivery(createEmbedAIDelivery(), {
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

/** Non-secret public flags only — never API keys. */
function readPublicFlag(
  name: 'VITE_AI_DIAGNOSTICS' | 'VITE_AI_RECORDER',
): string | undefined {
  const value = import.meta.env[name];
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}
