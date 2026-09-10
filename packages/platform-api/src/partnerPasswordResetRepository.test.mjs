import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { PASSWORD_RESET_WINDOW_MS } from './partnerPasswordResetLifecycle.ts';
import { FilePartnerPasswordResetRepository } from './partnerPasswordResetRepository.ts';

const start = Date.parse('2026-09-10T08:00:00.000Z');

async function fixture() {
  const directory = await mkdtemp(
    join(tmpdir(), 'conis-109-reset-'),
  );
  const statePath = join(directory, 'password-resets.json');

  return {
    directory,
    statePath,
    repository: new FilePartnerPasswordResetRepository(statePath),
  };
}

test('persists only the verifier and survives a repository restart', async () => {
  const current = await fixture();

  try {
    const issued = await current.repository.issue(
      'account-109',
      start,
    );

    const source = await readFile(current.statePath, 'utf8');

    assert.equal(source.includes(issued.token), false);
    assert.equal(
      Date.parse(issued.expiresAt) - start,
      PASSWORD_RESET_WINDOW_MS,
    );

    const restarted =
      new FilePartnerPasswordResetRepository(current.statePath);
    const resolved = await restarted.resolve(
      issued.token,
      start + 1000,
    );

    assert.deepEqual(resolved, {
      accountId: 'account-109',
      expiresAt: issued.expiresAt,
      status: 'pending',
    });
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});

test('reissue invalidates the previous token for the same account', async () => {
  const current = await fixture();

  try {
    const first = await current.repository.issue(
      'account-109',
      start,
    );
    const replacement = await current.repository.issue(
      'account-109',
      start + 1000,
    );

    assert.equal(
      (await current.repository.resolve(
        first.token,
        start + 2000,
      ))?.status,
      'revoked',
    );
    assert.equal(
      (await current.repository.resolve(
        replacement.token,
        start + 2000,
      ))?.status,
      'pending',
    );
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});

test('two concurrent completions perform the account change once', async () => {
  const current = await fixture();

  try {
    const issued = await current.repository.issue(
      'account-109',
      start,
    );
    let completions = 0;

    const complete = () =>
      current.repository.complete(
        issued.token,
        async (accountId) => {
          assert.equal(accountId, 'account-109');
          completions++;
        },
        start + 1000,
      );

    const [first, second] = await Promise.all([
      complete(),
      complete(),
    ]);

    assert.equal(completions, 1);
    assert.deepEqual(
      [first.ok, second.ok].sort(),
      [false, true],
    );
    assert.equal(
      (await current.repository.resolve(
        issued.token,
        start + 2000,
      ))?.status,
      'used',
    );
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});

test('failed account write leaves the reset token retryable', async () => {
  const current = await fixture();

  try {
    const issued = await current.repository.issue(
      'account-109',
      start,
    );

    await assert.rejects(
      current.repository.complete(
        issued.token,
        async () => {
          throw new Error('simulated account write failure');
        },
        start + 1000,
      ),
      /simulated account write failure/,
    );

    assert.equal(
      (await current.repository.resolve(
        issued.token,
        start + 2000,
      ))?.status,
      'pending',
    );

    let completed = 0;
    const recovered = await current.repository.complete(
      issued.token,
      async () => {
        completed++;
      },
      start + 3000,
    );

    assert.equal(recovered.ok, true);
    assert.equal(completed, 1);
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});

test('expired and explicitly revoked tokens cannot complete', async () => {
  const current = await fixture();

  try {
    const expired = await current.repository.issue(
      'account-expired',
      start,
    );
    const revoked = await current.repository.issue(
      'account-revoked',
      start,
    );

    assert.equal(
      await current.repository.revoke(
        revoked.token,
        start + 1000,
      ),
      true,
    );

    let completions = 0;
    const operation = async () => {
      completions++;
    };

    const expiredResult = await current.repository.complete(
      expired.token,
      operation,
      start + PASSWORD_RESET_WINDOW_MS,
    );
    const revokedResult = await current.repository.complete(
      revoked.token,
      operation,
      start + 2000,
    );

    assert.equal(expiredResult.ok, false);
    assert.equal(revokedResult.ok, false);
    assert.equal(completions, 0);
  } finally {
    await rm(current.directory, {
      recursive: true,
      force: true,
    });
  }
});
