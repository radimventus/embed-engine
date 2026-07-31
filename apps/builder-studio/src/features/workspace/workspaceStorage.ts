/**
 * CAP-BLD-08 — persist workspace metadata in localStorage (not HP content).
 */

import {
  mergePersistedWorkspaceSlice,
  toPersistedWorkspaceSlice,
  WORKSPACE_STORAGE_KEY,
  type WorkspacePersistedSlice,
  type WorkspaceRegistryState,
} from './workspaceRegistry';

export function loadWorkspaceRegistryFromStorage(): WorkspaceRegistryState {
  if (typeof localStorage === 'undefined') {
    return mergePersistedWorkspaceSlice(null);
  }
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return mergePersistedWorkspaceSlice(null);
    }
    const parsed = JSON.parse(raw) as WorkspacePersistedSlice;
    return mergePersistedWorkspaceSlice(parsed);
  } catch {
    return mergePersistedWorkspaceSlice(null);
  }
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
