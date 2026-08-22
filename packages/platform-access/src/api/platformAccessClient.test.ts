import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import type { WorkspaceAuthoredHouseIdentity } from '../domain/workspaceContext';
import {
  createPlatformAccessAuthClient,
  createPlatformAccessInviteClient,
} from './platformAccessClient';

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

  it('forwards authored House identities through authoritative session context mutation', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          ok: true,
          session: {
            user: {
              id: 'user-admin',
              email: 'admin@example.test',
              displayName: 'Admin',
              roles: ['conis-admin'],
              status: 'active',
              lastLoginAt: '2026-08-14T10:00:00.000Z',
              lastActivityAt: '2026-08-14T10:00:00.000Z',
              lastStudioId: 'client',
            },
            tenantId: 'tenant-domy-s-energii',
            companyId: 'company-domy-s-energii',
            workspaceId: 'domy-s-energii-main',
            projectId: 'project-domy-s-energii',
            activeHouseId: 'patrovy-5kk',
            activeStudioId: 'client',
            workspaceContext: null,
            rememberMe: true,
            issuedAt: '2026-08-14T10:00:00.000Z',
            expiresAt: '2026-09-14T10:00:00.000Z',
            lastLoginAt: '2026-08-14T10:00:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as typeof fetch;

    const client = createPlatformAccessAuthClient('https://api.conis.cz');

    const authoredHouseIdentities: readonly WorkspaceAuthoredHouseIdentity[] = [
      {
        houseId: 'patrovy-5kk',
        name: 'PATROVÝ 5KK',
        canonicalProjectId: 'project-domy-s-energii',
        packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
        dataMode: 'LIVE_EMPTY' as const,
        status: 'draft' as const,
      },
    ];

    const result = await client.mutateSessionContext({
      action: 'enter',
      partnerId: 'p-dse',
      tenantId: 'tenant-domy-s-energii',
      companyId: 'company-domy-s-energii',
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
      activeHouseId: 'patrovy-5kk',
      authoredHouseIdentities,
      activeStudio: 'client',
      officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
    });

    assert.equal(result.ok, true);
    assert.equal(requests.length, 1);
    assert.equal(
      requests[0]?.url,
      'https://api.conis.cz/public/auth/context',
    );

    const body = JSON.parse(String(requests[0]?.init?.body));
    assert.deepEqual(body.authoredHouseIdentities, authoredHouseIdentities);
    assert.equal(body.activeHouseId, 'patrovy-5kk');
  });

  it('persists Partner Environment scope through the Office Partner write path', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          id: 'p-dse',
          partnerEnvironmentScope: {
            tenantId: 'tenant-domy-s-energii',
            companyId: 'company-domy-s-energii',
            workspaceId: 'domy-s-energii-main',
            projectId: 'project-domy-s-energii',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as typeof fetch;

    const client = createPlatformAccessAuthClient('https://api.conis.cz');
    const result = await client.persistPartnerEnvironmentScope('p-dse', {
      tenantId: 'tenant-domy-s-energii',
      companyId: 'company-domy-s-energii',
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
    });
    assert.equal(result.ok, true);
    assert.equal(
      requests[0]?.url,
      'https://api.conis.cz/office/partners/p-dse/environment-scope',
    );
    assert.equal(requests[0]?.init?.method, 'PUT');
  });
  it('registers durable canonical Project authority', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      requests.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          ok: true,
          authority: {
            tenantId: 'tenant-blokki',
            companyId: 'company-blokki',
            workspaceId: 'blokki-main',
            projectId: 'project-blokki',
          },
        }),
        {
          status: 201,
          headers: { 'content-type': 'application/json' },
        },
      );
    }) as typeof fetch;

    const client =
      createPlatformAccessAuthClient('https://api.conis.cz');

    const result =
      await client.persistCanonicalProjectAuthority({
        tenant: {
          id: 'tenant-blokki',
          name: 'BLOKKI',
          companyId: 'company-blokki',
          pilot: false,
          createdAt: '2026-08-22T00:00:00.000Z',
        },
        company: {
          id: 'company-blokki',
          name: 'BLOKKI',
          tenantId: 'tenant-blokki',
        },
        workspace: {
          id: 'blokki-main',
          companyId: 'company-blokki',
          name: 'BLOKKI',
        },
        project: {
          id: 'project-blokki',
          companyId: 'company-blokki',
          workspaceId: 'blokki-main',
          name: 'BLOKKI',
          slug: 'blokki',
          description: '',
        },
      });

    assert.equal(result.ok, true);
    assert.equal(requests.length, 1);
    assert.equal(
      requests[0]?.url,
      'https://api.conis.cz/public/auth/canonical-project-authority',
    );
    assert.equal(requests[0]?.init?.method, 'POST');
    assert.equal(requests[0]?.init?.credentials, 'include');

    const body =
      JSON.parse(String(requests[0]?.init?.body));

    assert.equal(body.project.id, 'project-blokki');
    assert.equal(body.company.id, 'company-blokki');
    assert.equal(body.workspace.id, 'blokki-main');
  });
});

describe('Platform Access invitation client', () => {
  it('uses credentialed Office invite producer routes without authoritative scope', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ url: String(input), init });
      const url = String(input);
      if (url.endsWith('/office/invites')) {
        return new Response(
          JSON.stringify({
            id: 'invite-test',
            email: 'anna@dse.test',
            displayName: 'Anna',
            roles: ['manager'],
            tenantId: 'tenant-domy-s-energii',
            companyId: 'company-domy-s-energii',
            workspaceId: 'domy-s-energii-main',
            projectId: 'project-domy-s-energii',
            status: 'pending',
            createdAt: '2026-08-10T10:00:00.000Z',
            activatedAt: null,
            ndaAcceptedAt: null,
            expiresAt: '2026-08-17T10:00:00.000Z',
            token: 'issued-token',
          }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          id: 'invite-test',
          email: 'anna@dse.test',
          displayName: 'Anna',
          roles: ['manager'],
          tenantId: 'tenant-domy-s-energii',
          companyId: 'company-domy-s-energii',
          workspaceId: 'domy-s-energii-main',
          projectId: 'project-domy-s-energii',
          status: 'pending',
          createdAt: '2026-08-10T10:00:00.000Z',
          activatedAt: null,
          ndaAcceptedAt: null,
          expiresAt: '2026-08-17T10:00:00.000Z',
          token: 'reissued-token',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as typeof fetch;

    const client = createPlatformAccessInviteClient('https://api.conis.cz');
    await client.createInvite({
      partnerId: 'p-dse',
      email: 'anna@dse.test',
      displayName: 'Anna',
      roles: ['manager'],
    });
    await client.reissueInvite('invite-test');

    assert.deepEqual(requests, [
      {
        url: 'https://api.conis.cz/office/invites',
        init: {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            partnerId: 'p-dse',
            email: 'anna@dse.test',
            displayName: 'Anna',
            roles: ['manager'],
          }),
        },
      },
      {
        url: 'https://api.conis.cz/office/invites/invite-test/reissue',
        init: {
          method: 'POST',
          credentials: 'include',
        },
      },
    ]);
    assert.equal(JSON.stringify(requests[0]?.init?.body).includes('companyId'), false);
  });
});

it(
  'TASK-66 — persists canonical House authority through authenticated HTTP',
  async () => {
    const originalFetch = globalThis.fetch;
    const requests: Array<{
      readonly url: string;
      readonly init: RequestInit | undefined;
    }> = [];

    globalThis.fetch = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      requests.push({
        url: String(input),
        init,
      });

      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        },
      );
    }) as typeof fetch;

    try {
      const client = createPlatformAccessAuthClient(
        'https://api.conis.cz',
      );

      const result =
        await client.persistCanonicalHouseAuthority({
          id: 'house-66-a',
          canonicalProjectId: 'project-test',
          name: 'HOUSE66 A',
          packageRoot: '/house-packages/house-66-a',
          status: 'draft',
        });

      assert.deepEqual(result, { ok: true });
      assert.equal(requests.length, 1);

      assert.equal(
        requests[0]?.url,
        'https://api.conis.cz/public/auth/canonical-house-authority',
      );

      assert.equal(requests[0]?.init?.method, 'POST');
      assert.equal(requests[0]?.init?.credentials, 'include');

      assert.deepEqual(
        JSON.parse(String(requests[0]?.init?.body)),
        {
          id: 'house-66-a',
          canonicalProjectId: 'project-test',
          name: 'HOUSE66 A',
          packageRoot: '/house-packages/house-66-a',
          status: 'draft',
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
