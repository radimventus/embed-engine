import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import type { PlatformSession } from '../domain/types';
import {
  clearPlatformSession,
  loadPlatformSession,
  savePlatformSession,
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

afterEach(() => {
  clearPlatformSession();
});

describe('browser session restoration', () => {
  it('keeps identity only in the in-memory API-session projection', () => {
    assert.equal(loadPlatformSession(), null);
    savePlatformSession(staleSession);
    assert.equal(loadPlatformSession()?.user.id, 'user-manager');
    clearPlatformSession();
    assert.equal(loadPlatformSession(), null);
  });
});
