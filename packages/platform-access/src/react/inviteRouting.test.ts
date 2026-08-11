import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { shouldPrioritizeInviteRoute } from './inviteRouting';

describe('invite route precedence', () => {
  it('keeps a fresh URL invite in activation flow despite a restored session', () => {
    assert.equal(
      shouldPrioritizeInviteRoute({
        inviteToken: 'fresh-pending-invite-token',
        hasRestoredSession: true,
      }),
      true,
    );
  });

  it('does not enter invite flow without a URL token', () => {
    assert.equal(
      shouldPrioritizeInviteRoute({
        inviteToken: '',
        hasRestoredSession: false,
      }),
      false,
    );
  });
});
