import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createPlatformApiServer,
  LeadAlreadyExistsError,
  type DurableLead,
  type DurableLeadInput,
  type LeadRepository,
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
    status: 'accepted',
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
