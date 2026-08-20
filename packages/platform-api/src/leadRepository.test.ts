import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  FileLeadRepository,
  LeadAlreadyExistsError,
  type DurableLeadInput,
} from './leadRepository';

function validLead(
  overrides: Partial<DurableLeadInput> = {},
): DurableLeadInput {
  return {
    leadId: 'lead-test-001',
    idempotencyKey: 'idem-test-001',
    createdAt: '2026-08-20T05:00:00.000Z',
    companyId: 'company-test',
    projectId: 'project-test',
    houseId: 'house-test',
    source: 'EMBED',
    intent: 'audit',
    contact: {
      name: 'Jan Novák',
      email: 'jan.novak@example.com',
      phone: '+420777123456',
    },
    consent: {
      accepted: true,
      acceptedAt: '2026-08-20T05:00:01.000Z',
      privacyUrl: 'https://partner.example/privacy',
      privacyVersion: 'partner-current',
    },
    ...overrides,
  };
}

test('FileLeadRepository persists and reads an accepted durable lead', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-repository-'));
  const statePath = join(dir, 'leads.json');

  try {
    const repository = new FileLeadRepository(statePath);
    const created = await repository.create(validLead());

    assert.equal(created.status, 'accepted');
    assert.equal(created.notificationStatus, 'pending');
    assert.equal(created.companyId, 'company-test');
    assert.equal(created.projectId, 'project-test');
    assert.equal(created.houseId, 'house-test');
    assert.equal(created.contact.email, 'jan.novak@example.com');
    assert.equal(created.consent.accepted, true);
    assert.equal(
      created.consent.privacyUrl,
      'https://partner.example/privacy',
    );

    const readBack = await repository.getByIdempotencyKey('idem-test-001');

    assert.deepEqual(readBack, created);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository survives a fresh repository instance over the same state path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-restart-'));
  const statePath = join(dir, 'leads.json');

  try {
    const firstRepository = new FileLeadRepository(statePath);
    const created = await firstRepository.create(validLead());

    const freshRepository = new FileLeadRepository(statePath);
    const restored = await freshRepository.getByIdempotencyKey(
      created.idempotencyKey,
    );

    assert.notEqual(restored, null);
    assert.deepEqual(restored, created);
    assert.equal(restored?.leadId, 'lead-test-001');
    assert.equal(restored?.companyId, 'company-test');
    assert.equal(restored?.projectId, 'project-test');
    assert.equal(restored?.houseId, 'house-test');
    assert.equal(
      restored?.consent.acceptedAt,
      '2026-08-20T05:00:01.000Z',
    );
    assert.equal(
      restored?.consent.privacyUrl,
      'https://partner.example/privacy',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository rejects duplicate idempotency keys without creating another lead', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-idempotency-'));
  const statePath = join(dir, 'leads.json');

  try {
    const repository = new FileLeadRepository(statePath);
    const first = await repository.create(validLead());

    await assert.rejects(
      () =>
        repository.create(
          validLead({
            leadId: 'lead-test-duplicate',
          }),
        ),
      (error: unknown) => {
        assert.ok(error instanceof LeadAlreadyExistsError);
        assert.deepEqual(error.lead, first);
        return true;
      },
    );

    const stored = await repository.getByIdempotencyKey('idem-test-001');
    assert.deepEqual(stored, first);
    assert.equal(stored?.leadId, 'lead-test-001');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository rejects malformed lead before persistence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-invalid-'));
  const statePath = join(dir, 'leads.json');

  try {
    const repository = new FileLeadRepository(statePath);

    await assert.rejects(
      () =>
        repository.create(
          validLead({
            contact: {
              name: 'Jan Novák',
              email: 'invalid-email',
              phone: null,
            },
          }),
        ),
      /Invalid durable lead/,
    );

    const stored = await repository.getByIdempotencyKey('idem-test-001');
    assert.equal(stored, null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository rejects consent.accepted=false before persistence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-consent-false-'));
  const statePath = join(dir, 'leads.json');

  try {
    const repository = new FileLeadRepository(statePath);

    await assert.rejects(
      () =>
        repository.create(
          validLead({
            consent: {
              accepted: false as unknown as true,
              acceptedAt: '2026-08-20T05:00:01.000Z',
              privacyUrl: 'https://partner.example/privacy',
              privacyVersion: 'partner-current',
            },
          }),
        ),
      /Invalid durable lead/,
    );

    const stored = await repository.getByIdempotencyKey('idem-test-001');
    assert.equal(stored, null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository lists only the requested Company/Project/House scope', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-list-'));
  const statePath = join(dir, 'leads.json');

  try {
    const repository = new FileLeadRepository(statePath);
    await repository.create(validLead());
    await repository.create(
      validLead({
        leadId: 'lead-test-002',
        idempotencyKey: 'idem-test-002',
        houseId: 'house-other',
      }),
    );
    await repository.create(
      validLead({
        leadId: 'lead-test-003',
        idempotencyKey: 'idem-test-003',
        projectId: 'project-other',
      }),
    );

    const house = await repository.list({
      companyId: 'company-test',
      projectId: 'project-test',
      houseId: 'house-test',
    });
    assert.deepEqual(
      house.map((item) => item.leadId),
      ['lead-test-001'],
    );

    const project = await repository.list({
      companyId: 'company-test',
      projectId: 'project-test',
    });
    assert.deepEqual(
      project.map((item) => item.leadId).sort(),
      ['lead-test-001', 'lead-test-002'],
    );

    const foreign = await repository.list({
      companyId: 'company-other',
      projectId: 'project-test',
      houseId: 'house-test',
    });
    assert.deepEqual(foreign, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository persists decisionSessionId', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-session-'));
  const statePath = join(dir, 'leads.json');
  try {
    const repository = new FileLeadRepository(statePath);
    const created = await repository.create(
      validLead({
        decisionSessionId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      }),
    );
    assert.equal(
      created.decisionSessionId,
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    );
    const restored = await new FileLeadRepository(statePath).getByIdempotencyKey(
      created.idempotencyKey,
    );
    assert.equal(
      restored?.decisionSessionId,
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileLeadRepository remains readable without decisionSessionId', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-lead-legacy-session-'));
  const statePath = join(dir, 'leads.json');
  try {
    const legacy = validLead();
    await writeFile(
      statePath,
      JSON.stringify({
        leads: [
          {
            ...legacy,
            status: 'accepted',
            notificationStatus: 'pending',
          },
        ],
      }),
    );
    const restored = await new FileLeadRepository(statePath).getByIdempotencyKey(
      legacy.idempotencyKey,
    );
    assert.equal(restored?.leadId, legacy.leadId);
    assert.equal(restored?.decisionSessionId, null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
