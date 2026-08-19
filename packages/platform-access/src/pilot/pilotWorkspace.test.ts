/**
 * PE-03 — Pilot Workspace initialization + sample project projection.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONIS_SAMPLE_PROJECT_LABEL,
  PARTNER_PILOT_STUDIO_IDS,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
  createCanonicalPartner,
  getPilotWorkspace,
  initializePilotWorkspace,
  isPilotWorkspaceReady,
  provisionPilotWorkspace,
  resolvePilotWorkspace,
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
    assert.match(provision.houses[0]?.packageRoot ?? '', /house-package/);
    assert.equal(provision.houses[0]?.status, 'ready');

    const workspace = getPilotWorkspace(provision.company.id);
    assert.ok(workspace !== null);
    assert.equal(workspace?.projectId, provision.project.id);
    assert.equal(workspace?.sampleProjectLabel, CONIS_SAMPLE_PROJECT_LABEL);
    assert.equal(workspace?.packageRoot, provision.houses[0]?.packageRoot);
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

  it('resolves the existing DSE canonical Project and House set without provisioning', () => {
    resetCompanyRegistryExtras();
    resetPilotWorkspaceStore();

    const first = resolvePilotWorkspace(DSE_COMPANY_ID);
    const second = resolvePilotWorkspace(DSE_COMPANY_ID);

    assert.ok(first !== null);
    assert.ok(second !== null);
    assert.equal(first?.company.id, DSE_COMPANY_ID);
    assert.equal(first?.project.id, DSE_CANONICAL_PROJECT_ID);
    assert.ok(
      first?.houses.some((house) => house.id === DSE_BUNGALOV_4KK_HOUSE_ID),
    );
    assert.ok(
      first?.houses.some((house) => house.id === DSE_FIRST_DRAFT_HOUSE_ID),
    );
    assert.equal(
      first?.houses.find((house) => house.id === DSE_FIRST_DRAFT_HOUSE_ID)
        ?.name,
      'VÁŠ PRVNÍ DŮM',
    );
    assert.equal(
      first?.houses.find((house) => house.id === DSE_FIRST_DRAFT_HOUSE_ID)
        ?.status,
      'draft',
    );
    assert.deepEqual(second, first);

    resetPilotWorkspaceStore();
    resetCompanyRegistryExtras();
  });

  it('does not substitute a Project or House when Builder data is missing', () => {
    resetCompanyRegistryExtras();

    const partner = createCanonicalPartner({ name: 'Builder Prerequisite' });

    assert.equal(resolvePilotWorkspace(partner.companyId), null);

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
