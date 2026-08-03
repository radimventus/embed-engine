/**
 * PE-03 — Pilot Workspace initialization + sample project projection.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONIS_SAMPLE_PROJECT_LABEL,
  PARTNER_PILOT_STUDIO_IDS,
  getPilotWorkspace,
  initializePilotWorkspace,
  isPilotWorkspaceReady,
  provisionPilotWorkspace,
  resetCompanyRegistryExtras,
  resetPilotWorkspaceStore,
} from '../index.ts';

describe('PE-03 Pilot Workspace', () => {
  it('provisions workspace with CONIS sample project and all partner studios ready', () => {
    resetCompanyRegistryExtras();
    resetPilotWorkspaceStore();

    const provision = provisionPilotWorkspace({
      companyName: 'Alpine Living',
    });

    assert.equal(provision.project.name, CONIS_SAMPLE_PROJECT_LABEL);
    assert.match(provision.workspace.name, /Pilot Workspace/);
    assert.match(provision.project.packageRoot, /house-package/);
    assert.equal(provision.project.status, 'ready');

    const workspace = getPilotWorkspace(provision.company.id);
    assert.ok(workspace !== null);
    assert.equal(workspace?.projectId, provision.project.id);
    assert.equal(workspace?.sampleProjectLabel, CONIS_SAMPLE_PROJECT_LABEL);
    assert.equal(workspace?.packageRoot, provision.project.packageRoot);
    for (const studioId of PARTNER_PILOT_STUDIO_IDS) {
      assert.equal(workspace?.studios[studioId].ready, true);
    }
    assert.equal(isPilotWorkspaceReady(provision.company.id), true);

    resetPilotWorkspaceStore();
    resetCompanyRegistryExtras();
  });

  it('initializePilotWorkspace is idempotent per company', () => {
    resetCompanyRegistryExtras();
    resetPilotWorkspaceStore();

    const provision = provisionPilotWorkspace({
      companyName: 'Idempotent Homes',
    });
    const first = initializePilotWorkspace(provision);
    const second = initializePilotWorkspace(provision);
    assert.equal(first.id, second.id);
    assert.equal(first.createdAt, second.createdAt);

    resetPilotWorkspaceStore();
    resetCompanyRegistryExtras();
  });

  it('does not mark Office or Builder as partner workspace studios', () => {
    resetCompanyRegistryExtras();
    resetPilotWorkspaceStore();

    const provision = provisionPilotWorkspace({
      companyName: 'Surface Check',
    });
    const workspace = getPilotWorkspace(provision.company.id);
    assert.ok(workspace !== null);
    const studioKeys = Object.keys(workspace!.studios).sort();
    assert.deepEqual(studioKeys, ['client', 'manager', 'sales']);

    resetPilotWorkspaceStore();
    resetCompanyRegistryExtras();
  });
});
