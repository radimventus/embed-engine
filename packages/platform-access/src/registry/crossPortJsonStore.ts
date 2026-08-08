/**
 * PT-PROJECT-01 — Cross-port JSON persistence for Shared Project Runtime.
 *
 * Platform session already uses cookies so Studio Vite ports share identity.
 * localStorage is origin-isolated per port (4181 ≠ 4182) — Runtime must not
 * rely on it alone or Builder-authored projects never reach Office/Manager.
 */

export function readCrossPortJson(input: {
  readonly cookieName: string;
  readonly storageKey: string;
}): string | null {
  if (typeof document !== 'undefined') {
    const match = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${input.cookieName}=`));
    if (match !== undefined) {
      const raw = match.slice(input.cookieName.length + 1);
      if (raw.length > 0) {
        try {
          return decodeURIComponent(raw);
        } catch {
          return raw;
        }
      }
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(input.storageKey);
    } catch {
      return null;
    }
  }
  return null;
}

export function writeCrossPortJson(input: {
  readonly cookieName: string;
  readonly storageKey: string;
  readonly json: string;
  readonly maxAgeSeconds?: number;
}): void {
  const maxAge = input.maxAgeSeconds ?? 60 * 60 * 24 * 30;
  if (typeof document !== 'undefined') {
    const encoded = encodeURIComponent(input.json);
    document.cookie = `${input.cookieName}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(input.storageKey, input.json);
    } catch {
      // quota / private mode — cookie may still carry the payload
    }
  }
}

export function clearCrossPortJson(input: {
  readonly cookieName: string;
  readonly storageKey: string;
}): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${input.cookieName}=; path=/; max-age=0; SameSite=Lax`;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(input.storageKey);
    } catch {
      // ignore
    }
  }
}
