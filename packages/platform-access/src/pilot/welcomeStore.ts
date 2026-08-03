/**
 * CS-01 — Partner welcome screen gate (first entry after NDA activation).
 */

export const PARTNER_WELCOME_STORAGE_KEY = 'conis.platform.partner-welcome.v1';

type WelcomeStore = {
  readonly pendingByEmail: Record<string, true>;
  readonly seenByEmail: Record<string, true>;
};

let memoryStore: WelcomeStore = { pendingByEmail: {}, seenByEmail: {} };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function loadStore(): WelcomeStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(PARTNER_WELCOME_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as Partial<WelcomeStore>;
    memoryStore = {
      pendingByEmail:
        parsed.pendingByEmail !== null && typeof parsed.pendingByEmail === 'object'
          ? (parsed.pendingByEmail as Record<string, true>)
          : {},
      seenByEmail:
        parsed.seenByEmail !== null && typeof parsed.seenByEmail === 'object'
          ? (parsed.seenByEmail as Record<string, true>)
          : {},
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: WelcomeStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PARTNER_WELCOME_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetPartnerWelcomeStore(): void {
  memoryStore = { pendingByEmail: {}, seenByEmail: {} };
  if (canUseStorage()) {
    localStorage.removeItem(PARTNER_WELCOME_STORAGE_KEY);
  }
}

export function markPartnerWelcomePending(email: string): void {
  const key = normalizeEmail(email);
  const store = loadStore();
  saveStore({
    pendingByEmail: { ...store.pendingByEmail, [key]: true },
    seenByEmail: store.seenByEmail,
  });
}

export function shouldShowPartnerWelcome(email: string): boolean {
  const key = normalizeEmail(email);
  const store = loadStore();
  if (store.seenByEmail[key] === true) return false;
  return store.pendingByEmail[key] === true;
}

export function dismissPartnerWelcome(email: string): void {
  const key = normalizeEmail(email);
  const store = loadStore();
  const pending = { ...store.pendingByEmail };
  delete pending[key];
  saveStore({
    pendingByEmail: pending,
    seenByEmail: { ...store.seenByEmail, [key]: true },
  });
}
