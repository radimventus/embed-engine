import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import type { PlatformSession } from '../domain/types';
import {
  clearPlatformSession,
  loadPlatformSession,
  PLATFORM_SESSION_STORAGE_KEY,
} from './sessionStore';

const staleSession: PlatformSession = {
  user: {
    id: 'user-manager',
    email: 'manager@dse.test',
    displayName: 'Manager',
    roles: ['manager'],
    status: 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    lastStudioId: null,
  },
  tenantId: 'tenant-domy-s-energii',
  companyId: 'company-domy-s-energii',
  workspaceId: 'domy-s-energii-main',
  projectId: 'project-domy-s-energii',
  activeHouseId: null,
  activeStudioId: 'manager',
  workspaceContext: null,
  rememberMe: true,
  issuedAt: '2026-08-11T00:00:00.000Z',
  expiresAt: '2026-09-11T00:00:00.000Z',
  lastLoginAt: '2026-08-11T00:00:00.000Z',
};

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
const originalLocalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage',
);

afterEach(() => {
  clearPlatformSession();
  if (originalDocument === undefined) {
    delete (globalThis as { document?: unknown }).document;
  } else {
    Object.defineProperty(globalThis, 'document', originalDocument);
  }
  if (originalLocalStorage === undefined) {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  } else {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
  }
});

describe('browser session restoration', () => {
  it('does not revive a logged-out session from port-local storage', () => {
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { cookie: '' },
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem(key: string) {
          return key === PLATFORM_SESSION_STORAGE_KEY
            ? JSON.stringify(staleSession)
            : null;
        },
        removeItem() {},
      },
    });

    assert.equal(loadPlatformSession(), null);
  });
});
