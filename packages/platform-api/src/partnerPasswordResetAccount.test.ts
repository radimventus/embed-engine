import assert from 'node:assert/strict';
import {
  mkdtemp,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { FilePartnerSessionRepository } from './partnerSessionRepository';

const invite = {
  id: 'invite-task-109',
  email: 'partner109@conis.test',
  displayName: 'Partner 109',
  roles: ['manager'] as const,
  tenantId: 'tenant-109',
  companyId: 'company-109',
  workspaceId: 'workspace-109',
  projectId: 'project-109',
};

async function fixture() {
  const directory = await mkdtemp(
    join(tmpdir(), 'conis-109-account-'),
  );
  const statePath = join(directory, 'partner-sessions.json');
  const repository = new FilePartnerSessionRepository(statePath);

  return {
    directory,
    repository,
  };
}

test('password reset changes the hash and revokes every existing session', async () => {
  const current = await fixture();

  try {
    const activated = await current.repository.activate({
      invite,
      password: 'original-password-109',
      rememberMe: true,
    });
    const secondSession = await current.repository.login({
      email: invite.email,
      password: 'original-password-109',
      rememberMe: false,
    });

    assert.ok(secondSession);
    assert.ok(await current.repository.resolve(activated.token));
    assert.ok(await current.repository.resolve(secondSession.token));

    const account = await current.repository.findAccountByEmail(
      invite.email,
    );

    assert.ok(account);

    const changed = await current.repository.resetPassword({
      accountId: account.id,
      password: 'replacement-password-109',
    });

    assert.equal(changed, true);

    assert.equal(
      await current.repository.resolve(activated.token),
      null,
    );
    assert.equal(
      await current.repository.resolve(secondSession.token),
      null,
    );

    assert.equal(
      await current.repository.login({
        email: invite.email,
        password: 'original-password-109',
        rememberMe: true,
      }),
      null,
    );

    const newLogin = await current.repository.login({
      email: invite.email,
      password: 'replacement-password-109',
      rememberMe: true,
    });

    assert.ok(newLogin);
    assert.equal(newLogin.identity.user.id, account.id);
    assert.equal(newLogin.identity.companyId, invite.companyId);
    assert.equal(newLogin.identity.workspaceId, invite.workspaceId);
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});

test('invalid password does not change the account or revoke its session', async () => {
  const current = await fixture();

  try {
    const activated = await current.repository.activate({
      invite: {
        ...invite,
        id: 'invite-task-109-short',
        email: 'short109@conis.test',
      },
      password: 'original-password-109',
      rememberMe: true,
    });

    const account = await current.repository.findAccountByEmail(
      'short109@conis.test',
    );

    assert.ok(account);

    await assert.rejects(
      current.repository.resetPassword({
        accountId: account.id,
        password: 'short',
      }),
      /alespoň 8 znaků/,
    );

    assert.ok(await current.repository.resolve(activated.token));

    const login = await current.repository.login({
      email: 'short109@conis.test',
      password: 'original-password-109',
      rememberMe: true,
    });

    assert.ok(login);
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});

test('unknown account fails without creating state', async () => {
  const current = await fixture();

  try {
    assert.equal(
      await current.repository.resetPassword({
        accountId: 'missing-account',
        password: 'replacement-password-109',
      }),
      false,
    );
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});
