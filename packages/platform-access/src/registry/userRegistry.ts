/**
 * OF-07 — User Registry (Identity Management).
 * Shared across Studios — local MVP store, not production IAM.
 */

import type {
  PlatformAccountStatus,
  PlatformRole,
  PlatformStudioId,
  PlatformUser,
} from '../domain/types';
import { recordRoleChange } from '../pilot/identityAudit';
import { DEMO_USERS } from './defaults';

export const USER_REGISTRY_STORAGE_KEY = 'conis.platform.users.v1';

type UserRegistryStore = {
  readonly users: PlatformUser[];
  readonly passwords: Record<string, string>;
};

function seedUsers(): PlatformUser[] {
  return DEMO_USERS.map((entry) => {
    const { password: _password, ...user } = entry;
    return normalizeUser(user);
  });
}

function seedPasswords(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const entry of DEMO_USERS) {
    map[entry.email.toLowerCase()] = entry.password;
  }
  return map;
}

let memoryStore: UserRegistryStore = {
  users: seedUsers(),
  passwords: seedPasswords(),
};

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): UserRegistryStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(USER_REGISTRY_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      memoryStore = { users: seedUsers(), passwords: seedPasswords() };
      return memoryStore;
    }
    const parsed = JSON.parse(raw) as Partial<UserRegistryStore>;
    const users = Array.isArray(parsed.users)
      ? parsed.users.map(normalizeUser)
      : seedUsers();
    const passwords =
      parsed.passwords !== null && typeof parsed.passwords === 'object'
        ? parsed.passwords
        : seedPasswords();
    // Ensure demo seeds always exist.
    for (const seed of seedUsers()) {
      if (!users.some((user) => user.id === seed.id)) {
        users.push(seed);
      }
    }
    for (const [email, password] of Object.entries(seedPasswords())) {
      if (passwords[email] === undefined) {
        passwords[email] = password;
      }
    }
    memoryStore = { users, passwords };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: UserRegistryStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(USER_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function normalizeUser(raw: PlatformUser): PlatformUser {
  return {
    id: raw.id,
    email: raw.email.trim().toLowerCase(),
    displayName: raw.displayName,
    roles: raw.roles,
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    lastLoginAt: raw.lastLoginAt ?? null,
    lastActivityAt: raw.lastActivityAt ?? null,
    lastStudioId: raw.lastStudioId ?? null,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

export function resetUserRegistry(): void {
  memoryStore = { users: seedUsers(), passwords: seedPasswords() };
  if (canUseStorage()) {
    localStorage.removeItem(USER_REGISTRY_STORAGE_KEY);
  }
}

export function listUsers(): readonly PlatformUser[] {
  return [...loadStore().users].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, 'cs'),
  );
}

export function getUser(userId: string): PlatformUser | null {
  return loadStore().users.find((user) => user.id === userId) ?? null;
}

export function findUserByEmail(email: string): PlatformUser | null {
  const normalized = email.trim().toLowerCase();
  return (
    loadStore().users.find((user) => user.email === normalized) ?? null
  );
}

export function verifyUserPassword(
  email: string,
  password: string,
): PlatformUser | null {
  const store = loadStore();
  const normalized = email.trim().toLowerCase();
  const user = store.users.find((entry) => entry.email === normalized);
  if (user === undefined) return null;
  if (store.passwords[normalized] !== password) return null;
  return user;
}

export function createUser(input: {
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly password?: string;
  readonly status?: PlatformAccountStatus;
  readonly createdByUserId?: string;
}):
  | { readonly ok: true; readonly user: PlatformUser }
  | { readonly ok: false; readonly error: string } {
  const email = input.email.trim().toLowerCase();
  if (email.length === 0 || !email.includes('@')) {
    return { ok: false, error: 'Zadejte platný e-mail.' };
  }
  const store = loadStore();
  if (store.users.some((user) => user.email === email)) {
    return { ok: false, error: 'Uživatel s tímto e-mailem už existuje.' };
  }
  const user: PlatformUser = {
    id: `user-${Date.now().toString(36)}`,
    email,
    displayName: input.displayName.trim() || email.split('@')[0] || email,
    roles: input.roles.length > 0 ? input.roles : ['builder'],
    status: input.status ?? 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    lastStudioId: null,
  };
  const passwords = { ...store.passwords };
  if (input.password !== undefined && input.password.length > 0) {
    passwords[email] = input.password;
  }
  saveStore({
    users: [...store.users, user],
    passwords,
  });
  if (input.createdByUserId !== undefined) {
    recordRoleChange({
      userId: user.id,
      previousRoles: [],
      nextRoles: user.roles,
      changedByUserId: input.createdByUserId,
      detail: 'Uživatel vytvořen',
    });
  }
  return { ok: true, user };
}

export function upsertActivatedUser(input: {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly password: string;
}): PlatformUser {
  const store = loadStore();
  const email = input.email.trim().toLowerCase();
  const existing = store.users.find((user) => user.email === email);
  const user: PlatformUser = {
    id: existing?.id ?? input.id,
    email,
    displayName: input.displayName,
    roles: input.roles,
    status: 'active',
    lastLoginAt: existing?.lastLoginAt ?? null,
    lastActivityAt: existing?.lastActivityAt ?? null,
    lastStudioId: existing?.lastStudioId ?? null,
  };
  const users = existing
    ? store.users.map((entry) => (entry.email === email ? user : entry))
    : [...store.users, user];
  saveStore({
    users,
    passwords: { ...store.passwords, [email]: input.password },
  });
  return user;
}

export function updateUserProfile(
  userId: string,
  input: {
    readonly displayName?: string;
    readonly status?: PlatformAccountStatus;
  },
): PlatformUser | null {
  const store = loadStore();
  const current = store.users.find((user) => user.id === userId);
  if (current === undefined) return null;
  const next: PlatformUser = {
    ...current,
    displayName:
      input.displayName !== undefined
        ? input.displayName.trim() || current.displayName
        : current.displayName,
    status: input.status ?? current.status,
  };
  saveStore({
    ...store,
    users: store.users.map((user) => (user.id === userId ? next : user)),
  });
  return next;
}

export function setUserStatus(
  userId: string,
  status: PlatformAccountStatus,
): PlatformUser | null {
  return updateUserProfile(userId, { status });
}

export function setUserRoles(input: {
  readonly userId: string;
  readonly roles: readonly PlatformRole[];
  readonly changedByUserId: string;
}): PlatformUser | null {
  const store = loadStore();
  const current = store.users.find((user) => user.id === input.userId);
  if (current === undefined) return null;
  const roles =
    input.roles.length > 0 ? [...input.roles] : (['builder'] as PlatformRole[]);
  const next: PlatformUser = { ...current, roles };
  saveStore({
    ...store,
    users: store.users.map((user) =>
      user.id === input.userId ? next : user,
    ),
  });
  recordRoleChange({
    userId: input.userId,
    previousRoles: current.roles,
    nextRoles: roles,
    changedByUserId: input.changedByUserId,
    detail: 'Změna rolí',
  });
  return next;
}

export function setUserPassword(
  email: string,
  password: string,
): boolean {
  const store = loadStore();
  const normalized = email.trim().toLowerCase();
  if (!store.users.some((user) => user.email === normalized)) return false;
  if (password.trim().length < 4) return false;
  saveStore({
    ...store,
    passwords: { ...store.passwords, [normalized]: password.trim() },
  });
  return true;
}

export function touchUserLogin(userId: string): PlatformUser | null {
  const store = loadStore();
  const stamp = nowIso();
  const current = store.users.find((user) => user.id === userId);
  if (current === undefined) return null;
  const next: PlatformUser = {
    ...current,
    lastLoginAt: stamp,
    lastActivityAt: stamp,
  };
  saveStore({
    ...store,
    users: store.users.map((user) => (user.id === userId ? next : user)),
  });
  return next;
}

export function touchUserActivity(userId: string): PlatformUser | null {
  const store = loadStore();
  const current = store.users.find((user) => user.id === userId);
  if (current === undefined) return null;
  const next: PlatformUser = {
    ...current,
    lastActivityAt: nowIso(),
  };
  saveStore({
    ...store,
    users: store.users.map((user) => (user.id === userId ? next : user)),
  });
  return next;
}

/** PE-09 — record last visited Studio / Client surface. */
export function touchUserLastStudio(
  userId: string,
  studioId: PlatformStudioId | 'client',
): PlatformUser | null {
  const store = loadStore();
  const current = store.users.find((user) => user.id === userId);
  if (current === undefined) return null;
  const stamp = nowIso();
  const next: PlatformUser = {
    ...current,
    lastActivityAt: stamp,
    lastStudioId: studioId,
  };
  saveStore({
    ...store,
    users: store.users.map((user) => (user.id === userId ? next : user)),
  });
  return next;
}
