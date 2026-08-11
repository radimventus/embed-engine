import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { FilePlatformInviteRepository } from './index.ts';

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
