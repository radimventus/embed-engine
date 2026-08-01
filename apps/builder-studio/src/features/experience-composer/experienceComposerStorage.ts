/**
 * EPIC-BX-03 — persist Experience compositions per project (not HP content).
 */

import {
  createDefaultExperienceComposition,
  emptyExperienceComposerStore,
  EXPERIENCE_COMPOSER_STORAGE_KEY,
  type ExperienceComposition,
  type ExperienceComposerStore,
} from './experienceComposition';

export function loadExperienceComposerStore(): ExperienceComposerStore {
  if (typeof localStorage === 'undefined') {
    return emptyExperienceComposerStore();
  }
  try {
    const raw = localStorage.getItem(EXPERIENCE_COMPOSER_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return emptyExperienceComposerStore();
    }
    const parsed = JSON.parse(raw) as ExperienceComposerStore;
    if (parsed === null || typeof parsed !== 'object' || parsed.byProjectId == null) {
      return emptyExperienceComposerStore();
    }
    return parsed;
  } catch {
    return emptyExperienceComposerStore();
  }
}

export function saveExperienceComposerStore(
  store: ExperienceComposerStore,
): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(EXPERIENCE_COMPOSER_STORAGE_KEY, JSON.stringify(store));
}

export function loadExperienceComposition(
  projectId: string,
  heroImagePath?: string,
): ExperienceComposition {
  const store = loadExperienceComposerStore();
  const existing = store.byProjectId[projectId];
  if (existing !== undefined) {
    return existing;
  }
  return createDefaultExperienceComposition(projectId, heroImagePath);
}

export function persistExperienceComposition(
  composition: ExperienceComposition,
): void {
  const store = loadExperienceComposerStore();
  saveExperienceComposerStore({
    byProjectId: {
      ...store.byProjectId,
      [composition.projectId]: composition,
    },
  });
}
