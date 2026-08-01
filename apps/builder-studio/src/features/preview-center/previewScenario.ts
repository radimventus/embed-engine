/**
 * EPIC-BX-06 — Builder → Client Studio preview scenario bridge.
 * Written before Embed.mount; Client Studio applies ChangePriority on Shared Runtime.
 * Not a media/content model — scenario input only.
 */

import type { PreviewPersonaId } from './previewPersonas';
import { getPreviewPersona } from './previewPersonas';

export const BUILDER_PREVIEW_PERSONA_STORAGE_KEY =
  'conis.builder.preview-persona.v1' as const;

export type BuilderPreviewPersonaPayload = {
  readonly personaId: PreviewPersonaId;
  readonly priorityIds: readonly string[];
  readonly updatedAt: string;
};

export function writePreviewPersonaScenario(
  personaId: PreviewPersonaId,
): BuilderPreviewPersonaPayload {
  const persona = getPreviewPersona(personaId);
  const payload: BuilderPreviewPersonaPayload = {
    personaId: persona.id,
    priorityIds: persona.priorityIds,
    updatedAt: new Date().toISOString(),
  };
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(
      BUILDER_PREVIEW_PERSONA_STORAGE_KEY,
      JSON.stringify(payload),
    );
  }
  return payload;
}

export function clearPreviewPersonaScenario(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.removeItem(BUILDER_PREVIEW_PERSONA_STORAGE_KEY);
}

export function readPreviewPersonaScenario(): BuilderPreviewPersonaPayload | null {
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
