/**
 * OF-07 — Password reset tokens (MVP local; not production IAM).
 */

import type { PlatformPasswordReset } from '../domain/pilotTypes';
import { findUserByEmail, setUserPassword } from '../registry/userRegistry';

export const PASSWORD_RESET_STORAGE_KEY = 'conis.platform.password-reset.v1';

type ResetStore = {
  readonly resets: PlatformPasswordReset[];
};

let memoryStore: ResetStore = { resets: [] };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): ResetStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(PASSWORD_RESET_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as ResetStore;
    memoryStore = {
      resets: Array.isArray(parsed.resets) ? parsed.resets : [],
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: ResetStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function createToken(): string {
  return `rst_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function resetPasswordResetStore(): void {
  memoryStore = { resets: [] };
  if (canUseStorage()) {
    localStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
  }
}

export function requestPasswordReset(email: string):
  | { readonly ok: true; readonly reset: PlatformPasswordReset }
  | { readonly ok: false; readonly error: string } {
  const user = findUserByEmail(email);
  if (user === null) {
    return { ok: false, error: 'Účet s tímto e-mailem neexistuje.' };
  }
  if (user.status === 'inactive') {
    return { ok: false, error: 'Účet je neaktivní.' };
  }
  const store = loadStore();
  const reset: PlatformPasswordReset = {
    id: `reset-${Date.now()}`,
    email: user.email,
    token: createToken(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    usedAt: null,
  };
  saveStore({
    resets: [
      reset,
      ...store.resets.map((entry) =>
        entry.email === user.email && entry.status === 'pending'
          ? { ...entry, status: 'expired' as const }
          : entry,
      ),
    ],
  });
  return { ok: true, reset };
}

export function findPasswordResetByToken(
  token: string,
): PlatformPasswordReset | null {
  return loadStore().resets.find((entry) => entry.token === token) ?? null;
}

export function completePasswordReset(input: {
  readonly token: string;
  readonly password: string;
}):
  | { readonly ok: true; readonly email: string }
  | { readonly ok: false; readonly error: string } {
  const password = input.password.trim();
  if (password.length < 4) {
    return { ok: false, error: 'Heslo musí mít alespoň 4 znaky.' };
  }
  const store = loadStore();
  const reset = store.resets.find((entry) => entry.token === input.token);
  if (reset === undefined) {
    return { ok: false, error: 'Reset token neexistuje.' };
  }
  if (reset.status !== 'pending') {
    return { ok: false, error: 'Reset token už není platný.' };
  }
  const ageMs = Date.now() - new Date(reset.createdAt).getTime();
  if (ageMs > 1000 * 60 * 60 * 24) {
    saveStore({
      resets: store.resets.map((entry) =>
        entry.id === reset.id
          ? { ...entry, status: 'expired' as const }
          : entry,
      ),
    });
    return { ok: false, error: 'Reset token vypršel.' };
  }
  if (!setUserPassword(reset.email, password)) {
    return { ok: false, error: 'Heslo se nepodařilo nastavit.' };
  }
  const usedAt = new Date().toISOString();
  saveStore({
    resets: store.resets.map((entry) =>
      entry.id === reset.id
        ? { ...entry, status: 'used' as const, usedAt }
        : entry,
    ),
  });
  return { ok: true, email: reset.email };
}
