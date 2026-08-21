import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
} from '@embed-engine/platform-access';

import {
  createPlatformApiServer,
  FileDecisionSessionRepository,
  FileLeadRepository,
  type DecisionSessionRepository,
  type DurableLead,
  type DurableLeadInput,
  type LeadRepository,
  type PartnerIdentity,
  type PartnerSessionRepository,
} from './index.ts';

const SESSION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OTHER_SESSION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function serialized(houseId: string) {
  return {
    format: 'decision-session',
    schemaVersion: '1.0',
    objectId: houseId,
    runtimeState: {
      activeRoomId: 'room-living',
      priorityIds: ['layout', 'energy', 'plot'],
      priorityIntensities: { layout: 0.9, energy: 0.5, plot: 0.2 },
      variantId: null,
      scenarioId: null,
      version: 2,
    },
    events: [
      { type: 'RoomSelected', roomId: 'room-living', at: 2 },
      {
        type: 'PriorityChanged',
        priorityIds: ['layout', 'energy', 'plot'],
        intensities: [
          { priorityId: 'layout', importance: 0.9 },
          { priorityId: 'energy', importance: 0.5 },
          { priorityId: 'plot', importance: 0.2 },
        ],
        at: 3,
      },
    ],
    createdAt: 1,
    updatedAt: 3,
  };
}

const canonicalScope = {
  companyId: DSE_COMPANY_ID,
  projectId: DSE_CANONICAL_PROJECT_ID,
  houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
  privacyUrl: 'https://partner.example/privacy',
} as const;

function acceptedLead(input: DurableLeadInput): DurableLead {
  return {
    ...input,
    decisionSessionId: input.decisionSessionId ?? null,
    status: 'accepted',
    processingStatus: 'new',
    notificationStatus: 'pending',
  };
}

async function withServer(input: {
  readonly leads?: LeadRepository;
  readonly decisionSessions?: DecisionSessionRepository;
  readonly partnerSessions?: PartnerSessionRepository;
  readonly run: (baseUrl: string) => Promise<void>;
}): Promise<void> {
  const server = createPlatformApiServer(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    input.partnerSessions,
    undefined,
    input.leads ?? {
      create: async (lead) => acceptedLead(lead),
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    },
    () => canonicalScope,
    undefined,
    undefined,
    input.decisionSessions,
  );
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const address = server.address();
    assert.ok(address !== null && typeof address !== 'string');
    await input.run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) =>
        error === undefined ? resolve() : reject(error),
      );
    });
  }
}

describe('Public durable Decision Session API', () => {
  it('creates, restores, and isolates a House-scoped session', async () => {
    const repository = new FileDecisionSessionRepository(
      `/tmp/conis-session-api-${Date.now()}-${Math.random()}.json`,
    );
    await withServer({
      decisionSessions: repository,
      run: async (baseUrl) => {
        const created = await fetch(`${baseUrl}/public/decision-sessions`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            decisionSessionId: SESSION_ID,
            companyId: DSE_COMPANY_ID,
            projectId: DSE_CANONICAL_PROJECT_ID,
            houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
            serialized: serialized(DSE_BUNGALOV_4KK_HOUSE_ID),
          }),
        });
        assert.equal(created.status, 200);

        const restored = await fetch(
          `${baseUrl}/public/decision-sessions?decisionSessionId=${SESSION_ID}&companyId=${DSE_COMPANY_ID}&projectId=${DSE_CANONICAL_PROJECT_ID}&houseId=${DSE_BUNGALOV_4KK_HOUSE_ID}`,
        );
        assert.equal(restored.status, 200);
        const body = (await restored.json()) as {
          readonly serialized: {
            readonly runtimeState: {
              readonly priorityIds: readonly string[];
              readonly priorityIntensities: Readonly<Record<string, number>>;
            };
            readonly events: readonly { readonly type: string }[];
          };
        };
        assert.deepEqual(body.serialized.runtimeState.priorityIds, [
          'layout',
          'energy',
          'plot',
        ]);
        assert.equal(body.serialized.runtimeState.priorityIntensities.layout, 0.9);
        assert.equal(
          body.serialized.events.some((event) => event.type === 'RoomSelected'),
          true,
        );

        const otherHouse = await fetch(
          `${baseUrl}/public/decision-sessions?decisionSessionId=${SESSION_ID}&companyId=${DSE_COMPANY_ID}&projectId=${DSE_CANONICAL_PROJECT_ID}&houseId=${DSE_FIRST_DRAFT_HOUSE_ID}`,
        );
        assert.equal(otherHouse.status, 404);

        const otherProject = await fetch(
          `${baseUrl}/public/decision-sessions?decisionSessionId=${SESSION_ID}&companyId=${DSE_COMPANY_ID}&projectId=project-other&houseId=${DSE_BUNGALOV_4KK_HOUSE_ID}`,
        );
        assert.notEqual(otherProject.status, 200);

        const listing = await fetch(`${baseUrl}/public/decision-sessions`);
        assert.equal(listing.status, 400);
      },
    });
  });

  it('correlates a matching Lead and rejects a cross-House session', async () => {
    const sessions = new FileDecisionSessionRepository(
      `/tmp/conis-session-lead-${Date.now()}-${Math.random()}.json`,
    );
    await sessions.upsert({
      decisionSessionId: SESSION_ID,
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      serialized: serialized(DSE_BUNGALOV_4KK_HOUSE_ID),
    });
    await sessions.upsert({
      decisionSessionId: OTHER_SESSION_ID,
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_FIRST_DRAFT_HOUSE_ID,
      serialized: serialized(DSE_FIRST_DRAFT_HOUSE_ID),
    });

    const stored: DurableLead[] = [];
    const leads: LeadRepository = {
      create: async (input) => {
        const lead = acceptedLead(input);
        stored.push(lead);
        return lead;
      },
      getByIdempotencyKey: async () => null,
      list: async () => stored,
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer({
      leads,
      decisionSessions: sessions,
      run: async (baseUrl) => {
        const matched = await fetch(`${baseUrl}/public/leads`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            idempotencyKey: 'idem-match',
            companyId: DSE_COMPANY_ID,
            projectId: DSE_CANONICAL_PROJECT_ID,
            houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
            source: 'EMBED',
            intent: 'audit',
            decisionSessionId: SESSION_ID,
            contact: {
              name: 'Jan Novák',
              email: 'jan@example.test',
              phone: null,
            },
            consent: {
              accepted: true,
              acceptedAt: '2026-08-20T06:00:00.000Z',
              privacyUrl: canonicalScope.privacyUrl,
              privacyVersion: 'partner-current',
            },
          }),
        });
        assert.equal(matched.status, 201);
        assert.equal(stored[0]?.decisionSessionId, SESSION_ID);

        const mismatched = await fetch(`${baseUrl}/public/leads`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            idempotencyKey: 'idem-mismatch',
            companyId: DSE_COMPANY_ID,
            projectId: DSE_CANONICAL_PROJECT_ID,
            houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
            source: 'EMBED',
            intent: 'audit',
            decisionSessionId: OTHER_SESSION_ID,
            contact: {
              name: 'Jan Novák',
              email: 'jan@example.test',
              phone: null,
            },
            consent: {
              accepted: true,
              acceptedAt: '2026-08-20T06:00:00.000Z',
              privacyUrl: canonicalScope.privacyUrl,
              privacyVersion: 'partner-current',
            },
          }),
        });
        assert.equal(mismatched.status, 400);
        assert.equal(stored.length, 1);
      },
    });
  });

  it('returns partner sessions only for the authorized House scope', async () => {
    const identity: PartnerIdentity = {
    user: {
      id: 'user-sales',
      email: 'sales@example.test',
      displayName: 'Sales',
      roles: ['salesman'],
      status: 'active',
      lastLoginAt: '2026-08-20T08:00:00.000Z',
      lastActivityAt: '2026-08-20T08:00:00.000Z',
      lastStudioId: null,
    },
      tenantId: 'tenant-test',
      companyId: DSE_COMPANY_ID,
      workspaceId: 'workspace-test',
      projectId: DSE_CANONICAL_PROJECT_ID,
      activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      activeStudioId: 'sales',
      workspaceContext: null,
      rememberMe: true,
      issuedAt: '2026-08-20T08:00:00.000Z',
      expiresAt: '2026-09-20T08:00:00.000Z',
      lastLoginAt: '2026-08-20T08:00:00.000Z',
    };
    const partnerSessions: PartnerSessionRepository = {
      activate: async () => {
        throw new Error('unused');
      },
      login: async () => null,
      resolve: async (token) => (token === 'sales-token' ? identity : null),
      mutateContext: async () => null,
      revoke: async () => undefined,
    };
    const sessions = new FileDecisionSessionRepository(
      `/tmp/conis-session-partner-${Date.now()}-${Math.random()}.json`,
    );
    await sessions.upsert({
      decisionSessionId: SESSION_ID,
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      serialized: serialized(DSE_BUNGALOV_4KK_HOUSE_ID),
    });

    await withServer({
      partnerSessions,
      decisionSessions: sessions,
      run: async (baseUrl) => {
        const unauthorized = await fetch(
          `${baseUrl}/partner/decision-sessions?companyId=${DSE_COMPANY_ID}&projectId=${DSE_CANONICAL_PROJECT_ID}&houseId=${DSE_BUNGALOV_4KK_HOUSE_ID}`,
        );
        assert.equal(unauthorized.status, 401);

        const response = await fetch(
          `${baseUrl}/partner/decision-sessions?companyId=${DSE_COMPANY_ID}&projectId=${DSE_CANONICAL_PROJECT_ID}&houseId=${DSE_BUNGALOV_4KK_HOUSE_ID}`,
          { headers: { cookie: '__Host-conis_partner_session=sales-token' } },
        );
        assert.equal(response.status, 200);
        const body = (await response.json()) as {
          readonly sessions: readonly { readonly houseId: string }[];
        };
        assert.equal(body.sessions.length, 1);
        assert.equal(body.sessions[0]?.houseId, DSE_BUNGALOV_4KK_HOUSE_ID);

        const vpd = await fetch(
          `${baseUrl}/partner/decision-sessions?companyId=${DSE_COMPANY_ID}&projectId=${DSE_CANONICAL_PROJECT_ID}&houseId=${DSE_FIRST_DRAFT_HOUSE_ID}`,
          { headers: { cookie: '__Host-conis_partner_session=sales-token' } },
        );
        assert.equal(vpd.status, 200);
        const vpdBody = (await vpd.json()) as {
          readonly sessions: readonly unknown[];
        };
        assert.deepEqual(vpdBody.sessions, []);
      },
    });
  });
});
