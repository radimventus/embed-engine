import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PASSWORD_RESET_WINDOW_MS,
  createPartnerPasswordReset,
  partnerPasswordResetStatus,
  passwordResetTokenMatches,
  revokePendingPasswordResets,
  usePartnerPasswordReset,
} from './partnerPasswordResetLifecycle.ts';

const start = Date.parse('2026-09-09T12:00:00.000Z');

test('issues a cryptographically opaque 60-minute reset token', () => {
  const issued = createPartnerPasswordReset('account-109', start);

  assert.equal(issued.token.length >= 40, true);
  assert.equal(issued.record.accountId, 'account-109');
  assert.equal(issued.record.status, 'pending');
  assert.equal(issued.record.usedAt, null);
  assert.equal(issued.record.revokedAt, null);
  assert.equal(
    Date.parse(issued.record.expiresAt) -
      Date.parse(issued.record.createdAt),
    PASSWORD_RESET_WINDOW_MS,
  );

  assert.equal(
    JSON.stringify(issued.record).includes(issued.token),
    false,
  );
  assert.equal(
    passwordResetTokenMatches(issued.record, issued.token),
    true,
  );
  assert.equal(
    passwordResetTokenMatches(issued.record, `${issued.token}x`),
    false,
  );
});

test('reset is valid before but not at the exact deadline', () => {
  const { record } = createPartnerPasswordReset('account-109', start);

  assert.equal(
    partnerPasswordResetStatus(
      record,
      start + PASSWORD_RESET_WINDOW_MS - 1,
    ),
    'pending',
  );
  assert.equal(
    partnerPasswordResetStatus(
      record,
      start + PASSWORD_RESET_WINDOW_MS,
    ),
    'expired',
  );
});

test('reset token is single-use', () => {
  const { record } = createPartnerPasswordReset('account-109', start);
  const used = usePartnerPasswordReset(record, start + 1000);

  assert.ok(used);
  assert.equal(used.status, 'used');
  assert.equal(
    used.usedAt,
    new Date(start + 1000).toISOString(),
  );
  assert.equal(usePartnerPasswordReset(used, start + 2000), null);
});

test('reissue revokes previous pending tokens for the same account only', () => {
  const first = createPartnerPasswordReset('account-109', start);
  const unrelated = createPartnerPasswordReset('account-other', start);

  const after = revokePendingPasswordResets(
    [first.record, unrelated.record],
    'account-109',
    start + 1000,
  );

  assert.equal(after[0].status, 'revoked');
  assert.equal(
    after[0].revokedAt,
    new Date(start + 1000).toISOString(),
  );
  assert.equal(after[1].status, 'pending');
  assert.equal(usePartnerPasswordReset(after[0], start + 2000), null);
});

test('invalid timing data fails closed', () => {
  const { record } = createPartnerPasswordReset('account-109', start);

  for (const patch of [
    { createdAt: 'invalid' },
    { expiresAt: 'invalid' },
    { expiresAt: new Date(start + 1).toISOString() },
  ]) {
    const invalid = { ...record, ...patch };

    assert.equal(
      partnerPasswordResetStatus(invalid, start + 1000),
      'expired',
    );
    assert.equal(
      usePartnerPasswordReset(invalid, start + 1000),
      null,
    );
  }
});

test('reset cannot be used before it was created', () => {
  const { record } = createPartnerPasswordReset('account-109', start);

  assert.equal(
    partnerPasswordResetStatus(record, start - 1),
    'expired',
  );
  assert.equal(usePartnerPasswordReset(record, start - 1), null);
});
