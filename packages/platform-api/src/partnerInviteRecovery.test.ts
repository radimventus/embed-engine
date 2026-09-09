import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createPlatformApiServer,
  FilePlatformInviteRepository,
  FilePartnerSessionRepository,
} from './index';

test('HTTP activation recovers after account persistence and failed invite write across restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-108-recovery-'));
  const invitePath = join(dir, 'invites.json');
  const accountPath = join(dir, 'partner-sessions.json');
  let repo = new FilePlatformInviteRepository(invitePath);
  let accounts = new FilePartnerSessionRepository(accountPath);
  let server = createPlatformApiServer(
    repo, undefined, undefined, undefined, undefined, accounts,
  );

  async function listen(): Promise<string> {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    return `http://127.0.0.1:${address.port}`;
  }
  async function close(): Promise<void> {
    if (!server.listening) return;
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }

  try {
    const issued = await repo.create({
      email: 'recovery@conis.test',
      displayName: 'Recovery test',
      roles: ['manager'],
      invitedByUserId: 'test-admin',
      tenantId: 'test-tenant',
      companyId: 'test-company',
      workspaceId: 'test-workspace',
      projectId: 'test-project',
    });
    await repo.open(issued.token);

    // Fault injection at the real persistence boundary.
    // The account write succeeds; only the invite completion write fails.
    const originalWrite = (repo as any).write.bind(repo);
    let injected = false;
    (repo as any).write = async (state: any) => {
      if (!injected && state.invites.some((i: any) => i.status === 'activated')) {
        injected = true;
        throw new Error('TEST_ONLY_INVITE_COMPLETION_WRITE_FAILURE');
      }
      return originalWrite(state);
    };

    let base = await listen();
    const activate = () => fetch(
      `${base}/public/auth/activate/${issued.token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ndaAccepted: true,
          password: 'original-password-108',
          rememberMe: true,
        }),
      },
    );

    const failed = await activate();
    const failure = await failed.json();
    assert.equal(failed.status, 500);
    assert.equal(failure.code, 'ACTIVATION_FAILED');
    assert.equal(
      JSON.stringify(failure).includes('TEST_ONLY_INVITE_COMPLETION_WRITE_FAILURE'),
      false,
    );
    assert.equal(failed.headers.get('set-cookie'), null);
    assert.equal(injected, true);
    assert.ok(await accounts.findAccountByEmail('recovery@conis.test'));
    assert.equal((await repo.resolve(issued.token))?.status, 'pending');

    const before = JSON.parse(await readFile(accountPath, 'utf8'));
    assert.equal(before.accounts.length, 1);
    const sessionCount = before.sessions.length;

    await close();
    repo = new FilePlatformInviteRepository(invitePath);
    accounts = new FilePartnerSessionRepository(accountPath);
    server = createPlatformApiServer(
      repo, undefined, undefined, undefined, undefined, accounts,
    );
    base = await listen();

    const recovered = await activate();
    assert.equal(recovered.status, 409);
    assert.equal((await recovered.json()).code, 'ACCOUNT_ALREADY_ACTIVATED');
    assert.equal(recovered.headers.get('set-cookie'), null);
    assert.equal((await repo.resolve(issued.token))?.status, 'activated');

    const after = JSON.parse(await readFile(accountPath, 'utf8'));
    assert.equal(after.accounts.length, 1);
    assert.equal(after.sessions.length, sessionCount);
    assert.equal(after.accounts[0].passwordHash, before.accounts[0].passwordHash);

    const login = await fetch(`${base}/public/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'recovery@conis.test',
        password: 'original-password-108',
        rememberMe: true,
      }),
    });
    assert.equal(login.status, 200);
    const loggedIn = await login.json();
    assert.equal(loggedIn.session.companyId, 'test-company');
    assert.equal(loggedIn.session.workspaceId, 'test-workspace');

    const obsolete = await fetch(
      `${base}/public/invites/${issued.token}/activate`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ndaAccepted: true }),
      },
    );
    assert.equal(obsolete.status, 410);
    await obsolete.text();
  } finally {
    await close();
    await rm(dir, { recursive: true, force: true });
  }
});
