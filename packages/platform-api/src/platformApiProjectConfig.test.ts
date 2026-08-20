import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import {
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DEFAULT_CANONICAL_PROJECT_ID,
  DEFAULT_COMPANY_ID,
  applyDurableProjectConfigs,
  resetCompanyRegistryExtras,
} from '@embed-engine/platform-access';

import { createPlatformApiServer } from './index.ts';
import { FileProjectConfigRepository } from './projectConfigRepository.ts';

const identities = new Map([
  [
    'session-dse',
    {
      companyId: DSE_COMPANY_ID,
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
  [
    'session-ac',
    {
      companyId: DEFAULT_COMPANY_ID,
      workspaceContext: { companyId: DEFAULT_COMPANY_ID },
    },
  ],
]);

const partnerSessions = {
  resolve: async (token: string) => identities.get(token) ?? null,
};

describe('Platform API Project privacy config', () => {
  let directory = '';
  let repository: FileProjectConfigRepository;
  let baseUrl = '';
  let server: ReturnType<typeof createPlatformApiServer>;

  before(async () => {
    resetCompanyRegistryExtras();
    directory = await mkdtemp(join(tmpdir(), 'conis-project-config-api-'));
    repository = new FileProjectConfigRepository(join(directory, 'project-config.json'));
    server = createPlatformApiServer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      partnerSessions as never,
      undefined,
      undefined,
      undefined,
      repository,
    );
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    assert.ok(address !== null && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error === undefined ? resolve() : reject(error)));
    });
    await rm(directory, { recursive: true, force: true });
    resetCompanyRegistryExtras();
  });

  it('reads current Project config, including authenticated own Project GET', async () => {
    const response = await fetch(
      `${baseUrl}/public/projects/${DSE_CANONICAL_PROJECT_ID}/config`,
      { headers: { cookie: '__Host-conis_partner_session=session-dse' } },
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      projectId: DSE_CANONICAL_PROJECT_ID,
      privacyUrl: null,
    });
  });

  it('updates own Project privacyUrl and returns the saved value', async () => {
    const response = await fetch(
      `${baseUrl}/public/projects/${DSE_CANONICAL_PROJECT_ID}/config`,
      {
        method: 'PUT',
        headers: {
          cookie: '__Host-conis_partner_session=session-dse',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ privacyUrl: 'https://dse.example/privacy' }),
      },
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      projectId: DSE_CANONICAL_PROJECT_ID,
      privacyUrl: 'https://dse.example/privacy',
    });

    const readback = await fetch(
      `${baseUrl}/public/projects/${DSE_CANONICAL_PROJECT_ID}/config`,
    );
    assert.deepEqual(await readback.json(), {
      projectId: DSE_CANONICAL_PROJECT_ID,
      privacyUrl: 'https://dse.example/privacy',
    });
  });

  it('rejects foreign Company Project updates', async () => {
    const response = await fetch(
      `${baseUrl}/public/projects/${DSE_CANONICAL_PROJECT_ID}/config`,
      {
        method: 'PUT',
        headers: {
          cookie: '__Host-conis_partner_session=session-ac',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ privacyUrl: 'https://attacker.example/privacy' }),
      },
    );
    assert.equal(response.status, 403);
    const current = await repository.get(DSE_CANONICAL_PROJECT_ID);
    assert.equal(current?.privacyUrl, 'https://dse.example/privacy');
  });

  it('rejects unknown Project', async () => {
    const response = await fetch(
      `${baseUrl}/public/projects/project-does-not-exist/config`,
      {
        method: 'PUT',
        headers: {
          cookie: '__Host-conis_partner_session=session-dse',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ privacyUrl: 'https://dse.example/privacy' }),
      },
    );
    assert.equal(response.status, 404);
  });

  it('rejects invalid HTTP and malformed URLs', async () => {
    const invalid = ['http://dse.example/privacy', '/privacy', 'not-a-url', 'javascript:alert(1)'];
    for (const privacyUrl of invalid) {
      const response = await fetch(
        `${baseUrl}/public/projects/${DEFAULT_CANONICAL_PROJECT_ID}/config`,
        {
          method: 'PUT',
          headers: {
            cookie: '__Host-conis_partner_session=session-ac',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ privacyUrl }),
        },
      );
      assert.equal(response.status, 400);
    }
  });

  it('allows empty privacyUrl to clear configuration', async () => {
    const response = await fetch(
      `${baseUrl}/public/projects/${DSE_CANONICAL_PROJECT_ID}/config`,
      {
        method: 'PUT',
        headers: {
          cookie: '__Host-conis_partner_session=session-dse',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ privacyUrl: '' }),
      },
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      projectId: DSE_CANONICAL_PROJECT_ID,
      privacyUrl: null,
    });
  });

  it('survives a fresh repository instance over the same state path', async () => {
    await fetch(`${baseUrl}/public/projects/${DSE_CANONICAL_PROJECT_ID}/config`, {
      method: 'PUT',
      headers: {
        cookie: '__Host-conis_partner_session=session-dse',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ privacyUrl: 'https://dse.example/privacy-final' }),
    });

    const fresh = new FileProjectConfigRepository(join(directory, 'project-config.json'));
    const restored = await fresh.get(DSE_CANONICAL_PROJECT_ID);
    assert.equal(restored?.privacyUrl, 'https://dse.example/privacy-final');
    applyDurableProjectConfigs(await fresh.list());
  });
});
