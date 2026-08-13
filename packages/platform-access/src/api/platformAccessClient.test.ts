import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { createPlatformAccessAuthClient } from './platformAccessClient';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('Platform Access authentication client', () => {
  it('uses the production API origin with credentialed session requests', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          ok: true,
          session: {
            user: {
              id: 'user-manager',
              email: 'manager@example.test',
              displayName: 'Manager',
              roles: ['manager'],
              status: 'active',
              lastLoginAt: '2026-08-13T10:00:00.000Z',
              lastActivityAt: '2026-08-13T10:00:00.000Z',
              lastStudioId: null,
            },
            tenantId: 'tenant-1',
            companyId: 'company-1',
            workspaceId: 'workspace-1',
            projectId: 'project-1',
            activeHouseId: null,
            activeStudioId: null,
            workspaceContext: null,
            rememberMe: true,
            issuedAt: '2026-08-13T10:00:00.000Z',
            expiresAt: '2026-09-13T10:00:00.000Z',
            lastLoginAt: '2026-08-13T10:00:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as typeof fetch;

    const client = createPlatformAccessAuthClient('https://api.conis.cz');
    const result = await client.login({
      email: 'manager@example.test',
      password: 'not-persisted-in-browser',
      rememberMe: true,
    });

    assert.equal(result.ok, true);
    assert.deepEqual(requests, [
      {
        url: 'https://api.conis.cz/public/auth/login',
        init: {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email: 'manager@example.test',
            password: 'not-persisted-in-browser',
            rememberMe: true,
          }),
        },
      },
    ]);
  });
});
