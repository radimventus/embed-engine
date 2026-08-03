/**
 * PE-05 — Welcome Journey: first session, Client Studio CTA, once-only gate.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  activateInvite,
  createPilotInvite,
  finishWelcomeJourney,
  hasCompletedWelcomeJourney,
  prepareWelcomeJourney,
  resetInviteStore,
  resetPartnerWelcomeStore,
  resetUserRegistry,
  shouldShowPartnerWelcome,
} from '../index.ts';
import { clearPlatformSession } from '../session/sessionStore.ts';

const here = dirname(fileURLToPath(import.meta.url));

describe('PE-05 Welcome Journey', () => {
  it('opens welcome after activation and completes only once', () => {
    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
    clearPlatformSession();

    const invite = createPilotInvite({
      email: 'welcome-pe05@pilot.local',
      displayName: 'Welcome PE05',
      roles: ['manager', 'salesman'],
      invitedByUserId: 'user-radim',
    });
    const activated = activateInvite({
      token: invite.token,
      password: 'first-pass',
      ndaAccepted: true,
    });
    assert.equal(activated.ok, true);
    if (!activated.ok) return;

    assert.equal(shouldShowPartnerWelcome(activated.user.email), true);
    assert.equal(hasCompletedWelcomeJourney(activated.user.email), false);

    finishWelcomeJourney(activated.user.email);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), false);
    assert.equal(hasCompletedWelcomeJourney(activated.user.email), true);

    // Later "prepare" must not reopen Welcome after first session.
    prepareWelcomeJourney(activated.user.email);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), false);

    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
  });

  it('welcome screen prioritizes Client Studio and secondary partner studios', () => {
    const source = readFileSync(
      join(here, '../react/PartnerWelcomeScreen.tsx'),
      'utf8',
    );
    assert.match(source, /welcome-enter-client-studio/);
    assert.match(source, /Otevřít Client Studio/);
    assert.match(source, /welcome-enter-manager-studio/);
    assert.match(source, /welcome-enter-sales-studio/);
    assert.match(source, /Ukázkový projekt CONIS/);
    assert.doesNotMatch(source, /Builder Studio/);
    assert.doesNotMatch(source, /Office Studio/);
  });
});
