import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { shouldPrioritizeInviteRoute, urlWithoutInviteParam } from './inviteRouting';

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

describe('urlWithoutInviteParam', () => {
  it('removes invite while preserving path and other query params', () => {
    assert.equal(
      urlWithoutInviteParam(
        'https://conis.cz/studio/manager/?invite=abc123&foo=bar#section',
      ),
      '/studio/manager/?foo=bar#section',
    );
  });

  it('leaves URLs without invite unchanged', () => {
    assert.equal(
      urlWithoutInviteParam('https://conis.cz/studio/manager/'),
      '/studio/manager/',
    );
  });
});
