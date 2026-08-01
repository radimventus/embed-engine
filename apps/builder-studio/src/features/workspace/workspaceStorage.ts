/**
 * CAP-BLD-08 — persist workspace metadata in localStorage (not HP content).
 * PR-012 — auto-migrate legacy v1 keys; never require manual localStorage wipe.
 */

import {
  mergePersistedWorkspaceSlice,
  toPersistedWorkspaceSlice,
  WORKSPACE_STORAGE_KEY,
  WORKSPACE_STORAGE_KEY_LEGACY,
  type WorkspacePersistedSlice,
  type WorkspaceRegistryState,
} from './workspaceRegistry';

function parsePersistedSlice(raw: string): WorkspacePersistedSlice | null {
  try {
    const parsed = JSON.parse(raw) as WorkspacePersistedSlice;
    if (parsed === null || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Load registry. Prefer v2; if missing/corrupt, migrate readable v1 → v2.
 */
export function loadWorkspaceRegistryFromStorage(): WorkspaceRegistryState {
  if (typeof localStorage === 'undefined') {
    return mergePersistedWorkspaceSlice(null);
  }

  const v2Raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (v2Raw !== null && v2Raw.length > 0) {
    const v2 = parsePersistedSlice(v2Raw);
    if (v2 !== null) {
      const state = mergePersistedWorkspaceSlice(v2);
      // Re-persist normalized shape (folderId, folders, …) so old v2 payloads heal.
      saveWorkspaceRegistryToStorage(state);
      return state;
    }
  }

  const v1Raw = localStorage.getItem(WORKSPACE_STORAGE_KEY_LEGACY);
  if (v1Raw !== null && v1Raw.length > 0) {
    const v1 = parsePersistedSlice(v1Raw);
    const state = mergePersistedWorkspaceSlice(v1);
    saveWorkspaceRegistryToStorage(state);
    return state;
  }

  return mergePersistedWorkspaceSlice(null);
}

export function saveWorkspaceRegistryToStorage(
  state: WorkspaceRegistryState,
): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(
    WORKSPACE_STORAGE_KEY,
    JSON.stringify(toPersistedWorkspaceSlice(state)),
  );
}
