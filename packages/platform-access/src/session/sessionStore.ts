/**
 * EPIC-BX-14 — Session persistence.
 * Cookie-based so Studio port switches (4175/4177/4179) keep context.
 */

import type { PlatformSession } from '../domain/types';
import { isSharedWorkspaceContext } from '../domain/workspaceContext';

export const PLATFORM_SESSION_COOKIE = 'conis_platform_session_v1';
export const PLATFORM_SESSION_STORAGE_KEY = 'conis.platform.session.v1';

/** In-memory fallback for Node tests / non-DOM hosts. */
let memorySession: PlatformSession | null = null;

function canUseDom(): boolean {
  return typeof document !== 'undefined';
}

function normalizeSession(parsed: PlatformSession): PlatformSession {
  return {
    ...parsed,
    workspaceContext: isSharedWorkspaceContext(parsed.workspaceContext)
      ? parsed.workspaceContext
      : null,
  };
}

export function serializeSession(session: PlatformSession): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function deserializeSession(raw: string): PlatformSession | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as PlatformSession;
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      parsed.user == null ||
      typeof parsed.companyId !== 'string'
    ) {
      return null;
    }
    if (parsed.expiresAt !== null && Date.parse(parsed.expiresAt) < Date.now()) {
      return null;
    }
    return normalizeSession(parsed);
  } catch {
    return null;
  }
}

export function readSessionCookie(): PlatformSession | null {
  if (!canUseDom()) return null;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${PLATFORM_SESSION_COOKIE}=`));
  if (match === undefined) return null;
  return deserializeSession(match.slice(PLATFORM_SESSION_COOKIE.length + 1));
}

export function writeSessionCookie(session: PlatformSession): void {
  if (!canUseDom()) return;
  const maxAge = session.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  document.cookie = `${PLATFORM_SESSION_COOKIE}=${serializeSession(session)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(
      PLATFORM_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearSessionCookie(): void {
  if (!canUseDom()) return;
  document.cookie = `${PLATFORM_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  try {
    localStorage.removeItem(PLATFORM_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadPlatformSession(): PlatformSession | null {
  const fromCookie = readSessionCookie();
  if (fromCookie !== null) {
    memorySession = fromCookie;
    return fromCookie;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(PLATFORM_SESSION_STORAGE_KEY);
      if (raw !== null && raw.length > 0) {
        const parsed = JSON.parse(raw) as PlatformSession;
        const session = deserializeSession(
          encodeURIComponent(JSON.stringify(parsed)),
        );
        if (session !== null) {
          memorySession = session;
          return session;
        }
      }
    } catch {
      // fall through
    }
  }
  return memorySession;
}

export function savePlatformSession(session: PlatformSession): void {
  memorySession = session;
  writeSessionCookie(session);
}

export function clearPlatformSession(): void {
  memorySession = null;
  clearSessionCookie();
}
