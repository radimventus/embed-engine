import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  createPlatformApiServer,
  FileOrderRepository,
  FilePlatformInviteRepository,
  FileSocialProofAnalyticsRepository,
} from './index.ts';

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
    const server = createPlatformApiServer(undefined, undefined, repository);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}/local-pilot/orders`;
      const created = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(durableOrderInput),
      });
      assert.equal(created.status, 201);

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
