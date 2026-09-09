import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilePlatformInviteRepository } from './index';

const input = {
  email: 'completion@conis.test',
  displayName: 'Completion test',
  roles: ['manager'] as const,
  invitedByUserId: 'test-admin',
  tenantId: 'test-tenant',
  companyId: 'test-company',
  workspaceId: 'test-workspace',
  projectId: 'test-project',
};

test('failed account completion leaves invitation usable', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-complete-'));
  try {
    const repo = new FilePlatformInviteRepository(join(dir, 'invites.json'));
    const issued = await repo.create(input);
    await assert.rejects(
      repo.activate(issued.token, true, async () => {
        throw new Error('simulated account write failure');
      }),
      /simulated account write failure/,
    );
    assert.equal((await repo.resolve(issued.token))?.status, 'pending');

    let completed = 0;
    const result = await repo.activate(issued.token, true, async () => {
      completed++;
    });
    assert.equal(result.ok, true);
    assert.equal(completed, 1);
    assert.equal((await repo.resolve(issued.token))?.status, 'activated');

    const repeated = await repo.activate(issued.token, true, async () => {
      completed++;
    });
    assert.equal(repeated.ok, false);
    assert.equal(completed, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('reissue waits for account completion and cannot replace activated invite', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-race-'));
  try {
    const repo = new FilePlatformInviteRepository(join(dir, 'invites.json'));
    const issued = await repo.create(input);

    let entered!: () => void;
    let release!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });

    const activation = repo.activate(issued.token, true, async () => {
      entered();
      await gate;
    });
    await started;
    const reissue = repo.reissue(issued.id);
    release();

    assert.equal((await activation).ok, true);
    assert.equal(await reissue, null);
    assert.equal((await repo.resolve(issued.token))?.status, 'activated');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
