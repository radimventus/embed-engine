import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createDurableLeadPayload,
  submitDurableLead,
  type DurableLeadSubmissionInput,
} from './durableLeadSubmission';

function input(
  idempotencyKey = 'audit-test-key',
): DurableLeadSubmissionInput {
  return {
    idempotencyKey,
    scope: {
      companyId: 'company-domy-s-energii',
      projectId: 'project-domy-s-energii',
      houseId:
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      privacyUrl: 'https://partner.example/privacy',
    },
    contact: {
      name: 'Jan Novák',
      email: 'jan@example.com',
      phone: '+420123456789',
    },
    acceptedAt: '2026-08-20T06:00:00.000Z',
  };
}

describe('Audit durable lead submission', () => {
  it('builds canonical scope and required consent into payload', () => {
    const payload = createDurableLeadPayload(input());

    assert.equal(payload.companyId, 'company-domy-s-energii');
    assert.equal(payload.projectId, 'project-domy-s-energii');
    assert.equal(
      payload.houseId,
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    assert.equal(payload.source, 'EMBED');
    assert.equal(payload.intent, 'audit');
    assert.equal(payload.consent.accepted, true);
    assert.equal(
      payload.consent.privacyUrl,
      'https://partner.example/privacy',
    );
    assert.equal(payload.consent.privacyVersion, 'partner-current');
  });

  it('includes decisionSessionId when the Client journey has one', () => {
    const payload = createDurableLeadPayload({
      ...input(),
      decisionSessionId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    });
    assert.equal(
      payload.decisionSessionId,
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    );
  });

  it('does not resolve before backend acceptance resolves', async () => {
    let release!: () => void;

    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    let settled = false;

    const pending = submitDurableLead(
      input(),
      async () => {
        await gate;
        return new Response(
          JSON.stringify({
            leadId: 'lead-1',
            createdAt: '2026-08-20T06:00:01.000Z',
            status: 'accepted',
          }),
          {
            status: 201,
            headers: { 'content-type': 'application/json' },
          },
        );
      },
    ).then((value) => {
      settled = true;
      return value;
    });

    await Promise.resolve();
    assert.equal(settled, false);

    release();

    const accepted = await pending;
    assert.equal(settled, true);
    assert.equal(accepted.leadId, 'lead-1');
  });

  it('rejects backend failure instead of producing success', async () => {
    await assert.rejects(
      () =>
        submitDurableLead(
          input(),
          async () =>
            new Response(JSON.stringify({ error: 'failed' }), {
              status: 500,
              headers: { 'content-type': 'application/json' },
            }),
        ),
      /Lead was rejected/,
    );
  });

  it('rejects malformed success response', async () => {
    await assert.rejects(
      () =>
        submitDurableLead(
          input(),
          async () =>
            new Response(JSON.stringify({ status: 'accepted' }), {
              status: 201,
              headers: { 'content-type': 'application/json' },
            }),
        ),
      /Lead acceptance response is invalid/,
    );
  });

  it('preserves supplied idempotency key across retry calls', async () => {
    const keys: string[] = [];

    const fetchImpl: typeof fetch = async (_url, init) => {
      const payload = JSON.parse(String(init?.body)) as {
        idempotencyKey: string;
      };

      keys.push(payload.idempotencyKey);

      if (keys.length === 1) {
        return new Response(JSON.stringify({ error: 'temporary' }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          leadId: 'lead-existing',
          createdAt: '2026-08-20T06:00:01.000Z',
          status: 'accepted',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    };

    const retryInput = input('stable-retry-key');

    await assert.rejects(
      () => submitDurableLead(retryInput, fetchImpl),
      /Lead was rejected/,
    );

    const accepted = await submitDurableLead(retryInput, fetchImpl);

    assert.equal(accepted.leadId, 'lead-existing');
    assert.deepEqual(keys, ['stable-retry-key', 'stable-retry-key']);
  });
});
