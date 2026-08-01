/**
 * EPIC-BX-20 — Learning Feedback Registry over existing platform entities.
 */

import type { CapabilityId } from '@embed-engine/capabilities';
import type { PlatformStudioId } from '@embed-engine/platform-access';

import type { LearningFeedbackEntry } from '../domain/types';
import {
  classifyLearningCategory,
  inferCapabilityFromMessage,
} from '../engine/classifyLearningFeedback';

export const LEARNING_FEEDBACK_STORAGE_KEY = 'conis.product-learning.feedback.v1';

let memoryEntries: LearningFeedbackEntry[] = [];

type Store = { readonly entries: LearningFeedbackEntry[] };

function loadStore(): Store {
  if (typeof localStorage === 'undefined') {
    return { entries: memoryEntries };
  }
  try {
    const raw = localStorage.getItem(LEARNING_FEEDBACK_STORAGE_KEY);
    if (raw === null) return { entries: memoryEntries };
    const parsed = JSON.parse(raw) as Store;
    memoryEntries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return { entries: memoryEntries };
  } catch {
    return { entries: memoryEntries };
  }
}

function saveStore(entries: LearningFeedbackEntry[]): void {
  memoryEntries = entries.slice(0, 200);
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      LEARNING_FEEDBACK_STORAGE_KEY,
      JSON.stringify({ entries: memoryEntries }),
    );
  } catch {
    // ignore
  }
}

export function resetLearningFeedbackRegistry(): void {
  memoryEntries = [];
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LEARNING_FEEDBACK_STORAGE_KEY);
  }
}

export function listLearningFeedback(): readonly LearningFeedbackEntry[] {
  return loadStore().entries;
}

export function registerLearningFeedback(input: {
  readonly message: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId?: string | null;
  readonly studioId?: PlatformStudioId | null;
  readonly capabilityId?: CapabilityId | null;
  readonly releaseLabel?: string | null;
  readonly source?: LearningFeedbackEntry['source'];
  readonly createdAt?: string;
  readonly id?: string;
}): LearningFeedbackEntry {
  const message = input.message.trim();
  const category = classifyLearningCategory(message);
  const studioId = input.studioId ?? null;
  const entry: LearningFeedbackEntry = {
    id: input.id ?? `learn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    category,
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    projectId: input.projectId ?? null,
    studioId,
    capabilityId:
      input.capabilityId ?? inferCapabilityFromMessage(message, studioId),
    releaseLabel: input.releaseLabel ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
    source: input.source ?? 'learning',
  };
  const store = loadStore();
  saveStore([entry, ...store.entries]);
  return entry;
}

export function upsertLearningFeedback(entry: LearningFeedbackEntry): void {
  const store = loadStore();
  if (store.entries.some((item) => item.id === entry.id)) return;
  saveStore([entry, ...store.entries]);
}
