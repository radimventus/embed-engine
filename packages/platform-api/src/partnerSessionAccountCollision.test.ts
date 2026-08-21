import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { DSE_COMPANY_ID } from '@embed-engine/platform-access';

import {
  createPlatformApiServer,
  FilePartnerSessionRepository,
  FilePlatformInviteRepository,
  PARTNER_ACCOUNT_COLLISION_MESSAGE,
  PartnerAccountCollisionError,
} from './index.ts';

const adminAccount = {
  id: 'user-conis-admin',
  email: 'admin@conis.test',
  displayName: 'CONIS Admin',
  roles: ['conis-admin'],
  tenantId: 'tenant-conis-admin',
  companyId: 'company-conis',
  workspaceId: 'workspace-conis',
  projectId: 'project-conis',
  passwordHash: 'existing-hash',
  passwordSalt: 'existing-salt',
  createdAt: '2026-08-01T08:00:00.000Z',
  lastLoginAt: '2026-08-01T08:00:00.000Z',
};

async function seedAccounts(
  sessionRepository: FilePartnerSessionRepository,
  accounts: readonly typeof adminAccount[],
): Promise<void> {
  await writeFile(
    sessionRepository.statePath,
    JSON.stringify({ accounts, sessions: [] }),
    { mode: 0o600 },
  );
}

describe('Partner account collision protection', () => {
  describe('FilePartnerSessionRepository', () => {
    it('rejects activation when an account with the same normalized email already exists', async () => {
      const directory = await mkdtemp(join(tmpdir(), 'conis-account-collision-'));
      const repository = new FilePartnerSessionRepository(
        join(directory, 'partner-sessions.json'),
      );
      await seedAccounts(repository, [adminAccount]);

      await assert.rejects(
        () =>
          repository.activate({
            invite: {
              id: 'invite-manager',
              email: ' Admin@CONIS.test ',
              displayName: 'Would-be Manager',
              roles: ['manager'],
              tenantId: 'tenant-domy-s-energii',
              companyId: DSE_COMPANY_ID,
              workspaceId: 'domy-s-energii-main',
              projectId: 'project-domy-s-energii',
            },
            password: 'secure-password',
            rememberMe: true,
          }),
        PartnerAccountCollisionError,
      );

      const state = JSON.parse(
        await readFile(join(directory, 'partner-sessions.json'), 'utf8'),
      ) as { accounts: readonly { id: string; roles: readonly string[] }[] };
      assert.equal(state.accounts.length, 1);
      assert.equal(state.accounts[0]?.id, 'user-conis-admin');
      assert.deepEqual(state.accounts[0]?.roles, ['conis-admin']);

      await rm(directory, { recursive: true, force: true });
    });

    it('creates a new account when the email is unused', async () => {
      const directory = await mkdtemp(join(tmpdir(), 'conis-account-collision-'));
      const repository = new FilePartnerSessionRepository(
        join(directory, 'partner-sessions.json'),
      );

      const issued = await repository.activate({
        invite: {
          id: 'invite-alfons',
          email: 'alfons@conis.cz',
          displayName: 'Alfons',
          roles: ['manager'],
          tenantId: 'tenant-domy-s-energii',
          companyId: DSE_COMPANY_ID,
          workspaceId: 'domy-s-energii-main',
          projectId: 'project-domy-s-energii',
        },
        password: 'secure-password',
        rememberMe: true,
      });

      assert.equal(issued.identity.user.email, 'alfons@conis.cz');
      assert.deepEqual(issued.identity.user.roles, ['manager']);

      await rm(directory, { recursive: true, force: true });
    });
  });

  describe('Platform API activation boundary', () => {
    let directory = '';
    let inviteRepository: FilePlatformInviteRepository;
    let sessionRepository: FilePartnerSessionRepository;
    let baseUrl = '';
    let server: ReturnType<typeof createPlatformApiServer>;

    before(async () => {
      directory = await mkdtemp(join(tmpdir(), 'conis-activation-collision-api-'));
      inviteRepository = new FilePlatformInviteRepository(join(directory, 'invites.json'));
      sessionRepository = new FilePartnerSessionRepository(
        join(directory, 'partner-sessions.json'),
      );
      await seedAccounts(sessionRepository, [adminAccount]);
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
    });

    after(async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
      });
      await rm(directory, { recursive: true, force: true });
    });

    it('returns 409 and preserves the admin account when activating a same-email invite', async () => {
      const issued = await inviteRepository.create({
        email: 'admin@conis.test',
        displayName: 'Downgraded Admin',
        roles: ['manager'],
        invitedByUserId: 'user-operator',
        tenantId: 'tenant-domy-s-energii',
        companyId: DSE_COMPANY_ID,
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
      });

      const response = await fetch(
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

      assert.equal(response.status, 409);
      assert.equal(
        ((await response.json()) as { error: string }).error,
        PARTNER_ACCOUNT_COLLISION_MESSAGE,
      );

      const account = await sessionRepository.findAccountByEmail('admin@conis.test');
      assert.equal(account?.id, 'user-conis-admin');
      assert.deepEqual(account?.roles, ['conis-admin']);
      assert.equal((await inviteRepository.resolve(issued.token))?.status, 'pending');
    });

    it('activates a genuinely new email and keeps single-use semantics', async () => {
      const issued = await inviteRepository.create({
        email: 'alfons@conis.cz',
        displayName: 'Alfons',
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
          headers: { 'content-type': 'application/json' },
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
  });

  describe('Office invite create collision', () => {
    let directory = '';
    let inviteRepository: FilePlatformInviteRepository;
    let sessionRepository: FilePartnerSessionRepository;
    let baseUrl = '';
    let server: ReturnType<typeof createPlatformApiServer>;

    before(async () => {
      directory = await mkdtemp(join(tmpdir(), 'conis-office-create-collision-'));
      inviteRepository = new FilePlatformInviteRepository(join(directory, 'invites.json'));
      sessionRepository = new FilePartnerSessionRepository(
        join(directory, 'partner-sessions.json'),
      );
      await seedAccounts(sessionRepository, [adminAccount]);
      const partnerSessions = {
        resolve: async (token: string) =>
          token === 'session-admin'
            ? {
                companyId: DSE_COMPANY_ID,
                user: { id: 'user-conis-admin', roles: ['conis-admin'] as const },
                workspaceContext: { companyId: DSE_COMPANY_ID },
              }
            : null,
        findAccountByEmail: (email: string) =>
          sessionRepository.findAccountByEmail(email),
        activate: (...args: Parameters<FilePartnerSessionRepository['activate']>) =>
          sessionRepository.activate(...args),
        login: (...args: Parameters<FilePartnerSessionRepository['login']>) =>
          sessionRepository.login(...args),
        mutateContext: (
          ...args: Parameters<FilePartnerSessionRepository['mutateContext']>
        ) => sessionRepository.mutateContext(...args),
        revoke: (...args: Parameters<FilePartnerSessionRepository['revoke']>) =>
          sessionRepository.revoke(...args),
      };
      server = createPlatformApiServer(
        inviteRepository,
        undefined,
        undefined,
        undefined,
        undefined,
        partnerSessions,
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
    });

    it('rejects /office/invites for an email that already has an account', async () => {
      const response = await fetch(`${baseUrl}/office/invites`, {
        method: 'POST',
        headers: {
          cookie: '__Host-conis_partner_session=session-admin',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: 'p-dse',
          email: ' Admin@CONIS.test ',
          displayName: 'Existing Admin',
          roles: ['manager'],
        }),
      });

      assert.equal(response.status, 409);
      assert.equal(
        ((await response.json()) as { error: string }).error,
        PARTNER_ACCOUNT_COLLISION_MESSAGE,
      );
      await assert.rejects(
        () => readFile(join(directory, 'invites.json'), 'utf8'),
        (error: NodeJS.ErrnoException) => error.code === 'ENOENT',
      );
    });
  });
});
