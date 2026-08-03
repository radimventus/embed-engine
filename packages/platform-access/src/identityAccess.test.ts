import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  activateInvite,
  canAccessStudio,
  changePassword,
  createPilotInvite,
  createUser,
  finishPasswordReset,
  listInvites,
  listRoleChangeHistory,
  listUsers,
  login,
  logout,
  resendPilotInvite,
  resetIdentityAudit,
  resetInviteStore,
  resetPasswordResetStore,
  resetUserRegistry,
  setUserRoles,
  setUserStatus,
  startPasswordReset,
  studiosForRoles,
} from './index';
import { clearPlatformSession } from './session/sessionStore';

describe('identityAccess (OF-07)', () => {
  beforeEach(() => {
    clearPlatformSession();
    resetUserRegistry();
    resetInviteStore();
    resetPasswordResetStore();
    resetIdentityAudit();
    logout();
  });

  it('creates a user in the User Registry', () => {
    const created = createUser({
      email: 'nova@ac.local',
      displayName: 'Nova',
      roles: ['manager'],
      password: 'secret',
      createdByUserId: 'user-radim',
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal(created.user.status, 'active');
    assert.ok(listUsers().some((user) => user.email === 'nova@ac.local'));
    const result = login({
      email: 'nova@ac.local',
      password: 'secret',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
  });

  it('invite → first password → login', () => {
    const invite = createPilotInvite({
      email: 'guest@ac.local',
      displayName: 'Guest',
      roles: ['builder'],
      invitedByUserId: 'user-radim',
    });
    assert.equal(invite.status, 'pending');
    assert.equal(invite.sendCount, 0);
    assert.equal(invite.lastSentAt, null);

    const resent = resendPilotInvite(invite.id);
    assert.ok(resent !== null);
    assert.equal(resent?.sendCount, 1);
    assert.notEqual(resent?.token, invite.token);
    assert.equal(listInvites().filter((item) => item.status === 'pending').length, 1);

    const activated = activateInvite({
      token: resent!.token,
      password: 'first-pass',
      ndaAccepted: true,
    });
    assert.equal(activated.ok, true);

    const result = login({
      email: 'guest@ac.local',
      password: 'first-pass',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.session.user.displayName, 'Guest');
    assert.ok(result.session.user.lastLoginAt !== null);
  });

  it('changes and resets password', () => {
    const changed = changePassword({
      email: 'builder@ac.local',
      currentPassword: 'demo',
      nextPassword: 'builder-2',
    });
    assert.equal(changed.ok, true);

    assert.equal(
      login({
        email: 'builder@ac.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      false,
    );
    assert.equal(
      login({
        email: 'builder@ac.local',
        password: 'builder-2',
        rememberMe: false,
      }).ok,
      true,
    );
    logout();

    const started = startPasswordReset('builder@ac.local');
    assert.equal(started.ok, true);
    if (!started.ok) return;
    const finished = finishPasswordReset({
      token: started.token,
      password: 'builder-3',
      passwordConfirm: 'builder-3',
    });
    assert.equal(finished.ok, true);
    const result = login({
      email: 'builder@ac.local',
      password: 'builder-3',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
  });

  it('enforces roles, studio access and inactive accounts', () => {
    assert.deepEqual(studiosForRoles(['salesman']), ['sales']);
    assert.equal(canAccessStudio(['salesman'], 'sales'), true);
    assert.equal(canAccessStudio(['salesman'], 'office'), false);
    assert.equal(canAccessStudio(['conis-admin'], 'office'), true);
    assert.equal(canAccessStudio(['project-admin'], 'builder'), true);
    assert.equal(canAccessStudio(['manager'], 'manager'), true);
    assert.equal(canAccessStudio(['builder'], 'builder'), true);

    setUserRoles({
      userId: 'user-sales',
      roles: ['manager'],
      changedByUserId: 'user-radim',
    });
    const history = listRoleChangeHistory('user-sales');
    assert.ok(history.length >= 1);
    assert.deepEqual([...history[0]!.nextRoles], ['manager']);

    setUserStatus('user-manager', 'inactive');
    assert.equal(
      login({
        email: 'manager@ac.local',
        password: 'demo',
        rememberMe: false,
      }).ok,
      false,
    );
  });

  it('rejects open demo login for unknown emails', () => {
    const result = login({
      email: 'unknown@example.com',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, false);
  });
});
