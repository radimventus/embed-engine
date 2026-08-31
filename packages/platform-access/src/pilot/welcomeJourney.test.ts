/**
 * PT-CJ-01 — Welcome & Pilot Entry (Apple Easy).
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
  WELCOME_LEAD,
  WELCOME_PASSWORD_NOTE,
  WELCOME_PRIMARY_CTA_LABEL,
  WELCOME_SECONDARY_CTA_LABEL,
  WELCOME_TITLE,
  resolvePilotOfferHref,
} from '../index.ts';
import { clearPlatformSession } from '../session/sessionStore.ts';

const here = dirname(fileURLToPath(import.meta.url));

describe('PT-CJ-01 Welcome & Pilot Entry', () => {
  it('opens welcome after activation and completes only once', () => {
    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
    clearPlatformSession();

    const invite = createPilotInvite({
      email: 'welcome-cj01@pilot.local',
      displayName: 'Welcome CJ01',
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

    prepareWelcomeJourney(activated.user.email);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), false);

    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
  });

  it('exposes Apple Easy copy and single primary CTA', () => {
    assert.equal(WELCOME_TITLE, 'Vítejte ve svém CONIS Studio');
    assert.equal(
      WELCOME_LEAD,
      'Vše je připravené. Zbývá už jen vybrat pilotní program.',
    );
    assert.equal(
      WELCOME_PASSWORD_NOTE,
      'Heslo můžete kdykoliv změnit v Nastavení.',
    );
    assert.equal(WELCOME_PRIMARY_CTA_LABEL, 'Vybrat pilotní program');
    assert.equal(
      WELCOME_SECONDARY_CTA_LABEL,
      'Pokračovat do CONIS Studio',
    );
    assert.match(resolvePilotOfferHref(), /4192|\/offer\//);
  });

  it('welcome screen is one goal with quiet secondary Studio path', () => {
    const source = readFileSync(
      join(here, '../react/PartnerWelcomeScreen.tsx'),
      'utf8',
    );
    const landing = readFileSync(
      join(here, '../react/PlatformLanding.tsx'),
      'utf8',
    );

    assert.match(source, /welcome-experience/);
    assert.match(source, /WELCOME_TITLE/);
    assert.match(source, /WELCOME_LEAD/);
    assert.match(source, /welcome-select-pilot-program/);
    assert.match(source, /welcome-continue-studio/);
    assert.match(source, /welcome-password-note/);
    assert.match(source, /WELCOME_PRIMARY_CTA_LABEL/);
    assert.match(source, /WELCOME_SECONDARY_CTA_LABEL/);

    assert.doesNotMatch(source, /marketing/i);
    assert.doesNotMatch(source, /schůzk/i);
    assert.doesNotMatch(source, /Builder Studio/);
    assert.doesNotMatch(source, /Office Studio/);
    assert.doesNotMatch(source, /welcome-studios-intro/);
    assert.doesNotMatch(source, /welcome-enter-manager-studio/);
    assert.doesNotMatch(source, /type="password"/);
    assert.doesNotMatch(source, /<form/);

    assert.match(landing, /resolvePilotOfferHref/);
    assert.match(landing, /onSelectPilotProgram/);
    assert.match(landing, /onContinueToStudio/);
    assert.match(landing, /openManagerStudio/);
    assert.match(landing, /activeStudioId: 'manager'/);
    assert.match(landing, /activeStudio: 'manager'/);
    assert.match(landing, /resolveWorkspaceHostHref/);
  });
});
