/**
 * PE-10 / PE-11 — Partner Environment activation + Partner Lifecycle.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import { listOfficeWorkspaceSummaries } from './officeDashboardData.ts';
import {
  activatePartnerEnvironment,
  archivePartnerEnvironment,
  getPartnerEnvironmentRecord,
  resetPartnerEnvironmentLifecycleForTests,
  restorePartnerEnvironment,
  studioAccessForLifecycle,
  suspendPartnerEnvironment,
} from './officePartnerEnvironmentLifecycle.ts';
import { buildOfficePartnerEnvironment } from './officePartnerEnvironment.ts';
import {
  createPartner,
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import {
  confirmSalesOrder,
  resetSalesRegistryForTests,
  selectSalesPackage,
} from './officeSalesRegistry.ts';

describe('PE-10 Partner Environment lifecycle', () => {
  function resetAll() {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetPartnerEnvironmentLifecycleForTests();
  }

  it('activates Partner Environment automatically on order confirmation', () => {
    resetAll();
    const partner = createPartner({
      name: 'Active Co',
      status: 'lead',
      nextStep: 'Připravit nabídku',
      company: {
        legalName: 'Active Co',
        ico: '',
        city: '',
        country: 'Česko',
      },
      contact: {
        name: 'Active',
        email: 'active@partner.local',
        phone: '',
        role: 'Jednatel',
      },
    });

    selectSalesPackage(partner.id, 'starter');
    confirmSalesOrder(partner.id);

    const record = getPartnerEnvironmentRecord(partner.id);
    assert.equal(record.lifecycleStatus, 'active');
    assert.equal(record.status, 'active');
    assert.equal(record.pilotMode, false);
    assert.equal(record.permanentWorkspace, true);
    assert.equal(record.packageId, 'starter');
    assert.ok(record.activatedAt !== null);
    assert.deepEqual(record.studioAccess, {
      client: true,
      manager: true,
      sales: true,
    });

    assert.equal(getPartner(partner.id)?.status, 'active');

    const labels = listPartnerTimeline(partner.id).map((event) => event.label);
    assert.ok(labels.includes('OrderConfirmed'));
    assert.ok(labels.includes('PilotCompleted'));
    assert.ok(labels.includes('EnvironmentActivated'));
    assert.ok(labels.includes('PartnerActivated'));

    const view = buildOfficePartnerEnvironment(partner.id);
    assert.equal(view.lifecycleStatus, 'active');
    assert.equal(view.permanentWorkspace, true);
    assert.equal(view.pilotMode, false);
    assert.equal(view.workspaceSummary?.activePackage, 'Starter');

    const summaries = listOfficeWorkspaceSummaries();
    assert.ok(summaries.some((item) => item.partnerId === partner.id));
  });
});

describe('PE-11 Partner Lifecycle', () => {
  function resetAll() {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetPartnerEnvironmentLifecycleForTests();
  }

  it('suspends, restores and archives with studio access sync', () => {
    resetAll();
    activatePartnerEnvironment('p-dse', 'pilot');
    assert.equal(getPartnerEnvironmentRecord('p-dse').lifecycleStatus, 'active');
    assert.deepEqual(
      getPartnerEnvironmentRecord('p-dse').studioAccess,
      studioAccessForLifecycle('active'),
    );

    suspendPartnerEnvironment('p-dse', 'Platební spor');
    const suspended = getPartnerEnvironmentRecord('p-dse');
    assert.equal(suspended.lifecycleStatus, 'suspended');
    assert.equal(suspended.statusChangeReason, 'Platební spor');
    assert.equal(suspended.lastAdminAction, 'suspend');
    assert.deepEqual(suspended.studioAccess, {
      client: false,
      manager: false,
      sales: false,
    });

    const afterSuspend = listPartnerTimeline('p-dse').map((e) => e.label);
    assert.ok(afterSuspend.includes('PartnerSuspended'));

    restorePartnerEnvironment('p-dse', 'Spor vyřešen');
    const restored = getPartnerEnvironmentRecord('p-dse');
    assert.equal(restored.lifecycleStatus, 'active');
    assert.equal(restored.lastAdminAction, 'restore');
    assert.deepEqual(restored.studioAccess, {
      client: true,
      manager: true,
      sales: true,
    });
    assert.ok(
      listPartnerTimeline('p-dse')
        .map((e) => e.label)
        .includes('PartnerRestored'),
    );

    archivePartnerEnvironment('p-dse', 'Ukončení spolupráce');
    const archived = getPartnerEnvironmentRecord('p-dse');
    assert.equal(archived.lifecycleStatus, 'archived');
    assert.equal(archived.pilotMode, false);
    assert.equal(archived.lastAdminAction, 'archive');
    assert.deepEqual(archived.studioAccess, {
      client: false,
      manager: false,
      sales: false,
    });
    // No data deletion — package and activation retained.
    assert.equal(archived.packageId, 'pilot');
    assert.ok(archived.activatedAt !== null);
    assert.ok(
      listPartnerTimeline('p-dse')
        .map((e) => e.label)
        .includes('PartnerArchived'),
    );

    // Restore is not available from archived.
    restorePartnerEnvironment('p-dse');
    assert.equal(
      getPartnerEnvironmentRecord('p-dse').lifecycleStatus,
      'archived',
    );
  });

  it('keeps Pilot outside lifecycle until activation', () => {
    resetAll();
    const record = getPartnerEnvironmentRecord('p-dse');
    assert.equal(record.lifecycleStatus, null);
    assert.equal(record.status, 'pilot');
    assert.deepEqual(record.studioAccess, {
      client: false,
      manager: false,
      sales: false,
    });
    assert.equal(suspendPartnerEnvironment('p-dse')?.lifecycleStatus, null);
  });
});
