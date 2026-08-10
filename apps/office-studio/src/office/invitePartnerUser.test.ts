import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearPlatformSession,
  listInvites,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
} from '@embed-engine/platform-access';

import { resetPartnerRegistryForTests } from './officePartnerRegistry.ts';
import {
  invitePartnerUser,
} from './invitePartnerUser.ts';

describe('Office partner user invitation', () => {
  function resetAll(): void {
    resetPartnerRegistryForTests();
    resetCompanyRegistryExtras();
    resetInviteStore();
    resetPilotWorkspaceStore();
    resetUserRegistry();
    clearPlatformSession();
  }

  it('binds a default Manager invite to DSE canonical context', () => {
    resetAll();

    const result = invitePartnerUser({
      partnerId: 'p-dse',
      name: 'Anna Manager',
      email: 'anna.manager@dse.test',
      invitedByUserId: 'user-radim',
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.invite.status, 'pending');
    assert.deepEqual(result.invite.roles, ['manager']);
    assert.equal(result.invite.companyId, 'company-domy-s-energii');
    assert.equal(result.invite.workspaceId, 'domy-s-energii-main');
    assert.equal(result.invite.projectId, 'project-domy-s-energii');
  });

  it('creates a Sales-only invite and rejects duplicate pending scope', () => {
    resetAll();

    const first = invitePartnerUser({
      partnerId: 'p-dse',
      name: 'Petr Sales',
      email: 'petr.sales@dse.test',
      role: 'salesman',
      invitedByUserId: 'user-radim',
    });
    const repeated = invitePartnerUser({
      partnerId: 'p-dse',
      name: 'Petr Sales',
      email: 'petr.sales@dse.test',
      role: 'salesman',
      invitedByUserId: 'user-radim',
    });

    assert.equal(first.ok, true);
    if (first.ok) {
      assert.deepEqual(first.invite.roles, ['salesman']);
      assert.equal(first.invite.status, 'pending');
    }
    assert.equal(repeated.ok, false);
    assert.equal(
      listInvites().filter((invite) => invite.email === 'petr.sales@dse.test')
        .length,
      1,
    );
  });

});
