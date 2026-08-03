/**
 * OF-10 — Office Persistence Layer (localStorage MVP).
 * Shared adapter for Office domain registries. No Runtime / API / backend.
 */

const memoryMirror = new Map<string, string>();

export function canUseStorage(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const probe = '__conis.office.probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  if (canUseStorage()) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null && raw.length > 0) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // fall through to memory mirror
    }
  }
  const mirrored = memoryMirror.get(key);
  if (mirrored === undefined) return fallback;
  try {
    return JSON.parse(mirrored) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): void {
  let raw: string;
  try {
    raw = JSON.stringify(value);
  } catch {
    return;
  }
  memoryMirror.set(key, raw);
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, raw);
  } catch {
    // Quota / private mode — keep memory mirror only.
  }
}

export function removeJson(key: string): void {
  memoryMirror.delete(key);
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Test helper — clears in-memory mirror (does not wipe localStorage keys). */
export function clearOfficeMemoryMirrorForTests(): void {
  memoryMirror.clear();
}
