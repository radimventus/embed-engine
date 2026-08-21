import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import {
  DEFAULT_COMPANY_ID,
  DSE_COMPANY_ID,
  resetCompanyRegistryExtras,
} from '@embed-engine/platform-access';

import {
  createPlatformApiServer,
  FilePartnerSessionRepository,
  FilePlatformInviteRepository,
  requiresLoopbackAccess,
} from './index.ts';

const identities = new Map([
  [
    'session-admin',
    {
      companyId: DSE_COMPANY_ID,
      user: { id: 'user-conis-admin', roles: ['conis-admin'] as const },
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
  [
    'session-dse-admin',
    {
      companyId: DSE_COMPANY_ID,
      user: { id: 'user-dse-admin', roles: ['project-admin'] as const },
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
  [
    'session-ac',
    {
      companyId: DEFAULT_COMPANY_ID,
      user: { id: 'user-ac-admin', roles: ['project-admin'] as const },
      workspaceContext: { companyId: DEFAULT_COMPANY_ID },
    },
  ],
  [
    'session-manager',
    {
      companyId: DSE_COMPANY_ID,
      user: { id: 'user-manager', roles: ['manager'] as const },
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
]);

const partnerSessions = {
  resolve: async (token: string) => identities.get(token) ?? null,
  activate: async () => {
    throw new Error('Not used in this test file.');
  },
};

const createBody = {
  partnerId: 'p-dse',
  email: 'anna.manager@dse.test',
  displayName: 'Anna Manager',
  roles: ['manager'],
} as const;

describe('Platform API Office invitations', () => {
  let directory = '';
  let inviteRepository: FilePlatformInviteRepository;
  let baseUrl = '';
  let server: ReturnType<typeof createPlatformApiServer>;

  before(async () => {
    resetCompanyRegistryExtras();
    directory = await mkdtemp(join(tmpdir(), 'conis-office-invite-api-'));
    inviteRepository = new FilePlatformInviteRepository(
      join(directory, 'invites.json'),
    );
    server = createPlatformApiServer(
      inviteRepository,
      undefined,
      undefined,
      undefined,
      undefined,
      partnerSessions as never,
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

  it('creates an invitation for an authorized conis-admin', async () => {
    const response = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
        origin: 'https://conis.cz',
      },
      body: JSON.stringify(createBody),
    });

    assert.equal(response.status, 201);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://conis.cz');
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');

    const body = (await response.json()) as {
      id: string;
      token: string;
      companyId: string;
      projectId: string;
      workspaceId: string;
      tenantId: string;
      email: string;
      roles: readonly string[];
    };

    assert.match(body.id, /^invite-/);
    assert.match(body.token, /^[A-Za-z0-9_-]+$/);
    assert.equal(body.email, createBody.email);
    assert.deepEqual(body.roles, ['manager']);
    assert.equal(body.companyId, DSE_COMPANY_ID);
    assert.equal(body.projectId, 'project-domy-s-energii');
    assert.equal(body.workspaceId, 'domy-s-energii-main');
    assert.equal(body.tenantId, 'tenant-domy-s-energii');

    const persisted = JSON.parse(
      await readFile(join(directory, 'invites.json'), 'utf8'),
    ) as { invites: readonly { invitedByUserId: string }[] };
    assert.equal(persisted.invites[0]?.invitedByUserId, 'user-conis-admin');
  });

  it('rejects unauthenticated create with 401', async () => {
    const response = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(createBody),
    });
    assert.equal(response.status, 401);
  });

  it('rejects manager role with 403', async () => {
    const response = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-manager',
        'content-type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });
    assert.equal(response.status, 403);
  });

  it('rejects foreign project-admin scope with 403', async () => {
    const response = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-ac',
        'content-type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });
    assert.equal(response.status, 403);
  });

  it('ignores browser-supplied authoritative scope fields', async () => {
    const response = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...createBody,
        companyId: DEFAULT_COMPANY_ID,
        projectId: 'project-forged',
        workspaceId: 'workspace-forged',
        tenantId: 'tenant-forged',
        invitedByUserId: 'user-forged',
      }),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as { companyId: string; projectId: string };
    assert.equal(body.companyId, DSE_COMPANY_ID);
    assert.equal(body.projectId, 'project-domy-s-energii');
  });

  it('rejects arbitrary invite roles', async () => {
    const response = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...createBody,
        roles: ['conis-admin'],
      }),
    });
    assert.equal(response.status, 400);
  });

  it('persists invites across repository restart', async () => {
    const created = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...createBody,
        email: 'persist@dse.test',
      }),
    });
    assert.equal(created.status, 201);
    const issued = (await created.json()) as { token: string };

    const restarted = new FilePlatformInviteRepository(join(directory, 'invites.json'));
    const resolved = await restarted.resolve(issued.token);
    assert.equal(resolved?.email, 'persist@dse.test');
  });

  it('reissues with a new token and invalidates the previous token', async () => {
    const created = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...createBody,
        email: 'reissue@dse.test',
      }),
    });
    assert.equal(created.status, 201);
    const issued = (await created.json()) as { id: string; token: string };

    const reissued = await fetch(
      `${baseUrl}/office/invites/${encodeURIComponent(issued.id)}/reissue`,
      {
        method: 'POST',
        headers: {
          cookie: '__Host-conis_partner_session=session-admin',
          origin: 'https://conis.cz',
        },
      },
    );
    assert.equal(reissued.status, 200);
    const next = (await reissued.json()) as { token: string };
    assert.notEqual(next.token, issued.token);
    assert.equal(await inviteRepository.resolve(issued.token), null);
    assert.equal((await inviteRepository.resolve(next.token))?.status, 'pending');
  });

  it('rejects cross-scope reissue with 403', async () => {
    const created = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...createBody,
        email: 'cross-scope@dse.test',
      }),
    });
    const issued = (await created.json()) as { id: string };

    const foreign = await fetch(
      `${baseUrl}/office/invites/${encodeURIComponent(issued.id)}/reissue`,
      {
        method: 'POST',
        headers: { cookie: '__Host-conis_partner_session=session-ac' },
      },
    );
    assert.equal(foreign.status, 403);
  });

  it('keeps activated invitations non-reissuable', async () => {
    const issued = await inviteRepository.create({
      email: 'activated@dse.test',
      displayName: 'Activated',
      roles: ['manager'],
      invitedByUserId: 'user-operator',
      tenantId: 'tenant-domy-s-energii',
      companyId: DSE_COMPANY_ID,
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
    });
    await inviteRepository.activate(issued.token, true);

    const response = await fetch(
      `${baseUrl}/office/invites/${encodeURIComponent(issued.id)}/reissue`,
      {
        method: 'POST',
        headers: { cookie: '__Host-conis_partner_session=session-admin' },
      },
    );
    assert.equal(response.status, 404);
  });

  it('resolves office-created invites through the public route', async () => {
    const created = await fetch(`${baseUrl}/office/invites`, {
      method: 'POST',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...createBody,
        email: 'public-resolve@dse.test',
      }),
    });
    const issued = (await created.json()) as { token: string };

    const resolved = await fetch(
      `${baseUrl}/public/invites/${encodeURIComponent(issued.token)}`,
    );
    assert.equal(resolved.status, 200);
    const body = (await resolved.json()) as { email: string };
    assert.equal(body.email, 'public-resolve@dse.test');
    assert.equal('token' in body, false);
  });

  it('activates through public auth and enforces single-use semantics', async () => {
    const sessionRepository = new FilePartnerSessionRepository(
      join(directory, 'partner-sessions.json'),
    );
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error === undefined ? resolve() : reject(error)));
    });
    server = createPlatformApiServer(
      inviteRepository,
      undefined,
      undefined,
      undefined,
      undefined,
      sessionRepository,
    );
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    assert.ok(address !== null && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;

    const issued = await inviteRepository.create({
      email: 'activate@dse.test',
      displayName: 'Activate Me',
      roles: ['manager'],
      invitedByUserId: 'user-operator',
      tenantId: 'tenant-domy-s-energii',
      companyId: DSE_COMPANY_ID,
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
    });

    const activation = await fetch(
      `${baseUrl}/public/auth/activate/${encodeURIComponent(issued.token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://conis.cz' },
        body: JSON.stringify({
          ndaAccepted: true,
          password: 'secure-password',
          rememberMe: true,
        }),
      },
    );
    assert.equal(activation.status, 200);

    const repeated = await fetch(
      `${baseUrl}/public/auth/activate/${encodeURIComponent(issued.token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ndaAccepted: true,
          password: 'secure-password',
          rememberMe: true,
        }),
      },
    );
    assert.equal(repeated.status, 409);
  });

  it('rejects expired invitations on activation', async () => {
    const expired = await inviteRepository.create({
      email: 'expired@dse.test',
      displayName: 'Expired',
      roles: ['manager'],
      invitedByUserId: 'user-operator',
      tenantId: 'tenant-domy-s-energii',
      companyId: DSE_COMPANY_ID,
      workspaceId: 'domy-s-energii-main',
      projectId: 'project-domy-s-energii',
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
    });

    const activation = await fetch(
      `${baseUrl}/public/auth/activate/${encodeURIComponent(expired.token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ndaAccepted: true,
          password: 'secure-password',
          rememberMe: true,
        }),
      },
    );
    assert.equal(activation.status, 409);
  });

  it('requires loopback for local-pilot invite routes', () => {
    assert.equal(requiresLoopbackAccess('POST', '/local-pilot/invites'), true);
    assert.equal(
      requiresLoopbackAccess('POST', '/local-pilot/invites/invite-test/reissue'),
      true,
    );
    assert.equal(
      requiresLoopbackAccess('POST', '/local-pilot/invites/invite-test/revoke'),
      true,
    );
  });

  it('still allows local-pilot invite creation over loopback', async () => {
    const response = await fetch(`${baseUrl}/local-pilot/invites`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'loopback@dse.test',
        displayName: 'Loopback',
        roles: ['manager'],
        invitedByUserId: 'user-operator',
        tenantId: 'tenant-domy-s-energii',
        companyId: DSE_COMPANY_ID,
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
      }),
    });
    assert.equal(response.status, 201);
  });
});
