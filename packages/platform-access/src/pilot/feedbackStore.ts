/**
 * EPIC-BX-15 — Global feedback (Platform Shell companion store).
 */

import type { PlatformFeedbackPayload } from '../domain/pilotTypes';

export const FEEDBACK_STORAGE_KEY = 'conis.platform.feedback.v1';

let memoryFeedback: PlatformFeedbackPayload[] = [];

export function submitPlatformFeedback(
  payload: Omit<PlatformFeedbackPayload, 'createdAt'> & {
    readonly createdAt?: string;
  },
): PlatformFeedbackPayload {
  const entry: PlatformFeedbackPayload = {
    message: payload.message.trim(),
    email: payload.email,
    studioId: payload.studioId,
    companyId: payload.companyId,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };
  memoryFeedback = [entry, ...memoryFeedback].slice(0, 50);
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const prev =
        raw !== null
          ? (JSON.parse(raw) as { entries?: PlatformFeedbackPayload[] })
          : { entries: [] };
      const entries = [entry, ...(prev.entries ?? [])].slice(0, 50);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify({ entries }));
    } catch {
      // ignore
    }
  }
  return entry;
}

export function listPlatformFeedback(): readonly PlatformFeedbackPayload[] {
  if (typeof localStorage === 'undefined') return memoryFeedback;
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw === null) return memoryFeedback;
    const parsed = JSON.parse(raw) as { entries?: PlatformFeedbackPayload[] };
    return parsed.entries ?? memoryFeedback;
  } catch {
    return memoryFeedback;
  }
}
