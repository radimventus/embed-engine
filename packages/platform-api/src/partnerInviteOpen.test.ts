import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createPlatformApiServer,
  FilePlatformInviteRepository,
} from './index';

test('HTTP GET is read-only; POST open starts one durable activation window', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-http-'));
  const repo = new FilePlatformInviteRepository(join(dir, 'invites.json'));
  const server = createPlatformApiServer(repo);
  try {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/public/invites`;
    const issued = await repo.create({
      email: 'open@conis.test',
      displayName: 'Open test',
      roles: ['manager'],
      invitedByUserId: 'test-admin',
      tenantId: 'test-tenant',
      companyId: 'test-company',
      workspaceId: 'test-workspace',
      projectId: 'test-project',
    });

    const read = await fetch(`${base}/${issued.token}`);
    assert.equal(read.status, 200);
    assert.equal((await read.json()).firstOpenedAt, null);
    assert.equal((await repo.resolve(issued.token))?.firstOpenedAt, null);

    const open = await fetch(`${base}/${issued.token}/open`, { method: 'POST' });
    assert.equal(open.status, 200);
    const opened = await open.json();
    assert.ok(opened.firstOpenedAt);
    assert.equal(opened.status, 'pending');

    const repeated = await fetch(`${base}/${issued.token}/open`, { method: 'POST' });
    assert.equal(repeated.status, 200);
    assert.deepEqual(await repeated.json(), opened);

    const replacement = await repo.reissue(issued.id);
    assert.ok(replacement);
    const old = await fetch(`${base}/${issued.token}/open`, { method: 'POST' });
    assert.equal(old.status, 404);

    const expired = await repo.create({
      email: 'expired@conis.test',
      displayName: 'Expired test',
      roles: ['manager'],
      invitedByUserId: 'test-admin',
      tenantId: 'test-tenant',
      companyId: 'test-company',
      workspaceId: 'test-workspace',
      projectId: 'test-project',
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
    const response = await fetch(`${base}/${expired.token}/open`, { method: 'POST' });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'expired');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    await rm(dir, { recursive: true, force: true });
  }
});
