/**
 * EPIC-BX-06 — Apply Builder Preview Center persona to Shared Runtime.
 * Reads sessionStorage written by Builder before Embed.mount; dispatches ChangePriority.
 * Does not invent interpretation — Runtime owns semantics.
 */

import { useEffect, useRef } from 'react';

import { useDecisionSessionRuntime } from './DecisionSessionRuntimeProvider';

export const BUILDER_PREVIEW_PERSONA_STORAGE_KEY =
  'conis.builder.preview-persona.v1' as const;

type BuilderPreviewPersonaPayload = {
  readonly personaId: string;
  readonly priorityIds: readonly string[];
  readonly updatedAt: string;
};

function readPayload(): BuilderPreviewPersonaPayload | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(BUILDER_PREVIEW_PERSONA_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return null;
    }
    const parsed = JSON.parse(raw) as BuilderPreviewPersonaPayload;
    if (
      parsed?.personaId == null ||
      !Array.isArray(parsed.priorityIds) ||
      parsed.priorityIds.length === 0
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Mount once inside Decision Session tree after Runtime is ready.
 */
export function BuilderPreviewPersonaApplicator() {
  const { dispatch, experience, ready } = useDecisionSessionRuntime();
  const lastKey = useRef('');

  useEffect(() => {
    if (!ready) {
      return;
    }
    const payload = readPayload();
    if (payload === null) {
      return;
    }
    const key = `${payload.personaId}:${payload.priorityIds.join(',')}:${payload.updatedAt}`;
    if (key === lastKey.current) {
      return;
    }
    const current = experience.context.decision.priorityIds.join(',');
    const next = payload.priorityIds.join(',');
    if (current === next) {
      lastKey.current = key;
      return;
    }
    const result = dispatch({
      type: 'ChangePriority',
      priorityIds: [...payload.priorityIds],
    });
    if (result.ok) {
      lastKey.current = key;
    }
  }, [dispatch, experience.context.decision.priorityIds, ready]);

  return null;
}
