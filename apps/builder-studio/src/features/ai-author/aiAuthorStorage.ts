/**
 * EPIC-BX-10 — AI Author suggestion history (local, not HP-002).
 */

import {
  AI_AUTHOR_STORAGE_KEY,
  type AiSuggestion,
  type AiSuggestionStatus,
} from './aiAuthorTypes';

export type AiAuthorStore = {
  readonly byProjectId: Readonly<Record<string, readonly AiSuggestion[]>>;
};

let memoryStore: AiAuthorStore = { byProjectId: {} };

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function loadAiAuthorStore(): AiAuthorStore {
  if (!canUseLocalStorage()) {
    return memoryStore;
  }
  try {
    const raw = localStorage.getItem(AI_AUTHOR_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return { byProjectId: {} };
    }
    const parsed = JSON.parse(raw) as AiAuthorStore;
    if (parsed?.byProjectId == null) {
      return { byProjectId: {} };
    }
    return parsed;
  } catch {
    return { byProjectId: {} };
  }
}

export function saveAiAuthorStore(store: AiAuthorStore): void {
  memoryStore = store;
  if (!canUseLocalStorage()) {
    return;
  }
  localStorage.setItem(AI_AUTHOR_STORAGE_KEY, JSON.stringify(store));
}

export function listProjectSuggestions(
  projectId: string,
): readonly AiSuggestion[] {
  return loadAiAuthorStore().byProjectId[projectId] ?? [];
}

export function appendSuggestion(suggestion: AiSuggestion): AiSuggestion {
  const store = loadAiAuthorStore();
  const existing = store.byProjectId[suggestion.projectId] ?? [];
  saveAiAuthorStore({
    byProjectId: {
      ...store.byProjectId,
      [suggestion.projectId]: [suggestion, ...existing].slice(0, 100),
    },
  });
  return suggestion;
}

export function resolveSuggestion(
  projectId: string,
  suggestionId: string,
  status: Exclude<AiSuggestionStatus, 'generated'>,
): AiSuggestion | null {
  const store = loadAiAuthorStore();
  const list = store.byProjectId[projectId] ?? [];
  let updated: AiSuggestion | null = null;
  const next = list.map((item) => {
    if (item.id !== suggestionId) {
      return item;
    }
    updated = {
      ...item,
      status,
      resolvedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated === null) {
    return null;
  }
  saveAiAuthorStore({
    byProjectId: {
      ...store.byProjectId,
      [projectId]: next,
    },
  });
  return updated;
}
