import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createPlatformApiServer,
  LeadAlreadyExistsError,
  LeadNotFoundError,
  type DurableLead,
  type DurableLeadInput,
  type LeadRepository,
  type PartnerIdentity,
  type PartnerSessionRepository,
} from './index.ts';

const canonicalScope = {
  companyId: 'company-test',
  projectId: 'project-test',
  houseId: 'house-test',
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

function validPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    idempotencyKey: 'idem-001',
    companyId: canonicalScope.companyId,
    projectId: canonicalScope.projectId,
    houseId: canonicalScope.houseId,
    source: 'EMBED',
    intent: 'audit',
    contact: {
      name: 'Jan Novák',
      email: 'jan@example.test',
      phone: '+420777123456',
    },
    consent: {
      accepted: true,
      acceptedAt: '2026-08-20T06:00:00.000Z',
      privacyUrl: canonicalScope.privacyUrl,
      privacyVersion: 'partner-current',
    },
    ...overrides,
  };
}

async function withServer(
  repository: LeadRepository,
  run: (baseUrl: string) => Promise<void>,
  resolver: typeof import('./leadScope').resolveLeadScope = (() => canonicalScope),
): Promise<void> {
  const server = createPlatformApiServer(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    repository,
    resolver,
  );

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    const address = server.address();
    assert.ok(address !== null && typeof address !== 'string');
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) =>
        error === undefined ? resolve() : reject(error),
      );
    });
  }
}

describe('Public durable lead API', () => {
  it('returns 201 only after durable repository create resolves', async () => {
    let releaseCreate!: () => void;
    let createCalled = false;

    const repository: LeadRepository = {
      create: async (input) => {
        createCalled = true;
        await new Promise<void>((resolve) => {
          releaseCreate = resolve;
        });
        return acceptedLead(input);
      },
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer(repository, async (baseUrl) => {
      let responseSettled = false;

      const responsePromise = fetch(`${baseUrl}/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload()),
      }).then((response) => {
        responseSettled = true;
        return response;
      });

      while (!createCalled) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(responseSettled, false);

      releaseCreate();

      const response = await responsePromise;
      assert.equal(response.status, 201);

      const body = await response.json() as {
        leadId: string;
        status: string;
      };

      assert.equal(typeof body.leadId, 'string');
      assert.ok(body.leadId.length > 0);
      assert.equal(body.status, 'accepted');
    });
  });

  it('does not return success when persistence fails', async () => {
    const repository: LeadRepository = {
      create: async () => {
        throw new Error('disk failure');
      },
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer(repository, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload()),
      });

      assert.notEqual(response.status, 200);
      assert.notEqual(response.status, 201);
      assert.equal(response.status, 400);
    });
  });

  it('returns the existing accepted lead for duplicate idempotency key', async () => {
    const existing = acceptedLead({
      leadId: 'lead-existing',
      idempotencyKey: 'idem-001',
      createdAt: '2026-08-20T06:01:00.000Z',
      companyId: canonicalScope.companyId,
      projectId: canonicalScope.projectId,
      houseId: canonicalScope.houseId,
      source: 'EMBED',
      intent: 'audit',
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
    });

    const repository: LeadRepository = {
      create: async () => {
        throw new LeadAlreadyExistsError(existing);
      },
      getByIdempotencyKey: async () => existing,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer(repository, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload()),
      });

      assert.equal(response.status, 200);

      const body = await response.json() as {
        leadId: string;
        createdAt: string;
        status: string;
      };

      assert.deepEqual(body, {
        leadId: existing.leadId,
        createdAt: existing.createdAt,
        status: 'accepted',
      });
    });
  });

  it('rejects malformed public payload before repository persistence', async () => {
    let createCalls = 0;

    const repository: LeadRepository = {
      create: async (input) => {
        createCalls += 1;
        return acceptedLead(input);
      },
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer(repository, async (baseUrl) => {
      const malformed = [
        null,
        {},
        validPayload({ idempotencyKey: '' }),
        validPayload({ source: 'INVALID' }),
        validPayload({ intent: 'other' }),
        validPayload({ contact: null }),
        validPayload({
          contact: {
            name: '',
            email: 'jan@example.test',
            phone: null,
          },
        }),
        validPayload({ consent: null }),
        validPayload({
          consent: {
            accepted: false,
            acceptedAt: '2026-08-20T06:00:00.000Z',
            privacyUrl: canonicalScope.privacyUrl,
            privacyVersion: 'partner-current',
          },
        }),
      ];

      for (const payload of malformed) {
        const response = await fetch(`${baseUrl}/public/leads`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });

        assert.equal(response.status, 400);
      }

      assert.equal(createCalls, 0);
    });
  });

  it('rejects consent.accepted=false before repository persistence', async () => {
    let createCalls = 0;

    const repository: LeadRepository = {
      create: async (input) => {
        createCalls += 1;
        return acceptedLead(input);
      },
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer(repository, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          validPayload({
            consent: {
              accepted: false,
              acceptedAt: '2026-08-20T06:00:00.000Z',
              privacyUrl: canonicalScope.privacyUrl,
              privacyVersion: 'partner-current',
            },
          }),
        ),
      });

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: 'Neplatná poptávka.' });
      assert.equal(createCalls, 0);
    });
  });

  it('rejects privacy URL mismatch before persistence', async () => {
    let createCalls = 0;

    const repository: LeadRepository = {
      create: async (input) => {
        createCalls += 1;
        return acceptedLead(input);
      },
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withServer(repository, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          validPayload({
            consent: {
              accepted: true,
              acceptedAt: '2026-08-20T06:00:00.000Z',
              privacyUrl: 'https://attacker.example/privacy',
              privacyVersion: 'partner-current',
            },
          }),
        ),
      });

      assert.equal(response.status, 400);
      assert.equal(createCalls, 0);
    });
  });

  it('rejects invalid authoritative scope before persistence', async () => {
    let createCalls = 0;

    const repository: LeadRepository = {
      create: async (input) => {
        createCalls += 1;
        return acceptedLead(input);
      },
      getByIdempotencyKey: async () => null,
      list: async () => [],
      accept: async () => {
        throw new Error('unused');
      },
    };

    const rejectingResolver: typeof import('./leadScope').resolveLeadScope =
      () => {
        throw new Error('invalid scope');
      };

    await withServer(
      repository,
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/public/leads`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(validPayload()),
        });

        assert.equal(response.status, 400);
        assert.equal(createCalls, 0);
      },
      rejectingResolver,
    );
  });
});

describe('Partner House-scoped lead list', () => {
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
    companyId: canonicalScope.companyId,
    workspaceId: 'workspace-test',
    projectId: canonicalScope.projectId,
    activeHouseId: canonicalScope.houseId,
    activeStudioId: 'sales',
    workspaceContext: null,
    rememberMe: true,
    issuedAt: '2026-08-20T08:00:00.000Z',
    expiresAt: '2026-09-20T08:00:00.000Z',
    lastLoginAt: '2026-08-20T08:00:00.000Z',
  };

  const sessions: PartnerSessionRepository = {
    activate: async () => {
      throw new Error('unused');
    },
    login: async () => null,
    resolve: async (token) => (token === 'sales-token' ? identity : null),
    mutateContext: async () => null,
    revoke: async () => undefined,
  };

  async function withReadServer(
    repository: LeadRepository,
    run: (baseUrl: string) => Promise<void>,
  ): Promise<void> {
    const server = createPlatformApiServer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      sessions,
      undefined,
      repository,
    );
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      await run(`http://127.0.0.1:${address.port}`);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) =>
          error === undefined ? resolve() : reject(error),
        );
      });
    }
  }

  it('returns only House-scoped leads for the authenticated Partner', async () => {
    const inScope = acceptedLead({
      leadId: 'lead-house',
      idempotencyKey: 'idem-house',
      createdAt: '2026-08-20T06:01:00.000Z',
      companyId: canonicalScope.companyId,
      projectId: canonicalScope.projectId,
      houseId: canonicalScope.houseId,
      source: 'EMBED',
      intent: 'audit',
      contact: {
        name: 'Petr Lead',
        email: 'petr.lead@example.test',
        phone: null,
      },
      consent: {
        accepted: true,
        acceptedAt: '2026-08-20T06:00:00.000Z',
        privacyUrl: canonicalScope.privacyUrl,
        privacyVersion: 'partner-current',
      },
    });
    const otherHouse = acceptedLead({
      ...inScope,
      leadId: 'lead-other-house',
      idempotencyKey: 'idem-other-house',
      houseId: 'house-other',
    });

    const repository: LeadRepository = {
      create: async (input) => acceptedLead(input),
      getByIdempotencyKey: async () => null,
      list: async (query) =>
        [inScope, otherHouse].filter(
          (item) =>
            item.companyId === query.companyId &&
            item.projectId === query.projectId &&
            (query.houseId === undefined || item.houseId === query.houseId),
        ),
      accept: async () => {
        throw new Error('unused');
      },
    };

    await withReadServer(repository, async (baseUrl) => {
      const unauthorized = await fetch(
        `${baseUrl}/partner/leads?companyId=${canonicalScope.companyId}&projectId=${canonicalScope.projectId}&houseId=${canonicalScope.houseId}`,
      );
      assert.equal(unauthorized.status, 401);

      const foreignCompany = await fetch(
        `${baseUrl}/partner/leads?companyId=company-other&projectId=${canonicalScope.projectId}&houseId=${canonicalScope.houseId}`,
        { headers: { cookie: '__Host-conis_partner_session=sales-token' } },
      );
      assert.equal(foreignCompany.status, 403);

      const response = await fetch(
        `${baseUrl}/partner/leads?companyId=${canonicalScope.companyId}&projectId=${canonicalScope.projectId}&houseId=${canonicalScope.houseId}`,
        { headers: { cookie: '__Host-conis_partner_session=sales-token' } },
      );
      assert.equal(response.status, 200);
      const body = (await response.json()) as {
        readonly leads: readonly { readonly leadId: string }[];
      };
      assert.deepEqual(
        body.leads.map((item) => item.leadId),
        ['lead-house'],
      );
    });
  });

  it('accepts a NEW lead idempotently and does not leak across Houses', async () => {
    const dirLeads: DurableLead[] = [
      acceptedLead({
        leadId: 'lead-house',
        idempotencyKey: 'idem-house-accept',
        createdAt: '2026-08-20T06:01:00.000Z',
        companyId: canonicalScope.companyId,
        projectId: canonicalScope.projectId,
        houseId: canonicalScope.houseId,
        source: 'EMBED',
        intent: 'audit',
        contact: {
          name: 'Petr Lead',
          email: 'petr.lead@example.test',
          phone: null,
        },
        consent: {
          accepted: true,
          acceptedAt: '2026-08-20T06:00:00.000Z',
          privacyUrl: canonicalScope.privacyUrl,
          privacyVersion: 'partner-current',
        },
      }),
    ];
    const repository: LeadRepository = {
      create: async (input) => acceptedLead(input),
      getByIdempotencyKey: async () => null,
      list: async () => dirLeads,
      accept: async (input) => {
        const found = dirLeads.find(
          (item) =>
            item.leadId === input.leadId &&
            item.companyId === input.companyId &&
            item.projectId === input.projectId &&
            item.houseId === input.houseId,
        );
        if (found === undefined) {
          throw new LeadNotFoundError();
        }
        const accepted = { ...found, processingStatus: 'accepted' as const };
        dirLeads[0] = accepted;
        return accepted;
      },
    };

    await withReadServer(repository, async (baseUrl) => {
      const unauthorized = await fetch(
        `${baseUrl}/partner/leads/lead-house/accept`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            companyId: canonicalScope.companyId,
            projectId: canonicalScope.projectId,
            houseId: canonicalScope.houseId,
          }),
        },
      );
      assert.equal(unauthorized.status, 401);

      const foreignHouse = await fetch(
        `${baseUrl}/partner/leads/lead-house/accept`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: '__Host-conis_partner_session=sales-token',
          },
          body: JSON.stringify({
            companyId: canonicalScope.companyId,
            projectId: canonicalScope.projectId,
            houseId: 'house-other',
          }),
        },
      );
      assert.equal(foreignHouse.status, 404);

      const accepted = await fetch(
        `${baseUrl}/partner/leads/lead-house/accept`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: '__Host-conis_partner_session=sales-token',
          },
          body: JSON.stringify({
            companyId: canonicalScope.companyId,
            projectId: canonicalScope.projectId,
            houseId: canonicalScope.houseId,
          }),
        },
      );
      assert.equal(accepted.status, 200);
      const body = (await accepted.json()) as {
        readonly processingStatus: string;
      };
      assert.equal(body.processingStatus, 'accepted');

      const again = await fetch(
        `${baseUrl}/partner/leads/lead-house/accept`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: '__Host-conis_partner_session=sales-token',
          },
          body: JSON.stringify({
            companyId: canonicalScope.companyId,
            projectId: canonicalScope.projectId,
            houseId: canonicalScope.houseId,
          }),
        },
      );
      assert.equal(again.status, 200);
      assert.equal(dirLeads[0]?.processingStatus, 'accepted');
    });
  });
});
