import assert from 'node:assert/strict';
import {
  mkdtemp,
  rm,
} from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  createPlatformApiServer,
} from './index';
import type {
  PartnerPasswordResetDelivery,
  PartnerPasswordResetDeliveryInput,
} from './partnerPasswordResetDelivery';
import {
  FilePartnerPasswordResetRepository,
} from './partnerPasswordResetRepository';
import {
  FilePartnerSessionRepository,
} from './partnerSessionRepository';

class CapturingDelivery implements PartnerPasswordResetDelivery {
  readonly messages: PartnerPasswordResetDeliveryInput[] = [];
  private calledResolve:
    ((input: PartnerPasswordResetDeliveryInput) => void) | null = null;
  private releaseResolve: (() => void) | null = null;

  readonly called =
    new Promise<PartnerPasswordResetDeliveryInput>((resolve) => {
      this.calledResolve = resolve;
    });

  async sendPasswordReset(
    input: PartnerPasswordResetDeliveryInput,
  ): Promise<void> {
    this.messages.push(input);
    this.calledResolve?.(input);

    await new Promise<void>((resolve) => {
      this.releaseResolve = resolve;
    });
  }

  release(): void {
    this.releaseResolve?.();
    this.releaseResolve = null;
  }
}

test('public password recovery is non-enumerating, single-use and revokes old sessions', async () => {
  const directory = await mkdtemp(
    join(tmpdir(), 'conis-109-http-'),
  );
  const partnerSessions = new FilePartnerSessionRepository(
    join(directory, 'partner-sessions.json'),
  );
  const passwordResets = new FilePartnerPasswordResetRepository(
    join(directory, 'password-resets.json'),
  );
  const delivery = new CapturingDelivery();

  const activated = await partnerSessions.activate({
    invite: {
      id: 'invite-http-109',
      email: 'http109@conis.test',
      displayName: 'HTTP Partner 109',
      roles: ['manager'],
      tenantId: 'tenant-109',
      companyId: 'company-109',
      workspaceId: 'workspace-109',
      projectId: 'project-109',
    },
    password: 'original-password-109',
    rememberMe: true,
  });

  const server = createPlatformApiServer(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    partnerSessions,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    passwordResets,
    delivery,
  );

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${(address as AddressInfo).port}`;

  const requestReset = (email: string) =>
    fetch(`${base}/public/auth/password-reset/request`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });

  try {
    const unknown = await requestReset('missing109@conis.test');
    const unknownBody = await unknown.json();

    const existing = await requestReset('HTTP109@CONIS.TEST');
    const existingBody = await existing.json();

    assert.equal(unknown.status, 202);
    assert.equal(existing.status, 202);
    assert.deepEqual(existingBody, unknownBody);
    assert.equal(JSON.stringify(existingBody).includes('token'), false);

    /*
     * sendPasswordReset remains deliberately blocked here. Receiving the
     * HTTP response already proves that public request timing does not await
     * SMTP completion.
     */
    const message = await delivery.called;
    assert.equal(delivery.messages.length, 1);
    assert.equal(message.email, 'http109@conis.test');
    delivery.release();

    const inspect = await fetch(
      `${base}/public/auth/password-reset/${encodeURIComponent(message.token)}`,
    );

    assert.equal(inspect.status, 200);
    const preview = await inspect.json();
    assert.equal(preview.ok, true);
    assert.ok(preview.expiresAt);
    assert.equal(JSON.stringify(preview).includes(message.email), false);

    const mismatch = await fetch(
      `${base}/public/auth/password-reset/${encodeURIComponent(message.token)}/complete`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          password: 'replacement-password-109',
          passwordConfirm: 'different-password-109',
        }),
      },
    );

    assert.equal(mismatch.status, 400);
    assert.equal(
      (await mismatch.json()).code,
      'PASSWORD_CONFIRMATION_MISMATCH',
    );

    const completed = await fetch(
      `${base}/public/auth/password-reset/${encodeURIComponent(message.token)}/complete`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          password: 'replacement-password-109',
          passwordConfirm: 'replacement-password-109',
        }),
      },
    );

    assert.equal(completed.status, 200);
    assert.match(
      completed.headers.get('set-cookie') ?? '',
      /Max-Age=0/,
    );
    assert.equal(
      await partnerSessions.resolve(activated.token),
      null,
    );

    const oldLogin = await fetch(`${base}/public/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'http109@conis.test',
        password: 'original-password-109',
        rememberMe: true,
      }),
    });

    assert.equal(oldLogin.status, 401);

    const newLogin = await fetch(`${base}/public/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'http109@conis.test',
        password: 'replacement-password-109',
        rememberMe: true,
      }),
    });

    assert.equal(newLogin.status, 200);

    const reused = await fetch(
      `${base}/public/auth/password-reset/${encodeURIComponent(message.token)}/complete`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          password: 'another-password-109',
          passwordConfirm: 'another-password-109',
        }),
      },
    );

    assert.equal(reused.status, 410);
    assert.equal(
      (await reused.json()).code,
      'PASSWORD_RESET_LINK_INVALID',
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
