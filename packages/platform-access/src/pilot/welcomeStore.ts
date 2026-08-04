/**
 * CS-01 / PE-04 / PE-05 / PE-11 — Partner welcome / first-session onboarding gate.
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

/** PE-04 / PE-05 — open Welcome Journey after successful account activation. */
export function prepareWelcomeJourney(email: string): void {
  const key = normalizeEmail(email);
  const store = loadStore();
  // Once completed, never re-open on later logins.
  if (store.seenByEmail[key] === true) return;
  saveStore({
    pendingByEmail: { ...store.pendingByEmail, [key]: true },
    seenByEmail: store.seenByEmail,
  });
}

/** @deprecated Prefer prepareWelcomeJourney — kept for CS-01 call sites. */
export function markPartnerWelcomePending(email: string): void {
  prepareWelcomeJourney(email);
}

export function shouldShowPartnerWelcome(email: string): boolean {
  const key = normalizeEmail(email);
  const store = loadStore();
  if (store.seenByEmail[key] === true) return false;
  return store.pendingByEmail[key] === true;
}

export function isPartnerOnboardingOpen(email: string): boolean {
  return shouldShowPartnerWelcome(email);
}

export function hasCompletedWelcomeJourney(email: string): boolean {
  const key = normalizeEmail(email);
  return loadStore().seenByEmail[key] === true;
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

/** PE-04 / PE-05 — finish first session and close onboarding permanently. */
export function completePartnerOnboarding(email: string): void {
  dismissPartnerWelcome(email);
}

/** PE-05 — alias for first-session completion. */
export function finishWelcomeJourney(email: string): void {
  completePartnerOnboarding(email);
}
