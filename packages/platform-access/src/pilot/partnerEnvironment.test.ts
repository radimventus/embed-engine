/**
 * PE-10 — Partner Environment projection unit tests.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PILOT_PARTNER_ROLES } from '../domain/pilotPartnerAccess';
import {
  buildPartnerEnvironment,
  isPartnerEnvironmentReady,
} from './partnerEnvironment';
import { upsertPartnerBranding, resetPartnerBrandingStore } from './partnerBrandingStore';
import { createPilotInvite, resetInviteStore } from './inviteStore';
import { provisionPilotWorkspace } from './provisionPilotWorkspace';
import { resetPilotWorkspaceStore } from './pilotWorkspaceStore';
import { resetCompanyRegistryExtras } from '../registry/companyRegistry';

describe('PE-10 Partner Environment', () => {
  it('aggregates branding, studios, project and invite readiness', () => {
    resetCompanyRegistryExtras();
    resetPilotWorkspaceStore();
    resetPartnerBrandingStore();
    resetInviteStore();

    const provision = provisionPilotWorkspace({ companyName: 'Env Firm' });
    upsertPartnerBranding({
      companyId: provision.company.id,
      firmName: 'Env Firm',
    });
    createPilotInvite({
      email: 'env@firm.local',
      displayName: 'Env',
      roles: PILOT_PARTNER_ROLES,
      invitedByUserId: 'user-radim',
      tenantId: provision.tenant.id,
      companyId: provision.company.id,
      workspaceId: provision.workspace.id,
      projectId: provision.project.id,
    });

    const env = buildPartnerEnvironment(provision.company.id);
    assert.ok(env !== null);
    assert.equal(env?.checklist.partnerEnvironment, true);
    assert.equal(env?.checklist.branding, true);
    assert.equal(env?.checklist.pilotProject, true);
    assert.equal(env?.checklist.clientStudio, true);
    assert.equal(env?.checklist.managerStudio, true);
    assert.equal(env?.checklist.salesStudio, true);
    assert.equal(env?.checklist.inviteReadyToSend, true);
    assert.equal(env?.ready, true);
    assert.equal(isPartnerEnvironmentReady(provision.company.id), true);
  });
});
