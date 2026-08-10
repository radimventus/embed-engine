/**
 * PT-COM-02 — Pilot provision snapshot (cross-device identity).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildPilotProvisionSnapshot,
  decodePilotProvisionSnapshot,
  encodePilotProvisionSnapshot,
  hydratePilotProvisionSnapshot,
  offerSlugFromCompanyId,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerBrandingStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
  verifyUserPassword,
  findCompany,
  getDefaultCompanyRegistry,
  getPartnerBranding,
} from '../index.ts';

describe('PT-COM-02 pilot provision snapshot', () => {
  it('round-trips encode/decode and hydrates login identity', () => {
    resetCompanyRegistryExtras();
    resetUserRegistry();
    resetInviteStore();
    resetPartnerBrandingStore();
    resetPilotWorkspaceStore();

    const snapshot = buildPilotProvisionSnapshot({
      email: 'nova-firma@pilot.local',
      password: 'conis',
      displayName: 'Nova Firma',
      userId: 'user-invite-test-1',
      roles: ['manager', 'sales'],
      tenant: {
        id: 'tenant-nova-firma',
        name: 'Nova Firma Pilot',
        companyId: 'company-nova-firma',
        pilot: true,
        createdAt: '2026-08-05T00:00:00.000Z',
      },
      company: {
        id: 'company-nova-firma',
        name: 'Nova Firma',
        tenantId: 'tenant-nova-firma',
      },
      workspace: {
        id: 'workspace-nova-firma',
        companyId: 'company-nova-firma',
        name: 'Nova Firma Workspace',
      },
      project: {
        id: 'project-nova-firma',
        companyId: 'company-nova-firma',
        workspaceId: 'workspace-nova-firma',
        name: 'Reference House',
        slug: 'nova-firma-reference-house',
        description: 'Pilot sample',
      },
      houses: [
        {
          id: 'reference-v1-company-nova-firma-project-nova-firma-bungalov-4kk',
          companyId: 'company-nova-firma',
          workspaceId: 'workspace-nova-firma',
          canonicalProjectId: 'project-nova-firma',
          name: 'BUNGALOV 4KK',
          packageRoot: 'packages/object-house',
          status: 'ready',
          slug: 'bungalov-4kk',
          objectType: 'reference-house',
          description: 'Pilot sample',
        },
      ],
      branding: {
        firmName: 'Nova Firma',
        logoLabel: 'Nova Firma Logo',
        heroLabel: 'Nova Firma · Reference House Hero',
        websiteUrl: 'https://www.novafirma.cz',
      },
    });

    assert.equal(snapshot.offerSlug, 'nova-firma');
    assert.equal(offerSlugFromCompanyId('company-nova-firma'), 'nova-firma');

    const encoded = encodePilotProvisionSnapshot(snapshot);
    const decoded = decodePilotProvisionSnapshot(encoded);
    assert.ok(decoded);
    assert.equal(decoded.email, 'nova-firma@pilot.local');

    const hydrated = hydratePilotProvisionSnapshot(decoded);
    assert.equal(hydrated.ok, true);
    assert.ok(findCompany(getDefaultCompanyRegistry(), 'company-nova-firma'));
    assert.ok(verifyUserPassword('nova-firma@pilot.local', 'conis'));
    assert.equal(
      getPartnerBranding('company-nova-firma')?.firmName,
      'Nova Firma',
    );

    resetCompanyRegistryExtras();
    resetUserRegistry();
    resetPartnerBrandingStore();
    resetPilotWorkspaceStore();
  });
});
