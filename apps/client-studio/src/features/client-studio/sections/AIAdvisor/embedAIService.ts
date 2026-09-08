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
let embedAIServiceScope: string | null = null;

/** Stable Company + Project + Runtime House boundary for one AI conversation. */
export function createEmbedAISessionScope(input: {
  readonly companyId: string | null;
  readonly projectId: string | null;
  readonly runtimeHouseId: string | null;
  readonly canonicalHouseId: string | null;
}): string {
  return [
    input.companyId ?? 'unknown-company',
    input.projectId ?? 'unknown-project',
    input.runtimeHouseId ?? input.canonicalHouseId ?? 'unknown-house',
  ].join('::');
}

/**
 * Single in-memory pilot session for the current page load.
 * Reload → new conversation (no persistence).
 */
export function getEmbedAIService(scope?: string): AIService {
  if (
    embedAIService !== null &&
    (scope === undefined || embedAIServiceScope === scope)
  ) {
    return embedAIService;
  }

  if (scope !== undefined && embedAIServiceScope !== scope) {
    embedAIService = null;
  }

  const diagnosticsEnabled = readPublicFlag('VITE_AI_DIAGNOSTICS') !== '0';
  const recorderEnabled = readPublicFlag('VITE_AI_RECORDER') !== '0';

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `embed-${crypto.randomUUID()}`
      : `embed-${Date.now().toString(36)}`;

  embedAIServiceScope = scope ?? embedAIServiceScope;
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
  embedAIServiceScope = null;
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
