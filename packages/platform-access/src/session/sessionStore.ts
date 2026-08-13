/** In-memory projection of the HttpOnly Platform API session. */

import type { PlatformSession } from '../domain/types';
import { isSharedWorkspaceContext } from '../domain/workspaceContext';

let memorySession: PlatformSession | null = null;

function normalizeSession(parsed: PlatformSession): PlatformSession {
  return {
    ...parsed,
    workspaceContext: isSharedWorkspaceContext(parsed.workspaceContext)
      ? parsed.workspaceContext
      : null,
  };
}

export function loadPlatformSession(): PlatformSession | null {
  return memorySession;
}

export function savePlatformSession(session: PlatformSession): void {
  memorySession = normalizeSession(session);
}

export function clearPlatformSession(): void {
  memorySession = null;
}
