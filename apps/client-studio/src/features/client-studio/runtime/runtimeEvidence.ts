/**
 * PT-RUNTIME-EVIDENCE-01 — temporary forensic logging.
 * Enabled when:
 * - VITE_RUNTIME_EVIDENCE=1, or
 * - URL ?runtimeEvidence=1, or
 * - localStorage.runtimeEvidence === '1'
 */

const PREFIX = '[PT-RUNTIME-EVIDENCE-01]';

export function isRuntimeEvidenceEnabled(): boolean {
  try {
    if (import.meta.env.VITE_RUNTIME_EVIDENCE === '1') {
      return true;
    }
  } catch {
    // ignore
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('runtimeEvidence') === '1') {
      return true;
    }
    if (window.localStorage.getItem('runtimeEvidence') === '1') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

export function evidenceLog(section: string, payload: unknown): void {
  if (!isRuntimeEvidenceEnabled()) {
    return;
  }
  // eslint-disable-next-line no-console -- intentional forensic instrumentation
  console.info(PREFIX, section, payload);
}

/** Deterministic non-crypto fingerprint of CSV text used by Runtime. */
export function fingerprintText(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}-len${text.length}`;
}

export function firstLast<T>(items: readonly T[]): {
  count: number;
  first: T | null;
  last: T | null;
} {
  if (items.length === 0) {
    return { count: 0, first: null, last: null };
  }
  return {
    count: items.length,
    first: items[0] ?? null,
    last: items[items.length - 1] ?? null,
  };
}
