/**
 * PE-04 — Invitation & NDA: validity, resend, gateway, first password, activation.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  activateInvite,
  completePartnerOnboarding,
  createPilotInvite,
  findInviteByToken,
  isInviteActivatable,
  isPartnerOnboardingOpen,
  login,
  prepareWelcomeJourney,
  resendPilotInvite,
  resetInviteStore,
  resetPartnerWelcomeStore,
  resetUserRegistry,
  resolveInviteLifecycle,
  shouldShowPartnerWelcome,
} from '../index.ts';
import { clearPlatformSession } from '../session/sessionStore.ts';

describe('PE-04 Invitation & NDA', () => {
  it('creates a pending invite with validity window', () => {
    resetInviteStore();
    const invite = createPilotInvite({
      email: 'pe04@pilot.local',
      displayName: 'PE04 Partner',
      roles: ['manager', 'salesman'],
      invitedByUserId: 'user-radim',
    });
    assert.equal(invite.status, 'pending');
    assert.ok(Date.parse(invite.expiresAt) > Date.now());
    assert.equal(resolveInviteLifecycle(invite), 'pending');
    assert.equal(isInviteActivatable(invite), true);
    resetInviteStore();
  });

  it('blocks activation without NDA and when invite is expired', () => {
    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
    clearPlatformSession();

    const invite = createPilotInvite({
      email: 'nda@pilot.local',
      displayName: 'NDA',
      roles: ['manager'],
      invitedByUserId: 'user-radim',
    });
    const denied = activateInvite({
      token: invite.token,
      password: 'secret',
      ndaAccepted: false,
    });
    assert.equal(denied.ok, false);

    const expired = createPilotInvite({
      email: 'expired@pilot.local',
      displayName: 'Expired',
      roles: ['manager'],
      invitedByUserId: 'user-radim',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    assert.equal(resolveInviteLifecycle(expired), 'expired');
    const expiredActivation = activateInvite({
      token: expired.token,
      password: 'secret',
      ndaAccepted: true,
    });
    assert.equal(expiredActivation.ok, false);
    assert.match(
      expiredActivation.ok ? '' : expiredActivation.error,
      /vypršela|Platnost/i,
    );
    const materialized = findInviteByToken(expired.token);
    assert.equal(materialized?.status, 'expired');

    resetInviteStore();
    resetUserRegistry();
  });

  it('resend restores pending validity with a new token', () => {
    resetInviteStore();
    const invite = createPilotInvite({
      email: 'resend@pilot.local',
      displayName: 'Resend',
      roles: ['salesman'],
      invitedByUserId: 'user-radim',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    assert.equal(resolveInviteLifecycle(invite), 'expired');
    const resent = resendPilotInvite(invite.id);
    assert.ok(resent !== null);
    assert.equal(resent?.status, 'pending');
    assert.equal(resent?.sendCount, 1);
    assert.notEqual(resent?.token, invite.token);
    assert.ok(Date.parse(resent!.expiresAt) > Date.now());
    assert.equal(isInviteActivatable(resent), true);
    resetInviteStore();
  });

  it('activates account with first password and opens Welcome Journey', () => {
    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
    clearPlatformSession();

    const invite = createPilotInvite({
      email: 'welcome@pilot.local',
      displayName: 'Welcome',
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
    assert.equal(activated.invite.status, 'activated');
    assert.ok(activated.invite.ndaAcceptedAt !== null);
    assert.equal(activated.user.status, 'active');
    assert.equal(shouldShowPartnerWelcome(activated.user.email), true);
    assert.equal(isPartnerOnboardingOpen(activated.user.email), true);

    const loggedIn = login({
      email: activated.user.email,
      password: 'first-pass',
      rememberMe: false,
    });
    assert.equal(loggedIn.ok, true);

    completePartnerOnboarding(activated.user.email);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), false);
    assert.equal(isPartnerOnboardingOpen(activated.user.email), false);

    // prepareWelcomeJourney is idempotent for re-entry tests
    prepareWelcomeJourney(activated.user.email);
    assert.equal(shouldShowPartnerWelcome(activated.user.email), false);

    resetInviteStore();
    resetUserRegistry();
    resetPartnerWelcomeStore();
  });

  it('exposes the canonical public NDA document in the invite gateway', () => {
    const source = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../react/InviteShell.tsx',
      ),
      'utf8',
    );

    assert.match(source, /resolvePublicLegalHref\('05_nda\.pdf'\)/);
    assert.match(source, /data-testid="nda-document-link"/);
    assert.match(source, /Dohoda o mlčenlivosti \(NDA\)/);
    assert.match(source, /target="_blank"/);
    assert.match(source, /rel="noopener"/);
  });

});
