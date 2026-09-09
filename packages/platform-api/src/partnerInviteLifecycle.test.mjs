import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FIRST_OPEN_WINDOW_MS,
  ACTIVATION_WINDOW_MS,
  createInviteTiming,
  invitationStatus,
  firstOpenInvite,
} from './partnerInviteLifecycle.ts';

const start = Date.parse('2026-09-09T12:00:00.000Z');
const day = 24 * 60 * 60 * 1000;
const fresh = () => ({
  ...createInviteTiming(start),
  status: 'pending',
});

test('unopened invitation expires exactly after 30 days', () => {
  const invite = fresh();
  assert.equal(invitationStatus(invite, start + FIRST_OPEN_WINDOW_MS - 1), 'pending');
  assert.equal(invitationStatus(invite, start + FIRST_OPEN_WINDOW_MS), 'expired');
  assert.equal(firstOpenInvite(invite, start + FIRST_OPEN_WINDOW_MS), null);
});

test('opening on day 29 grants a full seven-day activation window', () => {
  const openedAt = start + 29 * day;
  const opened = firstOpenInvite(fresh(), openedAt);
  assert.ok(opened);
  assert.equal(opened.firstOpenedAt, new Date(openedAt).toISOString());
  assert.equal(opened.expiresAt, new Date(openedAt + ACTIVATION_WINDOW_MS).toISOString());
  assert.equal(invitationStatus(opened, openedAt + ACTIVATION_WINDOW_MS - 1), 'pending');
  assert.equal(invitationStatus(opened, openedAt + ACTIVATION_WINDOW_MS), 'expired');
});

test('refresh and return do not renew the activation deadline', () => {
  const opened = firstOpenInvite(fresh(), start + day);
  assert.ok(opened);
  const returned = firstOpenInvite(opened, start + 3 * day);
  assert.deepEqual(returned, opened);
});

test('reading status does not start the activation window', () => {
  const invite = fresh();
  invitationStatus(invite, start + day);
  assert.equal(invite.firstOpenedAt, null);
  assert.equal(invite.expiresAt, new Date(start + FIRST_OPEN_WINDOW_MS).toISOString());
});

test('activated, revoked and expired invitations cannot be reopened', () => {
  for (const status of ['activated', 'revoked', 'expired']) {
    const invite = { ...fresh(), status };
    assert.equal(invitationStatus(invite, start + day), status);
    assert.equal(firstOpenInvite(invite, start + day), null);
  }
});

test('legacy invitations retain their original deadline', () => {
  const legacy = {
    status: 'pending',
    createdAt: new Date(start).toISOString(),
    expiresAt: new Date(start + 30 * 60 * 1000).toISOString(),
  };
  assert.deepEqual(firstOpenInvite(legacy, start + 1000), legacy);
  assert.equal(firstOpenInvite(legacy, start + day), null);
});

test('invalid dates fail closed', () => {
  for (const patch of [
    { createdAt: 'invalid' },
    { expiresAt: 'invalid' },
    { firstOpenedAt: 'invalid' },
    { firstOpenedAt: new Date(start - 1).toISOString() },
    { firstOpenedAt: new Date(start + FIRST_OPEN_WINDOW_MS).toISOString() },
  ]) {
    const invite = { ...fresh(), ...patch };
    assert.equal(invitationStatus(invite, start + day), 'expired');
    assert.equal(firstOpenInvite(invite, start + day), null);
  }
});

test('opening before creation is rejected', () => {
  assert.equal(firstOpenInvite(fresh(), start - 1), null);
});

test('a fresh timing record starts with no first opening', () => {
  const timing = createInviteTiming(start + day);
  assert.equal(timing.firstOpenedAt, null);
  assert.equal(timing.expiresAt, new Date(start + day + FIRST_OPEN_WINDOW_MS).toISOString());
});
