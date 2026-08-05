/**
 * PT-VR-08 — Workspace project identity continuity.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatWorkspaceClientTitle,
  resolveWorkspaceProjectIdentity,
  WORKSPACE_EMBED_OBJECT_ID,
} from './workspaceProjectIdentity';
import type { SharedWorkspaceContext } from './workspaceContext';

function sampleContext(
  overrides: Partial<SharedWorkspaceContext> = {},
): SharedWorkspaceContext {
  return {
    operatorMode: true,
    partnerId: 'p-dse',
    companyId: 'company-domy-s-energi',
    workspaceId: 'workspace-domy-s-energi',
    projectId: 'project-domy-s-energi-01',
    activeStudio: 'client',
    officeReturnHref: 'http://127.0.0.1:4181/partners/p-dse',
    partnerName: 'Domy s energií',
    projectLabel: 'Reference House',
    objectId: WORKSPACE_EMBED_OBJECT_ID,
    previous: {
      tenantId: 'tenant-conis',
      companyId: 'company-conis',
      workspaceId: 'workspace-conis',
      projectId: null,
    },
    ...overrides,
  };
}

describe('PT-VR-08 workspace project identity', () => {
  it('resolves Office partner/project into Client-facing identity', () => {
    const identity = resolveWorkspaceProjectIdentity(sampleContext());
    assert.equal(identity.partnerName, 'Domy s energií');
    assert.equal(identity.projectLabel, 'Reference House');
    assert.equal(identity.projectId, 'project-domy-s-energi-01');
    assert.equal(identity.objectId, WORKSPACE_EMBED_OBJECT_ID);
    assert.equal(
      formatWorkspaceClientTitle(identity.partnerName),
      'Domy s energií · Client Studio',
    );
  });

  it('falls back to ids when display fields are missing', () => {
    const identity = resolveWorkspaceProjectIdentity(
      sampleContext({
        partnerName: undefined,
        projectLabel: undefined,
        objectId: undefined,
      }),
    );
    assert.equal(identity.partnerName, 'p-dse');
    assert.equal(identity.projectLabel, 'project-domy-s-energi-01');
    assert.equal(identity.objectId, WORKSPACE_EMBED_OBJECT_ID);
  });
});
