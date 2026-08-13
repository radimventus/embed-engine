import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  createPlatformApiServer,
  FileOrderRepository,
  FileOfferWriteTokenRepository,
  FilePlatformInviteRepository,
  FileProformaRepository,
  FileSocialProofAnalyticsRepository,
  platformApiAllowedOrigins,
  platformApiStatePath,
  requiresLoopbackAccess,
} from './index.ts';

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
