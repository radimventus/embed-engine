import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_TENANT_ID,
  DSE_WORKSPACE_ID,
} from '@embed-engine/platform-access';

import { createPlatformApiServer, FilePlatformInviteRepository } from './index.ts';
import { FileOfficePartnerRepository } from './officePartnerRepository.ts';
import { FilePartnerSessionRepository } from './partnerSessionRepository.ts';
import { createPartnerEnvironmentScopeResolver } from './resolveAuthoritativePartnerEnvironmentScope.ts';

const dseDraft = {
  name: 'Domy s energií',
  status: 'active',
  nextStep: 'Referenční šablona',
  company: {
    legalName: 'Domy s energií',
    ico: '62288474',
    city: 'Opava',
    country: 'Česko',
  },
  contact: {
    name: 'Radim Věntus',
    email: 'kontakt@domysenergii.cz',
    phone: '+420 725 020 757',
    role: 'Majitel',
  },
} as const;

const nordicDraft = {
  name: 'Nordic Homes',
  status: 'active',
  nextStep: 'Provoz',
  company: {
    legalName: 'Nordic Homes',
    ico: '',
    city: 'Oslo',
    country: 'Norsko',
  },
  contact: {
    name: 'Ana Nordic',
    email: 'ana@nordic.example',
    phone: '',
    role: 'CEO',
  },
} as const;

const NORDIC_SCOPE = {
  tenantId: 'tenant-x',
  companyId: 'partner-x',
  workspaceId: 'workspace-x',
  projectId: 'project-x',
} as const;

const enterDse = {
  action: 'enter' as const,
  partnerId: 'p-dse',
  tenantId: DSE_TENANT_ID,
  companyId: DSE_COMPANY_ID,
  workspaceId: DSE_WORKSPACE_ID,
  projectId: DSE_CANONICAL_PROJECT_ID,
  activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
  activeStudio: 'client' as const,
  officeReturnHref: 'https://conis.cz/studio/office/partners/p-dse',
};

const enterNordic = {
  action: 'enter' as const,
  partnerId: 'partner-x',
  ...NORDIC_SCOPE,
  activeHouseId: null,
  activeStudio: 'client' as const,
  officeReturnHref: 'https://conis.cz/studio/office/partners/partner-x',
};

describe('Authoritative Partner Environment entry', () => {
  async function withHarness(
    run: (input: {
      readonly directory: string;
      readonly partners: FileOfficePartnerRepository;
      readonly sessions: FilePartnerSessionRepository;
      readonly adminToken: string;
    }) => Promise<void>,
  ): Promise<void> {
    const directory = await mkdtemp(join(tmpdir(), 'conis-pe-entry-'));
    try {
      const partners = new FileOfficePartnerRepository(
        join(directory, 'office-partners.json'),
      );
      await partners.create({ id: 'p-dse', draft: dseDraft });
      await partners.updateEnvironmentScope(
        'p-dse',
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );
      await partners.create({ id: 'partner-x', draft: nordicDraft });
      await partners.updateEnvironmentScope('partner-x', NORDIC_SCOPE);

      const sessions = new FilePartnerSessionRepository(
        join(directory, 'partner-sessions.json'),
        createPartnerEnvironmentScopeResolver(partners),
      );
      const admin = await sessions.activate({
        invite: {
          id: 'invite-admin-pe',
          email: 'admin-pe@conis.test',
          displayName: 'CONIS Admin',
          roles: ['conis-admin'],
          tenantId: 'tenant-conis-admin',
          companyId: 'company-conis',
          workspaceId: 'workspace-conis',
          projectId: 'project-conis',
        },
        password: 'secure-password',
        rememberMe: true,
      });
      await run({
        directory,
        partners,
        sessions,
        adminToken: admin.token,
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  it('enters a non-DSE durable Partner with exact scope', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, enterNordic);
      assert.ok(entered !== null);
      assert.equal(entered.tenantId, NORDIC_SCOPE.tenantId);
      assert.equal(entered.companyId, NORDIC_SCOPE.companyId);
      assert.equal(entered.workspaceId, NORDIC_SCOPE.workspaceId);
      assert.equal(entered.projectId, NORDIC_SCOPE.projectId);
      assert.equal(entered.workspaceContext?.partnerId, 'partner-x');
      assert.equal(entered.activeHouseId, null);
      assert.notEqual(entered.companyId, DSE_COMPANY_ID);
    });
  });

  it('enters DSE through the same durable Partner scope', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, enterDse);
      assert.ok(entered !== null);
      assert.equal(entered.companyId, DSE_COMPANY_ID);
      assert.equal(entered.projectId, DSE_CANONICAL_PROJECT_ID);
      assert.equal(entered.workspaceContext?.partnerId, 'p-dse');
      assert.equal(entered.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
    });
  });

  it('denies unknown Partner, missing PE scope, and forged identities', async () => {
    await withHarness(async ({ sessions, partners, adminToken }) => {
      const before = await sessions.resolve(adminToken);
      assert.equal(before?.companyId, 'company-conis');

      const unknown = await sessions.mutateContext(adminToken, {
        ...enterNordic,
        partnerId: 'partner-unknown',
      });
      assert.equal(unknown, null);

      await partners.create({
        id: 'partner-empty',
        draft: nordicDraft,
      });
      const missingScope = await sessions.mutateContext(adminToken, {
        ...enterNordic,
        partnerId: 'partner-empty',
        companyId: 'partner-empty',
      });
      assert.equal(missingScope, null);

      const forged = [
        { tenantId: 'tenant-forged' },
        { companyId: 'company-forged' },
        { workspaceId: 'workspace-forged' },
        { projectId: 'project-forged' },
      ] as const;
      for (const patch of forged) {
        const denied = await sessions.mutateContext(adminToken, {
          ...enterNordic,
          ...patch,
        });
        assert.equal(denied, null);
      }

      const after = await sessions.resolve(adminToken);
      assert.equal(after?.companyId, 'company-conis');
      assert.equal(after?.workspaceContext, null);
    });
  });

  it('denies manager and salesman operator enter', async () => {
    await withHarness(async ({ sessions }) => {
      const manager = await sessions.activate({
        invite: {
          id: 'invite-manager-pe',
          email: 'manager-pe@example.test',
          displayName: 'Manager',
          roles: ['manager'],
          tenantId: NORDIC_SCOPE.tenantId,
          companyId: NORDIC_SCOPE.companyId,
          workspaceId: NORDIC_SCOPE.workspaceId,
          projectId: NORDIC_SCOPE.projectId,
        },
        password: 'secure-password',
        rememberMe: true,
      });
      assert.equal(
        await sessions.mutateContext(manager.token, enterNordic),
        null,
      );

      const salesman = await sessions.activate({
        invite: {
          id: 'invite-sales-pe',
          email: 'sales-pe@example.test',
          displayName: 'Sales',
          roles: ['salesman'],
          tenantId: NORDIC_SCOPE.tenantId,
          companyId: NORDIC_SCOPE.companyId,
          workspaceId: NORDIC_SCOPE.workspaceId,
          projectId: NORDIC_SCOPE.projectId,
        },
        password: 'secure-password',
        rememberMe: true,
      });
      assert.equal(
        await sessions.mutateContext(salesman.token, enterNordic),
        null,
      );
    });
  });

  it('clears a cross-Project House and does not auto-select DSE Houses', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, {
        ...enterNordic,
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        authoredHouseIdentities: [
          {
            houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
            name: 'BUNGALOV 4KK',
            canonicalProjectId: DSE_CANONICAL_PROJECT_ID,
            packageRoot: 'apps/client-studio/public/house-packages/bungalov-4kk',
            dataMode: 'REFERENCE_DEMO',
            status: 'draft',
          },
        ],
      });
      assert.ok(entered !== null);
      assert.equal(entered.projectId, NORDIC_SCOPE.projectId);
      assert.equal(entered.activeHouseId, null);
      assert.deepEqual(entered.workspaceContext?.authoredHouseIdentities, []);
    });
  });

  it('keeps a valid target-project authored House and null when none is active', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const houseId = 'draft-partner-x-project-x-vas-prvni-dum-5kk';
      const withHouse = await sessions.mutateContext(adminToken, {
        ...enterNordic,
        activeHouseId: houseId,
        authoredHouseIdentities: [
          {
            houseId,
            name: 'Váš první dům',
            canonicalProjectId: NORDIC_SCOPE.projectId,
            packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
            dataMode: 'LIVE_EMPTY',
            status: 'draft',
          },
        ],
      });
      assert.ok(withHouse !== null);
      assert.equal(withHouse.activeHouseId, houseId);

      const empty = await sessions.mutateContext(adminToken, enterNordic);
      assert.ok(empty !== null);
      assert.equal(empty.activeHouseId, null);
      assert.notEqual(empty.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
    });
  });

  it('persists PE scope then enters through POST /public/auth/context', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'conis-pe-http-'));
    const inviteRepository = new FilePlatformInviteRepository(
      join(directory, 'invites.json'),
    );
    const partners = new FileOfficePartnerRepository(
      join(directory, 'office-partners.json'),
    );
    await partners.create({ id: 'partner-x', draft: nordicDraft });
    const sessions = new FilePartnerSessionRepository(
      join(directory, 'partner-sessions.json'),
      createPartnerEnvironmentScopeResolver(partners),
    );
    const server = createPlatformApiServer(
      inviteRepository,
      undefined,
      undefined,
      undefined,
      undefined,
      sessions,
      undefined,
      undefined,
      undefined,
      undefined,
      partners,
    );
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}`;

      const issuedInvite = await inviteRepository.create({
        email: 'admin-http-pe@conis.test',
        displayName: 'CONIS Admin',
        roles: ['conis-admin'],
        invitedByUserId: 'user-operator',
        tenantId: 'tenant-conis-admin',
        companyId: 'company-conis',
        workspaceId: 'workspace-conis',
        projectId: 'project-conis',
      });
      const activation = await fetch(
        `${baseUrl}/public/auth/activate/${encodeURIComponent(issuedInvite.token)}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: 'https://conis.cz',
          },
          body: JSON.stringify({
            ndaAccepted: true,
            password: 'secure-password',
            rememberMe: true,
          }),
        },
      );
      assert.equal(activation.status, 200);
      const cookie = activation.headers.get('set-cookie')?.split(';')[0];
      assert.ok(cookie);

      const persist = await fetch(
        `${baseUrl}/office/partners/partner-x/environment-scope`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            cookie,
            origin: 'https://conis.cz',
          },
          body: JSON.stringify(NORDIC_SCOPE),
        },
      );
      assert.equal(persist.status, 200);

      const mutation = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz',
        },
        body: JSON.stringify(enterNordic),
      });
      assert.equal(mutation.status, 200);
      const body = (await mutation.json()) as {
        session: {
          companyId: string;
          projectId: string;
          activeHouseId: string | null;
          workspaceContext: { partnerId: string } | null;
        };
      };
      assert.equal(body.session.companyId, NORDIC_SCOPE.companyId);
      assert.equal(body.session.projectId, NORDIC_SCOPE.projectId);
      assert.equal(body.session.workspaceContext?.partnerId, 'partner-x');
      assert.equal(body.session.activeHouseId, null);

      const forged = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz',
        },
        body: JSON.stringify({
          ...enterNordic,
          projectId: 'project-forged',
        }),
      });
      assert.equal(forged.status, 403);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) =>
          error === undefined ? resolve() : reject(error),
        );
      });
      await rm(directory, { recursive: true, force: true });
    }
  });
});
