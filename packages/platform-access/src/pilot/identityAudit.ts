/**
 * OF-07 — Identity audit (role changes, last login / activity stamps).
 */

import type { PlatformRole } from '../domain/types';
import type { PlatformRoleChangeEntry } from '../domain/pilotTypes';

export const ROLE_AUDIT_STORAGE_KEY = 'conis.platform.role-audit.v1';

type RoleAuditStore = {
  readonly entries: PlatformRoleChangeEntry[];
};

let memoryStore: RoleAuditStore = { entries: [] };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): RoleAuditStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(ROLE_AUDIT_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as RoleAuditStore;
    memoryStore = {
      entries: Array.isArray(parsed.entries) ? parsed.entries.slice(0, 100) : [],
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: RoleAuditStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(ROLE_AUDIT_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetIdentityAudit(): void {
  memoryStore = { entries: [] };
  if (canUseStorage()) {
    localStorage.removeItem(ROLE_AUDIT_STORAGE_KEY);
  }
}

export function recordRoleChange(input: {
  readonly userId: string;
  readonly previousRoles: readonly PlatformRole[];
  readonly nextRoles: readonly PlatformRole[];
  readonly changedByUserId: string;
  readonly detail: string;
}): PlatformRoleChangeEntry {
  const store = loadStore();
  const entry: PlatformRoleChangeEntry = {
    id: `role-${Date.now().toString(36)}`,
    userId: input.userId,
    at: new Date().toISOString(),
    previousRoles: [...input.previousRoles],
    nextRoles: [...input.nextRoles],
    changedByUserId: input.changedByUserId,
    detail: input.detail,
  };
  saveStore({ entries: [entry, ...store.entries].slice(0, 100) });
  return entry;
}

export function listRoleChangeHistory(
  userId?: string,
  limit = 20,
): readonly PlatformRoleChangeEntry[] {
  const entries = loadStore().entries;
  const filtered =
    userId === undefined
      ? entries
      : entries.filter((entry) => entry.userId === userId);
  return filtered.slice(0, limit);
}
