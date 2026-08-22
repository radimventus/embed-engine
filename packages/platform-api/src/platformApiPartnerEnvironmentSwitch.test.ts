import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
  DSE_TENANT_ID,
  DSE_WORKSPACE_ID,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
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

const blokkiDraft = {
  name: 'Blokki',
  status: 'active',
  nextStep: 'Provoz',
  company: {
    legalName: 'Blokki',
    ico: '',
    city: 'Praha',
    country: 'Česko',
  },
  contact: {
    name: 'Blokki Admin',
    email: 'admin@blokki.example',
    phone: '',
    role: 'CEO',
  },
} as const;

const BLOKKI_SCOPE = {
  tenantId: 'tenant-blokki',
  companyId: 'company-blokki',
  workspaceId: 'blokki-main',
  projectId: 'project-blokki',
} as const;

const BLOKKI_BUNGALOV_ID = deriveReferenceInstanceHouseId({
  sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  companyId: BLOKKI_SCOPE.companyId,
  projectId: BLOKKI_SCOPE.projectId,
});

const BLOKKI_VPD_ID = derivePartnerDraftHouseId({
  companyId: BLOKKI_SCOPE.companyId,
  projectId: BLOKKI_SCOPE.projectId,
  houseSlug: 'vas-prvni-dum-5kk',
});

const enterBlokki = {
  action: 'enter' as const,
  partnerId: 'company-blokki',
  ...BLOKKI_SCOPE,
  activeHouseId: null,
  activeStudio: 'builder' as const,
  officeReturnHref: 'https://conis.cz/studio/office/partners/company-blokki',
};

const enterDse = {
  action: 'enter' as const,
  partnerId: 'p-dse',
  tenantId: DSE_TENANT_ID,
  companyId: DSE_COMPANY_ID,
  workspaceId: DSE_WORKSPACE_ID,
  projectId: DSE_CANONICAL_PROJECT_ID,
  activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
  activeStudio: 'builder' as const,
  officeReturnHref: 'https://conis.cz/studio/office/partners/p-dse',
};

describe('Authoritative Partner Environment house switch', () => {
  async function withHarness(
    run: (input: {
      readonly sessions: FilePartnerSessionRepository;
      readonly adminToken: string;
    }) => Promise<void>,
  ): Promise<void> {
    const directory = await mkdtemp(join(tmpdir(), 'conis-pe-switch-'));
    try {
      const partners = new FileOfficePartnerRepository(
        join(directory, 'office-partners.json'),
      );
      await partners.create({ id: 'p-dse', draft: dseDraft });
      await partners.updateEnvironmentScope(
        'p-dse',
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );
      await partners.create({ id: 'company-blokki', draft: blokkiDraft });
      await partners.updateEnvironmentScope('company-blokki', BLOKKI_SCOPE);

      const sessions = new FilePartnerSessionRepository(
        join(directory, 'partner-sessions.json'),
        createPartnerEnvironmentScopeResolver(partners),
      );
      const admin = await sessions.activate({
        invite: {
          id: 'invite-admin-switch',
          email: 'admin-switch@conis.test',
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
        sessions,
        adminToken: admin.token,
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  it('switches Blokki BUNGALOV and VPD inside the authorized Blokki Project', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, enterBlokki);
      assert.ok(entered !== null);
      assert.equal(entered.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(entered.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(entered.activeHouseId, null);

      const bungalov = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: BLOKKI_BUNGALOV_ID,
      });
      assert.ok(bungalov !== null);
      assert.equal(bungalov.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(bungalov.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(bungalov.activeHouseId, BLOKKI_BUNGALOV_ID);
      assert.notEqual(bungalov.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
      assert.notEqual(bungalov.companyId, DSE_COMPANY_ID);

      const vpd = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: BLOKKI_VPD_ID,
      });
      assert.ok(vpd !== null);
      assert.equal(vpd.activeHouseId, BLOKKI_VPD_ID);
      assert.equal(vpd.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(vpd.projectId, BLOKKI_SCOPE.projectId);

      let current = vpd;
      for (const houseId of [
        BLOKKI_BUNGALOV_ID,
        BLOKKI_VPD_ID,
        BLOKKI_BUNGALOV_ID,
        BLOKKI_VPD_ID,
      ]) {
        current = await sessions.mutateContext(adminToken, {
          action: 'switch',
          activeStudio: 'builder',
          projectId: BLOKKI_SCOPE.projectId,
          activeHouseId: houseId,
        });
        assert.ok(current !== null);
        assert.equal(current.activeHouseId, houseId);
        assert.equal(current.companyId, BLOKKI_SCOPE.companyId);
        assert.equal(current.projectId, BLOKKI_SCOPE.projectId);
      }
    });
  });


  it('lets CONIS Admin enter persisted BLOKKI by Project through durable PE resolution', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const enteredDse = await sessions.mutateContext(adminToken, enterDse);
      assert.ok(enteredDse !== null);
      assert.equal(enteredDse.projectId, DSE_CANONICAL_PROJECT_ID);

      const blokki = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        tenantId: BLOKKI_SCOPE.tenantId,
        companyId: BLOKKI_SCOPE.companyId,
        workspaceId: BLOKKI_SCOPE.workspaceId,
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: null,
      });

      assert.ok(blokki !== null);
      assert.equal(blokki.tenantId, BLOKKI_SCOPE.tenantId);
      assert.equal(blokki.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(blokki.workspaceId, BLOKKI_SCOPE.workspaceId);
      assert.equal(blokki.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(blokki.activeHouseId, null);

      const bungalov = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: BLOKKI_BUNGALOV_ID,
      });

      assert.ok(bungalov !== null);
      assert.equal(bungalov.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(bungalov.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(bungalov.activeHouseId, BLOKKI_BUNGALOV_ID);
    });
  });

  it('keeps DSE BUNGALOV ↔ VPD switching inside authorized DSE', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, enterDse);
      assert.ok(entered !== null);
      assert.equal(entered.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);

      const vpd = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: DSE_CANONICAL_PROJECT_ID,
        activeHouseId: DSE_FIRST_DRAFT_HOUSE_ID,
      });
      assert.ok(vpd !== null);
      assert.equal(vpd.companyId, DSE_COMPANY_ID);
      assert.equal(vpd.activeHouseId, DSE_FIRST_DRAFT_HOUSE_ID);

      const bungalov = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: DSE_CANONICAL_PROJECT_ID,
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      });
      assert.ok(bungalov !== null);
      assert.equal(bungalov.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
    });
  });

  it('clears a foreign House and lets CONIS Admin switch to another authoritative Partner Environment', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, {
        ...enterBlokki,
        activeHouseId: BLOKKI_BUNGALOV_ID,
      });
      assert.ok(entered !== null);
      assert.equal(entered.activeHouseId, null);

      const selected = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: BLOKKI_BUNGALOV_ID,
      });
      assert.ok(selected !== null);
      assert.equal(selected.activeHouseId, BLOKKI_BUNGALOV_ID);

      const foreignHouse = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      });
      assert.ok(foreignHouse !== null);
      assert.equal(foreignHouse.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(foreignHouse.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(foreignHouse.activeHouseId, null);

      const otherProjectHouse = deriveReferenceInstanceHouseId({
        sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
        companyId: BLOKKI_SCOPE.companyId,
        projectId: 'project-other',
      });
      const crossProject = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: otherProjectHouse,
      });
      assert.ok(crossProject !== null);
      assert.equal(crossProject.activeHouseId, null);
      assert.equal(crossProject.companyId, BLOKKI_SCOPE.companyId);

      const escaped = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        tenantId: DSE_TENANT_ID,
        companyId: DSE_COMPANY_ID,
        workspaceId: DSE_WORKSPACE_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      });
      assert.ok(escaped !== null);
      assert.equal(escaped.tenantId, DSE_TENANT_ID);
      assert.equal(escaped.companyId, DSE_COMPANY_ID);
      assert.equal(escaped.workspaceId, DSE_WORKSPACE_ID);
      assert.equal(escaped.projectId, DSE_CANONICAL_PROJECT_ID);
      assert.equal(escaped.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);

      const remaining = await sessions.resolve(adminToken);
      assert.equal(remaining?.companyId, DSE_COMPANY_ID);
      assert.equal(remaining?.projectId, DSE_CANONICAL_PROJECT_ID);
      assert.equal(remaining?.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
    });
  });

  it('clears an unknown House without substituting DSE', async () => {
    await withHarness(async ({ sessions, adminToken }) => {
      const entered = await sessions.mutateContext(adminToken, enterBlokki);
      assert.ok(entered !== null);

      await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: BLOKKI_BUNGALOV_ID,
      });

      const unknown = await sessions.mutateContext(adminToken, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: BLOKKI_SCOPE.projectId,
        activeHouseId: 'stale-unknown-house',
      });
      assert.ok(unknown !== null);
      assert.equal(unknown.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(unknown.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(unknown.activeHouseId, null);
      assert.notEqual(unknown.companyId, DSE_COMPANY_ID);
      assert.notEqual(unknown.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
    });
  });

  it('switches Blokki Houses through POST /public/auth/context, sanitizes a foreign House, and lets CONIS Admin switch Partner Environment', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'conis-pe-switch-http-'));
    const inviteRepository = new FilePlatformInviteRepository(
      join(directory, 'invites.json'),
    );
    const partners = new FileOfficePartnerRepository(
      join(directory, 'office-partners.json'),
    );
    await partners.create({ id: 'company-blokki', draft: blokkiDraft });
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
        email: 'admin-http-switch@conis.test',
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
        `${baseUrl}/office/partners/company-blokki/environment-scope`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            cookie,
            origin: 'https://conis.cz',
          },
          body: JSON.stringify(BLOKKI_SCOPE),
        },
      );
      assert.equal(persist.status, 200);

      const entered = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz',
        },
        body: JSON.stringify(enterBlokki),
      });
      assert.equal(entered.status, 200);

      const switched = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz',
        },
        body: JSON.stringify({
          action: 'switch',
          activeStudio: 'builder',
          projectId: BLOKKI_SCOPE.projectId,
          activeHouseId: BLOKKI_BUNGALOV_ID,
        }),
      });
      assert.equal(switched.status, 200);
      const switchedBody = (await switched.json()) as {
        session: {
          companyId: string;
          projectId: string;
          activeHouseId: string | null;
        };
      };
      assert.equal(switchedBody.session.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(switchedBody.session.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(switchedBody.session.activeHouseId, BLOKKI_BUNGALOV_ID);

      const forgedHouse = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz',
        },
        body: JSON.stringify({
          action: 'switch',
          activeStudio: 'builder',
          projectId: BLOKKI_SCOPE.projectId,
          activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        }),
      });
      assert.equal(forgedHouse.status, 200);
      const forgedHouseBody = (await forgedHouse.json()) as {
        session: {
          companyId: string;
          projectId: string;
          activeHouseId: string | null;
        };
      };
      assert.equal(forgedHouseBody.session.companyId, BLOKKI_SCOPE.companyId);
      assert.equal(forgedHouseBody.session.projectId, BLOKKI_SCOPE.projectId);
      assert.equal(forgedHouseBody.session.activeHouseId, null);

      const forgedProject = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz',
        },
        body: JSON.stringify({
          action: 'switch',
          activeStudio: 'builder',
          projectId: DSE_CANONICAL_PROJECT_ID,
          activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        }),
      });
      assert.equal(forgedProject.status, 200);
      const forgedProjectBody = (await forgedProject.json()) as {
        session: {
          tenantId: string;
          companyId: string;
          workspaceId: string;
          projectId: string;
          activeHouseId: string | null;
        };
      };
      assert.equal(forgedProjectBody.session.tenantId, DSE_TENANT_ID);
      assert.equal(forgedProjectBody.session.companyId, DSE_COMPANY_ID);
      assert.equal(forgedProjectBody.session.workspaceId, DSE_WORKSPACE_ID);
      assert.equal(forgedProjectBody.session.projectId, DSE_CANONICAL_PROJECT_ID);
      assert.equal(
        forgedProjectBody.session.activeHouseId,
        DSE_BUNGALOV_4KK_HOUSE_ID,
      );

      const remaining = await fetch(`${baseUrl}/public/auth/me`, {
        headers: { cookie, origin: 'https://conis.cz' },
      });
      assert.equal(remaining.status, 200);
      const remainingBody = (await remaining.json()) as {
        tenantId: string;
        companyId: string;
        workspaceId: string;
        projectId: string;
        activeHouseId: string | null;
      };
      assert.equal(remainingBody.tenantId, DSE_TENANT_ID);
      assert.equal(remainingBody.companyId, DSE_COMPANY_ID);
      assert.equal(remainingBody.workspaceId, DSE_WORKSPACE_ID);
      assert.equal(remainingBody.projectId, DSE_CANONICAL_PROJECT_ID);
      assert.equal(
        remainingBody.activeHouseId,
        DSE_BUNGALOV_4KK_HOUSE_ID,
      );
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
