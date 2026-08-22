import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import type {
  DurableOfficePartner,
  PlatformSession,
} from '../index';
import { clearPlatformSession, savePlatformSession } from '../session/sessionStore';
import { selectProjectAuthoritatively } from './authoritativeProjectSelection';

const originalFetch = globalThis.fetch;

const baseSession: PlatformSession = {
  user: {
    id: 'user-admin',
    email: 'admin@conis.test',
    displayName: 'CONIS Admin',
    roles: ['conis-admin'],
    status: 'active',
    lastLoginAt: '2026-08-22T00:00:00.000Z',
    lastActivityAt: '2026-08-22T00:00:00.000Z',
    lastStudioId: null,
  },
  tenantId: 'tenant-ac',
  companyId: 'company-ac',
  workspaceId: 'ac-main',
  projectId: 'project-ac',
  activeHouseId: 'house-ac',
  activeStudioId: 'builder',
  workspaceContext: null,
  rememberMe: true,
  issuedAt: '2026-08-22T00:00:00.000Z',
  expiresAt: '2026-09-22T00:00:00.000Z',
  lastLoginAt: '2026-08-22T00:00:00.000Z',
};

function partner(input: {
  id: string;
  tenantId: string;
  companyId: string;
  workspaceId: string;
  projectId: string;
}): DurableOfficePartner {
  return {
    id: input.id,
    companyId: input.companyId,
    name: input.id,
    status: 'active',
    nextStep: '',
    company: {
      legalName: input.id,
      ico: '',
      city: '',
      country: 'Česko',
    },
    contact: {
      name: '',
      email: '',
      phone: '',
      role: '',
    },
    partnerEnvironmentScope: {
      tenantId: input.tenantId,
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
    },
    createdAt: '2026-08-22T00:00:00.000Z',
    updatedAt: '2026-08-22T00:00:00.000Z',
  };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearPlatformSession();
});

describe('authoritative Project selection', () => {
  it('uses switch when the requested Project is already the bound PE Project', async () => {
    savePlatformSession(baseSession);

    const requests: Array<{ url: string; body: unknown }> = [];

    globalThis.fetch = async (input, init) => {
      const url = String(input);
      const body =
        typeof init?.body === 'string' ? JSON.parse(init.body) : null;
      requests.push({ url, body });

      if (url.endsWith('/public/auth/context')) {
        return new Response(
          JSON.stringify({
            ok: true,
            session: {
              ...baseSession,
              activeHouseId: null,
            },
          }),
          { status: 200 },
        );
      }

      throw new Error(`Unexpected request: ${url}`);
    };

    const result = await selectProjectAuthoritatively({
      session: baseSession,
      target: {
        companyId: 'company-ac',
        workspaceId: 'ac-main',
        projectId: 'project-ac',
      },
      activeStudio: 'builder',
      officeReturnHref: 'https://conis.cz/studio/office/',
    });

    assert.equal(result.companyId, 'company-ac');
    assert.equal(result.projectId, 'project-ac');
    assert.equal(result.activeHouseId, null);
    assert.equal(requests.length, 1);

    assert.deepEqual(requests[0]?.body, {
      action: 'switch',
      activeStudio: 'builder',
      projectId: 'project-ac',
      activeHouseId: null,
    });
  });

  it('uses durable Partner scope and enter for another Partner Environment', async () => {
    savePlatformSession(baseSession);

    const blokki = partner({
      id: 'partner-blokki',
      tenantId: 'tenant-blokki',
      companyId: 'company-blokki',
      workspaceId: 'blokki-main',
      projectId: 'project-blokki',
    });

    const requests: Array<{ url: string; body: unknown }> = [];

    globalThis.fetch = async (input, init) => {
      const url = String(input);
      const body =
        typeof init?.body === 'string' ? JSON.parse(init.body) : null;
      requests.push({ url, body });

      if (url.endsWith('/office/partners')) {
        return new Response(JSON.stringify({ partners: [blokki] }), {
          status: 200,
        });
      }

      if (url.endsWith('/public/auth/context')) {
        return new Response(
          JSON.stringify({
            ok: true,
            session: {
              ...baseSession,
              tenantId: 'tenant-blokki',
              companyId: 'company-blokki',
              workspaceId: 'blokki-main',
              projectId: 'project-blokki',
              activeHouseId: null,
            },
          }),
          { status: 200 },
        );
      }

      throw new Error(`Unexpected request: ${url}`);
    };

    const result = await selectProjectAuthoritatively({
      session: baseSession,
      target: {
        companyId: 'company-blokki',
        workspaceId: 'blokki-main',
        projectId: 'project-blokki',
      },
      activeStudio: 'manager',
      officeReturnHref: 'https://conis.cz/studio/office/',
    });

    assert.equal(result.companyId, 'company-blokki');
    assert.equal(result.workspaceId, 'blokki-main');
    assert.equal(result.projectId, 'project-blokki');
    assert.equal(result.activeHouseId, null);

    assert.equal(requests.length, 2);
    assert.ok(requests[0]?.url.endsWith('/office/partners'));

    assert.deepEqual(requests[1]?.body, {
      action: 'enter',
      partnerId: 'partner-blokki',
      tenantId: 'tenant-blokki',
      companyId: 'company-blokki',
      workspaceId: 'blokki-main',
      projectId: 'project-blokki',
      activeHouseId: null,
      activeStudio: 'manager',
      officeReturnHref: 'https://conis.cz/studio/office/',
    });
  });

  it('does not invent a Partner when target Project has no durable PE', async () => {
    globalThis.fetch = async (input) => {
      const url = String(input);

      if (url.endsWith('/office/partners')) {
        return new Response(JSON.stringify({ partners: [] }), {
          status: 200,
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    };

    await assert.rejects(
      () =>
        selectProjectAuthoritatively({
          session: baseSession,
          target: {
            companyId: 'company-unknown',
            workspaceId: 'unknown-main',
            projectId: 'project-unknown',
          },
          activeStudio: 'sales',
          officeReturnHref: 'https://conis.cz/studio/office/',
        }),
      /neexistuje autoritativní Partner Environment/,
    );
  });
});
