import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
} from '@embed-engine/platform-access';

import {
  createPlatformApiServer,
  FileOrderRepository,
  FileOfferWriteTokenRepository,
  FilePartnerSessionRepository,
  FileHousePackageRepository,
  FilePlatformInviteRepository,
  FileProformaRepository,
  FileSocialProofAnalyticsRepository,
  platformApiAllowedOrigins,
  platformApiStatePath,
  requiresLoopbackAccess,
} from './index.ts';
import { FileOfficePartnerRepository } from './officePartnerRepository.ts';
import { createPartnerEnvironmentScopeResolver } from './resolveAuthoritativePartnerEnvironmentScope.ts';

process.env.OFFER_CAPABILITY_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString(
  'base64url',
);

async function repositoryForTest(): Promise<{
  readonly repository: FilePlatformInviteRepository;
  readonly statePath: string;
  readonly cleanup: () => Promise<void>;
}> {
  const directory = await mkdtemp(join(tmpdir(), 'embed-platform-api-test-'));
  return {
    repository: new FilePlatformInviteRepository(join(directory, 'invites.json')),
    statePath: join(directory, 'invites.json'),
    cleanup: () => rm(directory, { recursive: true, force: true }),
  };
}

const inviteInput = {
  email: 'partner@example.test',
  displayName: 'Partner',
  roles: ['manager'],
  invitedByUserId: 'user-operator',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  workspaceId: 'workspace-1',
  projectId: 'project-1',
};

const socialProofScope = {
  companyId: 'company-1',
  projectId: 'project-1',
} as const;

const durableOrderInput = {
  orderId: 'OFF-TEST-001',
  offerSlug: 'domy-s-energi',
  companyId: 'company-domy-s-energi',
  partnerId: 'p-dse',
  createdAt: '2026-08-12T12:00:00.000Z',
  partner: {
    partnerName: 'Domy s energií',
    companyName: 'Domy s energií s.r.o.',
    contactName: 'Jana Energetická',
    email: 'jana@domysenergii.cz',
    phone: '+420777200300',
    ico: '06123456',
  },
  package: {
    id: 'starter',
    name: 'Starter',
    licenseLabel: '1 dům',
    trialDays: 90,
  },
  priceCzk: 14_970,
  termsVersion: '1.0',
  termsAcceptedAt: '2026-08-12T12:00:00.000Z',
} as const;

const dsePartnerDraft = {
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

async function partnerSessionRepositoryWithDseScope(directory: string): Promise<{
  readonly repository: FilePartnerSessionRepository;
  readonly partners: FileOfficePartnerRepository;
}> {
  const partners = new FileOfficePartnerRepository(
    join(directory, 'office-partners.json'),
  );
  await partners.create({ id: 'p-dse', draft: dsePartnerDraft });
  await partners.updateEnvironmentScope(
    'p-dse',
    CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
  );
  return {
    partners,
    repository: new FilePartnerSessionRepository(
      join(directory, 'partner-sessions.json'),
      createPartnerEnvironmentScopeResolver(partners),
    ),
  };
}

describe('Platform API invitation repository', () => {
  it('resolves an invite from another client repository', async () => {
    const fixture = await repositoryForTest();
    try {
      const issued = await fixture.repository.create(inviteInput);
      const secondClient = new FilePlatformInviteRepository(fixture.statePath);
      const resolved = await secondClient.resolve(issued.token);
      assert.equal(resolved?.email, inviteInput.email);
      assert.equal('token' in (resolved ?? {}), false);
    } finally {
      await fixture.cleanup();
    }
  });

  it('activates a token only once', async () => {
    const fixture = await repositoryForTest();
    try {
      const issued = await fixture.repository.create(inviteInput);
      assert.equal((await fixture.repository.activate(issued.token, true)).ok, true);
      const repeated = await fixture.repository.activate(issued.token, true);
      assert.equal(repeated.ok, false);
      assert.match(repeated.ok ? '' : repeated.error, /už byla aktivována/i);
    } finally {
      await fixture.cleanup();
    }
  });

  it('invalidates the old token when reissued', async () => {
    const fixture = await repositoryForTest();
    try {
      const issued = await fixture.repository.create(inviteInput);
      const reissued = await fixture.repository.reissue(issued.id);
      assert.ok(reissued !== null);
      assert.equal(await fixture.repository.resolve(issued.token), null);
      assert.equal((await fixture.repository.resolve(reissued.token))?.status, 'pending');
    } finally {
      await fixture.cleanup();
    }
  });

  it('rejects expired and revoked invitations', async () => {
    const fixture = await repositoryForTest();
    try {
      const expired = await fixture.repository.create({
        ...inviteInput,
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
      });
      assert.equal((await fixture.repository.activate(expired.token, true)).ok, false);
      const pending = await fixture.repository.create(inviteInput);
      assert.equal((await fixture.repository.revoke(pending.id))?.status, 'revoked');
      assert.equal((await fixture.repository.activate(pending.token, true)).ok, false);
    } finally {
      await fixture.cleanup();
    }
  });

  it('stores only a SHA-256 verifier, never the raw token', async () => {
    const fixture = await repositoryForTest();
    try {
      const issued = await fixture.repository.create(inviteInput);
      const stored = await readFile(fixture.statePath, 'utf8');
      assert.equal(stored.includes(issued.token), false);
      assert.match(stored, /"verifier":"[A-Za-z0-9_-]{43}"/);
    } finally {
      await fixture.cleanup();
    }
  });
});

describe('Durable partner sessions', () => {
  it('persists an opaque session, preserves the Manager role, and revokes it', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-session-test-'));
    const statePath = join(directory, 'partner-sessions.json');
    const invite = {
      id: 'invite-manager',
      email: 'manager@example.test',
      displayName: 'Manager',
      roles: ['manager'],
      tenantId: 'tenant-1',
      companyId: 'company-1',
      workspaceId: 'workspace-1',
      projectId: 'project-1',
    };
    try {
      const first = new FilePartnerSessionRepository(statePath);
      const issued = await first.activate({
        invite,
        password: 'secure-password',
        rememberMe: true,
      });
      const stored = await readFile(statePath, 'utf8');
      assert.equal(stored.includes(issued.token), false);
      assert.equal(stored.includes('secure-password'), false);
      assert.match(stored, /"passwordHash":"[A-Za-z0-9_-]+"/);

      const restarted = new FilePartnerSessionRepository(statePath);
      const restored = await restarted.resolve(issued.token);
      assert.equal(restored?.user.email, invite.email);
      assert.deepEqual(restored?.user.roles, ['manager']);

      await restarted.revoke(issued.token);
      assert.equal(await new FilePartnerSessionRepository(statePath).resolve(issued.token), null);
      assert.equal(await restarted.resolve('invalid-session-token'), null);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects an expired persisted session', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-session-expiry-test-'));
    const statePath = join(directory, 'partner-sessions.json');
    try {
      const repository = new FilePartnerSessionRepository(statePath);
      const issued = await repository.activate({
        invite: {
          id: 'invite-expired',
          email: 'expired@example.test',
          displayName: 'Expired',
          roles: ['manager'],
          tenantId: 'tenant-1',
          companyId: 'company-1',
          workspaceId: 'workspace-1',
          projectId: 'project-1',
        },
        password: 'secure-password',
        rememberMe: false,
      });
      const persisted = JSON.parse(await readFile(statePath, 'utf8')) as {
        sessions: Array<{ expiresAt: string }>;
      };
      persisted.sessions[0]!.expiresAt = '2020-01-01T00:00:00.000Z';
      await writeFile(statePath, JSON.stringify(persisted), { mode: 0o600 });
      assert.equal(await new FilePartnerSessionRepository(statePath).resolve(issued.token), null);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('clears an unverified House instead of substituting DSE BUNGALOV', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-house-scope-test-'));
    const { repository } = await partnerSessionRepositoryWithDseScope(directory);
    const statePath = join(directory, 'partner-sessions.json');

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-conis-admin-house-scope',
          email: 'admin-house-scope@conis.test',
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

      const entered = await repository.mutateContext(issued.token, {
        action: 'enter',
        partnerId: 'p-dse',
        tenantId: 'tenant-domy-s-energii',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        activeHouseId: 'unverified-house',
        activeStudio: 'client',
        officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
      });

      assert.ok(entered !== null);
      assert.equal(entered.activeHouseId, null);
      assert.equal(entered.workspaceContext?.activeHouseId, null);

      const restarted = new FilePartnerSessionRepository(statePath);
      const restored = await restarted.resolve(issued.token);

      assert.equal(restored?.activeHouseId, null);
      assert.equal(restored?.workspaceContext?.activeHouseId, null);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('round-trips authored DSE House identity through the durable Partner Environment session', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-authored-house-test-'));
    const { repository } = await partnerSessionRepositoryWithDseScope(directory);
    const statePath = join(directory, 'partner-sessions.json');

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-conis-admin-authored-house',
          email: 'admin-authored-house@conis.test',
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

      const entered = await repository.mutateContext(issued.token, {
        action: 'enter',
        partnerId: 'p-dse',
        tenantId: 'tenant-domy-s-energii',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        activeHouseId: 'patrovy-5kk',
        authoredHouseIdentities: [
          {
            houseId: 'patrovy-5kk',
            name: 'PATROVÝ 5KK',
            canonicalProjectId: 'project-domy-s-energii',
            packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
            dataMode: 'LIVE_EMPTY',
            status: 'draft',
          },
        ],
        activeStudio: 'client',
       officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
      });

      assert.ok(entered !== null);

      assert.deepEqual(
        entered.workspaceContext?.authoredHouseIdentities,
        [
          {
            houseId: 'patrovy-5kk',
            name: 'PATROVÝ 5KK',
            canonicalProjectId: 'project-domy-s-energii',
            packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
            dataMode: 'LIVE_EMPTY',
            status: 'draft',
          },
        ],
      );

      const restarted = new FilePartnerSessionRepository(statePath);
      const restored = await restarted.resolve(issued.token);

      assert.equal(restored?.activeHouseId, 'patrovy-5kk');
      assert.deepEqual(
        restored?.workspaceContext?.authoredHouseIdentities,
        entered.workspaceContext?.authoredHouseIdentities,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('preserves the selected DSE first House across Builder, Client, Manager, Sales, and Builder', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-studio-loop-test-'));
    const { repository } = await partnerSessionRepositoryWithDseScope(directory);
    const vpdHouseId =
      'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk';

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-conis-admin-studio-loop',
          email: 'admin-studio-loop@conis.test',
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
      const entered = await repository.mutateContext(issued.token, {
        action: 'enter',
        partnerId: 'p-dse',
        tenantId: 'tenant-domy-s-energii',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        activeHouseId: vpdHouseId,
        authoredHouseIdentities: [
          {
            houseId: vpdHouseId,
            name: 'VÁŠ PRVNÍ DŮM',
            canonicalProjectId: 'project-domy-s-energii',
            packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
            dataMode: 'LIVE_EMPTY',
            status: 'draft',
          },
        ],
        activeStudio: 'builder',
        officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
      });

      assert.ok(entered !== null);
      assert.equal(entered.activeHouseId, vpdHouseId);

      let current = entered;
      for (const activeStudio of ['client', 'manager', 'sales', 'builder'] as const) {
        current = await repository.mutateContext(issued.token, {
          action: 'switch',
          activeStudio,
          projectId: 'project-domy-s-energii',
          activeHouseId: vpdHouseId,
          authoredHouseIdentities: current.workspaceContext?.authoredHouseIdentities,
        });
        assert.ok(current !== null);
        assert.equal(current.projectId, 'project-domy-s-energii');
        assert.equal(current.activeHouseId, vpdHouseId);
        assert.equal(current.workspaceContext?.projectId, 'project-domy-s-energii');
        assert.equal(current.workspaceContext?.activeHouseId, vpdHouseId);
        assert.equal(current.activeStudioId, activeStudio);
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('persists AC Modular / MODERN scope through authoritative Partner Environment switch and repository restart', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-scope-switch-test-'));
    const { repository } = await partnerSessionRepositoryWithDseScope(directory);
    const statePath = join(directory, 'partner-sessions.json');

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-conis-admin-scope-switch',
          email: 'admin-scope-switch@conis.test',
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

      const entered = await repository.mutateContext(issued.token, {
        action: 'enter',
        partnerId: 'p-dse',
        tenantId: 'tenant-domy-s-energii',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        activeHouseId:
          'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
        activeStudio: 'client',
        officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
      });

      assert.ok(entered !== null);
      assert.equal(entered.projectId, 'project-domy-s-energii');

      const switched = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'builder',
        tenantId: 'tenant-ac-modular',
        companyId: 'ac-modular',
        workspaceId: 'ac-modular-main',
        projectId: 'project-ac-modular',
        activeHouseId: 'modern-4kk',
      });

      assert.ok(switched !== null);
      assert.equal(switched.tenantId, 'tenant-ac-modular');
      assert.equal(switched.companyId, 'ac-modular');
      assert.equal(switched.workspaceId, 'ac-modular-main');
      assert.equal(switched.projectId, 'project-ac-modular');
      assert.equal(switched.activeHouseId, 'modern-4kk');
      assert.equal(switched.activeStudioId, 'builder');

      assert.equal(
        switched.workspaceContext?.companyId,
        'ac-modular',
      );
      assert.equal(
        switched.workspaceContext?.workspaceId,
        'ac-modular-main',
      );
      assert.equal(
        switched.workspaceContext?.projectId,
        'project-ac-modular',
      );
      assert.equal(
        switched.workspaceContext?.activeHouseId,
        'modern-4kk',
      );

      const restarted = new FilePartnerSessionRepository(statePath);
      const restored = await restarted.resolve(issued.token);

      assert.ok(restored !== null);
      assert.equal(restored.companyId, 'ac-modular');
      assert.equal(restored.workspaceId, 'ac-modular-main');
      assert.equal(restored.projectId, 'project-ac-modular');
      assert.equal(restored.activeHouseId, 'modern-4kk');
      assert.equal(restored.activeStudioId, 'builder');

      assert.equal(
        restored.workspaceContext?.projectId,
        'project-ac-modular',
      );
      assert.equal(
        restored.workspaceContext?.activeHouseId,
        'modern-4kk',
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('TASK-42U — Manager follows canonical Studio access within its authenticated Partner scope', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-manager-switch-test-'));
    const { repository } = await partnerSessionRepositoryWithDseScope(directory);

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-manager-dse-switch',
          email: 'manager-dse-switch@example.test',
          displayName: 'DSE Manager',
          roles: ['manager'],
          tenantId: 'tenant-domy-s-energii',
          companyId: 'company-domy-s-energii',
          workspaceId: 'domy-s-energii-main',
          projectId: 'project-domy-s-energii',
        },
        password: 'secure-password',
        rememberMe: true,
      });

      const manager = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'manager',
        projectId: 'project-domy-s-energii',
        activeHouseId:
          'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      });

      assert.ok(manager !== null);
      assert.equal(manager.activeStudioId, 'manager');
      assert.equal(manager.projectId, 'project-domy-s-energii');
      assert.equal(
        manager.activeHouseId,
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      );

      const sales = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'sales',
        projectId: 'project-domy-s-energii',
      });

      assert.ok(sales !== null);
      assert.equal(sales.activeStudioId, 'sales');

      const builder = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'builder',
        projectId: 'project-domy-s-energii',
      });

      assert.equal(builder, null);

      const escaped = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'manager',
        tenantId: 'tenant-ac-modular',
        companyId: 'ac-modular',
        workspaceId: 'ac-modular-main',
        projectId: 'project-ac-modular',
        activeHouseId: 'modern-4kk',
      });

      assert.equal(escaped, null);

      const entered = await repository.mutateContext(issued.token, {
        action: 'enter',
        partnerId: 'p-dse',
        tenantId: 'tenant-domy-s-energii',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        activeHouseId:
          'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
        activeStudio: 'client',
        officeReturnHref: 'https://conis.cz/studio/office/',
      });

      assert.equal(entered, null);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('TASK-42T — Sales may switch Client/Sales but never Manager or another Partner scope', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-sales-switch-test-'));
    const statePath = join(directory, 'partner-sessions.json');
    const repository = new FilePartnerSessionRepository(statePath);

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-sales-dse-switch',
          email: 'sales-dse-switch@example.test',
          displayName: 'DSE Sales',
          roles: ['salesman'],
          tenantId: 'tenant-domy-s-energii',
          companyId: 'company-domy-s-energii',
          workspaceId: 'domy-s-energii-main',
          projectId: 'project-domy-s-energii',
        },
        password: 'secure-password',
        rememberMe: true,
      });

      const sales = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'sales',
        projectId: 'project-domy-s-energii',
      });

      assert.ok(sales !== null);
      assert.equal(sales.activeStudioId, 'sales');

      const client = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'client',
        projectId: 'project-domy-s-energii',
      });

      assert.ok(client !== null);
      assert.equal(client.activeStudioId, 'client');

      const manager = await repository.mutateContext(issued.token, {
        action: 'switch',
        activeStudio: 'manager',
        projectId: 'project-domy-s-energii',
      });

      assert.equal(manager, null);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('persists authoritative Partner Environment context across session restore', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-context-test-'));
    const { repository } = await partnerSessionRepositoryWithDseScope(directory);
    const statePath = join(directory, 'partner-sessions.json');

    try {
      const issued = await repository.activate({
        invite: {
          id: 'invite-conis-admin',
          email: 'admin@conis.test',
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

      const entered = await repository.mutateContext(issued.token, {
        action: 'enter',
        partnerId: 'p-dse',
        tenantId: 'tenant-domy-s-energii',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        projectId: 'project-domy-s-energii',
        activeHouseId: 'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
        activeStudio: 'client',
        officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
      });

      assert.ok(entered !== null);
      assert.equal(entered.workspaceContext?.operatorMode, true);
      assert.equal(entered.workspaceContext?.partnerId, 'p-dse');
      assert.equal(
        entered.workspaceContext?.companyId,
        'company-domy-s-energii',
      );
      assert.equal(entered.workspaceContext?.activeStudio, 'client');

      const restarted = new FilePartnerSessionRepository(statePath);
      const restored = await restarted.resolve(issued.token);

      assert.ok(restored !== null);
      assert.equal(restored.companyId, 'company-domy-s-energii');
      assert.equal(restored.workspaceId, 'domy-s-energii-main');
      assert.equal(restored.projectId, 'project-domy-s-energii');
      assert.equal(restored.activeStudioId, 'client');
      assert.equal(restored.workspaceContext?.operatorMode, true);
      assert.equal(restored.workspaceContext?.partnerId, 'p-dse');
      assert.equal(
        restored.workspaceContext?.officeReturnHref,
        'https://conis.cz:4181/partners/p-dse',
      );
      assert.equal(
        restored.workspaceContext?.previous.companyId,
        'company-conis',
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('mutates Partner Environment context through the authenticated cookie and restores it through /me', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-context-api-test-'));
    const inviteRepository = new FilePlatformInviteRepository(
      join(directory, 'invites.json'),
    );
    const { repository: sessionRepository, partners } =
      await partnerSessionRepositoryWithDseScope(directory);

    const issuedInvite = await inviteRepository.create({
      email: 'admin-context@example.test',
      displayName: 'CONIS Admin',
      roles: ['conis-admin'],
      invitedByUserId: 'user-operator',
      tenantId: 'tenant-conis-admin',
      companyId: 'company-conis',
      workspaceId: 'workspace-conis',
      projectId: 'project-conis',
    });

    const server = createPlatformApiServer(
      inviteRepository,
      undefined,
      undefined,
      undefined,
      undefined,
      sessionRepository,
      undefined,
      undefined,
      undefined,
      undefined,
      partners,
    );

    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );

    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}`;

      const activation = await fetch(
        `${baseUrl}/public/auth/activate/${encodeURIComponent(issuedInvite.token)}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: 'https://conis.cz:4181',
          },
          body: JSON.stringify({
            ndaAccepted: true,
            password: 'secure-password',
            rememberMe: true,
          }),
        },
      );

      assert.equal(activation.status, 200);
      const setCookie = activation.headers.get('set-cookie');
      assert.ok(setCookie !== null);
      const cookie = setCookie.split(';')[0]!;

      const mutation = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: 'https://conis.cz:4181',
        },
        body: JSON.stringify({
          action: 'enter',
          partnerId: 'p-dse',
          tenantId: 'tenant-domy-s-energii',
          companyId: 'company-domy-s-energii',
          workspaceId: 'domy-s-energii-main',
          projectId: 'project-domy-s-energii',
          activeHouseId:
            'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
          activeStudio: 'client',
          officeReturnHref: 'https://conis.cz:4181/partners/p-dse',
        }),
      });

      assert.equal(mutation.status, 200);

      const mutationBody = await mutation.json() as {
        ok: boolean;
        session: {
          companyId: string;
          workspaceId: string;
          projectId: string;
          activeStudioId: string | null;
          workspaceContext: {
            partnerId: string;
            companyId: string;
            workspaceId: string;
            projectId: string;
            activeStudio: string;
            officeReturnHref: string;
          } | null;
        };
      };

      assert.equal(mutationBody.ok, true);
      assert.equal(
        mutationBody.session.workspaceContext?.partnerId,
        'p-dse',
      );

      const me = await fetch(`${baseUrl}/public/auth/me`, {
        headers: {
          cookie,
          origin: 'https://conis.cz:4183',
        },
      });

      assert.equal(me.status, 200);

      const restored = await me.json() as {
        companyId: string;
        workspaceId: string;
        projectId: string;
        activeStudioId: string | null;
        workspaceContext: {
          operatorMode: boolean;
          partnerId: string;
          companyId: string;
          workspaceId: string;
          projectId: string;
          activeStudio: string;
          officeReturnHref: string;
        } | null;
      };

      assert.equal(restored.companyId, 'company-domy-s-energii');
      assert.equal(restored.workspaceId, 'domy-s-energii-main');
      assert.equal(restored.projectId, 'project-domy-s-energii');
      assert.equal(restored.activeStudioId, 'client');
      assert.equal(restored.workspaceContext?.operatorMode, true);
      assert.equal(restored.workspaceContext?.partnerId, 'p-dse');
      assert.equal(
        restored.workspaceContext?.officeReturnHref,
        'https://conis.cz:4181/partners/p-dse',
      );

      const restartedRepository =
        new FilePartnerSessionRepository(
          join(directory, 'partner-sessions.json'),
        );

      const persisted = await restartedRepository.resolve(
        cookie.slice(cookie.indexOf('=') + 1),
      );

      assert.equal(
        persisted?.workspaceContext?.companyId,
        'company-domy-s-energii',
      );
      assert.equal(
        persisted?.workspaceContext?.activeStudio,
        'client',
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

  it('issues an HttpOnly host-only cookie through activation and resolves it over credentialed CORS', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-partner-auth-api-test-'));
    const inviteRepository = new FilePlatformInviteRepository(join(directory, 'invites.json'));
    const sessionRepository = new FilePartnerSessionRepository(
      join(directory, 'partner-sessions.json'),
    );
    const issuedInvite = await inviteRepository.create(inviteInput);
    const server = createPlatformApiServer(
      inviteRepository,
      undefined,
      undefined,
      undefined,
      undefined,
      sessionRepository,
    );
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}`;
      const activation = await fetch(
        `${baseUrl}/public/auth/activate/${encodeURIComponent(issuedInvite.token)}`,
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
      assert.equal(activation.headers.get('access-control-allow-origin'), 'https://conis.cz');
      assert.equal(activation.headers.get('access-control-allow-credentials'), 'true');
      const cookie = activation.headers.get('set-cookie');
      assert.match(cookie ?? '', /^__Host-conis_partner_session=[^;]+; Path=\/; Max-Age=\d+; HttpOnly; Secure; SameSite=Lax$/);

      const me = await fetch(`${baseUrl}/public/auth/me`, {
        headers: { cookie: cookie!.split(';')[0]! },
      });
      assert.equal(me.status, 200);
      assert.deepEqual(
        (await me.json() as { user: { roles: string[] } }).user.roles,
        ['manager'],
      );

      const logout = await fetch(`${baseUrl}/public/auth/logout`, {
        method: 'POST',
        headers: { cookie: cookie!.split(';')[0]! },
      });
      assert.equal(logout.status, 204);
      const rejected = await fetch(`${baseUrl}/public/auth/me`, {
        headers: { cookie: cookie!.split(';')[0]! },
      });
      assert.equal(rejected.status, 401);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
      });
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Platform API production configuration', () => {
  it('uses the configured persistent state directory and allows conis.cz', () => {
    const previous = process.env.PLATFORM_API_STATE_DIR;
    process.env.PLATFORM_API_STATE_DIR = '/var/lib/conis/platform-api';
    try {
      assert.equal(
        platformApiStatePath('orders.json'),
        '/var/lib/conis/platform-api/orders.json',
      );
      assert.equal(platformApiAllowedOrigins().has('https://conis.cz'), true);
    } finally {
      if (previous === undefined) delete process.env.PLATFORM_API_STATE_DIR;
      else process.env.PLATFORM_API_STATE_DIR = previous;
    }
  });
});

describe('Public Offer flow access policy', () => {
  it('bypasses the loopback gate only for Offer checkout routes', () => {
    assert.equal(requiresLoopbackAccess('POST', '/local-pilot/orders'), false);
    assert.equal(
      requiresLoopbackAccess('POST', '/local-pilot/orders/OFF-TEST-001/proforma'),
      false,
    );
    assert.equal(
      requiresLoopbackAccess('GET', '/local-pilot/orders/OFF-TEST-001'),
      false,
    );
    assert.equal(
      requiresLoopbackAccess(
        'GET',
        '/local-pilot/orders/OFF-TEST-001/proforma',
      ),
      false,
    );
    assert.equal(
      requiresLoopbackAccess(
        'GET',
        '/local-pilot/orders/OFF-TEST-001/proforma/pdf',
      ),
      false,
    );

    assert.equal(
      requiresLoopbackAccess('POST', '/local-pilot/offer-write-capabilities'),
      true,
    );
    assert.equal(
      requiresLoopbackAccess('GET', '/local-pilot/proformas/proforma-OFF-TEST-001'),
      true,
    );
    assert.equal(
      requiresLoopbackAccess('POST', '/local-pilot/social-proof/events'),
      true,
    );
  });
});

describe('Durable order repository', () => {
  it('persists an accepted order across repository restart', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-order-test-'));
    const statePath = join(directory, 'orders.json');
    try {
      const created = await new FileOrderRepository(statePath).create(
        durableOrderInput,
      );
      const reloaded = await new FileOrderRepository(statePath).getByOrderId(
        durableOrderInput.orderId,
      );

      assert.deepEqual(reloaded, created);
      assert.equal(reloaded?.termsVersion, '1.0');
      assert.equal(
        reloaded?.termsAcceptedAt,
        '2026-08-12T12:00:00.000Z',
      );
      assert.equal(reloaded?.partner.companyName, 'Domy s energií s.r.o.');
      assert.equal(reloaded?.package.id, 'starter');
      assert.equal(reloaded?.priceCzk, 14_970);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('creates and reads an order through the local API', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-order-api-test-'));
    const repository = new FileOrderRepository(join(directory, 'orders.json'));
    const tokens = new FileOfferWriteTokenRepository(join(directory, 'tokens.json'));
    const capability = await tokens.issue({
      offerSlug: durableOrderInput.offerSlug,
      companyId: durableOrderInput.companyId,
      partnerId: durableOrderInput.partnerId,
    });
    const server = createPlatformApiServer(undefined, undefined, repository, undefined, tokens);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}/local-pilot/orders`;
      const preflight = await fetch(baseUrl, {
        method: 'OPTIONS',
        headers: {
          origin: 'https://conis.cz',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'authorization, content-type',
        },
      });
      assert.equal(preflight.status, 204);
      assert.equal(
        preflight.headers.get('access-control-allow-headers'),
        'content-type, authorization',
      );
      const missing = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(durableOrderInput),
      });
      assert.equal(missing.status, 401);
      assert.deepEqual(await missing.json(), {
        error: 'Offer write capability is required.',
      });
      const invalid = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer invalid-token-1234567890' },
        body: JSON.stringify(durableOrderInput),
      });
      assert.equal(invalid.status, 403);
      const created = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${capability.token}` },
        body: JSON.stringify(durableOrderInput),
      });
      assert.equal(created.status, 201);

      const duplicate = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${capability.token}` },
        body: JSON.stringify(durableOrderInput),
      });
      assert.equal(duplicate.status, 409);

      const read = await fetch(`${baseUrl}/${durableOrderInput.orderId}`);
      assert.equal(read.status, 200);
      const order = await read.json() as { termsVersion: string; priceCzk: number };
      assert.equal(order.termsVersion, '1.0');
      assert.equal(order.priceCzk, 14_970);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
      });
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Offer write capability repository', () => {
  it('reuses an active capability through the Office capability endpoint', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-offer-write-api-test-'));
    const tokens = new FileOfferWriteTokenRepository(join(directory, 'tokens.json'));
    const scope = {
      offerSlug: 'domy-s-energi',
      companyId: 'company-domy-s-energi',
      partnerId: 'p-dse',
    };
    const server = createPlatformApiServer(undefined, undefined, undefined, undefined, tokens);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const endpoint = `http://127.0.0.1:${address.port}/local-pilot/offer-write-capabilities`;
      const request = () =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(scope),
        });
      const first = await request();
      const second = await request();
      assert.equal(first.status, 201);
      assert.equal(second.status, 201);
      assert.equal(
        (await first.json() as { token: string }).token,
        (await second.json() as { token: string }).token,
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('persists one encrypted capability and restores it after restart', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-offer-write-persistence-test-'));
    const statePath = join(directory, 'tokens.json');
    const scope = {
      offerSlug: 'domy-s-energi',
      companyId: 'company-domy-s-energi',
      partnerId: 'p-dse',
    };
    try {
      const firstRepository = new FileOfferWriteTokenRepository(statePath);
      const first = await firstRepository.getOrIssue(scope);
      const stored = await readFile(statePath, 'utf8');
      assert.equal(stored.includes(first.token), false);
      assert.match(stored, /"encryptedToken":"v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"/);

      const restartedRepository = new FileOfferWriteTokenRepository(statePath);
      const recovered = await restartedRepository.getOrIssue(scope);
      assert.equal(recovered.id, first.id);
      assert.equal(recovered.token, first.token);

      assert.equal(await restartedRepository.bindOrder(recovered.token, {
        ...scope,
        orderId: 'OFF-1',
      }), true);
      assert.equal(
        await new FileOfferWriteTokenRepository(statePath).verifyOrder(
          first.token,
          'OFF-1',
        ),
        true,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('replaces an expired capability for the same scope', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-offer-write-expiry-test-'));
    const statePath = join(directory, 'tokens.json');
    const scope = {
      offerSlug: 'domy-s-energi',
      companyId: 'company-domy-s-energi',
      partnerId: 'p-dse',
    };
    try {
      const repository = new FileOfferWriteTokenRepository(statePath);
      const expired = await repository.getOrIssue({
        ...scope,
        expiresAt: '2020-01-01T00:00:00.000Z',
      });
      const active = await new FileOfferWriteTokenRepository(statePath).getOrIssue(
        scope,
      );
      assert.notEqual(active.id, expired.id);
      assert.notEqual(active.token, expired.token);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('binds one matching order and rejects another scope or order', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-offer-write-test-'));
    try {
      const repository = new FileOfferWriteTokenRepository(join(directory, 'tokens.json'));
      const issued = await repository.issue({
        offerSlug: 'domy-s-energi',
        companyId: 'company-domy-s-energi',
        partnerId: 'p-dse',
      });
      assert.equal(await repository.bindOrder(issued.token, {
        offerSlug: 'domy-s-energi',
        companyId: 'company-domy-s-energi',
        partnerId: 'p-dse',
        orderId: 'OFF-1',
      }), true);
      assert.equal(await repository.verifyOrder(issued.token, 'OFF-1'), true);
      assert.equal(await repository.bindOrder(issued.token, {
        offerSlug: 'other',
        companyId: 'company-domy-s-energi',
        partnerId: 'p-dse',
        orderId: 'OFF-2',
      }), false);
      const expired = await repository.issue({
        offerSlug: 'domy-s-energi',
        companyId: 'company-domy-s-energi',
        partnerId: 'p-dse',
        expiresAt: '2020-01-01T00:00:00.000Z',
      });
      assert.equal(await repository.bindOrder(expired.token, {
        offerSlug: 'domy-s-energi',
        companyId: 'company-domy-s-energi',
        partnerId: 'p-dse',
        orderId: 'OFF-3',
      }), false);
      assert.equal(await repository.bindOrder(issued.token, {
        offerSlug: 'domy-s-energi',
        companyId: 'company-domy-s-energi',
        partnerId: 'p-dse',
        orderId: 'OFF-2',
      }), false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Durable proforma repository', () => {
  it('persists a stable proforma for an order across repository restart', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-proforma-test-'));
    try {
      const order = await new FileOrderRepository(join(directory, 'orders.json')).create(
        durableOrderInput,
      );
      const statePath = join(directory, 'proformas.json');
      const repository = new FileProformaRepository(
        statePath,
        () => new Date('2026-08-12T12:00:00.000Z'),
      );
      const first = await repository.issue(order);
      const retried = await repository.issue(order);
      const reloaded = await new FileProformaRepository(statePath).getByOrderId(
        order.orderId,
      );

      assert.equal(first.created, true);
      assert.equal(retried.created, false);
      assert.deepEqual(retried.proforma, first.proforma);
      assert.deepEqual(reloaded, first.proforma);
      assert.equal(first.proforma.amountCzk, 14_970);
      assert.equal(first.proforma.variableSymbol, 'OFFTEST001');
      assert.equal(first.proforma.dueDate, '2026-08-26T12:00:00.000Z');
      assert.match(first.proforma.spdPayload, /AM:14970\.00/);
      assert.match(first.proforma.spdPayload, /X-VS:OFFTEST001/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('issues and reads a proforma through the local API', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-proforma-api-test-'));
    const orders = new FileOrderRepository(join(directory, 'orders.json'));
    const proformas = new FileProformaRepository(
      join(directory, 'proformas.json'),
      () => new Date('2026-08-12T12:00:00.000Z'),
    );
    const tokens = new FileOfferWriteTokenRepository(join(directory, 'tokens.json'));
    const capability = await tokens.issue({
      offerSlug: durableOrderInput.offerSlug,
      companyId: durableOrderInput.companyId,
      partnerId: durableOrderInput.partnerId,
    });
    const server = createPlatformApiServer(undefined, undefined, orders, proformas, tokens);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}/local-pilot/orders`;
      await fetch(baseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${capability.token}` },
        body: JSON.stringify(durableOrderInput),
      });

      const issue = await fetch(`${baseUrl}/${durableOrderInput.orderId}/proforma`, {
        method: 'POST',
        headers: { authorization: `Bearer ${capability.token}` },
      });
      assert.equal(issue.status, 201);
      const created = await issue.json() as { proformaId: string; amountCzk: number };
      assert.equal(created.amountCzk, 14_970);

      const retried = await fetch(`${baseUrl}/${durableOrderInput.orderId}/proforma`, {
        method: 'POST',
        headers: { authorization: `Bearer ${capability.token}` },
      });
      assert.equal(retried.status, 200);

      const read = await fetch(`${baseUrl}/${durableOrderInput.orderId}/proforma`);
      assert.equal(read.status, 200);
      assert.deepEqual(await read.json(), await retried.json());

      const byId = await fetch(
        `http://127.0.0.1:${address.port}/local-pilot/proformas/${created.proformaId}`,
      );
      assert.equal(byId.status, 200);

      const pdf = await fetch(`${baseUrl}/${durableOrderInput.orderId}/proforma/pdf`);
      assert.equal(pdf.status, 200);
      const artifact = await pdf.json() as {
        context: {
          amountCzk: number;
          variableSymbol: string;
          dueDate: string;
          spdPayload: string;
        };
        attachment: { bytesBase64: string };
      };
      const pdfContents = Buffer.from(artifact.attachment.bytesBase64, 'base64').toString('latin1');
      assert.equal(artifact.context.amountCzk, 14_970);
      assert.equal(artifact.context.variableSymbol, 'OFFTEST001');
      assert.equal(artifact.context.spdPayload.includes('X-VS:OFFTEST001'), true);
      assert.match(pdfContents, /PF-2026-/);
      assert.match(pdfContents, /2303345128\/2010/);
      assert.match(pdfContents, / re f/);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
      });
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Social Proof analytics repository', () => {
  it('persists pseudonymous events and produces cross-session aggregates', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-social-proof-test-'));
    try {
      const repository = new FileSocialProofAnalyticsRepository(join(directory, 'events.json'));
      const at = '2026-08-11T12:00:00.000Z';
      await repository.record({
        ...socialProofScope,
        anonymousVisitorId: 'visitor_alpha_123',
        sessionId: 'session_alpha_123',
        houseId: 'house-modern-01',
        occurredAt: at,
        kind: 'experience.opened',
      });
      await repository.record({
        ...socialProofScope,
        anonymousVisitorId: 'visitor_alpha_123',
        sessionId: 'session_alpha_456',
        houseId: 'house-modern-01',
        occurredAt: at,
        kind: 'house.saved',
      });
      await repository.record({
        ...socialProofScope,
        anonymousVisitorId: 'visitor_beta_1234',
        sessionId: 'session_beta_1234',
        houseId: 'house-modern-01',
        occurredAt: at,
        kind: 'priority.completed',
        priorityIds: ['energy'],
      });
      const secondRepository = new FileSocialProofAnalyticsRepository(join(directory, 'events.json'));
      const aggregate = await secondRepository.aggregateHouse({
        ...socialProofScope,
        houseId: 'house-modern-01',
        from: '2026-08-11T00:00:00.000Z',
        to: '2026-08-12T00:00:00.000Z',
      });
      assert.equal(aggregate.uniqueVisitors, 2);
      assert.equal(aggregate.companyId, socialProofScope.companyId);
      assert.equal(aggregate.projectId, socialProofScope.projectId);
      assert.equal(aggregate.visits, 3);
      assert.equal(aggregate.returningVisitors, 1);
      assert.equal(aggregate.savedByVisitors, 1);
      assert.deepEqual(aggregate.priorityPreferences, [
        { priorityId: 'energy', visitorCount: 1, percentOfVisitors: 50 },
      ]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('returns locality only for a single consented coarse region', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-social-proof-locality-test-'));
    try {
      const repository = new FileSocialProofAnalyticsRepository(join(directory, 'events.json'));
      await repository.record({
        ...socialProofScope,
        anonymousVisitorId: 'visitor_gamma_123',
        sessionId: 'session_gamma_123',
        houseId: 'house-modern-01',
        occurredAt: '2026-08-11T12:00:00.000Z',
        kind: 'experience.opened',
        locality: { regionCode: 'CZ-71', consented: true },
      });
      await repository.record({
        ...socialProofScope,
        anonymousVisitorId: 'visitor_delta_123',
        sessionId: 'session_delta_123',
        houseId: 'house-modern-01',
        occurredAt: '2026-08-11T12:00:00.000Z',
        kind: 'experience.opened',
        locality: { regionCode: 'CZ-71', consented: true },
      });
      const activity = await repository.recentActivity({
        ...socialProofScope,
        from: '2026-08-11T00:00:00.000Z',
        to: '2026-08-12T00:00:00.000Z',
        minimumVisitors: 2,
      });
      assert.deepEqual(activity, [
        { houseId: 'house-modern-01', activeVisitors: 2, locality: 'CZ-71' },
      ]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

});

describe('Durable House Package API', () => {
  it('scopes text and binary persistence to the authenticated session', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'embed-house-package-api-test-'));
    const housePackages = new FileHousePackageRepository(join(directory, 'house-packages'));
    const identities = new Map([
      ['session-house-a', {
        activeHouseId: 'house-a',
        workspaceContext: {
          authoredHouseIdentities: [{ houseId: 'house-a' }],
        },
      }],
      ['session-house-b', {
        activeHouseId: 'house-b',
        workspaceContext: {
          authoredHouseIdentities: [{ houseId: 'house-b' }],
        },
      }],
    ]);
    const partnerSessions = {
      resolve: async (token: string) => identities.get(token) ?? null,
    };
    const server = createPlatformApiServer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      partnerSessions as never,
      housePackages,
    );
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}/public/house-packages`;
      const cookieA = { cookie: '__Host-conis_partner_session=session-house-a' };
      const cookieB = { cookie: '__Host-conis_partner_session=session-house-b' };

      const unauthenticated = await fetch(`${baseUrl}/house-a/state`);
      assert.equal(unauthenticated.status, 401);

      const forbidden = await fetch(`${baseUrl}/house-b/persist`, {
        method: 'POST',
        headers: { ...cookieA, 'content-type': 'application/json' },
        body: JSON.stringify({ files: { roomsCsv: 'forbidden' } }),
      });
      assert.equal(forbidden.status, 403);

      const persisted = await fetch(`${baseUrl}/house-a/persist`, {
        method: 'POST',
        headers: { ...cookieA, 'content-type': 'application/json' },
        body: JSON.stringify({ files: { roomsCsv: 'id,name\nroom-a,A\n' } }),
      });
      assert.equal(persisted.status, 200);
      assert.equal(
        (await new FileHousePackageRepository(join(directory, 'house-packages')).get('house-a'))
          ?.files.roomsCsv,
        'id,name\nroom-a,A\n',
      );

      const upload = await fetch(`${baseUrl}/house-a/media/gallery/hero.png`, {
        method: 'POST',
        headers: { ...cookieA, 'content-type': 'image/png' },
        body: Buffer.from([0, 1, 2, 3]),
      });
      assert.equal(upload.status, 201);

      const replacement = await fetch(`${baseUrl}/house-a/media/gallery/hero.png`, {
        method: 'POST',
        headers: { ...cookieA, 'content-type': 'image/png' },
        body: Buffer.from([4, 5, 6, 7]),
      });
      assert.equal(replacement.status, 201);

      const isolated = await fetch(`${baseUrl}/house-a/media/gallery/hero.png`, {
        headers: cookieB,
      });
      assert.equal(isolated.status, 403);

      const media = await fetch(`${baseUrl}/house-a/media/gallery/hero.png`, {
        headers: cookieA,
      });
      assert.equal(media.status, 200);
      assert.equal(media.headers.get('content-type'), 'image/png');
      assert.deepEqual([...new Uint8Array(await media.arrayBuffer())], [4, 5, 6, 7]);

      await assert.rejects(
        () => housePackages.writeMedia('house-a', '../escape.png', {
          bytes: Buffer.from([1]),
          contentType: 'image/png',
        }),
        /Invalid House Package media path/,
      );

      const deleted = await fetch(`${baseUrl}/house-a/media/gallery/hero.png`, {
        method: 'DELETE',
        headers: cookieA,
      });
      assert.equal(deleted.status, 204);
      const missing = await fetch(`${baseUrl}/house-a/media/gallery/hero.png`, {
        headers: cookieA,
      });
      assert.equal(missing.status, 404);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
      });
      await rm(directory, { recursive: true, force: true });
    }
  });
});
