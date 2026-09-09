import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilePlatformInviteRepository } from './index';
import {
  FIRST_OPEN_WINDOW_MS,
  ACTIVATION_WINDOW_MS,
} from './partnerInviteLifecycle';

const input = {
  email: 'lifecycle@conis.test',
  displayName: 'Lifecycle test',
  roles: ['manager'] as const,
  invitedByUserId: 'test-admin',
  tenantId: 'test-tenant',
  companyId: 'test-company',
  workspaceId: 'test-workspace',
  projectId: 'test-project',
};

test('repository persists first opening and preserves it after restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-'));
  try {
    const path = join(dir, 'invites.json');
    const repo = new FilePlatformInviteRepository(path);
    const issued = await repo.create(input);
    assert.equal(issued.lifecycleVersion, 2);
    assert.equal(issued.firstOpenedAt, null);
    assert.equal(
      Date.parse(issued.expiresAt) - Date.parse(issued.createdAt),
      FIRST_OPEN_WINDOW_MS,
    );

    await repo.resolve(issued.token);
    assert.equal((await repo.resolve(issued.token))?.firstOpenedAt, null);

    const opened = await repo.open(issued.token);
    assert.ok(opened?.firstOpenedAt);
    assert.equal(
      Date.parse(opened.expiresAt) - Date.parse(opened.firstOpenedAt),
      ACTIVATION_WINDOW_MS,
    );

    const restarted = new FilePlatformInviteRepository(path);
    assert.deepEqual(await restarted.open(issued.token), opened);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('concurrent opening records one stable timestamp', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-'));
  try {
    const repo = new FilePlatformInviteRepository(join(dir, 'invites.json'));
    const issued = await repo.create(input);
    const results = await Promise.all(
      Array.from({ length: 10 }, () => repo.open(issued.token)),
    );
    assert.ok(results[0]?.firstOpenedAt);
    for (const result of results) assert.deepEqual(result, results[0]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('reissue invalidates old token and resets first-open timing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-'));
  try {
    const repo = new FilePlatformInviteRepository(join(dir, 'invites.json'));
    const issued = await repo.create(input);
    await repo.open(issued.token);
    const replacement = await repo.reissue(issued.id);
    assert.ok(replacement);
    assert.equal(await repo.resolve(issued.token), null);
    assert.equal(await repo.open(issued.token), null);
    assert.equal(replacement.firstOpenedAt, null);
    assert.equal(
      Date.parse(replacement.expiresAt) - Date.parse(replacement.createdAt),
      FIRST_OPEN_WINDOW_MS,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('expired legacy record is not revived by opening', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-'));
  try {
    const repo = new FilePlatformInviteRepository(join(dir, 'invites.json'));
    const issued = await repo.create({
      ...input,
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
    const opened = await repo.open(issued.token);
    assert.equal(opened?.status, 'expired');
    assert.equal(opened?.expiresAt, issued.expiresAt);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
