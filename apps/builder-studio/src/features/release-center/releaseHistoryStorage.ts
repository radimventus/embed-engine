/**
 * EPIC-BX-07 — Release history + notes (release metadata, not HP-002).
 */

import {
  createReleaseRecord,
  emptyReleaseNotesDraft,
  type ReleaseNotesDraft,
  type ReleaseRecord,
} from './releaseRecord';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type { ReleaseProductSnapshot } from './releaseRecord';
import type { DecisionQaReport } from '../preview-center/decisionQa';

export const RELEASE_HISTORY_STORAGE_KEY =
  'conis.builder.release-history.v1' as const;

export const RELEASE_NOTES_STORAGE_KEY =
  'conis.builder.release-notes.v1' as const;

export type ReleaseHistoryStore = {
  readonly byProjectId: Readonly<
    Record<
      string,
      {
        readonly activeReleaseId: string | null;
        readonly releases: readonly ReleaseRecord[];
      }
    >
  >;
};

export type ReleaseNotesStore = {
  readonly byProjectId: Readonly<Record<string, ReleaseNotesDraft>>;
};

/** In-memory fallback when localStorage is unavailable (tests / SSR). */
let memoryHistoryStore: ReleaseHistoryStore = { byProjectId: {} };
let memoryNotesStore: ReleaseNotesStore = { byProjectId: {} };

function emptyHistoryStore(): ReleaseHistoryStore {
  return { byProjectId: {} };
}

function emptyNotesStore(): ReleaseNotesStore {
  return { byProjectId: {} };
}

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function loadReleaseHistoryStore(): ReleaseHistoryStore {
  if (!canUseLocalStorage()) {
    return memoryHistoryStore;
  }
  try {
    const raw = localStorage.getItem(RELEASE_HISTORY_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return emptyHistoryStore();
    }
    const parsed = JSON.parse(raw) as ReleaseHistoryStore;
    if (parsed?.byProjectId == null) {
      return emptyHistoryStore();
    }
    return parsed;
  } catch {
    return emptyHistoryStore();
  }
}

export function saveReleaseHistoryStore(store: ReleaseHistoryStore): void {
  memoryHistoryStore = store;
  if (!canUseLocalStorage()) {
    return;
  }
  localStorage.setItem(RELEASE_HISTORY_STORAGE_KEY, JSON.stringify(store));
}

export function loadProjectReleases(projectId: string): {
  readonly activeReleaseId: string | null;
  readonly releases: readonly ReleaseRecord[];
} {
  const project = loadReleaseHistoryStore().byProjectId[projectId];
  return {
    activeReleaseId: project?.activeReleaseId ?? null,
    releases: project?.releases ?? [],
  };
}

export function appendReleaseRecord(input: {
  readonly projectId: string;
  readonly summary: HousePackageReleaseSummary;
  readonly notes: ReleaseNotesDraft;
  readonly product: ReleaseProductSnapshot;
  readonly qa: DecisionQaReport;
  readonly author?: string;
}): ReleaseRecord {
  const store = loadReleaseHistoryStore();
  const existing = store.byProjectId[input.projectId];
  const previous = existing?.releases ?? [];
  const record = createReleaseRecord(input);
  const superseded = previous.map((item) =>
    item.status === 'active'
      ? { ...item, status: 'superseded' as const }
      : item,
  );
  const withoutDup = superseded.filter((item) => item.id !== record.id);
  saveReleaseHistoryStore({
    byProjectId: {
      ...store.byProjectId,
      [input.projectId]: {
        activeReleaseId: record.id,
        releases: [record, ...withoutDup],
      },
    },
  });
  return record;
}

/**
 * Rollback activates an existing release record — no new publish.
 */
export function rollbackToRelease(
  projectId: string,
  releaseId: string,
): ReleaseRecord | null {
  const store = loadReleaseHistoryStore();
  const project = store.byProjectId[projectId];
  if (project === undefined) {
    return null;
  }
  const target = project.releases.find((item) => item.id === releaseId);
  if (target === undefined) {
    return null;
  }
  const releases = project.releases.map((item) => {
    if (item.id === releaseId) {
      return { ...item, status: 'active' as const };
    }
    if (item.status === 'active') {
      return { ...item, status: 'rolled-back' as const };
    }
    return item;
  });
  saveReleaseHistoryStore({
    byProjectId: {
      ...store.byProjectId,
      [projectId]: {
        activeReleaseId: releaseId,
        releases,
      },
    },
  });
  return { ...target, status: 'active' };
}

export function loadReleaseNotesDraft(projectId: string): ReleaseNotesDraft {
  if (!canUseLocalStorage()) {
    return memoryNotesStore.byProjectId[projectId] ?? emptyReleaseNotesDraft();
  }
  try {
    const raw = localStorage.getItem(RELEASE_NOTES_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return emptyReleaseNotesDraft();
    }
    const parsed = JSON.parse(raw) as ReleaseNotesStore;
    return parsed.byProjectId?.[projectId] ?? emptyReleaseNotesDraft();
  } catch {
    return emptyReleaseNotesDraft();
  }
}

export function saveReleaseNotesDraft(
  projectId: string,
  draft: Omit<ReleaseNotesDraft, 'updatedAt'> | ReleaseNotesDraft,
): ReleaseNotesDraft {
  const next: ReleaseNotesDraft = {
    changed: draft.changed,
    why: draft.why,
    internal: draft.internal,
    updatedAt: new Date().toISOString(),
  };
  memoryNotesStore = {
    byProjectId: {
      ...memoryNotesStore.byProjectId,
      [projectId]: next,
    },
  };
  if (!canUseLocalStorage()) {
    return next;
  }
  let store = emptyNotesStore();
  try {
    const raw = localStorage.getItem(RELEASE_NOTES_STORAGE_KEY);
    if (raw !== null && raw.length > 0) {
      const parsed = JSON.parse(raw) as ReleaseNotesStore;
      if (parsed?.byProjectId != null) {
        store = parsed;
      }
    }
  } catch {
    store = emptyNotesStore();
  }
  localStorage.setItem(
    RELEASE_NOTES_STORAGE_KEY,
    JSON.stringify({
      byProjectId: {
        ...store.byProjectId,
        [projectId]: next,
      },
    } satisfies ReleaseNotesStore),
  );
  return next;
}

export function clearReleaseNotesDraft(projectId: string): void {
  saveReleaseNotesDraft(projectId, emptyReleaseNotesDraft());
}
